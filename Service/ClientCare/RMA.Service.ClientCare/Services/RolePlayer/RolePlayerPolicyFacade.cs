using AutoMapper;
using Newtonsoft.Json;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceBus.Producers;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.Database.Constants;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.ClientCare.Mappers;
using RMA.Service.ClientCare.Services.Policy;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using Serilog;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Linq.Dynamic;
using System.Text;
using System.Threading.Tasks;
using TinyCsvParser;

using Invoice = RMA.Service.Billing.Contracts.Entities.Invoice;
using PolicyModel = RMA.Service.ClientCare.Contracts.Entities.Policy.Policy;
using Roleplayer = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.RolePlayer;

namespace RMA.Service.ClientCare.Services.RolePlayer
{
    public class RolePlayerPolicyFacade : RemotingStatelessService, IRolePlayerPolicyService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IAuditWriter _auditWriter;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IRepository<client_RolePlayer> _rolePlayerRepository;
        private readonly IRepository<policy_PolicyInsuredLife> _insuredLifeRepository;
        private readonly IRepository<product_Benefit> _productBenefitRepository;
        private readonly IRepository<product_ProductOption> _productOptionRepository;
        private readonly IRepository<product_BenefitRate> _productBenefitRateRepository;
        private readonly IRepository<client_RolePlayerRelation> _rolePlayerRelationRepository;
        private readonly IRepository<client_RolePlayerRelationLife> _rolePlayerRelationLifeRepository;
        private readonly IRepository<policy_PolicyMovement> _policyMovementRepository;
        private readonly IRepository<policy_PolicyBroker> _policyBrokerRepository;
        private readonly IPolicyCommunicationService _policyCommunicationService;
        private readonly IRepository<policy_PolicyNote> _noteRepository;
        private readonly IPolicyCaseService _caseService;
        private readonly IWizardService _wizardService;
        private readonly ISerializerService _serializer;
        private readonly ITransactionCreatorService _transactionCreatorService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IPeriodService _periodService;
        private readonly ISendEmailService _emailService;
        private readonly IConfigurationService _configurationService;
        private readonly IRepresentativeService _representativeService;
        private readonly IRolePlayerPolicyInvoiceService _rolePlayerPolicyInvoiceService;
        private readonly IRepository<client_PreviousInsurerRolePlayer> _previousInsurerRolePlayerRepository;
        private readonly IRepository<client_Person> _personRepository;
        private readonly IRepository<client_FinPayee> _finPayeeRepository;
        private readonly IRepository<Load_InsuredLife> _loadInsuredLifeRepository;
        private readonly IInsuredLifeUploadErrorAuditService _insuredLifeErrorAuditService;
        private readonly IRepository<policy_InsuredLifeFileAudit> _insuredLifeFileRepository;
        private readonly IRepository<policy_PolicyNote> _policyNoteRepository;
        private readonly IRepository<Load_InsuredLivesError> _insuredLivesErrorRepository;
        private readonly IRepository<policy_PolicyLifeExtension> _lifeExtensionRepository;
        private readonly IRepository<policy_PolicyProductDeviation> _productDeviationRepository;
        private readonly IQLinkService _qlinkService;
        private readonly IRepository<policy_PolicyContact> _policyContactRepository;
        private readonly IRepository<policy_PolicyDocumentCommunicationMatrix> _policyDocumentCommunicationMatrixRepository;
        private readonly IBillingFuneralPolicyChangeService _billingFuneralPolicyChangeService;
        private readonly IProductService _productService;
        private readonly IProductOptionService _productOptionService;
        private readonly IRepository<policy_PolicyStatusChangeAudit> _policyStatusChangeRepository;
        private readonly IRepository<product_Product> _productRepository;

        private const string PolicyUpdateLoadBenefitsFeatureFFL = "PolicyUpdateLoadBenefitsFeature";
        private const string ClientModulePermissionsFFL = "ClientModulePermissions";
        public const string PolicyChangesQueueName = "mcc.fin.billingpolicychanges";
        private decimal _totalPolicyPremium = 0.0M;

