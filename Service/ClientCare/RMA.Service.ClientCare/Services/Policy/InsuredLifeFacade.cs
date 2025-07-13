using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Database.Entities;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class InsuredLifeFacade : RemotingStatelessService, IInsuredLifeService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<client_RolePlayer> _rolePlayerRepository;
        private readonly IRepository<client_Person> _personRepository;
        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IRepository<policy_PolicyInsuredLife> _insuredLifeRepository;
        private readonly IRepository<client_RolePlayerRelation> _relationRepository;
        private readonly IRepository<Load_PremiumListingMember> _premiumListingMemberRepository;
        private readonly IConfigurationService _configurationService;

        private const string ClientModulePermissionsFFL = "ClientModulePermissions";

        public InsuredLifeFacade(
            StatelessServiceContext serviceContext,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<client_RolePlayer> rolePlayerRepository,
            IRepository<client_Person> personRepository,
            IRepository<policy_Policy> policyRepository,
            IRepository<policy_PolicyInsuredLife> insuredLifeRepository,
            IRepository<client_RolePlayerRelation> relationRepository,
            IRepository<Load_PremiumListingMember> premiumListingMemberRepository,
            IConfigurationService configurationService
        )
            : base(serviceContext)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _rolePlayerRepository = rolePlayerRepository;
            _personRepository = personRepository;
            _policyRepository = policyRepository;
            _insuredLifeRepository = insuredLifeRepository;
            _relationRepository = relationRepository;
            _premiumListingMemberRepository = premiumListingMemberRepository;
            _configurationService = configurationService;
        }

        public async Task<PagedRequestResult<PolicyGroupMember>> GetGroupPolicyOnboardedMembers(int policyId, PagedRequest request)
        {
            Contract.Requires(request != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var fileIdentifier = new Guid(request.SearchCriteria);
                var members = await _premiumListingMemberRepository
                    .Where(m => m.FileIdentifier == fileIdentifier
                             && m.CoverMemberType == CoverMemberTypeEnum.MainMember
                             && m.PolicyId > 0)
                    .ToListAsync();
                var policyIds = members.Select(m => m.PolicyId).ToList();
                var result = await (from p in _policyRepository
                                    join il in _insuredLifeRepository
                                      on new { p.PolicyId }
                                      equals new { il.PolicyId }
                                    join per in _personRepository
                                      on new { il.RolePlayerId }
                                      equals new { per.RolePlayerId }
                                    where policyIds.Contains(p.PolicyId)
                                      && il.RolePlayerTypeId == (int)RolePlayerTypeEnum.MainMemberSelf
                                    select new PolicyGroupMember
                                    {
                                        PolicyId = p.PolicyId,
                                        PolicyNumber = p.PolicyNumber,
                                        PolicyStatus = p.PolicyStatus,
                                        ClientReference = p.ClientReference,
                                        RolePlayerId = il.RolePlayerId,
                                        RolePlayerType = (RolePlayerTypeEnum)il.RolePlayerTypeId,
                                        MemberName = per.FirstName + " " + per.Surname,
                                        IdNumber = per.IdNumber,
                                        DateOfBirth = per.DateOfBirth,
                                        DateOfDeath = per.DateOfDeath,
                                        PolicyJoinDate = il.StartDate,
                                        InsuredLifeStatus = il.InsuredLifeStatus,
                                        Premium = il.InsuredLifeStatus == InsuredLifeStatusEnum.Active ? p.InstallmentPremium : 0.0M
                                    }
                    ).ToListAsync();
                return ParseMainMemberResultSet(request, result);
            }
        }

        public async Task<PagedRequestResult<PolicyGroupMember>> GetGroupPolicyMainMembers(int policyId, PagedRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);
            Contract.Requires(request != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                

                request.SearchCriteria = request.SearchCriteria == "null" ? "" : request.SearchCriteria.ToUpper();
                var policyMembers = await (from p in _policyRepository
                                           join il in _insuredLifeRepository
                                             on new { p.PolicyId }
                                             equals new { il.PolicyId }
                                           join per in _personRepository
                                             on new { il.RolePlayerId }
                                             equals new { per.RolePlayerId }
                                           where p.ParentPolicyId == policyId
                                           select new PolicyGroupMember
                                           {
                                               PolicyId = p.PolicyId,
                                               PolicyNumber = p.PolicyNumber,
                                               PolicyStatus = p.PolicyStatus,
                                               ClientReference = p.ClientReference,
                                               RolePlayerId = il.RolePlayerId,
                                               RolePlayerType = (RolePlayerTypeEnum)il.RolePlayerTypeId,
                                               MemberName = per.FirstName + " " + per.Surname,
                                               IdNumber = per.IdNumber,
                                               DateOfBirth = per.DateOfBirth,
                                               DateOfDeath = per.DateOfDeath,
                                               PolicyJoinDate = il.StartDate,
                                               InsuredLifeStatus = il.InsuredLifeStatus,
                                               Premium = il.InsuredLifeStatus == InsuredLifeStatusEnum.Active ? p.InstallmentPremium : 0.0M
                                           }
                    ).ToListAsync();
                var result = policyMembers.Where(s => string.IsNullOrEmpty(request.SearchCriteria)
                        || s.PolicyNumber.Contains(request.SearchCriteria)
                        || s.ClientReference.Contains(request.SearchCriteria)
                        || s.MemberName.Contains(request.SearchCriteria)
                        || s.IdNumber.Contains(request.SearchCriteria))
                    .ToList();
                return ParseMainMemberResultSet(request, result);
            }
        }

        private PagedRequestResult<PolicyGroupMember> ParseMainMemberResultSet(PagedRequest request, List<PolicyGroupMember> result)
        {
            Contract.Requires(request != null);

            // Get total number of records and pages here.
            var startIndex = (request.Page - 1) * request.PageSize;
            var count = startIndex + request.PageSize > result.Count
                ? result.Count % request.PageSize
                : request.PageSize;

            if (request.IsAscending)
            {
                switch (request.OrderBy.ToLower())
                {
                    case "policynumber":
                        result = result.OrderBy(s => s.PolicyNumber).ToList();
                        break;
                    case "clientreference":
                        result = result.OrderBy(s => s.ClientReference).ToList();
                        break;
                    case "membername":
                        result = result.OrderBy(s => s.MemberName).ToList();
                        break;
                    case "idnumber":
                        result = result.OrderBy(s => s.IdNumber).ToList();
                        break;
                    case "dateofbirth":
                        result = result.OrderBy(s => s.DateOfBirth).ToList();
                        break;
                    case "policyjoindate":
                        result = result.OrderBy(s => s.PolicyJoinDate).ToList();
                        break;
                }
            }
            else
            {
                switch (request.OrderBy.ToLower())
                {
                    case "policynumber":
                        result = result.OrderByDescending(s => s.PolicyNumber).ToList();
                        break;
                    case "clientreference":
                        result = result.OrderByDescending(s => s.ClientReference).ToList();
                        break;
                    case "membername":
                        result = result.OrderByDescending(s => s.MemberName).ToList();
                        break;
                    case "idnumber":
                        result = result.OrderByDescending(s => s.IdNumber).ToList();
                        break;
                    case "dateofbirth":
                        result = result.OrderByDescending(s => s.DateOfBirth).ToList();
                        break;
                    case "policyjoindate":
                        result = result.OrderByDescending(s => s.PolicyJoinDate).ToList();
                        break;
                }
            }

            var data = result.GetRange(startIndex, count);
            var pageCount = (int)Math.Ceiling(result.Count / (double)request.PageSize);
            return new PagedRequestResult<PolicyGroupMember>
            {
                Data = data,
                RowCount = result.Count,
                Page = request.Page,
                PageSize = request.PageSize,
                PageCount = pageCount
            };
        }

        public async Task<PagedRequestResult<PolicyInsuredLife>> GetPolicyInsuredLives(PagedRequest request, string filter, int status, bool isChildPolicy)
        {
            Contract.Requires(request != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyId = int.Parse(request.SearchCriteria);
                // Load all the parent and child policies.
                var policies = !isChildPolicy ? await _policyRepository
                    .Where(s => s.ParentPolicyId == policyId)
                    .ToListAsync()
                :
                 await _policyRepository
                    .Where(s => s.PolicyId == policyId)
                    .ToListAsync();

                var policyIds = policies.Select(s => s.PolicyId).ToList();

                // Load the beneficiaries
                var beneficiaries = await _relationRepository
                    .Where(s => s.PolicyId != null
                             && policyIds.Contains((int)s.PolicyId)
                             && s.RolePlayerTypeId == (int)RolePlayerTypeEnum.Beneficiary)
                    .ToListAsync();

                // Check if it is a group policy and if the main policy was selected
                var isGroupPolicy = (policyIds.Count > 1);
                // Get ALL insured lives on the main and child policies.
                var insuredLives = _insuredLifeRepository
                    .Where(s => policyIds.Contains(s.PolicyId));
                // If it is a main policy, only load the main members
                if (isGroupPolicy)
                {
                    //this is the readonly members view, show all
                    if (string.IsNullOrEmpty(filter) && status == 0)
                        insuredLives = insuredLives.Where(s => s.RolePlayerTypeId == (int)RolePlayerTypeEnum.MainMemberSelf);
                    else if (filter == policyId.ToString())
                        insuredLives = insuredLives.Where(s => s.RolePlayerTypeId == (int)RolePlayerTypeEnum.MainMemberSelf && s.Policy.PolicyStatus != PolicyStatusEnum.Cancelled && s.Policy.PolicyStatus != PolicyStatusEnum.PendingCancelled);
                    else
                        insuredLives = insuredLives.Where(s => s.RolePlayerTypeId == (int)RolePlayerTypeEnum.MainMemberSelf && s.Policy.PolicyStatus != PolicyStatusEnum.Cancelled && s.Policy.PolicyStatus != PolicyStatusEnum.PendingCancelled && (s.RolePlayer.DisplayName.Contains(filter) || s.Policy.PolicyNumber.Contains(filter) || s.RolePlayer.Person.IdNumber.Contains(filter)));
                }

                //check if a policy status filter was applied
                if (status != 0)
                    insuredLives = insuredLives.Where(s => (int)s.Policy.PolicyStatus == status);

                var result = string.Empty;
                switch (request.OrderBy.ToLower())
                {
                    case "policynumber":
                        result = "Policy.PolicyNumber";
                        break;
                    case "membername":
                        result = "RolePlayer.DisplayName";
                        break;
                    default:
                        result = "Policy.PolicyNumber";
                        break;

                }
                request.OrderBy = result;
                var data = await insuredLives.ToPagedResult<policy_PolicyInsuredLife, PolicyInsuredLife>(request);
                foreach (var life in data.Data)
                {
                    var policy = policies.Find(s => s.PolicyId == life.PolicyId);
                    life.PolicyNumber = policy?.PolicyNumber;
                    life.PolicyStatusId = (int)policy?.PolicyStatus;
                    var roleplayer = await _rolePlayerRepository
                        .FirstOrDefaultAsync(rp => rp.RolePlayerId == life.RolePlayerId);
                    if (roleplayer != null)
                    {
                        await _rolePlayerRepository.LoadAsync(roleplayer, s => s.Person);
                        var entity = Mapper.Map<Contracts.Entities.RolePlayer.RolePlayer>(roleplayer);
                        entity.PolicyInsuredLives = null;
                        life.RolePlayer = entity;
                        var beneficiary = beneficiaries
                            .Find(s => s.PolicyId == life.PolicyId
                                    && s.FromRolePlayerId == life.RolePlayerId);
                        life.RolePlayer.Person.IsBeneficiary = beneficiary != null;
                    }
                }
                return data;
            }
        }
        public async Task<List<PolicyInsuredLife>> GetInsuredLives(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);
            List<PolicyInsuredLife> policyInsuredLives = null;
            if (policyId > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    // Load all the parent and child policies.
                    var policies = await _policyRepository
                        .Where(s => s.ParentPolicyId == policyId || s.PolicyId == policyId)
                        .ToListAsync();
                    var policyIds = policies.Select(s => s.PolicyId).ToList();
                    // Check if it is a group policy and if the main policy was selected
                    var isGroupPolicy = (policyIds.Count > 1);
                    // Get ALL insured lives on the main and child policies.
                    var insuredLives = await _insuredLifeRepository
                        .Where(s => policyIds.Contains(s.PolicyId))
                        .ToListAsync();
                    // If it is a main policy, only load the main members
                    if (isGroupPolicy)
                    {
                        insuredLives = insuredLives
                            .Where(s => s.RolePlayerTypeId == (int)RolePlayerTypeEnum.MainMemberSelf)
                            .ToList();
                    }
                    // Load the beneficiaries
                    var beneficiaries = await _relationRepository
                        .Where(s => s.PolicyId != null
                                 && policyIds.Contains((int)s.PolicyId)
                                 && s.RolePlayerTypeId == (int)RolePlayerTypeEnum.Beneficiary)
                        .ToListAsync();

                    await _insuredLifeRepository.LoadAsync(insuredLives, il => il.RolePlayer);
                    await _insuredLifeRepository.LoadAsync(insuredLives, il => il.Policy);

                    policyInsuredLives = Mapper.Map<List<PolicyInsuredLife>>(insuredLives);
                    foreach (var policyInsuredLife in policyInsuredLives)
                    {
                        var policy = policies.Find(s => s.PolicyId == policyInsuredLife.PolicyId);
                        policyInsuredLife.PolicyNumber = policy?.PolicyNumber;
                        policyInsuredLife.RolePlayer = Mapper.Map<Contracts.Entities.RolePlayer.RolePlayer>(insuredLives.Single(p => p.PolicyId == policyInsuredLife.PolicyId
                                                                                      && p.RolePlayerId == policyInsuredLife.RolePlayerId
                                                                                      && p.RolePlayerTypeId == policyInsuredLife.RolePlayerTypeId).RolePlayer);
                        policyInsuredLife.RolePlayer.PolicyInsuredLives = null;

                        var person = await _personRepository
                            .FirstOrDefaultAsync(p => p.RolePlayerId == policyInsuredLife.RolePlayer.RolePlayerId);
                        if (person != null)
                        {
                            policyInsuredLife.RolePlayer.Person = Mapper.Map<Person>(person);
                            var beneficiary = beneficiaries
                                .Find(s => s.PolicyId == policyInsuredLife.PolicyId
                                        && s.FromRolePlayerId == policyInsuredLife.RolePlayerId);
                            policyInsuredLife.RolePlayer.Person.IsBeneficiary = beneficiary != null;
                        }
                    }
                 
                }
            }
            return policyInsuredLives;
        }

        public async Task<int> CreatePolicyInsuredLife(PolicyInsuredLife policyInsuredLife)
        {
            Contract.Requires(policyInsuredLife != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<policy_PolicyInsuredLife>(policyInsuredLife);
                _insuredLifeRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.RolePlayerId;
            }

        }
    }
}