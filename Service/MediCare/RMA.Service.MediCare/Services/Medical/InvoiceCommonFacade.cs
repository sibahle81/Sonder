using AutoMapper;
using Newtonsoft.Json;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.DigiCare.Contracts.Entities.Digi;
using RMA.Service.DigiCare.Contracts.Interfaces.Digi;
using RMA.Service.FinCare.Contracts.Entities.Payments;
using RMA.Service.FinCare.Contracts.Interfaces.Payments;
using RMA.Service.MediCare.Constants;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Entities;
using RMA.Service.MediCare.RuleTasks;
using RMA.Service.MediCare.RuleTasks.Enums;

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using DatabaseConstants = RMA.Service.MediCare.Database.Constants.DatabaseConstants;
using IICD10CodeService = RMA.Service.MediCare.Contracts.Interfaces.Medical.IICD10CodeService;
using RuleRequest = RMA.Service.Admin.RulesManager.Contracts.Entities.RuleRequest;
using TebaInvoice = RMA.Service.MediCare.Contracts.Entities.Medical.TebaInvoice;
using TebaInvoiceLine = RMA.Service.MediCare.Contracts.Entities.Medical.TebaInvoiceLine;
using TravelAuthorisation = RMA.Service.MediCare.Contracts.Entities.Medical.TravelAuthorisation;

namespace RMA.Service.MediCare.Services.Medical
{
    public class InvoiceCommonFacade : RemotingStatelessService, IInvoiceCommonService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<medical_Invoice> _invoiceRepository;
        private readonly IRepository<medical_InvoiceLine> _invoiceLineRepository;
        private readonly IRepository<medical_TebaInvoice> _tebaInvoiceRepository;
        private readonly IRepository<medical_TebaInvoiceLine> _tebaInvoiceLineRepository;
        private readonly IRepository<medical_InvoiceUnderAssessReason> _invoiceUnderAssessReasonRepository;
        private readonly IRepository<medical_InvoiceLineUnderAssessReason> _invoiceLineUnderAssessReasonRepository;
        private readonly IRepository<medical_HealthCareProvider> _healthCareProviderRepository;
        private readonly IRepository<medical_PractitionerType> _practitionerTypeRepository;
        private readonly IRepository<medical_Tariff> _tariffRepository;
        private readonly IRepository<medical_MedicalItem> _medicalItemRepository;
        private readonly IRepository<medical_SwitchBatchInvoice> _switchBatchInvoiceRepository;
        private readonly IClaimService _claimService;
        private readonly IPolicyService _policyService;
        private readonly IPayeeTypeService _payeeTypeService;
        private readonly IMedicalFormService _medicalFormService;
        private readonly IRepository<medical_InvoiceReportMap> _invoiceReportMapRepository;
        private readonly IHealthCareProviderService _healthCareProviderService;
        private readonly IMediCareService _mediCareService;
        private readonly IRuleEngineService _rulesEngine;
        private readonly ISerializerService _serializer;
        private readonly IMedicalItemFacadeService _medicalItemFacadeService;
        private readonly IPaymentsAllocationService _paymentsAllocationService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IPaymentCreatorService _paymentCreatorService;
        private readonly IBankAccountService _bankAccountService;
        private readonly IConfigurationService _configurationService;
        private readonly IMedicalInvoiceClaimService _medicalInvoiceClaimService;
        private readonly IEventService _eventService;
        private readonly IICD10CodeService _icd10CodeService;
        private readonly IUnderAssessReasonService _underAssessReasonService;
        private readonly IUserService _userService;
        private readonly IInvoiceUnderAssessReasonService _invoiceUnderAssessReasonService;
        private readonly IInvoiceLineUnderAssessReasonService _invoiceLineUnderAssessReasonService;
        private readonly IWizardService _wizardService;
        private readonly IRoleService _roleService;
        private readonly IRepository<medical_InvoicePreAuthMap> _medicalInvoicePreAuthMapRepository;
        private readonly IRepository<medical_PreAuthTreatmentBasket> _preAuthTreatmentBasketsRepository;
        private readonly IRepository<medical_TreatmentBasketMedicalItem> _preAuthTreatmentBasketMedicalItemsRepository;
        private readonly IWizardConfigurationRouteSettingService _wizardConfigurationRouteSettingService;
        private MedicalWorkflowManagement _medicalWorkflowManagement;
        private readonly IPreAuthInvoiceService _preAuthInvoiceService;
        private readonly ITravelAuthorisationService _travelAuthorisationService;
        private readonly ICompCareIntegrationService _compCareIntegrationService;
        private readonly IInvoiceCompCareMapService _invoiceCompCareMapService;
        private readonly IRepository<medical_Modifier> _modifierRepository;
        private readonly IRepository<medical_ModifierTariff> _modifierTariffRepository;
        private readonly IRepository<medical_TariffBaseUnitCost> _tariffBaseUnitCostRepository;
        private readonly IRepository<medical_Section> _sectionRepository;
        private readonly IRepository<medical_TebaTariff> _tebaTariffRepository;
        private readonly IRepository<medical_ReductionCode> _reductionCodeRepository;
        private readonly IRepository<medical_TariffBaseGazettedUnitCost> _tariffBaseGazettedUnitCost;

        public InvoiceCommonFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<medical_Invoice> invoiceRepository
            , IRepository<medical_InvoiceLine> invoiceLineRepository
            , IRepository<medical_TebaInvoice> tebaInvoiceRepository
            , IRepository<medical_TebaInvoiceLine> tebaInvoiceLineRepository
            , IRepository<medical_InvoiceUnderAssessReason> invoiceUnderAssessReasonRepository
            , IRepository<medical_InvoiceLineUnderAssessReason> invoiceLineUnderAssessReasonRepository
            , IRepository<medical_HealthCareProvider> healthCareProviderRepository
            , IRepository<medical_PractitionerType> practitionerTypeRepository
            , IRepository<medical_Tariff> tariffRepository
            , IRepository<medical_MedicalItem> medicalItemRepository
            , IRepository<medical_TebaTariff> tebaTariffRepository
            , IRepository<medical_SwitchBatchInvoice> switchBatchInvoiceRepository
            , IClaimService claimService
            , IPolicyService policyService
            , IPayeeTypeService payeeTypeService
            , IRepository<medical_InvoiceReportMap> invoiceReportMapRepository
            , IMedicalFormService medicalFormService
            , IHealthCareProviderService healthCareProviderService
            , IMediCareService mediCareService
            , IRuleEngineService rulesEngine
            , ISerializerService serializer
            , IMedicalItemFacadeService medicalItemFacadeService
            , IPaymentsAllocationService paymentsAllocationService
            , IRolePlayerService rolePlayerService
            , IPaymentCreatorService paymentCreatorService
            , IConfigurationService configurationService
            , IBankAccountService bankAccountService
            , IMedicalInvoiceClaimService medicalInvoiceClaimService
            , IEventService eventService
            , IICD10CodeService icd10CodeService
            , IUnderAssessReasonService underAssessReasonService
            , IUserService userService
            , IInvoiceUnderAssessReasonService invoiceUnderAssessReasonService
            , IInvoiceLineUnderAssessReasonService invoiceLineUnderAssessReasonService
            , IRepository<medical_InvoicePreAuthMap> medicalInvoicePreAuthMapRepository
            , IRepository<medical_PreAuthTreatmentBasket> preAuthTreatmentBasketsRepository
            , IRepository<medical_TreatmentBasketMedicalItem> preAuthTreatmentBasketMedicalItemsRepository
            , IWizardService wizardService
            , IRoleService roleService
            , IWizardConfigurationRouteSettingService wizardConfigurationRouteSettingService
            , IPreAuthInvoiceService preAuthInvoiceService
            , ITravelAuthorisationService travelAuthorisationService
            , ICompCareIntegrationService compCareIntegrationService
            , IInvoiceCompCareMapService invoiceCompCareMapService
            , IRepository<medical_Modifier> modifierRepository
            , IRepository<medical_ModifierTariff> modifierTariffRepository
            , IRepository<medical_TariffBaseUnitCost> tariffBaseUnitCostRepository
            , IRepository<medical_Section> sectionRepository
            , IRepository<medical_ReductionCode> reductionCodeRepository
            , IRepository<medical_TariffBaseGazettedUnitCost> tariffBaseGazettedUnitCost
            )
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _invoiceRepository = invoiceRepository;
            _invoiceLineRepository = invoiceLineRepository;
            _tebaInvoiceRepository = tebaInvoiceRepository;
            _tebaInvoiceLineRepository = tebaInvoiceLineRepository;
            _invoiceUnderAssessReasonRepository = invoiceUnderAssessReasonRepository;
            _invoiceLineUnderAssessReasonRepository = invoiceLineUnderAssessReasonRepository;
            _healthCareProviderRepository = healthCareProviderRepository;
            _practitionerTypeRepository = practitionerTypeRepository;
            _tariffRepository = tariffRepository;
            _medicalItemRepository = medicalItemRepository;
            _tebaTariffRepository = tebaTariffRepository;
            _switchBatchInvoiceRepository = switchBatchInvoiceRepository;
            _claimService = claimService;
            _policyService = policyService;
            _payeeTypeService = payeeTypeService;
            _invoiceReportMapRepository = invoiceReportMapRepository;
            _medicalFormService = medicalFormService;
            _healthCareProviderService = healthCareProviderService;
            _mediCareService = mediCareService;
            _rulesEngine = rulesEngine;
            _serializer = serializer;
            _medicalItemFacadeService = medicalItemFacadeService;
            _paymentsAllocationService = paymentsAllocationService;
            _rolePlayerService = rolePlayerService;
            _paymentCreatorService = paymentCreatorService;
            _bankAccountService = bankAccountService;
            _configurationService = configurationService;
            _medicalInvoiceClaimService = medicalInvoiceClaimService;
            _eventService = eventService;
            _icd10CodeService = icd10CodeService;
            _underAssessReasonService = underAssessReasonService;
            _userService = userService;
            _invoiceUnderAssessReasonService = invoiceUnderAssessReasonService;
            _invoiceLineUnderAssessReasonService = invoiceLineUnderAssessReasonService;
            _medicalInvoicePreAuthMapRepository = medicalInvoicePreAuthMapRepository;
            _preAuthTreatmentBasketsRepository = preAuthTreatmentBasketsRepository;
            _preAuthTreatmentBasketMedicalItemsRepository = preAuthTreatmentBasketMedicalItemsRepository;
            _wizardService = wizardService;
            _roleService = roleService;
            _wizardConfigurationRouteSettingService = wizardConfigurationRouteSettingService;
            _medicalWorkflowManagement = new MedicalWorkflowManagement(_mediCareService, _wizardService, _roleService, _userService, _wizardConfigurationRouteSettingService);
            _preAuthInvoiceService = preAuthInvoiceService;
            _travelAuthorisationService = travelAuthorisationService;
            _compCareIntegrationService = compCareIntegrationService;
            _invoiceCompCareMapService = invoiceCompCareMapService;
            _modifierRepository = modifierRepository;
            _modifierTariffRepository = modifierTariffRepository;
            _tariffBaseUnitCostRepository = tariffBaseUnitCostRepository;
            _sectionRepository = sectionRepository;
            _reductionCodeRepository = reductionCodeRepository;
            _tariffBaseGazettedUnitCost = tariffBaseGazettedUnitCost;
        }

        public async Task<List<InvoiceUnderAssessReason>> ExecuteValidationRules(InvoiceDetails invoiceDetails)
        {
            Contract.Requires(invoiceDetails != null);
            RuleRequestResult ruleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() };
            var invoiceUnderAssessReasons = new List<InvoiceUnderAssessReason>();
            var medicalInvoiceClaimQuery = await _medicalInvoiceClaimService.GetMedicalInvoiceClaimByPersonEventId(Convert.ToInt32(invoiceDetails.PersonEventId));

            //Claim Liability Status Rule
            string liabilityStatus = string.Empty;
            liabilityStatus = medicalInvoiceClaimQuery.ClaimLiabilityStatus;
            var ruleDataLiabilityStatus = "{\"LiabilityStatus\": \"" + liabilityStatus + "\"}";
            var ruleRequestClaimLiabilityStatus = new RuleRequest()
            {
                Data = ruleDataLiabilityStatus,
                RuleNames = new List<string>() { "Claim liability status validation" },
                ExecutionFilter = "medical"
            };
            var liabilityStatusResult = await _rulesEngine.ExecuteRules(ruleRequestClaimLiabilityStatus);
            if (liabilityStatusResult != null && liabilityStatusResult.RuleResults.Count > 0)
            {
                liabilityStatusResult.RuleResults.ForEach(result =>
                {
                    ruleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = result.Passed,
                        RuleName = result.RuleName,
                        MessageList = result.MessageList
                    });

                    if (!result.Passed)
                    {
                        var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.claimLiabilityNotAccepted)?.Result;
                        if (underAssessReason != null)
                        {
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.claimLiabilityNotAccepted, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                        }
                    }
                });
            }

            //Treatment From date after date of death

            var ruleDataTreatmentFromDateAfterDateOfDeath = "{\"TreatmentFromDate\": \"" + invoiceDetails.DateAdmitted + "\",\"DateOfDeath\": \"" + medicalInvoiceClaimQuery.DateOfDeath + "\"}";
            var ruleRequestTreatmentFromDateAfterDateOfDeath = new RuleRequest()
            {
                Data = ruleDataTreatmentFromDateAfterDateOfDeath,
                RuleNames = new List<string>() { "MedicalInvoice Date of Death validation against DateFrom" },
                ExecutionFilter = "medical"
            };
            var treatmentFromDateAfterDateOfDeathResult = await _rulesEngine.ExecuteRules(ruleRequestTreatmentFromDateAfterDateOfDeath);
            if (treatmentFromDateAfterDateOfDeathResult != null && treatmentFromDateAfterDateOfDeathResult.RuleResults.Count > 0)
            {
                treatmentFromDateAfterDateOfDeathResult.RuleResults.ForEach(result =>
                {
                    ruleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = result.Passed,
                        RuleName = result.RuleName,
                        MessageList = result.MessageList
                    });

                    if (!result.Passed)
                    {
                        var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.serviceDateAfterDateOfDeath)?.Result;
                        if (underAssessReason != null)
                        {
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.serviceDateAfterDateOfDeath, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                        }
                    }
                });
            }

            //Treatment To date after date of death
            var ruleDataTreatmentToDateAfterDateOfDeath = "{\"TreatmentToDate\": \"" + invoiceDetails.DateDischarged + "\",\"DateOfDeath\": \"" + medicalInvoiceClaimQuery.DateOfDeath + "\"}";
            var ruleRequestTreatmentToDateAfterDateOfDeath = new RuleRequest()
            {
                Data = ruleDataTreatmentToDateAfterDateOfDeath,
                RuleNames = new List<string>() { "MedicalInvoice Date of Death validation" },
                ExecutionFilter = "medical"
            };
            var treatmentToDateAfterDateOfDeathResult = await _rulesEngine.ExecuteRules(ruleRequestTreatmentToDateAfterDateOfDeath);
            if (treatmentToDateAfterDateOfDeathResult != null && treatmentToDateAfterDateOfDeathResult.RuleResults.Count > 0)
            {
                treatmentToDateAfterDateOfDeathResult.RuleResults.ForEach(result =>
                {
                    ruleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = result.Passed,
                        RuleName = result.RuleName,
                        MessageList = result.MessageList
                    });

                    if (!result.Passed)
                    {
                        var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.serviceDateAfterDateOfDeath)?.Result;
                        if (underAssessReason != null)
                        {
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.serviceDateAfterDateOfDeath, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                        }
                    }
                });
            }

            //Treatment From date before EventDate
            var ruleDataTreatmentFromDateBeforeEventDate = "{\"EventDate\": \"" + medicalInvoiceClaimQuery.EventDate + "\",\"TreatmentFromDate\": \"" + invoiceDetails.DateAdmitted + "\"}";
            var ruleRequestTreatmentFromDateBeforeEventDate = new RuleRequest()
            {
                Data = ruleDataTreatmentFromDateBeforeEventDate,
                RuleNames = new List<string>() { "MedicalInvoice Event Date validation against Treatment From Date" },
                ExecutionFilter = "medical"
            };
            var treatmentFromDateBeforeEventDateResult = await _rulesEngine.ExecuteRules(ruleRequestTreatmentFromDateBeforeEventDate);
            if (treatmentFromDateBeforeEventDateResult != null && treatmentFromDateBeforeEventDateResult.RuleResults.Count > 0)
            {
                treatmentFromDateBeforeEventDateResult.RuleResults.ForEach(result =>
                {
                    ruleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = result.Passed,
                        RuleName = result.RuleName,
                        MessageList = result.MessageList
                    });

                    if (!result.Passed)
                    {
                        var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate)?.Result;
                        if (underAssessReason != null)
                        {
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                        }
                    }
                });
            }

            //Treatment To date before EventDate
            var ruleDataTreatmentToDateBeforeEventDate = "{\"EventDate\": \"" + medicalInvoiceClaimQuery.EventDate + "\",\"TreatmentToDate\": \"" + invoiceDetails.DateDischarged + "\"}";
            var ruleRequestTreatmentToDateBeforeEventDate = new RuleRequest()
            {
                Data = ruleDataTreatmentToDateBeforeEventDate,
                RuleNames = new List<string>() { "MedicalInvoice Event Date validation against Treatment To Date" },
                ExecutionFilter = "medical"
            };
            var treatmentToDateBeforeEventDateResult = await _rulesEngine.ExecuteRules(ruleRequestTreatmentToDateBeforeEventDate);
            if (treatmentToDateBeforeEventDateResult != null && treatmentToDateBeforeEventDateResult.RuleResults.Count > 0)
            {
                treatmentToDateBeforeEventDateResult.RuleResults.ForEach(result =>
                {
                    ruleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = result.Passed,
                        RuleName = result.RuleName,
                        MessageList = result.MessageList
                    });

                    if (!result.Passed)
                    {
                        var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate)?.Result;
                        if (underAssessReason != null)
                        {
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                        }
                    }
                });
            }

            //Invoice Date Before Event Date
            var ruleDataInvoiceDateBeforeEventDate = "{\"EventDate\": \"" + medicalInvoiceClaimQuery.EventDate + "\",\"InvoiceDate\": \"" + invoiceDetails.InvoiceDate + "\"}";
            var ruleRequestInvoiceDateBeforeEventDate = new RuleRequest()
            {
                Data = ruleDataInvoiceDateBeforeEventDate,
                RuleNames = new List<string>() { "MedicalInvoice Event Date validation against Invoice Date" },
                ExecutionFilter = "medical"
            };
            var invoiceDateBeforeEventDateResult = await _rulesEngine.ExecuteRules(ruleRequestInvoiceDateBeforeEventDate);
            if (invoiceDateBeforeEventDateResult != null && invoiceDateBeforeEventDateResult.RuleResults.Count > 0)
            {
                invoiceDateBeforeEventDateResult.RuleResults.ForEach(result =>
                {
                    ruleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = result.Passed,
                        RuleName = result.RuleName,
                        MessageList = result.MessageList
                    });

                    if (!result.Passed)
                    {
                        var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate)?.Result;
                        if (underAssessReason != null)
                        {
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                        }
                    }
                });
            }

            //Validate ICD10Codes on Medical Invoice against Claim Injury
            List<InvoiceLineICD10Code> invoiceLineICD10Codes = new List<InvoiceLineICD10Code>();
            foreach (var invoiceLine in invoiceDetails?.InvoiceLineDetails)
            {
                char[] splitters = new char[] { ' ', '/' };
                foreach (var icd10Code in invoiceLine.Icd10Code.Split(splitters))
                {
                    if (!invoiceLineICD10Codes.Any(line => line.Icd10Code.Trim() == icd10Code.Trim()) && !string.IsNullOrWhiteSpace(icd10Code.Trim()))
                        invoiceLineICD10Codes.Add(new InvoiceLineICD10Code() { Icd10CodeId = 0, Icd10Code = icd10Code.Trim(), BodySideId = 0 });
                }
            }

            string ruleDataICD10Codes = await GetInvoiceLineClaimInjuriesAsync(Convert.ToInt32(invoiceDetails.PersonEventId), 0, invoiceLineICD10Codes);
            var ruleRequestICD10Codes = new RuleRequest()
            {
                Data = ruleDataICD10Codes,
                RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.ICD10CodeMatch.Constants.MedicalInvoiceClaimInjuryName },
                ExecutionFilter = "medical"
            };
            var icd10CodeRuleResult = await _rulesEngine.ExecuteRules(ruleRequestICD10Codes);
            if (icd10CodeRuleResult != null && icd10CodeRuleResult.RuleResults.Count > 0)
            {
                icd10CodeRuleResult.RuleResults.ForEach(result =>
                {
                    ruleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = result.Passed,
                        RuleName = result.RuleName,
                        MessageList = result.MessageList
                    });

                    if (!result.Passed)
                    {
                        var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.icd10CodeMismatchToClaimICD10)?.Result;
                        if (underAssessReason != null)
                        {
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.icd10CodeMismatchToClaimICD10, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                        }
                    }
                });
            }

            //Medical Benefit Rule
            var medicalBenefitsExist = await _medicalInvoiceClaimService.ValidateMedicalBenefit(Convert.ToInt32(invoiceDetails.ClaimId), invoiceDetails.InvoiceDate).ConfigureAwait(true);
            var ruleDataMedicalBenefit = "{\"MedicalBenefitExists\": \"" + medicalBenefitsExist + "\"}";
            var ruleRequestMedicalBenefit = new RuleRequest()
            {
                Data = ruleDataMedicalBenefit,
                RuleNames = new List<string>() { "Medical benefit validation" },
                ExecutionFilter = "medical"
            };
            var medicalBenefitResult = await _rulesEngine.ExecuteRules(ruleRequestMedicalBenefit);
            if (medicalBenefitResult != null && medicalBenefitResult.RuleResults.Count > 0)
            {
                medicalBenefitResult.RuleResults.ForEach(result =>
                {
                    ruleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = result.Passed,
                        RuleName = result.RuleName,
                        MessageList = result.MessageList
                    });

                    if (!result.Passed)
                    {
                        var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.noMedicalCover)?.Result;
                        if (underAssessReason != null)
                        {
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.noMedicalCover, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                        }
                    }
                });
            }

            //Amount Limit Validation
            var totalAmountLimit = await _userService.GetAmountLimit((int)AmountLimitTypeEnum.InvoiceAuthorisationLimit);
            var ruleDataAmountLimit = "{\"TotalAmountLimit\": \"" + totalAmountLimit + "\",\"InvoiceAmount\": \"" + invoiceDetails.InvoiceAmount + "\"}";
            var ruleRequestAmountLimit = new RuleRequest()
            {
                Data = ruleDataAmountLimit,
                RuleNames = new List<string>() { "Amount Limit Validation." },
                ExecutionFilter = "medical"
            };
            var amountLimitResult = await _rulesEngine.ExecuteRules(ruleRequestAmountLimit);
            if (amountLimitResult != null && amountLimitResult.RuleResults.Count > 0)
            {
                amountLimitResult.RuleResults.ForEach(result =>
                {
                    ruleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = result.Passed,
                        RuleName = result.RuleName,
                        MessageList = result.MessageList
                    });

                    if (!result.Passed)
                    {
                        var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.TotAmtLimit)?.Result;
                        if (underAssessReason != null)
                        {
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.TotAmtLimit, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                        }
                    }
                });
            }

            //Duplicate Invoice
            var ruleDataDuplicateInvoice = await CheckForDuplicateInvoice(new Invoice()
            {
                InvoiceId = invoiceDetails.InvoiceId,
                HealthCareProviderId = invoiceDetails.HealthCareProviderId,
                PersonEventId = invoiceDetails.PersonEventId,
                HcpInvoiceNumber = invoiceDetails.HcpInvoiceNumber,
                InvoiceDate = invoiceDetails.InvoiceDate,
                DateAdmitted = invoiceDetails.DateAdmitted,
                DateDischarged = invoiceDetails.DateDischarged
            });
            var ruleRequestDataDuplicateInvoice = new RuleRequest()
            {
                Data = ruleDataDuplicateInvoice,
                RuleNames = new List<string>() { "Duplicate invoice validation" },
                ExecutionFilter = "medical"
            };
            var duplicateInvoiceResult = await _rulesEngine.ExecuteRules(ruleRequestDataDuplicateInvoice);
            if (duplicateInvoiceResult != null && duplicateInvoiceResult.RuleResults.Count > 0)
            {
                duplicateInvoiceResult.RuleResults.ForEach(result =>
                {
                    ruleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = result.Passed,
                        RuleName = result.RuleName,
                        MessageList = result.MessageList
                    });

                    if (!result.Passed)
                    {
                        var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.invoiceIsADuplicate)?.Result;
                        if (underAssessReason != null)
                        {
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.invoiceIsADuplicate, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                        }
                    }
                });
            }

            //Check If Medical Report Required
            var isRequireMedicalReport = await IsRequireMedicalReportCommon(invoiceDetails.HealthCareProviderId);
            var ruleDataMedicalReport = "{\"IsMedicalReportExist\": \"" + invoiceDetails.IsMedicalReportExist + "\",\"IsMedicalReportRequired\": \"" + isRequireMedicalReport + "\"}";
            var ruleRequestMedicalReport = new RuleRequest()
            {
                Data = ruleDataMedicalReport,
                RuleNames = new List<string>() { "Medical Report Check validation" },
                ExecutionFilter = "medical"
            };
            var medicalReportResult = await _rulesEngine.ExecuteRules(ruleRequestMedicalReport);
            if (medicalReportResult != null && medicalReportResult.RuleResults.Count > 0)
            {
                medicalReportResult.RuleResults.ForEach(result =>
                {
                    ruleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = result.Passed,
                        RuleName = result.RuleName,
                        MessageList = result.MessageList
                    });

                    if (!result.Passed)
                    {
                        var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.medicalReportNotFoundForTreatingDoctor)?.Result;
                        if (underAssessReason != null)
                        {
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.medicalReportNotFoundForTreatingDoctor, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                        }
                    }
                });
            }
            return invoiceUnderAssessReasons;
        }

        public async Task<InvoiceValidationModel> ExecuteInvoiceValidations(InvoiceDetails invoiceDetails)
        {
            var invoiceValidations = new InvoiceValidationModel();
            invoiceValidations.RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() };
            invoiceValidations.UnderAssessReasons = new List<InvoiceUnderAssessReason>();
            if (invoiceDetails != null)
            {
                var medicalInvoiceClaimQuery = await _medicalInvoiceClaimService.GetMedicalInvoiceClaimByPersonEventId(Convert.ToInt32(invoiceDetails.PersonEventId));

                //Below is a list of all cliam statuses that are considered as Liability accepted in Medicare
                List<ClaimLiabilityStatusEnum> acceptedClaimLiabilityStatuses = new List<ClaimLiabilityStatusEnum>
                {
                    ClaimLiabilityStatusEnum.Accepted,
                    ClaimLiabilityStatusEnum.LiabilityAccepted,
                    ClaimLiabilityStatusEnum.FullLiabilityAccepted,
                    ClaimLiabilityStatusEnum.MedicalLiability
                };
                ClaimLiabilityStatusEnum claimLiabilityStatus = (ClaimLiabilityStatusEnum)Enum.Parse(typeof(ClaimLiabilityStatusEnum), medicalInvoiceClaimQuery.ClaimLiabilityStatus);

                //Claim Liability Status Rule
                string liabilityStatus = string.Empty;
                liabilityStatus = acceptedClaimLiabilityStatuses.Contains(claimLiabilityStatus) ? "Accepted" : "NotAccepted";
                var ruleDataLiabilityStatus = "{\"LiabilityStatus\": \"" + liabilityStatus + "\"}";
                var ruleRequestClaimLiabilityStatus = new RuleRequest()
                {
                    Data = ruleDataLiabilityStatus,
                    RuleNames = new List<string>() { "Claim liability status validation" },
                    ExecutionFilter = "medical"
                };
                var liabilityStatusResult = await _rulesEngine.ExecuteRules(ruleRequestClaimLiabilityStatus);
                if (liabilityStatusResult != null && liabilityStatusResult.RuleResults.Count > 0)
                {
                    liabilityStatusResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.claimLiabilityNotAccepted)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.claimLiabilityNotAccepted, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                            }
                        }
                    });
                }

                //Treatment From date after date of death

                var ruleDataTreatmentFromDateAfterDateOfDeath = "{\"TreatmentFromDate\": \"" + invoiceDetails.DateAdmitted + "\",\"DateOfDeath\": \"" + medicalInvoiceClaimQuery.DateOfDeath + "\"}";
                var ruleRequestTreatmentFromDateAfterDateOfDeath = new RuleRequest()
                {
                    Data = ruleDataTreatmentFromDateAfterDateOfDeath,
                    RuleNames = new List<string>() { "MedicalInvoice Date of Death validation against DateFrom" },
                    ExecutionFilter = "medical"
                };
                var treatmentFromDateAfterDateOfDeathResult = await _rulesEngine.ExecuteRules(ruleRequestTreatmentFromDateAfterDateOfDeath);
                if (treatmentFromDateAfterDateOfDeathResult != null && treatmentFromDateAfterDateOfDeathResult.RuleResults.Count > 0)
                {
                    treatmentFromDateAfterDateOfDeathResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.serviceDateAfterDateOfDeath)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.serviceDateAfterDateOfDeath, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                            }
                        }
                    });
                }

                //Treatment To date after date of death
                var ruleDataTreatmentToDateAfterDateOfDeath = "{\"TreatmentToDate\": \"" + invoiceDetails.DateDischarged + "\",\"DateOfDeath\": \"" + medicalInvoiceClaimQuery.DateOfDeath + "\"}";
                var ruleRequestTreatmentToDateAfterDateOfDeath = new RuleRequest()
                {
                    Data = ruleDataTreatmentToDateAfterDateOfDeath,
                    RuleNames = new List<string>() { "MedicalInvoice Date of Death validation" },
                    ExecutionFilter = "medical"
                };
                var treatmentToDateAfterDateOfDeathResult = await _rulesEngine.ExecuteRules(ruleRequestTreatmentToDateAfterDateOfDeath);
                if (treatmentToDateAfterDateOfDeathResult != null && treatmentToDateAfterDateOfDeathResult.RuleResults.Count > 0)
                {
                    treatmentToDateAfterDateOfDeathResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.serviceDateAfterDateOfDeath)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.serviceDateAfterDateOfDeath, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                            }
                        }
                    });
                }

                //Treatment From date before EventDate
                var ruleDataTreatmentFromDateBeforeEventDate = "{\"EventDate\": \"" + medicalInvoiceClaimQuery.EventDate + "\",\"TreatmentFromDate\": \"" + invoiceDetails.DateAdmitted + "\"}";
                var ruleRequestTreatmentFromDateBeforeEventDate = new RuleRequest()
                {
                    Data = ruleDataTreatmentFromDateBeforeEventDate,
                    RuleNames = new List<string>() { "MedicalInvoice Event Date validation against Treatment From Date" },
                    ExecutionFilter = "medical"
                };
                var treatmentFromDateBeforeEventDateResult = await _rulesEngine.ExecuteRules(ruleRequestTreatmentFromDateBeforeEventDate);
                if (treatmentFromDateBeforeEventDateResult != null && treatmentFromDateBeforeEventDateResult.RuleResults.Count > 0)
                {
                    treatmentFromDateBeforeEventDateResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                            }
                        }
                    });
                }

                //Treatment To date before EventDate
                var ruleDataTreatmentToDateBeforeEventDate = "{\"EventDate\": \"" + medicalInvoiceClaimQuery.EventDate + "\",\"TreatmentToDate\": \"" + invoiceDetails.DateDischarged + "\"}";
                var ruleRequestTreatmentToDateBeforeEventDate = new RuleRequest()
                {
                    Data = ruleDataTreatmentToDateBeforeEventDate,
                    RuleNames = new List<string>() { "MedicalInvoice Event Date validation against Treatment To Date" },
                    ExecutionFilter = "medical"
                };
                var treatmentToDateBeforeEventDateResult = await _rulesEngine.ExecuteRules(ruleRequestTreatmentToDateBeforeEventDate);
                if (treatmentToDateBeforeEventDateResult != null && treatmentToDateBeforeEventDateResult.RuleResults.Count > 0)
                {
                    treatmentToDateBeforeEventDateResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                            }
                        }
                    });
                }

                //Invoice Date Before Event Date
                var ruleDataInvoiceDateBeforeEventDate = "{\"EventDate\": \"" + medicalInvoiceClaimQuery.EventDate + "\",\"InvoiceDate\": \"" + invoiceDetails.InvoiceDate + "\"}";
                var ruleRequestInvoiceDateBeforeEventDate = new RuleRequest()
                {
                    Data = ruleDataInvoiceDateBeforeEventDate,
                    RuleNames = new List<string>() { "MedicalInvoice Event Date validation against Invoice Date" },
                    ExecutionFilter = "medical"
                };
                var invoiceDateBeforeEventDateResult = await _rulesEngine.ExecuteRules(ruleRequestInvoiceDateBeforeEventDate);
                if (invoiceDateBeforeEventDateResult != null && invoiceDateBeforeEventDateResult.RuleResults.Count > 0)
                {
                    invoiceDateBeforeEventDateResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                            }
                        }
                    });
                }

                //Medical Benefit Rule
                var medicalBenefitsExist = await _medicalInvoiceClaimService.ValidateMedicalBenefit(Convert.ToInt32(invoiceDetails.ClaimId), invoiceDetails.InvoiceDate).ConfigureAwait(true);
                var ruleDataMedicalBenefit = "{\"MedicalBenefitExists\": \"" + medicalBenefitsExist + "\"}";
                var ruleRequestMedicalBenefit = new RuleRequest()
                {
                    Data = ruleDataMedicalBenefit,
                    RuleNames = new List<string>() { "Medical benefit validation" },
                    ExecutionFilter = "medical"
                };
                var medicalBenefitResult = await _rulesEngine.ExecuteRules(ruleRequestMedicalBenefit);
                if (medicalBenefitResult != null && medicalBenefitResult.RuleResults.Count > 0)
                {
                    medicalBenefitResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.noMedicalCover)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.noMedicalCover, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                            }
                        }
                    });
                }

                //Amount Limit Validation
                var totalAmountLimit = await _userService.GetAmountLimit((int)AmountLimitTypeEnum.InvoiceAuthorisationLimit);
                var ruleDataAmountLimit = "{\"TotalAmountLimit\": \"" + totalAmountLimit + "\",\"InvoiceAmount\": \"" + invoiceDetails.InvoiceAmount + "\"}";
                var ruleRequestAmountLimit = new RuleRequest()
                {
                    Data = ruleDataAmountLimit,
                    RuleNames = new List<string>() { "Amount Limit Validation." },
                    ExecutionFilter = "medical"
                };
                var amountLimitResult = await _rulesEngine.ExecuteRules(ruleRequestAmountLimit);
                if (amountLimitResult != null && amountLimitResult.RuleResults.Count > 0)
                {
                    amountLimitResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.TotAmtLimit)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.TotAmtLimit, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                            }
                        }
                    });
                }

                //Duplicate Invoice
                var ruleDataDuplicateInvoice = await CheckForDuplicateInvoice(new Invoice()
                {
                    InvoiceId = invoiceDetails.InvoiceId,
                    HealthCareProviderId = invoiceDetails.HealthCareProviderId,
                    PersonEventId = invoiceDetails.PersonEventId,
                    HcpInvoiceNumber = invoiceDetails.HcpInvoiceNumber,
                    InvoiceDate = invoiceDetails.InvoiceDate,
                    DateAdmitted = invoiceDetails.DateAdmitted,
                    DateDischarged = invoiceDetails.DateDischarged
                });
                var ruleRequestDataDuplicateInvoice = new RuleRequest()
                {
                    Data = ruleDataDuplicateInvoice,
                    RuleNames = new List<string>() { "Duplicate invoice validation" },
                    ExecutionFilter = "medical"
                };
                var duplicateInvoiceResult = await _rulesEngine.ExecuteRules(ruleRequestDataDuplicateInvoice);
                if (duplicateInvoiceResult != null && duplicateInvoiceResult.RuleResults.Count > 0)
                {
                    duplicateInvoiceResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.invoiceIsADuplicate)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.invoiceIsADuplicate, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, TebaInvoiceId = null, IsActive = true });
                            }
                        }
                    });
                }

                //Check If Medical Report Required and if Medical Report exists
                var isRequireMedicalReport = await IsRequireMedicalReportCommon(invoiceDetails.HealthCareProviderId);
                MedicalReportQueryParams reportParams = new MedicalReportQueryParams
                {
                    HealthCareProviderId = invoiceDetails.HealthCareProviderId,
                    PersonEventId = Convert.ToInt32(invoiceDetails.PersonEventId),
                    DateTreatmentFrom = Convert.ToDateTime(invoiceDetails.DateAdmitted),
                    DateTreatmentTo = Convert.ToDateTime(invoiceDetails.DateDischarged),
                    PractitionerTypeId = invoiceDetails.PractitionerTypeId
                };
                var invoiceMedicalReports = await GetMedicalReportsForInvoiceCommon(reportParams);
                if (invoiceMedicalReports.Count > 0)
                {
                    invoiceDetails.IsMedicalReportExist = true;
                }
                var ruleDataMedicalReport = "{\"IsMedicalReportExist\": \"" + invoiceDetails.IsMedicalReportExist + "\",\"IsMedicalReportRequired\": \"" + isRequireMedicalReport + "\"}";
                var ruleRequestMedicalReport = new RuleRequest()
                {
                    Data = ruleDataMedicalReport,
                    RuleNames = new List<string>() { "Medical Report Check validation" },
                    ExecutionFilter = "medical"
                };
                var medicalReportResult = await _rulesEngine.ExecuteRules(ruleRequestMedicalReport);
                if (medicalReportResult != null && medicalReportResult.RuleResults.Count > 0)
                {
                    medicalReportResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.medicalReportNotFoundForTreatingDoctor)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.medicalReportNotFoundForTreatingDoctor, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                            }
                        }
                    });
                }

                //HealthcareProvider Active Status
                var healthCareProviderIsActive = await CheckIfHealthcareProviderIsActive(invoiceDetails.HealthCareProviderId);
                if (!healthCareProviderIsActive)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.thePracticeIsInactive);
                    invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.thePracticeIsInactive, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });

                    invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = false,
                        RuleName = RuleTasks.MedicalInvoiceRules.HealthCareProviderActive.Constants.HealthCareProviderActiveRuleName,
                        MessageList = new List<string> { "Healthcare Provider is not active." }
                    });
                }
                else
                {
                    invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = true,
                        RuleName = RuleTasks.MedicalInvoiceRules.HealthCareProviderActive.Constants.HealthCareProviderActiveRuleName,
                        MessageList = new List<string> { "Healthcare Provider is active." }
                    });
                }

                //Check if invoice has at Least 1 Line Item
                if (invoiceDetails.InvoiceLineDetails.Count < 1)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.InvNoLines);
                    invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.InvNoLines, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });

                    invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = false,
                        RuleName = RuleTasks.MedicalInvoiceRules.InvoiceHasAtleastOneLineItem.Constants.InvoiceHasAtleastOneLineItemRuleName,
                        MessageList = new List<string> { "Invoice requires at least 1 line item" }
                    });
                }
                else
                {
                    invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = true,
                        RuleName = RuleTasks.MedicalInvoiceRules.InvoiceHasAtleastOneLineItem.Constants.InvoiceHasAtleastOneLineItemRuleName,
                        MessageList = new List<string> { "Invoice has at least 1 line item" }
                    });
                }

                //Check if Invoice total matches line items total
                var invoiceTotalsMatch = await CompareMedicalInvoiceAndLineTotals(invoiceDetails);
                if (!invoiceTotalsMatch)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.TotMisMatch);
                    invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.TotMisMatch, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                }

            }
            invoiceValidations.RuleRequestResult.OverallSuccess = true;
            invoiceValidations.RuleRequestResult.RuleResults.ForEach(ruleResult =>
            {
                if (!ruleResult.Passed)
                {
                    invoiceValidations.RuleRequestResult.OverallSuccess = false;
                }
            });
            return invoiceValidations;
        }

        public async Task<InvoiceValidationModel> ExecuteTebaInvoiceValidations(TebaInvoice tebaInvoice)
        {
            var invoiceValidations = new InvoiceValidationModel();
            invoiceValidations.RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() };
            invoiceValidations.UnderAssessReasons = new List<InvoiceUnderAssessReason>();

            if (tebaInvoice != null)
            {
                var medicalInvoiceClaimQuery = await _medicalInvoiceClaimService.GetMedicalInvoiceClaimByPersonEventId(Convert.ToInt32(tebaInvoice.PersonEventId));

                //Invoice Date Before Event Date
                var ruleDataInvoiceDateBeforeEventDate = "{\"EventDate\": \"" + medicalInvoiceClaimQuery?.EventDate + "\",\"InvoiceDate\": \"" + tebaInvoice?.InvoiceDate + "\"}";
                var ruleRequestInvoiceDateBeforeEventDate = new RuleRequest()
                {
                    Data = ruleDataInvoiceDateBeforeEventDate,
                    RuleNames = new List<string>() { "MedicalInvoice Event Date validation against Invoice Date" },
                    ExecutionFilter = "medical"
                };

                var invoiceDateBeforeEventDateResult = await _rulesEngine.ExecuteRules(ruleRequestInvoiceDateBeforeEventDate);
                if (invoiceDateBeforeEventDateResult != null && invoiceDateBeforeEventDateResult.RuleResults.Count > 0)
                {
                    invoiceDateBeforeEventDateResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate, UnderAssessReason = underAssessReason.Description, InvoiceId = null, TebaInvoiceId = tebaInvoice.TebaInvoiceId, IsActive = true });
                            }
                        }
                    });
                }

                //Duplicate Invoice
                var ruleDataDuplicateInvoice = await CheckForDuplicateTebaInvoice(new TebaInvoice()
                {
                    TebaInvoiceId = tebaInvoice.TebaInvoiceId,
                    InvoicerId = tebaInvoice.InvoicerId,
                    PersonEventId = tebaInvoice.PersonEventId,
                    HcpInvoiceNumber = tebaInvoice.HcpInvoiceNumber,
                    InvoiceDate = tebaInvoice.InvoiceDate,
                    DateTravelledFrom = tebaInvoice.DateTravelledFrom,
                    DateTravelledTo = tebaInvoice.DateTravelledTo
                });
                var ruleRequestDataDuplicateInvoice = new RuleRequest()
                {
                    Data = ruleDataDuplicateInvoice,
                    RuleNames = new List<string>() { "Duplicate invoice validation" },
                    ExecutionFilter = "medical"
                };
                var duplicateInvoiceResult = await _rulesEngine.ExecuteRules(ruleRequestDataDuplicateInvoice);
                if (duplicateInvoiceResult != null && duplicateInvoiceResult.RuleResults.Count > 0)
                {
                    duplicateInvoiceResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.invoiceIsADuplicate)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.invoiceIsADuplicate, UnderAssessReason = underAssessReason.Description, InvoiceId = null, TebaInvoiceId = tebaInvoice.TebaInvoiceId, IsActive = true });
                            }
                        }
                    });
                }

                //Preauth IsPreAuthorised
                if (tebaInvoice.PreAuthId > 0)
                {
                    var preAuthDetails = await _travelAuthorisationService.GetTravelAuthorisation((int)tebaInvoice.PreAuthId).ConfigureAwait(true);

                    var preAuthExistData = "{\"PreAuthExist\": \"" + preAuthDetails?.IsPreAuthorised.ToString() + "\"}";
                    var ruleRequestDataPreAuthorisationObtained = new RuleRequest()
                    {
                        Data = preAuthExistData,
                        RuleNames = new List<string>() { RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.PreAuthExistCheck.Constants.PreAuthExistCheckRuleName },
                        ExecutionFilter = "medical"
                    };

                    var preAuthorisationObtainedResult = await _rulesEngine.ExecuteRules(ruleRequestDataPreAuthorisationObtained);

                    if (preAuthorisationObtainedResult != null && preAuthorisationObtainedResult.RuleResults.Count > 0)
                    {
                        preAuthorisationObtainedResult.RuleResults.ForEach(result =>
                        {
                            invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                            {
                                Passed = result.Passed,
                                RuleName = result.RuleName,
                                MessageList = result.MessageList
                            });

                            if (!result.Passed)
                            {
                                var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.noPreAuthorisationObtained)?.Result;
                                if (underAssessReason != null)
                                {
                                    invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.noPreAuthorisationObtained, UnderAssessReason = underAssessReason.Description, InvoiceId = null, TebaInvoiceId = tebaInvoice.TebaInvoiceId, Comments = "Teba PreAuthorised Not Authorised", IsActive = true });
                                }
                            }
                        });
                    }
                    
                    if (preAuthDetails?.AuthorisedKm != null || preAuthDetails.AuthorisedKm > 0)
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = true,
                            RuleName = "Teba AuthorisedKm",
                            MessageList = new List<string> { "Teba Kilometres Authorised" }
                        });

                    }
                    else if (preAuthDetails?.AuthorisedKm == null || preAuthDetails.AuthorisedKm == 0)
                    {
                        var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.theQuantityIsNotWithinAuthorisedRange);
                        invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason
                        {
                            UnderAssessReasonId = (int)UnderAssessReasonEnum.theQuantityIsNotWithinAuthorisedRange,
                            UnderAssessReason = underAssessReason.Description,
                            InvoiceId = null,
                            TebaInvoiceId = tebaInvoice.TebaInvoiceId,
                            Comments = "Teba Kilometres Not Authorised",
                            IsActive = true
                        });

                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = false,
                            RuleName = "Teba AuthorisedKm",
                            MessageList = new List<string> { "Teba Kilometres Not Authorised" }
                        });
                    }

                    // check for AuthorisedRate - check rate authorized vs KilometerRate
                    if (preAuthDetails?.TravelRateTypeId.ToString() == tebaInvoice?.TebaTariffCode)
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = true,
                            RuleName = "Teba KilometerRate",
                            MessageList = new List<string> { "Teba KilometerRate Authorised" }
                        });

                    }
                    else
                    {
                        var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.thisTariffCodeIsNotCoveredUnderSelectedPreauthorization);
                        invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.thisTariffCodeIsNotCoveredUnderSelectedPreauthorization, UnderAssessReason = underAssessReason.Description, InvoiceId = null, TebaInvoiceId = tebaInvoice.TebaInvoiceId, Comments = "Teba KilometerRate Not Authorised", IsActive = true });

                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = false,
                            RuleName = "Teba KilometerRate",
                            MessageList = new List<string> { "Teba KilometerRate Not Authorised" }
                        });
                    }

                    //Teba spacial Tariff code -  check for Total CostValue taking into concederation - (CostValue, MinimumValue, AdminFeePercentage) - check rate authorized vs KilometerRate

                    TebaTariffCodeTypeEnum? TebaTariffCodeValue = null;
                    if (Enum.TryParse(tebaInvoice.TebaTariffCode, true, out TebaTariffCodeTypeEnum TebaTariffCodeValueEnum))
                    {
                        TebaTariffCodeValue = TebaTariffCodeValueEnum;
                    }

                    var tebaTarifResults = await GetTebaTariff(TebaTariffCodeValue, (DateTime)tebaInvoice.DateTravelledFrom);

                    if (tebaTarifResults != null)
                    {
                        if (tebaTarifResults.MinimumValue > 0 || tebaTarifResults.AdminFeePercentage > 0)
                        {
                            decimal minCharge = 0;
                            decimal tebaAdminFee = 0;
                            decimal authorisedAmountInclusive = 0;

                            if (tebaTarifResults.MinimumValue > 0)
                                minCharge = tebaTarifResults.MinimumValue;

                            if (tebaTarifResults.AdminFeePercentage > 0)
                                tebaAdminFee = tebaTarifResults.AdminFeePercentage;

                            //final check then underassessreasons
                            if (tebaInvoice.AuthorisedTotalInclusive <= preAuthDetails.AuthorisedAmount)
                            {
                                invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                                {
                                    Passed = true,
                                    RuleName = "Teba spacial Tariff code",
                                    MessageList = new List<string> { "Teba spacial Tariff code fulfills CostValue, MinimumValue and AdminFeePercentage" }
                                });

                            }
                            else
                            {
                                var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.TotMisMatch);
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.TotMisMatch, UnderAssessReason = underAssessReason.Description, InvoiceId = null, TebaInvoiceId = tebaInvoice.TebaInvoiceId, Comments = "Teba spacial Tariff code does not fulfills CostValue, MinimumValue and AdminFeePercentage", IsActive = true });

                                invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                                {
                                    Passed = false,
                                    RuleName = "Teba spacial Tariff code",
                                    MessageList = new List<string> { "Teba spacial Tariff code does not fulfills CostValue, MinimumValue and AdminFeePercentage" }
                                });
                            }
                        }
                    }
                    else
                    {
                        var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.invalidTariffCodeSubmitted);
                        invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.invalidTariffCodeSubmitted, UnderAssessReason = underAssessReason.Description, InvoiceId = null, TebaInvoiceId = tebaInvoice.TebaInvoiceId, Comments = "Teba spacial Tariff code does not fulfills CostValue, MinimumValue and AdminFeePercentage", IsActive = true });

                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = false,
                            RuleName = "Teba invalid Tariff Code Submitted",
                            MessageList = new List<string> { "Teba invalid Tariff Code Submitted" }
                        });
                    }


                }
                else
                {
                    invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = false,
                        RuleName = "PreAuth Exist Check Rule",
                        MessageList = new List<string> { "No Teba Pre-authorisation Obtained" }
                    });

                    var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.noPreAuthorisationObtained)?.Result;
                    if (underAssessReason != null)
                    {
                        invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.noPreAuthorisationObtained, UnderAssessReason = underAssessReason.Description, InvoiceId = null, TebaInvoiceId = tebaInvoice.TebaInvoiceId, IsActive = true });
                    }
                }

                //Practice Active Status
                var practiceIsActive = await CheckIfHealthcareProviderIsActive(tebaInvoice.InvoicerId);
                if (!practiceIsActive)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.thePracticeIsInactive);
                    invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.thePracticeIsInactive, UnderAssessReason = underAssessReason.Description, InvoiceId = null, TebaInvoiceId = tebaInvoice.TebaInvoiceId, IsActive = true });

                    invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = false,
                        RuleName = RuleTasks.MedicalInvoiceRules.HealthCareProviderActive.Constants.HealthCareProviderActiveRuleName,
                        MessageList = new List<string> { "Healthcare Provider is not active." }
                    });
                }
                else
                {
                    invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = true,
                        RuleName = RuleTasks.MedicalInvoiceRules.HealthCareProviderActive.Constants.HealthCareProviderActiveRuleName,
                        MessageList = new List<string> { "Healthcare Provider is active." }
                    });
                }

                //Check if invoice has at Least 1 Line Item
                if (tebaInvoice.TebaInvoiceLines.Count < 1)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.InvNoLines);
                    invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.InvNoLines, UnderAssessReason = underAssessReason.Description, InvoiceId = null, TebaInvoiceId = tebaInvoice.TebaInvoiceId, IsActive = true });

                    invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = false,
                        RuleName = RuleTasks.MedicalInvoiceRules.InvoiceHasAtleastOneLineItem.Constants.InvoiceHasAtleastOneLineItemRuleName,
                        MessageList = new List<string> { "Invoice requires at least 1 line item" }
                    });
                }
                else
                {
                    invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = true,
                        RuleName = RuleTasks.MedicalInvoiceRules.InvoiceHasAtleastOneLineItem.Constants.InvoiceHasAtleastOneLineItemRuleName,
                        MessageList = new List<string> { "Invoice has at least 1 line item" }
                    });
                }
            }
            invoiceValidations.RuleRequestResult.OverallSuccess = true;
            invoiceValidations.RuleRequestResult.RuleResults.ForEach(ruleResult =>
            {
                if (!ruleResult.Passed)
                {
                    invoiceValidations.RuleRequestResult.OverallSuccess = false;
                }
            });
            return invoiceValidations;
        }

        public async Task<InvoiceValidationModel> ExecuteInvoiceLineValidations(InvoiceDetails invoiceDetails)
        {
            Contract.Requires(invoiceDetails != null);
            var invoiceLineValidations = new InvoiceValidationModel();
            invoiceLineValidations.RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() };
            invoiceLineValidations.LineUnderAssessReasons = new List<InvoiceLineUnderAssessReason>();
            //get preAuthsId's mapped to current invoice
            var preAuthIds = invoiceDetails.MedicalInvoicePreAuths.Select(x => x.PreAuthId).ToList();

            //get mapped preAuths
            var isChronic = await _medicalInvoiceClaimService.IsChronic(Convert.ToInt32(invoiceDetails?.PersonEventId), Convert.ToDateTime(invoiceDetails.DateAdmitted));
            if (await IsPreAuthRequired(Convert.ToInt32(invoiceDetails.HealthCareProviderId), isChronic))
            {
                var mappedPreAuthorisationList = preAuthIds.Any() ? await _preAuthInvoiceService.GetInvoiceMappedPreAuthorisations(preAuthIds) : new List<PreAuthorisation>();
                bool checkPreAuthHealthCareProviderIdNotMatch = mappedPreAuthorisationList.Any() ?
                    mappedPreAuthorisationList.Select(x => x.HealthCareProviderId).ToList().Contains(invoiceDetails.HealthCareProviderId) : false;

                if (checkPreAuthHealthCareProviderIdNotMatch)
                {
                    //Validate InvoiceLines to see if they are authorized against mapped PreAuth
                    var preAuthLineItemAuthorisedResult = await CheckIsPreAuthLineItemAuthorised(invoiceDetails);
                    if (preAuthLineItemAuthorisedResult.Any())
                    {
                        //check if line authorised or not
                        foreach (var lineItemAuthorised in preAuthLineItemAuthorisedResult)
                        {
                            if (lineItemAuthorised.Key.Contains(MediCareConstants.LineItemNotAuthorised))
                            {
                                var underAssessReason1 = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.thisTariffCodeIsNotCoveredUnderSelectedPreauthorization)?.Result;
                                if (underAssessReason1 != null)
                                {
                                    invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason()
                                    {
                                        UnderAssessReasonId = (int)UnderAssessReasonEnum.thisTariffCodeIsNotCoveredUnderSelectedPreauthorization,
                                        UnderAssessReason = underAssessReason1.Description,
                                        InvoiceLineId = Convert.ToInt32(lineItemAuthorised.Value.InvoiceLineId),
                                        IsActive = true
                                    });
                                }
                            }
                        }
                    }
                    else
                    {
                        //check if line authorised or not
                        foreach (var lineItem in invoiceDetails.InvoiceLineDetails)
                        {
                            var underAssessReason1 = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.noPreAuthorisationObtained)?.Result;
                            if (underAssessReason1 != null)
                            {
                                invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason()
                                {
                                    UnderAssessReasonId = (int)UnderAssessReasonEnum.noPreAuthorisationObtained,
                                    UnderAssessReason = underAssessReason1.Description,
                                    InvoiceLineId = Convert.ToInt32(lineItem.InvoiceLineId),
                                    IsActive = true
                                });
                            }
                        }
                    }
                }
                else
                {

                    //Validate line item on invoice with treatment baskets authorised on Hospital Auth if auth is not from the same HCP
                    var invoiceTreatmentBasketAuthorisedResult = await CheckIsInvoiceLineTreatmentBasketAuthorised(invoiceDetails);
                    if (invoiceTreatmentBasketAuthorisedResult.Any())
                    {
                        //check if line authorised or not
                        foreach (var lineItemAuthorised in invoiceTreatmentBasketAuthorisedResult)
                        {
                            if (lineItemAuthorised.Key.Contains(MediCareConstants.LineItemNotAuthorised))
                            {
                                var underAssessReason1 = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.thisTariffCodeIsNotCoveredUnderSelectedPreauthorization)?.Result;
                                if (underAssessReason1 != null)
                                {
                                    invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason()
                                    {
                                        UnderAssessReasonId = (int)UnderAssessReasonEnum.thisTariffCodeIsNotCoveredUnderSelectedPreauthorization,
                                        UnderAssessReason = underAssessReason1.Description,
                                        InvoiceLineId = Convert.ToInt32(lineItemAuthorised.Value.InvoiceLineId),
                                        IsActive = true
                                    });
                                }
                            }
                        }
                    }
                    else
                    {
                        //check if line authorised or not
                        foreach (var lineItem in invoiceDetails.InvoiceLineDetails)
                        {

                            var underAssessReason1 = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.noPreAuthorisationObtained)?.Result;
                            if (underAssessReason1 != null)
                            {
                                invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason()
                                {
                                    UnderAssessReasonId = (int)UnderAssessReasonEnum.noPreAuthorisationObtained,
                                    UnderAssessReason = underAssessReason1.Description,
                                    InvoiceLineId = Convert.ToInt32(lineItem.InvoiceLineId),
                                    IsActive = true
                                });
                            }
                        }
                    }
                }
            }

            //Line Item ICD10Code Validations in a Sequence
            var invoiceLineIcd10Code = string.Empty;
            string[] invoiceLineIcd10Codes;
            char[] splitters = new char[] { ' ', '/', ',', ';', '#', '+' };
            bool sendNotification = false;
            var iCD10CodePractitionerTypeMappingIsValidRuleResult = new RuleRequestResult();
            var icd10CodeMatchRuleResult = new RuleRequestResult();
            var icd10CodeExternalRuleResult = new RuleRequestResult();


            var previousInvoiceLine = new InvoiceLineDetails();
            var previousInvoiceLines = new List<InvoiceLineDetails>();
            decimal previousLinesTotalAmount = 0.0M;

            //Check for Modifiers
            foreach (InvoiceLineDetails invoiceLine in invoiceDetails.InvoiceLineDetails)
            {
                var isModifier = await IsModifier(invoiceLine.HcpTariffCode);

                if (isModifier)
                {
                    if (previousInvoiceLines != null && previousInvoiceLines?.Count == 0)
                    {
                        //Modifier cannot be the first line item
                        var isModifierData = "{\"IsFirstLineModifier\": \"" + isModifier + "\"}";
                        var ruleRequest = new RuleRequest()
                        {
                            Data = isModifierData,
                            RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.Modifier.Constants.ModifierFirstLineRuleName },
                            ExecutionFilter = "medical"
                        };
                        var modifierFirstLineRuleResult = await _rulesEngine.ExecuteRules(ruleRequest);
                        if (modifierFirstLineRuleResult != null && modifierFirstLineRuleResult.RuleResults.Count > 0)
                        {
                            modifierFirstLineRuleResult.RuleResults.ForEach(result =>
                            {
                                if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == result.RuleName))
                                {
                                    invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                                    {
                                        Passed = result.Passed,
                                        RuleName = result.RuleName,
                                        MessageList = result.MessageList
                                    });
                                }
                            });
                        }
                        if (!modifierFirstLineRuleResult.OverallSuccess)
                        {
                            var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.invalidTariffCodeSubmitted);
                            if (underAssessReason != null)
                            {
                                invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.invalidTariffCodeSubmitted, UnderAssessReason = underAssessReason.Description, InvoiceLineId = invoiceLine.InvoiceLineId, IsActive = true });
                            }
                        }
                    }

                    ModifierInput modifierInput = new ModifierInput
                    {
                        ModifierCode = invoiceLine.HcpTariffCode,
                        ModifierDescription = invoiceLine.Description,
                        HealthCareProviderId = invoiceDetails.HealthCareProviderId,
                        ModifierServiceDate = invoiceLine.ServiceDate,
                        TariffTypeId = invoiceLine.TariffTypeId,
                        TariffBaseUnitCostTypeId = Convert.ToInt32(previousInvoiceLine.TariffBaseUnitCostTypeId),
                        IsModifier = isModifier,
                        TariffCode = previousInvoiceLine.HcpTariffCode,
                        TariffAmount = Convert.ToDecimal(previousInvoiceLine.RequestedAmountInclusive),
                        TariffDiscount = previousInvoiceLine.CreditAmount,
                        TariffQuantity = Convert.ToDecimal(previousInvoiceLine.RequestedQuantity),
                        PublicationId = previousInvoiceLine.PublicationId,
                        TariffServiceDate = previousInvoiceLine.ServiceDate,
                        PreviousLinesTotalAmount = previousLinesTotalAmount,
                        PreviousInvoiceLine = previousInvoiceLine,
                        PreviousInvoiceLines = previousInvoiceLines,
                        TimeUnits = CalculateTimeUnits(invoiceLine.ServiceTimeStart, invoiceLine.ServiceTimeEnd, invoiceLine.RequestedQuantity)
                    };

                    var modifierOutput = await CalculateModifier(modifierInput);

                    invoiceLine.IsModifier = isModifier;
                    if (modifierOutput != null)
                    {
                        invoiceLine.TariffAmount = modifierOutput.ModifierAmount;
                        invoiceLine.RequestedQuantity = modifierOutput.ModifierQuantity;
                        invoiceLine.RequestedAmountInclusive = modifierOutput.TotalIncusiveAmount;
                    }
                }
                else
                {
                    previousInvoiceLine = invoiceLine;
                    previousInvoiceLines.Add(invoiceLine);
                    previousLinesTotalAmount += Convert.ToDecimal(invoiceLine.RequestedAmountInclusive);
                }
            }

            //Validate ICD10Code and PractitionerType Mapping
            foreach (InvoiceLineDetails invoiceLine in invoiceDetails.InvoiceLineDetails)
            {
                if (invoiceLineIcd10Code != invoiceLine.Icd10Code)
                {
                    invoiceLineIcd10Code = invoiceLine.Icd10Code;
                    invoiceLineIcd10Codes = invoiceLineIcd10Code.Split(splitters, StringSplitOptions.RemoveEmptyEntries);

                    List<InvoiceLineICD10Code> invoiceLineICD10Codes = new List<InvoiceLineICD10Code>();
                    foreach (var icd10Code in invoiceLineIcd10Codes)
                    {
                        if (!invoiceLineICD10Codes.Any(line => line.Icd10Code.Trim() == icd10Code.Trim()) && !string.IsNullOrWhiteSpace(icd10Code.Trim()))
                            invoiceLineICD10Codes.Add(new InvoiceLineICD10Code() { Icd10CodeId = 0, Icd10Code = icd10Code.Trim(), BodySideId = 0 });
                    }

                    var mappingFound = await _icd10CodeService.FindICD10CodePractitionerTypeMapping(invoiceDetails.PractitionerTypeId, invoiceLineICD10Codes);

                    var ruleData = "{\"ICD10CodePractitionerTypeMappingFound\": \"" + mappingFound + "\"}";
                    var ruleRequest = new RuleRequest()
                    {
                        Data = ruleData,
                        RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.ICD10CodePractitionerTypeMapping.Constants.ICD10CodePractitionerTypeMappingRuleName },
                        ExecutionFilter = "medical"
                    };

                    iCD10CodePractitionerTypeMappingIsValidRuleResult = await _rulesEngine.ExecuteRules(ruleRequest);

                    if (iCD10CodePractitionerTypeMappingIsValidRuleResult?.RuleResults.Count > 0)
                    {
                        var ruleResult = iCD10CodePractitionerTypeMappingIsValidRuleResult.RuleResults.FirstOrDefault();
                        if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.ICD10CodePractitionerTypeMapping.Constants.ICD10CodePractitionerTypeMappingRuleName))
                        {
                            invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                            {
                                Passed = ruleResult.Passed,
                                RuleName = ruleResult?.RuleName,
                                MessageList = ruleResult?.MessageList
                            });
                        }

                        if (!ruleResult.Passed)
                        {
                            //External Cause Code Validation
                            List<int> icd10CodeIds = new List<int>();
                            foreach (var icd10Code in invoiceLineIcd10Codes)
                            {
                                var icd10CodeResult = await _icd10CodeService.FilterICD10Code(icd10Code);
                                if (icd10CodeResult?.Count > 0)
                                    icd10CodeIds.Add(icd10CodeResult[0].Icd10CodeId);
                            }

                            var isOnlyExternalICD10CauseCodeSupplied = await _icd10CodeService.IsOnlyExternalICD10CauseCodeSupplied(icd10CodeIds);
                            var externalCauseCodeResult = "{\"IsOnlyExternalICD10CauseCodeSupplied\": \"" + isOnlyExternalICD10CauseCodeSupplied.ToString() + "\"}";

                            var ruleRequestExternal = new RuleRequest()
                            {
                                Data = externalCauseCodeResult,
                                RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.ExternalCauseCode.Constants.ExternalCauseCodeRuleName },
                                ExecutionFilter = "medical"
                            };

                            icd10CodeExternalRuleResult = await _rulesEngine.ExecuteRules(ruleRequestExternal);

                            if (icd10CodeExternalRuleResult?.RuleResults.Count > 0)
                            {
                                ruleResult = icd10CodeExternalRuleResult.RuleResults.FirstOrDefault();
                                if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.ExternalCauseCode.Constants.ExternalCauseCodeRuleName))
                                {
                                    invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                                    {
                                        Passed = icd10CodeExternalRuleResult.OverallSuccess,
                                        RuleName = ruleResult?.RuleName,
                                        MessageList = ruleResult?.MessageList
                                    });
                                }

                                if (!icd10CodeExternalRuleResult.OverallSuccess)
                                {
                                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.onlyExternalICD10CauseCodeSupplied);
                                    if (underAssessReason != null)
                                    {
                                        invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.onlyExternalICD10CauseCodeSupplied, UnderAssessReason = underAssessReason.Description, InvoiceLineId = invoiceLine.InvoiceLineId, IsActive = true });
                                    }
                                }
                            }

                            //Validate ICD10Codes on Medical Invoice against Claim Injury
                            string ruleDataICD10Codes = await GetInvoiceLineClaimInjuriesAsync(Convert.ToInt32(invoiceDetails.PersonEventId), 0, invoiceLineICD10Codes);
                            var ruleRequestICD10Codes = new RuleRequest()
                            {
                                Data = ruleDataICD10Codes,
                                RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.ICD10CodeMatch.Constants.MedicalInvoiceClaimInjuryName },
                                ExecutionFilter = "medical"
                            };

                            icd10CodeMatchRuleResult = await _rulesEngine.ExecuteRules(ruleRequestICD10Codes);

                            if (icd10CodeMatchRuleResult?.RuleResults.Count > 0)
                            {
                                ruleResult = icd10CodeMatchRuleResult.RuleResults.FirstOrDefault();
                                if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.ICD10CodeMatch.Constants.MedicalInvoiceClaimInjuryName))
                                {
                                    invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                                    {
                                        Passed = icd10CodeMatchRuleResult.OverallSuccess,
                                        RuleName = ruleResult?.RuleName,
                                        MessageList = ruleResult?.MessageList
                                    });
                                }

                                if (!icd10CodeMatchRuleResult.OverallSuccess)
                                {
                                    sendNotification = true;
                                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.icd10CodeMismatchToClaimICD10);
                                    if (underAssessReason != null)
                                    {
                                        invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.icd10CodeMismatchToClaimICD10, UnderAssessReason = underAssessReason.Description, InvoiceLineId = invoiceLine.InvoiceLineId, IsActive = true });
                                    }
                                }
                            }
                            
                        }
                    }
                }
                else
                {
                    if (iCD10CodePractitionerTypeMappingIsValidRuleResult?.RuleResults.Count > 0)
                    {
                        var ruleResult = iCD10CodePractitionerTypeMappingIsValidRuleResult.RuleResults.FirstOrDefault();
                        if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.ICD10CodePractitionerTypeMapping.Constants.ICD10CodePractitionerTypeMappingRuleName))
                        {
                            invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                            {
                                Passed = ruleResult.Passed,
                                RuleName = ruleResult?.RuleName,
                                MessageList = ruleResult?.MessageList
                            });
                        }

                        if (!ruleResult.Passed)
                        {
                            //ICD10Codes on Medical Invoice against Claim Injury Result
                            if (icd10CodeMatchRuleResult?.RuleResults?.Count > 0)
                            {
                                ruleResult = icd10CodeMatchRuleResult.RuleResults.FirstOrDefault();
                                if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.ICD10CodeMatch.Constants.MedicalInvoiceClaimInjuryName))
                                {
                                    invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                                    {
                                        Passed = icd10CodeMatchRuleResult.OverallSuccess,
                                        RuleName = ruleResult?.RuleName,
                                        MessageList = ruleResult?.MessageList
                                    });
                                }

                                if (!icd10CodeMatchRuleResult.OverallSuccess)
                                {
                                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.icd10CodeMismatchToClaimICD10);
                                    if (underAssessReason != null)
                                    {
                                        invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.icd10CodeMismatchToClaimICD10, UnderAssessReason = underAssessReason.Description, InvoiceLineId = invoiceLine.InvoiceLineId, IsActive = true });
                                    }

                                    //External Cause Code Result
                                    if (icd10CodeExternalRuleResult?.RuleResults.Count > 0)
                                    {
                                        ruleResult = icd10CodeExternalRuleResult.RuleResults.FirstOrDefault();
                                        if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.ExternalCauseCode.Constants.ExternalCauseCodeRuleName))
                                        {
                                            invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                                            {
                                                Passed = icd10CodeExternalRuleResult.OverallSuccess,
                                                RuleName = ruleResult?.RuleName,
                                                MessageList = ruleResult?.MessageList
                                            });
                                        }
                                    }
                                    
                                    if (!icd10CodeExternalRuleResult.OverallSuccess)
                                    {
                                        underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.onlyExternalICD10CauseCodeSupplied);
                                        if (underAssessReason != null)
                                        {
                                            invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.onlyExternalICD10CauseCodeSupplied, UnderAssessReason = underAssessReason.Description, InvoiceLineId = invoiceLine.InvoiceLineId, IsActive = true });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (sendNotification)
            {
                //id > 0 - for checking if invoice is already saved and for making sure notifications are not send everytime we capture but on AuthPay method call
                if (invoiceDetails.InvoiceId > 0)
                {
                    await _medicalWorkflowManagement.SendNotificationForICD10CodeMismatchMedicalInvoice(invoiceDetails);
                }
            }

            //Validate ICD10Code format
            foreach (InvoiceLineDetails line in invoiceDetails.InvoiceLineDetails)
            {
                var results = Utils.ValidationUtils.ValidateICD10CodeFormat(line.Icd10Code);
                var icd10CodeFormatUnderAssessReasonsResult = Utils.ValidationUtils.CheckICD10CodeFormatUnderAssessReasonsResult(results);
                var icd10CodeInvalidFormat = icd10CodeFormatUnderAssessReasonsResult.Contains(UnderAssessReasonEnum.icd10CodeSuppliedHasInvalidFormat);

                if (results.Count > 0 && icd10CodeInvalidFormat)
                {
                    var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.icd10CodeSuppliedHasInvalidFormat)?.Result;
                    if (underAssessReason != null)
                    {
                        invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.icd10CodeSuppliedHasInvalidFormat, UnderAssessReason = underAssessReason.Description, InvoiceLineId = line.InvoiceLineId, IsActive = true });
                    }

                    var iCD10CodeFormatValid = "{\"ICD10CodeFormatValid\": \"" + false + "\"}";
                    var ruleRequest = new RuleRequest()
                    {
                        Data = iCD10CodeFormatValid,
                        RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.ICD10CodeFormatValid.Constants.ICD10CodeFormatValidRuleName },
                        ExecutionFilter = "medical"
                    };
                    var iCD10CodeFormatIsVaidRuleResult = await _rulesEngine.ExecuteRules(ruleRequest);
                    if (iCD10CodeFormatIsVaidRuleResult != null && iCD10CodeFormatIsVaidRuleResult.RuleResults.Count > 0)
                    {
                        iCD10CodeFormatIsVaidRuleResult.RuleResults.ForEach(result =>
                        {
                            if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == result.RuleName))
                            {
                                invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                                {
                                    Passed = result.Passed,
                                    RuleName = result.RuleName,
                                    MessageList = result.MessageList
                                });
                            }
                        });
                    }
                }
                else
                {
                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.ICD10CodeFormatValid.Constants.ICD10CodeFormatValidRuleName))
                    {
                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = true,
                            RuleName = RuleTasks.MedicalInvoiceRules.ICD10CodeFormatValid.Constants.ICD10CodeFormatValidRuleName,
                            MessageList = new List<string>()
                        });
                    }
                }
            }

            //Check for Mutual Exclusive codes
            if (invoiceDetails.InvoiceLineDetails.Count > 1)
            {
                foreach (InvoiceLineDetails line in invoiceDetails.InvoiceLineDetails)
                {
                    var mutualExclusiveCodes = await _mediCareService.GetMutualExclusiveCodes(line.HcpTariffCode);
                    foreach (InvoiceLineDetails line2 in invoiceDetails.InvoiceLineDetails)
                    {
                        if (line2.HcpTariffCode != line.HcpTariffCode)
                        {
                            mutualExclusiveCodes.ForEach(x =>
                            {
                                if (line2.HcpTariffCode == x.MatchedCode)
                                {
                                    var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.thisCodeWillNotBePaidItIsMutuallyExclusiveWithAnotherCodeForThisDateOfService)?.Result;
                                    if (underAssessReason != null)
                                    {
                                        invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.thisCodeWillNotBePaidItIsMutuallyExclusiveWithAnotherCodeForThisDateOfService, UnderAssessReason = underAssessReason.Description, InvoiceLineId = line2.InvoiceLineId, IsActive = true });
                                    }
                                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.MutualExclusiveInclusive.Constants.MutualExclusiveInclusiveRuleName))
                                    {
                                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                                        {
                                            Passed = false,
                                            RuleName = RuleTasks.MedicalInvoiceRules.MutualExclusiveInclusive.Constants.MutualExclusiveInclusiveRuleName,
                                            MessageList = new List<string> { $"{x.MainCode} and {x.MatchedCode} are Mutually Exclusive." }
                                        });
                                    }
                                }
                                else
                                {
                                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.MutualExclusiveInclusive.Constants.MutualExclusiveInclusiveRuleName))
                                    {
                                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                                        {
                                            Passed = true,
                                            RuleName = RuleTasks.MedicalInvoiceRules.MutualExclusiveInclusive.Constants.MutualExclusiveInclusiveRuleName,
                                            MessageList = new List<string>()
                                        });
                                    }
                                }
                            });
                        }
                    }
                }
            }

            //Check for duplicate line items
            var duplicatesLineItems = invoiceDetails.InvoiceLineDetails.GroupBy(x => x).Where(g => g.Count() > 1).Select(g => g.Key).ToList();
            if (duplicatesLineItems.Count > 0)
            {
                duplicatesLineItems.ForEach(lineItem =>
                {
                    var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.lineItemIsADuplicate)?.Result;
                    if (underAssessReason != null)
                    {
                        invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.lineItemIsADuplicate, UnderAssessReason = underAssessReason.Description, InvoiceLineId = lineItem.InvoiceLineId, IsActive = true });
                    }
                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName))
                    {
                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = false,
                            RuleName = RuleTasks.MedicalInvoiceRules.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName,
                            MessageList = new List<string> { $"{lineItem.HcpTariffCode} is a duplicate." }
                        });
                    }
                });
            }
            else
            {
                if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName))
                {
                    invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = true,
                        RuleName = RuleTasks.MedicalInvoiceRules.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName,
                        MessageList = new List<string>()
                    });
                }
            }

            //Check for duplicate line item from db
            foreach (InvoiceLineDetails line in invoiceDetails.InvoiceLineDetails)
            {
                var results = await CheckForDuplicateLineItem(line.InvoiceLineId, (int)invoiceDetails.PersonEventId, invoiceDetails.HealthCareProviderId, line.TariffId, line.ServiceDate);

                if (results)
                {
                    var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.lineItemIsADuplicate)?.Result;
                    if (underAssessReason != null)
                    {
                        invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.lineItemIsADuplicate, UnderAssessReason = underAssessReason.Description, InvoiceLineId = line.InvoiceLineId, IsActive = true });
                    }
                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName))
                    {
                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = false,
                            RuleName = RuleTasks.MedicalInvoiceRules.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName,
                            MessageList = new List<string> { $"{line.HcpTariffCode} is a duplicate." }
                        });
                    }
                }
                else
                {
                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName))
                    {
                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = true,
                            RuleName = RuleTasks.MedicalInvoiceRules.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName,
                            MessageList = new List<string>()
                        });
                    }
                }
            }

            //Amount Not Greater Than Tariff validation
            var itemTolerance = await _medicalItemFacadeService.GetMedicalItemToleranceAsync();
            List<RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.RuleData> listInvoicelineData = new List<RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.RuleData>();
            foreach (InvoiceLineDetails currentInvoiceline in invoiceDetails.InvoiceLineDetails)
            {
                var tariffQuanity = await _mediCareService.GetTariff(currentInvoiceline.TariffId);
                RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.RuleData ruleData = new RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.RuleData
                {
                    AuthorisedAmount = Convert.ToDecimal(currentInvoiceline.AuthorisedAmount),
                    TariffAmount = Convert.ToDecimal(currentInvoiceline.TariffAmount),
                    ItemTolerance = Convert.ToDecimal(itemTolerance),
                    AuthorisedQuantity = Convert.ToUInt16(currentInvoiceline.AuthorisedQuantity),
                    TariffQuanity = Convert.ToUInt16(tariffQuanity.DefaultQuantity) != 0 ? Convert.ToUInt16(tariffQuanity.DefaultQuantity) : 1
                };

                listInvoicelineData.Add(ruleData);

                var amountNotGreaterThanTariffRuleRequest = new RuleRequest()
                {
                    Data = _serializer.Serialize(listInvoicelineData),
                    RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.Constants.AmountNotGreaterThanTariffRule },
                    ExecutionFilter = "medical"
                };

                var amountNotGreaterThanTariffRuleResult = await _rulesEngine.ExecuteRules(amountNotGreaterThanTariffRuleRequest);
                if (amountNotGreaterThanTariffRuleResult != null && amountNotGreaterThanTariffRuleResult.RuleResults.Count > 0)
                {
                    var ruleresultAmountNotGreaterThanTariffRule = amountNotGreaterThanTariffRuleResult.RuleResults.FirstOrDefault();
                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.Constants.AmountNotGreaterThanTariffRule))
                    {
                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = amountNotGreaterThanTariffRuleResult.OverallSuccess,
                            RuleName = ruleresultAmountNotGreaterThanTariffRule?.RuleName,
                            MessageList = ruleresultAmountNotGreaterThanTariffRule?.MessageList
                        });
                    }
                    if (!amountNotGreaterThanTariffRuleResult.OverallSuccess)
                    {
                        var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.lineItemRateExceedsTheAgreedTariff);
                        invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.lineItemRateExceedsTheAgreedTariff, UnderAssessReason = underAssessReason.Description, InvoiceLineId = currentInvoiceline.InvoiceLineId });
                    }
                }
            }

            //Check for rejected invoice lines
            var underAssessReasons = await _underAssessReasonService.GetLineUnderAssessReasons();
            foreach (var invoiceLine in invoiceDetails.InvoiceLineDetails)
            {
                var invoiceLineUnderAssessReasons = invoiceLine.InvoiceLineUnderAssessReasons.Where(u => u.UnderAssessReasonId > 0).ToList();

                var rejectedUnderAssessReasons = underAssessReasons.Where(x => invoiceLineUnderAssessReasons.Any(y => y.UnderAssessReasonId == x.UnderAssessReasonId) && x.Action == "Reject");

                if (rejectedUnderAssessReasons != null && rejectedUnderAssessReasons?.Count() > 0)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.NoValidLines);
                    invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.NoValidLines, UnderAssessReason = underAssessReason.Description, InvoiceLineId = invoiceLine.InvoiceLineId, IsActive = true });
                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.RejectedInvoiceLines.Constants.RejectedInvoiceLineRuleName))
                    {
                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = false,
                            RuleName = RuleTasks.MedicalInvoiceRules.RejectedInvoiceLines.Constants.RejectedInvoiceLineRuleName,
                            MessageList = new List<string> { $"{invoiceLine.HcpTariffCode} is rejected." }
                        });
                    }
                }
                else
                {
                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.RejectedInvoiceLines.Constants.RejectedInvoiceLineRuleName))
                    {
                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = true,
                            RuleName = RuleTasks.MedicalInvoiceRules.RejectedInvoiceLines.Constants.RejectedInvoiceLineRuleName,
                            MessageList = new List<string>()
                        });
                    }
                }
            }

            invoiceLineValidations.RuleRequestResult.OverallSuccess = true;
            invoiceLineValidations.RuleRequestResult.RuleResults.ForEach(ruleResult =>
            {
                if (!ruleResult.Passed)
                {
                    invoiceLineValidations.RuleRequestResult.OverallSuccess = false;
                }
            });

            return invoiceLineValidations;
        }

        public async Task<InvoiceValidationModel> ExecuteTebaInvoiceLineValidations(Contracts.Entities.Medical.TebaInvoice tebaInvoice)
        {
            Contract.Requires(tebaInvoice != null);
            var invoiceLineValidations = new InvoiceValidationModel();
            invoiceLineValidations.RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() };
            invoiceLineValidations.LineUnderAssessReasons = new List<InvoiceLineUnderAssessReason>();

            //Check for duplicate line items
            var duplicatesLineItems = tebaInvoice.TebaInvoiceLines.GroupBy(x => x).Where(g => g.Count() > 1).Select(g => g.Key).ToList();
            if (duplicatesLineItems.Count > 0)
            {
                duplicatesLineItems.ForEach(lineItem =>
                {
                    var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.lineItemIsADuplicate)?.Result;
                    if (underAssessReason != null)
                    {
                        invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.lineItemIsADuplicate, UnderAssessReason = underAssessReason.Description, InvoiceLineId = 0, TebaInvoiceLineId = lineItem.TebaInvoiceLineId, IsActive = true });
                    }
                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName))
                    {
                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = false,
                            RuleName = RuleTasks.MedicalInvoiceRules.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName,
                            MessageList = new List<string> { $"{lineItem.HcpTariffCode} is a duplicate." }
                        });
                    }
                });
            }
            else
            {
                if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName))
                {
                    invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = true,
                        RuleName = RuleTasks.MedicalInvoiceRules.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName,
                        MessageList = new List<string>()
                    });
                }
            }

            //Check for duplicate line item from db
            foreach (TebaInvoiceLine line in tebaInvoice.TebaInvoiceLines)
            {
                var results = await CheckForDuplicateTebaLineItem(line.TebaInvoiceLineId, (int)tebaInvoice.PersonEventId, tebaInvoice.InvoicerId, line.TariffId, line.ServiceDate);

                if (results)
                {
                    var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.lineItemIsADuplicate)?.Result;
                    if (underAssessReason != null)
                    {
                        invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.lineItemIsADuplicate, UnderAssessReason = underAssessReason.Description, InvoiceLineId = 0, TebaInvoiceLineId = line.TebaInvoiceLineId, IsActive = true });
                    }
                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName))
                    {
                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = false,
                            RuleName = RuleTasks.MedicalInvoiceRules.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName,
                            MessageList = new List<string> { $"{line.HcpTariffCode} is a duplicate." }
                        });
                    }
                }
                else
                {
                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName))
                    {
                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = true,
                            RuleName = RuleTasks.MedicalInvoiceRules.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName,
                            MessageList = new List<string>()
                        });
                    }
                }
            }

            //Check for rejected invoice lines
            var underAssessReasons = await _underAssessReasonService.GetLineUnderAssessReasons();
            foreach (var invoiceLine in tebaInvoice.TebaInvoiceLines)
            {
                var invoiceLineUnderAssessReasons = invoiceLine.InvoiceLineUnderAssessReasons.Where(u => u.UnderAssessReasonId > 0).ToList();

                var rejectedUnderAssessReasons = underAssessReasons.Where(x => invoiceLineUnderAssessReasons.Any(y => y.UnderAssessReasonId == x.UnderAssessReasonId) && x.Action == "Reject");

                if (rejectedUnderAssessReasons != null && rejectedUnderAssessReasons?.Count() > 0)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.NoValidLines);
                    invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.NoValidLines, UnderAssessReason = underAssessReason.Description, InvoiceLineId = 0, TebaInvoiceLineId = invoiceLine.TebaInvoiceLineId, IsActive = true });
                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.RejectedInvoiceLines.Constants.RejectedInvoiceLineRuleName))
                    {
                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = false,
                            RuleName = RuleTasks.MedicalInvoiceRules.RejectedInvoiceLines.Constants.RejectedInvoiceLineRuleName,
                            MessageList = new List<string> { $"{invoiceLine.HcpTariffCode} is rejected." }
                        });
                    }
                }
                else
                {
                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.RejectedInvoiceLines.Constants.RejectedInvoiceLineRuleName))
                    {
                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = true,
                            RuleName = RuleTasks.MedicalInvoiceRules.RejectedInvoiceLines.Constants.RejectedInvoiceLineRuleName,
                            MessageList = new List<string>()
                        });
                    }
                }
            }

            invoiceLineValidations.RuleRequestResult.OverallSuccess = true;
            invoiceLineValidations.RuleRequestResult.RuleResults.ForEach(ruleResult =>
            {
                if (!ruleResult.Passed)
                {
                    invoiceLineValidations.RuleRequestResult.OverallSuccess = false;
                }
            });

            return invoiceLineValidations;
        }

        public async Task<ClaimDetailsForSTPIntegration> GetClaimValidationsSTPIntegration(string claimReferenceNumber)
        {
            return await _medicalInvoiceClaimService.GetClaimDetailsForSTPIntegration(claimReferenceNumber);
        }

        public async Task<bool> CheckClaimMedicalBenefitsExistValidationsSTPIntegration(string claimReferenceNumber)
        {
            return await _medicalInvoiceClaimService.CheckClaimMedicalBenefitsExistForSTPIntegration(claimReferenceNumber);
        }

        public async Task<string> GetClaimInjuryDetailsValidationsSTPIntegration(string claimReferenceNumber, List<InvoiceLineICD10Code> invoiceLineInjuries)
        {
            ICD10InjuryData icd10InjuryData = new ICD10InjuryData();
            var claimInjuries = await _medicalInvoiceClaimService.GetClaimInjuryDetailsForSTPIntegration(claimReferenceNumber);

            List<ICD10Injury> claimInjuryList = new List<ICD10Injury>();
            foreach (var injury in claimInjuries)
            {
                claimInjuryList.Add(new ICD10Injury { ICD10CodeId = injury.Icd10CodeId, ICD10Code = injury.Icd10Code, BodySideId = Convert.ToInt32(injury.BodySideAffectedType), ICD10DiagnosticGroupId = injury.ICD10DiagnosticGroupId, ICD10DiagnosticGroupCode = injury.ICD10DiagnosticGroupCode, ICD10CategoryId = injury.ICD10CategoryId, ICD10CategoryCode = injury.ICD10CategoryCode, IsPrimary = injury.IsPrimary });
            }

            icd10InjuryData.ClaimInjuries = claimInjuryList;

            List<ICD10Injury> invoiceLineInjuryList = new List<ICD10Injury>();
            if (invoiceLineInjuries != null)
            {
                foreach (var invoiceLineInjury in invoiceLineInjuries)
                {
                    var icd10CodeModel = await _icd10CodeService.FilterICD10Code(invoiceLineInjury.Icd10Code);//might change once we have more clarity for STP
                    if (icd10CodeModel?.Count > 0)
                    {
                        invoiceLineInjuryList.Add(new ICD10Injury { ICD10CodeId = (int)invoiceLineInjury.Icd10CodeId, ICD10Code = invoiceLineInjury.Icd10Code, BodySideId = invoiceLineInjury.BodySideId, ICD10DiagnosticGroupId = icd10CodeModel[0].Icd10DiagnosticGroupId, ICD10DiagnosticGroupCode = icd10CodeModel[0].Icd10DiagnosticGroupCode, ICD10CategoryId = icd10CodeModel[0].Icd10CategoryId, ICD10CategoryCode = icd10CodeModel[0].Icd10CategoryCode, IsPrimary = true });
                    }
                }
            }
            icd10InjuryData.ICD10CodesToValidate = invoiceLineInjuryList;

            return JsonConvert.SerializeObject(icd10InjuryData);
        }

        public async Task<InvoiceValidationModel> ExecuteInvoiceValidationsSTPIntegration(InvoiceDetails invoiceDetails)
        {
            var invoiceValidations = new InvoiceValidationModel();
            invoiceValidations.RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() };
            invoiceValidations.UnderAssessReasons = new List<InvoiceUnderAssessReason>();
            if (invoiceDetails != null)
            {
                var resultInvoiceCompCareMap = await _invoiceCompCareMapService.GetInvoiceCompCareMapByInvoiceId(invoiceDetails.InvoiceId);
                var medicalInvoiceClaimQuery = await GetClaimValidationsSTPIntegration(resultInvoiceCompCareMap.ClaimReferenceNumber);

                //Claim Liability Status Rule
                string liabilityStatus = string.Empty;
                liabilityStatus = medicalInvoiceClaimQuery.ClaimLiabilityStatus;
                var ruleDataLiabilityStatus = "{\"LiabilityStatus\": \"" + liabilityStatus + "\"}";
                var ruleRequestClaimLiabilityStatus = new RuleRequest()
                {
                    Data = ruleDataLiabilityStatus,
                    RuleNames = new List<string>() { "Claim liability status validation" },
                    ExecutionFilter = "medical"
                };
                var liabilityStatusResult = await _rulesEngine.ExecuteRules(ruleRequestClaimLiabilityStatus);
                if (liabilityStatusResult != null && liabilityStatusResult.RuleResults.Count > 0)
                {
                    liabilityStatusResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.claimLiabilityNotAccepted)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.claimLiabilityNotAccepted, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                            }
                        }
                    });
                }

                //Treatment From date after date of death

                var ruleDataTreatmentFromDateAfterDateOfDeath = "{\"TreatmentFromDate\": \"" + invoiceDetails.DateAdmitted + "\",\"DateOfDeath\": \"" + medicalInvoiceClaimQuery.DateOfDeath + "\"}";
                var ruleRequestTreatmentFromDateAfterDateOfDeath = new RuleRequest()
                {
                    Data = ruleDataTreatmentFromDateAfterDateOfDeath,
                    RuleNames = new List<string>() { "MedicalInvoice Date of Death validation against DateFrom" },
                    ExecutionFilter = "medical"
                };
                var treatmentFromDateAfterDateOfDeathResult = await _rulesEngine.ExecuteRules(ruleRequestTreatmentFromDateAfterDateOfDeath);
                if (treatmentFromDateAfterDateOfDeathResult != null && treatmentFromDateAfterDateOfDeathResult.RuleResults.Count > 0)
                {
                    treatmentFromDateAfterDateOfDeathResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.serviceDateAfterDateOfDeath)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.serviceDateAfterDateOfDeath, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                            }
                        }
                    });
                }

                //Treatment To date after date of death
                var ruleDataTreatmentToDateAfterDateOfDeath = "{\"TreatmentToDate\": \"" + invoiceDetails.DateDischarged + "\",\"DateOfDeath\": \"" + medicalInvoiceClaimQuery.DateOfDeath + "\"}";
                var ruleRequestTreatmentToDateAfterDateOfDeath = new RuleRequest()
                {
                    Data = ruleDataTreatmentToDateAfterDateOfDeath,
                    RuleNames = new List<string>() { "MedicalInvoice Date of Death validation" },
                    ExecutionFilter = "medical"
                };
                var treatmentToDateAfterDateOfDeathResult = await _rulesEngine.ExecuteRules(ruleRequestTreatmentToDateAfterDateOfDeath);
                if (treatmentToDateAfterDateOfDeathResult != null && treatmentToDateAfterDateOfDeathResult.RuleResults.Count > 0)
                {
                    treatmentToDateAfterDateOfDeathResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.serviceDateAfterDateOfDeath)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.serviceDateAfterDateOfDeath, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                            }
                        }
                    });
                }

                //Treatment From date before EventDate
                var ruleDataTreatmentFromDateBeforeEventDate = "{\"EventDate\": \"" + medicalInvoiceClaimQuery.EventDate + "\",\"TreatmentFromDate\": \"" + invoiceDetails.DateAdmitted + "\"}";
                var ruleRequestTreatmentFromDateBeforeEventDate = new RuleRequest()
                {
                    Data = ruleDataTreatmentFromDateBeforeEventDate,
                    RuleNames = new List<string>() { "MedicalInvoice Event Date validation against Treatment From Date" },
                    ExecutionFilter = "medical"
                };
                var treatmentFromDateBeforeEventDateResult = await _rulesEngine.ExecuteRules(ruleRequestTreatmentFromDateBeforeEventDate);
                if (treatmentFromDateBeforeEventDateResult != null && treatmentFromDateBeforeEventDateResult.RuleResults.Count > 0)
                {
                    treatmentFromDateBeforeEventDateResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                            }
                        }
                    });
                }

                //Treatment To date before EventDate
                var ruleDataTreatmentToDateBeforeEventDate = "{\"EventDate\": \"" + medicalInvoiceClaimQuery.EventDate + "\",\"TreatmentToDate\": \"" + invoiceDetails.DateDischarged + "\"}";
                var ruleRequestTreatmentToDateBeforeEventDate = new RuleRequest()
                {
                    Data = ruleDataTreatmentToDateBeforeEventDate,
                    RuleNames = new List<string>() { "MedicalInvoice Event Date validation against Treatment To Date" },
                    ExecutionFilter = "medical"
                };
                var treatmentToDateBeforeEventDateResult = await _rulesEngine.ExecuteRules(ruleRequestTreatmentToDateBeforeEventDate);
                if (treatmentToDateBeforeEventDateResult != null && treatmentToDateBeforeEventDateResult.RuleResults.Count > 0)
                {
                    treatmentToDateBeforeEventDateResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                            }
                        }
                    });
                }

                //Invoice Date Before Event Date
                var ruleDataInvoiceDateBeforeEventDate = "{\"EventDate\": \"" + medicalInvoiceClaimQuery.EventDate + "\",\"InvoiceDate\": \"" + invoiceDetails.InvoiceDate + "\"}";
                var ruleRequestInvoiceDateBeforeEventDate = new RuleRequest()
                {
                    Data = ruleDataInvoiceDateBeforeEventDate,
                    RuleNames = new List<string>() { "MedicalInvoice Event Date validation against Invoice Date" },
                    ExecutionFilter = "medical"
                };
                var invoiceDateBeforeEventDateResult = await _rulesEngine.ExecuteRules(ruleRequestInvoiceDateBeforeEventDate);
                if (invoiceDateBeforeEventDateResult != null && invoiceDateBeforeEventDateResult.RuleResults.Count > 0)
                {
                    invoiceDateBeforeEventDateResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                            }
                        }
                    });
                }

                //Medical Benefit Rule
                var medicalBenefitsExist = await CheckClaimMedicalBenefitsExistValidationsSTPIntegration(resultInvoiceCompCareMap.ClaimReferenceNumber);
                var ruleDataMedicalBenefit = "{\"MedicalBenefitExists\": \"" + medicalBenefitsExist + "\"}";
                var ruleRequestMedicalBenefit = new RuleRequest()
                {
                    Data = ruleDataMedicalBenefit,
                    RuleNames = new List<string>() { "Medical benefit validation" },
                    ExecutionFilter = "medical"
                };
                var medicalBenefitResult = await _rulesEngine.ExecuteRules(ruleRequestMedicalBenefit);
                if (medicalBenefitResult != null && medicalBenefitResult.RuleResults.Count > 0)
                {
                    medicalBenefitResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.noMedicalCover)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.noMedicalCover, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                            }
                        }
                    });
                }

                //Amount Limit Validation
                //will get from MOD - since this is system driven we don't have a user & role - limit is 5000
                var limitSTPAutoPay = await _configurationService.GetModuleSetting(SystemSettings.STPAutoPayLimit);
                var totalAmountLimit = String.IsNullOrEmpty(limitSTPAutoPay) ? 0 : Decimal.Parse(limitSTPAutoPay);
                var ruleDataAmountLimit = "{\"TotalAmountLimit\": \"" + totalAmountLimit + "\",\"InvoiceAmount\": \"" + invoiceDetails.InvoiceAmount.ToString().Replace(",", ".") + "\"}";
                var ruleRequestAmountLimit = new RuleRequest()
                {
                    Data = ruleDataAmountLimit,
                    RuleNames = new List<string>() { "Amount Limit Validation." },
                    ExecutionFilter = "medical"
                };
                var amountLimitResult = await _rulesEngine.ExecuteRules(ruleRequestAmountLimit);
                if (amountLimitResult != null && amountLimitResult.RuleResults.Count > 0)
                {
                    amountLimitResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.TotAmtLimit)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.TotAmtLimit, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                            }
                        }
                    });
                }

                //Duplicate Invoice
                //For STP Integrtion - Invoices comming from CompCare have already been checked for duplicates so we simply run check on Modernization
                var ruleDataDuplicateInvoice = await CheckForDuplicateInvoice(new Invoice()
                {
                    InvoiceId = invoiceDetails.InvoiceId,
                    HealthCareProviderId = invoiceDetails.HealthCareProviderId,
                    PersonEventId = invoiceDetails.PersonEventId,
                    HcpInvoiceNumber = invoiceDetails.HcpInvoiceNumber,
                    InvoiceDate = invoiceDetails.InvoiceDate,
                    DateAdmitted = invoiceDetails.DateAdmitted,
                    DateDischarged = invoiceDetails.DateDischarged
                });
                var ruleRequestDataDuplicateInvoice = new RuleRequest()
                {
                    Data = ruleDataDuplicateInvoice,
                    RuleNames = new List<string>() { "Duplicate invoice validation" },
                    ExecutionFilter = "medical"
                };
                var duplicateInvoiceResult = await _rulesEngine.ExecuteRules(ruleRequestDataDuplicateInvoice);
                if (duplicateInvoiceResult != null && duplicateInvoiceResult.RuleResults.Count > 0)
                {
                    duplicateInvoiceResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.invoiceIsADuplicate)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.invoiceIsADuplicate, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, TebaInvoiceId = null, IsActive = true });
                            }
                        }
                    });
                }

                //Check If Medical Report Required and if Medical Report exists
                //leave as is as the HCP and practitionerType tables will be migrated                
                int prevUnderAssessReasonID = 0;
                var personEvent = await _eventService.GetPersonEvent(Convert.ToInt32(invoiceDetails.PersonEventId));
                var resultCompCare = await CheckMedicalReportFromCompCare((int)personEvent.CompCarePersonEventId, resultInvoiceCompCareMap.CompCareHealthCareProviderId, (DateTime)invoiceDetails.DateAdmitted, prevUnderAssessReasonID);

                if (resultCompCare != null)
                {
                    invoiceDetails.IsMedicalReportExist = resultCompCare.IsMedReportFound;
                }
                var ruleDataMedicalReport = "{\"IsMedicalReportExist\": \"" + resultCompCare.IsMedReportFound + "\",\"IsMedicalReportRequired\": \"" + resultCompCare.IsMSPRequireMedReport + "\"}";
                var ruleRequestMedicalReport = new RuleRequest()
                {
                    Data = ruleDataMedicalReport,
                    RuleNames = new List<string>() { "Medical Report Check validation" },
                    ExecutionFilter = "medical"
                };
                var medicalReportResult = await _rulesEngine.ExecuteRules(ruleRequestMedicalReport);
                if (medicalReportResult != null && medicalReportResult.RuleResults.Count > 0)
                {
                    medicalReportResult.RuleResults.ForEach(result =>
                    {
                        invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = result.Passed,
                            RuleName = result.RuleName,
                            MessageList = result.MessageList
                        });

                        if (!result.Passed)
                        {
                            var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.medicalReportNotFoundForTreatingDoctor)?.Result;
                            if (underAssessReason != null)
                            {
                                invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.medicalReportNotFoundForTreatingDoctor, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                            }
                        }
                    });
                }

                //HealthcareProvider Active Status
                //get HCP data from Compcare for STPIntegration
                var healthCareProviderIsActive = await GetHealthCareProviderByIdForSTPIntegration(resultInvoiceCompCareMap.CompCareHealthCareProviderId);
                if (!healthCareProviderIsActive.IsActive)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.thePracticeIsInactive);
                    invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.thePracticeIsInactive, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });

                    invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = false,
                        RuleName = RuleTasks.MedicalInvoiceRules.HealthCareProviderActive.Constants.HealthCareProviderActiveRuleName,
                        MessageList = new List<string> { "Healthcare Provider is not active." }
                    });
                }
                else
                {
                    invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = true,
                        RuleName = RuleTasks.MedicalInvoiceRules.HealthCareProviderActive.Constants.HealthCareProviderActiveRuleName,
                        MessageList = new List<string> { "Healthcare Provider is active." }
                    });
                }

                //Check if invoice has at Least 1 Line Item
                if (invoiceDetails.InvoiceLineDetails.Count < 1)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.InvNoLines);
                    invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.InvNoLines, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });

                    invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = false,
                        RuleName = RuleTasks.MedicalInvoiceRules.InvoiceHasAtleastOneLineItem.Constants.InvoiceHasAtleastOneLineItemRuleName,
                        MessageList = new List<string> { "Invoice requires at least 1 line item" }
                    });
                }
                else
                {
                    invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = true,
                        RuleName = RuleTasks.MedicalInvoiceRules.InvoiceHasAtleastOneLineItem.Constants.InvoiceHasAtleastOneLineItemRuleName,
                        MessageList = new List<string> { "Invoice has at least 1 line item" }
                    });
                }

                //Check if Invoice total matches line items total
                var invoiceTotalsMatch = await CompareMedicalInvoiceAndLineTotals(invoiceDetails);
                if (!invoiceTotalsMatch)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.TotMisMatch);
                    invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.TotMisMatch, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                }

                //Check if claim is STP
                //Since Claim is posting STP notifications on Modernisation, this rule will work as is - no modifications for STPintegration
                if (personEvent != null && !personEvent.IsStraightThroughProcess)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.IsNotSTP);
                    invoiceValidations.UnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.IsNotSTP, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });

                    invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = false,
                        RuleName = RuleTasks.MedicalInvoiceRules.IsSTP.Constants.InvoiceIsSTPRuleName,
                        MessageList = new List<string> { "Invoice is not STP" }
                    });
                }
                else
                {
                    invoiceValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = true,
                        RuleName = RuleTasks.MedicalInvoiceRules.IsSTP.Constants.InvoiceIsSTPRuleName,
                        MessageList = new List<string> { "Invoice is Straight Through Process" }
                    });
                }
            }
            invoiceValidations.RuleRequestResult.OverallSuccess = true;
            invoiceValidations.RuleRequestResult.RuleResults.ForEach(ruleResult =>
            {
                if (!ruleResult.Passed)
                {
                    invoiceValidations.RuleRequestResult.OverallSuccess = false;
                }
            });
            return invoiceValidations;
        }

        public async Task<InvoiceValidationModel> ExecuteInvoiceLineValidationsSTPIntegration(InvoiceDetails invoiceDetails)
        {
            Contract.Requires(invoiceDetails != null);
            var invoiceLineValidations = new InvoiceValidationModel();
            invoiceLineValidations.RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() };
            invoiceLineValidations.LineUnderAssessReasons = new List<InvoiceLineUnderAssessReason>();

            var resultInvoiceCompCareMap = await _invoiceCompCareMapService.GetInvoiceCompCareMapByInvoiceId(invoiceDetails.InvoiceId);
            //Line Item ICD10Code Validations in a Sequence
            var invoiceLineIcd10Code = string.Empty;
            string[] invoiceLineIcd10Codes;
            char[] splitters = new char[] { ' ', '/' };
            var iCD10CodePractitionerTypeMappingIsValidRuleResult = new RuleRequestResult();
            var icd10CodeMatchRuleResult = new RuleRequestResult();
            var icd10CodeExternalRuleResult = new RuleRequestResult();

            //get claim icd10 list from compcare
            //remove any check that looks at preauth inside this checks
            //Validate ICD10Code and PractitionerType Mapping
            foreach (InvoiceLineDetails invoiceLine in invoiceDetails.InvoiceLineDetails)
            {
                if (invoiceLineIcd10Code != invoiceLine.Icd10Code)
                {
                    invoiceLineIcd10Code = invoiceLine.Icd10Code;
                    invoiceLineIcd10Codes = invoiceLineIcd10Code.Split(splitters, StringSplitOptions.RemoveEmptyEntries);

                    List<InvoiceLineICD10Code> invoiceLineICD10Codes = new List<InvoiceLineICD10Code>();
                    foreach (var icd10Code in invoiceLineIcd10Codes)
                    {
                        if (!invoiceLineICD10Codes.Any(line => line.Icd10Code.Trim() == icd10Code.Trim()) && !string.IsNullOrWhiteSpace(icd10Code.Trim()))
                            invoiceLineICD10Codes.Add(new InvoiceLineICD10Code() { Icd10CodeId = 0, Icd10Code = icd10Code.Trim(), BodySideId = 0 });
                    }

                    //leave as is as the exclussion list is on MOD FindICD10CodePractitionerTypeMapping
                    var mappingFound = await _icd10CodeService.FindICD10CodePractitionerTypeMapping(invoiceDetails.PractitionerTypeId, invoiceLineICD10Codes);

                    var ruleData = "{\"ICD10CodePractitionerTypeMappingFound\": \"" + mappingFound + "\"}";
                    var ruleRequest = new RuleRequest()
                    {
                        Data = ruleData,
                        RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.ICD10CodePractitionerTypeMapping.Constants.ICD10CodePractitionerTypeMappingRuleName },
                        ExecutionFilter = "medical"
                    };

                    iCD10CodePractitionerTypeMappingIsValidRuleResult = await _rulesEngine.ExecuteRules(ruleRequest);

                    if (iCD10CodePractitionerTypeMappingIsValidRuleResult?.RuleResults.Count > 0)
                    {
                        var ruleResult = iCD10CodePractitionerTypeMappingIsValidRuleResult.RuleResults.FirstOrDefault();
                        if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.ICD10CodePractitionerTypeMapping.Constants.ICD10CodePractitionerTypeMappingRuleName))
                        {
                            invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                            {
                                Passed = ruleResult.Passed,
                                RuleName = ruleResult?.RuleName,
                                MessageList = ruleResult?.MessageList
                            });
                        }

                        if (!ruleResult.Passed)
                        {
                            //get this list from Compcare
                            //write SP to get this list
                            //Validate ICD10Codes on Medical Invoice against Claim Injury
                            //set the preauth to 0 or remove preauth ID
                            //for this GetMedicalInvoiceClaimInjury = primary hget from Compcare -set IsPrimary to true
                            //GetMedicalInvoiceClaimSecondaryInjuries - secondary
                            //get claim injury from compcare run validations
                            //only get the data via SP and build JsonConvert.SerializeObject(icd10InjuryData); to pass to rule
                            //string ruleDataICD10Codes = await GetInvoiceLineClaimInjuriesAsync(Convert.ToInt32(invoiceDetails.PersonEventId), 0, invoiceLineICD10Codes); - old remove
                            string ruleDataICD10Codes = await GetClaimInjuryDetailsValidationsSTPIntegration(resultInvoiceCompCareMap.ClaimReferenceNumber, invoiceLineICD10Codes);
                            var ruleRequestICD10Codes = new RuleRequest()
                            {
                                Data = ruleDataICD10Codes,
                                RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.ICD10CodeMatch.Constants.MedicalInvoiceClaimInjuryName },
                                ExecutionFilter = "medical"
                            };

                            icd10CodeMatchRuleResult = await _rulesEngine.ExecuteRules(ruleRequestICD10Codes);

                            if (icd10CodeMatchRuleResult?.RuleResults.Count > 0)
                            {
                                ruleResult = icd10CodeMatchRuleResult.RuleResults.FirstOrDefault();
                                if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.ICD10CodeMatch.Constants.MedicalInvoiceClaimInjuryName))
                                {
                                    invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                                    {
                                        Passed = icd10CodeMatchRuleResult.OverallSuccess,
                                        RuleName = ruleResult?.RuleName,
                                        MessageList = ruleResult?.MessageList
                                    });
                                }

                                if (!icd10CodeMatchRuleResult.OverallSuccess)
                                {
                                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.icd10CodeMismatchToClaimICD10);
                                    if (underAssessReason != null)
                                    {
                                        invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.icd10CodeMismatchToClaimICD10, UnderAssessReason = underAssessReason.Description, InvoiceLineId = invoiceLine.InvoiceLineId, IsActive = true });
                                    }

                                    //leave this as is as data is already on MOD
                                    //External Cause Code Validation
                                    List<int> icd10CodeIds = new List<int>();
                                    foreach (var icd10Code in invoiceLineIcd10Codes)
                                    {
                                        var icd10CodeResult = await _icd10CodeService.FilterICD10Code(icd10Code);
                                        if (icd10CodeResult?.Count > 0)
                                            icd10CodeIds.Add(icd10CodeResult[0].Icd10CodeId);
                                    }

                                    var isOnlyExternalICD10CauseCodeSupplied = await _icd10CodeService.IsOnlyExternalICD10CauseCodeSupplied(icd10CodeIds);
                                    var externalCauseCodeResult = "{\"IsOnlyExternalICD10CauseCodeSupplied\": \"" + isOnlyExternalICD10CauseCodeSupplied.ToString() + "\"}";

                                    var ruleRequestExternal = new RuleRequest()
                                    {
                                        Data = externalCauseCodeResult,
                                        RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.ExternalCauseCode.Constants.ExternalCauseCodeRuleName },
                                        ExecutionFilter = "medical"
                                    };

                                    icd10CodeExternalRuleResult = await _rulesEngine.ExecuteRules(ruleRequestExternal);

                                    if (icd10CodeExternalRuleResult?.RuleResults.Count > 0)
                                    {
                                        ruleResult = icd10CodeExternalRuleResult.RuleResults.FirstOrDefault();
                                        if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.ExternalCauseCode.Constants.ExternalCauseCodeRuleName))
                                        {
                                            invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                                            {
                                                Passed = icd10CodeExternalRuleResult.OverallSuccess,
                                                RuleName = ruleResult?.RuleName,
                                                MessageList = ruleResult?.MessageList
                                            });
                                        }

                                        if (!icd10CodeExternalRuleResult.OverallSuccess)
                                        {
                                            underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.onlyExternalICD10CauseCodeSupplied);
                                            if (underAssessReason != null)
                                            {
                                                invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.onlyExternalICD10CauseCodeSupplied, UnderAssessReason = underAssessReason.Description, InvoiceLineId = invoiceLine.InvoiceLineId, IsActive = true });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                else
                {
                    if (iCD10CodePractitionerTypeMappingIsValidRuleResult?.RuleResults.Count > 0)
                    {
                        var ruleResult = iCD10CodePractitionerTypeMappingIsValidRuleResult.RuleResults.FirstOrDefault();
                        if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.ICD10CodePractitionerTypeMapping.Constants.ICD10CodePractitionerTypeMappingRuleName))
                        {
                            invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                            {
                                Passed = ruleResult.Passed,
                                RuleName = ruleResult?.RuleName,
                                MessageList = ruleResult?.MessageList
                            });
                        }

                        if (!ruleResult.Passed)
                        {
                            //ICD10Codes on Medical Invoice against Claim Injury Result
                            if (icd10CodeMatchRuleResult?.RuleResults.Count > 0)
                            {
                                ruleResult = icd10CodeMatchRuleResult.RuleResults.FirstOrDefault();
                                if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.ICD10CodeMatch.Constants.MedicalInvoiceClaimInjuryName))
                                {
                                    invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                                    {
                                        Passed = icd10CodeMatchRuleResult.OverallSuccess,
                                        RuleName = ruleResult?.RuleName,
                                        MessageList = ruleResult?.MessageList
                                    });
                                }

                                if (!icd10CodeMatchRuleResult.OverallSuccess)
                                {
                                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.icd10CodeMismatchToClaimICD10);
                                    if (underAssessReason != null)
                                    {
                                        invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.onlyExternalICD10CauseCodeSupplied, UnderAssessReason = underAssessReason.Description, InvoiceLineId = invoiceLine.InvoiceLineId, IsActive = true });
                                    }

                                    //External Cause Code Result
                                    if (icd10CodeExternalRuleResult?.RuleResults.Count > 0)
                                    {
                                        ruleResult = icd10CodeExternalRuleResult.RuleResults.FirstOrDefault();
                                        if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.ExternalCauseCode.Constants.ExternalCauseCodeRuleName))
                                        {
                                            invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                                            {
                                                Passed = icd10CodeExternalRuleResult.OverallSuccess,
                                                RuleName = ruleResult?.RuleName,
                                                MessageList = ruleResult?.MessageList
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            //leave as is - ideally this should be the first validation and also correct for MOD STP
            //Validate ICD10Code format
            foreach (InvoiceLineDetails line in invoiceDetails.InvoiceLineDetails)
            {
                var results = Utils.ValidationUtils.ValidateICD10CodeFormat(line.Icd10Code);
                if (results.Count > 0)
                {
                    var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.icd10CodeSuppliedHasInvalidFormat)?.Result;
                    if (underAssessReason != null)
                    {
                        invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.icd10CodeSuppliedHasInvalidFormat, UnderAssessReason = underAssessReason.Description, InvoiceLineId = line.InvoiceLineId, IsActive = true });
                    }

                    var iCD10CodeFormatValid = "{\"ICD10CodeFormatValid\": \"" + false + "\"}";
                    var ruleRequest = new RuleRequest()
                    {
                        Data = iCD10CodeFormatValid,
                        RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.ICD10CodeFormatValid.Constants.ICD10CodeFormatValidRuleName },
                        ExecutionFilter = "medical"
                    };
                    var iCD10CodeFormatIsVaidRuleResult = await _rulesEngine.ExecuteRules(ruleRequest);
                    if (iCD10CodeFormatIsVaidRuleResult != null && iCD10CodeFormatIsVaidRuleResult.RuleResults.Count > 0)
                    {
                        iCD10CodeFormatIsVaidRuleResult.RuleResults.ForEach(result =>
                        {
                            if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == result.RuleName))
                            {
                                invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                                {
                                    Passed = result.Passed,
                                    RuleName = result.RuleName,
                                    MessageList = result.MessageList
                                });
                            }
                        });
                    }
                }
                else
                {
                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.ICD10CodeFormatValid.Constants.ICD10CodeFormatValidRuleName))
                    {
                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = true,
                            RuleName = RuleTasks.MedicalInvoiceRules.ICD10CodeFormatValid.Constants.ICD10CodeFormatValidRuleName,
                            MessageList = new List<string>()
                        });
                    }
                }
            }

            //leave as is - will check whether data is there on not
            //Check for Mutual Exclusive codes
            if (invoiceDetails.InvoiceLineDetails.Count > 1)
            {
                foreach (InvoiceLineDetails line in invoiceDetails.InvoiceLineDetails)
                {
                    var mutualExclusiveCodes = await _mediCareService.GetMutualExclusiveCodes(line.HcpTariffCode);
                    foreach (InvoiceLineDetails line2 in invoiceDetails.InvoiceLineDetails)
                    {
                        if (line2.HcpTariffCode != line.HcpTariffCode)
                        {
                            mutualExclusiveCodes.ForEach(x =>
                            {
                                if (line2.HcpTariffCode == x.MatchedCode)
                                {
                                    var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.thisCodeWillNotBePaidItIsMutuallyExclusiveWithAnotherCodeForThisDateOfService)?.Result;
                                    if (underAssessReason != null)
                                    {
                                        invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.thisCodeWillNotBePaidItIsMutuallyExclusiveWithAnotherCodeForThisDateOfService, UnderAssessReason = underAssessReason.Description, InvoiceLineId = line2.InvoiceLineId, IsActive = true });
                                    }
                                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.MutualExclusiveInclusive.Constants.MutualExclusiveInclusiveRuleName))
                                    {
                                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                                        {
                                            Passed = false,
                                            RuleName = RuleTasks.MedicalInvoiceRules.MutualExclusiveInclusive.Constants.MutualExclusiveInclusiveRuleName,
                                            MessageList = new List<string> { $"{x.MainCode} and {x.MatchedCode} are Mutually Exclusive." }
                                        });
                                    }
                                }
                                else
                                {
                                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.MutualExclusiveInclusive.Constants.MutualExclusiveInclusiveRuleName))
                                    {
                                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                                        {
                                            Passed = true,
                                            RuleName = RuleTasks.MedicalInvoiceRules.MutualExclusiveInclusive.Constants.MutualExclusiveInclusiveRuleName,
                                            MessageList = new List<string>()
                                        });
                                    }
                                }
                            });
                        }
                    }
                }
            }

            //run duplicate on MOD
            //also check if line is Duplicate on Compcare
            //leave this one for last as we already run these validation - last implemented once all validation are in place
            //Check for duplicate line items
            var duplicatesLineItems = invoiceDetails.InvoiceLineDetails.GroupBy(x => x).Where(g => g.Count() > 1).Select(g => g.Key).ToList();
            if (duplicatesLineItems.Count > 0)
            {
                duplicatesLineItems.ForEach(lineItem =>
                {
                    var underAssessReason = _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.lineItemIsADuplicate)?.Result;
                    if (underAssessReason != null)
                    {
                        invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.lineItemIsADuplicate, UnderAssessReason = underAssessReason.Description, InvoiceLineId = lineItem.InvoiceLineId, IsActive = true });
                    }
                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName))
                    {
                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = false,
                            RuleName = RuleTasks.MedicalInvoiceRules.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName,
                            MessageList = new List<string> { $"{lineItem.HcpTariffCode} is a duplicate." }
                        });
                    }
                });
            }
            else
            {
                if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName))
                {
                    invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                    {
                        Passed = true,
                        RuleName = RuleTasks.MedicalInvoiceRules.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName,
                        MessageList = new List<string>()
                    });
                }
            }

            //tariff data should be migrated to MOD
            //leave as is until we have feedback on data migration
            //dependent on data migration whether to run on MOD or Compcare
            //Amount Not Greater Than Tariff validation
            var itemTolerance = await _medicalItemFacadeService.GetMedicalItemToleranceAsync();
            List<RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.RuleData> listInvoicelineData = new List<RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.RuleData>();
            foreach (InvoiceLineDetails currentInvoiceline in invoiceDetails.InvoiceLineDetails)
            {
                var tariffQuanity = await _mediCareService.GetTariff(currentInvoiceline.TariffId);
                RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.RuleData ruleData = new RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.RuleData
                {
                    AuthorisedAmount = Convert.ToDecimal(currentInvoiceline.AuthorisedAmount),
                    TariffAmount = Convert.ToDecimal(currentInvoiceline.TariffAmount),
                    ItemTolerance = Convert.ToDecimal(itemTolerance),
                    AuthorisedQuantity = Convert.ToUInt16(currentInvoiceline.AuthorisedQuantity),
                    TariffQuanity = Convert.ToUInt16(tariffQuanity.DefaultQuantity) != 0 ? Convert.ToUInt16(tariffQuanity.DefaultQuantity) : 1
                };

                listInvoicelineData.Add(ruleData);

                var amountNotGreaterThanTariffRuleRequest = new RuleRequest()
                {
                    Data = _serializer.Serialize(listInvoicelineData),
                    RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.Constants.AmountNotGreaterThanTariffRule },
                    ExecutionFilter = "medical"
                };

                var amountNotGreaterThanTariffRuleResult = await _rulesEngine.ExecuteRules(amountNotGreaterThanTariffRuleRequest);
                if (amountNotGreaterThanTariffRuleResult != null && amountNotGreaterThanTariffRuleResult.RuleResults.Count > 0)
                {
                    var ruleresultAmountNotGreaterThanTariffRule = amountNotGreaterThanTariffRuleResult.RuleResults.FirstOrDefault();
                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.Constants.AmountNotGreaterThanTariffRule))
                    {
                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = amountNotGreaterThanTariffRuleResult.OverallSuccess,
                            RuleName = ruleresultAmountNotGreaterThanTariffRule?.RuleName,
                            MessageList = ruleresultAmountNotGreaterThanTariffRule?.MessageList
                        });
                    }
                    if (!amountNotGreaterThanTariffRuleResult.OverallSuccess)
                    {
                        var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.lineItemRateExceedsTheAgreedTariff);
                        invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.lineItemRateExceedsTheAgreedTariff, UnderAssessReason = underAssessReason.Description, InvoiceLineId = currentInvoiceline.InvoiceLineId });
                    }
                }
            }

            //leave as is - no changes here
            //Check for rejected invoice lines
            var underAssessReasons = await _underAssessReasonService.GetLineUnderAssessReasons();
            foreach (var invoiceLine in invoiceDetails.InvoiceLineDetails)
            {
                var invoiceLineUnderAssessReasons = invoiceLine.InvoiceLineUnderAssessReasons.Where(u => u.UnderAssessReasonId > 0).ToList();

                var rejectedUnderAssessReasons = underAssessReasons.Where(x => invoiceLineUnderAssessReasons.Any(y => y.UnderAssessReasonId == x.UnderAssessReasonId) && x.Action == "Reject");

                if (rejectedUnderAssessReasons != null && rejectedUnderAssessReasons?.Count() > 0)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.NoValidLines);
                    invoiceLineValidations.LineUnderAssessReasons.Add(new InvoiceLineUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.NoValidLines, UnderAssessReason = underAssessReason.Description, InvoiceLineId = invoiceLine.InvoiceLineId, IsActive = true });
                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.RejectedInvoiceLines.Constants.RejectedInvoiceLineRuleName))
                    {
                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = false,
                            RuleName = RuleTasks.MedicalInvoiceRules.RejectedInvoiceLines.Constants.RejectedInvoiceLineRuleName,
                            MessageList = new List<string> { $"{invoiceLine.HcpTariffCode} is rejected." }
                        });
                    }
                }
                else
                {
                    if (!invoiceLineValidations.RuleRequestResult.RuleResults.Any(item => item.RuleName == RuleTasks.MedicalInvoiceRules.RejectedInvoiceLines.Constants.RejectedInvoiceLineRuleName))
                    {
                        invoiceLineValidations.RuleRequestResult.RuleResults.Add(new RuleResult
                        {
                            Passed = true,
                            RuleName = RuleTasks.MedicalInvoiceRules.RejectedInvoiceLines.Constants.RejectedInvoiceLineRuleName,
                            MessageList = new List<string>()
                        });
                    }
                }
            }

            invoiceLineValidations.RuleRequestResult.OverallSuccess = true;
            invoiceLineValidations.RuleRequestResult.RuleResults.ForEach(ruleResult =>
            {
                if (!ruleResult.Passed)
                {
                    invoiceLineValidations.RuleRequestResult.OverallSuccess = false;
                }
            });

            return invoiceLineValidations;
        }

        public async Task SaveInvoiceUnderAssessReasonsToDB(int invoiceId, int tebaInvoiceId, List<InvoiceUnderAssessReason> invoiceUnderAssessReasons)
        {
            Contract.Requires(invoiceUnderAssessReasons != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var existingUnderAssessReasons = await _invoiceUnderAssessReasonService.GetInvoiceUnderAssessReasonsByInvoiceId(invoiceId, tebaInvoiceId);

                foreach (var existingUnderAssessReason in existingUnderAssessReasons)
                {
                    await _invoiceUnderAssessReasonService.DeleteInvoiceUnderAssessReason(existingUnderAssessReason);
                }

                foreach (var invoiceUnderAssessReason in invoiceUnderAssessReasons)
                {
                    await _invoiceUnderAssessReasonService.AddInvoiceUnderAssessReason(invoiceUnderAssessReason);
                }
            }
        }

        public async Task SaveInvoiceLineUnderAssessReasonsToDB(List<InvoiceLineUnderAssessReason> invoiceLineUnderAssessReasons)
        {
            Contract.Requires(invoiceLineUnderAssessReasons != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                foreach (var underAssessReason in invoiceLineUnderAssessReasons)
                {
                    var existingLineUnderAssessReasons = await _invoiceLineUnderAssessReasonService.GetInvoiceLineUnderAssessReasonsByInvoiceLineId((int)underAssessReason.InvoiceLineId, (int)underAssessReason.TebaInvoiceLineId);
                    foreach (var existingLineUnderAssessReason in existingLineUnderAssessReasons)
                    {
                        if (invoiceLineUnderAssessReasons.Where(x => x.UnderAssessReasonId == existingLineUnderAssessReason.UnderAssessReasonId && x.InvoiceLineId == underAssessReason.InvoiceLineId).ToList().Count == 0)
                        {
                            await _invoiceLineUnderAssessReasonService.DeleteInvoiceLineUnderAssessReason(existingLineUnderAssessReason);
                        }
                    }
                    if (existingLineUnderAssessReasons.Where(x => x.UnderAssessReasonId == underAssessReason.UnderAssessReasonId && x.InvoiceLineId == underAssessReason.InvoiceLineId).ToList().Count == 0 && underAssessReason.InvoiceLineId > 0)
                    {
                        await _invoiceLineUnderAssessReasonService.AddInvoiceLineUnderAssessReason(underAssessReason);
                    }
                }
            }
        }

        public Task<InvoiceLine> SetInvoiceLine(InvoiceLineDetails invoiceLine)
        {
            Contract.Requires(invoiceLine != null);
            var line = new InvoiceLine
            {
                InvoiceLineId = invoiceLine.InvoiceLineId,
                InvoiceId = invoiceLine.InvoiceId,
                ServiceDate = invoiceLine.ServiceDate,
                ServiceTimeStart = invoiceLine.ServiceTimeStart,
                ServiceTimeEnd = invoiceLine.ServiceTimeEnd,
                RequestedQuantity = invoiceLine.RequestedQuantity,
                AuthorisedQuantity = invoiceLine.AuthorisedQuantity,
                RequestedAmount = invoiceLine.RequestedAmount,
                RequestedVat = invoiceLine.RequestedVat,
                RequestedAmountInclusive = invoiceLine.RequestedAmountInclusive,
                AuthorisedAmount = invoiceLine.AuthorisedAmount,
                AuthorisedVat = invoiceLine.AuthorisedVat,
                AuthorisedAmountInclusive = invoiceLine.AuthorisedAmountInclusive,
                TotalTariffAmount = invoiceLine.TotalTariffAmount,
                TotalTariffVat = invoiceLine.TotalTariffVat,
                TotalTariffAmountInclusive = invoiceLine.TotalTariffAmountInclusive,
                TariffAmount = invoiceLine.TariffAmount,
                CreditAmount = invoiceLine.CreditAmount,
                VatCode = invoiceLine.VatCode,
                VatPercentage = invoiceLine.VatPercentage,
                TariffId = invoiceLine.TariffId,
                TreatmentCodeId = invoiceLine.TreatmentCodeId,
                MedicalItemId = invoiceLine.MedicalItemId,
                HcpTariffCode = invoiceLine.HcpTariffCode,
                TariffBaseUnitCostTypeId = invoiceLine.TariffBaseUnitCostTypeId,
                Description = invoiceLine.Description,
                SummaryInvoiceLineId = invoiceLine.SummaryInvoiceLineId,
                IsPerDiemCharge = invoiceLine.IsPerDiemCharge,
                IsDuplicate = invoiceLine.IsDuplicate,
                DuplicateInvoiceLineId = invoiceLine.DuplicateInvoiceLineId,
                CalculateOperands = invoiceLine.CalculateOperands,
                Icd10Code = invoiceLine.Icd10Code,
                IsActive = invoiceLine.IsActive,
                CreatedBy = invoiceLine.CreatedBy,
                CreatedDate = invoiceLine.CreatedDate,
                ModifiedBy = invoiceLine.ModifiedBy,
                ModifiedDate = invoiceLine.ModifiedDate,
                IsModifier = invoiceLine.IsModifier
            };
            return Task.FromResult(line);
        }

        public async Task<InvoiceStatusEnum> SetInvoiceStatus(int invoiceId, int tebaInvoiceId, List<InvoiceUnderAssessReason> invoiceUnderAssessReasons, InvoiceStatusEnum invoiceStatus)
        {
            bool useMediInvoiceId = invoiceId > 0;
            var invoiceStatusResult = await GetInvoiceStatusForUnderAssessReasons(invoiceId, invoiceUnderAssessReasons, invoiceStatus);

            if (useMediInvoiceId)
            {
                var invoice = new Invoice
                {
                    InvoiceId = invoiceId,
                    InvoiceStatus = invoiceStatusResult
                };
                await EditInvoiceStatus(invoice);
            }

            else if (!useMediInvoiceId)
            {
                var tebaInvoice = new TebaInvoice
                {
                    TebaInvoiceId = tebaInvoiceId,
                    InvoiceStatus = invoiceStatusResult
                };
                await EditTebaInvoiceStatus(tebaInvoice);
            }

            return invoiceStatusResult;
        }

        public async Task<List<InvoiceUnderAssessReason>> AutoAssessInvoice(InvoiceDetails invoiceDetails)
        {
            Contract.Requires(invoiceDetails != null);
            var invoiceUnderAssessReasons = new List<InvoiceUnderAssessReason>();

            using (var scope = _dbContextScopeFactory.Create())
            {
                invoiceUnderAssessReasons = await ValidateAssessInvoice(invoiceDetails);

                if (invoiceUnderAssessReasons == null || invoiceUnderAssessReasons?.Count == 0)
                {
                    // Allocate the medical invoice
                    var invoiceAllocation = new MedicalInvoicePaymentAllocation
                    {
                        PayeeId = invoiceDetails.HealthCareProviderId,
                        PaymentAllocationStatus = PaymentAllocationStatusEnum.PendingPayment,
                        MedicalInvoiceId = invoiceDetails.InvoiceId,
                        AssessedAmount = invoiceDetails.AuthorisedAmount,
                        AssessedVat = invoiceDetails.AuthorisedVat
                    };

                    InvoiceAssessAllocateData invoiceAssessAllocateData = new InvoiceAssessAllocateData()
                    {
                        InvoiceDetail = invoiceDetails,
                        TebaInvoice = new TebaInvoice(),
                        InvoiceAllocation = invoiceAllocation
                    };

                    var allocationId = await AssessAllocationSubmit(invoiceAssessAllocateData);
                    //when allocation is done update invoice & lines totals (Authorized amounts)
                    await EditInvoiceAuthorisedAmounts(invoiceDetails);
                }

            }
            return invoiceUnderAssessReasons;
        }

        public async Task<List<InvoiceUnderAssessReason>> AutoAssessTebaInvoice(TebaInvoice tebaInvoice)
        {
            Contract.Requires(tebaInvoice != null);
            var invoiceUnderAssessReasons = new List<InvoiceUnderAssessReason>();

            using (var scope = _dbContextScopeFactory.Create())
            {
                invoiceUnderAssessReasons = await ValidateAssessTebaInvoice(tebaInvoice);

                if (invoiceUnderAssessReasons == null || invoiceUnderAssessReasons?.Count == 0)
                {
                    // Allocate the medical invoice
                    var invoiceAllocation = new MedicalInvoicePaymentAllocation
                    {
                        PayeeId = tebaInvoice.PayeeId,
                        PaymentAllocationStatus = PaymentAllocationStatusEnum.PendingPayment,
                        TebaInvoiceId = tebaInvoice.TebaInvoiceId,
                        AssessedAmount = tebaInvoice.AuthorisedAmount,
                        AssessedVat = tebaInvoice.AuthorisedVat,
                        PaymentType = PaymentTypeEnum.TebaInvoice
                    };

                    InvoiceAssessAllocateData invoiceAssessAllocateData = new InvoiceAssessAllocateData()
                    {
                        InvoiceDetail = new InvoiceDetails(),
                        TebaInvoice = tebaInvoice,
                        InvoiceAllocation = invoiceAllocation
                    };

                    var allocationId = await AssessAllocationSubmit(invoiceAssessAllocateData);
                    //when allocation is done update invoice & lines totals (Authorized amounts)
                    await EditTebaInvoiceAuthorisedAmounts(tebaInvoice);
                }

            }
            return invoiceUnderAssessReasons;
        }

        public async Task<List<InvoiceUnderAssessReason>> ValidatePaymentRequest(InvoiceDetails invoiceDetails)
        {
            List<InvoiceUnderAssessReason> invoiceUnderAssessReasons = new List<InvoiceUnderAssessReason>();
            List<RuleRequestResultResponse> allRulesResultsList = new List<RuleRequestResultResponse>();

            using (var scope = _dbContextScopeFactory.Create())
            {
                try
                {
                    int paymentRequestResult = 0;

                    if (invoiceDetails?.InvoiceStatus == InvoiceStatusEnum.Allocated)
                    {
                        //leave as is - no changes
                        // Check whether Invoice is Active
                        var ruleRequestResultIsActive = await CheckIfInvoiceIsActive(invoiceDetails.InvoiceId);
                        if (!ruleRequestResultIsActive.OverallSuccess)
                        {
                            var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.invoiceNotActive);
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.invoiceNotActive, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                        }

                        //leave as is - no changes
                        // Check whether Requested Amount on Invoice doesn't exceed Allocated Amount
                        var ruleRequestResultAmountLimit = await CheckRequestedAmountExceedAllocatedAmount(invoiceDetails.InvoiceId, invoiceDetails.AuthorisedAmount);
                        if (!ruleRequestResultAmountLimit.OverallSuccess)
                        {
                            var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.invoiceAmountExceedsAllocatedAmount);
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.invoiceAmountExceedsAllocatedAmount, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                        }

                        //Merge all rule results - ruleRequestResultAmountLimit rule removed from checks as it should not prohibit user from submitting to Fincare
                        RuleRequestResultResponse[] allRulesResultsArr = { ruleRequestResultIsActive };
                        allRulesResultsList = await AddRuleRequestResult(allRulesResultsArr);

                        //check if any of the rules failed - and if any take appropriate action
                        if (allRulesResultsList == null || allRulesResultsList.Count < 1)
                        {
                            paymentRequestResult = await MedicalInvoicePaymentRequest(invoiceDetails);

                            if (paymentRequestResult > 0)
                            {
                                //MedicalInvoicePaymentRequest passed -  payment request was successful
                                var ruleResult = new List<RuleResultResponse>
                            {
                                new RuleResultResponse {
                                RuleName = "MedicalInvoicePaymentRequest",
                                Passed = true,
                                MessageList = { }
                                }
                            };

                                List<RuleRequestResultResponse> paymentRequestPass = new List<RuleRequestResultResponse>
                            {
                                new RuleRequestResultResponse {
                                    RequestId = Guid.NewGuid(),
                                    OverallSuccess = true,
                                    RuleResults = ruleResult
                                }
                            };

                                //on update status will need to call the post update method - to notify COMP
                                //update invoice
                                var updateInvoice = await _invoiceRepository.FirstOrDefaultAsync(a => a.InvoiceId == invoiceDetails.InvoiceId);
                                updateInvoice.InvoiceStatus = InvoiceStatusEnum.PaymentRequested;
                                _invoiceRepository.Update(updateInvoice);
                                await scope.SaveChangesAsync().ConfigureAwait(false);

                            }
                            else
                            {
                                //MedicalInvoicePaymentRequest failed -  payment request was not successful
                                var ruleResult = new List<RuleResultResponse>
                            {
                                new RuleResultResponse {
                                RuleName = "MedicalInvoicePaymentRequest",
                                Passed = false,
                                MessageList = { }
                                }
                            };

                                List<RuleRequestResultResponse> paymentRequestFailed = new List<RuleRequestResultResponse>
                            {
                                new RuleRequestResultResponse {
                                    RequestId = Guid.NewGuid(),
                                    OverallSuccess = false,
                                    RuleResults = ruleResult
                                }
                            };
                                var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.invoicePaymentRequestFailed);
                                invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.invoicePaymentRequestFailed, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    ex.LogException();
                }
            }
            return invoiceUnderAssessReasons;
        }

        public async Task<List<InvoiceUnderAssessReason>> ValidateTebaPaymentRequest(TebaInvoice tebaInvoice)
        {
            List<InvoiceUnderAssessReason> invoiceUnderAssessReasons = new List<InvoiceUnderAssessReason>();
            List<RuleRequestResultResponse> allRulesResultsList = new List<RuleRequestResultResponse>();

            using (var scope = _dbContextScopeFactory.Create())
            {
                try
                {
                    int paymentRequestResult = 0;

                    if (tebaInvoice?.InvoiceStatus == InvoiceStatusEnum.Allocated)
                    {
                        //leave as is - no changes
                        // Check whether Invoice is Active
                        var ruleRequestResultIsActive = await CheckIfTebaInvoiceIsActive(tebaInvoice.TebaInvoiceId);
                        if (!ruleRequestResultIsActive.OverallSuccess)
                        {
                            var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.invoiceNotActive);
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.invoiceNotActive, UnderAssessReason = underAssessReason.Description, TebaInvoiceId = tebaInvoice.TebaInvoiceId, IsActive = true });
                        }

                        //leave as is - no changes
                        // Check whether Requested Amount on Invoice doesn't exceed Allocated Amount
                        var ruleRequestResultAmountLimit = await CheckRequestedAmountExceedAllocatedAmount(tebaInvoice.TebaInvoiceId, tebaInvoice.AuthorisedAmount);
                        if (!ruleRequestResultAmountLimit.OverallSuccess)
                        {
                            var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.invoiceAmountExceedsAllocatedAmount);
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.invoiceAmountExceedsAllocatedAmount, UnderAssessReason = underAssessReason.Description, TebaInvoiceId = tebaInvoice.TebaInvoiceId, IsActive = true });
                        }

                        //Merge all rule results - ruleRequestResultAmountLimit rule removed from checks as it should not prohibit user from submitting to Fincare
                        RuleRequestResultResponse[] allRulesResultsArr = { ruleRequestResultIsActive };
                        allRulesResultsList = await AddRuleRequestResult(allRulesResultsArr);

                        //check if any of the rules failed - and if any take appropriate action
                        if (allRulesResultsList == null || allRulesResultsList.Count < 1)
                        {
                            paymentRequestResult = await TebaInvoicePaymentRequest(tebaInvoice);

                            if (paymentRequestResult > 0)
                            {
                                //MedicalInvoicePaymentRequest passed -  payment request was successful
                                var ruleResult = new List<RuleResultResponse>
                                {
                                    new RuleResultResponse {
                                        RuleName = "MedicalInvoicePaymentRequest",
                                        Passed = true,
                                        MessageList = { }
                                    }
                                };

                                List<RuleRequestResultResponse> paymentRequestPass = new List<RuleRequestResultResponse>
                                {
                                    new RuleRequestResultResponse {
                                        RequestId = Guid.NewGuid(),
                                        OverallSuccess = true,
                                        RuleResults = ruleResult
                                    }
                                };

                                //on update status will need to call the post update method - to notify COMP
                                //update invoice
                                var updateInvoice = await _tebaInvoiceRepository.FirstOrDefaultAsync(a => a.TebaInvoiceId == tebaInvoice.TebaInvoiceId);
                                updateInvoice.InvoiceStatus = InvoiceStatusEnum.PaymentRequested;
                                _tebaInvoiceRepository.Update(updateInvoice);
                                await scope.SaveChangesAsync().ConfigureAwait(false);

                            }
                            else
                            {
                                //MedicalInvoicePaymentRequest failed -  payment request was not successful
                                var ruleResult = new List<RuleResultResponse>
                                {
                                    new RuleResultResponse {
                                    RuleName = "MedicalInvoicePaymentRequest",
                                    Passed = false,
                                    MessageList = { }
                                    }
                                };

                                List<RuleRequestResultResponse> paymentRequestFailed = new List<RuleRequestResultResponse>
                                {
                                    new RuleRequestResultResponse {
                                        RequestId = Guid.NewGuid(),
                                        OverallSuccess = false,
                                        RuleResults = ruleResult
                                    }
                                };
                                var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.invoicePaymentRequestFailed);
                                invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.invoicePaymentRequestFailed, UnderAssessReason = underAssessReason.Description, TebaInvoiceId = tebaInvoice.TebaInvoiceId, IsActive = true });
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    ex.LogException();
                }
            }
            return invoiceUnderAssessReasons;
        }

        public async Task<int> MedicalInvoicePaymentRequest(InvoiceDetails invoiceDetails)
        {
            int paymentId = 0;
            Contract.Requires(invoiceDetails != null);
            RolePlayerBankingDetail payeeBankingDetailsApproved = new RolePlayerBankingDetail();
            int beneficiaryId = invoiceDetails.PayeeId > 0 ? invoiceDetails.PayeeId : invoiceDetails.HealthCareProviderId;
            payeeBankingDetailsApproved = await GetAuthorisedPayeeBankDetailsByRolePlayerId(beneficiaryId);

            var bankingDetailsExist = await _rolePlayerService.GetBankingDetailsByRolePlayerId(beneficiaryId);

            if (bankingDetailsExist != null && bankingDetailsExist.Count > 0)
            {

                if (bankingDetailsExist.Count > 0 && (payeeBankingDetailsApproved == null || Convert.ToBoolean(!payeeBankingDetailsApproved.IsApproved)))
                {
                    invoiceDetails.InvoiceStatus = InvoiceStatusEnum.Pending;
                }
                else if (bankingDetailsExist.Count < 1 || (payeeBankingDetailsApproved != null && payeeBankingDetailsApproved.IsDeleted) ||
                    Convert.ToBoolean(bankingDetailsExist.FirstOrDefault(a => a.IsDeleted)?.IsDeleted))
                {
                    invoiceDetails.InvoiceStatus = InvoiceStatusEnum.Rejected;
                }
            }

            var invoiceAllocation = await _paymentsAllocationService.GetAllocationsByMedicalInvoiceId(invoiceDetails.InvoiceId, PaymentTypeEnum.MedicalInvoice);

            if (invoiceAllocation != null && invoiceAllocation.AllocationId > 0)
            {

                ///Get Coid clims and indutries
                var personEventByClaimId = await _claimService.GetPersonEventByClaimId((int)invoiceDetails.ClaimId);
                var policy = await _policyService.GetPolicy(Convert.ToInt32(personEventByClaimId?.Claims?.FirstOrDefault()?.PolicyId));

                //=== GetClaim RolePlayerBeneficiaryDetails
                var beneficiaryDetails = await _rolePlayerService.GetRolePlayerWithoutReferenceData(beneficiaryId);

                //==Get Senedr Bank details for for Coid claims
                //base on claimtype & IndustryClass the department name will change accordingly
                string departmentName = "";

                if (personEventByClaimId.InsuranceTypeId != null && (personEventByClaimId.InsuranceTypeId == (int)InsuranceTypeEnum.IOD))
                {
                    var employerDetails = await _rolePlayerService.GetCompanyByRolePlayer((int)personEventByClaimId.CompanyRolePlayerId);
                    if (employerDetails != null)
                    {
                        switch (employerDetails.IndustryClass)
                        {
                            case IndustryClassEnum.Mining:
                                departmentName = MediCareConstants.DepartmentNameClassIVMining;
                                break;
                            case IndustryClassEnum.Metals:
                                departmentName = MediCareConstants.DepartmentNameClassXIIIMetals;
                                break;
                            case IndustryClassEnum.Other:
                                departmentName = MediCareConstants.DepartmentNameClassOthers;
                                break;

                            default:
                                //Empty department on Non COID
                                departmentName = "";
                                break;
                        }
                    }
                }
                else
                {
                    throw new BusinessException("Person event linked to this invoice does not have an insurance type.");
                }

                // Assigning Senders account for Coid claims
                var medicalBankingSenderAcc = await _bankAccountService.GetBankAccount(departmentName);
                var senderAccountNo = medicalBankingSenderAcc != null ? medicalBankingSenderAcc.AccountNumber.Trim() : "";

                //--for all get method check for null reference
                if (!String.IsNullOrEmpty(departmentName) && !String.IsNullOrEmpty(senderAccountNo) && beneficiaryDetails != null && invoiceAllocation != null && (payeeBankingDetailsApproved != null &&
                        Convert.ToBoolean(payeeBankingDetailsApproved.IsApproved)) && invoiceDetails.InvoiceStatus != InvoiceStatusEnum.Pending && invoiceDetails.InvoiceStatus != InvoiceStatusEnum.Rejected)
                {
                    Payment payment = new Payment();
                    //payment.PaymentAllocationId = invoiceAllocation.AllocationId;//important one so you can go back up for tracing
                    payment.CanEdit = false;
                    payment.PaymentStatus = PaymentStatusEnum.Pending;
                    payment.PaymentType = PaymentTypeEnum.MedicalInvoice;

                    payment.Payee = beneficiaryDetails.DisplayName;//;string.Empty;
                    payment.PayeeId = beneficiaryDetails.RolePlayerId;
                    payment.Bank = payeeBankingDetailsApproved != null ? payeeBankingDetailsApproved.BankName : string.Empty;
                    payment.BankBranch = payeeBankingDetailsApproved != null ? payeeBankingDetailsApproved.BranchCode : string.Empty;
                    payment.AccountNo = payeeBankingDetailsApproved != null ? payeeBankingDetailsApproved.AccountNumber : string.Empty;
                    payment.Amount = invoiceAllocation.AssessedAmount + invoiceAllocation.AssessedVat;

                    payment.Product = policy.ProductCategoryType.GetEnumDisplayName();
                    payment.Branch = medicalBankingSenderAcc.BranchName;
                    payment.SenderAccountNo = senderAccountNo;

                    payment.MaxSubmissionCount = 0;
                    payment.SubmissionCount = 0;

                    payment.BankAccountType = payeeBankingDetailsApproved.BankAccountType;
                    payment.EmailAddress = beneficiaryDetails != null ? beneficiaryDetails.EmailAddress : string.Empty;
                    payment.ClaimType = personEventByClaimId.ClaimType;//ClaimTypeEnum.IODCOID;//need clarity from ajay - method needed for getting claimtype before setting

                    payment.CanResubmit = true;//on fail then resend until max reached

                    payment.ClientType = beneficiaryDetails.ClientType != null ? beneficiaryDetails.ClientType : ClientTypeEnum.All;

                    payment.PolicyReference = invoiceDetails.InvoiceNumber;// policy != null ? policy.PolicyNumber : string.Empty;// rolePlayerClaimentPerson - get from roleplayer
                    payment.Reference = invoiceDetails.InvoiceNumber;//need to check - is it for finanace maybe 

                    payment.IsActive = true;
                    payment.IsDebtorCheck = false;
                    payment.PaymentMethod = PaymentMethodEnum.EFT;

                    //for payment these are mandatory set policyId,ClaimId,ClaimReference  
                    payment.PolicyId = personEventByClaimId?.Claims?.FirstOrDefault()?.PolicyId;
                    payment.ClaimId = personEventByClaimId?.Claims?.FirstOrDefault()?.ClaimId;
                    payment.ClaimReference = personEventByClaimId?.Claims?.FirstOrDefault()?.ClaimReferenceNumber;
                    payment.IsReversed = false;

                    paymentId = await _paymentCreatorService.Create(payment);
                    if (paymentId > 0)
                    {
                        invoiceAllocation.PaymentId = paymentId;
                        await _paymentsAllocationService.UpdateAllocation(invoiceAllocation);
                    }

                }
            }

            return paymentId;
        }

        public async Task<int> TebaInvoicePaymentRequest(TebaInvoice tebaInvoice)
        {
            int paymentId = 0;
            Contract.Requires(tebaInvoice != null);
            RolePlayerBankingDetail payeeBankingDetailsApproved = new RolePlayerBankingDetail();
            int beneficiaryId = tebaInvoice.PayeeId > 0 ? tebaInvoice.PayeeId : tebaInvoice.InvoicerId;
            payeeBankingDetailsApproved = await GetAuthorisedPayeeBankDetailsByRolePlayerId(beneficiaryId);

            var bankingDetailsExist = await _rolePlayerService.GetBankingDetailsByRolePlayerId(beneficiaryId);

            if (bankingDetailsExist != null && bankingDetailsExist.Count > 0)
            {

                if (bankingDetailsExist.Count > 0 && (payeeBankingDetailsApproved == null || Convert.ToBoolean(!payeeBankingDetailsApproved.IsApproved)))
                {
                    tebaInvoice.InvoiceStatus = InvoiceStatusEnum.Pending;
                }
                else if (bankingDetailsExist.Count < 1 || (payeeBankingDetailsApproved != null && payeeBankingDetailsApproved.IsDeleted) ||
                    Convert.ToBoolean(bankingDetailsExist.FirstOrDefault(a => a.IsDeleted)?.IsDeleted))
                {
                    tebaInvoice.InvoiceStatus = InvoiceStatusEnum.Rejected;
                }
            }

            var invoiceAllocation = await _paymentsAllocationService.GetAllocationsByMedicalInvoiceId(tebaInvoice.TebaInvoiceId, PaymentTypeEnum.TebaInvoice);

            if (invoiceAllocation != null && invoiceAllocation.AllocationId > 0)
            {
                ///Get Coid clims and indutries
                var personEventByClaimId = await _claimService.GetPersonEventByClaimId((int)tebaInvoice.ClaimId);
                var policy = await _policyService.GetPolicy(Convert.ToInt32(personEventByClaimId?.Claims?.FirstOrDefault()?.PolicyId));

                //=== GetClaim RolePlayerBeneficiaryDetails
                var beneficiaryDetails = await _rolePlayerService.GetRolePlayerWithoutReferenceData(beneficiaryId);

                //==Get Senedr Bank details for for Coid claims
                //base on claimtype & IndustryClass the department name will change accordingly
                string departmentName = "";

                if (personEventByClaimId.InsuranceTypeId != null && (personEventByClaimId.InsuranceTypeId == (int)InsuranceTypeEnum.IOD))
                {
                    var employerDetails = await _rolePlayerService.GetCompanyByRolePlayer((int)personEventByClaimId.CompanyRolePlayerId);
                    if (employerDetails != null)
                    {
                        switch (employerDetails.IndustryClass)
                        {
                            case IndustryClassEnum.Mining:
                                departmentName = MediCareConstants.DepartmentNameClassIVMining;
                                break;
                            case IndustryClassEnum.Metals:
                                departmentName = MediCareConstants.DepartmentNameClassXIIIMetals;
                                break;
                            case IndustryClassEnum.Other:
                                departmentName = MediCareConstants.DepartmentNameClassOthers;
                                break;
                            default:
                                //Empty department on Non COID
                                departmentName = "";
                                break;
                        }
                    }
                }
                else
                {
                    throw new BusinessException("Person event linked to this invoice does not have an insurance type.");
                }

                // Assigning Senders account for Coid claims
                var medicalBankingSenderAcc = await _bankAccountService.GetBankAccount(departmentName);
                var senderAccountNo = medicalBankingSenderAcc != null ? medicalBankingSenderAcc.AccountNumber.Trim() : "";

                //--for all get method check for null reference
                if (!String.IsNullOrEmpty(departmentName) && !String.IsNullOrEmpty(senderAccountNo) && beneficiaryDetails != null && invoiceAllocation != null && (payeeBankingDetailsApproved != null &&
                        Convert.ToBoolean(payeeBankingDetailsApproved.IsApproved)) && tebaInvoice.InvoiceStatus != InvoiceStatusEnum.Pending && tebaInvoice.InvoiceStatus != InvoiceStatusEnum.Rejected)
                {
                    Payment payment = new Payment();
                    //payment.PaymentAllocationId = invoiceAllocation.AllocationId;//important one so you can go back up for tracing
                    payment.CanEdit = false;
                    payment.PaymentStatus = PaymentStatusEnum.Pending;
                    payment.PaymentType = PaymentTypeEnum.TebaInvoice;

                    payment.Payee = beneficiaryDetails.DisplayName;//;string.Empty;
                    payment.PayeeId = beneficiaryDetails.RolePlayerId;
                    payment.Bank = payeeBankingDetailsApproved != null ? payeeBankingDetailsApproved.BankName : string.Empty;
                    payment.BankBranch = payeeBankingDetailsApproved != null ? payeeBankingDetailsApproved.BranchCode : string.Empty;
                    payment.AccountNo = payeeBankingDetailsApproved != null ? payeeBankingDetailsApproved.AccountNumber : string.Empty;
                    payment.Amount = invoiceAllocation.AssessedAmount + invoiceAllocation.AssessedVat;

                    payment.Product = policy.ProductCategoryType.GetEnumDisplayName();
                    payment.Branch = medicalBankingSenderAcc.BranchName;
                    payment.SenderAccountNo = senderAccountNo;

                    payment.MaxSubmissionCount = 0;
                    payment.SubmissionCount = 0;

                    payment.BankAccountType = payeeBankingDetailsApproved.BankAccountType;
                    payment.EmailAddress = beneficiaryDetails != null ? beneficiaryDetails.EmailAddress : string.Empty;
                    payment.ClaimType = personEventByClaimId.ClaimType;//ClaimTypeEnum.IODCOID;//need clarity from ajay - method needed for getting claimtype before setting

                    payment.CanResubmit = true;//on fail then resend until max reached

                    payment.ClientType = beneficiaryDetails.ClientType != null ? beneficiaryDetails.ClientType : ClientTypeEnum.All;

                    payment.PolicyReference = tebaInvoice.InvoiceNumber;// policy != null ? policy.PolicyNumber : string.Empty;// rolePlayerClaimentPerson - get from roleplayer
                    payment.Reference = tebaInvoice.InvoiceNumber;//need to check - is it for finanace maybe 

                    payment.IsActive = true;
                    payment.IsDebtorCheck = false;
                    payment.PaymentMethod = PaymentMethodEnum.EFT;

                    //for payment these are mandatory set policyId,ClaimId,ClaimReference  
                    payment.PolicyId = personEventByClaimId?.Claims?.FirstOrDefault()?.PolicyId;
                    payment.ClaimId = personEventByClaimId?.Claims?.FirstOrDefault()?.ClaimId;
                    payment.ClaimReference = personEventByClaimId?.Claims?.FirstOrDefault()?.ClaimReferenceNumber;
                    payment.IsReversed = false;

                    paymentId = await _paymentCreatorService.Create(payment);
                    if (paymentId > 0)
                    {
                        invoiceAllocation.PaymentId = paymentId;
                        await _paymentsAllocationService.UpdateAllocation(invoiceAllocation);
                    }
                }
            }

            return paymentId;
        }

        public async Task<int> MedicalInvoicePaymentRequestSTPIntegration(InvoiceDetails invoiceDetails)
        {
            int paymentId = 0;
            Contract.Requires(invoiceDetails != null);
            RolePlayerBankingDetail payeeBankingDetailsApproved = new RolePlayerBankingDetail();

            //call stored PROC one used in step2 - COMP
            //get based on CompCareHealthCareProviderId  - hcp active and bank authorised
            //get CompCareHealthCareProviderId from medical.InvoiceCompCareMap and pass as HCPID
            var resultInvoiceCompCareMap = await _invoiceCompCareMapService.GetInvoiceCompCareMapByInvoiceId(invoiceDetails.InvoiceId);
            payeeBankingDetailsApproved = await GetBankingDetailsValidationsSTPIntegration(resultInvoiceCompCareMap.CompCareHealthCareProviderId, invoiceDetails.PayeeTypeId);

            if (payeeBankingDetailsApproved == null)
            {

                if (payeeBankingDetailsApproved == null || Convert.ToBoolean(!payeeBankingDetailsApproved.IsApproved))
                {
                    invoiceDetails.InvoiceStatus = InvoiceStatusEnum.Pending;
                }
                else if (payeeBankingDetailsApproved != null && payeeBankingDetailsApproved.IsDeleted)
                {
                    invoiceDetails.InvoiceStatus = InvoiceStatusEnum.Rejected;
                }
            }

            //same as is - no changes
            var invoiceAllocation = await _paymentsAllocationService.GetAllocationsByMedicalInvoiceId(invoiceDetails.InvoiceId, PaymentTypeEnum.MedicalInvoice);

            if (invoiceAllocation != null && invoiceAllocation.AllocationId > 0)
            {
                //remains as is - no changes
                ///Get Coid clims and indutries
                var personEventByClaimId = await _claimService.GetPersonEventByClaimId((int)invoiceDetails.ClaimId);

                //=== GetClaim RolePlayerBeneficiaryDetails
                int beneficiaryId = invoiceDetails.HealthCareProviderId;
                //check if we have to remove or not - (we already have HCP active and bank details isApproved)
                var beneficiaryDetails = await _rolePlayerService.GetRolePlayerWithoutReferenceData(beneficiaryId);

                //==Get Sender Bank details for Coid claims
                //base on claimtype & IndustryClass the department name will change accordingly
                string departmentName = "";

                //leave as is - no changes
                var employerDetails = await _rolePlayerService.GetCompanyByRolePlayer((int)personEventByClaimId.CompanyRolePlayerId);

                if (personEventByClaimId != null && (personEventByClaimId.ClaimType == ClaimTypeEnum.IODCOID || personEventByClaimId.ClaimType == ClaimTypeEnum.RMACOIDAIOD ||
                        personEventByClaimId.ClaimType == ClaimTypeEnum.WCCCOIDA))
                {
                    if (employerDetails != null)
                    {
                        switch (employerDetails.IndustryClass)
                        {
                            case IndustryClassEnum.Mining:
                                departmentName = MediCareConstants.DepartmentNameClassIVMining;
                                break;
                            case IndustryClassEnum.Metals:
                                departmentName = MediCareConstants.DepartmentNameClassXIIIMetals;
                                break;
                            case IndustryClassEnum.Other:
                                departmentName = MediCareConstants.DepartmentNameClassOthers;
                                break;

                            default:
                                //Empty department on Non COID
                                departmentName = "";
                                break;
                        }
                    }
                }

                //remains as is - no changes
                // Assigning Senders account for Coid claims
                var medicalBankingSenderAcc = await _bankAccountService.GetBankAccount(departmentName);
                var senderAccountNo = medicalBankingSenderAcc != null ? medicalBankingSenderAcc.AccountNumber.Trim() : "";

                //--for all get method check for null reference
                if (!String.IsNullOrEmpty(departmentName) && !String.IsNullOrEmpty(senderAccountNo) && beneficiaryDetails != null && invoiceAllocation != null && (payeeBankingDetailsApproved != null &&
                        Convert.ToBoolean(payeeBankingDetailsApproved.IsApproved)) && invoiceDetails.InvoiceStatus != InvoiceStatusEnum.Pending && invoiceDetails.InvoiceStatus != InvoiceStatusEnum.Rejected)
                {
                    Payment payment = new Payment();
                    //payment.PaymentAllocationId = invoiceAllocation.AllocationId;//important one so you can go back up for tracing
                    payment.CanEdit = false;
                    payment.PaymentStatus = PaymentStatusEnum.Pending;
                    payment.PaymentType = PaymentTypeEnum.MedicalInvoice;

                    payment.Payee = beneficiaryDetails.DisplayName;//;string.Empty;
                    payment.PayeeId = beneficiaryDetails.RolePlayerId;
                    payment.Bank = payeeBankingDetailsApproved != null ? payeeBankingDetailsApproved.BankName : string.Empty;
                    payment.BankBranch = payeeBankingDetailsApproved != null ? payeeBankingDetailsApproved.BranchCode : string.Empty;
                    payment.AccountNo = payeeBankingDetailsApproved != null ? payeeBankingDetailsApproved.AccountNumber : string.Empty;
                    payment.Amount = invoiceAllocation.AssessedAmount + invoiceAllocation.AssessedVat;

                    payment.Product = "Medical Invoice";
                    payment.Branch = medicalBankingSenderAcc.BranchName;
                    payment.SenderAccountNo = senderAccountNo;

                    payment.MaxSubmissionCount = 0;
                    payment.SubmissionCount = 0;

                    payment.BankAccountType = payeeBankingDetailsApproved.BankAccountType;
                    payment.EmailAddress = beneficiaryDetails != null ? beneficiaryDetails.EmailAddress : string.Empty;
                    payment.ClaimType = personEventByClaimId.ClaimType;//ClaimTypeEnum.IODCOID;//need clarity from ajay - method needed for getting claimtype before setting

                    payment.CanResubmit = true;//on fail then resend until max reached

                    payment.ClientType = beneficiaryDetails.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.HealthCareProvider
                        ? ClientTypeEnum.HealthCareProvider : ClientTypeEnum.Individual;

                    payment.PolicyReference = invoiceDetails.InvoiceNumber;// policy != null ? policy.PolicyNumber : string.Empty;// rolePlayerClaimentPerson - get from roleplayer
                    payment.Reference = invoiceDetails.InvoiceNumber;//need to check - is it for finanace maybe 

                    payment.IsActive = true;
                    payment.IsDebtorCheck = false;
                    payment.PaymentMethod = PaymentMethodEnum.EFT;
                    //no changes

                    if (employerDetails != null && employerDetails.IndustryClass != null)
                    {
                        payment.Branch = employerDetails.IndustryClass.Value.ToString();
                    }

                    //for payment these are mandatory set policyId,ClaimId,ClaimReference  
                    payment.PolicyId = personEventByClaimId?.Claims?.FirstOrDefault()?.PolicyId;
                    payment.ClaimId = personEventByClaimId?.Claims?.FirstOrDefault()?.ClaimId;
                    payment.ClaimReference = personEventByClaimId?.Claims?.FirstOrDefault()?.ClaimReferenceNumber;
                    payment.IsReversed = false;

                    paymentId = await _paymentCreatorService.Create(payment);
                }
            }

            //update allocation status and Invoicestatus
            if (paymentId > 0)
            {
                if (invoiceAllocation != null)
                {
                    invoiceAllocation.PaymentId = paymentId;
                    invoiceAllocation.PaymentAllocationStatus = PaymentAllocationStatusEnum.PaymentRequested;
                    invoiceAllocation.ModifiedBy = RmaIdentity.Email;
                    invoiceAllocation.ModifiedDate = DateTimeHelper.SaNow;
                    await UpdateAllocationCommon(invoiceAllocation);
                }

                invoiceDetails.InvoiceStatus = InvoiceStatusEnum.PaymentRequested;
                invoiceDetails.ModifiedBy = RmaIdentity.Email;
                invoiceDetails.ModifiedDate = DateTimeHelper.SaNow;
                await EditInvoiceStatus(invoiceDetails);
            }

            return paymentId;
        }

        public async Task<List<InvoiceUnderAssessReason>> ValidateAssessInvoiceSTPIntegration(InvoiceDetails invoiceDetails)
        {
            Contract.Requires(invoiceDetails != null);
            var invoiceUnderAssessReasons = new List<InvoiceUnderAssessReason>();
            var ruleRequestResult = new RuleRequestResultResponse() { RuleResults = new List<RuleResultResponse>() };

            //leave as is - will see if we need for COMPCARE
            //Check if invoice is duplicate
            var isDuplicateInvoice = await CheckForDuplicateInvoices(invoiceDetails);
            if (isDuplicateInvoice)
            {
                var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.invoiceIsADuplicate);
                invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.invoiceIsADuplicate, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId });
            }

            //call SP CompCare to check claimStatus - Compansation.PersonEvent table isStraightThroughPressessing col
            // both IsStpClaim and this isStraightThroughPressessing should be true
            // Check IsSTP Claim
            var resultInvoiceCompCareMap = await _invoiceCompCareMapService.GetInvoiceCompCareMapByInvoiceId(invoiceDetails.InvoiceId);
            var medicalInvoiceClaimQuery = await GetClaimValidationsSTPIntegration(resultInvoiceCompCareMap.ClaimReferenceNumber);
            bool IsStpClaim = await _medicalInvoiceClaimService.CheckIsStpClaim(Convert.ToInt32(invoiceDetails.PersonEventId)).ConfigureAwait(false);

            if (IsStpClaim == medicalInvoiceClaimQuery.IsStraightThroughProcess)
            {
                // Get STP payment limit
                decimal stpAutoPayLimit = 0;
                var limit = await _configurationService.GetModuleSetting(SystemSettings.STPAutoPayLimit);
                if (!string.IsNullOrWhiteSpace(limit))
                {
                    stpAutoPayLimit = Convert.ToDecimal(limit);
                }

                var cumulativeTotal = await GetCumulativeTotalForPersonEvent(Convert.ToInt32(invoiceDetails.PersonEventId));

                // Check Auto Pay Amount Limit for STP
                if (cumulativeTotal > stpAutoPayLimit)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.TotAmtLimit);
                    invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.TotAmtLimit, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId });
                }
            }

            //call SP to get data
            // Check HealthCareProvider is active
            var healthCareProviderIsActive = await GetHealthCareProviderByIdForSTPIntegration(resultInvoiceCompCareMap.CompCareHealthCareProviderId);
            bool isHealthCareProviderActive = healthCareProviderIsActive.IsActive;
            if (!isHealthCareProviderActive)
            {
                var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.thePracticeIsInactive);
                invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.thePracticeIsInactive, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId });
            }

            //call COMP - check to see if we can amend our SP to include more column for banking details
            //also check isAuthorised banking details
            //call SP USP_GetBankAccountDetail
            // Check Payee Banking detail is thePracticeIsInactive
            var payeeBankingDetailsApproved = await GetBankingDetailsValidationsSTPIntegration(resultInvoiceCompCareMap.CompCareHealthCareProviderId, invoiceDetails.PayeeTypeId);
            if (payeeBankingDetailsApproved != null && !Convert.ToBoolean(payeeBankingDetailsApproved.IsApproved))
            {
                var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.thePracticeIsInactive);
                invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.thePracticeIsInactive, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId });
            }

            //remain as is - no changes
            //  Checking totalInvoiceAssessedAmount rule (Check if  All Line Items assessed to Zero and if so Reject Invoice)
            var totalAssessedAmountExcl = invoiceDetails.InvoiceLineDetails.Sum(item => item.AuthorisedAmount);
            var totalInvoiceAssessedAmountExcl = "{\"TotalInvoiceAssessedAmount\": \"" + totalAssessedAmountExcl + "\"}";
            var assessedAmountExclRuleRequest = new RuleRequest()
            {
                Data = totalInvoiceAssessedAmountExcl,
                RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.TotalAssessedAmount.Constants.AssessedAmountExclCheckRule },
                ExecutionFilter = "medical"
            };

            var totalInvoiceAssessedAmountResult = await _rulesEngine.ExecuteRules(assessedAmountExclRuleRequest);
            var ruleresult = totalInvoiceAssessedAmountResult.RuleResults.FirstOrDefault();

            if (!totalInvoiceAssessedAmountResult.OverallSuccess)
            {
                ruleRequestResult.RuleResults.Add(new RuleResultResponse
                {
                    Passed = totalInvoiceAssessedAmountResult.OverallSuccess,
                    RuleName = ruleresult?.RuleName,
                    MessageList = ruleresult?.MessageList
                });
                var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.TotAmtLimit);
                invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.TotAmtLimit, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId });
            }

            //call COMPCARE HCP SP to get isVatRegistered
            //Checking if VatPercentage matches for all invoice lines rule
            //all line items must belong to the same VAT period, as such then use the first one 
            var healthCareProviderDetails = await GetHealthCareProviderByIdForSTPIntegration(resultInvoiceCompCareMap.CompCareHealthCareProviderId);
            bool isVatRegistered = healthCareProviderDetails.IsVat;
            decimal invoiceFirstLineVatPercentage = await GetHealthCareProviderVatAmountCommon(isVatRegistered, invoiceDetails.InvoiceLineDetails.First().ServiceDate);
            var itemTolerance = await _medicalItemFacadeService.GetMedicalItemToleranceAsync();
            var healthCareProviderId = invoiceDetails.HealthCareProviderId;
            if (invoiceDetails.InvoiceLineDetails.Count != 0)
            {
                List<RuleTasks.MedicalInvoiceRules.VatCalculationFromServiceDate.RuleData> listInvoicelineData = new List<RuleTasks.MedicalInvoiceRules.VatCalculationFromServiceDate.RuleData>();
                List<RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.RuleData> listInvoicelineData2 = new List<RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.RuleData>();

                foreach (InvoiceLineDetails currentInvoiceline in invoiceDetails.InvoiceLineDetails)
                {
                    //will have to do the same but for allocated(invoice amount) and tarrif (tariff amount) amount checks for each lines
                    RuleTasks.MedicalInvoiceRules.VatCalculationFromServiceDate.RuleData ruleData = new RuleTasks.MedicalInvoiceRules.VatCalculationFromServiceDate.RuleData
                    {
                        VatAmount1 = Convert.ToDecimal(invoiceFirstLineVatPercentage),
                        VatAmount2 = Convert.ToDecimal(currentInvoiceline.VatPercentage),
                        VatCode = currentInvoiceline.VatCode
                    };

                    //leave as if - will revist after data migrations
                    //if tariff not available on MOD get data from COMP and create tariff - this will be implemented later
                    //need to pass another value thet is tolerance
                    var tariffQuanity = await _mediCareService.GetTariff(currentInvoiceline.TariffId);
                    RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.RuleData ruleData2 = new RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.RuleData
                    {
                        AuthorisedAmount = Convert.ToDecimal(currentInvoiceline.AuthorisedAmount),
                        TariffAmount = Convert.ToDecimal(currentInvoiceline.TariffAmount),
                        ItemTolerance = Convert.ToDecimal(itemTolerance),
                        AuthorisedQuantity = Convert.ToUInt16(currentInvoiceline.AuthorisedQuantity),
                        TariffQuanity = Convert.ToUInt16(tariffQuanity.DefaultQuantity) != 0 ? Convert.ToUInt16(tariffQuanity.DefaultQuantity) : 1
                    };

                    listInvoicelineData.Add(ruleData);
                    listInvoicelineData2.Add(ruleData2);
                }

                // Checking invoiceVatAmountCalculation rule
                var vatCalculationFromServiceDateRuleRequest = new RuleRequest()
                {
                    Data = _serializer.Serialize(listInvoicelineData),
                    RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.VatCalculationFromServiceDate.Constants.VatCalculationFromServiceDateRule },
                    ExecutionFilter = "medical"
                };
                var invoiceVatAmountCalculationResult = await _rulesEngine.ExecuteRules(vatCalculationFromServiceDateRuleRequest);
                var ruleresult2 = invoiceVatAmountCalculationResult.RuleResults.FirstOrDefault();

                if (!invoiceVatAmountCalculationResult.OverallSuccess)
                {
                    ruleRequestResult.RuleResults.Add(new RuleResultResponse
                    {
                        Passed = invoiceVatAmountCalculationResult.OverallSuccess,
                        RuleName = ruleresult2?.RuleName,
                        MessageList = ruleresult2?.MessageList
                    });
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.TotAmtLimit);
                    invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.TotAmtLimit, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId });
                }

                // Checking amountNotGreaterThanTariff rule
                var amountNotGreaterThanTariffRuleRequest = new RuleRequest()
                {
                    Data = _serializer.Serialize(listInvoicelineData2),
                    RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.Constants.AmountNotGreaterThanTariffRule },
                    ExecutionFilter = "medical"
                };

                var amountNotGreaterThanTariffRuleResult = await _rulesEngine.ExecuteRules(amountNotGreaterThanTariffRuleRequest);
                var ruleresult3 = amountNotGreaterThanTariffRuleResult.RuleResults.FirstOrDefault();

                if (!amountNotGreaterThanTariffRuleResult.OverallSuccess)
                {
                    ruleRequestResult.RuleResults.Add(new RuleResultResponse
                    {
                        Passed = amountNotGreaterThanTariffRuleResult.OverallSuccess,
                        RuleName = ruleresult3?.RuleName,
                        MessageList = ruleresult3?.MessageList
                    });
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.lineItemRateExceedsTheAgreedTariff);
                    invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.lineItemRateExceedsTheAgreedTariff, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId });
                }

                ruleRequestResult.OverallSuccess = (totalInvoiceAssessedAmountResult.OverallSuccess && invoiceVatAmountCalculationResult.OverallSuccess &&
                     amountNotGreaterThanTariffRuleResult.OverallSuccess) ? true : false;

            }

            return invoiceUnderAssessReasons;
        }

        public async Task<List<InvoiceUnderAssessReason>> ValidateAssessInvoice(InvoiceDetails invoiceDetails)
        {
            Contract.Requires(invoiceDetails != null);
            var invoiceUnderAssessReasons = new List<InvoiceUnderAssessReason>();
            var ruleRequestResult = new RuleRequestResultResponse() { RuleResults = new List<RuleResultResponse>() };

            //Check if invoice is duplicate
            var isDuplicateInvoice = await CheckForDuplicateInvoices(invoiceDetails);
            if (isDuplicateInvoice)
            {
                var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.invoiceIsADuplicate);
                invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.invoiceIsADuplicate, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId });
            }

            // Check IsSTP Claim
            bool IsStpClaim = await _medicalInvoiceClaimService.CheckIsStpClaim(Convert.ToInt32(invoiceDetails.PersonEventId)).ConfigureAwait(false);

            if (IsStpClaim)
            {
                // Get STP payment limit
                decimal stpAutoPayLimit = 0;
                var limit = await _configurationService.GetModuleSetting(SystemSettings.STPAutoPayLimit);
                if (!string.IsNullOrWhiteSpace(limit))
                {
                    stpAutoPayLimit = Convert.ToDecimal(limit);
                }

                var cumulativeTotal = await GetCumulativeTotalForPersonEvent(Convert.ToInt32(invoiceDetails.PersonEventId));

                // Check Auto Pay Amount Limit for STP
                if (cumulativeTotal > stpAutoPayLimit)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.TotAmtLimit);
                    invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.TotAmtLimit, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId });
                }
            }

            // Check HealthCareProvider is active
            var healthCareProvider = await GetHealthCareProviderByIdCommon(invoiceDetails.HealthCareProviderId);
            bool isHealthCareProviderActive = healthCareProvider.IsActive;
            if (!isHealthCareProviderActive)
            {
                var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.thePracticeIsInactive);
                invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.thePracticeIsInactive, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId });
            }

            // Check Payee Banking detail is thePracticeIsInactive
            var payeeBankingDetailsApproved = await GetAuthorisedPayeeBankDetailsByRolePlayerId(invoiceDetails.HealthCareProviderId);
            if (payeeBankingDetailsApproved != null && !Convert.ToBoolean(payeeBankingDetailsApproved.IsApproved))
            {
                var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.thePracticeIsInactive);
                invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.thePracticeIsInactive, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId });
            }

            //  Checking totalInvoiceAssessedAmount rule (Check if  All Line Items assessed to Zero and if so Reject Invoice)
            var totalAssessedAmountExcl = invoiceDetails.InvoiceLineDetails.Sum(item => item.AuthorisedAmount);
            var totalInvoiceAssessedAmountExcl = "{\"TotalInvoiceAssessedAmount\": \"" + totalAssessedAmountExcl + "\"}";
            var assessedAmountExclRuleRequest = new RuleRequest()
            {
                Data = totalInvoiceAssessedAmountExcl,
                RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.TotalAssessedAmount.Constants.AssessedAmountExclCheckRule },
                ExecutionFilter = "medical"
            };

            var totalInvoiceAssessedAmountResult = await _rulesEngine.ExecuteRules(assessedAmountExclRuleRequest);
            var ruleresult = totalInvoiceAssessedAmountResult.RuleResults.FirstOrDefault();

            if (!totalInvoiceAssessedAmountResult.OverallSuccess)
            {
                ruleRequestResult.RuleResults.Add(new RuleResultResponse
                {
                    Passed = totalInvoiceAssessedAmountResult.OverallSuccess,
                    RuleName = ruleresult?.RuleName,
                    MessageList = ruleresult?.MessageList
                });
                var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.NoValidLines);
                invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.NoValidLines, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId });
            }

            //Checking if VatPercentage matches for all invoice lines rule
            //all line items must belong to the same VAT period, as such then use the first one 
            var healthCareProviderDetails = await GetHealthCareProviderByIdCommon(invoiceDetails.HealthCareProviderId);
            bool isVatRegistered = healthCareProviderDetails.IsVat;
            decimal invoiceFirstLineVatPercentage = 0;
            InvoiceLineDetails invoiceFirstLine = null;
            if (invoiceDetails.InvoiceLineDetails != null)
            {
                invoiceFirstLine = invoiceDetails.InvoiceLineDetails.FirstOrDefault();
                if (invoiceFirstLine != null)
                {
                    invoiceFirstLineVatPercentage = await GetHealthCareProviderVatAmountCommon(isVatRegistered,
                        invoiceFirstLine.ServiceDate);
                }
            }

            var itemTolerance = await _medicalItemFacadeService.GetMedicalItemToleranceAsync();
            var healthCareProviderId = invoiceDetails.HealthCareProviderId;
            if (invoiceDetails.InvoiceLineDetails.Count != 0)
            {
                List<RuleTasks.MedicalInvoiceRules.VatCalculationFromServiceDate.RuleData> listInvoicelineData = new List<RuleTasks.MedicalInvoiceRules.VatCalculationFromServiceDate.RuleData>();
                List<RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.RuleData> listInvoicelineData2 = new List<RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.RuleData>();

                foreach (InvoiceLineDetails currentInvoiceline in invoiceDetails.InvoiceLineDetails)
                {
                    //will have to do the same but for allocated(invoice amount) and tarrif (tariff amount) amount checks for each lines
                    RuleTasks.MedicalInvoiceRules.VatCalculationFromServiceDate.RuleData ruleData = new RuleTasks.MedicalInvoiceRules.VatCalculationFromServiceDate.RuleData
                    {
                        VatAmount1 = Convert.ToDecimal(invoiceFirstLineVatPercentage),
                        VatAmount2 = Convert.ToDecimal(currentInvoiceline.VatPercentage),
                        VatCode = currentInvoiceline.VatCode
                    };

                    //need to pass another value thet is tolerance
                    var tariffQuanity = await _mediCareService.GetTariff(currentInvoiceline.TariffId);
                    RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.RuleData ruleData2 = new RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.RuleData
                    {
                        AuthorisedAmount = Convert.ToDecimal(currentInvoiceline.AuthorisedAmount),
                        TariffAmount = Convert.ToDecimal(currentInvoiceline.TariffAmount),
                        ItemTolerance = Convert.ToDecimal(itemTolerance),
                        AuthorisedQuantity = Convert.ToUInt16(currentInvoiceline.AuthorisedQuantity),
                        TariffQuanity = Convert.ToUInt16(tariffQuanity.DefaultQuantity) != 0 ? Convert.ToUInt16(tariffQuanity.DefaultQuantity) : 1
                    };

                    listInvoicelineData.Add(ruleData);
                    listInvoicelineData2.Add(ruleData2);
                }

                // Checking invoiceVatAmountCalculation rule
                var vatCalculationFromServiceDateRuleRequest = new RuleRequest()
                {
                    Data = _serializer.Serialize(listInvoicelineData),
                    RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.VatCalculationFromServiceDate.Constants.VatCalculationFromServiceDateRule },
                    ExecutionFilter = "medical"
                };
                var invoiceVatAmountCalculationResult = await _rulesEngine.ExecuteRules(vatCalculationFromServiceDateRuleRequest);
                var ruleresult2 = invoiceVatAmountCalculationResult.RuleResults.FirstOrDefault();

                if (!invoiceVatAmountCalculationResult.OverallSuccess)
                {
                    ruleRequestResult.RuleResults.Add(new RuleResultResponse
                    {
                        Passed = invoiceVatAmountCalculationResult.OverallSuccess,
                        RuleName = ruleresult2?.RuleName,
                        MessageList = ruleresult2?.MessageList
                    });
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.TotAmtLimit);
                    invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.TotAmtLimit, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId });
                }

                // Checking amountNotGreaterThanTariff rule
                var amountNotGreaterThanTariffRuleRequest = new RuleRequest()
                {
                    Data = _serializer.Serialize(listInvoicelineData2),
                    RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff.Constants.AmountNotGreaterThanTariffRule },
                    ExecutionFilter = "medical"
                };

                var amountNotGreaterThanTariffRuleResult = await _rulesEngine.ExecuteRules(amountNotGreaterThanTariffRuleRequest);
                var ruleresult3 = amountNotGreaterThanTariffRuleResult.RuleResults.FirstOrDefault();

                if (!amountNotGreaterThanTariffRuleResult.OverallSuccess)
                {
                    ruleRequestResult.RuleResults.Add(new RuleResultResponse
                    {
                        Passed = amountNotGreaterThanTariffRuleResult.OverallSuccess,
                        RuleName = ruleresult3?.RuleName,
                        MessageList = ruleresult3?.MessageList
                    });
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.lineItemRateExceedsTheAgreedTariff);
                    invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.lineItemRateExceedsTheAgreedTariff, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId });
                }

                ruleRequestResult.OverallSuccess = (totalInvoiceAssessedAmountResult.OverallSuccess && invoiceVatAmountCalculationResult.OverallSuccess &&
                     amountNotGreaterThanTariffRuleResult.OverallSuccess) ? true : false;

            }

            return invoiceUnderAssessReasons;
        }

        public async Task<List<InvoiceUnderAssessReason>> ValidateAssessTebaInvoice(TebaInvoice tebaInvoice)
        {
            Contract.Requires(tebaInvoice != null);
            var invoiceUnderAssessReasons = new List<InvoiceUnderAssessReason>();
            var ruleRequestResult = new RuleRequestResultResponse() { RuleResults = new List<RuleResultResponse>() };

            //Check if invoice is duplicate
            var isDuplicateInvoice = await CheckForDuplicateTebaInvoices(tebaInvoice);
            if (isDuplicateInvoice)
            {
                var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.invoiceIsADuplicate);
                invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.invoiceIsADuplicate, UnderAssessReason = underAssessReason.Description, InvoiceId = null, TebaInvoiceId = tebaInvoice.TebaInvoiceId });
            }

            // Check HealthCareProvider is active
            var healthCareProvider = await GetHealthCareProviderByIdCommon(tebaInvoice.InvoicerId);
            bool isHealthCareProviderActive = healthCareProvider.IsActive;
            if (!isHealthCareProviderActive)
            {
                var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.thePracticeIsInactive);
                invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.thePracticeIsInactive, UnderAssessReason = underAssessReason.Description, InvoiceId = 0, TebaInvoiceId = tebaInvoice.TebaInvoiceId });
            }

            // Check Payee Banking detail is thePracticeIsInactive
            var payeeBankingDetailsApproved = await GetAuthorisedPayeeBankDetailsByRolePlayerId(tebaInvoice.InvoicerId);
            if (payeeBankingDetailsApproved != null && !Convert.ToBoolean(payeeBankingDetailsApproved.IsApproved))
            {
                var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.thePracticeIsInactive);
                invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.thePracticeIsInactive, UnderAssessReason = underAssessReason.Description, InvoiceId = 0, TebaInvoiceId = tebaInvoice.TebaInvoiceId });
            }

            //  Checking totalInvoiceAssessedAmount rule (Check if  All Line Items assessed to Zero and if so Reject Invoice)
            var totalAssessedAmountExcl = tebaInvoice.TebaInvoiceLines.Sum(item => item.AuthorisedAmount);
            var totalInvoiceAssessedAmountExcl = "{\"TotalInvoiceAssessedAmount\": \"" + totalAssessedAmountExcl + "\"}";
            var assessedAmountExclRuleRequest = new RuleRequest()
            {
                Data = totalInvoiceAssessedAmountExcl,
                RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.TotalAssessedAmount.Constants.AssessedAmountExclCheckRule },
                ExecutionFilter = "medical"
            };

            var totalInvoiceAssessedAmountResult = await _rulesEngine.ExecuteRules(assessedAmountExclRuleRequest);
            var ruleresult = totalInvoiceAssessedAmountResult.RuleResults.FirstOrDefault();

            if (!totalInvoiceAssessedAmountResult.OverallSuccess)
            {
                ruleRequestResult.RuleResults.Add(new RuleResultResponse
                {
                    Passed = totalInvoiceAssessedAmountResult.OverallSuccess,
                    RuleName = ruleresult?.RuleName,
                    MessageList = ruleresult?.MessageList
                });
                var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.NoValidLines);
                invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.NoValidLines, UnderAssessReason = underAssessReason.Description, InvoiceId = 0, TebaInvoiceId = tebaInvoice.TebaInvoiceId });
            }

            return invoiceUnderAssessReasons;
        }

        public async Task<string> GetInvoiceLineClaimInjuriesAsync(int personEventId, int preAuthId, List<InvoiceLineICD10Code> invoiceLineInjuries)
        {
            ICD10InjuryData icd10InjuryData = new ICD10InjuryData();
            //Get all Primary Injuries on the Claim
            var claimInjuries = await _medicalInvoiceClaimService.GetMedicalInvoiceClaimInjury(personEventId).ConfigureAwait(true);
            //Get all Secondary Injuries on the Claim
            var calimSecondaryInjuries = await _medicalInvoiceClaimService.GetMedicalInvoiceClaimSecondaryInjuries(personEventId).ConfigureAwait(true);

            List<ICD10Injury> claimInjuryList = new List<ICD10Injury>();
            foreach (var injury in claimInjuries)
            {
                claimInjuryList.Add(new ICD10Injury { ICD10CodeId = injury.Icd10CodeId, ICD10Code = injury.Icd10Code, BodySideId = Convert.ToInt32(injury.BodySideAffectedType), ICD10DiagnosticGroupId = injury.ICD10DiagnosticGroupId, ICD10DiagnosticGroupCode = injury.ICD10DiagnosticGroupCode, ICD10CategoryId = injury.ICD10CategoryId, ICD10CategoryCode = injury.ICD10CategoryCode, IsPrimary = injury.IsPrimary });
            }
            foreach (var secondaryInjury in calimSecondaryInjuries)
            {
                claimInjuryList.Add(new ICD10Injury { ICD10CodeId = secondaryInjury.Icd10CodeId, BodySideId = Convert.ToInt32(secondaryInjury.BodySideAffectedType), ICD10DiagnosticGroupId = secondaryInjury.ICD10DiagnosticGroupId, ICD10DiagnosticGroupCode = secondaryInjury.ICD10DiagnosticGroupCode, ICD10CategoryId = secondaryInjury.ICD10CategoryId, ICD10CategoryCode = secondaryInjury.ICD10CategoryCode, IsPrimary = secondaryInjury.IsPrimary });
            }
            icd10InjuryData.ClaimInjuries = claimInjuryList;

            if (preAuthId > 0)
            {
                var preAuthDetails = await _preAuthInvoiceService.GetMedicalInvoicePreAuthorisationById(preAuthId).ConfigureAwait(true);
                List<ICD10Injury> preAuthICD10Codes = new List<ICD10Injury>();
                foreach (var preAuth in preAuthDetails.PreAuthIcd10Codes)
                {
                    preAuthICD10Codes.Add(new ICD10Injury { ICD10CodeId = (int)preAuth.Icd10CodeId, ICD10Code = preAuth.Icd10Code, BodySideId = preAuth.BodySideId });
                }
                icd10InjuryData.PreAuthICD10Codes = preAuthICD10Codes;
            }

            List<ICD10Injury> invoiceLineInjuryList = new List<ICD10Injury>();
            if (invoiceLineInjuries != null)
            {
                foreach (var invoiceLineInjury in invoiceLineInjuries)
                {
                    var icd10CodeModel = await _icd10CodeService.FilterICD10Code(invoiceLineInjury.Icd10Code);
                    if (icd10CodeModel?.Count > 0)
                    {
                        invoiceLineInjuryList.Add(new ICD10Injury { ICD10CodeId = (int)invoiceLineInjury.Icd10CodeId, ICD10Code = invoiceLineInjury.Icd10Code, BodySideId = invoiceLineInjury.BodySideId, ICD10DiagnosticGroupId = icd10CodeModel[0].Icd10DiagnosticGroupId, ICD10DiagnosticGroupCode = icd10CodeModel[0].Icd10DiagnosticGroupCode, ICD10CategoryId = icd10CodeModel[0].Icd10CategoryId, ICD10CategoryCode = icd10CodeModel[0].Icd10CategoryCode, IsPrimary = true });
                    }
                }
            }
            icd10InjuryData.ICD10CodesToValidate = invoiceLineInjuryList;

            return JsonConvert.SerializeObject(icd10InjuryData);
        }

        public async Task<InvoiceDetails> GetDuplicateInvoiceDetails(int invoiceId, int personEventId, int healthCareProviderId, string hcpInvoiceNumber, string hcpAccountNumber)
        {
            medical_Invoice invoice = new medical_Invoice();
            InvoiceDetails invoiceDetails = new InvoiceDetails();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (!String.IsNullOrEmpty(hcpInvoiceNumber) && !hcpInvoiceNumber.Equals("null"))
                {
                    invoice = await _invoiceRepository.Where(i => i.InvoiceId != invoiceId && i.PersonEventId == personEventId
                                && i.HealthCareProviderId == healthCareProviderId && i.HcpInvoiceNumber == hcpInvoiceNumber).FirstOrDefaultAsync();
                }

                if (!(invoice?.InvoiceId > 0) && !String.IsNullOrEmpty(hcpAccountNumber) && !hcpAccountNumber.Equals("null"))
                {
                    invoice = await _invoiceRepository.Where(i => i.InvoiceId != invoiceId && i.PersonEventId == personEventId
                                && i.HealthCareProviderId == healthCareProviderId && i.HcpAccountNumber == hcpAccountNumber).FirstOrDefaultAsync();
                }

                if (invoice?.InvoiceId > 0)
                    invoiceDetails = await GetInvoiceDetails(invoice.InvoiceId);

                return invoiceDetails;
            }
        }

        public async Task<string> CheckForDuplicateInvoice(Invoice invoice)
        {
            bool isExist = false;
            List<medical_Invoice> results = new List<medical_Invoice>();

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                if (invoice != null)
                {
                    if (!String.IsNullOrEmpty(invoice.HcpInvoiceNumber))
                    {
                        results = await _invoiceRepository.Where(i => i.InvoiceId != invoice.InvoiceId && i.HealthCareProviderId == invoice.HealthCareProviderId &&
                            i.PersonEventId == invoice.PersonEventId && i.HcpInvoiceNumber == invoice.HcpInvoiceNumber &&
                            (i.InvoiceDate == invoice.InvoiceDate || (i.DateAdmitted >= invoice.DateAdmitted && i.DateAdmitted <= invoice.DateDischarged)
                             || (i.DateDischarged >= invoice.DateAdmitted && i.DateDischarged <= invoice.DateDischarged))).ToListAsync();
                    }

                    if (results.Count <= 0)
                    {
                        if (!String.IsNullOrEmpty(invoice.HcpAccountNumber))
                        {
                            results = await _invoiceRepository.Where(i => i.InvoiceId != invoice.InvoiceId && i.HealthCareProviderId == invoice.HealthCareProviderId &&
                                i.PersonEventId == invoice.PersonEventId && i.HcpAccountNumber == invoice.HcpAccountNumber &&
                            (i.InvoiceDate == invoice.InvoiceDate || (i.DateAdmitted >= invoice.DateAdmitted && i.DateAdmitted <= invoice.DateDischarged)
                             || (i.DateDischarged >= invoice.DateAdmitted && i.DateDischarged <= invoice.DateDischarged))).ToListAsync();
                        }

                        if (results.Count > 0)
                            isExist = true;
                    }
                    else
                    {
                        isExist = true;
                    }
                }
            }
            return "{\"DuplicateInvoiceExist\": \"" + isExist + "\"}";
        }

        public async Task<string> CheckForDuplicateTebaInvoice(TebaInvoice tebaInvoice)
        {
            bool isExist = false;
            List<medical_TebaInvoice> results = new List<medical_TebaInvoice>();

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                if (tebaInvoice != null)
                {
                    if (!String.IsNullOrEmpty(tebaInvoice.HcpInvoiceNumber))
                    {
                        results = await _tebaInvoiceRepository.Where(i => i.TebaInvoiceId != tebaInvoice.TebaInvoiceId && i.InvoicerId == tebaInvoice.InvoicerId &&
                            i.PersonEventId == tebaInvoice.PersonEventId && i.HcpInvoiceNumber == tebaInvoice.HcpInvoiceNumber &&
                            (i.InvoiceDate == tebaInvoice.InvoiceDate || (i.DateTravelledFrom >= tebaInvoice.DateTravelledFrom && i.DateTravelledFrom <= tebaInvoice.DateTravelledTo)
                             || (i.DateTravelledTo >= tebaInvoice.DateTravelledFrom && i.DateTravelledTo <= tebaInvoice.DateTravelledTo))).ToListAsync();
                    }

                    if (results.Count <= 0)
                    {
                        if (!String.IsNullOrEmpty(tebaInvoice.HcpAccountNumber))
                        {
                            results = await _tebaInvoiceRepository.Where(i => i.TebaInvoiceId != tebaInvoice.TebaInvoiceId && i.InvoicerId == tebaInvoice.InvoicerId &&
                                i.PersonEventId == tebaInvoice.PersonEventId && i.HcpAccountNumber == tebaInvoice.HcpAccountNumber &&
                            (i.InvoiceDate == tebaInvoice.InvoiceDate || (i.DateTravelledFrom >= tebaInvoice.DateTravelledFrom && i.DateTravelledFrom <= tebaInvoice.DateTravelledTo)
                             || (i.DateTravelledTo >= tebaInvoice.DateTravelledFrom && i.DateTravelledTo <= tebaInvoice.DateTravelledTo))).ToListAsync();
                        }

                        if (results.Count > 0)
                            isExist = true;
                    }
                    else
                    {
                        isExist = true;
                    }
                }
            }
            return "{\"DuplicateInvoiceExist\": \"" + isExist + "\"}";
        }

        public async Task<bool> CheckForDuplicateInvoices(InvoiceDetails invoiceDetails)
        {
            bool isExist = false;
            List<medical_Invoice> results = new List<medical_Invoice>();

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                if (invoiceDetails != null)
                {
                    if (!String.IsNullOrEmpty(invoiceDetails.HcpInvoiceNumber))
                    {
                        results = await _invoiceRepository.Where(i => i.InvoiceId != invoiceDetails.InvoiceId && i.HealthCareProviderId == invoiceDetails.HealthCareProviderId &&
                            i.PersonEventId == invoiceDetails.PersonEventId && i.HcpInvoiceNumber == invoiceDetails.HcpInvoiceNumber &&
                            (i.InvoiceDate == invoiceDetails.InvoiceDate || (i.DateAdmitted >= invoiceDetails.DateAdmitted && i.DateAdmitted <= invoiceDetails.DateDischarged)
                             || (i.DateDischarged >= invoiceDetails.DateAdmitted && i.DateDischarged <= invoiceDetails.DateDischarged))).ToListAsync();
                    }

                    if (results.Count <= 0)
                    {
                        if (!String.IsNullOrEmpty(invoiceDetails.HcpAccountNumber))
                        {
                            results = await _invoiceRepository.Where(i => i.InvoiceId != invoiceDetails.InvoiceId && i.HealthCareProviderId == invoiceDetails.HealthCareProviderId &&
                                i.PersonEventId == invoiceDetails.PersonEventId && i.HcpAccountNumber == invoiceDetails.HcpAccountNumber &&
                            (i.InvoiceDate == invoiceDetails.InvoiceDate || (i.DateAdmitted >= invoiceDetails.DateAdmitted && i.DateAdmitted <= invoiceDetails.DateDischarged)
                             || (i.DateDischarged >= invoiceDetails.DateAdmitted && i.DateDischarged <= invoiceDetails.DateDischarged))).ToListAsync();
                        }

                        if (results.Count > 0)
                            isExist = true;
                    }
                    else
                    {
                        isExist = true;
                    }
                }
            }
            return isExist;
        }
        
        public async Task<bool> CheckForDuplicateTebaInvoices(TebaInvoice tebaInvoice)
        {
            bool isExist = false;
            List<medical_TebaInvoice> results = new List<medical_TebaInvoice>();

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                if (tebaInvoice != null)
                {
                    if (!String.IsNullOrEmpty(tebaInvoice.HcpInvoiceNumber))
                    {
                        results = await _tebaInvoiceRepository.Where(i => i.TebaInvoiceId != tebaInvoice.TebaInvoiceId && i.InvoicerId == tebaInvoice.InvoicerId &&
                            i.PersonEventId == tebaInvoice.PersonEventId && i.HcpInvoiceNumber == tebaInvoice.HcpInvoiceNumber &&
                            (i.InvoiceDate == tebaInvoice.InvoiceDate || (i.DateTravelledFrom >= tebaInvoice.DateTravelledFrom && i.DateTravelledFrom <= tebaInvoice.DateTravelledTo)
                             || (i.DateTravelledTo >= tebaInvoice.DateTravelledFrom && i.DateTravelledTo <= tebaInvoice.DateTravelledTo))).ToListAsync();
                    }

                    if (results.Count <= 0)
                    {
                        if (!String.IsNullOrEmpty(tebaInvoice.HcpAccountNumber))
                        {
                            results = await _tebaInvoiceRepository.Where(i => i.TebaInvoiceId != tebaInvoice.TebaInvoiceId && i.InvoicerId == tebaInvoice.InvoicerId &&
                                i.PersonEventId == tebaInvoice.PersonEventId && i.HcpAccountNumber == tebaInvoice.HcpAccountNumber &&
                            (i.InvoiceDate == tebaInvoice.InvoiceDate || (i.DateTravelledFrom >= tebaInvoice.DateTravelledFrom && i.DateTravelledFrom <= tebaInvoice.DateTravelledTo)
                             || (i.DateTravelledTo >= tebaInvoice.DateTravelledFrom && i.DateTravelledTo <= tebaInvoice.DateTravelledTo))).ToListAsync();
                        }

                        if (results.Count > 0)
                            isExist = true;
                    }
                    else
                    {
                        isExist = true;
                    }
                }
            }
            return isExist;
        }
        

        public async Task<bool> CheckIfHealthcareProviderIsActive(int healthcareProviderId)
        {
            var healthCareProvider = await GetHealthCareProviderByIdCommon(healthcareProviderId);
            return healthCareProvider?.IsActive == true;
        }

        public async Task<HealthCareProvider> GetHealthCareProviderByIdForSTPIntegration(int healthcareProviderId)
        {
            return await _healthCareProviderService.GetHealthCareProviderByIdForSTPIntegration(healthcareProviderId);
        }

        public async Task<bool> CompareMedicalInvoiceAndLineTotals(InvoiceDetails invoiceDetails)
        {
            Contract.Requires(invoiceDetails != null);
            bool totalsAreEqual = false;
            decimal invoiceLinesTotal = 0;
            decimal invoiceLinesVat = 0;
            foreach (InvoiceLineDetails line in invoiceDetails.InvoiceLineDetails)
            {
                invoiceLinesTotal += Convert.ToDecimal(line.RequestedAmountInclusive);
                invoiceLinesVat += Convert.ToDecimal(line.RequestedVat);
            }

            if (invoiceDetails.InvoiceTotalInclusive == invoiceLinesTotal)
            {
                totalsAreEqual = true;
            }
            else
            {
                var amountTolerance = await _configurationService.GetModuleAmountToleranceByKey(SystemSettings.MedicalInvoiceAmountTolerance).ConfigureAwait(true);
                if ((invoiceDetails.InvoiceTotalInclusive - Convert.ToDecimal(amountTolerance)) < invoiceLinesTotal && (invoiceDetails.InvoiceTotalInclusive + Convert.ToDecimal(amountTolerance)) > invoiceLinesTotal)
                {
                    totalsAreEqual = true;
                }
            }

            return totalsAreEqual;
        }

        public async Task<bool> IsPreAuthRequired(int healthCareProviderId, bool isChronic)
        {
            var isPreAuthRequired = true;
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var healthCareProvider = await GetHealthCareProviderByIdCommon(healthCareProviderId);
                var isSubsequentCare = CheckSubsquentCareRequired(); //still have to implement the logic once stabilized date is available on personevent

                if (isChronic && Convert.ToBoolean(healthCareProvider.ChronicMedicalAuthNeededTypeId ?? 1))
                {
                    isPreAuthRequired = true;
                }
                else
                {
                    isPreAuthRequired = isSubsequentCare && Convert.ToBoolean(healthCareProvider.AcuteMedicalAuthNeededTypeId ?? 1);
                }
            }
            return isPreAuthRequired;
        }

        public async Task<Dictionary<string, InvoiceLineDetails>> CheckIsPreAuthLineItemAuthorised(InvoiceDetails invoiceDetails)
        {
            Contract.Requires(invoiceDetails != null);
            List<PreAuthorisationBreakdown> preAuthBreakdownsList = new List<PreAuthorisationBreakdown>();
            List<InvoiceLineDetails> invoiceLineDetailsList = new List<InvoiceLineDetails>();
            Dictionary<string, InvoiceLineDetails> lineItemAuthorisedList = new Dictionary<string, InvoiceLineDetails>();
            var preAuthIds = invoiceDetails.MedicalInvoicePreAuths.Select(x => x.PreAuthId).ToList();
            var invoiceLineDetails = invoiceDetails.InvoiceLineDetails;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (preAuthIds.Any() && invoiceLineDetails.Any())
                {
                    foreach (var preAuthId in preAuthIds)
                    {
                        var preAuthDetails = await _preAuthInvoiceService.GetMedicalInvoicePreAuthorisationById(preAuthId).ConfigureAwait(true);

                        preAuthDetails?.PreAuthorisationBreakdowns.ForEach(breakdown =>
                        {
                            preAuthBreakdownsList.Add(Mapper.Map<PreAuthorisationBreakdown>(breakdown));
                        });

                    }

                    foreach (var invoiceLine in invoiceLineDetails)
                    {
                        for (int i = 0; i < preAuthBreakdownsList.Count; i++)
                        {
                            if (invoiceLine.HcpTariffCode == preAuthBreakdownsList[i].TariffCode && preAuthBreakdownsList[i].IsAuthorised == true &&
                            (preAuthBreakdownsList[i].DateAuthorisedFrom <= invoiceLine.ServiceDate && preAuthBreakdownsList[i].DateAuthorisedTo >= invoiceLine.ServiceDate)
                            )
                            {
                                lineItemAuthorisedList.Add(MediCareConstants.LineItemAuthorised + i, invoiceLine);
                                break;
                            }
                        }
                    }

                    //getting difference
                    var getNotAuthorisedPreAuthBreakdown = invoiceLineDetails.Except(lineItemAuthorisedList.Values).ToList();

                    if (getNotAuthorisedPreAuthBreakdown != null)
                    {
                        for (int i = 0; i < getNotAuthorisedPreAuthBreakdown.Count; i++)
                        {
                            lineItemAuthorisedList.Add(MediCareConstants.LineItemNotAuthorised + i, getNotAuthorisedPreAuthBreakdown[i]);
                        }
                    }

                    return lineItemAuthorisedList;

                }
                else
                {
                    //noPreAuthorisationObtained
                    return lineItemAuthorisedList;
                }

            }
        }

        public async Task<Dictionary<string, InvoiceLineDetails>> CheckIsInvoiceLineTreatmentBasketAuthorised(InvoiceDetails invoiceDetails)
        {
            Contract.Requires(invoiceDetails != null);
            Dictionary<string, InvoiceLineDetails> lineItemAuthorisedList = new Dictionary<string, InvoiceLineDetails>();
            var preAuthIds = invoiceDetails.MedicalInvoicePreAuths.Select(x => x.PreAuthId).ToList();
            var invoiceLineDetails = invoiceDetails.InvoiceLineDetails;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (preAuthIds.Any() && invoiceLineDetails.Any())
                {
                    var treatmentBasketMedicalItemsList = await (
                           from bus in _preAuthTreatmentBasketsRepository
                           join busItem in _preAuthTreatmentBasketMedicalItemsRepository on bus.TreatmentBasketId equals busItem.TreatmentBasketId
                           where (bool)bus.IsAuthorised && busItem.PractitionerType == (PractitionerTypeEnum)invoiceDetails.PractitionerTypeId
                           select new { bus, busItem }
                           ).ToListAsync();

                    var preAuthorisationList = await _preAuthInvoiceService.GetInvoiceMappedPreAuthorisations(preAuthIds);
                    var filteredTreatmentBasketList = treatmentBasketMedicalItemsList.Where(x => !preAuthorisationList.Any(y => y.PreAuthId == x.bus.PreAuthId)).Select(a => a.busItem).ToList();

                    foreach (var invoiceLine in invoiceLineDetails)
                    {
                        for (int i = 0; i < filteredTreatmentBasketList.Count; i++)
                        {
                            if (filteredTreatmentBasketList[i].MedicalItemId == invoiceLine.MedicalItemId)//might need to use item code in future
                            {
                                lineItemAuthorisedList.Add(MediCareConstants.LineItemAuthorised + i, invoiceLine);
                                break;
                            }
                        }
                    }

                    //getting difference
                    var getNotAuthorisedMedicalItem = invoiceLineDetails.Except(lineItemAuthorisedList.Values).ToList();

                    if (getNotAuthorisedMedicalItem.Any())
                    {
                        for (int i = 0; i < getNotAuthorisedMedicalItem.Count; i++)
                        {
                            lineItemAuthorisedList.Add(MediCareConstants.LineItemNotAuthorised + i, getNotAuthorisedMedicalItem[i]);
                        }
                    }

                    return lineItemAuthorisedList;

                }
                else
                {
                    //noPreAuthorisationObtained
                    return lineItemAuthorisedList;
                }

            }
        }

        public async Task<InvoiceStatusEnum> GetInvoiceStatusForUnderAssessReasons(int invoiceId, List<InvoiceUnderAssessReason> invoiceUnderAssessReasons, InvoiceStatusEnum invoiceStatus)
        {
            if (invoiceUnderAssessReasons != null && invoiceUnderAssessReasons.Count > 0)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var statusEnumList = new List<InvoiceStatusEnum>();
                    bool isRejected = false;
                    bool isPending = false;
                    bool isValidated = false;

                    //Get InvoiceStatus for underAssessReason
                    foreach (var invoiceUnderAssessReason in invoiceUnderAssessReasons)
                    {
                        var underAssessReason = await _underAssessReasonService.GetUnderAssessReason(invoiceUnderAssessReason.UnderAssessReasonId);
                        var status = statusEnumList.Find(s => s == underAssessReason.InvoiceStatus);
                        if (status == 0)
                        {
                            statusEnumList.Add(underAssessReason.InvoiceStatus);
                        }
                    }

                    foreach (var status in statusEnumList)
                    {
                        switch (status)
                        {
                            case InvoiceStatusEnum.Rejected:
                                isRejected = true;
                                break;
                            case InvoiceStatusEnum.Pending:
                                isPending = true;
                                break;
                            case InvoiceStatusEnum.Validated:
                                isValidated = true;
                                break;
                        }
                    }
                    if (isRejected)
                    {
                        return InvoiceStatusEnum.Rejected;
                    }
                    else if (isPending)
                    {
                        return InvoiceStatusEnum.Pending;
                    }
                    else if (isValidated)
                    {
                        return InvoiceStatusEnum.Allocated;
                    }
                    else
                    {
                        return InvoiceStatusEnum.Validated;
                    }
                }
            }
            else
            {
                return invoiceStatus;
            }
        }

        public async Task<int> AssessAllocationSubmit(InvoiceAssessAllocateData invoiceAssessAllocateData)
        {
            Contract.Requires(invoiceAssessAllocateData != null);
            var invoiceDetail = invoiceAssessAllocateData.InvoiceDetail;
            var tebaInvoice = invoiceAssessAllocateData.TebaInvoice;
            int allocationId = 0;

            using (var scope = _dbContextScopeFactory.Create())
            {
                //checking if same invoice already allocated
                Allocation paymentAlocationExist;
                if (invoiceAssessAllocateData.InvoiceAllocation.PaymentType == PaymentTypeEnum.TebaInvoice)
                {
                    paymentAlocationExist = await _paymentsAllocationService.GetAllocationsByMedicalInvoiceId(invoiceAssessAllocateData.TebaInvoice.TebaInvoiceId, PaymentTypeEnum.TebaInvoice);
                    if (paymentAlocationExist != null || paymentAlocationExist?.AllocationId > 0)
                    {
                        tebaInvoice.InvoiceStatus = InvoiceStatusEnum.Allocated;
                        await EditTebaInvoiceStatus(tebaInvoice);
                        return paymentAlocationExist.AllocationId;
                    }

                    var invoiceAllocation = invoiceAssessAllocateData.InvoiceAllocation;

                    if (tebaInvoice.InvoiceStatus == InvoiceStatusEnum.Validated)
                    {
                        //Edit Invoice as it has assessedAmounts or authorisedAmounts before allocation
                        await EditTebaInvoiceAuthorisedAmounts(invoiceAssessAllocateData.TebaInvoice);

                        Allocation allocation = new Allocation();
                        allocation.PayeeId = invoiceAllocation.PayeeId;
                        allocation.PaymentAllocationStatus = invoiceAllocation.PaymentAllocationStatus;
                        allocation.MedicalInvoiceId = invoiceAllocation.MedicalInvoiceId;
                        allocation.AssessedAmount = invoiceAllocation.AssessedAmount;
                        allocation.AssessedVat = invoiceAllocation.AssessedVat;
                        allocation.PaymentType = invoiceAllocation.PaymentType;

                        allocationId = await _paymentsAllocationService.CreatePaymentAllocation(allocation);

                        invoiceDetail.InvoiceStatus = InvoiceStatusEnum.Allocated;
                        await EditTebaInvoiceStatus(tebaInvoice);
                    }
                }
                else
                {
                    paymentAlocationExist = await _paymentsAllocationService.GetAllocationsByMedicalInvoiceId(invoiceAssessAllocateData.InvoiceDetail.InvoiceId, PaymentTypeEnum.MedicalInvoice);
                    if (paymentAlocationExist != null || paymentAlocationExist?.AllocationId > 0)
                    {
                        invoiceDetail.InvoiceStatus = InvoiceStatusEnum.Allocated;
                        await EditInvoiceStatus(invoiceDetail);
                        return paymentAlocationExist.AllocationId;
                    }

                    var invoiceAllocation = invoiceAssessAllocateData.InvoiceAllocation;

                    if (invoiceDetail.InvoiceStatus == InvoiceStatusEnum.Validated)
                    {
                        //Edit Invoice as it has assessedAmounts or authorisedAmounts before allocation
                        await EditInvoiceAuthorisedAmounts(invoiceAssessAllocateData.InvoiceDetail);

                        FinCare.Contracts.Entities.Payments.Allocation allocation = new FinCare.Contracts.Entities.Payments.Allocation();
                        allocation.PayeeId = invoiceAllocation.PayeeId;
                        allocation.PaymentAllocationStatus = invoiceAllocation.PaymentAllocationStatus;
                        allocation.MedicalInvoiceId = invoiceAllocation.MedicalInvoiceId;
                        allocation.AssessedAmount = invoiceAllocation.AssessedAmount;
                        allocation.AssessedVat = invoiceAllocation.AssessedVat;
                        allocation.PaymentType = invoiceAllocation.PaymentType;

                        allocationId = await _paymentsAllocationService.CreatePaymentAllocation(allocation);

                        invoiceDetail.InvoiceStatus = InvoiceStatusEnum.Allocated;
                        await EditInvoiceStatus(invoiceDetail);
                    }
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

            return allocationId;
        }

        public async Task<RuleRequestResultResponse> CheckIfInvoiceIsActive(int invoiceId)
        {
            RuleRequestResultResponse ruleRequestResult = new RuleRequestResultResponse() { RuleResults = new List<RuleResultResponse>() };

            using (var scope = _dbContextScopeFactory.Create())
            {
                var invoiceRepository = await _invoiceRepository.FirstOrDefaultAsync(a => a.InvoiceId == invoiceId);

                var ruleData = "{\"InvoiceIsActive\": \"" + invoiceRepository.IsActive + "\"}";

                var invoiceIsActiveRuleRequest = new RuleRequest()
                {
                    Data = ruleData,
                    RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.InvoiceIsActive.Constants.InvoiceIsActiveRule },
                    ExecutionFilter = "medical"
                };

                var invoiceIsActiveRuleResult = await _rulesEngine.ExecuteRules(invoiceIsActiveRuleRequest);
                var ruleResult = invoiceIsActiveRuleResult.RuleResults.FirstOrDefault();

                ruleRequestResult.RuleResults.Add(new RuleResultResponse
                {
                    Passed = invoiceIsActiveRuleResult.OverallSuccess,
                    RuleName = ruleResult?.RuleName,
                    MessageList = ruleResult?.MessageList
                });

                ruleRequestResult.OverallSuccess = ruleRequestResult.RuleResults.TrueForAll(s => s.Passed);

                return ruleRequestResult;
            }
        }

        public async Task<RuleRequestResultResponse> CheckIfTebaInvoiceIsActive(int tebaInvoiceId)
        {
            RuleRequestResultResponse ruleRequestResult = new RuleRequestResultResponse() { RuleResults = new List<RuleResultResponse>() };

            using (var scope = _dbContextScopeFactory.Create())
            {
                var invoiceRepository = await _tebaInvoiceRepository.FirstOrDefaultAsync(a => a.TebaInvoiceId == tebaInvoiceId);

                var ruleData = "{\"InvoiceIsActive\": \"" + invoiceRepository.IsActive + "\"}";

                var invoiceIsActiveRuleRequest = new RuleRequest()
                {
                    Data = ruleData,
                    RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.InvoiceIsActive.Constants.InvoiceIsActiveRule },
                    ExecutionFilter = "medical"
                };

                var invoiceIsActiveRuleResult = await _rulesEngine.ExecuteRules(invoiceIsActiveRuleRequest);
                var ruleResult = invoiceIsActiveRuleResult.RuleResults.FirstOrDefault();

                ruleRequestResult.RuleResults.Add(new RuleResultResponse
                {
                    Passed = invoiceIsActiveRuleResult.OverallSuccess,
                    RuleName = ruleResult?.RuleName,
                    MessageList = ruleResult?.MessageList
                });

                ruleRequestResult.OverallSuccess = ruleRequestResult.RuleResults.TrueForAll(s => s.Passed);

                return ruleRequestResult;
            }
        }

        public async Task<RuleRequestResultResponse> CheckRequestedAmountExceedAllocatedAmount(int invoiceId, decimal authorisedAmount = 0)
        {
            RuleRequestResultResponse ruleRequestResult = new RuleRequestResultResponse() { RuleResults = new List<RuleResultResponse>() };

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _invoiceRepository.FirstOrDefaultAsync(a => a.InvoiceId == invoiceId);
                var amountTolerance = await _configurationService.GetModuleAmountToleranceByKey(SystemSettings.MedicalInvoiceAmountTolerance).ConfigureAwait(true);
                var totalAmountTolerance = Convert.ToInt32(amountTolerance) > 0 ? Convert.ToInt32(amountTolerance) : 0;
                var paymentAlocation = await _paymentsAllocationService.GetAllocationsByMedicalInvoiceId(invoiceId, PaymentTypeEnum.MedicalInvoice);
                //need to check if invoice is allocated - check for nuls
                var totalAssessedAmountWithTolerance = (paymentAlocation?.AssessedAmount > 0) ? paymentAlocation.AssessedAmount + totalAmountTolerance : entity.AuthorisedAmount + totalAmountTolerance;

                var totalInvoiceAmount = (entity.AuthorisedAmount > 0) ? entity.AuthorisedAmount : authorisedAmount;

                var totalInvoiceAssessedAmount = "{\"TotalAssessedAmountWithTolerance\": \"" + totalAssessedAmountWithTolerance + "\",\"TotalRequestedAmount\": \"" + totalInvoiceAmount + "\"}";
                var requestedAmountCannotExceedAllocatedAmountRuleRequest = new RuleRequest()
                {
                    Data = totalInvoiceAssessedAmount,
                    RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.RequestedAmountCannotExceedAllocated.Constants.RequestedAmountExceedsAllocatedAmountRule },
                    ExecutionFilter = "medical"
                };

                var requestedAmountCannotExceedAllocatedAmountResult = await _rulesEngine.ExecuteRules(requestedAmountCannotExceedAllocatedAmountRuleRequest);
                var ruleResult = requestedAmountCannotExceedAllocatedAmountResult.RuleResults.FirstOrDefault();

                ruleRequestResult.RuleResults.Add(new RuleResultResponse
                {
                    Passed = requestedAmountCannotExceedAllocatedAmountResult.OverallSuccess,
                    RuleName = ruleResult?.RuleName,
                    MessageList = ruleResult?.MessageList
                });

                ruleRequestResult.OverallSuccess = ruleRequestResult.RuleResults.TrueForAll(s => s.Passed);
                return ruleRequestResult;

            }

        }
        
        public async Task<RuleRequestResultResponse> CheckTebaRequestedAmountExceedAllocatedAmount(int tebaInvoiceId, decimal authorisedAmount = 0)
        {
            RuleRequestResultResponse ruleRequestResult = new RuleRequestResultResponse() { RuleResults = new List<RuleResultResponse>() };

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _tebaInvoiceRepository.FirstOrDefaultAsync(a => a.TebaInvoiceId == tebaInvoiceId);
                var amountTolerance = await _configurationService.GetModuleAmountToleranceByKey(SystemSettings.MedicalInvoiceAmountTolerance).ConfigureAwait(true);
                var totalAmountTolerance = Convert.ToInt32(amountTolerance) > 0 ? Convert.ToInt32(amountTolerance) : 0;
                var paymentAlocation = await _paymentsAllocationService.GetAllocationsByMedicalInvoiceId(tebaInvoiceId, PaymentTypeEnum.TebaInvoice);
                //need to check if invoice is allocated - check for nuls
                var totalAssessedAmountWithTolerance = (paymentAlocation?.AssessedAmount > 0) ? paymentAlocation.AssessedAmount + totalAmountTolerance : entity.AuthorisedAmount + totalAmountTolerance;
                var totalInvoiceAmount = (entity.AuthorisedAmount > 0) ? entity.AuthorisedAmount : authorisedAmount;

                var totalInvoiceAssessedAmount = "{\"TotalAssessedAmountWithTolerance\": \"" + totalAssessedAmountWithTolerance + "\",\"TotalRequestedAmount\": \"" + totalInvoiceAmount + "\"}";
                var requestedAmountCannotExceedAllocatedAmountRuleRequest = new RuleRequest()
                {
                    Data = totalInvoiceAssessedAmount,
                    RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.RequestedAmountCannotExceedAllocated.Constants.RequestedAmountExceedsAllocatedAmountRule },
                    ExecutionFilter = "medical"
                };

                var requestedAmountCannotExceedAllocatedAmountResult = await _rulesEngine.ExecuteRules(requestedAmountCannotExceedAllocatedAmountRuleRequest);
                var ruleResult = requestedAmountCannotExceedAllocatedAmountResult.RuleResults.FirstOrDefault();

                ruleRequestResult.RuleResults.Add(new RuleResultResponse
                {
                    Passed = requestedAmountCannotExceedAllocatedAmountResult.OverallSuccess,
                    RuleName = ruleResult?.RuleName,
                    MessageList = ruleResult?.MessageList
                });

                ruleRequestResult.OverallSuccess = ruleRequestResult.RuleResults.TrueForAll(s => s.Passed);
                return ruleRequestResult;
            }
        }

        public Task<List<RuleRequestResultResponse>> AddRuleRequestResult(RuleRequestResultResponse[] rulesResultArr)
        {
            Contract.Requires(rulesResultArr != null);
            List<RuleRequestResultResponse> ruleRequestResult = new List<RuleRequestResultResponse>();

            // building list from array elements which is different rules
            if (rulesResultArr.Length > 0)
            {
                for (int i = 0; i < rulesResultArr.Length; i++)
                {
                    if (!rulesResultArr[i].RuleResults[0].Passed)
                    {
                        ruleRequestResult.Add(rulesResultArr[i]);
                    }

                }
            }

            return Task.FromResult(ruleRequestResult);
        }

        public async Task<List<InvoiceUnderAssessReason>> ValidateMedicalInvoice(InvoiceDetails invoiceDetails)
        {
            var invoiceUnderAssessReasons = new List<InvoiceUnderAssessReason>();
            if (invoiceDetails != null)
            {
                //Check if HealthcareProvider is Active
                var healthCareProviderIsActive = await CheckIfHealthcareProviderIsActive(invoiceDetails.HealthCareProviderId);

                //Check if invoice is duplicate
                var isDuplicateInvoice = await CheckForDuplicateInvoices(invoiceDetails);

                //Check if Liability is Accepted
                var liabilityAccepted = await ClaimLiabilityAccepted(Convert.ToInt32(invoiceDetails.PersonEventId));
                var personEvent = await _eventService.GetPersonEvent(Convert.ToInt32(invoiceDetails.PersonEventId));

                //Check for Medical Benefits
                var hasMedicalBenefits = await _medicalInvoiceClaimService.ValidateMedicalBenefit(Convert.ToInt32(invoiceDetails.ClaimId), invoiceDetails.InvoiceDate);

                //Validate ICD10Code formats and check for duplicate lines
                bool invoiceHasAtleastOneLineItem = true;
                bool allICD10CodeFormatValidated = false;
                if (invoiceDetails.InvoiceLineDetails.Count == 0)
                {
                    invoiceHasAtleastOneLineItem = false;
                }

                //Check for Medical Report
                MedicalReportQueryParams reportParams = new MedicalReportQueryParams
                {
                    HealthCareProviderId = invoiceDetails.HealthCareProviderId,
                    PersonEventId = Convert.ToInt32(invoiceDetails.PersonEventId),
                    DateTreatmentFrom = Convert.ToDateTime(invoiceDetails.DateAdmitted),
                    DateTreatmentTo = Convert.ToDateTime(invoiceDetails.DateDischarged),
                    PractitionerTypeId = invoiceDetails.PractitionerTypeId
                };
                var invoiceMedicalReports = await GetMedicalReportsForInvoiceCommon(reportParams);
                var invoiceTotalsMatch = await CompareMedicalInvoiceAndLineTotals(invoiceDetails);

                //Process validations

                //HealthcareProvider Active Status
                if (!healthCareProviderIsActive)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.thePracticeIsInactive);
                    invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.thePracticeIsInactive, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                }

                //Duplicate Invoice
                if (isDuplicateInvoice)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.invoiceIsADuplicate);
                    invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.invoiceIsADuplicate, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                }

                //At Least 1 Line Item
                if (!invoiceHasAtleastOneLineItem)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.InvNoLines);
                    invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.InvNoLines, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                }

                //Check if Invoice total matches line items total
                if (!invoiceTotalsMatch)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.TotMisMatch);
                    invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.TotMisMatch, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                }

                //Claim Liability Status
                if (!liabilityAccepted)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.claimLiabilityNotAccepted);
                    invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.claimLiabilityNotAccepted, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                }

                //Check if STP
                if (personEvent != null && !personEvent.IsStraightThroughProcess)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.IsNotSTP);
                    invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.IsNotSTP, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                }

                //Check Medical Benefits
                if (!hasMedicalBenefits)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.noMedicalCover);
                    invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.noMedicalCover, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                }

                //Check ICD10Code formats
                if (!allICD10CodeFormatValidated)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.icd10CodeSuppliedHasInvalidFormat);
                    invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.icd10CodeSuppliedHasInvalidFormat, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                }

                //Check Medical Reports
                if (invoiceMedicalReports == null || invoiceMedicalReports.Count == 0)
                {
                    var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.medicalReportRequiredFirstProgressAndFinal);
                    invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason() { UnderAssessReasonId = (int)UnderAssessReasonEnum.medicalReportRequiredFirstProgressAndFinal, UnderAssessReason = underAssessReason.Description, InvoiceId = invoiceDetails.InvoiceId, IsActive = true });
                }
            }
            return invoiceUnderAssessReasons;
        }

        public async Task<bool> ValidateICD10Codes(InvoiceDetails invoiceDetails)
        {
            bool icd10CodesAreValid = false;
            if (invoiceDetails != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    //Validate ICD10Codes on Medical Invoice against Claim Injury
                    List<InvoiceLineICD10Code> invoiceLineICD10Codes = new List<InvoiceLineICD10Code>();
                    foreach (var invoiceLine in invoiceDetails.InvoiceLineDetails)
                    {
                        char[] splitters = new char[] { ' ', '/' };
                        foreach (var icd10Code in invoiceLine.Icd10Code.Split(splitters))
                        {
                            if (!invoiceLineICD10Codes.Any(line => line.Icd10Code.Trim() == icd10Code.Trim()) && !string.IsNullOrWhiteSpace(icd10Code.Trim()))
                                invoiceLineICD10Codes.Add(new InvoiceLineICD10Code() { Icd10CodeId = 0, Icd10Code = icd10Code.Trim(), BodySideId = 0 });
                        }
                    }

                    string ruleData = await GetInvoiceLineClaimInjuriesAsync(Convert.ToInt32(invoiceDetails.PersonEventId), 0, invoiceLineICD10Codes);

                    var ruleRequest = new RuleRequest()
                    {
                        Data = ruleData,
                        RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.ICD10CodeMatch.Constants.MedicalInvoiceClaimInjuryName },
                        ExecutionFilter = "medical"
                    };
                    var icd10CodeRuleResult = await _rulesEngine.ExecuteRules(ruleRequest);
                    icd10CodesAreValid = icd10CodeRuleResult.OverallSuccess;
                }
            }
            return icd10CodesAreValid;
        }

        public async Task<List<int>> GetPendingInvoiceIdsByPersonEventId(int invoiceId, int tebaInvoiceId, int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                bool useTebaInvoiceId = tebaInvoiceId > 0;
                List<int> invoiceIds = new List<int>();

                if (useTebaInvoiceId)
                {
                    invoiceIds = await _tebaInvoiceRepository.Where(x => x.PersonEventId == personEventId && x.InvoiceStatus == InvoiceStatusEnum.Pending).Select(x => x.TebaInvoiceId).ToListAsync();
                }
                else if (!useTebaInvoiceId)
                {
                    invoiceIds = await _invoiceRepository.Where(x => x.PersonEventId == personEventId && x.InvoiceStatus == InvoiceStatusEnum.Pending).Select(x => x.InvoiceId).ToListAsync();
                }

                return invoiceIds;
            }
        }

        public async Task<InvoiceDetails> GetInvoiceDetails(int invoiceId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewMedicalInvoice);

            InvoiceDetails invoiceDetails;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                invoiceDetails = await (
                        from i in _invoiceRepository
                        join hcp in _healthCareProviderRepository on i.HealthCareProviderId equals hcp.RolePlayerId
                        join pt in _practitionerTypeRepository on hcp.ProviderTypeId equals pt.PractitionerTypeId
                        where i.InvoiceId == invoiceId
                        select new InvoiceDetails
                        {
                            InvoiceId = i.InvoiceId,
                            ClaimId = i.ClaimId,
                            PersonEventId = i.PersonEventId,
                            HealthCareProviderId = i.HealthCareProviderId,
                            HealthCareProviderName = hcp.Name,
                            HcpInvoiceNumber = i.HcpInvoiceNumber,
                            HcpAccountNumber = i.HcpAccountNumber,
                            InvoiceNumber = i.InvoiceNumber,
                            InvoiceDate = i.InvoiceDate,
                            DateSubmitted = i.DateSubmitted,
                            DateReceived = i.DateReceived,
                            DateAdmitted = i.DateAdmitted,
                            DateDischarged = i.DateDischarged,
                            InvoiceStatus = i.InvoiceStatus,
                            InvoiceAmount = i.InvoiceAmount,
                            InvoiceVat = i.InvoiceVat,
                            InvoiceTotalInclusive = i.InvoiceTotalInclusive,
                            AuthorisedAmount = i.AuthorisedAmount,
                            AuthorisedVat = i.AuthorisedVat,
                            AuthorisedTotalInclusive = i.AuthorisedTotalInclusive,
                            PayeeId = i.PayeeId,
                            PayeeName = string.Empty,
                            PayeeTypeId = i.PayeeTypeId,
                            UnderAssessedComments = i.UnderAssessedComments,
                            HoldingKey = i.HoldingKey,
                            IsPaymentDelay = i.IsPaymentDelay,
                            IsPreauthorised = i.IsPreauthorised,
                            PreAuthXml = i.PreAuthXml,
                            Comments = i.Comments,
                            PracticeNumber = hcp.PracticeNumber,
                            PractitionerTypeId = hcp.ProviderTypeId,
                            PractitionerTypeName = pt.Name,
                            IsVat = hcp.IsVat,
                            VatRegNumber = hcp.VatRegNumber,
                            GreaterThan731Days = false,
                            IsActive = i.IsActive,
                            CreatedBy = i.CreatedBy,
                            CreatedDate = i.CreatedDate,
                            ModifiedBy = i.ModifiedBy,
                            ModifiedDate = i.ModifiedDate
                        }).FirstOrDefaultAsync();

                if (invoiceDetails != null)
                {
                    invoiceDetails.InvoiceUnderAssessReasons = Mapper.Map<List<InvoiceUnderAssessReason>>(_invoiceUnderAssessReasonRepository.Where(x => x.InvoiceId == invoiceDetails.InvoiceId).ToList());

                    var payeeType = await _payeeTypeService.GetPayeeTypeById(invoiceDetails.PayeeTypeId);
                    invoiceDetails.PayeeType = payeeType.Name;

                    invoiceDetails.InvoiceLineDetails = await (
                            from i in _invoiceLineRepository
                            join t in _tariffRepository on i.TariffId equals t.TariffId
                            join mi in _medicalItemRepository on t.MedicalItemId equals mi.MedicalItemId
                            where i.InvoiceId == invoiceId
                            select new InvoiceLineDetails
                            {
                                InvoiceLineId = i.InvoiceLineId,
                                InvoiceId = i.InvoiceId,
                                ServiceDate = i.ServiceDate,
                                ServiceTimeStart = i.ServiceTimeStart,
                                ServiceTimeEnd = i.ServiceTimeEnd,
                                RequestedQuantity = i.RequestedQuantity,
                                AuthorisedQuantity = i.AuthorisedQuantity,
                                RequestedAmount = i.RequestedAmount,
                                RequestedVat = i.RequestedVat,
                                RequestedAmountInclusive = i.RequestedAmountInclusive,
                                AuthorisedAmount = i.AuthorisedAmount,
                                AuthorisedVat = i.AuthorisedVat,
                                AuthorisedAmountInclusive = i.AuthorisedAmountInclusive,
                                TotalTariffAmount = i.TotalTariffAmount,
                                TotalTariffVat = i.TotalTariffVat,
                                TotalTariffAmountInclusive = i.TotalTariffAmountInclusive,
                                TariffAmount = i.TariffAmount,
                                CreditAmount = i.CreditAmount,
                                VatCode = i.VatCode,
                                VatPercentage = i.VatPercentage,
                                TariffId = i.TariffId,
                                TreatmentCodeId = i.TreatmentCodeId,
                                MedicalItemId = i.MedicalItemId,
                                HcpTariffCode = i.HcpTariffCode,
                                TariffBaseUnitCostTypeId = i.TariffBaseUnitCostTypeId,
                                Description = i.Description,
                                SummaryInvoiceLineId = i.SummaryInvoiceLineId,
                                IsPerDiemCharge = i.IsPerDiemCharge,
                                IsDuplicate = i.IsDuplicate,
                                DuplicateInvoiceLineId = i.DuplicateInvoiceLineId,
                                CalculateOperands = i.CalculateOperands,
                                Icd10Code = i.Icd10Code,
                                TariffDescription = mi.Description,
                                DefaultQuantity = mi.DefaultQuantity,
                                IsActive = i.IsActive,
                                CreatedBy = i.CreatedBy,
                                CreatedDate = i.CreatedDate,
                                ModifiedBy = i.ModifiedBy,
                                ModifiedDate = i.ModifiedDate,
                                IsModifier = i.IsModifier
                            }).ToListAsync();

                    if (invoiceDetails.InvoiceLineDetails != null && invoiceDetails.InvoiceLineDetails.Count > 0)
                    {
                        foreach (var invoiceLine in invoiceDetails.InvoiceLineDetails)
                            invoiceLine.InvoiceLineUnderAssessReasons = Mapper.Map<List<InvoiceLineUnderAssessReason>>(_invoiceLineUnderAssessReasonRepository.Where(x => x.InvoiceLineId == invoiceLine.InvoiceLineId).ToList());
                    }

                    if (invoiceDetails.PersonEventId > 0)
                    {
                        var claims = await _claimService.GetClaimsByPersonEventId((int)invoiceDetails.PersonEventId);
                        if (claims.Count > 0)
                            invoiceDetails.ClaimReferenceNumber = claims[0].ClaimReferenceNumber;
                    }

                    if (invoiceDetails.HealthCareProviderId > 0)
                    {
                        invoiceDetails.IsMedicalReportExist = await CheckForMedicalReport(invoiceDetails.HealthCareProviderId, invoiceDetails.InvoiceId);
                    }

                    if (invoiceDetails.InvoiceStatus == InvoiceStatusEnum.Paid)
                    {
                        var paymentAlocationDetails = await _paymentsAllocationService.GetAllocationsByMedicalInvoiceId(invoiceDetails.InvoiceId, PaymentTypeEnum.MedicalInvoice);
                        var paymentDetails = await _paymentsAllocationService.GetPaymentByAllocationId(paymentAlocationDetails.AllocationId);
                        if (paymentDetails != null)
                            invoiceDetails.PaymentConfirmationDate = paymentDetails.PaymentConfirmationDate;
                    }

                    invoiceDetails.MedicalInvoicePreAuths = await GetMappedInvoicePreAuthDetails(invoiceId);
                }

                return invoiceDetails;
            }
        }

        public async Task<TebaInvoice> GetTebaInvoice(int tebaInvoiceId)
        {
            TebaInvoice tebaInvoice = new TebaInvoice();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                tebaInvoice = await (
                        from i in _tebaInvoiceRepository
                        join hcp in _healthCareProviderRepository on i.InvoicerId equals hcp.RolePlayerId
                        where i.TebaInvoiceId == tebaInvoiceId
                        select new TebaInvoice
                        {
                            TebaInvoiceId = i.TebaInvoiceId,
                            ClaimId = i.ClaimId,
                            PersonEventId = i.PersonEventId,
                            InvoicerId = i.InvoicerId,
                            InvoicerTypeId = i.InvoicerTypeId,
                            HcpInvoiceNumber = i.HcpInvoiceNumber,
                            HcpAccountNumber = i.HcpAccountNumber,
                            InvoiceNumber = i.InvoiceNumber,
                            InvoiceDate = i.InvoiceDate,
                            DateSubmitted = i.DateSubmitted,
                            DateReceived = i.DateReceived,
                            DateCompleted = i.DateCompleted,
                            DateTravelledFrom = i.DateTravelledFrom,
                            DateTravelledTo = i.DateTravelledTo,
                            PreAuthId = i.PreAuthId,
                            InvoiceStatus = i.InvoiceStatus,
                            InvoiceAmount = i.InvoiceAmount,
                            InvoiceVat = i.InvoiceVat,
                            InvoiceTotalInclusive = i.InvoiceTotalInclusive,
                            AuthorisedAmount = i.AuthorisedAmount,
                            AuthorisedVat = i.AuthorisedVat,
                            AuthorisedTotalInclusive = i.AuthorisedTotalInclusive,
                            PayeeId = i.PayeeId,
                            PayeeTypeId = i.PayeeTypeId,
                            HoldingKey = i.HoldingKey,
                            IsPaymentDelay = i.IsPaymentDelay,
                            IsPreauthorised = i.IsPreauthorised,
                            Description = i.Description,
                            CalcOperands = i.CalcOperands,
                            Kilometers = i.Kilometers,
                            KilometerRate = i.KilometerRate,
                            TebaTariffCode = i.TebaTariffCode,
                            VatCode = i.VatCode,
                            VatPercentage = i.VatPercentage,
                            SwitchBatchId = i.SwitchBatchId,
                            SwitchTransactionNo = i.SwitchTransactionNo,
                            HealthCareProviderName = hcp.Name,
                            PracticeNumber = hcp.PracticeNumber,
                            IsActive = i.IsActive,
                            CreatedBy = i.CreatedBy,
                            CreatedDate = i.CreatedDate,
                            ModifiedBy = i.ModifiedBy,
                            ModifiedDate = i.ModifiedDate
                        }).FirstOrDefaultAsync();

                if (tebaInvoice != null)
                {
                    tebaInvoice.InvoiceUnderAssessReasons = Mapper.Map<List<InvoiceUnderAssessReason>>(_invoiceUnderAssessReasonRepository.Where(x => x.TebaInvoiceId == tebaInvoice.TebaInvoiceId).ToList());
                    
                    tebaInvoice.TebaInvoiceLines = await (
                            from i in _tebaInvoiceLineRepository
                            where i.TebaInvoiceId == tebaInvoiceId
                            select new TebaInvoiceLine
                            {
                                TebaInvoiceLineId = i.TebaInvoiceLineId,
                                TebaInvoiceId = i.TebaInvoiceId,
                                ServiceDate = i.ServiceDate,
                                RequestedQuantity = i.RequestedQuantity,
                                AuthorisedQuantity = i.AuthorisedQuantity,
                                RequestedAmount = i.RequestedAmount,
                                RequestedVat = i.RequestedVat,
                                RequestedAmountInclusive = i.RequestedAmountInclusive,
                                AuthorisedAmount = i.AuthorisedAmount,
                                AuthorisedVat = i.AuthorisedVat,
                                AuthorisedAmountInclusive = i.AuthorisedAmountInclusive,
                                TariffId = i.TariffId,
                                TotalTariffAmount = i.TotalTariffAmount,
                                TotalTariffVat = i.TotalTariffVat,
                                TotalTariffAmountInclusive = i.TotalTariffAmountInclusive,
                                TariffAmount = i.TariffAmount,
                                CreditAmount = i.CreditAmount,
                                VatCode = i.VatCode,
                                VatPercentage = i.VatPercentage,
                                TreatmentCodeId = i.TreatmentCodeId,
                                MedicalItemId = i.MedicalItemId,
                                HcpTariffCode = i.HcpTariffCode,
                                TariffBaseUnitCostTypeId = i.TariffBaseUnitCostTypeId,
                                Description = i.Description,
                                SummaryInvoiceLineId = i.SummaryInvoiceLineId,
                                IsPerDiemCharge = i.IsPerDiemCharge,
                                IsDuplicate = i.IsDuplicate,
                                DuplicateTebaInvoiceLineId = i.DuplicateTebaInvoiceLineId,
                                IsActive = i.IsActive,
                                CreatedBy = i.CreatedBy,
                                CreatedDate = i.CreatedDate,
                                ModifiedBy = i.ModifiedBy,
                                ModifiedDate = i.ModifiedDate
                            }).ToListAsync();

                    if (tebaInvoice.TebaInvoiceLines != null && tebaInvoice.TebaInvoiceLines.Count > 0)
                    {
                        foreach (var invoiceLine in tebaInvoice.TebaInvoiceLines)
                            invoiceLine.InvoiceLineUnderAssessReasons = Mapper.Map<List<InvoiceLineUnderAssessReason>>(_invoiceLineUnderAssessReasonRepository.Where(x => x.TebaInvoiceLineId == invoiceLine.TebaInvoiceLineId).ToList());
                    }

                    if (tebaInvoice.PersonEventId > 0)
                    {
                        var claims = await _claimService.GetClaimsByPersonEventId((int)tebaInvoice.PersonEventId);
                        if (claims.Count > 0)
                            tebaInvoice.ClaimReferenceNumber = claims[0].ClaimReferenceNumber;
                    }
                }

                return tebaInvoice;
            }
        }

        public async Task<int> EditInvoiceStatus(Invoice invoice)
        {
            RmaIdentity.DemandPermission(Permissions.EditMedicalInvoice);

            if (invoice == null) return 0;

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var entity = await _invoiceRepository.FirstOrDefaultAsync(a => a.InvoiceId == invoice.InvoiceId);

                entity.InvoiceId = invoice.InvoiceId;
                entity.InvoiceStatus = invoice.InvoiceStatus;
                entity.ModifiedBy = RmaIdentity.Email;
                entity.ModifiedDate = DateTimeHelper.SaNow;

                _invoiceRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.InvoiceId;
            }
        }

        public async Task<int> EditTebaInvoiceStatus(TebaInvoice tebaInvoice)
        {
            if (tebaInvoice == null) return 0;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _tebaInvoiceRepository.FirstOrDefaultAsync(a => a.TebaInvoiceId == tebaInvoice.TebaInvoiceId);

                entity.TebaInvoiceId = tebaInvoice.TebaInvoiceId;
                entity.InvoiceStatus = tebaInvoice.InvoiceStatus;
                entity.ModifiedBy = RmaIdentity.Email;
                entity.ModifiedDate = DateTimeHelper.SaNow;

                _tebaInvoiceRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.TebaInvoiceId;
            }
        }

        public async Task<int> EditInvoiceAuthorisedAmounts(InvoiceDetails invoice)
        {
            RmaIdentity.DemandPermission(Permissions.EditMedicalInvoice);

            if (invoice == null) return 0;

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var entity = await _invoiceRepository.FirstOrDefaultAsync(a => a.InvoiceId == invoice.InvoiceId);
                await _invoiceRepository.LoadAsync(entity, a => a.InvoiceLines);

                if (entity.InvoiceLines != null && entity.InvoiceLines.Count > 0 && invoice.InvoiceLines != null && invoice.InvoiceLines.Count > 0)
                {
                    foreach (var entityInvoiceLine in entity.InvoiceLines)
                    {
                        var invoiceLine =
                            invoice.InvoiceLines.FirstOrDefault(i =>
                                i.InvoiceLineId == entityInvoiceLine.InvoiceLineId);
                        if (invoiceLine != null)
                        {
                            //line updates
                            entityInvoiceLine.AuthorisedAmount = invoiceLine.AuthorisedAmount;
                            entityInvoiceLine.AuthorisedVat = invoiceLine.AuthorisedVat;
                            entityInvoiceLine.AuthorisedQuantity = invoiceLine.AuthorisedQuantity;
                            entityInvoiceLine.ModifiedBy = string.IsNullOrEmpty(RmaIdentity.Email) ? SystemSettings.SystemUserAccount : RmaIdentity.Email;
                            entityInvoiceLine.ModifiedDate = DateTimeHelper.SaNow;
                        }
                    }
                    //header update
                    entity.AuthorisedAmount = invoice.AuthorisedAmount;
                    entity.AuthorisedVat = invoice.AuthorisedVat;
                    entity.ModifiedBy = string.IsNullOrEmpty(RmaIdentity.Email) ? SystemSettings.SystemUserAccount : RmaIdentity.Email;
                    entity.ModifiedDate = DateTimeHelper.SaNow;
                }

                _invoiceRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.InvoiceId;
            }
        }

        public async Task<int> EditTebaInvoiceAuthorisedAmounts(TebaInvoice tebaInvoice)
        {
            if (tebaInvoice == null) return 0;

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var entity = await _tebaInvoiceRepository.FirstOrDefaultAsync(a => a.TebaInvoiceId == tebaInvoice.TebaInvoiceId);
                await _tebaInvoiceRepository.LoadAsync(entity, a => a.TebaInvoiceLines);

                if (entity.TebaInvoiceLines != null && entity.TebaInvoiceLines.Count > 0 && tebaInvoice.TebaInvoiceLines != null && tebaInvoice.TebaInvoiceLines.Count > 0)
                {
                    foreach (var entityInvoiceLine in entity.TebaInvoiceLines)
                    {
                        var invoiceLine =
                            tebaInvoice.TebaInvoiceLines.FirstOrDefault(i =>
                                i.TebaInvoiceLineId == entityInvoiceLine.TebaInvoiceLineId);
                        if (invoiceLine != null)
                        {
                            //line updates
                            entityInvoiceLine.AuthorisedAmount = invoiceLine.AuthorisedAmount;
                            entityInvoiceLine.AuthorisedVat = invoiceLine.AuthorisedVat;
                            entityInvoiceLine.AuthorisedQuantity = invoiceLine.AuthorisedQuantity;
                            entityInvoiceLine.ModifiedBy = string.IsNullOrEmpty(RmaIdentity.Email) ? SystemSettings.SystemUserAccount : RmaIdentity.Email;
                            entityInvoiceLine.ModifiedDate = DateTimeHelper.SaNow;
                        }
                    }
                    //header update
                    entity.AuthorisedAmount = tebaInvoice.AuthorisedAmount;
                    entity.AuthorisedVat = tebaInvoice.AuthorisedVat;
                    entity.ModifiedBy = string.IsNullOrEmpty(RmaIdentity.Email) ? SystemSettings.SystemUserAccount : RmaIdentity.Email;
                    entity.ModifiedDate = DateTimeHelper.SaNow;
                }

                _tebaInvoiceRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.TebaInvoiceId;
            }
        }

        public async Task<RolePlayerBankingDetail> GetAuthorisedPayeeBankDetailsByRolePlayerId(int rolePlayerId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var payeeBankDetails = await GetBankingDetailsByRolePlayerIdCommon(rolePlayerId);
                RolePlayerBankingDetail authorisedPayeeBankDetail = new RolePlayerBankingDetail();
                authorisedPayeeBankDetail = payeeBankDetails.Where(a => (a.IsApproved != null && (bool)a.IsApproved) && a.RolePlayerId == rolePlayerId).FirstOrDefault();

                return authorisedPayeeBankDetail;
            }
        }

        public async Task<decimal> GetCumulativeTotalForPersonEvent(int personEventId)
        {
            var totalAmount = await _invoiceRepository.Where(i => i.PersonEventId == personEventId
                        && (i.InvoiceStatus == InvoiceStatusEnum.Captured || i.InvoiceStatus == InvoiceStatusEnum.Validated
                        || i.InvoiceStatus == InvoiceStatusEnum.Allocated || i.InvoiceStatus == InvoiceStatusEnum.PaymentRequested
                        || i.InvoiceStatus == InvoiceStatusEnum.Paid)).ToListAsync();

            return totalAmount.Sum(x => x.AuthorisedAmount);
        }

        public bool CheckSubsquentCareRequired()
        {
            return true; //still have to implement the logic once stabilized date is available on personevent
        }

        public async Task<int> EditInvoice(Invoice invoice)
        {
            RmaIdentity.DemandPermission(Permissions.EditMedicalInvoice);
            int invoiceId = 0;
            if (invoice == null) return 0;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _invoiceRepository.FirstOrDefaultAsync(a => a.InvoiceId == invoice.InvoiceId);
                await _invoiceRepository.LoadAsync(entity, a => a.InvoiceLines);
                await _invoiceRepository.LoadAsync(entity, a => a.InvoiceUnderAssessReasons);

                if (entity.InvoiceLines != null && entity.InvoiceLines.Count > 0)
                {
                    foreach (var invoiceLine in entity.InvoiceLines)
                        await _invoiceLineRepository.LoadAsync(invoiceLine, x => x.InvoiceLineUnderAssessReasons);
                }

                entity.InvoiceId = invoice.InvoiceId;
                entity.ClaimId = invoice.ClaimId;
                entity.PersonEventId = invoice.PersonEventId;
                entity.HealthCareProviderId = invoice.HealthCareProviderId;
                entity.HcpInvoiceNumber = invoice.HcpInvoiceNumber;
                entity.HcpAccountNumber = invoice.HcpAccountNumber;
                entity.InvoiceNumber = invoice.InvoiceNumber;
                if (invoice.InvoiceDate != null)
                    entity.InvoiceDate = invoice.InvoiceDate.ToSaDateTime();
                if (invoice.DateSubmitted != null)
                    entity.DateSubmitted = invoice.DateSubmitted.ToSaDateTime();
                if (invoice.DateReceived != null)
                    entity.DateReceived = invoice.DateReceived.ToSaDateTime();
                if (invoice.DateAdmitted != null)
                    entity.DateAdmitted = invoice.DateAdmitted.ToSaDateTime();
                if (invoice.DateDischarged != null)
                    entity.DateDischarged = invoice.DateDischarged.ToSaDateTime();
                entity.PreAuthId = null;//invoice.PreAuthId -might need to be removed in future - redundant 
                entity.InvoiceStatus = invoice.InvoiceStatus;
                entity.InvoiceAmount = invoice.InvoiceAmount;
                entity.InvoiceVat = invoice.InvoiceVat;
                entity.AuthorisedAmount = invoice.AuthorisedAmount;
                entity.AuthorisedVat = invoice.AuthorisedVat;
                entity.PayeeId = invoice.PayeeId;
                entity.PayeeTypeId = invoice.PayeeTypeId;
                entity.UnderAssessedComments = invoice.UnderAssessedComments;
                entity.HoldingKey = invoice.HoldingKey;
                entity.IsPaymentDelay = invoice.IsPaymentDelay;
                entity.IsPreauthorised = invoice.IsPreauthorised;
                entity.PreAuthXml = invoice.PreAuthXml;
                entity.Comments = invoice.Comments;
                entity.IsDeleted = invoice.IsDeleted;
                entity.ModifiedBy = RmaIdentity.Email;
                entity.ModifiedDate = DateTimeHelper.SaNow;

                foreach (var lineItemEntity in entity.InvoiceLines)
                {
                    foreach (var lineUnderAssessReasonEntity in lineItemEntity.InvoiceLineUnderAssessReasons)
                    {
                        lineUnderAssessReasonEntity.IsActive = false;
                        lineUnderAssessReasonEntity.IsDeleted = true;
                        lineUnderAssessReasonEntity.ModifiedBy = RmaIdentity.Email;
                        lineUnderAssessReasonEntity.ModifiedDate = DateTimeHelper.SaNow;
                    }
                }

                foreach (var invoiceLine in invoice.InvoiceLines)
                {
                    foreach (var lineItemEntity in entity.InvoiceLines)
                    {
                        if (invoiceLine.InvoiceLineId > 0 && invoiceLine.InvoiceLineId == lineItemEntity.InvoiceLineId)
                        {
                            lineItemEntity.InvoiceLineId = invoiceLine.InvoiceLineId;
                            lineItemEntity.InvoiceId = invoiceLine.InvoiceId;
                            if (invoiceLine.ServiceDate != null)
                                lineItemEntity.ServiceDate = invoiceLine.ServiceDate.ToSaDateTime();
                            if (invoiceLine.ServiceTimeStart != null)
                                lineItemEntity.ServiceTimeStart = invoiceLine.ServiceTimeStart;
                            if (invoiceLine.ServiceTimeEnd != null)
                                lineItemEntity.ServiceTimeEnd = invoiceLine.ServiceTimeEnd;
                            lineItemEntity.RequestedQuantity = invoiceLine.RequestedQuantity;
                            lineItemEntity.AuthorisedQuantity = invoiceLine.AuthorisedQuantity;
                            lineItemEntity.RequestedAmount = invoiceLine.RequestedAmount;
                            lineItemEntity.RequestedVat = invoiceLine.RequestedVat;
                            lineItemEntity.AuthorisedAmount = invoiceLine.AuthorisedAmount;
                            lineItemEntity.AuthorisedVat = invoiceLine.AuthorisedVat;
                            lineItemEntity.TotalTariffAmount = invoiceLine.TotalTariffAmount;
                            lineItemEntity.TotalTariffVat = invoiceLine.TotalTariffVat;
                            lineItemEntity.CreditAmount = invoiceLine.CreditAmount;
                            lineItemEntity.VatCode = invoiceLine.VatCode;
                            lineItemEntity.VatPercentage = invoiceLine.VatPercentage;
                            lineItemEntity.TariffId = invoiceLine.TariffId;
                            lineItemEntity.TreatmentCodeId = invoiceLine.TreatmentCodeId;
                            lineItemEntity.MedicalItemId = invoiceLine.MedicalItemId;
                            lineItemEntity.HcpTariffCode = invoiceLine.HcpTariffCode;
                            lineItemEntity.TariffBaseUnitCostTypeId = invoiceLine.TariffBaseUnitCostTypeId;
                            lineItemEntity.Description = invoiceLine.Description;
                            lineItemEntity.SummaryInvoiceLineId = invoiceLine.SummaryInvoiceLineId;
                            lineItemEntity.IsPerDiemCharge = invoiceLine.IsPerDiemCharge;
                            lineItemEntity.IsDuplicate = invoiceLine.IsDuplicate;
                            lineItemEntity.DuplicateInvoiceLineId = invoiceLine.DuplicateInvoiceLineId;
                            lineItemEntity.CalculateOperands = invoiceLine.CalculateOperands;
                            lineItemEntity.Icd10Code = invoiceLine.Icd10Code;
                            lineItemEntity.IsDeleted = invoiceLine.IsDeleted;
                            lineItemEntity.ModifiedBy = RmaIdentity.Email;
                            lineItemEntity.ModifiedDate = DateTimeHelper.SaNow;
                            lineItemEntity.IsModifier = invoiceLine.IsModifier;

                            if (invoiceLine.InvoiceLineUnderAssessReasons != null)
                            {
                                foreach (var lineUnderAssessReason in invoiceLine.InvoiceLineUnderAssessReasons)
                                {
                                    lineItemEntity.InvoiceLineUnderAssessReasons.Add(new medical_InvoiceLineUnderAssessReason
                                    {
                                        InvoiceLineId = (int)lineUnderAssessReason.InvoiceLineId,
                                        UnderAssessReasonId = lineUnderAssessReason.UnderAssessReasonId,
                                        UnderAssessReason = lineUnderAssessReason.UnderAssessReason,
                                        Comments = lineUnderAssessReason.Comments,
                                        IsActive = lineUnderAssessReason.IsActive
                                    });
                                }
                            }
                            break;
                        }
                        else if (invoiceLine.InvoiceLineId == 0)
                        {
                            entity.InvoiceLines.Add(new medical_InvoiceLine
                            {
                                InvoiceId = invoiceLine.InvoiceId,
                                ServiceDate = invoiceLine.ServiceDate.ToSaDateTime(),
                                ServiceTimeStart = invoiceLine.ServiceTimeStart,
                                ServiceTimeEnd = invoiceLine.ServiceTimeEnd,
                                RequestedQuantity = invoiceLine.RequestedQuantity,
                                AuthorisedQuantity = invoiceLine.AuthorisedQuantity,
                                RequestedAmount = invoiceLine.RequestedAmount,
                                RequestedVat = invoiceLine.RequestedVat,
                                AuthorisedAmount = invoiceLine.AuthorisedAmount,
                                AuthorisedVat = invoiceLine.AuthorisedVat,
                                TotalTariffAmount = invoiceLine.TotalTariffAmount,
                                TotalTariffVat = invoiceLine.TotalTariffVat,
                                CreditAmount = invoiceLine.CreditAmount,
                                VatCode = invoiceLine.VatCode,
                                VatPercentage = invoiceLine.VatPercentage,
                                TariffId = invoiceLine.TariffId,
                                TreatmentCodeId = invoiceLine.TreatmentCodeId,
                                MedicalItemId = invoiceLine.MedicalItemId,
                                HcpTariffCode = invoiceLine.HcpTariffCode,
                                TariffBaseUnitCostTypeId = invoiceLine.TariffBaseUnitCostTypeId,
                                Description = invoiceLine.Description,
                                SummaryInvoiceLineId = invoiceLine.SummaryInvoiceLineId,
                                IsPerDiemCharge = invoiceLine.IsPerDiemCharge,
                                IsDuplicate = invoiceLine.IsDuplicate,
                                DuplicateInvoiceLineId = invoiceLine.DuplicateInvoiceLineId,
                                CalculateOperands = invoiceLine.CalculateOperands,
                                Icd10Code = invoiceLine.Icd10Code,
                                InvoiceLineUnderAssessReasons = Mapper.Map<List<medical_InvoiceLineUnderAssessReason>>(invoiceLine.InvoiceLineUnderAssessReasons),
                                IsModifier = invoiceLine.IsModifier
                            });
                            break;
                        }
                    }
                }

                if (invoice.InvoiceId > 0)
                {
                    foreach (var underAssessReasonEntity in entity.InvoiceUnderAssessReasons)
                    {
                        underAssessReasonEntity.IsActive = false;
                        underAssessReasonEntity.IsDeleted = true;
                        underAssessReasonEntity.ModifiedBy = RmaIdentity.Email;
                        underAssessReasonEntity.ModifiedDate = DateTimeHelper.SaNow;
                    }
                }

                foreach (var invoiceUnderAssessReason in invoice.InvoiceUnderAssessReasons)
                {
                    entity.InvoiceUnderAssessReasons.Add(new medical_InvoiceUnderAssessReason
                    {
                        Id = invoiceUnderAssessReason.Id,
                        InvoiceId = (int)invoiceUnderAssessReason.InvoiceId,
                        UnderAssessReasonId = invoiceUnderAssessReason.UnderAssessReasonId,
                        UnderAssessReason = invoiceUnderAssessReason.UnderAssessReason,
                        Comments = invoiceUnderAssessReason.Comments
                    });
                }

                _invoiceRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                invoiceId = entity.InvoiceId;
            }

            await AddInvoicePreAuthMap(invoice.InvoiceId, 0, invoice?.MedicalInvoicePreAuths);

            return invoiceId;
        }

        public async Task<int> EditTebaInvoice(TebaInvoice tebaInvoice)
        {
            int tebaInvoiceId = 0;
            if (tebaInvoice == null) return 0;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _tebaInvoiceRepository.FirstOrDefaultAsync(a => a.TebaInvoiceId == tebaInvoice.TebaInvoiceId);
                await _tebaInvoiceRepository.LoadAsync(entity, a => a.TebaInvoiceLines);
                await _tebaInvoiceRepository.LoadAsync(entity, a => a.InvoiceUnderAssessReasons);

                if (entity.TebaInvoiceLines != null && entity.TebaInvoiceLines.Count > 0)
                {
                    foreach (var invoiceLine in entity.TebaInvoiceLines)
                        await _tebaInvoiceLineRepository.LoadAsync(invoiceLine, x => x.InvoiceLineUnderAssessReasons);
                }

                entity.TebaInvoiceId = tebaInvoice.TebaInvoiceId;
                entity.ClaimId = tebaInvoice.ClaimId;
                entity.PersonEventId = tebaInvoice.PersonEventId;
                entity.InvoicerId = tebaInvoice.InvoicerId;
                entity.InvoicerTypeId = tebaInvoice.InvoicerTypeId;
                entity.HcpInvoiceNumber = tebaInvoice.HcpInvoiceNumber;
                entity.HcpAccountNumber = tebaInvoice.HcpAccountNumber;
                entity.InvoiceNumber = tebaInvoice.InvoiceNumber;
                if (tebaInvoice.InvoiceDate != null)
                    entity.InvoiceDate = tebaInvoice.InvoiceDate.ToSaDateTime();
                if (tebaInvoice.DateSubmitted != null)
                    entity.DateSubmitted = tebaInvoice.DateSubmitted.ToSaDateTime();
                if (tebaInvoice.DateReceived != null)
                    entity.DateReceived = tebaInvoice.DateReceived.ToSaDateTime();
                if (tebaInvoice.DateCompleted != null)
                    entity.DateCompleted = tebaInvoice.DateCompleted.ToSaDateTime();
                if (tebaInvoice.DateTravelledFrom != null)
                    entity.DateTravelledFrom = tebaInvoice.DateTravelledFrom.ToSaDateTime();
                if (tebaInvoice.DateTravelledTo != null)
                    entity.DateTravelledTo = tebaInvoice.DateTravelledTo.ToSaDateTime();
                entity.PreAuthId = tebaInvoice.PreAuthId;
                entity.InvoiceStatus = tebaInvoice.InvoiceStatus;
                entity.InvoiceAmount = tebaInvoice.InvoiceAmount;
                entity.InvoiceVat = tebaInvoice.InvoiceVat;
                entity.AuthorisedAmount = tebaInvoice.AuthorisedAmount;
                entity.AuthorisedVat = tebaInvoice.AuthorisedVat;
                entity.PayeeId = tebaInvoice.PayeeId;
                entity.PayeeTypeId = tebaInvoice.PayeeTypeId;
                entity.HoldingKey = tebaInvoice.HoldingKey;
                entity.IsPaymentDelay = tebaInvoice.IsPaymentDelay;
                entity.IsPreauthorised = tebaInvoice.IsPreauthorised;
                entity.Description = tebaInvoice.Description;
                entity.CalcOperands = tebaInvoice.CalcOperands;
                entity.Kilometers = tebaInvoice.Kilometers;
                entity.KilometerRate = tebaInvoice.KilometerRate;
                entity.TebaTariffCode = tebaInvoice.TebaTariffCode;
                entity.VatCode = tebaInvoice.VatCode;
                entity.VatPercentage = tebaInvoice.VatPercentage;
                entity.SwitchTransactionNo = tebaInvoice.SwitchTransactionNo;
                entity.IsDeleted = tebaInvoice.IsDeleted;
                entity.ModifiedBy = RmaIdentity.Email;
                entity.ModifiedDate = DateTimeHelper.SaNow;

                foreach (var lineItemEntity in entity.TebaInvoiceLines)
                {
                    foreach (var lineUnderAssessReasonEntity in lineItemEntity.InvoiceLineUnderAssessReasons)
                    {
                        lineUnderAssessReasonEntity.IsActive = false;
                        lineUnderAssessReasonEntity.IsDeleted = true;
                        lineUnderAssessReasonEntity.ModifiedBy = RmaIdentity.Email;
                        lineUnderAssessReasonEntity.ModifiedDate = DateTimeHelper.SaNow;
                    }
                }

                foreach (var invoiceLine in tebaInvoice.TebaInvoiceLines)
                {
                    foreach (var lineItemEntity in entity.TebaInvoiceLines)
                    {
                        if (invoiceLine.TebaInvoiceLineId > 0 && invoiceLine.TebaInvoiceLineId == lineItemEntity.TebaInvoiceLineId)
                        {
                            lineItemEntity.TebaInvoiceLineId = invoiceLine.TebaInvoiceLineId;
                            lineItemEntity.TebaInvoiceId = invoiceLine.TebaInvoiceId;
                            if (invoiceLine.ServiceDate != null)
                                lineItemEntity.ServiceDate = invoiceLine.ServiceDate.ToSaDateTime();
                            lineItemEntity.RequestedQuantity = invoiceLine.RequestedQuantity;
                            lineItemEntity.AuthorisedQuantity = invoiceLine.AuthorisedQuantity;
                            lineItemEntity.RequestedAmount = invoiceLine.RequestedAmount;
                            lineItemEntity.RequestedVat = invoiceLine.RequestedVat;
                            lineItemEntity.AuthorisedAmount = invoiceLine.AuthorisedAmount;
                            lineItemEntity.AuthorisedVat = invoiceLine.AuthorisedVat;
                            lineItemEntity.TariffId = invoiceLine.TariffId;
                            lineItemEntity.TotalTariffAmount = invoiceLine.TotalTariffAmount;
                            lineItemEntity.TotalTariffVat = invoiceLine.TotalTariffVat;
                            lineItemEntity.CreditAmount = invoiceLine.CreditAmount;
                            lineItemEntity.VatCode = invoiceLine.VatCode;
                            lineItemEntity.VatPercentage = invoiceLine.VatPercentage;
                            lineItemEntity.TreatmentCodeId = invoiceLine.TreatmentCodeId;
                            lineItemEntity.MedicalItemId = invoiceLine.MedicalItemId;
                            lineItemEntity.HcpTariffCode = invoiceLine.HcpTariffCode;
                            lineItemEntity.TariffBaseUnitCostTypeId = invoiceLine.TariffBaseUnitCostTypeId;
                            lineItemEntity.Description = invoiceLine.Description;
                            lineItemEntity.SummaryInvoiceLineId = invoiceLine.SummaryInvoiceLineId;
                            lineItemEntity.IsPerDiemCharge = invoiceLine.IsPerDiemCharge;
                            lineItemEntity.IsDuplicate = invoiceLine.IsDuplicate;
                            lineItemEntity.DuplicateTebaInvoiceLineId = invoiceLine.DuplicateTebaInvoiceLineId;
                            lineItemEntity.CalculateOperands = invoiceLine.CalculateOperands;
                            lineItemEntity.IsDeleted = invoiceLine.IsDeleted;
                            lineItemEntity.ModifiedBy = RmaIdentity.Email;
                            lineItemEntity.ModifiedDate = DateTimeHelper.SaNow;

                            if (invoiceLine.InvoiceLineUnderAssessReasons != null)
                            {
                                foreach (var lineUnderAssessReason in invoiceLine.InvoiceLineUnderAssessReasons)
                                {
                                    lineItemEntity.InvoiceLineUnderAssessReasons.Add(new medical_InvoiceLineUnderAssessReason
                                    {
                                        TebaInvoiceLineId = (int)lineUnderAssessReason.TebaInvoiceLineId,
                                        UnderAssessReasonId = lineUnderAssessReason.UnderAssessReasonId,
                                        UnderAssessReason = lineUnderAssessReason.UnderAssessReason,
                                        Comments = lineUnderAssessReason.Comments,
                                        IsActive = lineUnderAssessReason.IsActive
                                    });
                                }
                            }
                            break;
                        }
                        else if (invoiceLine.TebaInvoiceLineId == 0)
                        {
                            entity.TebaInvoiceLines.Add(new medical_TebaInvoiceLine
                            {
                                TebaInvoiceId = invoiceLine.TebaInvoiceId,
                                ServiceDate = invoiceLine.ServiceDate.ToSaDateTime(),
                                RequestedQuantity = invoiceLine.RequestedQuantity,
                                AuthorisedQuantity = invoiceLine.AuthorisedQuantity,
                                RequestedAmount = invoiceLine.RequestedAmount,
                                RequestedVat = invoiceLine.RequestedVat,
                                AuthorisedAmount = invoiceLine.AuthorisedAmount,
                                AuthorisedVat = invoiceLine.AuthorisedVat,
                                TariffId = invoiceLine.TariffId,
                                TotalTariffAmount = invoiceLine.TotalTariffAmount,
                                TotalTariffVat = invoiceLine.TotalTariffVat,
                                CreditAmount = invoiceLine.CreditAmount,
                                VatCode = invoiceLine.VatCode,
                                VatPercentage = invoiceLine.VatPercentage,
                                TreatmentCodeId = invoiceLine.TreatmentCodeId,
                                MedicalItemId = invoiceLine.MedicalItemId,
                                HcpTariffCode = invoiceLine.HcpTariffCode,
                                TariffBaseUnitCostTypeId = invoiceLine.TariffBaseUnitCostTypeId,
                                Description = invoiceLine.Description,
                                SummaryInvoiceLineId = invoiceLine.SummaryInvoiceLineId,
                                IsPerDiemCharge = invoiceLine.IsPerDiemCharge,
                                IsDuplicate = invoiceLine.IsDuplicate,
                                DuplicateTebaInvoiceLineId = invoiceLine.DuplicateTebaInvoiceLineId,
                                CalculateOperands = invoiceLine.CalculateOperands,
                                InvoiceLineUnderAssessReasons = Mapper.Map<List<medical_InvoiceLineUnderAssessReason>>(invoiceLine.InvoiceLineUnderAssessReasons),                                
                            });
                            break;
                        }
                    }
                }

                if (tebaInvoice.InvoiceUnderAssessReasons != null)
                {
                    await SaveInvoiceUnderAssessReasonsToDB(0, tebaInvoice.TebaInvoiceId, tebaInvoice.InvoiceUnderAssessReasons);
                }

                _tebaInvoiceRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                tebaInvoiceId = entity.TebaInvoiceId;
            }

            await AddInvoicePreAuthMap(0, tebaInvoice.TebaInvoiceId, tebaInvoice?.MedicalInvoicePreAuths);

            return tebaInvoiceId;
        }

        public async Task<bool> ClaimLiabilityAccepted(int personEventId)
        {
            bool liabilityAccepted = false;
            string liabilityStatus = string.Empty;
            using (var scope = _dbContextScopeFactory.Create())
            {
                var medicalInvoiceClaimQuery = await _medicalInvoiceClaimService.GetMedicalInvoiceClaimByPersonEventId(Convert.ToInt32(personEventId));
                liabilityStatus = medicalInvoiceClaimQuery.ClaimLiabilityStatus;
                if (!string.IsNullOrEmpty(liabilityStatus) && (liabilityStatus.Contains("Accepted") || liabilityStatus.Contains("Medical Liability")))
                {
                    liabilityAccepted = true;
                }
            }
            return liabilityAccepted;
        }

        public async Task<bool> CheckForMedicalReport(int healthCareProviderId, int invoiceId)
        {
            var isMedicalReportCaptured = true;
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var isRequireMedicalReport = await IsRequireMedicalReportCommon(healthCareProviderId);
                var invoiceReportMapList = await _invoiceReportMapRepository.Where(x => x.InvoiceId == invoiceId).ToListAsync();
                if (isRequireMedicalReport && invoiceReportMapList.Count == 0)
                {
                    isMedicalReportCaptured = false;
                }
            }
            return isMedicalReportCaptured;
        }

        public async Task<List<PreAuthorisation>> GetMappedInvoicePreAuthDetails(int invoiceId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);
            List<PreAuthorisation> preAuthDetailsList = new List<PreAuthorisation>();

            try
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var preAuthIds = await _medicalInvoicePreAuthMapRepository.Where(x => x.InvoiceId == invoiceId).Select(a => a.PreAuthId).ToListAsync();

                    foreach (var preAuthId in preAuthIds.ToArray())
                    {
                        var preAuthDetails = await _preAuthInvoiceService.GetMedicalInvoicePreAuthorisationById(preAuthId).ConfigureAwait(true);
                        if (preAuthDetails?.PreAuthStatus == PreAuthStatusEnum.Authorised)
                        {
                            preAuthDetailsList.Add(preAuthDetails);
                        }
                    }
                    return preAuthDetailsList;
                }
            }
            catch (Exception ex)
            {
                ex.LogException();
                return preAuthDetailsList;
            }
        }

        public async Task<int> GetMappedPreAuthInvoiceDetails(SwitchBatchTypeEnum switchBatchTypeEnum, int preAuthId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                List<int?> invoiceList = new List<int?>();

                switch (switchBatchTypeEnum)
                {
                    case SwitchBatchTypeEnum.MedEDI:
                        invoiceList = await _medicalInvoicePreAuthMapRepository.Where(x => x.PreAuthId == preAuthId).Select(a => a.InvoiceId).ToListAsync();
                        break;
                    case SwitchBatchTypeEnum.Teba:
                        invoiceList = await _medicalInvoicePreAuthMapRepository.Where(x => x.PreAuthId == preAuthId).Select(a => a.TebaInvoiceId).ToListAsync();
                        break;
                }

                return (invoiceList?.Count) ?? 0;
            }
        }

        public async Task<bool> IsPreauthInvoiceProcessed(int preAuthId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var preAuthInvoiceDetails = await (
                       from mip in _medicalInvoicePreAuthMapRepository
                       join inv in _invoiceRepository on mip.InvoiceId equals inv.InvoiceId
                       where mip.PreAuthId == preAuthId && inv.InvoiceStatus == InvoiceStatusEnum.Paid
                       select new { mip.InvoiceId }).ToListAsync();

                return preAuthInvoiceDetails?.Count > 0 ? true : false;
            }
        }

        public async Task AddInvoicePreAuthMap(int invoiceId, int tebaInvoiceId, List<PreAuthorisation> preAuthorisations)
        {
            Contract.Requires(preAuthorisations != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                if (preAuthorisations != null)
                {
                    foreach (var preAuthorisation in preAuthorisations)
                    {
                        medical_InvoicePreAuthMap invoicePreAuthMap = null;
                        if (invoiceId > 0)
                            invoicePreAuthMap = _medicalInvoicePreAuthMapRepository.Where(x => x.InvoiceId == invoiceId && x.PreAuthId == preAuthorisation.PreAuthId).FirstOrDefault();
                        else if (tebaInvoiceId > 0)
                            invoicePreAuthMap = _medicalInvoicePreAuthMapRepository.Where(x => x.TebaInvoiceId == tebaInvoiceId && x.PreAuthId == preAuthorisation.PreAuthId).FirstOrDefault();

                        if (invoicePreAuthMap == null)
                        {
                            medical_InvoicePreAuthMap medical_InvoicePreAuthMap = new medical_InvoicePreAuthMap
                            {
                                InvoiceId = invoiceId,
                                TebaInvoiceId = tebaInvoiceId,
                                PreAuthId = preAuthorisation.PreAuthId
                            };
                            _medicalInvoicePreAuthMapRepository.Create(medical_InvoicePreAuthMap);
                        }
                    }
                    await scope.SaveChangesAsync();
                }
            }
        }

        public async Task<PagedRequestResult<InvoiceDetails>> GetPagedInvoiceList(PagedRequest request)
        {
            RmaIdentity.DemandPermission(Permissions.ViewMedicalInvoice);

            var user = await _userService.GetUserByEmail(RmaIdentity.Email);
            var healthCareProviderId = 0;
            if (!user.IsInternalUser)
            {
                try
                {
                    healthCareProviderId = !string.IsNullOrEmpty(request?.SearchCriteria)
                        ? Convert.ToInt32(request.SearchCriteria)
                        : 0;
                }
                catch (FormatException)
                {
                    healthCareProviderId = 0;
                }
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoicesDetails = await (
                        from i in _invoiceRepository
                        join hcp in _healthCareProviderRepository on i.HealthCareProviderId equals hcp.RolePlayerId
                        join pt in _practitionerTypeRepository on hcp.ProviderTypeId equals pt.PractitionerTypeId
                        where
                        user.IsInternalUser || i.HealthCareProviderId == healthCareProviderId
                        select new InvoiceDetails
                        {
                            InvoiceId = i.InvoiceId,
                            ClaimId = i.ClaimId,
                            PersonEventId = i.PersonEventId,
                            HealthCareProviderId = i.HealthCareProviderId,
                            HealthCareProviderName = hcp.Name,
                            HcpInvoiceNumber = i.HcpInvoiceNumber,
                            HcpAccountNumber = i.HcpAccountNumber,
                            InvoiceNumber = i.InvoiceNumber,
                            InvoiceDate = i.InvoiceDate,
                            DateSubmitted = i.DateSubmitted,
                            DateReceived = i.DateReceived,
                            DateAdmitted = i.DateAdmitted,
                            DateDischarged = i.DateDischarged,
                            InvoiceStatus = i.InvoiceStatus,
                            InvoiceAmount = i.InvoiceAmount,
                            InvoiceVat = i.InvoiceVat,
                            InvoiceTotalInclusive = i.InvoiceTotalInclusive,
                            AuthorisedAmount = i.AuthorisedAmount,
                            AuthorisedVat = i.AuthorisedVat,
                            AuthorisedTotalInclusive = i.AuthorisedTotalInclusive,
                            PayeeId = i.PayeeId,
                            PayeeName = string.Empty,
                            PayeeTypeId = i.PayeeTypeId,
                            UnderAssessedComments = i.UnderAssessedComments,
                            HoldingKey = i.HoldingKey,
                            IsPaymentDelay = i.IsPaymentDelay,
                            IsPreauthorised = i.IsPreauthorised,
                            PreAuthXml = i.PreAuthXml,
                            Comments = i.Comments,
                            PracticeNumber = hcp.PracticeNumber,
                            PractitionerTypeId = hcp.ProviderTypeId,
                            PractitionerTypeName = pt.Name,
                            IsVat = hcp.IsVat,
                            VatRegNumber = hcp.VatRegNumber,
                            GreaterThan731Days = false,
                            IsActive = i.IsActive,
                            CreatedBy = i.CreatedBy,
                            CreatedDate = i.CreatedDate,
                            ModifiedBy = i.ModifiedBy,
                            ModifiedDate = i.ModifiedDate
                        }).ToPagedResult(request);

                if (invoicesDetails != null)
                {
                    foreach (var item in invoicesDetails.Data)
                    {
                        item.InvoiceUnderAssessReasons = Mapper.Map<List<InvoiceUnderAssessReason>>(_invoiceUnderAssessReasonRepository.Where(x => x.InvoiceId == item.InvoiceId).ToList());

                        var payeeType = await _payeeTypeService.GetPayeeTypeById(item.PayeeTypeId);
                        item.PayeeType = payeeType.Name;

                        var invoiceLineRepository = _invoiceLineRepository.Select(i => i);
                        item.InvoiceLineDetails = await (
                                from i in _invoiceLineRepository
                                join t in _tariffRepository on i.TariffId equals t.TariffId
                                join mi in _medicalItemRepository on t.MedicalItemId equals mi.MedicalItemId
                                where i.InvoiceId == item.InvoiceId
                                select new InvoiceLineDetails
                                {
                                    InvoiceLineId = i.InvoiceLineId,
                                    InvoiceId = i.InvoiceId,
                                    ServiceDate = i.ServiceDate,
                                    ServiceTimeStart = i.ServiceTimeStart,
                                    ServiceTimeEnd = i.ServiceTimeEnd,
                                    RequestedQuantity = i.RequestedQuantity,
                                    AuthorisedQuantity = i.AuthorisedQuantity,
                                    RequestedAmount = i.RequestedAmount,
                                    RequestedVat = i.RequestedVat,
                                    RequestedAmountInclusive = i.RequestedAmountInclusive,
                                    AuthorisedAmount = i.AuthorisedAmount,
                                    AuthorisedVat = i.AuthorisedVat,
                                    AuthorisedAmountInclusive = i.AuthorisedAmountInclusive,
                                    TotalTariffAmount = i.TotalTariffAmount,
                                    TotalTariffVat = i.TotalTariffVat,
                                    TotalTariffAmountInclusive = i.TotalTariffAmountInclusive,
                                    TariffAmount = i.TariffAmount,
                                    CreditAmount = i.CreditAmount,
                                    VatCode = i.VatCode,
                                    VatPercentage = i.VatPercentage,
                                    TariffId = i.TariffId,
                                    TreatmentCodeId = i.TreatmentCodeId,
                                    MedicalItemId = i.MedicalItemId,
                                    HcpTariffCode = i.HcpTariffCode,
                                    TariffBaseUnitCostTypeId = i.TariffBaseUnitCostTypeId,
                                    Description = i.Description,
                                    SummaryInvoiceLineId = i.SummaryInvoiceLineId,
                                    IsPerDiemCharge = i.IsPerDiemCharge,
                                    IsDuplicate = i.IsDuplicate,
                                    DuplicateInvoiceLineId = i.DuplicateInvoiceLineId,
                                    CalculateOperands = i.CalculateOperands,
                                    Icd10Code = i.Icd10Code,
                                    TariffDescription = mi.Description,
                                    DefaultQuantity = mi.DefaultQuantity,
                                    IsActive = i.IsActive,
                                    CreatedBy = i.CreatedBy,
                                    CreatedDate = i.CreatedDate,
                                    ModifiedBy = i.ModifiedBy,
                                    ModifiedDate = i.ModifiedDate,
                                    IsModifier = i.IsModifier
                                }).ToListAsync();

                        if (item.InvoiceLineDetails != null && item.InvoiceLineDetails.Count > 0)
                        {
                            foreach (var invoiceLine in item.InvoiceLineDetails)
                                invoiceLine.InvoiceLineUnderAssessReasons = Mapper.Map<List<InvoiceLineUnderAssessReason>>(_invoiceLineUnderAssessReasonRepository.Where(x => x.InvoiceLineId == invoiceLine.InvoiceLineId).ToList());
                        }

                        if (item.PersonEventId > 0)
                        {
                            var claims = await _claimService.GetClaimsByPersonEventId((int)item.PersonEventId);
                            if (claims.Count > 0)
                                item.ClaimReferenceNumber = claims[0].ClaimReferenceNumber;
                        }

                        item.MedicalInvoicePreAuths = await GetMappedInvoicePreAuthDetails(item.InvoiceId);

                        if (item.InvoiceStatus == InvoiceStatusEnum.Paid)
                        {
                            var paymentAlocationDetails = await _paymentsAllocationService.GetAllocationsByMedicalInvoiceId(item.InvoiceId, PaymentTypeEnum.MedicalInvoice);
                            if (paymentAlocationDetails != null)
                            {
                                var paymentDetails = await _paymentsAllocationService.GetPaymentByAllocationId(paymentAlocationDetails.AllocationId);
                                if (paymentDetails != null)
                                    item.PaymentConfirmationDate = paymentDetails.PaymentConfirmationDate;
                            }
                        }
                    }
                }
                if (invoicesDetails?.Data.Count > 0)
                {
                    return new PagedRequestResult<InvoiceDetails>
                    {
                        Page = invoicesDetails.Page,
                        PageCount = invoicesDetails.PageCount,
                        RowCount = invoicesDetails.RowCount,
                        PageSize = invoicesDetails.PageSize,
                        Data = invoicesDetails.Data
                    };
                }

                return new PagedRequestResult<InvoiceDetails>();
            }
        }

        public async Task<PagedRequestResult<TebaInvoice>> GetPagedTebaInvoiceList(PagedRequest request)
        {
            var user = await _userService.GetUserByEmail(RmaIdentity.Email);
            
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var tebaInvoices = await (
                        from i in _tebaInvoiceRepository where user.IsInternalUser
                        join hcp in _healthCareProviderRepository on i.InvoicerId equals hcp.RolePlayerId
                        select new TebaInvoice
                        {
                            TebaInvoiceId = i.TebaInvoiceId,
                            ClaimId = i.ClaimId,
                            PersonEventId = i.PersonEventId,
                            InvoicerId = i.InvoicerId,
                            InvoicerTypeId = i.InvoicerTypeId,
                            HcpInvoiceNumber = i.HcpInvoiceNumber,
                            HcpAccountNumber = i.HcpAccountNumber,
                            InvoiceNumber = i.InvoiceNumber,
                            InvoiceDate = i.InvoiceDate,
                            DateSubmitted = i.DateSubmitted,
                            DateReceived = i.DateReceived,
                            DateCompleted = i.DateCompleted,
                            DateTravelledFrom = i.DateTravelledFrom,
                            DateTravelledTo = i.DateTravelledTo,
                            PreAuthId = i.PreAuthId,
                            InvoiceStatus = i.InvoiceStatus,
                            InvoiceAmount = i.InvoiceAmount,
                            InvoiceVat = i.InvoiceVat,
                            InvoiceTotalInclusive = i.InvoiceTotalInclusive,
                            AuthorisedAmount = i.AuthorisedAmount,
                            AuthorisedVat = i.AuthorisedVat,
                            AuthorisedTotalInclusive = i.AuthorisedTotalInclusive,
                            PayeeId = i.PayeeId,
                            PayeeTypeId = i.PayeeTypeId,
                            HoldingKey = i.HoldingKey,
                            IsPaymentDelay = i.IsPaymentDelay,
                            IsPreauthorised = i.IsPreauthorised,
                            Description = i.Description,
                            CalcOperands = i.CalcOperands,
                            Kilometers = i.Kilometers,
                            KilometerRate = i.KilometerRate,
                            TebaTariffCode = i.TebaTariffCode,
                            VatCode = i.VatCode,
                            VatPercentage = i.VatPercentage,
                            SwitchBatchId = i.SwitchBatchId,
                            SwitchTransactionNo = i.SwitchTransactionNo,
                            HealthCareProviderName = hcp.Name,
                            PracticeNumber = hcp.PracticeNumber,
                            IsActive = i.IsActive,
                            CreatedBy = i.CreatedBy,
                            CreatedDate = i.CreatedDate,
                            ModifiedBy = i.ModifiedBy,
                            ModifiedDate = i.ModifiedDate
                        }).ToPagedResult(request);

                if (tebaInvoices != null)
                {
                    foreach (var item in tebaInvoices.Data)
                    {
                        item.InvoiceUnderAssessReasons = Mapper.Map<List<InvoiceUnderAssessReason>>(_invoiceUnderAssessReasonRepository.Where(x => x.TebaInvoiceId == item.TebaInvoiceId).ToList());

                        var payeeType = await _payeeTypeService.GetPayeeTypeById(item.PayeeTypeId);

                        var invoiceLineRepository = _tebaInvoiceLineRepository.Select(i => i);
                        item.TebaInvoiceLines = await (
                                from i in _tebaInvoiceLineRepository
                                where i.TebaInvoiceId == item.TebaInvoiceId
                                select new TebaInvoiceLine
                                {
                                    TebaInvoiceLineId = i.TebaInvoiceLineId,
                                    TebaInvoiceId = i.TebaInvoiceId,
                                    ServiceDate = i.ServiceDate,
                                    RequestedQuantity = i.RequestedQuantity,
                                    AuthorisedQuantity = i.AuthorisedQuantity,
                                    RequestedAmount = i.RequestedAmount,
                                    RequestedVat = i.RequestedVat,
                                    RequestedAmountInclusive = i.RequestedAmountInclusive,
                                    AuthorisedAmount = i.AuthorisedAmount,
                                    AuthorisedVat = i.AuthorisedVat,
                                    AuthorisedAmountInclusive = i.AuthorisedAmountInclusive,
                                    TariffId = i.TariffId,
                                    TotalTariffAmount = i.TotalTariffAmount,
                                    TotalTariffVat = i.TotalTariffVat,
                                    TotalTariffAmountInclusive = i.TotalTariffAmountInclusive,
                                    TariffAmount = i.TariffAmount,
                                    CreditAmount = i.CreditAmount,
                                    VatCode = i.VatCode,
                                    VatPercentage = i.VatPercentage,
                                    TreatmentCodeId = i.TreatmentCodeId,
                                    MedicalItemId = i.MedicalItemId,
                                    HcpTariffCode = i.HcpTariffCode,
                                    TariffBaseUnitCostTypeId = i.TariffBaseUnitCostTypeId,
                                    Description = i.Description,
                                    SummaryInvoiceLineId = i.SummaryInvoiceLineId,
                                    IsPerDiemCharge = i.IsPerDiemCharge,
                                    IsDuplicate = i.IsDuplicate,
                                    DuplicateTebaInvoiceLineId = i.DuplicateTebaInvoiceLineId,
                                    IsActive = i.IsActive,
                                    CreatedBy = i.CreatedBy,
                                    CreatedDate = i.CreatedDate,
                                    ModifiedBy = i.ModifiedBy,
                                    ModifiedDate = i.ModifiedDate
                                }).ToListAsync();

                        if (item.TebaInvoiceLines != null && item.TebaInvoiceLines.Count > 0)
                        {
                            foreach (var invoiceLine in item.TebaInvoiceLines)
                                invoiceLine.InvoiceLineUnderAssessReasons = Mapper.Map<List<InvoiceLineUnderAssessReason>>(_invoiceLineUnderAssessReasonRepository.Where(x => x.TebaInvoiceLineId == invoiceLine.TebaInvoiceLineId).ToList());
                        }

                        if (item.PersonEventId > 0)
                        {
                            var claims = await _claimService.GetClaimsByPersonEventId((int)item.PersonEventId);
                            if (claims.Count > 0)
                                item.ClaimReferenceNumber = claims[0].ClaimReferenceNumber;
                        }

                        if (item.InvoiceStatus == InvoiceStatusEnum.Paid)
                        {
                            var paymentAlocationDetails = await _paymentsAllocationService.GetAllocationsByMedicalInvoiceId(item.TebaInvoiceId, PaymentTypeEnum.TebaInvoice);
                            if (paymentAlocationDetails != null)
                            {
                                var paymentDetails = await _paymentsAllocationService.GetPaymentByAllocationId(paymentAlocationDetails.AllocationId);                       
                            }
                        }
                    }
                }
                if (tebaInvoices?.Data.Count > 0)
                {
                    return new PagedRequestResult<TebaInvoice>
                    {
                        Page = tebaInvoices.Page,
                        PageCount = tebaInvoices.PageCount,
                        RowCount = tebaInvoices.RowCount,
                        PageSize = tebaInvoices.PageSize,
                        Data = tebaInvoices.Data
                    };
                }

                return new PagedRequestResult<TebaInvoice>();
            }
        }


        public async Task<List<TebaInvoice>> GetPagedTebaInvoiceDetailsByPersonEventId(int personEventId)
        {
            List<TebaInvoice> tebaDetails;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var tebaRepository = _tebaInvoiceRepository.Select(i => i);
                tebaDetails = await (
                        from i in tebaRepository
                        join hcp in _healthCareProviderRepository on i.InvoicerId equals hcp.RolePlayerId
                        where i.PersonEventId == personEventId
                        select new TebaInvoice
                        {
                            TebaInvoiceId = i.TebaInvoiceId,
                            ClaimId = i.ClaimId,
                            PersonEventId = i.PersonEventId,
                            InvoicerId = i.InvoicerId,
                            InvoicerTypeId = i.InvoicerTypeId,
                            HcpInvoiceNumber = i.HcpInvoiceNumber,
                            HcpAccountNumber = i.HcpAccountNumber,
                            InvoiceNumber = i.InvoiceNumber,
                            InvoiceDate = i.InvoiceDate,
                            DateSubmitted = i.DateSubmitted,
                            DateReceived = i.DateReceived,
                            DateCompleted = i.DateCompleted,
                            DateTravelledFrom = i.DateTravelledFrom,
                            DateTravelledTo = i.DateTravelledTo,
                            PreAuthId = i.PreAuthId,
                            InvoiceStatus = i.InvoiceStatus,
                            InvoiceAmount = i.InvoiceAmount,
                            InvoiceVat = i.InvoiceVat,
                            InvoiceTotalInclusive = i.InvoiceTotalInclusive,
                            AuthorisedAmount = i.AuthorisedAmount,
                            AuthorisedVat = i.AuthorisedVat,
                            AuthorisedTotalInclusive = i.AuthorisedTotalInclusive,
                            PayeeId = i.PayeeId,
                            PayeeTypeId = i.PayeeTypeId,
                            HoldingKey = i.HoldingKey,
                            IsPaymentDelay = i.IsPaymentDelay,
                            IsPreauthorised = i.IsPreauthorised,
                            Description = i.Description,
                            CalcOperands = i.CalcOperands,
                            Kilometers = i.Kilometers,
                            KilometerRate = i.KilometerRate,
                            TebaTariffCode = i.TebaTariffCode,
                            VatCode = i.VatCode,
                            VatPercentage = i.VatPercentage,
                            SwitchBatchId = i.SwitchBatchId,
                            SwitchTransactionNo = i.SwitchTransactionNo,
                            HealthCareProviderName = hcp.Name,
                            PracticeNumber = hcp.PracticeNumber,
                            IsActive = i.IsActive,
                            CreatedBy = i.CreatedBy,
                            CreatedDate = i.CreatedDate,
                            ModifiedBy = i.ModifiedBy,
                            ModifiedDate = i.ModifiedDate
                        }).ToListAsync();
                if (tebaDetails != null)
                {
                    foreach (var item in tebaDetails)
                    {
                        item.InvoiceUnderAssessReasons = Mapper.Map<List<InvoiceUnderAssessReason>>(_invoiceUnderAssessReasonRepository.Where(x => x.TebaInvoiceId == item.TebaInvoiceId).ToList());

                        var payeeType = await _payeeTypeService.GetPayeeTypeById(item.PayeeTypeId);

                        var invoiceLineRepository = _tebaInvoiceLineRepository.Select(i => i);
                        item.TebaInvoiceLines = await (
                                from i in _tebaInvoiceLineRepository
                                where i.TebaInvoiceId == item.TebaInvoiceId
                                select new TebaInvoiceLine
                                {
                                    TebaInvoiceLineId = i.TebaInvoiceLineId,
                                    TebaInvoiceId = i.TebaInvoiceId,
                                    ServiceDate = i.ServiceDate,
                                    RequestedQuantity = i.RequestedQuantity,
                                    AuthorisedQuantity = i.AuthorisedQuantity,
                                    RequestedAmount = i.RequestedAmount,
                                    RequestedVat = i.RequestedVat,
                                    RequestedAmountInclusive = i.RequestedAmountInclusive,
                                    AuthorisedAmount = i.AuthorisedAmount,
                                    AuthorisedVat = i.AuthorisedVat,
                                    AuthorisedAmountInclusive = i.AuthorisedAmountInclusive,
                                    TariffId = i.TariffId,
                                    TotalTariffAmount = i.TotalTariffAmount,
                                    TotalTariffVat = i.TotalTariffVat,
                                    TotalTariffAmountInclusive = i.TotalTariffAmountInclusive,
                                    TariffAmount = i.TariffAmount,
                                    CreditAmount = i.CreditAmount,
                                    VatCode = i.VatCode,
                                    VatPercentage = i.VatPercentage,
                                    TreatmentCodeId = i.TreatmentCodeId,
                                    MedicalItemId = i.MedicalItemId,
                                    HcpTariffCode = i.HcpTariffCode,
                                    TariffBaseUnitCostTypeId = i.TariffBaseUnitCostTypeId,
                                    Description = i.Description,
                                    SummaryInvoiceLineId = i.SummaryInvoiceLineId,
                                    IsPerDiemCharge = i.IsPerDiemCharge,
                                    IsDuplicate = i.IsDuplicate,
                                    DuplicateTebaInvoiceLineId = i.DuplicateTebaInvoiceLineId,
                                    IsActive = i.IsActive,
                                    CreatedBy = i.CreatedBy,
                                    CreatedDate = i.CreatedDate,
                                    ModifiedBy = i.ModifiedBy,
                                    ModifiedDate = i.ModifiedDate
                                }).ToListAsync();

                        if (item.TebaInvoiceLines != null && item.TebaInvoiceLines.Count > 0)
                        {
                            foreach (var invoiceLine in item.TebaInvoiceLines)
                                invoiceLine.InvoiceLineUnderAssessReasons = Mapper.Map<List<InvoiceLineUnderAssessReason>>(_invoiceLineUnderAssessReasonRepository.Where(x => x.TebaInvoiceLineId == invoiceLine.TebaInvoiceLineId).ToList());
                        }

                        if (item.PersonEventId > 0)
                        {
                            var claims = await _claimService.GetClaimsByPersonEventId((int)item.PersonEventId);
                            if (claims.Any())
                                item.ClaimReferenceNumber = claims[0].ClaimReferenceNumber;
                        }

                    }

                }
                return tebaDetails;
            }
        }


        public async Task AddInvoiceReportMap(int invoiceId, List<MedicalInvoiceReport> medicalInvoiceReports, DateTime invoiceDate)
        {
            Contract.Requires(medicalInvoiceReports != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (medicalInvoiceReports != null)
                {
                    foreach (var medicalInvoiceReport in medicalInvoiceReports)
                    {
                        var toleranceDays = (invoiceDate - medicalInvoiceReport.ReportDate).TotalDays;
                        medical_InvoiceReportMap medical_InvoiceReportMap = new medical_InvoiceReportMap
                        {
                            ReportId = medicalInvoiceReport.ReportId,
                            InvoiceId = invoiceId,
                            ToleranceDays = Convert.ToInt32(toleranceDays),
                            IsDeleted = false
                        };
                        _invoiceReportMapRepository.Create(medical_InvoiceReportMap);
                    }

                    await scope.SaveChangesAsync();
                }
            }
        }

        public async Task<List<InvoiceDetails>> GetInvoiceDetailsByPersonEventId(int personEventId)
        {
            List<InvoiceDetails> invoiceDetails;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoiceRepository = _invoiceRepository.Select(i => i);
                invoiceDetails = await (
                        from i in invoiceRepository
                        join hcp in _healthCareProviderRepository on i.HealthCareProviderId equals hcp.RolePlayerId
                        join pt in _practitionerTypeRepository on hcp.ProviderTypeId equals pt.PractitionerTypeId
                        where i.PersonEventId == personEventId
                        select new InvoiceDetails
                        {
                            InvoiceId = i.InvoiceId,
                            ClaimId = i.ClaimId,
                            PersonEventId = i.PersonEventId,
                            HealthCareProviderId = i.HealthCareProviderId,
                            HealthCareProviderName = hcp.Name,
                            HcpInvoiceNumber = i.HcpInvoiceNumber,
                            HcpAccountNumber = i.HcpAccountNumber,
                            InvoiceNumber = i.InvoiceNumber,
                            InvoiceDate = i.InvoiceDate,
                            DateSubmitted = i.DateSubmitted,
                            DateReceived = i.DateReceived,
                            DateAdmitted = i.DateAdmitted,
                            DateDischarged = i.DateDischarged,
                            InvoiceStatus = i.InvoiceStatus,
                            InvoiceAmount = i.InvoiceAmount,
                            InvoiceVat = i.InvoiceVat,
                            InvoiceTotalInclusive = i.InvoiceTotalInclusive,
                            AuthorisedAmount = i.AuthorisedAmount,
                            AuthorisedVat = i.AuthorisedVat,
                            AuthorisedTotalInclusive = i.AuthorisedTotalInclusive,
                            PayeeId = i.PayeeId,
                            PayeeName = string.Empty,
                            PayeeTypeId = i.PayeeTypeId,
                            UnderAssessedComments = i.UnderAssessedComments,
                            HoldingKey = i.HoldingKey,
                            IsPaymentDelay = i.IsPaymentDelay,
                            IsPreauthorised = i.IsPreauthorised,
                            PreAuthXml = i.PreAuthXml,
                            Comments = i.Comments,
                            PracticeNumber = hcp.PracticeNumber,
                            PractitionerTypeId = hcp.ProviderTypeId,
                            PractitionerTypeName = pt.Name,
                            IsVat = hcp.IsVat,
                            VatRegNumber = hcp.VatRegNumber,
                            GreaterThan731Days = false,
                            IsActive = i.IsActive,
                            CreatedBy = i.CreatedBy,
                            CreatedDate = i.CreatedDate,
                            ModifiedBy = i.ModifiedBy,
                            ModifiedDate = i.ModifiedDate
                        }).ToListAsync();

                if (invoiceDetails != null)
                {
                    foreach (var item in invoiceDetails)
                    {
                        item.InvoiceUnderAssessReasons = Mapper.Map<List<InvoiceUnderAssessReason>>(_invoiceUnderAssessReasonRepository.Where(x => x.InvoiceId == item.InvoiceId).ToList());

                        var payeeType = await _payeeTypeService.GetPayeeTypeById(item.PayeeTypeId);
                        item.PayeeType = payeeType.Name;

                        var invoiceLineRepository = _invoiceLineRepository.Select(i => i);
                        item.InvoiceLineDetails = await (
                                from i in _invoiceLineRepository
                                join t in _tariffRepository on i.TariffId equals t.TariffId
                                join mi in _medicalItemRepository on t.MedicalItemId equals mi.MedicalItemId
                                where i.InvoiceId == item.InvoiceId
                                select new InvoiceLineDetails
                                {
                                    InvoiceLineId = i.InvoiceLineId,
                                    InvoiceId = i.InvoiceId,
                                    ServiceDate = i.ServiceDate,
                                    ServiceTimeStart = i.ServiceTimeStart,
                                    ServiceTimeEnd = i.ServiceTimeEnd,
                                    RequestedQuantity = i.RequestedQuantity,
                                    AuthorisedQuantity = i.AuthorisedQuantity,
                                    RequestedAmount = i.RequestedAmount,
                                    RequestedVat = i.RequestedVat,
                                    RequestedAmountInclusive = i.RequestedAmountInclusive,
                                    AuthorisedAmount = i.AuthorisedAmount,
                                    AuthorisedVat = i.AuthorisedVat,
                                    AuthorisedAmountInclusive = i.AuthorisedAmountInclusive,
                                    TotalTariffAmount = i.TotalTariffAmount,
                                    TotalTariffVat = i.TotalTariffVat,
                                    TotalTariffAmountInclusive = i.TotalTariffAmountInclusive,
                                    TariffAmount = i.TariffAmount,
                                    CreditAmount = i.CreditAmount,
                                    VatCode = i.VatCode,
                                    VatPercentage = i.VatPercentage,
                                    TariffId = i.TariffId,
                                    TreatmentCodeId = i.TreatmentCodeId,
                                    MedicalItemId = i.MedicalItemId,
                                    HcpTariffCode = i.HcpTariffCode,
                                    TariffBaseUnitCostTypeId = i.TariffBaseUnitCostTypeId,
                                    Description = i.Description,
                                    SummaryInvoiceLineId = i.SummaryInvoiceLineId,
                                    IsPerDiemCharge = i.IsPerDiemCharge,
                                    IsDuplicate = i.IsDuplicate,
                                    DuplicateInvoiceLineId = i.DuplicateInvoiceLineId,
                                    CalculateOperands = i.CalculateOperands,
                                    Icd10Code = i.Icd10Code,
                                    TariffDescription = mi.Description,
                                    DefaultQuantity = mi.DefaultQuantity,
                                    IsActive = i.IsActive,
                                    CreatedBy = i.CreatedBy,
                                    CreatedDate = i.CreatedDate,
                                    ModifiedBy = i.ModifiedBy,
                                    ModifiedDate = i.ModifiedDate,
                                    IsModifier = i.IsModifier
                                }).ToListAsync();

                        if (item.InvoiceLineDetails != null && item.InvoiceLineDetails.Count > 0)
                        {
                            foreach (var invoiceLine in item.InvoiceLineDetails)
                                invoiceLine.InvoiceLineUnderAssessReasons = Mapper.Map<List<InvoiceLineUnderAssessReason>>(_invoiceLineUnderAssessReasonRepository.Where(x => x.InvoiceLineId == invoiceLine.InvoiceLineId).ToList());
                        }

                        if (item.PersonEventId > 0)
                        {
                            var claims = await _claimService.GetClaimsByPersonEventId((int)item.PersonEventId);
                            if (claims.Count > 0)
                                item.ClaimReferenceNumber = claims[0].ClaimReferenceNumber;
                        }
                    }
                }

                return invoiceDetails;
            }
        }

        public async Task<List<InvoiceDetails>> GetPendedOrRejectedInvoicesForReinstate(int claimId, string underAssessReasonIds)
        {
            RmaIdentity.DemandPermission(Permissions.ViewMedicalInvoice);
            List<int> underAssessReasonIdsList = new List<int>();
            if (!string.IsNullOrEmpty(underAssessReasonIds))
            {
                underAssessReasonIdsList = JsonConvert.DeserializeObject<List<int>>(underAssessReasonIds);
            }

            List<InvoiceDetails> invoiceDetails;
            List<InvoiceDetails> invoiceDetailsFilteredList = new List<InvoiceDetails>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoiceRepository = _invoiceRepository.Select(i => i);
                invoiceDetails = await (
                        from i in invoiceRepository
                        join hcp in _healthCareProviderRepository on i.HealthCareProviderId equals hcp.RolePlayerId
                        join pt in _practitionerTypeRepository on hcp.ProviderTypeId equals pt.PractitionerTypeId
                        where i.ClaimId == claimId && (i.InvoiceStatus == InvoiceStatusEnum.Pending || i.InvoiceStatus == InvoiceStatusEnum.Rejected)
                        select new InvoiceDetails
                        {
                            InvoiceId = i.InvoiceId,
                            ClaimId = i.ClaimId,
                            PersonEventId = i.PersonEventId,
                            HealthCareProviderId = i.HealthCareProviderId,
                            HealthCareProviderName = hcp.Name,
                            HcpInvoiceNumber = i.HcpInvoiceNumber,
                            HcpAccountNumber = i.HcpAccountNumber,
                            InvoiceNumber = i.InvoiceNumber,
                            InvoiceDate = i.InvoiceDate,
                            DateSubmitted = i.DateSubmitted,
                            DateReceived = i.DateReceived,
                            DateAdmitted = i.DateAdmitted,
                            DateDischarged = i.DateDischarged,
                            InvoiceStatus = i.InvoiceStatus,
                            InvoiceAmount = i.InvoiceAmount,
                            InvoiceVat = i.InvoiceVat,
                            InvoiceTotalInclusive = i.InvoiceTotalInclusive,
                            AuthorisedAmount = i.AuthorisedAmount,
                            AuthorisedVat = i.AuthorisedVat,
                            AuthorisedTotalInclusive = i.AuthorisedTotalInclusive,
                            PayeeId = i.PayeeId,
                            PayeeName = string.Empty,
                            PayeeTypeId = i.PayeeTypeId,
                            UnderAssessedComments = i.UnderAssessedComments,
                            HoldingKey = i.HoldingKey,
                            IsPaymentDelay = i.IsPaymentDelay,
                            IsPreauthorised = i.IsPreauthorised,
                            PreAuthXml = i.PreAuthXml,
                            Comments = i.Comments,
                            PracticeNumber = hcp.PracticeNumber,
                            PractitionerTypeId = hcp.ProviderTypeId,
                            PractitionerTypeName = pt.Name,
                            IsVat = hcp.IsVat,
                            VatRegNumber = hcp.VatRegNumber,
                            GreaterThan731Days = false,
                            IsActive = i.IsActive,
                            CreatedBy = i.CreatedBy,
                            CreatedDate = i.CreatedDate,
                            ModifiedBy = i.ModifiedBy,
                            ModifiedDate = i.ModifiedDate
                        }).ToListAsync();

                if (invoiceDetails != null)
                {
                    if (underAssessReasonIdsList.Count > 0)
                    {
                        foreach (var underAssessReasonId in underAssessReasonIdsList)
                        {
                            foreach (var invoiceItem in invoiceDetails)
                            {
                                if (invoiceItem.InvoiceUnderAssessReasons != null)
                                {
                                    invoiceItem.InvoiceUnderAssessReasons.ForEach(x =>
                                    {
                                        if (x.UnderAssessReasonId == underAssessReasonId)
                                        {
                                            if (!invoiceDetailsFilteredList.Contains(invoiceItem))
                                            {
                                                invoiceDetailsFilteredList.Add(invoiceItem);
                                            }
                                        }
                                    });
                                }
                                else
                                {
                                    if (!invoiceDetailsFilteredList.Contains(invoiceItem))
                                    {
                                        invoiceDetailsFilteredList.Add(invoiceItem);
                                    }
                                }
                            }
                        }
                    }
                    else
                    {
                        invoiceDetails.ForEach(x =>
                        {
                            if (!invoiceDetailsFilteredList.Contains(x))
                            {
                                invoiceDetailsFilteredList.Add(x);
                            }
                        });
                    }

                    foreach (var item in invoiceDetailsFilteredList)
                    {
                        item.InvoiceUnderAssessReasons = Mapper.Map<List<InvoiceUnderAssessReason>>(_invoiceUnderAssessReasonRepository.Where(x => x.InvoiceId == item.InvoiceId).ToList());

                        var payeeType = await _payeeTypeService.GetPayeeTypeById(item.PayeeTypeId);
                        item.PayeeType = payeeType.Name;

                        var invoiceLineRepository = _invoiceLineRepository.Select(i => i);
                        item.InvoiceLineDetails = await (
                                from i in _invoiceLineRepository
                                join t in _tariffRepository on i.TariffId equals t.TariffId
                                join mi in _medicalItemRepository on t.MedicalItemId equals mi.MedicalItemId
                                where i.InvoiceId == item.InvoiceId
                                select new InvoiceLineDetails
                                {
                                    InvoiceLineId = i.InvoiceLineId,
                                    InvoiceId = i.InvoiceId,
                                    ServiceDate = i.ServiceDate,
                                    ServiceTimeStart = i.ServiceTimeStart,
                                    ServiceTimeEnd = i.ServiceTimeEnd,
                                    RequestedQuantity = i.RequestedQuantity,
                                    AuthorisedQuantity = i.AuthorisedQuantity,
                                    RequestedAmount = i.RequestedAmount,
                                    RequestedVat = i.RequestedVat,
                                    RequestedAmountInclusive = i.RequestedAmountInclusive,
                                    AuthorisedAmount = i.AuthorisedAmount,
                                    AuthorisedVat = i.AuthorisedVat,
                                    AuthorisedAmountInclusive = i.AuthorisedAmountInclusive,
                                    TotalTariffAmount = i.TotalTariffAmount,
                                    TotalTariffVat = i.TotalTariffVat,
                                    TotalTariffAmountInclusive = i.TotalTariffAmountInclusive,
                                    TariffAmount = i.TariffAmount,
                                    CreditAmount = i.CreditAmount,
                                    VatCode = i.VatCode,
                                    VatPercentage = i.VatPercentage,
                                    TariffId = i.TariffId,
                                    TreatmentCodeId = i.TreatmentCodeId,
                                    MedicalItemId = i.MedicalItemId,
                                    HcpTariffCode = i.HcpTariffCode,
                                    TariffBaseUnitCostTypeId = i.TariffBaseUnitCostTypeId,
                                    Description = i.Description,
                                    SummaryInvoiceLineId = i.SummaryInvoiceLineId,
                                    IsPerDiemCharge = i.IsPerDiemCharge,
                                    IsDuplicate = i.IsDuplicate,
                                    DuplicateInvoiceLineId = i.DuplicateInvoiceLineId,
                                    CalculateOperands = i.CalculateOperands,
                                    Icd10Code = i.Icd10Code,
                                    TariffDescription = mi.Description,
                                    DefaultQuantity = mi.DefaultQuantity,
                                    IsActive = i.IsActive,
                                    CreatedBy = i.CreatedBy,
                                    CreatedDate = i.CreatedDate,
                                    ModifiedBy = i.ModifiedBy,
                                    ModifiedDate = i.ModifiedDate,
                                    IsModifier = i.IsModifier
                                }).ToListAsync();

                        if (item.InvoiceLineDetails != null && item.InvoiceLineDetails.Count > 0)
                        {
                            foreach (var invoiceLine in item.InvoiceLineDetails)
                                invoiceLine.InvoiceLineUnderAssessReasons = Mapper.Map<List<InvoiceLineUnderAssessReason>>(_invoiceLineUnderAssessReasonRepository.Where(x => x.InvoiceLineId == invoiceLine.InvoiceLineId).ToList());
                        }

                        if (item.PersonEventId > 0)
                        {
                            var claims = await _claimService.GetClaimsByPersonEventId((int)item.PersonEventId);
                            if (claims.Count > 0)
                                item.ClaimReferenceNumber = claims[0].ClaimReferenceNumber;
                        }
                    }
                }

                return invoiceDetailsFilteredList;
            }
        }

        public async Task<PagedRequestResult<InvoiceDetails>> SearchMedicalInvoice(PagedRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.SearchCriteria)) return new PagedRequestResult<InvoiceDetails>();
            RmaIdentity.DemandPermission(Permissions.ViewMedicalInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (request?.OrderBy.ToLower() == "InvoiceId") request.OrderBy = "InvoiceId";
                var invoiceSearch = JsonConvert.DeserializeObject<InvoiceSearchModel>(request?.SearchCriteria);

                if (!string.IsNullOrEmpty(invoiceSearch.ClaimReferenceNumber))
                {
                    var claims = await _claimService.GetClaimsByClaimReferenceNumber(invoiceSearch.ClaimReferenceNumber.Replace('-', '/'));
                    if (claims.Count > 0)
                    {
                        invoiceSearch.PersonEventId = claims.FirstOrDefault()?.PersonEventId ?? 0;
                    }
                }
                else
                {
                    invoiceSearch.PersonEventId = invoiceSearch.PersonEventId ?? 0;
                }

                var personEventId = invoiceSearch.PersonEventId;
                var practiceNumber = invoiceSearch.PracticeNumber ?? string.Empty;
                var invoiceNumber = invoiceSearch.InvoiceNumber ?? string.Empty;
                var invoiceStatus = invoiceSearch?.InvoiceStatus ?? InvoiceStatusEnum.Unknown;//zero value or status not set
                var serviceDate = invoiceSearch.ServiceDate ?? DateTime.MinValue;
                var invoiceDate = invoiceSearch.InvoiceDate ?? DateTime.MinValue;

                var invoiceRepository = _invoiceRepository.Select(i => i);
                if (personEventId > 0)
                {
                    invoiceRepository = _invoiceRepository.Where(i => i.PersonEventId == personEventId);
                }

                if (!string.IsNullOrEmpty(invoiceNumber))
                    invoiceRepository = invoiceRepository.Where(i => i.InvoiceNumber == invoiceNumber);
                if (invoiceStatus != InvoiceStatusEnum.Unknown)
                    invoiceRepository = invoiceRepository.Where(i => i.InvoiceStatus == invoiceStatus);
                if (serviceDate != DateTime.MinValue)
                    invoiceRepository = invoiceRepository.Where(i => i.DateAdmitted == serviceDate);
                if (invoiceDate != DateTime.MinValue)
                    invoiceRepository = invoiceRepository.Where(i => i.InvoiceDate == invoiceDate);

                var healthCareProviderRepository = _healthCareProviderRepository.Select(i => i);
                if (!string.IsNullOrEmpty(practiceNumber))
                {
                    healthCareProviderRepository = _healthCareProviderRepository.Where(i => i.PracticeNumber == practiceNumber);
                }

                var invoiceList = await (
                        from i in invoiceRepository
                        join hcp in healthCareProviderRepository on i.HealthCareProviderId equals hcp.RolePlayerId
                        join pt in _practitionerTypeRepository on hcp.ProviderTypeId equals pt.PractitionerTypeId
                        select new InvoiceDetails
                        {
                            InvoiceId = i.InvoiceId,
                            ClaimId = i.ClaimId,
                            PersonEventId = i.PersonEventId,
                            HealthCareProviderId = i.HealthCareProviderId,
                            HealthCareProviderName = hcp.Name,
                            HcpInvoiceNumber = i.HcpInvoiceNumber,
                            HcpAccountNumber = i.HcpAccountNumber,
                            InvoiceNumber = i.InvoiceNumber,
                            InvoiceDate = i.InvoiceDate,
                            DateSubmitted = i.DateSubmitted,
                            DateReceived = i.DateReceived,
                            DateAdmitted = i.DateAdmitted,
                            DateDischarged = i.DateDischarged,
                            InvoiceStatus = i.InvoiceStatus,
                            InvoiceAmount = i.InvoiceAmount,
                            InvoiceVat = i.InvoiceVat,
                            InvoiceTotalInclusive = i.InvoiceTotalInclusive,
                            AuthorisedAmount = i.AuthorisedAmount,
                            AuthorisedVat = i.AuthorisedVat,
                            AuthorisedTotalInclusive = i.AuthorisedTotalInclusive,
                            PayeeId = i.PayeeId,
                            PayeeName = string.Empty,
                            PayeeTypeId = i.PayeeTypeId,
                            UnderAssessedComments = i.UnderAssessedComments,
                            HoldingKey = i.HoldingKey,
                            IsPaymentDelay = i.IsPaymentDelay,
                            IsPreauthorised = i.IsPreauthorised,
                            PreAuthXml = i.PreAuthXml,
                            Comments = i.Comments,
                            PracticeNumber = hcp.PracticeNumber,
                            PractitionerTypeId = hcp.ProviderTypeId,
                            PractitionerTypeName = pt.Name,
                            IsVat = hcp.IsVat,
                            VatRegNumber = hcp.VatRegNumber,
                            GreaterThan731Days = false,
                            IsActive = i.IsActive,
                            CreatedBy = i.CreatedBy,
                            CreatedDate = i.CreatedDate,
                            ModifiedBy = i.ModifiedBy,
                            ModifiedDate = i.ModifiedDate
                        }).ToPagedResult(request);


                if (invoiceList != null)
                {
                    foreach (var item in invoiceList.Data)
                    {
                        item.InvoiceUnderAssessReasons = Mapper.Map<List<InvoiceUnderAssessReason>>(_invoiceUnderAssessReasonRepository.Where(x => x.InvoiceId == item.InvoiceId).ToList());

                        var payeeType = await _payeeTypeService.GetPayeeTypeById(item.PayeeTypeId);
                        item.PayeeType = payeeType.Name;

                        var invoiceLineRepository = _invoiceLineRepository.Select(i => i);
                        item.InvoiceLineDetails = await (
                                from i in _invoiceLineRepository
                                join t in _tariffRepository on i.TariffId equals t.TariffId
                                join mi in _medicalItemRepository on t.MedicalItemId equals mi.MedicalItemId
                                where i.InvoiceId == item.InvoiceId
                                select new InvoiceLineDetails
                                {
                                    InvoiceLineId = i.InvoiceLineId,
                                    InvoiceId = i.InvoiceId,
                                    ServiceDate = i.ServiceDate,
                                    ServiceTimeStart = i.ServiceTimeStart,
                                    ServiceTimeEnd = i.ServiceTimeEnd,
                                    RequestedQuantity = i.RequestedQuantity,
                                    AuthorisedQuantity = i.AuthorisedQuantity,
                                    RequestedAmount = i.RequestedAmount,
                                    RequestedVat = i.RequestedVat,
                                    RequestedAmountInclusive = i.RequestedAmountInclusive,
                                    AuthorisedAmount = i.AuthorisedAmount,
                                    AuthorisedVat = i.AuthorisedVat,
                                    AuthorisedAmountInclusive = i.AuthorisedAmountInclusive,
                                    TotalTariffAmount = i.TotalTariffAmount,
                                    TotalTariffVat = i.TotalTariffVat,
                                    TotalTariffAmountInclusive = i.TotalTariffAmountInclusive,
                                    TariffAmount = i.TariffAmount,
                                    CreditAmount = i.CreditAmount,
                                    VatCode = i.VatCode,
                                    VatPercentage = i.VatPercentage,
                                    TariffId = i.TariffId,
                                    TreatmentCodeId = i.TreatmentCodeId,
                                    MedicalItemId = i.MedicalItemId,
                                    HcpTariffCode = i.HcpTariffCode,
                                    TariffBaseUnitCostTypeId = i.TariffBaseUnitCostTypeId,
                                    Description = i.Description,
                                    SummaryInvoiceLineId = i.SummaryInvoiceLineId,
                                    IsPerDiemCharge = i.IsPerDiemCharge,
                                    IsDuplicate = i.IsDuplicate,
                                    DuplicateInvoiceLineId = i.DuplicateInvoiceLineId,
                                    CalculateOperands = i.CalculateOperands,
                                    Icd10Code = i.Icd10Code,
                                    TariffDescription = mi.Description,
                                    DefaultQuantity = mi.DefaultQuantity,
                                    IsActive = i.IsActive,
                                    CreatedBy = i.CreatedBy,
                                    CreatedDate = i.CreatedDate,
                                    ModifiedBy = i.ModifiedBy,
                                    ModifiedDate = i.ModifiedDate,
                                    IsModifier = i.IsModifier
                                }).ToListAsync();

                        if (item.InvoiceLineDetails != null && item.InvoiceLineDetails.Count > 0)
                        {
                            foreach (var invoiceLine in item.InvoiceLineDetails)
                                invoiceLine.InvoiceLineUnderAssessReasons = Mapper.Map<List<InvoiceLineUnderAssessReason>>(_invoiceLineUnderAssessReasonRepository.Where(x => x.InvoiceLineId == invoiceLine.InvoiceLineId).ToList());
                        }

                        if (item.PersonEventId > 0)
                        {
                            var claims = await _claimService.GetClaimsByPersonEventId((int)item.PersonEventId);
                            if (claims.Count > 0)
                                item.ClaimReferenceNumber = claims[0].ClaimReferenceNumber;
                        }
                    }
                }

                if (invoiceList?.Data.Count > 0)
                {
                    return new PagedRequestResult<InvoiceDetails>
                    {
                        Page = invoiceList.Page,
                        PageCount = invoiceList.PageCount,
                        RowCount = invoiceList.RowCount,
                        PageSize = invoiceList.PageSize,
                        Data = invoiceList.Data
                    };
                }

                return new PagedRequestResult<InvoiceDetails>();
            }
        }

        public async Task<PagedRequestResult<InvoiceDetails>> SearchMedicalInvoiceV2(MedicalInvoiceSearchRequest request)
        {
            var result = new PagedRequestResult<InvoiceDetails>();
            if (request == null)
            {
                return result;
            }
            if (request.PagedRequest == null)
            {
                return result;
            }

            RmaIdentity.DemandPermission(Permissions.ViewMedicalInvoice);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                IQueryable<medical_Invoice> invoiceQuery = _invoiceRepository.AsQueryable();
                IQueryable<medical_HealthCareProvider> hcpQuery = _healthCareProviderRepository.AsQueryable();
                IQueryable<medical_PractitionerType> practitionerType = _practitionerTypeRepository.AsQueryable();
                if (request.RolePlayerId.HasValue)
                {
                    invoiceQuery = invoiceQuery.Where(i => i.HealthCareProviderId == request.RolePlayerId);
                    hcpQuery = hcpQuery.Where(hcp => hcp.RolePlayerId == request.RolePlayerId);
                }

                if (!string.IsNullOrEmpty(request.PagedRequest.SearchCriteria))
                {
                    invoiceQuery = invoiceQuery.Where(i =>
                        i.InvoiceNumber == request.PagedRequest.SearchCriteria
                        || i.InvoiceNumber.Contains(request.PagedRequest.SearchCriteria)
                        || i.HcpInvoiceNumber == request.PagedRequest.SearchCriteria
                        || i.HcpInvoiceNumber.Contains(request.PagedRequest.SearchCriteria));
                }

                result = await (
                        from i in invoiceQuery
                        join hcp in hcpQuery on i.HealthCareProviderId equals hcp.RolePlayerId
                        join pt in practitionerType on hcp.ProviderTypeId equals pt.PractitionerTypeId
                        select new InvoiceDetails
                        {
                            InvoiceId = i.InvoiceId,
                            ClaimId = i.ClaimId,
                            PersonEventId = i.PersonEventId,
                            HealthCareProviderId = i.HealthCareProviderId,
                            HealthCareProviderName = hcp.Name,
                            HcpInvoiceNumber = i.HcpInvoiceNumber,
                            HcpAccountNumber = i.HcpAccountNumber,
                            InvoiceNumber = i.InvoiceNumber,
                            InvoiceDate = i.InvoiceDate,
                            DateSubmitted = i.DateSubmitted,
                            DateReceived = i.DateReceived,
                            DateAdmitted = i.DateAdmitted,
                            DateDischarged = i.DateDischarged,
                            InvoiceStatus = i.InvoiceStatus,
                            InvoiceAmount = i.InvoiceAmount,
                            InvoiceVat = i.InvoiceVat,
                            InvoiceTotalInclusive = i.InvoiceTotalInclusive,
                            AuthorisedAmount = i.AuthorisedAmount,
                            AuthorisedVat = i.AuthorisedVat,
                            AuthorisedTotalInclusive = i.AuthorisedTotalInclusive,
                            PayeeId = i.PayeeId,
                            PayeeName = string.Empty,
                            PayeeTypeId = i.PayeeTypeId,
                            UnderAssessedComments = i.UnderAssessedComments,
                            HoldingKey = i.HoldingKey,
                            IsPaymentDelay = i.IsPaymentDelay,
                            IsPreauthorised = i.IsPreauthorised,
                            PreAuthXml = i.PreAuthXml,
                            Comments = i.Comments,
                            PracticeNumber = hcp.PracticeNumber,
                            PractitionerTypeId = hcp.ProviderTypeId,
                            PractitionerTypeName = pt.Name,
                            IsVat = hcp.IsVat,
                            VatRegNumber = hcp.VatRegNumber,
                            GreaterThan731Days = false,
                            IsActive = i.IsActive,
                            CreatedBy = i.CreatedBy,
                            CreatedDate = i.CreatedDate,
                            ModifiedBy = i.ModifiedBy,
                            ModifiedDate = i.ModifiedDate
                        }).ToPagedResult(request.PagedRequest);


            }
            return result;
        }


        public async Task<List<MedicalReportForm>> GetMappedInvoiceMedicalReports(int invoiceId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewMedicalReportForm);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoiceReportMapList = await _invoiceReportMapRepository
                    .Where(x => x.InvoiceId == invoiceId).ToListAsync();

                var reportDetailsList = new List<int>();
                var InvoiceReportMapDetailList = new List<MedicalReportForm>();

                foreach (var invoiceReportMap in invoiceReportMapList)
                {
                    reportDetailsList.Add(invoiceReportMap.ReportId);
                }

                return await _medicalFormService.GetMedicalReportsById(reportDetailsList); ;
            }
        }

        public async Task<bool> GetHealthCareProviderVatStatus(int healthCareProviderId)
        {
            var healthCareProviderDetails = await _healthCareProviderService.GetHealthCareProviderById(healthCareProviderId).ConfigureAwait(true);
            return healthCareProviderDetails.IsVat;
        }

        public async Task<bool> CheckDuplicateLineItem(DuplicateLineItem duplicateLineItem)
        {
            Contract.Requires(duplicateLineItem != null);
            var isDuplicateLineItem = false;
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                int modifier = 3;
                var healthCareProvider = await _healthCareProviderService.GetHealthCareProviderById(duplicateLineItem.HealthCareProviderId);
                var medicalItem = await _medicalItemRepository.Where(x => x.MedicalItemId == duplicateLineItem.MedicalItemId).FirstOrDefaultAsync();
                var tariffCodes = await _tariffRepository.Where(x => x.ItemCode == duplicateLineItem.TariffCode).Select(a => a.ItemCode).ToListAsync();
                var providerTypeIds = await _tariffRepository.Where(x => x.ItemCode == duplicateLineItem.TariffCode).Select(a => a.PractitionerType).ToListAsync();

                int practitionerTypeId = healthCareProvider.ProviderTypeId;
                var PracticeIsAllowSameDayTreatment = healthCareProvider.IsAllowSameDayTreatment;

                var ISModifier = (medicalItem?.MedicalItemTypeId == modifier) ? true : false;

                var MedicalItemIsAllowSameDayTreatment = (medicalItem?.IsAllowSameDayTreatment == true) ? true : false;
                var IsAllowSameDayTreatment = (PracticeIsAllowSameDayTreatment && MedicalItemIsAllowSameDayTreatment) ? true : false;

                //check if there is a duplicate and return true or false
                if (!IsAllowSameDayTreatment && !ISModifier)
                {
                    var underAssessReasonfiltered = await (
                            from li in _invoiceLineRepository
                            from u in li.InvoiceLineUnderAssessReasons
                            where li.InvoiceId == duplicateLineItem.InvoiceLineId
                            where u.UnderAssessReasonId != (int)UnderAssessReasonEnum.lineItemIsADuplicate
                            select new { u.UnderAssessReasonId, li.InvoiceId, li.HcpTariffCode, li.MedicalItemId, li.TariffId }).ToListAsync();

                    var invoiceDetails = await (
                             from i in _invoiceRepository
                             join li in underAssessReasonfiltered on i.InvoiceId equals li.InvoiceId

                             where i.PersonEventId == duplicateLineItem.PersonEventId
                             where li.InvoiceId != duplicateLineItem.InvoiceLineId
                             where i.HealthCareProviderId == duplicateLineItem.HealthCareProviderId
                             where i.InvoiceDate == duplicateLineItem.ServiceDate

                             where tariffCodes.Contains(duplicateLineItem.TariffCode) && (providerTypeIds.Contains((PractitionerTypeEnum)practitionerTypeId) || providerTypeIds.Contains(0))
                             || li.HcpTariffCode == duplicateLineItem.TariffCode || li.MedicalItemId == duplicateLineItem.MedicalItemId

                             where i.IsActive
                             where li.TariffId > 0
                             select new InvoiceDetails
                             {
                                 InvoiceId = i.InvoiceId
                             }).FirstOrDefaultAsync();

                    if (invoiceDetails != null)
                    {
                        isDuplicateLineItem = true;
                    }
                }
                return isDuplicateLineItem;
            }
        }

        public async Task<PaymentAllocationDetails> GetPaymentAllocationByMedicalInvoiceId(int medicalInvoiceId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var paymentAllocation = await _paymentsAllocationService.GetAllocationsByMedicalInvoiceId(medicalInvoiceId, PaymentTypeEnum.MedicalInvoice);

                PaymentAllocationDetails paymentAllocationDetails = new PaymentAllocationDetails();
                if (paymentAllocation?.AllocationId > 0)
                {
                    paymentAllocationDetails.AllocationId = paymentAllocation.AllocationId;
                    paymentAllocationDetails.PayeeId = paymentAllocation.PayeeId;
                    paymentAllocationDetails.InvoiceType = nameof(InvoiceTypeEnum.Medical);
                    paymentAllocationDetails.AllocationStatusId = (int)paymentAllocation.PaymentAllocationStatus;
                    paymentAllocationDetails.MedicalInvoiceId = paymentAllocation.MedicalInvoiceId;
                    paymentAllocationDetails.AssessedAmount = paymentAllocation.AssessedAmount;
                    paymentAllocationDetails.AssessedVat = paymentAllocation.AssessedVat;
                    paymentAllocationDetails.IsActive = paymentAllocation.IsActive;
                    paymentAllocationDetails.IsDeleted = paymentAllocation.IsDeleted;
                    paymentAllocationDetails.CreatedBy = paymentAllocation.CreatedBy;
                    paymentAllocationDetails.CreatedDate = paymentAllocation.CreatedDate;
                    paymentAllocationDetails.ModifiedBy = paymentAllocation.ModifiedBy;
                    paymentAllocationDetails.ModifiedDate = paymentAllocation.ModifiedDate;

                    paymentAllocationDetails.AllocationStatus = Utility.GetEnumDisplayName(paymentAllocation.PaymentAllocationStatus);

                    try
                    {
                        if (paymentAllocation?.PayeeId > 0)
                        {
                            var rolePlayer = await _rolePlayerService.GetRolePlayer(paymentAllocation.PayeeId);
                            if (rolePlayer != null)
                            {
                                paymentAllocationDetails.PayeeName = rolePlayer.DisplayName;
                                paymentAllocationDetails.PayeeType = rolePlayer.RolePlayerIdentificationType.ToString();
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        if (!ex.InnerException.Message.Contains("Could not find a rolePlayer with the id"))
                            throw;
                    }

                    var payments = await _paymentsAllocationService.GetPaymentsByAllocationId(paymentAllocation.AllocationId);
                    if (payments != null)
                    {
                        paymentAllocationDetails.TotalAmount = payments.Sum(p => p.Amount);
                    }
                }

                return paymentAllocationDetails;
            }
        }

        public async Task<List<PaymentDetails>> GetPaymentsByMedicalInvoiceId(int medicalInvoiceId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var paymentAllocation = await _paymentsAllocationService.GetAllocationsByMedicalInvoiceId(medicalInvoiceId, PaymentTypeEnum.MedicalInvoice);

                List<PaymentDetails> paymentDetails = new List<PaymentDetails>();
                if (paymentAllocation?.AllocationId > 0)
                {
                    var payments = await _paymentsAllocationService.GetPaymentsByAllocationId(paymentAllocation.AllocationId);
                    if (payments != null)
                    {
                        foreach (var payment in payments)
                        {
                            PaymentDetails paymentDetail = new PaymentDetails
                            {
                                PaymentId = payment.PaymentId,
                                PaymentStatus = payment.PaymentStatus.GetEnumDisplayName(),
                                IsReversal = (payment.TransactionType != null && payment.TransactionType.Contains("Reversal")),
                                Payee = payment.Payee,
                                Amount = payment.Amount,
                                DateAuthorised = payment.CreatedDate,
                                DatePaid = payment.PaymentConfirmationDate != null ? (DateTime)payment.PaymentConfirmationDate : DateTime.MinValue,
                                PaymentStatusReason = string.Empty,
                                IsActive = payment.IsActive,
                                IsDeleted = payment.IsDeleted,
                                CreatedBy = payment.CreatedBy,
                                CreatedDate = payment.CreatedDate,
                                ModifiedBy = payment.ModifiedBy,
                                ModifiedDate = payment.ModifiedDate
                            };

                            paymentDetails.Add(paymentDetail);
                        }
                    }
                }

                return paymentDetails;
            }
        }

        public async Task<int> DeleteAllocatedInvoice(int invoiceId)
        {
            RmaIdentity.DemandPermission(Permissions.DeleteMedicalInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _invoiceRepository.FirstOrDefaultAsync(a => a.InvoiceId == invoiceId);
                entity.IsDeleted = true;
                entity.IsActive = false;
                entity.ModifiedBy = RmaIdentity.Email;
                entity.ModifiedDate = DateTimeHelper.SaNow;

                var paymentAlocation = await _paymentsAllocationService.GetAllocationsByMedicalInvoiceId(invoiceId, PaymentTypeEnum.MedicalInvoice);
                paymentAlocation.IsDeleted = true;
                paymentAlocation.IsActive = false;
                paymentAlocation.ModifiedBy = RmaIdentity.Email;
                paymentAlocation.ModifiedDate = DateTimeHelper.SaNow;

                await _paymentsAllocationService.UpdateAllocation(paymentAlocation);

                _invoiceRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.InvoiceId;
            }
        }

        public async Task<int> UpdateMedicalInvoicePaymentStatus(PaymentStatusEnum paymentStatus, int paymentId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                int invoiceId = 0;
                var paymentAlocationList = await _paymentsAllocationService.GetAllocationsByPaymentId(paymentId);

                if (paymentAlocationList == null) return invoiceId;

                if (paymentAlocationList.Any())
                {
                    for (int i = 0; i < paymentAlocationList?.Count; i++)
                    {
                        int medicalInvoiceId = (int)paymentAlocationList[i].MedicalInvoiceId;
                        var allocatedInvoice = await _invoiceRepository.FirstOrDefaultAsync(a => a.InvoiceId == medicalInvoiceId);

                        switch (paymentStatus)
                        {
                            case PaymentStatusEnum.Reconciled:
                                allocatedInvoice.InvoiceStatus = InvoiceStatusEnum.Paid;
                                paymentAlocationList[i].PaymentAllocationStatus = PaymentAllocationStatusEnum.AllPaid;
                                break;
                            case PaymentStatusEnum.Rejected:
                                allocatedInvoice.InvoiceStatus = InvoiceStatusEnum.Rejected;
                                paymentAlocationList[i].PaymentAllocationStatus = PaymentAllocationStatusEnum.PaymentRejected;
                                break;
                            case PaymentStatusEnum.Reversed:
                                allocatedInvoice.InvoiceStatus = InvoiceStatusEnum.PaymentReversed;
                                paymentAlocationList[i].PaymentAllocationStatus = PaymentAllocationStatusEnum.PaymentCancelled;
                                break;
                        }

                        allocatedInvoice.ModifiedBy = RmaIdentity.Email;
                        allocatedInvoice.ModifiedDate = DateTimeHelper.SaNow;
                        invoiceId = allocatedInvoice.InvoiceId;

                        //update invoice
                        _invoiceRepository.Update(allocatedInvoice);
                        await scope.SaveChangesAsync().ConfigureAwait(false);
                        //update allocation
                        await _paymentsAllocationService.UpdateAllocation(paymentAlocationList[i]);
                    }
                }

                return invoiceId;
            }
        }

        public async Task<bool> CheckForDuplicateLineItem(int currentInvoiceLineItemId, int personEventId, int healthCareProviderId, int tariffId, DateTime serviceDate)
        {
            var isDuplicate = false;
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var invoiceLineitemList = await (from i in _invoiceRepository
                                                 join il in _invoiceLineRepository on i.InvoiceId equals il.InvoiceId
                                                 where il.InvoiceLineId != currentInvoiceLineItemId && i.PersonEventId == personEventId && il.TariffId == tariffId && i.HealthCareProviderId == healthCareProviderId
                                                 select il).ToListAsync();

                foreach (var invoiceLineitem in invoiceLineitemList)
                {
                    if (invoiceLineitem.ServiceDate.ToShortDateString() == serviceDate.ToShortDateString())
                    {
                        isDuplicate = true;
                        break;
                    }
                }

            }
            return isDuplicate;
        }

        public async Task<bool> CheckForDuplicateTebaLineItem(int currentInvoiceLineItemId, int personEventId, int invoicerId, int tariffId, DateTime serviceDate)
        {
            var isDuplicate = false;
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var invoiceLineitemList = await (from i in _tebaInvoiceRepository
                                                 join il in _tebaInvoiceLineRepository on i.TebaInvoiceId equals il.TebaInvoiceId
                                                 where il.TebaInvoiceLineId != currentInvoiceLineItemId && i.PersonEventId == personEventId && il.TariffId == tariffId && i.InvoicerId == invoicerId
                                                 select il).ToListAsync();

                foreach (var invoiceLineitem in invoiceLineitemList)
                {
                    if (invoiceLineitem.ServiceDate.ToShortDateString() == serviceDate.ToShortDateString())
                    {
                        isDuplicate = true;
                        break;
                    }
                }

            }
            return isDuplicate;
        }

        public async Task<decimal> GetVatAmount(bool isVatRegistered, DateTime invoiceDate)
        {
            return await _healthCareProviderService.GetHealthCareProviderVatAmount(isVatRegistered, invoiceDate).ConfigureAwait(true);
        }

        //common helpers
        public async Task<bool> GetSTPIsFeatureFlagSettingEnabledCommon()
        {
            return await _configurationService.IsFeatureFlagSettingEnabled("modernisation-medical-invoice-stp-integration");
        }

        public async Task<List<RMA.Service.ClaimCare.Contracts.Entities.Claim>> GetClaimsByPersonEventIdCommon(int personEventId)
        {
            return await _claimService.GetClaimsByPersonEventId(personEventId);
        }

        public async Task<RMA.Service.ClaimCare.Contracts.Entities.Claim> GetClaimCommon(int claimId)
        {
            return await _claimService.GetClaim(claimId);
        }

        public async Task<RMA.Service.ClaimCare.Contracts.Entities.PersonEvent> GetPersonEventByClaimIdCommon(int claimId)
        {
            return await _claimService.GetPersonEventByClaimId(claimId);
        }

        public async Task<RMA.Service.Admin.MasterDataManager.Contracts.Entities.PayeeType> GetPayeeTypeByIdCommon(int payeeTypeId)
        {
            return await _payeeTypeService.GetPayeeTypeById(payeeTypeId);
        }

        public async Task<List<RMA.Service.Admin.MasterDataManager.Contracts.Entities.MedicalReportForm>> GetMedicalReportsForInvoiceCommon(MedicalReportQueryParams medicalReportQueryParams)
        {
            return await _medicalFormService.GetMedicalReportsForInvoice(medicalReportQueryParams);
        }

        public async Task<HealthCareProvider> GetHealthCareProviderByIdCommon(int healthCareProviderId)
        {
            return await _healthCareProviderService.GetHealthCareProviderById(healthCareProviderId);
        }

        public async Task<bool> IsRequireMedicalReportCommon(int healthCareProviderId)
        {
            return await _healthCareProviderService.IsRequireMedicalReport(healthCareProviderId);
        }

        public async Task<decimal> GetHealthCareProviderVatAmountCommon(bool isVatRegistered, DateTime invoiceDate)
        {
            return await _healthCareProviderService.GetHealthCareProviderVatAmount(isVatRegistered, invoiceDate);
        }

        public async Task<Payment> GetPaymentByAllocationIdCommon(int allocationId)
        {
            return await _paymentsAllocationService.GetPaymentByAllocationId(allocationId);
        }

        public async Task<Allocation> GetAllocationsByMedicalInvoiceIdCommon(int medicalInvoiceId)
        {
            return await _paymentsAllocationService.GetAllocationsByMedicalInvoiceId(medicalInvoiceId, PaymentTypeEnum.MedicalInvoice);
        }

        public async Task<List<Payment>> GetPaymentsByAllocationIdCommon(int allocationId)
        {
            return await _paymentsAllocationService.GetPaymentsByAllocationId(allocationId);
        }

        public async Task<Allocation> GetAllocationByAllocationIdCommon(int allocationId)
        {
            return await _paymentsAllocationService.GetAllocationByAllocationId(allocationId);
        }

        public async Task<int> UpdateAllocationCommon(Allocation allocation)
        {
            return await _paymentsAllocationService.UpdateAllocation(allocation);
        }

        public async Task<List<RolePlayerBankingDetail>> GetBankingDetailsByRolePlayerIdCommon(int rolePlayerId)
        {
            return await _rolePlayerService.GetBankingDetailsByRolePlayerId(rolePlayerId);
        }

        public async Task<RolePlayerBankingDetail> GetBankingDetailsValidationsSTPIntegration(int rolePlayerId, int rolePlayerTypeId)
        {
            return await _rolePlayerService.GetBankingDetailsForSTPIntegration(rolePlayerId, rolePlayerTypeId);
        }

        public async Task<Company> GetCompanyByRolePlayerCommon(int rolePlayerId)
        {
            return await _rolePlayerService.GetCompanyByRolePlayer(rolePlayerId);
        }

        public async Task<RMA.Service.ClientCare.Contracts.Entities.RolePlayer.RolePlayer> GetRolePlayerCommon(int rolePlayerId)
        {
            return await _rolePlayerService.GetRolePlayer(rolePlayerId);
        }

        public async Task<InvoiceDetails> GetMedicalInvoiceFromCompCare(int invoiceId)
        {
            InvoiceDetails medicalInvoiceResult = new InvoiceDetails();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parametersInvoice = {
                    new SqlParameter("InvoiceId", invoiceId)
                };
                SqlParameter[] parametersInvoiceLines = {
                    new SqlParameter("InvoiceId", invoiceId)
                };

                var medicalInvoiceFromCompCare = await _invoiceRepository.SqlQueryAsync<InvoiceDetails>(
                  DatabaseConstants.GetCompCareMedicalInvoice, parametersInvoice);
                var medicalInvoiceLinesFromCompCare = await _invoiceRepository.SqlQueryAsync<InvoiceLine>(
                  DatabaseConstants.GetCompCareMedicalInvoiceLines, parametersInvoiceLines);
                if (medicalInvoiceFromCompCare?.Count > 0)
                {
                    medicalInvoiceFromCompCare[0].InvoiceLines = medicalInvoiceLinesFromCompCare;
                    medicalInvoiceResult = medicalInvoiceFromCompCare[0];
                }
            }
            return medicalInvoiceResult;
        }

        public async Task<CompCareMedicalReportResult> CheckMedicalReportFromCompCare(int compCarePersonEventId, int compCareHealthCareProviderId, DateTime dateAdmitted, int prevUnderAssessReasonID)
        {
            CompCareMedicalReportResult compCareMedicalReportResult = new CompCareMedicalReportResult();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("PersonEventID", compCarePersonEventId),
                    new SqlParameter("MedicalServiceProviderID", compCareHealthCareProviderId),
                    new SqlParameter("TreatmentDateFrom", dateAdmitted),
                    new SqlParameter("PrevUnderAssessReasonID", prevUnderAssessReasonID)
                };

                var result = await _invoiceRepository.SqlQueryAsync<CompCareMedicalReportResult>(
                  DatabaseConstants.CheckMedicalReportOnInvoiceCC, parameters);

                if (result?.Count > 0)
                {
                    compCareMedicalReportResult = result[0];
                }
            }

            return compCareMedicalReportResult;
        }

        public async Task<List<PreAuthorisation>> CheckIfPreAuthExistsCommon(MedicalPreAuthExistCheckParams medicalPreAuthExistCheckParams)
        {
            return await _preAuthInvoiceService.CheckIfPreAuthExists(medicalPreAuthExistCheckParams);
        }
        public async Task<List<TravelAuthorisation>> CheckIfTravelPreAuthExistsCommon(MedicalPreAuthExistCheckParams travelPreAuthExistCheckParams)
        {
            return await _travelAuthorisationService.CheckIfTravelPreAuthExists(travelPreAuthExistCheckParams);
        }

        public async Task<PagedRequestResult<InvoiceDetails>> SearchForInvoices(SearchInvoicePagedRequest searchInvoicePagedRequest)
        {
            if (searchInvoicePagedRequest == null)
                return new PagedRequestResult<InvoiceDetails>();

            RmaIdentity.DemandPermission(Permissions.ViewMedicalInvoice);

            var treatmentDateFrom = searchInvoicePagedRequest.TreatmentDateFrom ?? DateTime.MinValue;
            var treatmentDateTo = searchInvoicePagedRequest.TreatmentDateTo ?? DateTime.MinValue;
            var invoiceDate = searchInvoicePagedRequest.InvoiceDate ?? DateTime.MinValue;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (string.IsNullOrEmpty(searchInvoicePagedRequest.OrderBy))
                {
                    searchInvoicePagedRequest.OrderBy = "CreatedDate";
                }

                searchInvoicePagedRequest.PersonEventId = 0;

                SqlParameter[] parameters = {
                    new SqlParameter("PageIndex", searchInvoicePagedRequest.Page),
                    new SqlParameter("PageSize", searchInvoicePagedRequest.PageSize),
                    new SqlParameter("SortColumn", searchInvoicePagedRequest.OrderBy),
                    new SqlParameter("SortOrder", searchInvoicePagedRequest.IsAscending ? "ASC" : "DESC"),
                    new SqlParameter("ClaimReference", searchInvoicePagedRequest.ClaimReference.AsDbValue()),
                    new SqlParameter("AccountNumber", searchInvoicePagedRequest.AccountNumber.AsDbValue()),
                    new SqlParameter("InvoiceDate", searchInvoicePagedRequest.InvoiceDate.AsDbValue()),
                    new SqlParameter("InvoceStatus", searchInvoicePagedRequest.InvoiceStatusId),
                    new SqlParameter("SwitchBatchInvoiceStatus", searchInvoicePagedRequest.SwitchBatchInvoiceStatusId),
                    new SqlParameter("PracticeNumber", searchInvoicePagedRequest.PracticeNumber.AsDbValue()),
                    new SqlParameter("PractitionerType", searchInvoicePagedRequest.PractitionerTypeId),
                    new SqlParameter("SupplierInvoiceNumber", searchInvoicePagedRequest.SupplierInvoiceNumber.AsDbValue()),
                    new SqlParameter("TreatmentDateFrom", searchInvoicePagedRequest.TreatmentDateFrom.AsDbValue()),
                    new SqlParameter("TreatmentDateTo", searchInvoicePagedRequest.TreatmentDateTo.AsDbValue()),
                    new SqlParameter("RecordCount", SqlDbType.Int)
                };

                parameters[14].Direction = ParameterDirection.Output;

                var searchResult = await _invoiceRepository.SqlQueryAsync<InvoiceDetails>(DatabaseConstants.SearchForInvoices, parameters);
                var recordCount = (int)parameters[14].Value;

                return new PagedRequestResult<InvoiceDetails>()
                {
                    Page = searchInvoicePagedRequest.Page,
                    PageCount = searchResult.Count,
                    RowCount = recordCount,
                    PageSize = searchInvoicePagedRequest.PageSize,
                    Data = searchResult
                };
            }
        }

        public async Task<PagedRequestResult<InvoiceDetails>> GetPagedInvoiceDetailsByPersonEventId(int personEventId, PagedRequest request)
        {
            RmaIdentity.DemandPermission(Permissions.ViewMedicalInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var user = await _userService.GetUserByEmail(RmaIdentity.Email);
                var healthCareProviderIds = new List<int>();
                if (!user.IsInternalUser)
                {
                    var userHealthCareProviderDetails = await _userService.GetHealthCareProvidersLinkedToUser(RmaIdentity.Email);
                    healthCareProviderIds.AddRange(userHealthCareProviderDetails.Select(userHealthCareProvider => userHealthCareProvider.HealthCareProviderId));
                }

                var invoicesDetails = await (
                        from i in _invoiceRepository
                        join hcp in _healthCareProviderRepository on i.HealthCareProviderId equals hcp.RolePlayerId
                        join pt in _practitionerTypeRepository on hcp.ProviderTypeId equals pt.PractitionerTypeId
                        where i.PersonEventId == personEventId
                              && (user.IsInternalUser
                              || healthCareProviderIds.Any(healthCareProviderId => healthCareProviderId == i.HealthCareProviderId))
                        select new InvoiceDetails
                        {
                            InvoiceId = i.InvoiceId,
                            ClaimId = i.ClaimId,
                            PersonEventId = i.PersonEventId,
                            HealthCareProviderId = i.HealthCareProviderId,
                            HealthCareProviderName = hcp.Name,
                            HcpInvoiceNumber = i.HcpInvoiceNumber,
                            HcpAccountNumber = i.HcpAccountNumber,
                            InvoiceNumber = i.InvoiceNumber,
                            InvoiceDate = i.InvoiceDate,
                            DateSubmitted = i.DateSubmitted,
                            DateReceived = i.DateReceived,
                            DateAdmitted = i.DateAdmitted,
                            DateDischarged = i.DateDischarged,
                            InvoiceStatus = i.InvoiceStatus,
                            InvoiceAmount = i.InvoiceAmount,
                            InvoiceVat = i.InvoiceVat,
                            InvoiceTotalInclusive = i.InvoiceTotalInclusive,
                            AuthorisedAmount = i.AuthorisedAmount,
                            AuthorisedVat = i.AuthorisedVat,
                            AuthorisedTotalInclusive = i.AuthorisedTotalInclusive,
                            PayeeId = i.PayeeId,
                            PayeeName = string.Empty,
                            PayeeTypeId = i.PayeeTypeId,
                            UnderAssessedComments = i.UnderAssessedComments,
                            HoldingKey = i.HoldingKey,
                            IsPaymentDelay = i.IsPaymentDelay,
                            IsPreauthorised = i.IsPreauthorised,
                            PreAuthXml = i.PreAuthXml,
                            Comments = i.Comments,
                            PracticeNumber = hcp.PracticeNumber,
                            PractitionerTypeId = hcp.ProviderTypeId,
                            PractitionerTypeName = pt.Name,
                            IsVat = hcp.IsVat,
                            VatRegNumber = hcp.VatRegNumber,
                            GreaterThan731Days = false,
                            IsActive = i.IsActive,
                            CreatedBy = i.CreatedBy,
                            CreatedDate = i.CreatedDate,
                            ModifiedBy = i.ModifiedBy,
                            ModifiedDate = i.ModifiedDate
                        }).ToPagedResult(request);

                if (invoicesDetails != null)
                {
                    foreach (var item in invoicesDetails.Data)
                    {
                        item.InvoiceUnderAssessReasons = Mapper.Map<List<InvoiceUnderAssessReason>>(_invoiceUnderAssessReasonRepository.Where(x => x.InvoiceId == item.InvoiceId).ToList());

                        var payeeType = await _payeeTypeService.GetPayeeTypeById(item.PayeeTypeId);
                        item.PayeeType = payeeType.Name;

                        var invoiceLineRepository = _invoiceLineRepository.Select(i => i);
                        item.InvoiceLineDetails = await (
                                from i in _invoiceLineRepository
                                join t in _tariffRepository on i.TariffId equals t.TariffId
                                join mi in _medicalItemRepository on t.MedicalItemId equals mi.MedicalItemId
                                where i.InvoiceId == item.InvoiceId
                                select new InvoiceLineDetails
                                {
                                    InvoiceLineId = i.InvoiceLineId,
                                    InvoiceId = i.InvoiceId,
                                    ServiceDate = i.ServiceDate,
                                    ServiceTimeStart = i.ServiceTimeStart,
                                    ServiceTimeEnd = i.ServiceTimeEnd,
                                    RequestedQuantity = i.RequestedQuantity,
                                    AuthorisedQuantity = i.AuthorisedQuantity,
                                    RequestedAmount = i.RequestedAmount,
                                    RequestedVat = i.RequestedVat,
                                    RequestedAmountInclusive = i.RequestedAmountInclusive,
                                    AuthorisedAmount = i.AuthorisedAmount,
                                    AuthorisedVat = i.AuthorisedVat,
                                    AuthorisedAmountInclusive = i.AuthorisedAmountInclusive,
                                    TotalTariffAmount = i.TotalTariffAmount,
                                    TotalTariffVat = i.TotalTariffVat,
                                    TotalTariffAmountInclusive = i.TotalTariffAmountInclusive,
                                    TariffAmount = i.TariffAmount,
                                    CreditAmount = i.CreditAmount,
                                    VatCode = i.VatCode,
                                    VatPercentage = i.VatPercentage,
                                    TariffId = i.TariffId,
                                    TreatmentCodeId = i.TreatmentCodeId,
                                    MedicalItemId = i.MedicalItemId,
                                    HcpTariffCode = i.HcpTariffCode,
                                    TariffBaseUnitCostTypeId = i.TariffBaseUnitCostTypeId,
                                    Description = i.Description,
                                    SummaryInvoiceLineId = i.SummaryInvoiceLineId,
                                    IsPerDiemCharge = i.IsPerDiemCharge,
                                    IsDuplicate = i.IsDuplicate,
                                    DuplicateInvoiceLineId = i.DuplicateInvoiceLineId,
                                    CalculateOperands = i.CalculateOperands,
                                    Icd10Code = i.Icd10Code,
                                    TariffDescription = mi.Description,
                                    DefaultQuantity = mi.DefaultQuantity,
                                    IsActive = i.IsActive,
                                    CreatedBy = i.CreatedBy,
                                    CreatedDate = i.CreatedDate,
                                    ModifiedBy = i.ModifiedBy,
                                    ModifiedDate = i.ModifiedDate,
                                    IsModifier = i.IsModifier
                                }).ToListAsync();

                        if (item.InvoiceLineDetails != null && item.InvoiceLineDetails.Count > 0)
                        {
                            foreach (var invoiceLine in item.InvoiceLineDetails)
                                invoiceLine.InvoiceLineUnderAssessReasons = Mapper.Map<List<InvoiceLineUnderAssessReason>>(_invoiceLineUnderAssessReasonRepository.Where(x => x.InvoiceLineId == invoiceLine.InvoiceLineId).ToList());
                        }

                        if (item.PersonEventId > 0)
                        {
                            var claims = await _claimService.GetClaimsByPersonEventId((int)item.PersonEventId);
                            if (claims.Count > 0)
                                item.ClaimReferenceNumber = claims[0].ClaimReferenceNumber;
                        }

                        item.MedicalInvoicePreAuths = await GetMappedInvoicePreAuthDetails(item.InvoiceId);

                        if (item.InvoiceStatus == InvoiceStatusEnum.Paid)
                        {
                            var paymentAlocationDetails = await _paymentsAllocationService.GetAllocationsByMedicalInvoiceId(item.InvoiceId, PaymentTypeEnum.MedicalInvoice);
                            var paymentDetails = await _paymentsAllocationService.GetPaymentByAllocationId(paymentAlocationDetails.AllocationId);
                            if (paymentDetails != null)
                                item.PaymentConfirmationDate = paymentDetails.PaymentConfirmationDate;
                        }
                    }
                }
                if (invoicesDetails?.Data.Count > 0)
                {
                    return new PagedRequestResult<InvoiceDetails>
                    {
                        Page = invoicesDetails.Page,
                        PageCount = invoicesDetails.PageCount,
                        RowCount = invoicesDetails.RowCount,
                        PageSize = invoicesDetails.PageSize,
                        Data = invoicesDetails.Data
                    };
                }

                return new PagedRequestResult<InvoiceDetails>();
            }
        }

        public async Task<bool> IsModifier(string modifierCode)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var medicalItem = await _medicalItemRepository.Where(x => x.ItemCode == modifierCode && x.MedicalItemTypeId == MediCareConstants.MODIFIER_MEDICAL_ITEM_TYPE).FirstOrDefaultAsync();
                var modifier = await _modifierRepository.Where(x => x.Code == modifierCode && x.IsActive == true).FirstOrDefaultAsync();

                if (medicalItem != null && modifier != null && medicalItem?.MedicalItemId > 0)
                    return true;
                else
                    return false;
            }
        }

        public async Task<Modifier> GetModifier(string modifierCode)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var medicalItem = await _medicalItemRepository.Where(x => x.ItemCode == modifierCode && x.MedicalItemTypeId == MediCareConstants.MODIFIER_MEDICAL_ITEM_TYPE).FirstOrDefaultAsync();
                var modifier = await _modifierRepository.Where(x => x.Code == modifierCode && x.IsActive == true).FirstOrDefaultAsync();

                if (medicalItem != null && modifier != null && medicalItem?.MedicalItemId > 0)
                    return new Modifier()
                    {
                        Code = modifier.Code,
                        Description = medicalItem.Description,
                        IsModifier = true
                    };
                else
                    return new Modifier();
            }
        }

        public async Task<ModifierOutput> CalculateModifier(ModifierInput modifierInput)
        {
            Contract.Requires(modifierInput != null);
            ModifierOutput modifierOutput = new ModifierOutput();
            modifierOutput.ModifierCode = modifierInput.ModifierCode;
            modifierOutput.ModifierServiceDate = modifierInput.ModifierServiceDate;
            var modifierMedicalInvoiceIsDentalRuleResult = new RuleRequestResult();
            var modifierMedicalInvoiceIsMaxilloRuleResult = new RuleRequestResult();

            List<InvoiceLineDetails> invoiceLines = new List<InvoiceLineDetails>();
            if (modifierInput != null)
            {
                if (modifierInput.ModifierServiceDate == modifierInput.TariffServiceDate)
                {
                    invoiceLines = modifierInput?.PreviousInvoiceLines;
                    string modifierCode = modifierInput.ModifierCode;

                    if (modifierInput.TariffBaseUnitCostTypeId == 0)
                    {
                        if (modifierInput.PreviousInvoiceLine != null && modifierInput.PreviousInvoiceLine.TariffBaseUnitCostTypeId != null)
                        {
                            modifierInput.TariffBaseUnitCostTypeId = Convert.ToInt32(modifierInput.PreviousInvoiceLine.TariffBaseUnitCostTypeId);
                        }

                        if (modifierCode == "0023" || modifierCode == "0036" || modifierCode == "0039")
                            modifierInput.TariffBaseUnitCostTypeId = (int)MediCareConstants.ANAESTHETIC;
                        else if (modifierCode == "0011" || modifierCode == "0075")
                            modifierInput.TariffBaseUnitCostTypeId = (int)MediCareConstants.CLINICAL_PROCEDURES;
                    }

                    ModifierTariff modifierTariff = new ModifierTariff();

                    if ((modifierCode == MediCareConstants.MODIFIER_8001_CODE || modifierCode == MediCareConstants.MODIFIER_8007_CODE 
                        || modifierCode == MediCareConstants.MODIFIER_8002_CODE || modifierCode == MediCareConstants.MODIFIER_8006_CODE
                        || modifierCode == MediCareConstants.MODIFIER_8009_CODE || modifierCode == MediCareConstants.MODIFIER_8005_CODE
                        || modifierCode == MediCareConstants.MODIFIER_8008_CODE || modifierCode == MediCareConstants.MODIFIER_8010_CODE)
                        && modifierInput.PractitionerTypeId == 0)
                    {
                        var healthCareProvider = await GetHealthCareProviderByIdCommon(modifierInput.HealthCareProviderId);
                        if (healthCareProvider != null)
                        {
                            modifierInput.PractitionerTypeId = healthCareProvider.ProviderTypeId;
                        }
                    }

                    var validatieModifierResult = await ValidateModifier(modifierInput);
                    if (validatieModifierResult != null)
                    {
                        decimal previousTariffTotalAmount = 0.0M;

                        switch (modifierCode)
                        {
                            case "0005":
                                if (validatieModifierResult.PublicationId == MediCareConstants.P01)
                                {
                                    modifierOutput = await ModifierCalculation.CalculateModifier0005(modifierInput);
                                }
                                break;
                            case "0009":
                                foreach (var validInvoiceLine in invoiceLines)
                                {
                                    //Sum of TariffAmount for P01 invoice lines
                                    //var validatieModifierResult = await ValidateModifier(modifierInput);
                                    if (validatieModifierResult.PublicationId == MediCareConstants.P01)
                                    {
                                        previousTariffTotalAmount += Convert.ToDecimal(validInvoiceLine.TotalTariffAmount);
                                    }
                                }
                                if (validatieModifierResult.PublicationId == MediCareConstants.P01)
                                {
                                    modifierInput.UnitPrice = await UnitPrice(modifierInput);
                                    modifierInput.PreviousLinesTotalAmount = previousTariffTotalAmount;
                                    modifierOutput = await ModifierCalculation.CalculateModifier0009(modifierInput);
                                }
                                break;
                            case "0023":
                                if (validatieModifierResult.PublicationId == MediCareConstants.P01)
                                {
                                    modifierInput.UnitPrice = await UnitPrice(modifierInput);
                                    modifierOutput = await ModifierCalculation.CalculateModifier0023(modifierInput);
                                }
                                break;
                            case "0036":
                                if (modifierInput.PractitionerTypeId == 0)
                                {
                                    var healthCareProvider = await GetHealthCareProviderByIdCommon(modifierInput.HealthCareProviderId);
                                    if (healthCareProvider != null)
                                    {
                                        modifierInput.PractitionerTypeId = healthCareProvider.ProviderTypeId;
                                    }
                                }
                                if (validatieModifierResult.PublicationId == MediCareConstants.P01)
                                {
                                    modifierInput.UnitPrice = await GetUnitPrice(modifierInput);
                                    modifierOutput = await ModifierCalculation.CalculateModifier0036(modifierInput);
                                }
                                break;
                            case "0011":
                                if (modifierInput.PractitionerTypeId == 0)
                                {
                                    var healthCareProvider = await GetHealthCareProviderByIdCommon(modifierInput.HealthCareProviderId);
                                    if (healthCareProvider != null)
                                    {
                                        modifierInput.PractitionerTypeId = healthCareProvider.ProviderTypeId;
                                    }
                                }
                                if (validatieModifierResult.PublicationId == MediCareConstants.P01)
                                {
                                    modifierInput.UnitPrice = await GetUnitPrice(modifierInput);
                                    modifierOutput = await ModifierCalculation.CalculateModifier0011(modifierInput);
                                }
                                break;
                            case "0006":
                                modifierInput.PublicationId = Convert.ToInt32(validatieModifierResult.PublicationId);
                                if (modifierInput != null && modifierInput.PreviousInvoiceLine != null)
                                {
                                    modifierInput.TariffBaseUnitCostTypeId = Convert.ToInt32(modifierInput.PreviousInvoiceLine.TariffBaseUnitCostTypeId);
                                }
                                modifierOutput = await ModifierCalculation.CalculateModifier0006(modifierInput);
                                break;
                            case "0018":
                                modifierInput.PublicationId = Convert.ToInt32(validatieModifierResult.PublicationId);
                                if(modifierInput.PractitionerTypeId == 0)
                                {
                                    var healthCareProvider = await GetHealthCareProviderByIdCommon(modifierInput.HealthCareProviderId);
                                    if(healthCareProvider!=null)
                                    {
                                        modifierInput.PractitionerTypeId = healthCareProvider.ProviderTypeId;
                                    }
                                }
                                modifierOutput = await ModifierCalculation.CalculateModifier0018(modifierInput);
                                break;
                            case "0084":
                                modifierInput.PublicationId = Convert.ToInt32(validatieModifierResult.PublicationId);
                                var modifierTariffPrice = await GetPriceForTariff(modifierInput.ModifierCode, modifierInput.TariffCode);
                                if (modifierTariffPrice != null)
                                {
                                    modifierInput.UnitPrice = Convert.ToDecimal(modifierTariffPrice.Price);
                                }
                                modifierOutput = await ModifierCalculation.CalculateModifier0084(modifierInput);
                                break;
                            case "0008":
                                foreach (var validInvoiceLine in invoiceLines)
                                {
                                    if (validatieModifierResult.PublicationId == MediCareConstants.P01)
                                    {
                                        previousTariffTotalAmount += Convert.ToDecimal(validInvoiceLine.TotalTariffAmount);
                                    }
                                }
                                if (validatieModifierResult.PublicationId == MediCareConstants.P01)
                                {
                                    modifierInput.PreviousLinesTotalAmount = previousTariffTotalAmount;
                                }
                                modifierInput.PublicationId = Convert.ToInt32(validatieModifierResult.PublicationId);
                                modifierOutput = await ModifierCalculation.CalculateModifier0008(modifierInput);
                                break;
                            case "0039":
                                modifierInput.PublicationId = Convert.ToInt32(validatieModifierResult.PublicationId);
                                modifierInput.UnitPrice = await UnitPrice(modifierInput);
                                modifierOutput = await ModifierCalculation.CalculateModifier0039(modifierInput);
                                break;
                            case "0001":
                                modifierInput.PublicationId = Convert.ToInt32(validatieModifierResult.PublicationId);
                                int sectionId = Convert.ToInt32(validatieModifierResult.SectionId);
                                if (sectionId > 0)
                                {
                                    var section = await _sectionRepository.Where(s => s.SectionId == sectionId).FirstOrDefaultAsync();
                                    if (section != null)
                                    {
                                        modifierInput.SectionNo = section.SectionNo;
                                    }
                                }
                                modifierInput.UnitPrice = await UnitPrice(modifierInput);
                                modifierOutput = await ModifierCalculation.CalculateModifier0001(modifierInput);
                                break;
                            case "0075":
                                modifierInput.PublicationId = Convert.ToInt32(validatieModifierResult.PublicationId);
                                modifierInput.UnitPrice = await UnitPrice(modifierInput);
                                modifierInput.RecommendedUnits = await GetModifierRecommendedUnits(modifierInput);
                                modifierOutput = await ModifierCalculation.CalculateModifier0075(modifierInput);
                                break;
                            case "0035":
                                if (modifierInput.PractitionerTypeId == 0)
                                {
                                    var healthCareProvider = await GetHealthCareProviderByIdCommon(modifierInput.HealthCareProviderId);
                                    if (healthCareProvider != null)
                                    {
                                        modifierInput.PractitionerTypeId = healthCareProvider.ProviderTypeId;
                                    }
                                }
                                if (validatieModifierResult.PublicationId == MediCareConstants.P01)
                                {
                                    modifierInput.UnitPrice = await GetUnitPrice(modifierInput);
                                    modifierOutput = await ModifierCalculation.CalculateModifier0035(modifierInput);
                                }
                                break;
                            case "6100":
                                modifierInput.PublicationId = Convert.ToInt32(validatieModifierResult.PublicationId);
                                modifierOutput = await ModifierCalculation.CalculateModifier6100(modifierInput);
                                break;
                            case "6101":
                                modifierInput.PublicationId = Convert.ToInt32(validatieModifierResult.PublicationId);
                                modifierOutput = await ModifierCalculation.CalculateModifier6101(modifierInput);
                                break;
                            case "6102":
                                modifierInput.PublicationId = Convert.ToInt32(validatieModifierResult.PublicationId);
                                modifierOutput = await ModifierCalculation.CalculateModifier6102(modifierInput);
                                break;
                            case "8001":
                                if (modifierInput.PractitionerTypeId > 0 && validatieModifierResult.PublicationId == MediCareConstants.Publication02)
                                {
                                    modifierInput.PublicationId = Convert.ToInt32(validatieModifierResult.PublicationId);
                                    modifierOutput = await ModifierCalculation.CalculateModifier8001(modifierInput);
                                }
                                break;
                            case "8007":
                                if (modifierInput.PractitionerTypeId > 0 && validatieModifierResult.PublicationId == MediCareConstants.Publication02)
                                {
                                    modifierInput.PublicationId = Convert.ToInt32(validatieModifierResult.PublicationId);

                                    bool isDentalType = await CheckForDentalType(modifierInput.PractitionerTypeId);
                                    var ruleDentalData = "{\"IsDentalLineModifier\": \"" + isDentalType + "\"}";
                                    var ruleDentalRequest = new RuleRequest()
                                    {
                                        Data = ruleDentalData,
                                        RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.Modifier.Constants.ModifierDentalRuleName },
                                        ExecutionFilter = "medical"
                                    };

                                    modifierMedicalInvoiceIsDentalRuleResult = await _rulesEngine.ExecuteRules(ruleDentalRequest);

                                    bool isMaxilloType = await CheckForMaxilloType(modifierInput.PractitionerTypeId);
                                    var ruleMaxilloData = "{\"IsMaxilloLineModifier\": \"" + isMaxilloType + "\"}";
                                    var ruleMaxilloRequest = new RuleRequest()
                                    {
                                        Data = ruleMaxilloData,
                                        RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.Modifier.Constants.ModifierMaxilloRuleName },
                                        ExecutionFilter = "medical"
                                    };

                                    modifierMedicalInvoiceIsMaxilloRuleResult = await _rulesEngine.ExecuteRules(ruleMaxilloRequest);

                                    if ((modifierMedicalInvoiceIsDentalRuleResult != null && modifierMedicalInvoiceIsDentalRuleResult.OverallSuccess) ||
                                        (modifierMedicalInvoiceIsMaxilloRuleResult != null && modifierMedicalInvoiceIsMaxilloRuleResult.OverallSuccess))
                                    {
                                        modifierOutput = await ModifierCalculation.CalculateModifier8007(modifierInput);
                                    }
                                }
                                break;
                            case "8002":
                                if (modifierInput.PractitionerTypeId > 0 && validatieModifierResult.PublicationId == MediCareConstants.Publication02)
                                {
                                    modifierInput.PublicationId = Convert.ToInt32(validatieModifierResult.PublicationId);
                                    modifierOutput = await ModifierCalculation.CalculateModifier8002(modifierInput);
                                }
                                break;
                            case "8006":
                                if (modifierInput.PractitionerTypeId > 0 && validatieModifierResult.PublicationId == MediCareConstants.Publication02)
                                {
                                    modifierInput.PublicationId = Convert.ToInt32(validatieModifierResult.PublicationId);
                                    bool isMaxilloType = await CheckForMaxilloType(modifierInput.PractitionerTypeId);
                                    var ruleData = "{\"IsMaxilloLineModifier\": \"" + isMaxilloType + "\"}";
                                    var ruleRequest = new RuleRequest()
                                    {
                                        Data = ruleData,
                                        RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.Modifier.Constants.ModifierMaxilloRuleName },
                                        ExecutionFilter = "medical"
                                    };

                                    modifierMedicalInvoiceIsMaxilloRuleResult = await _rulesEngine.ExecuteRules(ruleRequest);

                                    if (modifierMedicalInvoiceIsMaxilloRuleResult != null && modifierMedicalInvoiceIsMaxilloRuleResult.OverallSuccess)
                                    {
                                        modifierOutput = await ModifierCalculation.CalculateModifier8006(modifierInput);
                                    }
                                }
                                break;
                                case "8009":
                                if (modifierInput.PractitionerTypeId > 0 && validatieModifierResult.PublicationId == MediCareConstants.Publication02)
                                {
                                    modifierInput.PublicationId = Convert.ToInt32(validatieModifierResult.PublicationId);
                                    bool isMaxilloType = await CheckForMaxilloType(modifierInput.PractitionerTypeId);
                                    var ruleData = "{\"IsMaxilloLineModifier\": \"" + isMaxilloType + "\"}";
                                    var ruleRequest = new RuleRequest()
                                    {
                                        Data = ruleData,
                                        RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.Modifier.Constants.ModifierMaxilloRuleName },
                                        ExecutionFilter = "medical"
                                    };

                                    modifierMedicalInvoiceIsMaxilloRuleResult = await _rulesEngine.ExecuteRules(ruleRequest);

                                    if (modifierMedicalInvoiceIsMaxilloRuleResult != null && modifierMedicalInvoiceIsMaxilloRuleResult.OverallSuccess)
                                    {
                                        modifierOutput = await ModifierCalculation.CalculateModifier8009(modifierInput);
                                    }
                                }
                                break;
                            case "8005":
                                if (modifierInput.PractitionerTypeId > 0 && validatieModifierResult.PublicationId == MediCareConstants.Publication02)
                                {
                                    modifierInput.PublicationId = Convert.ToInt32(validatieModifierResult.PublicationId);
                                    bool isMaxilloType = await CheckForMaxilloType(modifierInput.PractitionerTypeId);
                                    var ruleData = "{\"IsMaxilloLineModifier\": \"" + isMaxilloType + "\"}";
                                    var ruleRequest = new RuleRequest()
                                    {
                                        Data = ruleData,
                                        RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.Modifier.Constants.ModifierMaxilloRuleName },
                                        ExecutionFilter = "medical"
                                    };

                                    modifierMedicalInvoiceIsMaxilloRuleResult = await _rulesEngine.ExecuteRules(ruleRequest);

                                    if (modifierMedicalInvoiceIsMaxilloRuleResult != null && modifierMedicalInvoiceIsMaxilloRuleResult.OverallSuccess)
                                    {
                                        modifierOutput = await ModifierCalculation.CalculateModifier8005(modifierInput);
                                    }
                                }
                                break;
                            case "8010":
                                if (modifierInput.PractitionerTypeId > 0 && validatieModifierResult.PublicationId == MediCareConstants.Publication02)
                                {
                                    modifierInput.PublicationId = Convert.ToInt32(validatieModifierResult.PublicationId);
                                    bool isMaxilloType = await CheckForMaxilloType(modifierInput.PractitionerTypeId);
                                    var ruleData = "{\"IsMaxilloLineModifier\": \"" + isMaxilloType + "\"}";
                                    var ruleRequest = new RuleRequest()
                                    {
                                        Data = ruleData,
                                        RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.Modifier.Constants.ModifierMaxilloRuleName },
                                        ExecutionFilter = "medical"
                                    };

                                    modifierMedicalInvoiceIsMaxilloRuleResult = await _rulesEngine.ExecuteRules(ruleRequest);

                                    if (modifierMedicalInvoiceIsMaxilloRuleResult != null && modifierMedicalInvoiceIsMaxilloRuleResult.OverallSuccess)
                                    {
                                        modifierInput.ReductionCodes = await GetReductionCodes(modifierCode, modifierInput.ModifierServiceDate);
                                        modifierOutput = await ModifierCalculation.CalculateModifier8010(modifierInput);
                                    }
                                }
                                break;
                            case "8008":
                                if (modifierInput.PractitionerTypeId > 0 && validatieModifierResult.PublicationId == MediCareConstants.Publication02)
                                {
                                    modifierInput.PublicationId = Convert.ToInt32(validatieModifierResult.PublicationId);

                                    bool isDentalType = await CheckForDentalType(modifierInput.PractitionerTypeId);
                                    var ruleDentalData = "{\"IsDentalLineModifier\": \"" + isDentalType + "\"}";
                                    var ruleDentalRequest = new RuleRequest()
                                    {
                                        Data = ruleDentalData,
                                        RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.Modifier.Constants.ModifierDentalRuleName },
                                        ExecutionFilter = "medical"
                                    };

                                    modifierMedicalInvoiceIsDentalRuleResult = await _rulesEngine.ExecuteRules(ruleDentalRequest);

                                    bool isMaxilloType = await CheckForMaxilloType(modifierInput.PractitionerTypeId);
                                    var ruleMaxilloData = "{\"IsMaxilloLineModifier\": \"" + isMaxilloType + "\"}";
                                    var ruleMaxilloRequest = new RuleRequest()
                                    {
                                        Data = ruleMaxilloData,
                                        RuleNames = new List<string>() { RuleTasks.MedicalInvoiceRules.Modifier.Constants.ModifierMaxilloRuleName },
                                        ExecutionFilter = "medical"
                                    };

                                    modifierMedicalInvoiceIsMaxilloRuleResult = await _rulesEngine.ExecuteRules(ruleMaxilloRequest);

                                    if ((modifierMedicalInvoiceIsDentalRuleResult != null && modifierMedicalInvoiceIsDentalRuleResult.OverallSuccess) ||
                                        (modifierMedicalInvoiceIsMaxilloRuleResult != null && modifierMedicalInvoiceIsMaxilloRuleResult.OverallSuccess))
                                    {
                                        modifierOutput = await ModifierCalculation.CalculateModifier8008(modifierInput);
                                    }
                                }
                                break;
                            default:
                                modifierOutput = await ModifierCalculation.DefaultCalculationModifier();
                                break;
                        }
                    }
                    else
                    {
                        //Modifier not applicable on previous line tariff
                        modifierOutput = await ModifierCalculation.DefaultCalculationModifier();
                    }
                }
                else
                {
                    //Modifier service date not matching with previous line tariff service date
                    modifierOutput = await ModifierCalculation.DefaultCalculationModifier();
                }
            }
            return modifierOutput;
        }

        public async Task<ModifierTariff> ValidateModifier(ModifierInput modifierInput)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                int sectionId = 0;
                int publicationId = 0;

                var healthCareProvider = await _healthCareProviderRepository.Where(h => h.RolePlayerId == modifierInput.HealthCareProviderId).FirstOrDefaultAsync();
                if (healthCareProvider != null && healthCareProvider.RolePlayerId > 0)
                {
                    var tariff = await _tariffRepository.Where(t => t.ItemCode == modifierInput.TariffCode && (int)t.PractitionerType == healthCareProvider.ProviderTypeId && t.ValidFrom <= modifierInput.TariffServiceDate && t.ValidTo >= modifierInput.TariffServiceDate).FirstOrDefaultAsync();
                    if (tariff != null && tariff.TariffBaseUnitCostId > 0)
                    {
                        sectionId = tariff.SectionId;
                        var tariffBaseUnitCost = await _tariffBaseUnitCostRepository.Where(tb => tb.TariffBaseUnitCostId == tariff.TariffBaseUnitCostId).FirstOrDefaultAsync();
                        if (tariff != null && tariff.TariffBaseUnitCostId > 0)
                        {
                            publicationId = tariffBaseUnitCost.PublicationId;
                        }
                    }
                }

                var modifierTariffExcluded = await _modifierTariffRepository.Where(m => m.ModifierCode == modifierInput.ModifierCode && m.TariffCode == modifierInput.TariffCode && m.PublicationId == publicationId && m.SectionId == sectionId && m.IsActive == true && m.IsExcludeTariff == 1).FirstOrDefaultAsync();
                if (modifierTariffExcluded == null)
                {
                    var modifierTariff = await _modifierTariffRepository.Where(m => m.ModifierCode == modifierInput.ModifierCode && m.PublicationId == publicationId && m.SectionId == sectionId && m.IsActive == true).FirstOrDefaultAsync();

                    return Mapper.Map<ModifierTariff>(modifierTariff);
                }

                return new ModifierTariff();
            }
        }

        public async Task<ModifierTariff> GetPriceForTariff(string modifierCode, string tariffCode)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var modifierTariff = await _modifierTariffRepository.Where(m => m.ModifierCode == modifierCode && m.TariffCode == tariffCode && m.IsActive == true).FirstOrDefaultAsync();
                return Mapper.Map<ModifierTariff>(modifierTariff);
            }
        }

        public async Task<List<string>> GetReductionCodes(string modifierCode, DateTime serviceDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var modifier = await _modifierRepository.Where(m => m.Code == modifierCode && m.IsActive == true).FirstOrDefaultAsync();
                if(modifier != null && modifier.Id > 0)
                {
                    return await _reductionCodeRepository.Where(r => r.ModifierId == modifier.Id & r.ValidFrom <= serviceDate && r.ValidTo >= serviceDate).Select(r => r.ReductionCode).ToListAsync<string>();
                }
                return new List<string>();
            }
        }

        public async Task<decimal> UnitPrice(ModifierInput modifierInput)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                decimal unitPrice = 0.00M;
                var healthCareProvider = await _healthCareProviderRepository.Where(h => h.RolePlayerId == modifierInput.HealthCareProviderId).FirstOrDefaultAsync();
                if (healthCareProvider != null && healthCareProvider.RolePlayerId > 0)
                {
                    var tariff = await _tariffRepository.Where(t => t.ItemCode == modifierInput.TariffCode
                                        && t.TariffTypeId == modifierInput.TariffTypeId && (int)t.PractitionerType == healthCareProvider.ProviderTypeId
                                        && t.ValidFrom <= modifierInput.TariffServiceDate && t.ValidTo >= modifierInput.TariffServiceDate).FirstOrDefaultAsync();
                    if (tariff != null && tariff.TariffBaseUnitCostId > 0)
                    {
                        var tariffBaseUnitCost = await _tariffBaseUnitCostRepository.Where(tb => tb.TariffBaseUnitCostId == tariff.TariffBaseUnitCostId).FirstOrDefaultAsync();
                        var tariffBaseGazettedUnitCost = await _tariffBaseGazettedUnitCost.Where(bg => bg.TariffBaseUnitCostId == tariff.TariffBaseUnitCostId 
                            && bg.EffectiveFrom <= modifierInput.TariffServiceDate 
                            && (bg.EffectiveTo ?? DateTime.MaxValue) >= modifierInput.TariffServiceDate).OrderByDescending(bg => bg.EffectiveFrom).FirstOrDefaultAsync();
                        //use Gazette value if exists value
                        if (tariffBaseGazettedUnitCost != null)
                        {
                            unitPrice = tariffBaseUnitCost.UnitPrice;
                        }
                        else if (tariffBaseUnitCost != null)
                        {
                            unitPrice = tariffBaseUnitCost.UnitPrice;
                        }
                    }
                }

                return unitPrice;
            }
        }

        public async Task<decimal> GetUnitPrice(ModifierInput modifierInput)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                decimal unitPrice = 0.00M;
                var healthCareProvider = await _healthCareProviderRepository.Where(h => h.RolePlayerId == modifierInput.HealthCareProviderId).FirstOrDefaultAsync();
                if (healthCareProvider != null && healthCareProvider.RolePlayerId > 0)
                {
                    var tariff = await _tariffRepository.Where(t => t.ItemCode == modifierInput.ModifierCode
                                        && t.TariffTypeId == modifierInput.TariffTypeId && (int)t.PractitionerType == healthCareProvider.ProviderTypeId
                                        && t.ValidFrom <= modifierInput.TariffServiceDate && t.ValidTo >= modifierInput.TariffServiceDate).FirstOrDefaultAsync();
                    if (tariff != null && tariff.TariffBaseUnitCostId > 0)
                    {
                        var tariffBaseUnitCost = await _tariffBaseUnitCostRepository.Where(tb => tb.TariffBaseUnitCostId == tariff.TariffBaseUnitCostId).FirstOrDefaultAsync();
                        var tariffBaseGazettedUnitCost = await _tariffBaseGazettedUnitCost.Where(bg => bg.TariffBaseUnitCostId == tariff.TariffBaseUnitCostId
                            && bg.EffectiveFrom <= modifierInput.TariffServiceDate
                            && (bg.EffectiveTo ?? DateTime.MaxValue) >= modifierInput.TariffServiceDate).OrderByDescending(bg => bg.EffectiveFrom).FirstOrDefaultAsync();
                        //use Gazette value if exists value
                        if (tariffBaseGazettedUnitCost != null)
                        {
                            unitPrice = tariffBaseUnitCost.UnitPrice;
                        }
                        else if (tariffBaseUnitCost != null)
                        {
                            unitPrice = tariffBaseUnitCost.UnitPrice;
                        }
                    }
                }

                return unitPrice;
            }
        }

        public async Task<decimal> GetRecommendedUnits(ModifierInput modifierInput)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                decimal recommendedUnits = 0;
                var healthCareProvider = await _healthCareProviderRepository.Where(h => h.RolePlayerId == modifierInput.HealthCareProviderId).FirstOrDefaultAsync();
                if (healthCareProvider != null && healthCareProvider.RolePlayerId > 0)
                {
                    var tariff = await _tariffRepository.Where(t => t.ItemCode == modifierInput.TariffCode
                                        && t.TariffTypeId == modifierInput.TariffTypeId && (int)t.PractitionerType == healthCareProvider.ProviderTypeId
                                        && t.ValidFrom <= modifierInput.TariffServiceDate && t.ValidTo >= modifierInput.TariffServiceDate).FirstOrDefaultAsync();
                    if (tariff != null)
                    {
                        recommendedUnits = tariff.RecommendedUnits;
                    }
                }

                return recommendedUnits;
            }
        }

        public async Task<decimal> GetModifierRecommendedUnits(ModifierInput modifierInput)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                decimal recommendedUnits = 0;
                var healthCareProvider = await _healthCareProviderRepository.Where(h => h.RolePlayerId == modifierInput.HealthCareProviderId).FirstOrDefaultAsync();
                if (healthCareProvider != null && healthCareProvider.RolePlayerId > 0)
                {
                    var tariff = await _tariffRepository.Where(t => t.ItemCode == modifierInput.ModifierCode
                                        && t.TariffTypeId == modifierInput.TariffTypeId && (int)t.PractitionerType == healthCareProvider.ProviderTypeId
                                        && t.ValidFrom <= modifierInput.TariffServiceDate && t.ValidTo >= modifierInput.TariffServiceDate).FirstOrDefaultAsync();
                    if (tariff != null)
                    {
                        recommendedUnits = tariff.RecommendedUnits;
                    }
                }

                return recommendedUnits;
            }
        }

        public async Task<bool> CheckForDentalType(int practitionerTypeId)
        {
            return (practitionerTypeId == MediCareConstants.DENTAL_PRACTICE);
        }

        public async Task<bool> CheckForMaxilloType(int practitionerTypeId)
        {
            return (practitionerTypeId == MediCareConstants.MAXILLO_FACIAL_PRACTICE);
        }

        protected bool ValidateServiceDates(DateTime modifierServiceDate, DateTime lineItemServiceDate)
        {
            return modifierServiceDate == lineItemServiceDate;
        }

        protected static string FormatNumber(decimal sourceDecimal, short DecimalPlaces = 2)
        {
            return Math.Round(sourceDecimal, DecimalPlaces).ToString();
        }

        protected static int CalculateTimeUnits(TimeSpan? startTime, TimeSpan? endTime, decimal? lineQuantity)
        {
            int timeUnits = 0;
            if (startTime != null && endTime != null)
            {
                var timeDifference = (TimeSpan)(endTime - startTime);
                timeUnits = Convert.ToInt32(Math.Ceiling(timeDifference.TotalMinutes));
                if (timeUnits == 0)
                    int.TryParse(Convert.ToString(lineQuantity), out timeUnits);
            }
            else
            {
                int.TryParse(Convert.ToString(lineQuantity), out timeUnits);
            }

            return timeUnits;
        }


        public async Task<TebaTariff> GetTebaTariff(TebaTariffCodeTypeEnum? tebaTariffCodeTypeEnum, DateTime serviceDate)
        {
            if (tebaTariffCodeTypeEnum == null) return new TebaTariff();
            var serviceDatePassed = (serviceDate != null) ? serviceDate : DateTimeHelper.SaNow;
            int tariffCodeValue = (int)tebaTariffCodeTypeEnum;
            string tariffCodeValueString = tariffCodeValue.ToString();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _tebaTariffRepository.FirstOrDefaultAsync(i =>
                i.TariffCode == tariffCodeValueString
                && (serviceDatePassed >= i.ValidFrom && serviceDatePassed <= i.ValidTo));

                return Mapper.Map<TebaTariff>(entity);
            }
        }

        public async Task<List<TebaTariff>> GetTebaTariffs(List<TebaTariff> tariffSearches)
        {
            if (tariffSearches == null || tariffSearches.Count == 0) return new List<TebaTariff>();
            var results = new List<TebaTariff>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                foreach (var item in tariffSearches)
                {
                    var serviceDatePassed = (item.ValidFrom != null) ? item.ValidFrom : DateTimeHelper.SaNow;
                    TebaTariffCodeTypeEnum? TebaTariffCodeValue = null;
                    if (Enum.TryParse(item.TariffCode, true, out TebaTariffCodeTypeEnum TebaTariffCodeValueEnum))
                    {
                        TebaTariffCodeValue = TebaTariffCodeValueEnum;
                    }

                    var tebaTarifResult = await GetTebaTariff(TebaTariffCodeValue, serviceDatePassed);

                    results.Add(Mapper.Map<TebaTariff>(tebaTarifResult));
                }

                return results;
            }
        }

    }
}

