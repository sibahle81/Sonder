using AutoMapper;

using Newtonsoft.Json;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceBus.Producers;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Policy.Integrations.Request;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

using BeneficiaryBankAccount = RMA.Service.ClientCare.Contracts.Entities.Policy.BeneficiaryBankAccount;
using DatabaseConstants = RMA.Service.ClientCare.Database.Constants.DatabaseConstants;
using Documents = RMA.Service.ScanCare.Contracts.Entities;
using PolicyResponse = RMA.Service.ClientCare.Contracts.Entities.Policy.PolicyResponse;
using Wizard = RMA.Service.Admin.BusinessProcessManager.Contracts.Entities.Wizard;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Common.Entities;
using RMA.Service.ClientCare.Contracts.Enums;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class PolicyIntegrationFacade : RemotingStatelessService, IPolicyIntegrationService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IConfigurationService _configurationService;
        private readonly ICountryService _countryService;
        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IRepository<policy_Insurer> _insurerRepository;
        private readonly IRepository<policy_PolicyBroker> _policyBrokerRepository;
        private readonly IRepository<policy_PolicyInsuredLife> _insuredLifeRepository;
        private readonly IRepository<client_RolePlayer> _rolePlayerRepository;
        private readonly IRepository<client_RolePlayerAddress> _addressRepository;
        private readonly IRepository<client_RolePlayerRelation> _relationRepository;
        private readonly IRepository<client_Person> _personRepository;
        private readonly IRepository<product_Benefit> _benefitRepository;
        private readonly IRepository<policy_InsurerGroupSchemeAccess> _insurerGroupSchemeAccessesRepository;
        private readonly IRepository<Load_StagePolicyIntegrationRequest> _stagePolicyIntegrationRequestRepository;
        private readonly IRepository<Load_CdaPolicyScheduleEmailQueue> _loadCdaPolicyScheduleEmailQueueRepository;
        private readonly IRepository<client_UserVopdResponse> _userVopdRepository;
        private readonly IRepository<policy_PolicyStatusChangeAudit> _policyStatusChangeAuditRepository;
        private readonly IRepository<policy_PolicyDocumentCommunicationMatrix> _policyDocumentCommunicationMatrixRepository;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IGeneratePolicyDocumentService _generatePolicyDocumentService;
        private readonly IProductOptionService _productOptionService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IBrokerageService _brokerageService;
        private readonly IPremiumListingService _premiumListingService;
        private readonly ITransactionService _transactionService;
        private readonly IEventService _eventService;
        private readonly IClaimService _claimService;
        private readonly IPolicyService _policyService;
        private readonly IStateProvinceService _stateProvinceService;
        private readonly IWizardService _wizardService;
        private readonly ISerializerService _serializer;
        private readonly IHealthCareProviderService _healthCareProviderService;
        private readonly IRepository<policy_PolicyInsuredLife> _policyInsuredLifeRepository;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IEuropAssistPremiumMatrixService _europAssistPremiumMatrixService;
        private readonly IRepository<policy_GroupSchemePremiumRoundingExclusion> _policyGroupSchemePremiumRoundingExclusionRepository;
        private readonly IHttpClientService _httpClientService;
        private readonly IPolicyNoteService _policyNoteService;
        private readonly IPolicyCommunicationService _communicationService;

        private const int BeneficiaryMemberType = 5;
        private const int DefaultPreferredCommunicationType = 4;
        private const string PolicyNotFoundMessage = "Policy not found.";
        private const string NotFoundMessage = "Not Found.";
        private const string FoundMessage = "Policy found.";

        public PolicyIntegrationFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IConfigurationService configurationService,
            ICountryService countryService,
            IRepository<policy_Policy> policyRepository,
            IRepository<policy_Insurer> insurerRepository,
            IRepository<policy_PolicyBroker> policyBrokerRepository,
            IRepository<policy_PolicyInsuredLife> insuredLifeRepository,
            IRepository<client_RolePlayer> rolePlayerRepository,
            IRepository<client_RolePlayerAddress> addressRepository,
            IRepository<client_RolePlayerRelation> relationRepository,
            IRepository<client_Person> personRepository,
            IRepository<product_Benefit> benefitRepository,
            IRepository<policy_InsurerGroupSchemeAccess> insurerGroupSchemeAccessesRepository,
            IRepository<client_UserVopdResponse> userVopdRepository,
            IRepository<Load_StagePolicyIntegrationRequest> stagePolicyIntegrationRequestRepository,
            IRepository<Load_CdaPolicyScheduleEmailQueue> loadCdaPolicyScheduleEmailQueueRepository,
            IRepository<policy_PolicyStatusChangeAudit> policyStatusChangeAuditRepository,
            IRepository<policy_PolicyDocumentCommunicationMatrix> policyDocumentCommunicationMatrixRepository,
        IDocumentGeneratorService documentGeneratorService,
            IGeneratePolicyDocumentService generatePolicyDocumentService,
            IProductOptionService productOptionService,
            IRolePlayerService rolePlayerService,
            IBrokerageService brokerageService,
            IPremiumListingService premiumListingService,
            ITransactionService transactionService,
            IClaimService claimService,
            IEventService eventService,
            IStateProvinceService stateProvinceService,
            IPolicyService policyService,
            ISerializerService serializer,
            IWizardService wizardService,
            IHealthCareProviderService healthCareProviderService,
            IRepository<policy_PolicyInsuredLife> policyInsuredLifeRepository,
            IDocumentIndexService documentIndexService,
            IRolePlayerPolicyService rolePlayerPolicyService,
            IEuropAssistPremiumMatrixService europAssistPremiumMatrixService,
            IRepository<policy_GroupSchemePremiumRoundingExclusion> policyGroupSchemePremiumRoundingExclusionRepository,
            IHttpClientService httpClientService,
            IPolicyNoteService policyNoteService,
            IPolicyCommunicationService communicationService

        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _configurationService = configurationService;
            _countryService = countryService;
            _policyRepository = policyRepository;
            _insurerRepository = insurerRepository;
            _policyBrokerRepository = policyBrokerRepository;
            _insuredLifeRepository = insuredLifeRepository;
            _rolePlayerRepository = rolePlayerRepository;
            _addressRepository = addressRepository;
            _relationRepository = relationRepository;
            _personRepository = personRepository;
            _benefitRepository = benefitRepository;
            _documentGeneratorService = documentGeneratorService;
            _generatePolicyDocumentService = generatePolicyDocumentService;
            _productOptionService = productOptionService;
            _insurerGroupSchemeAccessesRepository = insurerGroupSchemeAccessesRepository;
            _userVopdRepository = userVopdRepository;
            _rolePlayerService = rolePlayerService;
            _brokerageService = brokerageService;
            _stagePolicyIntegrationRequestRepository = stagePolicyIntegrationRequestRepository;
            _loadCdaPolicyScheduleEmailQueueRepository = loadCdaPolicyScheduleEmailQueueRepository;
            _premiumListingService = premiumListingService;
            _transactionService = transactionService;
            _policyStatusChangeAuditRepository = policyStatusChangeAuditRepository;
            _policyDocumentCommunicationMatrixRepository = policyDocumentCommunicationMatrixRepository;
            _claimService = claimService;
            _eventService = eventService;
            _policyService = policyService;
            _stateProvinceService = stateProvinceService;
            _serializer = serializer;
            _wizardService = wizardService;
            _healthCareProviderService = healthCareProviderService;
            _policyInsuredLifeRepository = policyInsuredLifeRepository;
            _documentIndexService = documentIndexService;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _europAssistPremiumMatrixService = europAssistPremiumMatrixService;
            _policyGroupSchemePremiumRoundingExclusionRepository = policyGroupSchemePremiumRoundingExclusionRepository;
            _httpClientService = httpClientService;
            _policyNoteService = policyNoteService;
            _communicationService = communicationService;
        }

        private async System.Threading.Tasks.Task CheckIfClientApplicationHasAcesstoPolicy(string policyNumber, string clientAppicationId)
        {
            Contract.Requires(!string.IsNullOrWhiteSpace(policyNumber));
            var schemeParentPolicies = await GetInsurerGroupSchemeParentPolicyNumbers(clientAppicationId);
            if (!schemeParentPolicies.Contains(policyNumber))
            {
                var schemeChildParentPolicies = await GetInsurerGroupSchemeChildPolicyNumbers(clientAppicationId);
                if (!schemeChildParentPolicies.Contains(policyNumber))
                {
                    throw new Exception(NotFoundMessage);
                }
            }
        }

        public async Task<PolicyResponse> GetPolicyInfo(string policyNumber)
        {
            Contract.Requires(!string.IsNullOrWhiteSpace(policyNumber));
            var clientAppicationId = RmaIdentity.ClientId;
            await CheckIfClientApplicationHasAcesstoPolicy(policyNumber, clientAppicationId);

            var policyResponse = new PolicyResponse()
            { PolicyNumber = policyNumber, IsOperationSuccessFull = false, ResponseMessage = FoundMessage };

            try
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var policy = await _policyRepository
                   .FirstOrDefaultAsync(p => string.Equals(p.PolicyNumber, policyNumber) ||
                        string.Equals(p.ClientReference, policyNumber));

                    if (policy != null)
                    {
                        policyResponse.PolicyStatus = policy.PolicyStatus.DisplayAttributeValue();
                        policyResponse.IsOperationSuccessFull = true;
                        policyResponse.ClientReference = policy.ClientReference;
                        policyResponse.PolicyNumber = policy.PolicyNumber;
                    }
                    else
                    {
                        policyResponse.ResponseMessage = NotFoundMessage;
                    }
                }
            }
            catch (Exception ex)
            {
                policyResponse.IsOperationSuccessFull = false;
                policyResponse.ResponseMessage = ex.Message;
                ex.LogException("", policyNumber);
            }
            return policyResponse;
        }

        public async Task<PolicyOperationResult> GetParentPolicy(string parentPolicyNumber)
        {
            Contract.Requires(!string.IsNullOrWhiteSpace(parentPolicyNumber));
            var clientAppicationId = RmaIdentity.ClientId;
            await CheckIfClientApplicationHasAcesstoPolicy(parentPolicyNumber, clientAppicationId);
            var parentPolicyData = await GetPolicyByPolicyNumber(parentPolicyNumber);

            return await Task.FromResult(new PolicyOperationResult
            {
                IsOperationSuccessful = parentPolicyData != null,
                Policy = parentPolicyData,
                ErrorMessage = parentPolicyData == null ? PolicyNotFoundMessage : FoundMessage,
                PolicyResponse = new PolicyResponse
                {
                    IsOperationSuccessFull = parentPolicyData == null,
                    PolicyNumber = parentPolicyNumber,
                    ResponseMessage = parentPolicyData == null ? PolicyNotFoundMessage : FoundMessage
                }
            });
        }

        private async Task<Contracts.Entities.Policy.Policy> GetPolicyByPolicyNumber(string policyNumber)
        {
            Contract.Requires(!string.IsNullOrWhiteSpace(policyNumber));

            using (_dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                var policy = await _policyRepository.FirstOrDefaultAsync(p => p.PolicyNumber == policyNumber.Trim());
                if (policy == null)
                {
                    throw new Exception(PolicyNotFoundMessage);
                }

                await _policyRepository.LoadAsync(policy, po => po.ProductOption);
                await _policyRepository.LoadAsync(policy, po => po.Brokerage);
                await _policyRepository.LoadAsync(policy, po => po.PolicyOwner);
                await _policyRepository.LoadAsync(policy, po => po.PolicyInsuredLives);
                await _policyRepository.LoadAsync(policy, po => po.PolicyPayee);
                await _policyRepository.LoadAsync(policy, po => po.RolePlayerRelations);

                var policyReturnData = Mapper.Map<Contracts.Entities.Policy.Policy>(policy);

                return policyReturnData;
            }
        }

        private async Task<bool> UpdateParentPolicyInstallmentPremium(int parentPolicyId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var activePolicyStatuses = new List<PolicyStatusEnum> { PolicyStatusEnum.PendingFirstPremium, PolicyStatusEnum.Active, PolicyStatusEnum.Continued,
                    PolicyStatusEnum.Reinstated, PolicyStatusEnum.FreeCover, PolicyStatusEnum.New };
                var totalChildPoliciesInstallmentPremium = await _policyRepository.Where(x => x.ParentPolicyId == parentPolicyId && activePolicyStatuses.Contains(x.PolicyStatus)).SumAsync(y => y.InstallmentPremium);
                var parentPolicy = await _policyRepository.FirstOrDefaultAsync(x => x.PolicyId == parentPolicyId);
                parentPolicy.InstallmentPremium = totalChildPoliciesInstallmentPremium;
                parentPolicy.AnnualPremium = totalChildPoliciesInstallmentPremium * 12.0M;

                _policyRepository.Update(parentPolicy);

                return await scope.SaveChangesAsync().ConfigureAwait(false) > 0;
            }
        }

        private async Task<bool> UpdatePolicyInstallmentPremium(int policyId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var policy = await _policyRepository.FirstOrDefaultAsync(x => x.PolicyId == policyId);

                if (policy != null)
                {
                    var insuredMembersPremium = await _insuredLifeRepository.Where(x => x.PolicyId == policyId &&
                                          x.InsuredLifeStatus != InsuredLifeStatusEnum.Cancelled).SumAsync(y => y.Premium);

                    policy.InstallmentPremium = insuredMembersPremium.HasValue ? insuredMembersPremium.Value : policy.InstallmentPremium;
                    policy.AnnualPremium = insuredMembersPremium.HasValue ? insuredMembersPremium.Value * 12.0M : policy.InstallmentPremium;

                    _policyRepository.Update(policy);
                }

                return await scope.SaveChangesAsync().ConfigureAwait(false) > 0;
            }
        }

        private async Task CheckDuplicateClientReference(string clientReference, DatabaseActionEnum policyAction)
        {
            if (policyAction == DatabaseActionEnum.Update)
            {
                return;
            }

            if (string.IsNullOrEmpty(clientReference))
            {
                throw new Exception($"Client Reference cannot be blank or empty.");
            }

            using (var scope = _dbContextScopeFactory.Create())
            {
                if (!string.IsNullOrWhiteSpace(clientReference))
                {
                    var duplicateClientReferenceExist = await _policyRepository.AnyAsync(x => x.ClientReference.Trim().ToLower() == clientReference.ToLower().Trim());

                    if (duplicateClientReferenceExist)
                    {
                        throw new Exception($"Policy with the same Client Reference {clientReference} already exist.");
                    }
                }
            }
        }

        private async Task ProcessPolicyDataValidation(PolicyData policyData, DatabaseActionEnum policyAction)
        {
            var policyNumber = policyAction == DatabaseActionEnum.Insert ? policyData.ParentPolicyNumber : policyData.PolicyNumber;
            CheckNullMembers(policyData.PolicyMembers);
            CheckMemberIdNumbers(policyData.PolicyMembers);
            CheckMemberDateofBirth(policyData.PolicyMembers);
            CheckMainMember(policyData.PolicyMembers);
            CheckSpouseMember(policyData.PolicyMembers);
            CheckRepresentative(policyData.RepresentativeIdNumber);
            CheckBrokarageFspNumber(policyData.FSPNumber);
            await CheckDuplicateClientReference(policyData.ClientReference, policyAction);
            await VopdValidationCheck(policyData.PolicyMembers, policyAction);
        }

        private async Task<StagePolicyIntegrationRequest> CreateStageRequest(StagePolicyIntegrationRequest request)
        {
            Contract.Requires(request != null);
            var createdEntity = new Load_StagePolicyIntegrationRequest();
            using (var scope = _dbContextScopeFactory.Create())
            {
                var stagePolicyIntegrationRequest = Mapper.Map<Load_StagePolicyIntegrationRequest>(request);
                createdEntity = _stagePolicyIntegrationRequestRepository.Create(stagePolicyIntegrationRequest);
                await scope.SaveChangesAsync().ConfigureAwait(true);
            }

            return Mapper.Map<StagePolicyIntegrationRequest>(createdEntity);
        }

        private async Task<bool> UpdateStagedRequest(StagePolicyIntegrationRequest inputStagedRequest)
        {
            if (inputStagedRequest == null)
            {
                return await Task.FromResult(false);
            }

            using (var scope = _dbContextScopeFactory.Create())
            {
                var stagedEntity = await _stagePolicyIntegrationRequestRepository.FirstOrDefaultAsync(x => x.StagePolicyIntegrationRequestId == inputStagedRequest.StagePolicyIntegrationRequestId);

                if (stagedEntity != null)
                {
                    stagedEntity.Response = inputStagedRequest.Response;
                    stagedEntity.PolicyNumber = string.IsNullOrEmpty(inputStagedRequest.PolicyNumber) ?
                        stagedEntity.PolicyNumber : inputStagedRequest.PolicyNumber;
                    stagedEntity.ClientReference = string.IsNullOrEmpty(inputStagedRequest.ClientReference) ?
                        stagedEntity.ClientReference : inputStagedRequest.ClientReference;
                    stagedEntity.PolicyIntegrationRequestStatusType = inputStagedRequest.PolicyIntegrationRequestStatusType;
                    stagedEntity.IterationNumber = inputStagedRequest.IterationNumber;
                    _stagePolicyIntegrationRequestRepository.Update(stagedEntity);
                }

                return await scope.SaveChangesAsync().ConfigureAwait(true) > 0;
            }
        }

        public async Task<bool> ProcessStagedPolicyIntegrationRequests()
        {
            int retryCount = 3;
            using (var scope = _dbContextScopeFactory.Create())
            {
                var stagedEntities = await _stagePolicyIntegrationRequestRepository.Where(x => (x.PolicyIntegrationRequestStatusType == PolicyIntegrationRequestStatusTypeEnum.New
                                       || x.PolicyIntegrationRequestStatusType == PolicyIntegrationRequestStatusTypeEnum.Error || x.Response.Contains("errors occurred")
                                       || x.Response.Contains("error occurred") || x.Response.Contains("Value cannot be null"))
                                       && x.IterationNumber <= retryCount).ToListAsync();

                foreach (var stagedRequest in Mapper.Map<List<StagePolicyIntegrationRequest>>(stagedEntities))
                {
                    try
                    {
                        stagedRequest.IterationNumber += 1;

                        if (stagedRequest.PolicyIntegrationRequestMethodType == PolicyIntegrationRequestMethodTypeEnum.Create)
                        {
                            var createChildPolicyPayLoad = JsonConvert.DeserializeObject<PolicyData>(stagedRequest.Payload);
                            var createChildPolicyResponse = await CreateChildPolicy(createChildPolicyPayLoad);
                            _ = await UpdateStagePolicyIntegrationRequest(stagedRequest, createChildPolicyResponse);
                            continue;
                        }

                        if (stagedRequest.PolicyIntegrationRequestMethodType == PolicyIntegrationRequestMethodTypeEnum.Update)
                        {
                            var updateChildPolicyPayLoad = JsonConvert.DeserializeObject<PolicyData>(stagedRequest.Payload);
                            var updateChildPolicyResponse = await UpdateChildPolicy(updateChildPolicyPayLoad);
                            _ = await UpdateStagePolicyIntegrationRequest(stagedRequest, updateChildPolicyResponse);
                            continue;
                        }

                        if (stagedRequest.PolicyIntegrationRequestMethodType == PolicyIntegrationRequestMethodTypeEnum.UpdatePolicyStatus)
                        {

                            var updateChildPolicyPayLoad = JsonConvert.DeserializeObject<PolicyMinimumData>(stagedRequest.Payload);
                            var updateChildPolicyResponse = await UpdatePolicyStatus(updateChildPolicyPayLoad, stagedRequest.PartnerName);
                            _ = await UpdateStagePolicyIntegrationRequest(stagedRequest, updateChildPolicyResponse);
                            continue;
                        }

                        if (stagedRequest.PolicyIntegrationRequestMethodType == PolicyIntegrationRequestMethodTypeEnum.AllocatePayment)
                        {
                            var allocateSchemePaymentsPayLoad = JsonConvert.DeserializeObject<PaymentAllocationScheme>(stagedRequest.Payload);
                            var allocateSchemePaymentsResponse = await AllocateSchemePayments(allocateSchemePaymentsPayLoad, stagedRequest.PartnerName);


                            if (allocateSchemePaymentsResponse != null && stagedRequest != null)
                            {
                                stagedRequest.Response = JsonConvert.SerializeObject(allocateSchemePaymentsResponse);
                                stagedRequest.PolicyIntegrationRequestStatusType = allocateSchemePaymentsResponse.IsOperationSuccessFull && allocateSchemePaymentsResponse.PaymentAllocationRecords.Count > 0 ?
                                                                                    PolicyIntegrationRequestStatusTypeEnum.Success
                                                                                    : PolicyIntegrationRequestStatusTypeEnum.New;
                                _ = await UpdateStagedRequest(stagedRequest);
                                continue;
                            }
                        }

                        if (stagedRequest.PolicyIntegrationRequestMethodType == PolicyIntegrationRequestMethodTypeEnum.RegisterClaim)
                        {
                            var registerDeathClaimPayLoad = JsonConvert.DeserializeObject<SchemeDeathDetailRequest>(stagedRequest.Payload);

                            var allocateSchemePaymentsResponse = await MapToInternalModel(registerDeathClaimPayLoad);

                            if (allocateSchemePaymentsResponse != null && stagedRequest != null)
                            {
                                stagedRequest.Response = JsonConvert.SerializeObject(allocateSchemePaymentsResponse);
                                stagedRequest.PolicyIntegrationRequestStatusType = allocateSchemePaymentsResponse.IsOperationSuccessFull ? PolicyIntegrationRequestStatusTypeEnum.Success
                                                                                    : PolicyIntegrationRequestStatusTypeEnum.New;
                                _ = await UpdateStagedRequest(stagedRequest);
                                continue;
                            }
                        }

                        _ = await UpdateStagedRequest(stagedRequest);
                    }
                    catch (Exception ex)
                    {
                        try
                        {
                            _ = await UpdateStagedRequest(stagedRequest);
                            ex.LogException($"{nameof(PolicyIntegrationFacade)}: Staging Policy exception. PolicyData ", stagedRequest);
                        }
                        catch (Exception e)
                        {
                            e.LogException($"{nameof(PolicyIntegrationFacade)}: Staging Policy update exception. PolicyData ", stagedRequest);
                        }
                    }
                }

                await scope.SaveChangesAsync().ConfigureAwait(true);
            }

            return true;
        }

        public async Task<PolicyResponse> CreateSchemeChildPolicyRestricted(PolicyData policyData)
        {
            Contract.Requires(policyData != null);
            var payload = string.Empty;
            try
            {
                var clientAppicationId = RmaIdentity.ClientId;
                await CheckIfClientApplicationHasAcesstoPolicy(policyData.ParentPolicyNumber, clientAppicationId);
                var policyResponse = await CreateSchemeChildPolicy(policyData);
                return policyResponse;
            }
            catch (Exception ex)
            {
                ex.LogException($"{nameof(PolicyIntegrationFacade)}: Create policy exception. PolicyData : {payload}", policyData);
                return await Task.FromResult(GetPolicyResponse(false, ex.Message, policyData?.ClientReference));
            }
        }

        public async Task<PolicyResponse> CreateSchemeChildPolicy(PolicyData policyData)
        {
            Contract.Requires(policyData != null);
            var payload = string.Empty;
            try
            {
                policyData.ClientReference = policyData.ClientReference.Replace("/", "");
                payload = JsonConvert.SerializeObject(policyData);
                var requestEntity = CreateStagePolicyIntegrationRequestObject(policyData.ParentPolicyNumber, policyData.ClientReference, payload, PolicyIntegrationRequestMethodTypeEnum.Create);
                var stagedRequest = await CreateStageRequest(requestEntity);
                var clientAppicationId = RmaIdentity.ClientId;
                var policyResponse = await CreateChildPolicy(policyData);
                _ = await UpdateStagePolicyIntegrationRequest(stagedRequest, policyResponse);

                return await Task.FromResult(policyResponse);
            }
            catch (Exception ex)
            {
                ex.LogException($"{nameof(PolicyIntegrationFacade)}: Create policy exception. PolicyData : {payload}", policyData);
                return await Task.FromResult(GetPolicyResponse(false, ex.Message, policyData?.ClientReference));
            }
        }

        private async Task<PolicyResponse> CreateChildPolicy(PolicyData policyData)
        {
            try
            {
                Contract.Requires(policyData != null);
                await ProcessPolicyDataValidation(policyData, DatabaseActionEnum.Insert);
                var parentPolicy = await GetPolicyByPolicyNumber(policyData.ParentPolicyNumber);
                var parentPolicyId = parentPolicy.PolicyId;
                await AssignMemberBenefitIdsByCoverAmount(policyData.PolicyMembers, parentPolicy.ProductOptionId);
                policyData.PolicyId = await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.PolicyNumber);
                await SavePolicyMemberRolePlayers(policyData.PolicyMembers, policyData.PolicyId);
                await CreatePolicy(parentPolicy, policyData, parentPolicy.InsurerId);
                await SavePolicyInsuredLives(policyData.PolicyId, policyData.PolicyMembers);
                await SaveRolePlayerRelations(policyData.PolicyId, policyData.PolicyMembers);
                await UpdateParentPolicyInstallmentPremium(parentPolicy.PolicyId);
                await _rolePlayerPolicyService.UpdateChildPolicyPremiums(parentPolicyId);

                //Regenerate Policy Schedule
                await RegeneratePolicySchedule(policyData.PolicyId);

                return GetPolicyResponse(
                        true,
                        "Policy created successfully.",
                        policyData.ClientReference,
                        policyData.PolicyNumber,
                        PolicyStatusEnum.Active.DisplayAttributeValue()
                    );
            }
            catch (Exception ex)
            {
                ex.LogException($"{nameof(PolicyIntegrationFacade)}: Create policy exception.", policyData);
                return GetPolicyResponse(false, ex.Message, policyData?.ClientReference);
            }
        }

        private async Task SaveRolePlayerRelations(int policyId, List<PolicyDataMember> policyMembers)
        {
            if (policyId > 0 && policyMembers.Count > 0)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var relations = await _relationRepository
                        .Where(r => r.PolicyId == policyId)
                        .ToListAsync();
                    var rolePlayerIds = policyMembers.Select(m => m.RolePlayerId).ToList();
                    // Remove relations that are no longer in the member list. These are the ones
                    // that are not in the relations list
                    var removedRelations = relations
                        .Where(r => !rolePlayerIds.Contains(r.FromRolePlayerId))
                        .ToList();
                    _relationRepository.Delete(removedRelations);
                    // Add / update existing relations
                    var mainMember = policyMembers.First(m => m.MemberTypeId == (int)CoverMemberTypeEnum.MainMember);
                    foreach (var member in policyMembers)
                    {
                        if (member.MemberTypeId == (int)CoverMemberTypeEnum.MainMember)
                        {
                            AddMemberRelation(relations, policyId, member.RolePlayerId, mainMember.RolePlayerId, RolePlayerTypeEnum.MainMemberSelf);

                            if (member.IsBeneficiary)
                            {
                                AddMemberRelation(relations, policyId, member.RolePlayerId, mainMember.RolePlayerId, RolePlayerTypeEnum.Beneficiary);
                            }

                        }
                        else if (member.MemberTypeId == BeneficiaryMemberType)
                        {
                            AddMemberRelation(relations, policyId, member.RolePlayerId, mainMember.RolePlayerId, RolePlayerTypeEnum.Beneficiary);
                        }
                        else
                        {
                            AddMemberRelation(relations, policyId, member.RolePlayerId, mainMember.RolePlayerId, GetMemberType(member.MemberTypeId));

                            if (member.IsBeneficiary)
                            {
                                AddMemberRelation(relations, policyId, member.RolePlayerId, mainMember.RolePlayerId, RolePlayerTypeEnum.Beneficiary);
                            }
                        }
                    }
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }
        private void AddMemberRelation(List<client_RolePlayerRelation> relations, int policyId, int fromRolePlayerId, int toRolePlayerId, RolePlayerTypeEnum rolePlayerType)
        {
            using (_dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                var relation = relations
                    .SingleOrDefault(r => r.FromRolePlayerId == fromRolePlayerId
                                       && r.ToRolePlayerId == toRolePlayerId
                                       && r.RolePlayerTypeId == (int)rolePlayerType);
                if (relation is null)
                {
                    var rolePlayerRelation = new client_RolePlayerRelation
                    {
                        PolicyId = policyId,
                        FromRolePlayerId = fromRolePlayerId,
                        ToRolePlayerId = toRolePlayerId,
                        RolePlayerTypeId = (int)rolePlayerType
                    };
                    _relationRepository.Create(rolePlayerRelation);
                }
            }
        }

        private async Task SavePolicyInsuredLives(int policyId, List<PolicyDataMember> policyMembers)
        {
            if (policyId > 0 && policyMembers.Count > 0)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var policyInsuredLives = await _insuredLifeRepository
                        .Where(i => i.PolicyId == policyId)
                        .ToListAsync();
                    var insuredLives = policyMembers.Where(m => m.MemberTypeId < BeneficiaryMemberType && !m.IsBeneficiary && m.CoverAmount != 0 && m.BenefitId != 0).ToList();
                    var insuredLifeIds = insuredLives.Select(m => m.RolePlayerId).ToList();
                    // Remove insured lives that are not in the current list
                    var removedLives = policyInsuredLives
                        .Where(i => !insuredLifeIds.Contains(i.RolePlayerId))
                        .ToList();
                    removedLives.ForEach(rl =>
                    {
                        rl.InsuredLifeStatus = InsuredLifeStatusEnum.Cancelled;
                        rl.EndDate = DateTimeHelper.EndOfTheMonth(DateTime.Today);
                    });
                    _insuredLifeRepository.Update(removedLives);
                    // Add / update existing members
                    foreach (var member in policyMembers)
                    {
                        if (member.MemberTypeId < BeneficiaryMemberType && member.CoverAmount != 0 && member.BenefitId != 0)
                        {
                            var life = policyInsuredLives.SingleOrDefault(i => i.RolePlayerId == member.RolePlayerId);
                            if (life is null)
                            {
                                _insuredLifeRepository.Create(GetPolicyInsuredLife(policyId, member));
                            }
                            else
                            {
                                _insuredLifeRepository.Update(GetPolicyInsuredLife(policyId, member));
                            }
                        }
                    }

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        private policy_PolicyInsuredLife GetPolicyInsuredLife(int policyId, PolicyDataMember member)
        {
            var life = new policy_PolicyInsuredLife
            {
                PolicyId = policyId,
                RolePlayerId = member.RolePlayerId,
                RolePlayerTypeId = (int)GetMemberType(member.MemberTypeId),
                InsuredLifeStatus = InsuredLifeStatusEnum.Active,
                StatedBenefitId = member.BenefitId,
                StartDate = member.PolicyInceptionDate.Value,
                EndDate = null,
                CoverAmount = member.CoverAmount,
                Premium = member.Premium,
                InsuredLifeRemovalReason = null

            };

            return life;
        }

        private RolePlayerTypeEnum GetMemberType(int memberTypeId)
        {
            if (memberTypeId == BeneficiaryMemberType)
            {
                return RolePlayerTypeEnum.Beneficiary;
            }

            switch ((CoverMemberTypeEnum)memberTypeId)
            {
                case CoverMemberTypeEnum.MainMember:
                    return RolePlayerTypeEnum.MainMemberSelf;

                case CoverMemberTypeEnum.Spouse:
                    return RolePlayerTypeEnum.Spouse;

                case CoverMemberTypeEnum.Child:
                    return RolePlayerTypeEnum.Child;

                default:
                    return RolePlayerTypeEnum.Extended;
            }
        }

        private void CheckNullMembers(List<PolicyDataMember> members)
        {
            if (members.Any(member => member == null))
            {
                var message = $"There's a member that is set to null. Please ensure all members have correct values";
                throw new Exception(message);
            }
        }

        private void CheckMemberIdNumbers(List<PolicyDataMember> members)
        {
            var memberTypesThatRequireIdNumbers = (new List<CoverMemberTypeEnum> { CoverMemberTypeEnum.MainMember, CoverMemberTypeEnum.Spouse }).Cast<int>();

            var blanksIdNumbers = members
                .Where(m => m.IdNumber.Trim().Length == 0 && (memberTypesThatRequireIdNumbers.Contains(m.MemberTypeId) || m.IsBeneficiary)).ToList();

            var duplicateIdnumbers = (from m1 in members
                                      join m2 in members on m1.IdNumber
                                      equals m2.IdNumber
                                      where m1 != m2 && !string.IsNullOrEmpty(m1.IdNumber) && !string.IsNullOrEmpty(m2.IdNumber)
                                      select m1.IdNumber).ToList();


            var blankIdNumberInvalidIdType = members.Where(m => (string.IsNullOrWhiteSpace(m.IdNumber) || m.IdNumber.Length != 13) && (IdTypeEnum)m.IdTypeId == IdTypeEnum.SAIDDocument).ToList();

            if (blankIdNumberInvalidIdType.Count > 0)
            {
                var memberNames = string.Join(",", blankIdNumberInvalidIdType.Select(x => $"{x.FirstName} {x.Surname}").ToList());
                var message = $"There are/is {blankIdNumberInvalidIdType.Count} member(s) namely i.e. {memberNames} with blank/incorrect ID number(s). Hint: Provide Date of birth as ID Number and set IdType to 2 (PassportDocument).";
                throw new Exception(message);
            }

            if (blanksIdNumbers.Count > 0)
            {
                var memberNames = string.Join(",", blanksIdNumbers.Select(x => $"{x.FirstName} {x.Surname}").ToList());
                throw new Exception($"There are/is {blanksIdNumbers.Count} member(s) namely i.e. {memberNames} with blank ID number.");
            }

            if (duplicateIdnumbers.Count > 0)
            {

                var memberNames = string.Join(",", members.Where(x => duplicateIdnumbers.Contains(x.IdNumber)).Select(x => $"{x.FirstName} {x.Surname}").ToList());
                var idNumber = string.Join(",", duplicateIdnumbers.Distinct());
                throw new Exception($"Duplicate members namely i.e. {memberNames} with ID number {idNumber} exist in the policy data.");
            }
        }

        private void CheckMemberDateofBirth(List<PolicyDataMember> members)
        {
            var blanks = members.Where(m => m.DateOfBirth == DateTime.MinValue).ToList();

            if (blanks.Count > 0)
            {
                var memberNames = string.Join(",", blanks.Select(x => $"{x.FirstName} {x.Surname}").ToList());
                throw new Exception($"There is/are member(s) namely i.e. {memberNames} with blank Date of Birth");
            }
        }

        private void CheckMainMember(List<PolicyDataMember> members)
        {
            var mainMembers = members.Where(x => x.MemberTypeId == (int)CoverMemberTypeEnum.MainMember).ToList();

            if (mainMembers.Count == 0)
            {
                throw new Exception($"There's no active main member specified in the policy.");
            }

            var activeMainMembers = mainMembers.Where(x => x.MemberAction != (int)DatabaseActionEnum.Delete).ToList();

            if (activeMainMembers.Count > 1)
            {
                throw new Exception($"Policy should have only one active main member.");
            }

            var mainMember = activeMainMembers.Where(x => x.CoverAmount == 0).ToList();

            if (mainMember.Count > 0)
            {
                throw new Exception($"Cover amount for main member cannot be set to 0.00 .");
            }
        }

        private void CheckSpouseMember(List<PolicyDataMember> members)
        {
            var spouseMembers = members.Where(x => x.MemberTypeId == (int)CoverMemberTypeEnum.Spouse).ToList();

            if (spouseMembers.Where(x => x.MemberAction != (int)DatabaseActionEnum.Delete).Count() > 1)
            {
                throw new Exception($"Policy cannot have two or more spouse members active.");
            }
        }

        private void CheckRepresentative(string representativeId)
        {
            if (string.IsNullOrEmpty(representativeId))
            {
                throw new Exception($"Policy representative is blank.");
            }
        }

        private void CheckBrokarageFspNumber(string brokerageFspNumber)
        {
            if (string.IsNullOrEmpty(brokerageFspNumber))
            {
                throw new Exception($"Policy FspNumber is blank.");
            }
        }

        public static int AgeNextBirthDay(DateTime birthDate)
        {
            DateTime dateTimeNow = DateTimeHelper.SaNow;
            return dateTimeNow.Month == 1 && birthDate.Month == 12 || (dateTimeNow.Month != 12 || birthDate.Month != 1) &&
                birthDate.Month > dateTimeNow.Month ? dateTimeNow.Year - birthDate.Year : dateTimeNow.Year - birthDate.Year + 1;
        }

        private async Task VopdValidationCheck(List<PolicyDataMember> policyMembers, DatabaseActionEnum databaseActionEnum)
        {
            Contract.Requires(policyMembers != null);
            var vopdResults = await ProcessVopdCheck(policyMembers, databaseActionEnum);

            if (vopdResults.Count > 0)
            {
                throw new Exception(string.Join(",", vopdResults));
            }
        }

        private async Task<List<string>> ProcessVopdCheck(List<PolicyDataMember> policyDataMembers, DatabaseActionEnum databaseActionEnum)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {

                var errorList = new List<string>();

                var vopdMemberTypes = (new List<CoverMemberTypeEnum> { CoverMemberTypeEnum.MainMember, CoverMemberTypeEnum.Spouse }).Cast<int>();

                var vopdPolicyDataMembers = policyDataMembers.Where(x => x.IdNumber.Length == 13 && vopdMemberTypes.Contains(x.MemberTypeId))
                   .ToList();

                var vopdPolicyDataMembersIds = vopdPolicyDataMembers.Select(y => y.IdNumber).ToList();

                var existingMemberVopdResults = await _userVopdRepository
                    .Where(y => vopdPolicyDataMembersIds.Contains(y.IdNumber)).ToListAsync();

                var vopdStatusEnumList = new List<VopdStatusEnum>
                {VopdStatusEnum.Processed, VopdStatusEnum.ManualVerification};

                foreach (var vopdPolicyDataMember in vopdPolicyDataMembers)
                {

                    if (databaseActionEnum == DatabaseActionEnum.Insert
                        && (!vopdPolicyDataMember.IsAlive || vopdPolicyDataMember.DateVopdVerified == null || !vopdPolicyDataMember.IsVopdVerified))
                    {
                        errorList.Add($"VOPD details for member {vopdPolicyDataMember.FirstName} {vopdPolicyDataMember.Surname} with Id number {vopdPolicyDataMember.IdNumber} is not declared/verified as alive hence a policy cannot be created");
                        continue;
                    }

                    var existingVopdResult =
                        existingMemberVopdResults.FirstOrDefault(x => x.IdNumber == vopdPolicyDataMember.IdNumber);

                    if (existingVopdResult?.DateVerified != null &&
                        vopdStatusEnumList.Contains(existingVopdResult.VopdStatus))
                    {
                        continue;
                    }

                    var response = await _rolePlayerService.PersonVopdRequest(vopdPolicyDataMember.IdNumber);

                    if (response == null || response.statusCode != "200")
                    {
                        if (!vopdPolicyDataMember.IsAlive && vopdPolicyDataMember.DateVopdVerified == null)
                        {
                            errorList.Add($"Please provide VOPD details for member {vopdPolicyDataMember.FirstName} {vopdPolicyDataMember.Surname} with Id number {vopdPolicyDataMember.IdNumber}");
                        }
                        else
                        {
                            var vopdUpdateResponse = new VopdUpdateResponseModel
                            {
                                DateOfDeath = vopdPolicyDataMember.DateOfDeath,
                                IdNumber = vopdPolicyDataMember.IdNumber,
                                DeceasedStatus = vopdPolicyDataMember.IsAlive ? "ALIVE" : "DECEASED",
                                FirstName = vopdPolicyDataMember.FirstName,
                                Surname = vopdPolicyDataMember.Surname,
                                ModifiedBy = "Mi-Integration API",
                                VopdDatetime = (DateTime)vopdPolicyDataMember.DateVopdVerified,
                                FileIdentifier = Guid.Empty
                            };

                            await OverridePolicyDataMemberVopdStatus(vopdUpdateResponse);
                        }
                    }
                }

                return errorList;
            }
        }

        public async Task<bool> OverridePolicyDataMemberVopdStatus(VopdUpdateResponseModel vopdUpdateResponse)
        {
            Contract.Requires(vopdUpdateResponse != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                await _rolePlayerService.OverrideRolePlayerVopd(vopdUpdateResponse);
                return await Task.FromResult(true);
            }
        }

        private async Task AssignMemberBenefitIdsByCoverAmount(List<PolicyDataMember> policyMembers, int productOptionId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var errorMessages = new List<string>();
                var benefits = await _productOptionService.GetBenefitsForProductOption(productOptionId);

                //validate main member benefit
                var mainMember = policyMembers.FirstOrDefault(x => x.MemberTypeId == (int)CoverMemberTypeEnum.MainMember && x.MemberAction != (int)DatabaseActionEnum.Delete);
                var policyIsForMemberOnly = !policyMembers.Any(x => x.MemberTypeId != (int)CoverMemberTypeEnum.MainMember && x.MemberTypeId < BeneficiaryMemberType && x.MemberAction != (int)DatabaseActionEnum.Delete);
                var mainMemberNextAge = AgeNextBirthDay(mainMember.DateOfBirth);
                BenefitModel mainMemberbenefit = policyIsForMemberOnly
                    ? benefits.Where(b => b.BenefitAmount == mainMember.CoverAmount && (int)b.CoverMemberType == mainMember.MemberTypeId &&
                   mainMemberNextAge >= b.MinimumAge && b.MaximumAge >= mainMemberNextAge && b.BenefitName.IndexOf("member only", StringComparison.InvariantCultureIgnoreCase) >= 0).OrderBy(x => x.BaseRate).ToList().FirstOrDefault()
                    : benefits.Where(b => b.BenefitAmount == mainMember.CoverAmount && (int)b.CoverMemberType == mainMember.MemberTypeId &&
                     mainMemberNextAge >= b.MinimumAge && b.MaximumAge >= mainMemberNextAge && b.BenefitName.IndexOf("member only", StringComparison.InvariantCultureIgnoreCase) < 0).OrderBy(x => x.BaseRate).ToList().FirstOrDefault();
                if (mainMemberbenefit != null)
                {
                    mainMember.BenefitId = mainMemberbenefit.BenefitId;
                    mainMember.CoverAmount = mainMemberbenefit.BenefitAmount;
                    mainMember.Premium = mainMemberbenefit.BaseRate;
                }
                else
                {
                    errorMessages.Add($"Cannot find benefit for main member with Id Number {mainMember.IdNumber} and cover amount {mainMember.CoverAmount}");
                }

                //validate and assign other member's benefits
                if (errorMessages.Count == 0 && !policyIsForMemberOnly)
                {
                    foreach (var otherMember in policyMembers.Where(x => x.MemberTypeId != (int)CoverMemberTypeEnum.MainMember &&
                                                                x.MemberAction != (int)DatabaseActionEnum.Delete && x.MemberAction != 0))
                    {
                        if (otherMember.MemberTypeId < BeneficiaryMemberType)
                        {
                            var memberNextAge = AgeNextBirthDay(otherMember.DateOfBirth);
                            //lower bound
                            var benefit = benefits.Where(b => b.BenefitAmount >= otherMember.CoverAmount && (int)b.CoverMemberType == otherMember.MemberTypeId &&
                            memberNextAge >= b.MinimumAge && b.MaximumAge >= memberNextAge && b.BenefitAmount <= mainMemberbenefit.BenefitAmount).OrderBy(x => x.BenefitAmount).ThenByDescending(y => y.BaseRate).ToList().FirstOrDefault();

                            if (benefit == null)
                            {

                                benefit = otherMember.CoverAmount > mainMemberbenefit.BenefitAmount
                                    ? benefits.Where(b => (int)b.CoverMemberType == otherMember.MemberTypeId &&
                                           memberNextAge >= b.MinimumAge && b.MaximumAge >= memberNextAge && b.BenefitAmount <= mainMemberbenefit.BenefitAmount).OrderByDescending(x => x.BenefitAmount).ThenByDescending(y => y.BaseRate).ToList().FirstOrDefault()
                                    : benefits.Where(b => b.BenefitAmount <= otherMember.CoverAmount && (int)b.CoverMemberType == otherMember.MemberTypeId &&
                                           memberNextAge >= b.MinimumAge && b.MaximumAge >= memberNextAge && b.BenefitAmount <= mainMemberbenefit.BenefitAmount).OrderByDescending(x => x.BenefitAmount).ThenByDescending(y => y.BaseRate).ToList().FirstOrDefault();

                                if (benefit != null)
                                {
                                    otherMember.BenefitId = benefit.BenefitId;
                                    otherMember.CoverAmount = benefit.BenefitAmount;
                                    otherMember.Premium = benefit.BaseRate;
                                }
                                else
                                {
                                    var idOrDateOfBirth = string.IsNullOrWhiteSpace(otherMember.IdNumber) ? otherMember.DateOfBirth.ToString() : otherMember.IdNumber;
                                    errorMessages.Add($"Could not find benefit with cover amount {otherMember.CoverAmount} for member with ID Number/Date of birth {idOrDateOfBirth}");
                                    continue;
                                }

                            }
                            else
                            {
                                otherMember.BenefitId = benefit.BenefitId;
                                otherMember.CoverAmount = benefit.BenefitAmount;
                                otherMember.Premium = benefit.BaseRate;
                            }
                        }
                    }
                }

                var allMembersLinkedToBenefits = policyMembers.Where(m => m.BenefitId == 0 && (m.MemberTypeId < BeneficiaryMemberType &&
                                                m.MemberAction != (int)DatabaseActionEnum.Delete) && m.CoverAmount != 0).ToList();

                if (errorMessages.Count > 0)
                {
                    throw new Exception($"{string.Join(",", errorMessages)}");
                }
            }
        }



        private async Task AssignMemberBenefitByBenefitIds(List<PolicyDataMember> policyMembers, int productOptionId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var errorMessages = new List<string>();
                BenefitModel mainMemberbenefit = null;
                var benefits = await _productOptionService.GetBenefitsForProductOption(productOptionId);

                //validate main member benefit
                var mainMember = policyMembers.FirstOrDefault(x => x.MemberTypeId == (int)CoverMemberTypeEnum.MainMember && x.MemberAction != (int)DatabaseActionEnum.Delete);

                mainMemberbenefit = benefits.Where(b => b.BenefitId == mainMember.BenefitId && (int)b.CoverMemberType == mainMember.MemberTypeId).OrderBy(x => x.BaseRate).ToList().FirstOrDefault();

                if (mainMemberbenefit != null)
                {
                    mainMember.BenefitId = mainMemberbenefit.BenefitId;
                    mainMember.CoverAmount = mainMemberbenefit.BenefitAmount;
                    mainMember.Premium = mainMemberbenefit.BaseRate;
                }
                else
                {
                    errorMessages.Add($"Cannot find benefit for main member with Id Number {mainMember.IdNumber} and cover amount {mainMember.CoverAmount}");
                }

                //validate and assign other member's benefits
                if (errorMessages.Count == 0)
                {
                    foreach (var otherMember in policyMembers.Where(x => x.MemberTypeId != (int)CoverMemberTypeEnum.MainMember &&
                                                                x.MemberAction != (int)DatabaseActionEnum.Delete && x.MemberAction != 0))
                    {
                        if (otherMember.MemberTypeId < BeneficiaryMemberType)
                        {

                            //lower bound
                            var benefit = benefits.Where(b => b.BenefitId == otherMember.BenefitId && (int)b.CoverMemberType == otherMember.MemberTypeId
                           ).OrderBy(x => x.BenefitAmount).ThenByDescending(y => y.BaseRate).ToList().FirstOrDefault();

                            if (benefit == null)
                            {
                                var idOrDateOfBirth = string.IsNullOrWhiteSpace(otherMember.IdNumber) ? otherMember.DateOfBirth.ToString() : otherMember.IdNumber;
                                errorMessages.Add($"Could not find benefit with cover amount {otherMember.CoverAmount} for member with ID Number/Date of birth {idOrDateOfBirth}");
                                continue;


                            }
                            else
                            {
                                otherMember.BenefitId = benefit.BenefitId;
                                otherMember.CoverAmount = benefit.BenefitAmount;
                                otherMember.Premium = benefit.BaseRate;
                            }
                        }
                    }
                }

                var allMembersLinkedToBenefits = policyMembers.Where(m => m.BenefitId == 0 && (m.MemberTypeId < BeneficiaryMemberType &&
                                                m.MemberAction != (int)DatabaseActionEnum.Delete) && m.CoverAmount != 0).ToList();

                if (errorMessages.Count > 0)
                {
                    throw new Exception($"{string.Join(",", errorMessages)}");
                }
            }
        }
        private async Task CreatePolicy(Contracts.Entities.Policy.Policy parentPolicy, PolicyData policyData, int insurerId)
        {
            Contract.Requires(parentPolicy != null);
            Contract.Requires(policyData != null);
            
            using (var scope = _dbContextScopeFactory.Create())
            {
                policyData.PolicyNumber = await _documentGeneratorService.GetDocumentNumber(DocumentNumberTypeEnum.PolicyNumber, policyData.PolicyId, "01");
                policyData.InstallmentPremium = policyData.PolicyMembers.Where(x => x.MemberAction != (int)DatabaseActionEnum.Delete).Sum(x => x.Premium);
                var mainMember = policyData.PolicyMembers.First(m => m.MemberTypeId == (int)CoverMemberTypeEnum.MainMember);
                var benefitIds = policyData.PolicyMembers.Select(m => m.BenefitId).Distinct().ToList();
                var benefits = await _benefitRepository.Where(b => benefitIds.Contains(b.Id)).ToListAsync();
                var brokerageDetails = await _brokerageService.GetBrokerageAndRepresentativesByFSPNumber(policyData.FSPNumber);

                if (brokerageDetails == null)
                {
                    throw new Exception($"Cannot find brokerage with Fsp Number {policyData.FSPNumber}.");
                }

                var representativeDetails = brokerageDetails.Representatives?.FirstOrDefault(x => x.IdNumber == policyData.RepresentativeIdNumber.Trim());
                if (representativeDetails == null)
                {
                    throw new Exception($"Cannot find reprenstative with ID Number {policyData.RepresentativeIdNumber}.");
                }
                // Create the new policy
                var policy = new policy_Policy
                {
                    PolicyId = policyData.PolicyId,
                    TenantId = parentPolicy.TenantId,
                    InsurerId = insurerId,
                    ProductOptionId = parentPolicy.ProductOptionId,
                    BrokerageId = brokerageDetails.Id,
                    RepresentativeId = representativeDetails.Id,
                    JuristicRepresentativeId = parentPolicy.JuristicRepresentativeId,
                    PolicyOwnerId = mainMember.RolePlayerId,
                    PolicyPayeeId = parentPolicy.PolicyOwnerId,
                    PaymentFrequency = parentPolicy.PaymentFrequency,
                    PaymentMethod = parentPolicy.PaymentMethod,
                    PolicyNumber = policyData.PolicyNumber,
                    PolicyInceptionDate = mainMember.PolicyInceptionDate?.ToSaDateTime() ?? DateTimeHelper.SaNow,
                    FirstInstallmentDate = mainMember.PolicyInceptionDate?.ToSaDateTime() ?? DateTimeHelper.SaNow,
                    RegularInstallmentDayOfMonth = parentPolicy.RegularInstallmentDayOfMonth,
                    DecemberInstallmentDayOfMonth = parentPolicy.DecemberInstallmentDayOfMonth,
                    PolicyStatus = PolicyStatusEnum.Active,
                    InstallmentPremium = policyData.InstallmentPremium,
                    AnnualPremium = policyData.InstallmentPremium * 12.0M,
                    AdminPercentage = parentPolicy.AdminPercentage,
                    CommissionPercentage = parentPolicy.CommissionPercentage,
                    BinderFeePercentage = parentPolicy.BinderFeePercentage,
                    PremiumAdjustmentPercentage = parentPolicy.PremiumAdjustmentPercentage,
                    ParentPolicyId = parentPolicy.PolicyId,
                    CanLapse = parentPolicy.CanLapse,
                    IsEuropAssist = parentPolicy.IsEuropAssist,
                    ClientReference = string.IsNullOrWhiteSpace(policyData.ClientReference) ? policyData.PolicyNumber : policyData.ClientReference,
                    CreatedBy = RmaIdentity.ClientId,
                    ModifiedBy = RmaIdentity.ClientId,
                    Benefits = benefits
                };
                _policyRepository.Create(policy);
                // Save the policy broker
                var policyBroker = new policy_PolicyBroker
                {
                    PolicyId = policyData.PolicyId,
                    BrokerageId = parentPolicy.BrokerageId,
                    RepId = parentPolicy.RepresentativeId,
                    JuristicRepId = parentPolicy.JuristicRepresentativeId,
                    EffectiveDate = DateTime.Today
                };
                _policyBrokerRepository.Create(policyBroker);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task SavePolicyMemberRolePlayers(List<PolicyDataMember> policyMembers, int policyId)
        {
            Contract.Requires(policyMembers != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var idNumbers = policyMembers.Where(y => !string.IsNullOrEmpty(y.IdNumber)).Select(m => m.IdNumber.ToLower()).ToList().Distinct();
                var persons = await _personRepository
                    .Where(p => idNumbers.Contains(p.IdNumber.ToLower()))
                    .ToListAsync();

                foreach (var person in persons)
                {
                    var member = policyMembers.Single(p => string.Equals(p.IdNumber, person.IdNumber, StringComparison.OrdinalIgnoreCase));
                    if (member.MemberAction != 0)
                    {
                        member.RolePlayerId = person.RolePlayerId;
                        await UpdateRolePlayerPerson(member, policyId);
                    }
                }

                foreach (var member in policyMembers)
                {
                    if (member.MemberAction != 0)
                    {
                        if (member.RolePlayerId == 0)
                        {
                            if (string.IsNullOrEmpty(member.IdNumber))
                            {
                                member.IdNumber = $"{member.DateOfBirth.ToShortDateString()}-{policyId}";
                                var foundPerson = await _personRepository.FirstOrDefaultAsync(x => x.IdNumber == member.IdNumber);
                                if (foundPerson != null)
                                {
                                    member.RolePlayerId = foundPerson.RolePlayerId;
                                    await UpdateRolePlayerPerson(member, policyId);
                                }
                                else
                                {
                                    member.RolePlayerId = await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);
                                    await CreateRolePlayerPerson(member);
                                }
                            }
                            else
                            {
                                member.RolePlayerId = await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);
                                await CreateRolePlayerPerson(member);
                            }
                        }
                        else
                        {
                            var foundPerson = await _personRepository.FirstOrDefaultAsync(x => x.RolePlayerId == member.RolePlayerId);
                            if (foundPerson != null && member.MemberTypeId != (int)InsuredLifeRolePlayerTypeEnum.MainMemberself)
                            {
                                await UpdateRolePlayerPerson(member, policyId);
                            }
                        }
                    }
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private Task CreateRolePlayerPerson(PolicyDataMember member)
        {         
            Contract.Requires (member != null);    
            var rolePlayer = new client_RolePlayer
            {
                RolePlayerId = member.RolePlayerId,
                DisplayName = $"{member.FirstName} {member.Surname}",
                CellNumber = member.MobileNumber,
                TellNumber = member.SecondaryNumber,
                EmailAddress = member.EmailAddress,
                PreferredCommunicationTypeId = member.PreferredCommunicationType > 0 ? member.PreferredCommunicationType : 4,
                RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person,
                IsDeleted = false,
            };

            _rolePlayerRepository.Create(rolePlayer);

            var person = new client_Person
            {
                RolePlayerId = member.RolePlayerId,
                FirstName = member.FirstName,
                Surname = member.Surname,
                IdType = (IdTypeEnum)member.IdTypeId,
                IdNumber = member.IdNumber,
                DateOfBirth = member.DateOfBirth.ToSaDateTime(),
                IsAlive = true,
                IsDeleted = false,
                IsStudying = member.IsStudying,
                IsDisabled = member.IsDisabled
            };

            _personRepository.Create(person);
            return Task.CompletedTask;
        }

        private async Task UpdateRolePlayerPerson(PolicyDataMember member, int policyId)
        {
            Contract.Requires(member != null);  
            var clientApplicatonId = RmaIdentity.Username.Equals("BackendProcess", StringComparison.OrdinalIgnoreCase)
                                       ? SystemSettings.SystemUser : RmaIdentity.ClientId;
            using (var scope = _dbContextScopeFactory.Create())
            {
                var rolePlayer = await _rolePlayerRepository.SingleAsync(r => r.RolePlayerId == member.RolePlayerId);
                rolePlayer.DisplayName = $"{member.FirstName} {member.Surname}";
                rolePlayer.CellNumber = member.MobileNumber;
                rolePlayer.TellNumber = member.SecondaryNumber;
                rolePlayer.EmailAddress = member.EmailAddress;
                rolePlayer.PreferredCommunicationTypeId = member.PreferredCommunicationType > 0 ? member.PreferredCommunicationType : DefaultPreferredCommunicationType;
                rolePlayer.RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
                rolePlayer.IsDeleted = false;
                _rolePlayerRepository.Update(rolePlayer);

                var person = await _personRepository.SingleAsync(p => p.RolePlayerId == member.RolePlayerId);
                person.FirstName = member.FirstName;
                person.Surname = member.Surname;
                person.IdType = (IdTypeEnum)member.IdTypeId;
                person.IdNumber = member.IdNumber;
                person.DateOfBirth = member.DateOfBirth.ToSaDateTime();
                person.IsAlive = true;
                person.IsDeleted = false;
                person.IsStudying = member.IsStudying;
                person.IsDisabled = member.IsDisabled;
                _personRepository.Update(person);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

            var note = new Note()
            {
                ItemId = policyId,
                Text = $"Member {member.FirstName} {member.Surname} details updated by {clientApplicatonId}.",
                CreatedBy = clientApplicatonId,
                ModifiedBy = clientApplicatonId
            };

            await _policyNoteService.AddNote(note);

            await SaveRolePlayerAddress(member, policyId);

        }

        private async Task SaveRolePlayerAddress(PolicyDataMember member, int policyId)
        {
            Contract.Requires(member != null);  
            var clientApplicatonId = RmaIdentity.Username.Equals("BackendProcess", StringComparison.OrdinalIgnoreCase)
                                       ? SystemSettings.SystemUser : RmaIdentity.ClientId;
            if (member.Addresses is null)
            {
                return;
            }
            using (var scope = _dbContextScopeFactory.Create())
            {
                foreach (var address in member.Addresses)
                {
                    var country = await _countryService.GetCountryByName(address.Country);
                    var addressList = await _addressRepository
                        .Where(a => a.RolePlayerId == member.RolePlayerId
                                 && a.AddressType == (AddressTypeEnum)address.AddressTypeId)
                        .ToListAsync();
                    if (addressList.Count > 0)
                    {
                        var entity = addressList.Last();
                        entity.AddressLine1 = address.AddressLine1;
                        entity.AddressLine2 = address.AddressLine2;
                        entity.City = address.City;
                        entity.Province = address.Province;
                        entity.CountryId = country.Id;
                        entity.PostalCode = address.PostalCode;
                        entity.EffectiveDate = member.PolicyInceptionDate.Value;
                        _addressRepository.Update(entity);
                    }
                    else
                    {
                        var entity = new client_RolePlayerAddress
                        {
                            RolePlayerId = member.RolePlayerId,
                            AddressType = (AddressTypeEnum)address.AddressTypeId,
                            AddressLine1 = address.AddressLine1,
                            AddressLine2 = address.AddressLine2,
                            City = address.City,
                            Province = address.Province,
                            CountryId = country.Id,
                            PostalCode = address.PostalCode,
                            EffectiveDate = member.PolicyInceptionDate.Value
                        };
                        _addressRepository.Create(entity);
                    }
                    var note = new Note()
                    {
                        ItemId = policyId,
                        Text = $"Adress changes for  {member.FirstName} {member.Surname}.",
                        CreatedBy = clientApplicatonId,
                        ModifiedBy = clientApplicatonId
                    };


                    await _policyNoteService.AddNote(note);

                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private PolicyResponse GetPolicyResponse(bool successful, string reponseMessage, string clientReference = "",
            string policyNumber = "", string policyStatus = "")
        {
            return new PolicyResponse()
            {
                ClientReference = clientReference,
                PolicyNumber = policyNumber,
                PolicyStatus = policyStatus,
                IsOperationSuccessFull = successful,
                ResponseMessage = reponseMessage
            };
        }

        public async Task<PolicyResponse> UpdateSchemeChildPolicyRestricted(PolicyData policyData)
        {
            Contract.Requires(policyData != null);
            policyData.ClientReference = policyData.ClientReference.Replace("/", "");
            var clientAppicationId = RmaIdentity.ClientId;
            await CheckIfClientApplicationHasAcesstoPolicy(policyData.PolicyNumber, clientAppicationId);
            var policyResponse = await UpdateSchemeChildPolicy(policyData);
            return policyResponse;
        }

        public async Task<PolicyResponse> UpdateSchemeChildPolicy(PolicyData policyData)
        {
            Contract.Requires(policyData != null);
            if (!string.IsNullOrEmpty(policyData.ClientReference))
            {
                policyData.ClientReference = policyData.ClientReference.Replace("/", "");
            }
            var payload = JsonConvert.SerializeObject(policyData);
            var requestEntity = CreateStagePolicyIntegrationRequestObject(policyData.PolicyNumber, policyData.ClientReference, payload, PolicyIntegrationRequestMethodTypeEnum.Update);
            var stagedRequest = await CreateStageRequest(requestEntity);
            var policyResponse = await UpdateChildPolicy(policyData);
            _ = await UpdateStagePolicyIntegrationRequest(stagedRequest, policyResponse);
            return policyResponse;
        }


        private async Task<policy_Policy> GetPolicyToUpdate(string policyNumber)
        {
            policy_Policy policy;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                policy = await _policyRepository.SingleOrDefaultAsync(p => p.PolicyNumber == policyNumber);
                if (policy is null)
                {
                    throw new Exception($"Could not find policy details for policy number {policyNumber}");
                }

                await _policyRepository.LoadAsync(policy, po => po.ProductOption);
                await _policyRepository.LoadAsync(policy, po => po.PolicyInsuredLives);
                await _policyRepository.LoadAsync(policy, po => po.Brokerage);
            }

            return policy;
        }

        private async Task<Contracts.Entities.Policy.PolicyResponse> UpdateChildPolicy(PolicyData policyData, bool assignBenefitsByBenefitId = false)
        {
            Contract.Requires(policyData != null);
            try
            {
                var clientApplicatonId = RmaIdentity.Username.Equals("BackendProcess", StringComparison.OrdinalIgnoreCase)
                                         ? SystemSettings.SystemUser : RmaIdentity.ClientId;
                await ProcessPolicyDataValidation(policyData, DatabaseActionEnum.Update);
                var policy = await GetPolicyToUpdate(policyData.PolicyNumber);
                policyData.PolicyId = policy.PolicyId;
                UpdateMemberJoinDates(policy.PolicyInceptionDate, policyData.PolicyMembers);
                if (!assignBenefitsByBenefitId && !policyData.AssignBenefit)
                {
                    await AssignMemberBenefitIdsByCoverAmount(policyData.PolicyMembers, policy.ProductOptionId);
                }
                else
                {
                    await AssignMemberBenefitByBenefitIds(policyData.PolicyMembers, policy.ProductOptionId);
                }
                await SavePolicyMemberRolePlayers(policyData.PolicyMembers, policyData.PolicyId);
                await UpdatePolicyInsuredLives(policyData.PolicyId, policy.PolicyInceptionDate, policyData.PolicyMembers);
                await UpdateChildPolicyPremiums(policyData.PolicyId);
                await UpdateRolePlayerRelations(policyData.PolicyId, policy.PolicyOwnerId, policyData.PolicyMembers);
                await UpdatePolicyInstallmentPremium(policyData.PolicyId);
                await UpdateParentPolicyInstallmentPremium((int)policy.ParentPolicyId);
                await _rolePlayerPolicyService.UpdateChildPolicyPremiums((int)policy.ParentPolicyId);

                //Regenerate Policy Schedule
                await RegeneratePolicySchedule(policy.PolicyId);
                await SendPolicySchedule(policy.PolicyId, PolicyCommunicationTypeEnum.PolicyAmendment.ToString());

                var note = new Note()
                {
                    ItemId = policyData.PolicyId,
                    Text = $"Policy Updated by {clientApplicatonId}.",
                    CreatedBy = clientApplicatonId,
                    ModifiedBy = clientApplicatonId

                };
                await _policyNoteService.AddNote(note);

                return GetPolicyResponse(
                        true,
                        "Policy updated successfully",
                        policyData.ClientReference,
                        policyData.PolicyNumber,
                        policy.PolicyStatus.DisplayAttributeValue()
                    );
            }
            catch (Exception ex)
            {
                ex.LogException($"{nameof(PolicyIntegrationFacade)}: Update policy exception.", policyData, assignBenefitsByBenefitId);
                return GetPolicyResponse(false, ex.Message, policyData.ClientReference, policyData.PolicyNumber);
            }

        }

        private void UpdateMemberJoinDates(DateTime policyInceptionDate, List<PolicyDataMember> policyMembers)
        {
            foreach (var member in policyMembers)
            {
                if (!member.PolicyInceptionDate.HasValue && member.EmploymentStartDate.HasValue)
                {
                    member.PolicyInceptionDate = member.EmploymentStartDate;
                }
                if (member.PolicyInceptionDate.HasValue)
                {
                    if (member.PolicyInceptionDate.Value.Year < 1980)
                    {
                        member.PolicyInceptionDate = policyInceptionDate;
                    }
                }
                else
                {
                    member.PolicyInceptionDate = policyInceptionDate;
                }
            }
        }

        private async Task UpdatePolicyInsuredLives(int policyId, DateTime policyInceptionDate, List<PolicyDataMember> policyMembers)
        {
            var clientApplicatonId = RmaIdentity.Username.Equals("BackendProcess", StringComparison.OrdinalIgnoreCase)
                                         ? SystemSettings.SystemUser : RmaIdentity.ClientId;
            using (var scope = _dbContextScopeFactory.Create())
            {
                var insuredLives = await _insuredLifeRepository
                    .Where(r => r.PolicyId == policyId)
                    .ToListAsync();
                foreach (var member in policyMembers)
                {
                    if (member.MemberTypeId == BeneficiaryMemberType)
                    {
                        continue;
                    }

                    var entity = insuredLives
                        .SingleOrDefault(l => l.RolePlayerId == member.RolePlayerId);
                    switch ((DatabaseActionEnum)member.MemberAction)
                    {
                        case DatabaseActionEnum.Insert:

                        case DatabaseActionEnum.Update:
                            if (entity is null)
                            {
                                var life = GetPolicyInsuredLife(policyId, member);
                                _insuredLifeRepository.Create(life);
                            }
                            else
                            {

                                DateTime? endDate = null;
                                var insuredLifeStatus = InsuredLifeStatusEnum.Active;
                                if (member.BenefitId == 0)
                                {
                                    endDate = DateTimeHelper.EndOfTheMonth(DateTime.Today);
                                    insuredLifeStatus = InsuredLifeStatusEnum.Cancelled;
                                    entity.InsuredLifeRemovalReason = member.InsuredLifeRemovalReason;
                                    var cancelNote = new Note()
                                    {
                                        ItemId = policyId,
                                        Text = $"Policy Member cancelled by {clientApplicatonId} ",
                                        CreatedBy = clientApplicatonId,
                                        ModifiedBy = clientApplicatonId,
                                        Reason = $"{member.InsuredLifeRemovalReason}"
                                    };

                                    await _policyNoteService.AddNote(cancelNote);
                                }
                                entity.InsuredLifeRemovalReason = member.InsuredLifeRemovalReason;
                                entity.RolePlayerTypeId = (int)GetMemberType(member.MemberTypeId);
                                entity.InsuredLifeStatus = insuredLifeStatus;
                                entity.StatedBenefitId = member.BenefitId;
                                entity.StartDate = member.PolicyInceptionDate.HasValue ? member.PolicyInceptionDate.Value : policyInceptionDate;
                                entity.EndDate = endDate;
                                entity.CoverAmount = member.CoverAmount;
                                entity.Premium = member.Premium;
                                _insuredLifeRepository.Update(entity);
                                var note = new Note()
                                {
                                    ItemId = policyId,
                                    Text = $" Policy Insured {member.FirstName}{member.Surname}| Cover: {member.CoverAmount} Benefit {member.Premium} {insuredLifeStatus}  updated.",
                                    CreatedBy = clientApplicatonId,
                                    ModifiedBy = clientApplicatonId,
                                    Reason = $"{member.InsuredLifeRemovalReason}"
                                };
                                await _policyNoteService.AddNote(note);

                            }
                            break;

                        case DatabaseActionEnum.Delete:
                            if (entity != null)
                            {
                                entity.InsuredLifeStatus = InsuredLifeStatusEnum.Cancelled;
                                entity.EndDate = DateTimeHelper.EndOfTheMonth(DateTime.Today);
                                entity.InsuredLifeRemovalReason = member.InsuredLifeRemovalReason;
                                _insuredLifeRepository.Update(entity);
                                var note = new Note()
                                {
                                    ItemId = policyId,
                                    Text = $" Policy Member {member.FirstName} {member.Surname} removed by {RmaIdentity.ClientId}",
                                    CreatedBy = clientApplicatonId,
                                    ModifiedBy = clientApplicatonId,
                                    Reason = $"{member.InsuredLifeRemovalReason}"
                                };

                                await _policyNoteService.AddNote(note);
                            }
                            break;
                    }
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task UpdateRolePlayerRelations(int policyId, int mainMemberId, List<PolicyDataMember> policyMembers)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var rolePlayeRelations = await _relationRepository
                    .Where(r => r.PolicyId == policyId)
                    .ToListAsync();
                foreach (var member in policyMembers)
                {
                    if (member.MemberAction != 0)
                    {
                        if (member.MemberAction == (int)DatabaseActionEnum.Delete)
                        {
                            var relations = rolePlayeRelations.Where(r => r.FromRolePlayerId == member.RolePlayerId).ToList();
                            if (relations.Count > 0)
                            {
                                _relationRepository.Delete(relations);
                            }
                        }
                        else
                        {
                            if (member.MemberTypeId == (int)CoverMemberTypeEnum.MainMember)
                            {
                                AddMemberRelation(rolePlayeRelations, policyId, member.RolePlayerId, mainMemberId, RolePlayerTypeEnum.MainMemberSelf);
                                AddMemberRelation(rolePlayeRelations, policyId, member.RolePlayerId, mainMemberId, RolePlayerTypeEnum.Beneficiary);
                            }
                            else if (member.MemberTypeId == BeneficiaryMemberType)
                            {
                                AddMemberRelation(rolePlayeRelations, policyId, member.RolePlayerId, mainMemberId, RolePlayerTypeEnum.Beneficiary);
                            }
                            else
                            {
                                AddMemberRelation(rolePlayeRelations, policyId, member.RolePlayerId, mainMemberId, GetMemberType(member.MemberTypeId));
                                if (member.IsBeneficiary)
                                {
                                    AddMemberRelation(rolePlayeRelations, policyId, member.RolePlayerId, mainMemberId, RolePlayerTypeEnum.Beneficiary);
                                }
                            }
                        }
                    }
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }


        public async Task<int> CreateCDAPolicy(PolicyDataRequest policyDataRequest)
        {
            Contract.Requires(policyDataRequest != null);
            //Using Stored Proc for POC
            var createdPolicyId = 0;
            policy_Policy policy = null;
            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var policyNumber = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.PolicyNumber, "03");

                    var policyId = await _policyRepository.SqlQueryAsync<int>(DatabaseConstants.CreateCDAPolicy,
                        new SqlParameter("@ReferenceNumber", policyDataRequest.ReferenceNumber),
                        new SqlParameter("@PolicyNumber", policyNumber));
                    createdPolicyId = policyId.FirstOrDefault();

                    if (createdPolicyId > 0)
                    {
                        policy = await _policyRepository.FirstOrDefaultAsync(x => x.PolicyId == createdPolicyId);
                    }

                }

                if (policy != null)
                {
                    var parentPolicyId = policy.ParentPolicyId;
                    if (parentPolicyId != null)
                    {
                        await _rolePlayerPolicyService.UpdateChildPolicyPremiums((int)policy.ParentPolicyId);
                    }

                    try
                    {
                        await GeneratePolicySchedule(policy.PolicyId);
                        await SendPolicySchedule(policy.PolicyId, PolicyCommunicationTypeEnum.NewOnboarding.ToString());
                    }
                    catch (Exception scheduleEx)
                    {
                        scheduleEx.LogException($"Error in {nameof(CreateCDAPolicy)}. PolicyId: {policy?.PolicyId}. Exception: {scheduleEx.Message}", policyDataRequest);
                    }

                }

                return createdPolicyId;

            }
            catch (Exception ex)
            {
                ex.LogException("", policyDataRequest);
                return -1;
            }
        }

        public async Task<List<PolicyMinimumData>> GetChildPoliciesByParentPolicyNumber(string policyNumber)
        {
            var policies = new List<PolicyMinimumData>();
            var clientApplicationId = RmaIdentity.ClientId;
            await CheckIfClientApplicationHasAcesstoPolicy(policyNumber, clientApplicationId);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var parentPolicy = await _policyRepository
                  .SingleOrDefaultAsync(p => p.PolicyNumber == policyNumber);

                if (parentPolicy != null)
                {
                    policies = await (from policy in _policyRepository
                                      join rolePlayer in _rolePlayerRepository on policy.PolicyOwnerId equals rolePlayer.RolePlayerId
                                      join person in _personRepository on rolePlayer.RolePlayerId equals person.RolePlayerId
                                      where policy.ParentPolicyId == parentPolicy.PolicyId

                                      select new PolicyMinimumData
                                      {
                                          PolicyId = policy.PolicyId,
                                          PolicyNumber = policy.PolicyNumber,
                                          DisplayName = rolePlayer.DisplayName,
                                          IdNumber = person.IdNumber,
                                          PolicyStatus = policy.PolicyStatus,
                                          InstallmentPremium = policy.InstallmentPremium,
                                          policyCancelReasonEnum = policy.PolicyCancelReason,
                                      }
                                    ).Distinct().ToListAsync();
                }
                return policies;
            }
        }

        private async Task<List<string>> GetInsurerGroupSchemeParentPolicyNumbers(string clientApplicationId)
        {
            var policyNumbers = new List<string>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyObjects = await (from insurer in _insurerRepository
                                           join insurerGroupSchemeAccesses in _insurerGroupSchemeAccessesRepository on insurer.Id equals insurerGroupSchemeAccesses.InsurerId
                                           join policy in _policyRepository on insurerGroupSchemeAccesses.ParentPolicyId equals policy.PolicyId
                                           where insurerGroupSchemeAccesses.ApplicationId == clientApplicationId && insurerGroupSchemeAccesses.IsActive
                                           select policy

                                 ).ToListAsync();

                if (policyObjects.Count > 0)
                {
                    policyNumbers.AddRange(policyObjects.Select(y => y.PolicyNumber));
                    policyNumbers.AddRange(policyObjects.Where(x => !string.IsNullOrWhiteSpace(x.ClientReference)).Select(y => y.ClientReference));
                }

                return policyNumbers;
            }
        }

        private async Task<List<string>> GetInsurerGroupSchemeChildPolicyNumbers(string clientApplicationId)
        {
            var policyNumbers = new List<string>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyObjects = await (from insurer in _insurerRepository
                                           join insurerGroupSchemeAccesses in _insurerGroupSchemeAccessesRepository on insurer.Id equals
                                               insurerGroupSchemeAccesses.InsurerId
                                           join parentPolicy in _policyRepository on insurerGroupSchemeAccesses.ParentPolicyId equals
                                               parentPolicy.PolicyId
                                           join childPolicy in _policyRepository on parentPolicy.PolicyId equals childPolicy.ParentPolicyId
                                           where insurerGroupSchemeAccesses.ApplicationId == clientApplicationId &&
                                                 insurerGroupSchemeAccesses.IsActive
                                           select childPolicy
                    ).ToListAsync();

                if (policyObjects.Count > 0)
                {
                    policyNumbers.AddRange(policyObjects.Select(y => y.PolicyNumber));
                    policyNumbers.AddRange(policyObjects.Where(x => !string.IsNullOrWhiteSpace(x.ClientReference))
                        .Select(y => y.ClientReference));
                }

                return policyNumbers;
            }
        }

        private void ValidatePaymentAllocationScheme(PaymentAllocationScheme paymentAllocationScheme)
        {
            if (paymentAllocationScheme == null)
            {
                throw new Exception($"PaymentAllocationScheme is null.");
            }

            if (string.IsNullOrEmpty(paymentAllocationScheme.PaymentReference))
            {
                throw new Exception($"PaymentReference is not provided.");
            }

            if (paymentAllocationScheme.PaymentDate == DateTime.MinValue)
            {
                throw new Exception($"Payment Date is not provided.");
            }

            if (paymentAllocationScheme.PaymentAllocationRecords == null)
            {
                throw new Exception($"PaymentAllocationRecords  not provided.");
            }
        }

        public async Task<SchemePaymentAllocationResponse> AllocateSchemePayments(PaymentAllocationScheme paymentAllocationScheme)
        {
            try
            {
                ValidatePaymentAllocationScheme(paymentAllocationScheme);
                var clientApplicationId = RmaIdentity.ClientId;
                var payload = JsonConvert.SerializeObject(paymentAllocationScheme);
                var requestEntity = CreateStagePolicyIntegrationRequestObject(paymentAllocationScheme.ParentPolicyNumber,
                                    paymentAllocationScheme.PaymentReference, payload, PolicyIntegrationRequestMethodTypeEnum.AllocatePayment);
                var stagedRequest = await CreateStageRequest(requestEntity);
                var policyResponse = await AllocateSchemePayments(paymentAllocationScheme, clientApplicationId);

                if (policyResponse != null && stagedRequest != null)
                {
                    stagedRequest.Response = JsonConvert.SerializeObject(policyResponse);
                    stagedRequest.PolicyIntegrationRequestStatusType = policyResponse.IsOperationSuccessFull && policyResponse.PaymentAllocationRecords != null ?
                                                                        PolicyIntegrationRequestStatusTypeEnum.Success
                                                                        : PolicyIntegrationRequestStatusTypeEnum.New;
                    _ = await UpdateStagedRequest(stagedRequest);
                }

                return policyResponse;
            }
            catch (Exception ex)
            {
                ex.LogException($"{nameof(AllocateSchemePayments)}: exception.", paymentAllocationScheme);
                return new SchemePaymentAllocationResponse
                {
                    IsOperationSuccessFull = false,
                    PaymentAllocationRecords = paymentAllocationScheme?.PaymentAllocationRecords,
                    ResponseMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message
                };
            }
        }

        private async Task<SchemePaymentAllocationResponse> AllocateSchemePayments(PaymentAllocationScheme paymentAllocationScheme, string clientApplicationId)
        {
            Contract.Requires(paymentAllocationScheme != null);
            try
            {
                await CheckIfClientApplicationHasAcesstoPolicy(paymentAllocationScheme?.ParentPolicyNumber, clientApplicationId);
                var policy = await GetPolicyByPolicyNumber(paymentAllocationScheme.ParentPolicyNumber);
                var paymentTransactions = await _transactionService.GetPaymentTransactionsByRoleplayerIdBankStatementReference(policy.PolicyOwnerId, paymentAllocationScheme.PaymentReference.Trim());
                var paymentTransaction = paymentTransactions.FirstOrDefault(x => x.TransactionType == TransactionTypeEnum.Payment && x.TransactionDate == paymentAllocationScheme.PaymentDate);

                if (paymentTransaction == null)
                {
                    paymentTransaction = paymentTransactions.FirstOrDefault(x => x.TransactionType == TransactionTypeEnum.Payment && x.TransactionDate >= paymentAllocationScheme.PaymentDate);

                    if (paymentTransaction == null)
                    {
                        paymentTransaction = paymentTransactions.FirstOrDefault(x => x.TransactionType == TransactionTypeEnum.Payment && x.TransactionDate <= paymentAllocationScheme.PaymentDate);


                        if (paymentTransaction == null)
                        {
                            return new SchemePaymentAllocationResponse
                            {
                                IsOperationSuccessFull = true,
                                ResponseMessage = "Payment listing received successfully. Allocations will be processed once payment has been received."
                            };
                        }
                    }
                }

                paymentAllocationScheme.TransactionId = paymentTransaction.TransactionId;
                var allocationResults = await _premiumListingService.UploadPremiumPaymentsLinking(paymentAllocationScheme);

                return new SchemePaymentAllocationResponse { IsOperationSuccessFull = true, PaymentAllocationRecords = allocationResults };
            }
            catch (Exception ex)
            {
                ex.LogException($"{nameof(AllocateSchemePayments)}: exception.", paymentAllocationScheme, clientApplicationId);
                return new SchemePaymentAllocationResponse
                {
                    IsOperationSuccessFull = false,
                    PaymentAllocationRecords = paymentAllocationScheme?.PaymentAllocationRecords,
                    ResponseMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message
                };
            }
        }

        public async Task<SchemePaymentAllocationResponse> AllocateStagedSchemePayments(PaymentAllocationScheme paymentAllocationScheme)
        {
            try
            {
                Contract.Requires(paymentAllocationScheme != null);
                var clientApplicationId = RmaIdentity.ClientId;
                var allocationResults = await _premiumListingService.UploadPremiumPaymentsLinking(paymentAllocationScheme);

                return new SchemePaymentAllocationResponse { IsOperationSuccessFull = true, PaymentAllocationRecords = allocationResults };
            }
            catch (Exception ex)
            {
                ex.LogException($"{nameof(AllocateSchemePayments)}: exception.", paymentAllocationScheme);
                return new SchemePaymentAllocationResponse
                {
                    IsOperationSuccessFull = false,
                    PaymentAllocationRecords = paymentAllocationScheme?.PaymentAllocationRecords,
                    ResponseMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message
                };
            }
        }

        public async Task<List<PaymentAllocationRecord>> GetSchemePaymentAllocationStatus(string parentPolicyNumber,
            DateTime paymentDate)
        {
            var clientApplicationId = RmaIdentity.ClientId;
            await CheckIfClientApplicationHasAcesstoPolicy(parentPolicyNumber, clientApplicationId);

            var childPolicies = await GetChildPoliciesByParentPolicyNumber(parentPolicyNumber);
            var childPolicyIds = childPolicies.Select(x => x.PolicyId).ToList();
            var premiumListings =
                await _transactionService.GetPremiumListingTransactionsByPaymentDate(childPolicyIds, paymentDate);

            var results = (from policy in childPolicies
                           join premiumListing in premiumListings on policy.PolicyId equals premiumListing.PolicyId
                           where premiumListing != null
                           select new PaymentAllocationRecord
                           {
                               PolicyNumber = policy.PolicyNumber,
                               PaymentDate = premiumListing.PaymentDate ?? DateTime.MinValue,
                               Amount = (decimal)premiumListing.PaymentAmount,
                               PaymentStatus = premiumListing.InvoiceStatus.ToString(),
                               InvoiceAmount = premiumListing.InvoiceAmount,
                               InvoiceDate = premiumListing.InvoiceDate,
                               PolicyMonth = premiumListing.InvoiceDate.Value
                           }).ToList();

            return results;
        }

        public async Task<List<PaymentAllocationRecord>> GetPremiumListingTransactionsByInvoiceDate(string parentPolicyNumber,
          DateTime invoiceDate)
        {
            var clientApplicationId = RmaIdentity.ClientId;
            await CheckIfClientApplicationHasAcesstoPolicy(parentPolicyNumber, clientApplicationId);

            var childPolicies = await GetChildPoliciesByParentPolicyNumber(parentPolicyNumber);
            var childPolicyIds = childPolicies.Select(x => x.PolicyId).ToList();
            var premiumListings =
                await _transactionService.GetPremiumListingTransactionsByInvoiceDate(childPolicyIds, invoiceDate);

            var results = (from policy in childPolicies
                           join premiumListing in premiumListings on policy.PolicyId equals premiumListing.PolicyId
                           where premiumListing != null
                           select new PaymentAllocationRecord
                           {
                               PolicyNumber = policy.PolicyNumber,
                               PaymentDate = premiumListing.PaymentDate ?? DateTime.MinValue,
                               Amount = (decimal)premiumListing.PaymentAmount,
                               PaymentStatus = premiumListing.InvoiceStatus.ToString(),
                               InvoiceAmount = premiumListing.InvoiceAmount,
                               InvoiceDate = premiumListing.InvoiceDate
                           }).ToList();

            return results;
        }

        public async Task<List<SchemePaymentCreditTransaction>> GetSchemePaymentCreditTransactions(string parentPolicyNumber)
        {
            var clientApplicationId = RmaIdentity.ClientId;
            await CheckIfClientApplicationHasAcesstoPolicy(parentPolicyNumber, clientApplicationId);
            var paymentTransactions = new List<SchemePaymentCreditTransaction>();

            var policy = await GetPolicyByPolicyNumber(parentPolicyNumber);
            if (policy != null)
            {
                paymentTransactions = await GetCreditTransactionsForRolePlayer(policy.PolicyOwnerId);
            }

            return paymentTransactions;
        }

        private async Task<List<SchemePaymentCreditTransaction>> GetCreditTransactionsForRolePlayer(int rolePlayerId)
        {
            var creditTransactionsForRolePlayer =
                await _transactionService.GetTransactionByRoleplayerIdAndTransactionType(
                   rolePlayerId, TransactionTypeEnum.Payment);

            var paymentTransactions = new List<SchemePaymentCreditTransaction>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                foreach (var creditTransactionForRolePlayer in creditTransactionsForRolePlayer)
                {
                    var totalAmountPaidFromCreditTransaction = await _transactionService.GetTotalAmountPaidToPremiumListingByTransactionId(creditTransactionForRolePlayer.TransactionId);
                    var paymentBalance = decimal.ToDouble(creditTransactionForRolePlayer.Amount) - decimal.ToDouble(totalAmountPaidFromCreditTransaction);
                    creditTransactionForRolePlayer.RunningBalance = (decimal)paymentBalance;

                    var paymentTransaction = new SchemePaymentCreditTransaction
                    {
                        TransactionDate = creditTransactionForRolePlayer.TransactionDate,
                        Amount = creditTransactionForRolePlayer.Amount,
                        TransactionId = creditTransactionForRolePlayer.TransactionId,
                        RunningBalance = creditTransactionForRolePlayer.RunningBalance,
                        RmaReference = creditTransactionForRolePlayer.RmaReference,
                        BankReference = creditTransactionForRolePlayer.BankReference
                    };
                    paymentTransactions.Add(paymentTransaction);
                }
            }

            return paymentTransactions;
        }

        public async Task<PolicyResponse> UpdatePolicyStatus(PolicyMinimumData policyMinimumData)
        {
            Contract.Requires(policyMinimumData != null);
            var clientAppicationId = RmaIdentity.ClientId;
            var payLoad = JsonConvert.SerializeObject(policyMinimumData);
            var requestEntity = CreateStagePolicyIntegrationRequestObject(policyMinimumData.PolicyNumber, "", payLoad, PolicyIntegrationRequestMethodTypeEnum.UpdatePolicyStatus);
            var stagedRequest = await CreateStageRequest(requestEntity);
            var policyResponse = await UpdatePolicyStatus(policyMinimumData, clientAppicationId);
            _ = await UpdateStagePolicyIntegrationRequest(stagedRequest, policyResponse);

            return policyResponse;
        }

        public async Task<PolicyResponse> PolicyStatusAmendment(PolicyMinimumData policyMinimumData)
        {
            Contract.Requires(policyMinimumData != null);
            var clientAppication = RmaIdentity.ClientId;
            var payLoad = JsonConvert.SerializeObject(policyMinimumData);
            var requestEntity = CreateStagePolicyIntegrationRequestObject(policyMinimumData.PolicyNumber, "", payLoad, PolicyIntegrationRequestMethodTypeEnum.UpdatePolicyStatus);
            var stagedRequest = await CreateStageRequest(requestEntity);
            var policyResponse = await ProcessToUpdatePolicyStatus(policyMinimumData, clientAppication);
            _ = await UpdateStagePolicyIntegrationRequest(stagedRequest, policyResponse);

            return policyResponse;
        }

        private async Task<bool> UpdateStagePolicyIntegrationRequest(StagePolicyIntegrationRequest stagedRequest, PolicyResponse policyResponse)
        {
            var results = false;

            if (policyResponse != null && stagedRequest != null)
            {
                stagedRequest.PolicyNumber = string.IsNullOrEmpty(policyResponse.PolicyNumber) ?
                                     stagedRequest.PolicyNumber : policyResponse.PolicyNumber;
                stagedRequest.ClientReference = string.IsNullOrEmpty(policyResponse.ClientReference) ?
                                                stagedRequest.ClientReference : policyResponse.ClientReference;
                stagedRequest.Response = JsonConvert.SerializeObject(policyResponse);
                stagedRequest.PolicyIntegrationRequestStatusType = policyResponse.IsOperationSuccessFull ?
                                                                    PolicyIntegrationRequestStatusTypeEnum.Success
                                                                    : PolicyIntegrationRequestStatusTypeEnum.Error;
                results = await UpdateStagedRequest(stagedRequest);
            }

            return results;
        }

        private StagePolicyIntegrationRequest CreateStagePolicyIntegrationRequestObject(string policyNumber, string reference,
            string payLoad, PolicyIntegrationRequestMethodTypeEnum policyIntegrationRequestMethod)
        {

            return new StagePolicyIntegrationRequest
            {
                ClientReference = reference,
                IterationNumber = 1,
                PartnerName = RmaIdentity.ClientId,
                Payload = payLoad,
                PolicyNumber = policyNumber,
                PolicyIntegrationRequestMethodType = policyIntegrationRequestMethod,
                PolicyIntegrationRequestStatusType = PolicyIntegrationRequestStatusTypeEnum.New,
                IsDeleted = false,
                CreatedBy = RmaIdentity.ClientId,
                ModifiedBy = RmaIdentity.ClientId,
                CreatedDate = DateTimeHelper.SaNow,
                ModifiedDate = DateTimeHelper.SaNow
            };
        }

        private async Task<PolicyResponse> UpdatePolicyStatus(PolicyMinimumData policyMinimumData, string clientAppicationId)
        {
            try
            {
                await CheckIfClientApplicationHasAcesstoPolicy(policyMinimumData.PolicyNumber, clientAppicationId);
                PolicyResponse policyResponse;
                policy_Policy policy;
                using (var scope = _dbContextScopeFactory.Create())
                {
                    policy = await _policyRepository.SingleOrDefaultAsync(p => p.PolicyNumber == policyMinimumData.PolicyNumber);
                    if (policy is null)
                    {
                        throw new Exception($"Could not find policy details for policy number {policyMinimumData.PolicyNumber}");
                    }

                    if (policy.PolicyStatus == policyMinimumData.PolicyStatus)
                    {
                        policyResponse = GetPolicyResponse(
                           true,
                           $"Policy already in status {policy.PolicyStatus.DisplayAttributeValue()}",
                           policy.ClientReference,
                           policy.PolicyNumber,
                           policy.PolicyStatus.DisplayAttributeValue()
                       );

                        return await Task.FromResult(policyResponse);
                    }

                    var statusReason = "Other";

                    if (policyMinimumData.PolicyStatus == PolicyStatusEnum.Cancelled)
                    {
                        policyMinimumData.PolicyStatus = PolicyStatusEnum.PendingCancelled;
                        policy.PolicyStatus = PolicyStatusEnum.PendingCancelled;
                        policy.CancellationDate = policyMinimumData.EffectiveFrom;
                        policy.CancellationInitiatedBy = clientAppicationId;
                        policy.CancellationInitiatedDate = DateTimeHelper.SaNow;
                        policy.PolicyCancelReason = policyMinimumData.policyCancelReasonEnum;
                        policy.LastReinstateDate = null;
                        policy.ReinstateReason = null;

                        if (policyMinimumData.policyCancelReasonEnum != null)
                        {
                            statusReason = policyMinimumData.policyCancelReasonEnum.DisplayAttributeValue();
                        }

                    }
                    else if (policyMinimumData.PolicyStatus == PolicyStatusEnum.Reinstated)
                    {
                        policy.PolicyStatus = PolicyStatusEnum.Reinstated;
                        policy.LastReinstateDate = policyMinimumData.EffectiveFrom;
                        policy.ReinstateReason = policyMinimumData.ReinstateReasonEnum;
                        policy.PolicyCancelReason = null;
                        policy.CancellationDate = null;
                        policy.CancellationInitiatedBy = string.Empty;
                        policy.CancellationInitiatedDate = null;

                        if (policyMinimumData.ReinstateReasonEnum != null)
                        {
                            statusReason = policyMinimumData.ReinstateReasonEnum.DisplayAttributeValue();
                        }
                    }
                    else
                    {
                        policy.PolicyStatus = policyMinimumData.PolicyStatus;
                        policy.PolicyCancelReason = null;
                        policy.CancellationDate = null;
                        policy.CancellationInitiatedBy = string.Empty;
                        policy.CancellationInitiatedDate = null;
                        policy.LastReinstateDate = null;
                        policy.ReinstateReason = null;
                    }

                    policy.ModifiedBy = clientAppicationId;
                    policy.ModifiedDate = DateTimeHelper.SaNow;

                    var policyStatusChangeAudit = new policy_PolicyStatusChangeAudit
                    {
                        PolicyId = policy.PolicyId,
                        RequestedBy = clientAppicationId,
                        RequestedDate = DateTimeHelper.SaNow,
                        EffectiveFrom = policyMinimumData.EffectiveFrom,
                        PolicyStatus = policyMinimumData.PolicyStatus,
                        Reason = statusReason
                    };

                    _policyRepository.Update(policy);
                    _policyStatusChangeAuditRepository.Create(policyStatusChangeAudit);

                    await scope.SaveChangesAsync().ConfigureAwait(false);

                }

                //Regenerate Policy Schedule
                await RegeneratePolicySchedule(policy.PolicyId);

                policyResponse = GetPolicyResponse(
                       true,
                       "Policy status updated successfully",
                       policy.ClientReference,
                       policy.PolicyNumber,
                       policy.PolicyStatus.DisplayAttributeValue()
                   );

                return await Task.FromResult(policyResponse);

            }
            catch (Exception ex)
            {
                ex.LogException($"{nameof(PolicyIntegrationFacade)}: Update policy exception.", policyMinimumData, clientAppicationId);
                return await Task.FromResult(GetPolicyResponse(false, ex.Message, "", policyMinimumData.PolicyNumber));
            }
        }

        private async Task<PolicyResponse> ProcessToUpdatePolicyStatus(PolicyMinimumData policyMinimumData, string clientApplication)
        {
            Contract.Requires(policyMinimumData != null);
            try
            {
                PolicyResponse policyResponse;
                policy_Policy policy;
                using (var scope = _dbContextScopeFactory.Create())
                {
                    policy = await _policyRepository.SingleOrDefaultAsync(p => p.PolicyNumber == policyMinimumData.PolicyNumber);
                    if (policy is null)
                    {
                        throw new Exception($"Could not find policy details for policy number {policyMinimumData.PolicyNumber}");
                    }

                    if (policyMinimumData.PolicyId == 0)
                    {
                        policyMinimumData.PolicyId = policy.PolicyId;
                    }

                    if (policy.PolicyStatus == policyMinimumData.PolicyStatus)
                    {
                        policyResponse = GetPolicyResponse(
                           true,
                           $"Policy already in status {policy.PolicyStatus.DisplayAttributeValue()}",
                           policy.ClientReference,
                           policy.PolicyNumber,
                           policy.PolicyStatus.DisplayAttributeValue()
                       );

                        return await Task.FromResult(policyResponse);
                    }

                    var statusReason = "Other";

                    if (policyMinimumData.PolicyStatus == PolicyStatusEnum.Cancelled)
                    {
                        policyMinimumData.PolicyStatus = PolicyStatusEnum.PendingCancelled;
                        policy.PolicyStatus = PolicyStatusEnum.PendingCancelled;
                        policy.CancellationDate = policyMinimumData.EffectiveFrom;
                        policy.CancellationInitiatedBy = clientApplication;
                        policy.CancellationInitiatedDate = DateTimeHelper.SaNow;
                        policy.PolicyCancelReason = policyMinimumData.policyCancelReasonEnum;
                        policy.LastReinstateDate = null;
                        policy.ReinstateReason = null;

                        if (policyMinimumData.policyCancelReasonEnum != null)
                        {
                            statusReason = policyMinimumData.policyCancelReasonEnum.DisplayAttributeValue();
                        }



                    }
                    else if (policyMinimumData.PolicyStatus == PolicyStatusEnum.Reinstated)
                    {
                        policy.PolicyStatus = PolicyStatusEnum.Reinstated;
                        policy.LastReinstateDate = policyMinimumData.EffectiveFrom;
                        policy.ReinstateReason = policyMinimumData.ReinstateReasonEnum;
                        policy.PolicyCancelReason = null;
                        policy.CancellationDate = null;
                        policy.CancellationInitiatedBy = string.Empty;
                        policy.CancellationInitiatedDate = null;

                        if (policyMinimumData.ReinstateReasonEnum != null)
                        {
                            statusReason = policyMinimumData.ReinstateReasonEnum.DisplayAttributeValue();
                        }
                    }
                    else
                    {
                        policy.PolicyStatus = policyMinimumData.PolicyStatus;
                        policy.PolicyCancelReason = null;
                        policy.CancellationDate = null;
                        policy.CancellationInitiatedBy = string.Empty;
                        policy.CancellationInitiatedDate = null;
                        policy.LastReinstateDate = null;
                        policy.ReinstateReason = null;
                    }

                    policy.ModifiedBy = clientApplication;
                    policy.ModifiedDate = DateTimeHelper.SaNow;

                    var policyStatusChangeAudit = new policy_PolicyStatusChangeAudit
                    {
                        PolicyId = policy.PolicyId,
                        RequestedBy = clientApplication,
                        RequestedDate = DateTimeHelper.SaNow,
                        EffectiveFrom = policyMinimumData.EffectiveFrom,
                        PolicyStatus = policyMinimumData.PolicyStatus,
                        Reason = statusReason
                    };

                    _policyRepository.Update(policy);
                    _policyStatusChangeAuditRepository.Create(policyStatusChangeAudit);

                    await scope.SaveChangesAsync().ConfigureAwait(false);

                }

                if (policyMinimumData.PolicyStatus == PolicyStatusEnum.Cancelled || policyMinimumData.PolicyStatus == PolicyStatusEnum.PendingCancelled)
                {

                    await _generatePolicyDocumentService.CreatePolicyCancellationLetter(policyMinimumData);
                }

                //Regenerate Policy Schedule
                await RegeneratePolicySchedule(policy.PolicyId);

                policyResponse = GetPolicyResponse(
                       true,
                       "Policy status updated successfully",
                       policy.ClientReference,
                       policy.PolicyNumber,
                       policy.PolicyStatus.DisplayAttributeValue()
                   );

                return await Task.FromResult(policyResponse);

            }
            catch (Exception ex)
            {
                ex.LogException($"{nameof(PolicyIntegrationFacade)}: Update policy exception.", policyMinimumData, clientApplication);
                return await Task.FromResult(GetPolicyResponse(false, ex.Message, "", policyMinimumData.PolicyNumber));
            }
        }
        public async Task<List<Contracts.Entities.Policy.Policy>> GetParentPolicies(string query)
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {

                var parentPolicies = await (from parentPolicy in _policyRepository
                                            join childPolicy in _policyRepository on parentPolicy.PolicyId equals childPolicy.ParentPolicyId
                                            join rolePlayer in _rolePlayerRepository on parentPolicy.PolicyOwnerId equals rolePlayer.RolePlayerId
                                            where string.IsNullOrEmpty(query) && parentPolicy.PolicyNumber == parentPolicy.PolicyNumber && rolePlayer.DisplayName == rolePlayer.DisplayName
                                                || (!string.IsNullOrEmpty(query) && (parentPolicy.PolicyNumber == query || rolePlayer.DisplayName.Contains(query)))
                                            select parentPolicy
                                 ).Distinct().ToListAsync();

                foreach (var parentPolicy in parentPolicies)
                {
                    await _policyRepository.LoadAsync(parentPolicy, po => po.ProductOption);
                    await _policyRepository.LoadAsync(parentPolicy, po => po.Brokerage);
                    await _policyRepository.LoadAsync(parentPolicy, po => po.PolicyOwner);
                }

                var parentPoliciesData = Mapper.Map<List<Contracts.Entities.Policy.Policy>>(parentPolicies);
                return parentPoliciesData;
            }
        }

        private async Task<SchemeDeathDetailExternal> ValidateSchemeDeathDetailExternalRequest(SchemeDeathDetailExternal schemeDeathDetailExternal)
        {

            schemeDeathDetailExternal = await ValidateInsuredLifeSchemeDeathDetailExternalRequest(schemeDeathDetailExternal);

            return schemeDeathDetailExternal;

        }

        private async Task<SchemeDeathDetailExternal> ValidateClaimantSchemeDeathDetailExternalRequest(SchemeDeathDetailExternal schemeDeathDetailExternal)
        {

            return schemeDeathDetailExternal;
        }

        private async Task<SchemeDeathDetailExternal> ValidateInsuredLifeSchemeDeathDetailExternalRequest(SchemeDeathDetailExternal schemeDeathDetailExternal)
        {

            if (string.IsNullOrEmpty(schemeDeathDetailExternal.PolicyNumber))
            {
                throw new ArgumentNullException($"{nameof(schemeDeathDetailExternal.PolicyNumber)} is not provided.");
            }

            var deathTpeList = typeof(DeathTypeEnum).ToLookupList().Select(x => x.Name).ToList();

            if (!deathTpeList.Contains(schemeDeathDetailExternal.DeathType))
            {
                throw new ArgumentNullException($"{nameof(schemeDeathDetailExternal.DeathType)} is not provided/ not valid. Possible values are {string.Join(",", deathTpeList)}.");
            }

            if (string.IsNullOrEmpty(schemeDeathDetailExternal.DhaReferenceNo))
            {
                throw new ArgumentNullException($"{nameof(schemeDeathDetailExternal.DhaReferenceNo)} is not provided.");
            }


            if (string.IsNullOrEmpty(schemeDeathDetailExternal.HomeAffairsRegion))
            {
                throw new ArgumentNullException($"{nameof(schemeDeathDetailExternal.HomeAffairsRegion)} is not provided.");
            }

            if (string.IsNullOrEmpty(schemeDeathDetailExternal.PlaceOfDeath))
            {
                throw new ArgumentNullException($"{nameof(schemeDeathDetailExternal.PlaceOfDeath)} is not provided.");
            }

            if (string.IsNullOrEmpty(schemeDeathDetailExternal.CauseOfDeathDescription))
            {
                throw new ArgumentNullException($"{nameof(schemeDeathDetailExternal.CauseOfDeathDescription)} is not provided.");
            }

            var peopleInsuredOnPolicy = await GetPolicyInsuredLives(schemeDeathDetailExternal.PolicyNumber);

            if (peopleInsuredOnPolicy == null)
            {
                throw new ArgumentNullException($"{nameof(schemeDeathDetailExternal.PolicyNumber)} {schemeDeathDetailExternal.PolicyNumber} has no active insured lives.");
            }

            if (schemeDeathDetailExternal.InsuredLife == null)
            {
                throw new ArgumentNullException($"{nameof(schemeDeathDetailExternal.InsuredLife)} is not provided.");
            }

            if (schemeDeathDetailExternal.InsuredLife == null)
            {
                throw new ArgumentNullException($"{nameof(schemeDeathDetailExternal.InsuredLife)} is not provided.");
            }


            var insuredLife = peopleInsuredOnPolicy.FirstOrDefault(x => x.IdNumber == schemeDeathDetailExternal.InsuredLife.IdNumber
                            || x.PassportNumber == schemeDeathDetailExternal.InsuredLife.PassportNumber);

            schemeDeathDetailExternal.InsuredLife.RolePlayerId = insuredLife != null
                ? insuredLife.RolePlayerId
                : throw new ArgumentNullException($"Deceased person {schemeDeathDetailExternal.InsuredLife.FirstName} {schemeDeathDetailExternal.InsuredLife.Surname} is not insured on policy {schemeDeathDetailExternal.PolicyNumber}.");

            var claimant = peopleInsuredOnPolicy.FirstOrDefault(x => x.IdNumber == schemeDeathDetailExternal.Claimant.IdNumber
                            || x.PassportNumber == schemeDeathDetailExternal.Claimant.PassportNumber);

            if (claimant != null)
            {
                schemeDeathDetailExternal.Claimant.RolePlayerId = claimant.RolePlayerId;

            }

            var informant = peopleInsuredOnPolicy.FirstOrDefault(x => x.IdNumber == schemeDeathDetailExternal.Informant.IdNumber
                            || x.PassportNumber == schemeDeathDetailExternal.Informant.PassportNumber);

            if (informant != null)
            {
                schemeDeathDetailExternal.Informant.RolePlayerId = informant.RolePlayerId;
            }




            return schemeDeathDetailExternal;
        }

        public async Task<List<Person>> GetPolicyInsuredLives(string policyNumber)
        {
            var activeInsuredLiveStatuses = new List<InsuredLifeStatusEnum> { InsuredLifeStatusEnum.Active, InsuredLifeStatusEnum.PremiumWaived };

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await (from policy in _policyRepository.Where(x => x.PolicyNumber == policyNumber)
                                     join policyLives in _policyInsuredLifeRepository on policy.PolicyId equals policyLives.PolicyId
                                     join person in _personRepository on policyLives.RolePlayerId equals person.RolePlayerId
                                     where activeInsuredLiveStatuses.Contains(policyLives.InsuredLifeStatus)
                                     select person).ToListAsync();
                return Mapper.Map<List<Person>>(results);
            }
        }

        private async Task<int> CreateStillBornRolePlayer(Contracts.Entities.Policy.Policy policy, Person stillBornDetail)
        {
            Contract.Requires(policy != null);
            Contract.Requires(stillBornDetail != null);
            stillBornDetail.IdNumber = "0000000000000";
            stillBornDetail.IsAlive = false;
            stillBornDetail.IdType = IdTypeEnum.SAIDDocument;

            var stillBornRolePlayer = new RMA.Service.ClientCare.Contracts.Entities.RolePlayer.RolePlayer
            {
                Person = stillBornDetail,
                RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person,
                DisplayName = $"{stillBornDetail.FirstName} {stillBornDetail.Surname}",
            };

            var stillBornRolePlayerId = await _rolePlayerService.CreateRolePlayer(stillBornRolePlayer);
            await AddRolePlayerRelationToMainMember(policy.PolicyId, stillBornRolePlayerId, RolePlayerTypeEnum.Child);

            return stillBornRolePlayerId;
        }


        private async Task AddRolePlayerRelationToMainMember(int policyId, int fromRolePlayerPlayerId, RolePlayerTypeEnum rolePlayerTypeEnum, int? allocationPercentage = null)
        {
            var rolePlayerRelation = await _rolePlayerService.GetMainMemberByPolicyId(policyId);
            var mainMemberIdRolePlayerId = rolePlayerRelation.ToRolePlayerId;

            var stillBornRolePlayerRelation = new RolePlayerRelation
            {
                FromRolePlayerId = fromRolePlayerPlayerId,
                ToRolePlayerId = mainMemberIdRolePlayerId,
                PolicyId = policyId,
                RolePlayerTypeId = (int)rolePlayerTypeEnum,
                AllocationPercentage = allocationPercentage

            };
            await _rolePlayerService.AddRolePlayerRelation(stillBornRolePlayerRelation);
        }

        private async Task<SchemeDeathDetailExternal> CreateSchemeDeathDetailRolePlayers(SchemeDeathDetailExternal schemeDeathDetail)
        {
            Contract.Assert(schemeDeathDetail != null);
            var deathTypeConverted = Enum.TryParse(schemeDeathDetail.DeathType, out DeathTypeEnum deathType);
            var policy = await GetPolicyByPolicyNumber(schemeDeathDetail.PolicyNumber);

            if (deathTypeConverted && deathType == DeathTypeEnum.Stillborn)
            {
                var result = await _policyService.GetStillbornBenefitByPolicyId(policy.PolicyId);
                if (result <= 0)
                {
                    throw new ArgumentNullException($"Policy {schemeDeathDetail.PolicyNumber} has no stillborn benefits.");
                }

                schemeDeathDetail.InsuredLife.RolePlayerId = await CreateStillBornRolePlayer(policy, schemeDeathDetail.InsuredLife);
            }
            else
            {
                var insuredPersonIdNumber = string.IsNullOrEmpty(schemeDeathDetail.InsuredLife.IdNumber) ? schemeDeathDetail.InsuredLife.PassportNumber : schemeDeathDetail.InsuredLife.IdNumber;
                var insuredPersonRolePlayer = await _rolePlayerService.SearchRolePlayerByRegistrationNumber(KeyRoleEnum.InsuredLife, insuredPersonIdNumber);
                if (insuredPersonRolePlayer == null)
                {
                    throw new ArgumentNullException($"Deceased with idNumber/Passport {insuredPersonIdNumber} not found in the system.");
                }

                var policyInsuredLive = policy.PolicyInsuredLives.FirstOrDefault(x => x.RolePlayerId == insuredPersonRolePlayer.RolePlayerId &&
                                    (x.InsuredLifeStatus == InsuredLifeStatusEnum.Active || x.InsuredLifeStatus == InsuredLifeStatusEnum.PremiumWaived));

                if (policyInsuredLive == null)
                {
                    throw new ArgumentNullException($"Deceased with idNumber/Passport {insuredPersonIdNumber} is not insured on the policy {schemeDeathDetail.PolicyNumber}.");
                }

                schemeDeathDetail.InsuredLife.RolePlayerId = policyInsuredLive.RolePlayerId;
            }

            var claimantPersonIdNumber = string.IsNullOrEmpty(schemeDeathDetail.Claimant.IdNumber) ? schemeDeathDetail.Claimant.PassportNumber : schemeDeathDetail.Claimant.IdNumber;
            var claimantRolePlayer = await _rolePlayerService.SearchRolePlayerByRegistrationNumber(KeyRoleEnum.InsuredLife, claimantPersonIdNumber);

            if (claimantRolePlayer != null & claimantRolePlayer.RolePlayerId > 0)
            {
                var policyRelation = policy.RolePlayerRelations.FirstOrDefault(x => x.FromRolePlayerId == claimantRolePlayer.RolePlayerId || x.ToRolePlayerId == claimantRolePlayer.RolePlayerId);

                if (policyRelation == null)
                {
                    await AddRolePlayerRelationToMainMember(policy.PolicyId, claimantRolePlayer.RolePlayerId, RolePlayerTypeEnum.Claimant);
                }

                schemeDeathDetail.Claimant.RolePlayerId = claimantRolePlayer.RolePlayerId;
            }
            else
            {
                var newClaimantRolePlayer = new RMA.Service.ClientCare.Contracts.Entities.RolePlayer.RolePlayer
                {
                    Claimant = schemeDeathDetail.Claimant,
                    CellNumber = schemeDeathDetail.Claimant.ContactNumber,
                    RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person,
                    Person = new Person
                    {
                        FirstName = schemeDeathDetail.Claimant.FirstName,
                        Surname = schemeDeathDetail.Claimant.LastName,
                        DateOfBirth = schemeDeathDetail.Claimant.DateOfBirth,
                        IdNumber = string.IsNullOrEmpty(schemeDeathDetail.Claimant.IdNumber) ?
                               schemeDeathDetail.Claimant.PassportNumber : schemeDeathDetail.Claimant.IdNumber,
                        IdType = string.IsNullOrEmpty(schemeDeathDetail.Claimant.IdNumber) ? IdTypeEnum.PassportDocument : IdTypeEnum.SAIDDocument,
                        IsAlive = true,
                    },
                };
                var claimantRolePlayerId = await CreateNewRolePlayers(policy, newClaimantRolePlayer, RolePlayerTypeEnum.Beneficiary);
                schemeDeathDetail.Claimant.RolePlayerId = claimantRolePlayerId;
            }

            var informantPersonIdNumber = string.IsNullOrEmpty(schemeDeathDetail.Informant.IdNumber) ? schemeDeathDetail.Informant.PassportNumber : schemeDeathDetail.Informant.IdNumber;
            var informantRolePlayer = await _rolePlayerService.SearchRolePlayerByRegistrationNumber(KeyRoleEnum.InsuredLife, informantPersonIdNumber);

            if (informantRolePlayer != null & informantRolePlayer.RolePlayerId > 0)
            {
                var policyRelation = policy.RolePlayerRelations.FirstOrDefault(x => x.FromRolePlayerId == informantRolePlayer.RolePlayerId || x.ToRolePlayerId == informantRolePlayer.RolePlayerId);

                if (policyRelation == null)
                {
                    await AddRolePlayerRelationToMainMember(policy.PolicyId, informantRolePlayer.RolePlayerId, RolePlayerTypeEnum.Beneficiary);
                }

                schemeDeathDetail.Informant.RolePlayerId = informantRolePlayer.RolePlayerId;


            }
            else
            {
                var newInformantRolePlayer = new RMA.Service.ClientCare.Contracts.Entities.RolePlayer.RolePlayer
                {
                    Informant = schemeDeathDetail.Informant,
                    RolePlayerId = schemeDeathDetail.Informant.RolePlayerId,
                    Person = new Person
                    {
                        FirstName = schemeDeathDetail.Informant.FirstName,
                        Surname = schemeDeathDetail.Informant.LastName,
                        DateOfBirth = schemeDeathDetail.Informant.DateOfBirth,
                        IdNumber = string.IsNullOrEmpty(schemeDeathDetail.Informant.IdNumber) ?
                               schemeDeathDetail.Informant.PassportNumber : schemeDeathDetail.Informant.IdNumber,
                        IdType = string.IsNullOrEmpty(schemeDeathDetail.Informant.IdNumber) ? IdTypeEnum.PassportDocument : IdTypeEnum.SAIDDocument,
                        IsAlive = true
                    },

                };
                int? allocationPercentage = (int)schemeDeathDetail.beneficiaryBankingDetail.AllocationPercentage;
                var claimantRolePlayerId = await CreateNewRolePlayers(policy, newInformantRolePlayer, RolePlayerTypeEnum.Beneficiary, allocationPercentage);
                schemeDeathDetail.Informant.RolePlayerId = claimantRolePlayerId;

                if (schemeDeathDetail.beneficiaryBankingDetail != null)
                {
                    var beneficiarybankDetails = await _rolePlayerService.GetBankingDetailsByRolePlayerId(schemeDeathDetail.Informant.RolePlayerId);
                    if (beneficiarybankDetails != null)
                    {
                        var bankBeneficiaryDetails = beneficiarybankDetails.FirstOrDefault(x => x.AccountHolderIdNumber == schemeDeathDetail.beneficiaryBankingDetail.BankAccount.AccountNumber && x.BankName == schemeDeathDetail.beneficiaryBankingDetail.BankAccount.BankName);


                        var rolePlayerBankDetails = new RolePlayerBankingDetail
                        {
                            RolePlayerId = schemeDeathDetail.Informant.RolePlayerId,
                            AccountHolderName = schemeDeathDetail.beneficiaryBankingDetail.Firstname,
                            AccountHolderIdNumber = schemeDeathDetail.beneficiaryBankingDetail.IdNumber,
                            AccountNumber = schemeDeathDetail.beneficiaryBankingDetail.BankAccount.AccountNumber,
                            BankAccountType = BankAccountTypeEnum.SavingsAccount,
                            BankBranchId = schemeDeathDetail.beneficiaryBankingDetail.BankAccount.BankBranchId,
                            BranchCode = schemeDeathDetail.beneficiaryBankingDetail.BankAccount.BankBranchNumber,
                            Reason = "New Account Created by MI API ",
                            Initials = !string.IsNullOrWhiteSpace(schemeDeathDetail.beneficiaryBankingDetail.Firstname) ? string.Concat(schemeDeathDetail.beneficiaryBankingDetail.Firstname.Split(' ').Select(z => z.Substring(0, 1))).ToUpperInvariant()
                        : "",
                        };
                        await _rolePlayerService.AddBankingDetails(rolePlayerBankDetails);
                    }
                }
                else
                {
                    var rolePlayerBankDetails = new RolePlayerBankingDetail
                    {
                        RolePlayerId = schemeDeathDetail.Informant.RolePlayerId,
                        AccountHolderName = schemeDeathDetail.beneficiaryBankingDetail.Firstname,
                        AccountHolderIdNumber = schemeDeathDetail.beneficiaryBankingDetail.IdNumber,
                        AccountNumber = schemeDeathDetail.beneficiaryBankingDetail.BankAccount.AccountNumber,
                        BankAccountType = BankAccountTypeEnum.SavingsAccount,
                        BankBranchId = schemeDeathDetail.beneficiaryBankingDetail.BankAccount.BankBranchId,
                        BranchCode = schemeDeathDetail.beneficiaryBankingDetail.BankAccount.BankBranchNumber,
                        Reason = "New Account Created by MI API ",
                        Initials = !string.IsNullOrWhiteSpace(schemeDeathDetail.beneficiaryBankingDetail.Firstname) ? string.Concat(schemeDeathDetail.beneficiaryBankingDetail.Firstname.Split(' ').Select(z => z.Substring(0, 1))).ToUpperInvariant()
                   : "",
                    };
                    await _rolePlayerService.AddBankingDetails(rolePlayerBankDetails);
                }




            }
            return schemeDeathDetail;
        }

        private async Task<int> CreateNewRolePlayers(Contracts.Entities.Policy.Policy policy, RMA.Service.ClientCare.Contracts.Entities.RolePlayer.RolePlayer rolePlayer, RolePlayerTypeEnum rolePlayerTypeEnum, int? allocationPercentage = null)
        {
            Contract.Requires(policy!= null);
            var newRolePlayerId = await _rolePlayerService.CreateRolePlayer(rolePlayer);
            await AddRolePlayerRelationToMainMember(policy.PolicyId, newRolePlayerId, rolePlayerTypeEnum);
            return newRolePlayerId;
        }

        public async Task<SchemeDeathRegistrationResult> CreateEventForDeathClaim(SchemeDeathDetailExternal schemeDeathDetail)
        {
            Contract.Requires(schemeDeathDetail != null);
            var payload = JsonConvert.SerializeObject(schemeDeathDetail);
            var requestEntity = CreateStagePolicyIntegrationRequestObject(schemeDeathDetail.PolicyNumber, schemeDeathDetail.PolicyNumber, payload, PolicyIntegrationRequestMethodTypeEnum.RegisterClaim);
            var stagedRequest = await CreateStageRequest(requestEntity);


            var policyResponse = new SchemeDeathRegistrationResult
            {
                PolicyNumber = schemeDeathDetail.PolicyNumber,
                IsOperationSuccessFull = true,
                ResponseMessage = "A request to create a claim has been received successfully."
            };

            var policyData = new PolicyResponse
            {
                PolicyNumber = policyResponse.PolicyNumber,
                ClientReference = policyResponse.PolicyNumber,
                IsOperationSuccessFull = false,
                ResponseMessage = JsonConvert.SerializeObject(policyResponse),
                PolicyStatus = ""
            };
            _ = await UpdateStagePolicyIntegrationRequest(stagedRequest, policyData);
            return policyResponse;

        }


        private async Task<SchemeDeathRegistrationResult> CreateEventForDeathClaimInternal(SchemeDeathDetailExternal schemeDeathDetail)
        {
            try
            {

                if (schemeDeathDetail == null)
                {
                    throw new ArgumentNullException(nameof(schemeDeathDetail));
                }


                schemeDeathDetail = await ValidateSchemeDeathDetailExternalRequest(schemeDeathDetail);
                schemeDeathDetail = await CreateSchemeDeathDetailRolePlayers(schemeDeathDetail);

                var causeOfDeathConverted = Enum.TryParse(schemeDeathDetail.CauseOfDeath, out DiseaseTypeEnum causeOfDeath);
                var deathTypeConverted = Enum.TryParse(schemeDeathDetail.DeathType, out DeathTypeEnum deathType);

                var eventEntity = new Event
                {
                    Description = "Funeral/Death claim",
                    EventType = EventTypeEnum.Death,
                    EventStatus = EventStatusEnum.Notified,
                    DateAdvised = DateTimeHelper.SaNow,
                    EventDate = schemeDeathDetail.InsuredLife.DateOfDeath.HasValue ?
                                schemeDeathDetail.InsuredLife.DateOfDeath.Value : DateTimeHelper.SaNow,
                    AdviseMethod = AdviseMethodEnum.Other,
                    PersonEvents = new List<ClaimCare.Contracts.Entities.PersonEvent>
                {
                   new ClaimCare.Contracts.Entities.PersonEvent
                   {
                        InsuredLifeId = schemeDeathDetail.InsuredLife.RolePlayerId,
                        ClaimantId = schemeDeathDetail.Claimant.RolePlayerId,
                        InformantId = schemeDeathDetail.Informant.RolePlayerId,
                        PersonEventBucketClassId = 1,
                        DateReceived = DateTimeHelper.SaNow,
                        DateCaptured = DateTimeHelper.SaNow,
                        CapturedByUserId = 1,
                        SendBrokerEmail = schemeDeathDetail.SendBrokerEmail,
                        PersonEventStatus = PersonEventStatusEnum.Unknown,
                        CreatedDate = DateTimeHelper.SaNow,
                        CreatedBy=RmaIdentity.Username,
                        ModifiedBy=RmaIdentity.Username,
                        anyEligiblePolicies = false,
                        ClaimType = ClaimTypeEnum.Funeral,
                        DateSubmitted = DateTimeHelper.SaNow,
                        PolicyIds = new List<int>{ },
                        PersonEventDeathDetail = new PersonEventDeathDetail()
                         {
                            InterviewWithFamilyMember = schemeDeathDetail.InterviewWithFamilyMember,
                            OpinionOfMedicalPractitioner = schemeDeathDetail.OpinionOfMedicalPractitioner,
                            DeathType =  deathTypeConverted? deathType : DeathTypeEnum.Default,
                            DeathDate =schemeDeathDetail.InsuredLife.DateOfDeath.HasValue?
                                            schemeDeathDetail.InsuredLife.DateOfDeath.Value :DateTimeHelper.SaNow,
                            DeathTypeId =  deathTypeConverted? (int)deathType : (int) DeathTypeEnum.Default  ,
                            BodyCollectionDate = schemeDeathDetail.BodyCollector.CollectionOfBodyDate,
                            BodyNumber =  schemeDeathDetail.ForensicPathologist.BodyNumber,
                            CauseOfDeath =  causeOfDeathConverted?  (int)causeOfDeath: (int)DiseaseTypeEnum.Unknown,
                            DateOfPostmortem = schemeDeathDetail.ForensicPathologist.DateOfPostMortem.HasValue?
                                               schemeDeathDetail.ForensicPathologist.DateOfPostMortem.Value.ToString(): null,
                            CauseOfDeathDescription = schemeDeathDetail.CauseOfDeathDescription,
                            DhaReferenceNo = schemeDeathDetail.DhaReferenceNo,
                            DeathCertificateNo = schemeDeathDetail.DeathCertificateNo,
                            HomeAffairsRegion = schemeDeathDetail.HomeAffairsRegion,
                            PostMortemNumber = schemeDeathDetail.ForensicPathologist.PostMortemNumber,
                            SapCaseNumber = schemeDeathDetail.ForensicPathologist.SapCaseNumber,
                            PlaceOfDeath = schemeDeathDetail.PlaceOfDeath,
                       },
                   }
                },

                };

                var eventId = await _eventService.AddEventDetails(eventEntity).ConfigureAwait(false);
                var personEventReferenceNumber = 0;
                if (eventId > 0)
                {
                    var funeralClaimWizard = await CreateFuneralClaimWizard(eventId);
                    eventEntity.WizardId = funeralClaimWizard.Id;
                    await _eventService.UpdateEvent(eventEntity);
                    personEventReferenceNumber = await AddFuneralRolePlayersToPersonEvent(funeralClaimWizard, schemeDeathDetail);
                }

                if (schemeDeathDetail.deathClaimAttachments != null)
                {
                    await UploadDeathDocument(schemeDeathDetail.deathClaimAttachments, schemeDeathDetail.PolicyNumber);
                }

                var policyResponse = new SchemeDeathRegistrationResult
                {
                    RegistrationReferenceNumber = personEventReferenceNumber.ToString(),
                    PolicyNumber = schemeDeathDetail.PolicyNumber,
                    IsOperationSuccessFull = personEventReferenceNumber > 0,
                    ResponseMessage = "Claim created successfully."
                };

                return policyResponse;

            }
            catch (Exception ex)
            {
                ex.LogException($"{nameof(PolicyIntegrationFacade)}: Create event for death claim exception. PolicyData : {ex.InnerException.Message}", schemeDeathDetail);

                return new SchemeDeathRegistrationResult
                {
                    IsOperationSuccessFull = false,
                    PolicyNumber = schemeDeathDetail.PolicyNumber,
                    ResponseMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message
                };
            }
        }

        private async Task<Wizard> CreateFuneralClaimWizard(int eventId)
        {
            var startWizardRequest = new StartWizardRequest
            {
                LinkedItemId = eventId,
                Type = "register-funeral-claim",
                RequestInitiatedByBackgroundProcess = true,
                Data = _serializer.Serialize(new StartWizardRequest())
            };

            var wizard = await _wizardService.StartWizard(startWizardRequest);
            return wizard;
        }

        private async Task<int> AddFuneralRolePlayersToPersonEvent(Wizard wizard, SchemeDeathDetailExternal schemeDeathDetail)
        {
            Contract.Requires(wizard != null);
            Contract.Requires(schemeDeathDetail != null);
            var stepData = JsonConvert.DeserializeObject<ArrayList>(wizard.Data);
            var personEventDetails = JsonConvert.DeserializeObject<RMA.Service.ClaimCare.Contracts.Entities.PersonEvent>(stepData[0].ToString());

            foreach (var rolePlayer in personEventDetails.RolePlayers)
            {
                var values = EnumHelper.ToList<KeyRoleEnum>();

                if (rolePlayer.KeyRoleType == KeyRoleEnum.Informant.DisplayDescriptionAttributeValue())
                {
                    rolePlayer.Informant = schemeDeathDetail.Informant;
                    rolePlayer.RolePlayerId = schemeDeathDetail.Informant.RolePlayerId;
                    rolePlayer.Person = new Person
                    {
                        FirstName = schemeDeathDetail.Informant.FirstName,
                        Surname = schemeDeathDetail.Informant.LastName,
                        DateOfBirth = schemeDeathDetail.Informant.DateOfBirth,
                        IdNumber = string.IsNullOrEmpty(schemeDeathDetail.Informant.IdNumber) ?
                                   schemeDeathDetail.Informant.PassportNumber : schemeDeathDetail.Informant.IdNumber,
                        IdType = string.IsNullOrEmpty(schemeDeathDetail.Informant.IdNumber) ? IdTypeEnum.PassportDocument : IdTypeEnum.SAIDDocument,
                        IsAlive = true,
                    };
                }

                if (rolePlayer.KeyRoleType == KeyRoleEnum.FuneralParlor.DisplayDescriptionAttributeValue())
                {
                    rolePlayer.FuneralParlor = schemeDeathDetail.FuneralParlor;
                    rolePlayer.RolePlayerId = schemeDeathDetail.FuneralParlor.RolePlayerId;
                    rolePlayer.Person = new Person
                    {
                        FirstName = schemeDeathDetail.FuneralParlor.FuneralParlorName,
                        Surname = schemeDeathDetail.FuneralParlor.FuneralParlorName,
                        DateOfBirth = DateTimeHelper.SaNow,
                        IdNumber = schemeDeathDetail.FuneralParlor.RegistrationNumber,
                        IdType = IdTypeEnum.PassportDocument,
                        IsAlive = true,
                    };
                }

                if (rolePlayer.KeyRoleType == KeyRoleEnum.InsuredLife.DisplayDescriptionAttributeValue())
                {
                    rolePlayer.Person = schemeDeathDetail.InsuredLife;
                    rolePlayer.RolePlayerId = schemeDeathDetail.InsuredLife.RolePlayerId;
                }

                if (rolePlayer.KeyRoleType == KeyRoleEnum.Claimant.DisplayDescriptionAttributeValue())
                {
                    rolePlayer.Claimant = schemeDeathDetail.Claimant;
                    rolePlayer.RolePlayerId = schemeDeathDetail.Claimant.RolePlayerId;
                    rolePlayer.Person = new Person
                    {
                        FirstName = schemeDeathDetail.Claimant.FirstName,
                        Surname = schemeDeathDetail.Claimant.LastName,
                        DateOfBirth = schemeDeathDetail.Claimant.DateOfBirth,
                        IdNumber = string.IsNullOrEmpty(schemeDeathDetail.Claimant.IdNumber) ?
                                   schemeDeathDetail.Claimant.PassportNumber : schemeDeathDetail.Claimant.IdNumber,
                        IdType = string.IsNullOrEmpty(schemeDeathDetail.Claimant.IdNumber) ? IdTypeEnum.PassportDocument : IdTypeEnum.SAIDDocument,
                        IsAlive = true,
                    };
                }

                if (rolePlayer.KeyRoleType == KeyRoleEnum.Undertaker.DisplayDescriptionAttributeValue())
                {
                    rolePlayer.Undertaker = schemeDeathDetail.Undertaker;
                    rolePlayer.RolePlayerId = schemeDeathDetail.Undertaker.RolePlayerId;
                    rolePlayer.DisplayName = rolePlayer.Undertaker.FirstName + rolePlayer.Undertaker.LastName;
                    rolePlayer.CellNumber = rolePlayer.Undertaker.ContactNumber;
                    rolePlayer.Person = new Person
                    {
                        FirstName = schemeDeathDetail.Undertaker.FirstName,
                        Surname = schemeDeathDetail.Undertaker.LastName,
                        DateOfBirth = schemeDeathDetail.Undertaker.DateOfBirth.HasValue ? schemeDeathDetail.Undertaker.DateOfBirth.Value : DateTimeHelper.SaNow,
                        IdNumber = string.IsNullOrEmpty(schemeDeathDetail.Undertaker.IdNumber) ?
                                   schemeDeathDetail.Undertaker.PassportNumber : schemeDeathDetail.Undertaker.IdNumber,
                        IdType = string.IsNullOrEmpty(schemeDeathDetail.Undertaker.IdNumber) ? IdTypeEnum.PassportDocument : IdTypeEnum.SAIDDocument,
                        IsAlive = true,
                    };
                }

                if (rolePlayer.KeyRoleType == KeyRoleEnum.BodyCollector.DisplayDescriptionAttributeValue())
                {
                    rolePlayer.BodyCollector = schemeDeathDetail.BodyCollector;
                    rolePlayer.RolePlayerId = schemeDeathDetail.BodyCollector.RolePlayerId;
                    rolePlayer.TellNumber = schemeDeathDetail.BodyCollector.ContactNumber;
                    rolePlayer.Person = new Person
                    {
                        FirstName = schemeDeathDetail.BodyCollector.FirstName,
                        Surname = schemeDeathDetail.BodyCollector.LastName,
                        DateOfBirth = schemeDeathDetail.BodyCollector.DateOfBirth.HasValue ? schemeDeathDetail.BodyCollector.DateOfBirth.Value : DateTimeHelper.SaNow,
                        IdNumber = string.IsNullOrEmpty(schemeDeathDetail.BodyCollector.IdNumber) ?
                                   schemeDeathDetail.BodyCollector.PassportNumber : schemeDeathDetail.BodyCollector.IdNumber,
                        IdType = string.IsNullOrEmpty(schemeDeathDetail.BodyCollector.IdNumber) ? IdTypeEnum.PassportDocument : IdTypeEnum.SAIDDocument,
                        IsAlive = true,
                    };
                }

                if (rolePlayer.KeyRoleType == KeyRoleEnum.MedicalServiceProvider.DisplayDescriptionAttributeValue())
                {
                    rolePlayer.HealthCareProvider = schemeDeathDetail.HealthCareProvider;
                    rolePlayer.RolePlayerId = schemeDeathDetail.HealthCareProvider.RolePlayerId;
                    rolePlayer.Person = new Person
                    {
                        FirstName = schemeDeathDetail.HealthCareProvider.Name,
                        Surname = schemeDeathDetail.HealthCareProvider.Name,//Used name as there is No Surname field in HealthCareProvider
                        DateOfBirth = schemeDeathDetail.HealthCareProvider.DatePracticeStarted != null ? (DateTime)schemeDeathDetail.HealthCareProvider.DatePracticeStarted : DateTime.MinValue,
                        IdNumber = schemeDeathDetail.HealthCareProvider.PracticeNumber,
                        IdType = IdTypeEnum.PassportDocument,
                        IsAlive = true,
                    };
                }

                if (rolePlayer.KeyRoleType == KeyRoleEnum.ForensicPathologist.DisplayDescriptionAttributeValue())
                {
                    rolePlayer.ForensicPathologist = schemeDeathDetail.ForensicPathologist;
                    rolePlayer.RolePlayerId = schemeDeathDetail.ForensicPathologist.RolePlayerId;
                    rolePlayer.Person = new Person
                    {
                        FirstName = schemeDeathDetail.ForensicPathologist.FirstName,
                        Surname = schemeDeathDetail.ForensicPathologist.LastName,
                        DateOfBirth = DateTimeHelper.SaNow,
                        IdNumber = schemeDeathDetail.ForensicPathologist.RegistrationNumber,
                        IdType = IdTypeEnum.PassportDocument,
                        IsAlive = true,
                    };
                }


            }

            var arrayList = new ArrayList
            {
                personEventDetails
            };

            var saveWizardRequest = new SaveWizardRequest
            {
                CurrentStep = 0,
                WizardId = wizard.Id,
                WizardName = wizard.Name,
                Data = _serializer.Serialize(arrayList)
            };

            await _wizardService.SaveWizard(saveWizardRequest);
            await _eventService.UpdatePersonEventDetails(personEventDetails);
            await _eventService.UpdatePersonEventDeathDetail(personEventDetails.PersonEventDeathDetail);
            var personEvents = new List<RMA.Service.ClaimCare.Contracts.Entities.PersonEvent> { personEventDetails };
            await _claimService.GenerateClaims(personEvents);

            return personEventDetails.PersonEventId;
        }

        public async Task<List<DeathClaimResponse>> SearchDeathClaim(string query, int pageSize = 100)
        {
            var page = 1;
            var orderBy = "Id";
            var sortDirection = "asc";
            var showActive = true;

            var searchResults = await _claimService.Search(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), showActive);
            return searchResults.Select(x => new DeathClaimResponse
            {
                PolicyNumber = x.PolicyNumber,
                IdNumber = x.IdNumber,
                MemberFirstName = x.MemberFirstName,
                MemberLastName = x.MemberLastName,
                MemberRole = x.MemberRole,
                ProductName = x.ProductName,
                ClaimReferenceNumber = x.ClaimReferenceNumber,
                ClaimAmount = x.InvoiceAmount,
                ApprovedClaimAmountPaid = x.AuthorisedAmount ?? 0,
                ClaimStatus = x.Status,
                StatusReason = x.StatusReason,
                ClaimPaymentDate = x.InvoiceDate,
                ClaimRepudiationDate = x.ClaimRepudiationDate,
                ClaimRepudiationReason = x.ClaimRepudiationReason,
                RepudiatedAmount = x.RepudiatedAmount ?? 0,
                ClaimChangeDate = x.ClaimChangeDate
            }).ToList();
        }

        public async Task<List<PolicyProductOptionModel>> GetPolicyProductOptionInformationByIdNumberAsync(string IdNumber)
        {
            Contract.Requires(!string.IsNullOrEmpty(IdNumber), $"{nameof(IdNumber)} is not provided.");

            return await _policyService.GetPolicyProductOptionInformationByIdNumberAsync(IdNumber);
        }

        public async Task<SchemeDeathRegistrationResult> CreateEventForDeathClaims(SchemeDeathDetailRequest schemeDeathDetailRequest)
        {
            Contract.Requires(schemeDeathDetailRequest != null);
            var policyResponse = new SchemeDeathRegistrationResult
            {
                IsOperationSuccessFull = true,
                ResponseMessage = string.Empty
            };

            if (schemeDeathDetailRequest == null)
            {
                policyResponse = new SchemeDeathRegistrationResult
                {
                    PolicyNumber = string.Empty,
                    IsOperationSuccessFull = false,
                    ResponseMessage = "A request to create a claim cannot be null."
                };
                return policyResponse;
            }

            var payload = JsonConvert.SerializeObject(schemeDeathDetailRequest);

            var policy = await GetPolicyByPolicyNumber(schemeDeathDetailRequest.PolicyDetail.PolicyNumber);

            var insuredLife = await GetPolicyInsuredLives(policy.PolicyNumber);
            if (insuredLife != null || insuredLife.Any())
            {
                var person = insuredLife.FirstOrDefault(x => x.IdNumber == schemeDeathDetailRequest.deceasedDetail.IdNumber);

                if (person != null)
                {
                    try
                    {
                        var checkFuneralClaim = await _eventService.GetPersonEventByInsuredLifeId(person.RolePlayerId);

                        if (checkFuneralClaim != null && checkFuneralClaim.ClaimType == ClaimTypeEnum.Funeral)
                        {
                            policyResponse = new SchemeDeathRegistrationResult
                            {
                                PolicyNumber = schemeDeathDetailRequest.PolicyDetail.PolicyNumber,
                                IsOperationSuccessFull = false,
                                ResponseMessage = $"A claim with the provided details already exists  with reference : {checkFuneralClaim.PersonEventId}"
                            };
                            return policyResponse;
                        }
                    }
                    catch (Exception ex)
                    {
                        ex.LogException($"{nameof(PolicyIntegrationFacade)}: Staging requuest Validations", schemeDeathDetailRequest);
                    }
                }
            }
            var activePolicyStatus = new List<PolicyStatusEnum> { PolicyStatusEnum.Active, PolicyStatusEnum.Reinstated, PolicyStatusEnum.Continued, PolicyStatusEnum.FreeCover };

            if (!activePolicyStatus.Contains(policy.PolicyStatus))
            {

                policyResponse = new SchemeDeathRegistrationResult
                {
                    PolicyNumber = schemeDeathDetailRequest.PolicyDetail.PolicyNumber,
                    IsOperationSuccessFull = false,
                    ResponseMessage = "The deceased person's policy is not active."
                };
                return policyResponse;
            }

            else
            {
                var requestEntity = CreateStagePolicyIntegrationRequestObject(schemeDeathDetailRequest.PolicyDetail.PolicyNumber, policy.ClientReference, payload, PolicyIntegrationRequestMethodTypeEnum.RegisterClaim);
                var stagedRequest = await CreateStageRequest(requestEntity);

                policyResponse = new SchemeDeathRegistrationResult
                {
                    PolicyNumber = schemeDeathDetailRequest.PolicyDetail.PolicyNumber,
                    IsOperationSuccessFull = true,
                    ResponseMessage = "A request to create a claim has been received successfully."
                };

                var policyData = new PolicyResponse
                {
                    PolicyNumber = policyResponse.PolicyNumber,
                    ClientReference = policy.ClientReference,
                    IsOperationSuccessFull = false,
                    ResponseMessage = JsonConvert.SerializeObject(policyResponse),
                    PolicyStatus = ""
                };
                _ = await UpdateStagePolicyIntegrationRequest(stagedRequest, policyData);
                return policyResponse;
            }

        }

        #region Helpers
        private async Task<SchemeDeathRegistrationResult> MapToInternalModel(SchemeDeathDetailRequest request)
        {

            var policy = await GetPolicyByPolicyNumber(request.PolicyDetail.PolicyNumber);
            var insuredLife = await GetPolicyInsuredLives(policy.PolicyNumber);

            var deceasedPerson = insuredLife.FirstOrDefault(p => p.IdNumber == request.deceasedDetail.IdNumber || p.PassportNumber == request.deceasedDetail.IdNumber);

            if (deceasedPerson == null)
            {
                throw new Exception("Deceased person's ID number is not present in the policy.");
            }


            int claimant = insuredLife.FirstOrDefault(c => c.IdNumber == request.claimant.IdNumber)?.RolePlayerId ?? 0;

            var beneficiaryTypeConverted = Enum.TryParse(request.claimant.RelationshipToDeceased, out BeneficiaryTypeEnum beneficiaryType);


            var SchemeDeathDetail = new SchemeDeathDetailExternal
            {
                ParentPolicyNumber = request.PolicyDetail.PolicyNumber,
                PolicyNumber = request.PolicyDetail.PolicyNumber,
                DeathType = request.deceasedDetail.DeathType,
                DhaReferenceNo = request.deceasedDetail.DhaReferenceNo,
                DeathCertificateNo = request.deceasedDetail.DeathCertificateNo,
                InterviewWithFamilyMember = false,
                OpinionOfMedicalPractitioner = false,
                HomeAffairsRegion = request.deceasedAddress.Province,
                PlaceOfDeath = $"{request.deceasedAddress.Town}, {request.deceasedAddress.Province}",
                CauseOfDeath = request.deceasedDetail.DeathType,
                CauseOfDeathDescription = request.deceasedDetail.DeathType,
                SendBrokerEmail = false,


                InsuredLife = new Person
                {
                    Title = TitleEnum.Unknown,
                    FirstName = request.deceasedDetail.Name,
                    Surname = request.deceasedDetail.Surname,
                    IdNumber = request.deceasedDetail.IdNumber,
                    RolePlayerId = deceasedPerson.RolePlayerId,
                    DateOfDeath = request.deceasedDetail.DateOfDeath



                },
                Claimant = new Contracts.Entities.RolePlayer.Claimant
                {
                    FirstName = request.claimant.Name,
                    LastName = request.claimant.Surname,
                    BeneficiaryTypeId = beneficiaryTypeConverted ? (int)beneficiaryType : (int)BeneficiaryTypeEnum.Other,
                    IdNumber = request.claimant.IdNumber,
                    ContactNumber = request.claimant.ContactNumber,
                    RolePlayerId = claimant

                },
                Informant = new Contracts.Entities.RolePlayer.Informant
                {
                    FirstName = request?.claimant.Name,
                    LastName = request?.claimant.Surname,
                    IdNumber = request?.claimant.IdNumber,
                    ContactNumber = request?.claimant.ContactNumber,
                    BeneficiaryTypeId = beneficiaryTypeConverted ? (int)beneficiaryType : (int)BeneficiaryTypeEnum.Other,
                    RolePlayerId = claimant

                },
                HealthCareProvider = new HealthCareProviderModel
                {

                    Name = request.doctorDetails.Name,
                    //LastName = request.doctorDetails.Surname,//HealthCareProviderModel does not have LastName
                    PracticeNumber = request?.doctorDetails.PracticeNumber,
                    //ContactNumber = request.doctorDetails.ContactNumber,//HealthCareProviderModel does not have ContactNumber



                },
                Undertaker = new Undertaker
                {

                    FirstName = request.authorityDetails.Name,
                    LastName = request.authorityDetails.Surname,
                    ContactNumber = request.authorityDetails.ContactNumber



                },
                ForensicPathologist = new ForensicPathologist
                {
                    FirstName = request.funeralParlourDetails.CompanyName,
                    LastName = request.funeralParlourDetails.ContactName,
                    ContactNumber = request.funeralParlourDetails.ContactNumber,
                },
                BodyCollector = new BodyCollector
                {
                    FirstName = request.funeralParlourDetails.ContactName,
                    LastName = request.funeralParlourDetails.ContactSurname,
                    ContactNumber = request.funeralParlourDetails.ContactNumber,
                    RegistrationNumber = request.funeralParlourDetails.CompanyName
                },
                FuneralParlor = new FuneralParlor
                {
                    FuneralParlorName = request.funeralParlourDetails.CompanyName,
                    ContactNumber = request.funeralParlourDetails.ContactNumber
                },

                beneficiaryBankingDetail = new BeneficiaryBankingDetail
                {
                    Firstname = request.beneficiaryDetail.Name,
                    Lastname = request.beneficiaryDetail.Surname,
                    IdNumber = request.beneficiaryDetail.IdNumber,
                    ContactNumber = request.beneficiaryDetail.ContactNumber,
                    AllocationPercentage = (decimal)request.beneficiaryDetail.BenefitAllocationPercentage,
                    BankAccount = new BeneficiaryBankAccount
                    {
                        NameOfAccountHolder = $"{request.beneficiaryBankAccount.AccountHolderName} {request.beneficiaryBankAccount.AccountHolderSurname}",
                        BankName = request.beneficiaryBankAccount.Bank,
                        AccountNumber = request.beneficiaryBankAccount.AccountNumber.ToString(),
                        BankBranchNumber = request.beneficiaryBankAccount.BranchCode.ToString(),
                        BankAccountType = (BankAccountTypeEnum)request.beneficiaryBankAccount.AccountType
                    }
                },



            };
            if (request.attachments != null)
            {
                SchemeDeathDetail.deathClaimAttachments = new List<DeathClaimFileAttachment>();


                foreach (var attachment in request.attachments)
                {
                    DeathClaimFileAttachment document = new DeathClaimFileAttachment
                    {
                        AttachmentType = attachment.AttachmentType,
                        FileName = attachment.FileName,
                        FileType = attachment.FileType,
                        FileURL = attachment.FileURL
                    };

                    SchemeDeathDetail.deathClaimAttachments.Add(document);
                }
            }


            var allocateSchemePaymentsResponse = await CreateEventForDeathClaimInternal(SchemeDeathDetail);
            return allocateSchemePaymentsResponse;

        }

        private async Task UploadDeathDocument(List<DeathClaimFileAttachment> attachments, string policyNumber)

        {
            foreach (var doc in attachments)
            {
                try
                {
                    var docTypeEnum = GetDocumentTypeFromFilename(doc.AttachmentType);

                    string fileAsBase64;
                    try
                    {
                        fileAsBase64 = await ConvertFileUrlToBase64(doc.FileURL);
                    }
                    catch (Exception ex)
                    {

                        ex.LogException($"{nameof(PolicyIntegrationFacade)}: Failed to convert  {doc.FileName} at URL {doc.FileURL} to base64: {ex.Message}", attachments, policyNumber);
                        continue;
                    }
                    var documentUpload = new Documents.Document
                    {
                        DocTypeId = (int)docTypeEnum,
                        SystemName = "ClaimManager",
                        FileName = doc.FileName,
                        Keys = new Dictionary<string, string> { { "PolicyId", policyNumber } },
                        DocumentStatus = DocumentStatusEnum.Received,
                        FileExtension = doc.FileType,
                        DocumentSet = DocumentSetEnum.ClaimRequirementsDocuments,
                        FileAsBase64 = fileAsBase64,
                        DocumentDescription = $"Document: {doc.AttachmentType}",

                    };

                    await _documentIndexService.UploadDocument(documentUpload);

                }
                catch (Exception ex)
                {

                    ex.LogException($"{nameof(PolicyIntegrationFacade)}: Attachment Save. {doc.FileName}", attachments, policyNumber);
                    continue;
                }

            }
        }

        public DocumentTypeEnum? GetDocumentTypeFromFilename(string filename)
        {

            switch (filename?.ToLowerInvariant())
            {
                case "claim form":
                    return DocumentTypeEnum.ClaimForm;

                case "police report":
                    return DocumentTypeEnum.PoliceReport;

                case "certified copy of the deceased id":
                    return DocumentTypeEnum.CertifiedCopyofthedeceasedID;

                case "death certificate":
                    return DocumentTypeEnum.DeathCertificate;

                case "death report(dha 1663 / 1680)":
                    return DocumentTypeEnum.DeathReportDHA16631680;

                case "banking details":
                    return DocumentTypeEnum.BankingDetails;

                case "indemnity form":
                    return DocumentTypeEnum.Indemnityform;

                case "certified copy of the beneficiary id":
                    return DocumentTypeEnum.CertifiedCopyofthebeneficiaryID;

                case "notification of death/still birth form":
                    return DocumentTypeEnum.Notificationofdeathstillbirthform;

                case "certified copy of the computerised death certificate":
                    return DocumentTypeEnum.Certifiedcopyofthecomputeriseddeathcertificate;

                default:
                    return DocumentTypeEnum.Other;
            }
        }

        private async Task<string> ConvertFileUrlToBase64(string fileUrl)
        {
            HttpResponseMessage response = await _httpClientService.GetAsync(null, fileUrl);
            byte[] fileBytes = await response.Content.ReadAsByteArrayAsync();

            // Convert to base64 string
            return Convert.ToBase64String(fileBytes);
        }

        private async Task UpdateChildPolicyPremiums(int? policyId)
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


        #endregion

        private async Task RegeneratePolicySchedule(int policyId)
        {
            string requestedBy = RmaIdentity.Username.Equals(RmaIdentity.BackendServiceName, StringComparison.OrdinalIgnoreCase)
                        ? SystemSettings.SystemUserAccount
                        : RmaIdentity.Username;
            string ImpersonateUser = RmaIdentity.Username.Equals(RmaIdentity.BackendServiceName, StringComparison.OrdinalIgnoreCase)
                       ? SystemSettings.SystemUserAccount
                       : RmaIdentity.Username;

            //Regenerate Policy Schedule
            var producer = new ServiceBusQueueProducer<PolicyScheduleMessage, PolicyScheduleMessageListener>(PolicyScheduleMessageListener.QueueName);
            await producer.PublishMessageAsync(new PolicyScheduleMessage()
            {
                PolicyId = policyId,
                ShouldRegenerateSchedule = true,
                RequestedBy = requestedBy,
                ImpersonateUser = ImpersonateUser
            });
        }


        public async Task<decimal> GetEuropAssistFee()
        {
            var europAssistPremiumMatrices = await _europAssistPremiumMatrixService.GetEuropAssistPremiumMatrices();
            var selectedInfo = europAssistPremiumMatrices.FirstOrDefault(info => !info.IsDeleted);

            return selectedInfo.BasePremium + selectedInfo.ProfitExpenseLoadingPremium;
        }

        public async Task<List<GroupSchemePremiumRoundingExclusion>> GetGroupSchemePremiumRoundingExclusions()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _policyGroupSchemePremiumRoundingExclusionRepository.Where(x => !x.IsDeleted).ToListAsync();
                return Mapper.Map<List<GroupSchemePremiumRoundingExclusion>>(results);
            }
        }

        public async Task<bool> SendPoliciesToGenaratePolicySchedules(List<int> policyIds)
        {
            if (policyIds.Count > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {

                    foreach (var policyId in policyIds)
                    {
                        await RegeneratePolicySchedule(policyId);
                    }
                }
                return true;
            }
            return false;
        }

        private async Task GeneratePolicySchedule(int policyId)
        {
            string requestedBy = RmaIdentity.Username.Equals(RmaIdentity.BackendServiceName, StringComparison.OrdinalIgnoreCase)
                        ? SystemSettings.SystemUserAccount
                        : RmaIdentity.Username;
            string ImpersonateUser = RmaIdentity.Username.Equals(RmaIdentity.BackendServiceName, StringComparison.OrdinalIgnoreCase)
                       ? SystemSettings.SystemUserAccount
                       : RmaIdentity.Username;

            //Generate New Policy Schedule
            var producer = new ServiceBusQueueProducer<PolicyScheduleMessage, PolicyScheduleMessageListener>(PolicyScheduleMessageListener.QueueName);
            await producer.PublishMessageAsync(new PolicyScheduleMessage()
            {
                PolicyId = policyId,
                ShouldRegenerateSchedule = false,
                RequestedBy = requestedBy,
                ImpersonateUser = ImpersonateUser
            });
        }

        public async Task<bool> SendPolicySchedule(int policyId,string policyCommunicationType)
        {
            try
            {

                var policyModel = await _policyService.GetPolicy(policyId);

                if (policyModel != null)
                {
                    var request = new PolicyCommunicationRequest
                    {
                        RecipientType = ScheduleRecipientTypeEnum.PolicyMember.ToString(),
                        PolicyCommunicationType = policyCommunicationType,
                        PolicyId = policyId,
                        ParentPolicyId = policyModel.ParentPolicyId.Value,
                        PolicyNumber= policyModel.PolicyNumber
                    };


                    var policyDocumentCommunicationMatrix = await _rolePlayerPolicyService.GetPolicyDocumentCommunicationMatrix(policyModel.ParentPolicyId);

                    if (policyDocumentCommunicationMatrix != null)
                    {
                        await HandlePolicyDocumentCommunication(policyDocumentCommunicationMatrix, request);
                    }

                    else
                    {
                        var policyMember = await _premiumListingService.GetPolicyMemberDetails(policyModel.PolicyNumber);
                        await SendCommunication(policyMember,request);
                    }

                }
                return true;
            }


            catch (Exception ex)
            {
                ex.LogException($"{nameof(PolicyIntegrationFacade)}: Sending Policy Schedule exception.");

                return false;
            }

        }

        private async Task QueuePolicyScheduleEmail(
   PolicyMember policy,

    bool sendWelcomeLetter,
    bool sendPolicySchedule,
    bool sendTermsAndConditions,
    string recipientType, int policyId, int parentPolicyId)
        {
            DateTime scheduledDate = DateTime.UtcNow.Date.AddDays(1).AddHours(4);
            var emailQueueEntry = new Load_CdaPolicyScheduleEmailQueue
            {
                PolicyId = policyId,
                PolicyNumber = policy.PolicyNumber,
                RecipientEmail = policy.EmailAddress,
                SendWelcomeLetter = sendWelcomeLetter,
                SendPolicySchedule = sendPolicySchedule,
                SendTermsAndConditions = sendTermsAndConditions,
                Status = "Pending",
                IsProcessed = false,
                IsFailed = false,
                CreatedBy = RmaIdentity.Username,
                ModifiedBy = RmaIdentity.Username,
                ScheduledDate = scheduledDate,
                ProcessedDate = scheduledDate,
                LastTriedDate = scheduledDate,
                MemberName = policy.MemberName,
                IsEuropAssist = policy.IsEuropAssist,
                IdNumber = policy.IdNumber,
                RecipientType = recipientType,
                ParentPolicyId = parentPolicyId

            };

            using (var scope = _dbContextScopeFactory.Create())
            {
                _loadCdaPolicyScheduleEmailQueueRepository.Create(emailQueueEntry);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

            return;

        }

        public async Task<bool> ProcessPolicyScheduleEmailQueue()
        {

            int maxRetryCount = 3;
            using (var scope = _dbContextScopeFactory.Create())
            {

                var pendingQueueItems = await _loadCdaPolicyScheduleEmailQueueRepository.Where(q => q.IsProcessed != true && q.Status == "Pending" && q.RetryCount < maxRetryCount)
            .ToListAsync();

                foreach (var item in pendingQueueItems)
                {
                    try
                    {
                        var policyModel = await _policyService.GetPolicy(item.PolicyId);
                        if (policyModel.ParentPolicyId.HasValue)
                        {
                            var parentPolicyModel = await _policyService.GetPolicy(policyModel.ParentPolicyId.Value);
                            var parentPolicyMember = await _premiumListingService.GetPolicyMemberDetails(parentPolicyModel.PolicyNumber);
                            var parentPolicyMembers = new List<PolicyMember> { parentPolicyMember };
                        }

                        var policyMember = await _premiumListingService.GetPolicyMemberDetails(policyModel.PolicyNumber);
                        var policyMembers = new List<PolicyMember> { policyMember };



                        if (string.Equals(item.RecipientType, ScheduleRecipientTypeEnum.Broker.ToString(), StringComparison.OrdinalIgnoreCase))
                        {

                            await _communicationService.SendGroupPolicySchedulesToBroker(
                                 policyModel.ParentPolicyId.Value,
                                 policyModel.PolicyNumber,
                                 policyModel.BrokerageName,
                                 policyMembers,
                                 policyModel.BrokerageName,
                                 item.RecipientEmail);
                        }

                        else if (string.Equals(item.RecipientType, ScheduleRecipientTypeEnum.PolicyMember.ToString(), StringComparison.OrdinalIgnoreCase))
                        {

                                await _communicationService.SendIndividualPolicyMemberPolicyDocuments(
                                      item.PolicyId,
                                      item.PolicyNumber,
                                      item.MemberName,
                                      item.IdNumber,
                                      item.RecipientEmail,
                                      item.IsEuropAssist ?? false,
                                      item.SendWelcomeLetter ?? true,
                                      item.SendPolicySchedule ?? true,
                                      item.SendTermsAndConditions ?? true
                           );

                        }
                        else if (string.Equals(item.RecipientType, ScheduleRecipientTypeEnum.Scheme.ToString(), StringComparison.OrdinalIgnoreCase))
                        {

                            await _communicationService.SendGroupSchemePolicyDocuments(
                                   policyModel,
                                   item.PolicyId,
                                   item.PolicyNumber,
                                   item.MemberName,
                                   item.RecipientEmail,
                                   item.SendWelcomeLetter ?? true,
                                   item.SendPolicySchedule ?? true,
                                   item.SendTermsAndConditions ?? true);

                        }
                        else if (string.Equals(item.RecipientType, ScheduleRecipientTypeEnum.Admin.ToString(), StringComparison.OrdinalIgnoreCase))
                        {
                            await _communicationService.SendGroupSchemePolicyDocuments(
                             policyModel,
                             item.PolicyId,
                             item.PolicyNumber,
                             item.MemberName,
                             item.RecipientEmail,
                             item.SendWelcomeLetter ?? true,
                             item.SendPolicySchedule ?? true,
                             item.SendTermsAndConditions ?? true);
                         }
                        else
                        {

                            await _communicationService.SendIndividualPolicyMemberPolicyDocuments(
                                    item.PolicyId,
                                    item.PolicyNumber,
                                    item.MemberName,
                                    item.IdNumber,
                                    item.RecipientEmail,
                                    item.IsEuropAssist ?? false,
                                    item.SendWelcomeLetter ?? true,
                                    item.SendPolicySchedule ?? true,
                                    item.SendTermsAndConditions ?? true
                         );

                        }

                        item.IsProcessed = true;
                        item.ProcessedDate = DateTime.UtcNow;
                        item.LastTriedDate = DateTime.UtcNow;
                        item.Status = "Success";
                        item.RetryCount = item.RetryCount + 1;

                    }
                    catch (Exception ex)
                    {
                        item.LastTriedDate = DateTime.UtcNow;
                        item.RetryCount = (item.RetryCount ?? 0) + 1;
                        item.FailureReason = ex.Message;

                        if (item.RetryCount >= maxRetryCount)
                        {
                            item.IsFailed = true;
                            item.Status = "Failed";
                            item.FailureReason = ex.Message;
                        }
                        ex.LogException($"{nameof(PolicyIntegrationFacade)}: Sending Policy Schedule exception.", pendingQueueItems);
                        continue;
                    }
                }

                await scope.SaveChangesAsync().ConfigureAwait(true);
            }

            return true;
        }

        private async Task HandlePolicyDocumentCommunication(PolicyDocumentCommunicationMatrix matrix, PolicyCommunicationRequest request)
        {
            var parentPolicy = await _policyService.GetPolicy(matrix.PolicyId);
            var parentPolicyMember = await _premiumListingService.GetPolicyMemberDetails(parentPolicy.PolicyNumber);
            if (matrix.SendPolicyDocsToBroker)
            {

                var brokerEmails = parentPolicy.PolicyContacts?.Where(c => !string.IsNullOrEmpty(c.EmailAddress) && c.ContactType == ContactTypeEnum.BrokerContact).Select(c => c.EmailAddress).Distinct().ToList();
                var brokerPhoneNumbers = parentPolicy.PolicyContacts?.Where(c => !string.IsNullOrEmpty(c.MobileNumber) && c.ContactType == ContactTypeEnum.BrokerContact).Select(c => c.MobileNumber).Distinct().ToList();
                parentPolicyMember.EmailAddress = brokerEmails?.FirstOrDefault() ?? parentPolicyMember.EmailAddress;
                parentPolicyMember.CellPhoneNumber = brokerPhoneNumbers?.FirstOrDefault() ?? parentPolicyMember.CellPhoneNumber;
                request.RecipientType = ScheduleRecipientTypeEnum.Broker.ToString();
                await SendCommunication(parentPolicyMember,request);

            }

            if (matrix.SendPolicyDocsToMember)
            {
                var member = await _premiumListingService.GetPolicyMemberDetails(request.PolicyNumber);
                request.RecipientType = ScheduleRecipientTypeEnum.PolicyMember.ToString();
                await SendCommunication(member, request);
            }

            if (matrix.SendPolicyDocsToAdmin)
            {               
                var AdminEmail= parentPolicy.PolicyContacts?.Where(c => !string.IsNullOrEmpty(c.EmailAddress) && c.ContactType==ContactTypeEnum.Administrator).Select(c => c.EmailAddress).Distinct().ToList();
                var AdminPhone = parentPolicy.PolicyContacts?.Where(c => !string.IsNullOrEmpty(c.MobileNumber) && c.ContactType == ContactTypeEnum.Administrator).Select(c => c.MobileNumber).Distinct().ToList();
                parentPolicyMember.EmailAddress = AdminEmail?.FirstOrDefault() ?? parentPolicyMember.EmailAddress;
                parentPolicyMember.CellPhoneNumber = AdminPhone?.FirstOrDefault() ?? parentPolicyMember.CellPhoneNumber;
                request.RecipientType = ScheduleRecipientTypeEnum.Admin.ToString();
                await SendCommunication(parentPolicyMember, request);
            }

            if (matrix.SendPolicyDocsToScheme)
            {              
                request.RecipientType = ScheduleRecipientTypeEnum.Scheme.ToString();
                await SendCommunication(parentPolicyMember, request);

            }
        }

        private async Task SendCommunication(PolicyMember member, PolicyCommunicationRequest request )
        {
            bool isSmsPreferred = member.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.SMS;
            bool isEmailPreferred = member.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.Email;
            bool hasValidCellNumber = !string.IsNullOrEmpty(member?.CellPhoneNumber);

            if (isSmsPreferred && hasValidCellNumber)
            {
                if (request.PolicyCommunicationType == PolicyCommunicationTypeEnum.NewOnboarding.ToString())
                {
                    await _communicationService.SendPolicyScheduleBySms(member);
                }
                else
                {
                    await _communicationService.SendPolicyScheduleUpdateNotificationBySms(member);
                }
            }
            if (isEmailPreferred)
            { 
             
                if (request.PolicyCommunicationType == PolicyCommunicationTypeEnum.NewOnboarding.ToString())
                {
                    await QueuePolicyScheduleEmail(member, true, true, true, request.RecipientType, request.PolicyId, request.ParentPolicyId);
                }
                else
                {
                    await QueuePolicyScheduleEmail(member, false, true, false, request.RecipientType, request.PolicyId, request.ParentPolicyId);
                }

            }

        }

    }
}