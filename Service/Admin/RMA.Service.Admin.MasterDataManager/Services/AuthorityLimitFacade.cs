
using AutoMapper;
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class AuthorityLimitFacade : RemotingStatelessService, IAuthorityLimitService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_AuthorityLimitConfiguration> _authorityLimitConfigurationRepository;
        private readonly IRepository<common_AuthorityLimitConfigurationUserAudit> _authorityLimitConfigurationUserAuditRepository;
        private readonly IMapper _mapper;

        private readonly IUserService _userService;
        private readonly IPermissionService _permissionService;

        public AuthorityLimitFacade(
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<common_AuthorityLimitConfiguration> authorityLimitConfigurationRepository,
            IRepository<common_AuthorityLimitConfigurationUserAudit> authorityLimitConfigurationUserAuditRepository,
            IUserService userService,
            IPermissionService permissionService,
            StatelessServiceContext context,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _authorityLimitConfigurationRepository = authorityLimitConfigurationRepository;
            _authorityLimitConfigurationUserAuditRepository = authorityLimitConfigurationUserAuditRepository;

            _userService = userService;
            _permissionService = permissionService;
            _mapper = mapper;
        }

        public async Task<AuthorityLimitResponse> CheckUserHasAuthorityLimit(AuthorityLimitRequest request)
        {
            Contract.Requires(request != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var authLimitConfigurations = await GetAuthorityLimitConfigurations(request);
                var response = new AuthorityLimitResponse
                {
                    AuthorityLimitConfigurations = authLimitConfigurations,
                    UserHasAuthorityLimit = false,
                    Reason = "No authority limits configured that match the requested criteria"
                };

                if (authLimitConfigurations?.Any() != true)
                    return response;

                var singleLimit = authLimitConfigurations
                    .FirstOrDefault(s => s.AuthorityLimitConfigurationType == AuthorityLimitConfigurationTypeEnum.Single);

                if (singleLimit == null)
                    return response;

                if (!await _userService.HasPermission(RmaIdentity.Email, singleLimit.PermissionName))
                {
                    response.Reason = "User does not have the required authority limit permission";
                    return response;
                }

                var cumulativeLimit = authLimitConfigurations
                    .FirstOrDefault(s => s.AuthorityLimitConfigurationType == AuthorityLimitConfigurationTypeEnum.Cumulative);

                if (cumulativeLimit != null)
                {
                    if (!request.AuthorityLimitContextType.HasValue || !request.ContextId.HasValue)
                    {
                        response.Reason = "Cumulative limit found, but no context was supplied by the request";
                        return response;
                    }

                    if (await CumulativeAuthLimitExceeded(request, cumulativeLimit))
                    {
                        response.Reason = "User has exceeded the cumulative authority limit";
                        return response;
                    }
                }

                response.UserHasAuthorityLimit = true;
                response.Reason = string.Empty;
                return response;
            }
        }

        public async Task<bool> CreateUserAuthorityLimitConfigurationAudit(AuthorityLimitRequest request)
        {
            Contract.Requires(request != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var authLimitConfigurations = await GetAuthorityLimitConfigurations(request);

                var cumulativeAuthLimit = authLimitConfigurations
                    .FirstOrDefault(s => s.AuthorityLimitConfigurationType == AuthorityLimitConfigurationTypeEnum.Cumulative);

                if (cumulativeAuthLimit == null)
                    return false;

                var entity = new common_AuthorityLimitConfigurationUserAudit
                {
                    AuthorityLimitConfigurationId = cumulativeAuthLimit.AuthorityLimitConfigurationId,
                    AuthorityLimitContextType = request.AuthorityLimitContextType.Value,
                    ContextId = request.ContextId.Value,
                    Value = request.Value,
                    UserId = RmaIdentity.UserId
                };

                _authorityLimitConfigurationUserAuditRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task<PagedRequestResult<AuthorityLimitConfiguration>> GetPagedAuthorityLimits(AuthorityLimitSearchRequest authorityLimitSearchRequest)
        {
            Contract.Requires(authorityLimitSearchRequest != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var query = _authorityLimitConfigurationRepository.AsQueryable();

                if (authorityLimitSearchRequest.AuthorityLimitItemType.HasValue)
                {
                    var authorityLimitItemType = authorityLimitSearchRequest.AuthorityLimitItemType.Value;
                    query = query.Where(r => r.AuthorityLimitItemType == authorityLimitItemType);
                }

                var authLimitConfigs = await query.ToPagedResult(authorityLimitSearchRequest.PagedRequest);

                var data = _mapper.Map<List<AuthorityLimitConfiguration>>(authLimitConfigs.Data);

                var groupedOrdered = data
                    .GroupBy(x => x.AuthorityLimitItemType)
                    .SelectMany(typeGroup => typeGroup
                        .GroupBy(x => x.AuthorityLimitValueType)
                        .SelectMany(valueGroup => valueGroup
                            .GroupBy(x => x.PermissionName)
                            .SelectMany(permissionGroup => permissionGroup
                                .OrderBy(x => x.Value)
                            )
                        )
                    )
                    .ToList();

                return new PagedRequestResult<AuthorityLimitConfiguration>
                {
                    Page = authorityLimitSearchRequest.PagedRequest.Page,
                    PageCount = (int)Math.Ceiling(authLimitConfigs.RowCount / (double)authorityLimitSearchRequest.PagedRequest.PageSize),
                    RowCount = authLimitConfigs.RowCount,
                    PageSize = authorityLimitSearchRequest.PagedRequest.PageSize,
                    Data = groupedOrdered
                };
            }
        }

        public async Task<List<AuthorityLimitItemTypePermissions>> GetAuthorityLimitItemTypesPermissions()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var authorityLimitConfigurations = _authorityLimitConfigurationRepository.ToList();

                // Group configurations by AuthorityLimitItemType
                var groupedByItemType = authorityLimitConfigurations
                    .GroupBy(c => c.AuthorityLimitItemType)
                    .ToList();

                var result = new List<AuthorityLimitItemTypePermissions>();

                foreach (var group in groupedByItemType)
                {
                    var authorityLimitItemTypePermissions = new AuthorityLimitItemTypePermissions
                    {
                        AuthorityLimitItemType = group.Key,
                        Permissions = new List<Permission>()
                    };

                    foreach (var permissionName in group.Select(g => g.PermissionName).Distinct())
                    {
                        var securityPermission = await _permissionService.GetPermissionByName(permissionName);
                        if (securityPermission != null)
                        {
                            var permission = new Permission
                            {
                                Id = securityPermission.Id,
                                Name = securityPermission.Name
                            };

                            authorityLimitItemTypePermissions.Permissions.Add(permission);
                        }
                    }

                    result.Add(authorityLimitItemTypePermissions);
                }

                return result;
            }
        }

        public async Task<bool> UpdateAuthorityLimits(List<AuthorityLimitConfiguration> authorityLimitConfigurations)
        {
            Contract.Requires(authorityLimitConfigurations != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entities = _mapper.Map<List<common_AuthorityLimitConfiguration>>(authorityLimitConfigurations);

                _authorityLimitConfigurationRepository.Update(entities);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task<AuthorityLimitItemTypeEnum?> GetMappedAuthorityLimitItemType(object obj)
        {
            switch (obj)
            {
                case ClaimInvoice claimInvoice:
                    return await GetClaimInvoiceMappedAuthorityLimitItemType(claimInvoice.ClaimInvoiceType);
                case PreAuthorisation preAuthorisation:
                    return await GetPreAuthorisationLimitItemType(preAuthorisation.PreAuthType);
                default:
                    return null;
            }
        }

        private async Task<List<AuthorityLimitConfiguration>> GetAuthorityLimitConfigurations(AuthorityLimitRequest request)
        {
            Contract.Requires(request != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var query = _authorityLimitConfigurationRepository.AsQueryable();

                query = query.Where(s =>
                    s.AuthorityLimitItemType == request.AuthorityLimitItemType &&
                    !s.IsDeleted &&
                    s.Value >= request.Value);

                if (request.AuthorityLimitValueType.HasValue)
                {
                    query = query.Where(s => s.AuthorityLimitValueType == request.AuthorityLimitValueType.Value);
                }

                var results = await query.ToListAsync();

                if (!results.Any())
                    return new List<AuthorityLimitConfiguration>();

                var singleLimit = results
                    .Where(s => s.AuthorityLimitConfigurationType == AuthorityLimitConfigurationTypeEnum.Single)
                    .OrderBy(s => s.Value)
                    .FirstOrDefault();

                if (singleLimit == null)
                    return new List<AuthorityLimitConfiguration>();

                var cumulativeLimit = results
                    .Where(s =>
                        s.AuthorityLimitConfigurationType == AuthorityLimitConfigurationTypeEnum.Cumulative &&
                        s.PermissionName == singleLimit.PermissionName)
                    .OrderByDescending(s => s.Value)
                    .FirstOrDefault();

                var matchedConfigs = new List<common_AuthorityLimitConfiguration> { singleLimit };
                if (cumulativeLimit != null)
                    matchedConfigs.Add(cumulativeLimit);

                return _mapper.Map<List<AuthorityLimitConfiguration>>(matchedConfigs);
            }
        }

        private async Task<bool> CumulativeAuthLimitExceeded(AuthorityLimitRequest request, AuthorityLimitConfiguration config)
        {
            var total = _authorityLimitConfigurationUserAuditRepository
                .Where(s => s.AuthorityLimitConfigurationId == config.AuthorityLimitConfigurationId &&
                            s.UserId == RmaIdentity.UserId &&
                            s.AuthorityLimitContextType == request.AuthorityLimitContextType.Value &&
                            s.ContextId == request.ContextId.Value &&
                            !s.IsDeleted)
                .Sum(s => (decimal?)s.Value) ?? 0;

            return total + request.Value > config.Value;
        }

        #region Authority Limit Item Type Mappers

        private async Task<AuthorityLimitItemTypeEnum?> GetClaimInvoiceMappedAuthorityLimitItemType(ClaimInvoiceTypeEnum claimInvoiceType)
        {
            switch (claimInvoiceType)
            {
                case ClaimInvoiceTypeEnum.Invalid:
                    break;
                case ClaimInvoiceTypeEnum.SundryInvoice:
                    break;
                case ClaimInvoiceTypeEnum.MedicalInvoice:
                    break;
                case ClaimInvoiceTypeEnum.DaysOffInvoice:
                    break;
                case ClaimInvoiceTypeEnum.PDAward:
                    break;
                case ClaimInvoiceTypeEnum.Pension:
                    break;
                case ClaimInvoiceTypeEnum.OtherBenefitAwd:
                    return AuthorityLimitItemTypeEnum.ClaimInvoiceOther;
                case ClaimInvoiceTypeEnum.TravelAward:
                    break;
                case ClaimInvoiceTypeEnum.WLSAward:
                    break;
                case ClaimInvoiceTypeEnum.FuneralExpenses:
                    break;
                case ClaimInvoiceTypeEnum.SpecialAllowance:
                    break;
                case ClaimInvoiceTypeEnum.SympathyAward:
                    break;
                case ClaimInvoiceTypeEnum.ConstantAttendanceAllowance:
                    break;
                case ClaimInvoiceTypeEnum.FamilyAllowance:
                    break;
                case ClaimInvoiceTypeEnum.FatalLumpSumAward:
                    break;
                case ClaimInvoiceTypeEnum.PartialDependencyLumpsum:
                    break;
                case ClaimInvoiceTypeEnum.RecoveryReceipt:
                    break;
                case ClaimInvoiceTypeEnum.FatalPartialDependantsLumpSum:
                    break;
                case ClaimInvoiceTypeEnum.TravelAwardTEBA:
                    break;
                case ClaimInvoiceTypeEnum.MedicalAnnuity:
                    break;
                default: return null;
            }

            return null;
        }

        private async Task<AuthorityLimitItemTypeEnum?> GetPreAuthorisationLimitItemType(PreAuthTypeEnum preAuthTypeEnum)
        {
            switch (preAuthTypeEnum)
            {
                case PreAuthTypeEnum.Prosthetic:
                    break;
                case PreAuthTypeEnum.ChronicMedication:
                    break;
                case PreAuthTypeEnum.Treatment:
                    break;
                case PreAuthTypeEnum.Hospitalization:
                    break;
                case PreAuthTypeEnum.Unknown:
                    break;
                case PreAuthTypeEnum.BulkTreatmentAuth:
                    break;
                case PreAuthTypeEnum.TreatingDoctor:
                    break;
                case PreAuthTypeEnum.PhysioOTAuth:
                    break;
                case PreAuthTypeEnum.TravelAuth:
                    break;
                default: return null;
            }

            return null;
        }

        // add other mappers here for different object types
        #endregion
    }
}
