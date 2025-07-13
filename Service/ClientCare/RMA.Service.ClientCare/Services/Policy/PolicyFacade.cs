using AutoMapper;

using Newtonsoft.Json;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceBus.Producers;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Dashboard;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Database.Constants;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.ClientCare.Mappers;

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Fabric.Health;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

using TinyCsvParser;

using PolicyModel = RMA.Service.ClientCare.Contracts.Entities.Policy.Policy;
using ProductOptionModel = RMA.Service.ClientCare.Contracts.Entities.Product.ProductOption;
using Roleplayer = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.RolePlayer;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class PolicyFacade : RemotingStatelessService, IPolicyService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IDocumentGeneratorService _documentGeneratorService;

        private readonly IConfigurationService _configurationService;
        private readonly IPolicyCommunicationService _communicationService;
        private readonly IPolicyCaseService _caseService;
        private readonly IBrokerageService _brokerageService;
        private readonly IRepresentativeService _representativeService;
        private readonly IPolicyNoteService _policyNoteService;
        private readonly ITransactionCreatorService _transactionCreatorService;
        private readonly IProductOptionService _productOptionService;
        private readonly IQLinkService _qlinkService;

        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IRepository<policy_Insurer> _policyInsurerRepository;
        private readonly IRepository<policy_PolicyInsuredLife> _policyInsuredLifeRepository;
        private readonly IRepository<client_RolePlayer> _rolePlayerRepository;
        private readonly IRepository<policy_PolicyBroker> _policyBrokerRepository;
        private readonly IRepository<client_Company> _clientCompanyRepository;
        private readonly IRepository<client_RolePlayerRelation> _rolePlayerRelationRepository;
        private readonly IRepository<product_ProductOption> _productOptionRepository;
        private readonly IRepository<Load_PremiumListing> _premiumListingRepository;
        private readonly IRepository<client_Person> _personRepository;
        private readonly IRepository<product_Benefit> _benefitRepository;
        private readonly IRepository<Load_PremiumListingFile> _premiumListingFileRepository;
        private readonly IRepository<policy_PolicyMovement> _policyMovementRepository;
        private readonly IRepository<policy_ChildCover> _policyChildCoverRepository;
        private readonly IRepository<broker_Brokerage> _brokerageRepository;
        private readonly IRepository<policy_PolicyChangeProduct> _changePolicyProductRepository;
        private readonly IRepository<policy_PolicyLifeExtension> _policyLifeRepository;
        private readonly IRepository<policy_PolicyStatusChangeAudit> _policyStatusChangeAuditRepository;
        private readonly IRepository<client_FinPayee> _finPayeeRepository;
        private readonly IRepository<policy_Cover> _coverRepository;
        private readonly IRepository<product_Product> _productRepository;
        private readonly IRepository<product_BenefitRate> _benefitRateRepository;

        private string _parameters;
        private string _reportserverUrl;
        private string _fromAddress;
        private WebHeaderCollection _headerCollection;
        private readonly ISendEmailService _sendEmailService;

        private int clientReferenceNumber;
        private const string ClientModulePermissionsFFL = "ClientModulePermissions";

        private readonly string reinstateForbiddenMonths = "ReinstateForbiddenMonths";
        private readonly int defaultMonths = 24;

        private const string SendCommunicationForReinstated = "SendCommunicationForReinstated";


        public PolicyFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IDocumentGeneratorService documentGeneratorService,
            IConfigurationService configurationService,
            IPolicyCommunicationService communicationService,
            IBrokerageService brokerageService,
            IRepresentativeService representativeService,
            IPolicyCaseService caseService,
            IPolicyNoteService policyNoteService,
            ISendEmailService sendEmailService,
            IProductOptionService productOptionService,
            ITransactionCreatorService transactionCreatorService,
            IQLinkService qlinkService,
            IRepository<policy_Policy> policyRepository,
            IRepository<policy_Insurer> policyInsurerRepository,
            IRepository<policy_PolicyInsuredLife> policyInsuredLifeRepository,
            IRepository<policy_PolicyBroker> policyBrokerRepository,
            IRepository<client_RolePlayer> rolePlayerRepository,
            IRepository<client_Company> clientCompanyRepository,
            IRepository<product_ProductOption> productOptionRepository,
            IRepository<client_RolePlayerRelation> rolePlayerRelationRepository,
            IRepository<Load_PremiumListing> premiumListingRepository,
            IRepository<client_Person> personRepository,
            IRepository<product_Benefit> benefitRepository,
            IRepository<Load_PremiumListingFile> premiumListingFileRepository,
            IRepository<policy_PolicyMovement> policyMovementRepository,
            IRepository<policy_ChildCover> policyChildCoverRepository,
            IRepository<policy_PolicyChangeProduct> changePolicyProductRepository,
            IRepository<broker_Brokerage> brokerageRepository,
            IRepository<policy_PolicyLifeExtension> policyLifeRepository,
            IRepository<policy_PolicyStatusChangeAudit> policyStatusChangeAuditRepository,
            IRepository<client_FinPayee> finPayeeRepository,
            IRepository<policy_Cover> coverRepository,
            IRepository<product_Product> productRepository,
            IRepository<product_BenefitRate> benefitRateRepository
            ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _documentGeneratorService = documentGeneratorService;
            _configurationService = configurationService;
            _policyInsuredLifeRepository = policyInsuredLifeRepository;
            _policyRepository = policyRepository;
            _policyInsurerRepository = policyInsurerRepository;
            _clientCompanyRepository = clientCompanyRepository;
            _policyBrokerRepository = policyBrokerRepository;
            _rolePlayerRepository = rolePlayerRepository;
            _productOptionRepository = productOptionRepository;
            _rolePlayerRelationRepository = rolePlayerRelationRepository;
            _premiumListingRepository = premiumListingRepository;
            _sendEmailService = sendEmailService;
            _productOptionService = productOptionService;
            _personRepository = personRepository;
            _communicationService = communicationService;
            _brokerageService = brokerageService;
            _representativeService = representativeService;
            _caseService = caseService;
            _benefitRepository = benefitRepository;
            _premiumListingFileRepository = premiumListingFileRepository;
            _policyMovementRepository = policyMovementRepository;
            _policyChildCoverRepository = policyChildCoverRepository;
            _changePolicyProductRepository = changePolicyProductRepository;
            _brokerageRepository = brokerageRepository;
            _policyLifeRepository = policyLifeRepository;
            _policyNoteService = policyNoteService;
            _policyStatusChangeAuditRepository = policyStatusChangeAuditRepository;
            _finPayeeRepository = finPayeeRepository;
            _transactionCreatorService = transactionCreatorService;
            _coverRepository = coverRepository;
            _productRepository = productRepository;
            _qlinkService = qlinkService;
            _benefitRateRepository = benefitRateRepository;
        }

        public async Task<List<PolicyModel>> GetPolicies()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            //BUG this returns 100% of millions of records, consider the size, consider pagig
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _policyRepository.Select(a => a).Take(1000).OrderByDescending(a => a.ModifiedDate).ToListAsync();

                return Mapper.Map<List<PolicyModel>>(entity);
            }
        }

        public async Task<List<PolicyModel>> GetPoliciesInDateRange(DateTime fromDate, DateTime toDate)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _policyRepository.Where(a => a.ModifiedDate >= fromDate && a.ModifiedDate <= toDate && a.PolicyStatus != PolicyStatusEnum.Active).ToListAsync();
                return Mapper.Map<List<PolicyModel>>(entity);
            }
        }

        public async Task<List<PolicyModel>> GetPoliciesByProductOptionsIds(List<int> productOptionIds)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);
            List <PolicyModel> result= new List<PolicyModel >();
            if (productOptionIds != null && productOptionIds.Count > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var entity = await _policyRepository.Where(p => productOptionIds.Contains(p.ProductOptionId)).ToListAsync();

                    result= Mapper.Map<List<PolicyModel>>(entity);
                }
            }
            return result;
        }

        public async Task<List<PolicyModel>> GetPoliciesByIds(List<int> ids)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);
            List<PolicyModel> result = new List<PolicyModel>();
            if (ids?.Count > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    ids = ids.Distinct().ToList();
                    ids = ids.OrderBy(id => id).ToList<int>();
                    var policies = await _policyRepository.Where(a => ids.Contains(a.PolicyId)).OrderBy(p => p.PolicyId).ToListAsync();
                    await _policyRepository.LoadAsync(policies, p => p.PolicyOwner);
                    await _policyRepository.LoadAsync(policies, p => p.PolicyInsuredLives);
                    result= Mapper.Map<List<PolicyModel>>(policies);
                }
            }
            return result;
        }

        public async Task<List<PolicyModel>> GetActivePolicies(List<int> ids)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);
            List<PolicyModel> result = new List<PolicyModel>();
            if (ids?.Count > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var policies = await _policyRepository
                        .Where(p => ids.Contains(p.PolicyId)
                                 && p.PolicyStatus != PolicyStatusEnum.NotTakenUp).ToListAsync();
                    await _policyRepository.LoadAsync(policies, p => p.PolicyOwner);
                    await _policyRepository.LoadAsync(policies, p => p.PolicyInsuredLives);
                    result = Mapper.Map<List<PolicyModel>>(policies);
                }
            }
            return result;
        }

        public async Task<List<PolicyModel>> GetPoliciesByPolicyNumbers(List<string> policyNumbers)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);
            List<PolicyModel> result = new List<PolicyModel>();
            if (policyNumbers?.Count > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var policies = await _policyRepository.Where(a => policyNumbers.Contains(a.PolicyNumber)).ToListAsync();
                    foreach (var policy in policies)
                    {
                        policy.PolicyOwner = await _rolePlayerRepository.Where(s => s.RolePlayerId == policy.PolicyOwnerId).SingleAsync();
                    }

                    result = Mapper.Map<List<PolicyModel>>(policies);
                }
            }
            return result;
        }

        public async Task<PolicyModel> GetPolicy(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _policyRepository.SingleAsync(s => s.PolicyId == policyId, $"Could not find a policy with the id {policyId}");
                await _policyRepository.LoadAsync(entity, p => p.ProductOption);
                await _policyRepository.LoadAsync(entity, p => p.PolicyOwner);
                await _policyRepository.LoadAsync(entity, p => p.Brokerage);
                await _policyRepository.LoadAsync(entity, p => p.PolicyContacts);
                await _brokerageRepository.LoadAsync(entity.Brokerage,p=>p.BrokerageContacts);
                await _productOptionRepository.LoadAsync(entity.ProductOption, p => p.ProductOptionDependencies);
                await _productOptionRepository.LoadAsync(entity.ProductOption, p => p.Product);
                await _productOptionRepository.LoadAsync(entity.ProductOption, p => p.ProductOptionSettings);

                if (entity.PolicyOwner != null)
                {
                    if (entity.PolicyOwner.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Company)
                    {
                        entity.PolicyOwner.Company = await _clientCompanyRepository.Where(i => i.RolePlayerId == entity.PolicyOwnerId).FirstOrDefaultAsync();
                    }
                    else
                    {
                        entity.PolicyOwner.Person = await _personRepository.Where(i => i.RolePlayerId == entity.PolicyOwnerId).FirstOrDefaultAsync();
                    }
                }

                var representative = await _representativeService.GetRepresentativeReferenceData(entity.RepresentativeId);
                var policy = Mapper.Map<PolicyModel>(entity);

                await SetPolicyProductCategoryType(policy);

                if (policy.ProductCategoryType == ProductCategoryTypeEnum.Funeral)
                {
                    var policyLifeExtension = _policyLifeRepository.Where(x => x.PolicyId == policyId).FirstOrDefault();
                    policy.PolicyLifeExtension = Mapper.Map<PolicyLifeExtension>(policyLifeExtension);
                }

                policy.ClientName = policy.PolicyOwner?.DisplayName;
                policy.BrokerageName = $"{policy.Brokerage?.Name}";
                policy.RepresentativeName = representative != null ? $"{representative.FirstName} {representative.SurnameOrCompanyName}" : string.Empty;

                return policy;
            }
        }

        public async Task<PolicyModel> GetPolicyOwnerByPolicy(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _policyRepository.SingleAsync(s => s.PolicyId == policyId, $"Could not find a policy with the id {policyId}");
                await _policyRepository.LoadAsync(entity, p => p.PolicyOwner);

                if (entity.PolicyOwner != null)
                {
                    if (entity.PolicyOwner.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Company)
                    {
                        entity.PolicyOwner.Company = await _clientCompanyRepository.Where(i => i.RolePlayerId == entity.PolicyOwnerId).FirstOrDefaultAsync();
                    }
                    else
                    {
                        entity.PolicyOwner.Person = await _personRepository.Where(i => i.RolePlayerId == entity.PolicyOwnerId).FirstOrDefaultAsync();
                    }
                }
                var policy = Mapper.Map<PolicyModel>(entity);

                return policy;
            }
        }

        public async Task<PolicyModel> GetPolicyWithoutReferenceData(int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _policyRepository
                    .SingleAsync(s => s.PolicyId == policyId, $"Could not find a policy with the id {policyId}");
                var model = Mapper.Map<PolicyModel>(entity);
                return model;
            }
        }

        public async Task<PolicyModel> GetPolicyByNumber(string policyNumber)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policy = await _policyRepository
                    .SingleAsync(s => s.PolicyNumber == policyNumber,
                    $"Could not find a policy with policy number: {policyNumber}");
                var rolePlayer = await _rolePlayerRepository
                    .SingleAsync(s => s.RolePlayerId == policy.PolicyOwnerId,
                    $"Could not find owner of policy {policyNumber}");

                await _policyRepository.LoadAsync(policy, p => p.PolicyBrokers);
                await _policyRepository.LoadAsync(policy, p => p.Benefits);
                await _policyRepository.LoadAsync(policy, p => p.ProductOption);
                await _policyRepository.LoadAsync(policy, p => p.PolicyInsuredLives);
                await _policyRepository.LoadAsync(policy, p => p.PolicyLifeExtension);
                await _policyRepository.LoadAsync(policy, p => p.Brokerage);
                await _policyRepository.LoadAsync(policy, p => p.PolicyOwner);
                await _policyRepository.LoadAsync(policy, p => p.PolicyPayee);
                await _policyRepository.LoadAsync(policy, p => p.ParentPolicy);
                await _productOptionRepository.LoadAsync(policy.ProductOption, p => p.ProductOptionSettings);

                var policyModel = Mapper.Map<PolicyModel>(policy);
                policyModel.ClientName = rolePlayer.DisplayName;
                return policyModel;
            }
        }

        public async Task<bool> IsNaturalEntityPolicy(int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyEntity = await _policyRepository
                    .FirstOrDefaultAsync(s => s.PolicyId == policyId);

                var rolePlayerEntity = await _rolePlayerRepository.
                    FirstOrDefaultAsync(r => r.RolePlayerId == policyEntity.PolicyOwnerId);

                return rolePlayerEntity.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Person;
            }
        }

        public async Task UpdatePolicyStatus(PolicyStatusChangeAudit policyStatusChangeAudit)
        {
            Contract.Requires(policyStatusChangeAudit != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _policyRepository.FirstOrDefaultAsync(a => a.PolicyId == policyStatusChangeAudit.PolicyId);

                entity.PolicyStatus = policyStatusChangeAudit.PolicyStatus;

                var policyStatusChangeAudits = new List<PolicyStatusChangeAudit>();
                policyStatusChangeAudits = await GetPolicyStatusChangeAudits(policyStatusChangeAudit.PolicyId);
                policyStatusChangeAudits.Where(t => t.EffectiveTo == null).ForEach(s => s.EffectiveTo = policyStatusChangeAudit.EffectiveFrom);
                policyStatusChangeAudits.Add(policyStatusChangeAudit);

                entity.PolicyStatusChangeAudits = Mapper.Map<List<policy_PolicyStatusChangeAudit>>(policyStatusChangeAudits);

                _policyRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<List<PolicyModel>> GetPoliciesByRolePlayer(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = await _policyInsuredLifeRepository
                     .Where(i => i.RolePlayerId == rolePlayerId && i.Policy != null)
                     .Select(a => a.Policy).ToListAsync();
                await _policyRepository.LoadAsync(policies, p => p.PolicyBrokers);
                await _policyRepository.LoadAsync(policies, p => p.Benefits);
                await _policyRepository.LoadAsync(policies, p => p.ProductOption);
                await _policyRepository.LoadAsync(policies, p => p.PolicyInsuredLives);
                await _policyRepository.LoadAsync(policies, p => p.PolicyLifeExtension);
                await _policyRepository.LoadAsync(policies, p => p.Brokerage);
                await _policyRepository.LoadAsync(policies, p => p.PolicyOwner);
                await _policyRepository.LoadAsync(policies, p => p.PolicyPayee);
                await _policyRepository.LoadAsync(policies, p => p.ParentPolicy);

                return Mapper.Map<List<PolicyModel>>(policies);
            }
        }

        public async Task<PolicyModel> GetPolicyAndAllData(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policy = await _policyRepository.SingleOrDefaultAsync(i => i.PolicyId == policyId);
                return Mapper.Map<PolicyModel>(policy);
            }
        }

        public async Task<PolicyModel> GetPolicyByPolicyId(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.Create())
            {
                var policy = await _policyRepository.SingleOrDefaultAsync(p => p.PolicyId == policyId);
                await _policyRepository.LoadAsync(policy, a => a.Benefits);

                return Mapper.Map<PolicyModel>(policy);
            }
        }

        public async Task<ProductOptionModel> GetProductByPolicyId(int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _policyRepository.SingleAsync(s => s.PolicyId == policyId, $"Could not find a policy with policy Id: {policyId}");
                await _policyRepository.LoadAsync(entity, r => r.ProductOption);
                await _productOptionRepository.LoadAsync(entity.ProductOption, r => r.Benefits);

                var product = entity.ProductOption;
                return Mapper.Map<ProductOptionModel>(product);
            }
        }

        public async Task AddPolicyInsuredLife(int rolePlayerId, int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var insuredLife = new policy_PolicyInsuredLife()
                {
                    PolicyId = policyId,
                    RolePlayerId = rolePlayerId,
                    RolePlayerTypeId = Convert.ToInt32(RolePlayerTypeEnum.Beneficiary)
                };
                _policyInsuredLifeRepository.Create(insuredLife);
            }
        }
        
        public async Task UpdateMemberRelations(RolePlayerPolicy policy, Roleplayer mainMember, List<Roleplayer> spouses, List<Roleplayer> children, List<Roleplayer> family, List<Roleplayer> beneficiaries)
        {
            Contract.Requires(policy != null);
            Contract.Requires(mainMember != null);
            Contract.Requires(spouses != null);
            Contract.Requires(children != null);
            Contract.Requires(family != null);
            Contract.Requires(beneficiaries != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddRolePlayer);

            Contract.Requires(policy != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                await AddRolePlayers(policy.PolicyId, mainMember.RolePlayerId, spouses, RolePlayerTypeEnum.Spouse);
                await AddRolePlayers(policy.PolicyId, mainMember.RolePlayerId, children, RolePlayerTypeEnum.Child);
                await AddRolePlayers(policy.PolicyId, mainMember.RolePlayerId, family, RolePlayerTypeEnum.Extended);

                var policyOwner = await _rolePlayerRepository
                    .FirstOrDefaultAsync(s => s.RolePlayerId == policy.PolicyOwnerId);
                var policyNumber = policyOwner.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Person
                    ? null
                    : GetPolicyNumber(policy.PolicyNumber, mainMember.RolePlayerId);

                await SavePolicyInsuredLives(policy.PolicyId, spouses, RolePlayerTypeEnum.Spouse);
                await SavePolicyInsuredLives(policy.PolicyId, children, RolePlayerTypeEnum.Child);
                await SavePolicyInsuredLives(policy.PolicyId, family, RolePlayerTypeEnum.Extended);

                UpdateBeneficiaryRolePlayerIds(beneficiaries, spouses.Concat(children).Concat(family));
                await SavePolicyBeneficiaries(policy.PolicyId, mainMember.RolePlayerId, beneficiaries);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private string GetPolicyNumber(string policyNumber, int rolePlayerId)
        {
            var rolePlayerNumber = rolePlayerId.ToString().PadLeft(6, '0');
            return $"{policyNumber}-{rolePlayerNumber}";
        }

        private async Task SavePolicyBeneficiaries(int policyId, int mainMemberId, List<Roleplayer> beneficiaries)
        {
            if (beneficiaries.Count == 0) return;
            var rolePlayers = await _rolePlayerRelationRepository
                .Where(s => s.ToRolePlayerId == mainMemberId
                    && s.PolicyId == policyId
                    && s.RolePlayerTypeId == (int)RolePlayerTypeEnum.Beneficiary)
                .ToListAsync();
            foreach (var beneficiary in beneficiaries)
            {
                var rolePlayer = rolePlayers.Find(s => s.FromRolePlayerId == beneficiary.RolePlayerId);
                if (rolePlayer == null)
                {
                    var rolePlayerRelation = new client_RolePlayerRelation
                    {
                        FromRolePlayerId = beneficiary.RolePlayerId,
                        ToRolePlayerId = mainMemberId,
                        RolePlayerTypeId = (int)RolePlayerTypeEnum.Beneficiary,
                        PolicyId = policyId
                    };
                    _rolePlayerRelationRepository.Create(rolePlayerRelation);
                }
            }
        }

        private void UpdateBeneficiaryRolePlayerIds(List<Roleplayer> beneficiaries, IEnumerable<Roleplayer> rolePlayers)
        {
            foreach (var beneficiary in beneficiaries)
            {
                var rolePlayer = rolePlayers
                    .FirstOrDefault(s => s.Person != null
                        && s.Person.IdType == beneficiary.Person.IdType
                        && s.Person.IdNumber.Equals(beneficiary.Person.IdNumber, StringComparison.OrdinalIgnoreCase));
                if (rolePlayer != null)
                {
                    beneficiary.RolePlayerId = rolePlayer.RolePlayerId;
                }
            }
        }

        private async Task SavePolicyInsuredLives(int policyId, List<Roleplayer> members, RolePlayerTypeEnum rolePlayerType)
        {
            if (members.Count == 0) return;
            using (_dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                // Get all the insured lives for the policy
                var insuredLives = await _policyInsuredLifeRepository
                    .Where(s => s.PolicyId == policyId)
                    .ToListAsync();
                // Add member if not already in the list
                foreach (var member in members)
                {
                    var life = insuredLives.Find(s => s.RolePlayerId == member.RolePlayerId);
                    if (life == null)
                    {
                        var today = DateTimeHelper.SaNow.Date;
                        var startDate = (new DateTime(today.Year, today.Month, 1)).AddMonths(1);
                        var insuredLife = new policy_PolicyInsuredLife
                        {
                            PolicyId = policyId,
                            RolePlayerId = member.RolePlayerId,
                            RolePlayerTypeId = (int)rolePlayerType,
                            InsuredLifeStatus = InsuredLifeStatusEnum.Active,
                            StartDate = member.JoinDate.HasValue ? member.JoinDate.Value.ToSaDateTime() : startDate,
                            EndDate = null
                        };
                        _policyInsuredLifeRepository.Create(insuredLife);
                    }
                }
            }
        }

        private async Task<List<Roleplayer>> AddRolePlayers(int policyId, int mainMemberId, List<Roleplayer> members, RolePlayerTypeEnum rolePlayerType)
        {
            if (members.Count == 0) return null;
            using (_dbContextScopeFactory.Create())
            {
                foreach (var member in members)
                {
                    if (member.Person == null) continue;
                    var rolePlayer = await _rolePlayerRepository
                        .FirstOrDefaultAsync(s => s.Person != null
                            && s.Person.IdType == member.Person.IdType
                            && s.Person.IdNumber.Equals(member.Person.IdNumber, StringComparison.OrdinalIgnoreCase));
                    if (rolePlayer == null)
                    {
                        var rolePlayerId = await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);
                        rolePlayer = new client_RolePlayer
                        {
                            RolePlayerId = rolePlayerId,
                            DisplayName = member.DisplayName,
                            TellNumber = member.TellNumber,
                            CellNumber = member.CellNumber,
                            EmailAddress = member.EmailAddress,
                            PreferredCommunicationTypeId = member.PreferredCommunicationTypeId,
                            RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person,
                            Person = new client_Person
                            {
                                RolePlayerId = rolePlayerId,
                                FirstName = member.Person.FirstName,
                                Surname = member.Person.Surname,
                                IdType = member.Person.IdType,
                                IdNumber = member.Person.IdNumber,
                                DateOfBirth = member.Person.DateOfBirth.ToSaDateTime(),
                                IsAlive = member.Person.IsAlive,
                                DeathCertificateNumber = member.Person.DeathCertificateNumber,
                                IsVopdVerified = false,
                                IsStudying = member.Person.IsStudying,
                                IsDisabled = member.Person.IsDisabled
                            }
                        };
                        _rolePlayerRepository.Create(rolePlayer);
                        member.RolePlayerId = rolePlayerId;
                        member.Person.RolePlayerId = rolePlayerId;
                    }
                    else
                    {
                        await _rolePlayerRepository.LoadAsync(rolePlayer, r => r.Person);
                        rolePlayer.DisplayName = member.DisplayName;
                        rolePlayer.TellNumber = member.TellNumber;
                        rolePlayer.CellNumber = member.CellNumber;
                        rolePlayer.EmailAddress = member.EmailAddress;
                        rolePlayer.PreferredCommunicationTypeId = member.PreferredCommunicationTypeId;

                        rolePlayer.Person.FirstName = member.Person.FirstName;
                        rolePlayer.Person.Surname = member.Person.Surname;
                        rolePlayer.Person.IdType = member.Person.IdType;
                        rolePlayer.Person.IdNumber = member.Person.IdNumber;
                        rolePlayer.Person.DateOfBirth = member.Person.DateOfBirth.ToSaDateTime();
                        rolePlayer.Person.IsAlive = member.Person.IsAlive;
                        rolePlayer.Person.DeathCertificateNumber = member.Person.DeathCertificateNumber;
                        rolePlayer.Person.IsVopdVerified = member.Person.IsVopdVerified;
                        rolePlayer.Person.IsStudying = member.Person.IsStudying;
                        rolePlayer.Person.IsDisabled = member.Person.IsDisabled;

                        _rolePlayerRepository.Update(rolePlayer);
                        member.RolePlayerId = rolePlayer.RolePlayerId;
                        member.Person.RolePlayerId = rolePlayer.RolePlayerId;
                    }
                    // Get the specific roleplayer type for extended family members
                    if (rolePlayerType == RolePlayerTypeEnum.Extended)
                    {
                        var relationType = member.FromRolePlayers?
                            .FirstOrDefault(s => s.RolePlayerTypeId != (int)RolePlayerTypeEnum.Beneficiary);
                        rolePlayerType = relationType == null ? rolePlayerType : (RolePlayerTypeEnum)relationType.RolePlayerTypeId;
                    }
                    // Add or update the roleplayer relation
                    var rolePlayerRelation = await _rolePlayerRelationRepository
                        .FirstOrDefaultAsync(r => r.FromRolePlayerId == member.RolePlayerId
                                               && r.ToRolePlayerId == mainMemberId
                                               && r.RolePlayerTypeId != (int)RolePlayerTypeEnum.Beneficiary
                                               && r.PolicyId == policyId);
                    if (rolePlayerRelation == null)
                    {
                        var relation = new client_RolePlayerRelation
                        {
                            FromRolePlayerId = member.RolePlayerId,
                            ToRolePlayerId = mainMemberId,
                            RolePlayerTypeId = (int)rolePlayerType,
                            PolicyId = policyId
                        };
                        _rolePlayerRelationRepository.Create(relation);
                    }
                    else
                    {
                        rolePlayerRelation.RolePlayerTypeId = (int)rolePlayerType;
                        _rolePlayerRelationRepository.Update(rolePlayerRelation);
                    }
                }
            }
            return members;
        }

        public async Task<int> CreatePolicyInsuredLife(PolicyInsuredLife policyInsuredLife)
        {
            Contract.Requires(policyInsuredLife != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddPolicy);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _rolePlayerRepository.FirstOrDefaultAsync(s => s.RolePlayerId == policyInsuredLife.RolePlayerId);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.Person);

                var insuredLife = new policy_PolicyInsuredLife()
                {
                    PolicyId = policyInsuredLife.PolicyId,
                    RolePlayerId = policyInsuredLife.RolePlayerId,
                    RolePlayerTypeId = policyInsuredLife.RolePlayerTypeId,
                    //For stillborn
                    StartDate = entity.Person.DateOfDeath.Value
                };

                _policyInsuredLifeRepository.Create(insuredLife);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return insuredLife.PolicyId;
            }
        }

        public async Task CreatePolicyInsuredLifeJoinExisting(PolicyInsuredLife policyInsuredLife)
        {
            Contract.Requires(policyInsuredLife != null);

            using (_dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                var insuredLife = await _policyInsuredLifeRepository
                    .FirstOrDefaultAsync(pil => pil.PolicyId == policyInsuredLife.PolicyId && pil.RolePlayerId == policyInsuredLife.RolePlayerId);

                if (insuredLife == null)
                {
                    var newInsuredLife = new policy_PolicyInsuredLife()
                    {
                        PolicyId = policyInsuredLife.PolicyId,
                        RolePlayerId = policyInsuredLife.RolePlayerId,
                        RolePlayerTypeId = policyInsuredLife.RolePlayerTypeId,
                        //For stillborn
                        StartDate = DateTime.Now
                    };

                    _policyInsuredLifeRepository.Create(newInsuredLife);
                }
                else
                {
                    insuredLife.Allowance = policyInsuredLife.Allowance;
                    insuredLife.Skilltype = policyInsuredLife.Skilltype;
                    insuredLife.Earnings = policyInsuredLife.Earnings;
                    insuredLife.StatedBenefitId = policyInsuredLife.StatedBenefitId;
                    _policyInsuredLifeRepository.Update(insuredLife);
                }
            }
        }

        public async Task<bool> ClientReferenceExists(string clientReference)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _policyRepository.FirstOrDefaultAsync(s => s.ClientReference == clientReference);
                return entity != null;
            }
        }

        public async Task<int> GetStillbornBenefitByPolicyId(int policyId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var benefit = await _benefitRepository.SqlQueryAsync<product_Benefit>(DatabaseConstants.GetStillbornBenefit,
                    new SqlParameter("@policyId", policyId));
                var mapping = Mapper.Map<List<product_Benefit>>(benefit);
                return mapping.Count > 0 ? mapping[0].Id : -1;
            }
        }

        public async Task<StillbornBenefit> GetStillbornBenefit(List<int> policyIds)
        {
            var sbBenefit = new StillbornBenefit { Id = -1 };
            foreach (var policyId in policyIds)
            {
                sbBenefit.PolicyId = policyId;
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    var benefit = await _benefitRepository.SqlQueryAsync<product_Benefit>(DatabaseConstants.GetStillbornBenefit,
                        new SqlParameter("@policyId", policyId));
                    var mapping = Mapper.Map<List<product_Benefit>>(benefit);
                    sbBenefit.Id = mapping.Count > 0 ? mapping[0].Id : sbBenefit.Id;
                    if (sbBenefit.Id > -1)
                    {
                        return new StillbornBenefit
                        {
                            Id = sbBenefit.Id,
                            PolicyId = policyId
                        };
                    }
                }
            }
            return sbBenefit;
        }

        public async Task<string> GetPolicyNumber(int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.Where(i => i.PolicyId == policyId)
                    .Select(a => a.PolicyNumber).FirstOrDefaultAsync();
            }
        }

        public async Task<List<PolicyInsuredLife>> GetPolicyInsuredLives(List<int> policyIds)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _policyInsuredLifeRepository.Where(p => policyIds.Contains(p.PolicyId)).ToListAsync();
                return Mapper.Map<List<PolicyInsuredLife>>(results);
            }
        }

        public async Task<List<PolicyBroker>> GetPolicyBrokers(List<int> policyIds)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewBrokerage);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _policyBrokerRepository.Where(a => policyIds.Contains(a.PolicyId) && !a.IsDeleted).ToListAsync();
                return Mapper.Map<List<PolicyBroker>>(results);
            }
        }

        public async Task<bool> CheckIfPolicyIsGroupOrIndividual(int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var ownerDetails = await _policyRepository.Where(i => i.PolicyId == policyId)
                    .Select(a => a.PolicyOwnerId).FirstOrDefaultAsync();
                var company = await _clientCompanyRepository.Where(i => i.RolePlayerId == ownerDetails).FirstOrDefaultAsync();
                return company == null;
            }
        }

        public async Task<bool> UpdatePolicyInsuredLife(PolicyInsuredLife policyInsuredLife)
        {
            Contract.Requires(policyInsuredLife != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var insuredLife = await _policyInsuredLifeRepository
                    .SingleAsync(pil => pil.PolicyId == policyInsuredLife.PolicyId && pil.RolePlayerId == policyInsuredLife.RolePlayerId,
                        $"Could not find a Roleplayer with the id {policyInsuredLife.RolePlayerId}");

                if (insuredLife != null)
                {
                    insuredLife.InsuredLifeStatus = policyInsuredLife.InsuredLifeStatus.Value;
                    insuredLife.EndDate = policyInsuredLife.EndDate;
                    _policyInsuredLifeRepository.Update(insuredLife);
                    await scope.SaveChangesAsync();
                }
            }
            return await Task.FromResult(true);
        }

        public async Task<List<PolicyModel>> GetPoliciesByPolicyOwner(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = await _policyRepository
                    .Where(i => i.PolicyOwnerId == rolePlayerId)
                    .ToListAsync();
                await _policyRepository.LoadAsync(policies, p => p.PolicyBrokers);
                await _policyRepository.LoadAsync(policies, p => p.Benefits);
                await _policyRepository.LoadAsync(policies, p => p.ProductOption);
                await _policyRepository.LoadAsync(policies, p => p.PolicyInsuredLives);
                await _policyRepository.LoadAsync(policies, p => p.PolicyLifeExtension);

                return Mapper.Map<List<PolicyModel>>(policies);
            }
        }

        public async Task<List<PolicyModel>> GetOnlyPoliciesByRolePlayer(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = await _policyRepository
                    .Where(i => i.PolicyOwnerId == rolePlayerId)
                    .ToListAsync();

                return Mapper.Map<List<PolicyModel>>(policies);
            }
        }

        public async Task<List<PolicyModel>> GetPoliciesWithProductOptionByRolePlayer(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _policyRepository
                    .Where(i => i.PolicyOwnerId == rolePlayerId)
                    .ToListAsync();

                await _policyRepository.LoadAsync(entities, p => p.ProductOption);
                await _policyRepository.LoadAsync(entities, p => p.PolicyOwner);

                foreach (var policy in entities)
                {
                    await _productOptionRepository.LoadAsync(policy.ProductOption, p => p.ProductOptionDependencies);
                    await _rolePlayerRepository.LoadAsync(policy.PolicyOwner, p => p.Company);
                    await _productOptionRepository.LoadAsync(policy.ProductOption, p => p.Product);
                }

                var policies = Mapper.Map<List<PolicyModel>>(entities);

                foreach (var policy in policies)
                {
                    await SetPolicyProductCategoryType(policy);
                }

                return policies;
            }
        }

        public async Task<PolicyModel> GetPolicyWithProductOptionByPolicyId(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _policyRepository
                    .FirstOrDefaultAsync(i => i.PolicyId == policyId);

                await _policyRepository.LoadAsync(entity, p => p.ProductOption);
                await _productOptionRepository.LoadAsync(entity.ProductOption, p => p.Product);
                await _policyRepository.LoadAsync(entity, p => p.PolicyOwner);
                await _rolePlayerRepository.LoadAsync(entity.PolicyOwner, p => p.Company);

                var policy = Mapper.Map<PolicyModel>(entity);
                await SetPolicyProductCategoryType(policy);

                return policy;
            }
        }


        public async Task<List<string>> ImportExternalPartnerPolicyListing(string fileName, FileContentImport content)
        {
            if (content == null)
            {
                throw new NullReferenceException("File content cannot be null");
            }

            if (string.IsNullOrEmpty(content.Data))
            {
                throw new NullReferenceException("File content cannot be null");
            }

            clientReferenceNumber = 0;
            var errors = new List<string>();
            var decodedString = Convert.FromBase64String(content.Data);
            const int StartingIndex = 0;
            var fileData = Encoding.UTF8.GetString(decodedString, StartingIndex, decodedString.Length);
            var policyNumberIndex = fileData.IndexOf("policy_policynumber", StringComparison.Ordinal);

            if (policyNumberIndex != -1)
            {
                fileData = fileData.Substring(policyNumberIndex);
            }

            const char commaDelimiter = ',';
            const string newLine = "\n";

            var csvParserOptions = new CsvParserOptions(true, commaDelimiter);
            var csvMapper = new ExternalPartnerPolicyDataMapping();
            var csvParser = new CsvParser<Load_ExternalPartnerPolicyData>(csvParserOptions, csvMapper);
            var csvReaderOptions = new CsvReaderOptions(new[] { newLine });
            var records = csvParser.ReadFromString(csvReaderOptions, fileData).ToList();

            var fileIdentifier = Guid.NewGuid();
            var company = string.Empty;
            var policyNumber = string.Empty;
            var externalPolicyDataListings = new List<Load_ExternalPartnerPolicyData>();

            var rowNumber = 2; // First line containing data in the spreadsheet.

            foreach (var record in records)
            {

                var externalPolicyData = record.Result;
                externalPolicyData.FileIdentifier = fileIdentifier;
                externalPolicyDataListings.Add(externalPolicyData);
                rowNumber++;
            }

            if (errors.Count > 0)
            {
                return errors;
            }

            // Import the records in the background
            //await SaveThirdPatyPolicyListingFileDetails(fileIdentifier, fileName);
            _ = Task.Run(() => ImportExternalPartnerPolicyRecords(fileIdentifier, externalPolicyDataListings));

            return errors;
        }

        private async Task ImportExternalPartnerPolicyRecords( Guid fileIdentifier, List<Load_ExternalPartnerPolicyData> policyDataListings)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                try
                {
                    string sql;
                    const int importCount = 500;
                    while (policyDataListings.Count > 0)
                    {
                        var count = policyDataListings.Count >= importCount ? importCount : policyDataListings.Count;
                        var records = policyDataListings.GetRange(0, count);
                        sql = GetExternalPartnerPolicyDataSql(records);
                        await _policyInsuredLifeRepository.ExecuteSqlCommandAsync(sql);
                        policyDataListings.RemoveRange(0, count);
                    }
                    var data = await _premiumListingRepository
                        .FirstOrDefaultAsync(s => s.FileIdentifier.Equals(fileIdentifier));
                    //if (data != null)
                    //{
                    //    await CreateWizardTask(company, createNewPolicies, fileIdentifier);
                    //}
                }
                catch (Exception ex)
                {
                    ex.LogException(ex.Message);
                }
            }
        }



        private string GetExternalPartnerPolicyDataSql(List<Load_ExternalPartnerPolicyData> records)
        {

            var sql = new StringBuilder($"INSERT INTO [Load].[ExternalPartnerPolicyData] ([FileIdentifier],[PolicyNumber],[PolicyUmaid],[ProductName],[OptionName]" +
           $",[PolicyInceptionDate],[PolicyCancellationDate],[PolicyStatus],[PolicyCreatedUser],[PolicyCreatedDate]" +
           $",[ClientFirstName],[ClientSurname],[ClientIdNumber],[ClientDateOfBirth],[ClientAge],[ClientGender]" +
           $",[OptionSelection],[MemberType],[LastName],[FirstName],[IdNumber],[DateOfBirth],[MemberAge],[Gender]" +
           $",[IntermediaryGroupName],[PolicyPaymentMethod],[SchemeName],[Scheme],[ProductOptionSetupName],[MemberPremium]" +
           $",[PolicyGrossPremium],[Salary],[ApprovedCover],[FreeCoverLimit],[CreatedMonth],[PolicyCancelledUser],[CancelledReason]" +
           $",[PolicyUpdatedDate],[PremiumFrequency]) VALUES");

            foreach (var rec in records)
            {

                sql.AppendLine($"('{rec.FileIdentifier}', {SetLength(rec.PolicyNumber, 256).Quoted()}, '{SetLength(rec.PolicyUmaid, 64).TrimText()}', " +
                    $"'{SetLength(rec.ProductName, 64)}', '{SetLength(rec.OptionName, 32)}', '{SetLength(rec.PolicyInceptionDate.ToString(), 32).TrimText()}', " +
                    $"{SetLength(rec.PolicyCancellationDate.ToString(), 256).Quoted()}, {SetLength(rec.PolicyStatus, 256).Quoted()}, '{SetLength(rec.PolicyCreatedUser, 32).TrimText()}', " +
                    $"'{SetLength(rec.PolicyCreatedDate.ToString(), 32).TrimText()}', '{SetLength(rec.ClientFirstName, 32).TrimText()}','{SetLength(rec.ClientSurname, 32)}', " +
                    $"{SetLength(rec.ClientIdNumber, 128).Quoted()}, {SetLength(rec.ClientDateOfBirth.ToString(), 256).Quoted()}, {SetLength(rec.ClientAge.ToString(), 256).Quoted()}, " +
                    $"{SetLength(rec.ClientGender, 256).Quoted()}, {SetLength(rec.OptionSelection, 256).Quoted()}, {SetLength(rec.MemberType, 256).Quoted()}, " +
                    $"{SetLength(rec.LastName, 32).Quoted()}, {SetLength(rec.FirstName, 256).Quoted()}, {SetLength(rec.IdNumber, 256).Quoted()}, " +
                    $"{SetLength(rec.DateOfBirth.ToString(), 256).Quoted()}, {SetLength(rec.MemberAge.ToString(), 256).Quoted()}, {SetLength(rec.Gender, 256).Quoted()}, " +
                    $"{SetLength(rec.IntermediaryGroupName, 32).Quoted()}, {SetLength(rec.PolicyPaymentMethod, 24).Quoted()}, {SetLength(rec.SchemeName, 24).Quoted()}, " +
                    $"{SetLength(rec.Scheme, 128).Quoted()}, {SetLength(rec.ProductOptionSetupName, 24).Quoted()}, {SetLength(rec.MemberPremium.ToString(), 256).Quoted()}, " +
                    $"{SetLength(rec.PolicyGrossPremium.ToString(), 128).Quoted()}, {SetLength(rec.Salary.ToString(), 24).Quoted()}, {SetLength(rec.ApprovedCover.ToString(), 256).Quoted()}, " +
                    $"{SetLength(rec.FreeCoverLimit.ToString(), 32).Quoted()}, {SetLength(rec.CreatedMonth.ToString(), 32).Quoted()}, {SetLength(rec.PolicyCancelledUser, 50).Quoted()}, " +
                    $"{SetLength(rec.CancelledReason, 32).Quoted()}, {SetLength(rec.PolicyUpdatedDate.ToString(), 32).Quoted()}, " +
                    $"{SetLength(rec.PremiumFrequency, 32).Quoted()}),");
            }

            return sql.ToString().TrimEnd(new char[] { ',', '\r', '\n', ' ' });
        }

        public async Task<List<string>> ImportPremiumListing(string fileName, bool createNewPolicies, FileContentImport content)
        {
            if (content == null)
            {
                throw new NullReferenceException("File content cannot be null");
            }

            if (string.IsNullOrEmpty(content.Data))
            {
                throw new NullReferenceException("File content cannot be null");
            }

            clientReferenceNumber = 0;
            var errors = new List<string>();
            var decodedString = Convert.FromBase64String(content.Data);
            const int StartingIndex = 0;
            var fileData = Encoding.UTF8.GetString(decodedString, StartingIndex, decodedString.Length);
            var companyIndex = fileData.IndexOf("Company", StringComparison.Ordinal);

            if (companyIndex != -1)
            {
                fileData = fileData.Substring(companyIndex);
            }

            const char commaDelimiter = '|';
            const string newLine = "\n";

            var csvParserOptions = new CsvParserOptions(true, commaDelimiter);
            var csvMapper = new PremiumListingMapping();
            var csvParser = new CsvParser<Load_PremiumListing>(csvParserOptions, csvMapper);
            var csvReaderOptions = new CsvReaderOptions(new[] { newLine });
            var records = csvParser.ReadFromString(csvReaderOptions, fileData).ToList();

            var fileIdentifier = Guid.NewGuid();
            var company = string.Empty;
            var policyNumber = string.Empty;
            var premiumListings = new List<Load_PremiumListing>();

            var rowNumber = 5; // First line containing data in the spreadsheet.

            foreach (var record in records)
            {
                if (!record.IsValid)
                {
                    errors.Add($"Error on line {rowNumber} column {record.Error.ColumnIndex}: {record.Error.Value}");
                }

                if (string.IsNullOrEmpty(record.Result.ClientType)) continue;
                var premiumListingData = record.Result;

                if (string.IsNullOrEmpty(company)) company = premiumListingData.Company;

                if (string.IsNullOrEmpty(policyNumber))
                {
                    policyNumber = premiumListingData.PolicyNumber;
                    errors.AddRange(await ValidatePolicyNumber(policyNumber, company));
                }

                // Validate date of birth
                if (TryConvertToDateString(record.Result.DateOfBirth) != null)
                {
                    record.Result.DateOfBirth = TryConvertToDateString(record.Result.DateOfBirth);
                }
                else
                {
                    errors.Add($"Invalid date of birth '{premiumListingData.DateOfBirth}' on line {rowNumber}");
                }

                // Validate join date
                if (TryConvertToDateString(record.Result.JoinDate) != null)
                {
                    record.Result.JoinDate = TryConvertToDateString(record.Result.JoinDate);
                    if (!DateOnFirstOfTheMonth(record.Result.JoinDate))
                    {
                        errors.Add($"Join date '{record.Result.JoinDate}' is not on the first of the month on line {rowNumber}");
                    }
                }
                else
                {
                    errors.Add($"Invalid join date '{premiumListingData.JoinDate}' on line {rowNumber}");
                }

                // Convert previous insurer start date if there is one
                if (TryConvertToDateString(record.Result.PreviousInsurerStartDate) != null)
                {
                    record.Result.PreviousInsurerStartDate = TryConvertToDateString(record.Result.PreviousInsurerStartDate);
                }
                else
                {
                    record.Result.PreviousInsurerStartDate = "";
                }

                // Convert previous insurer end date if there is one
                if (TryConvertToDateString(record.Result.PreviousInsurerEndDate) != null)
                {
                    record.Result.PreviousInsurerEndDate = TryConvertToDateString(record.Result.PreviousInsurerEndDate);
                }
                else
                {
                    record.Result.PreviousInsurerEndDate = "";
                }

                premiumListingData.ClientReference = Regex.Replace(premiumListingData.ClientReference.Trim(), "[^A-Za-z0-9]+", "");
                premiumListingData.FileIdentifier = fileIdentifier;
                premiumListingData.Company = company;
                premiumListings.Add(premiumListingData);
                rowNumber++;
            }

            if (errors.Count > 0)
            {
                return errors;
            }

            // Import the records in the background
            await SavePremiumListingFileDetails(fileIdentifier, fileName);
            _ = Task.Run(() => ImportPremiumListingRecords(company, createNewPolicies, fileIdentifier, premiumListings));

            return errors;
        }

        public async Task<List<string>> ImportPremiumListingRawData(string fileName, bool createNewPolicies, FileContentImport content)
        {
            if (content == null || string.IsNullOrWhiteSpace(content.Data))
            {
                throw new NullReferenceException("File content cannot be null");
            }

            clientReferenceNumber = 0;
            var errors = new List<string>();
            var decodedString = Convert.FromBase64String(content.Data);
            const int StartingIndex = 0;
            var fileData = Encoding.UTF8.GetString(decodedString, StartingIndex, decodedString.Length);
            var companyIndex = fileData.IndexOf("Company", StringComparison.Ordinal);

            if (companyIndex != -1)
            {
                fileData = fileData.Substring(companyIndex);
            }

            var fileIdentifier = Guid.NewGuid();
            var company = string.Empty;
            var policyNumber = string.Empty;

            const char commaDelimiter = '|';

            string mainMemberIdNumber = "";
            var premiumListings = new List<PremiumListingModel>();
            var mainPremiumListings = new List<PremiumListingModel>();

            var lines = GetLines(fileData);
            var headerFields = GetFieldsFromHeader(lines.First(), commaDelimiter);
            var propertyList = MapHeaderToProperties<PremiumListingModel>(headerFields).Where(x => x != null).ToList();
            var rows = lines.Skip(1).Where(x => !x.StartsWith($"{commaDelimiter}{commaDelimiter}{commaDelimiter}"));

            var rowNumber = 2; // First line number containing data in the spreadsheet.
            var mainMemberBenefit = "";

            foreach (var line in rows)
            {
                var rowColumnCount = line.Split(commaDelimiter)?.Length;

                if (line.All(x => x == commaDelimiter)) // if true, treat as empty line and skip
                    continue;

                if (rowColumnCount == headerFields.Length)
                {
                    var premiumListing = new PremiumListingModel();

                    for (var jCount = 0; jCount < rowColumnCount; jCount++)
                    {
                        var columnName = headerFields[jCount];
                        var columnValue = line.Split(commaDelimiter)[jCount];

                        SetPropertyValues(premiumListing, columnName, columnValue);
                    }

                    if (string.IsNullOrEmpty(premiumListing.ClientType)
                        && string.IsNullOrEmpty(premiumListing.Surname)
                        && string.IsNullOrEmpty(premiumListing.ClientReference))
                    {
                        continue;
                    }

                    var isMainMember = false;

                    if (premiumListing.ClientType != null)
                    {
                        isMainMember = premiumListing.ClientType.Length == 1 ?
                            premiumListing.ClientType.Equals("M", StringComparison.OrdinalIgnoreCase)
                            : premiumListing.ClientType.Equals("Main Member", StringComparison.OrdinalIgnoreCase);
                    }

                    _ = DateTime.TryParse(premiumListing.DateOfBirth, out DateTime _dateOfBirth);

                    // check DoB against IdNumber, if both are available
                    bool isIdNumberValid = ValidateDateOfBirth(premiumListing.IdNumber, out string validatedIdNumber, out DateTime? validatedDateOfBirth);

                    if (!isIdNumberValid && isMainMember && string.IsNullOrWhiteSpace(premiumListing.PassportNumber))
                    {
                        errors.Add($"Main Member: Invalid Id Number {validatedIdNumber} on row number {rowNumber}" +
                            $" - full name {premiumListing.FirstName} {premiumListing.Surname}");

                        rowNumber++;

                        continue;
                    }

                    if (isIdNumberValid && string.IsNullOrWhiteSpace(premiumListing.PassportNumber) && validatedDateOfBirth != _dateOfBirth)
                    {
                        errors.Add($"Date of Birth found on input and Date of Birth extracted from Id number are not the same: " +
                            $"{validatedIdNumber} on row number {rowNumber} - member type [{premiumListing.ClientType}]" +
                            $" - full name {premiumListing.FirstName} {premiumListing.Surname}");
                    }

                    if (!isIdNumberValid && string.IsNullOrWhiteSpace(premiumListing.PassportNumber) && _dateOfBirth == DateTime.MinValue)
                    {
                        errors.Add($"Invalid Id Number and Date of Birth: {validatedIdNumber} on row number {rowNumber}" +
                            $" - member type [{premiumListing.ClientType}] - full name {premiumListing.FirstName} {premiumListing.Surname}");
                    }

                    premiumListing.DateOfBirth = validatedDateOfBirth.HasValue ? validatedDateOfBirth.Value.ToShortDateString() : _dateOfBirth.ToShortDateString();
                    premiumListing.MainMemberId = isMainMember ? validatedIdNumber : mainMemberIdNumber;

                    // Don't use an invalid ID Number at all as it will cause problems at claim stage
                    premiumListing.IdNumber = isIdNumberValid ? validatedIdNumber : "";

                    premiumListing.FileIdentifier = fileIdentifier;

                    if (isMainMember)
                    {
                        mainMemberIdNumber = isIdNumberValid ? validatedIdNumber : premiumListing.PassportNumber;
                    }

                    premiumListings.Add(premiumListing);
                }
                else
                {
                    errors.Add($"Number of row columns not matching with header columns, {rowNumber}");
                }
            }

            decimal mainMemberBenefitAmount = 0M;

            foreach (var record in premiumListings)
            {
                if (string.IsNullOrEmpty(record.ClientType)
                    && string.IsNullOrEmpty(record.Surname)
                    && string.IsNullOrEmpty(record.ClientReference))
                {
                    // errors.Add($"Error on line {rowNumber}. No valid mandatory data is found.");

                    rowNumber++;
                    continue;
                }

                if (string.IsNullOrEmpty(record.ClientType))
                {
                    rowNumber++;
                    continue;
                }

                var memberType = "";

                var mainMemberDbBenefits = new List<MemberBenefitModel>();
                var otherMemberBenefits = new List<MemberBenefitModel>();

                switch (record.ClientType.Trim().ToUpper())
                {
                    case "M":
                    case "MAIN MEMBER":
                    case "MAIN":
                        memberType = "Main Member";
                        mainMemberBenefit = record.BenefitName;

                        var memberTypeId = (int)CoverMemberTypeEnum.MainMember;
                        var calculatedMemberAge = DateTime.TryParse(record.DateOfBirth, out DateTime dob) ? DateTime.Today.Year - dob.Year : 0;

                        using (var scope = _dbContextScopeFactory.CreateReadOnly())
                        {
                            try
                            {
                                mainMemberDbBenefits = await _benefitRepository
                                    .SqlQueryAsync<MemberBenefitModel>(DatabaseConstants.GetMemberBenefit
                                        , new SqlParameter("@CoverMemberTypeId", memberTypeId)
                                        , new SqlParameter("@Age", calculatedMemberAge)
                                        , new SqlParameter("@BenefitAmount", record.CoverAmount)
                                        , new SqlParameter("@MainMemberFullBenefit", mainMemberBenefit)
                                    );

                                if (mainMemberDbBenefits.Any())
                                {
                                    mainMemberBenefitAmount = mainMemberDbBenefits.FirstOrDefault()?.BenefitAmount ?? 0;
                                }
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex);
                            }
                        }

                        var mainMemberDbBenefit = mainMemberDbBenefits.FirstOrDefault();

                        if (mainMemberDbBenefit != null && !string.IsNullOrWhiteSpace(mainMemberDbBenefit.BenefitName)
                            && !mainMemberBenefit.Equals(mainMemberDbBenefit.BenefitName, StringComparison.OrdinalIgnoreCase))
                        {
                            errors.Add($"Line {rowNumber}: Benefit supplied does not match benefit found for {memberType}");

                            rowNumber++;
                            continue;
                        }

                        if (string.IsNullOrWhiteSpace(record.IdNumber) && string.IsNullOrWhiteSpace(record.PassportNumber))
                        {
                            errors.Add($"Line {rowNumber}: Main member must have a non-empty ID number or passport number. " +
                                $"Line skipped for [{record.FirstName} {record.Surname}]");

                            rowNumber++;
                            continue;
                        }

                        if (string.IsNullOrWhiteSpace(record.DateOfBirth) && !string.IsNullOrWhiteSpace(record.PassportNumber))
                        {
                            errors.Add($"Line {rowNumber}: Main member wih no ID number must have the passport number and a valid Date of Birth." +
                                $"Line skipped for [{record.FirstName} {record.Surname}]");

                            rowNumber++;
                            continue;
                        }

                        break;

                    case "S":
                    case "SPOUSE":
                        memberType = "Spouse";
                        memberTypeId = (int)CoverMemberTypeEnum.Spouse;
                        calculatedMemberAge = DateTime.TryParse(record.DateOfBirth, out dob) ? DateTime.Today.Year - dob.Year : 0;

                        using (var scope = _dbContextScopeFactory.CreateReadOnly())
                        {
                            try
                            {
                                otherMemberBenefits = await _benefitRepository
                                .SqlQueryAsync<MemberBenefitModel>(
                                    DatabaseConstants.GetMemberBenefit
                                    , new SqlParameter("@CoverMemberTypeId", memberTypeId)
                                    , new SqlParameter("@Age", calculatedMemberAge)
                                    , new SqlParameter("@BenefitAmount", mainMemberBenefitAmount)
                                    , new SqlParameter("@MainMemberFullBenefit", mainMemberBenefit)
                                );

                                if (otherMemberBenefits.Count > 1)
                                {
                                    var resultDictionary = new Dictionary<string, int>();
                                    foreach (var otherMemberBenefit in otherMemberBenefits)
                                    {
                                        var matchResult = mainMemberBenefit.LevenshteinDistance(otherMemberBenefit.BenefitName);

                                        resultDictionary.Add(otherMemberBenefit.BenefitName, matchResult);
                                    }

                                    record.BenefitName = resultDictionary.OrderBy(x => x.Value).FirstOrDefault().Key;
                                }
                                else if (otherMemberBenefits.Count == 1)
                                {
                                    record.BenefitName = otherMemberBenefits?.FirstOrDefault()?.BenefitName;
                                }
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex);
                            }
                        }
                        break;

                    case "C":
                    case "CHILD":
                        memberType = "Child";
                        memberTypeId = (int)CoverMemberTypeEnum.Child;
                        calculatedMemberAge = DateTime.TryParse(record.DateOfBirth, out dob) ? DateTime.Today.Year - dob.Year : 0;

                        using (var scope = _dbContextScopeFactory.CreateReadOnly())
                        {
                            try
                            {
                                otherMemberBenefits = await _benefitRepository
                                .SqlQueryAsync<MemberBenefitModel>(
                                    DatabaseConstants.GetMemberBenefit
                                    , new SqlParameter("@CoverMemberTypeId", memberTypeId)
                                    , new SqlParameter("@Age", calculatedMemberAge)
                                    , new SqlParameter("@BenefitAmount", mainMemberBenefitAmount)
                                    , new SqlParameter("@MainMemberFullBenefit", mainMemberBenefit)
                                );

                                if (otherMemberBenefits.Count > 1)
                                {
                                    var resultDictionary = new Dictionary<string, int>();
                                    foreach (var otherMemberBenefit in otherMemberBenefits)
                                    {
                                        var matchResult = mainMemberBenefit.LevenshteinDistance(otherMemberBenefit.BenefitName);

                                        resultDictionary.Add(otherMemberBenefit.BenefitName, matchResult);
                                    }

                                    record.BenefitName = resultDictionary.OrderBy(x => x.Value).FirstOrDefault().Key;
                                }
                                else if (otherMemberBenefits.Count == 1)
                                {
                                    record.BenefitName = otherMemberBenefits?.FirstOrDefault()?.BenefitName;
                                }
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex);
                            }
                        }

                        break;

                    //case "S":
                    case "STILLBORN":
                        memberType = "Child";
                        memberTypeId = (int)CoverMemberTypeEnum.Child;
                        calculatedMemberAge = DateTime.TryParse(record.DateOfBirth, out dob) ? DateTime.Today.Year - dob.Year : 0;

                        using (var scope = _dbContextScopeFactory.CreateReadOnly())
                        {
                            try
                            {
                                otherMemberBenefits = await _benefitRepository
                                .SqlQueryAsync<MemberBenefitModel>(
                                    DatabaseConstants.GetMemberBenefit
                                    , new SqlParameter("@CoverMemberTypeId", memberTypeId)
                                    , new SqlParameter("@Age", calculatedMemberAge)
                                    , new SqlParameter("@BenefitAmount", mainMemberBenefitAmount)
                                    , new SqlParameter("@MainMemberFullBenefit", mainMemberBenefit)
                                );

                                if (otherMemberBenefits.Count > 1)
                                {
                                    var resultDictionary = new Dictionary<string, int>();
                                    foreach (var otherMemberBenefit in otherMemberBenefits)
                                    {
                                        var matchResult = mainMemberBenefit.LevenshteinDistance(otherMemberBenefit.BenefitName);

                                        resultDictionary.Add(otherMemberBenefit.BenefitName, matchResult);
                                    }

                                    record.BenefitName = resultDictionary.OrderBy(x => x.Value).FirstOrDefault().Key;
                                }
                                else if (otherMemberBenefits.Count == 1)
                                {
                                    record.BenefitName = otherMemberBenefits?.FirstOrDefault()?.BenefitName;
                                }
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex);
                            }
                        }
                        break;

                    case "F":
                    case "FAMILY":
                        // Rule: For a family, we need to take the benefit amount of main member,
                        // and the type should be extended. This applies to parents, and in-laws
                        memberType = "Extended";
                        memberTypeId = (int)CoverMemberTypeEnum.ExtendedFamily;
                        calculatedMemberAge = DateTime.TryParse(record.DateOfBirth, out dob) ? DateTime.Today.Year - dob.Year : 0;

                        using (var scope = _dbContextScopeFactory.CreateReadOnly())
                        {
                            try
                            {
                                otherMemberBenefits = await _benefitRepository
                                .SqlQueryAsync<MemberBenefitModel>(
                                    DatabaseConstants.GetMemberBenefit
                                    , new SqlParameter("CoverMemberTypeId", memberTypeId)
                                    , new SqlParameter("@Age", calculatedMemberAge)
                                    , new SqlParameter("@BenefitAmount", mainMemberBenefitAmount)
                                    , new SqlParameter("@MainMemberFullBenefit", mainMemberBenefit)
                                );

                                if (otherMemberBenefits.Count > 1)
                                {
                                    var resultDictionary = new Dictionary<string, int>();
                                    foreach (var otherMemberBenefit in otherMemberBenefits)
                                    {
                                        var matchResult = mainMemberBenefit.LevenshteinDistance(otherMemberBenefit.BenefitName);

                                        resultDictionary.Add(otherMemberBenefit.BenefitName, matchResult);
                                    }

                                    record.BenefitName = resultDictionary.OrderBy(x => x.Value).FirstOrDefault().Key;
                                }
                                else if (otherMemberBenefits.Count == 1)
                                {
                                    record.BenefitName = otherMemberBenefits?.FirstOrDefault()?.BenefitName;
                                }
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex);
                            }
                        }

                        break;

                    case "E":
                    case "EXTENDED":
                        memberType = "Extended";
                        memberTypeId = (int)CoverMemberTypeEnum.ExtendedFamily;
                        calculatedMemberAge = DateTime.TryParse(record.DateOfBirth, out dob) ? DateTime.Today.Year - dob.Year : 0;

                        using (var scope = _dbContextScopeFactory.CreateReadOnly())
                        {
                            try
                            {
                                otherMemberBenefits = await _benefitRepository
                                .SqlQueryAsync<MemberBenefitModel>(
                                    DatabaseConstants.GetMemberBenefit
                                    , new SqlParameter("@CoverMemberTypeId", memberTypeId)
                                    , new SqlParameter("@Age", calculatedMemberAge)
                                    , new SqlParameter("@BenefitAmount", record.CoverAmount)
                                    , new SqlParameter("@MainMemberFullBenefit", mainMemberBenefit)
                                );

                                if (otherMemberBenefits.Count > 1)
                                {
                                    var resultDictionary = new Dictionary<string, int>();
                                    foreach (var otherMemberBenefit in otherMemberBenefits)
                                    {
                                        var matchResult = mainMemberBenefit.LevenshteinDistance(otherMemberBenefit.BenefitName);

                                        resultDictionary.Add(otherMemberBenefit.BenefitName, matchResult);
                                    }

                                    record.BenefitName = resultDictionary.OrderBy(x => x.Value).FirstOrDefault().Key;
                                }
                                else if (otherMemberBenefits.Count == 1)
                                {
                                    record.BenefitName = otherMemberBenefits?.FirstOrDefault()?.BenefitName;
                                }
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex);
                            }
                        }

                        break;

                    case "B":
                    case "BENEFICIARY":
                        break;
                }

                if (record.ClientType.Length == 1)
                    record.ClientType = memberType;

                var memberTypes = new string[] { "Extended", "Child", "Spouse", "Family", "Stillborn" };

                if (!string.IsNullOrWhiteSpace(record.ClientType) && memberTypes.Contains(record.ClientType, StringComparer.OrdinalIgnoreCase)
                    && string.IsNullOrWhiteSpace(record.IdNumber) && string.IsNullOrWhiteSpace(record.DateOfBirth))
                {
                    errors.Add($"Line {rowNumber}: '{record.ClientType}' member should have an Id Number or Date Of Birth. " +
                        $"Line skipped for [{record.FirstName} {record.Surname}]");

                    rowNumber++;
                    continue;
                }

                if (string.IsNullOrEmpty(company))
                    company = record.Company;

                if (string.IsNullOrEmpty(policyNumber))
                    policyNumber = record.PolicyNumber;

                // Validate date of birth
                if (TryConvertToDateString(record.DateOfBirth) == null)
                {
                    errors.Add($"Invalid date of birth '{record.DateOfBirth}' on line {rowNumber}");
                }
                else
                {
                    record.DateOfBirth = TryConvertToDateString(record.DateOfBirth);
                }

                // Validate join date
                if (TryConvertToDateString(record.JoinDate) == null)
                {
                    errors.Add($"Invalid join date '{record.JoinDate}' on line {rowNumber}");
                }
                else
                {
                    record.JoinDate = TryConvertToDateString(record.JoinDate);
                    if (!DateOnFirstOfTheMonth(record.JoinDate))
                    {
                        errors.Add($"Join date '{record.JoinDate}' is not on the first of the month on line {rowNumber}");
                    }
                }

                // Convert previous insurer start date if there is one
                if (TryConvertToDateString(record.PreviousInsurerStartDate) == null)
                {
                    record.PreviousInsurerStartDate = "";
                    record.PreviousInsurerStartDate = TryConvertToDateString(record.PreviousInsurerStartDate);
                }
                else
                {
                    record.PreviousInsurerStartDate = TryConvertToDateString(record.PreviousInsurerStartDate);
                }

                // Convert previous insurer end date if there is one
                if (TryConvertToDateString(record.PreviousInsurerEndDate) == null)
                {
                    record.PreviousInsurerEndDate = "";
                }
                else
                {
                    record.PreviousInsurerEndDate = TryConvertToDateString(record.PreviousInsurerEndDate);
                }

                record.ClientReference = Regex.Replace(record.ClientReference.Trim(), "[^A-Za-z0-9]+", "");
                record.FileIdentifier = fileIdentifier;
                record.Company = company;

                mainPremiumListings.Add(record);
                rowNumber++;
            }

            var premiumListingsEntities = Mapper.Map<List<Load_PremiumListing>>(premiumListings);

            // Import the records in the background
            await SavePremiumListingFileDetails(fileIdentifier, fileName);
            _ = Task.Run(() => ImportPremiumListingRecords(company, createNewPolicies, fileIdentifier, premiumListingsEntities));

            return errors;
        }

        private bool IsBlankRow(Load_PremiumListing premiumListing)
        {
            return string.IsNullOrEmpty(premiumListing.ClientType)
                && string.IsNullOrEmpty(premiumListing.Surname)
                && string.IsNullOrEmpty(premiumListing.ClientReference);
        }

        private string[] GetFieldsFromHeader(string headerLine, char commaDelimiter)
        {
            // The || allows blank headers if at least one header or delimiter exists.
            return headerLine.Split(commaDelimiter)
               .Select(f => f.Trim())
               .Where(f =>
                   !string.IsNullOrWhiteSpace(f) ||
                   !String.IsNullOrEmpty(headerLine)).ToArray();
        }

        private List<PropertyInfo> MapHeaderToProperties<T>(string[] headerFields)
        {
            var map = new List<PropertyInfo>();
            Type t = typeof(T);

            // Include null properties so these are skipped when parsing the data lines.
            headerFields
                .Select(f =>
                    (
                        f,
                        t.GetProperty(f,
                           BindingFlags.Instance |
                           BindingFlags.Public |
                           BindingFlags.IgnoreCase |
                           BindingFlags.FlattenHierarchy)
                    )
                )
                .ForEach(fp => map.Add(fp.Item2));

            return map;
        }

        private void SetPropertyValues(PremiumListingModel premiumListing, string columnName, string columnValue)
        {
            if (string.IsNullOrEmpty(columnName))
                return;
            Contract.Requires(premiumListing != null);
            var consolidatedFuneralType = premiumListing.GetType();

            foreach (var property in consolidatedFuneralType.GetProperties())
            {
                if (property.Name.Equals(columnName, StringComparison.OrdinalIgnoreCase))
                {
                    if (columnName.Equals("ClientType", StringComparison.OrdinalIgnoreCase))
                    {
                        premiumListing.ClientType = columnValue;

                        break;
                    }

                    if (columnName.Equals("DateOfBirth", StringComparison.OrdinalIgnoreCase))
                    {
                        DateTime? validDate;
                        if (double.TryParse(columnValue, out double _validDouble))
                        {
                            validDate = DateTime.FromOADate(_validDouble);
                            premiumListing.DateOfBirth = validDate.HasValue ? validDate.Value.ToShortDateString() : DateTime.MinValue.ToShortDateString();
                        }
                        else
                        {
                            validDate = TryGetDate(columnValue);

                            premiumListing.DateOfBirth = validDate.HasValue ? validDate.Value.ToShortDateString() : DateTime.MinValue.ToShortDateString();
                        }

                        break;
                    }

                    if (columnName.Equals("Mobile", StringComparison.OrdinalIgnoreCase))
                    {
                        var contactNumber = columnValue;

                        contactNumber = contactNumber.PadLeft(10, '0');
                        premiumListing.Mobile = contactNumber;

                        break;
                    }

                    if (columnName.Equals("Telephone", StringComparison.OrdinalIgnoreCase))
                    {
                        var contactNumber = columnValue;

                        contactNumber = contactNumber.PadLeft(10, '0');
                        premiumListing.Telephone = contactNumber;

                        break;
                    }

                    property.SetValue(premiumListing, columnValue);
                }

                #region Handle non-matching property names and column names

                if (columnName.Equals("InceptionDate", StringComparison.OrdinalIgnoreCase))
                {
                    DateTime? validDate;
                    if (double.TryParse(columnValue, out double _validDouble))
                    {
                        validDate = DateTime.FromOADate(_validDouble);
                        premiumListing.JoinDate = validDate.HasValue ? validDate.Value.ToShortDateString() : DateTime.MinValue.ToShortDateString();
                    }
                    else
                    {
                        validDate = TryGetDate(columnValue);

                        premiumListing.JoinDate = validDate.HasValue ? validDate.Value.ToShortDateString() : DateTime.MinValue.ToShortDateString();
                    }

                    break;
                }

                if (columnName.Equals("PostalCode", StringComparison.OrdinalIgnoreCase))
                {
                    premiumListing.PostalPostCode = columnValue;

                    break;
                }

                if (columnName.Equals("FullName", StringComparison.OrdinalIgnoreCase)
                    || columnName.Equals("FullNames", StringComparison.OrdinalIgnoreCase)
                    || columnName.Equals("Name", StringComparison.OrdinalIgnoreCase)
                    || columnName.Equals("Names", StringComparison.OrdinalIgnoreCase))
                {
                    var fullName = columnValue;

                    var lastIndex = fullName?.LastIndexOf(' ');
                    if (lastIndex > 0)
                    {
                        premiumListing.FirstName = fullName.Substring(0, lastIndex.Value);
                        premiumListing.Surname = fullName.Substring(lastIndex.Value + 1);
                    }
                }

                if (columnName.Equals("BenefitName", StringComparison.OrdinalIgnoreCase))
                {
                    // HACK: since the benefit name contains the amount for extended family members,
                    // just get the amount. No need for an extra column
                    if (int.TryParse(columnValue, out int benefitAmount))
                    {
                        premiumListing.CoverAmount = benefitAmount.ToString();
                    }
                    else
                    {
                        premiumListing.BenefitName = columnValue;
                    }
                }

                #endregion Handle non-matching property names and column names
            }
        }

        private DateTime? TryGetDate(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;
            var columnValueSplit = value.Split(' ');

            if (columnValueSplit.Length == 0)
                return null;

            var dateSplit = columnValueSplit[0].Split('/');

            if (dateSplit.Length != 3)
                return null;

            string month = dateSplit[0];
            string day = dateSplit[1];
            string year = dateSplit[2];

            return DateTime.Parse($"{year}/{month}/{day}");
        }

        /// <summary>
        /// Get all non-blank lines
        /// </summary>
        /// <param name="data">String data to convert to lines</param>
        /// <returns>An enumerable list of lines</returns>
        private IEnumerable<string> GetLines(string data)
        {
            return data.Split(new char[] { '\r', '\n' }).Where
                                    (l => !String.IsNullOrWhiteSpace(l));
        }

        private bool ValidateDateOfBirth(string idNumber, out string validatedIdNumber, out DateTime? validatedDate)
        {
            var idValid = ValidateIdNumberFormat(idNumber, out string _validatedIdNumber, out DateTime? birthDate);

            validatedIdNumber = _validatedIdNumber;
            validatedDate = birthDate;

            return idValid;
        }

        /// <summary>
        /// Validation of the ID number main method 
        /// </summary>
        /// <param name="idNumber">South African ID number</param>
        /// <returns>Returns true, false</returns>
        private bool ValidateIdNumberFormat(string idNumber, out string validatedIdNumber, out DateTime? dateOfBirth)
        {
            idNumber = idNumber?.TrimText();

            if (idNumber == null || string.IsNullOrEmpty(idNumber) || idNumber.Length > 13)
            {
                dateOfBirth = null;
                validatedIdNumber = idNumber;
                return false;
            }

            if (idNumber.Length < 13)
            {
                idNumber = idNumber.PadLeft(13, '0');
            }

            if (idNumber.StartsWith("0000")) // the first for digits represents year and month and should be valid
            {
                dateOfBirth = null;
                validatedIdNumber = idNumber;
                return false;
            }

            bool isValid = false;
            DateTime _date = default;

            // Need to valid the string is numeric
            if (Regex.IsMatch(idNumber, @"^\d+$"))
            {
                // Extract date components
                _ = UInt16.TryParse(idNumber.Substring(0, 2), out UInt16 year);
                _ = UInt16.TryParse(idNumber.Substring(2, 2), out UInt16 month);
                _ = UInt16.TryParse(idNumber.Substring(4, 2), out UInt16 day);

                if (year < DateTime.Now.Year)
                    year += 1900;
                else
                    year += 2000;

                if (year < DateTime.Now.Year - 100) // we're assuming we don't have 100-year olds
                    year += 100;

                _ = DateTime.TryParse($"{year}/{month}/{day}", out _date);

                isValid = idNumber.IsValidIdentityNumber();
            }

            dateOfBirth = _date;
            validatedIdNumber = idNumber;

            return isValid;
        }

        private string TryConvertToDateString(string dateValue)
        {
            if (ValidDateValue(dateValue))
            {
                var date = DateTime.Parse(dateValue);
                return $"{date: yyyy-MM-dd}";
            }
            else
            {
                int numberValue;
                if (int.TryParse(dateValue, out numberValue))
                {
                    DateTime dateTime = DateTime.FromOADate(numberValue);
                    return $"{dateTime: yyyy-MM-dd}";
                }

            }

            return null;
        }

        private bool DateOnFirstOfTheMonth(string date)
        {
            if (!ValidDateValue(date)) return false;
            var result = DateTime.Parse(date);
            return result.Day == 1;
        }

        private bool ValidDateValue(string date)
        {
            if (string.IsNullOrEmpty(date)) return false;
            return DateTime.TryParse(date, out DateTime result);
        }

        private async Task<List<string>> ValidatePolicyNumber(string policyNumber, string companyName)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var errors = new List<string>();
                var policy = await _policyRepository
                    .SingleOrDefaultAsync(p => p.PolicyNumber == policyNumber);

                if (policy is null)
                {
                    errors.Add($"Policy number {policyNumber} does not exist");
                    // Do not validate the company if the policy does not even exist
                    return errors;
                }

                PolicyStatusEnum[] invalidStatus = { PolicyStatusEnum.Cancelled, PolicyStatusEnum.Lapsed, PolicyStatusEnum.NotTakenUp };
                if (invalidStatus.Contains(policy.PolicyStatus))
                {
                    errors.Add($"Policy {policyNumber} is in an invalid status {policy.PolicyStatus}");
                }

                await _policyRepository.LoadAsync(policy, p => p.PolicyOwner);
                var company = companyName.Replace(" ", "");
                var policyOwner = policy.PolicyOwner?.DisplayName.Replace(" ", "");
                if (!company.Equals(policyOwner, StringComparison.OrdinalIgnoreCase))
                {
                    errors.Add($"Policy {policyNumber} does not belong to {companyName}, or the group scheme does not exist");
                }

                return errors;
            }
        }

        private async Task ImportPremiumListingRecords(string company, bool createNewPolicies, Guid fileIdentifier, List<Load_PremiumListing> premiumListings)
        {
            if (premiumListings.Count > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    try
                    {
                        string sql;
                        const int importCount = 500;
                        while (premiumListings.Count > 0)
                        {
                            var count = premiumListings.Count >= importCount ? importCount : premiumListings.Count;
                            var records = premiumListings.GetRange(0, count);
                            sql = GetPremiumListingSql(records);
                            await _policyInsuredLifeRepository.ExecuteSqlCommandAsync(sql);
                            premiumListings.RemoveRange(0, count);
                        }
                        var data = await _premiumListingRepository
                            .FirstOrDefaultAsync(s => s.FileIdentifier.Equals(fileIdentifier));
                        if (data != null)
                        {
                            await CreateWizardTask(company, createNewPolicies, fileIdentifier);
                        }
                    }
                    catch (Exception ex)
                    {
                        ex.LogException("Group Scheme Onboarding");
                    }
                }
            }
        }

        private async Task SavePremiumListingFileDetails(Guid fileIdentifier, string fileName)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var file = new Load_PremiumListingFile
                {
                    FileIdentifier = fileIdentifier,
                    FileName = fileName,
                    IsDeleted = false,
                    CreatedBy = RmaIdentity.Email,
                    CreatedDate = DateTime.Now,
                    ModifiedBy = RmaIdentity.Email,
                    ModifiedDate = DateTime.Now
                };
                _premiumListingFileRepository.Create(file);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private string GetPremiumListingSql(List<Load_PremiumListing> records)
        {
            var sql = new StringBuilder($"INSERT INTO [Load].[PremiumListing] ([FileIdentifier], [Company], [PolicyNumber], " +
                $"[ClientReference], [JoinDate], [ClientType], [FirstName], [Surname], [MainMemberID], [IdNumber], [PassportNumber], " +
                $"[DateOfBirth], [BenefitName], [Address1], [Address2], [City], [Province], [Country], [PostalCode], [PostalAddress1], " +
                $"[PostalAddress2], [PostalCity], [PostalProvince], [PostalCountry], [PostalPostCode], [Telephone], [Mobile], [Email], " +
                $"[PreferredCommunication], [PreviousInsurer], [PreviousInsurerStartDate], [PreviousInsurerEndDate], [PreviousInsurerPolicyNumber], " +
                $"[RetirementAge]) VALUES");

            foreach (var rec in records)
            {
                if (rec.ClientType.Equals("Main Member", StringComparison.OrdinalIgnoreCase))
                {
                    clientReferenceNumber++;
                }

                var clientReference = String.IsNullOrEmpty(rec.ClientReference) ? $"XXX{clientReferenceNumber:000000000}" : rec.ClientReference;

                sql.AppendLine($"('{rec.FileIdentifier}', {SetLength(rec.Company, 256).Quoted()}, '{SetLength(rec.PolicyNumber, 64).TrimText()}', " +
                    $"'{SetLength(clientReference, 64)}', '{SetLength(rec.JoinDate, 32)}', '{SetLength(rec.ClientType, 32).TrimText()}', " +
                    $"{SetLength(rec.FirstName, 256).Quoted()}, {SetLength(rec.Surname, 256).Quoted()}, '{SetLength(rec.MainMemberId, 32).TrimText()}', " +
                    $"'{SetLength(rec.IdNumber, 32).TrimText()}', '{SetLength(rec.PassportNumber, 32).TrimText()}','{SetLength(rec.DateOfBirth, 32)}', " +
                    $"{SetLength(rec.BenefitName, 128).Quoted()}, {SetLength(rec.Address1, 256).Quoted()}, {SetLength(rec.Address2, 256).Quoted()}, " +
                    $"{SetLength(rec.City, 256).Quoted()}, {SetLength(rec.Province, 256).Quoted()}, {SetLength(rec.Country, 256).Quoted()}, " +
                    $"{SetLength(rec.PostalCode, 8).Quoted()}, {SetLength(rec.PostalAddress1, 256).Quoted()}, {SetLength(rec.PostalAddress2, 256).Quoted()}, " +
                    $"{SetLength(rec.PostalCity, 256).Quoted()}, {SetLength(rec.PostalProvince, 256).Quoted()}, {SetLength(rec.PostalCountry, 256).Quoted()}, " +
                    $"{SetLength(rec.PostalPostCode, 8).Quoted()}, {SetLength(rec.Telephone, 24).Quoted()}, {SetLength(rec.Mobile, 24).Quoted()}, " +
                    $"{SetLength(rec.Email, 128).Quoted()}, {SetLength(rec.PreferredCommunication, 24).Quoted()}, {SetLength(rec.PreviousInsurer, 256).Quoted()}, " +
                    $"{SetLength(rec.PreviousInsurerStartDate, 32).Quoted()}, {SetLength(rec.PreviousInsurerEndDate, 32).Quoted()}, {SetLength(rec.PreviousInsurerPolicyNumber, 50).Quoted()}, " +
                    $"{SetLength(rec.RetirementAge, 8).Quoted()}),");
            }

            return sql.ToString().TrimEnd(new char[] { ',', '\r', '\n', ' ' });
        }

        private string SetLength(string value, int len)
        {
            value = string.IsNullOrEmpty(value) ? "" : value.Trim();
            return value.Length > len ? value.Substring(0, len) : value;
        }

        private async Task CreateWizardTask(string company, bool createNewPolicies, Guid fileIdentifier)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var companyParameter = new SqlParameter { ParameterName = "@COMPANY", Value = company };
                var fileIdentifierParameter = new SqlParameter { ParameterName = "@FILEIDENTIFIER", Value = fileIdentifier };
                var dateParameter = new SqlParameter { ParameterName = "@DATE", Value = DateTime.Today.ToString("yyyy-MM-dd") };
                var versionParameter = new SqlParameter { ParameterName = "@VERSION", Value = 2 };
                var userParameter = new SqlParameter { ParameterName = "@USER", Value = RmaIdentity.Email };
                var createPoliciesParameter = new SqlParameter { ParameterName = "@CreateNewPolicies", Value = (createNewPolicies ? 1 : 0) };

                await this._policyInsuredLifeRepository.ExecuteSqlCommandAsync(
                    "[policy].[GeneratePremiumListingTask] @COMPANY, @FILEIDENTIFIER, @DATE, @VERSION, @USER, @CreateNewPolicies",
                        companyParameter,
                        fileIdentifierParameter,
                        dateParameter,
                        versionParameter,
                        userParameter,
                        createPoliciesParameter
                );
            }
        }

        public async Task<PolicyModel> AddPolicy(PolicyModel policy)
        {
            Contract.Requires(policy != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                if (policy.InsurerId == 0) policy.InsurerId = 1;

                var entity = Mapper.Map<policy_Policy>(policy);

                var policyEntity = _policyRepository.Create(entity);
                await scope.SaveChangesAsync();

                return Mapper.Map<PolicyModel>(policyEntity);
            }
        }

        public async Task<List<int>> GetProductIdsByPolicyIds(ProductPolicy productPolicy)
        {
            Contract.Requires(productPolicy != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await (from policy in _policyRepository
                              join productOption in _productOptionRepository on policy.ProductOptionId equals productOption.Id
                              where productPolicy.PolicyIds.Contains(policy.PolicyId)
                              select productOption.ProductId).ToListAsync();
            }
        }

        public async Task<List<int>> GetPolicyIdsByRolePlayerId(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyInsuredLifeRepository.Where(p => p.RolePlayerId == rolePlayerId).Select(a => a.PolicyId).ToListAsync();
            }
        }

        public async Task SendBulkGroupSchedules(int parentPolicyId, string recipients)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyStatus = new List<PolicyStatusEnum>
                {
                    PolicyStatusEnum.Active,
                    PolicyStatusEnum.Continued,
                    PolicyStatusEnum.Reinstated,
                    PolicyStatusEnum.FreeCover,
                    PolicyStatusEnum.PaidUp
                };
                var policies = await _policyRepository
                    .Where(p => p.ParentPolicyId == parentPolicyId
                             && policyStatus.Contains(p.PolicyStatus))
                    .Select(p => p.PolicyId)
                    .ToListAsync();
                await SendGroupPolicySchedules(parentPolicyId, recipients, policies);
            }
        }

        public async Task SendSpecifiedGroupSchedules(int parentPolicyId, string recipients, List<string> policyNumbers)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = await _policyRepository
                    .Where(p => policyNumbers.Contains(p.PolicyNumber))
                    .Select(p => p.PolicyId)
                    .ToListAsync();
                await SendGroupPolicySchedules(parentPolicyId, recipients, policies);
            }
        }

        private async Task SendGroupPolicySchedules(int parentPolicyId, string recipients, List<int> policyIds)
        {
            if (policyIds.Count == 0) return;

            // Get the scheme details if a parent policy Id has been specified, otherwise
            // load the brokerage details of the first policy
            var policyId = parentPolicyId > 0 ? parentPolicyId : policyIds[0];
            var parentPolicy = await _policyRepository
                .SingleOrDefaultAsync(p => p.PolicyId == policyId);
            var brokerage = await _brokerageService.GetBrokerageWithoutReferenceData(parentPolicy.BrokerageId);
            await _policyRepository.LoadAsync(parentPolicy, s => s.PolicyOwner);

            // Load the policy list with the main member member details
            var policies = await (from p in _policyRepository
                                  join per in _personRepository on p.PolicyOwnerId equals per.RolePlayerId
                                  where policyIds.Contains(p.PolicyId)
                                  select new PolicyMember
                                  {
                                      PolicyId = p.PolicyId,
                                      PolicyNumber = p.PolicyNumber,
                                      RolePlayerId = per.RolePlayerId,
                                      MemberName = per.FirstName + " " + per.Surname,
                                      IdNumber = per.IdNumber
                                  })
                                  .ToListAsync();

            // Run in the background, because it will always time out
            _ = Task.Run(() => _communicationService.SendGroupPolicySchedulesToBroker(
                parentPolicyId,
                parentPolicyId > 0 ? parentPolicy.PolicyNumber : brokerage.Name,
                parentPolicyId > 0 ? parentPolicy.PolicyOwner.DisplayName : brokerage.Name,
                policies,
                brokerage.Name,
                recipients));
        }

        public async Task EditPolicy(PolicyModel policy, bool updatePolicyPremium)
        {
            Contract.Requires(policy != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            decimal oldPremium = 0M;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var oldPolicyData = await _policyRepository.FirstOrDefaultAsync(a => a.PolicyId == policy.PolicyId);
                oldPremium = oldPolicyData.InstallmentPremium;

                oldPolicyData.CancellationDate = policy.CancellationDate;
                oldPolicyData.CancellationInitiatedBy = policy.CancellationInitiatedBy;
                oldPolicyData.CancellationInitiatedDate = policy.CancellationInitiatedDate;
                oldPolicyData.PolicyCancelReason = policy.PolicyCancelReason;
                oldPolicyData.PolicyStatus = policy.PolicyStatus;
                oldPolicyData.RegularInstallmentDayOfMonth = policy.RegularInstallmentDayOfMonth;
                oldPolicyData.LastLapsedDate = policy.LastLapsedDate;
                oldPolicyData.LastReinstateDate = policy.LastReinstateDate;
                oldPolicyData.ExpiryDate = policy.ExpiryDate;
                oldPolicyData.ReinstateReason = policy.ReinstateReason;
                oldPolicyData.PolicyInceptionDate = Convert.ToDateTime(policy.PolicyInceptionDate);
                oldPolicyData.PaymentFrequency = policy.PaymentFrequency;
                oldPolicyData.AnnualPremium = policy.AnnualPremium;
                oldPolicyData.InstallmentPremium = policy.InstallmentPremium;

                if (policy.RolePlayerPolicyDeclarations?.Count > 0)
                {
                    oldPolicyData.RolePlayerPolicyDeclarations = Mapper.Map<List<client_RolePlayerPolicyDeclaration>>(policy.RolePlayerPolicyDeclarations);
                }

                if (policy.Covers?.Count > 0)
                {
                    oldPolicyData.Covers = Mapper.Map<List<policy_Cover>>(policy.Covers);
                }

                _policyRepository.Update(oldPolicyData);

                if (policy.PolicyInsuredLives?.Count > 0)
                    await AddOrUpdatePolicyInsuredLive(policy.PolicyInsuredLives);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

            if (updatePolicyPremium)
            {
                await UpdatePolicyPremium(policy);
            }

            //Regenerate Policy Schedule
            var producer = new ServiceBusQueueProducer<PolicyScheduleMessage, PolicyScheduleMessageListener>(PolicyScheduleMessageListener.QueueName);
            await producer.PublishMessageAsync(new PolicyScheduleMessage()
            {
                PolicyId = policy.PolicyId,
                ShouldRegenerateSchedule = true,
                RequestedBy = RmaIdentity.Username,
                ImpersonateUser = RmaIdentity.Username
            });

        }

        private async Task UpdatePolicyPremium(PolicyModel policyModel)
        {
            Contract.Requires(policyModel != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var policyId = policyModel.PolicyId;
                var policy = await _policyRepository.FindByIdAsync(policyId);
                await _policyRepository.LoadAsync(policy, p => p.PolicyOwner);

                if (policy.ParentPolicyId.HasValue)
                {
                    await UpdateChildPolicyPremiums(policy.ParentPolicyId.Value);
                }
                else if (policy.PolicyOwner.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Person)
                {
                    await UpdateIndividualPolicyPremium(policyId);
                }
                else
                {
                    await UpdateChildPolicyPremiums(policy.PolicyId);
                }
            }
        }

        private async Task UpdateIndividualPolicyPremium(int policyId)
        {
            using (_dbContextScopeFactory.Create())
            {
                await _policyRepository.ExecuteSqlCommandAsync(
                    DatabaseConstants.UpdateIndividualPolicyPremium,
                    new SqlParameter("@policyId", policyId),
                    new SqlParameter("@userId", RmaIdentity.Email)
                );
            }
        }

        private async Task UpdateChildPolicyPremiums(int policyId)
        {
            using (_dbContextScopeFactory.Create())
            {
                await _policyRepository.ExecuteSqlCommandAsync(
                    DatabaseConstants.UpdateChildPolicyPremiums,
                    new SqlParameter("@policyId", policyId),
                    new SqlParameter("@userId", RmaIdentity.Email)
                );
            }
        }

        private async Task AddOrUpdatePolicyInsuredLive(List<PolicyInsuredLife> policyInsuredLives)
        {
            if (policyInsuredLives.Count == 0) return;
            using (_dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                // Add member if not already in the list
                foreach (var insuredLife in policyInsuredLives)
                {
                    var exists = await _policyInsuredLifeRepository.AnyAsync(a => a.PolicyId == insuredLife.PolicyId && a.RolePlayerId == insuredLife.RolePlayerId);
                    var entity = new policy_PolicyInsuredLife
                    {
                        PolicyId = insuredLife.PolicyId,
                        RolePlayerId = insuredLife.RolePlayerId,
                        RolePlayerTypeId = insuredLife.RolePlayerTypeId,
                        InsuredLifeStatus = InsuredLifeStatusEnum.Active,
                        StartDate = insuredLife.StartDate.Value,
                        EndDate = null
                    };
                    if (exists)
                        _policyInsuredLifeRepository.Update(entity);
                    else
                        _policyInsuredLifeRepository.Create(entity);
                }
            }
        }

        public async Task<List<PolicyModel>> GetPoliciesByBrokerageId(List<int> brokerIds)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = await _policyRepository
                    .Where(po => brokerIds.Contains(po.BrokerageId))
                    .ToListAsync();
                await _policyRepository.LoadAsync(policies, d => d.PolicyOwner);

                return Mapper.Map<List<PolicyModel>>(policies);
            }
        }

        public async Task<List<PolicyBrokerage>> GetPolicyBrokerageByBrokerageId(int brokerageId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyBrokerages = new List<PolicyBrokerage>();
                var policies = await _policyRepository
                    .Where(po => po.BrokerageId == brokerageId && po.ParentPolicyId == null)
                    .ToListAsync();

                foreach (var policy in policies)
                {
                    var broker = await _brokerageService.GetBrokerageWithoutReferenceData(policy.BrokerageId);
                    policyBrokerages.Add(
                            new PolicyBrokerage
                            {
                                PolicyId = policy.PolicyId,
                                BrokerageId = policy.BrokerageId,
                                DisplayName = broker?.Name,
                                PolicyStatusId = (int)policy.PolicyStatus
                            }
                        );

                }

                return Mapper.Map<List<PolicyBrokerage>>(policyBrokerages);
            }
        }

        public async Task<List<PolicyBrokerage>> GetParentPolicyBrokerageByBrokerageId(int brokerageId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await (from policy in _policyRepository
                              join company in _clientCompanyRepository on policy.PolicyOwnerId equals company.RolePlayerId                             
                              join brokerage in _brokerageRepository on policy.BrokerageId equals brokerage.Id
                              where brokerage.Id == brokerageId
                              select new PolicyBrokerage
                              {
                                  PolicyNumber = policy.PolicyNumber,
                                  PolicyId = policy.PolicyId,
                                  BrokerageId = policy.BrokerageId,
                                  DisplayName = company.Name,
                                  PolicyStatusId = (int)policy.PolicyStatus
                              }).Distinct().ToListAsync();
            }
        }

        public async Task<PagedRequestResult<PolicyBrokerage>> GetParentPolicyBrokerageByStatusId(PagedRequest request, int statusId, int brokerageId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            Contract.Requires(request != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var query = from policy in _policyRepository
                            join parentPol in _policyRepository on policy.ParentPolicyId equals parentPol.PolicyId
                            join roleplayer in _rolePlayerRepository on parentPol.PolicyPayeeId equals roleplayer.RolePlayerId
                            join brokerage in _brokerageRepository on parentPol.BrokerageId equals brokerage.Id
                            where (int)parentPol.PolicyStatus == statusId && brokerage.Id == brokerageId
                            select new PolicyBrokerage
                            {
                                PolicyNumber = parentPol.PolicyNumber,
                                PolicyId = parentPol.PolicyId,
                                BrokerageId = parentPol.BrokerageId,
                                DisplayName = roleplayer.DisplayName,
                                PolicyStatusId = (int)parentPol.PolicyStatus
                            };
                var result = await query.Distinct().Take(request.PageSize).ToPagedResult(request);
                var data = Mapper.Map<List<PolicyBrokerage>>(result.Data);

                return new PagedRequestResult<PolicyBrokerage>()
                {
                    Page = result.Page,
                    PageCount = result.PageCount,
                    RowCount = result.RowCount,
                    PageSize = result.PageSize,
                    Data = data
                };
            }
        }

        public async Task<List<PolicyBrokerage>> GetIndividualPolicyHoldersByBrokerageId(int brokerageId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await (from policy in _policyRepository
                              join roleplayer in _rolePlayerRepository on policy.PolicyOwnerId equals roleplayer.RolePlayerId
                              join brokerage in _brokerageRepository on policy.BrokerageId equals brokerage.Id
                              join person in _personRepository on policy.PolicyOwnerId equals person.RolePlayerId
                              where brokerage.Id == brokerageId
                                && person.RolePlayer.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Person
                                && policy.ParentPolicyId == null
                              select new PolicyBrokerage
                              {
                                  PolicyNumber = policy.PolicyNumber,
                                  PolicyId = policy.PolicyId,
                                  BrokerageId = policy.BrokerageId,
                                  DisplayName = roleplayer.DisplayName,
                                  IdNumber = person.IdNumber,
                                  PolicyStatusId = (int)policy.PolicyStatus,
                                  RepresentativeId = policy.RepresentativeId

                              }).Distinct().ToListAsync();
            }
        }

        public async Task<List<PolicyBrokerage>> GetParentPolicyBrokerage()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await (from policy in _policyRepository
                              join parentPol in _policyRepository on policy.ParentPolicyId equals parentPol.PolicyId
                              join roleplayer in _rolePlayerRepository on parentPol.PolicyPayeeId equals roleplayer.RolePlayerId
                              join brokerage in _brokerageRepository on parentPol.BrokerageId equals brokerage.Id

                              select new PolicyBrokerage
                              {
                                  PolicyNumber = parentPol.PolicyNumber,
                                  PolicyId = parentPol.PolicyId,
                                  BrokerageId = parentPol.BrokerageId,
                                  DisplayName = roleplayer.DisplayName,
                                  PolicyStatusId = (int)parentPol.PolicyStatus
                              }).Distinct().ToListAsync();
            }
        }

        public async Task<List<PolicyBrokerage>> GetChildPolicyBrokerageByParentPolicyId(int parentPolicyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await (from policy in _policyRepository
                              join roleplayer in _rolePlayerRepository on policy.PolicyOwnerId equals roleplayer.RolePlayerId
                              join person in _personRepository on policy.PolicyOwnerId equals person.RolePlayerId
                              join brokerage in _brokerageRepository on policy.BrokerageId equals brokerage.Id
                              where policy.ParentPolicyId == parentPolicyId
                              select new PolicyBrokerage
                              {
                                  PolicyNumber = policy.PolicyNumber,
                                  PolicyId = policy.PolicyId,
                                  BrokerageId = policy.BrokerageId,
                                  DisplayName = roleplayer.DisplayName,
                                  PolicyStatusId = (int)policy.PolicyStatus,
                                  IdNumber = person.IdNumber,
                                  RepresentativeId = policy.RepresentativeId
                              }).Distinct().ToListAsync();
            }
        }

        public async Task<PolicyInsuredLife> GetPolicyInsuredLife(int policyId, int roleplayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _policyInsuredLifeRepository.Where(p => p.PolicyId == policyId && p.RolePlayerId == roleplayerId).FirstOrDefaultAsync();
                return Mapper.Map<PolicyInsuredLife>(result);
            }
        }

        public async Task<List<CancellationSummary>> CancellationsSummaryPerYear()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<CancellationSummary>("[billing].[CancellationsSummaryPerYear]");
            }
        }

        public async Task<List<CancellationSummary>> CancellationsSummaryPerMonth()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<CancellationSummary>("[billing].[CancellationsSummaryPerMonth]");
            }
        }

        public async Task<List<CancellationSummary>> CancellationsSummaryPerReason()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<CancellationSummary>("[billing].[CancellationsSummaryPerStatus]");
            }
        }

        public async Task<List<CancellationSummary>> CancellationsSummaryPerResolved()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<CancellationSummary>("[billing].[CancellationsSummaryResolved]");
            }
        }

        public async Task<PolicyModel> GetChildPolicy(int parentPolicyId, string clientReference, IdTypeEnum idType, string idNumber)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayer = await _rolePlayerRepository
                    .FirstOrDefaultAsync(s => s.Person.IdType == idType
                        && s.Person.IdNumber == idNumber);
                var rolePlayerId = rolePlayer != null ? rolePlayer.RolePlayerId : -99;
                var reference = String.IsNullOrEmpty(clientReference) ? null : clientReference.Trim();
                var policy = await _policyRepository
                    .FirstOrDefaultAsync(s => s.ParentPolicyId == parentPolicyId
                        && s.ClientReference == reference
                        && s.PolicyOwnerId == rolePlayerId);
                return Mapper.Map<PolicyModel>(policy);
            }
        }

        public async Task<PagedRequestResult<PolicyModel>> GetAllPoliciesForMember(PagedRequest pagedRequest)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            if (pagedRequest == null)
            {
                throw new NullReferenceException("PagedRequest cannot be null");
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var searchResult = await _policyRepository.SqlQueryAsync<PolicyModel>(
                    DatabaseConstants.GetPoliciesForBroker,
                    new SqlParameter("UserId", Convert.ToInt32(pagedRequest.SearchCriteria)));

                int itemCount = 0;
                foreach (var policy in searchResult)
                {
                    var policyLifeExtension = await _policyLifeRepository.Where(p => p.PolicyId == policy.PolicyId).FirstOrDefaultAsync();
                    if (policyLifeExtension != null)
                    {
                        policy.PolicyLifeExtension = new PolicyLifeExtension
                        {
                            AffordabilityCheckFailReason = policyLifeExtension.AffordabilityCheckFailReason,
                            AffordabilityCheckPassed = policyLifeExtension.AffordabilityCheckPassed,
                            AnnualIncreaseMonth = policyLifeExtension.AnnualIncreaseMonth,
                            AnnualIncreaseType = policyLifeExtension.AnnualIncreaseType,
                            CreatedBy = policyLifeExtension.CreatedBy,
                            CreatedDate = policyLifeExtension.CreatedDate,
                            IsDeleted = policyLifeExtension.IsDeleted,
                            IsEuropAssistExtended = policyLifeExtension.IsEuropAssistExtended,
                            ModifiedBy = policyLifeExtension.ModifiedBy,
                            ModifiedDate = policyLifeExtension.ModifiedDate,
                            PolicyId = policyLifeExtension.PolicyId,
                            PolicyLifeExtensionId = policyLifeExtension.PolicyLifeExtensionId
                        };
                        searchResult[itemCount].PolicyLifeExtension = policy.PolicyLifeExtension;
                    }
                    itemCount++;
                }

                return new PagedRequestResult<PolicyModel>()
                {
                    Page = pagedRequest.Page,
                    PageCount = searchResult.Count,
                    RowCount = searchResult.Count,
                    PageSize = pagedRequest.PageSize,

                    Data = searchResult
                };
            }
        }

        public async Task<PagedRequestResult<ExternalPartnerPolicyData>> SearchExternalPartnerPolicies(PagedRequest pagedRequest)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            if (pagedRequest == null)
            {
                throw new NullReferenceException("PagedRequest cannot be null");
            }
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("PageNumber", pagedRequest.Page),
                    new SqlParameter("RowsOfPage", pagedRequest.PageSize),
                    new SqlParameter("SortingCol", pagedRequest.OrderBy),
                    new SqlParameter("SortType", pagedRequest.IsAscending ? "ASC" : "DESC"),
                    new SqlParameter("SearchCreatia", pagedRequest.SearchCriteria == null ? string.Empty : pagedRequest.SearchCriteria),
                    new SqlParameter("RecordCount", SqlDbType.Int),
                };
                parameters[5].Direction = ParameterDirection.Output;

                var searchResult = await _policyRepository.SqlQueryAsync<ExternalPartnerPolicyData>(DatabaseConstants.GetExternalPartnerPolicyData, parameters);

                var recordCount = (int)parameters[5].Value;

                var results = new PagedRequestResult<ExternalPartnerPolicyData>()
                {
                    Page = pagedRequest.Page,
                    PageCount = searchResult.Count,
                    RowCount = recordCount,
                    PageSize = pagedRequest.PageSize,
                    Data = searchResult.OrderByDescending(a => a.Id).ToList()
                };

                return results;
            }

        }

        public async Task<List<PolicyModel>> GetPoliciesForMember(int memberId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var searchResult = await _policyRepository.SqlQueryAsync<PolicyModel>(
                    DatabaseConstants.GetPoliciesForBroker,
                    new SqlParameter("UserId", memberId));

                return searchResult;
            }
        }

        public async Task<int> SendPolicyInformationDocument(PolicyModel policyModel)
        {
            Contract.Requires(policyModel != null);
            _parameters = $"&PolicyId={policyModel.PolicyId}&rs:Command=ClearSession";

            var environment = await _configurationService.GetModuleSetting("Environment");

            _headerCollection = new WebHeaderCollection
            {
                {"Authorization", "Bearer " + RmaIdentity.AccessToken},
                {SystemSettings.Environment, environment}
            };

            return await SendPolicyInformationDocumentByEmail(policyModel);
        }

        private async Task<int> SendPolicyInformationDocumentByEmail(PolicyModel policyModel)
        {
            _fromAddress =
                await _configurationService.GetModuleSetting(SystemSettings.PolicyManagerEmailNotificationSender);
            _reportserverUrl =
                $"{await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl)}RMA.Reports.ClientCare.Policy";
            var policyInformationDocument = await GetUriDocumentByteData(
                new Uri($"{_reportserverUrl}/RMAFuneralPolicyInformationReport{_parameters}&rs:Format=PDF"), _headerCollection);

            var attachments = new List<MailAttachment>
            {
                new MailAttachment
                {
                    AttachmentByteData = policyInformationDocument,
                    FileName = "PolicyInformationDocument.pdf",
                    FileType = "application/pdf"
                },
            };

            var emailBody = (await _configurationService.GetModuleSetting(SystemSettings.MemberPortalPolicyInformationReport));

            var result = await _sendEmailService.SendEmail(new SendMailRequest
            {
                ItemId = policyModel.PolicyId,
                ItemType = "Policy",
                FromAddress = _fromAddress,
                Recipients = policyModel.PolicyOwner.EmailAddress,
                RecipientsCC = null,
                Subject = $"Policy Information: {policyModel.PolicyNumber}",
                Body = emailBody.Replace("{0}", policyModel.ClientName)
                    .Replace("{1}", policyModel.PolicyNumber),
                IsHtml = true,
                Attachments = attachments.ToArray()
            });

            return result;
        }

        private async Task<byte[]> GetUriDocumentByteData(Uri url, WebHeaderCollection webHeaderCollection = null)
        {
            return await url.GetUriDataAsync(webHeaderCollection);
        }

        public async Task<List<string>> GetCompaniesWithPolicy()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await _clientCompanyRepository.SqlQueryAsync<string>(DatabaseConstants.GetCompaniesWithPolicies);
            }
        }

        public async Task<List<Company>> GetFuneralPolicyCompanies()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var productClass = new ProductClassEnum[]
                {
                    ProductClassEnum.Assistance,
                    ProductClassEnum.Life
                };
                var companies = await (
                    from c in _clientCompanyRepository
                    join p in _policyRepository on c.RolePlayerId equals p.PolicyOwnerId
                    join po in _productOptionRepository on p.ProductOptionId equals po.Id
                    join pr in _productRepository on po.ProductId equals pr.Id
                    where p.PolicyStatus != PolicyStatusEnum.Cancelled
                        && productClass.Contains(pr.ProductClass)
                    select c
                ).ToListAsync();
                return Mapper.Map<List<Company>>(companies.OrderBy(c => c.Name));
            }
        }

        public async Task<List<string>> GetCompaniesWithPolicyForBroker(string brokerName)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await _clientCompanyRepository.SqlQueryAsync<string>(DatabaseConstants.GetCompaniesWithPoliciesForBroker,
                    new SqlParameter("@brokerName", brokerName));
            }
        }

        public async Task<bool> LapsePolicy(string policyNumber, DateTime lapseDate)
        {
            RmaIdentity.DemandPermission(Permissions.BulkLapsePolicies);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policy = await _policyRepository.SingleOrDefaultAsync(p => p.PolicyNumber == policyNumber);
                if (policy is null)
                {
                    throw new Exception($"Could not find policy with policy number {policyNumber}");
                }
                else if (policy.PolicyStatus == PolicyStatusEnum.Lapsed)
                {
                    throw new Exception($"Policy {policyNumber} already in a lapsed status. Last lapsed date {policy.LastLapsedDate?.ToString("yyyy-MM-dd")}.");
                }
                await _policyRepository.LoadAsync(policy, t => t.PolicyOwner);
                await this._policyRepository.ExecuteSqlCommandAsync(
                    DatabaseConstants.MarkPolicyAsLapsed,
                        new SqlParameter("@policyId", policy.PolicyId),
                        new SqlParameter("@lapseDate", lapseDate.ToString("yyyy-MM-dd")),
                        new SqlParameter("@userId", RmaIdentity.Email)
                );

                var policyCommunication = new PolicyCommunication
                {
                    PolicyId = policy.PolicyId,
                    PolicyNumber = policy.PolicyNumber,
                    DisplayName = policy.PolicyOwner.DisplayName,
                    CellNumber = policy.PolicyOwner.CellNumber,
                    EmailAddress = policy.PolicyOwner.EmailAddress,
                    PreferredCommunicationTypeId = policy.PolicyOwner.PreferredCommunicationTypeId,
                    TellNumber = policy.PolicyOwner.TellNumber,
                    CCEmail = string.Empty
                };
                _ = Task.Run(() => _communicationService.SendLapseCommunication(policyCommunication));

                policy = await _policyRepository.FindByIdAsync(policy.PolicyId);
                return policy?.PolicyStatus == PolicyStatusEnum.Lapsed;
            }
        }

        public async Task<bool> CancelPolicy(string policyNumber, DateTime cancelDate, PolicyCancelReasonEnum cancelReason)
        {
            RmaIdentity.DemandPermission(Permissions.BulkCancelPolicies);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var policy = await _policyRepository.SingleOrDefaultAsync(p => p.PolicyNumber == policyNumber);
                if (policy is null)
                {
                    throw new Exception($"Could not find policy with policy number {policyNumber}");
                }

                var cancelledStatuses = new PolicyStatusEnum[] { PolicyStatusEnum.PendingCancelled, PolicyStatusEnum.Cancelled };
                if (cancelledStatuses.Contains(policy.PolicyStatus))
                {
                    throw new Exception($"Policy {policyNumber} has already been cancelled");
                }

                policy.CancellationInitiatedBy = RmaIdentity.Email;
                policy.CancellationInitiatedDate = DateTimeHelper.SaNow;
                policy.CancellationDate = cancelDate.ToSaDateTime().Date;
                policy.PolicyStatus = PolicyStatusEnum.PendingCancelled;
                policy.PolicyCancelReason = cancelReason;
                _policyRepository.Update(policy);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                if (policy.PaymentMethod == PaymentMethodEnum.GovernmentSalaryDeduction)
                    await _qlinkService.ProcessQlinkTransactionAsync(new List<string> { policy.PolicyNumber }, QLinkTransactionTypeEnum.QDEL, true);


                await CancelChildPolicies(policy.PolicyId, cancelDate, cancelReason);

                _ = Task.Run(() => SendPolicyCancellationMessage(policy.PolicyId));

                if (policy.PaymentMethod == PaymentMethodEnum.GovernmentSalaryDeduction)
                {
                    await _qlinkService.ProcessQlinkTransactionAsync(new List<string> { policyNumber }, QLinkTransactionTypeEnum.QDEL, false);
                }

                return cancelledStatuses.Contains(policy.PolicyStatus);
            }
        }

        private async Task SendPolicyCancellationMessage(int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var @case = await _caseService.GetCaseByPolicyId(policyId);
                await _communicationService.SendPolicyCancellationCommunication(@case);
            }
        }

        private async Task CancelChildPolicies(int policyId, DateTime cancelDate, PolicyCancelReasonEnum cancelReason)
        {
            using (_dbContextScopeFactory.Create())
            {
                // Execute in a scripts, because it could be thousands of policies
                await _policyRepository.ExecuteSqlCommandAsync(
                    DatabaseConstants.CancelGroupChildPolicies,
                    new SqlParameter("@parentPolicyId", policyId),
                    new SqlParameter("@userId", RmaIdentity.Email),
                    new SqlParameter("@cancelDate", cancelDate),
                    new SqlParameter("@cancelReason", (int)cancelReason)
                );
            }
        }

        public async Task<bool> ReinstatePolicy(string policyNumber, DateTime reinstateDate)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            var reInstated = false;
            var policyId = 0;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var policy = await _policyRepository
                    .SingleOrDefaultAsync(
                        p => p.PolicyNumber == policyNumber
                    );

                if (policy == null)
                    throw new Exception($"Could not find policy with policy number {policyNumber}");
                if (policy.PolicyStatus != PolicyStatusEnum.Lapsed)
                    throw new Exception($"Policy {policyNumber} cannot be reinstated from status {policy.PolicyStatus}");

                // Check if the policy has been reinstated within the last x months
                var setting = await _configurationService.GetModuleSetting(this.reinstateForbiddenMonths);
                if (!int.TryParse(setting, out int months))
                {
                    months = defaultMonths;
                }
                var cutoff = DateTime.Today.AddMonths(-months).Date;
                var lastReinstateDate = policy.LastReinstateDate;
                if (lastReinstateDate != null && lastReinstateDate.Value > cutoff)
                {
                    throw new Exception($"The policy has been reinstated within the last {months} months on {lastReinstateDate.Value:yyyy-MM-dd}");
                }

                // PendingReinstatement the policy
                policy.PolicyStatus = PolicyStatusEnum.Reinstated;
                policy.LastReinstateDate = reinstateDate.Date;

                // Add a policy note
                if (policy.PolicyNotes == null)
                {
                    policy.PolicyNotes = new List<policy_PolicyNote>();
                }
                policy.PolicyNotes.Add(
                    new policy_PolicyNote
                    {
                        PolicyId = policy.PolicyId,
                        Text = $"Policy reinstated via bulk policy reinstatement",
                        IsDeleted = false
                    }
                );

                _policyRepository.Update(policy);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                policyId = policy.PolicyId;
                reInstated = policy.PolicyStatus == PolicyStatusEnum.PendingReinstatement;
            }

            if (await _configurationService.IsFeatureFlagSettingEnabled(SendCommunicationForReinstated))
            {
                if (reInstated)
                {
                    var @case = await _caseService.GetCaseByPolicyId(policyId);
                    _ = Task.Run(() => _communicationService.SendPolicyReinstatedMessages(@case, reinstateDate.ToSaDateTime()));
                }
            }

            return reInstated;
        }

        public async Task<PolicyModel> GetPolicyByQuoteId(int quoteId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _policyRepository.FirstOrDefaultAsync(s => s.QuoteId == quoteId);
                if (entity != null)
                {
                    await _policyRepository.LoadAsync(entity, d => d.PolicyInsuredLives);
                    if (entity.PolicyInsuredLives.Count == 0)
                        return Mapper.Map<PolicyModel>(entity);
                    var policy = Mapper.Map<PolicyModel>(entity);
                    foreach (var insuredLife in policy.PolicyInsuredLives)
                    {
                        var rolePlayer =
                            await _rolePlayerRepository.FirstOrDefaultAsync(r =>
                                r.RolePlayerId == insuredLife.RolePlayerId);
                        await _rolePlayerRepository.LoadAsync(rolePlayer, a => a.Person);
                        insuredLife.RolePlayer = Mapper.Map<Roleplayer>(rolePlayer);
                    }
                    return policy;
                }
                return Mapper.Map<PolicyModel>(entity);


            }
        }

        public async Task<VapsPolicyDetails> GetVapsPolicyDetails(string policyNumber)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            var insuredLives = new List<InsuredLifeResponse>();

            List<int> eligibleRolePlayerTypes = new List<int> { (int)InsuredLifeRolePlayerTypeEnum.MainMemberself, (int)InsuredLifeRolePlayerTypeEnum.Spouse, (int)InsuredLifeRolePlayerTypeEnum.Child };

            List<PolicyStatusEnum> activePolicyStatuses = new List<PolicyStatusEnum>
            {
                PolicyStatusEnum.Active,
                PolicyStatusEnum.Transferred,
                PolicyStatusEnum.PendingFirstPremium,
                PolicyStatusEnum.Continued,
                PolicyStatusEnum.Reinstated,
                PolicyStatusEnum.PremiumWaivered
            };

            var vapsPolicyDetails = new VapsPolicyDetails()
            {
                ErrorMessage = string.Empty,
                PolicyInceptionDate = null
            };

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policy = await _policyRepository.Where(p => p.PolicyNumber == policyNumber && p.IsEuropAssist && activePolicyStatuses.Contains(p.PolicyStatus)).FirstOrDefaultAsync();

                if (policy != null)
                {
                    var isCFP = false;
                    var lifeExtension = await GetPolicyLifeExtension(policy.PolicyId);
                    if (lifeExtension != null)
                        isCFP = true;

                    var eligibleMembers = await _policyInsuredLifeRepository.Where(p => p.PolicyId == policy.PolicyId && p.EndDate == null && eligibleRolePlayerTypes.Contains(p.RolePlayerTypeId)).ToListAsync();

                    if (eligibleMembers?.Count > 0)
                    {
                        foreach (var insured in eligibleMembers)
                        {
                            var person = await _personRepository.FirstOrDefaultAsync(p => p.RolePlayerId == insured.RolePlayerId);
                            if (person != null)
                            {
                                insuredLives.Add(new InsuredLifeResponse()
                                {
                                    InsuredLifeUniqueIdentifier = person.RolePlayerId,
                                    RelationShip = (InsuredLifeRolePlayerTypeEnum)insured.RolePlayerTypeId,
                                    FirstName = person.FirstName,
                                    Surname = person.Surname,
                                    DateOfBirth = person.DateOfBirth
                                });
                            }
                        }
                    }

                    vapsPolicyDetails.ErrorMessage = insuredLives.Count > 0 ? string.Empty : $"No insured members found for policy: {policyNumber}";
                    vapsPolicyDetails.PolicyNumber = policy.PolicyNumber;
                    vapsPolicyDetails.PolicyInceptionDate = policy.PolicyInceptionDate;
                    vapsPolicyDetails.EuropAssistEffectiveDate = isCFP ? policy.PolicyInceptionDate : policy.EuropAssistEffectiveDate;
                    vapsPolicyDetails.EuropAssistEndDate = isCFP ? null : policy.EuropAssistEndDate;
                    vapsPolicyDetails.InsuredLives = insuredLives;
                }
                else
                {
                    vapsPolicyDetails.ErrorMessage = $"No active policy found matching: {policyNumber}";
                }

                // TO DO: Log all EuropAssist API requests and data sent back to EuropAssist for audit purposes

                return vapsPolicyDetails;
            }
        }

        public async Task<List<PolicyModel>> GetPoliciesWithStatus(PolicyStatusEnum policyStatus)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = await _policyRepository.Where(a => a.PolicyStatus == policyStatus).ToListAsync();
                await _policyRepository.LoadAsync(policies, p => p.ProductOption);
                await _policyRepository.LoadAsync(policies, p => p.PolicyOwner);

                foreach (var policy in policies)
                {
                    await _rolePlayerRepository.LoadAsync(policy.PolicyOwner, s => s.FinPayee);
                    await _rolePlayerRepository.LoadAsync(policy.PolicyOwner, s => s.Declarations);
                }

                return Mapper.Map<List<PolicyModel>>(policies);
            }
        }

        public async Task<PagedRequestResult<PolicyModel>> GetChildPolicies(PagedRequest pagedRequest)
        {
            Contract.Requires(pagedRequest != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var values = pagedRequest.SearchCriteria.Split(new char[] { ',' });
                var parentPolicyId = int.Parse(values[0]);
                string search = (values.Length > 1) ? values[1] : null;

                var policies = new PagedRequestResult<policy_Policy>();
                var validStatus = new PolicyStatusEnum[] {
                    PolicyStatusEnum.Active,
                    PolicyStatusEnum.Continued,
                    PolicyStatusEnum.Reinstated,
                    PolicyStatusEnum.PendingContinuation
                };

                policies = await _policyRepository
                    .Where(p => p.ParentPolicyId == parentPolicyId
                             && validStatus.Contains(p.PolicyStatus)
                             && (search == null || p.PolicyNumber.Contains(search)))
                    .ToPagedResult(pagedRequest);
                await _policyRepository.LoadAsync(policies.Data, p => p.PolicyOwner);

                var data = Mapper.Map<List<PolicyModel>>(policies.Data);
                return new PagedRequestResult<PolicyModel>()
                {
                    PageSize = policies.PageSize,
                    Page = policies.Page,
                    PageCount = policies.PageCount,
                    RowCount = policies.RowCount,
                    Data = data
                };
            }
        }

        public async Task<List<int>> GetChildPolicyIds(int parentPolicyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var validStatus = new PolicyStatusEnum[] {
                    PolicyStatusEnum.Active,
                    PolicyStatusEnum.Continued,
                    PolicyStatusEnum.Reinstated,
                    PolicyStatusEnum.PendingContinuation
                };
                var policies = await _policyRepository
                    .Where(p => p.ParentPolicyId == parentPolicyId
                             && validStatus.Contains(p.PolicyStatus))
                    .ToListAsync();
                return policies.Select(p => p.PolicyId).Distinct().ToList();
            }
        }

        public async Task<List<PolicyMinimumData>> GetChildPoliciesMinimumData(int parentPolicyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var validStatus = new PolicyStatusEnum[] {
                    PolicyStatusEnum.Active,
                    PolicyStatusEnum.Continued,
                    PolicyStatusEnum.Reinstated,
                    PolicyStatusEnum.PendingContinuation
                };
                var policies = await (from p in _policyRepository.Where(p => p.ParentPolicyId == parentPolicyId && validStatus.Contains(p.PolicyStatus))
                                      join il in _policyInsuredLifeRepository on new { p.PolicyId } equals new { il.PolicyId }
                                      join per in _personRepository on new { il.RolePlayerId } equals new { per.RolePlayerId }
                                      where p.ParentPolicyId == parentPolicyId
                                         && il.RolePlayerTypeId == (int)RolePlayerTypeEnum.MainMemberSelf

                                      select new PolicyMinimumData
                                      {
                                          PolicyId = p.PolicyId,
                                          PolicyNumber = p.PolicyNumber,
                                          DisplayName = per.FirstName + " " + per.Surname,
                                          IdNumber = per.IdNumber,
                                          PolicyStatus = p.PolicyStatus,
                                          InstallmentPremium = p.InstallmentPremium,
                                          policyCancelReasonEnum = p.PolicyCancelReason
                                      }
                                    ).Distinct().ToListAsync();

                return policies;

            }
        }

        public async Task UpdatePolciesStatus(List<PolicyModel> policies, PolicyStatusEnum policyStatus)
        {
            Contract.Requires(policies != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            using (var scope = _dbContextScopeFactory.Create())
            {
                foreach (var policy in policies)
                {
                    policy.PolicyStatus = policyStatus;
                }

                _policyRepository.Update(Mapper.Map<List<policy_Policy>>(policies));
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task UploadInsuredLives(List<UploadInsuredLife> insuredLives)
        {
            Contract.Requires(insuredLives != null);

            int successUploadCount = 0;
            int failedUploadCount = 0;
            List<string> failedMessages = new List<string>();

            foreach (var insuredLife in insuredLives)
            {
                string insuredLifeName = string.Empty;
                try
                {
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        var finPayee = insuredLife.FinPayee;
                        var policies = insuredLife.RolePlayerPolicies;

                        //Roleplayer
                        Roleplayer rolePlayer = new Roleplayer();
                        rolePlayer.DisplayName = insuredLife.FirstName + " " + insuredLife.Surname;
                        rolePlayer.CellNumber = insuredLife.CellNumber;
                        rolePlayer.PreferredCommunicationTypeId = (int)CommunicationTypeEnum.Phone;
                        rolePlayer.RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;

                        //Person
                        Person person = new Person();
                        person.FirstName = insuredLife.FirstName;
                        person.Surname = insuredLife.Surname;
                        insuredLifeName = insuredLife.FirstName + " " + insuredLife.Surname;
                        if (!string.IsNullOrEmpty(insuredLife.IdNumber))
                        {
                            person.IdType = IdTypeEnum.SAIDDocument;
                            person.IdNumber = insuredLife.IdNumber;
                        }
                        else if (!string.IsNullOrEmpty(insuredLife.Passport))
                        {
                            person.IdType = IdTypeEnum.PassportDocument;
                            person.PassportNumber = insuredLife.Passport;
                        }
                        person.IsAlive = true;
                        person.DateOfBirth = GetDOBFromID(insuredLife.IdNumber);

                        Enum.TryParse(insuredLife.Gender, true, out GenderEnum gender);
                        person.Gender = gender;

                        Enum.TryParse(insuredLife.Nationality, true, out NationalityEnum nationality);
                        person.Nationality = nationality;
                        rolePlayer.Person = person;

                        List<Roleplayer> rolePlayers = new List<Roleplayer>();
                        rolePlayers.Add(rolePlayer);

                        foreach (var policy in policies)
                        {
                            var policyID = policy.PolicyId;
                            var members = await AddRolePlayers(policyID, finPayee.RolePlayerId, rolePlayers, RolePlayerTypeEnum.InsuredLife);

                            foreach (var member in members)
                            {
                                PolicyInsuredLife policyInsuredLife = new PolicyInsuredLife();
                                policyInsuredLife.PolicyId = policyID;
                                policyInsuredLife.RolePlayerId = member.RolePlayerId;
                                policyInsuredLife.RolePlayerTypeId = (int)InsuredLifeRolePlayerTypeEnum.InsuredLife;

                                await CreatePolicyInsuredLifeJoinExisting(policyInsuredLife);
                            }
                        }
                        await scope.SaveChangesAsync().ConfigureAwait(false);
                        successUploadCount++;
                    }
                }
                catch (Exception ex)
                {
                    failedUploadCount++;
                    failedMessages.Add(insuredLifeName + " - " + ex.Message);
                }
            }

            await _communicationService.SendInsuredLifeUploadMessages(successUploadCount, failedUploadCount, failedMessages);
        }

        public async Task<List<Dashboard>> GetActiveMembers()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<Dashboard>(
                    DatabaseConstants.ActiveNumberOfMembers);
            }
        }

        public async Task<List<Dashboard>> GetAmountInvoiced()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<Dashboard>(
                    DatabaseConstants.AmountInvoiced);
            }
        }

        public async Task<List<Dashboard>> GetNONCoidMetalMembersPerProduct()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<Dashboard>(
                    DatabaseConstants.NONCoidMetalMembersPerProduct);
            }
        }

        public async Task<List<Dashboard>> GetNONCoidMetalMembersPerMonth()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<Dashboard>(
                    DatabaseConstants.NONCoidMetalMembersPerMonth);
            }
        }

        public async Task<List<Dashboard>> GetNONCoidMiningMembersPerProduct()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<Dashboard>(
                    DatabaseConstants.NONCoidMiningMembersPerProduct);
            }
        }

        public async Task<List<Dashboard>> GetNONCoidMiningMembersPerMonth()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<Dashboard>(
                    DatabaseConstants.NONCoidMiningMembersPerMonth);
            }
        }

        public async Task<List<Dashboard>> GetActiveNumberOfMembersCLASSXIII()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<Dashboard>(
                    DatabaseConstants.ActiveNumberOfMembersCLASSXIII);
            }
        }

        public async Task<List<Dashboard>> GetAmountInvoicedCLASSXIII()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<Dashboard>(
                    DatabaseConstants.AmountInvoicedCLASSXIII);
            }
        }

        public async Task<List<Dashboard>> GetAmountPaidCLASSXIII()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<Dashboard>(
                    DatabaseConstants.AmountPaidCLASSXIII);
            }
        }

        public async Task<List<Dashboard>> GetAmountPaidCLASSIV()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<Dashboard>(
                    DatabaseConstants.AmountPaidCLASSIV);
            }
        }

        public async Task<List<Dashboard>> GetNumberOFLivesCLASSXIII()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<Dashboard>(
                    DatabaseConstants.NumberOFLivesCLASSXIII);
            }
        }

        public async Task<List<Dashboard>> GetNumberOFLivesCLASSIV()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<Dashboard>(
                    DatabaseConstants.NumberOFLivesCLASSIV);
            }
        }

        public async Task<List<Dashboard>> GetNewBusinessCOIDPoliciesCLASSXIII()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<Dashboard>(
                    DatabaseConstants.NewBusinessCOIDPoliciesCLASSXIII);
            }
        }

        public async Task<List<Dashboard>> GetNewBusinessCOIDPoliciesCLASSIV()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<Dashboard>(
                    DatabaseConstants.NewBusinessCOIDPoliciesCLASSIV);
            }
        }

        public async Task<List<Dashboard>> GetMembersPerIndustryClassXIII()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<Dashboard>(
                    DatabaseConstants.MembersPerIndustryClassXIII);
            }
        }

        public async Task<List<Dashboard>> GetCancellationsCLASSXIII()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<Dashboard>(
                    DatabaseConstants.CancellationsCLASSXIII);
            }
        }

        private DateTime GetDOBFromID(string idNumber)
        {
            DateTime DOB = new DateTime();
            if (!string.IsNullOrEmpty(idNumber) && idNumber.Length >= 12)
            {
                var birthDate = idNumber.Substring(0, 6);
                var yy = birthDate.Substring(0, 2);
                var mm = birthDate.Substring(2, 2);
                var dd = birthDate.Substring(4, 2);
                var yyyy = (Convert.ToInt32(yy) < 30) ? "20" + yy : "19" + yy;
                DOB = new DateTime(Convert.ToInt32(yyyy), Convert.ToInt32(mm), Convert.ToInt32(dd));
            }
            return DOB;
        }

        public async Task<List<Lookup>> GetPolicyInsurerLookup()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await (from insurer in _policyInsurerRepository
                                  where !insurer.IsDeleted
                                  select new Lookup
                                  {
                                      Id = insurer.Id,
                                      Name = insurer.Name
                                  }
                    )
                    .OrderBy(i => i.Name)
                    .ToListAsync();
                return data;
            }
        }

        public async Task<int> CreatePolicyMovement(string movementRefNo, int sourceBrokerageId, int sourceRepresentativeId, int targetBrokerageId, int targetRrepresentativeId, DateTime effectiveDate)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var movement = new policy_PolicyMovement
                {
                    MovementRefNo = movementRefNo,
                    SourceBrokerageId = sourceBrokerageId,
                    SourceRepId = sourceRepresentativeId,
                    DestinationBrokerageId = targetBrokerageId,
                    DestinationRepId = targetRrepresentativeId,
                    EffectiveDate = effectiveDate
                };
                _policyMovementRepository.Create(movement);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return movement.PolicyMovementId;
            }
        }

        public async Task<ChildCover> GetChildCover(int age)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _policyChildCoverRepository
                    .FirstOrDefaultAsync(c => c.IsActive
                                           && !c.IsDeleted
                                           && c.StartingAge >= age
                                           && c.EndingAge <= age);
                return Mapper.Map<ChildCover>(entity);
            }
        }

        public async Task<ProductOptionModel> GetPolicyProductOption(int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await (
                        from p in _policyRepository
                        join po in _productOptionRepository
                            on p.ProductOptionId equals po.Id
                        where p.PolicyId == policyId
                        select po)
                    .SingleOrDefaultAsync();
                if (data is null) return new ProductOptionModel();
                var productOption = Mapper.Map<ProductOptionModel>(data);
                var benefits = await (
                        from p in _policyRepository
                        join pil in _policyInsuredLifeRepository
                            on p.PolicyId equals pil.PolicyId
                        join b in _benefitRepository
                            on pil.StatedBenefitId equals b.Id
                        where (p.ParentPolicyId == policyId || p.PolicyId == policyId)
                           && b.Id > 0
                        select b)
                    .Distinct()
                    .OrderBy(b => b.CoverMemberType)
                    .ToListAsync();
                productOption.Benefits = Mapper.Map<List<Contracts.Entities.Product.Benefit>>(benefits);
                return productOption;
            }
        }

        public async Task<List<BenefitModel>> GetBenefitsForSelectedPolicies(UpgradeDownGradePolicyCase policyCase)
        {
            Contract.Requires(policyCase != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                List<BenefitModel> benefits = null;
                if (policyCase.SelectAllPolicies)
                {
                    benefits = await GetPolicyBenefits(policyCase.PolicyId);
                }
                else
                {
                    benefits = await GetChildPolicyBenefits(policyCase.SelectedPolicyIds);
                }
                return benefits;
            }
        }

        private async Task<List<BenefitModel>> GetPolicyBenefits(int parentPolicyId)
        {
            var benefits = await _benefitRepository
                .SqlQueryAsync<BenefitModel>(DatabaseConstants.GetBenefitsForParentPolicy,
                    new SqlParameter("@parentPolicyId", parentPolicyId)
                );
            return benefits;
        }

        private async Task<List<BenefitModel>> GetChildPolicyBenefits(List<int> selectedPolicyIds)
        {
            string json = JsonConvert.SerializeObject(selectedPolicyIds);
            var benefits = await _benefitRepository
                .SqlQueryAsync<BenefitModel>(DatabaseConstants.GetBenefitsForChildPolicies,
                    new SqlParameter("@policyIds", json)
                );
            return benefits;
        }

        public async Task UpgradeDowngradePolicy(UpgradeDownGradePolicyCase @case)
        {
            Contract.Requires(@case != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (@case.SelectAllPolicies)
                {
                    CreatePolicyChangeRequest(
                        @case.PolicyId,
                        @case.ProductOption.After,
                        @case.EffectiveDate.ToSaDateTime(),
                        @case.Benefits
                    );
                }
                else
                {
                    foreach (var policyId in @case.SelectedPolicyIds)
                    {
                        CreatePolicyChangeRequest(
                            policyId,
                            @case.ProductOption.After,
                            @case.EffectiveDate.ToSaDateTime(),
                            @case.Benefits
                        );
                    }
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private void CreatePolicyChangeRequest(int policyId, int productOptionId, DateTime effectiveDate, List<ChangePolicyOption> benefits)
        {
            var changeProduct = new PolicyChangeProduct
            {
                PolicyId = policyId,
                EffectiveDate = effectiveDate,
                ProductOptionId = productOptionId,
                PolicyChangeStatus = PolicyChangeStatusEnum.Pending,
                IsDeleted = false
            };
            if (changeProduct.PolicyChangeBenefits is null)
            {
                changeProduct.PolicyChangeBenefits = new List<PolicyChangeBenefit>();
            }
            foreach (var benefit in benefits)
            {
                var changeBenefit = new PolicyChangeBenefit
                {
                    PolicyChangeProductId = 0,
                    OldBenefitId = benefit.Before,
                    NewBenefitId = benefit.After,
                    IsDeleted = false
                };
                changeProduct.PolicyChangeBenefits.Add(changeBenefit);
            }
            _changePolicyProductRepository.Create(Mapper.Map<policy_PolicyChangeProduct>(changeProduct));
        }

        public async Task<int> UpgradeDowngradePolicies()
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var count = 0;
                var tomorrow = DateTime.Today.AddDays(1);
                var policies = await _changePolicyProductRepository
                    .Where(p => p.EffectiveDate <= tomorrow
                             && p.PolicyChangeStatus == PolicyChangeStatusEnum.Pending
                             && p.IsDeleted == false)
                    .ToListAsync();
                foreach (var policy in policies)
                {
                    await _policyRepository.ExecuteSqlCommandAsync(
                        DatabaseConstants.UpgradeDowngradeGroupPolicy,
                        new SqlParameter("@policyChangeProductId", policy.PolicyChangeProductId),
                        new SqlParameter("@userId", policy.ModifiedBy)
                    );
                    policy.PolicyChangeStatus = PolicyChangeStatusEnum.Completed;
                    _changePolicyProductRepository.Update(policy);
                    count++;
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return count;
            }
        }

        public async Task<List<CompanyPolicy>> GetCompaniesWithLinkedPolicy()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await _clientCompanyRepository.SqlQueryAsync<CompanyPolicy>(DatabaseConstants.GetCompaniesWithPolicy);
            }
        }

        public async Task<PagedRequestResult<CompanyPolicy>> SearchCompaniesWithPolicy(PagedRequest pagedRequest)
        {
            Contract.Requires(pagedRequest != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                int recordCount = 0;
                var parameters = new[] {
                new SqlParameter("Filter", pagedRequest.SearchCriteria),
                    new SqlParameter("ShowActive", true),
                    new SqlParameter("pageNumber", pagedRequest.Page),
                    new SqlParameter("pageSize", pagedRequest.PageSize),
                    new SqlParameter("recordCount", SqlDbType.BigInt) { Direction = ParameterDirection.Output}
                };

                var searchResult = await _clientCompanyRepository.SqlQueryAsync<CompanyPolicy>(
                    DatabaseConstants.SearchCompaniesWithPolicy, parameters);

                recordCount = Convert.ToInt32(parameters[5]?.Value);

                var propertyInfo =
                    typeof(CompanyPolicy).GetProperty(pagedRequest.OrderBy.Substring(0, 1).ToUpper() +
                                                            pagedRequest.OrderBy.Substring(1));
                Func<CompanyPolicy, object> keySelector = i => propertyInfo.GetValue(i, null);

                var result = pagedRequest.IsAscending
                    ? searchResult.OrderBy(keySelector)
                    : searchResult.OrderByDescending(keySelector);

                return new PagedRequestResult<CompanyPolicy>()
                {
                    Page = pagedRequest.Page,
                    PageCount = searchResult.Count,
                    RowCount = recordCount,
                    PageSize = pagedRequest.PageSize,
                    Data = searchResult
                };
            }
        }

        public async Task<PagedRequestResult<PolicyGroupMember>> GetPagedChildPolicies(PagedRequest pagedRequest)
        {
            Contract.Requires(pagedRequest != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var values = pagedRequest.SearchCriteria.Split(new char[] { ',' });
                var policyId = Convert.ToInt32(values[0]);
                var childPolicySearch = values.Length > 1 ? values[1] : "";

                var policyMembers = await (from p in _policyRepository
                                           join il in _policyInsuredLifeRepository on new { p.PolicyId } equals new { il.PolicyId }
                                           join per in _personRepository on new { il.RolePlayerId } equals new { per.RolePlayerId }
                                           where p.ParentPolicyId == policyId
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
                                           })
                    .Where(s => childPolicySearch == ""
                             || s.PolicyNumber.Contains(childPolicySearch)
                             || s.ClientReference.Contains(childPolicySearch)
                             || s.IdNumber.Contains(childPolicySearch)
                             || s.MemberName.Contains(childPolicySearch)
                    )
                    .ToPagedResult(pagedRequest);

                return new PagedRequestResult<PolicyGroupMember>
                {
                    Data = policyMembers.Data,
                    RowCount = policyMembers.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(policyMembers.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task<PagedRequestResult<PolicyGroupMember>> GetPagedPolicyInsuredLives(PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);
                var policyId = Convert.ToInt32(pagedRequest.SearchCriteria);
                var policyMembers = await (from p in _policyRepository
                                           join il in _policyInsuredLifeRepository on p.PolicyId equals il.PolicyId
                                           join per in _personRepository on il.RolePlayerId equals per.RolePlayerId
                                           join br in _benefitRateRepository on il.StatedBenefitId equals br.BenefitId
                                           where p.PolicyId == policyId
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
                                               Premium = il.InsuredLifeStatus == InsuredLifeStatusEnum.Active ? il.Premium : 0.0M,
                                               CoverAmount = il.CoverAmount,
                                               StatedBenefitId = il.StatedBenefitId,
                                               BenefitRate = new BenefitRate
                                               {
                                                   Id = br.Id,
                                                   BenefitId = br.BenefitId,
                                                   BaseRate = br.BaseRate,
                                                   BenefitAmount = br.BenefitAmount,
                                                   EffectiveDate = br.EffectiveDate
                                               }
                                           }).ToPagedResult(pagedRequest);


                return new PagedRequestResult<PolicyGroupMember>
                {
                    Data = policyMembers.Data,
                    RowCount = policyMembers.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(policyMembers.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task<PagedRequestResult<PolicyNote>> GetPagedPolicyNotes(PagedRequest pagedRequest)
        {
            return await _policyNoteService.GetPagedPolicyNotes(pagedRequest);
        }

        public async Task<bool> UpdateAffordabilityCheck(AffordabilityCheck check)
        {
            Contract.Requires(check != null);
            bool processQlinkTransaction = false;
            bool policyLifeExtensionSaved = false;

            var policy = await GetPolicyWithoutReferenceData(check.PolicyId);

            var note = new Note()
            {
                ItemId = check.PolicyId
            };

            using (var scope = _dbContextScopeFactory.Create())
            {
                var policyLifeExtention = await _policyLifeRepository.SingleOrDefaultAsync(p => p.PolicyId == check.PolicyId);
                if (policyLifeExtention is null)
                {
                    throw new Exception(message: $"Could not find policy with CFP product with id {check.PolicyId}");
                }
                else
                {
                    note.Text = $"Affordability snapshot uploaded, Current Policy Status: {policy.PolicyStatus.DisplayAttributeValue()} IsAffordable :{check.IsAffordable} AffordabilityCheckFailReason: {check.AffordabilityCheckFailReason}";

                    if (policy.PolicyStatus == PolicyStatusEnum.PendingCancelled
                   || policy.PolicyStatus == PolicyStatusEnum.Cancelled
                   || policy.PolicyStatus == PolicyStatusEnum.Lapsed
                   || policy.PolicyStatus == PolicyStatusEnum.NotTakenUp
                   || policy.PolicyStatus == PolicyStatusEnum.Paused
           )
                    {
                        processQlinkTransaction = false;
                        policyLifeExtention.AffordabilityCheckFailReason = $"Current Policy Status is: {policy.PolicyStatus.DisplayAttributeValue()}";
                        note.Text = $"Affordability snapshot uploaded, QLinkTransaction QADD NOT triggerd, Current Policy Status: {policy.PolicyStatus.DisplayAttributeValue()}";
                    }
                    else
                    {
                        processQlinkTransaction = true;
                    }
                }

                policyLifeExtention.AffordabilityCheckPassed = processQlinkTransaction;
                _policyLifeRepository.Update(policyLifeExtention);
                policyLifeExtensionSaved = await scope.SaveChangesAsync() > 0;
            }

            if (processQlinkTransaction)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    _ = await _qlinkService.ProcessQlinkTransactionAsync(new List<string> { policy.PolicyNumber }, QLinkTransactionTypeEnum.QADD, true);
                    note.Text = $"Affordability snapshot uploaded, QLinkTransaction QADD triggerd, Current Policy Status: {policy.PolicyStatus.DisplayAttributeValue()}";
                    //TO DO: Send notification to Matla Life                      
                }
            }
            await _policyNoteService.AddNote(note);
            return policyLifeExtensionSaved;
        }

        public async Task<int> ActivateFreePolicies()
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var tomorrow = DateTime.Today.Date.AddDays(1);
                var policies = await _policyRepository
                    .Where(p => p.PolicyStatus == PolicyStatusEnum.FreeCover
                             && p.PolicyInceptionDate <= tomorrow)
                    .ToListAsync();
                foreach (var policy in policies)
                {
                    policy.PolicyStatus = PolicyStatusEnum.Active;
                    _policyRepository.Update(policy);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return policies.Count;
            }
        }

        public async Task<List<PolicyStatusChangeAudit>> GetPolicyStatusChangeAudits(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyStatusChangeAudits = await _policyStatusChangeAuditRepository.Where(a => a.PolicyId == policyId).ToListAsync();
                return Mapper.Map<List<PolicyStatusChangeAudit>>(policyStatusChangeAudits);
            }
        }

        public async Task<PagedRequestResult<PolicyStatusChangeAudit>> GetPagedPolicyStatusChangeAudit(PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);
                var policyId = Convert.ToInt32(pagedRequest.SearchCriteria);

                var policyStatusChangeAudits = await _policyStatusChangeAuditRepository.Where(p => p.PolicyId == policyId).ToPagedResult(pagedRequest);
                var data = Mapper.Map<List<PolicyStatusChangeAudit>>(policyStatusChangeAudits.Data);

                return new PagedRequestResult<PolicyStatusChangeAudit>()
                {
                    PageSize = policyStatusChangeAudits.PageSize,
                    Page = policyStatusChangeAudits.Page,
                    PageCount = policyStatusChangeAudits.PageCount,
                    RowCount = policyStatusChangeAudits.RowCount,
                    Data = data
                };
            }
        }

        public async Task<PolicyLifeExtension> GetPolicyLifeExtension(int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _policyLifeRepository.FirstOrDefaultAsync(x => x.PolicyId == policyId);
                return Mapper.Map<PolicyLifeExtension>(results);
            }
        }

        public async Task<int> GetChildPolicyCount(int parentPolicyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = await _policyRepository
                    .Where(p => p.ParentPolicyId == parentPolicyId)
                    .Select(p => p.PolicyId)
                    .ToListAsync();
                return policies.Count;
            }
        }

        public async Task<List<PolicyInsuredLife>> GetExtendedFamilyPolicy(int parentPolicyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = await _policyInsuredLifeRepository
                    .Where(p => p.PolicyId == parentPolicyId && p.InsuredLifeStatus == InsuredLifeStatusEnum.Active && p.RolePlayerTypeId == (int)InsuredLifeRolePlayerTypeEnum.Extended)
                    .ToListAsync();
                return Mapper.Map<List<PolicyInsuredLife>>(policies);
            }
        }

        public async Task<List<PolicyModel>> GetDependentPolicies(int parentPolicyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = await _policyRepository
                    .Where(p => p.ParentPolicyId == parentPolicyId)
                    .ToListAsync();
                return Mapper.Map<List<PolicyModel>>(policies);
            }
        }

        public async Task<PagedRequestResult<PolicyModel>> SearchPolicies(PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);

                var filter = !string.IsNullOrEmpty(pagedRequest.SearchCriteria) ? Convert.ToString(pagedRequest.SearchCriteria).Trim().ToUpper() : string.Empty;

                var policies = new PagedRequestResult<policy_Policy>();

                if (!string.IsNullOrEmpty(filter))
                {
                    var policyIds = await _policyRepository.SqlQueryAsync<int>(
                        DatabaseConstants.SearchPolicies,
                            new SqlParameter("@search", filter)
                    );
                    policies = await _policyRepository
                        .Where(p => policyIds.Contains(p.PolicyId))
                        .ToPagedResult(pagedRequest);
                }
                else
                {
                    policies = await (from policy in _policyRepository
                                      join roleplayer in _rolePlayerRepository
                                      on policy.PolicyOwnerId equals roleplayer.RolePlayerId
                                      join finpayee in _finPayeeRepository
                                      on roleplayer.RolePlayerId equals finpayee.RolePlayerId
                                      select policy).ToPagedResult(pagedRequest);
                }

                await _policyRepository.LoadAsync(policies.Data, t => t.PolicyOwner);
                await _policyRepository.LoadAsync(policies.Data, t => t.ProductOption);

                foreach (var policy in policies.Data)
                {
                    await _rolePlayerRepository.LoadAsync(policy.PolicyOwner, t => t.FinPayee);
                    await _rolePlayerRepository.LoadAsync(policy.PolicyOwner, t => t.Person);
                    await _rolePlayerRepository.LoadAsync(policy.PolicyOwner, t => t.Company);
                    await _rolePlayerRepository.LoadAsync(policy.PolicyOwner, t => t.HealthCareProvider);

                    await _productOptionRepository.LoadAsync(policy.ProductOption, p => p.Product);
                    await _productOptionRepository.LoadAsync(policy.ProductOption, p => p.ProductOptionSettings);
                }

                var data = Mapper.Map<List<PolicyModel>>(policies.Data);

                return new PagedRequestResult<PolicyModel>
                {
                    Data = data,
                    RowCount = policies.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(policies.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task<List<Cover>> GetPolicyCover(int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _coverRepository.Where(x => x.PolicyId == policyId && !x.IsDeleted).ToListAsync();
                return Mapper.Map<List<Cover>>(results);
            }
        }

        public async Task<PagedRequestResult<Cover>> GetPagedPolicyCovers(int policyId, PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var covers = new PagedRequestResult<Cover>();

                    covers = await (from cover in _coverRepository
                                    where cover.PolicyId == policyId
                                    select new Cover
                                    {
                                        CoverId = cover.CoverId,
                                        PolicyId = cover.PolicyId,
                                        EffectiveFrom = cover.EffectiveFrom,
                                        EffectiveTo = cover.EffectiveTo.Value,
                                        IsDeleted = cover.IsDeleted,
                                        CreatedBy = cover.CreatedBy,
                                        CreatedDate = cover.CreatedDate,
                                        ModifiedBy = cover.ModifiedBy,
                                        ModifiedDate = cover.ModifiedDate
                                    }).ToPagedResult(pagedRequest);

                    return new PagedRequestResult<Cover>
                    {
                        Data = covers.Data,
                        RowCount = covers.RowCount,
                        Page = pagedRequest.Page,
                        PageSize = pagedRequest.PageSize,
                        PageCount = (int)Math.Ceiling(covers.RowCount / (double)pagedRequest.PageSize)
                    };
                }
            }
        }

        public async Task<bool> MonitorFirstPremiumPendingPolicies()
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                try
                {
                    var value = await _configurationService.GetModuleSetting("PendingFirstPremiumPeriod");
                    if (!int.TryParse(value, out int months))
                    {
                        throw new Exception("Setting PendingFirstPremiumPeriod has not been defined");
                    }
                    var cutoffDate = DateTime.Today.AddMonths(-months);
                    var policies = await (from p in _policyRepository
                                          where p.PolicyStatus == PolicyStatusEnum.PendingFirstPremium
                                            && p.ParentPolicyId == null
                                            && p.PolicyInceptionDate < cutoffDate
                                          select p)
                                     .ToListAsync();
                    foreach (var policy in policies)
                    {
                        var payments = await _transactionCreatorService.GetPaymentMadeAfterSpecificDate(policy.PolicyId, cutoffDate);
                        // If there are not payments made after the cutoff date, flag the policy as NTU.
                        // If there are payments, flag the policy as Active
                        policy.PolicyStatus = payments.Count > 0
                            ? PolicyStatusEnum.Active
                            : PolicyStatusEnum.NotTakenUp;
                        _policyRepository.Update(policy);
                    }

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    return true;
                }
                catch (Exception ex)
                {
                    ex.LogException("Monitor Pending First Premium Policies");
                    throw;
                }
            }
        }

        public async Task<UnderwriterEnum> GetUnderwriter(PolicyModel policy)
        {
            Contract.Requires(policy != null);

            var product = await _productOptionService.GetProductByProductOptionId(policy.ProductOptionId);
            return (UnderwriterEnum)product.UnderwriterId;
        }

        public async Task<UnderwriterEnum> GetUnderwriterByPolicyId(int policyId)
        {
            var policy = await GetPolicy(policyId);
            var product = await _productOptionService.GetProductByProductOptionId(policy.ProductOptionId);
            return (UnderwriterEnum)product.UnderwriterId;
        }

        public async Task<bool> ProcessPolicyHolderBirthdayWishesTask()
        {
            var policyHolderList = new List<PolicyholderBirthdaySMSModel>();
            var smsTemplate = string.Empty;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                policyHolderList = await _policyRepository.SqlQueryAsync<PolicyholderBirthdaySMSModel>(
                  DatabaseConstants.GetPolicyholdersCelebratingBirthdayToday);

                smsTemplate = await _configurationService.GetModuleSetting("PolicyholderBirthdaySMSTemplate");
            }

            if (policyHolderList.Count > 0)
            {
                foreach (var policyHolder in policyHolderList)
                {
                    policyHolder.Message = smsTemplate.Replace("{0}", policyHolder.DisplayName);
                    await _communicationService.SendPolicyHolderBirthdayWishesBySMS(policyHolder);
                }
            }

            return await Task.FromResult(true);
        }

        private Task SetPolicyProductCategoryType(PolicyModel policy)
        {
            if ((policy.ProductOption.Product.ProductClass == ProductClassEnum.Life || policy.ProductOption.Product.ProductClass == ProductClassEnum.ValuePlus) && (UnderwriterEnum)policy.ProductOption.Product.UnderwriterId == UnderwriterEnum.RMALifeAssurance)
            {
                policy.ProductCategoryType = ProductCategoryTypeEnum.Funeral;
            }
            else if (policy.ProductOption.Product.ProductClass == ProductClassEnum.Assistance || policy.ProductOption.Product.ProductClass == ProductClassEnum.NonStatutory && (UnderwriterEnum)policy.ProductOption.Product.UnderwriterId == UnderwriterEnum.RMALifeAssurance)
            {
                policy.ProductCategoryType = policy.ProductOption.Product.ProductClass == ProductClassEnum.Assistance ? ProductCategoryTypeEnum.VapsAssistance : ProductCategoryTypeEnum.VapsNoneStatutory;
            }
            else if (policy.ProductOption.Product.ProductClass == ProductClassEnum.Statutory && (UnderwriterEnum)policy.ProductOption.Product.UnderwriterId == UnderwriterEnum.RMAMutualAssurance)
            {
                policy.ProductCategoryType = ProductCategoryTypeEnum.Coid;
            }
            else if (policy.ProductOption.Product.ProductClass == ProductClassEnum.GroupRisk && (UnderwriterEnum)policy.ProductOption.Product.UnderwriterId == UnderwriterEnum.RMALifeAssurance)
            {
                policy.ProductCategoryType = ProductCategoryTypeEnum.GroupRisk;
            }
            else
            {
                policy.ProductCategoryType = null;
            }

            return Task.CompletedTask;
        }

        public async Task<List<Benefit>> GetBenefitsForProductOptionAtEffectiveDate(int productOptionId, DateTime effectiveDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var benefits = await _benefitRepository.Where(b => !b.IsDeleted && b.ProductOptions.Any(po => po.Id == productOptionId)).ToListAsync();

                foreach (var benefitEntity in benefits)
                {
                    benefitEntity.EndDate = benefitEntity.EndDate ?? DateTime.MaxValue;
                }

                benefits.RemoveAll(s => s.StartDate.Date >= effectiveDate.Date || effectiveDate.Date >= Convert.ToDateTime(s.EndDate).Date);

                await _benefitRepository.LoadAsync(benefits, e => e.BenefitAddBeneficiaries);
                await _benefitRepository.LoadAsync(benefits, e => e.BenefitCaptureEarnings);
                await _benefitRepository.LoadAsync(benefits, e => e.BenefitCompensationAmounts);
                await _benefitRepository.LoadAsync(benefits, e => e.BenefitCoverMemberTypes);
                await _benefitRepository.LoadAsync(benefits, e => e.BenefitMedicalReportRequireds);
                await _benefitRepository.LoadAsync(benefits, e => e.BenefitEarningsRangeCalcs);

                var mappedBenefits = Mapper.Map<List<Benefit>>(benefits);

                foreach (var mappedBenefit in mappedBenefits)
                {
                    mappedBenefit.BenefitAddBeneficiaries.RemoveAll(s => s.StartDate.Date > effectiveDate.Date || effectiveDate.Date >= Convert.ToDateTime(s.EndDate).Date);
                    mappedBenefit.BenefitCaptureEarnings.RemoveAll(s => s.StartDate.Date > effectiveDate.Date || effectiveDate.Date >= Convert.ToDateTime(s.EndDate).Date);
                    mappedBenefit.BenefitCompensationAmounts.RemoveAll(s => s.StartDate.Date > effectiveDate.Date || effectiveDate.Date >= Convert.ToDateTime(s.EndDate).Date);
                    mappedBenefit.BenefitCoverMemberTypes.RemoveAll(s => s.StartDate.Date > effectiveDate.Date || effectiveDate.Date >= Convert.ToDateTime(s.EndDate).Date);
                    mappedBenefit.BenefitMedicalReportRequireds.RemoveAll(s => s.StartDate.Date > effectiveDate.Date || effectiveDate.Date >= Convert.ToDateTime(s.EndDate).Date);
                    mappedBenefit.BenefitEarningsRangeCalcs.RemoveAll(s => s.EffectiveFrom.Date > effectiveDate.Date || effectiveDate.Date >= Convert.ToDateTime(s.EffectiveTo).Date);
                }

                return mappedBenefits;
            }
        }

        public async Task<List<PolicyTemplate>> GetPolicyTemplatesByPolicyId(int policyId)
        {
            PolicyModel policyModel = await GetPolicy(policyId);

            var policyScheduleName = policyModel.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.PolicyScheduler)?.FirstOrDefault()?.Value;
            var welcomeLetterName = policyModel.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.WelcomeLetter)?.FirstOrDefault()?.Value;
            var termsAndConditionsName = policyModel.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.TermsAndConditions)?.FirstOrDefault()?.Value;

            if (string.IsNullOrEmpty(policyScheduleName))
                policyScheduleName = "RMAFuneralPolicySchedule"; //use default

            if (string.IsNullOrEmpty(welcomeLetterName))
                welcomeLetterName = "RMAFuneralWelcomeLetter"; //use default

            if (string.IsNullOrEmpty(termsAndConditionsName))
                termsAndConditionsName = "RMAFuneralCoverTermsAndConditions"; //use default

            List<PolicyTemplate> policyTemplates = new List<PolicyTemplate>();
            policyTemplates.Add(new PolicyTemplate { Name = "", Value = "" });
            policyTemplates.Add(new PolicyTemplate { Name = "Welcome Cover Letter", Value = welcomeLetterName });
            policyTemplates.Add(new PolicyTemplate { Name = "Policy Schedule", Value = policyScheduleName });
            policyTemplates.Add(new PolicyTemplate { Name = "Terms And Conditions", Value = $"{termsAndConditionsName}.pdf" });

            return Mapper.Map<List<PolicyTemplate>>(policyTemplates);
        }


        public async Task<List<PolicyModel>> GetPoliciesByRolePlayerIdNumber(string idNumber)
        {
            client_RolePlayer roleplayer = null;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                roleplayer = await _rolePlayerRepository.FirstOrDefaultAsync(x => x.Person.IdNumber.Equals(idNumber, System.StringComparison.InvariantCultureIgnoreCase));
            }

            if (roleplayer == null)
            {
                return null;
            }

            return await GetPoliciesByRolePlayer(roleplayer.RolePlayerId);
        }

        public async Task<List<PolicyProductOptionModel>> GetPolicyProductOptionInformationByIdNumberAsync(string idNumber)
        {
            //The following code is for testing. Will remove later
            if (idNumber == "8901014800081")
            {

                return await Task.FromResult(new List<PolicyProductOptionModel>
                    {
                                    new PolicyProductOptionModel
                                    {
                                        PolicyNumber = "01-202008-22344",
                                        ProductOptionName = "My Value Plus Life",
                                        ProductOptionCode = "OPT:00226",
                                        PolicyCoverAmount = 250000m,
                                        MaximumCoverAmount = 450000m
                                    },
                                    new PolicyProductOptionModel
                                    {
                                         PolicyNumber = "01-202008-22347",
                                        ProductOptionName = "My Value Plus Life",
                                        ProductOptionCode = "OPT:00226",
                                        PolicyCoverAmount = 50000m,
                                        MaximumCoverAmount = 450000m
                                    }
                    });
            }

            //The following code is for testing. will remove later
            if (idNumber == "8301015800083")
            {
                return await Task.FromResult(new List<PolicyProductOptionModel>
                    {
                                    new PolicyProductOptionModel
                                    {
                                        PolicyNumber = "01-202008-22377",
                                        ProductOptionName = "My Value Plus Life",
                                        ProductOptionCode = "OPT:00226",
                                        PolicyCoverAmount = 29000m,
                                        MaximumCoverAmount = 100000m
                                    },
                                    new PolicyProductOptionModel
                                    {
                                        PolicyNumber = "01-202008-22361",
                                        ProductOptionName = "My Value Plus Life & Funeral",
                                        ProductOptionCode = "OPT:00229",
                                        PolicyCoverAmount = 50000m,
                                        MaximumCoverAmount = 100000m
                                    }
                    });
            }

            var policies = await GetPoliciesByRolePlayerIdNumber(idNumber);

            if (policies == null)
                return null;

            var policyProductOptionData = new List<PolicyProductOptionModel>();

            foreach (var policy in policies)
            {
                var policyProductOptionModel = new PolicyProductOptionModel();

                if (policy.IsDeleted == true)
                    continue;
                var benefit = policy.ProductOption.Benefits.FirstOrDefault(b => b.CoverMemberType == CoverMemberTypeEnum.MainMember && b.MaxCompensationAmount > 0 && b.IsDeleted == false);

                if (benefit == null)
                    continue;
                var coverAmount = policy.PolicyInsuredLives.Where(i => i.RolePlayerTypeId == (int)RolePlayerTypeEnum.MainMemberSelf
                && i.PolicyStatusId != (int)PolicyStatusEnum.Cancelled
               && i.PolicyStatusId != (int)PolicyStatusEnum.NotTakenUp);

                policyProductOptionModel.PolicyNumber = policy.PolicyNumber;
                policyProductOptionModel.ProductOptionName = policy.ProductOption.Name;
                policyProductOptionModel.ProductOptionCode = policy.ProductOption.Code;
                policyProductOptionModel.PolicyCoverAmount = policy.PolicyInsuredLives.Where(i => i.RolePlayerTypeId == (int)RolePlayerTypeEnum.MainMemberSelf).Sum(s => s.CoverAmount).Value;
                policyProductOptionData.Add(policyProductOptionModel);
            }

            return policyProductOptionData;
        }

        public async Task<bool> DeletePolicyScheduleDocumentByPolicyId(int policyId)
        {
            if (policyId > 0)
            {
                using (_dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
                {
                    await _policyRepository.ExecuteSqlCommandAsync(
                    DatabaseConstants.DeletePolicyScheduleDocument,
                    new SqlParameter("@policyId", policyId));
                }
            }

            return true;
        }

        public async Task<decimal> GetMainMemberFuneralPremium(int policyId, int spouseCount, int childCount)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                try
                {
                    // Use a stored procedure, because the code to add premiums, cover amounts and
                    // age range takes too long to load. This procedure includes everything.
                    var funeralPremiums = await _benefitRepository
                        .SqlQueryAsync<decimal>(DatabaseConstants.GetMainMemberFuneralPremium,
                            new SqlParameter("@PolicyId", policyId),
                            new SqlParameter("@SpouseCount", spouseCount),
                            new SqlParameter("@ChildCount", childCount)
                        );
                    return funeralPremiums[0];
                }
                catch (Exception ex)
                {
                    ex.LogException();
                    throw;
                }
            }
        }

        public async Task<PolicyBrokerage> GetPolicyBrokerageByPolicyId(int policyId)
        {            

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await (from policy in _policyRepository
                            join roleplayer in _rolePlayerRepository on policy.PolicyPayeeId equals roleplayer.RolePlayerId
                              join brokerage in _brokerageRepository on policy.BrokerageId equals brokerage.Id
                              where policy.PolicyId == policyId

                              select new PolicyBrokerage
                              {
                                  PolicyNumber = policy.PolicyNumber,
                                  PolicyId = policy.PolicyId,
                                  BrokerageId = policy.BrokerageId,
                                  DisplayName = brokerage.Name,
                                  PolicyStatusId = (int)policy.PolicyStatus,
                                  FspNumber=brokerage.FspNumber
                                 

                              }).Distinct().FirstOrDefaultAsync();
            }
        }

        public async Task<List<int>> GetMissingPolicySchedules()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyRepository.SqlQueryAsync<int>(DatabaseConstants.GetMissingPolicySchedules);
            }
        }

    }
}
