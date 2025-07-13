using AutoMapper;
using AutoMapper.QueryableExtensions;

using Newtonsoft.Json;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Enums;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceBus.Producers;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Cost;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClaimCare.Database.Constants;
using RMA.Service.ClaimCare.Database.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.FinCare.Contracts.Interfaces.Finance;
using RMA.Service.FinCare.Contracts.Interfaces.Payments;
using RMA.Service.Integrations.Contracts.Entities;
using RMA.Service.Integrations.Contracts.Entities.CompCare;
using RMA.Service.Integrations.Contracts.Entities.STP;
using RMA.Service.Integrations.Contracts.Interfaces.EuropAssistNotification;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Linq.Dynamic;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

using Action = RMA.Service.ClaimCare.Contracts.Entities.Action;
using BeneficiaryBankAccount = RMA.Service.ClaimCare.Contracts.Entities.BeneficiaryBankAccount;
using Benefit = RMA.Service.ClientCare.Contracts.Entities.Product.Benefit;
using DatabaseConstants = RMA.Service.ClaimCare.Database.Constants.DatabaseConstants;
using DocumentTypeEnum = RMA.Service.Admin.MasterDataManager.Contracts.Enums.DocumentTypeEnum;
using INoteService = RMA.Service.ClaimCare.Contracts.Interfaces.Claim.INoteService;
using MailAttachment = RMA.Common.Entities.MailAttachment;
using PersonEvent = RMA.Service.ClaimCare.Contracts.Entities.PersonEvent;
using Refund = RMA.Service.Billing.Contracts.Entities.Refund;
using RuleRequest = RMA.Service.ClaimCare.Contracts.Entities.RuleRequest;
using WorkPool = RMA.Service.ClaimCare.Contracts.Entities.WorkPool;

namespace RMA.Service.ClaimCare.Services.Claim
{
    public class ClaimFacade : RemotingStatelessService, IClaimService
    {
        private const string ClaimsModulePermissions = "ClaimsModulePermissions";
        private const string DeclineClaimSubject = "Decline Claim";
        private const string OverDueSlaClaimSubject = "OverDueSLA";
        private const string ClaimsAssessorRole = "Claims Assessor";
        private const string ClaimsManagerRole = "Claims Manager";
        private const string ClaimsInvestigatorRole = "Claims Investigator";
        private const string ComplaintSupportManagerRole = "Claims Support and Complaints Manager";
        private const string BeneficiaryNotExist = "No beneficiary exist";
        private const string BeneficiaryDeceased = "Beneficiary cannot be deceased";
        private const string RecoveryClaimSubject = "Claim Recovery";
        private const string vopdError = "ID: IDENTITY NUMBER NOT VALID,Status/Error,Unknown,IDENTITY NUMBER NOT VALID";
        private const string allocateClaimPermission = "Claim Allocation";
        private const string allocateClaimFeature = "allocateClaimFeature";
        private const string claimsTeamLead = "Claims Team Lead";
        private const string _abilityPostingWithBranch = "AbilityPostingWithBranch107005";
        private const string CompanyNumberOnPayment118728 = "CompanyNumberOnPayment118728";
        private const string _updateDeceasedMember133680 = "UpdateDeceasedMember133680";
        private const string _duplicateClaimInvoice131092 = "DuplicateClaimInvoice131092";
        private const string _reconcilePolicyAndClaimBenefit133639 = "ReconcilePolicyAndClaimBenefit133639";
        private const string _payeeDetails131378 = "PayeeDetails131378";
        private string stpSendTopic;
        private string stpSendConnectionString;
        private string _environment;
        private string _reportserverUrl;
        private WebHeaderCollection _headerCollection;
        private List<ClaimStatusEnum> CFPEuropAssistValidClaimStatuses = new List<ClaimStatusEnum> { ClaimStatusEnum.Approved, ClaimStatusEnum.Paid };

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IWizardService _wizardService;

        private readonly ISendEmailService _sendEmailService;
        private readonly IEmailService _emailService;
        private readonly ISendSmsService _sendSmsService;
        private readonly IEmailTemplateService _emailTemplateService;
        private readonly IClaimRequirementService _claimRequirementService;

        private readonly IBankService _bankService;
        private readonly IBankBranchService _bankBranchService;
        private readonly ICauseOfDeathService _causeOfDeathService;
        private readonly IDocumentTemplateService _documentTemplateService;
        private readonly IConfigurationService _configurationService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IClaimRecoveryInvoiceService _invoiceService;
        private readonly IPolicyService _policyService;
        private readonly IProductService _productService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IPolicyInsuredLifeService _policyInsuredlifeService;

        private readonly IProductOptionService _productOptionService;

        private readonly ICostService _costService;
        private readonly IEventService _eventService;
        private readonly IFatalService _fatalService;

        private readonly IRoleService _roleService;
        private readonly IUserService _userService;

        private readonly IWorkPoolService _workPoolService;

        private readonly IDocumentIndexService _documentIndexService;

        private readonly IPaymentCreatorService _paymentCreatorService;
        private readonly IPaymentService _paymentService;
        private readonly INoteService _noteService;
        private readonly IInvoiceService _billingInvoiceService;
        private readonly ITransactionService _billingTransactionService;

        private readonly IBankAccountVerificationCreatorService _bankAccountVerificationCreatorService;
        private readonly IBankVerificationResponseProcessorService _bankVerificationResponseProcessorService;

        private readonly IInterBankTransferService _interBankTransferService;
        private readonly IBillingService _billingService;
        private readonly IEuropAssistNotificationService _europAssistNotificationService;
        private readonly ISerializerService _serializer;
        private readonly IServiceBusMessage _serviceBusMessage;
        private readonly IClaimCommunicationService _claimCommunicationService;
        private readonly IRepresentativeService _representativeService;

        private readonly IRepository<claim_Claim> _claimRepository;
        private readonly IRepository<claim_ClaimNote> _claimNoteRepository;
        private readonly IRepository<claim_ClaimRuleAudit> _claimRuleAuditRepository;
        private readonly IRepository<claim_ManageUser> _manageUserRepository;
        private readonly IRepository<claim_PersonEvent> _personEventRepository;
        private readonly IRepository<claim_DocumentRule> _documentRuleRepository;
        private readonly IRepository<claim_ClaimInvoice> _claimInvoiceRepository;
        private readonly IRepository<claim_InvoiceAllocation> _invoiceAllocationRepository;
        private readonly IRepository<claim_FuneralInvoice> _funeralInvoiceRepository;
        private readonly IRepository<claim_ClaimWorkflow> _claimWorkflowRepository;
        private readonly IRepository<claim_ClaimBenefit> _claimBenefitRepository;
        private readonly IRepository<claim_Event> _eventRepository;
        private readonly IRepository<claim_PersonEventDeathDetail> _personEventDeathDetail;
        private readonly IRepository<claim_AssignedToUser> _assignedToUserRepository;
        private readonly IRepository<claim_ClaimsRecovery> _claimsRecoveryRepository;
        private readonly IRepository<claim_ClaimsTracing> _claimsTracingRepository;
        private readonly IRepository<claim_TracerInvoice> _tracerInvoiceRepository;
        private readonly IRepository<claim_ClaimsCalculatedAmount> _claimsCalculatedRepository;
        private readonly IRepository<claim_EuropAssistNotification> _europAssistNotificationRepository;
        private readonly IRepository<claim_ParentInsuranceType> _parentInsuranceTypeRepository;
        private readonly IRepository<claim_DiseaseType> _diseaseTypeRepository;
        private readonly IRepository<claim_EventCause> _eventCauseRepository;
        private readonly IRepository<claim_PersonEventStpExitReason> _personEventStpExitReasons;
        private readonly IRepository<claim_ClaimBucketClass> _claimBucketClassRepository;
        private readonly IRepository<claim_SundryServiceProvider> _sundryServiceProviderRepository;
        private readonly IRepository<claim_ReferralTypeLimitConfiguration> _referralTypeLimitConfigurationRepository;
        private readonly IRepository<claim_ClaimBenefitsAmount> _benefitsAmountRepository;
        private readonly IRepository<claim_ClaimAdditionalRequiredDocument> _claimAdditionalRequiredDocumentRepository;
        private readonly IRepository<claim_PersonEventQuestionnaire> _claimPersonEventQuestionnaireRepository;
        private readonly IRepository<claim_ReferralQueryType> _claimReferralQueryTypeRepository;
        private readonly IRepository<claim_ReferralDetail> _claimReferralDetailRepository;
        private readonly IRepository<claim_PhysicalDamage> _claimPhysicalDamageRepository;
        private readonly IRepository<claim_Injury> _claimInjuryRepository;
        private readonly IPoolWorkFlowService _poolWorkFlowService;
        private readonly ISLAService _slaService;
        private readonly IMedicalEstimatesService _medicalEstimatesService;
        private readonly IPaymentsAllocationService _paymentAllocationService;
        private readonly IClaimFinalizedIntegrationService _claimFinalizedIntegrationService;
        private readonly IClaimInvoiceService _claimInvoiceService;
        private readonly IClaimEarningService _claimEarningService;
        private readonly IUserReminderService _userReminderService;
        private readonly ICommonSystemNoteService _commonSystemNoteService;

        public ClaimFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IWizardService wizardService
            , ISendEmailService sendEmailService
            , IEmailService emailService
            , ISendSmsService sendSmsService
            , IEmailTemplateService emailTemplateService
            , IRoleService roleService
            , IBankService bankService
            , IBankBranchService bankBranchService
            , ICauseOfDeathService causeOfDeathService
            , IDocumentTemplateService documentTemplateService
            , IConfigurationService configurationService
            , IDocumentGeneratorService documentGeneratorService
            , IPolicyService policyService
            , IProductService productService
            , IRolePlayerService rolePlayerService
            , ICostService costService
            , IEventService eventService
            , IUserService userService
            , IWorkPoolService workPoolService
            , IDocumentIndexService documentIndexService
            , IPaymentCreatorService paymentCreatorService
            , IRolePlayerPolicyService rolePlayerPolicyService
            , INoteService noteService
            , IInterBankTransferService interBankTransferService
            , IRepository<claim_Claim> claimRepository
            , IRepository<claim_ClaimWorkflow> claimWorkflowRepository
            , IRepository<claim_PersonEvent> personEventRepository
            , IRepository<claim_ManageUser> manageUserRepository
            , IRepository<claim_DocumentRule> documentRuleRepository
            , IRepository<claim_ClaimInvoice> claimInvoiceRepository
            , IRepository<claim_ClaimRuleAudit> claimRuleAuditRepository
            , IRepository<claim_InvoiceAllocation> invoiceAllocationRepository
            , IProductOptionService productOptionService
            , IRepository<claim_ClaimNote> claimNoteRepository, IFatalService fatalService
            , IRepository<claim_FuneralInvoice> funeralInvoiceReporsitory
            , IRepository<claim_Event> eventRepository
            , IRepository<claim_PersonEventDeathDetail> personEventDeathDetail
            , IRepository<claim_ClaimBenefit> claimBenefitRepository
            , IRepository<claim_AssignedToUser> assignedToUserRepository
            , IRepository<claim_ClaimsRecovery> claimsRecoveryRepository
            , IRepository<claim_ClaimBucketClass> claimBucketClassRepository
            , IPolicyInsuredLifeService policyInsuredlifeService
            , IBankAccountVerificationCreatorService bankAccountVerificationCreatorService
            , IBankVerificationResponseProcessorService bankVerificationResponseProcessorService
            , IRepository<claim_ClaimsTracing> claimsTracingRepository
            , IRepository<claim_TracerInvoice> tracerInvoiceRepository
            , IRepository<claim_ClaimsCalculatedAmount> claimsCalculatedRepository
            , IRepository<claim_EuropAssistNotification> europAssistNotificationRepository
            , IClaimRecoveryInvoiceService invoiceService
            , IInvoiceService billingInvoiceService
            , IBillingService billingService
            , IEuropAssistNotificationService europAssistNotificationService
            , IRepository<claim_ParentInsuranceType> parentInsuranceTypeRepository
            , IRepository<claim_DiseaseType> diseaseTypeRepository
            , IRepository<claim_EventCause> eventCauseRepository
            , IRepository<claim_PersonEventStpExitReason> personEventStpExitReasons
            , ISerializerService serializer
            , IServiceBusMessage serviceBusMessage
            , IRepository<claim_SundryServiceProvider> sundryServiceProviderRepository
            , IRepository<claim_ReferralTypeLimitConfiguration> referralTypeLimitConfigurationRepository
            , IRepository<claim_ClaimBenefitsAmount> benefitsAmountRepository
            , IRepository<claim_ClaimAdditionalRequiredDocument> claimAdditionalRequiredDocumentRepository
            , IRepository<claim_PersonEventQuestionnaire> claimPersonEventQuestionnaireRepository
            , IRepository<claim_ReferralQueryType> claimReferralQueryTypeRepository
            , IRepository<claim_ReferralDetail> claimReferralDetailRepository
            , IClaimCommunicationService claimCommunicationService
            , IPoolWorkFlowService poolWorkFlowService
            , ISLAService slaService
            , IPaymentService paymentService
            , IPaymentsAllocationService paymentAllocationService
            , IMedicalEstimatesService medicalEstimatesService
            , IClaimFinalizedIntegrationService claimFinalizedIntegrationService
            , IClaimInvoiceService claimInvoiceService
            , IRepresentativeService representativeService
            , IClaimRequirementService claimRequirementService
            , IUserReminderService userReminderService
            , IClaimEarningService claimEarningService
            , ITransactionService billingTransactionService
            , ICommonSystemNoteService commonSystemNoteService
            , IRepository<claim_PhysicalDamage> claimPhysicalDamageRepository
            , IRepository<claim_Injury> claimInjuryRepository) :
            base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _claimRepository = claimRepository;
            _roleService = roleService;
            _userService = userService;
            _claimWorkflowRepository = claimWorkflowRepository;
            _bankService = bankService;
            _bankBranchService = bankBranchService;
            _workPoolService = workPoolService;
            _policyService = policyService;
            _claimInvoiceRepository = claimInvoiceRepository;
            _personEventRepository = personEventRepository;
            _manageUserRepository = manageUserRepository;
            _documentRuleRepository = documentRuleRepository;
            _productService = productService;
            _costService = costService;
            _sendEmailService = sendEmailService;
            _emailService = emailService;
            _documentGeneratorService = documentGeneratorService;
            _wizardService = wizardService;
            _documentTemplateService = documentTemplateService;
            _sendSmsService = sendSmsService;
            _eventService = eventService;
            _emailTemplateService = emailTemplateService;
            _causeOfDeathService = causeOfDeathService;
            _documentIndexService = documentIndexService;
            _paymentCreatorService = paymentCreatorService;
            _invoiceAllocationRepository = invoiceAllocationRepository;
            _productOptionService = productOptionService;
            _claimNoteRepository = claimNoteRepository;
            _fatalService = fatalService;
            _rolePlayerService = rolePlayerService;
            _claimRuleAuditRepository = claimRuleAuditRepository;
            _funeralInvoiceRepository = funeralInvoiceReporsitory;
            _claimBenefitRepository = claimBenefitRepository;
            _eventRepository = eventRepository;
            _personEventDeathDetail = personEventDeathDetail;
            _assignedToUserRepository = assignedToUserRepository;
            _policyInsuredlifeService = policyInsuredlifeService;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _configurationService = configurationService;
            _noteService = noteService;
            _bankAccountVerificationCreatorService = bankAccountVerificationCreatorService;
            _bankVerificationResponseProcessorService = bankVerificationResponseProcessorService;
            _claimsRecoveryRepository = claimsRecoveryRepository;
            _claimBucketClassRepository = claimBucketClassRepository;
            _invoiceService = invoiceService;
            _claimsTracingRepository = claimsTracingRepository;
            _tracerInvoiceRepository = tracerInvoiceRepository;
            _claimsCalculatedRepository = claimsCalculatedRepository;
            _billingInvoiceService = billingInvoiceService;
            _interBankTransferService = interBankTransferService;
            _billingService = billingService;
            _europAssistNotificationRepository = europAssistNotificationRepository;
            _europAssistNotificationService = europAssistNotificationService;
            _parentInsuranceTypeRepository = parentInsuranceTypeRepository;
            _diseaseTypeRepository = diseaseTypeRepository;
            _eventCauseRepository = eventCauseRepository;
            _personEventStpExitReasons = personEventStpExitReasons;
            _serializer = serializer;
            _serviceBusMessage = serviceBusMessage;
            _paymentService = paymentService;
            _claimCommunicationService = claimCommunicationService;
            _sundryServiceProviderRepository = sundryServiceProviderRepository;
            _referralTypeLimitConfigurationRepository = referralTypeLimitConfigurationRepository;
            _benefitsAmountRepository = benefitsAmountRepository;
            _poolWorkFlowService = poolWorkFlowService;
            _slaService = slaService;
            _medicalEstimatesService = medicalEstimatesService;
            _paymentAllocationService = paymentAllocationService;
            _claimFinalizedIntegrationService = claimFinalizedIntegrationService;
            _claimInvoiceService = claimInvoiceService;
            _claimAdditionalRequiredDocumentRepository = claimAdditionalRequiredDocumentRepository;
            _claimPersonEventQuestionnaireRepository = claimPersonEventQuestionnaireRepository;
            _representativeService = representativeService;
            _claimReferralQueryTypeRepository = claimReferralQueryTypeRepository;
            _claimReferralDetailRepository = claimReferralDetailRepository;
            _claimRequirementService = claimRequirementService;
            _userReminderService = userReminderService;
            _claimEarningService = claimEarningService;
            _billingTransactionService = billingTransactionService;
            _commonSystemNoteService = commonSystemNoteService;
            _claimInjuryRepository = claimInjuryRepository;
            _claimPhysicalDamageRepository = claimPhysicalDamageRepository;
            _headerCollection = null;
            Task.Run(() => this.SetupClaimVariables()).Wait();
        }

        private async Task SetupClaimVariables()
        {
            _environment = await _configurationService.GetModuleSetting(SystemSettings.IntegrationEnviroment);
            stpSendTopic = await _configurationService.GetModuleSetting(SystemSettings.MessageTypeSubscriptionServiceBusSendTopic);
            stpSendConnectionString = await _configurationService.GetModuleSetting(SystemSettings.MessageTypeSubscriptionServiceBusSendConnectionString);
        }

        public async Task<Contracts.Entities.Claim> GetClaim(int claimId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claim = await _claimRepository
                    .Where(s => s.ClaimId == claimId)
                    .SingleOrDefaultAsync();
                return Mapper.Map<Contracts.Entities.Claim>(claim);
            }
        }

        public async Task<Contracts.Entities.Claim> GetClaimDetails(int policyId, int personEventId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claim = await _claimRepository
                    .Where(s => s.PolicyId == policyId && s.PersonEventId == personEventId)
                    .SingleOrDefaultAsync();
                return Mapper.Map<Contracts.Entities.Claim>(claim);
            }
        }

        public async Task<List<WorkPool>> GetActiveClaimsAssignedToUser(int userId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claims = await _claimRepository
                    .Where(s => s.AssignedToUserId == userId && !s.IsClosed && !s.IsDeleted)
                    .ToListAsync();

                List<WorkPool> workpool = new List<WorkPool>();
                foreach (var claim in claims)
                {
                    var data = new WorkPool
                    {
                        UserId = claim.AssignedToUserId,
                        ClaimId = claim.ClaimId,
                        ClaimUniqueReference = claim.ClaimReferenceNumber,
                        ClaimStatusId = (int)claim.ClaimStatus,
                        PolicyId = claim.PolicyId,
                        WizardId = claim.WizardId.GetValueOrDefault(),
                        PolicyStatus = PolicyStatusEnum.Active,
                        WorkPoolId = (int)WorkPoolEnum.FuneralClaimspool
                    };
                    workpool.Add(data);
                }

                return workpool;
            }
        }

        public async Task<DocumentSetEnum> GetDocumentSetName(DeathTypeEnum deathType, bool isIndividual)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _documentRuleRepository.Where(a => a.IsIndividual == isIndividual && a.DeathType == deathType).Select(a => a.DocumentSet)
                    .FirstOrDefaultAsync();
            }
        }

        public async Task<Contracts.Entities.Claim> GetClaimDetailsById(int claimId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claim = await _claimRepository.SingleOrDefaultAsync(c => c.ClaimId == claimId);
                return Mapper.Map<Contracts.Entities.Claim>(claim);
            }
        }

        public async Task<bool> PolicyHasClaim(int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _claimRepository.FirstOrDefaultAsync(a => a.PolicyId == policyId);
                return result.ClaimId > 0;
            }
        }

        public async Task<List<WorkPoolsModel>> GetWorkPoolsForUser(int userId)
        {
            return await _workPoolService.GetWorkPoolsForUser(userId);
        }

        public async Task<List<WorkPoolsModel>> GetUsersToReAllocate(int userId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewWorkPool);

            bool isFeatureFlag = await _configurationService.IsFeatureFlagSettingEnabled(allocateClaimFeature);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                List<User> result = new List<User>();
                var user = await _userService.GetUserById(userId);
                if (!isFeatureFlag)
                {
                    var roleDetails = await _roleService.GetRoleByName(ClaimsAssessorRole);
                    if (user.RoleName == "Investigations Manager" || user.RoleName == "Claims Investigator")
                    {
                        roleDetails = await _roleService.GetRoleByName(ClaimsInvestigatorRole);
                    }
                    var roleIds = new List<int>
                {
                    roleDetails.Id
                };
                    var userDetails = await _userService.GetUsersInRoles(roleIds);

                    var isAuthorised = await _workPoolService.RoleHasPermission(roleDetails.Id, new List<string>(){WorkPoolEnum.Investigationpool.DisplayAttributeValue(), WorkPoolEnum.IndividualAssessorpool.DisplayAttributeValue(),
                    WorkPoolEnum.SecondApproverpool.DisplayAttributeValue() });
                    if (!isAuthorised)
                    {
                        throw new PermissionException($"Not authorised to perform action: {WorkPoolEnum.IndividualAssessorpool.DisplayAttributeValue()} ",
                        WorkPoolEnum.IndividualAssessorpool.DisplayAttributeValue());
                    }


                    result = userDetails.Where(item => userDetails.Any(category => category.Id.Equals(item.Id))).ToList();
                }
                else
                {
                    List<Role> rolesDetails = new List<Role>();
                    if (user.RoleName == "Investigations Manager" || user.RoleName == "Claims Investigator")
                    {
                        var role = await _roleService.GetRoleByName(ClaimsInvestigatorRole);
                        if (role != null)
                        {
                            if (await _workPoolService.RoleHasPermission(role.Id, new List<string>(){WorkPoolEnum.Investigationpool.DisplayAttributeValue(), WorkPoolEnum.IndividualAssessorpool.DisplayAttributeValue(),
                                   WorkPoolEnum.SecondApproverpool.DisplayAttributeValue() }))
                            {
                                rolesDetails.Add(role);
                            }

                        }

                    }
                    else
                    {
                        var roles = await _roleService.GetRolesByPermission(allocateClaimPermission);
                        if (roles != null)
                            rolesDetails.AddRange(roles);
                    }


                    var userDetails = await _userService.GetUsersInRoles(rolesDetails.Select(x => x.Id).ToList());
                    result = userDetails.Where(item => userDetails.Any(category => category.Id.Equals(item.Id))).ToList();

                }


                // First check if the user timeOff already set for the date.
                var dtCheck = Convert.ToDateTime(DateTimeHelper.SaNow.ToShortDateString());
                var manageUsers = await _manageUserRepository.Where(t => t.EndTimeOff >= dtCheck)
                    .Select(u => u.RolePlayerId)
                    .ToListAsync();

                var query = result.Where(e => !manageUsers.Contains(e.Id));

                var workPoolModel = new List<WorkPoolsModel>();

                foreach (var item in query)
                    if (item.Id != userId)
                    {
                        var data = new WorkPoolsModel
                        {
                            UserId = item.Id,
                            UserName = item.DisplayName,
                            UserEmail = item.Email,
                            WorkPool = WorkPoolEnum.FuneralClaimspool
                        };
                        workPoolModel.Add(data);
                    }
                return workPoolModel;
            }
        }

        public Task<List<WorkPool>> GetClaimsForWorkPool(WorkPoolEnum workPool)
        {
            throw new NotImplementedException();
        }

        public async Task<TracerModel> GetTracerInformation(int claimId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewTracer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var traceModel = new TracerModel();
                var tracing = await _claimsTracingRepository.FirstOrDefaultAsync(c => c.ClaimId == claimId);

                if (tracing != null)
                {
                    var rolePlayer = await _rolePlayerService.GetRolePlayer(tracing.RolePlayerId);
                    var totalAmount = _tracerInvoiceRepository.Where(i => i.ClaimId == tracing.ClaimId).Select(p => p.TracingFee).Sum();
                    traceModel.FuneralTracingMaxAmount = Convert.ToInt32(await _configurationService.GetModuleSetting(SystemSettings.FuneralTracingMaxAmount));

                    traceModel.ClaimId = tracing.ClaimId;
                    traceModel.RolePlayer = rolePlayer;
                    traceModel.TotalAmountPaid = Convert.ToDecimal(totalAmount);
                }

                return traceModel;
            }
        }

        public async Task<List<ClaimTracerInvoice>> GetTracerInvoices(int claimId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewTracerInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _tracerInvoiceRepository.Where(i => i.ClaimId == claimId).ToListAsync();
                return Mapper.Map<List<ClaimTracerInvoice>>(result);
            }
        }

        public async Task<List<ClaimInvoice>> GetClaimInvoiceDetailsForDecline(int claimId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claimInvoiceList = new List<ClaimInvoice>();

                var result = await _claimInvoiceRepository
                    .Where(a => a.ClaimId == claimId).ToListAsync();
                await _claimInvoiceRepository.LoadAsync(result, a => a.InvoiceAllocations);

                var invoiceAllocationId = 0;
                var getBeneficiaryId = 0;

                foreach (var item in result)
                {
                    invoiceAllocationId = item.InvoiceAllocations.Select(i => i.InvoiceAllocationId).FirstOrDefault();
                    getBeneficiaryId = item.InvoiceAllocations.Select(i => i.BeneificaryRolePlayerId.Value).FirstOrDefault();

                    var claimInvoice = new ClaimInvoice()
                    {
                        DecisionId = (int)item.ClaimInvoiceDecision,
                        ClaimId = item.ClaimId,
                        ClaimAmount = item.AuthorisedAmount,
                        Refund = item.InvoiceAllocations.Select(i => i.InvoiceAllocationStatusId).First(),
                        // OutstandingPremium = item.OutstandingPremium,
                        // DecisionReasonId = item.DecisionReasonId,
                        CapturedDate = item.CreatedDate,
                        BankAccountId = item.InvoiceAllocations.Select(i => i.BeneificaryRolePlayerId).First(),
                        Id = item.ClaimInvoiceId,
                        InvoiceAllocations = new List<InvoiceAllocation>()
                        {
                            new InvoiceAllocation()
                            {
                                InvoiceAllocationId = invoiceAllocationId,
                                BeneificaryRolePlayerId = getBeneficiaryId
                            }

                        }
                    };

                    //====GetClaim beneficiary and bank account
                    claimInvoice.BeneficiaryDetail = await GetBeneficiaryAndBankAccountById(getBeneficiaryId,
                        claimInvoice.BankAccountId.GetValueOrDefault());

                    if (!string.IsNullOrEmpty(claimInvoice.BeneficiaryDetail.MessageText))
                    {
                        claimInvoice.Id = 0;
                        claimInvoice.MessageText = BeneficiaryDeceased;
                        claimInvoice.Decision = ClaimInvoiceDecisionEnum.Decline;
                        claimInvoiceList.Add(claimInvoice);
                        return claimInvoiceList;
                    }

                    // GetClaim Claim Table
                    var claim = await GetClaim(claimId);

                    var productCode = "";
                    var productId = 0;

                    claimInvoice.ClaimReferenceNumber = claim.ClaimReferenceNumber;
                    claimInvoice.PolicyId = claim.PolicyId.Value;
                    claimInvoice.ClaimantEmail = claim.ClaimantEmail;

                    //=====GEt the policy
                    claimInvoice.PolicyNumber = (await _policyService.GetPolicyWithoutReferenceData(claim.PolicyId.Value)).PolicyNumber;
                    claimInvoice.ProductId = productId;
                    claimInvoice.Product = productCode;

                    claimInvoiceList.Add(claimInvoice);
                }

                return claimInvoiceList;
            }
        }

        public async Task<ClaimInvoice> GetClaimInvoiceForAuthorization(int claimId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claimInvoice = new ClaimInvoice();

                var result = await _claimInvoiceRepository
                    .Where(a => a.ClaimId == claimId)
                    .Select(invoice => new ClaimInvoice
                    {
                        AuthorisedAmount = invoice.AuthorisedAmount,
                        ClaimId = invoice.ClaimId,
                        AuthorisedVat = invoice.AuthorisedVat,
                        ClaimBenefitId = invoice.ClaimBenefitId,
                        ClaimInvoiceId = invoice.ClaimInvoiceId,
                        ClaimInvoiceStatusId = invoice.ClaimInvoiceStatusId,
                        ClaimInvoiceType = invoice.ClaimInvoiceType,
                        DateApproved = invoice.DateApproved,
                        DateSubmitted = invoice.DateSubmitted,
                        ExternalReferenceNumber = invoice.ExternalReferenceNumber,
                        InternalReferenceNumber = invoice.InternalReferenceNumber,
                        InvoiceDate = invoice.InvoiceDate,
                        InvoiceVat = invoice.InvoiceVat,
                        InvoiceAmount = invoice.InvoiceAmount,
                        IsAuthorised = invoice.IsAuthorised,
                        DateReceived = invoice.DateReceived,
                    })
                    .SingleOrDefaultAsync();

                if (result != null) return result;
                claimInvoice.ClaimId = claimId;
                claimInvoice.Decision = ClaimInvoiceDecisionEnum.Default;
                return claimInvoice;
            }
        }

        public async Task<List<WorkPool>> GetClaimsForLoggedInUser()
        {
            var resultPoolAccess = await _workPoolService.GetWorkPoolsForUser(RmaIdentity.UserId);
            var workPoolIds = resultPoolAccess.Select(i => i.WorkPool).ToList();
            var roleName = await _roleService.GetRoleName(RmaIdentity.RoleId);

            return new List<WorkPool>();
        }

        public async Task<List<ClaimCancelReason>> GetClaimCancellationReasons()
        {
            var cancelReasons = new List<ClaimCancelReason>();

            foreach (ClaimCancellationReasonEnum item in Enum.GetValues(typeof(ClaimCancellationReasonEnum)))
            {
                var cancelReason = new ClaimCancelReason
                {
                    ReasonId = (int)item,
                    ReasonDescription = item.DisplayAttributeValue()
                };

                cancelReasons.Add(cancelReason);
            }

            return await Task.FromResult(cancelReasons);
        }

        public async Task<List<ClaimReOpenReason>> GetClaimReOpenReasons()
        {
            List<ClaimReOpenReason> reOpenReasons = new List<ClaimReOpenReason>();
            foreach (ClaimReOpenReasonEnum item in Enum.GetValues(typeof(ClaimReOpenReasonEnum)))
            {
                ClaimReOpenReason reOpenReason = new ClaimReOpenReason();
                reOpenReason.ReasonId = (int)item;
                reOpenReason.ReasonDescription = item.DisplayAttributeValue();

                reOpenReasons.Add(reOpenReason);
            }

            return await Task.FromResult(reOpenReasons);
        }

        public async Task<List<ClaimReOpenReason>> GetClaimCloseReasons()
        {
            List<ClaimReOpenReason> closeReasons = new List<ClaimReOpenReason>();
            foreach (ClaimClosedReasonEnum item in Enum.GetValues(typeof(ClaimClosedReasonEnum)))
            {
                ClaimReOpenReason closeReason = new ClaimReOpenReason();
                closeReason.ReasonId = (int)item;
                closeReason.ReasonDescription = item.DisplayAttributeValue();

                if (closeReason.ReasonId >= 38)//To restrict to the only newly added reasons until further notice
                {
                    closeReasons.Add(closeReason);
                }
            }

            return await Task.FromResult(closeReasons);
        }

        public async Task<int?> GetLastUserForWorkPool(int claimId, WorkPoolEnum workPool)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                int? ragResult = null;
                ragResult = await _claimWorkflowRepository
                    .OrderByDescending(r => r.ClaimWorkflowId)
                    .Where(t => t.ClaimId == claimId && t.WorkPool == workPool)
                    .Select(s => s.AssignedToUserId)
                    .FirstOrDefaultAsync();

                return ragResult;
            }
        }

        public async Task<List<SearchResult>> Search(PagedRequest request, bool showActive)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var searchResult = await _claimRepository.SqlQueryAsync<SearchResult>(
                    DatabaseConstants.ClaimSearchStoredProcedure,
                    new SqlParameter("FilterType", 1),
                    new SqlParameter("Filter", request?.SearchCriteria),
                    new SqlParameter("ShowActive", showActive));

                var propertyInfo =
                    typeof(SearchResult).GetProperty(request.OrderBy.Substring(0, 1).ToUpper() +
                                                     request.OrderBy.Substring(1));
                Func<SearchResult, object> keySelector = i => propertyInfo.GetValue(i, null);

                var result = request.IsAscending
                    ? searchResult.OrderBy(keySelector)
                    : searchResult.OrderByDescending(keySelector);

                return result.ToList();
            }
        }

        public async Task<ClaimInvoice> GetClaimInvoiceAllocationByPaymentId(int claimId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _claimInvoiceRepository
                    .Where(a => a.InvoiceAllocations.Any(i => i.ClaimInvoiceId == a.ClaimInvoiceId) && a.ClaimId == claimId)
                    .SingleOrDefaultAsync();
                return Mapper.Map<ClaimInvoice>(result);
            }
        }

        public async Task<ClaimInvoice> GetClaimInvoiceById(int claimInvoiceId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _claimInvoiceRepository.FirstOrDefaultAsync(i => i.ClaimInvoiceId == claimInvoiceId);
                return Mapper.Map<ClaimInvoice>(result);
            }
        }

        public async Task<FuneralInvoice> GetFuneralInvoice(int claimInvoiceId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _funeralInvoiceRepository
                    .Where(a => a.ClaimInvoiceId == claimInvoiceId)
                    .SingleOrDefaultAsync();
                return Mapper.Map<FuneralInvoice>(result);
            }
        }

        public async Task<List<CauseOfDeathType>> GetCauseOfDeathType(DeathTypeEnum deathType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _causeOfDeathService.GetCauseOfDeathList((int)deathType);
            }

        }

        public async Task<PersonEvent> GetPersonEventByClaimId(int claimId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _personEventRepository
                    .SingleOrDefaultAsync(s => s.Claims.Any(a => a.ClaimId == claimId));
                await _personEventRepository.LoadAsync(entity, e => e.ClaimBucketClass);
                await _personEventRepository.LoadAsync(entity, e => e.Claims);

                return Mapper.Map<PersonEvent>(entity);
            }
        }

        public async Task<Contracts.Entities.Claim> GetClaimByClaimReference(string claimReference)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _claimRepository
                     .Where(s => s.ClaimReferenceNumber.ToLower() == claimReference.ToLower())
                     .FirstOrDefaultAsync();
                return Mapper.Map<Contracts.Entities.Claim>(entity);
            }
        }

        public async Task<List<Contracts.Entities.Claim>> GetClaimsByClaimReferenceNumber(string claimReferenceNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _claimRepository
                     .Where(s => s.ClaimReferenceNumber.ToLower().Contains(claimReferenceNumber.ToLower()))
                     .ToListAsync();
                return Mapper.Map<List<Contracts.Entities.Claim>>(entities);
            }
        }

        public async Task<List<Contracts.Entities.PersonEvent>> GetPersonEventByCompCarePevRefNumber(string claimReferenceNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _personEventRepository
                     .Where(s => s.CompCarePevRefNumber.ToLower().Contains(claimReferenceNumber.ToLower())).ToListAsync();
                return Mapper.Map<List<Contracts.Entities.PersonEvent>>(entities);
            }
        }

        public async Task<Contracts.Entities.Claim> GetClaimsByMemberNumber(string claimReferenceNumber, DateTime eventDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var company = await _rolePlayerService.GetCompanyByReferenceNumber(claimReferenceNumber);
                if (company == null)
                    return null;

                var claim = (from c in _claimRepository
                             join pev in _personEventRepository on c.PersonEventId equals pev.PersonEventId
                             join e in _eventRepository on pev.EventId equals e.EventId
                             where company.RolePlayerId == pev.CompanyRolePlayerId
                             && System.Data.Entity.DbFunctions.TruncateTime(e.EventDate) == System.Data.Entity.DbFunctions.TruncateTime(eventDate)
                             select c).FirstOrDefault();
                return Mapper.Map<Contracts.Entities.Claim>(claim);
            }
        }

        public async Task<Contracts.Entities.Claim> GetClaimByEventId(List<int> eventIds, DateTime eventDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claim = await (from c in _claimRepository
                                   join pev in _personEventRepository on c.PersonEventId equals pev.PersonEventId
                                   join e in _eventRepository on pev.EventId equals e.EventId
                                   where eventIds.Contains((int)pev.EventId)
                                   && System.Data.Entity.DbFunctions.TruncateTime(e.EventDate) == System.Data.Entity.DbFunctions.TruncateTime(eventDate)
                                   select c).FirstOrDefaultAsync();

                return Mapper.Map<Contracts.Entities.Claim>(claim);
            }

        }

        public async Task<Contracts.Entities.Claim> GetClaimByPersonEventId(List<int> personEventIds, DateTime eventDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claim = await (from c in _claimRepository
                                   join pev in _personEventRepository on c.PersonEventId equals pev.PersonEventId
                                   join e in _eventRepository on pev.EventId equals e.EventId
                                   where personEventIds.Contains((int)pev.PersonEventId)
                                   && System.Data.Entity.DbFunctions.TruncateTime(e.EventDate) == System.Data.Entity.DbFunctions.TruncateTime(eventDate)
                                   select c).FirstOrDefaultAsync();

                return Mapper.Map<Contracts.Entities.Claim>(claim);
            }

        }

        public async Task<Contracts.Entities.Claim> GetClaimsByIdNumber(string claimReferenceNumber, DateTime eventDate, string surName)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayerIds = (await _rolePlayerService.GetRolePlayerByIdNumber(claimReferenceNumber))
                                .Where(rp => rp.Person.Surname == surName)
                                .Select(rp => rp.RolePlayerId)
                                .ToList();

                var claim = (from c in _claimRepository
                             join pev in _personEventRepository on c.PersonEventId equals pev.PersonEventId
                             join e in _eventRepository on pev.EventId equals e.EventId
                             where rolePlayerIds.Contains(pev.InsuredLifeId)
                             && System.Data.Entity.DbFunctions.TruncateTime(e.EventDate) == System.Data.Entity.DbFunctions.TruncateTime(eventDate)
                             select c).FirstOrDefault();
                return Mapper.Map<Contracts.Entities.Claim>(claim);
            }
        }
        public async Task<PersonEvent> GetDeceasedInfo(int policyId, int insuredLifeId, int wizardId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            var personEvent = new PersonEvent();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var dbResult = await _personEventRepository.Where(i => i.InsuredLifeId == insuredLifeId).ToListAsync();
                await _personEventRepository.LoadAsync(dbResult, a => a.Claims.Where(c => c.PolicyId == policyId));
                foreach (var itemClaims in dbResult)
                {
                    var personEventDeathDetail =
                        await _eventService.GetPersonEventDeathDetail(itemClaims.PersonEventId);
                    foreach (var item in itemClaims.Claims)
                    {
                        personEvent.FirstName = "";
                        personEvent.LastName = "";
                        personEvent.InsuredLifeId = itemClaims.InsuredLifeId;

                       
                        personEvent.PersonEventDeathDetail.DeathDate = personEventDeathDetail.DeathDate;

                        
                        personEvent.Claims = new List<Contracts.Entities.Claim>()
                        {
                            new Contracts.Entities.Claim()
                            {
                                ClaimId = item.ClaimId,
                                ClaimReferenceNumber = item.ClaimReferenceNumber,
                                PolicyId = item.PolicyId.Value
                            }
                        };
                    }
                }
            }

            return personEvent;
        }

        public async Task<List<Contracts.Entities.Claim>> GetClaimsByPersonEventId(int personEventId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claims = await _claimRepository.Where(c => c.PersonEventId == personEventId).ToListAsync();
                return Mapper.Map<List<Contracts.Entities.Claim>>(claims);
            }
        }

        public async Task<Beneficiary> GetBeneficiaryAndBankAccountById(int beneficiaryId, int rolePlayerBankingId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewBeneficiary);

            var result = await _rolePlayerService.GetRolePlayer(beneficiaryId);
            var rolePlayerType = result.ToRolePlayers
                        .Where(t => t.FromRolePlayerId == result.RolePlayerId).FirstOrDefault()?.RolePlayerTypeId;

            var beneficiary = new Beneficiary();
            beneficiary.RolePlayerBankAccount = result.RolePlayerBankingDetails
                .Where(t => t.RolePlayerBankingId == rolePlayerBankingId)
                .FirstOrDefault();

            var bankBranch = await _bankBranchService.GetBankBranch(beneficiary.RolePlayerBankAccount.BankBranchId);
            var bank = await _bankService.GetBank(bankBranch.BankId);
            var bankName = bank.Name;
            var bankBranchNumber = bankBranch.Code;
            var universalBranchCode = bankBranch.Code;

            beneficiary.RolePlayerBankAccount.BankName = bankName;
            if (string.IsNullOrEmpty(beneficiary.RolePlayerBankAccount.BranchCode) || beneficiary.RolePlayerBankAccount.BranchCode.Length < 3)
            {
                beneficiary.RolePlayerBankAccount.BranchCode = universalBranchCode;
            }
            beneficiary.RolePlayerBankAccount.AccountType = beneficiary.RolePlayerBankAccount.BankAccountType.DisplayAttributeValue();
            beneficiary.BeneficiaryId = result.RolePlayerId;
            beneficiary.IdNumber = result.Person.IdNumber;
            beneficiary.PassportNumber = result.Person.PassportNumber;
            beneficiary.Firstname = result.Person.FirstName;
            beneficiary.Lastname = result.Person.Surname;
            beneficiary.DateOfBirth = result.Person.DateOfBirth;
            beneficiary.Email = result.EmailAddress;
            beneficiary.ContactNumber = string.IsNullOrEmpty(result.TellNumber) ? result.CellNumber : result.TellNumber;
            beneficiary.MobileNumber = result.CellNumber;
            beneficiary.IsChildDisabled = true;
            beneficiary.IsBeneficiary = true;
            beneficiary.RolePlayerType = RolePlayerTypeEnum.Other;
            beneficiary.BeneficiaryType = BeneficiaryTypeEnum.Other;

            return beneficiary;
        }

        public async Task<List<WorkPoolsModel>> GetUsersToAllocate(int userId, string lastWorkedOnUsers, string claimId, string personEventId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewWorkPool);


            bool isFeatureFlag = await _configurationService.IsFeatureFlagSettingEnabled(allocateClaimFeature);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                List<User> result = new List<User>();
                List<int> lastWorkedOn = new List<int>();
                var user = await _userService.GetUserById(userId);

                var roleDetails = await _roleService.GetRoleByName(ClaimsAssessorRole);
                //====GetClaim the users who are in the workpool====//
                var isAuthorised = await _workPoolService.RoleHasPermission(roleDetails.Id, new List<string>(){WorkPoolEnum.Investigationpool.DisplayAttributeValue(), WorkPoolEnum.IndividualAssessorpool.DisplayAttributeValue(),
                    WorkPoolEnum.SecondApproverpool.DisplayAttributeValue() });
                if (!isAuthorised)
                {
                    throw new PermissionException($"Not authorised to perform action: {WorkPoolEnum.IndividualAssessorpool.DisplayAttributeValue()} ",
                    WorkPoolEnum.IndividualAssessorpool.DisplayAttributeValue());
                }


                if (lastWorkedOnUsers != null && lastWorkedOnUsers != "null")
                {
                    lastWorkedOn = lastWorkedOnUsers.Split(',')
                        .Select(t => int.Parse(t))
                        .ToList();
                }

                if (!isFeatureFlag)
                {

                    if (user.RoleName == "Investigations Manager" || user.RoleName == "Claims Investigator")
                    {
                        roleDetails = await _roleService.GetRoleByName(ClaimsInvestigatorRole);
                    }
                    var roleIds = new List<int>
                {
                    roleDetails.Id
                };


                    List<int> claimIds = new List<int>();
                    if (claimId != "0")
                    {
                        claimIds = claimId.Split(',')
                            .Select(t => int.Parse(t))
                            .ToList();
                        foreach (var item in claimIds)
                        {
                            var claimEntity = await _claimRepository.Where(n => n.ClaimId == item).SingleAsync();
                            if (claimEntity.ClaimStatus == ClaimStatusEnum.Cancelled)
                                lastWorkedOn.Clear();
                        }
                    }

                    var userDetails = await _userService.GetUsersInRoles(roleIds);



                    result =
                       userDetails.Where(item => userDetails.Any(category => category.Id.Equals(item.Id))).ToList();

                    var userIsInClaimsAssessorRole = result.Any(ud => ud.Id == userId);
                    if (userIsInClaimsAssessorRole) result = result.Where(u => u.Id == userId).ToList();
                }
                else
                {

                    List<Role> rolesDetails = new List<Role>();
                    if (user.RoleName == "Investigations Manager" || user.RoleName == "Claims Investigator")
                    {
                        var role = await _roleService.GetRoleByName(ClaimsInvestigatorRole);
                        if (role != null)
                        {
                            if (await _workPoolService.RoleHasPermission(role.Id, new List<string>(){WorkPoolEnum.Investigationpool.DisplayAttributeValue(), WorkPoolEnum.IndividualAssessorpool.DisplayAttributeValue(),
                                   WorkPoolEnum.SecondApproverpool.DisplayAttributeValue() }))
                            {
                                rolesDetails.Add(role);
                            }

                        }

                    }
                    else
                    {
                        var roles = await _roleService.GetRolesByPermission(allocateClaimPermission);
                        if (roles != null)
                            rolesDetails.AddRange(roles);
                    }


                    var userDetails = await _userService.GetUsersInRoles(rolesDetails.Select(x => x.Id).ToList());
                    result = userDetails.Where(item => userDetails.Any(category => category.Id.Equals(item.Id))).ToList();
                }
                //====First check if the user timeOff already set for the date.
                var dtCheck = Convert.ToDateTime(DateTimeHelper.SaNow.ToShortDateString());

                var manageUsers = await _manageUserRepository.Where(t => t.EndTimeOff >= dtCheck)
                    .Select(u => u.RolePlayerId)
                    .ToListAsync();

                var query = result.Where(e => !manageUsers.Contains(e.Id) && !lastWorkedOn.Contains(e.Id));

                var workPoolModel = new List<WorkPoolsModel>();
                foreach (var item in query)
                {
                    var data = new WorkPoolsModel
                    {
                        UserId = item.Id,
                        UserName = item.DisplayName,
                        UserEmail = item.Email,
                        WorkPool = WorkPoolEnum.FuneralClaimspool
                    };
                    workPoolModel.Add(data);
                }
                return workPoolModel;
            }
        }

        public async Task<List<Beneficiary>> GetBeneficiaryAndBankingDetail(int claimId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewBeneficiary);

            var beneficiaries = new List<RolePlayer>();
            var personEventByClaimId = await GetPersonEventByClaimId(claimId);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var claim = await GetClaim(claimId);
                var linkedBeneficiaries = await _rolePlayerService.GetLinkedBeneficiaries(claim.PolicyId.Value, (int)RolePlayerTypeEnum.Beneficiary);

                foreach (var ben in linkedBeneficiaries)
                {
                    var rolePlayer = await _rolePlayerService.GetRolePlayer(ben.FromRolePlayerId);
                    beneficiaries.Add(rolePlayer);
                }

                var beneficiaryDetails = new List<Beneficiary>();

                //=====Check if all the required documents uploaded and wizard completed =====//
                var messageText = string.Empty;

                var keys = new Dictionary<string, string> { { "PersonEvent", personEventByClaimId.PersonEventId.ToString() } };
                //const DocumentSetEnum documentSet = DocumentSetEnum.FuneralNaturalIndividual; // todo determine the correct set
                //var haveDocumentsAccepted = await _documentIndexService.HaveAllDocumentsBeenAccepted(documentSet, keys);

                var personEvent = await _personEventRepository
                    .Where(w => w.Claims.Any(c => c.ClaimId == claimId)).SingleOrDefaultAsync();
                _personEventRepository.Load(personEvent, w => w.Claims);

                var wizardId = personEvent.Claims.Select(w => w.WizardId).FirstOrDefault();
                var isWizardCompleted = await _wizardService.IsWizardCompleted(wizardId);

                //======TODO : Remove this once testing is done
                var haveDocumentsAccepted = true;
                isWizardCompleted = true;

                if (!isWizardCompleted)
                {
                    messageText += "Wizard not completed. ";
                }

                foreach (var beneficiary in beneficiaries)
                {
                    var beneficiaryBankAccounts = new List<BeneficiaryBankAccount>();

                    var bankingDetails = await _rolePlayerService.GetBankingDetailsByRolePlayerId(beneficiary.RolePlayerId);
                    foreach (var bankAccount in bankingDetails)
                    {
                        var bankBranch = await _bankBranchService.GetBankBranch(bankAccount.BankBranchId);
                        var bank = await _bankService.GetBank(bankBranch.BankId);

                        var bankBranchName = bankBranch.Name;
                        var bankBranchNumber = bankBranch.Code;
                        var bankAccountType = bankAccount.BankAccountType.DisplayAttributeValue();

                        beneficiaryBankAccounts.Add(
                            new BeneficiaryBankAccount
                            {
                                NameOfAccountHolder = bankAccount.AccountHolderName,
                                AccountNumber = bankAccount.AccountNumber,
                                BankAccountType = bankAccount.BankAccountType,
                                BankName = bank.Name,
                                BankBranchName = bankBranchName,
                                BankBranchNumber = bankBranchNumber,
                                BankId = bank.Id,
                                BankBranchId = bankBranch.Id,
                                Id = bankAccount.RolePlayerBankingId,
                                UniversalBranchCode = bank.UniversalBranchCode,
                                IsApproved = bankAccount.IsApproved ?? false,
                                HaveAllDocumentsAccepted = haveDocumentsAccepted,
                                IsWizardCompleted = isWizardCompleted,
                                MessageText = messageText,
                                AccountType = bankAccountType,

                            });
                    }

                    var mainMember = (await _policyService.GetPolicyInsuredLives(new List<int>(claim.PolicyId.Value)))
                        .FirstOrDefault(a => a.RolePlayerId == beneficiary.RolePlayerId && a.RolePlayerTypeId == (int)RolePlayerTypeEnum.MainMemberSelf);

                    var beneficiaryOnPolicy = await _rolePlayerService.GetRelationByRolePlayerType(beneficiary.RolePlayerId, RolePlayerTypeEnum.Beneficiary, claim.PolicyId.Value);

                    var memberIsDeceased = beneficiaryOnPolicy?.FromRolePlayerId == personEventByClaimId.InsuredLifeId || mainMember?.RolePlayerId == personEvent.InsuredLifeId;

                    if (beneficiaryOnPolicy != null && !memberIsDeceased && beneficiary.Person != null)
                    {
                        var ben = new Beneficiary
                        {
                            BeneficiaryId = beneficiary.RolePlayerId,
                            IdNumber = beneficiary.Person.IdNumber,
                            PassportNumber = beneficiary.Person.PassportNumber,
                            Firstname = beneficiary.Person.FirstName,
                            Lastname = beneficiary.Person.Surname,
                            DateOfBirth = beneficiary.Person.DateOfBirth,
                            Email = beneficiary.EmailAddress,
                            ContactNumber = beneficiary.CellNumber,
                            RelationOfDeceased = "Unknown",
                            BankAccounts = beneficiaryBankAccounts,
                            MobileNumber = beneficiary.CellNumber,
                            InsuredLifeId = personEventByClaimId.InsuredLifeId,
                            IsChildDisabled = false,
                            IsInsuredLife = true,
                            IsBeneficiary = true,
                            RolePlayerType = RolePlayerTypeEnum.Beneficiary,
                            RolePlayerTypeId = beneficiaryOnPolicy.RolePlayerTypeId,
                            BeneficiaryType = BeneficiaryTypeEnum.Other,
                            AddressLine1 = beneficiary.RolePlayerAddresses.OrderByDescending(x => x.RolePlayerAddressId).FirstOrDefault()?.AddressLine1,
                            AddressLine2 = beneficiary.RolePlayerAddresses.OrderByDescending(x => x.RolePlayerAddressId).FirstOrDefault()?.AddressLine2,
                            City = beneficiary.RolePlayerAddresses.OrderByDescending(x => x.RolePlayerAddressId).FirstOrDefault()?.City,
                            PostalCode = beneficiary.RolePlayerAddresses.OrderByDescending(x => x.RolePlayerAddressId).FirstOrDefault()?.PostalCode
                        };
                        // No data at this present moment
                        // AllocationPercentage = beneficiary.Policy,
                        // beneficiary.IsChildDisabled,
                        // beneficiary.IsInsuredLife,
                        // beneficiary.IsBeneficiary,

                        beneficiaryDetails.Add(ben);
                    }
                }

                await scope.SaveChangesAsync();

                return beneficiaryDetails;
            }
        }

        public async Task<List<CorporateResult>> GetCorporateRoles(CoverTypeModel coverTypeModel)
        {
            if (coverTypeModel == null)
                return new List<CorporateResult>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var searchResult = await _claimRepository.SqlQueryAsync<CorporateResult>(
                     DatabaseConstants.ClaimDashboardCorporateStoredProcedure,
                     new SqlParameter("CoverTypeIds", string.Join(",", coverTypeModel.CoverTypeIds.ToArray())));

                return searchResult;

            }
        }

        public async Task<Contracts.Entities.PolicyClaim> GetClaimsByCoverTypeIds(CoverTypeModel coverTypeModel)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (coverTypeModel == null)
                {
                    return new PolicyClaim()
                    {
                        Claims = new List<Contracts.Entities.Claim>(),
                        policyCount = 0
                    };
                }

                var claimList = await _claimRepository.SqlQueryAsync<Contracts.Entities.Claim>(
                     DatabaseConstants.GetClaimByCoverTypeIdBrokerageId,
                     new SqlParameter("CoverTypeIds", string.Join(",", coverTypeModel.CoverTypeIds.ToArray())),
                     new SqlParameter("BrokerageId", coverTypeModel.BrokerageId)
                     );

                if (!claimList.Any())
                {
                    return new PolicyClaim()
                    {
                        Claims = new List<Contracts.Entities.Claim>(),
                        policyCount = 0
                    };
                }

                return new PolicyClaim()
                {
                    Claims = claimList,
                    policyCount = claimList.Select(p => p.PolicyId).Distinct().Count()
                };
            }
        }

        public async Task<CoverTypeEnum> GetCoverTypeByClaimId(int claimId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyId = (await _claimRepository.FirstOrDefaultAsync(c => c.ClaimId == claimId)).PolicyId;
                var policy = await _policyService.GetPolicyWithoutReferenceData(policyId.Value);
                return await _productOptionService.GetCoverTypeByProductOptionId(policy.ProductOptionId);
            }
        }

        public async Task<List<int?>> GetWorkFlowDailyEstimates()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var yesterday = DateTimeHelper.SaNow.AddDays(-1);
                var workFlows = await _claimWorkflowRepository
                    .Where(w => w.ClaimStatus == ClaimStatusEnum.Authorised && w.StartDateTime >= yesterday)
                    .OrderByDescending(o => o.ClaimStatus)
                    .ToListAsync();

                var claimIds = new List<int?>();

                var twoPm = new TimeSpan(13, 45, 0);
                var tenAm = new TimeSpan(09, 45, 0);
                var timeNow = TimeSpan.Parse(DateTimeHelper.SaNow.TimeOfDay.ToString());

                if (timeNow > tenAm && timeNow < twoPm)
                {
                    claimIds = workFlows.Where(w => w.StartDateTime.Value.TimeOfDay > tenAm && w.StartDateTime.Value.TimeOfDay < twoPm)
                       .Select(a => a.ClaimId)
                       .ToList();
                }
                else
                {
                    claimIds = workFlows.Where(w => w.StartDateTime.Value.TimeOfDay < tenAm || w.StartDateTime.Value.TimeOfDay > twoPm)
                        .Select(a => a.ClaimId)
                        .ToList();
                }

                return claimIds;
            }
        }

        public async Task<List<Contracts.Entities.Claim>> GetClaimsByPolicyIds(List<int> policyIds)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claims = await _claimRepository
                    .Where(s => policyIds.Contains(s.PolicyId.Value))
                    .ToListAsync();
                return Mapper.Map<List<Contracts.Entities.Claim>>(claims);
            }
        }

        public async Task<List<Contracts.Entities.Claim>> GetClaimsByPolicyId(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claims = await _claimRepository
                    .Where(s => s.PolicyId == policyId)
                    .ToListAsync();
                return Mapper.Map<List<Contracts.Entities.Claim>>(claims);
            }
        }

        public async Task<Contracts.Entities.PolicyClaim> GetCorporateClaims(CoverTypeModel coverTypeModel)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (coverTypeModel == null)
                {
                    return new PolicyClaim()
                    {
                        Claims = new List<Contracts.Entities.Claim>(),
                        policyCount = 0
                    };
                }

                var claimsYearToDate = await _claimRepository.SqlQueryAsync<Contracts.Entities.Claim>(
                     DatabaseConstants.GetCorporateClaims,
                     new SqlParameter("CoverTypeIds", string.Join(",", coverTypeModel.CoverTypeIds.ToArray())));

                if (!claimsYearToDate.Any())
                {
                    return new PolicyClaim()
                    {
                        Claims = new List<Contracts.Entities.Claim>(),
                        policyCount = 0
                    };
                }

                // Returning all the claims and the policy count for that brokerage
                return new PolicyClaim()
                {
                    Claims = claimsYearToDate,
                    policyCount = claimsYearToDate.Select(p => p.PolicyId).Distinct().Count()
                };
            }
        }

        public async Task<PolicyClaim> GetClaimsByProductOptionId(int productOptionId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var productOptionIds = new List<int>() { productOptionId };
                var policies = await _policyService.GetPoliciesByProductOptionsIds(productOptionIds);

                // Getting all the policies with the above productOptionIds, then filtering it to a specific brokerage
                var policyIds = (await _policyService.GetPoliciesByProductOptionsIds(productOptionIds)).Select(s => s.PolicyId);

                // Getting all the claims that exist from those policy ids
                var result = await _claimRepository.Where(c => policyIds.Contains(c.PolicyId.Value)).ToListAsync();
                var claimList = Mapper.Map<List<Contracts.Entities.Claim>>(result);

                // Returning all the claims and the policy count for that brokerage
                return new PolicyClaim()
                {
                    Claims = claimList,
                    policyCount = policyIds.Count()
                };
            }
        }

        public async Task<AssessorClaims> GetClaimsAssessors()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                const int claimAssessor = 289;

                var assessorsRole = (await _userService.GetUsers()).Where(a => a.RoleId == claimAssessor).ToList();
                var assessorIds = assessorsRole.Select(a => a.Id).ToList();

                // Getting all the claims that exist from those policy ids
                var result = await _claimRepository.Where(c => c.AssignedToUserId != null && assessorIds.Contains((int)c.AssignedToUserId)).ToListAsync();
                var claimList = Mapper.Map<List<Contracts.Entities.Claim>>(result);

                // Returning all the claims and the policy count for that brokerage
                return new AssessorClaims()
                {
                    Claims = claimList,
                    Users = assessorsRole
                };
            }
        }

        public async Task<User> GetClaimAssessor(int assessorId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return (await _userService.GetUsers()).FirstOrDefault(a => a.Id == assessorId);
            }
        }

        public async Task<ClaimInvoice> GetClaimInvoiceAllocationByClaimAndBeneficiary(int claimId, int beneficiaryId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _claimInvoiceRepository
                    .Where(a => a.InvoiceAllocations.Any(b =>
                        b.BeneificaryRolePlayerId == beneficiaryId && a.ClaimId == claimId))
                    .SingleOrDefaultAsync();
                return Mapper.Map<ClaimInvoice>(result);
            }
        }

        public async Task<List<FuneralClaimSearchResult>> GetClaimReport(string dateFrom, string dateTo, int statusId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            List<FuneralClaimSearchResult> searchResult;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                searchResult = await _claimRepository.SqlQueryAsync<FuneralClaimSearchResult>(
                    DatabaseConstants.FuneralClaimReportStoredProcedure,
                    new SqlParameter("@DateFrom", dateFrom),
                    new SqlParameter("@DateTo", dateTo),
                    new SqlParameter("@ClaimStatusId", statusId));
            }

            return searchResult;
        }

        public async Task<List<WorkPoolsModel>> GetUsersForWorkPool(WorkPoolEnum workPool, string roleName, int userId)
        {
            return await _workPoolService.GetUsersForWorkPool(workPool, roleName, userId);
        }

        public async Task<ClaimInvoice> GetClaimInvoice(int claimId, int beneficiaryId, int bankAccountId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.Create())
            {
                //=== GEt beneficiary id here
                //var beneficiaryDetail = await GetBeneficiaryByClaimId(claimId);
                if (await _configurationService.IsFeatureFlagSettingEnabled(_reconcilePolicyAndClaimBenefit133639))
                    await ReconcilePolicyAndClaimBenefit(claimId);
                var claimInvoice = new ClaimInvoice();

                if (await _configurationService.IsFeatureFlagSettingEnabled(_duplicateClaimInvoice131092))
                {
                    claimInvoice = await _claimInvoiceService.GetClaimInvoiceByClaimId(claimId);
                    if (claimInvoice == null)
                        claimInvoice = new ClaimInvoice();
                }

                //=== GetClaim beneficiary and bank account
                claimInvoice.BeneficiaryDetail = await GetBeneficiaryAndBankAccountById(beneficiaryId, bankAccountId);

                if (!string.IsNullOrEmpty(claimInvoice.BeneficiaryDetail.MessageText))
                {
                    claimInvoice.Id = 0;
                    claimInvoice.MessageText = BeneficiaryDeceased;
                    claimInvoice.Decision = ClaimInvoiceDecisionEnum.Decline;
                    return claimInvoice;
                }

                // GetClaim Claim Table
                var claim = await GetClaim(claimId);

                //=== GetClaim the Product here
                var productOption = await _policyService.GetProductByPolicyId(claim.PolicyId.Value);
                var product = await _productService.GetProduct(productOption.ProductId);

                if (product != null)
                {
                    //product.ProductId = 8;

                    claimInvoice.ClaimReferenceNumber = claim.PersonEventId.ToString();
                    claimInvoice.PolicyId = claim.PolicyId.Value;

                    //=== Get the policy
                    var policy = await _policyService.GetPolicyWithoutReferenceData(claim.PolicyId.Value);
                    claimInvoice.PolicyNumber = policy.PolicyNumber;
                    claimInvoice.ProductId = product.Id;
                    claimInvoice.Product = product.Code;
                    claimInvoice.ClaimStatusId = claim.ClaimStatusId;

                    var result = await _claimInvoiceRepository.Where(c => c.ClaimId == claimId).ToListAsync();
                    var calculatedPaymentAmounts = await GetCalculatedAmounts(claimId);
                    if (result == null || result.Count == 0)
                    {
                        claimInvoice.ClaimId = claimId;
                        if (calculatedPaymentAmounts != null)
                        {
                            claimInvoice.MessageText = calculatedPaymentAmounts.ValidationReason;
                            claimInvoice.ClaimAmount = calculatedPaymentAmounts.TotalAmount;
                            claimInvoice.Refund = calculatedPaymentAmounts.RefundAmount;
                            claimInvoice.OutstandingPremium = calculatedPaymentAmounts.OutstandingPremiumAmount;
                            claimInvoice.CoverAmount = calculatedPaymentAmounts.CoverAmount;
                            claimInvoice.UnclaimedPaymentInterest = calculatedPaymentAmounts.UnclaimedPaymentInterest;
                            claimInvoice.CapAmount = calculatedPaymentAmounts.CapAmount;
                            claimInvoice.TracingFees = calculatedPaymentAmounts.TracingFee;
                            claimInvoice.Decision = ClaimInvoiceDecisionEnum.Default;
                        }
                    }
                    else
                    {
                        foreach (var item in result)
                        {
                            var claimFuneralInvoice = await _funeralInvoiceRepository
                                .Where(funeralInvoice => funeralInvoice.ClaimInvoiceId == item.ClaimInvoiceId)
                                .FirstOrDefaultAsync();
                            claimInvoice.ClaimId = item.ClaimId;
                            claimInvoice.ClaimAmount = claimFuneralInvoice.CapAmount;
                            claimInvoice.Refund = claimFuneralInvoice.RefundAmount;
                            claimInvoice.OutstandingPremium = claimFuneralInvoice.OutstandingPremiumAmount;
                            claimInvoice.CapAmount = claimFuneralInvoice.CapAmount;
                            if (await _configurationService.IsFeatureFlagSettingEnabled("BenefitAmount"))
                            {
                                claimInvoice.CoverAmount = calculatedPaymentAmounts?.CoverAmount ?? 0M;
                            }
                            else
                            {
                                claimInvoice.CoverAmount = claimFuneralInvoice?.CoverAmount ?? 0M;
                            }
                            claimInvoice.UnclaimedPaymentInterest = claimFuneralInvoice.UnclaimedPaymentInterest;
                            claimInvoice.TracingFees = calculatedPaymentAmounts?.TracingFee ?? 0M;
                            claimInvoice.Decision = claimFuneralInvoice.ClaimInvoiceDecision;
                            claimInvoice.CapturedDate = item.CreatedDate;
                            claimInvoice.Id = item.ClaimInvoiceId;
                            claimInvoice.ClaimInvoiceId = item.ClaimInvoiceId;
                            if (claimFuneralInvoice.ClaimInvoiceDeclineReason != null)
                                claimInvoice.DecisionReasonId = (int)claimFuneralInvoice.ClaimInvoiceDeclineReason;
                            if (claimFuneralInvoice.ClaimInvoiceReversalReason != null)
                                claimInvoice.ReversalReasonId = (int)claimFuneralInvoice.ClaimInvoiceReversalReason;
                            var claimInvoiceAllocations = await _invoiceAllocationRepository.Where(invoiceAllocation => invoiceAllocation.ClaimInvoiceId == item.ClaimInvoiceId).ToListAsync();
                            foreach (var allocation in claimInvoiceAllocations)
                            {
                                InvoiceAllocation invoiceAllocation = new InvoiceAllocation();
                                invoiceAllocation.AllocationGroup = allocation.AllocationGroup;
                                invoiceAllocation.AssessedAmount = allocation.AssessedAmount;
                                invoiceAllocation.AssessedVat = allocation.AssessedVat;
                                invoiceAllocation.BeneificaryRolePlayerId = allocation.BeneificaryRolePlayerId.Value;
                                invoiceAllocation.InvoiceAllocationId = allocation.InvoiceAllocationId;
                                invoiceAllocation.InvoiceAllocationStatusId = allocation.InvoiceAllocationStatusId;
                                // invoiceAllocation.InvoiceTypeId = allocation.InvoiceTypeId;
                                invoiceAllocation.PaymentMethod = allocation.PaymentMethod;
                                invoiceAllocation.PaymentMethodId = (int)allocation.PaymentMethod;
                                invoiceAllocation.PercentAllocation = allocation.PercentAllocation;
                                claimInvoice.InvoiceAllocations.Add(invoiceAllocation);
                            }
                        }
                    }

                }

                //====Hyphen Bank Account Check ============//
                await ClaimBankAccountVerification(claimInvoice);
                var accountDetails = claimInvoice.BeneficiaryDetail.RolePlayerBankAccount;

                var bankAccountVerificationDetails = await GetBankAccountVerificationDetails(accountDetails.AccountNumber, accountDetails.BankAccountType, accountDetails.BranchCode);
                if (bankAccountVerificationDetails != null)
                {
                    claimInvoice.ClaimBankAccountVerification = bankAccountVerificationDetails;
                }

                return claimInvoice;
            }
        }

        public async Task<ClaimInvoice> GetClaimInvoiceAndAllocationsByClaimId(int claimId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claimInvoice = await _claimInvoiceRepository.ProjectTo<ClaimInvoice>().FirstOrDefaultAsync(i => i.ClaimId == claimId);
                var invoiceAllocations = await _invoiceAllocationRepository.Where(i => i.ClaimInvoiceId == claimInvoice.ClaimInvoiceId).ToListAsync();
                foreach (var allocation in invoiceAllocations)
                {
                    InvoiceAllocation invoiceAllocation = new InvoiceAllocation();
                    invoiceAllocation.AllocationGroup = allocation.AllocationGroup;
                    invoiceAllocation.AssessedAmount = allocation.AssessedAmount;
                    invoiceAllocation.AssessedVat = allocation.AssessedVat;
                    invoiceAllocation.BeneificaryRolePlayerId = allocation.BeneificaryRolePlayerId.Value;
                    invoiceAllocation.InvoiceAllocationId = allocation.InvoiceAllocationId;
                    invoiceAllocation.InvoiceAllocationStatusId = allocation.InvoiceAllocationStatusId;
                    // invoiceAllocation.InvoiceTypeId = allocation.InvoiceTypeId; column not in db tt files removed this please check the DB
                    invoiceAllocation.PaymentMethod = allocation.PaymentMethod;
                    invoiceAllocation.PaymentMethodId = (int)allocation.PaymentMethod;
                    invoiceAllocation.PercentAllocation = allocation.PercentAllocation;
                    claimInvoice.InvoiceAllocations.Add(invoiceAllocation);
                }

                return claimInvoice;
            }
        }

        public async Task<ClaimBankAccountVerification> GetBankAccountVerificationDetails(string accountNumber, BankAccountTypeEnum bankAccountType, string branchCode)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewBankAccountVerification);

            var claimBankAccountVerification = new ClaimBankAccountVerification();
            var bankAccountVerificationRequestResult = await _bankVerificationResponseProcessorService.GetVerifiedBankAccount(accountNumber, bankAccountType, branchCode);
            if (bankAccountVerificationRequestResult != null)
            {
                claimBankAccountVerification.AccountAcceptsCredits = bankAccountVerificationRequestResult.AccountAcceptsCredits;
                claimBankAccountVerification.AccountAcceptsDebits = bankAccountVerificationRequestResult.AccountAcceptsDebits;

                if (!string.IsNullOrEmpty(bankAccountVerificationRequestResult.AccountExists))
                    claimBankAccountVerification.MessageDescription = AccountVerifiedMessage(bankAccountVerificationRequestResult.AccountExists, "Account Number");

                if (!string.IsNullOrEmpty(bankAccountVerificationRequestResult.AccountTypeValid))
                    claimBankAccountVerification.MessageDescription = claimBankAccountVerification.MessageDescription + AccountVerifiedMessage(bankAccountVerificationRequestResult.AccountTypeValid, "Account Type");

                if (!string.IsNullOrEmpty(bankAccountVerificationRequestResult.AccountIdMatch))
                    claimBankAccountVerification.MessageDescription = claimBankAccountVerification.MessageDescription + AccountVerifiedMessage(bankAccountVerificationRequestResult.AccountIdMatch, "ID/Registration Number");

                if (!string.IsNullOrEmpty(bankAccountVerificationRequestResult.AccountOpenGtThreeMonths))
                    claimBankAccountVerification.MessageDescription = claimBankAccountVerification.MessageDescription + AccountVerifiedMessage(bankAccountVerificationRequestResult.AccountOpenGtThreeMonths, "Account Open Gt 3 Months");

                claimBankAccountVerification.AccountOpen = bankAccountVerificationRequestResult.AccountOpen;

                claimBankAccountVerification.AccountOpenGtThreeMonths = bankAccountVerificationRequestResult.AccountOpenGtThreeMonths;
                claimBankAccountVerification.EmailValid = bankAccountVerificationRequestResult.EmailValid;
                claimBankAccountVerification.InitialMatch = bankAccountVerificationRequestResult.InitialMatch;
                claimBankAccountVerification.LastNameMatch = bankAccountVerificationRequestResult.LastNameMatch;
                claimBankAccountVerification.PhoneValid = bankAccountVerificationRequestResult.PhoneValid;
                claimBankAccountVerification.ResponseDate = bankAccountVerificationRequestResult.ResponseDate;
                claimBankAccountVerification.VerificationId = bankAccountVerificationRequestResult.BankAccountVerificationId;
                claimBankAccountVerification.UserId = bankAccountVerificationRequestResult.UserId;
                claimBankAccountVerification.UserEmail = bankAccountVerificationRequestResult.UserEmail;
                if (string.IsNullOrEmpty(claimBankAccountVerification.MessageDescription))
                {
                    if (bankAccountVerificationRequestResult.MessageDescription == "Transaction sent to the bank. Waiting for feedback.")
                        claimBankAccountVerification.MessageDescription = "Account verification sent to the bank. Waiting for feedback.";
                    else
                        claimBankAccountVerification.MessageDescription = bankAccountVerificationRequestResult.MessageDescription;
                }
                if (string.IsNullOrEmpty(claimBankAccountVerification.MessageDescription))
                    claimBankAccountVerification.AccountSuccessfullyVerified = false;
                else
                {
                    if (claimBankAccountVerification.MessageDescription.ToLower().Contains("invalid") || claimBankAccountVerification.MessageDescription.ToLower().Contains("could not verify"))
                    {
                        claimBankAccountVerification.MessageDescription = claimBankAccountVerification.MessageDescription.Remove(claimBankAccountVerification.MessageDescription.Length - 1) + ".";
                        claimBankAccountVerification.AccountSuccessfullyVerified = false;
                    }

                    else
                        claimBankAccountVerification.AccountSuccessfullyVerified = true;
                }
            }
            return claimBankAccountVerification;
        }

        private string AccountVerifiedMessage(string messageCode, string messageType)
        {
            string message = string.Empty;
            switch (messageCode)
            {
                case "01":
                    return $" Invalid : {messageType},";
                case "99":
                    return $" Could not verify : {messageType},";
            }
            return message;
        }

        private async Task ClaimBankAccountVerification(ClaimInvoice claimInvoice)
        {
            //Hyphen account verification
            bool accountVerified = false;
            var accountDetails = claimInvoice.BeneficiaryDetail.RolePlayerBankAccount;
            var idNumberPassportNumber = !string.IsNullOrEmpty(claimInvoice.BeneficiaryDetail.IdNumber)
                                                                ? claimInvoice.BeneficiaryDetail.IdNumber
                                                                : claimInvoice.BeneficiaryDetail.PassportNumber;

            var bankAccountVerificationRequestResult = await _bankVerificationResponseProcessorService.GetVerifiedBankAccount(accountDetails.AccountNumber, accountDetails.BankAccountType, accountDetails.BranchCode);
            if (bankAccountVerificationRequestResult != null)
            {
                var accountVerifiedDate = bankAccountVerificationRequestResult.RequestedDate.GetValueOrDefault();
                DateTime compareDate = DateTime.Now.AddMonths(-3);
                int dateCompareResult = DateTime.Compare(accountVerifiedDate, compareDate);
                if (dateCompareResult > 0)
                    accountVerified = true;
                else
                    accountVerified = false;
            }

            if (accountVerified == false)
            {
                Regex regEx = new Regex(@"(\b[a-zA-Z])[a-zA-Z]* ?");
                string initials = regEx.Replace(accountDetails.AccountHolderName, "$1");

                var result = await _bankAccountVerificationCreatorService.DoBankAccountVerification(accountDetails.AccountNumber,
                                                                                                    accountDetails.BankAccountType,
                                                                                                    accountDetails.BranchCode,
                                                                                                    initials,
                                                                                                    accountDetails.AccountHolderName,
                                                                                                    idNumberPassportNumber,
                                                                                                    BankAccountVerificationPurposeTypeEnum.ClaimPayment);
            }
        }

        public async Task<bool> BankAccountVerification(string accountNumber, BankAccountTypeEnum accountType, string branchCode, string accountHolderName, string initials, string accountHolderIdNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Regex regEx = new Regex(@"(\b[a-zA-Z])[a-zA-Z]* ?");
                string idNumber = Regex.Replace(accountHolderIdNumber, @"[^0-9a-zA-Z:,]+", "");
                var result = await _bankAccountVerificationCreatorService.DoBankAccountVerification(accountNumber,
                                                                                                    accountType,
                                                                                                    branchCode,
                                                                                                    initials,
                                                                                                    accountHolderName,
                                                                                                    idNumber,
                                                                                                    BankAccountVerificationPurposeTypeEnum.ClaimPayment);
                return result;
            }
        }
        public async Task<PagedRequestResult<WorkPool>> GetClaimWorkPoolsPaged(WorkPoolEnum workPool, int userId, int selectedUserId, PagedRequest pagedRequest)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewWorkPool);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                int workPoolId = Convert.ToInt32(workPool);
                var parameters = new List<SqlParameter>();

                parameters.Add(new SqlParameter
                {
                    ParameterName = "@WorkPoolId",
                    SqlDbType = SqlDbType.Int,
                    Value = workPoolId
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@UserId",
                    SqlDbType = System.Data.SqlDbType.Int,
                    Value = userId
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@SelectedUserId",
                    SqlDbType = System.Data.SqlDbType.Int,
                    Value = selectedUserId
                });

                if (string.IsNullOrEmpty(pagedRequest?.SearchCriteria))
                {
                    parameters.Add(new SqlParameter
                    {
                        ParameterName = "@Query",
                        SqlDbType = System.Data.SqlDbType.NVarChar,
                        IsNullable = true,
                        Value = string.Empty
                    });
                }
                else
                {
                    parameters.Add(new SqlParameter
                    {
                        ParameterName = "@Query",
                        SqlDbType = System.Data.SqlDbType.NVarChar,
                        IsNullable = true,
                        Value = pagedRequest.SearchCriteria
                    });
                }

                parameters.Add(new SqlParameter
                {
                    ParameterName = "@Page",
                    SqlDbType = System.Data.SqlDbType.Int,
                    Value = pagedRequest.Page
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@PageSize",
                    SqlDbType = System.Data.SqlDbType.Int,
                    Value = pagedRequest.PageSize
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@OrderBy",
                    SqlDbType = System.Data.SqlDbType.NVarChar,
                    Value = pagedRequest.OrderBy
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@isAscending",
                    SqlDbType = System.Data.SqlDbType.Bit,
                    Value = pagedRequest.IsAscending
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@RowCount",
                    SqlDbType = System.Data.SqlDbType.BigInt,
                    Direction = ParameterDirection.Output,
                    Value = 0
                });

                var claimWorks = await _claimRepository.SqlQueryAsync<WorkPool>(
                   DatabaseConstants.GetClaimWorkPoolsPaged, parameters.ToArray()
               );

                var RowCount = Convert.ToInt32(parameters.FirstOrDefault(c => c.ParameterName == "@RowCount")?.Value);

                return new PagedRequestResult<WorkPool>()
                {
                    Page = pagedRequest.Page,
                    PageCount = claimWorks.Count,
                    PageSize = pagedRequest.PageSize,
                    RowCount = RowCount,
                    Data = claimWorks,
                };
            }
        }
        public async Task ScheduledNotificationForOverDueSLA()
        {

            var page = new PagedRequest("", 1, 5, "Wizard.Id", true);
            var result = new List<WorkPool>();

            result = (await GetClaimWorkPoolsPaged(WorkPoolEnum.FuneralClaimspool, 2, 0, page)).Data;

            foreach (var item in result)
            {

                var emailTemplate = (await _emailTemplateService.GetEmailTemplate((int)Admin.CampaignManager.Contracts.Enums.EmailTemplate.SLABreachEmail)).Template;
                var deceasedLife = await _rolePlayerService.GetRolePlayer(item.InsuredLifeId);
                var claimsManagerEmail = await _userService.GetUsersByRoleName("Claims Manager");

                var emailTokens = new Dictionary<string, string>
                {
                    ["{policyNumber}"] = item.PolicyNumber,
                    ["{claimNumber}"] = item.PersonEventId.ToString(),
                    ["{deceasedFirstName}"] = deceasedLife.Person.FirstName,
                    ["{deceasedLastName}"] = deceasedLife.Person.Surname,
                    ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy")
                };


                foreach (var token in emailTokens) emailTemplate = emailTemplate.Replace($"{token.Key}", token.Value);
                if (item.UserSLA > new TimeSpan(8, 0, 0))
                {
                    var email = new SendMailRequest()
                    {
                        Subject = OverDueSlaClaimSubject,
                        FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                        Recipients = string.Join(";", claimsManagerEmail.Select(x => x.Email)),
                        Body = emailTemplate,
                        IsHtml = true,
                        ItemId = item.ClaimId,
                        ItemType = "Claim"
                    };
                    var sendEmail = await _sendEmailService.SendEmail(email);
                }
            }
        }

        public async Task<ClaimsCalculatedAmount> GetCalculatedAmounts(int claimId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _claimsCalculatedRepository.FirstOrDefaultAsync(c => c.ClaimId == claimId);
                return Mapper.Map<ClaimsCalculatedAmount>(result);
            }
        }

        public async Task UpdateStatus(Action action)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditClaim);

            int? allocatedUserId = action.UserId;
            bool isIndividualAssessor;
            WorkPoolEnum? workpool = null;
            Wizard wizardDetails = null;
            System.DateTime? startDate = action.ActionDate != null ? action.ActionDate : DateTime.Now;

            //if (action.ItemType != null && action.ItemType.ToLower().CompareTo("wizard") == 1)
            //{
            //    wizardDetails = await _wizardService.GetWizard(action.ItemId);
            //    action.ItemId = wizardDetails.LinkedItemId;
            //}

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var claimEntity = await _claimRepository.Where(n => n.ClaimId == action.ItemId)
                    .SingleAsync("Claim entry not found");
                var personEventInsuredLife = await _personEventRepository.FirstOrDefaultAsync(p => p.PersonEventId == claimEntity.PersonEventId);
                var perosnEventDeathDetails = await _personEventDeathDetail.FirstOrDefaultAsync(p => p.PersonEventId == personEventInsuredLife.PersonEventId);
                var smsName = string.Empty;
                var smsTokens = new Dictionary<string, string>();
                var previousAssessorId = await GetPreviousAssessorWorked(claimEntity.ClaimId);
                var claimEmailAction = new ClaimEmailAction { ClaimId = action.ItemId, PersonEventId = 0 };

                var claimNoteEntity = await this._claimNoteRepository.FirstOrDefaultAsync(
                                          note => note.PersonEventId == claimEntity.PersonEventId
                                                  && note.ClaimStatus == 0);
                bool createClaimWorkFlow = true;
                var policy = await _policyService.GetPolicyWithoutReferenceData(claimEntity.PolicyId.Value);

                claimEntity.ClaimStatusChangeDate = DateTimeHelper.SaNow;
                claimEntity.ClaimCancellationReason = action.CancellationReason;
                claimEntity.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Pending;
                switch (action.Status)
                {
                    case ClaimStatusEnum.New: // After Register Screen
                        isIndividualAssessor = await _workPoolService.IsUserInWorkPool(action.UserId, WorkPoolEnum.IndividualAssessorpool);
                        if (isIndividualAssessor)
                            workpool = WorkPoolEnum.IndividualAssessorpool;
                        claimEntity.ClaimStatus = ClaimStatusEnum.New;
                        claimEntity.AssignedToUserId = isIndividualAssessor ? action.UserId : null;
                        break;

                    case ClaimStatusEnum.PendingRequirements: // When some documents have been received
                        isIndividualAssessor =
                            await _workPoolService.IsUserInWorkPool(action.UserId, WorkPoolEnum.IndividualAssessorpool);
                        if (isIndividualAssessor)
                            workpool = WorkPoolEnum.IndividualAssessorpool;
                        claimEntity.ClaimStatus = ClaimStatusEnum.PendingRequirements;
                        claimEntity.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.OutstandingRequirements;
                        claimEntity.AssignedToUserId = isIndividualAssessor ? action.UserId : null;
                        break;

                    case ClaimStatusEnum.Received: // When all documents have been received
                        isIndividualAssessor =
                            await _workPoolService.IsUserInWorkPool(action.UserId, WorkPoolEnum.IndividualAssessorpool);
                        if (isIndividualAssessor)
                            workpool = WorkPoolEnum.IndividualAssessorpool;
                        claimEntity.ClaimStatus = ClaimStatusEnum.Received;
                        claimEntity.AssignedToUserId = isIndividualAssessor ? action.UserId : null;
                        break;

                    case ClaimStatusEnum.AwaitingDecision: // When user completes wizard or accepts all documents
                        isIndividualAssessor =
                            await _workPoolService.IsUserInWorkPool(action.UserId, WorkPoolEnum.IndividualAssessorpool);
                        if (isIndividualAssessor)
                            workpool = WorkPoolEnum.IndividualAssessorpool;
                        claimEntity.ClaimStatus = ClaimStatusEnum.AwaitingDecision;
                        claimEntity.AssignedToUserId = isIndividualAssessor ? action.UserId : null;
                        break;

                    case ClaimStatusEnum.Approved: // First gate of approval of a claim claimInvoice
                                                   //check if it is Ex-gratia approved
                        if (claimEntity.ClaimStatus == ClaimStatusEnum.ExGratia)
                        {
                            claimEntity.ClaimStatus = ClaimStatusEnum.ExGratiaApproved;
                        }
                        else
                        {
                            claimEntity.ClaimStatus = ClaimStatusEnum.Approved;
                        }

                        //var secondApproverPoolId = await
                        var assignedToUser = await _assignedToUserRepository.Where(t => t.UserId == RmaIdentity.UserId).FirstOrDefaultAsync();
                        if (assignedToUser != null)
                        {
                            claimEntity.AssignedToUserId = assignedToUser.AssignToUserId;
                        }
                        else
                        {
                            claimEntity.AssignedToUserId = null;
                        }
                        // allocatedUserId = RmaIdentity.UserId;
                        allocatedUserId = claimEntity.AssignedToUserId;
                        workpool = WorkPoolEnum.SecondApproverpool;
                        break;

                    case ClaimStatusEnum.Declined: // Second gate of authorisation of a claim claimInvoice
                        createClaimWorkFlow = false;
                        allocatedUserId = null;
                        workpool = WorkPoolEnum.Declinepool;
                        claimEntity.ClaimStatus = ClaimStatusEnum.Declined;
                        claimEntity.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Declined;
                        claimEntity.AssignedToUserId = allocatedUserId;
                        claimEntity.ClaimDeclineReason = action.ClaimDeclineReason;
                        break;

                    case ClaimStatusEnum.AwaitingDeclineDecision: // First assessor declined - waiting for approval
                        workpool = WorkPoolEnum.Declinepool;
                        claimEntity.ClaimStatus = ClaimStatusEnum.AwaitingDeclineDecision;
                        claimEntity.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Declined;
                        claimEntity.AssignedToUserId = action.UserId;
                        break;

                    case ClaimStatusEnum.ReturnToAssessorAfterDeclined: // First assessor declined - decline overturned by approver and returned to assessor
                        workpool = WorkPoolEnum.IndividualAssessorpool;
                        claimEntity.ClaimStatus = ClaimStatusEnum.ReturnToAssessorAfterDeclined;
                        claimEntity.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Declined;
                        claimEntity.AssignedToUserId = allocatedUserId;
                        break;

                    case ClaimStatusEnum.Authorised:
                        allocatedUserId = RmaIdentity.UserId;
                        workpool = WorkPoolEnum.Financepool;
                        claimEntity.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Accepted;
                        if (await _configurationService.IsFeatureFlagSettingEnabled("ExgratiaAuth"))
                        {
                            claimEntity.ClaimStatus = claimEntity.ClaimStatus == ClaimStatusEnum.ExGratiaApproved ? ClaimStatusEnum.ExGratiaAuthorised : claimEntity.ClaimStatus = ClaimStatusEnum.Authorised;
                        }
                        else
                        {
                            claimEntity.ClaimStatus = ClaimStatusEnum.Authorised;
                        }

                        claimEntity.AssignedToUserId = null;
                        if (!await _configurationService.IsFeatureFlagSettingEnabled(_updateDeceasedMember133680))
                        {
                            await _rolePlayerPolicyService.RemoveInsuredLife(personEventInsuredLife.InsuredLifeId, claimEntity.PolicyId.Value, personEventInsuredLife.PersonEventDeathDetail.DeathDate);
                            await _rolePlayerPolicyService.UpdateMemberPremiumContribution(claimEntity.PolicyId.Value, policy.PolicyNumber, personEventInsuredLife.InsuredLifeId, personEventInsuredLife.PersonEventDeathDetail.DeathDate);
                        }
                        await _rolePlayerPolicyService.AdjustInvoicesAferClaimIsAuthorised(claimEntity.PolicyId.Value, claimEntity.ClaimId);
                        break;

                    case ClaimStatusEnum.ReturnToAssessor: // Change to reassess
                        allocatedUserId =
                            await GetLastUserForWorkPool(action.ItemId, WorkPoolEnum.IndividualAssessorpool);
                        workpool = WorkPoolEnum.IndividualAssessorpool;
                        claimEntity.ClaimStatus = ClaimStatusEnum.ReturnToAssessor;
                        claimEntity.AssignedToUserId = action.UserId;
                        break;

                    case ClaimStatusEnum.PendingPolicyAdmin:
                        allocatedUserId = null;
                        workpool = WorkPoolEnum.PolicyManagerpool;
                        claimEntity.ClaimStatus = ClaimStatusEnum.PendingPolicyAdmin;
                        claimEntity.AssignedToUserId = allocatedUserId;
                        break;

                    case ClaimStatusEnum.Closed:
                        createClaimWorkFlow = false;
                        workpool = WorkPoolEnum.Declinepool;
                        claimEntity.ClaimId = action.ItemId;
                        claimEntity.ClaimStatus = action.Status;
                        claimEntity.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Declined;
                        claimEntity.AssignedToUserId = null;
                        break;

                    case ClaimStatusEnum.Cancelled:
                        createClaimWorkFlow = false;
                        workpool = WorkPoolEnum.Declinepool;
                        claimEntity.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Declined;
                        claimEntity.ClaimId = action.ItemId;
                        claimEntity.ClaimStatus = action.Status;
                        claimEntity.AssignedToUserId = null;
                        break;

                    case ClaimStatusEnum.Paid:
                        createClaimWorkFlow = false;
                        workpool = WorkPoolEnum.Financepool;
                        claimEntity.ClaimStatus = ClaimStatusEnum.Paid;
                        claimEntity.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Accepted;
                        claimEntity.AssignedToUserId = null;
                        break;

                    case ClaimStatusEnum.Unpaid:
                        int? individualAssessorForClaim = await GetLastUserForWorkPool(action.ItemId, WorkPoolEnum.IndividualAssessorpool);
                        claimEntity.ClaimStatus = ClaimStatusEnum.Unpaid;
                        claimEntity.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Declined;
                        claimEntity.AssignedToUserId = individualAssessorForClaim;
                        workpool = WorkPoolEnum.IndividualAssessorpool;
                        allocatedUserId = individualAssessorForClaim;
                        // GetClaim System user
                        var user = await _userService.GetUserByEmail(SystemSettings.SystemUserAccount);
                        break;

                    case ClaimStatusEnum.PolicyAdminCompleted: // After Policy Admin completed
                        allocatedUserId = await GetLastUserForWorkPool(action.ItemId, WorkPoolEnum.IndividualAssessorpool);
                        workpool = WorkPoolEnum.IndividualAssessorpool;
                        claimEntity.ClaimStatus = ClaimStatusEnum.PolicyAdminCompleted;
                        claimEntity.AssignedToUserId = allocatedUserId;
                        break;

                    case ClaimStatusEnum.Reopened:
                        allocatedUserId = await GetLastUserForWorkPool(action.ItemId, WorkPoolEnum.IndividualAssessorpool);
                        workpool = WorkPoolEnum.IndividualAssessorpool;
                        claimEntity.ClaimStatus = ClaimStatusEnum.Reopened;
                        claimEntity.AssignedToUserId = allocatedUserId;
                        break;

                    case ClaimStatusEnum.AwaitingReversalDecision:
                        var claimManager = await _userService.GetUsersByRoleName(ClaimsManagerRole);
                        var claimManagerUserId = claimManager.FirstOrDefault()?.Id;
                        allocatedUserId = claimManagerUserId;
                        workpool = WorkPoolEnum.Declinepool;
                        claimEntity.ClaimStatus = ClaimStatusEnum.AwaitingReversalDecision;
                        claimEntity.AssignedToUserId = claimManagerUserId;
                        break;

                    case ClaimStatusEnum.ExGratia:
                        workpool = WorkPoolEnum.IndividualAssessorpool;
                        claimEntity.ClaimStatus = ClaimStatusEnum.ExGratia;
                        claimEntity.AssignedToUserId = previousAssessorId;
                        break;

                    case ClaimStatusEnum.Reversed:
                        allocatedUserId = previousAssessorId;
                        workpool = WorkPoolEnum.IndividualAssessorpool;
                        claimEntity.ClaimStatus = ClaimStatusEnum.Reversed;
                        claimEntity.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Declined;
                        claimEntity.AssignedToUserId = previousAssessorId;
                        break;

                    case ClaimStatusEnum.ReversalRejected:
                        workpool = WorkPoolEnum.Financepool;
                        claimEntity.ClaimStatus = ClaimStatusEnum.ReversalRejected;
                        claimEntity.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Declined;
                        claimEntity.AssignedToUserId = null;
                        break;

                    case ClaimStatusEnum.Repay:
                        allocatedUserId = previousAssessorId;
                        workpool = WorkPoolEnum.IndividualAssessorpool;
                        claimEntity.ClaimStatus = ClaimStatusEnum.Repay;
                        claimEntity.AssignedToUserId = previousAssessorId;
                        break;
                    case ClaimStatusEnum.PaymentRecovery:
                        allocatedUserId = await GetAssessorWhoInvokedRecovery(action.ItemId);
                        workpool = WorkPoolEnum.IndividualAssessorpool;
                        claimEntity.ClaimStatus = ClaimStatusEnum.PaymentRecovery;
                        claimEntity.AssignedToUserId = allocatedUserId;
                        break;
                    case ClaimStatusEnum.Tracing:
                        allocatedUserId = claimEntity.AssignedToUserId;
                        workpool = WorkPoolEnum.IndividualAssessorpool;
                        claimEntity.ClaimStatus = ClaimStatusEnum.Tracing;
                        break;
                    case ClaimStatusEnum.Unclaimed:
                        allocatedUserId = claimEntity.AssignedToUserId;
                        workpool = WorkPoolEnum.IndividualAssessorpool;
                        claimEntity.ClaimStatus = ClaimStatusEnum.Unclaimed;
                        break;
                }

                _claimRepository.Update(claimEntity);

                if (claimNoteEntity != null)
                {
                    claimNoteEntity.ClaimStatus = claimEntity.ClaimStatus;
                    claimNoteEntity.PersonEventStatus = null;
                    this._claimNoteRepository.Update(claimNoteEntity);
                }

                // Claim workflow audit
                var claimWorkFlow = await _claimWorkflowRepository.Where(x => x.ClaimId == claimEntity.ClaimId).OrderByDescending(x => x.ClaimWorkflowId).FirstOrDefaultAsync();

                if (claimWorkFlow != null)
                {
                    claimWorkFlow.EndDateTime = DateTime.Now;
                    _claimWorkflowRepository.Update(claimWorkFlow);
                }

                if (createClaimWorkFlow)
                {
                    _claimWorkflowRepository.Create(Mapper.Map<claim_ClaimWorkflow>(new ClaimWorkflow
                    {
                        AssignedToUserId = RmaIdentity.UserId,
                        ClaimId = claimEntity.ClaimId,
                        ClaimStatus = claimEntity.ClaimStatus,
                        WorkPool = workpool != null ? workpool : null,
                        StartDateTime = startDate,
                        WizardId = wizardDetails?.Id
                    }));
                }
                //Only send out notifications after status has been changed
                await scope.SaveChangesAsync().ConfigureAwait(false);

                switch (action.Status)
                {
                    case ClaimStatusEnum.New: // After Register Screen
                        smsName = "Registration of claim";
                        smsTokens.Add("claimNumber", string.Format(claimEntity.PersonEventId.ToString()));
                        break;

                    case ClaimStatusEnum.PendingRequirements: // When some documents have been received
                        smsName = "Claims requirements outstanding";
                        smsTokens.Add("claimNumber", string.Format(claimEntity.PersonEventId.ToString()));
                        break;

                    case ClaimStatusEnum.Approved: // First gate of approval of a claim claimInvoice
                                                   //check if it is Ex-gratia approved
                        if (claimEntity.ClaimStatus == ClaimStatusEnum.ExGratia)
                        {
                            claimEmailAction.ActionType = "Ex-gratia letter";
                            await ClaimActionEmailNotification(claimEmailAction);
                        }
                        else
                        {
                            claimEmailAction.ActionType = "Claim Approved";
                            await ClaimActionEmailNotification(claimEmailAction);
                        }
                        smsName = "Claim Approved";
                        smsTokens.Add("claimNumber", string.Format(claimEntity.PersonEventId.ToString()));
                        break;

                    case ClaimStatusEnum.Declined: // Second gate of authorisation of a claim claimInvoice
                        smsName = "Claim Declined";
                        smsTokens.Add("claimNumber", string.Format(claimEntity.PersonEventId.ToString()));
                        break;

                    case ClaimStatusEnum.Authorised:

                        claimEmailAction.ActionType = "Claim Authorized";
                        await ClaimActionEmailNotification(claimEmailAction);

                        smsName = "Claim Authorized";
                        smsTokens.Add("claimNumber", string.Format(claimEntity.PersonEventId.ToString()));
                        break;

                    case ClaimStatusEnum.Closed:
                        claimEmailAction.ActionType = "Claim closed letter";
                        await ClaimActionEmailNotification(claimEmailAction);
                        break;

                    case ClaimStatusEnum.Cancelled:
                        if (claimEntity.ClaimCancellationReason != ClaimCancellationReasonEnum.Duplicateclaim)
                        {
                            claimEmailAction.ActionType = "Claim cancel letter";
                            await ClaimActionEmailNotification(claimEmailAction);
                        }

                        break;

                }

                try
                {
                    if (claimEntity.ClaimCancellationReason != ClaimCancellationReasonEnum.Duplicateclaim)
                    {
                        var smsNotification = new TemplateSmsRequest();
                        var mobile = (await _rolePlayerService.GetRolePlayerWithoutReferenceData(personEventInsuredLife.ClaimantId)).CellNumber;

                        smsNotification = new TemplateSmsRequest()
                        {
                            Name = smsName,
                            Tokens = smsTokens,
                            SmsNumbers = new List<string> { mobile },
                            ItemType = ItemTypeEnum.Claim.DisplayAttributeValue(),
                            Department = RMADepartmentEnum.Claims,
                            ItemId = claimEntity.ClaimId
                        };


                        if (!string.IsNullOrEmpty(smsNotification.Name))
                        {
                            var result = await _sendSmsService.SendTemplateSms(smsNotification);
                        }
                    }
                }
                catch (Exception e)
                {
                    e.LogException();
                }

                if ((policy.IsEuropAssist) &&
        claimEntity.ClaimStatus == ClaimStatusEnum.New
     || claimEntity.ClaimStatus == ClaimStatusEnum.Paid
     || claimEntity.ClaimStatus == ClaimStatusEnum.Declined
     || claimEntity.ClaimStatus == ClaimStatusEnum.Authorised)
                {
                    await ValidateEaNotification(claimEntity, policy, claimEntity.ClaimStatus);
                }

                var isCFP = await IsConsolidatedFuneral(policy.PolicyId);

                if (isCFP && CFPEuropAssistValidClaimStatuses.Contains(claimEntity.ClaimStatus))
                {
                    await SendEuropAssistNotification(claimEntity.ClaimId, claimEntity.ClaimStatus);
                }
            }
        }

        public async Task UpdateTracerInvoicePaymentStatus(int paymentId, PaymentStatusEnum paymentStatus)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.UpdateTracerInvoice);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var tracerInvoice = await _tracerInvoiceRepository.FirstOrDefaultAsync(a => a.PaymentId == paymentId);

                if (tracerInvoice != null)
                {
                    tracerInvoice.PaymentStatus = (int)paymentStatus;

                    _tracerInvoiceRepository.Update(tracerInvoice);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        public async Task UpdateTracingFee(int claimId, decimal paymentAmount)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.UpdateTracer);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var calculatedAmount = await _claimsCalculatedRepository.FirstOrDefaultAsync(a => a.ClaimId == claimId);

                if (calculatedAmount != null)
                {
                    if (calculatedAmount.TracingFee != null)
                    {
                        calculatedAmount.TracingFee += Convert.ToDecimal(paymentAmount);
                    }
                    else
                    {
                        calculatedAmount.TracingFee = Convert.ToDecimal(paymentAmount);
                    }

                    if (calculatedAmount.TotalAmount > 0)
                        calculatedAmount.TotalAmount -= paymentAmount;

                    _claimsCalculatedRepository.Update(calculatedAmount);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        public async Task<int> UpdateClaim(Contracts.Entities.Claim claim)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditClaim);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var claimEntity = await _claimRepository.Where(x => x.ClaimId == claim.ClaimId).FirstOrDefaultAsync();

                var pdVerifiedChanged = claimEntity != null && claim != null && claimEntity.PdVerified != claim.PdVerified;
                var disabilityPercentageChanged = claimEntity != null && claim != null && claimEntity.DisabilityPercentage != claim.DisabilityPercentage;
                var claimStatusChanged = claimEntity != null && claim != null && claimEntity.ClaimStatus != claim.ClaimStatus;

                var mappedClaim = Mapper.Map<claim_Claim>(claim);

                if (claimStatusChanged)
                {
                    mappedClaim.ClaimStatusChangeDate = DateTimeHelper.SaNow;

                    if (mappedClaim.ClaimStatus == ClaimStatusEnum.Open)
                    {
                        mappedClaim.IsCancelled = false;
                        mappedClaim.IsClosed = false;
                        await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
                        {
                            ItemId = mappedClaim.PersonEventId,
                            NoteCategory = NoteCategoryEnum.PersonEvent,
                            NoteItemType = NoteItemTypeEnum.PersonEvent,
                            NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                            NoteType = NoteTypeEnum.SystemAdded,
                            Text = $"Claim has been re-opened with reason:  {claim?.ClaimNotes.ElementAt(0).Reason} and comments: {claim.ClaimNotes.ElementAt(0).Text}",
                            IsActive = true
                        });
                    }

                    if (mappedClaim.ClaimStatus == ClaimStatusEnum.LegalRecovery)
                    {
                        await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
                        {
                            ItemId = mappedClaim.PersonEventId,
                            NoteCategory = NoteCategoryEnum.PersonEvent,
                            NoteItemType = NoteItemTypeEnum.PersonEvent,
                            NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                            NoteType = NoteTypeEnum.SystemAdded,
                            Text = $"Claim was created and send to legal for recoveries ${claimEntity.ClaimId}",
                            IsActive = true
                        });
                    }
                }

                _claimRepository.Update(mappedClaim);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                if (disabilityPercentageChanged)
                {
                    // start zero / non-zero SLA
                    var slaItemType = claim.DisabilityPercentage > 0 ? SLAItemTypeEnum.WorkPoolNonZeroPD : SLAItemTypeEnum.WorkPoolZeroPD;
                    var reason = claim.DisabilityPercentage > 0 ? $"Disability PD% was greater than zero: ({claim.DisabilityPercentage}%)" : "Disability PD% was zero: (0%)";

                    if (claim.WorkPoolId == Convert.ToInt32(WorkPoolEnum.ClaimsAssessorPool))
                    {
                        await UpdateSLAForClaim(mappedClaim, reason, slaItemType);
                    }
                    else if (claim.WorkPoolId == Convert.ToInt32(WorkPoolEnum.ScaPool))
                    {
                        await UpdateSLAForClaim(mappedClaim, reason, slaItemType);
                    }
                }

                return claim.ClaimId;
            }
        }

        private async Task UpdateSLAForClaim(claim_Claim claim, string reason, SLAItemTypeEnum sLAItemType)
        {
            var slaStatusChangeAudit = new SlaStatusChangeAudit
            {
                SLAItemType = sLAItemType,
                ItemId = claim.PersonEventId,
                Status = "Claim Status: " + claim.ClaimStatus.ToString(),
                EffectiveFrom = DateTimeHelper.SaNow,
                Reason = reason
            };

            DateTime? effectiveTo = null;

            switch (slaStatusChangeAudit.SLAItemType)
            {
                case SLAItemTypeEnum.ScaPool:
                case SLAItemTypeEnum.ClaimsAssessorPool:
                case SLAItemTypeEnum.WorkPoolNonZeroPD:
                    if (claim.ClaimLiabilityStatus == ClaimLiabilityStatusEnum.LiabilityAccepted
                        || claim.ClaimLiabilityStatus == ClaimLiabilityStatusEnum.FullLiabilityAccepted
                        || claim.ClaimLiabilityStatus == ClaimLiabilityStatusEnum.MedicalLiability)
                    {
                        effectiveTo = null;
                    }
                    break;
                case SLAItemTypeEnum.CcaPool:
                    if (claim.ClaimStatus == ClaimStatusEnum.Closed || claim.ClaimStatus == ClaimStatusEnum.ClaimClosed)
                    {
                        effectiveTo = DateTimeHelper.SaNow;
                    }
                    break;
                default:
                    effectiveTo = DateTimeHelper.SaNow;
                    break;
            }

            slaStatusChangeAudit.EffictiveTo = effectiveTo;
            await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
        }

        public async Task UpdateClaimStatus(Action action)
        {
            await UpdateStatus(new Action
            {
                ItemId = action.ItemId,
                UserId = RmaIdentity.UserId,
                Status = action.Status,
                ItemType = action.ItemType,
                CancellationReason = action.CancellationReason
            });
        }

        public async Task UpdatePersonEventStatus(PersonEventAction action)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var personEventEntity = await _personEventRepository.Where(n => n.PersonEventId == action.ItemId).SingleAsync("Claim entry not found");

                var claimNoteEntity = await this._claimNoteRepository.FirstOrDefaultAsync(
                                    note => note.PersonEventId == personEventEntity.PersonEventId && note.PersonEventStatus == 0);

                var claimworkPool = await _claimWorkflowRepository.Where(a => a.PersonEventId == action.ItemId && a.EndDateTime == null).OrderByDescending(b => b.ClaimWorkflowId).FirstOrDefaultAsync();

                if (claimworkPool != null)
                {
                    claimworkPool.AssignedToUserId = RmaIdentity.UserId;
                    claimworkPool.EndDateTime = DateTimeHelper.SaNow;
                    _claimWorkflowRepository.Update(claimworkPool);
                }


                var claimEmailAction = new ClaimEmailAction();
                claimEmailAction.ClaimId = 0;
                claimEmailAction.PersonEventId = action.ItemId;
                claimEmailAction.FraudulentCase = action.FraudulentCase.HasValue ? action.FraudulentCase : null;

                var entity = new claim_ClaimWorkflow();
                entity.AssignedToUserId = personEventEntity.AssignedToUserId;
                entity.PersonEventId = personEventEntity.PersonEventId;
                entity.WorkPool = WorkPoolEnum.Declinepool;
                entity.StartDateTime = personEventEntity.AssignedDate;
                entity.EndDateTime = DateTimeHelper.SaNow;

                switch (action.PersonEventStatus)
                {
                    case PersonEventStatusEnum.Cancelled:
                        personEventEntity.PersonEventStatus = PersonEventStatusEnum.Cancelled;
                        personEventEntity.AssignedToUserId = null;
                        entity.ClaimStatus = ClaimStatusEnum.Cancelled;
                        entity.Description = "This person event cancelled before creating claim";
                        _claimWorkflowRepository.Create(entity);
                        break;
                    case PersonEventStatusEnum.Closed:
                        personEventEntity.PersonEventStatus = PersonEventStatusEnum.Closed;
                        personEventEntity.AssignedToUserId = null;
                        entity.ClaimStatus = ClaimStatusEnum.Closed;
                        entity.Description = action.FraudulentCase.HasValue ? "Fraudulent Claim" : "This person event closed before creating claim";
                        _claimWorkflowRepository.Create(entity);
                        break;
                    case PersonEventStatusEnum.PendingInvestigations:
                        personEventEntity.PersonEventStatus = PersonEventStatusEnum.PendingInvestigations;
                        personEventEntity.AssignedToUserId = null;
                        entity.AssignedToUserId = null;
                        entity.WorkPool = WorkPoolEnum.Investigationpool;
                        entity.ClaimStatus = ClaimStatusEnum.PendingInvestigations;
                        entity.StartDateTime = null;
                        entity.EndDateTime = null;
                        entity.Description = "VOPD found an issue with Id number";
                        _claimWorkflowRepository.Create(entity);
                        break;
                    case PersonEventStatusEnum.InvestigationsCompleted:
                        personEventEntity.PersonEventStatus = PersonEventStatusEnum.InvestigationsCompleted;
                        personEventEntity.AssignedToUserId = personEventEntity.CapturedByUserId;
                        entity.AssignedToUserId = personEventEntity.CapturedByUserId;
                        entity.WorkPool = WorkPoolEnum.FuneralClaimspool;
                        entity.ClaimStatus = ClaimStatusEnum.InvestigationCompleted;
                        entity.StartDateTime = personEventEntity.AssignedDate;
                        entity.EndDateTime = null;
                        entity.Description = action.FraudulentCase.HasValue ? "Fraudulent Case" : "Not Fraudulent Case";
                        _claimWorkflowRepository.Create(entity);
                        break;
                    case PersonEventStatusEnum.Open:
                        personEventEntity.PersonEventStatus = PersonEventStatusEnum.Open;
                        personEventEntity.AssignedToUserId = personEventEntity.CapturedByUserId;
                        entity.AssignedToUserId = personEventEntity.CapturedByUserId;
                        entity.WorkPool = WorkPoolEnum.FuneralClaimspool;
                        entity.EndDateTime = null;
                        entity.Description = action.FraudulentCase.HasValue ? "Not Fraudulent Case" : "Open case";
                        entity.ClaimStatus = ClaimStatusEnum.Reopened;
                        _claimWorkflowRepository.Create(entity);
                        break;
                }

                if (claimNoteEntity != null)
                {
                    claimNoteEntity.PersonEventStatus = personEventEntity.PersonEventStatus;
                    claimNoteEntity.ClaimId = null;
                    this._claimNoteRepository.Update(claimNoteEntity);
                }

                if (action.FraudulentCase.HasValue && action.PersonEventStatus == PersonEventStatusEnum.Closed)
                {
                    await _noteService.AddNote(new Note
                    {
                        ItemId = action.ItemId,
                        ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                        Text = "Fraudulent Case",
                        Reason = "Fraudulent Case"
                    });
                }

                _personEventRepository.Update(personEventEntity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                switch (action.PersonEventStatus)
                {
                    case PersonEventStatusEnum.Cancelled:
                        if (action.CancellationReason != ClaimCancellationReasonEnum.Duplicateclaim)
                        {
                            claimEmailAction.ActionType = "Claim cancel letter";
                            await ClaimActionEmailNotification(claimEmailAction);
                        }

                        break;
                    case PersonEventStatusEnum.Closed:
                        claimEmailAction.ActionType = "Claim closed letter";
                        await ClaimActionEmailNotification(claimEmailAction);
                        break;
                }
            }
        }

        public async Task ProcessPaymentSuccess(int claimId, int claimInvoiceId, ClaimTypeEnum? claimTypeId)
        {
            //TODO this status is paid only when total of invoice allocation is equal to claim invoice
            // All invoice allocations with claimInvoiceId should be the total sum of the claimInvoiceAmount
            if (claimTypeId == ClaimTypeEnum.Funeral)
            {
                await UpdateStatus(new Action
                {
                    ItemId = claimId,
                    Status = ClaimStatusEnum.Paid,
                    UserId = null
                });
            }

            if (claimInvoiceId > 0)
                await _claimInvoiceService.UpdateClaimInvoiceStatus(claimInvoiceId, ClaimInvoiceStatus.Paid);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claimDetails = await GetClaim(claimId);
                var claimCalculatedAmount = await _claimsCalculatedRepository.Where(t => t.ClaimId == claimId).FirstOrDefaultAsync();

                if (claimCalculatedAmount.OutstandingPremiumAmount > 0)
                {
                    try
                    {

                        var policy = await _policyService.GetPolicyWithoutReferenceData(claimDetails.PolicyId.Value);

                        var coverType = await _productOptionService.GetCoverTypeByProductOptionId(policy.ProductOptionId);

                        var accountNumber = "";

                        accountNumber = (coverType.DisplayAttributeValue().Contains("Goldwage")) ? await _configurationService.GetModuleSetting(SystemSettings.NonCoidBankAccount)
                            : await _configurationService.GetModuleSetting(SystemSettings.CoidBankAccount);

                        await _interBankTransferService.TransferPremiumPayableFromClaim(claimDetails.PolicyId.Value, claimCalculatedAmount.OutstandingPremiumAmount, accountNumber);
                    }
                    catch (Exception ex)
                    {
                        ex.LogException();
                    }
                }
            }
        }

        public async Task<bool> RecallPayment(ClaimInvoice claimInvoice)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var paymentAllocation = await _paymentAllocationService.GetAllocationsByInvoiceAllocationId(claimInvoice.ClaimInvoiceId);
                if (paymentAllocation != null)
                {
                    var paymentList = new List<FinCare.Contracts.Entities.Payments.Payment>();
                    var payment = await _paymentService.GetById((int)paymentAllocation.PaymentId);
                    if (payment.PaymentStatus == PaymentStatusEnum.Pending)
                    {
                        paymentList.Add(payment);
                        await _paymentService.PaymentRecall(paymentList);
                        if (payment.ClaimType == ClaimTypeEnum.Funeral)
                        {
                            await UpdateStatus(new Action
                            {
                                ItemId = claimInvoice.ClaimId,
                                UserId = RmaIdentity.UserId,
                                Status = ClaimStatusEnum.AwaitingDecision
                            });
                        }
                    }

                    var invoice = await _claimInvoiceRepository.FindByIdAsync(claimInvoice.ClaimInvoiceId);
                    invoice.ClaimInvoiceStatusId = (int)InvoiceStatusEnum.PaymentRecalled;
                    _claimInvoiceRepository.Update(invoice);
                    await scope.SaveChangesAsync().ConfigureAwait(false);

                    return true;
                }
                else
                {
                    return false;
                }

            }
        }

        public async Task<ValidationResult> SubmitInvoicePayment(ClaimInvoice claimInvoice)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                Contract.Requires(claimInvoice != null);

            try
            {
                using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
                {
                    var claim = await _claimRepository.FindByIdAsync(claimInvoice.ClaimId);
                    var personEvent = await _personEventRepository.FindByIdAsync(claim.PersonEventId);

                    RolePlayer payee = claimInvoice.PayeeRolePlayerId.HasValue ? await _rolePlayerService.GetRolePlayer(claimInvoice.PayeeRolePlayerId.Value) : null;
                    switch (claimInvoice.ClaimInvoiceType)
                    {
                        case ClaimInvoiceTypeEnum.WLSAward:
                            var widowLumpsumInvoice = await _claimInvoiceService.GetWidowLumpSumInvoice(claimInvoice.ClaimInvoiceId);
                            payee = payee == null ? await _rolePlayerService.GetRolePlayer(widowLumpsumInvoice.PayeeRolePlayerId.Value) : payee;
                            break;
                        case ClaimInvoiceTypeEnum.DaysOffInvoice:
                            var ttdInvoice = await _claimInvoiceService.GetDaysOffInvoiceInvoice(claimInvoice.ClaimInvoiceId);
                            payee = payee == null ? payee = await _rolePlayerService.GetRolePlayer(ttdInvoice.PayeeRolePlayerId.Value) : payee;
                            break;
                        case ClaimInvoiceTypeEnum.SundryInvoice:
                            var sundryInvoice = await _claimInvoiceService.GetSundryInvoice(claimInvoice.ClaimInvoiceId);
                            payee = payee == null ? payee = await _rolePlayerService.GetRolePlayer(sundryInvoice.PayeeRolePlayerId.Value) : payee;
                            break;
                        case ClaimInvoiceTypeEnum.FuneralExpenses:
                            var funeralExpenses = await _claimInvoiceService.GetFuneralExpenseInvoice(claimInvoice.ClaimInvoiceId);
                            payee = payee == null ? await _rolePlayerService.GetRolePlayer(funeralExpenses.PayeeRolePlayerId.Value) : payee;
                            break;
                        case ClaimInvoiceTypeEnum.PDAward:
                            var pdAward = await _claimInvoiceService.GetPDAward(claimInvoice.ClaimInvoiceId);
                            payee = payee == null ? await _rolePlayerService.GetRolePlayer(pdAward.PayeeId) : payee;
                            break;
                        case ClaimInvoiceTypeEnum.TravelAward:
                            var travelInvoice = await _claimInvoiceService.GetTravelInvoice(claimInvoice.ClaimInvoiceId);
                            payee = payee == null ? await _rolePlayerService.GetRolePlayer(travelInvoice.PayeeRolePlayerId.Value) : payee;
                            break;
                    }

                    if (payee.RolePlayerBankingDetails?.Count < 1)
                    {
                        return new ValidationResult()
                        {
                            EmitDate = DateTime.Now,
                            Result = false,
                            Message = new List<string>() { $"Banking details do not exist for the specified payee: {payee.DisplayName}. Please ensure the details are captured correctly." }
                        };
                    }

                    var invoiceAllocation = new InvoiceAllocation // not required at all
                    {
                        ClaimInvoiceId = claimInvoice.ClaimInvoiceId,
                        BeneificaryRolePlayerId = payee.RolePlayerId,
                        AssessedAmount = claimInvoice.InvoiceAmount,
                        AssessedVat = 0,
                        PaymentMethod = PaymentMethodEnum.EFT,
                        PercentAllocation = 100,
                        AllocationGroup = 0,
                        InvoiceAllocationStatusId = 1,
                        InvoiceTypeId = (int)claimInvoice.ClaimInvoiceType,
                        RolePlayerBankingId = claimInvoice.PayeeRolePlayerBankAccountId == null ? payee.RolePlayerBankingDetails[0].RolePlayerBankingId : claimInvoice.PayeeRolePlayerBankAccountId.Value
                    };

                    FinCare.Contracts.Entities.Payments.Payment payment = new FinCare.Contracts.Entities.Payments.Payment();

                    var policy = await _policyService.GetPolicy(claim.PolicyId.Value);

                    var coverType = await _productOptionService.GetCoverTypeByProductOptionId(policy.ProductOptionId);
                    payment.SenderAccountNo = await _configurationService.GetModuleSetting(SystemSettings.CoidBankAccount); // handled on fincare not to be set here
                    payment.Product = policy.ProductOption.Code;

                    if (coverType.DisplayAttributeValue().Contains("Individual")) // set but use the payee roleplayeridentificationtype
                    {
                        payment.ClientType = ClientTypeEnum.Individual; // set this 
                        payment.Branch = await _configurationService.GetModuleSetting(SystemSettings.PaymentManagerFuneralIndividualBranch);// dont set this
                    }
                    else
                    {

                        payment.Branch = await _configurationService.GetModuleSetting(SystemSettings.PaymentManagerFuneralGroupBranch);

                        if (coverType.DisplayAttributeValue().Contains("Group"))
                        {
                            payment.ClientType = ClientTypeEnum.Group;

                        }
                        else if (coverType.DisplayAttributeValue().Contains("Corporate"))
                        {
                            payment.ClientType = ClientTypeEnum.Corporate;

                        }

                    }

                    var payeeBankingDetail = !claimInvoice.PayeeRolePlayerBankAccountId.HasValue ? payee.RolePlayerBankingDetails[0] : await _rolePlayerService.GetBankDetailByBankAccountId(claimInvoice.PayeeRolePlayerBankAccountId.Value);
                    // Assigning account types
                    switch (payeeBankingDetail.BankAccountType) // remove this
                    {
                        case BankAccountTypeEnum.CurrentAccount:
                        case BankAccountTypeEnum.ChequeAccount:
                        case BankAccountTypeEnum.SavingsAccount:
                        case BankAccountTypeEnum.TransmissionAccount:
                        case BankAccountTypeEnum.BondAccount:
                            payment.BankAccountType = payeeBankingDetail.BankAccountType;
                            break;
                        default:
                            const string rejectionReason = "Unsupported Bank Account Type";
                            await ProcessBankingDetailRejectionAsync(claimInvoice.ClaimId, rejectionReason, personEvent.ClaimType);
                            throw new BusinessException(rejectionReason);
                    }

                    var bankBranch = await _bankBranchService.GetBankBranch(payeeBankingDetail.BankBranchId);
                    var bank = await _bankService.GetBank(bankBranch.BankId);
                    var bankName = bank.Name;
                    var bankBranchNumber = bankBranch.Code;

                    payment.AccountNo = payeeBankingDetail.AccountNumber;
                    payment.Amount = claimInvoice.InvoiceAmount;
                    payment.Bank = bankName;
                    payment.BankBranch = bankBranchNumber;
                    payment.ClaimReference = claim.ClaimReferenceNumber;
                    payment.PaymentType = PaymentTypeEnum.Claim;
                    payment.PolicyId = policy.PolicyId;
                    payment.PolicyReference = policy.PolicyNumber;
                    payment.PaymentStatus = PaymentStatusEnum.Pending;
                    payment.Payee = payee.DisplayName;
                    payment.PayeeId = payee.RolePlayerId;
                    payment.ClaimId = claimInvoice.ClaimId;
                    payment.ClaimType = ClaimTypeEnum.IODCOID; // cant be ard coded must read from the product option then mapped and set
                    payment.IsDebtorCheck = false;
                    payment.IsForex = false;
                    payment.PaymentMethod = PaymentMethodEnum.EFT;
                    payment.IsReversed = false;
                    payment.ClaimInvoiceId = claimInvoice.ClaimInvoiceId;
                    if (await _configurationService.IsFeatureFlagSettingEnabled(_abilityPostingWithBranch)) // Funeral Only
                    {
                        if (policy != null)
                        {
                            var brokerPartnership = await _representativeService.GetBrokerPartnership(policy.BrokerageId);
                            if (brokerPartnership != null)
                            {
                                payment.Branch = brokerPartnership.Branch.ToString();
                                payment.Company = brokerPartnership.Company.ToString();
                            }
                        }
                    }

                    var paymentId = await _paymentCreatorService.CreatePaymentWithAllocations(payment);
                    var invoiceAllocationId = await CreateInvoiceAllocation(invoiceAllocation);

                    //Update invoice status if payment requested
                    var invoice = await _claimInvoiceRepository.FindByIdAsync(claimInvoice.ClaimInvoiceId);
                    invoice.ClaimInvoiceStatusId = (int)ClaimInvoiceStatus.PaymentRequested;
                    _claimInvoiceRepository.Update(invoice);

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when submiting {claimInvoice.ClaimInvoiceType.DisplayAttributeValue()} for payment - Error Message {ex.Message}");
            }

            return new ValidationResult()
            {
                EmitDate = System.DateTime.Now,
                Result = true,
                Message = new List<string>() { "Success" }
            };
        }

        public async Task SubmitMultipleInvoicePayments(List<ClaimInvoice> claimInvoices)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                Contract.Requires(claimInvoices != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                foreach (var claimInvoice in claimInvoices)
                {
                    await SubmitInvoicePayment(claimInvoice);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task AuthorizedPayment(List<ClaimInvoice> claimInvoices)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ApprovePayment);

            foreach (var claimInvoice in claimInvoices)
            {
                foreach (var allocation in claimInvoice.InvoiceAllocations)
                {
                    //var clean = await UpdateClaimInvoice(claimInvoice);
                    using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
                    {
                        //====GetClaim beneficairy and bank account
                        var beneficiaryId = claimInvoice.InvoiceAllocations.Select(a => a.BeneificaryRolePlayerId)
                            .FirstOrDefault();
                        var rolePlayerBankId = allocation.RolePlayerBankingId;

                        var beneficiaryAndBankDetail = await GetBeneficiaryAndBankAccountById(beneficiaryId, rolePlayerBankId);

                        FinCare.Contracts.Entities.Payments.Payment payment = new FinCare.Contracts.Entities.Payments.Payment();

                        var policy = await _policyService.GetPolicyWithoutReferenceData(claimInvoice.PolicyId);

                        var coverType = await _productOptionService.GetCoverTypeByProductOptionId(policy.ProductOptionId);

                        if (coverType == CoverTypeEnum.GoldWage)
                        {
                            payment.Product = ClientTypeEnum.Goldwage.DisplayDescriptionAttributeValue();
                            payment.ClientType = ClientTypeEnum.Goldwage;
                            payment.Branch = 1.ToString();
                            payment.SenderAccountNo = await _configurationService.GetModuleSetting(SystemSettings.NonCoidBankAccount);
                        }
                        else
                        {
                            payment.SenderAccountNo = await _configurationService.GetModuleSetting(SystemSettings.CoidBankAccount);
                            if (coverType.DisplayAttributeValue().Contains("Individual"))
                            {
                                payment.Product = ClientTypeEnum.Individual.DisplayDescriptionAttributeValue();
                                payment.ClientType = ClientTypeEnum.Individual;
                                payment.Branch = await _configurationService.GetModuleSetting(SystemSettings.PaymentManagerFuneralIndividualBranch);
                            }
                            else
                            {

                                payment.Branch = await _configurationService.GetModuleSetting(SystemSettings.PaymentManagerFuneralGroupBranch);

                                if (coverType.DisplayAttributeValue().Contains("Group"))
                                {
                                    payment.Product = ClientTypeEnum.Group.DisplayDescriptionAttributeValue();
                                    payment.ClientType = ClientTypeEnum.Group;

                                }
                                else if (coverType.DisplayAttributeValue().Contains("Corporate"))
                                {
                                    payment.Product = ClientTypeEnum.Corporate.DisplayDescriptionAttributeValue();
                                    payment.ClientType = ClientTypeEnum.Corporate;

                                }

                            }

                        }

                        // Assigning account types
                        switch (beneficiaryAndBankDetail.RolePlayerBankAccount.BankAccountType)
                        {
                            case BankAccountTypeEnum.CurrentAccount:
                            case BankAccountTypeEnum.ChequeAccount:
                            case BankAccountTypeEnum.SavingsAccount:
                            case BankAccountTypeEnum.TransmissionAccount:
                            case BankAccountTypeEnum.BondAccount:
                                payment.BankAccountType = beneficiaryAndBankDetail.RolePlayerBankAccount.BankAccountType;
                                break;
                            default:
                                const string rejectionReason = "Unsupported Bank Account Type";
                                await ProcessBankingDetailRejectionAsync(claimInvoice.ClaimId, rejectionReason, ClaimTypeEnum.Funeral);
                                throw new BusinessException(rejectionReason);
                        }

                        payment.AccountNo = beneficiaryAndBankDetail.RolePlayerBankAccount.AccountNumber;
                        payment.Amount = claimInvoice.ClaimAmount.GetValueOrDefault();
                        payment.Bank = beneficiaryAndBankDetail.RolePlayerBankAccount.BankName;
                        payment.BankBranch = beneficiaryAndBankDetail.RolePlayerBankAccount.BranchCode;
                        payment.ClaimReference = claimInvoice.ClaimReferenceNumber;
                        payment.IdNumber = beneficiaryAndBankDetail.IdNumber;
                        payment.EmailAddress = beneficiaryAndBankDetail.Email;
                        payment.PaymentType = PaymentTypeEnum.Claim;
                        payment.PolicyId = claimInvoice.PolicyId;
                        payment.PolicyReference = claimInvoice.PolicyNumber;
                        payment.PaymentStatus = PaymentStatusEnum.Submitted;
                        if (await _configurationService.IsFeatureFlagSettingEnabled(_payeeDetails131378))
                        {
                            payment.Payee = beneficiaryAndBankDetail.RolePlayerBankAccount.AccountHolderName;
                        }
                        else
                        {
                            payment.Payee = beneficiaryAndBankDetail.Firstname + " " + beneficiaryAndBankDetail.Lastname;
                        }

                        payment.PayeeId = beneficiaryId;
                        payment.ClaimId = claimInvoice.ClaimId;
                        payment.ClaimType = ClaimTypeEnum.Funeral;
                        payment.IsDebtorCheck = false;
                        payment.PaymentMethod = PaymentMethodEnum.EFT;
                        payment.IsReversed = false;
                        payment.ClaimInvoiceId = claimInvoice.ClaimInvoiceId;
                        if (await _configurationService.IsFeatureFlagSettingEnabled(CompanyNumberOnPayment118728))
                            payment.Company = await _configurationService.GetModuleSetting(SystemSettings.PaymentManagerFuneralCompanyCode);

                        int paymentId = 0;
                        try
                        {
                            if (await _configurationService.IsFeatureFlagSettingEnabled(_abilityPostingWithBranch))
                            {
                                if (policy != null)
                                {
                                    var brokerPartnership = await _representativeService.GetBrokerPartnership(policy.BrokerageId);
                                    if (brokerPartnership != null)
                                    {
                                        payment.Branch = brokerPartnership.Branch.ToString();
                                        payment.Company = brokerPartnership.Company.ToString();
                                    }
                                }
                            }

                            paymentId = await _paymentCreatorService.CreatePaymentWithAllocations(payment);
                            var claimsCalculatedAmount = await GetClaimsCalculatedAmountByClaimId(payment.ClaimId.Value);
                            if (paymentId > 0 && claimsCalculatedAmount.RefundAmount > 0)
                            {
                                var rolePlayerPolicy = await _rolePlayerPolicyService.GetRolePlayerPolicy(payment.PolicyId.Value);
                                var rolePlayer = await _rolePlayerService.GetRolePlayerWithoutReferenceData(rolePlayerPolicy.PolicyOwnerId);
                                var finPaye = await _rolePlayerService.GetFinPayeeByRolePlayerId(rolePlayerPolicy.PolicyOwnerId);
                                var refund = new Refund
                                {
                                    FinPayeNumber = finPaye.FinPayeNumber,
                                    PeriodStatus = PeriodStatusEnum.Current,
                                    RefundAmount = claimsCalculatedAmount.RefundAmount,
                                    RefundDate = DateTimeHelper.SaNow,
                                    RefundReason = RefundReasonEnum.ClaimPayout,
                                    Trigger = RefundTypeEnum.ClaimPayout,
                                    RolePlayerId = rolePlayerPolicy.PolicyPayeeId,
                                    RolePlayerName = rolePlayer.DisplayName,
                                    Note = new Note { Text = RefundReasonEnum.ClaimPayout.GetDescription() }
                                };
                                await _billingTransactionService.CreateRefund(refund);

                                var note = new Billing.Contracts.Entities.BillingNote
                                {
                                    ItemId = refund.RolePlayerId,
                                    ItemType = "Refund",
                                    Text = refund.Note.Text
                                };
                                await _billingService.AddBillingNote(note);
                            }
                        }
                        catch (Exception ex)
                        {
                            ex.LogException();
                        }

                        //=====Update ClaimInvoice=============//
                        var entity = await _claimInvoiceRepository.FindByIdAsync(claimInvoice.Id);
                        entity.InvoiceAmount = Convert.ToDecimal(claimInvoice.ClaimAmount);
                        entity.AuthorisedAmount = Convert.ToDecimal(claimInvoice.ClaimAmount);
                        entity.ClaimInvoiceDecision = claimInvoice.Decision;
                        entity.IsBankingApproved = claimInvoice.IsBankingApproved;
                        entity.IsAuthorised = 1;
                        _claimInvoiceRepository.Update(entity);

                        var funeralInvoice = await _funeralInvoiceRepository.FindByIdAsync(claimInvoice.Id);
                        funeralInvoice.ClaimInvoiceDecision = claimInvoice.Decision;
                        _funeralInvoiceRepository.Update(funeralInvoice);

                        await scope.SaveChangesAsync().ConfigureAwait(false);

                    }
                }
            }
        }

        public async Task<bool> AuthorizeTracerPayment(ClaimTracerInvoice claimTracerInvoice)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ApproveTracerPayment);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                claimTracerInvoice.TracerInvoiceId = await CreateClaimsTracerInvoice(claimTracerInvoice);

                await UpdateTracingFee(claimTracerInvoice.ClaimId, Convert.ToDecimal(claimTracerInvoice.TracingFee));
                var claimDetails = await GetClaim(claimTracerInvoice.ClaimId);
                var policy = await _policyService.GetPolicyWithoutReferenceData(claimDetails.PolicyId.Value);

                var beneficiaryAndBankDetail = await GetBeneficiaryAndBankAccountById(claimTracerInvoice.RolePlayerId, claimTracerInvoice.BankAccountId.GetValueOrDefault());
                var currentDate = DateTimeHelper.SaNow.Date;

                var claimPaymentRequestMsg = new ClaimPaymentRequestMessage()
                {
                    ClaimId = claimTracerInvoice.ClaimId,
                    BeneficiaryId = claimTracerInvoice.RolePlayerId,
                    Payee = beneficiaryAndBankDetail.Firstname + " " + beneficiaryAndBankDetail.Lastname,
                    AccountNo = beneficiaryAndBankDetail.RolePlayerBankAccount.AccountNumber,
                    Amount = claimTracerInvoice.TracingFee.GetValueOrDefault(),
                    Product = "",
                    Bank = beneficiaryAndBankDetail.RolePlayerBankAccount.BankName,
                    BankBranch = beneficiaryAndBankDetail.RolePlayerBankAccount.BranchCode,
                    PolicyReference = policy.PolicyNumber,
                    ClaimReference = claimDetails.ClaimReferenceNumber,
                    EmailAddress = beneficiaryAndBankDetail.Email,
                    PolicyId = claimDetails.PolicyId.Value,
                    IdNumber = beneficiaryAndBankDetail.IdNumber
                };

                claimPaymentRequestMsg.ClientType = ClientTypeEnum.Individual;

                // Assigning account types
                switch (beneficiaryAndBankDetail.RolePlayerBankAccount.BankAccountType)
                {
                    case BankAccountTypeEnum.CurrentAccount:
                    case BankAccountTypeEnum.ChequeAccount:
                    case BankAccountTypeEnum.SavingsAccount:
                    case BankAccountTypeEnum.TransmissionAccount:
                    case BankAccountTypeEnum.BondAccount:
                        claimPaymentRequestMsg.AccountType =
                            (int)beneficiaryAndBankDetail.RolePlayerBankAccount.BankAccountType;
                        break;
                    default:
                        const string rejectionReason = "Unsupported Bank Account Type";
                        await ProcessTracerBankingDetailRejectionAsync(claimTracerInvoice.TracerInvoiceId, rejectionReason);
                        throw new BusinessException(rejectionReason);
                }

                //var product = await _productService.GetProduct(claimInvoice.ProductId.GetValueOrDefault());
                //TODO - remove product id 17
                var productOption = await _productOptionService.GetProductOption(policy.ProductOptionId);
                var product = await _productService.GetProduct(productOption.ProductId);
                FinCare.Contracts.Entities.Payments.Payment payment = new FinCare.Contracts.Entities.Payments.Payment();
                payment.AccountNo = claimPaymentRequestMsg.AccountNo;
                payment.Amount = claimPaymentRequestMsg.Amount;
                payment.Bank = claimPaymentRequestMsg.Bank;
                payment.BankAccountType = beneficiaryAndBankDetail.RolePlayerBankAccount.BankAccountType;
                payment.BankBranch = claimPaymentRequestMsg.BankBranch;
                payment.Branch = claimPaymentRequestMsg.BankBranch;
                payment.ClaimReference = claimPaymentRequestMsg.ClaimReference;
                payment.ClientType = claimPaymentRequestMsg.ClientType;
                payment.IdNumber = claimPaymentRequestMsg.IdNumber;
                payment.EmailAddress = claimPaymentRequestMsg.EmailAddress;
                payment.PaymentType = PaymentTypeEnum.TracingFee;
                payment.PolicyId = claimPaymentRequestMsg.PolicyId;
                payment.PolicyReference = claimPaymentRequestMsg.PolicyReference;
                payment.Product = claimPaymentRequestMsg.Product;
                payment.PaymentStatus = PaymentStatusEnum.Submitted;
                payment.Payee = beneficiaryAndBankDetail.Firstname + " " + beneficiaryAndBankDetail.Lastname;
                payment.PayeeId = claimPaymentRequestMsg.BeneficiaryId;
                payment.Product = product.Code;
                payment.ClaimId = claimPaymentRequestMsg.ClaimId;
                payment.ClaimType = ClaimTypeEnum.Funeral;
                payment.PaymentMethod = PaymentMethodEnum.EFT;
                payment.IsReversed = false;
                var paymentResult = await _paymentCreatorService.Create(payment);

                //=====Update TracerInvoice=============//
                var entity = await _tracerInvoiceRepository.FindByIdAsync(claimTracerInvoice.TracerInvoiceId);
                entity.PaymentStatus = (int)PaymentStatusEnum.Submitted;
                entity.PaymentId = paymentResult;
                _tracerInvoiceRepository.Update(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
                return true;
            }
        }

        public async Task<int> UpdateClaimIsRuleOverridden(int claimId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditClaim);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var claim = await _claimRepository.FirstOrDefaultAsync(c => c.ClaimId == claimId);
                claim.IsRuleOverridden = true;
                _claimRepository.Update(claim);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return claim.ClaimId;
            }
        }

        public async Task UpdateClaimWithWorkPool(int claimId, int personEventId, WorkPoolEnum workPool, int wizardId, int claimStatusId, int? userId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditClaim);

            if (claimId == 0)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var result = await _personEventRepository.FindByIdAsync(personEventId);

                    result.AssignedToUserId = userId;
                    result.AssignedDate = DateTime.Now.ToSaDateTime();
                    _personEventRepository.Update(result);

                    var claimWorkFlows = await _claimWorkflowRepository
                       .Where(t => t.PersonEventId == personEventId && t.EndDateTime == null && t.Description == "VOPD found an issue with Id number").ToListAsync();
                    foreach (var claimWorkFlow in claimWorkFlows)
                    {
                        claimWorkFlow.AssignedToUserId = userId;
                        claimWorkFlow.StartDateTime = DateTimeHelper.SaNow;
                        _claimWorkflowRepository.Update(claimWorkFlow);
                    }

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
            else
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var result = await _claimRepository.FindByIdAsync(claimId);

                    result.AssignedToUserId = userId;
                    _claimRepository.Update(result);

                    //==== Update RAG table or insert
                    List<claim_ClaimWorkflow> ragResult = await _claimWorkflowRepository
                        .Where(t => t.ClaimId == claimId && t.EndDateTime == null).ToListAsync();

                    if (ragResult != null && ragResult.Count > 0)
                    {
                        foreach (claim_ClaimWorkflow claimWorkflow in ragResult)
                        {
                            claimWorkflow.EndDateTime = DateTimeHelper.SaNow;
                            _claimWorkflowRepository.Update(claimWorkflow);
                        }
                    }

                    var entity = new claim_ClaimWorkflow
                    {
                        AssignedToUserId = userId,
                        ClaimId = claimId,
                        WorkPool = workPool == 0 ? WorkPoolEnum.IndividualAssessorpool : workPool,
                        StartDateTime = DateTimeHelper.SaNow,
                        WizardId = wizardId,
                        ClaimStatus = (ClaimStatusEnum)claimStatusId
                    };
                    _claimWorkflowRepository.Create(entity);

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        public async Task ReAllocateEventToAssessor(int eventReference, string eventCreatedBy, int wizardId, string userName, WorkPoolEnum workPool, int claimStatusId, int? userId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditEvent);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var personEvent = await _personEventRepository.Where(t => t.PersonEventId == eventReference).SingleOrDefaultAsync();
                var eventResult = await _eventRepository.Where(t => t.EventId == personEvent.EventId).SingleOrDefaultAsync();

                personEvent.AssignedToUserId = userId;
                personEvent.AssignedDate = DateTime.Now.ToSaDateTime();
                _personEventRepository.Update(personEvent);

                ////==== Update RAG table or insert
                //var ragResult = await _ragStatusRepository
                //    .Where(t => t.WorkItemId == claimId && t.EndDateAndTime == null).SingleOrDefaultAsync();

                //if (ragResult != null)
                //{
                //    ragResult.EndDateAndTime = DateTimeHelper.SaNow;
                //    _ragStatusRepository.Update(ragResult);
                //}

                //var entity = new claim_RagStatu
                //{
                //    UserId = userId,
                //    WorkItemId = claimId,
                //    WorkPool = workPool == 0 ? WorkPoolEnum.IndividualAssessor : workPool,
                //    StartDateAndTime = DateTimeHelper.SaNow
                //};
                //_ragStatusRepository.Create(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

            await _wizardService.UpdateWizardLockedToUser(wizardId, userId.Value);
        }

        public async Task ProcessPayeeDetailRejection(int claimId, string reason)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ProcessPayee);

            var claimDetails = await GetClaim(claimId);

            if (claimDetails.ClaimStatus != ClaimStatusEnum.Tracing && claimDetails.ClaimStatus != ClaimStatusEnum.Unclaimed)
            {

                //Add reason to note
                await AddClaimNote(new ClaimNote
                {
                    ClaimId = claimId,
                    Text = reason,
                });

                await UpdateStatus(new Action
                {
                    ItemId = claimId,
                    Status = ClaimStatusEnum.Unpaid,
                    UserId = null
                });
            }
        }

        public async Task<PersonEvent> DuplicateClaimCheck(PersonEvent newPersonEvent)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var passed = true;
                var messageList = new Dictionary<int, string>();

                // Getting all the policies linked to an insuredLife id
                var currentPolicies =
                    await _rolePlayerService.GetAllPoliciesByInsureLifeId(newPersonEvent.InsuredLifeId);

                foreach (var currentPolicy in currentPolicies)
                {
                    // Checking if any claims exist with any of the policy ids
                    var currentClaims = await _claimRepository.Where(c => c.PolicyId == currentPolicy.PolicyId)
                        .ToListAsync();

                    if (!currentClaims.Any())
                    {
                        passed = true;
                    }

                    var numberOfStillbirths = 0;
                    var saveMessages = false;
                    var messageKey = 0;

                    if (newPersonEvent.PersonEventDeathDetail.DeathType == DeathTypeEnum.Stillborn)
                    {
                        foreach (var currentClaim in currentClaims)
                        {
                            var currentPersonEvent =
                                await _personEventRepository.FirstOrDefaultAsync(p =>
                                    p.PersonEventId == currentClaim.PersonEventId);
                            var personEventDeathDetail =
                                await _eventService.GetPersonEventDeathDetail(currentClaim.PersonEventId);
                            if (personEventDeathDetail.DeathType == DeathTypeEnum.Stillborn)
                            {
                                numberOfStillbirths++;
                            }
                        }

                        if (numberOfStillbirths >= 2)
                        {
                            saveMessages = true;
                            messageList.Add(messageKey++, $"Limit of 2 stillborns reached");
                        }
                    }

                    foreach (var currentClaim in currentClaims)
                    {
                        if (saveMessages)
                        {
                            passed = false;
                        }

                        var policyId = new List<int>() { currentPolicy.PolicyId };
                        //Getting all the current details linked to the currentPolicy
                        var currentPersonEvent =
                            await _personEventRepository.FirstOrDefaultAsync(a =>
                                a.PersonEventId == currentClaim.PersonEventId);
                        var personEventDeathDetail =
                            await _eventService.GetPersonEventDeathDetail(currentClaim.PersonEventId);
                        var currentRolePlayer =
                            (await _rolePlayerService.GetRolePlayersByPolicyIds(policyId,
                                RolePlayerTypeEnum.InsuredLife)).FirstOrDefault();

                        // Getting the insuredLife details from the new personEvent
                        var newRolePlayer = await _rolePlayerService.GetRolePlayer(newPersonEvent.InsuredLifeId);

                        if (string.Equals(currentRolePlayer.Person.FirstName, newPersonEvent.FirstName,
                                StringComparison.CurrentCultureIgnoreCase)
                            && string.Equals(currentRolePlayer.Person.Surname, newPersonEvent.LastName,
                                StringComparison.CurrentCultureIgnoreCase)
                            && personEventDeathDetail.DeathDate.ToString("yyyy/MM/dd") ==
                            newPersonEvent.PersonEventDeathDetail.DeathDate.ToString("yyyy/MM/dd"))
                        {
                            passed = false;
                            messageList.Add(messageKey++,
                                "Claim has already been registered with the same details: " +
                                currentClaim.ClaimReferenceNumber);
                            continue;
                        }

                        if (!string.IsNullOrEmpty(newRolePlayer.Person.IdNumber)
                            && newRolePlayer.Person.IdType == IdTypeEnum.SAIDDocument
                            && currentClaim.PolicyId == currentPolicy.PolicyId
                            && currentRolePlayer.Person.IdNumber == newRolePlayer.Person.IdNumber)
                        {
                            passed = false;
                            messageList.Add(messageKey++,
                                "Claim has already been registered with the same details: " +
                                currentClaim.ClaimReferenceNumber);
                            continue;
                        }

                        if (string.IsNullOrEmpty(newRolePlayer.Person.IdNumber)
                            && newRolePlayer.Person.IdType == IdTypeEnum.PassportDocument
                            && currentRolePlayer.RolePlayerId == newPersonEvent.InsuredLifeId
                            && personEventDeathDetail.DeathDate == newPersonEvent.PersonEventDeathDetail.DeathDate)
                        {
                            passed = false;
                            messageList.Add(messageKey++,
                                "Claim has already been registered with the same details: " +
                                currentClaim.ClaimReferenceNumber);
                            continue;
                        }

                    }
                }

                newPersonEvent.RuleResult = new FuneralRuleResult
                {
                    RuleName = "Duplicate Claim Rule",
                    Passed = passed,
                    MessageList = messageList,
                };

                return newPersonEvent;
            }
        }

        public async Task ProcessPayoutAmountRejection(int claimId, string reason)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ProcessPayee);

            var claimDetails = await GetClaim(claimId);

            if (claimDetails.ClaimStatus != ClaimStatusEnum.Tracing && claimDetails.ClaimStatus != ClaimStatusEnum.Unclaimed)
            {
                await AddClaimNote(new ClaimNote
                {
                    ClaimId = claimId,
                    Text = reason,
                });

                await UpdateStatus(new Action
                {
                    ItemId = claimId,
                    Status = ClaimStatusEnum.Unpaid,
                    UserId = null
                });
            }
        }

        public async Task ClaimRecovery(int claimId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ProcessClaimRecovery);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _claimInvoiceRepository.Where(c => c.ClaimId == claimId).FirstOrDefaultAsync();
                await _claimInvoiceRepository.LoadAsync(entity, a => a.InvoiceAllocations);
                await _claimInvoiceRepository.LoadAsync(entity, a => a.FuneralInvoice);

                if (entity != null)
                {
                    var funeralInvoice = entity.FuneralInvoice;
                    var invoiceAllocation = entity.InvoiceAllocations.Where(t => t.ClaimInvoiceId == entity.ClaimInvoiceId).FirstOrDefault();

                    entity.IsDeleted = true;
                    funeralInvoice.IsDeleted = true;
                    invoiceAllocation.InvoiceAllocationStatusId = (int)ClaimInvoiceAllocationStatusEnum.Recovery;

                    _funeralInvoiceRepository.Update(funeralInvoice);
                    _claimInvoiceRepository.Update(entity);
                    _invoiceAllocationRepository.Update(invoiceAllocation);

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        public async Task UnpaidClaimTracing(int claimId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditInvoice);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var entity = await _claimInvoiceRepository.Where(c => c.ClaimId == claimId).FirstOrDefaultAsync();
                await _claimInvoiceRepository.LoadAsync(entity, a => a.InvoiceAllocations);
                await _claimInvoiceRepository.LoadAsync(entity, a => a.FuneralInvoice);

                if (entity != null)
                {
                    var funeralInvoice = entity.FuneralInvoice;
                    var invoiceAllocation = entity.InvoiceAllocations.Where(t => t.ClaimInvoiceId == entity.ClaimInvoiceId).FirstOrDefault();

                    entity.IsDeleted = true;
                    funeralInvoice.IsDeleted = true;
                    invoiceAllocation.IsDeleted = true;

                    _funeralInvoiceRepository.Update(funeralInvoice);
                    _claimInvoiceRepository.Update(entity);
                    _invoiceAllocationRepository.Update(invoiceAllocation);

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        public async Task CreateClaimRecovery(ClaimRecovery claimRecovery)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ProcessClaimRecovery);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var claimInvoiceEntity = await _claimInvoiceRepository.Where(c => c.ClaimId == claimRecovery.ClaimId).FirstOrDefaultAsync();
                await _claimInvoiceRepository.LoadAsync(claimInvoiceEntity, a => a.InvoiceAllocations);
                await _claimInvoiceRepository.LoadAsync(claimInvoiceEntity, a => a.FuneralInvoice);

                if (claimInvoiceEntity != null)
                {
                    var funeralInvoice = claimInvoiceEntity.FuneralInvoice;
                    var invoiceAllocation = claimInvoiceEntity.InvoiceAllocations.Where(t => t.ClaimInvoiceId == claimInvoiceEntity.ClaimInvoiceId).FirstOrDefault();
                    var user = await _userService.GetUserByEmail(claimRecovery.RecoveryInvokedBy);

                    var newClaimRecovery = new claim_ClaimsRecovery()
                    {
                        ClaimId = claimRecovery.ClaimId,
                        ClaimNumber = claimRecovery.ClaimNumber,
                        ClaimStatus = claimRecovery.ClaimStatus,
                        IdNumber = claimRecovery.IdNumber,
                        Name = claimRecovery.Name,
                        RecoveryInvokedBy = claimRecovery.RecoveryInvokedBy,
                        RolePlayerBankingId = invoiceAllocation.RolePlayerBankingId.GetValueOrDefault(),
                        RolePlayerId = claimRecovery.RolePlayerId,
                        WorkPool = WorkPoolEnum.IndividualAssessorpool,
                        AssignedToUserId = user.Id,
                        ClaimRecoveryInvoiceId = claimRecovery.ClaimRecoveryInvoiceId,
                        ClaimRecoveryReason = claimRecovery.ClaimRecoveryReason
                    };

                    _claimsRecoveryRepository.Create(newClaimRecovery);
                    await scope.SaveChangesAsync().ConfigureAwait(false);

                    var sendEmail = await ClaimRecoveryEmailNotification(claimRecovery);
                }
            }
        }

        public async Task<bool> ClaimRecoveryEmailNotification(ClaimRecovery claimRecovery)
        {
            int sendEmail = 0;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var recoveryLetterPdf = new MailAttachment();
                var listOfDocument = new List<MailAttachment>();
                var listOfAttachmentIds = new List<int>();

                var claimInvoiceDetails = await _claimInvoiceRepository.Where(c => c.ClaimId == claimRecovery.ClaimId).FirstOrDefaultAsync();
                await _claimInvoiceRepository.LoadAsync(claimInvoiceDetails, a => a.InvoiceAllocations);
                await _claimInvoiceRepository.LoadAsync(claimInvoiceDetails, a => a.FuneralInvoice);

                var funeralInvoice = claimInvoiceDetails.FuneralInvoice;
                var invoiceAllocation = claimInvoiceDetails.InvoiceAllocations.Where(t => t.ClaimInvoiceId == claimInvoiceDetails.ClaimInvoiceId).FirstOrDefault();
                var user = await _userService.GetUserByEmail(claimRecovery.RecoveryInvokedBy);
                var manager = await _userService.GetUsersByRoleName(ClaimsManagerRole);

                var claimDetails = await GetClaim(claimRecovery.ClaimId);
                //var insuredLifeDetails = await _personEventRepository.Where(f => f.PersonEventId == claimDetails.PersonEventId).SingleAsync();
                var policy = await _policyService.GetPolicyWithoutReferenceData(claimDetails.PolicyId.Value);
                //var claimInvoiceDetails = await _claimInvoiceRepository.Where(c => c.ClaimId == claimInvoice.ClaimId).SingleAsync();
                var beneficiaryDetails = await GetBeneficiaryAndBankAccountById(invoiceAllocation.BeneificaryRolePlayerId.Value, invoiceAllocation.RolePlayerBankingId.GetValueOrDefault());
                //var funeralInvoice = await _funeralInvoiceRepository.Where(f => f.ClaimInvoiceId == claimInvoice.Id).FirstOrDefaultAsync();
                var personEventDeathDetail = await _personEventDeathDetail.Where(d => d.PersonEventId == claimDetails.PersonEventId).FirstOrDefaultAsync();
                var personEvent = await _personEventRepository.Where(e => e.PersonEventId == claimDetails.PersonEventId).FirstOrDefaultAsync();
                var lifeAssured = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);
                var claimWorkFlow = await _claimWorkflowRepository.Where(t => t.ClaimStatus == ClaimStatusEnum.Authorised).OrderByDescending(k => k.ClaimWorkflowId).FirstOrDefaultAsync();
                var recoveryDoc = await _documentTemplateService.GetDocumentTemplateByName(DocumentTypeEnum.RMARecoveryLetterofdemand.DisplayAttributeValue());
                listOfAttachmentIds.Add(recoveryDoc.DocumentTypeId);

                //var declineDoc = await _documentTemplateService.GetDocumentTemplateByName(DocumentTypeEnum.ContinuationForm.DisplayAttributeValue());
                //listOfAttachmentIds.Add((int)DocumentTypeEnum.ContinuationForm);
                //var assessorDeclined = await GetAssessorNameDeclined(claimInvoice.ClaimId);
                var documentTemplate = recoveryDoc.DocumentHtml;
                var documentTokens = new Dictionary<string, string>
                {
                    ["{initials}"] = "",
                    ["{title}"] = "",
                    ["{beneficiaryFirstName}"] = beneficiaryDetails.Firstname,
                    ["{beneficiaryLastName}"] = beneficiaryDetails.Lastname,
                    ["{address}"] = beneficiaryDetails.AddressLine1,
                    ["{city}"] = beneficiaryDetails.AddressLine2,
                    ["{postalCode}"] = "",
                    ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy"),
                    ["{policyNumber}"] = policy.PolicyNumber,
                    ["{lifeAssured}"] = lifeAssured.Person.FirstName + " " + lifeAssured.Person.Surname,
                    ["{claimType}"] = "Funeral",
                    ["{dateOfDeath}"] = personEventDeathDetail.DeathDate.ToSaDateTime().ToString(),
                    ["{datePolicyStarted}"] = policy.PolicyInceptionDate.ToSaDateTime().ToString(),
                    ["{startDate}"] = policy.PolicyInceptionDate.ToSaDateTime().ToString(),
                    ["{insuredLife}"] = lifeAssured.Person.FirstName + " " + lifeAssured.Person.Surname,
                    ["{nameOfOverAgePerson}"] = lifeAssured.Person.FirstName + " " + lifeAssured.Person.Surname,
                    ["{assessorNameAndSurname}"] = user.DisplayName,
                    ["{beneficiaryEmail}"] = beneficiaryDetails.Email,
                    ["{claimNumber}"] = claimDetails.PersonEventId.ToString(),
                    ["{datePaid}"] = claimWorkFlow.StartDateTime.GetValueOrDefault().ToString("dd MMM yyyy"),
                    ["{amountPaid}"] = funeralInvoice.CapAmount.ToString(),
                    ["{amountInWords}"] = "",
                    ["{bankAccount}"] = beneficiaryDetails.RolePlayerBankAccount.BankName,
                    ["{accountNumber}"] = beneficiaryDetails.RolePlayerBankAccount.AccountNumber,
                    ["{claimsManager}"] = "",
                };
                foreach (var token in documentTokens)
                {
                    documentTemplate = documentTemplate.Replace($"{token.Key}", token.Value);
                }
                recoveryLetterPdf.AttachmentByteData = await _documentGeneratorService.ConvertHtmlToPdf(documentTemplate);
                recoveryLetterPdf.FileType = recoveryDoc.DocumentMimeType;
                recoveryLetterPdf.FileName = recoveryDoc.DocumentName;

                var mail = new MailAttachment()
                {
                    AttachmentByteData = recoveryLetterPdf.AttachmentByteData,
                    FileName = recoveryLetterPdf.FileName,
                    FileType = recoveryLetterPdf.FileType
                };
                listOfDocument.Add(mail);

                var counter = 0;
                var attachmentMailAttachments = new MailAttachment[listOfDocument.Count];
                foreach (var document in listOfDocument)
                {
                    attachmentMailAttachments[counter] = document;
                    counter++;
                }

                var email = new SendMailRequest()
                {
                    Subject = RecoveryClaimSubject,
                    FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                    Recipients = beneficiaryDetails.Email,
                    Body = documentTemplate,
                    IsHtml = true,
                    Attachments = attachmentMailAttachments,
                    ItemId = claimDetails.ClaimId,
                    ItemType = "Claim"
                };

                sendEmail = await _sendEmailService.SendEmail(email);
            }

            return sendEmail == 200;
        }

        public async Task UpdateClaimRecoveryToRecovered(int claimRecoveryInvoiceId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var claimRecoveryEntity = await _claimsRecoveryRepository.Where(c => c.ClaimRecoveryInvoiceId == claimRecoveryInvoiceId).FirstOrDefaultAsync();

                if (claimRecoveryEntity != null)
                {
                    claimRecoveryEntity.ClaimStatus = ClaimStatusEnum.PaymentRecovered;
                    claimRecoveryEntity.WorkPool = WorkPoolEnum.IndividualAssessorpool;

                    _claimsRecoveryRepository.Update(claimRecoveryEntity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        public async Task ReferRecoveryStatus(ClaimStatusEnum claimStatus, int claimRecoveryId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ProcessClaimRecovery);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var claimRecoveryEntity = await _claimsRecoveryRepository.Where(c => c.ClaimRecoveryId == claimRecoveryId).FirstOrDefaultAsync();

                if (claimRecoveryEntity != null)
                {
                    claimRecoveryEntity.ClaimStatus = claimStatus;
                    claimRecoveryEntity.WorkPool = WorkPoolEnum.IndividualAssessorpool;

                    _claimsRecoveryRepository.Update(claimRecoveryEntity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        public async Task CreateClaimsTracer(ClaimsTracing claimsTracing)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var result = Mapper.Map<claim_ClaimsTracing>(claimsTracing);

                _claimsTracingRepository.Create(result);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<int> CreateClaimsTracerInvoice(ClaimTracerInvoice claimTracerInvoice)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var entity = new claim_TracerInvoice();
                entity.ClaimId = claimTracerInvoice.ClaimId;
                entity.PayDate = claimTracerInvoice.PayDate;
                entity.PaymentStatus = (int)PaymentStatusEnum.Submitted;
                entity.Reason = claimTracerInvoice.Reason;
                entity.RolePlayerId = claimTracerInvoice.RolePlayerId;
                entity.TracingFee = claimTracerInvoice.TracingFee;
                entity.RolePlayerId = claimTracerInvoice.RolePlayerId;

                _tracerInvoiceRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.TracerInvoiceId;
            }
        }

        public async Task<List<ClaimRecovery>> GetAssessorRecoveries(string recoveryInvokedBy)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewRecoveries);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claimRecoveries = await (from claim in _claimRepository
                                             join recovery in _claimsRecoveryRepository on claim.ClaimId equals recovery.ClaimId
                                             where recovery.RecoveryInvokedBy == recoveryInvokedBy && recovery.WorkPool == WorkPoolEnum.IndividualAssessorpool && !recovery.IsDeleted
                                             select new ClaimRecovery()
                                             {
                                                 ClaimRecoveryId = recovery.ClaimRecoveryId,
                                                 ClaimNumber = claim.PersonEventId,
                                                 CreatedBy = recovery.RecoveryInvokedBy,
                                                 CreatedDate = recovery.CreatedDate,
                                                 ClaimId = recovery.ClaimId,
                                                 ClaimStatus = recovery.ClaimStatus,
                                                 RolePlayerId = recovery.RolePlayerId,
                                                 ClaimRecoveryInvoiceId = recovery.ClaimRecoveryInvoiceId
                                             }).ToListAsync();

                foreach (var recovery in claimRecoveries)
                {
                    decimal recoveryAmount = 0;
                    if (recovery.ClaimRecoveryInvoiceId != 0)
                    {
                        var claimRecoveryInvoice = await _invoiceService.GetInvoice(recovery.ClaimRecoveryInvoiceId);
                        recoveryAmount = claimRecoveryInvoice.Amount;

                        recovery.RecoveredAmount = (await _billingInvoiceService.GetRecoveryAllocationsByRecoveryId(recovery.ClaimRecoveryId))?.Sum(a => a.Amount);
                    }
                    var rolePlayer = await _rolePlayerService.GetRolePlayer(recovery.RolePlayerId);
                    recovery.Name = rolePlayer.Person.FirstName;
                    recovery.IdNumber = rolePlayer.Person.IdNumber;
                    recovery.RecoveryAmount = recoveryAmount;
                    recovery.ClaimStatusDisplayName = recovery.ClaimStatus.DisplayAttributeValue();
                }
                return Mapper.Map<List<ClaimRecovery>>(claimRecoveries);
            }
        }

        public async Task<ClaimRecoveryView> GetRecoveryViewDetails(int recoveryId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewRecoveries);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var recovery = await _claimsRecoveryRepository.FirstOrDefaultAsync(r => r.ClaimRecoveryId == recoveryId);
                var claim = await _claimRepository.FirstOrDefaultAsync(c => c.ClaimId == recovery.ClaimId);

                var personEvent = await _personEventRepository.FirstOrDefaultAsync(p => p.PersonEventId == claim.PersonEventId);
                await _personEventRepository.LoadAsync(personEvent, a => a.PersonEventDeathDetail);
                await _personEventRepository.LoadAsync(personEvent, a => a.Event);

                var claimsRecoveryInvoice = await _invoiceService.GetInvoice(recovery.ClaimRecoveryInvoiceId);
                var insuredLife = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);
                var beneficiary = await _rolePlayerService.GetRolePlayer(recovery.RolePlayerId);


                var claimRecoveryView = new ClaimRecoveryView()
                {
                    EventDescription = personEvent.Event.Description,
                    InsuredDeathDate = personEvent.PersonEventDeathDetail.DeathDate,
                    ClaimNumber = claim.PersonEventId,
                    ClaimReferenceNumber = claim.ClaimReferenceNumber,
                    ClaimCreatedDate = claim.CreatedDate,
                    ClaimInvoice = new ClaimInvoice()
                    {
                        DateApproved = claimsRecoveryInvoice.CreatedDate,
                        AuthorisedAmount = claimsRecoveryInvoice.Amount,
                    },
                    Deceased = insuredLife,
                    RecoveryRolePlayer = beneficiary,
                    ClaimId = claim.ClaimId
                };

                return claimRecoveryView;
            }
        }

        public async Task<List<ClaimRecovery>> GetLegalRecoveries(int workPoolId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewRecoveries);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claimRecoveries = await (from claim in _claimRepository
                                             join recovery in _claimsRecoveryRepository on claim.ClaimId equals recovery.ClaimId
                                             where recovery.WorkPool == (WorkPoolEnum)workPoolId
                                             select new ClaimRecovery()
                                             {
                                                 ClaimRecoveryId = recovery.ClaimRecoveryId,
                                                 ClaimNumber = claim.PersonEventId,
                                                 CreatedBy = recovery.RecoveryInvokedBy,
                                                 CreatedDate = recovery.CreatedDate,
                                                 ClaimId = recovery.ClaimId,
                                                 ClaimStatus = recovery.ClaimStatus,
                                                 RolePlayerId = recovery.RolePlayerId,
                                                 ClaimRecoveryInvoiceId = recovery.ClaimRecoveryInvoiceId
                                             }).ToListAsync();

                foreach (var recovery in claimRecoveries)
                {
                    decimal recoveryAmount = 0;
                    if (recovery.ClaimRecoveryInvoiceId != 0)
                    {
                        var claimRecoveryInvoice = await _invoiceService.GetInvoice(recovery.ClaimRecoveryInvoiceId);
                        recoveryAmount = claimRecoveryInvoice.Amount;
                    }
                    var rolePlayer = await _rolePlayerService.GetRolePlayer(recovery.RolePlayerId);
                    recovery.Name = rolePlayer.Person.FirstName;
                    recovery.IdNumber = rolePlayer.Person.IdNumber;
                    recovery.RecoveryAmount = recoveryAmount;
                    recovery.ClaimStatusDisplayName = recovery.ClaimStatus.DisplayAttributeValue();
                }
                return Mapper.Map<List<ClaimRecovery>>(claimRecoveries);
            }
        }

        public async Task<bool> ReferClaimToLegal(int claimRecoveryId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ClaimandLegal);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var claimRecovery = await _claimsRecoveryRepository.Where(c => c.ClaimRecoveryId == claimRecoveryId).SingleAsync();

                claimRecovery.WorkPool = WorkPoolEnum.Legalpool;
                claimRecovery.ClaimStatus = ClaimStatusEnum.LegalRecovery;

                _claimsRecoveryRepository.Update(claimRecovery);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return true;
            }
        }

        public async Task<List<User>> GetClaimManagers()
        {
            return await _userService.GetUsersByRoleName(ClaimsManagerRole);
        }

        public async Task<ValidationResult> ProcessClaimPayment(List<ClaimInvoice> claimInvoices)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ProcessPayee);

            // Does the user belong to the Individual Assessor workpool
            // TODO - Workpool access to user depends on userPermission table
            bool isIndividualAssessor =
                await _workPoolService.IsUserInWorkPool(RmaIdentity.UserId, WorkPoolEnum.IndividualAssessorpool);
            //Does the user belong to the Second Approver workpool
            // TODO - Workpool access to user depends on userPermission table
            bool isSecondApprover =
                await _workPoolService.IsUserInWorkPool(RmaIdentity.UserId, WorkPoolEnum.SecondApproverpool);

            foreach (var claimInvoice in claimInvoices)
            {
                ////Was the user the Individual Assessor on this Claim
                //int? individualAssessorForClaim =
                //    await GetLastUserForWorkPool(claimInvoice.ClaimId, WorkPoolEnum.IndividualAssessorpool);

                int? individualAssessorForClaim = 0;
                var claimDecision = await GetClaimPaymentForAuthorisation(claimInvoice.ClaimId);
                ClaimEmailAction claimEmailAction = new ClaimEmailAction();

                switch (claimInvoice.Decision)
                {
                    case ClaimInvoiceDecisionEnum.Approve: //Approve
                        if (isIndividualAssessor) // User is an assessor
                        {
                            //===Check if ClaimPayment already exist - if so then update else create
                            if (claimInvoice.Id > 0)
                            {
                                await UpdateClaimInvoice(claimInvoice);
                                await UpdateInvoiceAllocations(claimInvoice.InvoiceAllocations, claimInvoice.Id);
                            }
                            else
                            {
                                // Create a record
                                var claimInvoiceId = await CreateClaimInvoice(claimInvoice);

                                // Create Claim allocation
                                await CreateInvoiceAllocations(claimInvoice.InvoiceAllocations, claimInvoiceId);
                            }

                            // Update Status
                            await UpdateStatus(new Action
                            {
                                ItemId = claimInvoice.ClaimId,
                                UserId = null,
                                Status = ClaimStatusEnum.Approved
                            });

                            // Return Validate
                            return new ValidationResult()
                            {
                                EmitDate = System.DateTime.Now,
                                Result = true,
                                Message = new List<string>() { "Payment was Approved" }
                            };
                        }
                        break;
                    case ClaimInvoiceDecisionEnum.Decline: //Decline
                        if (claimInvoice.Id > 0)
                        {
                            await UpdateClaimInvoice(claimInvoice);

                            if (claimInvoice.DecisionReasonId != (int)ClaimInvoiceDeclineReasonEnum.SuspiciousClaim
                                && claimInvoice.DecisionReasonId != (int)ClaimInvoiceDeclineReasonEnum.Falseinformationatapplicationstage
                                && claimInvoice.DecisionReasonId != (int)ClaimInvoiceDeclineReasonEnum.Latenotificationafter3monthsofdateofdeath)
                            {
                                var emailDeclineLetter = await DeclineClaimEmailNotification(claimInvoice);
                            }
                        }
                        // Update Status
                        await UpdateStatus(new Action
                        {
                            ItemId = claimInvoice.ClaimId,
                            UserId = RmaIdentity.UserId,
                            Status = ClaimStatusEnum.Declined,
                            ClaimDeclineReason = (ClaimDeclineReasonEnum)claimInvoice.DecisionReasonId
                        });

                        // Return Validate
                        return new ValidationResult()
                        {
                            EmitDate = System.DateTime.Now,
                            Result = true,
                            Message = new List<string>() { "Claim was declined" }
                        };
                    case ClaimInvoiceDecisionEnum.Authorise: //Authorise
                        if (isSecondApprover && individualAssessorForClaim != RmaIdentity.UserId) // User is a second approver and was not the individual assessor on this claim
                        {
                            await AuthorizedPayment(claimInvoices);

                            // Update Status
                            await UpdateStatus(new Action
                            {
                                ItemId = claimInvoice.ClaimId,
                                UserId = RmaIdentity.UserId,
                                Status = ClaimStatusEnum.Authorised
                            });

                            // Return Validate
                            return new ValidationResult()
                            {
                                EmitDate = System.DateTime.Now,
                                Result = true,
                                Message = new List<string>() { "Payment was Authorised" }
                            };
                        }

                        break;
                    case ClaimInvoiceDecisionEnum.Reassess: //ReAssess
                        if (claimDecision.Decision == ClaimInvoiceDecisionEnum.ReferToComplaintSupportManager || claimDecision.Decision == ClaimInvoiceDecisionEnum.ReferToManager)
                        {
                            var previousAssessorId = await GetPreviousAssessorWorked(claimInvoice.ClaimId);
                            var reAssessClaim = await ReAssessClaimInvoice(claimInvoice);
                            await UpdateStatus(new Action
                            {
                                ItemId = claimInvoice.ClaimId,
                                UserId = previousAssessorId,
                                Status = ClaimStatusEnum.ReturnToAssessorAfterDeclined
                            });
                            // Return Validate
                            return new ValidationResult()
                            {
                                EmitDate = System.DateTime.Now,
                                Result = true,
                                Message = new List<string>() { "Claim was sent for reassessment" }
                            };
                        }
                        else
                        {
                            if (isSecondApprover && individualAssessorForClaim != RmaIdentity.UserId) // User is a second approver and was not the individual assessor on this claim
                            {
                                // GetClaim the last workedon user
                                int? lastWorkedOnUser = await GetLastWorkedOnUser(claimInvoice.ClaimId);

                                //update claim Invoice
                                var reAssessClaim = await ReAssessClaimInvoice(claimInvoice);

                                // Update Status
                                await UpdateStatus(new Action
                                {
                                    ItemId = claimInvoice.ClaimId,
                                    UserId = lastWorkedOnUser,
                                    Status = ClaimStatusEnum.ReturnToAssessor
                                });

                                // Return Validate
                                return new ValidationResult()
                                {
                                    EmitDate = System.DateTime.Now,
                                    Result = true,
                                    Message = new List<string>() { "Payment was sent for reassessment" }
                                };
                            }
                        }
                        break;
                    case ClaimInvoiceDecisionEnum.ReferToManager:   //when claims assessor decide to decline - only option is to Refer to Manager
                        if (claimInvoice.Id > 0)
                        {
                            await UpdateClaimInvoice(claimInvoice);
                        }
                        else
                        {
                            // Create a record
                            var claimInvoiceId = await CreateClaimInvoice(claimInvoice);

                            // Create Claim allocation
                            await CreateInvoiceAllocations(claimInvoice.InvoiceAllocations, claimInvoiceId);
                        }
                        var usersReferToManager = await _userService.GetUsersByRoleName(ClaimsManagerRole);
                        var referToManagerUserId = usersReferToManager.FirstOrDefault()?.Id;
                        if (await _configurationService.IsFeatureFlagSettingEnabled("ReferClaimToManagerFeature"))
                        {
                            referToManagerUserId = claimInvoice.ReferToManagerId;
                        }
                        await UpdateStatus(new Action
                        {
                            ItemId = claimInvoice.ClaimId,
                            UserId = referToManagerUserId,
                            Status = ClaimStatusEnum.AwaitingDeclineDecision
                        });

                        return new ValidationResult()
                        {
                            EmitDate = System.DateTime.Now,
                            Result = true,
                            Message = new List<string>() { "Payment was declined, referred to manager and awaiting decision" }
                        };
                    case ClaimInvoiceDecisionEnum.ReferToComplaintSupportManager:   //when claims manager decide to decline - only option is to Refer to Claims Support and Complaints Manager
                        await UpdateClaimInvoice(claimInvoice);
                        var usersComplaintSupport = await _userService.GetUsersByRoleName(ComplaintSupportManagerRole);
                        var complaintSupportManagerUserId = usersComplaintSupport.FirstOrDefault()?.Id;
                        await UpdateStatus(new Action
                        {
                            ItemId = claimInvoice.ClaimId,
                            UserId = complaintSupportManagerUserId,
                            Status = ClaimStatusEnum.AwaitingDeclineDecision
                        });

                        return new ValidationResult()
                        {
                            EmitDate = System.DateTime.Now,
                            Result = true,
                            Message = new List<string>() { "Payment was declined, referred to complaints support manager and awaiting decision" }
                        };
                    case ClaimInvoiceDecisionEnum.PaymentReversal: //Reversal
                        await UpdateClaimInvoice(claimInvoice);
                        await UpdateStatus(new Action
                        {
                            ItemId = claimInvoice.ClaimId,
                            UserId = null,
                            Status = ClaimStatusEnum.AwaitingReversalDecision
                        });

                        // Return Validate
                        return new ValidationResult()
                        {
                            EmitDate = System.DateTime.Now,
                            Result = true,
                            Message = new List<string>() { "Payment was sent for Reversal" }
                        };
                    case ClaimInvoiceDecisionEnum.ApproveReversal:
                        await UpdateClaimInvoice(claimInvoice);
                        await UpdateStatus(new Action
                        {
                            ItemId = claimInvoice.ClaimId,
                            UserId = null,
                            Status = ClaimStatusEnum.Reversed
                        });
                        claimEmailAction.ActionType = "Approve unpaid reversal";
                        await SendEmailNotificationToApproverAfterReversal(claimInvoice, claimEmailAction);
                        // Return Validate
                        return new ValidationResult()
                        {
                            EmitDate = System.DateTime.Now,
                            Result = true,
                            Message = new List<string>() { "Payment was approved for Reversal" }
                        };
                    case ClaimInvoiceDecisionEnum.RejectReversal:
                        await UpdateClaimInvoice(claimInvoice);
                        await UpdateStatus(new Action
                        {
                            ItemId = claimInvoice.ClaimId,
                            UserId = null,
                            Status = ClaimStatusEnum.ReversalRejected
                        });
                        claimEmailAction.ActionType = "Reject unpaid reversal";
                        await SendEmailNotificationToApproverAfterReversal(claimInvoice, claimEmailAction);
                        // Return Validate
                        return new ValidationResult()
                        {
                            EmitDate = System.DateTime.Now,
                            Result = true,
                            Message = new List<string>() { "Reversal rejected" }
                        };
                }
            }

            return new ValidationResult()
            {
                EmitDate = System.DateTime.Now,
                Result = false,
                Message = new List<string>() { "No action taken / User does not have permission" }
            };
        }

        public async Task<bool> UpdateClaimInvoice(ClaimInvoice claimInvoice)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _claimInvoiceRepository.FindByIdAsync(claimInvoice.Id);
                await _claimInvoiceRepository.LoadAsync(entity, a => a.InvoiceAllocations);
                await _claimInvoiceRepository.LoadAsync(entity, a => a.FuneralInvoice);
                var benefit = await _claimBenefitRepository.Where(b => b.ClaimBenefitId == entity.ClaimBenefitId).SingleAsync();

                if (entity != null)
                {
                    var invoiceAllocationId = claimInvoice.InvoiceAllocations.Select(a => a.InvoiceAllocationId).FirstOrDefault();
                    var funeralInvoice = entity.FuneralInvoice;

                    entity.AuthorisedAmount = claimInvoice.AuthorisedAmount;
                    entity.ClaimInvoiceDecision = claimInvoice.Decision;
                    entity.InvoiceAmount = claimInvoice.InvoiceAmount;
                    entity.AuthorisedVat = claimInvoice.AuthorisedVat;
                    entity.InvoiceVat = claimInvoice.InvoiceVat;
                    entity.ClaimInvoiceStatusId = 30; //30: Assessed TODO remove  claimInvoice.ClaimInvoiceStatusId,
                    entity.IsAuthorised = claimInvoice.IsAuthorised;
                    entity.PayeeRolePlayerId = claimInvoice.PayeeRolePlayerId;
                    entity.PayeeRolePlayerBankAccountId = claimInvoice.PayeeRolePlayerBankAccountId;

                    funeralInvoice.CapAmount = claimInvoice.CapAmount;
                    funeralInvoice.ClaimInvoiceDecision = claimInvoice.Decision;
                    if (await _configurationService.IsFeatureFlagSettingEnabled("FuneralCoverAmount"))
                    {
                        funeralInvoice.CoverAmount = benefit.EstimatedValue;
                    }
                    else
                    {
                        funeralInvoice.CoverAmount = claimInvoice.AuthorisedAmount;
                    }

                    funeralInvoice.OutstandingPremiumAmount = claimInvoice.OutstandingPremium;
                    funeralInvoice.RefundAmount = claimInvoice.Refund;
                    funeralInvoice.TracingFees = claimInvoice.TracingFees;
                    funeralInvoice.UnclaimedPaymentInterest = claimInvoice.UnclaimedPaymentInterest;
                    if (claimInvoice.DecisionReasonId != null)
                        funeralInvoice.ClaimInvoiceDeclineReason = (ClaimInvoiceDeclineReasonEnum)claimInvoice.DecisionReasonId;
                    if (claimInvoice.Decision == ClaimInvoiceDecisionEnum.Approve)
                        funeralInvoice.ClaimInvoiceDeclineReason = null;
                    if (claimInvoice.ReversalReasonId != null)
                        funeralInvoice.ClaimInvoiceReversalReason = (ClaimInvoiceReversalReasonEnum)claimInvoice.ReversalReasonId;

                    if (claimInvoice.Decision == ClaimInvoiceDecisionEnum.ApproveReversal)
                    {
                        await DeleteClaimInvoice(claimInvoice);
                    }

                    var invoiceAllocation = entity.InvoiceAllocations.Where(t => t.ClaimInvoiceId == claimInvoice.Id).FirstOrDefault();

                    _funeralInvoiceRepository.Update(funeralInvoice);
                    _claimInvoiceRepository.Update(entity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);

                    return true;
                }

                return false;
            }
        }

        public async Task UpdateInvoiceAllocations(List<InvoiceAllocation> invoiceAllocations, int claimInvoiceId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditInvoice);

            foreach (var invoiceAllocation in invoiceAllocations)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var result = await _invoiceAllocationRepository.Where(t => t.InvoiceAllocationId == invoiceAllocation.InvoiceAllocationId).FirstOrDefaultAsync();
                    result.AssessedAmount = invoiceAllocation.AssessedAmount;
                    result.AssessedVat = invoiceAllocation.AssessedVat;
                    result.BeneificaryRolePlayerId = invoiceAllocation.BeneificaryRolePlayerId;
                    result.PaymentMethod = (PaymentMethodEnum)invoiceAllocation.PaymentMethod;
                    result.PercentAllocation = invoiceAllocation.PercentAllocation;
                    result.RolePlayerBankingId = invoiceAllocation.RolePlayerBankingId;

                    _invoiceAllocationRepository.Update(result);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        public async Task<bool> DeleteClaimInvoice(ClaimInvoice claimInvoice)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _claimInvoiceRepository.FindByIdAsync(claimInvoice.Id);
                await _claimInvoiceRepository.LoadAsync(entity, a => a.InvoiceAllocations);
                await _claimInvoiceRepository.LoadAsync(entity, a => a.FuneralInvoice);

                if (entity != null)
                {
                    var invoiceAllocationId = claimInvoice.InvoiceAllocations.Select(a => a.InvoiceAllocationId).FirstOrDefault();
                    var funeralInvoice = entity.FuneralInvoice;
                    var invoiceAllocation = entity.InvoiceAllocations.Where(t => t.ClaimInvoiceId == claimInvoice.Id).FirstOrDefault();

                    entity.IsDeleted = true;
                    //entity.ClaimInvoiceDecision = claimInvoice.Decision;
                    funeralInvoice.IsDeleted = true;
                    //funeralInvoice.ClaimInvoiceDecision = claimInvoice.Decision;
                    invoiceAllocation.IsDeleted = true;

                    _funeralInvoiceRepository.Update(funeralInvoice);
                    _claimInvoiceRepository.Update(entity);
                    _invoiceAllocationRepository.Update(invoiceAllocation);

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    return true;
                }

                return false;
            }
        }

        private async Task<bool> AuthoriseClaimInvoice(ClaimInvoice claimInvoice)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ApprovePayment);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _claimInvoiceRepository.FindByIdAsync(claimInvoice.Id);
                var funeralInvoice = await _funeralInvoiceRepository.FindByIdAsync(claimInvoice.Id);

                entity.InvoiceAmount = Convert.ToDecimal(claimInvoice.ClaimAmount);
                entity.ClaimInvoiceDecision = ClaimInvoiceDecisionEnum.Authorise;
                entity.IsAuthorised = 1;
                funeralInvoice.ClaimInvoiceDecision = ClaimInvoiceDecisionEnum.Authorise;

                _claimInvoiceRepository.Update(entity);
                _funeralInvoiceRepository.Update(funeralInvoice);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        private async Task<bool> ReAssessClaimInvoice(ClaimInvoice claimInvoice)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AssessInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _claimInvoiceRepository.FindByIdAsync(claimInvoice.Id);
                var invoiceAllocation = await _invoiceAllocationRepository.SingleAsync(x => x.ClaimInvoiceId == claimInvoice.Id);
                var funeralInvoice = await _funeralInvoiceRepository.FindByIdAsync(claimInvoice.Id);

                if (entity != null)
                {
                    entity.ClaimInvoiceDecision = ClaimInvoiceDecisionEnum.Reassess;
                    entity.IsDeleted = true;
                    _claimInvoiceRepository.Update(entity);
                }

                if (invoiceAllocation != null)
                {
                    invoiceAllocation.IsDeleted = true;
                    _invoiceAllocationRepository.Update(invoiceAllocation);
                }

                if (funeralInvoice != null)
                {
                    funeralInvoice.ClaimInvoiceDecision = ClaimInvoiceDecisionEnum.Reassess;
                    funeralInvoice.IsDeleted = true;
                    _funeralInvoiceRepository.Update(funeralInvoice);
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task ProcessBankingDetailRejectionAsync(int claimId, string reason, ClaimTypeEnum? claimTypeEnum)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ProcessBankingDetail);

            var claimDetails = await GetClaim(claimId);

            if (claimDetails.ClaimStatus != ClaimStatusEnum.Tracing && claimDetails.ClaimStatus != ClaimStatusEnum.Unclaimed)
            {
                //Add reason to note
                await AddClaimNote(new ClaimNote
                {
                    ClaimId = claimId,
                    Text = reason,
                });
                //Update Claim Status
                if (claimTypeEnum == ClaimTypeEnum.Funeral)
                {
                    await UpdateStatus(new Action
                    {
                        ItemId = claimId,
                        Status = ClaimStatusEnum.Unpaid
                    });
                }
            }
        }

        public async Task ProcessTracerBankingDetailRejectionAsync(int tracerId, string reason)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ProcessBankingDetail);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _tracerInvoiceRepository.Where(tracerInvoice => tracerInvoice.TracerInvoiceId == tracerId).SingleAsync();
                entity.Reason = reason;
                entity.PaymentStatus = (int)PaymentStatusEnum.Rejected;
                _tracerInvoiceRepository.Update(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }

        public async Task<int> Create(Contracts.Entities.Claim claim)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddClaim);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var dbClaim = await _claimRepository.FirstOrDefaultAsync(
                   c => c.ClaimReferenceNumber == claim.ClaimReferenceNumber
                   && c.PersonEventId == claim.PersonEventId
                   && c.PolicyId == claim.PolicyId);

                if (dbClaim != null)
                {
                    return dbClaim.ClaimId;
                }

                var entity = Mapper.Map<claim_Claim>(claim);
                _claimRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.ClaimId;
            }
        }

        public async Task<int> AddClaimRuleAudit(List<ClaimRuleAudit> claimRuleAudit)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var entity = Mapper.Map<List<claim_ClaimRuleAudit>>(claimRuleAudit);

                _claimRuleAuditRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.Select(a => a.ClaimId).FirstOrDefault();
            }
        }

        public async Task GeneratePersonEventClaims(List<PersonEvent> personEvents)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddClaim);

            var claimId = 0;
            using (var scope = _dbContextScopeFactory.Create())
            {
                foreach (var personEvent in personEvents)
                {
                    var isIndividualAssessor =
                        await _workPoolService.IsUserInWorkPool(RmaIdentity.UserId,
                            WorkPoolEnum.IndividualAssessorpool);

                    // Set if User Id if they are an Individual Assessor
                    int? allocatedUserId = null;

                    if (isIndividualAssessor)
                    {
                        allocatedUserId = RmaIdentity.UserId;
                    }

                    personEvent.InsuredLifeId = 807;
                    var policyId = 1;

                    var claimEntity = new claim_Claim
                    {
                        ClaimReferenceNumber = await GenerateUniqueReferenceNumber(),
                        PolicyId = policyId,
                        ClaimStatus = ClaimStatusEnum.New,
                        AssignedToUserId = allocatedUserId,
                        IsRuleOverridden = false,
                        PersonEventId = personEvent.PersonEventId,
                        IsCancelled = false,
                        IsClosed = false,
                        ClaimCancellationReason = ClaimCancellationReasonEnum.Adminerror
                    };

                    var productOptionId = (await _policyService.GetPolicyWithoutReferenceData(policyId)).ProductOptionId;
                    var benefits = await _productOptionService.GetBenefitsForOption(productOptionId);

                    var claimBenefit = new ClaimBenefit();
                    var claimBenefitsList = new List<claim_ClaimBenefit>();

                    // Taking all the benefits and putting it into a list to display the breakdown
                    benefits.ForEach(a =>
                    {
                        a.BenefitRates.ForEach(b =>
                        {
                            claimBenefit.BenefitId = a.Id;
                            claimBenefit.EstimatedValue = b.BenefitAmount;
                            claimBenefitsList.Add(Mapper.Map<claim_ClaimBenefit>(claimBenefit));
                        });
                    });

                    claimEntity.ClaimBenefits = claimBenefitsList;
                    claimId = _claimRepository.Create(claimEntity).ClaimId;

                }

                claimId = await scope.SaveChangesAsync().ConfigureAwait(false);
                claimId = _claimRepository.Where(x => x.ClaimId > 0).OrderByDescending(x => x.ClaimId)
                    .FirstOrDefault().ClaimId;
                var wizardId = await CreateWizard(claimId);

                var claim = await GetClaim(claimId);
                claim.WizardId = wizardId;
                await UpdateClaim(claim);
            }
        }

        public async Task<PersonEvent> AcknowledgeClaims(List<Policy> policies, int personEventId, bool isAutoAcknowledge)
        {
            Contract.Requires(policies != null);
            Contract.Requires(policies.Count > 0);
            Contract.Requires(personEventId > 0);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var personEvent = await _eventService.GetPersonEvent(personEventId);

                if (personEvent == null)
                {
                    return null;
                }

                var _event = await _eventService.GetEvent(personEvent.EventId);

                var hasVapsAssistance = policies.Any(p => p.ProductCategoryType == ProductCategoryTypeEnum.VapsAssistance);
                policies.RemoveAll(p => p.ProductCategoryType == ProductCategoryTypeEnum.VapsAssistance);

                #region create claim(s)
                var personEventEntity = await AddClaimsToPersonEvent(policies, personEvent, _event, isAutoAcknowledge);
                personEvent.Claims = personEventEntity.Claims;
                #endregion

                #region create estimated earnings
                // retrieve estimate earnings if earnings have been captured
                var personEventEarnings = await _claimEarningService.GetEarningsByPersonEventId(personEventId);
                // create estimate earnings if no earnings have been captured
                if (personEventEarnings?.Count <= 0)
                {
                    var rolePlayer = await _rolePlayerService.GetRolePlayer(Convert.ToInt32(_event.MemberSiteId));
                    var nonVariableSubTotal = await GetEstimatedEarning((IndustryClassEnum)rolePlayer.Company.IndustryClass, personEvent.PersonEventId);
                    var estimatedEarning = new Earning
                    {
                        PersonEventId = personEvent.PersonEventId,
                        NonVariableSubTotal = nonVariableSubTotal,
                        Total = nonVariableSubTotal,
                        EarningsType = EarningsTypeEnum.Accident,
                        IsEstimated = true
                    };

                    await _claimEarningService.CreateEarning(estimatedEarning);
                }
                #endregion

                #region create claim estimates
                var topRankedEstimateAmount = await CreateClaimEstimates(policies, personEvent, _event);
                #endregion

                #region handle workpool routing
                if (!personEvent.IsStraightThroughProcess)
                {
                    #region handle workflows
                    if ((personEvent.IsHijack || personEvent.PersonEventAccidentDetail != null) && Convert.ToDecimal(topRankedEstimateAmount.MedicalCostEstimate) > 25000)
                    {
                        var startWizardRequest = new StartWizardRequest
                        {
                            LinkedItemId = personEvent.PersonEventId,
                            Type = "claim-investigation-coid",
                            Data = _serializer.Serialize(personEvent)
                        };

                        await _wizardService.StartWizard(startWizardRequest);

                        var reason = personEvent.IsHijack ? "Hijack" : "Road accident";
                        await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
                        {
                            ItemId = personEvent.PersonEventId,
                            NoteCategory = NoteCategoryEnum.PersonEvent,
                            NoteItemType = NoteItemTypeEnum.PersonEvent,
                            NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                            NoteType = NoteTypeEnum.SystemAdded,
                            Text = $"Investigation started: {reason} medical estimate above 25,000",
                            IsActive = true
                        });
                    }
                    #endregion

                    WorkPoolEnum? workPool = _event.EventType == EventTypeEnum.Accident ? WorkPoolEnum.ScaPool : WorkPoolEnum.CcaPool;

                    if ((bool)personEvent.IsFatal)
                    {
                        workPool = WorkPoolEnum.CmcPool;
                    }

                    int? currentOwner = workPool == WorkPoolEnum.CmcPool ? RmaIdentity.UserId : (int?)null;

                    if (workPool != null)
                    {
                        #region handle workpool routing
                        var poolWorkFlow = new PoolWorkFlow()
                        {
                            PoolWorkFlowItemType = PoolWorkFlowItemTypeEnum.PersonEvent,
                            ItemId = personEvent.PersonEventId,
                            AssignedByUserId = RmaIdentity.UserId,
                            AssignedToUserId = currentOwner,
                            WorkPool = (WorkPoolEnum)workPool,
                            Instruction = "Liability decision required"
                        };

                        await _poolWorkFlowService.HandlePoolWorkFlow(poolWorkFlow);
                        #endregion

                        #region handle workpool sla(s)
                        // Close Acknowlege SLA
                        var slaStatusChangeAuditAcknowledge = new SlaStatusChangeAudit
                        {
                            SLAItemType = SLAItemTypeEnum.WorkPoolAcknowledgement,
                            ItemId = personEvent.PersonEventId,
                            EffectiveFrom = DateTimeHelper.SaNow,
                            EffictiveTo = DateTimeHelper.SaNow,
                            Reason = "Claim was acknowledged",
                            Status = "PEV Status: " + personEvent.PersonEventStatus.ToString()
                        };

                        await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAuditAcknowledge);

                        // Start Liability SLA

                        var slaItemType = personEvent.Claims?[0].UnderwriterId == Convert.ToInt32(UnderwriterEnum.RMAMutualAssurance) ? SLAItemTypeEnum.WorkPoolLiabilityDecisionCOID : SLAItemTypeEnum.WorkPoolLiabilityDecisionNonCOID;
                        var liabilityStatus = personEvent.Claims?[0].ClaimLiabilityStatus != null ? personEvent.Claims?[0].ClaimLiabilityStatus.ToString() : "N/A";

                        var slaStatusChangeAuditLiability = new SlaStatusChangeAudit
                        {
                            SLAItemType = slaItemType,
                            ItemId = personEvent.PersonEventId,
                            EffectiveFrom = DateTimeHelper.SaNow,
                            EffictiveTo = null,
                            Reason = "Awaiting liability decision",
                            Status = "Liability Status: " + liabilityStatus
                        };

                        await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAuditLiability);
                        #endregion
                    }
                }
                #endregion

                #region handle communication(s)
                _ = Task.Run(() => _claimCommunicationService.SendClaimNotification(personEvent, TemplateTypeEnum.AcknowledgmentofClaim));
                #endregion

                #region handle vaps assistance claim(s)
                if (hasVapsAssistance && policies.Any(p => p.ProductCategoryType == ProductCategoryTypeEnum.Coid))
                {
                    //here we will create a separate aug policy
                    await AcknowledgeVapsClaims(personEvent.PersonEventId);
                }
                else if (hasVapsAssistance && policies.Any(p => p.ProductCategoryType == ProductCategoryTypeEnum.VapsNoneStatutory))
                {
                    var policyIds = policies.Where(p => p.ProductCategoryType == ProductCategoryTypeEnum.VapsNoneStatutory).Select(p => p.PolicyId).ToList();
                    var claimIds = personEventEntity.Claims.Where(c => policyIds.Contains((int)c.PolicyId)).Select(c => c.ClaimId).ToList();
                    //here we dont create a separate aug policy and sum the benefit payments
                    await AcknowledgeVapsForNonStatutoryClaims(personEvent.PersonEventId, claimIds);
                }
                #endregion

                return personEvent;
            }
        }

        public async Task<PersonEvent> UnacknowledgeClaims(List<Policy> policies, int personEventId)
        {
            Contract.Requires(policies != null && policies.Count > 0 && personEventId > 0);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var personEvent = await _eventService.GetPersonEvent(personEventId);

                #region mark claims as deleted
                personEvent.Claims.ForEach(c => c.IsDeleted = true);
                #endregion

                var _event = await _eventService.GetEvent(personEvent.EventId);

                var hasVapsAssistance = policies.Any(p => p.ProductCategoryType == ProductCategoryTypeEnum.VapsAssistance);
                policies.RemoveAll(p => p.ProductCategoryType == ProductCategoryTypeEnum.VapsAssistance);

                #region create claim(s)
                var personEventEntity = await AddClaimsToPersonEvent(policies, personEvent, _event, false);
                personEvent.Claims = personEventEntity.Claims;
                #endregion

                #region create claim estimates
                var topRankedEstimateAmount = await CreateClaimEstimates(policies, personEvent, _event);
                #endregion

                #region handle vaps assistance claim(s)
                if (hasVapsAssistance)
                {
                    await AcknowledgeVapsClaims(personEvent.PersonEventId);
                }
                #endregion

                return personEvent;
            }
        }

        public async Task<PersonEvent> AcknowledgeVapsClaims(int personEventId)
        {
            Contract.Requires(personEventId > 0);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var personEvent = await _eventService.GetPersonEvent(personEventId);

                if (personEvent == null)
                {
                    return null;
                }

                #region retrieve actual accident earnings
                var personEventEarnings = await _claimEarningService.GetEarningsByPersonEventId(personEventId);
                var actualAccidentEarnings = personEventEarnings?.LastOrDefault(x => x.EarningsType == EarningsTypeEnum.Accident && x.IsVerified);
                #endregion

                if (actualAccidentEarnings != null)
                {
                    var policies = await _policyService.GetPoliciesWithProductOptionByRolePlayer((int)personEvent.CompanyRolePlayerId);
                    policies.RemoveAll(p => p.ProductCategoryType != ProductCategoryTypeEnum.VapsAssistance);

                    if (policies != null && policies.Count > 0)
                    {
                        var _event = await _eventService.GetEvent(personEvent.EventId);
                        var addVapsClaim = false;

                        foreach (var policy in policies)
                        {
                            policy.ProductOption.Benefits = await _policyService.GetBenefitsForProductOptionAtEffectiveDate(policy.ProductOptionId, _event.EventDate);
                            if (policy.ProductOption?.Benefits?.Count > 0)
                            {
                                var filteredBenefitEarningsRange = policy.ProductOption?.Benefits?
                                                .Where(benefit => benefit.BenefitType == BenefitTypeEnum.Basic &&
                                                                 (benefit.EstimateTypeId == (int)EstimateTypeEnum.PDLumpSum || 
                                                                  benefit.EstimateTypeId == (int)EstimateTypeEnum.TTD))
                                                .SelectMany(benefit => benefit.BenefitEarningsRangeCalcs ?? Enumerable.Empty<BenefitEarningsRangeCalcs>())
                                                .ToList();
                                // check if max earnings threshold is exceeded
                                addVapsClaim = filteredBenefitEarningsRange?.Any(c => actualAccidentEarnings.Total > c.MaxEarnings) ?? false;
                            }
                        }

                        if (addVapsClaim)
                        {
                            #region create claim(s)
                            var personEventEntity = await AddClaimsToPersonEvent(policies, personEvent, _event, false);
                            personEvent.Claims = personEventEntity.Claims;
                            #endregion

                            #region create claim estimates
                            var topRnkedEstimateAmount = await CreateClaimEstimates(policies, personEvent, _event);
                            #endregion
                        }
                    }
                }

                return personEvent;
            }
        }

        private async Task<TopRankedEstimateAmount> CreateClaimEstimates(List<Policy> policies, PersonEvent personEvent, Contracts.Entities.Event _event)
        {
            var topRankedEstimateAmount = (bool)personEvent.IsFatal || _event.EventType == EventTypeEnum.Disease
                                ? await _claimInvoiceService.GetTopRankedEstimatesFromPhysicalInjury(personEvent)
                                : await _claimInvoiceService.GetTopRankedEstimatesFromMedicalReport(personEvent);

            #region create claim estimates of benefits
            foreach (var policy in policies)
            {
                policy.ProductOption.Benefits = await _policyService.GetBenefitsForProductOptionAtEffectiveDate(policy.ProductOptionId, _event.EventDate);

                if (policy.ProductOption?.Benefits?.Count > 0)
                {
                    var productOptionBenefits = policy.ProductOption?.Benefits;
                    var benefits = new List<Benefit>();

                    foreach (var benefit in productOptionBenefits)
                    {
                        if (benefit.BenefitType == BenefitTypeEnum.Basic)
                        {
                            if ((topRankedEstimateAmount.PDExtentEstimate > 30 && !((bool)personEvent.IsFatal))
                                && benefit.EstimateTypeId == (int)EstimateTypeEnum.PDPension)
                            {
                                benefits.Add(benefit);
                            }
                            else if (topRankedEstimateAmount.PDExtentEstimate <= 30
                                    && benefit.EstimateTypeId == (int)EstimateTypeEnum.PDLumpSum)
                            {
                                benefits.Add(benefit);
                            }
                            else if (benefit.EstimateTypeId != (int)EstimateTypeEnum.PDPension
                                    && benefit.EstimateTypeId != (int)EstimateTypeEnum.PDLumpSum)
                            {
                                benefits.Add(benefit);
                            }
                        }

                        if ((bool)personEvent.IsFatal && benefit.BenefitType == BenefitTypeEnum.Fatal)
                        {
                            benefits.Add(benefit);
                        }
                    }

                    if (benefits?.Count > 0)
                    {
                        await _claimInvoiceService.AddClaimEstimates(benefits, personEvent.PersonEventId);
                    }
                }
            }
            #endregion

            return topRankedEstimateAmount;
        }

        private async Task<PersonEvent> AddClaimsToPersonEvent(List<Policy> policies, PersonEvent personEvent, Contracts.Entities.Event _event, bool isAutoAcknowledge)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var claimLiabilityStatus = personEvent.Claims?.Count > 0 ? personEvent.Claims[0].ClaimLiabilityStatus : ClaimLiabilityStatusEnum.Pending;
                if (personEvent.IsStraightThroughProcess)
                {
                    claimLiabilityStatus = personEvent.PersonEventBucketClassId == (int)ClaimBucketClassEnum.NotificationOnly
                                            ? ClaimLiabilityStatusEnum.LiabilityNotAccepted
                                            : ClaimLiabilityStatusEnum.Accepted;
                }

                foreach (var policy in policies)
                {
                    policy.ProductOption.Benefits = await _policyService.GetBenefitsForProductOptionAtEffectiveDate(policy.ProductOptionId, _event.EventDate);

                    if (policy.ProductOption?.Benefits?.Count > 0)
                    {
                        var claim = new Contracts.Entities.Claim()
                        {
                            ClaimId = 0,
                            PersonEventId = personEvent.PersonEventId,
                            ClaimReferenceNumber = personEvent.PersonEventReferenceNumber.Replace("PEV", policy.ProductOption.Code),
                            ClaimStatus = isAutoAcknowledge ? ClaimStatusEnum.AutoAcknowledged : ClaimStatusEnum.ManuallyAcknowledged,
                            PolicyId = policy.PolicyId,
                            ClaimLiabilityStatus = claimLiabilityStatus,
                            ClaimStatusChangeDate = DateTime.Now,
                            IsCancelled = false,
                            IsClosed = false,
                            IsRuleOverridden = false,
                            DisabilityPercentage = 0.0M,
                            IsDeleted = false,
                            UnderwriterId = policy?.ProductOption?.Product?.UnderwriterId,
                            InvestigationRequired = (bool)personEvent.IsFatal
                        };

                        claim.ClaimBenefits = new List<ClaimBenefit>();

                        foreach (var benefit in policy.ProductOption.Benefits)
                        {
                            var claimBenefit = new ClaimBenefit()
                            {
                                ClaimId = claim.ClaimId,
                                BenefitId = benefit.Id,
                                EstimatedValue = 0
                            };

                            claim.ClaimBenefits.Add(claimBenefit);
                        }
                        personEvent.Claims.Add(claim);
                    }
                }

                var entity = Mapper.Map<claim_PersonEvent>(personEvent);

                entity.PersonEventStatus = isAutoAcknowledge ? PersonEventStatusEnum.AutoAcknowledged : PersonEventStatusEnum.ManuallyAcknowledged;

                _personEventRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                var action = isAutoAcknowledge ? "auto" : "manually";
                await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
                {
                    ItemId = personEvent.PersonEventId,
                    NoteCategory = NoteCategoryEnum.PersonEvent,
                    NoteItemType = NoteItemTypeEnum.PersonEvent,
                    NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                    NoteType = NoteTypeEnum.SystemAdded,
                    Text = $"PEV Notification was {action} acknowledged",
                    IsActive = true
                });

                return Mapper.Map<PersonEvent>(entity);
            }
        }

        public async Task<int> AddClaim(Contracts.Entities.Claim claim)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddClaim);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_Claim>(claim);
                _claimRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.ClaimId;
            }
        }

        public async Task GenerateClaims(List<PersonEvent> newPersonEvents)
        {
            if (newPersonEvents != null)
            {
                var newPersonEventList = newPersonEvents
                    .Where(newPersonEvent => newPersonEvent.PolicyIds != null);
                var eventPolicyList = new Dictionary<PersonEvent, List<Policy>>();
                // Get the policies to process
                foreach (var newPersonEvent in newPersonEventList)
                {
                    var policies = await GetPersonEventPolicies(newPersonEvent.PolicyIds);
                    eventPolicyList.Add(newPersonEvent, policies.FindAll(policy => policy.PolicyStatus == PolicyStatusEnum.Active ||
                                                                                   policy.PolicyStatus == PolicyStatusEnum.Continued ||
                                                                                   policy.PolicyStatus == PolicyStatusEnum.Reinstated ||
                                                                                   policy.PolicyStatus == PolicyStatusEnum.PremiumWaivered ||
                                                                                   policy.PolicyStatus == PolicyStatusEnum.Transferred ||
                                                                                   policy.PolicyStatus == PolicyStatusEnum.FreeCover ||
                                                                                   policy.PolicyStatus == PolicyStatusEnum.PaidUp));
                }
                // Log the claims
                foreach (var eventPolicy in eventPolicyList)
                {
                    var newPersonEvent = eventPolicy.Key;
                    var policies = eventPolicy.Value;
                    foreach (var policy in policies)
                    {
                        _ = Task.Run(() => CreateClaim(newPersonEvent, policy));
                    }
                }
            }
        }

        public async Task<List<Policy>> GetPersonEventPolicies(List<int> policyIds)
        {
            List<Policy> policies = null;
            // Getting all the policies that are eligible in the person event
            if (await _configurationService.IsFeatureFlagSettingEnabled("RegisterClaimActivePoliciesFeature"))
            {
                policies = await _policyService.GetActivePolicies(policyIds);
            }
            else
            {
                policies = await _policyService.GetPoliciesByIds(policyIds);
            }
            return policies;
        }

        private async Task CreateClaim(PersonEvent newPersonEvent, Policy policy)
        {
            var claimNoteList = new Dictionary<Tuple<int, int>, StringBuilder>();
            var finalNote = new StringBuilder();
            claim_Claim claim;
            var isCFP = false;
            decimal coverAmount = 0;
            var hasProductDeviation = false;
            var PausePolicyForMainMemberDeath = false;

            // Checking the rules per policy and adding it to a claim Note
            var keyRoleDeceased = KeyRoleEnum.InsuredLife.DisplayAttributeValue();
            var deceased = newPersonEvent.RolePlayers.FirstOrDefault(r => r.KeyRoleType == keyRoleDeceased);
            var ruleResult = await _fatalService.ExecuteFuneralClaimRegistrationRules(
                new RuleRequest()
                {
                    PolicyId = policy.PolicyId,
                    DeceasedId = deceased.RolePlayerId,
                    DeathDate = newPersonEvent.PersonEventDeathDetail.DeathDate,
                    DeathTypeId = newPersonEvent.PersonEventDeathDetail.DeathTypeId
                });
            // Add the rules into string text if not null
            if (ruleResult.MessageList.Count > 0)
            {
                ruleResult.MessageList.ForEach(a =>
                {
                    var text = JsonConvert.SerializeObject(a.Value);
                    finalNote.Append(text);
                    finalNote.AppendLine();
                });
                claimNoteList.Add(Tuple.Create(policy.PolicyId, newPersonEvent.PersonEventId), finalNote);
            }
            // Getting the claimant rolePlayers communication preference
            var policyIds = new List<int>() { policy.PolicyId };
            var claimantRolePlayer = newPersonEvent.RolePlayers
                .SingleOrDefault(r => r.KeyRoleType == KeyRoleEnum.Claimant.DisplayAttributeValue());

            // Set allocatedUserId if they are an Individual Assessor
            var isIndividualAssessor = await _workPoolService
                .IsUserInWorkPool(RmaIdentity.UserId, WorkPoolEnum.IndividualAssessorpool);
            int? allocatedUserId = null;
            if (isIndividualAssessor)
                allocatedUserId = RmaIdentity.UserId;

            // claimStatus being set based on the person event being approved or declined,
            var claimStatus = ClaimStatusEnum.AwaitingDecision;

            // Create the claim
            using (var scope = _dbContextScopeFactory.Create())
            {
                var claims = await _claimRepository
                    .Where(p => p.PolicyId == policy.PolicyId)
                    .ToListAsync();
                var claimEntity = claims.FirstOrDefault(c => c.PersonEventId == newPersonEvent.PersonEventId);
                if (claimEntity == null)
                    claimEntity = new claim_Claim();
                // Creating the claim
                claimEntity.ClaimReferenceNumber = newPersonEvent.PersonEventId.ToString() + policy.PolicyId.ToString();
                claimEntity.PolicyId = policy.PolicyId;
                claimEntity.ClaimStatus = claimStatus;
                claimEntity.ClaimStatusChangeDate = DateTimeHelper.SaNow;
                claimEntity.AssignedToUserId = allocatedUserId;
                claimEntity.IsRuleOverridden = false;
                claimEntity.PersonEventId = newPersonEvent.PersonEventId;
                claimEntity.IsCancelled = false;
                claimEntity.IsClosed = false;


                var lifeExtension = await _policyService.GetPolicyLifeExtension(policy.PolicyId);
                if (lifeExtension != null)
                {
                    isCFP = true;
                }

                var insuredLife = policy.PolicyInsuredLives.FirstOrDefault(pil => pil.RolePlayerId == newPersonEvent.InsuredLifeId);

                // Check for product deviations & apply if applicable
                if (insuredLife != null && insuredLife.RolePlayerTypeId == (int)RolePlayerTypeEnum.MainMemberSelf)
                {
                    hasProductDeviation = await _rolePlayerPolicyService.HasProductDeviation(policy.ParentPolicyId, ProductDeviationTypeEnum.MainMemberDeath);
                    if (hasProductDeviation && newPersonEvent.PersonEventDeathDetail.DeathType == DeathTypeEnum.Unnatural)
                    {
                        var benefitId = await _rolePlayerPolicyService.GetProductDeviationBenefit(policy.ParentPolicyId, ProductDeviationTypeEnum.MainMemberDeath, insuredLife?.StatedBenefitId);
                        if (benefitId.HasValue)
                        {
                            insuredLife.StatedBenefitId = benefitId.Value;
                        }
                    }
                    else
                    {
                        hasProductDeviation = false;
                        PausePolicyForMainMemberDeath = true;
                    }
                }

                var statedBenefitId = insuredLife?.StatedBenefitId;

                if (statedBenefitId != null)
                {
                    var benefit = await _productOptionService.GetBenefitRate((int)statedBenefitId);
                    if (isCFP)
                    {
                        benefit.BenefitAmount = (decimal)insuredLife?.CoverAmount;
                        coverAmount = (decimal)insuredLife?.CoverAmount;
                    }
                    if (benefit != null)
                        claimEntity.ClaimBenefits.Add(Mapper.Map<claim_ClaimBenefit>(new ClaimBenefit() { BenefitId = benefit.BenefitId, EstimatedValue = benefit.BenefitAmount }));
                }

                // Creating the Claim
                if (claimEntity.ClaimId == 0)
                {
                    claim = _claimRepository.Create(claimEntity);
                }
                else
                {
                    _claimRepository.Update(claimEntity);
                    claim = claimEntity;
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);

            }

            if (hasProductDeviation)
            {
                var rolePlayerPolicy = await _rolePlayerPolicyService.GetRolePlayerPolicy(policy.PolicyId);
                rolePlayerPolicy.PolicyStatus = PolicyStatusEnum.PaidUp;
                await _rolePlayerPolicyService.UpdatePolicyStatus(rolePlayerPolicy);
                await _rolePlayerPolicyService.ApplyProductDeviationUpdates(policy, ProductDeviationTypeEnum.MainMemberDeath);
            }
            else if (PausePolicyForMainMemberDeath)
            {
                var rolePlayerPolicy = await _rolePlayerPolicyService.GetRolePlayerPolicy(policy.PolicyId);
                rolePlayerPolicy.PolicyStatus = PolicyStatusEnum.Paused;
                await _rolePlayerPolicyService.UpdatePolicyStatus(rolePlayerPolicy);
            }

            if (isCFP)
                await CreateCFPClaimsCalculations(claim.ClaimId, coverAmount);
            else
                await CreateClaimsCalculations(claim.ClaimId, deceased);

            if (await _configurationService.IsFeatureFlagSettingEnabled(_updateDeceasedMember133680))
                await UpdatePersonInsuredLife(newPersonEvent);

            //Update Status to new, for audit purposes
            await UpdateStatus(new Action
            {
                ItemType = "claim",
                ItemId = claim.ClaimId,
                Status = ClaimStatusEnum.New,
                UserId = RmaIdentity.UserId,
                ActionDate = newPersonEvent.CreatedDate
            });

            //Update Status to Awaiting Decision
            await UpdateStatus(new Action
            {
                ItemType = "claim",
                ItemId = claim.ClaimId,
                Status = ClaimStatusEnum.AwaitingDecision,
                UserId = RmaIdentity.UserId,
                ActionDate = null
            });
            await CreateClaimNote(claimNoteList);
        }

        private async Task ValidateEaNotification(claim_Claim claimEntity, Policy policy, ClaimStatusEnum status)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var personEventInsuredLife = await _personEventRepository.FirstOrDefaultAsync(p => p.PersonEventId == claimEntity.PersonEventId);
                await _personEventRepository.LoadAsync(personEventInsuredLife, a => a.PersonEventDeathDetail);
                var deceasedRelation = await _rolePlayerService.GetDeceasedRelationToMainMember(claimEntity.PolicyId.Value, personEventInsuredLife.InsuredLifeId);

                if (policy.IsEuropAssist
                    && policy.EuropAssistEffectiveDate < personEventInsuredLife.PersonEventDeathDetail.DeathDate
                    && (deceasedRelation.RolePlayerTypeId == (int)RolePlayerTypeEnum.Child
                        || deceasedRelation.RolePlayerTypeId == (int)RolePlayerTypeEnum.Spouse
                        || personEventInsuredLife.InsuredLifeId == deceasedRelation.ToRolePlayerId))
                {
                    if (policy.EuropAssistEndDate == null)
                    {
                        await SendEuropAssistNotification(claimEntity.ClaimId, status);
                    }
                    else if (policy.EuropAssistEndDate != null && personEventInsuredLife.PersonEventDeathDetail.DeathDate <= policy.EuropAssistEndDate)
                    {
                        await SendEuropAssistNotification(claimEntity.ClaimId, status);
                    }
                }
            }
        }

        private async Task CreateClaimsCalculations(int claimId, RolePlayer deceased)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var result = await _costService.CalculateBeneficiaryPayment(claimId, deceased.RolePlayerId);
                result.ClaimId = claimId;
                result.AllocationPercentange = 100M;
                var mappedCalculatedAmount = Mapper.Map<claim_ClaimsCalculatedAmount>(result);
                _claimsCalculatedRepository.Create(mappedCalculatedAmount);

                await scope.SaveChangesAsync().ConfigureAwait(false); ;
            }
        }

        private async Task CreateCFPClaimsCalculations(int claimId, decimal coverAmount)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var claimsCalculatedAmount = new ClaimsCalculatedAmount
                {
                    ClaimId = claimId,
                    CoverAmount = coverAmount,
                    TotalAmount = coverAmount,
                    AllocationPercentange = 100M
                };
                var mappedCalculatedAmount = Mapper.Map<claim_ClaimsCalculatedAmount>(claimsCalculatedAmount);
                _claimsCalculatedRepository.Create(mappedCalculatedAmount);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task UpdatePolicyInsuredLife(Item item)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditInsuredLife);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var policyInsuredLifeEntity = new PolicyInsuredLife();

                if (item?.ItemType == "PersonEvent")
                {
                    var personEvent = await _personEventRepository.FirstOrDefaultAsync(a => a.PersonEventId == item.ItemId);
                    var polices = await _policyService.GetPoliciesByRolePlayer(personEvent.InsuredLifeId);

                    foreach (var policy in polices)
                    {
                        await UpdatePolicyAndRolePlayerStatus(policy, personEvent.InsuredLifeId);
                    }
                }
                else
                {
                    var claim = await _claimRepository.FirstOrDefaultAsync(a => a.ClaimId == item.ItemId);
                    var personEvent = await _personEventRepository.FirstOrDefaultAsync(b => b.PersonEventId == claim.PersonEventId);
                    var policy = await _policyService.GetPolicyWithoutReferenceData(claim.PolicyId.Value);

                    await UpdatePolicyAndRolePlayerStatus(policy, personEvent.InsuredLifeId);
                }
            }
        }

        private async Task UpdatePolicyAndRolePlayerStatus(Policy policy, int insuredLifeId) 
        {
            var policyInsuredLifeEntity = await _policyService.GetPolicyInsuredLife(policy.PolicyId, insuredLifeId);
            if (policyInsuredLifeEntity != null)
            {
                // Set the status of the insured life back to active
                policyInsuredLifeEntity.InsuredLifeStatus = InsuredLifeStatusEnum.Active;
                await _policyService.UpdatePolicyInsuredLife(policyInsuredLifeEntity);

                // Set the policy status back to active only if the insured life is also the main member
                if (policyInsuredLifeEntity.RolePlayerTypeId == (int)RolePlayerTypeEnum.MainMemberSelf)
                {
                    var rolePlayerPolicy = await _rolePlayerPolicyService.GetRolePlayerPolicy(policy.PolicyId);
                    rolePlayerPolicy.PolicyStatus = PolicyStatusEnum.Active;
                    await _rolePlayerPolicyService.UpdatePolicyStatus(rolePlayerPolicy);
                }
            }
        }

        private async Task CreateClaimNote(Dictionary<Tuple<int, int>, StringBuilder> claimNoteList)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                foreach (var claimNote in claimNoteList)
                {
                    var policyId = claimNote.Key.Item1;
                    var personEventId = claimNote.Key.Item2;
                    var claim = await _claimRepository.FirstOrDefaultAsync(a => a.PolicyId == policyId && a.PersonEventId == personEventId);
                    var note = new ClaimNote()
                    {
                        ClaimId = claim.ClaimId,
                        PersonEventId = claimNote.Key.Item2,
                        Text = claimNote.Value.ToString(),
                    };
                    _claimNoteRepository.Create(Mapper.Map<claim_ClaimNote>(note));
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<int> AddManageUser(ManageUser manageUser)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddManageUser);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_ManageUser>(manageUser);
                _manageUserRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.ManageUserId;
            }
        }

        public async Task<bool> SendDeclineLetterToClaimant(PersonEvent personEvent)
        {
            //TODO: Satya, Revisit for the rolePlayers
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var failedRulesCount = 0; //personEvent.RuleResult.MessageList.Count();

                if (failedRulesCount > 0)
                {

                    MailAttachment[] mailAttachment = new MailAttachment[failedRulesCount];
                    string htmlBody = string.Empty;
                    string emailHeader = string.Empty;
                    string emailFooter = string.Empty;


                    var email = new SendMailRequest()
                    {
                        Subject = DeclineClaimSubject,
                        FromAddress = RmaIdentity.Email,
                        Body = "",
                        IsHtml = true,
                        Attachments = mailAttachment,
                        ItemId = personEvent?.PersonEventId,
                        ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                        Department = RMADepartmentEnum.Claims,
                        BusinessArea = BusinessAreaEnum.ClaimActionNotification
                    };
                    var sendEmail = await _sendEmailService.SendEmail(email);
                    mailAttachment = null;
                    email = null;
                    return sendEmail == 200;
                }

                return false;
            }
        }

        public async Task<bool> CheckIfStillbornBenefitExists(int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var benefitRule = await _configurationService.GetModuleSetting(SystemSettings.UnderOne);
                var policy = await _policyService.GetPolicyWithoutReferenceData(policyId);
                if (policy is null)
                {
                    throw new Exception($"Cannot locate policy with PolicyId {policyId}");
                }
                return await _productOptionService.CheckIfBenefitExist(policy.ProductOptionId, benefitRule);
            }
        }

        public async Task<bool> DeclineClaimEmailNotification(ClaimInvoice claimInvoice)
        {
            int sendEmail = 0;
            Contract.Requires(claimInvoice != null);

            foreach (var invoiceAllocation in claimInvoice.InvoiceAllocations)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var declineLetterPdf = new MailAttachment();
                    var listOfDocument = new List<MailAttachment>();

                    var claimDetails = await GetClaim(claimInvoice.ClaimId);
                    //var insuredLifeDetails = await _personEventRepository.Where(f => f.PersonEventId == claimDetails.PersonEventId).SingleAsync();
                    var policy = await _policyService.GetPolicyWithoutReferenceData(claimDetails.PolicyId.Value);
                    var claimInvoiceDetails = await _claimInvoiceRepository.Where(c => c.ClaimId == claimInvoice.ClaimId).SingleAsync();
                    var beneficiaryDetails = await GetBeneficiaryAndBankAccountById(invoiceAllocation.BeneificaryRolePlayerId, invoiceAllocation.RolePlayerBankingId);
                    var funeralInvoice = await _funeralInvoiceRepository.Where(f => f.ClaimInvoiceId == claimInvoice.Id).FirstOrDefaultAsync();
                    var personEventDeathDetail = await _personEventDeathDetail.Where(d => d.PersonEventId == claimDetails.PersonEventId).FirstOrDefaultAsync();
                    var personEvent = await _personEventRepository.Where(e => e.PersonEventId == claimDetails.PersonEventId).FirstOrDefaultAsync();
                    var lifeAssured = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);

                    var declineDoc = await _documentTemplateService.GetDocumentTemplateByName(funeralInvoice.ClaimInvoiceDeclineReason.DisplayAttributeValue());

                    //var declineDoc = await _documentTemplateService.GetDocumentTemplateByName(DocumentTypeEnum.ContinuationForm.DisplayAttributeValue());
                    var assessorDeclined = await GetAssessorNameDeclined(claimInvoice.ClaimId);
                    var documentTemplate = declineDoc.DocumentHtml;
                    var documentTokens = new Dictionary<string, string>
                    {
                        ["{title}"] = "",
                        ["{beneficiaryFirstName}"] = beneficiaryDetails.Firstname,
                        ["{beneficiaryLastName}"] = beneficiaryDetails.Lastname,
                        ["{address}"] = beneficiaryDetails.AddressLine1,
                        ["{city}"] = beneficiaryDetails.AddressLine2,
                        ["{postalCode}"] = "",
                        ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy"),
                        ["{policyNumber}"] = policy.PolicyNumber,
                        ["{lifeAssured}"] = lifeAssured.Person.FirstName + " " + lifeAssured.Person.Surname,
                        ["{claimType}"] = "Funeral",
                        ["{dateOfDeath}"] = personEventDeathDetail.DeathDate.ToSaDateTime().ToString(),
                        ["{datePolicyStarted}"] = policy.PolicyInceptionDate.ToSaDateTime().ToString(),
                        ["{startDate}"] = policy.PolicyInceptionDate.ToSaDateTime().ToString(),
                        ["{insuredLife}"] = lifeAssured.Person.FirstName + " " + lifeAssured.Person.Surname,
                        ["{nameOfOverAgePerson}"] = lifeAssured.Person.FirstName + " " + lifeAssured.Person.Surname,
                        ["{claimsAssessor}"] = assessorDeclined,
                    };
                    foreach (var token in documentTokens)
                    {
                        documentTemplate = documentTemplate.Replace($"{token.Key}", token.Value);
                    }
                    _headerCollection = await GetHeaderCollection(_headerCollection);
                    var parameters = GetReportParameters(claimInvoice.ClaimId);
                    if (!string.IsNullOrEmpty(parameters))
                    {
                        await SetupClaimCommunicationVariables();
                        declineLetterPdf.AttachmentByteData = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAClaimLifeAssuredDiedWithinTheWaitingPeriod{parameters}&rs:Format=PDF"), _headerCollection);
                    }
                    declineLetterPdf.FileType = declineDoc.DocumentMimeType;
                    declineLetterPdf.FileName = declineDoc.DocumentName;

                    var mail = new MailAttachment()
                    {
                        AttachmentByteData = declineLetterPdf.AttachmentByteData,
                        FileName = declineLetterPdf.FileName,
                        FileType = declineLetterPdf.FileType
                    };
                    listOfDocument.Add(mail);

                    var counter = 0;
                    var attachmentMailAttachments = new MailAttachment[listOfDocument.Count];
                    foreach (var document in listOfDocument)
                    {
                        attachmentMailAttachments[counter] = document;
                        counter++;
                    }

                    var email = new SendMailRequest()
                    {
                        Subject = DeclineClaimSubject,
                        FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                        Recipients = beneficiaryDetails.Email,
                        Body = documentTemplate,
                        IsHtml = true,
                        Attachments = attachmentMailAttachments,
                        ItemId = claimDetails.ClaimId,
                        ItemType = ItemTypeEnum.Claim.DisplayAttributeValue(),
                        Department = RMADepartmentEnum.Claims,
                        BusinessArea = BusinessAreaEnum.ClaimActionNotification
                    };

                    sendEmail = await _sendEmailService.SendEmail(email);
                }
            }
            return sendEmail == 200;

        }

        public async Task ClaimActionEmailNotification(ClaimEmailAction action)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var letterPdf = new MailAttachment();
                var listOfDocument = new List<MailAttachment>();
                var listOfAttachmentIds = new List<int>();
                var personEvent = new PersonEvent();
                string policyNumber = string.Empty;
                string address = string.Empty;
                string city = string.Empty;
                string postalCode = string.Empty;
                string capAmount = string.Empty;
                string accountDetails = string.Empty;
                string beneficiaryFirstName = string.Empty;
                string beneficiarySurname = string.Empty;
                string emailAddress = string.Empty;
                var claimsAssessorDetails = new User();
                var policyOwnerDetails = new RolePlayer();

                if (action.ClaimId != 0)
                {
                    var claimDetails = await GetClaim(action.ClaimId);
                    personEvent = await _eventService.GetPersonEvent(claimDetails.PersonEventId);
                    claimsAssessorDetails = await _userService.GetUserById(personEvent.CapturedByUserId);
                    var policy = await this._policyService.GetPolicyWithoutReferenceData(claimDetails.PolicyId.Value);
                    policyNumber = policy.PolicyNumber;
                    policyOwnerDetails = await _rolePlayerService.GetPolicyOwnerByPolicyId(claimDetails.PolicyId.Value);
                }
                else
                {
                    policyNumber = string.Empty;
                    personEvent = await _eventService.GetPersonEvent(action.PersonEventId);
                    claimsAssessorDetails = await this._userService.GetUserById(personEvent.CapturedByUserId);
                    var roleplayersPolicies = await this._policyService.GetPoliciesByRolePlayer(personEvent.InsuredLifeId);

                    foreach (var policies in roleplayersPolicies)
                    {
                        var policyNo = await this._policyService.GetPolicyNumber(policies.PolicyId);
                        policyNumber = string.IsNullOrEmpty(policyNumber) ? policyNo : $"{policyNumber}, {policyNo}";
                        policyOwnerDetails = await _rolePlayerService.GetPolicyOwnerByPolicyId(policies.PolicyId);
                    }
                }

                var claimantDetails = await _rolePlayerService.GetRolePlayer(personEvent.ClaimantId);
                var lifeAssured = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);
                var entity = await _claimInvoiceRepository.Where(c => c.ClaimId == action.ClaimId).FirstOrDefaultAsync();
                //var entity = await _claimInvoiceRepository.FindByIdAsync(claimInvoice.Id);

                beneficiaryFirstName = claimantDetails.Person.FirstName;
                beneficiaryFirstName = claimantDetails.Person.Surname;
                emailAddress = claimantDetails.EmailAddress;

                if (claimantDetails?.RolePlayerAddresses.Count() > 0)
                {
                    address = claimantDetails.RolePlayerAddresses[0].AddressLine1 + " " + claimantDetails.RolePlayerAddresses[0].AddressLine2;
                    city = claimantDetails.RolePlayerAddresses[0].City;
                    postalCode = claimantDetails.RolePlayerAddresses[0].PostalCode;
                }
                if (claimantDetails?.RolePlayerBankingDetails.Count() > 0)
                {
                    accountDetails = claimantDetails.RolePlayerBankingDetails[0].AccountNumber + ", " + claimantDetails.RolePlayerBankingDetails[0].BankName;
                }

                if (entity != null)
                {
                    await _claimInvoiceRepository.LoadAsync(entity, a => a.InvoiceAllocations);
                    await _claimInvoiceRepository.LoadAsync(entity, a => a.FuneralInvoice);
                    capAmount = entity.FuneralInvoice.CapAmount.ToString();
                    foreach (var invoiceAllocation in entity.InvoiceAllocations)
                    {
                        var beneficiaryDetails = await GetBeneficiaryAndBankAccountById(invoiceAllocation.BeneificaryRolePlayerId.Value, invoiceAllocation.RolePlayerBankingId.GetValueOrDefault());
                        beneficiaryFirstName = beneficiaryDetails.Firstname;
                        beneficiarySurname = beneficiaryDetails.Lastname;
                        emailAddress = beneficiaryDetails.Email;
                        address = beneficiaryDetails.AddressLine1;
                        city = beneficiaryDetails.AddressLine2;
                    }
                }


                var document = action.FraudulentCase.HasValue ? await _documentTemplateService.GetDocumentTemplateByName("Fraudulent Case Template") : await _documentTemplateService.GetDocumentTemplateByName(action.ActionType);

                var documentTokens = new Dictionary<string, string>();
                var documentTemplate = document.DocumentHtml;
                if (action.FraudulentCase.HasValue)
                {

                    StringBuilder documentList = new StringBuilder();
                    var key = new Dictionary<string, string>();
                    key.Add("PersonEvent", personEvent.PersonEventId.ToString());
                    var documentTypesIds = await _documentIndexService.GetAllDocumentTypesRecieved(key);
                    foreach (var documentTypeId in documentTypesIds)
                    {
                        var documentType = await _documentIndexService.GetDocumentTypeName(documentTypeId);
                        documentList.Append($@"<li /><p style =""margin-bottom: 0in""><font color = ""#000000"" >{documentType}</font ></p>");
                    }
                    var logoUrl = await _configurationService.GetModuleSetting(SystemSettings.PaymentManagerEmailLogo);
                    documentTokens = new Dictionary<string, string>
                    {
                        ["[logo]"] = logoUrl,
                        ["[policyOwnerBeneficaryIntialsSurname]"] = beneficiaryFirstName.Length != 0 ? $"{beneficiaryFirstName.Substring(0, 1)} {beneficiarySurname}" : $"{claimantDetails.Person.FirstName.Substring(0, 1)} {claimantDetails.Person.Surname}",
                        ["[policyOwnerBeneficaryAddress1]"] = address,
                        ["[policyOwnerBeneficaryAddress2]"] = city,
                        ["[policyOwnerBeneficaryPostalCode]"] = postalCode,
                        ["[CurrentDate]"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy"),
                        ["[policyNumber]"] = policyNumber,
                        ["[claimantNameSurname]"] = $"{claimantDetails.Person.FirstName} {claimantDetails.Person.Surname}",
                        ["[DateOfEvent]"] = personEvent.DateReceived.ToString("dd MMM yyyy"),
                        ["[claimType]"] = ClaimTypeEnum.Funeral.DisplayAttributeValue(),
                        ["[personEventId]"] = personEvent.PersonEventReferenceNumber,
                        ["[DateOfDeath]"] = personEvent.PersonEventDeathDetail.DeathDate.ToString("dd MMM yyyy"),
                        ["[policyOwnerIdNumber]"] = policyOwnerDetails.Person.IdNumber,
                        ["[InsuredLifeNameSurname]"] = $"{lifeAssured.Person.FirstName} {lifeAssured.Person.Surname}",
                        ["[insuredLifeIdnumber]"] = lifeAssured.Person.IdNumber,
                        ["[documentList]"] = documentList.ToString(),
                        ["[claimCloseReason]"] = "Fraudulent Claim",
                        ["[claimAssessorsNameSurname]"] = claimsAssessorDetails.DisplayName,
                        ["[policyOwnerIntialsSurname]"] = $"{policyOwnerDetails.Person.FirstName.Substring(0, 1)} {policyOwnerDetails.Person.Surname}",
                        ["{claimNumber}"] = personEvent.PersonEventId.ToString()
                    };
                    foreach (var token in documentTokens) documentTemplate = documentTemplate.Replace($"{token.Key}", token.Value);
                }
                else
                {
                    StringBuilder documentList = new StringBuilder();
                    var key = new Dictionary<string, string>();
                    key.Add("PersonEvent", personEvent.PersonEventId.ToString());
                    var policies = await _policyService.GetPoliciesByRolePlayer(personEvent.InsuredLifeId);
                    var isIndividual = true;
                    foreach (var policy in policies)
                    {
                        var roleplayer = await _rolePlayerService.GetRolePlayer(policy.PolicyOwnerId);
                        isIndividual = (roleplayer.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Person);
                    }
                    var deathType = await _eventService.GetPersonEventDeathType(personEvent.PersonEventId);
                    var documentRule = await _documentRuleRepository.Where(s => s.DeathType == deathType && s.IsIndividual == isIndividual)
                                          .Select(n => new DocumentRule
                                          {
                                              DocumentSet = n.DocumentSet
                                          }).SingleAsync();
                    var documentsNotReceieved = await _documentIndexService.GetAllDocumentsNotRecieved(documentRule.DocumentSet, key);
                    var documentTypeIds = documentsNotReceieved.Select(a => a.DocTypeId).ToList();
                    foreach (var documentTypeId in documentTypeIds)
                    {
                        var documentType = await _documentIndexService.GetDocumentTypeName(documentTypeId);
                        documentList.Append($@"<li /><p style =""margin-bottom: 0in""><font color = ""#000000"" >{documentType}</font ></p>");
                    }
                    var emailAudit = await _emailService.GetEmailAudit(personEvent.PersonEventId, "PersonEvent");
                    documentTokens = new Dictionary<string, string>
                    {

                        ["{title}"] = "",
                        ["{beneficiaryFirstName}"] = beneficiaryFirstName,
                        ["{beneficiaryLastName}"] = beneficiarySurname,
                        ["{address}"] = address,
                        ["{city}"] = city,
                        ["{postalCode}"] = postalCode,
                        ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy"),
                        ["{dateRequestLetterSent}"] = personEvent.CreatedDate.ToString("dd MMM yyyy"),
                        ["{dateFisrtFollowUp}"] = emailAudit.FirstOrDefault(a => a.Subject == "Outstanding Documents")?.CreatedDate.ToString("dd MMM yyyy"),
                        ["{dateSecondFollowUp}"] = emailAudit.Where(a => a.Subject == "Outstanding Documents").OrderByDescending(a => a.CreatedDate).FirstOrDefault()?.CreatedDate.ToString("dd MMM yyyy"),
                        ["{policyNumber}"] = policyNumber,
                        ["{lifeAssured}"] = lifeAssured.Person.FirstName + " " + lifeAssured.Person.Surname,
                        ["{claimType}"] = "Funeral",
                        ["{offerAmount}"] = capAmount,
                        ["{bankAccountNo}"] = accountDetails,
                        ["{offerAmountInWords}"] = "",
                        ["{NameClaimsAssessor}"] = claimsAssessorDetails.DisplayName,
                        ["{claimOutstandingRequirement}"] = documentList.ToString(),
                        ["{claimNumber}"] = personEvent.PersonEventId.ToString()

                    };
                    foreach (var token in documentTokens) documentTemplate = documentTemplate.Replace($"{token.Key}", token.Value);
                }

                _headerCollection = await GetHeaderCollection(_headerCollection);
                var parameters = GetReportParameters(action.ClaimId);
                if (!string.IsNullOrEmpty(parameters))
                {
                    await SetupClaimCommunicationVariables();
                    letterPdf.AttachmentByteData = await GetUriDocumentByteData(
                        new Uri($"{_reportserverUrl}/RMAClaimStatusUpdateLetter{parameters}&rs:Format=PDF"), _headerCollection);
                }

                if (action.ActionType == "Ex-gratia letter")
                {
                    var emailTemplate = await _emailTemplateService.GenerateTemplateContent(TemplateTypeEnum.Exgratialetter, documentTokens);
                    letterPdf.AttachmentByteData = await _documentGeneratorService.ConvertHtmlToPdf(emailTemplate.Content);
                    letterPdf.FileType = document.DocumentMimeType;
                    letterPdf.FileName = document.DocumentName;
                }
                else
                {
                    letterPdf.FileType = document.DocumentMimeType;
                    letterPdf.FileName = document.DocumentName;
                }

                var mail = new MailAttachment()
                {
                    AttachmentByteData = letterPdf.AttachmentByteData,
                    FileName = letterPdf.FileName,
                    FileType = letterPdf.FileType
                };
                listOfDocument.Add(mail);

                var counter = 0;
                var attachmentMailAttachments = new MailAttachment[listOfDocument.Count];
                foreach (var item in listOfDocument)
                {
                    attachmentMailAttachments[counter] = item;
                    counter++;
                }

                //check preferred method of communication
                var preferredCommunication = claimantDetails.PreferredCommunicationTypeId;
                switch (preferredCommunication)
                {
                    case (int)CommunicationTypeEnum.Email:
                        var email = new SendMailRequest()
                        {
                            ItemId = action.ClaimId != 0 ? action.ClaimId : action.PersonEventId,
                            ItemType = action.ClaimId != 0 ? "Claim" : "PersonEvent",
                            Department = RMADepartmentEnum.Claims,
                            BusinessArea = BusinessAreaEnum.ClaimActionNotification,
                            Subject = action.ActionType,
                            FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                            Recipients = emailAddress,
                            Body = documentTemplate,
                            IsHtml = true,
                            Attachments = attachmentMailAttachments
                        };
                        var sendEmail = await _sendEmailService.SendEmail(email);
                        break;
                    case (int)CommunicationTypeEnum.SMS:
                        var smsRequest = new SendSmsRequest() { Department = RMADepartmentEnum.Claims, BusinessArea = BusinessAreaEnum.ClaimActionNotification };
                        switch (action.ActionType)
                        {
                            case "Claim closed letter":
                                smsRequest.Message = "RMA has closed claim " + personEvent.PersonEventReferenceNumber + ".To re-open this claim, please submit outstanding information to RMA.For details contact 0860102532.";
                                break;
                            case "Claim cancel letter":
                                smsRequest.Message = "RMA has cancelled claim " + personEvent.PersonEventReferenceNumber + ".To re-open this claim, please submit outstanding information to RMA.For details contact 0860102532.";
                                break;
                            case "Ex-gratia letter":
                                smsRequest.Message = "RMA has approved Ex-gratia for claim " + personEvent.PersonEventReferenceNumber + ".For details contact 0860102532.";
                                break;
                        }
                        smsRequest.SmsNumbers = new List<string>();
                        smsRequest.SmsNumbers.Add(claimantDetails.CellNumber);
                        smsRequest.WhenToSend = DateTimeHelper.SaNow;
                        smsRequest.ItemId = action.ClaimId != 0 ? action.ClaimId : action.PersonEventId;
                        smsRequest.ItemType = action.ClaimId != 0 ? ItemTypeEnum.Claim.DisplayAttributeValue() : ItemTypeEnum.PersonEvent.DisplayAttributeValue();
                        try
                        {
                            if (!string.IsNullOrEmpty(smsRequest.Message))
                            {
                                var smsResult = await _sendSmsService.SendSmsMessage(smsRequest);
                            }
                        }
                        catch (Exception e)
                        {
                            e.LogException();
                        }
                        break;
                }
            }
        }

        private async Task SetupClaimCommunicationVariables()
        {
            _reportserverUrl = $"{await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl)}RMA.Reports.ClaimCare";
        }

        private async Task<byte[]> GetUriDocumentByteData(Uri url, WebHeaderCollection webHeaderCollection = null)
        {
            return await url.GetUriDataAsync(webHeaderCollection);
        }

        private async Task<WebHeaderCollection> GetHeaderCollection(WebHeaderCollection headerCollection)
        {
            if (headerCollection == null)
            {
                var environment = await _configurationService.GetModuleSetting("Environment");
                headerCollection = new WebHeaderCollection
                    {
                        { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                        { SystemSettings.Environment,  environment}
                    };
            }
            return headerCollection;
        }

        private string GetReportParameters(int claimId)
        {
            return $"&ClaimId={claimId}&rs:Command=ClearSession";
        }

        public async Task<bool> SendEmailNotificationToApproverAfterReversal(ClaimInvoice claimInvoice, ClaimEmailAction action)
        {
            int sendEmail = 0;

            foreach (var invoiceAllocation in claimInvoice?.InvoiceAllocations)
            {
                string capAmount = string.Empty;
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var letterPdf = new MailAttachment();
                    var listOfDocument = new List<MailAttachment>();
                    var listOfAttachmentIds = new List<int>();

                    var claimDetails = await GetClaim(claimInvoice.ClaimId);
                    var funeralInvoice = await _funeralInvoiceRepository.Where(f => f.ClaimInvoiceId == claimInvoice.Id).FirstOrDefaultAsync();
                    var personEvent = await _personEventRepository.Where(e => e.PersonEventId == claimDetails.PersonEventId).FirstOrDefaultAsync();
                    var lifeAssured = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);
                    var assessor = await GetAssessorThatApprovedClaim(claimInvoice.ClaimId);

                    var docTemplate = new Admin.MasterDataManager.Contracts.Entities.DocumentTemplate();
                    if (action?.ActionType == "Approve unpaid reversal")
                    {
                        docTemplate = await _documentTemplateService.GetDocumentTemplateByName(DocumentTypeEnum.Approveunpaidreversal.DisplayAttributeValue());
                        listOfAttachmentIds.Add(docTemplate.DocumentTypeId);
                    }
                    else if (action.ActionType == "Reject unpaid reversal")
                    {
                        docTemplate = await _documentTemplateService.GetDocumentTemplateByName(DocumentTypeEnum.Rejectunpaidreversal.DisplayAttributeValue());
                        listOfAttachmentIds.Add(docTemplate.DocumentTypeId);
                    }

                    var documentTemplate = docTemplate.DocumentHtml;
                    capAmount = funeralInvoice.CapAmount.ToString();
                    var documentTokens = new Dictionary<string, string>
                    {
                        ["{claimsAssessor}"] = assessor.DisplayName,
                        ["{claimNumber}"] = personEvent.PersonEventReferenceNumber,
                        ["{amount}"] = capAmount,
                        ["{deceasedInitialsSurname}"] = lifeAssured.Person.FirstName + " " + lifeAssured.Person.Surname,
                        ["{userThatApprovedReversal}"] = RmaIdentity.DisplayName,
                        ["{userThatRejectedReversal}"] = RmaIdentity.DisplayName,
                    };
                    foreach (var token in documentTokens)
                    {
                        documentTemplate = documentTemplate.Replace($"{token.Key}", token.Value);
                    }
                    letterPdf.AttachmentByteData = await _documentGeneratorService.ConvertHtmlToPdf(documentTemplate);
                    letterPdf.FileType = docTemplate.DocumentMimeType;
                    letterPdf.FileName = docTemplate.DocumentName;

                    var mail = new MailAttachment()
                    {
                        AttachmentByteData = letterPdf.AttachmentByteData,
                        FileName = letterPdf.FileName,
                        FileType = letterPdf.FileType
                    };
                    listOfDocument.Add(mail);

                    var counter = 0;
                    var attachmentMailAttachments = new MailAttachment[listOfDocument.Count];
                    foreach (var document in listOfDocument)
                    {
                        attachmentMailAttachments[counter] = document;
                        counter++;
                    }

                    var email = new SendMailRequest()
                    {
                        Subject = action.ActionType,
                        FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                        Recipients = assessor.Email,
                        Body = documentTemplate,
                        IsHtml = true,
                        Attachments = null,
                        ItemId = claimDetails.ClaimId,
                        ItemType = ItemTypeEnum.Claim.DisplayAttributeValue(),
                        Department = RMADepartmentEnum.Claims,
                        BusinessArea = BusinessAreaEnum.ClaimActionNotification
                    };

                    sendEmail = await _sendEmailService.SendEmail(email);
                }
            }

            return sendEmail == 200;
        }

        public async Task<int> CreateClaimInvoice(ClaimInvoice claimInvoice)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddInvoice);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {

                var claim = await _claimRepository.Where(c => c.ClaimId == claimInvoice.ClaimId).SingleOrDefaultAsync();
                var personEvent = await _personEventRepository.Where(a => a.PersonEventId == claim.PersonEventId).SingleOrDefaultAsync();

                var insuredLives = await _policyInsuredlifeService.GetPolicyInsuredLives(claim.PolicyId.Value);
                var insuredLife = insuredLives.Where(x => x.RolePlayerId == personEvent.InsuredLifeId).FirstOrDefault();

                var claimBenefit = await _claimBenefitRepository.Where(n => n.ClaimId == claimInvoice.ClaimId && n.BenefitId == insuredLife.StatedBenefitId).OrderByDescending(t => t.ClaimBenefitId).FirstOrDefaultAsync();
                var claimInvoiceId = await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.ClaimInvoiceId);
                claim_ClaimInvoice newClaimInvoice = new claim_ClaimInvoice()
                {
                    ClaimInvoiceId = claimInvoiceId,
                    AuthorisedAmount = claimInvoice.AuthorisedAmount,
                    ClaimId = claimInvoice.ClaimId,
                    ClaimInvoiceDecision = claimInvoice.Decision,
                    ClaimInvoiceType = claimInvoice.ClaimInvoiceType,
                    DateApproved = DateTime.Now.ToSaDateTime(),
                    DateReceived = DateTime.Now.ToSaDateTime(),
                    DateSubmitted = DateTime.Now.ToSaDateTime(),
                    InvoiceAmount = claimInvoice.InvoiceAmount,
                    InvoiceDate = DateTime.Now.ToSaDateTime(),
                    AuthorisedVat = claimInvoice.AuthorisedVat,
                    ClaimBenefitId = claimBenefit.ClaimBenefitId,
                    InvoiceVat = claimInvoice.InvoiceVat,
                    ClaimInvoiceStatusId = (int)ClaimInvoiceStatus.Assessed, //30: Assessed TODO remove  claimInvoice.ClaimInvoiceStatusId,
                    IsAuthorised = claimInvoice.IsAuthorised,
                    PayeeRolePlayerBankAccountId = claimInvoice.PayeeRolePlayerBankAccountId,
                    PayeeRolePlayerId = claimInvoice.PayeeRolePlayerId
                };

                claim_FuneralInvoice funeralInvoice = new claim_FuneralInvoice();
                funeralInvoice.ClaimInvoiceId = claimInvoiceId;
                funeralInvoice.BankAccountId = 3; //// 3: RMA Life Funeral TODO Remove  claimInvoice.BankAccountId,
                funeralInvoice.CapAmount = claimInvoice.CapAmount;
                funeralInvoice.ClaimInvoiceDecision = claimInvoice.Decision;
                if (await _configurationService.IsFeatureFlagSettingEnabled("FuneralCoverAmount"))
                {
                    funeralInvoice.CoverAmount = claimBenefit.EstimatedValue;
                }
                else
                {
                    funeralInvoice.CoverAmount = claimInvoice.AuthorisedAmount;
                }
                funeralInvoice.OutstandingPremiumAmount = claimInvoice.OutstandingPremium;
                funeralInvoice.ReferenceNumber = claimInvoice.ClaimReferenceNumber;
                funeralInvoice.RefundAmount = claimInvoice.Refund;
                funeralInvoice.TracingFees = claimInvoice.TracingFees;
                funeralInvoice.UnclaimedPaymentInterest = claimInvoice.UnclaimedPaymentInterest;
                if (claimInvoice.DecisionReasonId != null)
                    funeralInvoice.ClaimInvoiceDeclineReason = (ClaimInvoiceDeclineReasonEnum)claimInvoice.DecisionReasonId;
                if (claimInvoice.ReversalReasonId != null)
                    funeralInvoice.ClaimInvoiceReversalReason = (ClaimInvoiceReversalReasonEnum)claimInvoice.ReversalReasonId;

                var result = _claimInvoiceRepository.Create(newClaimInvoice);
                var funeralInvoiceResult = _funeralInvoiceRepository.Create(funeralInvoice);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return newClaimInvoice.ClaimInvoiceId;
            }
        }

        private async Task<int> CreateInvoiceAllocation(InvoiceAllocation invoiceAllocation)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddPayments);


            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                claim_InvoiceAllocation entity = new claim_InvoiceAllocation()
                {
                    AssessedAmount = invoiceAllocation.AssessedAmount,
                    AllocationGroup = invoiceAllocation.AllocationGroup,
                    AssessedVat = invoiceAllocation.AssessedVat,
                    BeneificaryRolePlayerId = invoiceAllocation.BeneificaryRolePlayerId,
                    ClaimInvoiceId = invoiceAllocation.ClaimInvoiceId,
                    InvoiceAllocationStatusId = invoiceAllocation.InvoiceAllocationStatusId,
                    // InvoiceTypeId = invoiceAllocation.InvoiceTypeId, column not in db tt files removed this please check the DB
                    PaymentMethod = (PaymentMethodEnum)invoiceAllocation.PaymentMethod,
                    PercentAllocation = invoiceAllocation.PercentAllocation,
                    RolePlayerBankingId = invoiceAllocation.RolePlayerBankingId
                };

                //var entity = Mapper.Map<claim_InvoiceAllocation>(invoiceAllocation);
                _invoiceAllocationRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.InvoiceAllocationId;
            }
        }

        public async Task CreateInvoiceAllocations(List<InvoiceAllocation> invoiceAllocations, int claimInvoiceId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddPayments);

            foreach (var invoiceAllocation in invoiceAllocations)
            {
                using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
                {
                    claim_InvoiceAllocation entity = new claim_InvoiceAllocation()
                    {
                        AssessedAmount = invoiceAllocation.AssessedAmount,
                        AllocationGroup = invoiceAllocation.AllocationGroup,
                        AssessedVat = invoiceAllocation.AssessedVat,
                        BeneificaryRolePlayerId = invoiceAllocation.BeneificaryRolePlayerId,
                        ClaimInvoiceId = claimInvoiceId,
                        InvoiceAllocationStatusId = invoiceAllocation.InvoiceAllocationStatusId,
                        // InvoiceTypeId = invoiceAllocation.InvoiceTypeId, column not in db tt files removed this please check the DB
                        PaymentMethod = (PaymentMethodEnum)invoiceAllocation.PaymentMethod,
                        PercentAllocation = invoiceAllocation.PercentAllocation,
                        RolePlayerBankingId = invoiceAllocation.RolePlayerBankingId
                    };

                    //var entity = Mapper.Map<claim_InvoiceAllocation>(invoiceAllocation);
                    _invoiceAllocationRepository.Create(entity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        private async Task<int> CreateWizard(int claimId)
        {
            using (_dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var wizardObject = new StartWizardRequest()
                {
                    Type = "register-funeral-claim",
                    LinkedItemId = claimId
                };

                var wizard = await _wizardService.StartWizard(wizardObject);

                //await _wizardService.SubmitWizard(wizard.Id);

                return wizard.Id;
            }
        }

        private async Task<MailAttachment> CreatePdfDocument(DocumentTypeEnum documentType, DocumentDetails documentDetails)
        {
            var documentTemplate = await _documentTemplateService.GetDocumentTemplateByDocumentType(documentType);
            var documentsToken = new Dictionary<string, string>()
            {
                ["{policyNumber}"] = documentDetails.PolicyNumber,
                ["{deceasedFirstName}"] = documentDetails.PersonFirstName,
                ["{deceasedLastName}"] = documentDetails.PersonLastName,
                ["{address1}"] = documentDetails.Address1,
                ["{address2}"] = documentDetails.Address1,
                ["{address3}"] = documentDetails.Address1,
            };

            foreach (var token in documentsToken)
            {
                documentTemplate.DocumentHtml = documentTemplate.DocumentHtml.Replace($"{token.Key}", token.Value);
            }

            var mailAttachment = new MailAttachment()
            {
                AttachmentByteData =
                    await _documentGeneratorService.ConvertHtmlToPdf(documentTemplate.DocumentHtml),
                FileType = documentTemplate.DocumentMimeType,
                FileName = documentTemplate.DocumentName
            };

            return mailAttachment;
        }

        private async Task<int?> GetLastWorkedOnUser(int claimId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                int? userId = null;

                var allRagResults = await _claimWorkflowRepository.Where(t => t.ClaimId == claimId).OrderByDescending(t => t.ClaimWorkflowId).ToListAsync();
                if (allRagResults.Count > 0)
                {
                    var latestRagResult = allRagResults.First(t => t.ClaimId == claimId);
                    var previousRagResult = allRagResults.Where(t => t.ClaimId == claimId).Skip(1).FirstOrDefault();
                    var ragCount = allRagResults.Where(t => t.ClaimId == claimId).ToList();
                    var ragCountWithUser = allRagResults.Where(t => t.ClaimId == claimId && t.AssignedToUserId != null).ToList();

                    if (previousRagResult != null && previousRagResult.AssignedToUserId == null && ragCount.Count() >= 2)
                    {
                        if (latestRagResult.AssignedToUserId == null && ragCountWithUser.Count() >= 1)
                        {
                            previousRagResult = ragCountWithUser.FirstOrDefault();
                        }
                        else
                        {
                            previousRagResult = ragCountWithUser.Skip(1).FirstOrDefault();
                        }
                    }

                    if (previousRagResult != null && previousRagResult.AssignedToUserId != null)
                    {
                        userId = previousRagResult.AssignedToUserId;
                    }
                }
                return userId;
            }

        }

        private async Task<int?> GetPreviousAssessorWorked(int claimId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                int? userId = null;

                var allRagResults = await _claimWorkflowRepository.Where(t => t.ClaimId == claimId && t.EndDateTime != null && t.AssignedToUserId != null).OrderByDescending(t => t.ClaimWorkflowId).ToListAsync();
                if (allRagResults.Count > 0)
                {
                    foreach (var user in allRagResults)
                    {
                        var userRole = await _userService.GetUserById(user.AssignedToUserId.GetValueOrDefault());
                        if (userRole.RoleName == ClaimsAssessorRole)
                            return user.AssignedToUserId;
                    }
                }
                return userId;
            }
        }

        private async Task<User> GetAssessorThatApprovedClaim(int claimId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var user = new User();

                var allRagResults = await _claimWorkflowRepository
                    .Where(t => t.ClaimId == claimId
                        && t.ClaimStatus == ClaimStatusEnum.Approved
                        && t.AssignedToUserId != null)
                    .OrderByDescending(t => t.ClaimWorkflowId)
                    .ToListAsync();
                if (allRagResults.Count > 0)
                {
                    var item = allRagResults.First();
                    var userDetails = await _userService
                        .GetUserById(item.AssignedToUserId.GetValueOrDefault());
                    return userDetails;
                }
                return user;
            }
        }

        private async Task<int> GetAssessorWhoInvokedRecovery(int claimId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claimRecovery = await _claimsRecoveryRepository
                    .Where(t => t.ClaimId == claimId).FirstOrDefaultAsync();

                return claimRecovery.AssignedToUserId.GetValueOrDefault();
            }
        }

        private async Task<string> GetAssessorNameDeclined(int claimId)
        {
            string userName = string.Empty;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var allRagResults = await _claimWorkflowRepository.Where(t => t.ClaimId == claimId).OrderByDescending(t => t.ClaimWorkflowId).ToListAsync();
                foreach (var item in allRagResults)
                {
                    var user = await _userService.GetUserById(item.AssignedToUserId.GetValueOrDefault());
                    if (user.RoleName == ClaimsAssessorRole)
                        return user.DisplayName;
                }
            }
            return userName;
        }

        private async Task<Beneficiary> GetBeneficiaryByClaimId(int claimId)
        {
            var claim = await GetClaim(claimId);
            var personEventItem = await _eventService.GetPersonEvent(claim.PersonEventId);
            var beneficiaries = await _rolePlayerService.GetInsuredLifeByPolicyId(claim.PolicyId.Value);

            // Return if no beneficiary
            if (beneficiaries.Count == 0)
                return new Beneficiary
                {
                    Id = 0,
                    MessageText = BeneficiaryNotExist
                };

            // Beneficiary cannot be deceased
            beneficiaries = beneficiaries.Where(b => b.RolePlayerId != personEventItem.InsuredLifeId).ToList();
            if (beneficiaries.Count == 0)
                return new Beneficiary
                {
                    Id = 0,
                    MessageText = BeneficiaryDeceased
                };

            var beneficiaryDetails = new List<Beneficiary>();
            foreach (var beneficiary in beneficiaries)
                beneficiaryDetails.Add(new Beneficiary
                {
                    BeneficiaryId = beneficiary.RolePlayerId,
                    IdNumber = beneficiary.Person.IdNumber,
                    PassportNumber = beneficiary.Person.PassportNumber,
                    Firstname = beneficiary.Person.FirstName,
                    Lastname = beneficiary.Person.Surname,
                    DateOfBirth = beneficiary.Person.DateOfBirth,
                    Email = beneficiary.EmailAddress,
                    ContactNumber = beneficiary.TellNumber,
                    RelationOfDeceased = "Unknown", //No data at this present moment
                    BankAccounts = new List<BeneficiaryBankAccount>(),
                    InsuredLifeId = personEventItem.InsuredLifeId
                });

            return beneficiaryDetails.FirstOrDefault(); //BUG what if there was more than one?
        }

        private async Task<string> GenerateUniqueReferenceNumber()
        {
            var referenceNumberPrefix = DateTimeHelper.SaNow.ToString("yy");
            var claimUniqueReference = await _claimRepository.OrderByDescending(x => x.ClaimId)
                .Select(c => c.ClaimReferenceNumber)
                .FirstOrDefaultAsync();

            if (string.IsNullOrEmpty(claimUniqueReference)) return $"{referenceNumberPrefix}000001";

            var match = Regex.Match(claimUniqueReference, @"[0-9]{8}");

            if (!match.Success) return $"{referenceNumberPrefix}000001";

            var claimReferenceNumber = claimUniqueReference.Substring(2);
            var referenceNumber = Convert.ToInt32(claimReferenceNumber);
            if (referenceNumber == 999999) referenceNumber = 1;

            return $"{referenceNumberPrefix}{++referenceNumber:D6}";
        }

        private async Task<MailAttachment[]> GetAttachments(List<DocumentTypeEnum> documentTypeId, DocumentDetails documentDetails)
        {
            var listOfDocument = new List<MailAttachment>();
            var counter = 0;
            foreach (var documentType in documentTypeId.ToList())
            {
                if (documentType == DocumentTypeEnum.ContinuationForm)
                {
                    var mailAttachment = await CreatePdfDocument(documentType, documentDetails);
                    listOfDocument.Add(mailAttachment);
                }

                var attachment = await _documentTemplateService.GetDocumentTemplateByDocumentType(documentType);
                if (attachment != null)
                {
                    var mail = new MailAttachment()
                    {
                        AttachmentByteData =
                            await _documentGeneratorService.ConvertHtmlToPdf(attachment.DocumentHtml),
                        FileName = attachment.DocumentName,
                        FileType = attachment.DocumentMimeType
                    };
                    listOfDocument.Add(mail);
                }
            }

            var attachmentMailAttachments = new MailAttachment[listOfDocument.Count];
            foreach (var document in listOfDocument)
            {
                attachmentMailAttachments[counter] = document;
                counter++;
            }

            return attachmentMailAttachments;

        }

        public async Task<ManageClaim> GetManageClaimDetailsById(int claimId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var claim = await GetClaim(claimId);
                //var personEvent = await _eventService.GetPersonEvent(claim.PersonEventId);
                if (claim == null) return null;

                var personEvent = await _personEventRepository.FindByIdAsync(claim.PersonEventId);
                var personEventDeathDetail =
                    await _eventService.GetPersonEventDeathDetail(personEvent.PersonEventId);
                var claimRefNumber = claim.ClaimReferenceNumber;

                //For testing purposes
                return new ManageClaim
                {
                    ClaimId = claim.ClaimId,
                    FirstName = "Mandla",
                    LastName = "Duma",
                    CauseOfDeath = personEventDeathDetail.DeathType.ToString(),
                    ClaimRefNumber = claim?.ClaimReferenceNumber,
                    TypeOfDeath = personEventDeathDetail.DeathType.DisplayDescriptionAttributeValue(),
                    DateOfDeath = personEventDeathDetail.DeathDate, //field is not set as nullable
                    DateOfBirth = DateTime.Parse("1981-03-03"),
                    PolicyNumber = "999494",
                    Email = "me@test.co.za",
                    MobileNumber = "+278525665",
                    IdentityNumber = "8112145182056",
                };
            }
        }

        public async Task<ClaimPayment> GetClaimPaymentForAuthorisation(int claimId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claimPayment = new ClaimPayment();

                var result = await (from invoice in _claimInvoiceRepository
                                    join allocation in _invoiceAllocationRepository on invoice.ClaimInvoiceId equals allocation.ClaimInvoiceId
                                    join funeral in _funeralInvoiceRepository on invoice.ClaimInvoiceId equals funeral.ClaimInvoiceId
                                    select new ClaimPayment
                                    {
                                        Decision = invoice.ClaimInvoiceDecision,
                                        ClaimId = invoice.ClaimId,
                                        ClaimAmount = funeral.CapAmount,
                                        Refund = funeral.RefundAmount,
                                        OutstandingPremium = funeral.OutstandingPremiumAmount,
                                        ClaimInvoiceDeclineReason = funeral.ClaimInvoiceDeclineReason,
                                        BeneficiaryId = allocation.BeneificaryRolePlayerId.Value,
                                        CapturedDate = invoice.DateReceived,
                                        ClaimInvoiceId = invoice.ClaimInvoiceId,
                                        BankAccountId = funeral.BankAccountId,
                                        RolePlayerBankingId = allocation.RolePlayerBankingId,
                                        ClaimInvoiceReversalReason = funeral.ClaimInvoiceReversalReason
                                    }).SingleOrDefaultAsync(t => t.ClaimId == claimId);

                if (result == null)
                {
                    claimPayment.PaymentId = null;
                    claimPayment.ClaimId = claimId;
                    claimPayment.ClaimAmount = 0;
                    claimPayment.Refund = 0;
                    claimPayment.OutstandingPremium = 0;
                    claimPayment.Decision = ClaimInvoiceDecisionEnum.Default;

                    return claimPayment;
                }
                return result;
            }
        }

        public async Task<bool> RequestOutstandingDocuments(AdditionalDocument additionalDocument)
        {

            int personEventId = 0;
            foreach (var item in additionalDocument?.Keys)
            {
                var key = item.Key;
                personEventId = Convert.ToInt32(item.Value);
            }
            if (additionalDocument.CommunicationType == CommunicationTypeEnum.Email)
            {
                var continuationFormPdf = new MailAttachment();
                var listOfDocument = new List<MailAttachment>();

                if (additionalDocument.DocumentTypeIds.Contains(Convert.ToInt32(DocumentTypeEnum.ContinuationForm)))
                {
                    additionalDocument.DocumentTypeIds.Remove((int)DocumentTypeEnum.ContinuationForm);
                    var continuationDoc = await _documentTemplateService.GetDocumentTemplateByName(DocumentTypeEnum.ContinuationForm.DisplayAttributeValue());
                    var detailsForLetter = await GetDetailsForFormLetter(personEventId);
                    var documentTemplate = continuationDoc.DocumentHtml;
                    var documentTokens = new Dictionary<string, string>
                    {
                        ["{policyNumber}"] = detailsForLetter.PolicyNumber,
                        ["{deceasedFirstName}"] = detailsForLetter.PersonFirstName,
                        ["{deceasedLastName}"] = detailsForLetter.PersonLastName,
                        ["{address1}"] = detailsForLetter.Address1,
                        ["{address2}"] = detailsForLetter.Address2,
                        ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy")
                    };
                    foreach (var token in documentTokens) documentTemplate = documentTemplate.Replace($"{token.Key}", token.Value);

                    continuationFormPdf.AttachmentByteData = await _documentGeneratorService.ConvertHtmlToPdf(documentTemplate);
                    continuationFormPdf.FileType = continuationDoc.DocumentMimeType;
                    continuationFormPdf.FileName = continuationDoc.DocumentName;

                    listOfDocument.Add(continuationFormPdf);

                }

                var attachments = await _documentTemplateService.GetDocumentTemplateByIds(additionalDocument.DocumentTypeIds);
                if (attachments != null)
                {
                    foreach (var attachment in attachments)
                    {
                        listOfDocument.Add(attachment);
                    }
                }

                MailAttachment[] attachmentMailAttachments = new MailAttachment[listOfDocument.Count];
                var counter = 0;
                foreach (var documents in listOfDocument)
                {
                    attachmentMailAttachments[counter] = documents;
                    counter++;
                }

                var documentManagementHeader = await GetDocumentManagementHeader(Convert.ToInt32(personEventId));
                var templateType = additionalDocument.TemplateType.HasValue ? additionalDocument.TemplateType.Value : TemplateTypeEnum.FollowUp1emailTemplate;
                var html = await GenerateHtmlBody(documentManagementHeader, additionalDocument.DocumentTypeIds, false, templateType);

                var email = new SendMailRequest()
                {
                    Subject = "Follow Up for Outstanding Documents",
                    FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                    Recipients = additionalDocument.Email,
                    Body = html,
                    IsHtml = true,
                    Attachments = attachmentMailAttachments,
                    ItemId = personEventId,
                    ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                    Department = RMADepartmentEnum.Claims,
                    BusinessArea = BusinessAreaEnum.ClaimActionNotification
                };
                var sendEmail = await _sendEmailService.SendEmail(email);
                return sendEmail == 200;

            }
            else
            {
                var tokens = new Dictionary<string, string>();
                var name = "";
                if (additionalDocument.TemplateType.HasValue)
                {
                    if (additionalDocument.TemplateType.Value == TemplateTypeEnum.FirstFollowUpSms)
                    {
                        name = "1st Follow Up Sms";
                    }
                    else
                    {
                        name = "2nd Follow Up Sms";
                    }
                }
                else
                {
                    name = "1st Follow Up Sms";
                }
                tokens.Add("claimNumber", personEventId.ToString());
                var smsNumber = new List<string>();
                smsNumber.Add(additionalDocument.Email);
                var smsNotification = new TemplateSmsRequest()
                {
                    Name = name,
                    Tokens = tokens,
                    SmsNumbers = smsNumber,
                    ItemId = personEventId,
                    ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue()
                };

                var sendSms = await _sendSmsService.SendTemplateSms(smsNotification);
                return sendSms == 1;
            }
        }

        public async Task<bool> RequestAdditionalDocuments(AdditionalDocument additionalDocument)
        {
            await _documentIndexService.UploadAdditionalDocumentTypes(additionalDocument);
            int personEventId = 0;
            foreach (var item in additionalDocument?.Keys)
            {
                var key = item.Key;
                personEventId = Convert.ToInt32(item.Value);
            }
            if (additionalDocument.CommunicationType == CommunicationTypeEnum.Email)
            {
                var continuationFormPdf = new MailAttachment();
                var listOfDocument = new List<MailAttachment>();

                if (additionalDocument.DocumentTypeIds.Contains(Convert.ToInt32(DocumentTypeEnum.ContinuationForm)))
                {
                    additionalDocument.DocumentTypeIds.Remove((int)DocumentTypeEnum.ContinuationForm);
                    var continuationDoc = await _documentTemplateService.GetDocumentTemplateByName(DocumentTypeEnum.ContinuationForm.DisplayAttributeValue());
                    var detailsForLetter = await GetDetailsForFormLetter(personEventId);
                    var documentTemplate = continuationDoc.DocumentHtml;
                    var documentTokens = new Dictionary<string, string>
                    {
                        ["{policyNumber}"] = detailsForLetter.PolicyNumber,
                        ["{deceasedFirstName}"] = detailsForLetter.PersonFirstName,
                        ["{deceasedLastName}"] = detailsForLetter.PersonLastName,
                        ["{address1}"] = detailsForLetter.Address1,
                        ["{address2}"] = detailsForLetter.Address2,
                        ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy")
                    };
                    foreach (var token in documentTokens) documentTemplate = documentTemplate.Replace($"{token.Key}", token.Value);

                    continuationFormPdf.AttachmentByteData = await _documentGeneratorService.ConvertHtmlToPdf(documentTemplate);
                    continuationFormPdf.FileType = continuationDoc.DocumentMimeType;
                    continuationFormPdf.FileName = continuationDoc.DocumentName;

                    listOfDocument.Add(continuationFormPdf);

                }
                //:todo need to wait for final claim process to be implemented
                //await _claimService.UpdateClaimStatus(new Contracts.Entities.Action()
                //{
                //    ClaimId = additionalDocument.ClaimId,
                //    Status = ClaimStatusEnum.PendingRequirements,
                //    UserId = RmaIdentity.UserId
                //});

                var attachments = await _documentTemplateService.GetDocumentTemplateByIds(additionalDocument.DocumentTypeIds);
                if (attachments != null)
                {
                    foreach (var attachment in attachments)
                    {
                        listOfDocument.Add(attachment);
                    }
                }

                MailAttachment[] attachmentMailAttachments = new MailAttachment[listOfDocument.Count];
                var counter = 0;
                foreach (var documents in listOfDocument)
                {
                    attachmentMailAttachments[counter] = documents;
                    counter++;
                }

                var documentManagementHeader = await GetDocumentManagementHeader(Convert.ToInt32(personEventId));

                var html = await GenerateHtmlBody(documentManagementHeader, additionalDocument.DocumentTypeIds, true, null);

                var email = new SendMailRequest()
                {
                    Subject = "Additional Documents",
                    FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                    Recipients = additionalDocument.Email,
                    Body = html,
                    IsHtml = true,
                    Attachments = attachmentMailAttachments,
                    ItemId = personEventId,
                    ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                    Department = RMADepartmentEnum.Claims,
                    BusinessArea = BusinessAreaEnum.ClaimActionNotification
                };
                var sendEmail = await _sendEmailService.SendEmail(email);
                return sendEmail == 200;

            }
            else
            {
                var tokens = new Dictionary<string, string>();

                tokens.Add("claimNumber", personEventId.ToString());
                var smsNumber = new List<string>();
                smsNumber.Add(additionalDocument.Email);
                var smsNotification = new TemplateSmsRequest()
                {
                    Name = "Requirements Outstanding Sms",
                    Tokens = tokens,
                    SmsNumbers = smsNumber,
                    ItemId = personEventId,
                    ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue()
                };

                var sendSms = await _sendSmsService.SendTemplateSms(smsNotification);
                return sendSms == 1;
            }
        }

        private async Task<ScanCare.Contracts.Entities.DocumentDetails> GetDetailsForFormLetter(int personEventId)
        {
            var documentDetails = new ScanCare.Contracts.Entities.DocumentDetails();
            var personEvent = await _eventService.GetPersonEvent(personEventId);
            var rolePlayerDetail = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);
            var rolpayeRolePlayerTypeId = rolePlayerDetail.PolicyInsuredLives.FirstOrDefault(c =>
                c.RolePlayerTypeId == (int)RolePlayerTypeEnum.MainMemberSelf)?.RolePlayerTypeId;
            if (rolpayeRolePlayerTypeId == (int)BeneficiaryTypeEnum.MainMemberself)
            {
                var policies = await _policyService.GetPoliciesByRolePlayer(personEvent.InsuredLifeId);
                var claimantDetails = await _rolePlayerService.GetRolePlayer(personEvent.ClaimantId);
                documentDetails.PersonFirstName = claimantDetails.Person.FirstName;
                documentDetails.PersonLastName = claimantDetails.Person.FirstName;
                documentDetails.PolicyNumber = await _policyService.GetPolicyNumber(Convert.ToInt32(policies.FirstOrDefault()?.PolicyId));
                documentDetails.Address1 = claimantDetails.RolePlayerAddresses.FirstOrDefault()?.AddressLine1;
                documentDetails.Address2 = claimantDetails.RolePlayerAddresses.FirstOrDefault()?.AddressLine2;
                return documentDetails;
            }

            return new ScanCare.Contracts.Entities.DocumentDetails();
        }

        public async Task<ScanCare.Contracts.Entities.DocumentDetails> GetDocumentManagementHeader(int personEventId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewDocument);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                string policyNumber = "";
                var personEvent = await _eventService.GetPersonEvent(personEventId);
                var roleplayersPolicies = await _policyService.GetPoliciesByRolePlayer(personEvent.InsuredLifeId);

                foreach (var policies in roleplayersPolicies)
                {
                    policyNumber = await _policyService.GetPolicyNumber(policies.PolicyId);
                }
                var deceasedDetails = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);

                return new ScanCare.Contracts.Entities.DocumentDetails()
                {
                    ClaimUniqueReference = personEvent.PersonEventId.ToString(),
                    PolicyNumber = policyNumber,
                    DeceasedFirstName = deceasedDetails.Person.FirstName,
                    DeceasedLastName = deceasedDetails.Person.Surname,
                    DateCreated = personEvent.DateCaptured.ToSaDateTime().ToString("dd MMM yyyy")
                };
            }
        }

        private async Task<string> GenerateHtmlBody(ScanCare.Contracts.Entities.DocumentDetails documentDetails, List<int> documentTypesIds, bool isAdditional, TemplateTypeEnum? templateType)
        {
            StringBuilder documentList = new StringBuilder();
            if (isAdditional)
            {
                var documentRule = await _documentIndexService.GetDocumentRule(DeathTypeEnum.Default, true); //5
                var emailTemplate = await _emailTemplateService.GetEmailTemplate(Convert.ToInt32(documentRule.EmailTemplateId));
                var htmlBody = emailTemplate.Template;

                foreach (var documentTypeId in documentTypesIds)
                {
                    var documentType = await _documentIndexService.GetDocumentTypeName(documentTypeId);
                    documentList.Append($@"<li /><p style =""margin-bottom: 0in""><font color = ""#000000"" >{documentType}</font ></p>");
                }
                var emailTokens = new Dictionary<string, string>()
                {
                    ["{policyNumber}"] = documentDetails.PolicyNumber,
                    ["{claimNumber}"] = documentDetails.ClaimUniqueReference,
                    ["{deceasedFirstName}"] = documentDetails.DeceasedFirstName,
                    ["{deceasedLastName}"] = documentDetails.DeceasedLastName,
                    ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy"),
                    ["{documentList}"] = documentList.ToString()
                };
                foreach (var token in emailTokens) htmlBody = htmlBody.Replace($"{token.Key}", token.Value);
                return htmlBody;
            }

            foreach (var documentTypeId in documentTypesIds)
            {
                var documentType = await _documentIndexService.GetDocumentTypeName(documentTypeId);
                documentList.Append($@"<li /><p style =""margin-bottom: 0in""><font color = ""#000000"" >{documentType}</font ></p>");
            }
            var emailAudit = await _emailService.GetEmailAudit(Convert.ToInt32(documentDetails.ClaimUniqueReference), "PersonEvent");
            var personEventdetails = await _eventService.GetPersonEvent(Convert.ToInt32(documentDetails.ClaimUniqueReference)); // same as personeventId
            var userDetails = await _userService.GetUserById(personEventdetails.CapturedByUserId);
            var oustandingEmailTokens = new Dictionary<string, string>()
            {
                ["{policyNumber}"] = documentDetails.PolicyNumber,
                ["{claimNumber}"] = documentDetails.ClaimUniqueReference,
                ["{Title}"] = documentDetails.PersonFirstName,
                ["{Surname}"] = documentDetails.PersonLastName,
                ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy"),
                ["{EmailDate}"] = documentDetails.DateCreated,
                ["{Address}"] = documentDetails.Address1,
                ["{City/Town}"] = documentDetails.Address2,
                ["{PostalCode}"] = documentDetails.Address3,
                ["{Life assured}"] = $"{documentDetails.DeceasedFirstName} {documentDetails.DeceasedLastName}",
                ["{documentList}"] = documentList.ToString(),
                ["{policyOwnerDetails}"] = $"{documentDetails.DeceasedFirstName} {documentDetails.DeceasedLastName}",
                ["{claimtype}"] = ClaimTypeEnum.Funeral.DisplayAttributeValue(),
                ["{claimsAssessorName}"] = userDetails.DisplayName
            };
            if (templateType.HasValue && templateType.Value == TemplateTypeEnum.FollowUp2emailTemplate)
            {
                oustandingEmailTokens.Add("{FirstFollowUpDate}", emailAudit.FirstOrDefault(a => a.Subject == "Outstanding Documents")?.CreatedDate.ToSaDateTime().ToString("dd MMM yyyy"));
            }

            var emailOutstandingTemplate = await _emailTemplateService.GenerateTemplateContent(templateType.HasValue ? templateType.Value : TemplateTypeEnum.FollowUp1emailTemplate, oustandingEmailTokens);
            return emailOutstandingTemplate.Content;

        }
        public async Task<WorkPool> GetClaimAndEventByClaimId(int claimId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewWorkPool);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await (from claim in _claimRepository
                                    join personEvent in _personEventRepository on claim.PersonEventId equals personEvent.PersonEventId
                                    select new WorkPool
                                    {
                                        ClaimId = claim.ClaimId,
                                        ClaimStatusId = (int)claim.ClaimStatus,
                                        ClaimUniqueReference = claim.ClaimReferenceNumber,
                                        InsuredLifeId = personEvent.InsuredLifeId,
                                        PolicyStatus = PolicyStatusEnum.Active,
                                        PolicyId = claim.PolicyId,
                                        WorkPoolEnum = WorkPoolEnum.FuneralClaimspool,
                                        WizardId = claim.WizardId
                                    }).FirstOrDefaultAsync(t => t.ClaimId == claimId);

                return result;
            }
        }

        public async Task<WorkPool> GetPersonEventByPersonEventId(int personEventId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await (from personEvent in _personEventRepository
                                    select new WorkPool
                                    {
                                        PersonEventId = personEvent.PersonEventId,
                                        ClaimId = null,
                                        ClaimStatusId = (int)personEvent.PersonEventStatus,
                                        ClaimUniqueReference = personEvent.PersonEventReferenceNumber,
                                        InsuredLifeId = personEvent.InsuredLifeId,
                                        PolicyStatus = PolicyStatusEnum.Active,
                                        PolicyId = null,
                                        WorkPoolEnum = WorkPoolEnum.FuneralClaimspool,
                                        WizardId = null
                                    }).FirstOrDefaultAsync(t => t.PersonEventId == personEventId);

                return result;
            }
        }

        public async Task<int> AddClaimNote(ClaimNote note)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddNote);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                //var entity = Mapper.Map<claim_ClaimNote>(note);
                //var result = _claimNoteRepository.Create(entity);
                try
                {
                    var result = _claimNoteRepository.Create(Mapper.Map<claim_ClaimNote>(new ClaimNote
                    {
                        PersonEventId = note.PersonEventId,
                        ClaimId = note.ClaimId,
                        Text = note.Text,
                    }));

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    return result.ClaimNoteId;
                }
                catch (Exception e)
                {
                    var error = e;
                    throw;
                }

            }
        }

        public async Task<PolicyClaim> GetSlaClaims(CoverTypeModel coverTypeModel)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyModel = new PolicyClaim()
                {
                    Claims = new List<Contracts.Entities.Claim>(),
                    policyCount = 0
                };

                if (coverTypeModel == null)
                {
                    return policyModel;
                }

                var claimList = await _claimRepository.SqlQueryAsync<Contracts.Entities.Claim>(
                     DatabaseConstants.GetClaimByCoverTypeIdBrokerageId,
                     new SqlParameter("CoverTypeIds", string.Join(",", coverTypeModel.CoverTypeIds.ToArray())),
                     new SqlParameter("BrokerageId", coverTypeModel.BrokerageId)
                     );

                if (!claimList.Any())
                {
                    return new PolicyClaim()
                    {
                        Claims = new List<Contracts.Entities.Claim>(),
                        policyCount = 0
                    };
                }

                foreach (var clm in claimList)
                {
                    var claim = Mapper.Map<Contracts.Entities.Claim>(clm);
                    policyModel.Claims.Add(claim);
                }
                policyModel.policyCount = claimList.Select(p => p.PolicyId).Distinct().Count();
                return policyModel;
            }
        }

        public async Task<ValidationResult> SendRecoveryEmail(List<ClaimInvoice> claimInvoices)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ProcessClaimRecovery);

            var validation = new ValidationResult();

            foreach (var claimInvoice in claimInvoices)
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    var personEventId = Convert.ToInt32(claimInvoice.ClaimReferenceNumber);
                    var personEvent = await _personEventRepository.Where(t => t.PersonEventId == personEventId).FirstOrDefaultAsync();
                    var claimant = await _rolePlayerService.GetRolePlayer(personEvent.ClaimantId);
                    var insuredLifeId = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);
                    var addressDetails = claimant.RolePlayerAddresses.FirstOrDefault();

                    var documentDetails = new DocumentDetails();
                    documentDetails.PersonFirstName = claimant.Person.FirstName;
                    documentDetails.PersonLastName = claimant.Person.Surname;
                    documentDetails.PolicyNumber = personEvent.PersonEventReferenceNumber;
                    if (addressDetails != null)
                    {
                        documentDetails.Address1 = addressDetails.AddressLine1;
                        documentDetails.Address2 = addressDetails.AddressLine2;
                        documentDetails.Address3 = addressDetails.PostalCode;
                    }
                    List<DocumentTypeEnum> documentTypes = new List<DocumentTypeEnum>();
                    documentTypes.Add(DocumentTypeEnum.GroupPolicySchedule);
                    var attachments = await GetAttachments(documentTypes, documentDetails);

                    var documentManagementHeader = new DocumentManagementHeader
                    {
                        ClaimUniqueReference = $"{personEvent.PersonEventId}",
                        PolicyNumber = claimInvoice.PolicyNumber,
                        Name = insuredLifeId.Person.FirstName,
                        Surname = insuredLifeId.Person.Surname,
                    };
                    var emailTokens = new Dictionary<string, string>
                    {
                        ["{policyNumber}"] = documentManagementHeader.PolicyNumber,
                        ["{claimNumber}"] = documentManagementHeader.ClaimUniqueReference,
                        ["{deceasedFirstName}"] = documentManagementHeader.Name,
                        ["{deceasedLastName}"] = documentManagementHeader.Surname,
                        ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy")
                    };

                    var documentTemplate = await _documentTemplateService.GetDocumentTemplateByDocumentType(DocumentTypeEnum.FuneralClaimRecoveryLetter);

                    //var htmlBody = (await _emailTemplateService.GetEmailTemplate(Convert.ToInt32(documentRule.EmailTemplateId))).Template;
                    foreach (var token in emailTokens) documentTemplate.DocumentHtml = documentTemplate.DocumentHtml.Replace($"{token.Key}", token.Value);

                    var claimantEmailRequest = new SendMailRequest
                    {
                        Recipients = claimant.EmailAddress,
                        Body = documentTemplate.DocumentHtml,
                        IsHtml = true,
                        FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                        Subject = "Claim Recovery",
                        Attachments = attachments,
                        ItemId = claimInvoice.ClaimId,
                        ItemType = ItemTypeEnum.Claim.DisplayAttributeValue(),
                        Department = RMADepartmentEnum.Claims,
                        BusinessArea = BusinessAreaEnum.ClaimActionNotification
                    };
                    var result = await _sendEmailService.SendEmail(claimantEmailRequest);

                    validation = new ValidationResult()
                    {
                        EmitDate = System.DateTime.Now,
                        Result = true,
                        Message = new List<string>() { $"Email sent to {claimInvoice.ClaimantEmail}" }
                    };
                }
            }

            if (!validation.Result)
            {
                validation = new ValidationResult()
                {
                    EmitDate = System.DateTime.Now,
                    Result = false,
                    Message = new List<string>() { "No action taken / User does not have permission" }
                };
            }
            return validation;
        }

        public async Task<ValidationResult> SendRecoverySms(List<ClaimInvoice> claimInvoices)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ProcessClaimRecovery);

            var validation = new ValidationResult();

            foreach (var claimInvoice in claimInvoices)
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    var personEventId = Convert.ToInt32(claimInvoice.ClaimReferenceNumber);
                    var personEvent = await _personEventRepository.Where(t => t.PersonEventId == personEventId).FirstOrDefaultAsync();
                    var claimant = await _rolePlayerService.GetRolePlayer(personEvent.ClaimantId);

                    var smsRequest = new SendSmsRequest() { Department = RMADepartmentEnum.Claims, BusinessArea = BusinessAreaEnum.ClaimRecoveryNotification };
                    smsRequest.SmsNumbers = new List<string>();
                    smsRequest.SmsNumbers.Add(claimant.CellNumber);
                    smsRequest.SmsNumbers.Add(claimant.TellNumber);
                    smsRequest.Message = "RMA has identified that the claim with claim no. " + claimInvoice.ClaimReferenceNumber + " is paid to you your by mistake. Please pay back the amount that is paid to you. Enquiry? Call 0860102532";
                    smsRequest.WhenToSend = DateTimeHelper.SaNow;
                    smsRequest.ItemId = personEventId;
                    smsRequest.ItemType = ItemTypeEnum.Claim.DisplayAttributeValue();
                    var result = await _sendSmsService.SendSmsMessage(smsRequest);

                    validation = new ValidationResult()
                    {
                        EmitDate = System.DateTime.Now,
                        Result = true,
                        Message = new List<string>() { $"SMS sent to {claimant.CellNumber}" }
                    };
                }
            }

            if (!validation.Result)
            {
                validation = new ValidationResult()
                {
                    EmitDate = System.DateTime.Now,
                    Result = false,
                    Message = new List<string>() { "No action taken / User does not have permission" }
                };
            }
            return validation;
        }

        public async Task<List<ClaimReOpenReason>> GetClaimRepayReasons()
        {
            List<ClaimReOpenReason> reOpenReasons = new List<ClaimReOpenReason>();
            foreach (ClaimRepayReasonEnum item in Enum.GetValues(typeof(ClaimRepayReasonEnum)))
            {
                ClaimReOpenReason reOpenReason = new ClaimReOpenReason();
                reOpenReason.ReasonId = (int)item;
                reOpenReason.ReasonDescription = item.DisplayAttributeValue();

                reOpenReasons.Add(reOpenReason);
            }

            return await Task.FromResult(reOpenReasons);
        }
        public async Task ApproveRejectEvent(Contracts.Entities.Event eventEntity)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AuthoriseEvent);

            if (eventEntity?.EventStatus == EventStatusEnum.Acknowledge)
            {
                await GeneratePersonEventClaims(eventEntity.PersonEvents);
            }
            var dataEventEntity = await _eventService.GetEvent(eventEntity.EventId);
            dataEventEntity.EventStatus = eventEntity.EventStatus;

            await _eventService.UpdateEvent(dataEventEntity);
        }

        public async Task<List<EmailAudit>> GetClaimNotificationAudit(string itemType, int itemId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var claimEmailAudits = new List<EmailAudit>();

                var claim = await _claimRepository
                        .Where(c => c.ClaimId == itemId || c.PersonEventId == itemId)
                        .Select(a => new { a.ClaimId, a.PersonEventId })
                        .FirstOrDefaultAsync();

                var personEventNotifications = await _emailService.GetEmailAudit(claim.PersonEventId, "PersonEvent");
                claimEmailAudits.AddRange(personEventNotifications);

                var claimNotifications = await _emailService.GetEmailAudit(claim.ClaimId, "Claim");
                claimEmailAudits.AddRange(claimNotifications);

                var ccaPoolNotifications = await _emailService.GetEmailAudit(claim.ClaimId, "CcaPool");
                claimEmailAudits.AddRange(ccaPoolNotifications);

                return claimEmailAudits;
            }
        }

        public async Task<PagedRequestResult<SmsAudit>> GetClaimSmsAudit(PagedRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);


            using (var scope = _dbContextScopeFactory.Create())
            {
                var resultString = Regex.Match(request?.SearchCriteria, @"\d+").Value;
                var itemId = Int32.Parse(resultString);
                var itemType = string.Concat(request.SearchCriteria.Where(char.IsLetter));

                if (itemType == "PersonEvent")
                {
                    return await _sendSmsService.GetSmsAudit(request);
                }
                else // Claim
                {
                    var personEventId = await _claimRepository.Where(c => c.ClaimId == itemId).Select(a => a.PersonEventId).FirstOrDefaultAsync();
                    var claimNotifications = await _sendSmsService.GetSmsAudit(request);
                    var personEventNotifications = await _sendSmsService.GetSmsAudit(new PagedRequest() { SearchCriteria = $"{personEventId}, PersonEvent" });
                    if (claimNotifications.Data == null)
                        claimNotifications.Data = new List<SmsAudit>();
                    if (personEventNotifications.Data != null)
                        claimNotifications.Data.AddRange(personEventNotifications?.Data);
                    claimNotifications.RowCount = claimNotifications.Data.Count;
                    return claimNotifications;
                }
            }
        }

        public async Task<ClaimTracerInvoice> GetUnclaimedBenefitValues(int claimId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewBenefit);

            using (_dbContextScopeFactory.Create())
            {
                var tracerInvoices = await _tracerInvoiceRepository
                                         .ProjectTo<ClaimTracerInvoice>()
                                          .Where(a => a.ClaimId == claimId)
                                          .OrderByDescending(a => a.CreatedDate)
                                          .ToListAsync();

                if (tracerInvoices.Count == 1)
                {
                    return tracerInvoices.First();
                }

                var tracerInvoice = tracerInvoices.FirstOrDefault();

                if (tracerInvoice != null)
                {
                    tracerInvoice.TracingFee = tracerInvoices.Sum(claimTracerInvoice =>
                        claimTracerInvoice.TracingFee.HasValue ? claimTracerInvoice.TracingFee.Value : 0);

                    return tracerInvoice;
                }

                return null;
            }
        }

        public async Task<ClaimsCalculatedAmount> GetClaimsCalculatedAmountByClaimId(int claimId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claimsCalculatedAmounts = await _claimsCalculatedRepository
                                          .ProjectTo<ClaimsCalculatedAmount>()
                                          .Where(a => a.ClaimId == claimId)
                                          .OrderByDescending(a => a.CreatedDate)
                                          .ToListAsync();

                if (claimsCalculatedAmounts.Count == 1)
                {
                    return claimsCalculatedAmounts.First();
                }

                var claimsCalculatedAmount = claimsCalculatedAmounts.FirstOrDefault();

                if (claimsCalculatedAmount != null)
                {
                    claimsCalculatedAmount.TracingFee = claimsCalculatedAmounts.Sum(calculatedAmount =>
                        calculatedAmount.TracingFee.HasValue ? calculatedAmount.TracingFee.Value : 0);
                    return claimsCalculatedAmount;
                }

                return null;
            }
        }

        public async Task SendFollowUpEmail()
        {
            using (_dbContextScopeFactory.Create())
            {
                var personEvents = await _eventService.GetAllPersonEvents();
                foreach (var personEvent in personEvents)
                {
                    try
                    {
                        var claimantDetails = await _rolePlayerService.GetRolePlayer(personEvent.ClaimantId);
                        var policies = await _policyService.GetPoliciesByRolePlayer(personEvent.InsuredLifeId);
                        var isIndividual = true;
                        foreach (var policy in policies)
                        {
                            var roleplayer = await _rolePlayerService.GetRolePlayer(policy.PolicyOwnerId);
                            isIndividual = (roleplayer.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Person);
                        }
                        var deathType = await _eventService.GetPersonEventDeathType(personEvent.PersonEventId);
                        var documentRule = await _documentRuleRepository.Where(s => s.DeathType == deathType && s.IsIndividual == isIndividual)
                                              .Select(n => new DocumentRule
                                              {
                                                  DocumentSet = n.DocumentSet
                                              }).SingleAsync();
                        var createdDate = DateTime.MinValue;
                        var todaysDate = DateTimeHelper.SaNow;
                        var daycount = 0;
                        var key = new Dictionary<string, string>();
                        key.Add("PersonEvent", personEvent.PersonEventId.ToString());
                        var claims = await GetClaimsByPersonEventId(personEvent.PersonEventId);
                        var documentsNotReceieved = await _documentIndexService.GetAllDocumentsNotRecieved(documentRule.DocumentSet, key);
                        if (claims.Count != 0)
                        {
                            foreach (var claim in claims)
                            {
                                if (personEvent.Claims.Any(a => a.ClaimStatus == ClaimStatusEnum.Unpaid || a.ClaimStatus == ClaimStatusEnum.AwaitingDecision))
                                {
                                    var emailAudit = await _emailService.GetEmailAudit(Convert.ToInt32(claim.ClaimId), "ClaimCare");
                                    daycount = DayCount(claim.CreatedDate, DateTimeHelper.SaNow);
                                    if (claimantDetails.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.Email && documentsNotReceieved.Count != 0)
                                    {
                                        if (daycount == 1)
                                        {

                                            await SendClaimFollowEmail(claim);

                                            await _noteService.AddNote(new Note
                                            {
                                                ItemId = claim.ClaimId,
                                                ItemType = ItemTypeEnum.Claim.DisplayAttributeValue(),
                                                Text = "First Follow up notification for unclaimed benefit sent",
                                            });
                                        }
                                        else if (daycount == 7)
                                        {
                                            var isSent = await SendClaimFollowEmail(claim);

                                            await _noteService.AddNote(new Note
                                            {
                                                ItemId = claim.ClaimId,
                                                ItemType = ItemTypeEnum.Claim.DisplayAttributeValue(),
                                                Text = "Second Follow up notification for unclaimed benefit sent",
                                            });
                                        }
                                        else if (daycount == 14)
                                        {
                                            var isSent = await SendClaimFollowEmail(claim);

                                            await _noteService.AddNote(new Note
                                            {
                                                ItemId = claim.ClaimId,
                                                ItemType = ItemTypeEnum.Claim.DisplayAttributeValue(),
                                                Text = "Third Follow up notification for unclaimed benefit sent",
                                            });
                                        }
                                        else if (daycount >= 30)
                                        {
                                            if (daycount % 30 == 0)
                                            {
                                                //Update claim invoice if "unpaid"
                                                if (claim.ClaimStatus == ClaimStatusEnum.Unpaid)
                                                    await UnpaidClaimTracing(claim.ClaimId);

                                                await UpdateStatus(new Action
                                                {
                                                    ItemId = claim.ClaimId,
                                                    UserId = personEvent.CapturedByUserId,
                                                    Status = ClaimStatusEnum.Tracing,
                                                    ItemType = ItemTypeEnum.Claim.DisplayAttributeValue()
                                                });

                                                await _noteService.AddNote(new Note
                                                {
                                                    ItemId = claim.ClaimId,
                                                    ItemType = ItemTypeEnum.Claim.DisplayAttributeValue(),
                                                    Text = "Follow up Process followed, and no response recevied, claim moved to tracing",
                                                    Reason = "Tracing"
                                                });
                                            }

                                        }
                                    }
                                    else if (claimantDetails.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.SMS && documentsNotReceieved.Count != 0)
                                    {
                                        if (daycount == 1)
                                        {

                                            var isSent = await SendClaimFollowSms(claim);

                                            await _noteService.AddNote(new Note
                                            {
                                                ItemId = claim.ClaimId,
                                                ItemType = ItemTypeEnum.Claim.DisplayAttributeValue(),
                                                Text = "First Follow up notification for unclaimed benefit sent",
                                            });
                                        }
                                        else if (daycount == 7)
                                        {
                                            var isSent = await SendClaimFollowSms(claim);
                                            await _noteService.AddNote(new Note
                                            {
                                                ItemId = claim.ClaimId,
                                                ItemType = ItemTypeEnum.Claim.DisplayAttributeValue(),
                                                Text = "Second Follow up notification for unclaimed benefit sent",
                                            });
                                        }
                                        else if (daycount == 14)
                                        {
                                            var isSent = await SendClaimFollowSms(claim);
                                            await _noteService.AddNote(new Note
                                            {
                                                ItemId = claim.ClaimId,
                                                ItemType = ItemTypeEnum.Claim.DisplayAttributeValue(),
                                                Text = "Third Follow up notification for unclaimed benefit sent",
                                            });
                                        }
                                        else if (daycount >= 30)
                                        {
                                            if (daycount % 30 == 0)
                                            {
                                                await UpdateStatus(new Action
                                                {
                                                    ItemId = claim.ClaimId,
                                                    UserId = personEvent.CapturedByUserId,
                                                    Status = ClaimStatusEnum.Tracing,
                                                    ItemType = ItemTypeEnum.Claim.DisplayAttributeValue()
                                                });

                                                await _noteService.AddNote(new Note
                                                {
                                                    ItemId = claim.ClaimId,
                                                    ItemType = ItemTypeEnum.Claim.DisplayAttributeValue(),
                                                    Text = "Follow up Process followed, and no response recevied, claim moved to tracing",
                                                    Reason = "Tracing"
                                                });
                                            }

                                        }
                                    }
                                }
                                else if (personEvent.Claims.Any(a => a.ClaimStatus == ClaimStatusEnum.Tracing))
                                {
                                    var yearCount = YearCount(claim.CreatedDate, DateTimeHelper.SaNow);

                                    if (yearCount >= 3)
                                    {
                                        await UpdateStatus(new Action
                                        {
                                            ItemId = claim.ClaimId,
                                            UserId = personEvent.CapturedByUserId,
                                            Status = ClaimStatusEnum.Unclaimed,
                                            ItemType = ItemTypeEnum.Claim.DisplayAttributeValue()
                                        });

                                        await _noteService.AddNote(new Note
                                        {
                                            ItemId = claim.ClaimId,
                                            ItemType = ItemTypeEnum.Claim.DisplayAttributeValue(),
                                            Text = "Follow up Process followed, and no response recevied, claim moved to unclaimed",
                                            Reason = "Unclaimed"
                                        });


                                    }
                                }
                            }
                        }
                        else
                        {
                            var emailAudit = await _emailService.GetEmailAudit(Convert.ToInt32(personEvent.PersonEventId), ItemTypeEnum.PersonEvent.DisplayAttributeValue());
                            daycount = DayCount(personEvent.DateCaptured, DateTimeHelper.SaNow);
                            if (claimantDetails.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.Email && documentsNotReceieved.Count != 0 && personEvent.PersonEventStatus != PersonEventStatusEnum.Cancelled)
                            {
                                if (daycount == 1)
                                {
                                    var additonalDocuments = new AdditionalDocument()
                                    {
                                        CommunicationType = CommunicationTypeEnum.Email,
                                        DocumentSetId = documentRule.DocumentSetId,
                                        Email = claimantDetails.EmailAddress,
                                        Keys = key,
                                        DocumentTypeIds = documentsNotReceieved.Select(a => a.DocTypeId).ToList(),
                                        system = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                                        TemplateType = TemplateTypeEnum.FollowUp1emailTemplate
                                    };
                                    var isSent = await RequestOutstandingDocuments(additonalDocuments);

                                    await _noteService.AddNote(new Note
                                    {
                                        ItemId = personEvent.PersonEventId,
                                        ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                                        Text = "First Follow up notification sent",
                                    });
                                }
                                else if (daycount == 7)
                                {
                                    var additonalDocuments = new AdditionalDocument()
                                    {
                                        CommunicationType = CommunicationTypeEnum.Email,
                                        DocumentSetId = documentRule.DocumentSetId,
                                        Email = claimantDetails.EmailAddress,
                                        Keys = key,
                                        DocumentTypeIds = documentsNotReceieved.Select(a => a.DocTypeId).ToList(),
                                        system = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                                        TemplateType = TemplateTypeEnum.FollowUp2emailTemplate
                                    };
                                    var isSent = await RequestOutstandingDocuments(additonalDocuments);

                                    await _noteService.AddNote(new Note
                                    {
                                        ItemId = personEvent.PersonEventId,
                                        ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                                        Text = "Second Follow up notification sent",
                                    });
                                }
                                else if (daycount == 14)
                                {
                                    var additonalDocuments = new AdditionalDocument()
                                    {
                                        CommunicationType = CommunicationTypeEnum.Email,
                                        DocumentSetId = documentRule.DocumentSetId,
                                        Email = claimantDetails.EmailAddress,
                                        Keys = key,
                                        DocumentTypeIds = documentsNotReceieved.Select(a => a.DocTypeId).ToList(),
                                        system = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                                        TemplateType = TemplateTypeEnum.FollowUp2emailTemplate
                                    };
                                    var isSent = await RequestOutstandingDocuments(additonalDocuments);

                                    await _noteService.AddNote(new Note
                                    {
                                        ItemId = personEvent.PersonEventId,
                                        ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                                        Text = "Third Follow up notification sent",
                                    });
                                }
                                else if (daycount >= 30)
                                {
                                    if (daycount % 30 == 0)
                                    {

                                        await UpdatePersonEventStatus(new PersonEventAction
                                        {
                                            ItemId = personEvent.PersonEventId,
                                            UserId = personEvent.CapturedByUserId,
                                            PersonEventStatus = PersonEventStatusEnum.Closed,
                                            ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue()
                                        });

                                        await _noteService.AddNote(new Note
                                        {
                                            ItemId = personEvent.PersonEventId,
                                            ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                                            Text = "Follow up Process followed, and no documents recevied, claim closed",
                                            Reason = "Follow up Process followed, and no documents recevied, claim closed"
                                        });
                                    }

                                }
                            }
                            else if (claimantDetails.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.SMS && documentsNotReceieved.Count != 0 && personEvent.PersonEventStatus != PersonEventStatusEnum.Cancelled)
                            {
                                if (daycount == 1)
                                {
                                    var additonalDocuments = new AdditionalDocument()
                                    {
                                        CommunicationType = CommunicationTypeEnum.SMS,
                                        DocumentSetId = documentRule.DocumentSetId,
                                        Email = claimantDetails.CellNumber,
                                        Keys = key,
                                        DocumentTypeIds = documentsNotReceieved.Select(a => a.DocTypeId).ToList(),
                                        system = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                                        TemplateType = TemplateTypeEnum.FirstFollowUpSms
                                    };
                                    var isSent = await RequestOutstandingDocuments(additonalDocuments);

                                    await _noteService.AddNote(new Note
                                    {
                                        ItemId = personEvent.PersonEventId,
                                        ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                                        Text = "First Follow up notification sent",
                                    });
                                }
                                else if (daycount == 7)
                                {
                                    var additonalDocuments = new AdditionalDocument()
                                    {
                                        CommunicationType = CommunicationTypeEnum.SMS,
                                        DocumentSetId = documentRule.DocumentSetId,
                                        Email = claimantDetails.CellNumber,
                                        Keys = key,
                                        DocumentTypeIds = documentsNotReceieved.Select(a => a.DocTypeId).ToList(),
                                        system = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                                        TemplateType = TemplateTypeEnum.SecondFollowUpSms
                                    };
                                    var isSent = await RequestOutstandingDocuments(additonalDocuments);

                                    await _noteService.AddNote(new Note
                                    {
                                        ItemId = personEvent.PersonEventId,
                                        ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                                        Text = "Second Follow up notification sent",
                                    });
                                }
                                else if (daycount == 14)
                                {
                                    var additonalDocuments = new AdditionalDocument()
                                    {
                                        CommunicationType = CommunicationTypeEnum.SMS,
                                        DocumentSetId = documentRule.DocumentSetId,
                                        Email = claimantDetails.CellNumber,
                                        Keys = key,
                                        DocumentTypeIds = documentsNotReceieved.Select(a => a.DocTypeId).ToList(),
                                        system = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                                        TemplateType = TemplateTypeEnum.SecondFollowUpSms
                                    };
                                    var isSent = await RequestOutstandingDocuments(additonalDocuments);

                                    await _noteService.AddNote(new Note
                                    {
                                        ItemId = personEvent.PersonEventId,
                                        ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                                        Text = "Third Follow up notification sent",
                                    });
                                }
                                else if (daycount >= 30)
                                {
                                    if (daycount % 30 == 0)
                                    {
                                        await UpdatePersonEventStatus(new PersonEventAction
                                        {
                                            ItemId = personEvent.PersonEventId,
                                            UserId = personEvent.CapturedByUserId,
                                            PersonEventStatus = PersonEventStatusEnum.Closed,
                                            ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue()
                                        });

                                        await _noteService.AddNote(new Note
                                        {
                                            ItemId = personEvent.PersonEventId,
                                            ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                                            Text = "Follow up Process followed, and no documents recevied, claim closed",
                                            Reason = "Follow up Process followed, and no documents recevied, claim closed"
                                        });
                                    }

                                }
                            }
                        }
                    }

                    catch (Exception e)
                    {
                        e.LogException();
                    }
                }
            }
        }

        private async Task<bool> SendClaimFollowEmail(Contracts.Entities.Claim claim)
        {
            var personEvent = await _eventService.GetPersonEvent(claim.PersonEventId);
            var claimantDetails = await _rolePlayerService.GetRolePlayer(personEvent.ClaimantId);
            var logoUrl = await _configurationService.GetModuleSetting(SystemSettings.PaymentManagerEmailLogo);
            var policyNumber = await _policyService.GetPolicyNumber(claim.PolicyId.Value);
            var insuredlifedetails = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);

            var emailTokens = new Dictionary<string, string>
            {
                ["[policyNumber]"] = await _policyService.GetPolicyNumber(claim.PolicyId.Value),
                ["[InsuredLifeIntialAndSurname]"] = $"{insuredlifedetails.Person.FirstName.Substring(0, 1)} {insuredlifedetails.Person.Surname}",
                ["[ClaimType]"] = ClaimTypeEnum.Funeral.DisplayAttributeValue(),
                ["[ClaimantDetails]"] = $"{claimantDetails.Person.FirstName} {claimantDetails.Person.Surname}",
                ["[PersonEventId]"] = claim.PersonEventId.ToString(),
                ["[Logo]"] = logoUrl,
                ["[Date]"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy")
            };

            var template = await _emailTemplateService.GenerateTemplateContent(TemplateTypeEnum.UnclaimedFollowUpEmail, emailTokens);

            //var htmlBody = (await _emailTemplateService.GetEmailTemplate(Convert.ToInt32(documentRule.EmailTemplateId))).Template;
            // foreach (var token in emailTokens) template.DocumentHtml = documentTemplate.DocumentHtml.Replace($"{token.Key}", token.Value);
            var email = new SendMailRequest()
            {
                Subject = "Unclaimed Benefit",
                FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                Recipients = claimantDetails.EmailAddress,
                Body = template.Content,
                IsHtml = true,
                Attachments = null,
                ItemId = claim.ClaimId,
                ItemType = ItemTypeEnum.Claim.DisplayAttributeValue(),
                Department = RMADepartmentEnum.Claims,
                BusinessArea = BusinessAreaEnum.ClaimActionNotification
            };
            var sendEmail = await _sendEmailService.SendEmail(email);
            return sendEmail == 200;
        }

        private async Task<bool> SendClaimFollowSms(Contracts.Entities.Claim claim)
        {

            var personEvent = await _eventService.GetPersonEvent(claim.PersonEventId);
            var claimantId = personEvent.ClaimantId;
            var mobile = (await _rolePlayerService.GetRolePlayer(claimantId)).CellNumber;
            var smsTokens = new Dictionary<string, string>
            {
                ["claimNumber"] = personEvent.PersonEventId.ToString()
            };

            var smsNotification = new TemplateSmsRequest()
            {
                TemplateId = (int)TemplateTypeEnum.FirstFollowUpSms,
                Tokens = smsTokens,
                SmsNumbers = new List<string> { mobile },
                ItemType = ItemTypeEnum.Claim.DisplayAttributeValue(),
                ItemId = claim.ClaimId
            };
            var result = await _sendSmsService.SendTemplateSms(smsNotification);
            return result == 1;
        }

        public async Task<List<Contracts.Entities.Claim>> GetClaimByPolicy(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claim = await _claimRepository
                    .Where(s => s.PolicyId == policyId)
                    .ToListAsync();
                return Mapper.Map<List<Contracts.Entities.Claim>>(claim);
            }
        }

        public async Task<MailAttachment[]> GetDocumentsToDownload(int documentTypeId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewDocument);

            var listOfDocument = new List<MailAttachment>();
            var counter = 0;
            var mail = new MailAttachment();

            var attachment = await _documentTemplateService.GetDocumentTemplateByDocumentType((DocumentTypeEnum)documentTypeId);
            if (attachment != null)
            {
                mail.AttachmentByteData = attachment.DocumentBinary != null ? attachment.DocumentBinary : await _documentGeneratorService.ConvertHtmlToPdf(attachment.DocumentHtml);
                mail.FileName = attachment.DocumentName;
                mail.FileType = attachment.DocumentMimeType;
                listOfDocument.Add(mail);
            }
            else
            {
                var attachmentWithLocation = await _documentTemplateService.GetDocumentTemplateByTemplateId((DocumentTypeEnum)documentTypeId);
                if (attachmentWithLocation?.Location != null)
                {
                    mail.AttachmentByteData = await _documentGeneratorService.GetFileByteData(attachmentWithLocation.Location);
                    mail.FileName = attachmentWithLocation.DocumentName;
                    mail.FileType = attachmentWithLocation.DocumentMimeType;
                    listOfDocument.Add(mail);
                }
            }

            var attachmentMailAttachments = new MailAttachment[listOfDocument.Count];
            foreach (var document in listOfDocument)
            {
                attachmentMailAttachments[counter] = document;
                counter++;
            }

            return attachmentMailAttachments;
        }

        public async Task<MailAttachment> DownloadAdditionalDocumentEmailTemplate(AdditionalDocument additionalDocument)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewDocument);

            int personEventId = 0;
            foreach (var item in additionalDocument?.Keys)
            {
                var key = item.Key;
                personEventId = Convert.ToInt32(item.Value);
            }
            var documentManagementHeader = await GetDocumentManagementHeader(Convert.ToInt32(personEventId));

            var html = await GenerateHtmlBody(documentManagementHeader, additionalDocument.DocumentTypeIds, true, null);
            var mail = new MailAttachment();

            mail.AttachmentByteData = await _documentGeneratorService.ConvertHtmlToPdf(html);
            mail.FileName = "Additional Document Template.pdf";
            mail.FileType = "application/pdf";

            return mail;
        }

        private int DayCount(DateTime createDate, DateTime todaysDate)
        {
            int days = 0;
            while (createDate <= todaysDate)
            {
                if (createDate.DayOfWeek != DayOfWeek.Saturday && createDate.DayOfWeek != DayOfWeek.Sunday)
                {
                    ++days;
                }
                createDate = createDate.AddDays(1);
            }
            return days;
        }

        private int YearCount(DateTime startDate, DateTime endDate)
        {
            int result = 0;
            const int daysInYear = 365;

            TimeSpan timeSpan = endDate - startDate;
            if (timeSpan.TotalDays > 365)
            {
                result = (int)Math.Abs(timeSpan.TotalDays / daysInYear);
            }

            return result;
        }

        public async Task<List<ClaimNote>> GetNotesByInsuredLife(int insuredLifeId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewNote);

            var notes = new List<ClaimNote>();
            // var personEvents = await _eventService.GetPersonEventsByInsuredLife(insuredLifeId);
            var policies = await _policyService.GetPoliciesByPolicyOwner(insuredLifeId);
            var claims = await GetClaimsByPolicyIds(policies.Select(p => p.PolicyId).ToList());
            foreach (var claim in claims)
            {

                var claimRefNumber = await GetClaimReferenceNumber(claim.ClaimId);
                var claimNotes = await _noteService.GeNotes(ItemTypeEnum.Claim.DisplayAttributeValue(), claim.ClaimId);
                claimNotes.ForEach(a =>
                {
                    if (!a.PersonEventId.HasValue)
                    {
                        a.PersonEventId = Convert.ToInt32(claimRefNumber.Substring(0, 8));
                    }
                });
                notes.AddRange(claimNotes);
            }
            return notes;
        }

        public async Task<string> GetClaimReferenceNumber(int claimId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _claimRepository.Where(a => a.ClaimId == claimId).Select(b => b.ClaimReferenceNumber).FirstOrDefaultAsync();
            }
        }

        public async Task ProcessBeneficiaryVOPDResponse(int rolePlayerId)
        {
            var beneficiary = await _rolePlayerService.GetRolePlayer(rolePlayerId);
            if (beneficiary.FromRolePlayers.Count > 0)
            {
                foreach (var fromRolePlayer in beneficiary.FromRolePlayers)
                {
                    var personEvent = await _eventService.GetPersonEventByInsuredLife(fromRolePlayer.ToRolePlayerId);
                    if (personEvent != null)
                    {
                        var vopdResponse = await _rolePlayerService.GetVOPDResponseResultByRoleplayerIdAndIdNumber(beneficiary.RolePlayerId, beneficiary.Person.IdNumber);
                        var notes = await _noteService.GeNotes(ItemTypeEnum.PersonEvent.DisplayAttributeValue(), personEvent.PersonEventId);
                        if (vopdResponse != null && vopdResponse.VopdStatus == VopdStatusEnum.Processed)
                        {
                            if (vopdResponse.VopdStatus == VopdStatusEnum.Processed && !vopdResponse.Reason.Contains("not found"))
                            {
                                if (!notes.Any(a => a.Text == $"VOPD message: Successful - VOPD has verfied the person {vopdResponse.DeceasedStatus}"))
                                {
                                    var reason = string.Empty;
                                    await _noteService.AddNote(new Note
                                    {
                                        ItemId = personEvent.PersonEventId,
                                        ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                                        Text = $"VOPD message: Successful - VOPD has verfied the person {vopdResponse.DeceasedStatus} (Added By System)",
                                        Reason = reason
                                    });
                                    if (vopdResponse.Surname.Length > 0 && beneficiary.Person != null)
                                    {
                                        var comment = "";
                                        if (string.Compare(beneficiary.Person.Surname.ToLower().Trim(), vopdResponse.Surname.ToLower().Trim()) == 0)
                                        {
                                            comment = $"VOPD message: Successful - VOPD has verfied and matched surname: {vopdResponse.Surname} for beneficiary listed (Added By System)";
                                            await _noteService.AddNote(new Note
                                            {
                                                ItemId = personEvent.PersonEventId,
                                                ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                                                Text = comment,
                                                Reason = reason
                                            });
                                        }
                                        else
                                        {
                                            await _noteService.AddNote(new Note
                                            {
                                                ItemId = personEvent.PersonEventId,
                                                ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                                                Text = $"VOPD message: Unsuccessful - VOPD surname: {vopdResponse.Surname} does not match {beneficiary.Person.Surname} for beneficiary listed (Added By System)",
                                                Reason = reason
                                            });
                                            var capturedSurname = beneficiary.Person.Surname;
                                            beneficiary.Person.Surname = vopdResponse.Surname;
                                            await _rolePlayerService.UpdatePerson(beneficiary.Person);
                                            await _noteService.AddNote(new Note
                                            {
                                                ItemId = personEvent.PersonEventId,
                                                ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                                                Text = $"VOPD message: Surname overwrite from {capturedSurname} to VOPD surname: {vopdResponse.Surname} for beneficiary listed (Added By System)",
                                                Reason = reason
                                            });
                                        }
                                    }
                                    if (!string.IsNullOrEmpty(vopdResponse.DeceasedStatus) && vopdResponse.DeceasedStatus.ToLower() == "deceased")
                                    {
                                        var title = "Beneficiary VOPD Unsuccessful";
                                        var notification = "Beneficiary VOPD Unsuccessful " + Environment.NewLine +
                                        "Claim Number: " + personEvent.Claims[0].ClaimReferenceNumber + Environment.NewLine +
                                        "Beneficiary Name: " + beneficiary.DisplayName + Environment.NewLine +
                                        "Id Number: " + beneficiary.Person.IdNumber + Environment.NewLine +
                                        "VOPD Results:  " + vopdResponse.DeceasedStatus;
                                        var request = new RejectWizardRequest()
                                        {
                                            WizardId = personEvent.PersonEventId,
                                            Comment = notification,
                                            RejectedBy = RmaIdentity.Username
                                        };
                                        await SendNotification(request, title);
                                    }
                                }
                            }
                            if (vopdResponse.VopdStatus == VopdStatusEnum.Processed && vopdResponse.Reason.Contains("not found"))
                            {
                                var title = "Beneficiary VOPD Unsuccessful";
                                var notification = "Beneficiary VOPD Unsuccessful " + Environment.NewLine +
                                "Claim Number: " + personEvent.Claims[0].ClaimReferenceNumber + Environment.NewLine +
                                "Beneficiary Name: " + beneficiary.DisplayName + Environment.NewLine +
                                "Id Number: " + beneficiary.Person.IdNumber + Environment.NewLine +
                                "VOPD Results: Not found";
                                var request = new RejectWizardRequest()
                                {
                                    WizardId = personEvent.PersonEventId,
                                    Comment = notification,
                                    RejectedBy = RmaIdentity.Username
                                };
                                if (!notes.Any(a => a.Text == $"VOPD message: ID not found for beneficiary {beneficiary.DisplayName}"))
                                {
                                    await _noteService.AddNote(new Note
                                    {
                                        ItemId = personEvent.PersonEventId,
                                        ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                                        Text = $"VOPD message: ID not found for beneficiary {beneficiary.DisplayName} (Added By System)",
                                        Reason = "ID number not found"
                                    });
                                    await SendNotification(request, title);
                                }
                            }
                        }
                    }
                }
            }
        }

        private async Task SendNotification(RejectWizardRequest rejectWizardRequest, string title)
        {
            await _wizardService.SendWizardNotification("CMC-VOPD-notification", title,
                rejectWizardRequest.Comment, null, rejectWizardRequest.WizardId, null);
        }

        public async Task<bool> ProcessVOPDReponse(int roleplayerId)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                var isCompCareVOPDMessagesEnabled = await _configurationService.IsFeatureFlagSettingEnabled("isCompCareVOPDMessagesEnabled");
                var personEvent = await _eventService.GetPersonEventByInsuredLife(roleplayerId);
                if (personEvent == null)
                {
                    return false;
                }
                var person = await _rolePlayerService.GetPerson(roleplayerId);
                if (person == null)
                {
                    return false;
                }
                var isCachedTransactEnabled = await _configurationService.IsFeatureFlagSettingEnabled("IsVopdCachedTransactEnabled");
                if (isCachedTransactEnabled)
                {
                    await _rolePlayerService.RolePlayerVopdUpdateFromCache(person.RolePlayerId, person.Person.IdNumber);
                }
                var vopdResponse = await _rolePlayerService.GetVOPDResponseResultByRoleplayerIdAndIdNumber(person.RolePlayerId, person.Person.IdNumber);
                if (vopdResponse == null)
                {
                    return false;
                }

                if (vopdResponse != null && vopdResponse.VopdStatus == VopdStatusEnum.Processed)
                {
                    if (!string.IsNullOrEmpty(vopdResponse.Reason))
                    {
                        if (vopdResponse.Reason.ToLower().Contains("not found") || vopdResponse.Reason.ToLower().Contains("invalid"))
                        {
                            personEvent.IsStraightThroughProcess = false;

                            await AddVOPDSTPExitReason(new PersonEventStpExitReason
                            {
                                PersonEventId = personEvent.PersonEventId,
                                StpExitReasonId = (int)STPExitReasonEnum.CheckVOPD,
                                CreatedBy = RmaIdentity.Username,
                                ModifiedBy = RmaIdentity.Username,
                                CompCarePersonEventId = personEvent.CompCarePersonEventId.HasValue ? personEvent.CompCarePersonEventId.Value : 0,
                                MessageId = personEvent.CompCareIntegrationMessageId != null ? personEvent.CompCareIntegrationMessageId : string.Empty,
                                SuspiciousTransactionStatus = personEvent.SuspiciousTransactionStatus
                            });

                            if (personEvent.CompCareIntegrationMessageId != null)
                            {
                                var stpExitReason = STPExitReasonEnum.CheckVOPD;
                                var stpIntegrationBody = new STPIntegrationBody()
                                {
                                    PersonEventId = personEvent.CompCarePersonEventId.Value,
                                    IDVOPDValidated = false,
                                    ReSubmitVOPD = false,
                                    STPExitReasonId = (int)stpExitReason,
                                    STPExitReason = stpExitReason.DisplayAttributeValue(),
                                    SuspiciousTransactionStatusID = personEvent.SuspiciousTransactionStatus == SuspiciousTransactionStatusEnum.NotSuspicious ? 2 : 1
                                };
                                var messageBody = _serializer.Serialize(stpIntegrationBody);

                                var enviroment = await _configurationService.GetModuleSetting(SystemSettings.IntegrationEnviroment);
                                var messageType = new MessageType
                                {
                                    MessageBody = messageBody,
                                    From = ClaimConstants.MessageFrom,
                                    To = ClaimConstants.MessageTo,
                                    MessageTaskType = ClaimConstants.MessageTaskType002,
                                    Environment = enviroment,
                                    CorrelationID = personEvent.CompCareIntegrationMessageId,
                                    EnqueuedTime = DateTime.UtcNow,
                                };

                                await SendVOPDIntegrationExitMessageToCompCare(messageType, personEvent.CompCarePersonEventId.Value);
                            }

                            var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEvent.PersonEventId);

                            await CreateSystemAddedCommonNotes(personEvent.PersonEventId, $"VOPD message: ID {vopdResponse.IdNumber} not found (Added By System)");

                            await _eventService.UpdatePersonEventDetails(personEvent);
                            if (isCompCareVOPDMessagesEnabled && personEvent.CompCarePersonEventId != null)
                            {
                                await SendIntegrationMessageToCompCare(personEvent, $"VOPD message: ID {vopdResponse.IdNumber} not found", person);
                            }
                        }

                    }
                    if (!string.IsNullOrEmpty(vopdResponse.Reason) && !vopdResponse.Reason.ToLower().Contains("not found")
                        && vopdResponse.Identity == false && vopdResponse.Death == false && string.IsNullOrEmpty(vopdResponse.Surname))
                    {
                        personEvent.IsStraightThroughProcess = false;

                        if (!vopdResponse.Reason.ToLower().Contains(vopdError.ToLower()))
                        {
                            await CreateSystemAddedCommonNotes(personEvent.PersonEventId, $"VOPD message: {vopdResponse.Reason} (Added By System)");
                        }

                        await _eventService.UpdatePersonEventDetails(personEvent);
                        if (isCompCareVOPDMessagesEnabled)
                        {
                            await SendIntegrationMessageToCompCare(personEvent, $"VOPD message: {vopdResponse.Reason}", person);
                        }

                    }
                    if (string.IsNullOrEmpty(vopdResponse.Reason) || (!vopdResponse.Reason.Contains("not found")))
                    {
                        var noteText = $"VOPD message: Successful - VOPD has verfied the person {vopdResponse.DeceasedStatus}";
                        var hasNoteBeenAdded = await _commonSystemNoteService.CheckIfCommonNoteHasBeenAdded(personEvent.PersonEventId, noteText);
                        if (!hasNoteBeenAdded)
                        {
                            var reason = string.Empty;
                            if (!string.IsNullOrEmpty(vopdResponse.DeceasedStatus) && vopdResponse.DeceasedStatus.ToLower().Contains("deceased"))
                            {
                                reason = "Pending Investigations";
                                personEvent.IsStraightThroughProcess = false;
                                personEvent.IsFatal = true;

                                await AddVOPDSTPExitReason(new PersonEventStpExitReason
                                {
                                    PersonEventId = personEvent.PersonEventId,
                                    StpExitReasonId = (int)STPExitReasonEnum.VopdDeceased,
                                    CreatedBy = RmaIdentity.Username,
                                    ModifiedBy = RmaIdentity.Username,
                                    CompCarePersonEventId = personEvent.CompCarePersonEventId.HasValue ? personEvent.CompCarePersonEventId.Value : 0,
                                    MessageId = personEvent.CompCareIntegrationMessageId != null ? personEvent.CompCareIntegrationMessageId : string.Empty,
                                    SuspiciousTransactionStatus = personEvent.SuspiciousTransactionStatus
                                });
                                var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEvent.PersonEventId);

                                await CreateSystemAddedCommonNotes(personEvent.PersonEventId, $"VOPD message: Successful - VOPD has verfied the person with ID {vopdResponse.IdNumber} is deceased (Added By System)");

                                await _eventService.UpdatePersonEventDetails(personEvent);
                                if (isCompCareVOPDMessagesEnabled)
                                {
                                    await SendIntegrationMessageToCompCare(personEvent, $"VOPD message: Successful - VOPD has verfied the person with ID {vopdResponse.IdNumber} is deceased", person);
                                }

                                if (personEvent.CompCareIntegrationMessageId != null)
                                {
                                    var stpExitReason = STPExitReasonEnum.VopdDeceased;
                                    var stpIntegrationBody = new STPIntegrationBody()
                                    {
                                        PersonEventId = personEvent.CompCarePersonEventId.Value,
                                        IDVOPDValidated = false,
                                        ReSubmitVOPD = false,
                                        STPExitReasonId = (int)stpExitReason,
                                        STPExitReason = stpExitReason.DisplayAttributeValue(),
                                        SuspiciousTransactionStatusID = personEvent.SuspiciousTransactionStatus == SuspiciousTransactionStatusEnum.NotSuspicious ? 2 : 1
                                    };
                                    var messageBody = _serializer.Serialize(stpIntegrationBody);

                                    var enviroment = await _configurationService.GetModuleSetting(SystemSettings.IntegrationEnviroment);
                                    var messageType = new MessageType
                                    {
                                        MessageBody = messageBody,
                                        From = ClaimConstants.MessageFrom,
                                        To = ClaimConstants.MessageTo,
                                        MessageTaskType = ClaimConstants.MessageTaskType002,
                                        Environment = enviroment,
                                        CorrelationID = personEvent.CompCareIntegrationMessageId,
                                        EnqueuedTime = DateTime.UtcNow,
                                    };

                                    await SendVOPDIntegrationExitMessageToCompCare(messageType, personEvent.CompCarePersonEventId.Value);
                                }
                            }

                            if (!string.IsNullOrEmpty(vopdResponse.DeceasedStatus) && vopdResponse.DeceasedStatus.ToLower().Contains("alive"))
                            {
                                await CreateSystemAddedCommonNotes(personEvent.PersonEventId, $"VOPD message: Successful - VOPD has verfied the person with ID {vopdResponse.IdNumber} is alive (Added By System)");

                                if (isCompCareVOPDMessagesEnabled)
                                {
                                    await SendIntegrationMessageToCompCare(personEvent, $"VOPD message: Successful - VOPD has verfied the person with ID {vopdResponse.IdNumber} is alive", person);
                                }
                            }

                            if (vopdResponse.Surname.Length > 0 && person.Person != null)
                            {
                                var comment = "";
                                if (!string.IsNullOrEmpty(person.Person.Surname) && string.Compare(person.Person.Surname.ToLower().Trim(), vopdResponse.Surname.ToLower().Trim()) == 0)
                                {
                                    comment = $"VOPD message: Successful - VOPD has verfied and matched surname: {vopdResponse.Surname}";
                                    await CreateSystemAddedCommonNotes(personEvent.PersonEventId, comment);

                                    if (isCompCareVOPDMessagesEnabled)
                                    {
                                        await SendIntegrationMessageToCompCare(personEvent, comment, person);
                                    }
                                }
                                else
                                {
                                    var nameNotes = $"VOPD message: Unsuccessful - VOPD surname: {vopdResponse.Surname} does not match {person.Person.Surname}";
                                    await CreateSystemAddedCommonNotes(personEvent.PersonEventId, nameNotes);

                                    if (isCompCareVOPDMessagesEnabled)
                                    {
                                        await SendIntegrationMessageToCompCare(personEvent, nameNotes, person);
                                    }
                                    var rolePlayerDetails = await _rolePlayerService.GetRolePlayer(roleplayerId);
                                    rolePlayerDetails.DisplayName = person.Person.FirstName + " " + vopdResponse.Surname;

                                    rolePlayerDetails.Person.Surname = vopdResponse.Surname;

                                    await _rolePlayerService.UpdateRolePlayer(rolePlayerDetails);

                                    var capturedSurname = person.Person.Surname;
                                    await CreateSystemAddedCommonNotes(personEvent.PersonEventId, $"VOPD message: Surname overwrite from {capturedSurname} to VOPD surname: {vopdResponse.Surname} (Added By System)");

                                    if (isCompCareVOPDMessagesEnabled)
                                    {
                                        await SendIntegrationMessageToCompCare(personEvent, $"VOPD message: Surname overwrite from {capturedSurname} to VOPD surname: {vopdResponse.Surname}", person);
                                    }
                                }
                            }
                        }
                    }
                }
                return true;
            }
        }

        private async Task CreateSystemAddedCommonNotes(int personEventId, string noteText)
        {
            var hasNoteBeenAdded = await _commonSystemNoteService.CheckIfCommonNoteHasBeenAdded(personEventId, noteText);
            if (!hasNoteBeenAdded)
            {
                var newSystemNote = new CommonSystemNote
                {
                    ItemId = personEventId,
                    NoteCategory = NoteCategoryEnum.PersonEvent,
                    NoteItemType = NoteItemTypeEnum.PersonEvent,
                    NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                    NoteType = NoteTypeEnum.SystemAdded,
                    Text = noteText,
                    IsActive = true
                };
                await _commonSystemNoteService.CreateCommonSystemNote(newSystemNote);
            }
        }

        private async Task AddVOPDSTPExitReason(PersonEventStpExitReason personEventStpExitReason)
        {
            try
            {
                using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
                {
                    var entity = new claim_PersonEventStpExitReason
                    {
                        PersonEventId = personEventStpExitReason.PersonEventId,
                        StpExitReasonId = personEventStpExitReason.StpExitReasonId,
                        CreatedBy = RmaIdentity.Email,
                        CreatedDate = DateTime.Now,
                        ModifiedBy = RmaIdentity.Email,
                        ModifiedDate = DateTime.Now
                    };
                    _personEventStpExitReasons.Create(entity);
                    await scope.SaveChangesAsync()
                        .ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when adding VOPD exit reason - Error Message {ex.Message}");
            }
        }

        public async Task AddMedicalInvoiceSTPExitReason(int claimId)
        {
            try
            {
                using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
                {
                    var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.ClaimId == claimId);
                    var personEventEntity = await _personEventRepository.FirstOrDefaultAsync(a => a.PersonEventId == claimEntity.PersonEventId);
                    var entity = new claim_PersonEventStpExitReason
                    {
                        PersonEventId = personEventEntity.PersonEventId,
                        StpExitReasonId = (int)STPExitReasonEnum.MedicalInvoiceValue,
                        CreatedBy = RmaIdentity.Email,
                        CreatedDate = DateTime.Now,
                        ModifiedBy = RmaIdentity.Email,
                        ModifiedDate = DateTime.Now
                    };
                    _personEventStpExitReasons.Create(entity);
                    await scope.SaveChangesAsync()
                        .ConfigureAwait(false);

                    await _noteService.AddNote(new Note
                    {
                        ItemId = personEventEntity.PersonEventId,
                        ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                        Text = $"Claim exited STP due to medical invoice value exceeding R5000 (Added By System)",
                        Reason = "",
                        CreatedBy = RmaIdentity.BackendServiceName,
                        ModifiedBy = RmaIdentity.BackendServiceName
                    });
                    personEventEntity.IsStraightThroughProcess = false;

                    await _eventService.UpdatePersonEventDetails(Mapper.Map<PersonEvent>(personEventEntity));
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when adding Medical Invoice Value exit reason - Error Message {ex.Message}");
            }
        }

        private static string UserSlaHours(TimeSpan? userSla)
        {
            if (!userSla.HasValue)
            {
                userSla = TimeSpan.Zero;
            }

            return $"{userSla.GetValueOrDefault().Days:D2} days,{userSla.GetValueOrDefault().Hours:D2} hrs,{userSla.GetValueOrDefault().Minutes:D2} mins";
        }

        public async Task<bool> SendForInvestigation(int personEventId)
        {
            var personEvent = await _eventService.GetPersonEvent(personEventId);
            await UpdatePersonEventStatus(new PersonEventAction
            {
                ItemId = personEvent.PersonEventId,
                UserId = RmaIdentity.UserId,
                PersonEventStatus = PersonEventStatusEnum.PendingInvestigations,
                ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue()
            });
            var startWizardRequest = new StartWizardRequest
            {
                LinkedItemId = personEventId,
                Type = "claims-investigation"

            };
            var wizard = await _wizardService.StartWizard(startWizardRequest);
            return wizard != null;
        }

        public async Task<bool> UpdateInvestigationWorkFlow(int personEventId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditWorkflow);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var personEvent = await _eventService.GetPersonEvent(personEventId);
                if (personEvent.PersonEventStatus == PersonEventStatusEnum.PendingInvestigations)
                {
                    var claimWorkFlows = await _claimWorkflowRepository
                   .Where(t => t.PersonEventId == personEventId && t.EndDateTime == null && t.Description == "VOPD found an issue with Id number").ToListAsync();
                    foreach (var claimWorkFlow in claimWorkFlows)
                    {
                        claimWorkFlow.EndDateTime = DateTimeHelper.SaNow;
                        _claimWorkflowRepository.Update(claimWorkFlow);
                    }
                }

                var result = await scope.SaveChangesAsync().ConfigureAwait(false);
                return result != 0;
            }
        }

        public async Task<bool> IsUnclaimedBenefit(int claimId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claim = await this._claimRepository.FirstOrDefaultAsync(c => c.ClaimId == claimId);

                if (claim != null && claim.ClaimStatus == ClaimStatusEnum.Unclaimed)
                {
                    return true;
                }

                if (claim != null && claim.ClaimStatus != ClaimStatusEnum.PolicyAdminCompleted)
                {
                    return false;
                }

                // check if the last transactions were coming from unclaimed benefit.
                var unclaimendBenefitClaimWorkflow = await this._claimWorkflowRepository.Where(c => c.ClaimId == claimId).OrderByDescending(c => c.StartDateTime).Take(3)
                                                         .FirstOrDefaultAsync(c => c.ClaimStatus == ClaimStatusEnum.Unclaimed);

                return unclaimendBenefitClaimWorkflow == null ? false : true;
            }
        }

        public async Task<List<string>> GetChannelsForClaims(string brokerNames)
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var channels = await _claimRepository.SqlQueryAsync<string>(
                DatabaseConstants.GetChannelsForClaims, new SqlParameter("@Brokerage", brokerNames));

                return channels;
            }
        }

        public async Task<List<string>> GetSchemesForClaims(string channelNames)
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var schemes = await _claimRepository.SqlQueryAsync<string>(
                DatabaseConstants.GetSchemesForClaims, new SqlParameter("@Channel", channelNames));

                return schemes;
            }
        }

        public async Task<List<string>> GetBrokersByProducstLinkedToClaims(string productNames)
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var brokers = await _claimRepository.SqlQueryAsync<string>(
                DatabaseConstants.GetBrokersByProducstLinkedToClaims, new SqlParameter("@Product", productNames));

                return brokers;
            }
        }

        public async Task<List<string>> GetSchemesByBrokeragesLinkedToClaims(string brokerageNames)
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var schemes = await _claimRepository.SqlQueryAsync<string>(
                DatabaseConstants.GetSchemesByBrokeragesLinkedToClaims, new SqlParameter("@Brokerage", brokerageNames));

                return schemes;
            }
        }

        public async Task<List<EuropAssistNotification>> GetEuropAssistNotifications(int claimId)
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var notifications = await _europAssistNotificationRepository.Where(c => c.ClaimId == claimId).ToListAsync();

                return Mapper.Map<List<EuropAssistNotification>>(notifications);
            }
        }

        public async Task SendEuropAssistNotification(int claimId, ClaimStatusEnum status)
        {
            var claim = await GetClaim(claimId);

            if (claim != null)
            {
                var personEvent = await _eventService.GetPersonEvent(claim.PersonEventId);
                var claimant = await _rolePlayerService.GetPerson(personEvent.ClaimantId);
                var deceased = await _rolePlayerService.GetPerson(personEvent.InsuredLifeId);
                var policy = await _policyService.GetPolicyWithoutReferenceData(claim.PolicyId.Value);
                var policyOwner = await _rolePlayerService.GetPerson(policy.PolicyOwnerId);

                if (policy != null)
                {
                    var notification = new EuropAssistClaimDetails()
                    {
                        ClaimantName = claimant.Person.FirstName,
                        ClaimantSurname = claimant.Person.Surname,
                        ClaimantContactNumber = claimant.CellNumber,
                        ClaimantEmail = claimant.EmailAddress,
                        PolicyNumber = policy.PolicyNumber,
                        PolicyHolderName = policyOwner.Person.FirstName,
                        PolicyHolderSurname = policyOwner.Person.Surname,
                        PolicyHolderIdNumber = !string.IsNullOrEmpty(policyOwner.Person.IdNumber) ? policyOwner.Person.IdNumber : policyOwner.Person.PassportNumber,
                        PolicyHolderContactNumber = policyOwner.CellNumber,
                        PolicyHolderEmail = policyOwner.EmailAddress,
                        DeceasedName = deceased.Person.FirstName,
                        DeceasedSurname = deceased.Person.Surname,
                        DeceasedIdNumber = !string.IsNullOrEmpty(policyOwner.Person.IdNumber) ? policyOwner.Person.IdNumber : policyOwner.Person.PassportNumber,
                        DeceasedDateOfDeath = personEvent.PersonEventDeathDetail.DeathDate,
                        ClaimNumber = claim.ClaimReferenceNumber,
                        DeceasedDateOfBirth = deceased.Person.DateOfBirth,
                        IsInterested = true,
                        PolicyStatus = policy.PolicyStatus.DisplayAttributeValue(),
                        ClaimStatus = status.DisplayAttributeValue(),
                        ClaimStatusId = (int)status
                    };

                    var result = await _europAssistNotificationService.SendClaimRegistration(notification);

                    var claimNoteList = new Dictionary<Tuple<int, int>, StringBuilder>();

                    var finalNote = new StringBuilder();
                    var text = string.Empty;

                    if (result == "200")
                    {
                        text = $"Europ Assist Notification for Policy ({policy.PolicyNumber}) (claim {claim.ClaimReferenceNumber}) was sent successfully, Claim Status: {status.DisplayAttributeValue()}";
                    }
                    if (result == "400")
                    {
                        text = $"Europ Assist Notification could not be sent due to invalid data, (claim {claim.ClaimReferenceNumber})";

                    }
                    if (result == "500")
                    {
                        text = $"Europ Assist Notification could not be sent due to internal server error, (claim {claim.ClaimReferenceNumber})";
                    }

                    finalNote.Append(text);
                    finalNote.AppendLine();

                    claimNoteList.Add(Tuple.Create(policy.PolicyId, claim.PersonEventId), finalNote);
                    await CreateClaimNote(claimNoteList);
                }
            }
        }

        public async Task<List<ParentInsuranceType>> GetInsuranceTypesByEventTypeId(int eventTypeId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var insuranceTypes = await _parentInsuranceTypeRepository.Where(c => (int)c.EventType == eventTypeId && c.IsActive).ToListAsync();

                return Mapper.Map<List<ParentInsuranceType>>(insuranceTypes);
            }
        }

        public async Task<List<DiseaseType>> GetTypeOfDiseasesByInsuranceTypeId(int insuranceTypeId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var insuranceTypes = await _diseaseTypeRepository.Where(c => c.ParentInsuranceTypeId == insuranceTypeId && c.IsActive).ToListAsync();

                return Mapper.Map<List<DiseaseType>>(insuranceTypes);
            }
        }

        public async Task<DiseaseType> GetDiseasesByDiseaseypeId(int diseaseTypeId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var diseaseTypes = await _diseaseTypeRepository.Where(c => c.DiseaseTypeId == diseaseTypeId && c.IsActive).ToListAsync();

                return Mapper.Map<DiseaseType>(diseaseTypes);
            }
        }

        public async Task<List<EventCause>> GetCausesOfDisease(int diseaseTypeId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var diseaseCauses = await _eventCauseRepository.Where(c => (int)c.DiseaseTypeId == diseaseTypeId && c.IsActive).ToListAsync();

                return Mapper.Map<List<EventCause>>(diseaseCauses);
            }
        }

        public async Task<List<ParentInsuranceType>> GetInsuranceTypes()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var insuranceTypes = await _parentInsuranceTypeRepository.ToListAsync();

                return Mapper.Map<List<ParentInsuranceType>>(insuranceTypes);
            }
        }

        public async Task<RMA.Common.Entities.MailAttachment[]> GetDocumentTypeTemplateForPersonEvent(DocumentTypeEnum docTypeId, int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {

                var template = await _documentTemplateService.GetDocumentTemplateByTemplateId(docTypeId);
                byte[] byteData = (template.DocumentBinary == null) ? await _documentGeneratorService.GetFileByteData(template.Location) : template.DocumentBinary;
                var personEvent = await _personEventRepository.FindByIdAsync(personEventId);
                var personEventDeathDetails = await _eventService.GetPersonEventDeathDetail(personEventId);
                var lifeAssured = await _rolePlayerService.GetPerson(personEvent.InsuredLifeId);
                var claimant = await _rolePlayerService.GetRolePlayer(personEvent.ClaimantId);
                var addressDetails = claimant.RolePlayerAddresses.FirstOrDefault();
                var policies = await _policyService.GetPoliciesByRolePlayer(personEvent.InsuredLifeId);

                var documents = new MailAttachment[policies.Count];
                var counter = 0;
                foreach (var policy in policies)
                {
                    var documentTokens = new Dictionary<string, string>
                    {
                        ["PolicyNumber"] = policy.PolicyNumber,
                        ["PolicyInceptionDate"] = policy.PolicyInceptionDate.ToSaDateTime().ToString(),
                        ["ClaimNumber"] = personEvent.PersonEventId.ToString(),
                        ["ClaimentsTitle"] = claimant.Person.Title?.DisplayAttributeValue() ?? string.Empty,
                        ["ClaimentsName"] = claimant.Person.FirstName,
                        ["ClaimentsSurname"] = claimant.Person.Surname,
                        ["LifeAssuredTitle"] = lifeAssured.Person.Title?.DisplayAttributeValue() ?? string.Empty,
                        ["LifeAssuredName"] = lifeAssured.Person.FirstName,
                        ["LifeAssuredSurname"] = lifeAssured.Person.Surname,
                        ["CurrentDate"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy"),
                        ["DateOfDeath"] = personEventDeathDetails.DeathDate.ToString("dd MMM yyyy"),
                        ["ClaimType"] = personEvent.ClaimType?.DisplayAttributeValue() ?? string.Empty,
                        ["AddressLine1"] = addressDetails?.AddressLine1 ?? string.Empty,
                        ["AddressLine2"] = addressDetails?.AddressLine2 ?? string.Empty,
                        ["City"] = addressDetails?.City ?? string.Empty,
                        ["PostalCode"] = addressDetails?.PostalCode ?? string.Empty
                    };

                    var data = await _documentGeneratorService.GenerateWordDocument(byteData, documentTokens);

                    documents[counter] = new MailAttachment()
                    {
                        AttachmentByteData = data,
                        FileName = $"{template.Name}-[{personEvent.PersonEventId}]-[{policy.PolicyNumber}]{template.DocumentExtension}",
                        FileType = template.DocumentMimeType
                    };
                    counter++;
                }
                return await Task.FromResult(documents);
            }
        }

        public async Task<List<Lookup>> GetClaimStatuses()
        {
            return await Task.Run(() => typeof(ClaimStatusEnum).ToLookupList());
        }

        public async Task<Contracts.Entities.Claim> GetClaimByCompCarePersonEventId(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await (
                    from personEvent in _personEventRepository
                    join claim in _claimRepository on personEvent.PersonEventId equals claim.PersonEventId
                    where (personEvent.CompCarePersonEventId == personEventId && personEvent.IsStraightThroughProcess == true)
                    select new Contracts.Entities.Claim
                    {
                        PersonEventId = claim.PersonEventId,
                        ClaimId = claim.ClaimId,
                        ClaimLiabilityStatus = claim.ClaimLiabilityStatus,
                        ClaimReferenceNumber = claim.ClaimReferenceNumber,
                        ClaimStatus = claim.ClaimStatus
                    }
                    ).FirstOrDefaultAsync();
                return result;
            }
        }

        public async Task<PagedRequestResult<Contracts.Entities.Claim>> GetPagedClaimsByPolicyId(PagedRequest request)
        {
            Contract.Requires(request != null);

            if (int.TryParse(request.SearchCriteria, out int policyId))
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    // Also include claims on child policies
                    var policyIds = await _policyService.GetChildPolicyIds(policyId);
                    policyIds.Add(policyId);

                    var claims = await _claimRepository
                        .Where(claim => claim.PolicyId.HasValue && policyIds.Contains((int)claim.PolicyId))
                        .ToPagedResult<claim_Claim, Contracts.Entities.Claim>(request);

                    return new PagedRequestResult<Contracts.Entities.Claim>()
                    {
                        Page = request.Page,
                        PageCount = request.PageSize,
                        RowCount = claims.RowCount,
                        PageSize = request.PageSize,
                        Data = claims.Data
                    };
                }
            }
            else
            {
                throw new Exception($"Invalid policy id passed in request");
            }
        }

        public async Task<List<Contracts.Entities.Claim>> GetPersonEventClaims(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claim = await _claimRepository.Where(c => c.PersonEventId == personEventId).ToListAsync();
                await _claimRepository.LoadAsync(claim, e => e.ClaimBenefits);

                return Mapper.Map<List<Contracts.Entities.Claim>>(claim);
            }
        }

        public async Task<bool> SendAdditionalDocumentsRequest(AdditionalDocumentRequest additionalDocumentRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                await AddClaimNote(new ClaimNote
                {
                    PersonEventId = additionalDocumentRequest.PersonEventId,
                    Text = additionalDocumentRequest.Note,
                    Reason = additionalDocumentRequest.Reason
                });

                var personEvent = await _eventService.GetPersonEvent(additionalDocumentRequest.PersonEventId);
                await _claimCommunicationService.SendAdditionalDocumentRequestSms(additionalDocumentRequest);
                await _claimCommunicationService.SendAdditionalDocumentRequestEmail(additionalDocumentRequest, personEvent);

                return true;
            }
        }

        public async Task<PagedRequestResult<ClaimNote>> GetPagedClaimNotes(PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);
                var personEventId = Convert.ToInt32(pagedRequest.SearchCriteria);
                var claimNotes = await (from claimNote in _claimNoteRepository
                                        where claimNote.PersonEventId == personEventId && claimNote.Reason != "Tracing"
                                        select new ClaimNote
                                        {
                                            ClaimNoteId = claimNote.ClaimNoteId,
                                            ClaimId = claimNote.ClaimId ?? 0,
                                            Text = claimNote.Text,
                                            CreatedBy = claimNote.CreatedBy,
                                            CreatedDate = claimNote.CreatedDate,
                                            ModifiedBy = claimNote.ModifiedBy,
                                            ModifiedDate = claimNote.ModifiedDate
                                        }
                    ).ToPagedResult(pagedRequest);

                return new PagedRequestResult<ClaimNote>
                {
                    Data = claimNotes.Data,
                    RowCount = claimNotes.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(claimNotes.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task EditClaimNote(ClaimNote claimNote)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_ClaimNote>(claimNote);
                _claimNoteRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<PagedRequestResult<Contracts.Entities.Claim>> GetPagedClaimsAssignedToUser(PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);
                var userId = Convert.ToInt32(pagedRequest.SearchCriteria);

                var claimIds = await _poolWorkFlowService.GetPoolWorkFlowClaimsAssignedToUser(userId);

                var claims = await _claimRepository
                    .Where(s => claimIds.Contains(s.ClaimId) && !s.IsClosed && !s.IsDeleted)
                    .ToPagedResult(pagedRequest);

                var result = Mapper.Map<List<Contracts.Entities.Claim>>(claims.Data);

                return new PagedRequestResult<Contracts.Entities.Claim>
                {
                    Page = pagedRequest.Page,
                    PageCount = pagedRequest.PageSize,
                    RowCount = claims.RowCount,
                    PageSize = pagedRequest.PageSize,
                    Data = result
                };
            }
        }

        public async Task UpdatePersonEventWorkPoolFlow(int personEventId, WorkPoolEnum workPool, int claimStatusId, int userId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var result = await _personEventRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEventId);
                await _personEventRepository.LoadAsync(result, a => a.Claims);

                foreach (var claim in result.Claims)
                {
                    claim.AssignedToUserId = userId;
                }

                result.AssignedToUserId = userId;
                result.AssignedDate = DateTime.Now.ToSaDateTime();
                _personEventRepository.Update(result);

                var claimWorkFlows = await _claimWorkflowRepository
                   .Where(t => t.PersonEventId == personEventId && t.EndDateTime == null && t.Description == "VOPD found an issue with Id number").ToListAsync();

                if (claimWorkFlows.Count > 0)
                {
                    foreach (var claimWorkFlow in claimWorkFlows)
                    {
                        claimWorkFlow.AssignedToUserId = userId;
                        claimWorkFlow.StartDateTime = DateTimeHelper.SaNow;
                        claimWorkFlow.EndDateTime = DateTimeHelper.SaNow;
                        _claimWorkflowRepository.Update(claimWorkFlow);
                    }
                }
                else
                {
                    var entity = new claim_ClaimWorkflow
                    {
                        AssignedToUserId = userId,
                        PersonEventId = personEventId,
                        WorkPool = workPool == 0 ? WorkPoolEnum.IndividualAssessorpool : workPool,
                        StartDateTime = DateTimeHelper.SaNow,
                        ClaimStatus = (ClaimStatusEnum)claimStatusId
                    };
                    _claimWorkflowRepository.Create(entity);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task SendVOPDIntegrationExitMessageToCompCare(MessageType messageType, int compCarePersonEventId)
        {
            try
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var messageProperties = new Dictionary<string, string>
                    {
                        ["MessageTo"] = messageType.To,
                        ["MessageFrom"] = messageType.From,
                        ["Environment"] = messageType.Environment,
                        ["MessageTaskType"] = messageType.MessageTaskType,
                    };
                    if (!await _serviceBusMessage.CheckIfMessageHasBeenSentByMesageBody(compCarePersonEventId, messageType.To, messageType.From, messageType.CorrelationID, messageType.MessageBody))
                    {
                        var producer = new ServiceBusTopicProducer<MessageType>(stpSendTopic, stpSendConnectionString);
                        await producer.PublishMessageAsync(messageType, null, messageProperties);
                        await _serviceBusMessage.AddServiceBusMessage(messageType);
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error sending message to CompCare - Error Message {ex.Message}");
            }

        }

        private async Task SendIntegrationMessageToCompCare(PersonEvent personEvent, string note, RolePlayer employee)
        {
            try
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    if (personEvent.CompCarePersonEventId != 0 && !string.IsNullOrWhiteSpace(personEvent.CompCareIntegrationMessageId))
                    {
                        var stpIntegrationBody = new STPIntegrationBody()
                        {
                            PersonEventId = personEvent.CompCarePersonEventId.Value,
                            IDVOPDValidated = employee.Person.IsVopdVerified,
                            ReSubmitVOPD = false,
                            STPExitReasonId = -1,
                            STPExitReason = note,
                            SuspiciousTransactionStatusID = personEvent.SuspiciousTransactionStatus == SuspiciousTransactionStatusEnum.NotSuspicious ? 2 : 1
                        };
                        var messageBody = _serializer.Serialize(stpIntegrationBody);

                        var messageType = new MessageType
                        {
                            MessageBody = messageBody,
                            From = ClaimConstants.MessageFrom,
                            To = ClaimConstants.MessageTo,
                            MessageTaskType = ClaimConstants.MessageTaskType003,
                            Environment = _environment,
                            CorrelationID = personEvent.CompCareIntegrationMessageId,
                            EnqueuedTime = DateTime.UtcNow,
                        };

                        var messageProperties = new Dictionary<string, string>
                        {
                            ["MessageTo"] = messageType.To,
                            ["MessageFrom"] = messageType.From,
                            ["Environment"] = messageType.Environment,
                            ["MessageTaskType"] = messageType.MessageTaskType,
                        };
                        if (!await _serviceBusMessage.CheckIfMessageHasBeenSentByMesageBody(personEvent.CompCarePersonEventId.Value, messageType.To, messageType.From, messageType.CorrelationID, messageType.MessageBody))
                        {
                            var producer = new ServiceBusTopicProducer<MessageType>(stpSendTopic, stpSendConnectionString);
                            await producer.PublishMessageAsync(messageType, null, messageProperties);
                            await _serviceBusMessage.AddServiceBusMessage(messageType);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error sending message to CompCare - Error Message {ex.Message}");
            }

        }

        public async Task<List<ClientCare.Contracts.Entities.Product.Benefit>> GetClaimBenefits(int claimId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var benefitIds = await _claimBenefitRepository.Where(s => s.ClaimId == claimId).Select(s => s.BenefitId).ToListAsync();
                return await _productOptionService.GetBenefitsByBenefitIdsOnly(benefitIds);
            }
        }

        public async Task<bool> CheckClaimMedicalBenefits(int claimId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                bool hasMedicalBenefits = false;
                var personEvent = await GetPersonEventByClaimId(claimId);

                if (personEvent != null && personEvent.Claims.Count > 0 && personEvent.Claims[0].PolicyId.HasValue)
                {
                    var policy =
                        await _policyService.GetPolicyWithoutReferenceData(personEvent.Claims[0].PolicyId.Value);
                    if (policy != null)
                    {
                        var benefits = await _productOptionService.GetBenefitsForOption(policy.ProductOptionId);

                        if (benefits != null)
                        {
                            if (benefits.Find(x => x.BenefitType == BenefitTypeEnum.Medical) != null)
                            {
                                hasMedicalBenefits = true;
                            }
                            else
                            {
                                hasMedicalBenefits = false;
                            }
                        }
                    }
                }

                return hasMedicalBenefits;
            }
        }

        public async Task<Contracts.Entities.PersonEvent> NotificationToTeamLeader(int personEventId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var teamLeaderDetails = await _userService.GetUsersByRoleName(claimsTeamLead);

                var personEventEntity = await _personEventRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEventId);
                var mappedEvent = Mapper.Map<Contracts.Entities.PersonEvent>(personEventEntity);
                var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEventId);
                string claimNumber = claimEntity.ClaimReferenceNumber;

                SqlParameter[] parameters = {
                    new SqlParameter("PersonEventId", personEventId)
                    };

                var claimDetails = await _personEventRepository.SqlQueryAsync<AutoAjudicateClaim>(DatabaseConstants.GetClaimToAcknowledge, parameters);
                var claimEmail = await GenerateNotification(claimDetails[0], TemplateTypeEnum.ClaimsTeamLeaderNotification);

                claimDetails[0].EmployeeEmailAddress = string.Join(";", teamLeaderDetails.Select(x => x.Email));

                var employee = await _rolePlayerService.GetPerson(personEventEntity.InsuredLifeId);
                var employeeContact = await _rolePlayerService.GetRolePlayerContactDetails(personEventEntity.InsuredLifeId);
                var employeeContactInformation = employeeContact.Count > 0 ? employeeContact.Where(r => r.CommunicationType == CommunicationTypeEnum.SMS).FirstOrDefault() : null;

                await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
                {
                    ItemId = personEventId,
                    NoteCategory = NoteCategoryEnum.PersonEvent,
                    NoteItemType = NoteItemTypeEnum.PersonEvent,
                    NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                    NoteType = NoteTypeEnum.SystemAdded,
                    Text = "Claim escalation notification to team leader",
                    IsActive = true
                });

                await _claimCommunicationService.SendNotification(claimEmail, null, employee, claimNumber, null, ClaimCommunicationTypeEnum.TeamLeaderNotification);

                return mappedEvent;
            }
        }

        private Task<ClaimEmail> GenerateNotification(AutoAjudicateClaim autoAjudicateClaim, TemplateTypeEnum templateTypeEnum)
        {
            var claimEmail = new ClaimEmail()
            {
                ClaimId = 0,
                EmailAddress = autoAjudicateClaim.EmployeeEmailAddress,
                PersonEventId = autoAjudicateClaim.PersonEventId,
                TemplateType = templateTypeEnum,
                Tokens = new Dictionary<string, string>
                {
                    ["{CompanyName}"] = $"{autoAjudicateClaim.CompanyName}",
                    ["{Address}"] = autoAjudicateClaim.CompanyAddressLine1,
                    ["{City/Town}"] = autoAjudicateClaim.CompanyCity,
                    ["{PostalCode}"] = autoAjudicateClaim.CompanyPostalCode,
                    ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy"),
                    ["{ClaimNumber}"] = autoAjudicateClaim.CompCarePEVRefNumber ?? autoAjudicateClaim.ClaimReferenceNumber,
                    ["{EmployeeName}"] = $"{autoAjudicateClaim.EmployeeFirstName} {autoAjudicateClaim.EmployeeSurname}",
                    ["{CompanyNumber}"] = autoAjudicateClaim.CompanyReferenceNumber,
                    ["{IndustryNumber}"] = autoAjudicateClaim.CompanyReferenceNumber,
                    ["{DateOfAccident}"] = autoAjudicateClaim.EventDate.ToString("dd MMM yyyy"),

                    ["{Title}"] = autoAjudicateClaim.Title.DisplayAttributeValue(),
                    ["{Surname}"] = autoAjudicateClaim.EmployeeSurname,
                }
            };

            return Task.FromResult<ClaimEmail>(claimEmail);
        }

        public async Task<Contracts.Entities.PersonEvent> NotificationOfLiabilityAcceptance(int personEventId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var personEventEntity = await _personEventRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEventId);
                var mappedEvent = Mapper.Map<Contracts.Entities.PersonEvent>(personEventEntity);
                var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEventId);
                string claimNumber = claimEntity.ClaimReferenceNumber;

                SqlParameter[] parameters = {
                    new SqlParameter("PersonEventId", personEventId)
                    };

                var claimDetails = await _personEventRepository.SqlQueryAsync<AutoAjudicateClaim>(DatabaseConstants.GetClaimToAcknowledge, parameters);
                var claimEmail = await GenerateNotification(claimDetails[0], TemplateTypeEnum.LiabilityAcceptanceNotification);

                var employee = await _rolePlayerService.GetPerson(personEventEntity.InsuredLifeId);
                var employeeContact = await _rolePlayerService.GetRolePlayerContactDetails(personEventEntity.InsuredLifeId);
                var employeeContactInformation = employeeContact.Count > 0 ? employeeContact.Where(r => r.CommunicationType == CommunicationTypeEnum.SMS).FirstOrDefault() : null;

                var claimSMS = await GenerateSMS(claimDetails[0], employeeContactInformation.ContactNumber, TemplateTypeEnum.LiabilityAcceptanceNotification);
                var rolePlayerContacts = await _rolePlayerService.GetRolePlayerContactDetails((int)personEventEntity.CompanyRolePlayerId);
                var contactInformation = rolePlayerContacts.Count > 0 ? rolePlayerContacts.Where(r => r.RolePlayerContactInformations.Any(b => b.ContactInformationType == ContactInformationTypeEnum.Claims)).FirstOrDefault() : null;

                await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
                {
                    ItemId = personEventId,
                    NoteCategory = NoteCategoryEnum.PersonEvent,
                    NoteItemType = NoteItemTypeEnum.PersonEvent,
                    NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                    NoteType = NoteTypeEnum.SystemAdded,
                    Text = "Notification of liability acceptance",
                    IsActive = true
                });

                if (personEventEntity.PersonEventAccidentDetail != null
                    && personEventEntity.PersonEventAccidentDetail.IsRoadAccident && personEventEntity.PersonEventAccidentDetail.IsPublicRoad)
                {
                    await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
                    {
                        ItemId = personEventId,
                        NoteCategory = NoteCategoryEnum.PersonEvent,
                        NoteItemType = NoteItemTypeEnum.PersonEvent,
                        NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                        NoteType = NoteTypeEnum.SystemAdded,
                        Text = "Claim refered for potential recovery",
                        IsActive = true
                    });
                }

                var claimCommunicationMessage = await _claimCommunicationService.GetContactDetailsForEmployeeAndEmployer(personEventId, ClaimCommunicationTypeEnum.LiabilityAcceptanceNotification);
                claimCommunicationMessage.ClaimCommunicationType = ClaimCommunicationTypeEnum.LiabilityAcceptanceNotification;
                claimCommunicationMessage.Employee = employee;
                claimCommunicationMessage.ClaimNumber = claimNumber;
                claimCommunicationMessage.PersonEvent = mappedEvent;

                if (claimCommunicationMessage.ClaimEmployerEmail != null)
                {
                    claimCommunicationMessage.ClaimEmployerEmail.Tokens = claimEmail.Tokens;
                    claimCommunicationMessage.ClaimEmployerSMS.TemplateType = TemplateTypeEnum.LiabilityAcceptanceNotification;
                }
                if (claimCommunicationMessage.EmployeeClaimEmail != null)
                {
                    claimCommunicationMessage.EmployeeClaimEmail.Tokens = claimEmail.Tokens;
                    claimCommunicationMessage.ClaimEmployerSMS.TemplateType = TemplateTypeEnum.LiabilityAcceptanceNotification;
                }

                if (claimCommunicationMessage.ClaimEmployerSMS != null)
                {
                    claimCommunicationMessage.ClaimEmployerSMS.Tokens = claimSMS.Tokens;
                    claimCommunicationMessage.ClaimEmployerSMS.TemplateType = TemplateTypeEnum.LiabilityAcceptanceNotification;
                }
                if (claimCommunicationMessage.EmployeeClaimSMS != null)
                {
                    claimCommunicationMessage.EmployeeClaimSMS.Tokens = claimSMS.Tokens;
                    claimCommunicationMessage.ClaimEmployerSMS.TemplateType = TemplateTypeEnum.LiabilityAcceptanceNotification;
                }
                await _claimCommunicationService.PublishCommunicationNotification(claimCommunicationMessage);

                return mappedEvent;
            }
        }

        private Task<ClaimSMS> GenerateSMS(AutoAjudicateClaim autoAjudicateClaim, string cellNumber, TemplateTypeEnum templateTypeEnum)
        {
            var claimSMS = new ClaimSMS()
            {
                ClaimId = 0,
                MobileNumber = cellNumber,
                PersonEventId = autoAjudicateClaim.PersonEventId,
                TemplateType = templateTypeEnum,
                Tokens = new Dictionary<string, string>
                {
                    ["[personEventNumber]"] = autoAjudicateClaim.CompCarePEVRefNumber ?? autoAjudicateClaim.ClaimReferenceNumber,
                }
            };
            return Task.FromResult<ClaimSMS>(claimSMS);
        }

        public async Task<Contracts.Entities.PersonEvent> NotificationOfZeroPercentClosure(int personEventId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var personEventEntity = await _personEventRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEventId);
                var mappedEvent = Mapper.Map<Contracts.Entities.PersonEvent>(personEventEntity);
                var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEventId);
                string claimNumber = claimEntity.ClaimReferenceNumber;

                SqlParameter[] parameters = {
                    new SqlParameter("PersonEventId", personEventId)
                    };

                var claimDetails = await _personEventRepository.SqlQueryAsync<AutoAjudicateClaim>(DatabaseConstants.GetClaimToAcknowledge, parameters);
                var claimEmail = await GenerateNotification(claimDetails[0], TemplateTypeEnum.NotificationOfZeroPercentClosure);

                var employee = await _rolePlayerService.GetPerson(personEventEntity.InsuredLifeId);

                var claimSMS = await GenerateSMS(claimDetails[0], employee.CellNumber, TemplateTypeEnum.NotificationOfZeroPercentClosure);
                var claimCommunicationMessage = await _claimCommunicationService.GetContactDetailsForEmployeeAndEmployer(personEventId, ClaimCommunicationTypeEnum.NotificationOfZeroPercentClosure);
                if (claimCommunicationMessage.ClaimEmployerEmail != null)
                    claimCommunicationMessage.ClaimEmployerEmail.Tokens = claimEmail.Tokens;
                if (claimCommunicationMessage.EmployeeClaimEmail != null)
                    claimCommunicationMessage.EmployeeClaimEmail.Tokens = claimEmail.Tokens;

                if (claimCommunicationMessage.ClaimEmployerSMS != null)
                    claimCommunicationMessage.ClaimEmployerSMS.Tokens = claimSMS.Tokens;
                if (claimCommunicationMessage.EmployeeClaimSMS != null)
                    claimCommunicationMessage.EmployeeClaimSMS.Tokens = claimSMS.Tokens;

                await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
                {
                    ItemId = personEventId,
                    NoteCategory = NoteCategoryEnum.PersonEvent,
                    NoteItemType = NoteItemTypeEnum.PersonEvent,
                    NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                    NoteType = NoteTypeEnum.SystemAdded,
                    Text = "Notification of zero percent closure",
                    IsActive = true
                });

                var personEvent = Mapper.Map<PersonEvent>(personEventEntity);
                claimCommunicationMessage.ClaimCommunicationType = ClaimCommunicationTypeEnum.NotificationOfZeroPercentClosure;
                claimCommunicationMessage.Employee = employee;
                claimCommunicationMessage.ClaimNumber = claimNumber;
                claimCommunicationMessage.PersonEvent = personEvent;
                await _claimCommunicationService.PublishCommunicationNotification(claimCommunicationMessage);

                return mappedEvent;
            }
        }

        public async Task<ClaimStatusEnum> VerifyMVAClaim(PersonEvent personEvent, ClaimStatusEnum claimStatus)
        {
            var estimates = await _medicalEstimatesService.GetICD10Estimates(new ICD10EstimateFilter { EventType = EventTypeEnum.Accident, Icd10Codes = personEvent.FirstMedicalReport.MedicalReportForm.Icd10Codes, ReportDate = personEvent.FirstMedicalReport.MedicalReportForm.ReportDate });
            var eventDetails = await _eventService.GetPersonEventDetails(personEvent.PersonEventId);
            if (estimates.Count > 0)
            {

                var ICD10CodeJson = _serializer.Deserialize<ArrayList>(personEvent.FirstMedicalReport.MedicalReportForm.Icd10CodesJson);
                var ICD10CodeString = ICD10CodeJson[0].ToString();
                var ICD10CodeDetails = _serializer.Deserialize<ICD10CodeJsonObject>(ICD10CodeString);

                var medicalEstimateAmounts = new List<Decimal>();
                var totalEstimateAmounts = new Decimal();

                switch (ICD10CodeDetails.Severity)
                {
                    case (int)InjurySeverityTypeEnum.Severe:
                        medicalEstimateAmounts = estimates.OrderByDescending(b => b.MedicalMaximumCost).Select(a => a.MedicalMaximumCost).ToList();

                        break;
                    case (int)InjurySeverityTypeEnum.Moderate:
                        medicalEstimateAmounts = estimates.OrderByDescending(b => b.MedicalAverageCost).Select(a => a.MedicalAverageCost).ToList();

                        break;
                    default:
                        medicalEstimateAmounts = estimates.OrderByDescending(b => b.MedicalMinimumCost).Select(a => a.MedicalMinimumCost).ToList();

                        break;
                }
                for (int i = 0; i < medicalEstimateAmounts.Count; i++)
                {
                    totalEstimateAmounts += medicalEstimateAmounts[i];
                }

                if (totalEstimateAmounts > ClaimConstants.MVAMaxAmount)
                {
                    claimStatus = ClaimStatusEnum.PendingInvestigations;
                }
            }
            return claimStatus;
        }

        public async Task<bool> SendCommunication(int claimId, int emailTemplateId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.ClaimId == claimId);
                var personEventEntity = await _personEventRepository.FirstOrDefaultAsync(a => a.PersonEventId == claimEntity.PersonEventId);
                var mappedPersonEvent = Mapper.Map<Contracts.Entities.PersonEvent>(personEventEntity);

                string claimNumber = claimEntity.ClaimReferenceNumber;

                SqlParameter[] parameters = {
                    new SqlParameter("PersonEventId", claimEntity.PersonEventId)
                    };

                var claimDetails = await _personEventRepository.SqlQueryAsync<AutoAjudicateClaim>(DatabaseConstants.GetClaimToAcknowledge, parameters);
                var claimEmail = await GenerateNotification(claimDetails[0], (TemplateTypeEnum)emailTemplateId);
                var employee = await _rolePlayerService.GetPerson(personEventEntity.InsuredLifeId);

                var claimSMS = await GenerateSMS(claimDetails[0], null, (TemplateTypeEnum)emailTemplateId);
                var claimCommunicationMessage = await _claimCommunicationService.GetContactDetailsForEmployeeAndEmployer(claimEntity.PersonEventId, ClaimCommunicationTypeEnum.NotificationAcknowledgement);
                if (claimCommunicationMessage.ClaimEmployerEmail != null)
                    claimCommunicationMessage.ClaimEmployerEmail.Tokens = claimEmail.Tokens;
                if (claimCommunicationMessage.EmployeeClaimEmail != null)
                    claimCommunicationMessage.EmployeeClaimEmail.Tokens = claimEmail.Tokens;

                if (claimCommunicationMessage.ClaimEmployerSMS != null)
                    claimCommunicationMessage.ClaimEmployerSMS.Tokens = claimSMS.Tokens;
                if (claimCommunicationMessage.EmployeeClaimSMS != null)
                    claimCommunicationMessage.EmployeeClaimSMS.Tokens = claimSMS.Tokens;

                claimCommunicationMessage.ClaimCommunicationType = ClaimCommunicationTypeEnum.NotificationAcknowledgement;
                claimCommunicationMessage.Employee = employee;
                claimCommunicationMessage.ClaimNumber = claimNumber;
                claimCommunicationMessage.PersonEvent = mappedPersonEvent;

                await _claimCommunicationService.PublishCommunicationNotification(claimCommunicationMessage);

                return true;
            }
        }

        public async Task<bool> RequestDocumentsfromHCP(int claimId, int healthcareProviderId, int emailTemplateId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.ClaimId == claimId);
                var personEventEntity = await _personEventRepository.FirstOrDefaultAsync(a => a.PersonEventId == claimEntity.PersonEventId);
                var mappedPersonEvent = Mapper.Map<Contracts.Entities.PersonEvent>(personEventEntity);

                string claimNumber = claimEntity.ClaimReferenceNumber;

                SqlParameter[] parameters = {
                    new SqlParameter("PersonEventId", claimEntity.PersonEventId)
                    };

                var claimDetails = await _personEventRepository.SqlQueryAsync<AutoAjudicateClaim>(DatabaseConstants.GetClaimToAcknowledge, parameters);
                var claimEmail = await GenerateNotification(claimDetails[0], (TemplateTypeEnum)emailTemplateId);
                var employee = await _rolePlayerService.GetPerson(personEventEntity.InsuredLifeId);

                var claimSMS = await GenerateSMS(claimDetails[0], null, (TemplateTypeEnum)emailTemplateId);
                var claimCommunicationMessage = await _claimCommunicationService.GetContactDetailsForEmployeeAndEmployer(claimEntity.PersonEventId, ClaimCommunicationTypeEnum.NotificationAcknowledgement);
                if (claimCommunicationMessage.ClaimEmployerEmail != null)
                    claimCommunicationMessage.ClaimEmployerEmail.Tokens = claimEmail.Tokens;


                claimCommunicationMessage.ClaimCommunicationType = ClaimCommunicationTypeEnum.NotificationAcknowledgement;
                claimCommunicationMessage.Employee = employee;
                claimCommunicationMessage.ClaimNumber = claimNumber;
                claimCommunicationMessage.PersonEvent = Mapper.Map<PersonEvent>(personEventEntity);

                await _claimCommunicationService.PublishCommunicationNotification(claimCommunicationMessage);

                return true;
            }

        }

        public async Task<List<SundryServiceProvider>> GetSundryServiceProvidersByType(SundryServiceProviderTypeEnum sundryServiceProviderType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var sundryProviders = await _sundryServiceProviderRepository.Where(x => x.SundryServiceProviderType == sundryServiceProviderType).ToListAsync();
                return Mapper.Map<List<SundryServiceProvider>>(sundryProviders);
            }
        }

        public async Task<List<SundryServiceProvider>> GetSundryProviders(string request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var sundryProviders = await _sundryServiceProviderRepository
                    .Where(x => x.Name.Contains(request)
                            || x.Description.Contains(request)
                            || x.CompanyNumber.Contains(request)).ToListAsync();
                return Mapper.Map<List<SundryServiceProvider>>(sundryProviders);
            }
        }

        public async Task<List<ReferralTypeLimitConfiguration>> GetAuthorisationLimitsByReferralTypeLimitGroup(ClaimReferralTypeLimitGroupEnum claimReferralTypeLimitGroup)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var referralTypeLimits = await _referralTypeLimitConfigurationRepository.Where(x => x.ReferralTypeLimitGroupId == (int)claimReferralTypeLimitGroup).ToListAsync();
                return Mapper.Map<List<ReferralTypeLimitConfiguration>>(referralTypeLimits);
            }
        }

        public async Task<bool> ConfirmEstimates(PersonEvent personEvent)
        {
            var vopdStatus = await ProcessVOPDReponse(personEvent.RolePlayer.RolePlayerId);
            if (vopdStatus == false)
            {
                return false;
            }
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (personEvent.FirstMedicalReport != null)
                {
                    var estimates = await _medicalEstimatesService.GetICD10Estimates(new ICD10EstimateFilter { EventType = EventTypeEnum.Accident, Icd10Codes = personEvent.FirstMedicalReport.MedicalReportForm.Icd10Codes, ReportDate = personEvent.FirstMedicalReport.MedicalReportForm.ReportDate });
                    var claims = await _claimRepository.Where(c => c.PersonEventId == personEvent.PersonEventId).ToListAsync();
                    var personevents = await _personEventRepository.Where(x => x.PersonEventId == personEvent.PersonEventId).SingleAsync();

                    var eventDetails = await _eventService.GetPersonEventDetails(personEvent.PersonEventId);

                    if (estimates.Count > 0)
                    {
                        var ICD10CodeJson = _serializer.Deserialize<ArrayList>(personEvent.FirstMedicalReport.MedicalReportForm.Icd10CodesJson);
                        var ICD10CodeString = ICD10CodeJson[0].ToString();
                        var ICD10CodeDetails = _serializer.Deserialize<ICD10CodeJsonObject>(ICD10CodeString);

                        var medicalEstimateAmounts = new List<Decimal>();
                        var pdEstimateAmounts = new List<Decimal>();

                        switch (ICD10CodeDetails.Severity)
                        {
                            case (int)InjurySeverityTypeEnum.Severe:
                                medicalEstimateAmounts = estimates.OrderByDescending(b => b.MedicalMaximumCost).Select(a => a.MedicalMaximumCost).ToList();
                                pdEstimateAmounts = estimates.OrderByDescending(b => b.PDExtentMaximum).Select(a => a.PDExtentMaximum).ToList();

                                break;
                            case (int)InjurySeverityTypeEnum.Moderate:
                                medicalEstimateAmounts = estimates.OrderByDescending(b => b.MedicalAverageCost).Select(a => a.MedicalAverageCost).ToList();
                                pdEstimateAmounts = estimates.OrderByDescending(b => b.PDExtentAverage).Select(a => a.PDExtentAverage).ToList();

                                break;
                            default:
                                medicalEstimateAmounts = estimates.OrderByDescending(b => b.MedicalMinimumCost).Select(a => a.MedicalMinimumCost).ToList();
                                pdEstimateAmounts = estimates.OrderByDescending(b => b.PDExtentMinimum).Select(a => a.PDExtentMinimum).ToList();

                                break;
                        }

                        if (pdEstimateAmounts[0] > ClaimConstants.CaMaxPDPercentage && pdEstimateAmounts[0] < ClaimConstants.SCAMaxPDPercentage)
                        {
                            personevents.InformantId = personEvent.InformantId;
                            personevents.DateSubmitted = DateTime.Now;
                            personevents.SubmittedByUserId = RmaIdentity.UserId;
                            personevents.SuspiciousTransactionStatus = personEvent.SuspiciousTransactionStatus; ;
                            _personEventRepository.Update(personevents);

                            foreach (var claim in claims)
                            {
                                claim.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Pending;
                                claim.ClaimStatus = ClaimStatusEnum.PendingInvestigations;
                                claim.ClaimStatusChangeDate = DateTime.Now;
                                _claimRepository.Update(claim);

                                var ttdResult = _claimInvoiceService.RejectTTDLiabilityDecisionNotMade(claim.ClaimId, ClaimStatusEnum.PendingInvestigations, claim.ClaimLiabilityStatus);
                            }
                        }
                    }
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }

                return true;
            }
        }

        public async Task<int> DeleteClaim(Note claimNote)
        {
            var canDeleteClaim = await _userService.HasPermission(claimNote?.ModifiedBy, "Delete Claim");
            int result = -1;
            if (canDeleteClaim)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var claim = await _claimRepository.FindByIdAsync(claimNote.ItemId);
                    if (claim != null)
                    {
                        claimNote.Text = $"Delete Claim: {claimNote.Text}";
                        result = await _noteService.AddNote(claimNote);
                        claim.ClaimStatus = ClaimStatusEnum.Deleted;
                        claim.ClaimStatusChangeDate = System.DateTime.Now;
                        _claimRepository.Update(claim);
                        result = await scope.SaveChangesAsync();
                        if (result > 0)
                        {
                            result = await this._claimCommunicationService.SendDeletedClaimEmail(claim.PersonEventId);
                        }
                    }
                }
            }
            return result;
        }

        public async Task<int> GetICD10PDPercentageEstimates(List<ICD10EstimateFilter> icd10EstimateFilters, InjurySeverityTypeEnum injurySeverityType)
        {
            var icd10CodePdPercentage = 0;

            var tempmIcd10CodePdPercentage = new List<int>();

            foreach (var icd10EstimateFilter in icd10EstimateFilters)
            {
                var estimates = await _medicalEstimatesService.GetICD10Estimates(icd10EstimateFilter);
                if (injurySeverityType == InjurySeverityTypeEnum.Mild)
                {
                    icd10CodePdPercentage = Convert.ToInt32(estimates.OrderByDescending(b => b.PDExtentMinimum).Select(a => a.PDExtentMinimum).FirstOrDefault());
                }
                else if (injurySeverityType == InjurySeverityTypeEnum.Moderate)
                {
                    icd10CodePdPercentage = Convert.ToInt32(estimates.OrderByDescending(b => b.PDExtentAverage).Select(a => a.PDExtentAverage).FirstOrDefault());
                }
                else
                {
                    icd10CodePdPercentage = Convert.ToInt32(estimates.OrderByDescending(b => b.PDExtentMaximum).Select(a => a.PDExtentMaximum).FirstOrDefault());
                }

                tempmIcd10CodePdPercentage.Add(icd10CodePdPercentage);
            }
            return tempmIcd10CodePdPercentage.Max();
        }

        public async Task<int> GenerateClaimEstimates(List<ICD10EstimateFilter> icd10EstimateFilters, InjurySeverityTypeEnum injurySeverityType, IndustryClassEnum industryClass, int personEventId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var checkEstimatedBenefitExist = await _claimInvoiceService.GetClaimEstimateByPersonEventId(personEventId);

                if (checkEstimatedBenefitExist.Count == 0)
                {
                    var claimEstimate = new ClaimEstimate();
                    var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEventId);

                    if (claimEntity.PolicyId != null)
                    {
                        var benefits = await GetClaimbenefit(claimEntity.PolicyId.Value);

                        var industryClassEnum = industryClass == IndustryClassEnum.Metals ? (await _configurationService.GetModuleSetting(SystemSettings.MetalEstimatedEarnings))
                                                                                        : (await _configurationService.GetModuleSetting(SystemSettings.MiningEstimatedEarnings));

                        var estimates = await _medicalEstimatesService.GetICD10Estimates(icd10EstimateFilters[0]);
                        foreach (var benefit in benefits)
                        {
                            claimEstimate.PersonEventId = personEventId;
                            claimEstimate.Notes = "Estimate for this person Event: " + personEventId;
                            claimEstimate.EstimateType = (EstimateTypeEnum)benefit.EstimateTypeId.Value;
                            claimEstimate.BenefitId = benefit.Id;
                            claimEstimate.EstimatedDaysOff = benefit.EstimateTypeId == (int)EstimateTypeEnum.DaysOff ? estimates[0].DaysOffMinimum : 0;
                            claimEstimate.EstimatePd = benefit.EstimateTypeId == (int)EstimateTypeEnum.PDLumpSum ? await GetICD10PDPercentageEstimates(icd10EstimateFilters, injurySeverityType) : 0;
                            var tokens = new Dictionary<string, string>
                            {
                                ["AccidentEarnings"] = $"{industryClassEnum}",
                                ["DaysOff"] = $"{claimEstimate.EstimatedDaysOff}",
                                ["PdPercentage"] = $"{await GetICD10PDPercentageEstimates(icd10EstimateFilters, injurySeverityType)}"
                            };
                            claimEstimate.EstimatedValue = await _claimInvoiceService.CalculateClaimBenefits(benefit.Id, tokens);

                            await _claimInvoiceService.AddClaimEstimate(claimEstimate);
                        }
                    }
                }
            }
            return 0;
        }

        public async Task<decimal> GetEstimatedEarning(IndustryClassEnum industryClass, int personEventId)
        {
            decimal industryClassEarning = 0M;
            using (var scope = _dbContextScopeFactory.Create())
            {
                var metalEarnings = await _configurationService.GetModuleSetting(SystemSettings.MetalEstimatedEarnings);
                var miningEarnings = await _configurationService.GetModuleSetting(SystemSettings.MiningEstimatedEarnings);
                var otherEarnings = await _configurationService.GetModuleSetting(SystemSettings.OtherEstimatedEarnings);

                if (industryClass == IndustryClassEnum.Mining)
                {
                    industryClassEarning = StringExtensions.ToDecimal(miningEarnings);
                }
                else if (industryClass == IndustryClassEnum.Metals)
                {
                    industryClassEarning = StringExtensions.ToDecimal(metalEarnings);
                }
                else if (industryClass == IndustryClassEnum.Other)
                {
                    industryClassEarning = StringExtensions.ToDecimal(otherEarnings);
                }
            }
            return industryClassEarning;
        }

        private async Task<List<ClientCare.Contracts.Entities.Product.Benefit>> GetClaimbenefit(int policyId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var productOptionId = (await _policyService.GetPolicyWithoutReferenceData(policyId)).ProductOptionId;
                var benefits = await _productOptionService.GetBenefitsForOption(productOptionId);
                return benefits.Where(x => x.IsMedicalReportRequired == true).ToList();
            }
        }

        public async Task<bool> SendClaimToPensions(Contracts.Entities.Claim claim)
        {
            Contract.Requires(claim != null && claim.PdVerified && claim.DisabilityPercentage > 0);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var result = await _claimFinalizedIntegrationService.PublishPensionClaims(claim);

                if (result)
                {
                    await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
                    {
                        ItemId = claim.PersonEventId,
                        NoteCategory = NoteCategoryEnum.PersonEvent,
                        NoteItemType = NoteItemTypeEnum.PersonEvent,
                        NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                        NoteType = NoteTypeEnum.SystemAdded,
                        Text = $"Pension case initiated for claim: {claim.ClaimReferenceNumber}",
                        IsActive = true
                    });
                }

                var poolWorkFlowRequest = new PoolWorkFlowRequest
                {
                    ItemId = claim.PersonEventId,
                    ItemType = PoolWorkFlowItemTypeEnum.PersonEvent
                };

                var poolWorkFlow = await _poolWorkFlowService.GetPoolWorkFlowByTypeAndId(poolWorkFlowRequest);

                if (poolWorkFlow != null)
                {
                    poolWorkFlow.Instruction = "Pension case initiated";
                    await _poolWorkFlowService.HandlePoolWorkFlow(poolWorkFlow);
                }

                return result;
            }
        }

        public async Task<int> UpdateClaimPD(Contracts.Entities.Claim claim)
        {
            Contract.Requires(claim != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditClaim);

            using (var scope = _dbContextScopeFactory.Create())
            {
                try
                {
                    var claimEntity = await _claimRepository.FirstOrDefaultAsync(x => x.ClaimId == claim.ClaimId);
                    claimEntity.DisabilityPercentage = claim.DisabilityPercentage;
                    claimEntity.Caa = claim.CAA;
                    claimEntity.FamilyAllowance = claim.FamilyAllowance;

                    if (claim.CAA > 0)
                    {
                        await AddClaimNote(new ClaimNote
                        {
                            ClaimId = claim.ClaimId,
                            Text = $"Claim CAA recommenced - {claim.CAA}",
                        });
                    }

                    if (claim.FamilyAllowance > 0)
                    {
                        await AddClaimNote(new ClaimNote
                        {
                            ClaimId = claim.ClaimId,
                            Text = $"Claim FA recommenced {claim.FamilyAllowance}",
                        });
                    }

                    _claimRepository.Update(claimEntity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    ex.LogException("Error");
                }
                return claim.ClaimId;
            }


        }

        public async Task<List<int>> AddNewClaimsBenefitAmounts(List<ClaimsBenefitsAmount> claimsBenefitsAmounts)
        {
            Contract.Requires(claimsBenefitsAmounts != null);

            var claimBenefitsAmountsIds = new List<int>();

            foreach (var claimsBenefitsAmount in claimsBenefitsAmounts)
            {
                var Id = await AddNewClaimsBenefitAmount(claimsBenefitsAmount);
                claimBenefitsAmountsIds.Add(Id);
            }

            return claimBenefitsAmountsIds;
        }

        private async Task<int> AddNewClaimsBenefitAmount(ClaimsBenefitsAmount claimsBenefitsAmount)
        {
            Contract.Requires(claimsBenefitsAmount != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var claimBenefitsAmountEntity = Mapper.Map<claim_ClaimBenefitsAmount>(claimsBenefitsAmount);

                _benefitsAmountRepository.Create(claimBenefitsAmountEntity);
                await scope.SaveChangesAsync();

                return claimBenefitsAmountEntity.ClaimBenefitAmountId;
            }
        }

        public async Task<List<ClaimsBenefitsAmount>> GetClaimsBenefitAmounts(bool activeBenefitsAmounts)
        {
            using (_dbContextScopeFactory.Create())
            {
                if (activeBenefitsAmounts)
                {
                    var liveBenefitsAmounts = await _benefitsAmountRepository.Where(d => (d.EndDate.CompareTo(System.DateTime.Now) > 0)).ToListAsync();
                    return Mapper.Map<List<ClaimsBenefitsAmount>>(liveBenefitsAmounts);
                }
                else
                {
                    var historicalBenefitsAmounts = await _benefitsAmountRepository.Where(d => (d.EndDate.CompareTo(System.DateTime.Now) <= 0)).ToListAsync();
                    return Mapper.Map<List<ClaimsBenefitsAmount>>(historicalBenefitsAmounts);
                }
            }
        }

        public async Task<int> AddClaimAdditionalRequiredDocument(List<ClaimAdditionalRequiredDocument> additionalDocs)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var entity = Mapper.Map<List<claim_ClaimAdditionalRequiredDocument>>(additionalDocs);
                _claimAdditionalRequiredDocumentRepository.Create(entity);
                await _claimCommunicationService.GetSelectedRequiredDocuments(additionalDocs);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.Select(a => a.DocumentId).FirstOrDefault();
            }
        }

        public async Task<List<ClaimAdditionalRequiredDocument>> GetClaimAdditionalRequiredDocument(int personeventId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var requiredDocument = await _claimAdditionalRequiredDocumentRepository.Where(x => x.PersoneventId == personeventId).ToListAsync();
                return Mapper.Map<List<ClaimAdditionalRequiredDocument>>(requiredDocument);
            }
        }

        public async Task<List<ReferralTypeLimitConfiguration>> GetReferralTypeLimitConfiguration()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                List<ReferralTypeLimitConfiguration> result = await _referralTypeLimitConfigurationRepository.SqlQueryAsync<ReferralTypeLimitConfiguration>(DatabaseConstants.GetReferralTypeLimitConfiguration);
                return result;
            }
        }

        public async Task<int> SaveReferralTypeLimitConfiguration(ReferralTypeLimitConfiguration data)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                try
                {
                    SqlParameter[] parameters = {
                    new SqlParameter("ReferralTypeLimitConfigurationId", data.ReferralTypeLimitConfigurationId),
                    new SqlParameter("ReferralTypeId", data.ReferralTypeLimitGroupId),
                    new SqlParameter("Limit", data.AmountLimit),
                    new SqlParameter("PermissionName", data.PermissionName),
                    new SqlParameter("RecordCount", SqlDbType.Int)
             };
                    parameters[4].Direction = ParameterDirection.Output;
                    await _referralTypeLimitConfigurationRepository.SqlQueryAsync<List<int>>(DatabaseConstants.SaveReferralTypeLimitConfiguration, parameters);
                    return (int)parameters[4].Value;
                }
                catch (Exception)
                {
                    return -1;
                }
            }
        }

        public async Task<int> UpdateClaimsBenefitAmounts(ClaimsBenefitsAmount claimsBenefitsAmounts)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddBenefit);

            if (claimsBenefitsAmounts == null)
                throw new BusinessException("ClaimFacade::UpdateClaimsBenefitAmounts - received null claimsBenefitsAmounts object");

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var claimsBenefitsAmountsEntity = await _benefitsAmountRepository.Where(x => x.ClaimBenefitAmountId == claimsBenefitsAmounts.ClaimBenefitAmountId).FirstOrDefaultAsync();


                claimsBenefitsAmountsEntity.Formula = claimsBenefitsAmounts.Formula;
                claimsBenefitsAmountsEntity.MaximumCompensationAmount = claimsBenefitsAmounts.MaximumCompensationAmount;
                claimsBenefitsAmountsEntity.MinimumCompensationAmount = claimsBenefitsAmounts.MinimumCompensationAmount;
                claimsBenefitsAmountsEntity.ModifiedBy = claimsBenefitsAmounts.ModifiedBy;
                claimsBenefitsAmountsEntity.ModifiedDate = claimsBenefitsAmounts.ModifiedDate;

                _benefitsAmountRepository.Update(claimsBenefitsAmountsEntity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
                return claimsBenefitsAmounts.ClaimBenefitAmountId;
            }
        }

        public async Task<bool> UpdatePersonEventQuestionnaire(PersonEventQuestionnaire personEventQuestionnaire)
        {
            Contract.Requires(personEventQuestionnaire != null);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var personEventQuestionnaireEntity = Mapper.Map<claim_PersonEventQuestionnaire>(personEventQuestionnaire);

                _claimPersonEventQuestionnaireRepository.Update(personEventQuestionnaireEntity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return true;
            }
        }

        public async Task<List<ClaimReferralQueryType>> GetClaimsReferralQueryType()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var referalType = await _claimReferralQueryTypeRepository.ToListAsync();
                return Mapper.Map<List<ClaimReferralQueryType>>(referalType);
            }
        }

        public async Task<int> AddClaimReferralDetail(ClaimReferralDetail claimReferralDetail)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var entity = new claim_ReferralDetail();
                entity.ClaimId = claimReferralDetail.ClaimId;
                entity.OwnerId = claimReferralDetail.OwnerId;
                entity.ReferralQueryTypeId = claimReferralDetail.ReferralQueryTypeId;
                entity.ReferralQuery = claimReferralDetail.ReferralQuery;
                entity.ReceivedDate = claimReferralDetail.ReceivedDate;
                entity.ReferrerUser = claimReferralDetail.ReferrerUser;
                entity.ReferralStatusId = claimReferralDetail.ReferralStatusId;
                entity.ContextualData = claimReferralDetail.ContextualData;
                entity.ReferredToUserName = claimReferralDetail.ReferredToUserName;

                _claimReferralDetailRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.ClaimId;

            }
        }

        public async Task<List<ClaimReferralDetail>> GetClaimReferralDetail(int claimId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var referralDetails = await _claimReferralDetailRepository.Where(x => x.ClaimId == claimId).ToListAsync();
                return Mapper.Map<List<ClaimReferralDetail>>(referralDetails);
            }
        }

        public async Task<ClaimReferralQueryType> GetClaimReferralQueryType(int referralQueryTypeId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var referalType = await _claimReferralQueryTypeRepository.Where(x => x.ReferralQueryTypeId == referralQueryTypeId).FirstOrDefaultAsync();
                return Mapper.Map<ClaimReferralQueryType>(referalType);
            }
        }

        public async Task<User> RoundRobinByUserPermission(List<string> permissions)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var user = new User();
                var users = await _userService.SearchUsersByPermissions(permissions);
                if (users != null)
                {
                    int min = users.Min(x => x.Id);
                    int max = users.Max(x => x.Id);
                    var rand = new Random();
                    int userId = rand.Next(min, max);
                    while (!users.Any(x => x.Id == userId))
                    {
                        userId = rand.Next(min, max);
                    }
                    user = users.Find(x => x.Id == userId);
                }
                return user;
            }
        }

        public async Task<int> RejectClaimInvoicePayment(Note claimNote)
        {
            int result = await _noteService.AddNote(claimNote);
            return result;
        }

        public async Task<bool> GetDocumentReceived(string keyName, string keyValue, DocumentTypeEnum documentTypeId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _documentIndexService.GetDocumentBinaryByKeyValueDocTypeId(keyName, keyValue, documentTypeId);
                if (result != null && result.Id > 0)
                {
                    return true;
                }
            }
            return false;
        }

        public async Task<bool> UpdateClaimRequiredDocument(int personEventId, DocumentTypeEnum documentTypeId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var claimRequirementCategory = await _claimRequirementService.GetClaimRequirementCategoryById(documentTypeId);
                if (claimRequirementCategory != null)
                {
                    var requirement = new PersonEventClaimRequirement
                    {
                        PersonEventId = personEventId,
                        ClaimRequirementCategoryId = claimRequirementCategory.ClaimRequirementCategoryId,
                        Instruction = claimRequirementCategory.Name,
                    };
                    await _claimRequirementService.AddClaimRequirement(requirement);
                }
            }
            return true;
        }

        public async Task<Contracts.Entities.Claim> GetClaimByPersonEvent(int personEventId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claim = await _claimRepository
                    .Where(s => s.PersonEventId == personEventId).FirstOrDefaultAsync();
                return Mapper.Map<Contracts.Entities.Claim>(claim);
            }
        }

        public async Task ProcessPaymentRejection(int claimId, int claimInvoiceId, string reason, ClaimTypeEnum? claimTypeEnum)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ProcessBankingDetail);

            var claimDetails = await GetClaim(claimId);

            if (claimDetails.ClaimStatus != ClaimStatusEnum.Tracing && claimDetails.ClaimStatus != ClaimStatusEnum.Unclaimed)
            {
                //Add reason to note
                await AddClaimNote(new ClaimNote
                {
                    ClaimId = claimId,
                    Text = reason,
                });
                //Update Claim Status
                if (claimTypeEnum == ClaimTypeEnum.Funeral)
                {
                    await UpdateStatus(new Action
                    {
                        ItemId = claimId,
                        Status = ClaimStatusEnum.Unpaid
                    });
                }

                if (claimInvoiceId > 0)
                    await _claimInvoiceService.UpdateClaimInvoiceStatus(claimInvoiceId, ClaimInvoiceStatus.PaymentRejected);
            }
        }

        private async Task<bool> IsConsolidatedFuneral(int policyId)
        {
            var lifeExtension = await _policyService.GetPolicyLifeExtension(policyId);
            if (lifeExtension != null)
                return await Task.FromResult(true);
            return await Task.FromResult(false);
        }

        public async Task<ValidationResult> CheckBankingDetailsInvoicePayment(ClaimInvoice claimInvoice)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                Contract.Requires(claimInvoice != null);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var claim = await _claimRepository.FindByIdAsync(claimInvoice.ClaimId);
                var personEvent = await _personEventRepository.FindByIdAsync(claim.PersonEventId);

                RolePlayer payee = new RolePlayer();
                switch (claimInvoice.ClaimInvoiceType)
                {
                    case ClaimInvoiceTypeEnum.WLSAward:
                        var widowLumpsumInvoice = await _claimInvoiceService.GetWidowLumpSumInvoice(claimInvoice.ClaimInvoiceId);
                        payee = await _rolePlayerService.GetRolePlayer(widowLumpsumInvoice.PayeeRolePlayerId.Value);
                        break;
                    case ClaimInvoiceTypeEnum.DaysOffInvoice:
                        var ttdInvoice = await _claimInvoiceService.GetDaysOffInvoiceInvoice(claimInvoice.ClaimInvoiceId);
                        payee = await _rolePlayerService.GetRolePlayer(ttdInvoice.PayeeRolePlayerId.Value);
                        break;
                    case ClaimInvoiceTypeEnum.SundryInvoice:
                        var sundryInvoice = await _claimInvoiceService.GetSundryInvoice(claimInvoice.ClaimInvoiceId);
                        payee = await _rolePlayerService.GetRolePlayer(sundryInvoice.PayeeRolePlayerId.Value);
                        break;
                    case ClaimInvoiceTypeEnum.FuneralExpenses:
                        var funeralExpenses = await _claimInvoiceService.GetFuneralExpenseInvoice(claimInvoice.ClaimInvoiceId);
                        payee = await _rolePlayerService.GetRolePlayer(funeralExpenses.PayeeRolePlayerId.Value);
                        break;
                }

                if (payee.RolePlayerBankingDetails == null)
                {
                    return new ValidationResult()
                    {
                        EmitDate = System.DateTime.Now,
                        Result = false,
                        Message = new List<string>() { "Banking details does not exist" }
                    };
                }

                if (payee.RolePlayerBankingDetails != null && payee.RolePlayerBankingDetails.Count < 1)
                {
                    return new ValidationResult()
                    {
                        EmitDate = System.DateTime.Now,
                        Result = false,
                        Message = new List<string>() { "Banking details does not exist" }
                    };
                }
            }

            return new ValidationResult()
            {
                EmitDate = System.DateTime.Now,
                Result = true,
                Message = new List<string>() { "Success" }
            };
        }

        public async Task<PagedRequestResult<Contracts.Entities.Claim>> GetPersonClaimsByIdNumber(PagedRequest request)
        {
            Contract.Requires(request != null);

            if (int.TryParse(request.SearchCriteria, out int claimantId))
            {
                var personEventsIds = new List<int>();
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var personEvents = await _personEventRepository.Where(p => p.ClaimantId == claimantId).ToListAsync();
                    foreach (var personEvent in personEvents)
                    {
                        personEventsIds.Add(personEvent.PersonEventId);
                    }
                    var claims = await _claimRepository
                        .Where(claim => claim.PolicyId.HasValue && personEventsIds.Contains((int)claim.PersonEventId))
                        .ToPagedResult<claim_Claim, Contracts.Entities.Claim>(request);

                    return new PagedRequestResult<Contracts.Entities.Claim>()
                    {
                        Page = request.Page,
                        PageCount = request.PageSize,
                        RowCount = claims.RowCount,
                        PageSize = request.PageSize,
                        Data = claims.Data
                    };
                }
            }
            else
            {
                throw new Exception($"Invalid claimant id passed in request");
            }


        }

        public async Task<PagedRequestResult<Contracts.Entities.Claim>> GetClaimantAcknowledgedAndLiabilityAcceptedClaims(PagedRequest request)
        {
            Contract.Requires(request != null);

            if (int.TryParse(request.SearchCriteria, out int claimantId))
            {
                var personEventsIds = new List<int>();
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var personEvents = await _personEventRepository.Where(p => p.ClaimantId == claimantId).ToListAsync();
                    foreach (var personEvent in personEvents)
                    {
                        personEventsIds.Add(personEvent.PersonEventId);
                    }
                    var claims = await _claimRepository
                        .Where(claim => claim.PolicyId.HasValue && personEventsIds.Contains((int)claim.PersonEventId)
                         && (claim.ClaimStatus == ClaimStatusEnum.ManuallyAcknowledged || claim.ClaimStatus == ClaimStatusEnum.AutoAcknowledged) && claim.ClaimLiabilityStatus == ClaimLiabilityStatusEnum.FullLiabilityAccepted)
                        .ToPagedResult<claim_Claim, Contracts.Entities.Claim>(request);

                    return new PagedRequestResult<Contracts.Entities.Claim>()
                    {
                        Page = request.Page,
                        PageCount = request.PageSize,
                        RowCount = claims.RowCount,
                        PageSize = request.PageSize,
                        Data = claims.Data
                    };
                }
            }
            else
            {
                throw new Exception($"Invalid claimant id passed in request");
            }
        }

        public async Task NotifyPersonEventOwnerOrDefaultRole(int personEventId, string message, string defaultRoleName)
        {
            var personEvent = await _eventService.GetPersonEvent(personEventId);
            if (personEvent != null)
            {
                var recipients = new List<int>();

                var poolWorkFlowRequest = new PoolWorkFlowRequest
                {
                    ItemId = personEventId,
                    ItemType = PoolWorkFlowItemTypeEnum.PersonEvent
                };

                var poolWorkFlow = await _poolWorkFlowService.GetPoolWorkFlowByTypeAndId(poolWorkFlowRequest);
                if (poolWorkFlow?.AssignedToUserId != null && poolWorkFlow?.AssignedToUserId > 0)
                {
                    recipients.Add(Convert.ToInt32(poolWorkFlow.AssignedToUserId));
                }
                else
                {
                    var users = await _userService.GetUsersByRoleName(defaultRoleName);
                    if (users?.Count > 0)
                    {
                        foreach (var user in users)
                        {
                            recipients.Add(user.Id);
                        }
                    }
                }

                if (recipients?.Count > 0)
                {
                    var userReminders = new List<UserReminder>();

                    foreach (var recipient in recipients)
                    {
                        var userReminder = new UserReminder
                        {
                            AlertDateTime = DateTimeHelper.SaNow,
                            AssignedToUserId = recipient,
                            AssignedByUserId = RmaIdentity.UserId,
                            UserReminderType = UserReminderTypeEnum.Message,
                            UserReminderItemType = UserReminderItemTypeEnum.Claim,
                            Text = $"{message}: {personEvent.RolePlayer.DisplayName} PEV Ref: {personEvent.PersonEventReferenceNumber}",
                            LinkUrl = "/claimcare/claim-manager/holistic-claim-view/" + personEvent.EventId + "/" + personEvent.PersonEventId
                        };

                        userReminders.Add(userReminder);
                    }

                    await _userReminderService.CreateUserReminders(userReminders);
                }
            }
        }

        public async Task SendMMIHcpReminder()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var fromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender);

                var results = await GetPersonEventsNearingMmiExpiry();
                if (results.Count > 0)
                {
                    foreach (var item in results)
                    {
                        if (!string.IsNullOrEmpty(item.EmailAddress))
                        {
                            await _claimCommunicationService.SendMMIExpiryEmail(item.EmailAddress, fromAddress, item.PersonEventId, item.EmployeeName
                                , item.HcpName, item.DateOfIncident, item.ReportDate, item.CompanyNumber, item.ClaimNumber);
                        }
                    }

                    int personEventIdBeingProcessed = 0;
                    try
                    {
                        foreach (var mmiExpiry in results.Select(p => new { p.PersonEventId, p.LagReceivedToExpiry }).Distinct())
                        {
                            personEventIdBeingProcessed = mmiExpiry.PersonEventId;
                            var personEvent = await _eventService.GetPersonEvent(mmiExpiry.PersonEventId);

                            await CreateMmiExpiryExtensionWizard(personEvent, mmiExpiry.LagReceivedToExpiry);
                        }
                    }
                    catch (Exception ex)
                    {
                        ex.LogException($"Error when Creating ReviewInjuryIcd10CodeWizard for PersonEventId {personEventIdBeingProcessed.ToString()} message : {ex.Message}");
                    }
                }
            }
        }

        private async Task CreateReviewInjuryIcd10CodeWizard(PersonEvent personEvent)
        {
            var startWizardRequest = new StartWizardRequest
            {
                LinkedItemId = personEvent.PersonEventId,
                Type = "review-injury-icd10-codes",
                Data = _serializer.Serialize(personEvent)
            };
            await _wizardService.StartWizard(startWizardRequest);
        }

        private async Task CreateMmiExpiryExtensionWizard(PersonEvent personEvent, int LagReceivedToExpiry)
        {
            var slaStartDateAndTime = DateTime.Now.AddDays(LagReceivedToExpiry);

            var startWizardRequest = new StartWizardRequest
            {
                LinkedItemId = personEvent.PersonEventId,
                Type = "mmi-expiry-extension",
                Data = _serializer.Serialize(personEvent),
                OverrideStartDateAndTime = slaStartDateAndTime
            };
            await _wizardService.StartWizard(startWizardRequest);
        }

        public async Task<PagedRequestResult<Contracts.Entities.ClaimSearchResult>> GetPagedClaims(PagedRequest request)
        {
            if (request == null) throw new ArgumentNullException(nameof(request));

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                        new SqlParameter("SearchCriteria", request.SearchCriteria == null? string.Empty : request.SearchCriteria),
                        new SqlParameter("Page", request.Page),
                        new SqlParameter("PageSize", request.PageSize),
                        new SqlParameter("SortingColumn", request.OrderBy),
                        new SqlParameter("Ordering", request.IsAscending ? "ASC" : "DESC"),
                        new SqlParameter("RowCount", SqlDbType.Int),
                    };
                parameters[5].Direction = ParameterDirection.Output;
                var searchResult = await _claimRepository.SqlQueryAsync<ClaimSearchResult>("[claim].[SearchPagedClaimsV2] @SearchCriteria, @Page, @PageSize, @SortingColumn, @Ordering, @RowCount Out", parameters);
                var recordCount = (int)parameters[5].Value;

                return new PagedRequestResult<ClaimSearchResult>()
                {
                    Page = request.Page,
                    PageCount = searchResult.Count,
                    RowCount = recordCount,
                    PageSize = request.PageSize,
                    Data = searchResult
                };
            }
        }

        public async Task<List<PersonEventMMIExpiry>> GetPersonEventsNearingMmiExpiry()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var fromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender);

                var results = new List<PersonEventMMIExpiry>();

                results = await _personEventRepository.SqlQueryAsync<PersonEventMMIExpiry>(
                DatabaseConstants.GetHcpsWithMMINearingExpiry);
                return results;
            }
        }

        private async Task UpdatePersonInsuredLife(PersonEvent personEvent)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditInsuredLife);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var polices = await _policyService.GetPoliciesByRolePlayer(personEvent.InsuredLifeId);

                foreach (var policy in polices)
                {
                    var policyInsuredLifeEntity = await _rolePlayerPolicyService.RemoveInsuredLife(personEvent.InsuredLifeId, policy.PolicyId, personEvent.PersonEventDeathDetail.DeathDate);

                    if (policyInsuredLifeEntity != null)
                    {
                        await _rolePlayerPolicyService.UpdateMemberPremiumContribution(policy.PolicyId, policy.PolicyNumber, personEvent.InsuredLifeId, personEvent.PersonEventDeathDetail.DeathDate);
                    }
                }
                var deceased = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);

                if (deceased != null)
                {
                    deceased.Person.DeathCertificateNumber = personEvent.PersonEventDeathDetail.DeathCertificateNo;
                    deceased.Person.DateOfDeath = personEvent.PersonEventDeathDetail.DeathDate;
                    deceased.Person.IsAlive = false;
                    await _rolePlayerService.EditRolePlayer(deceased);
                }
            }
        }

        public async Task ReconcilePolicyAndClaimBenefit(int claimId)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var claim = await GetClaim(claimId);
                if (claim != null)
                {
                    var personEvent = await _personEventRepository.FirstOrDefaultAsync(p => p.PersonEventId == claim.PersonEventId);
                    var insuredLifes = await _policyInsuredlifeService.GetPolicyInsuredLives(claim.PolicyId.Value);
                    var insuredLife = insuredLifes.Where(x => x.RolePlayerId == personEvent.InsuredLifeId).FirstOrDefault();

                    var claimBenefit = await _claimBenefitRepository.Where(cb => cb.ClaimId == claim.ClaimId).FirstOrDefaultAsync();
                    var benefitRate = await _productOptionService.GetBenefitRate(insuredLife.StatedBenefitId);

                    if (insuredLife.CoverAmount.HasValue && insuredLife.CoverAmount.Value > 0.00M)
                    {
                        benefitRate.BenefitAmount = insuredLife.CoverAmount.Value;
                    }

                    if (insuredLife?.StatedBenefitId != claimBenefit?.BenefitId)
                    {
                        claimBenefit.BenefitId = insuredLife.StatedBenefitId;
                        claimBenefit.EstimatedValue = benefitRate.BenefitAmount;
                        _claimBenefitRepository.Update(claimBenefit);
                    }

                    var calculatedAmounts = await GetCalculatedAmounts(claimId);
                    if (calculatedAmounts != null)
                    {
                        if (calculatedAmounts.CoverAmount != benefitRate.BenefitAmount)
                        {
                            calculatedAmounts.CoverAmount = benefitRate.BenefitAmount;
                            calculatedAmounts.TotalAmount = benefitRate.BenefitAmount;
                            var entity = Mapper.Map<claim_ClaimsCalculatedAmount>(calculatedAmounts);
                            _claimsCalculatedRepository.Update(entity);
                        }
                    }
                    else
                    {
                        calculatedAmounts = await _costService.CalculateBeneficiaryPayment(claimId, insuredLife.RolePlayerId);
                        calculatedAmounts.ClaimId = claimId;
                        calculatedAmounts.AllocationPercentange = 100M;
                        var mappedCalculatedAmount = Mapper.Map<claim_ClaimsCalculatedAmount>(calculatedAmounts);
                        _claimsCalculatedRepository.Create(mappedCalculatedAmount);
                    }

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        public async Task<PersonEvent> AcknowledgeVapsForNonStatutoryClaims(int personEventId, List<int> claimIds)
        {
            Contract.Requires(personEventId > 0);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var personEvent = await _eventService.GetPersonEvent(personEventId);

                if (personEvent == null)
                {
                    return null;
                }

                #region retrieve actual accident earnings
                var personEventEarnings = await _claimEarningService.GetEarningsByPersonEventId(personEventId);
                var accidentEarnings = personEventEarnings?.LastOrDefault(x => x.EarningsType == EarningsTypeEnum.Accident);
                #endregion

                if (accidentEarnings != null)
                {
                    var policies = await _policyService.GetPoliciesWithProductOptionByRolePlayer((int)personEvent.CompanyRolePlayerId);
                    policies.RemoveAll(p => p.ProductCategoryType != ProductCategoryTypeEnum.VapsAssistance);

                    if (policies != null && policies.Count > 0)
                    {
                        var _event = await _eventService.GetEvent(personEvent.EventId);
                        var addVapsClaim = false;

                        foreach (var policy in policies)
                        {
                            policy.ProductOption.Benefits = await _policyService.GetBenefitsForProductOptionAtEffectiveDate(policy.ProductOptionId, _event.EventDate);
                            if (policy.ProductOption?.Benefits?.Count > 0)
                            {
                                var filteredBenefitCompensations = policy.ProductOption?.Benefits?.Where(benefit => benefit.BenefitType == BenefitTypeEnum.Basic
                                            && (benefit.EstimateTypeId == (int)EstimateTypeEnum.PDLumpSum || benefit.EstimateTypeId == (int)EstimateTypeEnum.TTD))
                                            .SelectMany(benefit => benefit.BenefitCompensationAmounts ?? Enumerable.Empty<BenefitCompensationAmount>())
                                            .Where(c => accidentEarnings.Total > c.MaxCompensationAmount)
                                            .ToList();

                                addVapsClaim = filteredBenefitCompensations?.Any() == true;
                            }
                        }

                        if (addVapsClaim)
                        {
                            #region create claim estimates
                            var topRnkedEstimateAmount = await CreateClaimEstimatesAugNonStatutory(policies, personEventId, personEvent, _event, claimIds);
                            #endregion
                        }
                    }
                }

                return personEvent;
            }
        }

        private async Task<TopRankedEstimateAmount> CreateClaimEstimatesAugNonStatutory(List<Policy> policies, int personEventId, PersonEvent personEvent, Contracts.Entities.Event _event, List<int> claimIds)
        {
            var topRankedEstimateAmount = (bool)personEvent.IsFatal
                                ? await _claimInvoiceService.GetTopRankedEstimatesFromPhysicalInjury(personEvent)
                                : await _claimInvoiceService.GetTopRankedEstimatesFromMedicalReport(personEvent);

            #region create claim estimates of benefits
            foreach (var policy in policies)
            {
                policy.ProductOption.Benefits = await _policyService.GetBenefitsForProductOptionAtEffectiveDate(policy.ProductOptionId, _event.EventDate);

                if (policy.ProductOption?.Benefits?.Count > 0)
                {
                    var productOptionBenefits = policy.ProductOption?.Benefits;
                    var benefits = new List<Benefit>();

                    foreach (var benefit in productOptionBenefits)
                    {
                        if (benefit.BenefitType == BenefitTypeEnum.Basic)
                        {
                            if ((topRankedEstimateAmount.PDExtentEstimate > 30 || (bool)personEvent.IsFatal)
                                    && benefit.EstimateTypeId == (int)EstimateTypeEnum.PDPension)
                            {
                                benefits.Add(benefit);
                            }
                            else if (topRankedEstimateAmount.PDExtentEstimate <= 30
                                    && benefit.EstimateTypeId == (int)EstimateTypeEnum.PDLumpSum)
                            {
                                benefits.Add(benefit);
                            }
                            else if (benefit.EstimateTypeId != (int)EstimateTypeEnum.PDPension
                                    && benefit.EstimateTypeId != (int)EstimateTypeEnum.PDLumpSum)
                            {
                                benefits.Add(benefit);
                            }
                        }

                        if ((bool)personEvent.IsFatal && benefit.BenefitType == BenefitTypeEnum.Fatal)
                        {
                            benefits.Add(benefit);
                        }
                    }

                    if (benefits?.Count > 0)
                    {
                        await _claimInvoiceService.AddNonStatutaryAugKickInClaimEstimates(benefits, personEventId, claimIds);
                    }
                }
            }
            #endregion

            return topRankedEstimateAmount;
        }
    }
}