        public RolePlayerPolicyFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory, IRepository<policy_Policy> policyRepository,
            IAuditWriter clientAuditWriter,
            IRepository<client_RolePlayer> rolePlayerRepository,
            IRepository<policy_PolicyInsuredLife> insuredLifeRepository,
            IDocumentGeneratorService documentGeneratorService,
            IRepository<product_Benefit> productBenefitRepository,
            IRepository<product_ProductOption> productOptionRepository,
            IRepository<product_BenefitRate> productBenefitRateRepository,
            IRepository<client_RolePlayerRelation> rolePlayerRelationRepository,
            IRepository<client_RolePlayerRelationLife> rolePlayerRelationLifeRepository,
            IRepository<policy_PolicyMovement> policyMovementRepository,
            IRepository<policy_PolicyBroker> policyBrokerRepository,
            IPolicyCommunicationService policyCommunicationService,
            IRepository<policy_PolicyNote> noteRepository,
            IPolicyCaseService caseService,
            IWizardService wizardService,
            ISerializerService serializer,
            ITransactionCreatorService transactionCreatorService,
            IDocumentIndexService documentIndexService,
            IPeriodService periodService,
            ISendEmailService emailService,
            IConfigurationService configurationService,
            IRolePlayerPolicyInvoiceService rolePlayerPolicyInvoiceService,
            IRepresentativeService representativeService,
            IRepository<client_PreviousInsurerRolePlayer> previousInsurerRolePlayerRepository,
            IRepository<client_Person> personRepository,
            IRepository<client_FinPayee> finPayeeRepository,
            IRepository<Load_InsuredLife> loadInsuredLifeRepository,
            IInsuredLifeUploadErrorAuditService insuredLifeErrorAuditService,
            IRepository<policy_InsuredLifeFileAudit> insuredLifeFileRepository,
            IRepository<Load_InsuredLivesError> insuredLivesErrorRepository,
            IRepository<policy_PolicyNote> policyNoteRepository,
            IRepository<policy_PolicyLifeExtension> lifeExtensionRepository,
            IRepository<policy_PolicyProductDeviation> productDeviationRepository,
            IQLinkService qlinkService,
            IRepository<policy_PolicyContact> policyContactRepository,
            IRepository<policy_PolicyDocumentCommunicationMatrix> policyDocumentCommunicationMatrixRepository,
            IBillingFuneralPolicyChangeService billingFuneralPolicyChangeService,
            IProductService productService,
            IProductOptionService productOptionService,
            IRepository<policy_PolicyStatusChangeAudit> policyStatusChangeRepository,
            IRepository<product_Product> productRepository) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _policyRepository = policyRepository;
            _auditWriter = clientAuditWriter;
            _rolePlayerRepository = rolePlayerRepository;
            _insuredLifeRepository = insuredLifeRepository;
            _documentGeneratorService = documentGeneratorService;
            _productBenefitRepository = productBenefitRepository;
            _productOptionRepository = productOptionRepository;
            _policyMovementRepository = policyMovementRepository;
            _policyBrokerRepository = policyBrokerRepository;
            _rolePlayerRelationRepository = rolePlayerRelationRepository;
            _rolePlayerRelationLifeRepository = rolePlayerRelationLifeRepository;
            _policyCommunicationService = policyCommunicationService;
            _noteRepository = noteRepository;
            _caseService = caseService;
            _wizardService = wizardService;
            _serializer = serializer;
            _transactionCreatorService = transactionCreatorService;
            _documentIndexService = documentIndexService;
            _periodService = periodService;
            _emailService = emailService;
            _configurationService = configurationService;
            _representativeService = representativeService;
            _rolePlayerPolicyInvoiceService = rolePlayerPolicyInvoiceService;
            _productBenefitRateRepository = productBenefitRateRepository;
            _previousInsurerRolePlayerRepository = previousInsurerRolePlayerRepository;
            _personRepository = personRepository;
            _finPayeeRepository = finPayeeRepository;
            _loadInsuredLifeRepository = loadInsuredLifeRepository;
            _insuredLifeErrorAuditService = insuredLifeErrorAuditService;
            _insuredLifeFileRepository = insuredLifeFileRepository;
            _insuredLivesErrorRepository = insuredLivesErrorRepository;
            _policyNoteRepository = policyNoteRepository;
            _lifeExtensionRepository = lifeExtensionRepository;
            _productDeviationRepository = productDeviationRepository;
            _qlinkService = qlinkService;
            _policyContactRepository = policyContactRepository;
            _policyDocumentCommunicationMatrixRepository = policyDocumentCommunicationMatrixRepository;
            _billingFuneralPolicyChangeService = billingFuneralPolicyChangeService;
            _productService = productService;
            _productOptionService = productOptionService;
            _policyStatusChangeRepository = policyStatusChangeRepository;
            _productRepository = productRepository;
        }

        public async Task<PagedRequestResult<RolePlayerPolicy>> SearchPolicies(PagedRequest request)
        {
            Contract.Requires(request != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyIds = await _policyRepository.SqlQueryAsync<int>(
                    DatabaseConstants.SearchPolicies,
                        new SqlParameter("@search", request.SearchCriteria)
                );
                var policies = new PagedRequestResult<policy_Policy>();
                policies = await _policyRepository
                    .Where(p => policyIds.Contains(p.PolicyId))
                    .ToPagedResult(request);

                foreach (var policy in policies.Data)
                {
                    await _policyRepository.LoadAsync(policy, t => t.PolicyOwner);
                    await _rolePlayerRepository.LoadAsync(policy.PolicyOwner, a => a.Company);
                    await _rolePlayerRepository.LoadAsync(policy.PolicyOwner, a => a.Person);
                    await _rolePlayerRepository.LoadAsync(policy.PolicyOwner, a => a.FinPayee);

                    if (policy.ParentPolicyId != null)
                    {
                        var parentPolicy = await _policyRepository.Where(c => c.PolicyId == policy.ParentPolicyId).SingleAsync();
                        if (parentPolicy != null)
                            policy.ParentPolicy = parentPolicy;
                    }
                }

                var mappedPolicies = Mapper.Map<List<RolePlayerPolicy>>(policies.Data);
                return new PagedRequestResult<RolePlayerPolicy>()
                {
                    PageSize = policies.PageSize,
                    Page = policies.Page,
                    PageCount = policies.PageCount,
                    RowCount = policies.RowCount,
                    Data = mappedPolicies
                };
            }
        }

        public async Task<List<RolePlayerPolicy>> GetPoliciesByIds(List<int> ids)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = await _policyRepository
                    .Where(policy => ids.Contains(policy.PolicyId))
                    .ToListAsync();

                foreach (var policy in policies)
                {
                    await LoadReferenceData(policy);
                }

                return Mapper.Map<List<RolePlayerPolicy>>(policies);
            }
        }

        public async Task<RolePlayerPolicy> GetRolePlayerPolicy(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _policyRepository
                    .Where(s => s.PolicyId == policyId).FirstOrDefaultAsync();

                await LoadReferenceData(entity);

                var mapped = Mapper.Map<RolePlayerPolicy>(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return mapped;
            }
        }

        public async Task<List<RolePlayerPolicy>> GetRolePlayerPolicyByRolePlayerId(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entities = await _policyRepository
                    .Where(s => s.PolicyOwnerId == rolePlayerId).ToListAsync();

                foreach (var entity in entities)
                {
                    await LoadReferenceData(entity);
                }

                var mapped = Mapper.Map<List<RolePlayerPolicy>>(entities);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return mapped;
            }
        }

        private async Task LoadReferenceData(policy_Policy entity)
        {
            await _policyRepository.LoadAsync(entity, r => r.ProductOption);
            await _policyRepository.LoadAsync(entity, r => r.PolicyOwner);
            await _policyRepository.LoadAsync(entity, r => r.Representative);
            await _policyRepository.LoadAsync(entity, r => r.Brokerage);
            await _policyRepository.LoadAsync(entity, r => r.JuristicRepresentative);
            await _policyRepository.LoadAsync(entity, r => r.Benefits);
            await _policyRepository.LoadAsync(entity, r => r.PolicyNotes);
            await _policyRepository.LoadAsync(entity, r => r.PolicyBrokers);
            await _policyRepository.LoadAsync(entity, r => r.PolicyMovement);
            await _policyBrokerRepository.LoadAsync(entity.PolicyBrokers, r => r.Rep);
            await _policyBrokerRepository.LoadAsync(entity.PolicyBrokers, r => r.Brokerage);
            await _policyBrokerRepository.LoadAsync(entity.PolicyBrokers, r => r.JuristicRep);
            await _rolePlayerRepository.LoadAsync(entity.PolicyOwner, c => c.RolePlayerBankingDetails);
        }

        public async Task<RolePlayerPolicy> GetRolePlayerPolicyByNumber(string policyNumber)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policy = await _policyRepository
                    .Where(s => s.PolicyNumber == policyNumber)
                    .SingleAsync($"Cannot find policy with policy number {policyNumber}");
                await LoadReferenceData(policy);
                return Mapper.Map<RolePlayerPolicy>(policy);
            }
        }

        public async Task<List<Roleplayer>> GetInsuredLives(int policyId, RolePlayerTypeEnum rolePlayerType)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var roleplayers = new List<Roleplayer>();
                var policyInsuredLives = await _insuredLifeRepository
                    .Where(c => c.PolicyId == policyId)
                    .ToListAsync();
                var rolePlayerIds = policyInsuredLives
                    .Where(c => c.RolePlayerTypeId == (int)rolePlayerType
                             && c.InsuredLifeStatus == InsuredLifeStatusEnum.Active)
                    .Select(c => c.RolePlayerId)
                    .ToList();
                if (rolePlayerIds.Count > 0)
                {
                    var dbRolePlayers = await _rolePlayerRepository.Where(c => rolePlayerIds.Contains(c.RolePlayerId)).ToListAsync();

                    foreach (var item in dbRolePlayers)
                    {
                        var benefits = new List<RolePlayerBenefit>();

                        var statedBenefitId = policyInsuredLives
                            .Find(c => c.RolePlayerId == item.RolePlayerId && c.PolicyId == policyId)?
                            .StatedBenefitId;
                        if (statedBenefitId != null)
                        {
                            var statedBenefit = await _productBenefitRepository
                                .FirstOrDefaultAsync(c => c.Id == statedBenefitId);
                            if (statedBenefit != null)
                            {
                                await _productBenefitRepository.LoadAsync(statedBenefit, c => c.ProductOptions);
                                await _productBenefitRepository.LoadAsync(statedBenefit, c => c.BenefitRates);

                                var benefit = Mapper.Map<Benefit>(statedBenefit);
                                var mapped = Mapper.Map<RolePlayerBenefit>(benefit);


                                if (benefit.BenefitRates?.Count > 0)
                                {
                                    var benefitBaseRateLatest = 0.00M;
                                    var benefitRateLatest = 0.00M;

                                    var latestRate = benefit.BenefitRates.OrderByDescending(b => b.EffectiveDate).FirstOrDefault();
                                    if (latestRate != null)
                                    {
                                        benefitRateLatest = latestRate.BenefitAmount;
                                        benefitBaseRateLatest = latestRate.BaseRate;
                                    }

                                    mapped.IsStatedBenefit = true;
                                    mapped.Selected = true;
                                    mapped.RolePlayerName = item.DisplayName;
                                    mapped.BenefitName = statedBenefit.Name;
                                    mapped.BenefitRates = benefit.BenefitRates;
                                    mapped.BenefitBaseRateLatest = benefitBaseRateLatest;
                                    mapped.BenefitRateLatest = benefitRateLatest;
                                    mapped.ProductOptionName = statedBenefit.ProductOptions.FirstOrDefault(c => c.ProductId == benefit.ProductId)?.Name;
                                    benefits.Add(mapped);
                                }
                            }
                        }

                        await _rolePlayerRepository.LoadAsync(item, r => r.Person);
                        var endDate = policyInsuredLives.FirstOrDefault(c => c.RolePlayerId == item.RolePlayerId)?.EndDate;
                        var roleplayer = new Roleplayer()
                        {
                            Person = Mapper.Map<Person>(item.Person),
                            DisplayName = item.DisplayName,
                            CellNumber = item.CellNumber,
                            PreferredCommunicationTypeId = Convert.ToInt32(item.PreferredCommunicationTypeId),
                            RolePlayerIdentificationType = item.RolePlayerIdentificationType,
                            RolePlayerId = item.RolePlayerId,
                            EmailAddress = item.EmailAddress,
                            TellNumber = item.TellNumber,
                            JoinDate = policyInsuredLives.Find(s => s.RolePlayerId == item.RolePlayerId)?.StartDate,
                            IsDeleted = item.IsDeleted
                        };
                        if (endDate != null)
                        {
                            roleplayer.EndDate = (DateTime)endDate;
                        }

                        roleplayer.Benefits = benefits;
                        roleplayers.Add(roleplayer);
                    }
                }

                if (roleplayers.Count > 0)
                {
                    foreach (var item in roleplayers)
                    {
                        var insured = await _rolePlayerRelationRepository
                            .FirstOrDefaultAsync(r => r.FromRolePlayerId == item.RolePlayerId
                                                   && r.PolicyId == policyId
                                                   && r.RolePlayerTypeId != (int)RolePlayerTypeEnum.Beneficiary);
                        if (insured != null)
                        {
                            item.FromRolePlayers = new List<RolePlayerRelation>();
                            var fromRelation = new RolePlayerRelation
                            {
                                FromRolePlayerId = item.RolePlayerId,
                                ToRolePlayerId = insured.ToRolePlayerId,
                                RolePlayerTypeId = insured.RolePlayerTypeId
                            };
                            item.FromRolePlayers.Add(fromRelation);
                        }
                    }
                }
                return roleplayers;
            }
        }

        public async Task<List<PolicyInsuredLife>> GetPolicyMembers(int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyInsuredLives = await _insuredLifeRepository
                    .Where(c => c.PolicyId == policyId
                             && c.InsuredLifeStatus == InsuredLifeStatusEnum.Active)
                    .ToListAsync();
                var members = Mapper.Map<List<PolicyInsuredLife>>(policyInsuredLives);
                return members;
            }
        }

        public async Task<int> CancelRequestGroupPolicyChild(int policyId, int status)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            using (_dbContextScopeFactory.Create())
            {
                await _policyRepository.ExecuteSqlCommandAsync(
                    DatabaseConstants.CancelRequestGroupPolicyChild,
                    new SqlParameter("@policyId", policyId),
                    new SqlParameter("@status", status)
                );
            }
            return status;
        }

        public async Task<string> PolicySearchMoreInfo(int policyId, int rolePlayerId)
        {
            using (_dbContextScopeFactory.Create())
            {
                var response = await _policyRepository.SqlQueryAsync<string>(
                    DatabaseConstants.PolicySearchMoreInfo,
                    new SqlParameter("@policyId", policyId),
                    new SqlParameter("@rolePlayerId", rolePlayerId)
                );
                return response.ToJson();
            }
        }

        public async Task<int> OverAgeDailyCheckStart()
        {
            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    int[] CHECK_DAYS = new int[] { 30, 60, 90 };

                    // Add birthdays to check for
                    var today = DateTimeHelper.SaNow.Date;
                    var birthDays = new List<DateTime>();
                    foreach (var day in CHECK_DAYS)
                    {
                        birthDays.Add(today.AddDays(day).AddYears(-21));
                    }

                    // Add active policy statuses
                    var activeStatuses = new List<PolicyStatusEnum> {
                        PolicyStatusEnum.Active,
                        PolicyStatusEnum.Reinstated,
                        PolicyStatusEnum.Continued,
                        PolicyStatusEnum.FreeCover,
                        PolicyStatusEnum.PaidUp
                    };

                    // Add communication types
                    var communicationTypes = new List<int?> {
                        (int)CommunicationTypeEnum.Email,
                        (int)CommunicationTypeEnum.SMS
                    };

                    // Read the list of children with birthdays on the specified dates
                    var list = await (
                        from p in _policyRepository
                        join pil in _insuredLifeRepository on p.PolicyId equals pil.PolicyId
                        join child in _personRepository on pil.RolePlayerId equals child.RolePlayerId
                        join rp in _rolePlayerRepository on p.PolicyOwnerId equals rp.RolePlayerId
                        join b in _productBenefitRepository on pil.StatedBenefitId equals b.Id
                        where activeStatuses.Contains(p.PolicyStatus)
                            && pil.InsuredLifeStatus == InsuredLifeStatusEnum.Active
                            && b.CoverMemberType == CoverMemberTypeEnum.Child
                            && birthDays.Contains(child.DateOfBirth)
                            && communicationTypes.Contains(rp.PreferredCommunicationTypeId)
                            && child.IsAlive
                            && !child.IsStudying
                            && !child.IsDisabled
                        select new
                        {
                            p.PolicyId,
                            child.RolePlayerId,
                            ChildName = child.FirstName + " " + child.Surname,
                            DOB = child.DateOfBirth,
                            ParentEmail = rp.EmailAddress,
                            ParentCell = rp.CellNumber,
                            ParentCommunication = rp.PreferredCommunicationTypeId,
                            rp.DisplayName,
                            p.PolicyNumber
                        }
                    )
                    .ToListAsync();

                    foreach (var child in list)
                    {
                        int exactDays = (int)Math.Round((child.DOB.AddYears(21) - today).TotalDays);
                        switch (child.ParentCommunication)
                        {
                            case (int)CommunicationTypeEnum.Email:
                                if (child.ParentEmail.IsValidEmail())
                                {
                                    await _policyCommunicationService.SendChildOverAgeEmail(child.PolicyId, child.RolePlayerId, exactDays, child.PolicyNumber, child.ParentEmail, child.DisplayName, child.ChildName);
                                    await LogPolicyChangeNotification(child.PolicyId, CommunicationTypeEnum.Email, child.ParentEmail, "over age");
                                }
                                break;
                            case (int)CommunicationTypeEnum.SMS:
                                if (child.ParentCell.IsValidPhone())
                                {
                                    await _policyCommunicationService.SendChildOverAgeSMS(child.PolicyId, child.PolicyNumber, child.ParentCell, child.ChildName, exactDays);
                                    await LogPolicyChangeNotification(child.PolicyId, CommunicationTypeEnum.Email, child.ParentCell, "over age");
                                }
                                break;
                        }
                    }
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    return list.Count;
                }
            }
            catch (Exception ex)
            {
                ex.LogException("OverAgeDailyCheckStart");
                throw;
            }
        }

        public async Task<int> GetGroupPolicyStatus(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            int returnStatus = 0;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _policyRepository.Where(c => c.PolicyId == policyId).FirstOrDefaultAsync();
                returnStatus = (int)entity.PolicyStatus;
            }
            return returnStatus;
        }

        public async Task CancelGroupPolicyChildren(int policyId, DateTime? cancelDate, PolicyCancelReasonEnum? reason)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            using (_dbContextScopeFactory.Create())
            {
                await _policyRepository.ExecuteSqlCommandAsync(
                    DatabaseConstants.CancelGroupPolicyChildren,
                    new SqlParameter("@policyId", policyId),
                    new SqlParameter("@userId", RmaIdentity.Email),
                    new SqlParameter("@cancelDate", cancelDate),
                    new SqlParameter("@cancelReason", (int)reason)
                );
            }
        }

        public async Task GroupPolicyCancellationReject(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            using (_dbContextScopeFactory.Create())
            {
                await _policyRepository.ExecuteSqlCommandAsync(
                    DatabaseConstants.GroupPolicyCancellationReject,
                    new SqlParameter("@policyId", policyId)
                );
            }
        }

        public async Task SubmitPolicyCancellation(Roleplayer rolePlayer, string cancellationInitiatedBy, DateTime cancellationInitiatedDate)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            Contract.Requires(rolePlayer != null);
            var rolePlayerPolicy = rolePlayer.Policies[0];

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _policyRepository
                    .SingleOrDefaultAsync(c => c.PolicyId == rolePlayerPolicy.PolicyId);

                if (!rolePlayerPolicy.IsGroupPolicy)
                {
                    var cancellationDate = rolePlayerPolicy.CancellationDate.ToSaDateTime();

                    entity.CancellationInitiatedBy = cancellationInitiatedBy;
                    entity.CancellationInitiatedDate = DateTimeHelper.SaNow;
                    entity.CancellationDate = cancellationDate;
                    entity.PolicyStatus = PolicyStatusEnum.PendingCancelled;
                    entity.PolicyCancelReason = rolePlayerPolicy.PolicyCancelReason;

                    // Only add new notes here, otherwise they duplicate
                    var notes = rolePlayerPolicy.PolicyNotes.Where(s => s.Id == 0);
                    if (notes.Any())
                    {
                        entity.PolicyNotes = Mapper.Map<List<policy_PolicyNote>>(notes);
                    }

                    if (rolePlayer.RolePlayerBankingDetails != null)
                    {
                        var bankingDetails = new List<client_RolePlayerBankingDetail>();
                        if (rolePlayer.RolePlayerBankingDetails.Count > 0)
                        {
                            foreach (var banking in rolePlayer.RolePlayerBankingDetails.Where(c => c.PurposeId == 2))
                            {
                                var mapped = Mapper.Map<client_RolePlayerBankingDetail>(banking);
                                bankingDetails.Add(mapped);
                            }
                        }
                        var dbRoleplayer = await _rolePlayerRepository.Where(c => c.RolePlayerId == rolePlayer.RolePlayerId).FirstOrDefaultAsync();
                        if (dbRoleplayer != null)
                        {
                            foreach (var banking in bankingDetails)
                            {
                                dbRoleplayer.RolePlayerBankingDetails.Add(banking);
                            }
                            _rolePlayerRepository.Update(dbRoleplayer);
                        }
                    }

                    await _policyRepository.LoadAsync(entity, d => d.ProductOption);
                    var product = await _productRepository.SingleAsync(s => s.Id == entity.ProductOption.ProductId);
                    var policyLifeExtension = await _lifeExtensionRepository.SingleOrDefaultAsync(s => s.PolicyId == entity.PolicyId);

                    if (policyLifeExtension != null || product.ProductClass == ProductClassEnum.ValuePlus)
                    {
                        _ = await _qlinkService.ProcessQlinkTransactionAsync(new List<string> { entity.PolicyNumber }, QLinkTransactionTypeEnum.QDEL, false);
                    }

                    _policyRepository.Update(entity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }

                if (rolePlayerPolicy.IsGroupPolicy)
                    await CancelGroupPolicyChildren(rolePlayerPolicy.PolicyId, rolePlayerPolicy.CancellationDate, rolePlayerPolicy.PolicyCancelReason);

                await _auditWriter.AddLastViewed<policy_Policy>(rolePlayerPolicy.PolicyId);
            }
        }

        private async Task<int> CreateInvoice(int policyId, decimal amount, DateTime invoiceDate, DateTime collectionDate)
        {
            var newInvoice = new Invoice
            {
                PolicyId = policyId,
                TotalInvoiceAmount = amount,
                InvoiceStatus = InvoiceStatusEnum.Pending,
                InvoiceDate = invoiceDate,
                CollectionDate = collectionDate,
                InvoiceNumber = string.Empty
            };
            return await _rolePlayerPolicyInvoiceService.AddInvoiceItem(newInvoice);
        }

        public async Task EditPolicy(Case policyCase)
        {
            try
            {
                Contract.Requires(policyCase != null);

                if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                    RmaIdentity.DemandPermission(Permissions.EditPolicy);

                // Found that in some cases beneficiaries repeat
                policyCase.Beneficiaries = RemoveDuplicateBeneficiaries(policyCase.Beneficiaries.ToList());
                // Update main member details. Address and banking details are also saved here
                policyCase.MainMember = await SaveRolePlayerPerson(policyCase.MainMember);
                // Insert / update policy member roleplayers and persons. RoleplayerId's for new
                // members are assigned here as well, so we have to update the policyCase list.
                policyCase.Spouse = await SaveRolePlayerPersons(policyCase.Spouse);
                policyCase.Children = await SaveRolePlayerPersons(policyCase.Children);
                policyCase.ExtendedFamily = await SaveRolePlayerPersons(policyCase.ExtendedFamily);
                policyCase.Beneficiaries = await SaveRolePlayerPersons(policyCase.Beneficiaries);
                // Save roleplayer relations
                await UpdatePolicyRolePlayerRelations(policyCase);
                // Save beneficiaries
                await UpdatePolicyBeneficiaries(policyCase);
                // Save policy insured lives
                await UpdatePolicyInsuredLives(policyCase);

                //Re-Calculate MainMember Funeral Premium for MVP
                if (policyCase.MainMember.Policies[0].ProductOption.Product.ProductClassId == (int)ProductClassEnum.ValuePlus)
                {
                    await UpdateMVPMainMemberFuneralPremium(policyCase.MainMember.Policies[0].PolicyId);
                }

                //Get updated total premium
                var benefits = policyCase.MainMember.Benefits;
                decimal _totalPolicyPremium = GetTotalPolicyPremium(benefits);
                // Update the policy
                await UpdatePolicyCase(policyCase);

                //Regenerate Policy Schedule
                var producer = new ServiceBusQueueProducer<PolicyScheduleMessage, PolicyScheduleMessageListener>(PolicyScheduleMessageListener.QueueName);
                await producer.PublishMessageAsync(new PolicyScheduleMessage()
                {
                    PolicyId = policyCase.MainMember.Policies[0].PolicyId,
                    ShouldRegenerateSchedule = true,
                    RequestedBy = RmaIdentity.Username,
                    ImpersonateUser = RmaIdentity.Username
                });

            }
            catch (Exception ex)
            {
                ex.LogException("Edit Roleplayer Policy");
                throw;
            }
        }

        private async Task UpdatePolicyInsuredLives(Case policyCase)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var mainMember = policyCase.MainMember;
                var policyId = mainMember.Policies[0].PolicyId;
                var entities = await _insuredLifeRepository
                    .Where(s => s.PolicyId == policyId)
                    .ToListAsync();

                var savePremium = CheckSavePremium(mainMember.Policies[0].ProductOption.Product);

                // Save the main member
                var entity = entities.SingleOrDefault(s => s.RolePlayerId == mainMember.RolePlayerId);
                UpdatePolicyInsuredLife(policyId, entity, mainMember, savePremium, RolePlayerTypeEnum.MainMemberSelf);
                // Save the spouse
                foreach (var spouse in policyCase.Spouse)
                {
                    entity = entities.SingleOrDefault(s => s.RolePlayerId == spouse.RolePlayerId);
                    UpdatePolicyInsuredLife(policyId, entity, spouse, savePremium, RolePlayerTypeEnum.Spouse);
                }
                // Save the children
                foreach (var child in policyCase.Children)
                {
                    entity = entities.SingleOrDefault(s => s.RolePlayerId == child.RolePlayerId);
                    UpdatePolicyInsuredLife(policyId, entity, child, savePremium, RolePlayerTypeEnum.Child);
                }
                // Save the extended family members
                foreach (var member in policyCase.ExtendedFamily)
                {
                    entity = entities.SingleOrDefault(s => s.RolePlayerId == member.RolePlayerId);
                    UpdatePolicyInsuredLife(policyId, entity, member, savePremium, RolePlayerTypeEnum.Extended);
                }

                // Remove database records that are no longer in the list
                var list = policyCase.Spouse.Concat(policyCase.Children).Concat(policyCase.ExtendedFamily).ToList();
                var validRolePlayerIds = list.Select(s => s.RolePlayerId).Distinct().ToList();
                validRolePlayerIds.Add(mainMember.RolePlayerId);
                var removedLives = entities
                    .Where(s => !validRolePlayerIds.Contains(s.RolePlayerId))
                    .ToList();
                foreach (var life in removedLives)
                {
                    life.InsuredLifeStatus = InsuredLifeStatusEnum.Cancelled;
                    life.InsuredLifeRemovalReason = life.InsuredLifeRemovalReason ?? InsuredLifeRemovalReasonEnum.NoInsurableInterest;
                    life.EndDate = life.EndDate ?? DateTimeHelper.SaNow.Date;
                    // Do not delete the record, it should still stay in the table
                    // with a Cancelled status.
                    _insuredLifeRepository.Update(life);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private bool CheckSavePremium(Contracts.Entities.Product.Product product)
        {
            if (product.ProductClass == ProductClassEnum.ValuePlus) return true;
            if (product.ProductClass == ProductClassEnum.MedicalAnnuity) return true;
            if (product.Name.IndexOf("consolidated", StringComparison.CurrentCultureIgnoreCase) >= 0) return true;
            return false;
        }

        private void UpdatePolicyInsuredLife(int policyId, policy_PolicyInsuredLife entity, Roleplayer member, bool savePremium, RolePlayerTypeEnum rolePlayerType)
        {
            var insuredLifeStatus = member.IsDeleted
                ? InsuredLifeStatusEnum.Cancelled
                : InsuredLifeStatusEnum.Active;

            var removed = insuredLifeStatus == InsuredLifeStatusEnum.Cancelled;
            if (!member.JoinDate.HasValue && member.Policies != null)
            {
                member.JoinDate = member.Policies[0].PolicyInceptionDate.ToSaDateTime().Date;
            }
            var startDate = (DateTime)member.JoinDate.ToSaDateTime();
            var endDate = member.EndDate.CheckNullDate();
            if (removed)
            {
                if (!endDate.HasValue)
                {
                    endDate = DateTimeHelper.SaNow.Date;
                }
                else
                {
                    endDate = endDate.Value.ToSaDateTime().Date;
                }
            }
            else
            {
                endDate = null;
            }

            // Set benefit, premium and cover amount
            var benefitId = entity?.StatedBenefitId ?? 0;
            decimal? premium = null;
            decimal? coverAmount = null;
            if (member.Benefits?.Count > 0)
            {
                var benefit = member.Benefits.Find(b => b.BenefitType == BenefitTypeEnum.Basic);
                if (benefit != null)
                {
                    benefitId = benefit.Id;
                    if (savePremium)
                    {
                        premium = benefit.BenefitBaseRateLatest;
                        coverAmount = benefit.BenefitRateLatest;
                    }
                }
            }

            if (entity is null)
            {
                var createdby = RmaIdentity.Username ?? RmaIdentity.BackendServiceName;
                entity = new policy_PolicyInsuredLife
                {
                    PolicyId = policyId,
                    RolePlayerId = member.RolePlayerId,
                    RolePlayerTypeId = (int)rolePlayerType,
                    InsuredLifeStatus = insuredLifeStatus,
                    InsuredLifeRemovalReason = null,
                    StatedBenefitId = benefitId,
                    StartDate = startDate.Date,
                    EndDate = endDate,
                    Premium = premium,
                    CoverAmount = coverAmount,
                    IsDeleted = false,
                    CreatedBy = createdby,
                    ModifiedBy = createdby
                };
                _insuredLifeRepository.Create(entity);
            }
            else
            {
                entity.RolePlayerTypeId = (int)rolePlayerType;
                entity.InsuredLifeStatus = insuredLifeStatus;
                entity.InsuredLifeRemovalReason = removed
                    ? member.InsuredLifeRemovalReason
                    : null;
                entity.StatedBenefitId = removed
                    ? entity.StatedBenefitId
                    : benefitId;
                entity.StartDate = startDate.Date;
                entity.EndDate = endDate;
                entity.Premium = premium;
                entity.CoverAmount = coverAmount;
                entity.IsDeleted = false;
                _insuredLifeRepository.Update(entity);
            }
        }

        private async Task UpdatePolicyBeneficiaries(Case policyCase)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var mainMember = policyCase.MainMember;
                var policy = mainMember.Policies[0];
                var policyId = policy.PolicyId;
                var entities = await _rolePlayerRelationRepository
                    .Where(s => s.PolicyId == policyId
                             && s.RolePlayerTypeId == (int)RolePlayerTypeEnum.Beneficiary)
                    .ToListAsync();
                foreach (var beneficiary in policyCase.Beneficiaries)
                {
                    var allocationPercentage = beneficiary.FromRolePlayers?
                        .Where(r => r.AllocationPercentage.HasValue)
                        .Max(r => r.AllocationPercentage);
                    var entity = entities.SingleOrDefault(s => s.FromRolePlayerId == beneficiary.RolePlayerId);
                    if (entity is null)
                    {
                        if (!beneficiary.IsDeleted)
                        {
                            entity = new client_RolePlayerRelation
                            {
                                PolicyId = policyId,
                                FromRolePlayerId = beneficiary.RolePlayerId,
                                ToRolePlayerId = mainMember.RolePlayerId,
                                RolePlayerTypeId = (int)RolePlayerTypeEnum.Beneficiary,
                                AllocationPercentage = allocationPercentage
                            };
                            _rolePlayerRelationRepository.Create(entity);
                        }
                    }
                    else
                    {
                        entity.ToRolePlayerId = mainMember.RolePlayerId;
                        entity.RolePlayerTypeId = (int)RolePlayerTypeEnum.Beneficiary;
                        entity.AllocationPercentage = allocationPercentage;
                        _rolePlayerRelationRepository.Update(entity);
                    }
                }
                // Remove beneficiaries that are no longer in the policy case beneficiary list
                var validRolePlayerIds = policyCase.Beneficiaries
                    .Where(s => !s.IsDeleted)
                    .Select(s => s.RolePlayerId)
                    .Distinct()
                    .ToList();
                var removedBeneficiaries = entities
                    .Where(s => !validRolePlayerIds.Contains(s.FromRolePlayerId))
                    .ToList();
                foreach (var relation in removedBeneficiaries)
                {
                    var relationLife = await _rolePlayerRelationLifeRepository
                        .Where(s => s.RolePlayerRelationId == relation.Id)
                        .FirstOrDefaultAsync();
                    if (relationLife != null)
                    {
                        _rolePlayerRelationLifeRepository.Delete(relationLife);
                    }
                    _rolePlayerRelationRepository.Delete(relation);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task UpdatePolicyRolePlayerRelations(Case policyCase)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var mainMember = policyCase.MainMember;
                var policy = mainMember.Policies[0];
                var policyId = policy.PolicyId;
                var entities = await _rolePlayerRelationRepository
                    .Where(s => s.PolicyId == policyId
                             && s.RolePlayerTypeId != (int)RolePlayerTypeEnum.Beneficiary)
                    .ToListAsync();
                var relations = policyCase.Spouse.Concat(policyCase.Children).Concat(policyCase.ExtendedFamily).ToList();
                foreach (var relation in relations)
                {
                    var list = entities
                        .Where(s => s.FromRolePlayerId == relation.RolePlayerId)
                        .ToList();
                    var entity = list.FirstOrDefault();
                    // Remove extra roleplayer records
                    if (list.Count > 1)
                    {
                        for (int i = 1; i < list.Count; i++)
                        {
                            _rolePlayerRelationRepository.Delete(list[i]);
                        }
                    }
                    var rolePlayerTypeId = relation.FromRolePlayers.Count > 0
                        ? relation.FromRolePlayers[0].RolePlayerTypeId
                        : relation.PolicyInsuredLives[0].RolePlayerTypeId;
                    if (entity is null)
                    {

                        if (!relation.IsDeleted)
                        {
                            entity = new client_RolePlayerRelation
                            {
                                PolicyId = policyId,
                                FromRolePlayerId = relation.RolePlayerId,
                                ToRolePlayerId = mainMember.RolePlayerId,
                                RolePlayerTypeId = rolePlayerTypeId
                            };
                            _rolePlayerRelationRepository.Create(entity);
                        }
                    }
                    else
                    {
                        if (!relation.IsDeleted)
                        {
                            entity.ToRolePlayerId = mainMember.RolePlayerId;
                            entity.RolePlayerTypeId = rolePlayerTypeId;
                            _rolePlayerRelationRepository.Update(entity);
                        }
                        else
                        {
                            _rolePlayerRelationRepository.Delete(entity);
                        }
                    }
                }
                // Remove roleplayer relations from the database table that are no longer in the list.
                var validRolePlayerIds = relations
                    .Where(s => !s.IsDeleted)
                    .Select(s => s.RolePlayerId)
                    .Distinct()
                    .ToList();
                var removedRelations = entities
                    .Where(s => !validRolePlayerIds.Contains(s.FromRolePlayerId))
                    .ToList();
                foreach (var relation in removedRelations)
                {
                    _rolePlayerRelationRepository.Delete(relation);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task UpdatePolicyCase(Case policyCase)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var mainMember = policyCase.MainMember;
                var memberPolicy = mainMember.Policies[0];

                // Clear product bank account, otherwise this method tries to update the product configuration
                memberPolicy.ProductOption.Product.ProductBankAccounts = null;

                var policyEntity = await _policyRepository.FindByIdAsync(memberPolicy.PolicyId);
                policyEntity.PolicyOwnerId = memberPolicy.PolicyOwnerId;
                policyEntity.PolicyPayeeId = memberPolicy.PolicyPayeeId;
                policyEntity.PaymentFrequency = memberPolicy.PaymentFrequency;
                policyEntity.PaymentMethod = memberPolicy.PaymentMethod;
                policyEntity.InstallmentPremium = _totalPolicyPremium != 0.0M ? _totalPolicyPremium : memberPolicy.InstallmentPremium;
                policyEntity.AnnualPremium = _totalPolicyPremium != 0.0M ? _totalPolicyPremium * 12 : memberPolicy.AnnualPremium;
                policyEntity.PolicyInceptionDate = memberPolicy.PolicyInceptionDate.ToSaDateTime();
                policyEntity.FirstInstallmentDate = memberPolicy.FirstInstallmentDate.ToSaDateTime();
                policyEntity.DecemberInstallmentDayOfMonth = memberPolicy.DecemberInstallmentDayOfMonth;
                policyEntity.RegularInstallmentDayOfMonth = memberPolicy.RegularInstallmentDayOfMonth;
                if (memberPolicy.LastInstallmentDate != null)
                    policyEntity.LastInstallmentDate = memberPolicy.LastInstallmentDate;
                if (memberPolicy.LastReinstateDate != null)
                    policyEntity.LastReinstateDate = memberPolicy.LastReinstateDate;
                policyEntity.IsEuropAssist = memberPolicy.IsEuropAssist;
                policyEntity.EuropAssistEffectiveDate = memberPolicy.EuropAssistEffectiveDate;
                if (memberPolicy.EuropAssistEndDate != null)
                    policyEntity.EuropAssistEndDate = memberPolicy.EuropAssistEndDate;
                policyEntity.AdminPercentage = memberPolicy.AdminPercentage;
                policyEntity.CommissionPercentage = memberPolicy.CommissionPercentage;
                policyEntity.BinderFeePercentage = memberPolicy.BinderFeePercentage;
                policyEntity.ClientReference = string.IsNullOrEmpty(memberPolicy.ClientReference) ? null : memberPolicy.ClientReference;
                policyEntity.PolicyNotes = Mapper.Map<List<policy_PolicyNote>>(memberPolicy.PolicyNotes);

                policyEntity.ProductOptionId = memberPolicy.ProductOptionId;
                // Only ProductOptionId must be saved, no need to map the properties
                policyEntity.ProductOption = null;
                policyEntity.Benefits = null;

                // Already saved, do not update again
                policyEntity.RolePlayerRelations = null;
                policyEntity.PolicyInsuredLives = null;

                if (memberPolicy.FirstAlternativePolicyContact != null && !string.IsNullOrEmpty(memberPolicy.FirstAlternativePolicyContact.ContactName))
                {
                    var firstAlternativePolicyContact = memberPolicy.FirstAlternativePolicyContact.PolicyContactId > 0 ? await GetPolicyContact(memberPolicy.FirstAlternativePolicyContact.PolicyContactId) : null;
                    if (firstAlternativePolicyContact != null)
                    {
                        await UpdatePolicyContact(firstAlternativePolicyContact);
                    }
                    else
                    {
                        policyEntity.PolicyContacts.Add(new policy_PolicyContact
                        {
                            PolicyId = memberPolicy.PolicyId,
                            ContactName = memberPolicy.FirstAlternativePolicyContact.ContactName,
                            TelephoneNumber = memberPolicy.FirstAlternativePolicyContact.TelephoneNumber,
                            MobileNumber = memberPolicy.FirstAlternativePolicyContact.MobileNumber,
                            AlternativeNumber = memberPolicy.FirstAlternativePolicyContact.AlternativeNumber,
                            EmailAddress = memberPolicy.FirstAlternativePolicyContact.EmailAddress,
                            ContactType = memberPolicy.FirstAlternativePolicyContact.ContactType
                        });
                    }
                }
                if (memberPolicy.SecondAlternativePolicyContact != null && !string.IsNullOrEmpty(memberPolicy.SecondAlternativePolicyContact.ContactName))
                {
                    var secondAlternativePolicyContact = memberPolicy.SecondAlternativePolicyContact.PolicyContactId > 0 ? await GetPolicyContact(memberPolicy.SecondAlternativePolicyContact.PolicyContactId) : null;
                    if (secondAlternativePolicyContact != null)
                    {
                        await UpdatePolicyContact(secondAlternativePolicyContact);
                    }
                    else
                    {
                        var _isPolicyContactValid = !string.IsNullOrEmpty(memberPolicy.SecondAlternativePolicyContact.ContactName)
                                                 && !string.IsNullOrEmpty(memberPolicy.SecondAlternativePolicyContact.EmailAddress);
                        if (_isPolicyContactValid)
                        {
                            policyEntity.PolicyContacts.Add(new policy_PolicyContact
                            {
                                PolicyId = memberPolicy.PolicyId,
                                ContactName = memberPolicy.SecondAlternativePolicyContact.ContactName,
                                TelephoneNumber = memberPolicy.SecondAlternativePolicyContact.TelephoneNumber,
                                MobileNumber = memberPolicy.SecondAlternativePolicyContact.MobileNumber,
                                AlternativeNumber = memberPolicy.SecondAlternativePolicyContact.AlternativeNumber,
                                EmailAddress = memberPolicy.SecondAlternativePolicyContact.EmailAddress,
                                ContactType = memberPolicy.SecondAlternativePolicyContact.ContactType
                            });
                        }
                    }
                }
                _policyRepository.Update(policyEntity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                await _auditWriter.AddLastViewed<policy_Policy>(policyEntity.PolicyId);
            }
        }

        private async Task<List<Roleplayer>> SaveRolePlayerPersons(List<Roleplayer> members)
        {
            members = UpdateMemberIdNumbers(members);
            var list = new List<Roleplayer>();
            if (members == null || members.Count == 0) return list;
            foreach (var member in members)
            {
                var roleplayer = await SaveRolePlayerPerson(member);
                if (roleplayer != null)
                    list.Add(roleplayer);
            }
            return list;
        }

        private List<Roleplayer> UpdateMemberIdNumbers(List<Roleplayer> members)
        {
            foreach (var member in members)
            {
                if (member.Person != null)
                {
                    member.Person.IdNumber = (String.IsNullOrEmpty(member.Person.IdNumber)
                        ? member.Person.PassportNumber
                        : member.Person.IdNumber).ToUpper();
                }
            }
            return members;
        }

        private async Task<Roleplayer> SaveRolePlayerPerson(Roleplayer member)
        {
            Contract.Requires(member != null);
            Contract.Requires(member.Person != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                client_RolePlayer roleplayer = null;
                // Clean the id number up a bit, CDA is adding the time
                // to dates of birth used as id numbers
                var idNumber = member.Person.IdNumber.Replace("00:00:00.000", "").Trim();
                // Load existing persons with the same id number. There is a 
                // unique index on id number, so there should only be one
                var person = await _personRepository.FirstOrDefaultAsync(p => p.IdNumber == idNumber);

                if (member.RolePlayerId > 0)
                {
                    // Existing member, load the roleplayer and the person
                    roleplayer = await _rolePlayerRepository.SingleOrDefaultAsync(p => p.RolePlayerId == member.RolePlayerId);
                    await _rolePlayerRepository.LoadAsync(roleplayer, r => r.Person);

                    if (person != null && member.RolePlayerId != person.RolePlayerId)
                    {
                        // Problem, another person with the same id number already exists
                        // in the database. Make the id number unique by prefixing with rolePlayerId
                        member.Person.IdNumber = $"{member.RolePlayerId}-{idNumber}";
                    }
                    else
                    {
                        // No problem, there is not another person with the same id number
                        // in the database
                        member.Person.IdNumber = idNumber;
                    }
                    // Copy the member details to the existing roleplayer
                    LoadRoleplayerDetails(roleplayer.RolePlayerId, roleplayer, member);
                    // Update the existing member
                    _rolePlayerRepository.Update(roleplayer);
                }
                else
                {
                    // New member, get the next rolePlayerId to use
                    var rolePlayerId = await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);

                    // Create a new roleplayer and roleplayer.Person with the new rolePlayerId
                    roleplayer = new client_RolePlayer { RolePlayerId = rolePlayerId };
                    roleplayer.Person = new client_Person { RolePlayerId = rolePlayerId };

                    if (person == null)
                    {
                        // No problem, no person with the id number already exists in the database
                        member.Person.IdNumber = idNumber;
                    }
                    else
                    {
                        // Problem, another person with the same id number already exists in the
                        // database. Make the id number unique by prefixing it with the new rolePlayerId
                        member.Person.IdNumber = $"{rolePlayerId}-{idNumber}";
                    }
                    // Copy the member details to the new roleplayer
                    LoadRoleplayerDetails(rolePlayerId, roleplayer, member);
                    // Create a new member
                    _rolePlayerRepository.Create(roleplayer);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
                member.RolePlayerId = roleplayer.RolePlayerId;
                member.Person.RolePlayerId = roleplayer.RolePlayerId;
                return member;
            }
        }

        private List<Roleplayer> RemoveDuplicateBeneficiaries(List<Roleplayer> beneficiaries)
        {
            var list = new List<Roleplayer>();
            foreach (var beneficiary in beneficiaries)
            {
                var roleplayers = list.Where(r => r.RolePlayerId == beneficiary.RolePlayerId).ToList();
                if (roleplayers.Count == 0 && !beneficiary.IsDeleted)
                {
                    list.Add(beneficiary);
                }
            }
            return list;
        }

        public async Task EditGroupPolicyWizard(Case policyCase)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            Contract.Requires(policyCase != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                // Benefits are not required to edit a group policy, and a large benefit lists hangs the process
                policyCase.MainMember.Policies[0].Benefits = null;

                var rolePlayer = policyCase.MainMember;
                var policy = rolePlayer.Policies[0];
                policy.ClientReference = string.IsNullOrEmpty(policy.ClientReference) ? null : policy.ClientReference;

                await UpdateRolePlayer(rolePlayer, RolePlayerTypeEnum.MainMemberSelf);
                await UpdateCompany(rolePlayer);
                await UpdatePolicy(policyCase);
                await UpdateChildPolicyPremiums(policy.PolicyId);

                await scope.SaveChangesAsync();
            }
        }

        private async Task UpdateCompany(Roleplayer roleRlayer)
        {
            var policyOwner = roleRlayer.Policies[0].PolicyOwner;
            Contract.Requires(policyOwner != null);
            var entity = await _rolePlayerRepository.FindByIdAsync(policyOwner.RolePlayerId);
            if (entity != null)
            {
                entity.DisplayName = policyOwner.DisplayName;
                entity.TellNumber = policyOwner.TellNumber;
                entity.CellNumber = policyOwner.CellNumber;
                entity.PreferredCommunicationTypeId = policyOwner.PreferredCommunicationTypeId ?? (int)CommunicationTypeEnum.Post;
                entity.Company.RolePlayerId = policyOwner.RolePlayerId;
                entity.Company.SchemeClassification = new client_SchemeClassification()
                {
                    RolePlayerId = roleRlayer.RolePlayerId,
                    Underwritten = roleRlayer.Company.SchemeClassification.Underwritten,
                    PolicyHolderType = roleRlayer.Company.SchemeClassification.PolicyHolderType,
                    IsPartnership = roleRlayer.Company.SchemeClassification.IsPartnership
                };

                _rolePlayerRepository.Update(entity);
            }
        }

        public async Task EditPolicyWizard(Case policyCase)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            Contract.Requires(policyCase != null);
            var mainMember = policyCase.MainMember;

            var spouses = policyCase.Spouse.Where(c => c.Person.RolePlayerId > 0);
            var children = policyCase.Children.Where(c => c.Person.RolePlayerId > 0);
            var beneficiaries = policyCase.Beneficiaries.Where(c => c.Person.RolePlayerId > 0);
            var extendeds = policyCase.ExtendedFamily.Where(c => c.Person.RolePlayerId > 0);

            var policy = policyCase.MainMember.Policies[0];
            policy.ClientReference = string.IsNullOrEmpty(policy.ClientReference) ? null : policy.ClientReference;

            using (var scope = _dbContextScopeFactory.Create())
            {
                foreach (var child in children)
                {
                    await UpdateRolePlayer(child, RolePlayerTypeEnum.Child);
                }
                foreach (var beneficiary in beneficiaries)
                {
                    await UpdateRolePlayer(beneficiary, RolePlayerTypeEnum.Other);
                }
                foreach (var extended in extendeds)
                {
                    await UpdateRolePlayer(extended, RolePlayerTypeEnum.Extended);
                }
                foreach (var spouse in spouses)
                {
                    await UpdateRolePlayer(spouse, RolePlayerTypeEnum.Spouse);
                }

                await UpdateRolePlayer(mainMember, RolePlayerTypeEnum.MainMemberSelf);
                await UpdatePolicy(policyCase);

                await scope.SaveChangesAsync();

            }

            await UpdatePolicyPremiums(policyCase);
        }

        private async Task UpdateRolePlayer(Roleplayer roleplayer, RolePlayerTypeEnum type)
        {
            switch (type)
            {
                case RolePlayerTypeEnum.Spouse:
                case RolePlayerTypeEnum.Child:
                case RolePlayerTypeEnum.Extended:
                case RolePlayerTypeEnum.Beneficiary:
                    await UpdateInsuredLife(roleplayer);
                    break;
                case RolePlayerTypeEnum.MainMemberSelf:
                    await UpdateMainMember(roleplayer);
                    break;
            }
        }

        private async Task UpdateInsuredLife(Roleplayer rolePlayer)
        {
            var entity = await _rolePlayerRepository.FindByIdAsync(rolePlayer.Person.RolePlayerId);
            if (entity != null)
            {
                await _rolePlayerRepository.LoadAsync(entity, c => c.Person);
                await _rolePlayerRepository.LoadAsync(entity, c => c.RolePlayerAddresses);
                await _rolePlayerRepository.LoadAsync(entity, c => c.RolePlayerBankingDetails);

                MapNewRolePlayerValues(entity.RolePlayerId, entity, rolePlayer);
                if (entity.Person != null && string.IsNullOrEmpty(entity.Person.IdNumber))
                {
                    entity.Person.IdNumber = rolePlayer.Person.PassportNumber;
                }
                _rolePlayerRepository.Update(entity);
            }
        }

        public async Task<PagedRequestResult<RolePlayerPolicy>> GetRolePlayerAmendments(int rolePlayerId, int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _rolePlayerRepository.Where(e => e.RolePlayerId == rolePlayerId).FirstOrDefaultAsync();
                if (entity != null)
                {
                    await _rolePlayerRepository.LoadAsync(entity, c => c.Company);
                    await _rolePlayerRepository.LoadAsync(entity, c => c.Person);
                    await _rolePlayerRepository.LoadAsync(entity, c => c.RolePlayerAddresses);
                    await _rolePlayerRepository.LoadAsync(entity, c => c.RolePlayerBankingDetails);
                }
                var policy = await _policyRepository.Where(p => p.PolicyId == policyId).FirstOrDefaultAsync();
                policy.PolicyOwner = entity;

                var roleplayer = Mapper.Map<RolePlayerPolicy>(policy);
                List<RolePlayerPolicy> rolePlayerPolicyList = new List<RolePlayerPolicy>();
                rolePlayerPolicyList.Add(roleplayer);

                var results = new Common.Entities.DatabaseQuery.PagedRequestResult<RolePlayerPolicy>
                {
                    Data = rolePlayerPolicyList,
                    Page = 1,
                    PageCount = 1,
                    RowCount = 1
                };
                return results;
            }
        }

        private async Task UpdateMainMember(Roleplayer rolePlayer)
        {
            var entity = await _rolePlayerRepository.FindByIdAsync(rolePlayer.RolePlayerId);
            if (entity != null)
            {
                if (rolePlayer.Company != null)
                {
                    await _rolePlayerRepository.LoadAsync(entity, c => c.Company);
                }
                else if (rolePlayer.Person != null)
                {
                    await _rolePlayerRepository.LoadAsync(entity, c => c.Person);
                }

                await _rolePlayerRepository.LoadAsync(entity, c => c.RolePlayerAddresses);
                await _rolePlayerRepository.LoadAsync(entity, c => c.RolePlayerBankingDetails);

                MapNewRolePlayerValues(entity.RolePlayerId, entity, rolePlayer);

                if (entity.Person != null && string.IsNullOrEmpty(entity.Person.IdNumber))
                {
                    entity.Person.IdNumber = rolePlayer.Person.PassportNumber;
                }

                _rolePlayerRepository.Update(entity);
            }
        }

        public async Task<int> VerifyPolicyExists(string policyNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = await _policyRepository.Where(s => s.PolicyNumber == policyNumber).ToListAsync();

                if (policies.Count > 0)
                {
                    var entity = policies.FirstOrDefault();
                    return entity.PolicyId;
                }
                return 0;
            }
        }

        private string FixIdentificationNumber(int rolePlayerId, string idNumber)
        {
            if (DateTime.TryParse(idNumber, out DateTime dtm))
            {
                return $"{dtm:yyyy/MM/dd}-{rolePlayerId}";
            }
            // Just return the captured ID number if it is note a date for now,
            // we can add some more alterations later as required.
            return idNumber;
        }

        private client_RolePlayer MapNewRolePlayerValues(int rolePlayerId, client_RolePlayer entity, Roleplayer rolePlayer)
        {
            if (entity.Person != null)
            {
                var firstName = rolePlayer.Person.FirstName.Trim();
                var surname = rolePlayer.Person.Surname.Trim();
                rolePlayer.Person.IdNumber = String.IsNullOrEmpty(rolePlayer.Person.IdNumber)
                    ? rolePlayer.Person.PassportNumber
                    : rolePlayer.Person.IdNumber;
                entity.DisplayName = $"{firstName} {surname}";
                entity.RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
                entity.Person.FirstName = firstName;
                entity.Person.Surname = surname;
                entity.Person.IdType = rolePlayer.Person.IdType;
                if (string.IsNullOrEmpty(rolePlayer.Person.IdNumber))
                    rolePlayer.Person.IdNumber = rolePlayer.Person.PassportNumber;
                if (entity.Person.IdType != IdTypeEnum.SAIDDocument)
                {
                    var idNumber = FixIdentificationNumber(rolePlayerId, rolePlayer.Person.IdNumber);
                    if (entity.Person.IdNumber != idNumber)
                        entity.Person.IdNumber = idNumber;

                    if (rolePlayer.Person.IdNumber != idNumber)
                        rolePlayer.Person.IdNumber = idNumber;
                }
                else
                {
                    if (String.IsNullOrEmpty(entity.Person.IdNumber) || rolePlayer.Person.IdNumber != entity.Person.IdNumber)
                        entity.Person.IdNumber = rolePlayer.Person.IdNumber;
                }
                entity.Person.IsStudying = rolePlayer.Person.IsStudying;
                entity.Person.IsDisabled = rolePlayer.Person.IsDisabled;
                entity.Person.DateOfBirth = rolePlayer.Person.DateOfBirth;
            }

            if (entity.Company != null)
            {
                entity.DisplayName = rolePlayer.Company.CompanyName;
                entity.Company.Name = rolePlayer.Company.Name;
                entity.Company.ReferenceNumber = rolePlayer.Company.ReferenceNumber;
                entity.Company.VatRegistrationNo = rolePlayer.Company.VatRegistrationNo;
                entity.Company.IdNumber = rolePlayer.Company.CompanyRegNo;
            }

            entity.CellNumber = rolePlayer.CellNumber;
            entity.EmailAddress = rolePlayer.EmailAddress;
            entity.TellNumber = rolePlayer.TellNumber;
            entity.PreferredCommunicationTypeId = rolePlayer.PreferredCommunicationTypeId != 0 ? rolePlayer.PreferredCommunicationTypeId : null;

            if (rolePlayer.RolePlayerAddresses?.Count > 0)
            {
                foreach (var address in rolePlayer.RolePlayerAddresses.Where(c => c.RolePlayerAddressId == 0))
                {
                    var mappedAddress = Mapper.Map<client_RolePlayerAddress>(address);
                    mappedAddress.RolePlayerId = entity.RolePlayerId;
                    if (mappedAddress.CountryId < 1)
                    {
                        mappedAddress.CountryId = 1;//hard coded to south africa
                    }
                    entity.RolePlayerAddresses.Add(mappedAddress);
                }
            }

            if (rolePlayer.RolePlayerBankingDetails?.Count > 0)
            {
                foreach (var banking in rolePlayer.RolePlayerBankingDetails.Where(c => c.RolePlayerBankingId == 0))
                {
                    var mappedBanking = Mapper.Map<client_RolePlayerBankingDetail>(banking);
                    mappedBanking.RolePlayerId = entity.RolePlayerId;
                    mappedBanking.PurposeId = 1; // collections

                    entity.RolePlayerBankingDetails.Add(mappedBanking);
                }
            }
            return entity;
        }

        private async Task UpdatePolicy(Case policyCase)
        {
            var policy = policyCase.MainMember.Policies[0];
            var entity = await _policyRepository.FindByIdAsync(policy.PolicyId);
            if (entity != null)
            {
                if (await _configurationService.IsFeatureFlagSettingEnabled(PolicyUpdateLoadBenefitsFeatureFFL))
                {
                    await _policyRepository.LoadAsync(entity, c => c.PolicyInsuredLives);
                    await _policyRepository.LoadAsync(entity, c => c.Benefits);
                }
                entity.PolicyOwnerId = policy.PolicyOwnerId;
                entity.PolicyPayeeId = policy.PolicyPayeeId;
                entity.PaymentFrequency = policy.PaymentFrequency;
                entity.PaymentMethod = policy.PaymentMethod;
                entity.InstallmentPremium = policy.InstallmentPremium;
                entity.AnnualPremium = policy.AnnualPremium;
                entity.ProductOption = Mapper.Map<product_ProductOption>(policy.ProductOption);
                entity.ProductOptionId = policy.ProductOptionId;
                entity.PolicyInceptionDate = policy.PolicyInceptionDate.ToSaDateTime();
                entity.FirstInstallmentDate = policy.FirstInstallmentDate.ToSaDateTime();
                entity.DecemberInstallmentDayOfMonth = policy.DecemberInstallmentDayOfMonth;
                entity.RegularInstallmentDayOfMonth = policy.RegularInstallmentDayOfMonth;
                if (policy.LastInstallmentDate != null)
                    entity.LastInstallmentDate = policy.LastInstallmentDate;
                if (policy.LastReinstateDate != null)
                    entity.LastReinstateDate = policy.LastReinstateDate;
                entity.IsEuropAssist = policy.IsEuropAssist;
                entity.EuropAssistEffectiveDate = policy.EuropAssistEffectiveDate;
                if (policy.EuropAssistEndDate != null)
                    entity.EuropAssistEndDate = policy.EuropAssistEndDate;
                entity.AdminPercentage = policy.AdminPercentage;
                entity.CommissionPercentage = policy.CommissionPercentage;
                entity.BinderFeePercentage = policy.BinderFeePercentage;
                entity.PremiumAdjustmentPercentage = policy.PremiumAdjustmentPercentage;

                await _policyRepository.LoadAsync(entity, c => c.Benefits);
                entity.Benefits.Clear();
                entity.Benefits = Mapper.Map<List<product_Benefit>>(policy.Benefits);

                if (policy.AdminPolicyContact != null)
                {
                    var adminPolicyContact = policy.AdminPolicyContact.PolicyContactId > 0 ? await GetPolicyContact(policy.AdminPolicyContact.PolicyContactId) : null;
                    if (adminPolicyContact != null)
                    {
                        await UpdatePolicyContact(adminPolicyContact);
                    }
                    else
                    {
                        var _isPolicyContactValid = policy.AdminPolicyContact.ContactName != null && policy.AdminPolicyContact.EmailAddress != null;
                        if (_isPolicyContactValid)
                        {
                            entity.PolicyContacts.Add(new policy_PolicyContact
                            {
                                PolicyId = policy.PolicyId,
                                ContactName = policy.AdminPolicyContact.ContactName,
                                TelephoneNumber = policy.AdminPolicyContact.TelephoneNumber,
                                MobileNumber = policy.AdminPolicyContact.MobileNumber,
                                AlternativeNumber = policy.AdminPolicyContact.AlternativeNumber,
                                EmailAddress = policy.AdminPolicyContact.EmailAddress,
                                ContactType = policy.AdminPolicyContact.ContactType
                            });
                        }
                    }
                }

                if (policy.BrokerPolicyContact != null)
                {
                    var _brokerPolicyContact = policy.BrokerPolicyContact.PolicyContactId > 0 ? await GetPolicyContact(policy.BrokerPolicyContact.PolicyContactId) : null;
                    if (_brokerPolicyContact != null)
                    {
                        await UpdatePolicyContact(_brokerPolicyContact);
                    }
                    else
                    {
                        var _isPolicyContactValid = policy.BrokerPolicyContact.ContactName != null && policy.BrokerPolicyContact.EmailAddress != null;
                        if (_isPolicyContactValid)
                        {
                            entity.PolicyContacts.Add(new policy_PolicyContact
                            {
                                PolicyId = policy.PolicyId,
                                ContactName = policy.BrokerPolicyContact.ContactName,
                                TelephoneNumber = policy.BrokerPolicyContact.TelephoneNumber,
                                MobileNumber = policy.BrokerPolicyContact.MobileNumber,
                                AlternativeNumber = policy.BrokerPolicyContact.AlternativeNumber,
                                EmailAddress = policy.BrokerPolicyContact.EmailAddress,
                                ContactType = policy.BrokerPolicyContact.ContactType
                            });
                        }
                    }
                }

                if (policy.PolicyDocumentCommunicationMatrix != null)
                {
                    var _policyDocumentCommunicationMatrix = policy.PolicyDocumentCommunicationMatrix.PolicyDocumentCommunicationMatrixId > 0 ? await GetPolicyDocumentCommunication(policy.PolicyDocumentCommunicationMatrix.PolicyDocumentCommunicationMatrixId) : null;
                    if (_policyDocumentCommunicationMatrix != null)
                    {
                        await UpdatePolicyDocumentCommunication(_policyDocumentCommunicationMatrix);
                    }
                    else
                    {
                        entity.PolicyDocumentCommunicationMatrices = new List<policy_PolicyDocumentCommunicationMatrix>
                        {
                            new policy_PolicyDocumentCommunicationMatrix
                            {
                                PolicyId = policy.PolicyId,
                                SendPolicyDocsToBroker = policy.PolicyDocumentCommunicationMatrix.SendPolicyDocsToBroker,
                                SendPolicyDocsToAdmin = policy.PolicyDocumentCommunicationMatrix.SendPolicyDocsToAdmin,
                                SendPolicyDocsToMember = policy.PolicyDocumentCommunicationMatrix.SendPolicyDocsToMember,
                                SendPolicyDocsToScheme = policy.PolicyDocumentCommunicationMatrix.SendPolicyDocsToScheme,
                                SendPaymentScheduleToBroker = policy.PolicyDocumentCommunicationMatrix.SendPaymentScheduleToBroker
                            }
                        };
                    }

                }
                _policyRepository.Update(entity);
            }
        }

        public async Task RemoveDeletedRelations(Case policyCase)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            Contract.Requires(policyCase != null);

            var mainMember = policyCase.MainMember;
            var mainMemberId = mainMember.RolePlayerId;
            var policyId = policyCase.MainMember.Policies[0].PolicyId;

            var spouses = policyCase.Spouse.Where(c => c.RolePlayerId > 0).ToList();
            var children = policyCase.Children.Where(c => c.RolePlayerId > 0).ToList();
            var family = policyCase.ExtendedFamily.Where(c => c.RolePlayerId > 0).ToList();

            var rolePlayerIds = new List<int>();
            if (spouses != null && spouses.Count > 0)
            {
                rolePlayerIds.AddRange(spouses.Select(s => s.RolePlayerId).ToList<int>());
            }
            if (children != null && children.Count > 0)
            {
                rolePlayerIds.AddRange(children.Select(s => s.RolePlayerId).ToList<int>());
            }
            if (family != null && family.Count > 0)
            {
                rolePlayerIds.AddRange(family.Select(s => s.RolePlayerId).ToList<int>());
            }
            await RemoveRolePlayerRelations(policyId, rolePlayerIds);
            await RemovePolicyInsuredLives(mainMemberId, policyId, rolePlayerIds);

            var beneficiaries = policyCase.Beneficiaries.Where(c => c.RolePlayerId > 0).ToList();
            if (beneficiaries != null && beneficiaries.Count > 0)
            {
                var beneficiaryIds = beneficiaries.Select(s => s.RolePlayerId).ToList<int>();
                await RemoveBeneficiaries(policyId, beneficiaryIds);
            }
        }

        private async Task RemovePolicyInsuredLives(int mainMemberId, int policyId, List<int> rolePlayerIds)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var deletedInsuredLives = await _insuredLifeRepository
                    .Where(s => s.PolicyId == policyId
                        && s.RolePlayerId != mainMemberId
                        && !rolePlayerIds.Contains(s.RolePlayerId))
                    .ToListAsync();
                if (deletedInsuredLives.Count > 0)
                {
                    _insuredLifeRepository.Delete(deletedInsuredLives);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        private async Task RemoveBeneficiaries(int policyId, List<int> rolePlayerIds)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var deleteRolePlayers = await _rolePlayerRelationRepository
                    .Where(s => s.PolicyId == policyId
                        && s.RolePlayerTypeId == (int)RolePlayerTypeEnum.Beneficiary
                        && !rolePlayerIds.Contains(s.FromRolePlayerId))
                    .ToListAsync();

                if (deleteRolePlayers.Count > 0)
                {
                    _rolePlayerRelationRepository.Delete(deleteRolePlayers);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        private async Task RemoveRolePlayerRelations(int policyId, List<int> rolePlayerIds)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var deleteRolePlayers = await _rolePlayerRelationRepository
                    .Where(s => s.PolicyId == policyId
                        && s.RolePlayerTypeId != (int)RolePlayerTypeEnum.Beneficiary
                        && !rolePlayerIds.Contains(s.FromRolePlayerId))
                    .ToListAsync();
                if (deleteRolePlayers.Count > 0)
                {
                    _rolePlayerRelationRepository.Delete(deleteRolePlayers);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task SaveRolePlayerRelations(Case policyCase)
        {
            Contract.Requires(policyCase != null);
            // Found that in some cases beneficiaries repeat
            policyCase.Beneficiaries = RemoveDuplicateBeneficiaries(policyCase.Beneficiaries.ToList());
            // Update main member details. Address and banking details are also saved here
            policyCase.MainMember = await SaveRolePlayerPerson(policyCase.MainMember);
            // Insert / update policy member roleplayers and persons. RoleplayerId's for new
            // members are assigned here as well, so we have to update the policyCase list.
            policyCase.Spouse = await SaveRolePlayerPersons(policyCase.Spouse);
            policyCase.Children = await SaveRolePlayerPersons(policyCase.Children);
            policyCase.ExtendedFamily = await SaveRolePlayerPersons(policyCase.ExtendedFamily);
            policyCase.Beneficiaries = await SaveRolePlayerPersons(policyCase.Beneficiaries);
            // Save roleplayer relations
            await UpdatePolicyRolePlayerRelations(policyCase);
            // Save beneficiaries
            await UpdatePolicyBeneficiaries(policyCase);
            // Save policy insured lives
            await UpdatePolicyInsuredLives(policyCase);
        }

        private async Task RemoveUnusedRolePlayerRelations(int policyId, List<Tuple<int, int>> roleplayers)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var updates = 0;
                foreach (var roleplayer in roleplayers)
                {
                    var relations = await _rolePlayerRelationRepository
                        .Where(rr => rr.PolicyId == policyId
                                  && rr.FromRolePlayerId == roleplayer.Item1
                                  && rr.RolePlayerTypeId != roleplayer.Item2
                                  && rr.RolePlayerTypeId != (int)RolePlayerTypeEnum.Beneficiary)
                        .ToListAsync();
                    if (relations.Count > 0)
                    {
                        _rolePlayerRelationRepository.Delete(relations);
                        updates++;
                    }
                }
                if (updates > 0)
                    await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task UpdateMainMemberRelations(int policyId, int mainMemberId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var updates = 0;
                var relations = await _rolePlayerRelationRepository
                    .Where(r => r.PolicyId == policyId
                                && r.ToRolePlayerId != mainMemberId)
                    .ToListAsync();
                foreach (var relation in relations)
                {
                    relation.ToRolePlayerId = mainMemberId;
                    _rolePlayerRelationRepository.Update(relation);
                    updates++;
                }

                var mainMember = await _rolePlayerRelationRepository
                    .SingleOrDefaultAsync(r => r.PolicyId == policyId
                                            && r.RolePlayerTypeId == (int)RolePlayerTypeEnum.Beneficiary
                                            && r.FromRolePlayerId == mainMemberId
                                            && r.ToRolePlayerId == mainMemberId);
                if (mainMember == null)
                {
                    var relation = new client_RolePlayerRelation
                    {
                        FromRolePlayerId = mainMemberId,
                        ToRolePlayerId = mainMemberId,
                        RolePlayerTypeId = (int)RolePlayerTypeEnum.Beneficiary,
                        PolicyId = policyId
                    };
                    _rolePlayerRelationRepository.Create(relation);
                    updates++;
                }

                if (updates > 0)
                    await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private void LoadRoleplayerDetails(int rolePlayerId, client_RolePlayer roleplayer, Roleplayer member)
        {
            int? communicationType = null;
            if (member.PreferredCommunicationTypeId.HasValue && member.PreferredCommunicationTypeId.Value > 0)
            {
                communicationType = member.PreferredCommunicationTypeId;
            }
            roleplayer.DisplayName = member.DisplayName;
            roleplayer.TellNumber = member.TellNumber;
            roleplayer.CellNumber = member.CellNumber;
            roleplayer.EmailAddress = member.EmailAddress;
            roleplayer.PreferredCommunicationTypeId = communicationType;
            roleplayer.RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
            roleplayer.IsDeleted = false;

            if (roleplayer.Person is null)
            {
                roleplayer.Person = new client_Person();
            }
            roleplayer.Person.RolePlayerId = roleplayer.RolePlayerId;
            roleplayer.Person.FirstName = member.Person.FirstName;
            roleplayer.Person.Surname = member.Person.Surname;
            roleplayer.Person.IdType = member.Person.IdType;
            member.Person.IdNumber = String.IsNullOrEmpty(member.Person.IdNumber)
                ? member.Person.PassportNumber
                : member.Person.IdNumber;
            if (member.Person.IdType != IdTypeEnum.SAIDDocument)
            {
                var idNumber = FixIdentificationNumber(rolePlayerId, member.Person.IdNumber);
                roleplayer.Person.IdNumber = idNumber;
                member.Person.IdNumber = idNumber;
            }
            else
            {
                roleplayer.Person.IdNumber = member.Person.IdNumber;
            }
            roleplayer.Person.DateOfBirth = member.Person.DateOfBirth;
            roleplayer.Person.IsAlive = member.Person.IsAlive;
            roleplayer.Person.DateOfDeath = member.Person.DateOfDeath;
            roleplayer.Person.DeathCertificateNumber = member.Person.DeathCertificateNumber;
            roleplayer.Person.IsVopdVerified = member.Person.IsVopdVerified;
            roleplayer.Person.DateVopdVerified = member.Person.DateVopdVerified;
            roleplayer.Person.IsStudying = member.Person.IsStudying;
            roleplayer.Person.IsDisabled = member.Person.IsDisabled;
            roleplayer.Person.IsDeleted = false;

            if (member.RolePlayerAddresses?.Count > 0)
            {
                foreach (var address in member.RolePlayerAddresses.Where(c => c.RolePlayerAddressId == 0))
                {
                    var mappedAddress = Mapper.Map<client_RolePlayerAddress>(address);
                    mappedAddress.RolePlayerId = roleplayer.RolePlayerId;
                    if (mappedAddress.CountryId < 1)
                    {
                        mappedAddress.CountryId = 1;    // assign a default value
                    }
                    roleplayer.RolePlayerAddresses.Add(mappedAddress);
                }
            }

            if (member.RolePlayerBankingDetails?.Count > 0)
            {
                foreach (var banking in member.RolePlayerBankingDetails.Where(c => c.RolePlayerBankingId == 0))
                {
                    var mappedBanking = Mapper.Map<client_RolePlayerBankingDetail>(banking);
                    mappedBanking.RolePlayerId = roleplayer.RolePlayerId;
                    mappedBanking.PurposeId = (int)BankingPurposeEnum.Collections;
                    roleplayer.RolePlayerBankingDetails.Add(mappedBanking);
                }
            }
        }

        public async Task<int> MovePolicies(MovePoliciesCase policyMovementCase)
        {
            Contract.Requires(policyMovementCase != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            var policyMovement = policyMovementCase.PolicyMovement;
            var policyMovementId = 0;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<policy_PolicyMovement>(policyMovement);
                entity.Policies = null;
                entity.DestinationBrokerage.BrokerageBrokerConsultants = null;
                entity.SourceBrokerage.BrokerageBrokerConsultants = null;
                _policyMovementRepository.Create(entity);
                await scope.SaveChangesAsync();
                policyMovementId = entity.PolicyMovementId;
            }

            var brokerageId = policyMovement.DestinationBrokerage.Id;
            var representativeId = policyMovement.DestinationRep.Id;
            var juristicRepresentativeId = policyMovement.DestinationRep.ActiveBrokerage?.JuristicRepId;
            var effectiveDate = policyMovement.EffectiveDate.ToSaDateTime();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = policyMovement.Policies;
                foreach (var policy in policyMovement.Policies)
                {
                    await _policyRepository.ExecuteSqlCommandAsync(
                        DatabaseConstants.MovePolicyBroker,
                            new SqlParameter("@policyMovementId", policyMovementId),
                            new SqlParameter("@policyId", policy.PolicyId),
                            new SqlParameter("@newBrokerageId", brokerageId),
                            new SqlParameter("@newRepresentativeId", representativeId),
                            new SqlParameter("@juristicRepresentativeId", (object)juristicRepresentativeId ?? DBNull.Value),
                            new SqlParameter("@effectiveDate", effectiveDate),
                            new SqlParameter("@userId", RmaIdentity.Email));
                }
            }

            return policyMovementId;
        }

        public async Task<List<RolePlayerPolicy>> GetPoliciesByRepresentativeId(int representativeId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyBrokers = await _policyBrokerRepository
                    .Where(c => c.RepId == representativeId
                        && !c.IsDeleted
                        && c.EffectiveDate <= DateTimeHelper.SaNow)
                    .ToListAsync();
                var policyIds = policyBrokers
                    .Select(pb => pb.PolicyId)
                    .Distinct()
                    .ToList();
                var policies = _policyRepository
                    .Where(c => policyIds.Contains(c.PolicyId))
                    .OrderBy(c => c.PolicyNumber)
                    .ToList();
                var results = new List<policy_Policy>();
                foreach (var policy in policies)
                {
                    policy.PolicyBrokers = policyBrokers
                        .Where(pb => pb.PolicyId == policy.PolicyId)
                        .ToList();
                    var latestRepresentative = policy.PolicyBrokers
                        .OrderByDescending(r => r.EffectiveDate)
                        .FirstOrDefault();
                    if (latestRepresentative == null) continue;
                    if (latestRepresentative.RepId == representativeId)
                    {
                        results.Add(policy);
                    }
                }
                await _policyRepository.LoadAsync(results, c => c.ProductOption);
                await _policyRepository.LoadAsync(results, c => c.PolicyOwner);
                results = results.OrderBy(p => p.PolicyNumber).ToList();
                return Mapper.Map<List<RolePlayerPolicy>>(results);
            }
        }

        public async Task<List<RolePlayerPolicy>> SearchPoliciesForCase(string query)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = await _policyRepository
                    .Where(c => c.PolicyNumber.Contains(query.Trim()))
                    .ToListAsync();
                await _policyRepository.LoadAsync(policies, c => c.PolicyOwner);
                await _policyRepository.LoadAsync(policies, c => c.PolicyBrokers);
                return Mapper.Map<List<RolePlayerPolicy>>(policies);
            }
        }

        public async Task<List<RolePlayerPolicy>> SearchPoliciesByRolePlayerForCase(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyIds = await _insuredLifeRepository
                    .Where(l => l.RolePlayerId == rolePlayerId)
                    .Select(r => r.PolicyId)
                    .ToListAsync();
                var policies = _policyRepository
                    .Where(c => policyIds.Contains(c.PolicyId));
                foreach (var policy in policies)
                {
                    await LoadReferenceData(policy);
                }
                return Mapper.Map<List<RolePlayerPolicy>>(policies);
            }
        }

        public async Task<List<RolePlayerPolicy>> SearchPoliciesByRolePlayerForRelationsCase(int rolePlayerId, bool isMainMember)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyIds = await _insuredLifeRepository
                    .Where(l => l.RolePlayerId == rolePlayerId)
                    .Select(r => r.PolicyId)
                    .ToListAsync();
                var policies = _policyRepository
                    .Where(c => policyIds.Contains(c.PolicyId));
                if (isMainMember)
                {
                    foreach (var policy in policies)
                    {
                        await _policyRepository.LoadAsync(policy, r => r.ProductOption);
                        await _policyRepository.LoadAsync(policy, r => r.Benefits);
                        await _policyRepository.LoadAsync(policy, r => r.PolicyInsuredLives);
                        foreach (var benefit in policy.Benefits)
                        {
                            await _productBenefitRepository.LoadAsync(benefit, b => b.BenefitRates);
                        }
                    }
                }
                return Mapper.Map<List<RolePlayerPolicy>>(policies);
            }
        }

        public async Task<List<RolePlayerPolicy>> SearchPoliciesByIdNumberForCase(string query)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayers = await _rolePlayerRepository
                    .Where(c => c.Person.IdNumber.Contains(query.Trim()))
                    .Select(s => s.RolePlayerId)
                    .ToListAsync();
                var policyIds = await _insuredLifeRepository
                    .Where(l => rolePlayers.Contains(l.RolePlayerId))
                    .Select(r => r.PolicyId)
                    .ToListAsync();
                var policies = _policyRepository
                    .Where(c => policyIds.Contains(c.PolicyId));
                foreach (var policy in policies)
                {
                    await LoadReferenceData(policy);
                }
                return Mapper.Map<List<RolePlayerPolicy>>(policies);
            }
        }

        public async Task<PolicyMovement> VerifyPolicyMovementExists(string refNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _policyMovementRepository.SingleOrDefaultAsync(s => s.MovementRefNo == refNumber);
                if (entity != null)
                {
                    await _policyMovementRepository.LoadAsync(entity, c => c.Policies);
                    await _policyMovementRepository.LoadAsync(entity, c => c.DestinationBrokerage);
                    await _policyMovementRepository.LoadAsync(entity, c => c.SourceBrokerage);
                    await _policyMovementRepository.LoadAsync(entity, c => c.DestinationRep);
                    await _policyMovementRepository.LoadAsync(entity, c => c.SourceRep);
                }
                return Mapper.Map<PolicyMovement>(entity);
            }
        }

        public async Task<bool> CancelPolicy(string policyNumber)
        {
            await CancelPendingPolicies(policyNumber);
            return true;
        }

        public Task<bool> CancelPolicies()
        {
            // Run in the background, because there is a very good chance that it
            // will time out when called from the scheduler
            _ = Task.Run(() => CancelPendingPolicies(null));
            return Task.FromResult(true);
        }

        public async Task CancelPendingPolicies(string policyNumber)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);
            var canCancelPolicies = await _configurationService.IsFeatureFlagSettingEnabled("PolicyCancellationFeature");
            if (!canCancelPolicies) return;

            try
            {
                // All policies with a cancellation date before or on the
                // cutoff date will be cancelled
                var cutoffDate = DateTime.Today.StartOfTheDay();
                if (!string.IsNullOrWhiteSpace(policyNumber))
                {
                    await CancelSinglePolicy(policyNumber);
                }
                else
                {
                    await CancelPendingSchemes(cutoffDate);
                    await CancelPendingSchemePolicies(cutoffDate);
                    await CancelPendingIndividualPolicyies(cutoffDate);
                }
                await _rolePlayerPolicyInvoiceService.AssignInvoiceNumbers();
            }
            catch (Exception ex)
            {
                ex.LogException("Cancel Policies Error");
            }
        }

        private async Task CancelPendingCancellationPolicies(List<policy_Policy> policies, bool groupPolicyCancelled)
        {
            var policyNumbers = new List<string>();
            foreach (var policy in policies)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    // Use a stored procedure because it is a bulk update. Some schemes have hundreds
                    // of child policies to lapse
                    var data = await _policyRepository.SqlQueryAsync<Lookup>(
                        DatabaseConstants.CancelPendingPolicy,
                        new SqlParameter { ParameterName = "@policyId", Value = policy.PolicyId }
                    );

                    if (data.Count != 5)
                        throw new Exception($"Incorrect number of datasets returned from CancelPendingPolicy stored procedure for policy {policy.PolicyId}");

                    var changeMessage = JsonConvert.DeserializeObject<BillingPolicyChangeMessage>(data[0].Name);
                    changeMessage.OldPolicyDetails = JsonConvert.DeserializeObject<BillingPolicyChangeDetail>(data[1].Name);
                    changeMessage.NewPolicyDetails = JsonConvert.DeserializeObject<BillingPolicyChangeDetail>(data[2].Name);
                    changeMessage.OldPolicyDetails.ChildBillingPolicyChangeDetails = JsonConvert.DeserializeObject<List<BillingPolicyChangeDetail>>(data[3].Name);
                    changeMessage.NewPolicyDetails.ChildBillingPolicyChangeDetails = JsonConvert.DeserializeObject<List<BillingPolicyChangeDetail>>(data[4].Name);

                    await _billingFuneralPolicyChangeService.ProcessBillingPolicyChanges(changeMessage);

                    if (groupPolicyCancelled)
                    {
                        // Get the difference between the scheme's old and new premiums
                        var adjustmentAmount = changeMessage.OldPolicyDetails.InstallmentPremium - changeMessage.NewPolicyDetails.InstallmentPremium;
                        // Process group scheme invoices and credit notes
                        await GroupPolicyCancelled(policy, adjustmentAmount);
                    }
                    else
                    {
                        await _policyRepository.LoadAsync(policy, p => p.PolicyLifeExtension);
                        if (policy.PolicyLifeExtension != null)
                        {
                            policyNumbers.Add(policy.PolicyNumber);
                        }
                    }

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
                // Send policy cancellation comms
                await SendCancellationNotification(policy);
            }
            // Send Qlink transactions if there are any qualifying policies
            if (policyNumbers.Count > 0)
            {
                _ = Task.Run(() => _qlinkService.ProcessQlinkTransactionAsync(policyNumbers, QLinkTransactionTypeEnum.QDEL, true));
            }
        }

        private async Task SendCancellationNotification(policy_Policy policy)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (policy.PolicyOwner != null)
                {
                    var mainMember = policy.PolicyOwner;
                    // Don't even go further if no communicaiton type has been set
                    if (mainMember.PreferredCommunicationTypeId.HasValue)
                    {
                        var caseModel = new Case
                        {
                            Code = policy.PolicyNumber,
                            MainMember = Mapper.Map<Roleplayer>(mainMember)
                        };

                        var person = await _personRepository.SingleOrDefaultAsync(p => p.RolePlayerId == mainMember.RolePlayerId);
                        if (person != null)
                        {
                            caseModel.MainMember.Person = Mapper.Map<Person>(person);
                        }

                        caseModel.MainMember.Policies = new List<RolePlayerPolicy> { Mapper.Map<RolePlayerPolicy>(policy) };
                        caseModel.Representative = await _representativeService.GetRepresentativeWithNoRefData(policy.RepresentativeId);

                        // Clear the broker details, otherwise the object does not map to a caseModel
                        caseModel = ClearBrokerDetails(caseModel);
                        // Log the cancellation notification details
                        CommunicationTypeEnum commType = (CommunicationTypeEnum)caseModel.MainMember.PreferredCommunicationTypeId;
                        var contact = commType == CommunicationTypeEnum.Email
                            ? caseModel.MainMember.EmailAddress
                            : caseModel.MainMember.CellNumber;
                        await LogPolicyChangeNotification(policy.PolicyId, commType, contact, "cancellation");
                        // Send email in a separate background thread
                        _ = Task.Run(() => _policyCommunicationService.SendPolicyCancellationCommunication(caseModel));
                    }
                }
            }
        }

        private PolicyNote LogPolicyChangeNotification(policy_Policy childPolicy, CommunicationTypeEnum? communicationType, string contact, string additionalText)
        {
            var policyNote = new PolicyNote
            {
                PolicyId = childPolicy.PolicyId,
                CreatedBy = RmaIdentity.BackendServiceName,
                CreatedDate = DateTimeHelper.SaNow,
                ModifiedBy = RmaIdentity.BackendServiceName,
                ModifiedDate = DateTimeHelper.SaNow,
                IsDeleted = false
            };

            if (!communicationType.HasValue) return policyNote;
            if (string.IsNullOrEmpty(contact)) return policyNote;

            switch (communicationType.Value)
            {
                case CommunicationTypeEnum.Email:
                    policyNote.Text = $"Policy {additionalText} communication email sent to {contact}";
                    break;
                case CommunicationTypeEnum.SMS:
                    policyNote.Text = $"Policy {additionalText} communication sms sent to {contact}";
                    break;
                default:
                    return policyNote;
            }
            return policyNote;
        }

        private async Task LogPolicyChangeNotification(int policyId, CommunicationTypeEnum? communicationType, string contact, string additionalText)
        {
            if (!communicationType.HasValue) return;
            if (string.IsNullOrEmpty(contact)) return;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var policyNote = new policy_PolicyNote()
                {
                    PolicyId = policyId,
                    CreatedBy = RmaIdentity.BackendServiceName,
                    CreatedDate = DateTimeHelper.SaNow,
                    ModifiedBy = RmaIdentity.BackendServiceName,
                    ModifiedDate = DateTimeHelper.SaNow,
                    IsDeleted = false
                };
                switch (communicationType.Value)
                {
                    case CommunicationTypeEnum.Email:
                        policyNote.Text = $"Policy {additionalText} communication email sent to {contact}";
                        break;
                    case CommunicationTypeEnum.SMS:
                        policyNote.Text = $"Policy {additionalText} communication sms sent to {contact}";
                        break;
                    default:
                        return;
                }
                var policy = await _policyRepository.Where(r => r.PolicyId == policyId).SingleOrDefaultAsync();
                if (policy == null) return;
                policy.PolicyNotes.Add(policyNote);
                _policyRepository.Update(policy);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private Case ClearBrokerDetails(Case caseModel)
        {
            // Remove unassigned brokerage
            if (caseModel.Brokerage?.Id == 0)
            {
                caseModel.Brokerage = null;
            }
            // Remove unassigned representative
            if (caseModel.Representative?.Id == 0)
            {
                caseModel.Representative = null;
            }
            // Remove unassigned juristic representative
            if (caseModel.JuristicRepresentative?.Id == 0)
            {
                caseModel.JuristicRepresentative = null;
            }
            return caseModel;
        }

        private async Task<List<policy_Policy>> GetPendingCancelledPolicies(string policyNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var list = await _policyRepository
                    .Where(p => p.PolicyNumber == policyNumber
                             && p.PolicyStatus == PolicyStatusEnum.PendingCancelled)
                    .ToListAsync();
                return await LoadCancelPolicyData(list);
            }
        }

        private async Task<List<policy_Policy>> GetPendingCancelledIndividualPolicies(DateTime cutoffDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                // Prepare the query to select cancelled individual policies that are NOT part of a scheme / company
                var query = from policy in _policyRepository
                            join roleplayer in _rolePlayerRepository on policy.PolicyOwnerId equals roleplayer.RolePlayerId
                            where policy.PolicyStatus == PolicyStatusEnum.PendingCancelled
                            && policy.ParentPolicyId == null
                            && roleplayer.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Person
                            && policy.CancellationDate != null
                            && policy.CancellationDate <= cutoffDate
                            select policy;
                var list = await query.Take(10).ToListAsync();
                return await LoadCancelPolicyData(list);
            }
        }

        private async Task<List<policy_Policy>> GetPendingCancelledSchemeMembers(DateTime cutoffDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var list = new List<policy_Policy>();
                // Prepare the query to select cancelled policies that are part of a scheme / company
                var query = from policy in _policyRepository
                            join roleplayer in _rolePlayerRepository on policy.PolicyOwnerId equals roleplayer.RolePlayerId
                            where policy.PolicyStatus == PolicyStatusEnum.PendingCancelled
                            && policy.ParentPolicyId != null
                            && roleplayer.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Person
                            && policy.CancellationDate != null
                            && policy.CancellationDate <= cutoffDate
                            select policy.ParentPolicyId;
                // Add policyNumber filter to the query if it's not null or empty
                var parentPolicies = await query.Distinct().ToListAsync();
                if (parentPolicies.Count > 0)
                {
                    list = await _policyRepository
                        .Where(p => parentPolicies.Contains(p.PolicyId))
                        .Take(10)
                        .ToListAsync();
                    return await LoadCancelPolicyData(list);
                }
                return list;
            }
        }

        private async Task<List<policy_Policy>> GetPendingCancelledSchemes(DateTime cutoffDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                // Prepare the query to select cancelled schemes / companies
                var query = from policy in _policyRepository
                            join roleplayer in _rolePlayerRepository on policy.PolicyOwnerId equals roleplayer.RolePlayerId
                            where policy.PolicyStatus == PolicyStatusEnum.PendingCancelled
                            && roleplayer.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Company
                            && policy.CancellationDate != null
                            && policy.CancellationDate <= cutoffDate
                            select policy;
                var list = await query.Take(10).ToListAsync();
                return await LoadCancelPolicyData(list);
            }
        }

        private async Task<List<policy_Policy>> LoadCancelPolicyData(List<policy_Policy> policies)
        {
            await _policyRepository.LoadAsync(policies, p => p.PolicyOwner);
            await _policyRepository.LoadAsync(policies, p => p.ProductOption);
            // Load product
            var productOptions = policies.Select(p => p.ProductOption).Distinct().ToList();
            await _productOptionRepository.LoadAsync(productOptions, po => po.Product);
            return policies;
        }

        private async Task GroupPolicyCancelled(policy_Policy groupPolicy, decimal adjustmentAmount)
        {
            if (groupPolicy != null)
            {
                var groupInvoices = await _transactionCreatorService.GetPolicyInvoices(groupPolicy.PolicyId);
                var groupInvoice = groupInvoices?
                    .Where(x => x.InvoiceDate > DateTimeHelper.SaNow.Date && x.TotalInvoiceAmount == x.Balance)
                    .FirstOrDefault();
                if (groupInvoice != null)
                {
                    var collection = await _transactionCreatorService.GetCollectionForInvoice(groupInvoice.InvoiceId);
                    if (collection == null || collection.CollectionStatus == CollectionStatusEnum.Pending)
                    {
                        // Create a credit note for existing invoices
                        await _transactionCreatorService.CreateCreditNoteForInvoice(groupPolicy.PolicyOwnerId, groupInvoice.TotalInvoiceAmount, "credit note for policy cancelled", groupInvoice);
                        // Create a new invoice if the premium has decreased, but there is still a premium
                        if (groupPolicy.InstallmentPremium > 0.00M)
                        {
                            var invoiceId = await CreateInvoice(groupPolicy.PolicyId, groupPolicy.InstallmentPremium, groupInvoice.InvoiceDate, groupInvoice.CollectionDate);
                            await _transactionCreatorService.CreateNewInvoice(groupPolicy.PolicyNumber, groupPolicy.InstallmentPremium, groupPolicy.PolicyOwnerId, invoiceId);
                        }
                    }
                    else if (adjustmentAmount > 0.00M)
                    {
                        await _transactionCreatorService.CreateCreditNoteByRolePlayerId(groupPolicy.PolicyOwnerId, adjustmentAmount, "credit note for policy cancelled");
                    }
                }
            }
        }

        private async Task CancelSinglePolicy(string policyNumber)
        {
            var policies = await GetPendingCancelledPolicies(policyNumber);
            await CancelPendingCancellationPolicies(policies, false);
        }

        private async Task CancelPendingIndividualPolicyies(DateTime cutoffDate)
        {
            var policies = await GetPendingCancelledIndividualPolicies(cutoffDate);
            while (policies.Count > 0)
            {
                await CancelPendingCancellationPolicies(policies, false);
                policies = await GetPendingCancelledIndividualPolicies(cutoffDate);
            }
        }

        private async Task CancelPendingSchemePolicies(DateTime cutoffDate)
        {
            var policies = await GetPendingCancelledSchemeMembers(cutoffDate);
            while (policies.Count > 0)
            {
                await CancelPendingCancellationPolicies(policies, true);
                policies = await GetPendingCancelledSchemeMembers(cutoffDate);
            }
        }

        private async Task CancelPendingSchemes(DateTime cutoffDate)
        {
            var policies = await GetPendingCancelledSchemes(cutoffDate);
            while (policies.Count > 0)
            {
                await CancelPendingCancellationPolicies(policies, true);
                policies = await GetPendingCancelledSchemes(cutoffDate);
            }
        }

        public async Task<bool> MonitorPendingCancellationBulkCommunication(string applicationName)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var policyStatus = new List<PolicyStatusEnum> { PolicyStatusEnum.PendingCancellationComms };
                var policies = await _policyRepository
                    .Where(p => policyStatus.Contains(p.PolicyStatus)

                             && p.ParentPolicyId != null)
                    .Take(50)
                    .ToListAsync();
                if (policies?.Count > 0)
                {
                    foreach (var policy in policies)
                    {
                        var policyOwner = await _rolePlayerRepository.Where(r => r.RolePlayerId == policy.PolicyOwnerId).FirstOrDefaultAsync();
                        policy.PolicyStatus = PolicyStatusEnum.PendingCancelled;

                        var productOption = await _productOptionService.GetProductOption(policy.ProductOptionId);
                        var product = await _productService.GetProduct(productOption.ProductId);
                        _policyRepository.Update(policy);
                        switch (policyOwner.PreferredCommunicationTypeId)
                        {
                            case (int)CommunicationTypeEnum.Email:
                                await _policyCommunicationService.SendPolicyCancellationDocuments(policy.PolicyId, policy.PolicyNumber, policyOwner.DisplayName, policyOwner.EmailAddress, "", PolicySendDocsProcessTypeEnum.SendGroupFuneralPolicyCancellation, product.ProductClass);
                                await LogPolicyChangeNotification(policy.PolicyId, CommunicationTypeEnum.Email, policyOwner.EmailAddress, "scheduler cancellation");
                                break;
                            case (int)CommunicationTypeEnum.SMS:
                                await _policyCommunicationService.SendPolicyCancellationSms(policyOwner.CellNumber, policy.PolicyId, policy.PolicyNumber);
                                await LogPolicyChangeNotification(policy.PolicyId, CommunicationTypeEnum.SMS, policyOwner.CellNumber, "scheduler cancellation");
                                break;
                        }

                    }
                }
            }
            return await Task.FromResult(true);
        }

        public async Task<bool> MonitorPendingFirstPremiumPolicies(string applicationName)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var policyStatus = new List<PolicyStatusEnum> { PolicyStatusEnum.PendingFirstPremium };
                var cutoffDate = DateTimeHelper.SaNow.Date.AddMonths(-2);
                var policies = await _policyRepository
                    .Where(p => p.CreatedDate < cutoffDate
                             && policyStatus.Contains(p.PolicyStatus)
                             && p.ParentPolicyId == null)
                    .ToListAsync();
                if (policies?.Count > 0)
                {
                    foreach (var policy in policies)
                    {
                        var roleplayerPolicy = Mapper.Map<RolePlayerPolicy>(policy);
                        await CreateCreditNotesForOutstandingInvoices(roleplayerPolicy,
                            CreditNoteTypeEnum.CancellationCreditNote.GetDescription(), false);
                        policy.PolicyStatus = PolicyStatusEnum.NotTakenUp;
                        if (policy.PolicyNotes == null)
                        {
                            policy.PolicyNotes = new List<policy_PolicyNote>();
                        }
                        policy.PolicyNotes.Add(
                            new policy_PolicyNote
                            {
                                PolicyId = policy.PolicyId,
                                Text = $"Policy cancelled by scheduler MonitorPendingFirstPremiumPolicies",
                                IsDeleted = false
                            }
                        );
                        LogPolicyStatusChange(policy.PolicyId, policy.PolicyStatus, "Policy cancelled by scheduled task");
                        _policyRepository.Update(policy);
                        // Get child policies and mark them as NotTakenUp as well
                        var children = await GetChildPolicies(policy.PolicyId);
                        if (children?.Count > 0)
                        {
                            foreach (var child in children)
                            {
                                child.PolicyStatus = PolicyStatusEnum.NotTakenUp;
                                if (child.PolicyNotes == null)
                                {
                                    child.PolicyNotes = new List<policy_PolicyNote>();
                                }
                                child.PolicyNotes.Add(
                                    new policy_PolicyNote
                                    {
                                        PolicyId = child.PolicyId,
                                        Text = $"Policy cancelled by scheduler MonitorPendingFirstPremiumPolicies",
                                        IsDeleted = false
                                    }
                                );
                                LogPolicyStatusChange(policy.PolicyId, policy.PolicyStatus, "Policy cancelled by scheduled task");
                                _policyRepository.Update(child);
                            }
                        }
                    }
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
                return await Task.FromResult(true);
            }
        }

        private void LogPolicyStatusChange(int policyId, PolicyStatusEnum policyStatus, string reason)
        {
            var requestedBy = string.IsNullOrEmpty(RmaIdentity.Email)
                ? RmaIdentity.BackendServiceName
                : RmaIdentity.Email;
            var audit = new policy_PolicyStatusChangeAudit
            {
                PolicyId = policyId,
                PolicyStatus = policyStatus,
                Reason = reason,
                EffectiveFrom = DateTimeHelper.SaNow.Date,
                RequestedBy = requestedBy,
                RequestedDate = DateTimeHelper.SaNow
            };
            _policyStatusChangeRepository.Create(audit);
        }

        private async Task<List<policy_Policy>> GetChildPolicies(int policyId)
        {
            var children = await _policyRepository
                .Where(p => p.ParentPolicyId == policyId)
                .ToListAsync();
            return children;
        }

        public async Task<bool> LapseTwoConsecutiveUnmetPremiums(string applicationName)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var policiesWithTwoConsecutiveUnmetPremiums = await _policyRepository
                    .SqlQueryAsync<PolicyCommunication>(
                        "[billing].[GetPoliciesWithTwoConsecutiveUnmets]  @invoiceStatusId, @monthEndDate",
                        new SqlParameter("@invoiceStatusId", InvoiceStatusEnum.Unpaid),
                        new SqlParameter("@monthEndDate", DateTime.Now)
                    );
                if (policiesWithTwoConsecutiveUnmetPremiums.Count > 0)
                {
                    var idList = policiesWithTwoConsecutiveUnmetPremiums
                        .Select(c => c.PolicyId)
                        .Distinct()
                        .ToList();
                    var policiesToBulkLapse = await _policyRepository
                        .Where(c => (c.LapsedCount == null || c.LapsedCount < 1)
                                   && idList.Contains(c.PolicyId))
                        .ToListAsync();
                    var stringList = string.Join(",", policiesToBulkLapse
                        .Select(c => c.PolicyId));
                    var policiesThatLapsedBefore = await _policyRepository
                        .Where(c => c.LapsedCount > 0 && idList.Contains(c.PolicyId))
                        .ToListAsync();

                    foreach (var policy in policiesThatLapsedBefore)
                    {
                        policy.PolicyStatus = PolicyStatusEnum.Lapsed;
                        policy.LastLapsedDate = DateTime.Now;
                        policy.LapsedCount += 1;

                        _policyRepository.Update(policy);
                    }

                    var policies = await _policyRepository.SqlQueryAsync<PolicyCommunication>(
                        DatabaseConstants.BulkLapsePolicies,
                        new SqlParameter("@idList", stringList),
                        new SqlParameter("@statusId", PolicyStatusEnum.Lapsed),
                        new SqlParameter("@modifiedBy", applicationName),
                        new SqlParameter("@modifiedDate", DateTime.Now)
                    );

                    var groupedPolicyCommunications = policiesWithTwoConsecutiveUnmetPremiums.GroupBy(c => c.PolicyId);
                    foreach (var group in groupedPolicyCommunications)
                    {
                        var policyCommunication = group.FirstOrDefault();
                        await _policyCommunicationService.SendSecondPremiumMissedCommunication(policyCommunication);
                        switch (policyCommunication.PreferredCommunicationTypeId)
                        {
                            case (int)CommunicationTypeEnum.Email:
                                await LogPolicyChangeNotification(policyCommunication.PolicyId, CommunicationTypeEnum.Email, policyCommunication.EmailAddress, "scheduler lapse");
                                break;
                            case (int)CommunicationTypeEnum.SMS:
                                await LogPolicyChangeNotification(policyCommunication.PolicyId, CommunicationTypeEnum.Email, policyCommunication.CellNumber, "scheduler lapse");
                                break;
                        }

                    }
                }
                await scope.SaveChangesAsync();
            }
            return await Task.FromResult(true);
        }

        private async Task<List<PolicyCommunication>> GetPoliciesWithTwoUnpaidPremiumsOverTwoYearPeriod()
        {
            var results = new List<PolicyCommunication>();
            var policyStatus = new List<PolicyStatusEnum> { PolicyStatusEnum.Reinstated, PolicyStatusEnum.Active, PolicyStatusEnum.Continued };
            const int graceDays = 2;
            var installmentDate = DateTimeHelper.SaNow.AddDays(-1 * graceDays);
            var policies = await _policyRepository
                .Where(p => policyStatus.Contains(p.PolicyStatus)
                         && p.RegularInstallmentDayOfMonth.HasValue
                         && p.RegularInstallmentDayOfMonth.Value == installmentDate.Day
                         && p.PaymentMethod != PaymentMethodEnum.GovernmentSalaryDeduction
                         && p.CanLapse).ToListAsync();

            foreach (var policy in policies)
            {
                var invoices = await _transactionCreatorService.GetInvoicesByPolicyIdNoRefData(policy.PolicyId);
                var unpaidInvoices = new List<Invoice>();
                foreach (var invoice in invoices)
                {
                    if (invoice.Balance == invoice.TotalInvoiceAmount)
                    {
                        unpaidInvoices.Add(invoice);
                    }
                }

                if (unpaidInvoices.Count < 2) continue;

                const int lapsePeriodInMonths = 24;
                var maxInvoiceDate = unpaidInvoices.Max(i => i.InvoiceDate);
                var twoUnpaidInvoicesExistInTwoYearPeriod = unpaidInvoices.Any(i => i.InvoiceDate.Month >= maxInvoiceDate.Month - lapsePeriodInMonths);

                if (!twoUnpaidInvoicesExistInTwoYearPeriod) continue;

                var policyOwner = await _rolePlayerRepository.Where(r => r.RolePlayerId == policy.PolicyOwnerId).FirstOrDefaultAsync();
                if (policyOwner == null) continue;


                var rolePlayerPolicy = Mapper.Map<RolePlayerPolicy>(policy);
                var representative = await _representativeService.GetRepresentativeWithNoRefData(rolePlayerPolicy.RepresentativeId);

                results.Add(new PolicyCommunication
                {
                    PolicyId = policy.PolicyId,
                    PolicyNumber = policy.PolicyNumber,
                    DisplayName = policyOwner.DisplayName,
                    CellNumber = policyOwner.CellNumber,
                    EmailAddress = policyOwner.EmailAddress,
                    PreferredCommunicationTypeId = policyOwner.PreferredCommunicationTypeId,
                    TellNumber = policyOwner.TellNumber,
                    CCEmail = representative != null ? representative.Email : string.Empty,
                    InvoiceDate = maxInvoiceDate
                });
            }

            return results;
        }

        private async Task<List<PolicyCommunication>> GetPoliciesDueToLapse()
        {
            var results = new List<PolicyCommunication>();
            var policyStatus = new List<PolicyStatusEnum> { PolicyStatusEnum.Reinstated, PolicyStatusEnum.Active, PolicyStatusEnum.Continued };
            const int graceDays = 16;
            var installmentDate = DateTimeHelper.SaNow.AddDays(-1 * graceDays);
            var policies = await _policyRepository
                .Where(p => policyStatus.Contains(p.PolicyStatus)
                         && p.RegularInstallmentDayOfMonth.HasValue
                         && p.PaymentMethod != PaymentMethodEnum.GovernmentSalaryDeduction
                         && p.ParentPolicyId == null
                         && p.CanLapse)
                .Take(20)
                .ToListAsync();

            var policyIds = policies.Select(p => p.PolicyId).Distinct().ToList();
            var policyOwnerIds = policies.Select(p => p.PolicyOwnerId).Distinct().ToList();

            if (policyIds.Count > 0)
            {
                var unpaidInvoices = new List<Invoice>();
                var invoices = await _transactionCreatorService.GetInvoicesByPolicyIdNumbersRefData(policyIds);

                unpaidInvoices.AddRange(invoices.Where(i => i.Balance == i.TotalInvoiceAmount));

                if (unpaidInvoices.Count >= 2)
                {
                    const int lapsePeriodInMonths = 24;
                    var maxInvoiceDate = unpaidInvoices.Max(i => i.InvoiceDate);
                    var twoUnpaidInvoicesExistInTwoYearPeriod = unpaidInvoices.Any(i => i.InvoiceDate.Month >= maxInvoiceDate.Month - lapsePeriodInMonths);

                    if (twoUnpaidInvoicesExistInTwoYearPeriod)
                    {
                        var policyOwners = await _rolePlayerRepository.Where(r => policyOwnerIds.Contains(r.RolePlayerId)).ToListAsync();
                        foreach (var policyOwner in policyOwners)
                        {
                            if (policyOwner == null) continue;

                            var policy = policies.Where(p => p.PolicyOwnerId == policyOwner.RolePlayerId).FirstOrDefault();
                            var rolePlayerPolicy = Mapper.Map<RolePlayerPolicy>(policy);
                            var representative = await _representativeService.GetRepresentativeWithNoRefData(rolePlayerPolicy.RepresentativeId);

                            results.Add(new PolicyCommunication
                            {
                                PolicyId = policy.PolicyId,
                                PolicyNumber = policy.PolicyNumber,
                                DisplayName = policyOwner.DisplayName,
                                CellNumber = policyOwner.CellNumber,
                                EmailAddress = policyOwner.EmailAddress,
                                PreferredCommunicationTypeId = policyOwner.PreferredCommunicationTypeId,
                                TellNumber = policyOwner.TellNumber,
                                CCEmail = representative != null ? representative.Email : string.Empty
                            });

                        }
                    }
                }
            }
            return results;
        }

        public async Task<bool> MonitorPoliciesWithSecondPremiumMissed(string applicationName)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var policiesWithTwoUnpaidPremiumsOverTwoYearPeriod = await GetPoliciesWithTwoUnpaidPremiumsOverTwoYearPeriod();

                if (policiesWithTwoUnpaidPremiumsOverTwoYearPeriod.Count > 0)
                {
                    var groupedPolicyCommunications = policiesWithTwoUnpaidPremiumsOverTwoYearPeriod.GroupBy(c => c.PolicyId);
                    foreach (var group in groupedPolicyCommunications)
                    {
                        var policyCommunication = group.FirstOrDefault();
                        await _policyCommunicationService.SendSecondPremiumMissedCommunication(policyCommunication);
                    }
                }
                await scope.SaveChangesAsync();
            }
            return await Task.FromResult(true);
        }

        public async Task<bool> LapseTwoUnpaidPremiumsOverTwoYearPeriod(string applicationName)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var policiesWithTwoUnpaidPremiumsOverTwoYearPeriod = await GetPoliciesDueToLapse();
                if (policiesWithTwoUnpaidPremiumsOverTwoYearPeriod.Count > 0)
                {
                    var idList = policiesWithTwoUnpaidPremiumsOverTwoYearPeriod
                        .Select(c => c.PolicyId)
                        .Distinct()
                        .ToList();
                    var policiesToLapse = await _policyRepository
                        .Where(c => idList.Contains(c.PolicyId))
                        .ToListAsync();
                    var policyNotes = new List<PolicyNote>();
                    var childrenPoliciesToUpdate = new List<policy_Policy>();
                    foreach (var parentPolicy in policiesToLapse)
                    {
                        parentPolicy.PolicyStatus = PolicyStatusEnum.Lapsed;
                        parentPolicy.LastLapsedDate = DateTimeHelper.SaNow;
                        parentPolicy.LapsedCount = parentPolicy.LapsedCount == null ? 1 : parentPolicy.LapsedCount + 1;
                        parentPolicy.ModifiedBy = RmaIdentity.BackendServiceName;
                        parentPolicy.ModifiedDate = DateTimeHelper.SaNow;
                        if (parentPolicy.PolicyNotes == null)
                        {
                            parentPolicy.PolicyNotes = new List<policy_PolicyNote>();
                        }
                        parentPolicy.PolicyNotes.Add(
                            new policy_PolicyNote
                            {
                                PolicyId = parentPolicy.PolicyId,
                                Text = $"Policy lapsed by scheduler LapseTwoUnpaidPremiumsOverTwoYearPeriod",
                                CreatedBy = RmaIdentity.BackendServiceName,
                                CreatedDate = DateTimeHelper.SaNow,
                                ModifiedBy = RmaIdentity.BackendServiceName,
                                ModifiedDate = DateTimeHelper.SaNow,
                                IsDeleted = false
                            }
                        );
                        _policyRepository.Update(parentPolicy);

                        // TODO: Send policy lapsed communication for group scheme
                        // Get child policies and lapse them as well
                        var children = await GetChildPolicies(parentPolicy.PolicyId);
                        if (children?.Count > 0)
                        {
                            var childCount = children.Count;
                            var policyCommunications = new List<PolicyCommunication>();
                            var childPoliciesToUpdate = new List<policy_Policy>();
                            foreach (var child in children)
                            {
                                child.PolicyStatus = PolicyStatusEnum.Lapsed;
                                child.LastLapsedDate = DateTimeHelper.SaNow;
                                child.LapsedCount = child.LapsedCount == null ? 1 : child.LapsedCount + 1;
                                childrenPoliciesToUpdate.Add(child);

                                var policyNote = new PolicyNote
                                {
                                    PolicyId = child.PolicyId,
                                    Text = $"Policy lapsed by scheduler LapseTwoUnpaidPremiumsOverTwoYearPeriod",
                                    CreatedBy = RmaIdentity.BackendServiceName,
                                    CreatedDate = DateTimeHelper.SaNow,
                                    ModifiedBy = RmaIdentity.BackendServiceName,
                                    ModifiedDate = DateTimeHelper.SaNow,
                                    IsDeleted = false
                                };
                                policyNotes.Add(policyNote);

                                var policyOwner = await _rolePlayerRepository.Where(r => r.RolePlayerId == child.PolicyOwnerId).SingleOrDefaultAsync();
                                if (policyOwner == null) continue;

                                var policyCommunication = new PolicyCommunication
                                {
                                    PolicyId = child.PolicyId,
                                    PolicyNumber = child.PolicyNumber,
                                    DisplayName = policyOwner.DisplayName,
                                    CellNumber = policyOwner.CellNumber,
                                    EmailAddress = policyOwner.EmailAddress,
                                    PreferredCommunicationTypeId = policyOwner.PreferredCommunicationTypeId,
                                    TellNumber = policyOwner.TellNumber,
                                    CCEmail = string.Empty
                                };

                                if (child.ParentPolicy.LastInstallmentDate.HasValue)
                                {
                                    policyCommunication.InvoiceDate = (DateTime)child.ParentPolicy.LastInstallmentDate;
                                }

                                _ = Task.Run(() => _policyCommunicationService.SendLapseCommunication(policyCommunication));

                                switch (policyCommunication.PreferredCommunicationTypeId)
                                {
                                    case (int)CommunicationTypeEnum.Email:
                                        var emailPolicyNote = LogPolicyChangeNotification(child, CommunicationTypeEnum.Email, policyCommunication.EmailAddress, "lapse");
                                        if (!string.IsNullOrEmpty(emailPolicyNote.Text)) policyNotes.Add(emailPolicyNote);
                                        break;
                                    case (int)CommunicationTypeEnum.SMS:
                                        var smsPolicyNote = LogPolicyChangeNotification(child, CommunicationTypeEnum.Email, policyCommunication.CellNumber, "lapse");
                                        if (!string.IsNullOrEmpty(smsPolicyNote.Text)) policyNotes.Add(smsPolicyNote);
                                        break;
                                }
                            }
                        }
                    }

                    // Update Child Policy 
                    await UpdateChildPolicy(childrenPoliciesToUpdate);

                    // Create child policy notes                 
                    if (policyNotes.Count > 0)
                        await SavePolicyNote(policyNotes);

                    //Create credit notes for invoices raised after policy lapse
                    if (policiesToLapse.Count > 0)
                        await CreateCreditNotesForInvoicesRaisedAfterPolicyLapse(policiesToLapse);

                }
                await scope.SaveChangesAsync();
            }
            return await Task.FromResult(true);
        }

        private async Task UpdateChildPolicy(List<policy_Policy> childrenPoliciesToUpdate)
        {
            foreach (var childrenPolicyToUpdate in childrenPoliciesToUpdate)
            {
                await UpdateSinglePolicy(childrenPolicyToUpdate);
            }
        }

        private async Task UpdateSinglePolicy(policy_Policy policyToUpdate)
        {
            using (_dbContextScopeFactory.Create())
            {
                await _policyRepository.ExecuteSqlCommandAsync(
                    DatabaseConstants.UpdateChildPolicy,
                    new SqlParameter("@policyId", policyToUpdate.PolicyId),
                    new SqlParameter("@policyStatusId", policyToUpdate.PolicyStatus),
                    new SqlParameter("@lastLapsedDate", policyToUpdate.LastLapsedDate),
                    new SqlParameter("@lapsedCount", policyToUpdate.LapsedCount),
                    new SqlParameter("@userId", RmaIdentity.BackendServiceName),
                    new SqlParameter("@modifiedDate", DateTimeHelper.SaNow)
                );
            }
        }

        private async Task SendGroupedPolicyCommunication(List<PolicyCommunication> policiesWithTwoUnpaidPremiumsOverTwoYearPeriod)
        {
            // TODO: Remove this policy lapsed communication
            var groupedPolicyCommunications = policiesWithTwoUnpaidPremiumsOverTwoYearPeriod.GroupBy(c => c.PolicyId);
            foreach (var group in groupedPolicyCommunications)
            {
                var policyCommunication = group.FirstOrDefault();
                await _policyCommunicationService.SendLapseCommunication(policyCommunication);
            }
        }
        private async Task CreateCreditNotesForInvoicesRaisedAfterPolicyLapse(List<policy_Policy> policiesToLapse)
        {
            var policyIds = policiesToLapse
                            .Select(p => p.PolicyId)
                            .Distinct()
                            .ToList();
            var invoices = await _transactionCreatorService.GetInvoicesByPolicyIdNumbersRefData(policyIds);
            if (invoices.Count == 0) return;
            foreach (var policy in policiesToLapse)
            {
                if (policy?.LastLapsedDate != null)
                {
                    await CreateCreditNotesForInvoicesRaisedAfterPolicyLapse(Mapper.Map<RolePlayerPolicy>(policy), invoices);
                }
            }
        }

        private async Task<List<PolicyCommunication>> GetPoliciesWithOnePremiumMissed()
        {
            var results = new List<PolicyCommunication>();
            var policyStatus = new List<PolicyStatusEnum> { PolicyStatusEnum.Reinstated, PolicyStatusEnum.Active, PolicyStatusEnum.Continued };
            const int graceDays = 2;
            var installmentDate = DateTimeHelper.SaNow.AddDays(-1 * graceDays);
            var policies = await _policyRepository
                .Where(p => policyStatus.Contains(p.PolicyStatus)
                         && p.RegularInstallmentDayOfMonth.Value == installmentDate.Day
                         && p.PaymentMethod != PaymentMethodEnum.GovernmentSalaryDeduction
                         && p.CanLapse)
                .ToListAsync();
            foreach (var policy in policies)
            {
                var invoices = await _transactionCreatorService.GetInvoicesByPolicyIdNoRefData(policy.PolicyId);
                var unpaidInvoices = new List<Invoice>();
                foreach (var invoice in invoices)
                {
                    if (invoice.Balance == invoice.TotalInvoiceAmount)
                    {
                        unpaidInvoices.Add(invoice);
                    }
                }

                if (unpaidInvoices.Count != 1) continue;

                var currentPeriod = await _periodService.GetCurrentPeriod();
                if (currentPeriod == null) continue;

                var startDate = currentPeriod.StartDate;
                var endDate = currentPeriod.EndDate;

                unpaidInvoices = unpaidInvoices.Where(i => i.InvoiceDate >= startDate && i.InvoiceDate < endDate).ToList();
                if (unpaidInvoices.Count == 0) continue;

                var policyOwner = await _rolePlayerRepository.Where(r => r.RolePlayerId == policy.PolicyOwnerId).FirstOrDefaultAsync();
                if (policyOwner == null) continue;

                var rolePlayerPolicy = Mapper.Map<RolePlayerPolicy>(policy);
                var representative = await _representativeService.GetRepresentativeWithNoRefData(rolePlayerPolicy.RepresentativeId);

                foreach (var unpaidInvoice in unpaidInvoices)
                {
                    results.Add(new PolicyCommunication
                    {
                        PolicyId = policy.PolicyId,
                        PolicyNumber = policy.PolicyNumber,
                        DisplayName = policyOwner.DisplayName,
                        CellNumber = policyOwner.CellNumber,
                        EmailAddress = policyOwner.EmailAddress,
                        PreferredCommunicationTypeId = policyOwner.PreferredCommunicationTypeId,
                        TellNumber = policyOwner.TellNumber,
                        InvoiceDate = unpaidInvoice.InvoiceDate,
                        CCEmail = representative != null ? representative.Email : string.Empty
                    });
                }
            }

            return results;
        }

        public async Task<bool> MonitorPoliciesWithOnePremiumMissed()
        {
            using (_dbContextScopeFactory.Create())
            {
                var policiesWithOnePremiumMissed = await GetPoliciesWithOnePremiumMissed();

                if (policiesWithOnePremiumMissed.Count > 0)
                {
                    foreach (var policyCommunication in policiesWithOnePremiumMissed)
                    {
                        await _policyCommunicationService.SendOnePremiumMissedCommunication(policyCommunication);
                        switch (policyCommunication.PreferredCommunicationTypeId)
                        {
                            case (int)CommunicationTypeEnum.Email:
                                await LogPolicyChangeNotification(policyCommunication.PolicyId, CommunicationTypeEnum.Email, policyCommunication.EmailAddress, "premium missed");
                                break;
                            case (int)CommunicationTypeEnum.SMS:
                                await LogPolicyChangeNotification(policyCommunication.PolicyId, CommunicationTypeEnum.Email, policyCommunication.CellNumber, "premium missed");
                                break;
                        }
                    }
                }
            }

            return await Task.FromResult(true);
        }

        public async Task<bool> UpdatePolicyStatus(RolePlayerPolicy rolePlayerPolicy)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                if (rolePlayerPolicy != null)
                {
                    var policy = await _policyRepository.SingleAsync(
                                        s => s.PolicyId == rolePlayerPolicy.PolicyId,
                                        $"Could not find a Policy with the id {rolePlayerPolicy.PolicyId}");
                    if (policy != null)
                    {
                        policy.PolicyStatus = rolePlayerPolicy.PolicyStatus;

                        if (rolePlayerPolicy.PolicyStatus == PolicyStatusEnum.Cancelled)
                        {
                            policy.CancellationDate = rolePlayerPolicy.CancellationDate;
                            policy.PolicyCancelReason = rolePlayerPolicy.PolicyCancelReason;
                            var reasonText = policy.PolicyCancelReason?.DisplayAttributeValue();
                            policy.PolicyNotes.Add(
                                new policy_PolicyNote
                                {
                                    Text = $"Policy cancelled by {policy.CancellationInitiatedBy}. Reason: {reasonText}"
                                }
                            );
                        }
                        else if (rolePlayerPolicy.PolicyStatus == PolicyStatusEnum.PremiumWaivered)
                        {
                            await _policyRepository.LoadAsync(policy, c => c.PolicyInsuredLives);
                            await DoPremiumWaivedRules(policy);
                        }
                        else if (rolePlayerPolicy.PolicyStatus == PolicyStatusEnum.Paused)
                        {
                            policy.PolicyPauseDate = DateTime.Now;
                            policy.PolicyNotes.Add(
                                new policy_PolicyNote
                                {
                                    Text = $"Policy paused due to claim on main member"
                                }
                            );
                        }
                        _policyRepository.Update(policy);
                        await scope.SaveChangesAsync().ConfigureAwait(false);
                    }
                }
                return true;
            }
        }

        public async Task<List<RolePlayerRelation>> GetRolePlayerRelations(int toRolePlayerId, int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _rolePlayerRelationRepository.Where(r => r.ToRolePlayerId == toRolePlayerId && r.PolicyId == policyId).ToListAsync();
                return Mapper.Map<List<RolePlayerRelation>>(results);
            }
        }

        public async Task ProcessCollectionBankingDetailRejection(int? policyId, string reason, string accountNumber, string bank, string branch, string accountholder)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                // Add reason to note
                _noteRepository.Create(new policy_PolicyNote
                {
                    PolicyId = policyId.Value,
                    Text = reason,
                });

                await scope.SaveChangesAsync().ConfigureAwait(false);

                try
                {
                    string html = string.Format(await _configurationService.GetModuleSetting("CollectionsRejectionEmailText"), reason, accountholder, bank, accountNumber, branch);
                    string emailAddress = await _configurationService.GetModuleSetting("CollectionsRejectionEmailAddress");

                    var emailRequest = new SendMailRequest
                    {
                        ItemId = -1,
                        ItemType = "Unsuccessful Collection",
                        Recipients = emailAddress,
                        Body = html,
                        IsHtml = true,
                        Subject = "Unsuccessful Collection"
                    };

                    await _emailService.SendEmail(emailRequest);
                }
                catch (Exception e)
                {
                    var errorMessage = e.Message; // Errors sending email must not break process
                }

                try
                {
                    await _wizardService.SendWizardNotification("collection-rejected-notification", $"Collection Rejected: {accountholder}", $"Updated banking details are required for account holder: {accountholder}. Once completed, mark this notification as READ AND UNDERSTOOD to notify the appropriate users to re-run the rejected collection", "clientcare/policy-manager/new-business", -1, null);
                }
                catch (Exception e)
                {
                    var errorMessage = e.Message; // Errors creating wizard must not break process
                }

            }
        }

        public async Task<PagedRequestResult<Roleplayer>> GetInsuredLivesToContinuePolicy(PagedRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            Contract.Requires(request != null);
            int policyId = Convert.ToInt32(request.SearchCriteria);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var roleplayers = new List<Roleplayer>();
                var policyInsuredLives = await _insuredLifeRepository
                    .Where(c => c.PolicyId == policyId
                        && c.EndDate == null
                        && c.RolePlayerTypeId != (int)RolePlayerTypeEnum.MainMemberSelf
                        && c.RolePlayerTypeId != (int)RolePlayerTypeEnum.Extended
                    )
                    .ToListAsync();
                var rolePlayerIds = policyInsuredLives.Select(c => c.RolePlayerId).ToList();
                if (rolePlayerIds.Count > 0)
                {
                    var dbRolePlayers = await _rolePlayerRepository.Where(c => rolePlayerIds.Contains(c.RolePlayerId)).ToListAsync();

                    foreach (var item in dbRolePlayers)
                    {
                        await _rolePlayerRepository.LoadAsync(item, r => r.Person);
                        var roleplayer = new Roleplayer()
                        {
                            Person = Mapper.Map<Person>(item.Person),
                            DisplayName = item.DisplayName,
                            CellNumber = item.CellNumber,
                            PreferredCommunicationTypeId = Convert.ToInt32(item.PreferredCommunicationTypeId),
                            RolePlayerIdentificationType = item.RolePlayerIdentificationType,
                            RolePlayerId = item.RolePlayerId,
                            EmailAddress = item.EmailAddress,
                            TellNumber = item.TellNumber,
                            IsDeleted = item.IsDeleted
                        };

                        roleplayers.Add(roleplayer);
                    }
                }

                if (roleplayers.Count > 0)
                {
                    foreach (var item in roleplayers)
                    {
                        var insured = policyInsuredLives.FirstOrDefault(c => c.RolePlayerId == item.RolePlayerId);
                        if (insured != null)
                        {
                            item.FromRolePlayers = new List<RolePlayerRelation>();
                            var fromRelation = new RolePlayerRelation
                            {
                                FromRolePlayerId = item.RolePlayerId,
                                ToRolePlayerId = 0,
                                RolePlayerTypeId = insured.RolePlayerTypeId
                            };
                            item.FromRolePlayers.Add(fromRelation);
                        }
                    }
                }
                var results = new Common.Entities.DatabaseQuery.PagedRequestResult<Roleplayer>
                {
                    Data = roleplayers,
                    Page = request.Page,
                    PageCount = request.PageSize,
                    RowCount = roleplayers.Count
                };
                return results;
            }
        }

        public async Task ContinuePolicy(Case @case)
        {
            Contract.Requires(@case != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            var oldMainMember = @case.MainMember;
            var newMainMember = @case.NewMainMember;

            Contract.Requires(newMainMember != null);

            if (newMainMember.RolePlayerId == oldMainMember.RolePlayerId)
                throw new Exception("The new main member is the same as the old one.");
            var policy = @case.MainMember.Policies[0];
            @case.NewMainMember.Policies[0] = policy;
            // Found that in some cases beneficiaries repeat
            @case.Beneficiaries = RemoveDuplicateBeneficiaries(@case.Beneficiaries.ToList());
            // Update main member details. Address and banking details are also saved here
            var policyStartDate = newMainMember.Policies[0].PolicyInceptionDate.ToSaDateTime();
            @case.MainMember = await SaveRolePlayerPerson(@case.NewMainMember);
            @case.MainMember.JoinDate = policyStartDate;
            // Insert / update policy member roleplayers and persons. RoleplayerId's for new
            // members are assigned here as well, so we have to update the policyCase list.
            @case.Spouse = await SaveRolePlayerPersons(@case.Spouse);
            @case.Children = await SaveRolePlayerPersons(@case.Children);
            @case.ExtendedFamily = await SaveRolePlayerPersons(@case.ExtendedFamily);
            @case.Beneficiaries = await SaveRolePlayerPersons(@case.Beneficiaries);
            // Save roleplayer relations
            await UpdatePolicyRolePlayerRelations(@case);
            // Save beneficiaries
            await UpdatePolicyBeneficiaries(@case);
            // Remove previous main member from insured lives
            await RemoveMainMemberInsuredLife(policy.PolicyId, oldMainMember, policyStartDate);
            // Save policy insured lives
            await UpdatePolicyInsuredLives(@case);
            // Add policy continuation note
            var continuationDate = policy.ContinuationEffectiveDate ?? DateTimeHelper.UtcNow.Date;
            policy.PolicyNotes.Add(new Note
            {
                Id = 0,
                ItemId = policy.PolicyId,
                ItemType = "Policy",
                Text = $"Policy continued effective {continuationDate:yyyy-MM-dd}",
                IsDeleted = false
            });
            // Update policy owner
            await UpdateContinuePolicy(policy, newMainMember);
            // Insert / update policy payee
            await UpdateFinPayee(policy, oldMainMember, newMainMember);

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

        private async Task RemoveMainMemberInsuredLife(int policyId, Roleplayer oldMainMember, DateTime startDate)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _insuredLifeRepository
                                    .SingleOrDefaultAsync(s => s.PolicyId == policyId
                                                            && s.RolePlayerId == oldMainMember.RolePlayerId);
                oldMainMember.IsDeleted = true;
                oldMainMember.EndDate = startDate.AddDays(-1);
                UpdatePolicyInsuredLife(policyId, entity, oldMainMember, false, RolePlayerTypeEnum.MainMemberSelf);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task UpdateFinPayee(RolePlayerPolicy policy, Roleplayer oldMainMember, Roleplayer newMainMember)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (!policy.ParentPolicyId.HasValue)
                {
                    var oldFinPayee = await _finPayeeRepository
                        .SingleOrDefaultAsync(fp => fp.RolePlayerId == oldMainMember.RolePlayerId);
                    var newFinPayee = await _finPayeeRepository
                        .SingleOrDefaultAsync(fp => fp.RolePlayerId == newMainMember.RolePlayerId);
                    if (newFinPayee == null)
                    {
                        newFinPayee = new client_FinPayee
                        {
                            RolePlayerId = newMainMember.RolePlayerId,
                            FinPayeNumber = oldFinPayee != null ? oldFinPayee.FinPayeNumber : policy.ClientReference,
                            IsAuthorised = true,
                            AuthroisedBy = RmaIdentity.Email,
                            AuthorisedDate = DateTime.Now,
                            IsDeleted = false,
                            CreatedBy = RmaIdentity.Email,
                            CreatedDate = DateTime.Now,
                            ModifiedBy = RmaIdentity.Email,
                            ModifiedDate = DateTime.Now,
                            IndustryId = oldFinPayee != null ? oldFinPayee.IndustryId : null
                        };
                        _finPayeeRepository.Create(newFinPayee);
                        await scope.SaveChangesAsync().ConfigureAwait(false);
                    }
                }
            }
        }

        private async Task UpdateContinuePolicy(RolePlayerPolicy memberPolicy, Roleplayer newMainMember)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var policyData = await _policyRepository.FindByIdAsync(memberPolicy.PolicyId);
                policyData.PolicyOwnerId = newMainMember.RolePlayerId;
                if (policyData.ParentPolicy == null)
                {
                    policyData.PolicyPayeeId = newMainMember.RolePlayerId;
                }
                policyData.PolicyStatus = PolicyStatusEnum.PendingContinuation;
                policyData.PaymentFrequency = memberPolicy.PaymentFrequency;
                policyData.PaymentMethod = memberPolicy.PaymentMethod;
                policyData.InstallmentPremium = memberPolicy.InstallmentPremium;
                policyData.AnnualPremium = memberPolicy.AnnualPremium;
                policyData.ProductOption = Mapper.Map<product_ProductOption>(memberPolicy.ProductOption);
                policyData.ProductOptionId = memberPolicy.ProductOptionId;
                policyData.DecemberInstallmentDayOfMonth = memberPolicy.DecemberInstallmentDayOfMonth;
                policyData.RegularInstallmentDayOfMonth = memberPolicy.RegularInstallmentDayOfMonth;
                policyData.AdminPercentage = memberPolicy.AdminPercentage;
                policyData.CommissionPercentage = memberPolicy.CommissionPercentage;
                policyData.BinderFeePercentage = memberPolicy.BinderFeePercentage;
                policyData.ClientReference = string.IsNullOrEmpty(memberPolicy.ClientReference) ? null : memberPolicy.ClientReference;
                policyData.PolicyNotes = Mapper.Map<List<policy_PolicyNote>>(memberPolicy.PolicyNotes);
                policyData.Benefits = null;               // Already saved, do not update again
                policyData.RolePlayerRelations = null;    // Already saved, do not update again
                policyData.PolicyInsuredLives = null;     // Already saved, do not update again
                _policyRepository.Update(policyData);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                await _auditWriter.AddLastViewed<policy_Policy>(policyData.PolicyId);
            }
        }

        public async Task EditContinuePolicy(Case policyCase)
        {
            Contract.Requires(policyCase != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var mainMember = policyCase.MainMember;
                var policy = mainMember.Policies[0];
                // Found that in some cases beneficiaries repeat
                policyCase.Beneficiaries = RemoveDuplicateBeneficiaries(policyCase.Beneficiaries.ToList());
                // Update main member details. Address and banking details are also saved here
                policyCase.MainMember = await SaveRolePlayerPerson(policyCase.MainMember);
                // Insert / update policy member roleplayers and persons. RoleplayerId's for new
                // members are assigned here as well, so we have to update the policyCase list.
                policyCase.Spouse = await SaveRolePlayerPersons(policyCase.Spouse);
                policyCase.Children = await SaveRolePlayerPersons(policyCase.Children);
                policyCase.ExtendedFamily = await SaveRolePlayerPersons(policyCase.ExtendedFamily);
                policyCase.Beneficiaries = await SaveRolePlayerPersons(policyCase.Beneficiaries);
                // Save roleplayer relations
                await UpdatePolicyRolePlayerRelations(policyCase);
                // Save beneficiaries
                await UpdatePolicyBeneficiaries(policyCase);
                // Save policy insured lives
                await UpdatePolicyInsuredLives(policyCase);
                // Save the policy
                await UpdatePolicy(policyCase);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                await _auditWriter.AddLastViewed<policy_Policy>(policy.PolicyId);

                await UpdatePolicyPremiums(policyCase);

            }

            //Regenerate Policy Schedule
            var producer = new ServiceBusQueueProducer<PolicyScheduleMessage, PolicyScheduleMessageListener>(PolicyScheduleMessageListener.QueueName);
            await producer.PublishMessageAsync(new PolicyScheduleMessage()
            {
                PolicyId = policyCase.MainMember.Policies[0].PolicyId,
                ShouldRegenerateSchedule = true,
                RequestedBy = RmaIdentity.Username,
                ImpersonateUser = RmaIdentity.Username
            });

        }

        public async Task UpdatePolicyStatusAfterSuccessfulPayment(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var policy = await _policyRepository.SingleAsync(p => p.PolicyId == policyId,
                    $"Could not find policy with id {policyId}");
                switch (policy.PolicyStatus)
                {
                    case PolicyStatusEnum.PendingFirstPremium:
                        policy.PolicyStatus = PolicyStatusEnum.Active;
                        break;
                    case PolicyStatusEnum.PendingReinstatement:
                        policy.PolicyStatus = PolicyStatusEnum.Reinstated;
                        break;
                    case PolicyStatusEnum.PendingContinuation:
                        policy.PolicyStatus = PolicyStatusEnum.Continued;
                        break;
                }

                _policyRepository.Update(policy);
                await scope.SaveChangesAsync();
            }
        }

        private async Task SaveNewMainMemberOnContinue(int policyId, Roleplayer newMainMember)
        {
            await GetOldMainMemberAndUpdate(policyId);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var relations = _rolePlayerRelationRepository.Where(c => c.PolicyId == policyId);
                foreach (var relation in relations.Where(c => c.FromRolePlayerId != newMainMember.RolePlayerId))
                {
                    relation.ToRolePlayerId = newMainMember.RolePlayerId;
                }

                //remove new main member from relations
                var mainMemberIndex = relations.ToList().FindIndex(c => c.FromRolePlayerId == newMainMember.RolePlayerId);
                relations.ToList().RemoveAt(mainMemberIndex);
                _rolePlayerRelationRepository.Update(relations.ToList());

                var entity = await _insuredLifeRepository.Where(c => c.PolicyId == policyId
                && c.RolePlayerId == newMainMember.RolePlayerId).SingleOrDefaultAsync();

                if (entity != null)
                {
                    entity.RolePlayerTypeId = (int)RolePlayerTypeEnum.MainMemberSelf;
                    _insuredLifeRepository.Update(entity);
                }

                //todo : save guardian as the main member if we are implemmenenting the 
                //guardian scenario
            }
        }

        private async Task GetOldMainMemberAndUpdate(int policyId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _insuredLifeRepository.Where(c => c.PolicyId == policyId
                && c.RolePlayerTypeId == (int)RolePlayerTypeEnum.MainMemberSelf
                && c.EndDate == null).SingleOrDefaultAsync();

                if (entity != null)
                {
                    if (entity.EndDate == null)
                    {
                        entity.EndDate = DateTime.Now;
                        _insuredLifeRepository.Update(entity);
                    }
                }
            }
        }

        private async Task DoPremiumWaivedRules(policy_Policy policy)
        {
            var insuredChildren = policy.PolicyInsuredLives.
                Where(c => c.RolePlayerTypeId == (int)RolePlayerTypeEnum.Child).ToList();
            if (insuredChildren.Count > 0)
            {
                var childIds = insuredChildren.Select(c => c.RolePlayerId).ToList();
                var children = await _rolePlayerRepository.Where(c => childIds.Contains(c.RolePlayerId)).ToListAsync();
                await _rolePlayerRepository.LoadAsync(children, c => c.Person);
                foreach (var child in children)
                {
                    if (CalculateAge(child.Person.DateOfBirth) >= 21)
                    {
                        var insuredChild = insuredChildren.Where(c => c.RolePlayerId == child.RolePlayerId).FirstOrDefault();
                        if (insuredChild != null)
                        {
                            insuredChild.EndDate = DateTime.Now;
                            insuredChild.InsuredLifeRemovalReason = InsuredLifeRemovalReasonEnum.MemberChildNoLongerQualifies;
                        }
                    }
                }
            }
        }

        private int CalculateAge(DateTime dateOfBirth)
        {
            int years = DateTime.Now.Year - dateOfBirth.Year;
            dateOfBirth = dateOfBirth.AddYears(years);
            if (dateOfBirth.Date > DateTime.Now.Date)
                years--;
            return years;
        }

        public async Task<bool> MonitorReinstatementPayments()
        {
            var wizards = new List<Wizard>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyIds = await _policyRepository.Where(c => c.PolicyStatus == PolicyStatusEnum.PendingReinstatement).Select(c => c.PolicyId).ToListAsync();
                wizards = await _wizardService.GetWizardsByConfigurationAndItemId(policyIds, "reinstate-policy");
            }
            if (wizards.Count > 0)
            {
                foreach (var item in wizards)
                {
                    var wizard = await _wizardService.GetWizardOnly(item.Id);
                    var stepData = _serializer.Deserialize<ArrayList>(wizard.Data);
                    var policyCase = _serializer.Deserialize<Case>(stepData[0].ToString());
                    var policy = await GetRolePlayerPolicyWithNoReferenceData(item.LinkedItemId);

                    Case parentPolicyCase = null;
                    if (policyCase.MainMember.Policies[0].ParentPolicyId.HasValue)
                    {
                        parentPolicyCase = await _caseService.GetCaseByPolicyId(policyCase.MainMember.Policies[0].ParentPolicyId.Value);
                    }

                    var unpaidInvoices = await GetAllOutstandingInvoicesForPolicy(policy);
                    if (unpaidInvoices.Count == 0)
                    {
                        await EditPolicy(policyCase);
                        policy.PolicyStatus = PolicyStatusEnum.Reinstated;
                        await UpdatePolicyStatus(policy);
                        await UpdatePolicyPremiums(policyCase);

                        try
                        {
                            await UpdateDocumentKeyValues(policyCase.Code, policy.PolicyNumber);
                            policyCase.Representative = await _representativeService.GetRepresentativeWithNoRefData(policy.RepresentativeId);
                            await _policyCommunicationService.SendFuneralPolicyDocuments(
                                wizard.Id,
                                policyCase,
                                parentPolicyCase,
                                PolicySendDocsProcessTypeEnum.SendIndividualFuneralPolicySchedule);
                        }
                        catch (Exception ex)
                        {
                            ex.LogException();
                        }
                    }
                    else
                    {
                        bool withinNinetyDayWindow;
                        using (_dbContextScopeFactory.CreateReadOnly())
                        {
                            withinNinetyDayWindow = await IsLapseStillWithinNinetyDayWindow(policy.PolicyId);
                        }
                        if (!withinNinetyDayWindow)
                        {
                            policy.PolicyStatus = PolicyStatusEnum.Lapsed;
                            await UpdatePolicyStatus(policy);
                            //increase lapse count to make sure we dont allow a reinstate ever again
                            policy_Policy dbEntity;
                            using (_dbContextScopeFactory.CreateReadOnly())
                            {
                                dbEntity = _policyRepository.FirstOrDefault(c => c.PolicyId == policy.PolicyId);
                            }
                            await IncreasePolicyLapseCount(dbEntity);
                            //log the policy lapse
                            await SavePolicyNote(policy.PolicyId, "Policy lapsed after 90 days no payment");
                            //generate credit note to balance pending invoices
                            await CreateCreditNotesForOutstandingInvoices(policy, CreditNoteTypeEnum.CancellationCreditNote.GetDescription(), false);

                            // TODO: Send policy lapse communication

                        }
                    }
                }
            }
            return await Task.FromResult(true);
        }

        private async Task SavePolicyNote(int policyId, string policyNote)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var note = new policy_PolicyNote
                {
                    PolicyId = policyId,
                    Text = policyNote,
                    IsDeleted = false
                };
                _policyNoteRepository.Create(note);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task SavePolicyNote(PolicyNote policyNote)
        {
            using (_dbContextScopeFactory.Create())
            {
                await _policyNoteRepository.ExecuteSqlCommandAsync(
                    DatabaseConstants.CreatePolicyNote,
                    new SqlParameter("@policyId", policyNote.PolicyId),
                    new SqlParameter("@text", policyNote.Text),
                    new SqlParameter("@userId", policyNote.CreatedBy)
                );
            }
        }

        private async Task SavePolicyNote(List<PolicyNote> policyNotes)
        {
            foreach (var policyNote in policyNotes)
            {
                await SavePolicyNote(policyNote);
            }
        }

        public async Task<bool> MonitorContinuationPayments()
        {
            var wizards = new List<Wizard>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyIds = await _policyRepository.Where(c => c.PolicyStatus == PolicyStatusEnum.PendingContinuation).Select(c => c.PolicyId).ToListAsync();
                wizards = await _wizardService.GetWizardsByConfigurationAndItemId(policyIds, "continue-policy");
            }

            if (wizards.Count > 0)
            {
                foreach (var item in wizards)
                {
                    var wizard = await _wizardService.GetWizardOnly(item.Id);
                    var stepData = _serializer.Deserialize<ArrayList>(wizard.Data);
                    var policyCase = _serializer.Deserialize<Case>(stepData[0].ToString());
                    var policy = await GetRolePlayerPolicyWithNoReferenceData(item.LinkedItemId);

                    Case parentPolicyCase = null;
                    if (policyCase.MainMember.Policies[0].ParentPolicyId.HasValue)
                    {
                        parentPolicyCase = await _caseService.GetCaseByPolicyId(policyCase.MainMember.Policies[0].ParentPolicyId.Value);
                    }

                    var unpaidInvoices = await GetAllOutstandingInvoicesForPolicy(policy);
                    if (unpaidInvoices.Count == 0)
                    {
                        await EditContinuePolicy(policyCase);
                        policy.PolicyStatus = PolicyStatusEnum.Active;
                        await UpdatePolicyStatus(policy);
                        try
                        {
                            await UpdateDocumentKeyValues(policyCase.Code, policy.PolicyNumber);
                            policyCase.Representative = await _representativeService.GetRepresentativeWithNoRefData(policy.RepresentativeId);
                            await _policyCommunicationService.SendFuneralPolicyDocuments(
                                wizard.Id,
                                policyCase,
                                parentPolicyCase,
                                PolicySendDocsProcessTypeEnum.SendIndividualFuneralPolicySchedule);
                        }
                        catch (Exception ex)
                        {
                            ex.LogException();
                        }

                    }
                    else
                    {
                        bool withinNinetyDayWindow = false;
                        using (_dbContextScopeFactory.CreateReadOnly())
                        {
                            withinNinetyDayWindow = await IsPauseStillWithinNinetyDayWindow(policy.PolicyId);
                        }
                        if (!withinNinetyDayWindow)
                        {
                            policy.PolicyStatus = PolicyStatusEnum.Cancelled;
                            policy.CancellationDate = DateTimeHelper.SaNow;
                            policy.CancellationInitiatedBy = "LapseDueToNoPaymentsReceived";
                            policy.CancellationInitiatedDate = DateTimeHelper.SaNow;
                            policy.PolicyCancelReason = PolicyCancelReasonEnum.ReinstatementPeriodExpired;
                            await UpdatePolicyStatus(policy);

                            //generate credit note to balance pending invoices
                            await CreateCreditNotesForOutstandingInvoices(policy, CreditNoteTypeEnum.CancellationCreditNote.GetDescription(), false);

                            try
                            {
                                var mainMember = _rolePlayerRepository.FirstOrDefault(s => s.RolePlayerId == policy.PolicyOwnerId);
                                var caseModel = new Case
                                {
                                    Code = policy.PolicyNumber,
                                    MainMember = Mapper.Map<Roleplayer>(mainMember)
                                };
                                caseModel.MainMember.Policies = new List<RolePlayerPolicy> { Mapper.Map<RolePlayerPolicy>(policy) };
                                policyCase.Representative = await _representativeService.GetRepresentativeWithNoRefData(policy.RepresentativeId);

                                // Clear the broker details, otherwise the object does not map to a caseModel
                                caseModel = ClearBrokerDetails(caseModel);
                                // Send email in a separate background thread
                                _ = Task.Run(() => _policyCommunicationService.SendPolicyCancellationCommunication(caseModel));
                            }
                            catch (Exception ex)
                            {
                                ex.LogException();
                            }
                        }
                    }
                }
            }
            return await Task.FromResult(true);
        }

        public async Task<bool> IsLapseStillWithinNinetyDayWindow(int policyId)
        {
            var result = false;
            var policy = await _policyRepository.Where(c => c.PolicyId == policyId).FirstOrDefaultAsync();
            if (policy.LastLapsedDate != null)
            {
                var diff = DateTime.Now.Subtract((DateTime)policy.LastLapsedDate);
                result = (diff.Days <= 90);
            }
            return result;
        }

        public async Task<bool> IsPauseStillWithinNinetyDayWindow(int policyId)
        {
            var result = false;
            var policy = await _policyRepository.Where(c => c.PolicyId == policyId).FirstOrDefaultAsync();
            if (policy.PolicyPauseDate != null)
            {
                var diff = DateTime.Now.Subtract((DateTime)policy.PolicyPauseDate);
                result = (diff.Days <= 90);
            }
            return result;
        }

        public async Task<RolePlayerPolicy> GetRolePlayerPolicyWithNoReferenceData(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _policyRepository
                    .Where(s => s.PolicyId == policyId).FirstOrDefaultAsync();
                return Mapper.Map<RolePlayerPolicy>(entity);
            }
        }

        public async Task<List<RolePlayerPolicy>> GetPoliciesByPolicyOwnerIdNoRefData(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _policyRepository
                    .Where(s => s.PolicyOwnerId == rolePlayerId).ToListAsync();
                return Mapper.Map<List<RolePlayerPolicy>>(entity);
            }
        }

        public async Task<List<RolePlayerPolicy>> GetPoliciesByPolicyPayeeIdNoRefData(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _policyRepository
                    .Where(s => s.PolicyPayeeId == rolePlayerId).ToListAsync();
                return Mapper.Map<List<RolePlayerPolicy>>(entity);
            }
        }

        public async Task EditRolePlayerPolicies(List<RolePlayerPolicy> rolePlayerPolicies)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var currentPeriod = await _periodService.GetCurrentPeriod();
                if (rolePlayerPolicies != null)
                    foreach (var rolePlayerPolicy in rolePlayerPolicies)
                    {
                        var policy = await _policyRepository.SingleOrDefaultAsync(x => x.PolicyOwnerId == rolePlayerPolicy.PolicyOwnerId);
                        await _policyRepository.LoadAsync(policy, e => e.PolicyOwner);

                        policy.LastLapsedDate = rolePlayerPolicy.LastLapsedDate;
                        policy.LapsedCount = rolePlayerPolicy.LapsedCount;
                        policy.PolicyStatus = rolePlayerPolicy.PolicyStatus;

                        _policyRepository.Update(policy);

                        if (policy.LastLapsedDate != null && policy.PaymentMethod != PaymentMethodEnum.GovernmentSalaryDeduction)
                        {
                            DateTime lastLapsedDate = policy.LastLapsedDate ?? DateTime.Now;

                            if (lastLapsedDate.Ticks > currentPeriod.StartDate.Ticks && lastLapsedDate.Ticks < currentPeriod.EndDate.Ticks)
                            {
                                try // Failed emails must not stop the process
                                {
                                    var policyCommunication = new PolicyCommunication
                                    {
                                        CCEmail = policy.PolicyOwner.EmailAddress,
                                        CellNumber = policy.PolicyOwner.CellNumber,
                                        DisplayName = policy.PolicyOwner.DisplayName,
                                        EmailAddress = policy.PolicyOwner.EmailAddress,
                                        InvoiceDate = currentPeriod.StartDate,
                                        PolicyId = policy.PolicyId,
                                        PolicyNumber = policy.PolicyNumber,
                                        PreferredCommunicationTypeId = 1,
                                        TellNumber = policy.PolicyOwner.TellNumber
                                    };
                                    await _policyCommunicationService.SendOnePremiumMissedCommunication(policyCommunication);
                                }
                                catch (Exception e)
                                {
                                    Log.Error(e, e.Message);
                                }
                            }
                        }
                    }

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public bool IsStillWithinCoolingOffPeriod(DateTime cancellationDate, DateTime inceptionDate)
        {
            var result = false;
            var diff = cancellationDate.Subtract(inceptionDate);

            result = (diff.Days <= 31);
            return result;
        }

        public async Task<bool> CheckNoClaimsAgainstPolicy(int policyId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var claimsExist = false;
                var claimIds = await _policyRepository.SqlQueryAsync<int>(DatabaseConstants.VerifyNoClaimsAgainstPolicyForRefund,
                     new SqlParameter("@policyId", policyId));
                claimsExist = claimIds.Count > 0;
                return claimsExist;
            }
        }

        private async Task<bool> UpdateDocumentKeyValues(string oldKeyValue, string newKeyValue)
        {
            return await _documentIndexService.UpdateDocumentKeyValues(oldKeyValue, newKeyValue);
        }

        public async Task<List<InvoiceAllocation>> CheckNoPaymentsAfterCancellation(int policyId, DateTime cancellationDate)
        {
            var invoiceAllocations = await _transactionCreatorService.GetPaymentMadeAfterSpecificDate(policyId, cancellationDate);
            return invoiceAllocations;
        }

        public async Task<List<Invoice>> CheckNoOutstandingInvoices(int policyId)
        {
            var invoices = await _transactionCreatorService.GetOutstandingInvoices(policyId);
            return invoices;
        }

        public async Task<decimal> GetTotalForOutstandingInvoices(int policyId)
        {
            var total = 0m;
            var invoices = await _transactionCreatorService.GetOutstandingInvoices(policyId);
            total = (invoices.Count > 0) ? invoices.Sum(c => c.TotalInvoiceAmount) : 0;
            return total;
        }

        public async Task<decimal> GetRefundAmountBasedOnAllocationsAndTrigger(RolePlayerPolicy policy, RefundTypeEnum refundType)
        {
            Contract.Requires(policy != null);

            var fullyAllocatedInvoices = new List<Invoice>();
            var partiallyAllocatedInvoices = new List<Invoice>();
            var allInvoicesToBeProcessed = new List<Invoice>();

            switch (refundType)
            {
                case RefundTypeEnum.PolicyCancellation:
                    var activityDate = (DateTime)policy.CancellationDate;
                    allInvoicesToBeProcessed = await _transactionCreatorService.GetInvoicesInSpecificDateRange(policy.PolicyId, activityDate, DateTime.Now);
                    break;
                case RefundTypeEnum.PolicyInception:
                    var invoices = await _transactionCreatorService.GetInvoicesByPolicyIdNoRefData(policy.PolicyId);
                    if (invoices.Count > 0)
                    {
                        allInvoicesToBeProcessed.Add(invoices.FirstOrDefault());
                    }
                    break;
            }

            decimal totalAllocated = 0m;
            if (allInvoicesToBeProcessed.Count > 0)
            {
                foreach (var invoice in allInvoicesToBeProcessed)
                {
                    if (invoice.Balance == 0)
                    {
                        //fully
                        fullyAllocatedInvoices.Add(invoice);
                        var amountAllocated = invoice.TotalInvoiceAmount - invoice.Balance;
                        totalAllocated += amountAllocated;
                    }
                    else if (invoice.Balance > 0 && invoice.Balance != invoice.TotalInvoiceAmount)
                    {
                        //partially
                        partiallyAllocatedInvoices.Add(invoice);
                        var amountAllocated = invoice.TotalInvoiceAmount - invoice.Balance;
                        totalAllocated += amountAllocated;
                    }
                }
            }
            return totalAllocated;
        }

        public async Task<List<int>> GetAllOutstandingInvoicesForPolicy(RolePlayerPolicy policy)
        {
            var outstandingInvoices = new List<Invoice>();
            var pendingInvoices = new List<Invoice>();
            var partiallyAllocatedInvoices = new List<Invoice>();
            var allInvoicesToBeProcessed = new List<Invoice>();
            if (policy != null)
                allInvoicesToBeProcessed = await _transactionCreatorService.GetInvoicesByPolicyIdNoRefData(policy.PolicyId);

            if (allInvoicesToBeProcessed.Count > 0)
            {
                foreach (var invoice in allInvoicesToBeProcessed)
                {
                    if (invoice.Balance == invoice.TotalInvoiceAmount)
                    {
                        pendingInvoices.Add(invoice);
                    }
                    else if (invoice.Balance > 0 && invoice.Balance < invoice.TotalInvoiceAmount)
                    {
                        partiallyAllocatedInvoices.Add(invoice);
                    }
                }
            }
            outstandingInvoices.AddRange(pendingInvoices);
            outstandingInvoices.AddRange(partiallyAllocatedInvoices);
            return outstandingInvoices.Select(c => c.InvoiceId).ToList();
        }

        public async Task<List<Invoice>> GetOutstandingInvoicesToRaiseCreditNotesFor(RolePlayerPolicy policy)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            var outstandingInvoices = new List<Invoice>();
            var pendingInvoices = new List<Invoice>();
            var partiallyAllocatedInvoices = new List<Invoice>();
            var allInvoicesToBeProcessed = new List<Invoice>();
            if (policy != null)
                allInvoicesToBeProcessed = await _transactionCreatorService.GetInvoicesByPolicyIdNoRefData(policy.PolicyId);

            if (allInvoicesToBeProcessed.Count > 0)
            {
                foreach (var invoice in allInvoicesToBeProcessed)
                {
                    if (invoice.Balance == invoice.TotalInvoiceAmount)
                    {
                        pendingInvoices.Add(invoice);
                    }
                    else if (invoice.Balance > 0 && invoice.Balance < invoice.TotalInvoiceAmount)
                    {
                        partiallyAllocatedInvoices.Add(invoice);
                    }
                }
            }
            outstandingInvoices.AddRange(pendingInvoices);
            outstandingInvoices.AddRange(partiallyAllocatedInvoices);
            return outstandingInvoices;
        }

        public async Task CreateCreditNotesForOutstandingInvoices(RolePlayerPolicy policy, string reason, bool createForFirstInvoiceOnly)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddCreditNote);

            decimal partailBalances = 0m;
            decimal pendingBalances = 0m;
            var pendingInvoices = new List<Invoice>();
            var partiallyAllocatedInvoices = new List<Invoice>();
            var invoices = await GetOutstandingInvoicesToRaiseCreditNotesFor(policy);

            if (invoices?.Count > 0)
            {
                //for things like policy inception date change we want the first invoice raised
                var invoicesToBeProcessed = createForFirstInvoiceOnly ? new List<Invoice> { invoices.OrderBy(c => c.InvoiceId).FirstOrDefault() } : invoices;
                foreach (var invoice in invoicesToBeProcessed)
                {
                    if (invoice.Balance == invoice.TotalInvoiceAmount)
                    {
                        pendingInvoices.Add(invoice);
                    }
                    else if (invoice.Balance > 0 && invoice.Balance < invoice.TotalInvoiceAmount)
                    {
                        partiallyAllocatedInvoices.Add(invoice);
                    }
                }

                if (pendingInvoices.Count > 0)
                    pendingBalances = pendingInvoices.Sum(c => c.Balance);

                if (partiallyAllocatedInvoices.Count > 0)
                    partailBalances = partiallyAllocatedInvoices.Sum(c => c.Balance);

                var amount = pendingBalances + partailBalances;
                if (policy != null)
                    await _transactionCreatorService.CreateCreditNoteForInvoicesSettlement(policy.PolicyOwnerId, amount, (!string.IsNullOrEmpty(reason) ? reason : ""), invoicesToBeProcessed);
            }
        }

        public async Task<decimal> CalculateAmountForMonthsEnjoyedCover(DateTime cancellationDate, DateTime policyInceptionDate, decimal installmentPremium)
        {
            var monthsEnjoyedCover = ((cancellationDate.Year - policyInceptionDate.Year) * 12) + cancellationDate.Month - policyInceptionDate.Month;
            var monthsEnjoyedCoveredPremiums = monthsEnjoyedCover * (installmentPremium / 12);
            return await Task.FromResult(monthsEnjoyedCoveredPremiums);
        }

        public async Task<bool> Monitor90DayLapse()
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var policies = await _policyRepository
                    .Where(c => c.PolicyStatus == PolicyStatusEnum.Lapsed
                         && c.RegularInstallmentDayOfMonth.HasValue
                         && c.ParentPolicyId == null
                         && c.CanLapse).OrderByDescending(c => c.PolicyId).Take(50).ToListAsync();

                foreach (var policy in policies)
                {
                    var withinNinetyDayWindow = await IsLapseStillWithinNinetyDayWindow(policy.PolicyId);
                    if (!withinNinetyDayWindow)
                    {
                        var rolePlayerPolicy = Mapper.Map<RolePlayerPolicy>(policy);

                        await CreateCreditNotesForOutstandingInvoices(rolePlayerPolicy, CreditNoteTypeEnum.CancellationCreditNote.GetDescription(), false);
                        await CancelLapsedPolicy(policy);

                        var mainMember = await _rolePlayerRepository.Where(r => r.RolePlayerId == rolePlayerPolicy.PolicyOwnerId).FirstOrDefaultAsync();
                        if (mainMember != null)
                        {
                            try
                            {
                                await _rolePlayerRepository.LoadAsync(mainMember, c => c.RolePlayerAddresses);
                                var caseModel = new Case
                                {
                                    Code = policy.PolicyNumber,
                                    MainMember = Mapper.Map<Roleplayer>(mainMember)

                                };
                                caseModel.MainMember.Policies = new List<RolePlayerPolicy> { rolePlayerPolicy };

                                var person =
                                    await _personRepository.FirstOrDefaultAsync(p => p.RolePlayerId == mainMember.RolePlayerId);
                                if (person != null)
                                {
                                    caseModel.MainMember.Person = Mapper.Map<Person>(person);

                                }

                                var parentEmail = string.Empty;
                                if (policy.ParentPolicyId.HasValue)
                                    parentEmail = policy.ParentPolicy.PolicyOwner.EmailAddress;

                                caseModel.Representative = await _representativeService.GetRepresentativeWithNoRefData(policy.RepresentativeId);
                                caseModel = ClearBrokerDetails(caseModel);

                                await _policyCommunicationService.SendPolicyCancellationAfterThreeLapses(caseModel, policy.ParentPolicyId.HasValue, parentEmail);
                            }
                            catch (Exception ex)
                            {
                                ex.LogException();
                            }
                        }
                    }
                }

            }

            return await Task.FromResult(true);
        }

        private async Task CancelLapsedPolicy(policy_Policy policy)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                policy.PolicyStatus = PolicyStatusEnum.Cancelled;
                policy.CancellationInitiatedBy = "Monitor90DayLapse";
                policy.CancellationInitiatedDate = DateTimeHelper.SaNow;
                policy.CancellationDate = DateTimeHelper.SaNow;
                policy.PolicyCancelReason = PolicyCancelReasonEnum.ReinstatementPeriodExpired;

                _policyRepository.Update(policy);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task IncreasePolicyLapseCount(policy_Policy policy)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                policy.LapsedCount = (policy.LapsedCount != null && policy.LapsedCount > 0) ? policy.LapsedCount + 1 : 2;

                _policyRepository.Update(policy);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<List<int>> GetTotalNumberOfPoliciesOwnedByRoleplayer(int rolePlayerId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayerPolicies = await _policyRepository
                    .Where(c => c.PolicyOwnerId == rolePlayerId
                             && c.PolicyStatus != PolicyStatusEnum.Cancelled)
                    .ToListAsync();
                return rolePlayerPolicies.Select(c => c.PolicyId).ToList();
            }
        }

        private async Task CreateCreditNotesForInvoicesRaisedAfterPolicyLapse(RolePlayerPolicy policy)
        {
            if (policy?.LastLapsedDate != null)
            {
                var invoices = await _transactionCreatorService.GetInvoicesByPolicyIdNoRefData(policy.PolicyId);
                var affectedInvoices = invoices.Where(i => i.Balance > 0 && i.InvoiceDate > policy.LastLapsedDate.Value).ToList();

                if (affectedInvoices.Count > 0)
                {
                    var amount = affectedInvoices.Sum(i => i.Balance);
                    await _transactionCreatorService.CreateCreditNoteForInvoicesSettlement(policy.PolicyOwnerId, amount, "", affectedInvoices);
                }
            }
        }

        private async Task CreateCreditNotesForInvoicesRaisedAfterPolicyLapse(RolePlayerPolicy policy, List<Invoice> invoices)
        {
            var affectedInvoices = invoices.Where(i => i.PolicyId == policy.PolicyId && i.Balance > 0 && i.InvoiceDate > policy.LastLapsedDate.Value).ToList();
            if (affectedInvoices.Count > 0)
            {
                var amount = affectedInvoices.Sum(i => i.Balance);
                await _transactionCreatorService.CreateCreditNoteForInvoicesSettlement(policy.PolicyOwnerId, amount, "", affectedInvoices);
            }
        }

        public async Task SavePreviousInsurers(Case policyCase)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (policyCase?.MainMember.PreviousInsurerRolePlayers != null)
                {
                    var previousInsurers = new List<PreviousInsurerRolePlayer>();
                    previousInsurers.AddRange(policyCase.MainMember.PreviousInsurerRolePlayers.Where(s => s.Id <= 0).ToList());

                    if (policyCase.Spouse != null)
                    {
                        foreach (var spouse in policyCase.Spouse)
                        {
                            if (spouse.PreviousInsurerRolePlayers != null)
                            {
                                previousInsurers.AddRange(spouse.PreviousInsurerRolePlayers.Where(s => s.Id <= 0).ToList());
                            }
                        }
                    }

                    if (policyCase.Children != null)
                    {
                        foreach (var child in policyCase.Children)
                        {
                            if (child.PreviousInsurerRolePlayers != null)
                            {
                                previousInsurers.AddRange(child.PreviousInsurerRolePlayers.Where(s => s.Id <= 0).ToList());
                            }
                        }
                    }

                    if (policyCase.ExtendedFamily != null)
                    {
                        foreach (var extended in policyCase.ExtendedFamily)
                        {
                            if (extended.PreviousInsurerRolePlayers != null)
                            {
                                previousInsurers.AddRange(extended.PreviousInsurerRolePlayers.Where(s => s.Id <= 0).ToList());
                            }
                        }
                    }

                    foreach (var previousInsurer in previousInsurers)
                    {
                        _previousInsurerRolePlayerRepository.Create(Mapper.Map<client_PreviousInsurerRolePlayer>(previousInsurer));
                    }

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        public async Task<int> CreateGroupPolicyMember(RolePlayerGroupPolicy memberPolicy)
        {
            Contract.Requires(memberPolicy != null);

            // Found that in some cases beneficiaries repeat
            memberPolicy.Beneficiaries = RemoveDuplicateBeneficiaries(memberPolicy.Beneficiaries.ToList());
            // Update main member details. Address and banking details are also saved here
            memberPolicy.MainMember = await SaveRolePlayerPerson(memberPolicy.MainMember);
            // Insert / update policy member roleplayers and persons. RoleplayerId's for new
            // members are assigned here as well, so we have to update the policyCase list.
            memberPolicy.Spouse = await SaveRolePlayerPersons(memberPolicy.Spouse);
            memberPolicy.Children = await SaveRolePlayerPersons(memberPolicy.Children);
            memberPolicy.ExtendedFamily = await SaveRolePlayerPersons(memberPolicy.ExtendedFamily);
            memberPolicy.Beneficiaries = await SaveRolePlayerPersons(memberPolicy.Beneficiaries);
            // Save the child policy
            var policyId = await AddChildPolicy(memberPolicy.MainMember.RolePlayerId, memberPolicy);
            // Create a Case object in order to save relations, beneficiares and insured lives
            memberPolicy.MainMember.Policies[0].PolicyId = policyId;
            var policyCase = new Case
            {
                MainMember = memberPolicy.MainMember,
                Spouse = memberPolicy.Spouse,
                Children = memberPolicy.Children,
                ExtendedFamily = memberPolicy.ExtendedFamily,
                Beneficiaries = memberPolicy.Beneficiaries
            };
            // Save roleplayer relations
            await UpdatePolicyRolePlayerRelations(policyCase);
            // Save beneficiaries
            await UpdatePolicyBeneficiaries(policyCase);
            // Save policy insured lives
            await UpdatePolicyInsuredLives(policyCase);
            // Update the premiums of the parent policy
            await UpdateChildPolicyPremiums(memberPolicy.ParentPolicyId);
            return policyId;
        }

        private async Task<int> AddChildPolicy(int mainMemberId, RolePlayerGroupPolicy memberPolicy)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var policyId = 0;
                var parentPolicy = await _policyRepository
                    .FirstOrDefaultAsync(s => s.PolicyId == memberPolicy.ParentPolicyId);
                var premium = GetTotalPolicyPremium(memberPolicy);
                var annualPremium = premium * 12.0M;
                switch (parentPolicy.PaymentFrequency)
                {
                    case PaymentFrequencyEnum.Annually:
                        premium = premium * 12.0M;
                        break;
                    case PaymentFrequencyEnum.BiAnnually:
                        premium = premium * 6.0M;
                        break;
                    case PaymentFrequencyEnum.Quarterly:
                        premium = premium * 4.0M;
                        break;
                }
                policyId = await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.PolicyNumber);
                var policyNumber = $"01-{DateTime.Today:yyMMdd}-{policyId:000000}";
                var policy = new policy_Policy
                {
                    PolicyId = policyId,
                    BrokerageId = parentPolicy.BrokerageId,
                    ProductOptionId = parentPolicy.ProductOptionId,
                    RepresentativeId = parentPolicy.RepresentativeId,
                    JuristicRepresentativeId = parentPolicy.JuristicRepresentativeId,
                    PolicyOwnerId = mainMemberId,
                    PolicyPayeeId = parentPolicy.PolicyPayeeId,
                    PaymentFrequency = parentPolicy.PaymentFrequency,
                    PaymentMethod = parentPolicy.PaymentMethod,
                    PolicyNumber = policyNumber,
                    PolicyInceptionDate = memberPolicy.MainMember.JoinDate.Value.ToSaDateTime(),
                    FirstInstallmentDate = memberPolicy.MainMember.JoinDate.Value.ToSaDateTime(),
                    RegularInstallmentDayOfMonth = parentPolicy.RegularInstallmentDayOfMonth.Value,
                    DecemberInstallmentDayOfMonth = parentPolicy.DecemberInstallmentDayOfMonth.Value,
                    PolicyStatus = PolicyStatusEnum.Active,
                    AnnualPremium = annualPremium,
                    InstallmentPremium = premium,
                    CommissionPercentage = parentPolicy.CommissionPercentage,
                    AdminPercentage = parentPolicy.AdminPercentage,
                    ClientReference = memberPolicy.ClientReference.ToUpper(),
                    ParentPolicyId = parentPolicy.PolicyId,
                    IsDeleted = false
                };
                policy.PolicyInsuredLives = null;
                policy.Benefits = Mapper.Map<List<product_Benefit>>(memberPolicy.MainMember.Policies[0].Benefits);
                policy.PolicyBrokers = await GetPolicyBroker(
                    policyId,
                    parentPolicy.BrokerageId,
                    parentPolicy.RepresentativeId,
                    parentPolicy.JuristicRepresentativeId,
                    memberPolicy.MainMember.JoinDate.Value);
                _policyRepository.Create(policy);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return policyId;
            }
        }

        private async Task<List<policy_PolicyBroker>> GetPolicyBroker(int policyId, int brokerageId, int representativeId, int? juristicRepresentativeId, DateTime effectiveDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var broker = await _policyBrokerRepository
                .FirstOrDefaultAsync(s => s.PolicyId == policyId
                    && s.BrokerageId == brokerageId);
                if (broker == null)
                {
                    broker = new policy_PolicyBroker
                    {
                        PolicyBrokerId = 0,
                        PolicyId = policyId,
                        BrokerageId = brokerageId,
                        RepId = representativeId,
                        JuristicRepId = juristicRepresentativeId,
                        EffectiveDate = effectiveDate,
                        IsDeleted = false
                    };
                }
                return new List<policy_PolicyBroker> { broker };
            }
        }

        private decimal GetTotalPolicyPremium(RolePlayerGroupPolicy memberPolicy)
        {
            decimal premium = 0.0M;
            if (memberPolicy.MainMember.Policies == null) return premium;
            if (memberPolicy.MainMember.Policies[0].Benefits == null) return premium;

            foreach (var benefit in memberPolicy.MainMember.Policies[0].Benefits)
            {
                if (benefit.BenefitRates != null)
                {
                    var rates = benefit.BenefitRates.OrderByDescending(b => b.EffectiveDate);
                    if (rates != null)
                    {
                        var currentRate = rates.FirstOrDefault();
                        if (currentRate != null)
                        {
                            premium += currentRate.BaseRate;
                        }
                    }
                }
            }
            return premium;
        }

        private decimal GetTotalPolicyPremium(List<RolePlayerBenefit> benefits)
        {
            decimal premium = 0.0M;
            if (benefits is null) return premium;

            foreach (var benefit in benefits)
            {
                if (benefit.BenefitRates != null)
                {
                    var rates = benefit.BenefitRates.OrderByDescending(b => b.EffectiveDate);
                    if (rates != null)
                    {
                        var currentRate = rates.FirstOrDefault();
                        if (currentRate != null)
                        {
                            premium += currentRate.BaseRate;
                        }
                    }
                }
            }
            return premium;
        }

        public async Task<List<RolePlayerPolicy>> GetPoliciesActivatedBeforePeriod(DateTime periodStartDate)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyStatuses = new List<PolicyStatusEnum> { PolicyStatusEnum.PendingFirstPremium, PolicyStatusEnum.Active, PolicyStatusEnum.Continued, PolicyStatusEnum.Reinstated };
                var annualInceptionDate = periodStartDate.AddMonths(-1);
                var monthlyPolicies = await _policyRepository.Where(p => policyStatuses.Contains(p.PolicyStatus) && p.PolicyInceptionDate < periodStartDate && p.ParentPolicyId == null && p.PaymentFrequency == PaymentFrequencyEnum.Monthly && p.InstallmentPremium > 0).ToListAsync();
                var annualPolicies = await _policyRepository.Where(p => policyStatuses.Contains(p.PolicyStatus) && (p.PolicyInceptionDate.Year == annualInceptionDate.Year && p.PolicyInceptionDate.Month == annualInceptionDate.Month && p.PolicyInceptionDate.Day == annualInceptionDate.Day) && p.ParentPolicyId == null && p.PaymentFrequency == PaymentFrequencyEnum.Annually && p.InstallmentPremium > 0).ToListAsync();
                var policies = monthlyPolicies;
                policies.AddRange(annualPolicies);
                return Mapper.Map<List<RolePlayerPolicy>>(policies);
            }
        }

        public async Task EditRolePlayerPolicy(RolePlayerPolicy policy)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<policy_Policy>(policy);
                _policyRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task UpdateChildPolicyPremiums(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            using (_dbContextScopeFactory.Create())
            {
                await _policyRepository.ExecuteSqlCommandAsync(
                    DatabaseConstants.UpdateChildPolicyPremiums,
                    new SqlParameter("@policyId", policyId),
                    new SqlParameter("@userId", RmaIdentity.Email)
                );
            }
        }

        public async Task UpdateIndividualPolicyPremium(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            using (_dbContextScopeFactory.Create())
            {
                await _policyRepository.ExecuteSqlCommandAsync(
                    DatabaseConstants.UpdateIndividualPolicyPremium,
                    new SqlParameter("@policyId", policyId),
                    new SqlParameter("@userId", RmaIdentity.Email)
                );
            }
        }

        public async Task UpdateMVPMainMemberFuneralPremium(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            using (_dbContextScopeFactory.Create())
            {
                await _policyRepository.ExecuteSqlCommandAsync(
                    DatabaseConstants.UpdateMVPMainMemberFuneralPremium,
                    new SqlParameter("@policyId", policyId),
                    new SqlParameter("@userId", RmaIdentity.Email)
                );
            }
        }

        public async Task UpdatePolicyPremiums(Case @case)
        {
            Contract.Requires(@case != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            using (_dbContextScopeFactory.Create())
            {
                var policyId = @case.MainMember.Policies[0].PolicyId;
                var policy = await _policyRepository.FindByIdAsync(policyId);

                var lifeExtension = await _lifeExtensionRepository
                    .FirstOrDefaultAsync(s => s.PolicyId == policyId);

                if (lifeExtension == null)
                {
                    if (policy.ParentPolicyId.HasValue)
                    {
                        await UpdateChildPolicyPremiums(policy.ParentPolicyId.Value);
                    }
                    else
                    {
                        await UpdateIndividualPolicyPremium(policyId);
                    }
                }
                else
                {
                    await _policyRepository.ExecuteSqlCommandAsync(
                       DatabaseConstants.UpdateConsolidatedFuneralPremium,
                           new SqlParameter("@policyId", policyId),
                           new SqlParameter("@userId", RmaIdentity.Email)
                    );

                    if (policy.PaymentMethod == PaymentMethodEnum.GovernmentSalaryDeduction)
                    {
                        QLinkTransactionTypeEnum qLinkTransactionType = policy.PolicyStatus == PolicyStatusEnum.Reinstated
                            ? QLinkTransactionTypeEnum.QADD
                            : QLinkTransactionTypeEnum.QUPD;

                        await _qlinkService.ProcessQlinkTransactionAsync(
                            new List<string> { policy.PolicyNumber },
                            qLinkTransactionType,
                            false
                        );
                    }
                }
            }
        }

        public async Task UpdateMemberPremiumContribution(int policyId, string policyNumber, int rolePlayerId, DateTime date)
        {
            using (_dbContextScopeFactory.Create())
            {
                await _policyRepository.ExecuteSqlCommandAsync(
                   DatabaseConstants.UpdateMemberPremiumContribution,
                       new SqlParameter("@policyId", policyId),
                       new SqlParameter("@rolePlayerId", rolePlayerId),
                       new SqlParameter("@calculationDate", date.ToString("yyyy-MM-dd"))
                );

                var lifeExtension = await _lifeExtensionRepository
                    .FirstOrDefaultAsync(s => s.PolicyId == policyId);
                if (lifeExtension != null)
                {
                    await _qlinkService.ProcessQlinkTransactionAsync(
                        new List<string> { policyNumber },
                        QLinkTransactionTypeEnum.QUPD,
                        false
                    );
                }
            }
        }

        public async Task<PolicyInsuredLife> RemoveInsuredLife(int rolePlayerId, int policyId, DateTime insuredLifeEndDate)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var policyInsuredLife = await _insuredLifeRepository
                    .SingleAsync(x => x.RolePlayerId == rolePlayerId && x.PolicyId == policyId);
                policyInsuredLife.InsuredLifeRemovalReason = InsuredLifeRemovalReasonEnum.NoInsurableInterest;
                policyInsuredLife.InsuredLifeStatus = InsuredLifeStatusEnum.Cancelled;
                policyInsuredLife.EndDate = insuredLifeEndDate.ToSaDateTime();
                _insuredLifeRepository.Update(policyInsuredLife);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return Mapper.Map<PolicyInsuredLife>(policyInsuredLife);
            }
            ;
        }

        public async Task<PagedRequestResult<RolePlayerPolicy>> SearchCoidPolicies(PagedRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = new PagedRequestResult<policy_Policy>();

                policies = await _policyRepository
                    .Where(p => string.IsNullOrEmpty(request.SearchCriteria)
                                || p.PolicyNumber.Contains(request.SearchCriteria)
                                || p.PolicyOwner.DisplayName.Contains(request.SearchCriteria)
                                || p.PolicyOwner.Company.Name.Contains(request.SearchCriteria)
                                || p.PolicyOwner.Company.ReferenceNumber.Contains(request.SearchCriteria)
                                || p.PolicyOwner.Company.CompensationFundReferenceNumber.Contains(request.SearchCriteria)
                                || p.PolicyOwner.Company.IdNumber.Contains(request.SearchCriteria)
                                || p.PolicyOwner.FinPayee.FinPayeNumber.Contains(request.SearchCriteria)).ToPagedResult(request);

                if (policies.Data.Count == 0)
                    return new PagedRequestResult<RolePlayerPolicy>();

                foreach (var policy in policies.Data)
                {
                    await _policyRepository.LoadAsync(policy, t => t.PolicyOwner);
                    await _rolePlayerRepository.LoadAsync(policy.PolicyOwner, a => a.Company);
                    await _rolePlayerRepository.LoadAsync(policy.PolicyOwner, a => a.Person);
                    await _rolePlayerRepository.LoadAsync(policy.PolicyOwner, a => a.FinPayee);
                }
                var mappedPolicies = Mapper.Map<List<RolePlayerPolicy>>(policies.Data);

                return new PagedRequestResult<RolePlayerPolicy>()
                {
                    PageSize = policies.PageSize,
                    Page = policies.Page,
                    PageCount = policies.PageCount,
                    RowCount = policies.RowCount,
                    Data = mappedPolicies
                };
            }
        }

        public async Task AdjustInvoicesAferClaimIsAuthorised(int policyId, int claimId)
        {
            using (_dbContextScopeFactory.Create())
            {
                await _policyRepository.ExecuteSqlCommandAsync(DatabaseConstants.CreateCreditNotesForPolicyWithClaim,
                    new SqlParameter("@policyId", policyId),
                    new SqlParameter("@claimId", claimId)
                );
            }
        }

        public async Task<ImportInsuredLivesSummary> UploadInsuredLives(FileContentImport content)
        {
            if (content == null)
            {
                throw new NullReferenceException("File content cannot be null");
            }

            if (string.IsNullOrEmpty(content.Data))
            {
                throw new NullReferenceException("File content cannot be null");
            }

            var decodedString = Convert.FromBase64String(content.Data);
            const int StartingIndex = 0;
            var fileData = Encoding.UTF8.GetString(decodedString, StartingIndex, decodedString.Length);
            var memberIndex = fileData.IndexOf("RMA Member Number", StringComparison.Ordinal);

            if (memberIndex != -1)
            {
                fileData = fileData.Substring(memberIndex);
            }

            const char commaDelimiter = ',';
            const string newLine = "\n";
            int returned = 0;
            int _returned = 0;
            int uploadSkipped = 0;

            var csvParserOptions = new CsvParserOptions(true, commaDelimiter);
            var csvMapper = new InsuredLifeMapping();
            var csvParser = new CsvParser<Load_InsuredLife>(csvParserOptions, csvMapper);
            var csvReaderOptions = new CsvReaderOptions(new[] { newLine });
            var records = csvParser.ReadFromString(csvReaderOptions, fileData).ToList();

            var fileIdentifier = Guid.NewGuid();
            var memberNumber = string.Empty;
            var insuresLives = new List<Load_InsuredLife>();

            var rowNumber = 3; // First line containing data in the spreadsheet.
            var uploadResult = new ImportInsuredLivesSummary();

            foreach (var record in records)
            {
                if (!record.IsValid)
                {
                    var message = $"Error on line {rowNumber} column {record.Error.ColumnIndex}: {record.Error.Value}";
                    throw new Exception(message);
                }
                ;
                if (String.IsNullOrEmpty(record.Result.MemberNumber))
                {
                    if (!string.IsNullOrEmpty(record.Result.FirstName))
                    {
                        uploadSkipped++;
                    }
                    continue;
                }
                var insuredLifeListingData = record.Result;
                if (string.IsNullOrEmpty(memberNumber)) memberNumber = insuredLifeListingData.MemberNumber;
                insuredLifeListingData.FileIdentifier = fileIdentifier;
                insuredLifeListingData.MemberNumber = memberNumber;
                insuredLifeListingData.ExcelRowNumber = rowNumber.ToString();

                insuresLives.Add(insuredLifeListingData);
                rowNumber++;
            }

            returned = insuresLives.Count;
            _returned = returned;
            var res = await ImportInsuredLivesRecords(memberNumber, fileIdentifier, insuresLives, content.UserId);

            if (res > 0)
            {
                _returned = 0;
                var insuredLifeFileAudit = new InsuredLifeFileAudit();
                insuredLifeFileAudit.FileName = content.FileName;
                insuredLifeFileAudit.FileHash = Convert.ToString(fileIdentifier);
                insuredLifeFileAudit.PremiumListingStatus = PremiumListingStatusEnum.Failed;
                await AddInsuredLifeFileAudit(insuredLifeFileAudit);
            }
            else
            {
                var insuredLifeFileAudit = new InsuredLifeFileAudit();
                insuredLifeFileAudit.FileName = content.FileName;
                insuredLifeFileAudit.FileHash = Convert.ToString(fileIdentifier);
                insuredLifeFileAudit.PremiumListingStatus = PremiumListingStatusEnum.AwaitingApproval;
                await AddInsuredLifeFileAudit(insuredLifeFileAudit);
            }
            uploadResult.Total = rowNumber - 2;
            uploadResult.TotalNew = _returned;
            uploadResult.TotalDelete = uploadSkipped;

            return uploadResult;
        }

        public async Task UpdateFinPayee(int oldPolicyOwnerId, int newPolicyOwnerId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var oldFinPayee = await _finPayeeRepository.SingleOrDefaultAsync(f => f.RolePlayerId == oldPolicyOwnerId);
                var finPayee = await _finPayeeRepository.SingleOrDefaultAsync(f => f.RolePlayerId == newPolicyOwnerId);
                if (finPayee == null)
                {
                    var person = await _personRepository.SingleOrDefaultAsync(p => p.RolePlayerId == newPolicyOwnerId);
                    var prefix = (person.Surname + person.FirstName).Substring(0, 2);
                    var accountNumber = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.AccountNumber, prefix);
                    var entity = new client_FinPayee
                    {
                        RolePlayerId = newPolicyOwnerId,
                        FinPayeNumber = accountNumber,
                        IsAuthorised = true,
                        AuthroisedBy = RmaIdentity.Email,
                        AuthorisedDate = DateTimeHelper.SaNow,
                        IsDeleted = false,
                        CreatedBy = RmaIdentity.Email,
                        CreatedDate = DateTimeHelper.SaNow,
                        ModifiedBy = RmaIdentity.Email,
                        ModifiedDate = DateTimeHelper.SaNow,
                        IndustryId = oldFinPayee == null ? null : oldFinPayee.IndustryId
                    };
                    _finPayeeRepository.Create(entity);
                }
                else
                {
                    finPayee.IsDeleted = false;
                    finPayee.ModifiedBy = RmaIdentity.Email;
                    finPayee.ModifiedDate = DateTimeHelper.SaNow;
                    _finPayeeRepository.Update(finPayee);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task UpdateBillingTransactionRolePlayer(int oldPolicyPayeeId, int newPolicyPayeeId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                await _policyRepository.ExecuteSqlCommandAsync(
                    DatabaseConstants.ChangeTransactionRolePlayer,
                    new SqlParameter("@oldRolePlayerId", oldPolicyPayeeId),
                    new SqlParameter("@newRolePlayerId", newPolicyPayeeId),
                    new SqlParameter("@userId", RmaIdentity.Email)
                );
            }
        }

        private async Task<int> ImportInsuredLivesRecords(string company, Guid fileIdentifier, List<Load_InsuredLife> insuredLives, int UserId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                string sql;
                const int importCount = 500;
                while (insuredLives.Count > 0)
                {
                    var count = insuredLives.Count >= importCount ? importCount : insuredLives.Count;
                    var records = insuredLives.GetRange(0, count);
                    sql = GetInsuredLivesSql(records);
                    await _insuredLifeRepository.ExecuteSqlCommandAsync(sql);
                    await UpdateInsuredLivesIsExisting(company, fileIdentifier);
                    insuredLives.RemoveRange(0, count);
                }
                var data = await _loadInsuredLifeRepository
                    .FirstOrDefaultAsync(s => s.FileIdentifier.Equals(fileIdentifier));

                await RunValidations(fileIdentifier, UserId);
                var errors = await _insuredLifeErrorAuditService.GetInsuredLivesErrorAudits(Convert.ToString(fileIdentifier));
                if (data != null && (errors.Count == 0))
                {
                    await CreateWizardTask(company, fileIdentifier);
                }

                return errors.Count;
            }
        }

        private async Task RunValidations(Guid fileIdentifier, int userId)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                await _insuredLifeRepository.ExecuteSqlCommandAsync(DatabaseConstants.ValidatePremiumListingRecords,
                   new SqlParameter("@fileIdentifier", fileIdentifier),
                   new SqlParameter("@UserId", userId));
            }
        }

        private string GetInsuredLivesSql(List<Load_InsuredLife> records)
        {
            var sql = "INSERT INTO [Load].[InsuredLives] ([FileIdentifier],[MemberNumber],[Passport],[IDNumber],[FirstName],[Surname],[Gender],[Nationality],[CellNumber],[HomeAddress],[PostalCode],[PostalAddress],[Code],[Province],[EmployeeNumber],[EmploymentDate],[Occupation],[AnnualEarnings],[DateOfBirth],[ExcelRowNumber]) values";
            foreach (var rec in records)
            {
                rec.DateOfBirth = Convert.ToString(GetDOBFromID(rec.IdNumber));
                sql += string.Format("('{0}',{1},'{2}','{3}',{4},{5},'{6}','{7}','{8}','{9}',{10},{11},{12},{13},{14},{15},{16},{17},{18},{19}),",
                    rec.FileIdentifier,
                    SetLength(rec.MemberNumber, 256).Quoted(),
                    SetLength(rec.Passport, 32).TrimText(),
                    SetLength(rec.IdNumber, 32),
                    SetLength(rec.FirstName, 256).Quoted(),
                    SetLength(rec.Surname, 256).Quoted(),
                    SetLength(rec.Gender, 32),
                    SetLength(rec.Nationality, 32).TrimText(),
                    SetLength(rec.CellNumber, 32).TrimText(),
                    SetLength(rec.HomeAddress, 256).TrimText(),
                    SetLength(rec.PostalCode, 32).Quoted(),
                    SetLength(rec.PostalAddress, 256).Quoted(),
                    SetLength(rec.Code, 32).Quoted(),
                    SetLength(rec.Province, 32).Quoted(),
                    SetLength(rec.EmployeeNumber, 32).Quoted(),
                    SetLength(rec.EmploymentDate, 32).Quoted(),
                    SetLength(rec.Occupation, 32).Quoted(),
                    SetLength(rec.AnnualEarnings, 32).Quoted(),
                    SetLength(rec.DateOfBirth, 32).Quoted(),
                    SetLength(rec.ExcelRowNumber, 50).Quoted()
                );
            }
            sql = sql.TrimEnd(new char[] { ',' });
            return sql;
        }

        private async Task UpdateInsuredLivesIsExisting(string company, Guid fileIdentifier)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                var fileIdentifierParameter = new SqlParameter { ParameterName = "@FILEIDENTIFIER", Value = fileIdentifier };
                var companyParameter = new SqlParameter { ParameterName = "@COMPANY", Value = company };

                await this._insuredLifeRepository.ExecuteSqlCommandAsync(
                    "[Load].[InsuredLivesUpdateIsExisting] @FILEIDENTIFIER,@COMPANY",
                        fileIdentifierParameter, companyParameter
                );
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

        private string SetLength(string value, int len)
        {
            value = value.Trim();
            return value.Length > len ? value.Substring(0, len) : value;
        }

        private async Task CreateWizardTask(string company, Guid fileIdentifier)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                var companyParameter = new SqlParameter { ParameterName = "@COMPANY", Value = company };
                var fileIdentifierParameter = new SqlParameter { ParameterName = "@FILEIDENTIFIER", Value = fileIdentifier };
                var dateParameter = new SqlParameter { ParameterName = "@DATE", Value = DateTime.Today.ToString("yyyy-MM-dd") };
                var versionParameter = new SqlParameter { ParameterName = "@VERSION", Value = 2 };
                var userParameter = new SqlParameter { ParameterName = "@USER", Value = RmaIdentity.Email };

                await this._insuredLifeRepository.ExecuteSqlCommandAsync(
                    "[policy].[InsureLifeUploadTask] @COMPANY, @FILEIDENTIFIER, @DATE, @VERSION, @USER",
                        companyParameter,
                        fileIdentifierParameter,
                        dateParameter,
                        versionParameter,
                        userParameter
                );
            }
        }

        public async Task<int> AddInsuredLifeFileAudit(InsuredLifeFileAudit insuredLifeFileAudit)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<policy_InsuredLifeFileAudit>(insuredLifeFileAudit);
                _insuredLifeFileRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.Id;
            }
        }

        public async Task<ImportInsuredLivesSummary> ImportInsuredLives(ImportInsuredLivesRequest importRequest)
        {
            Contract.Requires(importRequest != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var fileIdentifierParameter = new SqlParameter { ParameterName = "@fileIdentifier", Value = importRequest.FileIdentifier };
                var createNewPoliciesParameter = new SqlParameter { ParameterName = "@createNewPolicies", Value = importRequest.CreateNewPolicies ? 1 : 0 };
                var userIdParameter = new SqlParameter { ParameterName = "@userId", Value = RmaIdentity.Email };

                if (!importRequest.SaveInsuredLives)
                {
                    // Clear errors and messages for the import
                    await _policyRepository
                       .ExecuteSqlCommandAsync(
                           "[Load].[SetupInsuredLivesImport] @fileIdentifier",
                           fileIdentifierParameter
                       );
                    // Add company and benefit details
                    await _policyRepository
                        .ExecuteSqlCommandAsync(
                            "[Load].[ImportInsuredLivesCompany] @fileIdentifier, @userId",
                            fileIdentifierParameter,
                            userIdParameter
                        );
                    // Load group policy members (this only takes a couple of seconds, even for large files)
                    await _policyRepository
                        .ExecuteSqlCommandAsync(
                            "[Load].[InsertInsuredLivesMembers] @fileIdentifier",
                            fileIdentifierParameter
                        );
                    // Run validations.
                    var summary = await _policyRepository
                        .SqlQueryAsync<ImportInsuredLivesSummary>(
                            "[Load].[ValidateInsuredLives] @fileIdentifier",
                            fileIdentifierParameter
                        );
                    return summary[0];
                }
                else
                {
                    // Import the group policy members from the file
                    var summary = await _policyRepository
                        .SqlQueryAsync<ImportInsuredLivesSummary>(
                            "[Load].[ImportInsuredLivesMembers] @fileIdentifier, @userId",
                            fileIdentifierParameter,
                            userIdParameter
                        );
                    return summary[0];
                }
            }
        }

        public async Task<RuleRequestResult> InsuredLivesImportErrors(string fileIdentifier)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var identifier = new Guid(fileIdentifier);
                var data = await _insuredLivesErrorRepository
                    .Where(e => e.FileIdentifier == identifier)
                    .OrderBy(e => e.Id)
                    .ToListAsync();
                var errors = Mapper.Map<List<PremiumListingError>>(data);

                var fileErrors = GetRuleResult("File Import Error", errors.Where(e => e.ErrorCategory == "File Import Error").ToList());
                if (fileErrors.Passed)
                {
                    var result = new RuleRequestResult()
                    {
                        OverallSuccess = false,
                        RequestId = Guid.NewGuid(),
                        RuleResults = new List<RuleResult>()
                    };

                    var paymentErrors = GetRuleResult("Payments", errors.Where(e => e.ErrorCategory == "Payments").ToList());
                    if (paymentErrors.MessageList.Count > 0)
                    {
                        result.RuleResults.Add(paymentErrors);
                    }
                    else
                    {
                        var importErrors = GetRuleResult("File Error", errors.Where(e => e.ErrorCategory == "File Error").ToList());
                        var idNumberErrors = GetRuleResult("Missing ID Numbers", errors.Where(e => e.ErrorCategory == "Missing ID Numbers").ToList());
                        var dateErrors = GetRuleResult("Date Error", errors.Where(e => e.ErrorCategory == "Date Error").ToList());

                        result.RuleResults.Add(importErrors);
                        result.RuleResults.Add(idNumberErrors);
                        result.RuleResults.Add(dateErrors);
                        //TODO
                        //var contactDetailErrors = GetRuleResult("Contact Details", errors.Where(e => e.ErrorCategory == "Contact Details").ToList());
                        //result.RuleResults.Add(contactDetailErrors);
                    }

                    result.OverallSuccess = errors.Count == 0;
                    return result;
                }
                else
                {
                    var result = new RuleRequestResult()
                    {
                        OverallSuccess = false,
                        RequestId = Guid.NewGuid(),
                        RuleResults = new List<RuleResult>()
                    };
                    result.RuleResults.Add(fileErrors);
                    return result;
                }
            }
        }

        private RuleResult GetRuleResult(string ruleName, List<PremiumListingError> errors)
        {
            var result = new RuleResult
            {
                RuleName = ruleName,
                Passed = errors.Count == 0,
                MessageList = errors.Select(e => e.ErrorMessage).Distinct().ToList<string>()
            };
            return result;
        }

        public async Task ChangePolicyStatus(RolePlayerPolicy policy, string reason)
        {
            Contract.Requires(policy != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _policyRepository.SingleOrDefaultAsync(p => p.PolicyId == policy.PolicyId);
                if (entity is null)
                    throw new Exception($"Could not find policy with PolicyId {policy.PolicyId}.");

                if (entity.PolicyStatus != policy.PolicyStatus)
                {
                    // Update that policy status
                    entity.PolicyStatus = policy.PolicyStatus;
                    if (policy.PolicyStatus == PolicyStatusEnum.Paused)
                    {
                        entity.PolicyPauseDate = ((DateTime)policy.PolicyPauseDate).ToSaDateTime();
                    }
                    _policyRepository.Update(entity);

                    // Save a policy status change audit record
                    LogPolicyStatusChange(policy.PolicyId, policy.PolicyStatus, reason);

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        public async Task<ProductOption> GetPolicyProductOption(int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _policyRepository.Where(s => s.PolicyId == policyId).FirstOrDefaultAsync();
                return Mapper.Map<ProductOption>(_productOptionRepository.FirstOrDefault(p => p.Id == entity.ProductOptionId));
            }
        }

        public async Task<PolicyContact> GetPolicyContact(int policyContactId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _policyContactRepository.Where(s => s.PolicyContactId == policyContactId).FirstOrDefaultAsync();
                return Mapper.Map<PolicyContact>(_policyContactRepository.FirstOrDefault(p => p.PolicyContactId == entity.PolicyContactId));
            }
        }

        private async Task UpdatePolicyContact(PolicyContact policyContact)
        {
            Contract.Requires(policyContact != null);
            var entity = await _policyContactRepository.FindByIdAsync(policyContact.PolicyContactId);
            if (entity != null)
            {
                entity.ContactName = policyContact.ContactName;
                entity.EmailAddress = policyContact.EmailAddress;
                entity.TelephoneNumber = policyContact.TelephoneNumber;
                entity.MobileNumber = policyContact.MobileNumber;
                entity.AlternativeNumber = policyContact.AlternativeNumber;
                _policyContactRepository.Update(entity);
            }
        }

        public async Task<PolicyDocumentCommunicationMatrix> GetPolicyDocumentCommunication(int policyDocumentCommunicationId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _policyDocumentCommunicationMatrixRepository.Where(s => s.PolicyDocumentCommunicationMatrixId == policyDocumentCommunicationId).FirstOrDefaultAsync();
                return Mapper.Map<PolicyDocumentCommunicationMatrix>(_policyDocumentCommunicationMatrixRepository.FirstOrDefault(p => p.PolicyDocumentCommunicationMatrixId == entity.PolicyDocumentCommunicationMatrixId));
            }
        }

        public async Task<PolicyDocumentCommunicationMatrix> GetPolicyDocumentCommunicationMatrix(int? policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _policyDocumentCommunicationMatrixRepository.Where(s => s.PolicyId == policyId).FirstOrDefaultAsync();
                if (entity == null) { return null; }               
                var result = _policyDocumentCommunicationMatrixRepository.FirstOrDefault(p => p.PolicyId == entity.PolicyId);
                return result != null ? Mapper.Map<PolicyDocumentCommunicationMatrix>(result) : null;
               
            }
        }

        private async Task UpdatePolicyDocumentCommunication(PolicyDocumentCommunicationMatrix policyDocumentCommunication)
        {
            Contract.Requires(policyDocumentCommunication != null);
            var entity = await _policyDocumentCommunicationMatrixRepository.FindByIdAsync(policyDocumentCommunication.PolicyDocumentCommunicationMatrixId);
            if (entity != null)
            {
                entity.PolicyId = entity.PolicyId;
                entity.SendPolicyDocsToBroker = policyDocumentCommunication.SendPolicyDocsToBroker;
                entity.SendPolicyDocsToAdmin = policyDocumentCommunication.SendPolicyDocsToAdmin;
                entity.SendPolicyDocsToMember = policyDocumentCommunication.SendPolicyDocsToMember;
                entity.SendPolicyDocsToScheme = policyDocumentCommunication.SendPolicyDocsToScheme;
                entity.SendPaymentScheduleToBroker = policyDocumentCommunication.SendPaymentScheduleToBroker;

                _policyDocumentCommunicationMatrixRepository.Update(entity);
            }
        }

        public async Task MovePolicyScheme(PolicyModel sourcePolicy, PolicyModel targetPolicy, List<int> policyIds, int? policyMovementId, DateTime effectiveDate)
        {
            Contract.Requires(sourcePolicy != null);
            Contract.Requires(targetPolicy != null);
            Contract.Requires(policyIds != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                foreach (var policyId in policyIds)
                {
                    var policy = await _policyRepository.SingleOrDefaultAsync(p => p.PolicyId == policyId);
                    policy.BrokerageId = targetPolicy.BrokerageId;
                    policy.RepresentativeId = targetPolicy.RepresentativeId;
                    policy.JuristicRepresentativeId = targetPolicy.JuristicRepresentativeId;
                    policy.PolicyPayeeId = targetPolicy.PolicyOwnerId;
                    policy.RegularInstallmentDayOfMonth = targetPolicy.RegularInstallmentDayOfMonth;
                    policy.DecemberInstallmentDayOfMonth = targetPolicy.DecemberInstallmentDayOfMonth;
                    policy.AdminPercentage = targetPolicy.AdminPercentage;
                    policy.CommissionPercentage = targetPolicy.CommissionPercentage;
                    policy.BinderFeePercentage = targetPolicy.BinderFeePercentage;
                    policy.PremiumAdjustmentPercentage = targetPolicy.PremiumAdjustmentPercentage;
                    policy.ParentPolicyId = targetPolicy.PolicyId;
                    _policyRepository.Update(policy);

                    //Regenerate Policy Schedule
                    var producer = new ServiceBusQueueProducer<PolicyScheduleMessage, PolicyScheduleMessageListener>(PolicyScheduleMessageListener.QueueName);
                    await producer.PublishMessageAsync(new PolicyScheduleMessage()
                    {
                        PolicyId = policy.PolicyId,
                        ShouldRegenerateSchedule = true,
                        RequestedBy = RmaIdentity.Username,
                        ImpersonateUser = RmaIdentity.Username
                    });

                    var note = new policy_PolicyNote
                    {
                        PolicyId = policyId,
                        Text = $"Policy moved from scheme {sourcePolicy.ClientName} to scheme {targetPolicy.ClientName}"
                    };
                    _policyNoteRepository.Create(note);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task SendPolicyMovedCommunications(PolicyModel targetPolicy, List<int> policyIds, DateTime effectiveDate)
        {
            Contract.Requires(targetPolicy != null);
            Contract.Requires(policyIds != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                foreach (var policyId in policyIds)
                {
                    var policy = await _policyRepository.SingleOrDefaultAsync(p => p.PolicyId == policyId);
                    var policyOwner = await _rolePlayerRepository.SingleOrDefaultAsync(r => r.RolePlayerId == policy.PolicyOwnerId);
                    if (policyOwner is null) return;
                    switch ((CommunicationTypeEnum)policyOwner.PreferredCommunicationTypeId)
                    {
                        case CommunicationTypeEnum.SMS:
                            await _policyCommunicationService.SendPolicySchemeChangedSmsNotification(
                                targetPolicy.ClientName,
                                policyOwner.CellNumber,
                                policy.PolicyId,
                                policy.PolicyNumber,
                                effectiveDate);
                            break;
                        case CommunicationTypeEnum.Email:
                            // Template has not been defined
                            break;
                    }
                }
            }
        }

        public async Task<bool> HasProductDeviation(int? parentPolicyId, ProductDeviationTypeEnum productDeviationType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (parentPolicyId.HasValue)
                {
                    var deviations = await _productDeviationRepository
                        .Where(s => s.PolicyId == parentPolicyId.Value
                                 && s.ProductDeviationType == productDeviationType
                         )
                        .ToListAsync();
                    return deviations?.Count > 0;
                }
                return false;
            }
        }

        public async Task<int?> GetProductDeviationBenefit(int? parentPolicyId, ProductDeviationTypeEnum productDeviationType, int? benefitId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (parentPolicyId.HasValue && benefitId.HasValue)
                {
                    var deviation = await _productDeviationRepository
                        .FirstOrDefaultAsync(s => s.PolicyId == parentPolicyId.Value
                                 && s.ProductDeviationType == productDeviationType
                                 && s.FromBenefitId == benefitId.Value
                         );
                    return deviation?.ToBenefitId;
                }
                return null;
            }
        }

        public async Task ApplyProductDeviationUpdates(PolicyModel policy, ProductDeviationTypeEnum productDeviationType)
        {
            Contract.Requires(policy != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                // Get the benefit deviation details
                var deviations = await _productDeviationRepository
                    .Where(s => s.PolicyId == policy.ParentPolicyId.Value
                             && s.ProductDeviationType == productDeviationType
                    )
                    .ToListAsync();
                // Get the policy members
                var insuredLives = await _insuredLifeRepository
                    .Where(s => s.PolicyId == policy.PolicyId)
                    .ToListAsync();
                // Update the benefits of every insured life
                foreach (var member in insuredLives)
                {
                    var deviation = deviations
                        .FirstOrDefault(s => s.FromBenefitId == member.StatedBenefitId);
                    if (deviation != null)
                    {
                        member.StatedBenefitId = deviation.ToBenefitId;
                        _insuredLifeRepository.Update(member);
                    }
                }
                // Update the premium of the parent policy
                await UpdateChildPolicyPremiums(policy.ParentPolicyId.Value);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }
    }
}
