
using AutoMapper;
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;


using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class ReferralFacade : RemotingStatelessService, IReferralService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_Referral> _referralRepository;
        private readonly IRepository<common_ReferralNatureOfQuery> _referralNatureOfQueryRepository;
        private readonly ISLAService _slaService;
        private readonly IMapper _mapper;

        public ReferralFacade(
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<common_Referral> referralRepository,
            IRepository<common_ReferralNatureOfQuery> referralNatureOfQueryRepository,
            ISLAService slaService,
            StatelessServiceContext context,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _referralRepository = referralRepository;
            _referralNatureOfQueryRepository = referralNatureOfQueryRepository;
            _slaService = slaService;
            _mapper = mapper;
        }

        public async Task<Referral> CreateReferral(Referral referral)
        {
            Contract.Requires(referral != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                #region Handle Status Change Audit
                var referralStatusChangeAudit = new ReferralStatusChangeAudit
                {
                    ReferralStatus = referral.ReferralStatus,
                    ModifiedByUserId = RmaIdentity.UserId,
                    ModifiedDate = DateTimeHelper.SaNow
                };

                referral.ReferralStatusChangeAudits = new List<ReferralStatusChangeAudit> { referralStatusChangeAudit };
                #endregion

                var entity = _mapper.Map<common_Referral>(referral);

                _referralRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                #region Handle SLA
                var slaStatusChangeAudit = new SlaStatusChangeAudit
                {
                    SLAItemType = SLAItemTypeEnum.Referral,
                    ItemId = entity.ReferralId,
                    Status = entity.ReferralStatus.ToString(),
                    EffectiveFrom = DateTimeHelper.SaNow,
                    Reason = "A new referral was created"
                };

                await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
                #endregion

                return _mapper.Map<Referral>(entity);
            }
        }

        public async Task<Referral> GetReferral(int referralId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _referralRepository.FirstOrDefaultAsync(s => s.ReferralId == referralId);
                await _referralRepository.LoadAsync(entity, r => r.ReferralFeedbacks);
                await _referralRepository.LoadAsync(entity, r => r.ReferralPerformanceRating);
                await _referralRepository.LoadAsync(entity, r => r.ReferralNatureOfQuery);
                await _referralRepository.LoadAsync(entity, r => r.ReferralStatusChangeAudits);
                return _mapper.Map<Referral>(entity);
            }
        }

        public async Task<Referral> UpdateReferral(Referral referral)
        {
            Contract.Requires(referral != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                #region Handle Status Change Audit
                var originalEntity = await GetReferral(referral.ReferralId);
                var targetEntity = _mapper.Map<common_Referral>(referral);

                bool isReferralStatusModified = originalEntity.ReferralStatus != targetEntity.ReferralStatus;
                if (isReferralStatusModified)
                {
                    var referralStatusChangeAudit = new common_ReferralStatusChangeAudit
                    {
                        ReferralId = targetEntity.ReferralId,
                        ReferralStatus = targetEntity.ReferralStatus,
                        ModifiedByUserId = RmaIdentity.UserId,
                        ModifiedDate = targetEntity.ModifiedDate
                    };

                    targetEntity.ReferralStatusChangeAudits.Add(referralStatusChangeAudit);
                }
                #endregion

                _referralRepository.Update(targetEntity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                #region Handle SLA
                if (isReferralStatusModified)
                {
                    var isReassigned = originalEntity.AssignedToUserId != targetEntity.AssignedToUserId;

                    var slaStatusChangeAudit = new SlaStatusChangeAudit
                    {
                        SLAItemType = SLAItemTypeEnum.Referral,
                        ItemId = targetEntity.ReferralId,
                        Status = targetEntity.ReferralStatus.ToString(),
                        EffectiveFrom = DateTimeHelper.SaNow,
                        Reason = isReassigned ? $"Referral status updated from {originalEntity.ReferralStatus} to {targetEntity.ReferralStatus} because it was reassigned" : $"Referral status updated from {originalEntity.ReferralStatus} to {targetEntity.ReferralStatus}"
                    };

                    DateTime? effectiveTo = null;
                    if (targetEntity.ReferralStatus == ReferralStatusEnum.Closed)
                    {
                        effectiveTo = DateTimeHelper.SaNow;
                    }

                    slaStatusChangeAudit.EffictiveTo = effectiveTo;

                    await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
                }
                #endregion

                return _mapper.Map<Referral>(targetEntity);
            }
        }

        public async Task<ReferralNatureOfQuery> UpdateReferralNatureOfQuery(ReferralNatureOfQuery referralNatureOfQuery)
        {
            Contract.Requires(referralNatureOfQuery != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_ReferralNatureOfQuery>(referralNatureOfQuery);
                _referralNatureOfQueryRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return _mapper.Map<ReferralNatureOfQuery>(entity);
            }
        }

        public async Task<PagedRequestResult<Referral>> GetPagedReferrals(ReferralSearchRequest referralSearchRequest)
        {
            Contract.Requires(referralSearchRequest != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var query = _referralRepository.AsQueryable();

                if (referralSearchRequest.SourceModuleType.HasValue)
                {
                    var moduleType = referralSearchRequest.SourceModuleType.Value;
                    query = query.Where(r => (ModuleTypeEnum)r.SourceModuleTypeId == moduleType);
                }

                if (referralSearchRequest.TargetModuleType.HasValue)
                {
                    var moduleType = referralSearchRequest.TargetModuleType.Value;
                    query = query.Where(r => (ModuleTypeEnum)r.TargetModuleTypeId == moduleType || (ModuleTypeEnum)r.SourceModuleTypeId == moduleType);
                }

                if (referralSearchRequest.AssignedByUserId.HasValue)
                {
                    var assignedByUserId = referralSearchRequest.AssignedByUserId.Value;
                    query = query.Where(r => r.AssignedByUserId == assignedByUserId);
                }

                if (referralSearchRequest.AssignedToRoleId.HasValue)
                {
                    var assignedToRoleId = referralSearchRequest.AssignedToRoleId.Value;
                    query = query.Where(r => r.AssignedToRoleId == assignedToRoleId);
                }

                if (referralSearchRequest.AssignedToUserId != null)
                {
                    query = query.Where(r => r.AssignedToUserId == referralSearchRequest.AssignedToUserId || (r.AssignedToRoleId == RmaIdentity.RoleId && r.AssignedToUserId == null && r.AssignedByUserId != RmaIdentity.UserId));
                }

                if (referralSearchRequest.ReferralStatus.HasValue)
                {
                    var referralStatus = referralSearchRequest.ReferralStatus.Value;
                    query = query.Where(r => r.ReferralStatus == referralStatus);
                }
                else
                {
                    query = query.Where(r => r.ReferralStatus != ReferralStatusEnum.Closed);
                }

                if (referralSearchRequest.ReferralItemType.HasValue)
                {
                    var referralItemType = referralSearchRequest.ReferralItemType.Value;
                    query = query.Where(r => r.ReferralItemType == referralItemType || r.ReferralItemType == null);
                }

                if (referralSearchRequest.ReferralItemType.HasValue && referralSearchRequest.ItemId.HasValue)
                {
                    var itemId = referralSearchRequest.ItemId.Value;
                    var referralItemType = referralSearchRequest.ReferralItemType.Value;
                    query = query.Where(r => r.ReferralItemType == referralItemType && r.ItemId == itemId);
                }

                if (!string.IsNullOrEmpty(referralSearchRequest.PagedRequest.SearchCriteria))
                {
                    var filter = referralSearchRequest.PagedRequest.SearchCriteria;
                    query = query.Where(r => r.ReferralReferenceNumber.Contains(filter) || r.ReferralItemTypeReference.Contains(filter));
                }

                var referrals = await query.ToPagedResult(referralSearchRequest.PagedRequest);

                await _referralRepository.LoadAsync(referrals.Data, r => r.ReferralFeedbacks);
                await _referralRepository.LoadAsync(referrals.Data, r => r.ReferralPerformanceRating);
                await _referralRepository.LoadAsync(referrals.Data, r => r.ReferralNatureOfQuery);
                await _referralRepository.LoadAsync(referrals.Data, r => r.ReferralStatusChangeAudits);

                var data = _mapper.Map<List<Referral>>(referrals.Data);

                return new PagedRequestResult<Referral>
                {
                    Page = referralSearchRequest.PagedRequest.Page,
                    PageCount = (int)Math.Ceiling(referrals.RowCount / (double)referralSearchRequest.PagedRequest.PageSize),
                    RowCount = referrals.RowCount,
                    PageSize = referralSearchRequest.PagedRequest.PageSize,
                    Data = data
                };
            }
        }

        public async Task<List<ReferralNatureOfQuery>> GetReferralNatureOfQuery()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _referralNatureOfQueryRepository.OrderBy(s => s.Name).ToListAsync();
                return _mapper.Map<List<ReferralNatureOfQuery>>(entities);
            }
        }

        public async Task<PagedRequestResult<ReferralNatureOfQuery>> GetPagedReferralNatureOfQuery(ReferralSearchRequest referralSearchRequest)
        {
            Contract.Requires(referralSearchRequest != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var query = _referralNatureOfQueryRepository.AsQueryable();

                if (referralSearchRequest.TargetModuleType.HasValue)
                {
                    var moduleType = referralSearchRequest.TargetModuleType.Value;
                    query = query.Where(r => (ModuleTypeEnum)r.ModuleType == moduleType);
                }

                if (!string.IsNullOrEmpty(referralSearchRequest.PagedRequest.SearchCriteria))
                {
                    var filter = referralSearchRequest.PagedRequest.SearchCriteria;
                    query = query.Where(r => r.Name.Contains(filter));
                }

                var referralNatureOfQueries = await query.ToPagedResult(referralSearchRequest.PagedRequest);

                var data = _mapper.Map<List<ReferralNatureOfQuery>>(referralNatureOfQueries.Data);

                return new PagedRequestResult<ReferralNatureOfQuery>
                {
                    Page = referralSearchRequest.PagedRequest.Page,
                    PageCount = (int)Math.Ceiling(referralNatureOfQueries.RowCount / (double)referralSearchRequest.PagedRequest.PageSize),
                    RowCount = referralNatureOfQueries.RowCount,
                    PageSize = referralSearchRequest.PagedRequest.PageSize,
                    Data = data
                };
            }
        }
    }
}
