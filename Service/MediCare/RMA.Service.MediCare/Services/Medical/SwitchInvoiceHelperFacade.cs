using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Entities.Teba;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Entities;
using RMA.Service.MediCare.RuleTasks;
using RMA.Service.MediCare.Utils;

using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using ClaimValidationRules = RMA.Service.MediCare.RuleTasks.ClaimValidationRules;
using IICD10CodeService = RMA.Service.MediCare.Contracts.Interfaces.Medical.IICD10CodeService;
using MediCareHealthcareProviderRuleTask = RMA.Service.MediCare.RuleTasks.HealthcareProviderCheckRules;
using MediCareRuleTask = RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules;
using RuleRequest = RMA.Service.Admin.RulesManager.Contracts.Entities.RuleRequest;
using TravelAuthorisation = RMA.Service.MediCare.Contracts.Entities.Medical.TravelAuthorisation;

namespace RMA.Service.MediCare.Services.Medical
{
    public class SwitchInvoiceHelperFacade : RemotingStatelessService, ISwitchInvoiceHelperService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IHealthCareProviderService _healthCareProviderService;
        private readonly IRuleEngineService _rulesEngine;
        private readonly IInvoiceCommonService _invoiceCommonService;
        private readonly ISwitchBatchInvoiceUnderAssessReasonService _switchBatchInvoiceUnderAssessReasonService;
        private readonly ISwitchBatchInvoiceLineUnderAssessReasonService _switchBatchInvoiceLineUnderAssessReasonService;
        private readonly IMediCareService _mediCareService;
        private readonly ISerializerService _serializer;
        private readonly IMedicalItemFacadeService _medicalItemFacadeService;
        private readonly IClaimService _claimService;
        private readonly IEventService _eventService;
        private readonly IPreAuthHelperService _preAuthHelperService;
        private readonly IMedicalInvoiceClaimService _medicalInvoiceClaimService;
        private readonly IICD10CodeService _icd10CodeService;
        private readonly IConfigurationService _configurationService;
        private readonly IRolePlayerService _rolePlayerService;

        private readonly IRepository<medical_SwitchBatch> _medicalSwitchBatchRepository;
        private readonly IRepository<medical_SwitchBatchInvoice> _medicalSwitchBatchInvoiceRepository;
        private readonly IRepository<medical_SwitchBatchInvoiceLine> _medicalSwitchBatchInvoiceLineRepository;
        private readonly IRepository<medical_SwitchUnderAssessReasonSetting> _medicalSwitchUnderAssessReasonSetting;
        private readonly IRepository<medical_Tariff> _tariffRepository;
        private readonly IRepository<medical_MedicalItem> _medicalItemRepository;
        private readonly IRepository<medical_TebaTariff> _tebaTariffRepository;
        private readonly IRepository<medical_Invoice> _invoiceRepository;

        public SwitchInvoiceHelperFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IHealthCareProviderService healthCareProviderService
            , IRuleEngineService rulesEngine
            , IInvoiceCommonService invoiceCommonService
            , ISwitchBatchInvoiceUnderAssessReasonService switchBatchInvoiceUnderAssessReasonService
            , ISwitchBatchInvoiceLineUnderAssessReasonService switchBatchInvoiceLineUnderAssessReasonService
            , IMediCareService mediCareService
            , ISerializerService serializer
            , IMedicalItemFacadeService medicalItemFacadeService
            , IClaimService claimService
            , IEventService eventService
            , IPreAuthHelperService preAuthHelperService
            , IMedicalInvoiceClaimService medicalInvoiceClaimService
            , IICD10CodeService icd10CodeService
            , IConfigurationService configurationService
            , IRolePlayerService rolePlayerService
            , IRepository<medical_SwitchBatch> medicalSwitchBatchRepository
            , IRepository<medical_SwitchBatchInvoice> medicalSwitchBatchInvoiceRepository
            , IRepository<medical_SwitchBatchInvoiceLine> medicalSwitchBatchInvoiceLineRepository
            , IRepository<medical_SwitchUnderAssessReasonSetting> medicalSwitchUnderAssessReasonSetting
            , IRepository<medical_Tariff> tariffRepository
            , IRepository<medical_MedicalItem> medicalItemRepository
            , IRepository<medical_TebaTariff> tebaTariffRepository
            , IRepository<medical_Invoice> invoiceRepository
            )
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _healthCareProviderService = healthCareProviderService;
            _rulesEngine = rulesEngine;
            _invoiceCommonService = invoiceCommonService;
            _switchBatchInvoiceUnderAssessReasonService = switchBatchInvoiceUnderAssessReasonService;
            _switchBatchInvoiceLineUnderAssessReasonService = switchBatchInvoiceLineUnderAssessReasonService;
            _mediCareService = mediCareService;
            _serializer = serializer;
            _medicalItemFacadeService = medicalItemFacadeService;
            _claimService = claimService;
            _eventService = eventService;
            _preAuthHelperService = preAuthHelperService;
            _medicalInvoiceClaimService = medicalInvoiceClaimService;
            _icd10CodeService = icd10CodeService;
            _configurationService = configurationService;
            _rolePlayerService = rolePlayerService;
            _medicalSwitchBatchRepository = medicalSwitchBatchRepository;
            _medicalSwitchBatchInvoiceRepository = medicalSwitchBatchInvoiceRepository;
            _medicalSwitchBatchInvoiceLineRepository = medicalSwitchBatchInvoiceLineRepository;
            _medicalSwitchUnderAssessReasonSetting = medicalSwitchUnderAssessReasonSetting;
            _tariffRepository = tariffRepository;
            _medicalItemRepository = medicalItemRepository;
            _tebaTariffRepository = tebaTariffRepository;
            _invoiceRepository = invoiceRepository;
        }

        private async Task<bool> ValidateHCPDetails(string practiceNumber)
        {
            var hcpDetail = await _healthCareProviderService.SearchHealthCareProviderByPracticeNumber(practiceNumber);
            return hcpDetail?.IsActive ?? false;
        }

        private async Task<bool> ValidateClaimDetails(string claimReferenceNumber)
        {
            var claimDetails = await _claimService.GetClaimByClaimReference(claimReferenceNumber);
            return (claimDetails != null && claimDetails.ClaimId > 0) ? true : false;
        }

        public async Task<SwitchInvoiceValidationModel> ValidatePracticeNumberExist(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId
            };

            var healthCareProviderByPracticeNumber = await _healthCareProviderService.SearchHealthCareProviderByPracticeNumber(switchBatchInvoice?.PracticeNumber);
            if (healthCareProviderByPracticeNumber != null && switchBatchInvoice != null)
            {
                var practiceNumberExist = "{\"PracticeNumber\": \"" + healthCareProviderByPracticeNumber.PracticeNumber + "\"}";
                var ruleRequest = new RuleRequest()
                {
                    Data = practiceNumberExist,
                    RuleNames = new List<string>() { MediCareHealthcareProviderRuleTask.Constants.PracticeNumberExistValidation }
                };

                switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);
                if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                {
                    switchInvoiceValidations.InvoiceUnderAssessReasons.Add(new SwitchBatchInvoiceUnderAssessReason()
                    {
                        SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                        SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.UnmatchedHCP,
                        UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.UnmatchedHCP),
                        IsActive = true,
                        IsDeleted = false
                    });
                }
                else
                {
                    switchInvoiceValidations.ValidatedObjectId = healthCareProviderByPracticeNumber.RolePlayerId;
                }
            }
            else
            {
                switchInvoiceValidations.InvoiceUnderAssessReasons.Add(new SwitchBatchInvoiceUnderAssessReason()
                {
                    SwitchBatchInvoiceId = switchBatchInvoice?.SwitchBatchInvoiceId ?? 0,
                    SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.UnmatchedHCP,
                    UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.UnmatchedHCP),
                    IsActive = true,
                    IsDeleted = false
                });
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidatePracticeIsActive(SwitchBatchInvoice switchBatchInvoice, HealthCareProvider healthCareProvider)
        {
            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = 0
            };

            if (switchBatchInvoice == null)
                return switchInvoiceValidations;

            var isActiveStatus = healthCareProvider != null && healthCareProvider.DatePracticeStarted != null && healthCareProvider.DatePracticeClosed == null &&
                                 healthCareProvider.IsActive;

            var practiceActive = "{\"IsActive\": \"" + isActiveStatus.ToString() + "\"}";
            var ruleRequest = new RuleRequest()
            {
                Data = practiceActive,
                RuleNames = new List<string>() { MediCareHealthcareProviderRuleTask.Constants.HealthcareProviderActiveValidation },
                ExecutionFilter = "medical"
            };

            switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);
            if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
            {
                switchInvoiceValidations.InvoiceUnderAssessReasons.Add(new SwitchBatchInvoiceUnderAssessReason()
                {
                    SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                    SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.ThepracticeisinactiveRMAwillbecontactingyou,
                    UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.ThepracticeisinactiveRMAwillbecontactingyou),
                    IsActive = true,
                    IsDeleted = false
                });
            }
            else
            {
                switchInvoiceValidations.ValidatedObjectId = healthCareProvider?.RolePlayerId ?? 0;
            }

            return switchInvoiceValidations;
        }

        public async Task<int> UpdateSwitchBatchPracticeNumber(SwitchBatchInvoice switchBatchInvoice)
        {
            RmaIdentity.DemandPermission(Permissions.EditMedicalInvoice);
            Contract.Requires(switchBatchInvoice != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var healthCareProviderByPracticeNumber = await _healthCareProviderService.SearchHealthCareProviderByPracticeNumber(switchBatchInvoice?.PracticeNumber).ConfigureAwait(true);

                if (healthCareProviderByPracticeNumber != null)
                {
                    if (switchBatchInvoice != null)
                    {
                        switchBatchInvoice.HealthCareProviderId = healthCareProviderByPracticeNumber.RolePlayerId;
                        switchBatchInvoice.HealthCareProviderName = healthCareProviderByPracticeNumber.Name;

                        var updatedBatchInvoice = Mapper.Map<medical_SwitchBatchInvoice>(switchBatchInvoice);
                        _medicalSwitchBatchInvoiceRepository.Update(updatedBatchInvoice);
                        await scope.SaveChangesAsync().ConfigureAwait(false);

                        return switchBatchInvoice.SwitchBatchInvoiceId;
                    }

                    return 0;
                }

                return 0;
            }
        }

        public async Task<int> GetHealthCareProviderId(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);
            int healthCareProviderId = 0;

            var healthCareProviderByPracticeNumber = await _healthCareProviderService.SearchHealthCareProviderByPracticeNumber(switchBatchInvoice?.PracticeNumber);
            if (healthCareProviderByPracticeNumber != null)
            {
                healthCareProviderId = healthCareProviderByPracticeNumber.RolePlayerId;
            }

            return healthCareProviderId;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateInvoiceCount(SwitchBatchInvoice switchBatchInvoice, HealthCareProvider healthCareProvider)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId
            };

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (switchBatchInvoice != null)
                {
                    var medicalPreAuthExistCheckParams = new MedicalPreAuthExistCheckParams()
                    {
                        DateAdmitted = switchBatchInvoice?.DateAdmitted,
                        DateDischarged = switchBatchInvoice?.DateDischarged,
                        PersonEventId = switchBatchInvoice?.PossiblePersonEventId,
                        HealthCareProviderId = healthCareProvider?.RolePlayerId
                    };

                    List<PreAuthorisation> preAuthorisations = new List<PreAuthorisation>();
                    List<TravelAuthorisation> travelAuthorisations = new List<TravelAuthorisation>();

                    switch (switchBatchInvoice.SwitchBatchType)
                    {
                        case SwitchBatchTypeEnum.MedEDI:
                            preAuthorisations = await _invoiceCommonService.CheckIfPreAuthExistsCommon(medicalPreAuthExistCheckParams);
                            break;
                        case SwitchBatchTypeEnum.Teba:
                            travelAuthorisations = await _invoiceCommonService.CheckIfTravelPreAuthExistsCommon(medicalPreAuthExistCheckParams);
                            break;
                        default:
                            break;
                    }

                    var invoiceCountIsGreaterThanFour = false;
                    const int invoiceMaximunCount = 4;
                    if (preAuthorisations?.Count > 0 || travelAuthorisations?.Count > 0)
                    {
                        switch (switchBatchInvoice.SwitchBatchType)
                        {
                            case SwitchBatchTypeEnum.MedEDI:
                                foreach (var preAuth in preAuthorisations)
                                {
                                    if (preAuth.PreAuthStatus == PreAuthStatusEnum.Authorised)
                                    {
                                        var invoiceCount = await _invoiceCommonService.GetMappedPreAuthInvoiceDetails(SwitchBatchTypeEnum.MedEDI, preAuth.PreAuthId);
                                        if (invoiceCount > invoiceMaximunCount)
                                        {
                                            invoiceCountIsGreaterThanFour = true;
                                            break;
                                        }
                                    }
                                }
                                break;
                            case SwitchBatchTypeEnum.Teba:
                                foreach (var preAuth in travelAuthorisations)
                                {
                                    if (preAuth.IsPreAuthorised)
                                    {
                                        var invoiceCount = await _invoiceCommonService.GetMappedPreAuthInvoiceDetails(SwitchBatchTypeEnum.Teba, preAuth.TravelAuthorisationId);
                                        if (invoiceCount > invoiceMaximunCount)
                                        {
                                            invoiceCountIsGreaterThanFour = true;
                                            break;
                                        }
                                    }
                                }
                                break;
                            default:
                                break;
                        }

                        if (invoiceCountIsGreaterThanFour)
                        {
                            var ruleRequest = new RuleRequest()
                            {
                                Data = "{\"InvoiceCountIsGreaterThanFour\": \"" + invoiceCountIsGreaterThanFour + "\"}",
                                RuleNames = new List<string>() { MediCareRuleTask.InvoiceCountGreaterThanFour.Constants.InvoiceCountGreaterThanFourValidation }
                            };

                            switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);

                            if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                            {
                                var switchBatchInvoiceUnderAssessReason = new SwitchBatchInvoiceUnderAssessReason
                                {
                                    SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                                    SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.InvoiceunderReview,
                                    UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.InvoiceunderReview),
                                    IsActive = true,
                                    IsDeleted = false
                                };
                                switchInvoiceValidations.InvoiceUnderAssessReasons.Add(switchBatchInvoiceUnderAssessReason);
                            }
                        }
                    }
                }
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateServiceDateAndPracticeDate(int switchBatchInvoiceLineId, HealthCareProvider healthCareProvider
        , DateTime? serviceDate
        )
        {
 
            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoiceLineId
            };

            if (healthCareProvider != null)
            {
                DateTime? datePracticeStarted = healthCareProvider.DatePracticeStarted;
                DateTime? datePracticeClosed = healthCareProvider.DatePracticeClosed;

                var ruleData = "{\"ServiceDate\": \"" + serviceDate.ToString() + "\", \"DatePracticeStarted\": \"" + datePracticeStarted.ToString() + "\", \"DatePracticeClosed\": \"" + datePracticeClosed.ToString() + "\"}";

                var ruleRequest = new RuleRequest()
                {
                    Data = ruleData,
                    RuleNames = new List<string>() { MediCareRuleTask.ServiceDateAndPracticeDate.Constants.ServiceDateAndPracticeDateRuleName }
                };

                switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);

                if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                {
                    var switchBatchInvoiceLineUnderAssessReason = new SwitchBatchInvoiceLineUnderAssessReason()
                    {
                        SwitchBatchInvoiceLineId = switchBatchInvoiceLineId,
                        SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.Servicedatebeforepracticestartdateorafterpracticecloseddate,
                        UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.Servicedatebeforepracticestartdateorafterpracticecloseddate),
                        IsActive = true,
                        IsDeleted = false
                    };

                    switchInvoiceValidations.InvoiceLineUnderAssessReasons.Add(switchBatchInvoiceLineUnderAssessReason);
                }
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateIfCorrectCodeSubmitted(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);


            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId//might need to remove
            };

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var invoiceLineCodeCheck = new List<bool>();

                var healthCareProviderByPracticeNumber = await _healthCareProviderService.SearchHealthCareProviderByPracticeNumber(switchBatchInvoice?.PracticeNumber).ConfigureAwait(true);
                if (healthCareProviderByPracticeNumber != null)
                {
                    foreach (var item in switchBatchInvoice?.SwitchBatchInvoiceLines)
                    {
                        var validTariffCodesCheck = (switchBatchInvoice.SwitchBatchType == SwitchBatchTypeEnum.MedEDI) ? _tariffRepository.FirstOrDefault(x => x.PractitionerType == (PractitionerTypeEnum)healthCareProviderByPracticeNumber.ProviderTypeId && x.ItemCode == item.TariffCode) : null;
                        var tebaValidTariffCodesCheck = (switchBatchInvoice.SwitchBatchType == SwitchBatchTypeEnum.MedEDI) ? _tebaTariffRepository.FirstOrDefault(x => x.TariffCode == item.TariffCode) : null;
                        bool codeValid = (switchBatchInvoice.SwitchBatchType == SwitchBatchTypeEnum.MedEDI) ? validTariffCodesCheck != null : tebaValidTariffCodesCheck != null;

                        var ruleData = "{\"InvoiceLineCorrectCodeSubmitted\": \"" + codeValid + "\"}";

                        var ruleRequest = new RuleRequest()
                        {
                            Data = ruleData,
                            RuleNames = new List<string>() { MediCareRuleTask.CheckIfCorrectCodeSubmitted.Constants.CheckIfCorrectCodeSubmittedValidRuleName },
                            ExecutionFilter = "medical"
                        };

                        switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);

                        if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                        {
                            var switchBatchInvoiceLineUnderAssessReason = new SwitchBatchInvoiceLineUnderAssessReason
                            {
                                SwitchBatchInvoiceLineId = item.SwitchBatchInvoiceLineId,
                                SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.RelevantcoderequiredforIOD,
                                UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.RelevantcoderequiredforIOD),
                                IsActive = true,
                                IsDeleted = false
                            };

                            switchInvoiceValidations.InvoiceLineUnderAssessReasons.Add(switchBatchInvoiceLineUnderAssessReason);
                        }
                    }
                }

                if (invoiceLineCodeCheck.Any())
                {
                    switchBatchInvoice.SwitchInvoiceStatus = SwitchInvoiceStatusEnum.Deleted;
                }
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateSwitchInvoiceLineTariffAmount(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId
            };

            if (switchBatchInvoice != null)
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    bool isChronic = false;
                    if (switchBatchInvoice.PossiblePersonEventId > 0)
                    {
                        var eventDetail = await _eventService.GetPersonEventDetails(Convert.ToInt32(switchBatchInvoice.PossiblePersonEventId));
                        isChronic = (switchBatchInvoice.DateAdmitted > eventDetail.EventDate.AddYears(2));
                    }

                    //Get HCP Agreed Tariff
                    int agreedTariffType = 0;
                    if (switchBatchInvoice.SwitchBatchType == SwitchBatchTypeEnum.MedEDI)
                        agreedTariffType = await _healthCareProviderService.GetHealthCareProviderAgreedTariff(Convert.ToInt32(switchBatchInvoice.HealthCareProviderId), isChronic, Convert.ToDateTime(switchBatchInvoice.DateAdmitted));
                    var hcpDetail = await _healthCareProviderService.GetHealthCareProviderById(Convert.ToInt32(switchBatchInvoice.HealthCareProviderId));

                    var lineItemAmountTolerance = await _medicalItemFacadeService.GetMedicalItemToleranceAsync();

                    var switchInvoiceLineData = new List<MediCareRuleTask.AmountNotGreaterThanTariff.RuleData>();
                    foreach (var switchBatchInvoiceLine in switchBatchInvoice.SwitchBatchInvoiceLines)
                    {
                        // Get Switch batch Line Item Tariff Amount
                        if (hcpDetail != null)
                        {
                            //TEBA or MedicalInvoice - use different tariffs
                            TariffSearch tariffDetail = null;
                            TebaTariff tebaTariffDetail = null;

                            switch (switchBatchInvoice.SwitchBatchType)
                            {
                                case SwitchBatchTypeEnum.MedEDI:
                                    tariffDetail = await _mediCareService.SearchTariff(switchBatchInvoiceLine.TariffCode, agreedTariffType.ToString(), hcpDetail.ProviderTypeId, Convert.ToDateTime(switchBatchInvoiceLine.ServiceDate));
                                    break;
                                case SwitchBatchTypeEnum.Teba:

                                    TebaTariffCodeTypeEnum? TebaTariffCodeValue = null;

                                    if (!string.IsNullOrEmpty(switchBatchInvoiceLine.TariffCode) && Enum.IsDefined(typeof(TebaTariffCodeTypeEnum), switchBatchInvoiceLine.TariffCode))
                                    {
                                        if (Enum.TryParse(switchBatchInvoiceLine.TariffCode, true, out TebaTariffCodeTypeEnum TebaTariffCodeValueEnum))
                                        {
                                            TebaTariffCodeValue = TebaTariffCodeValueEnum;
                                            tebaTariffDetail = await _invoiceCommonService.GetTebaTariff(TebaTariffCodeValue, (DateTime)switchBatchInvoiceLine.ServiceDate);
                                        }
                                    }

                                    break;
                                default:
                                    break;
                            }


                            if (tariffDetail != null || tebaTariffDetail != null)
                            {
                                var tariffAmount = (switchBatchInvoice.SwitchBatchType == SwitchBatchTypeEnum.MedEDI) ? tariffDetail.TariffAmount : tebaTariffDetail.CostValue;
                                var tariffQuanity = Convert.ToUInt16(tariffDetail?.DefaultQuantity) != 0 ? Convert.ToUInt16(tariffDetail.DefaultQuantity) : 1;

                                MediCareRuleTask.AmountNotGreaterThanTariff.RuleData ruleData = new MediCareRuleTask.AmountNotGreaterThanTariff.RuleData
                                {
                                    AuthorisedAmount = Convert.ToDecimal(switchBatchInvoiceLine.TotalInvoiceLineCostInclusive),
                                    TariffAmount = Convert.ToDecimal(tariffAmount),
                                    ItemTolerance = Convert.ToDecimal(lineItemAmountTolerance),
                                    AuthorisedQuantity = Convert.ToUInt16(switchBatchInvoiceLine.Quantity),
                                    TariffQuanity = (switchBatchInvoice.SwitchBatchType == SwitchBatchTypeEnum.MedEDI) ? tariffQuanity : Convert.ToUInt16(switchBatchInvoiceLine.Quantity)
                                };

                                switchInvoiceLineData.Add(ruleData);

                                var amountNotGreaterThanTariffRuleRequest = new RuleRequest()
                                {
                                    Data = _serializer.Serialize(switchInvoiceLineData),
                                    RuleNames = new List<string>() { MediCareRuleTask.AmountNotGreaterThanTariff.Constants.AmountNotGreaterThanTariffRule },
                                    ExecutionFilter = "medical"
                                };

                                switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(amountNotGreaterThanTariffRuleRequest);

                                if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                                {
                                    switchBatchInvoiceLine.TotalInvoiceLineCostInclusive = tariffDetail.TariffAmount;
                                    var switchBatchInvoiceLineUnderAssessReason = new SwitchBatchInvoiceLineUnderAssessReason
                                    {
                                        SwitchBatchInvoiceLineId = switchBatchInvoiceLine.SwitchBatchInvoiceLineId,
                                        SwitchUnderAssessReason = (tariffDetail.TariffAmount > 0) ? SwitchUnderAssessReasonEnum.InvoiceRequestedAmountDoesnotMatchLineTotal : SwitchUnderAssessReasonEnum.Amountorquantityiszero,
                                        UnderAssessReason = (tariffDetail.TariffAmount > 0) ? SwitchUnderAssessReasonEnum.InvoiceRequestedAmountDoesnotMatchLineTotal.DisplayDescriptionAttributeValue() : SwitchUnderAssessReasonEnum.Amountorquantityiszero.DisplayDescriptionAttributeValue(),
                                        IsActive = true,
                                        IsDeleted = false
                                    };

                                    switchInvoiceValidations.InvoiceLineUnderAssessReasons.Add(switchBatchInvoiceLineUnderAssessReason);
                                }
                            }
                            else
                            {
                                //This line below will always be null....
                                //switchBatchInvoiceLine.TotalInvoiceLineCostInclusive = tariffDetail.TariffAmount;
                                var switchBatchInvoiceLineUnderAssessReason = new SwitchBatchInvoiceLineUnderAssessReason
                                {
                                    SwitchBatchInvoiceLineId = switchBatchInvoiceLine.SwitchBatchInvoiceLineId,
                                    SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.InvalidTariffCodeSubmitted,
                                    UnderAssessReason = SwitchUnderAssessReasonEnum.InvalidTariffCodeSubmitted.DisplayDescriptionAttributeValue(),
                                    IsActive = true,
                                    IsDeleted = false
                                };

                                switchInvoiceValidations.InvoiceLineUnderAssessReasons.Add(switchBatchInvoiceLineUnderAssessReason);
                            }
                        }
                    }
                }
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateInvalidTariffCodeSubmitted(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId
            };

            if (switchBatchInvoice == null)
                return switchInvoiceValidations;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                foreach (var switchBatchInvoiceLine in switchBatchInvoice?.SwitchBatchInvoiceLines)
                {
                    var lineTariffCodesValid = (switchBatchInvoice.SwitchBatchType == SwitchBatchTypeEnum.MedEDI) ?
                        _medicalItemRepository.Where(x => x.ItemCode == switchBatchInvoiceLine.TariffCode).ToList() : null;
                    var tebaLineTariffCodes = (switchBatchInvoice.SwitchBatchType == SwitchBatchTypeEnum.Teba) ?
                        _tebaTariffRepository.Where(x => x.TariffCode == switchBatchInvoiceLine.TariffCode).ToList() : null;
                    bool invoiceHasValidTariffCodes = (switchBatchInvoice.SwitchBatchType == SwitchBatchTypeEnum.MedEDI) ?
                        lineTariffCodesValid.Any() : tebaLineTariffCodes.Any();

                    var ruleData = "{\"IsValidTariffCode\": \"" + invoiceHasValidTariffCodes + "\"}";

                    var ruleRequest = new RuleRequest()
                    {
                        Data = ruleData,
                        RuleNames = new List<string>() { MediCareRuleTask.TariffCode.Constants.TariffCodeRuleName },
                        ExecutionFilter = "medical"
                    };

                    switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);

                    if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                    {
                        var switchBatchInvoiceLineUnderAssessReason = new SwitchBatchInvoiceLineUnderAssessReason
                        {
                            SwitchBatchInvoiceLineId = switchBatchInvoiceLine.SwitchBatchInvoiceLineId,
                            UnderAssessReason = SwitchUnderAssessReasonEnum.InvalidTariffCodeSubmitted.DisplayDescriptionAttributeValue(),
                            SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.InvalidTariffCodeSubmitted,
                            IsActive = true,
                            IsDeleted = false
                        };

                        switchInvoiceValidations.InvoiceLineUnderAssessReasons.Add(switchBatchInvoiceLineUnderAssessReason);
                    }
                }
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateNoInvoiceLinesSubmitted(
            SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId
            };

            if (switchBatchInvoice == null)
                return switchInvoiceValidations;

            var invoiceLinesTotal = switchBatchInvoice?.SwitchBatchInvoiceLines.Count;

            var ruleData = "{\"InvoiceLinesTotal\": \"" + invoiceLinesTotal + "\"}";

            var ruleRequest = new RuleRequest()
            {
                Data = ruleData,
                RuleNames = new List<string>()
                    { MediCareRuleTask.NoInvoiceLines.Constants.NoInvoiceLinesRuleValidRuleName },
                ExecutionFilter = "medical"
            };

            switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);

            if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
            {
                switchInvoiceValidations.InvoiceUnderAssessReasons.Add(new SwitchBatchInvoiceUnderAssessReason()
                {
                    SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                    SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.TheInvoiceRejectedForNoValidLines,
                    UnderAssessReason =
                        Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.TheInvoiceRejectedForNoValidLines),
                    IsActive = true,
                    IsDeleted = false
                });
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateAmountOrQuantityRuleSubmitted(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId
            };

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                foreach (var item in switchBatchInvoice?.SwitchBatchInvoiceLines)
                {
                    int lineQuantity = 0;

                    if (int.TryParse(item.Quantity, out int numberQuantity))
                    {
                        lineQuantity = numberQuantity;
                    }

                    var ruleData = "{\"QuanInvoiceLineQuantitytity\": \"" + lineQuantity + "\", \"TotalInvoiceLineCostInclusive\": \"" + item.TotalInvoiceLineCostInclusive + "\"}";

                    var ruleRequest = new RuleRequest()
                    {
                        Data = ruleData,
                        RuleNames = new List<string>() { MediCareRuleTask.CheckIfAmountOrQuantitySubmitted.Constants.CheckAmountOrQuantitySubmittedValidRuleName },
                        ExecutionFilter = "medical"
                    };

                    switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);

                    if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                    {
                        var switchBatchInvoiceLineUnderAssessReason = new SwitchBatchInvoiceLineUnderAssessReason
                        {
                            SwitchBatchInvoiceLineId = item.SwitchBatchInvoiceLineId,
                            SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.Amountorquantityiszero,
                            UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.Amountorquantityiszero),
                            IsActive = true,
                            IsDeleted = false
                        };

                        switchInvoiceValidations.InvoiceLineUnderAssessReasons.Add(switchBatchInvoiceLineUnderAssessReason);
                    }
                }
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateIfRequestedAmountEqualsToLineTotalSubmitted(
            SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId
            };

            if (switchBatchInvoice == null)
                return switchInvoiceValidations;

            decimal? totalInvoiceLinesCostInclusive =
                switchBatchInvoice.SwitchBatchInvoiceLines.Sum(a => a.TotalInvoiceLineCostInclusive);

            var ruleData = "{\"TotalInvoiceAmountInclusive\": \"" +
                           switchBatchInvoice.TotalInvoiceAmountInclusive.GetValueOrDefault(0m) +
                           "\", \"TotalInvoiceLinesCostInclusive\": \"" +
                           totalInvoiceLinesCostInclusive.GetValueOrDefault(0m) + "\"}";

            var ruleRequest = new RuleRequest()
            {
                Data = ruleData,
                RuleNames = new List<string>()
                {
                    MediCareRuleTask.CheckIfRequestedAmountEqualsToLineTotalSubmitted.Constants
                        .CheckIfRequestedAmountEqualsToLineTotalSubmittedValidRuleName
                },
                ExecutionFilter = "medical"
            };

            switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);

            if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
            {
                switchInvoiceValidations.InvoiceUnderAssessReasons.Add(new SwitchBatchInvoiceUnderAssessReason()
                {
                    SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                    SwitchUnderAssessReason =
                        SwitchUnderAssessReasonEnum.InvoiceRequestedAmountDoesnotMatchLineTotal,
                    UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum
                        .InvoiceRequestedAmountDoesnotMatchLineTotal),
                    IsActive = true,
                    IsDeleted = false
                });
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidatePersonName(SwitchBatchInvoice switchBatchInvoice,
            int personEventId)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId
            };

            if (switchBatchInvoice != null)
            {
                var personNameOnClaim = string.Empty;
                var personNameOnInvoice = switchBatchInvoice.FirstName + " " + switchBatchInvoice.Surname;

                var personDetails = await _eventService.GetPersonDetailsByPersonEventId(personEventId);
                if (personDetails != null)
                {
                    personNameOnClaim = personDetails.FirstName + " " + personDetails.Surname;
                }

                var surnameOnClaim = string.Empty;
                var initialOnInvoice = string.Empty;
                var initialOnClaim = string.Empty;

                var surnameOnInvoice = switchBatchInvoice.Surname;
                if (switchBatchInvoice.FirstName.Length > 0)
                {
                    initialOnInvoice = switchBatchInvoice.FirstName[0].ToString();
                }

                if (personDetails != null)
                {
                    surnameOnClaim = personDetails.Surname;
                    if (personDetails.FirstName.Length > 0)
                    {
                        initialOnClaim = personDetails.FirstName[0].ToString();
                    }
                }

                var personNameIsMatchingData = "{\"PersonNameOnClaim\": \"" + personNameOnClaim +
                                               "\", \"PersonNameOnInvoice\": \"" + personNameOnInvoice +
                                               "\", \"SurnameOnInvoice\": \"" + surnameOnInvoice +
                                               "\", \"SurnameOnClaim\": \"" + surnameOnClaim +
                                               "\", \"InitialOnInvoice\": \"" + initialOnInvoice +
                                               "\", \"InitialOnClaim\": \"" + initialOnClaim + "\"}";
                var ruleRequestPersonNameMatching = new RuleRequest()
                {
                    Data = personNameIsMatchingData,
                    RuleNames = new List<string>()
                        { MediCareRuleTask.PersonNameMatch.Constants.MedicalInvoicePersonNameRuleName }
                };

                switchInvoiceValidations.RuleRequestResult =
                    await _rulesEngine.ExecuteRules(ruleRequestPersonNameMatching);
                if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                {
                    switchInvoiceValidations.InvoiceUnderAssessReasons.Add(new SwitchBatchInvoiceUnderAssessReason()
                    {
                        SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                        SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.Persondetailsnotmatching,
                        UnderAssessReason =
                            Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.Persondetailsnotmatching),
                        IsActive = true,
                        IsDeleted = false
                    });
                }
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateIDOrPassportNumber(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId
            };

            if (switchBatchInvoice != null)
            {
                var idNumberOnClaim = string.Empty;
                var idNumberOnInvoice = switchBatchInvoice.IdNumber;
                var claim = await _claimService.GetClaimByClaimReference(switchBatchInvoice.ClaimReferenceNumber);
                if (claim != null)
                {
                    var personDetails = await _eventService.GetPersonDetailsByPersonEventId(claim.PersonEventId);
                    if (personDetails != null)
                    {
                        idNumberOnClaim = personDetails.IdNumber;
                        if (string.IsNullOrEmpty(idNumberOnClaim))
                        {
                            idNumberOnClaim = personDetails.PassportNumber;
                        }
                    }
                }

                var idOrPassportNumberIsMatchingData = "{\"IDOrPassportNumberOnClaim\": \"" + idNumberOnClaim + "\", \"IDOrPassportNumberOnInvoice\": \"" + idNumberOnInvoice + "\"}";
                var ruleRequestIDPassportMatch = new RuleRequest()
                {
                    Data = idOrPassportNumberIsMatchingData,
                    RuleNames = new List<string>() { MediCareRuleTask.IDPassportMatch.Constants.MedicalInvoiceIDPassportRuleName }
                };

                switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequestIDPassportMatch);
                if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                {
                    switchInvoiceValidations.InvoiceUnderAssessReasons.Add(new SwitchBatchInvoiceUnderAssessReason()
                    {
                        SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                        SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.Persondetailsnotmatching,
                        UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.Persondetailsnotmatching),
                        IsActive = true,
                        IsDeleted = false
                    });
                }
            }
            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateTwoYearRule(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId
            };

            if (switchBatchInvoice != null)
            {
                var Is2YearRule = true;//Logic still needs to be added after the claim benefits feature has been implemented

                if (Is2YearRule)
                {
                    var eventDate = switchBatchInvoice.EventDate;
                    var dateAdmitted = switchBatchInvoice.DateAdmitted;

                    var ruleData = "{\"EventDate\": \"" + eventDate.ToString() + "\", \"DateAdmitted\": \"" + dateAdmitted.ToString() + "\"}";
                    var ruleRequest = new RuleRequest()
                    {
                        Data = ruleData,
                        RuleNames = new List<string>() { MediCareRuleTask.TwoYear.Constants.TwoYearRuleName }
                    };

                    switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);
                    if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                    {
                        switchInvoiceValidations.InvoiceUnderAssessReasons.Add(new SwitchBatchInvoiceUnderAssessReason()
                        {
                            SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                            SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.InvoiceunderReview, // Add and replace with new enum for Two Year Rule
                            UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.InvoiceunderReview),
                            IsActive = true,
                            IsDeleted = false
                        });
                    }
                }
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateOutstandingRequirementsRule(string liabilityStatus, int switchBatchInvoiceId)
        {
            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoiceId
            };

            if (!string.IsNullOrEmpty(liabilityStatus))
            {
                liabilityStatus = "{\"LiabilityStatus\": \"status\"}".Replace("status", liabilityStatus);
            }

            var ruleRequest = new RuleRequest()
            {
                Data = liabilityStatus,
                RuleNames = new List<string>() { ClaimValidationRules.ClaimOutstandingRequirements.Constants.OutstandingRequirementsRuleName }
            };

            switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);
            if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
            {
                switchInvoiceValidations.InvoiceUnderAssessReasons.Add(new SwitchBatchInvoiceUnderAssessReason()
                {
                    SwitchBatchInvoiceId = switchBatchInvoiceId,
                    SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.claimsdocumentationoutstandingstatustoberevieweduponreceiptofrequireddocuments,
                    UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.claimsdocumentationoutstandingstatustoberevieweduponreceiptofrequireddocuments),
                    IsActive = true,
                    IsDeleted = false
                });
            }

            return switchInvoiceValidations;
        }

        public async Task UpdatePreAuthDetailsOnSwitchInvoice(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                if (switchBatchInvoice?.PreAuthNumber != null && switchBatchInvoice?.PreAuthId == null)
                {
                    var switchBatchRepository = await _medicalSwitchBatchInvoiceRepository.FirstOrDefaultAsync(b => b.SwitchBatchInvoiceId == switchBatchInvoice.SwitchBatchInvoiceId);
                    var preAuthDetails = await GetPreAuthorisationForSwitchInvoice(switchBatchInvoice.PreAuthNumber);
                    switchBatchRepository.PreAuthId = preAuthDetails.PreAuthId;

                    _medicalSwitchBatchInvoiceRepository.Update(switchBatchRepository);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        public async Task<PreAuthorisation> GetPreAuthorisationForSwitchInvoice(string preAuthorisationNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _preAuthHelperService.GetPreAuthorisation(preAuthorisationNumber);
            }
        }

        public async Task<SwitchInvoiceValidationModel> ValidateClaimLiabilityStatus(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId
            };

            string liabilityStatus = string.Empty;
            if (switchBatchInvoice?.PossiblePersonEventId != null)
            {
                var medicalInvoiceClaimQuery = await _medicalInvoiceClaimService.GetMedicalInvoiceClaimByPersonEventId(Convert.ToInt32(switchBatchInvoice.PossiblePersonEventId));
                var medicalInvoiceClaimResult = medicalInvoiceClaimQuery.ClaimLiabilityStatus;

                if (!string.IsNullOrEmpty(medicalInvoiceClaimResult))
                {
                    liabilityStatus = "{\"LiabilityStatus\": \"status\"}".Replace("status", medicalInvoiceClaimResult);
                }

                var ruleRequest = new RuleRequest()
                {
                    Data = liabilityStatus,
                    RuleNames = new List<string>() { MediCareRuleTask.Constants.LiabilityStatusRuleName }
                };

                switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);
                if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                {
                    var isLiabilityRepudiated = (medicalInvoiceClaimQuery.ClaimLiabilityStatus == Utility.GetEnumDisplayName(ClaimLiabilityStatusEnum.Declined));
                    switchInvoiceValidations.InvoiceUnderAssessReasons.Add(new SwitchBatchInvoiceUnderAssessReason()
                    {
                        SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                        SwitchUnderAssessReason = isLiabilityRepudiated ? SwitchUnderAssessReasonEnum.ClaimRepudiatedfollowupwithemployer : SwitchUnderAssessReasonEnum.ClaimLiabilitynotacceptedfollowupwithemployer,
                        UnderAssessReason = isLiabilityRepudiated ? Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.ClaimRepudiatedfollowupwithemployer) : Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.ClaimLiabilitynotacceptedfollowupwithemployer),
                        IsActive = true,
                        IsDeleted = false
                    });
                }
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateFranchiseAmountLimit(SwitchBatchInvoice switchBatchInvoice, int claimId)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId
            };

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (switchBatchInvoice?.PossiblePersonEventId != null)
                {
                    var totalInvoiceAmount = _invoiceRepository.Where(m => m.ClaimId == claimId).Sum(m => m.InvoiceTotalInclusive);
                    var franchiseAmountLimit = await _configurationService.GetModuleSetting(SystemSettings.FranchiseMedInvAmtLimit);

                    if (totalInvoiceAmount != null && !string.IsNullOrEmpty(franchiseAmountLimit))
                    {
                        var invoiceAmountIsLessThanFranchiseAmount = totalInvoiceAmount < Convert.ToDecimal(franchiseAmountLimit);
                        var ruleRequest = new RuleRequest()
                        {
                            Data = "{\"InvoiceAmountIsLessThanFranchiseAmount\": \"" + invoiceAmountIsLessThanFranchiseAmount + "\"}",
                            RuleNames = new List<string>() { MediCareRuleTask.FranchiseAmountLimit.Constants.InvoiceAmountLessThanFranchiseAmountValidation }
                        };

                        switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);
                        if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                        {
                            var switchBatchInvoiceUnderAssessReason = new SwitchBatchInvoiceUnderAssessReason
                            {
                                SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                                SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.InvoiceLessthanFranchisedAmountcontacttheEmployer,
                                UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.InvoiceLessthanFranchisedAmountcontacttheEmployer),
                                IsActive = true,
                                IsDeleted = false
                            };

                            switchInvoiceValidations.InvoiceUnderAssessReasons.Add(switchBatchInvoiceUnderAssessReason);
                            await _switchBatchInvoiceUnderAssessReasonService.AddSwitchBatchInvoiceUnderAssessReason(switchBatchInvoiceUnderAssessReason);
                            switchBatchInvoice.SwitchInvoiceStatus = SwitchInvoiceStatusEnum.Deleted;
                            var updatedBatchInvoice = Mapper.Map<medical_SwitchBatchInvoice>(switchBatchInvoice);
                            _medicalSwitchBatchInvoiceRepository.Update(updatedBatchInvoice);
                        }
                    }
                }
            }
            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidatePreAuthExist(SwitchBatchInvoice switchBatchInvoice, int healthCareProviderId)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId
            };

            var preAuthExist = false;
            var medicalPreAuthExistCheckParams = new MedicalPreAuthExistCheckParams()
            {
                HealthCareProviderId = healthCareProviderId,
                DateAdmitted = switchBatchInvoice?.DateAdmitted,
                DateDischarged = switchBatchInvoice?.DateDischarged,
                PersonEventId = switchBatchInvoice?.PossiblePersonEventId
            };

            var preAuthExistsResult = await _invoiceCommonService.CheckIfPreAuthExistsCommon(medicalPreAuthExistCheckParams).ConfigureAwait(true);
            if (preAuthExistsResult.Count > 0)
                preAuthExist = true;

            var preAuthExistData = "{\"PreAuthExist\": \"" + preAuthExist.ToString() + "\"}";
            var ruleRequest = new RuleRequest()
            {
                Data = preAuthExistData,
                RuleNames = new List<string>() { MediCareRuleTask.PreAuthExistCheck.Constants.PreAuthExistCheckRuleName }
            };

            switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);
            if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
            {
                var switchBatchInvoiceUnderAssessReason = new SwitchBatchInvoiceUnderAssessReason
                {
                    SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                    SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.InvoiceunderReview, //Update enum value for preauth exist valdation
                    UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.InvoiceunderReview),
                    IsActive = true,
                    IsDeleted = false
                };

                switchInvoiceValidations.InvoiceUnderAssessReasons.Add(switchBatchInvoiceUnderAssessReason);
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateClaimReferenceNumber(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = 0
            };

            if (!string.IsNullOrEmpty(switchBatchInvoice?.ClaimReferenceNumber))
            {
                var (claimReferenceNumberMatching, claimId) = await IsClaimReferenceNumberMatching(switchBatchInvoice);
                if (claimReferenceNumberMatching)
                    switchInvoiceValidations.ValidatedObjectId = claimId;

                string isUnmatchedClaimReferenceNumber = "{\"IsUnmatchedClaimReferenceNumber\": \"" + !claimReferenceNumberMatching + "\"}";
                var ruleRequest = new RuleRequest()
                {
                    Data = isUnmatchedClaimReferenceNumber,
                    RuleNames = new List<string>() { MediCareRuleTask.UnmatchedClaim.Constants.UnmatchedClaim }
                };
                switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);

                if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                {
                    var switchBatchInvoiceUnderAssessReason = new SwitchBatchInvoiceUnderAssessReason
                    {
                        SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                        SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.UnMatchedClaim,
                        UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.UnMatchedClaim),
                        IsActive = true,
                        IsDeleted = false
                    };

                    switchInvoiceValidations.InvoiceUnderAssessReasons.Add(switchBatchInvoiceUnderAssessReason);
                }
            }
            else
            {
                switchInvoiceValidations.InvoiceUnderAssessReasons.Add(new SwitchBatchInvoiceUnderAssessReason()
                {
                    SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                    SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.UnMatchedClaim,
                    UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.UnMatchedClaim),
                    IsActive = true,
                    IsDeleted = false
                });
            }
            return switchInvoiceValidations;
        }

        private async Task<(bool, int)> IsClaimReferenceNumberMatching(SwitchBatchInvoice switchBatchInvoice)
        {
            Claim claim = null;
            List<int> personEventIds;

            string referenceNumber = CleanClaimNumberCharacters(switchBatchInvoice.ClaimReferenceNumber);
            var claimForExactMatch = await _claimService.GetClaimByClaimReference(referenceNumber);
            if (claimForExactMatch?.ClaimId != null)
                return (true, claimForExactMatch.ClaimId);

            var substringMatchClaims = await _claimService.GetClaimsByClaimReferenceNumber(referenceNumber);
            if (substringMatchClaims?.Count == 1)
            {
                claim = substringMatchClaims[0];
                return (true, claim.ClaimId);
            }

            var substringMatchPersonEvents = await _claimService.GetPersonEventByCompCarePevRefNumber(referenceNumber);
            if (substringMatchPersonEvents?.Count == 1)
            {
                personEventIds = substringMatchPersonEvents.Select(m => m.PersonEventId).ToList();

                if (personEventIds.Count > 0)
                {
                    claim = await _claimService.GetClaimByPersonEvent(personEventIds[0]);
                    if (claim != null)
                        return (true, claim.ClaimId);
                }
            }

            var industryNumberMatch = await _rolePlayerService.GetPersonEmploymentByIndustryNumber(referenceNumber);
            if (industryNumberMatch?.EmployeeRolePlayerId > 0)
            {
                var personEventDetails = await _eventService.GetPersonEventByClaimant(industryNumberMatch.EmployeeRolePlayerId);
                personEventIds = new List<int> { personEventDetails?.PersonEventId ?? 0 };
                if (personEventIds.Count > 0 && switchBatchInvoice.EventDate != null)
                {
                    claim = await _claimService.GetClaimByPersonEventId(personEventIds, (DateTime)switchBatchInvoice.EventDate);
                    if (claim != null)
                        return (true, claim.ClaimId);
                }
            }

            if (switchBatchInvoice.EventDate != null)
            {
                var idNumberMatch = await _claimService.GetClaimsByIdNumber(referenceNumber, (DateTime)switchBatchInvoice.EventDate, switchBatchInvoice.Surname);
                if (idNumberMatch?.ClaimId != null)
                    return (true, idNumberMatch.ClaimId);

                var memberNumberMatch = await _claimService.GetClaimsByMemberNumber(referenceNumber, (DateTime)switchBatchInvoice.EventDate);
                if (memberNumberMatch?.ClaimId != null)
                    return (true, memberNumberMatch.ClaimId);

                if (referenceNumber.Length >= 9)
                {
                    var missingForwardSlashMatch = GetClaimsByMissingClaimReferenceNumberSlashes(referenceNumber);
                    if (string.IsNullOrEmpty(missingForwardSlashMatch))
                    {
                        var matchClaims = await _claimService.GetClaimsByClaimReferenceNumber(referenceNumber);
                        if (matchClaims.Count > 0)
                        {
                            personEventIds = matchClaims.Select(m => m.PersonEventId).ToList();
                            if (personEventIds.Count > 0)
                            {
                                claim = await _claimService.GetClaimByPersonEventId(personEventIds, (DateTime)switchBatchInvoice.EventDate);
                                if (claim != null)
                                    return (true, claim.ClaimId);
                            }
                        }
                    }
                }
            }

            if (IsPreAuthPrefixPresent(referenceNumber))
            {
                var preAuthNumberMatch = await GetPreAuthorisationForSwitchInvoice(referenceNumber);
                if (preAuthNumberMatch?.PreAuthId > 0)
                    return (true, preAuthNumberMatch.ClaimId ?? 0);

                var eventMatchClaim = await _eventService.GetEventByEventReferenceNumber(referenceNumber);
                var eventIds = eventMatchClaim.Select(m => m.EventId).ToList();
                if (switchBatchInvoice.EventDate != null && eventIds.Count > 0)
                {
                    claim = await _claimService.GetClaimByEventId(eventIds, (DateTime)switchBatchInvoice.EventDate);
                    if (claim != null)
                        return (true, claim.ClaimId);
                }
            }

            return (false, 0);
        }

        private bool IsPreAuthPrefixPresent(string claimReferenceNumber)
        {
            string[] preAuthPrefixes = { "TPAC", "PAC", "HPAC", "CMAC", "PPAC", "TAC" };
            return preAuthPrefixes.Any(prefix => claimReferenceNumber.Contains(prefix));
        }

        public async Task<SwitchInvoiceValidationModel> ValidateTreatmentDateWithEventDate(SwitchBatchInvoice switchBatchInvoice, string ruleName)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId
            };

            if (switchBatchInvoice != null)
            {
                var eventDate = switchBatchInvoice.EventDate;
                var treatmentFromDate = switchBatchInvoice.DateAdmitted;
                var treatmentToDate = switchBatchInvoice.DateDischarged;

                var switchUnderAssessReasonEnum = SwitchUnderAssessReasonEnum.InvalidDate;
                var ruleRequest = new RuleRequest();
                switch (ruleName)
                {
                    case "TreatmentFromEventDate":
                        ruleRequest.Data = "{\"EventDate\": \"" + eventDate.ToString() + "\", \"TreatmentFromDate\": \"" + treatmentFromDate.ToString() + "\"}";
                        ruleRequest.RuleNames = new List<string>() { MediCareRuleTask.TreatmentFromDateBeforeEventDate.Constants.MedicalInvoiceEventDateRuleName };
                        switchUnderAssessReasonEnum = SwitchUnderAssessReasonEnum.treatmentbeforedateofaccident;
                        break;
                    case "TreatmentToEventDate":
                        ruleRequest.Data = "{\"EventDate\": \"" + eventDate.ToString() + "\", \"TreatmentToDate\": \"" + treatmentToDate.ToString() + "\"}";
                        ruleRequest.RuleNames = new List<string>() { MediCareRuleTask.TreatmentToDateBeforeEventDate.Constants.MedicalInvoiceEventDateRuleName };
                        switchUnderAssessReasonEnum = SwitchUnderAssessReasonEnum.treatmentbeforedateofaccident;
                        break;
                }

                switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);
                if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                {
                    var switchBatchInvoiceUnderAssessReason = new SwitchBatchInvoiceUnderAssessReason
                    {
                        SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                        SwitchUnderAssessReason = switchUnderAssessReasonEnum,
                        UnderAssessReason = Utility.GetEnumDisplayName(switchUnderAssessReasonEnum),
                        IsActive = true,
                        IsDeleted = false
                    };

                    switchInvoiceValidations.InvoiceUnderAssessReasons.Add(switchBatchInvoiceUnderAssessReason);
                }
            }
            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateTreatmentDateWithDateOfDeath(SwitchBatchInvoice switchBatchInvoice, string ruleName)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId
            };

            if (switchBatchInvoice != null)
            {
                var treatmentFromDate = switchBatchInvoice.DateAdmitted;
                var treatmentToDate = switchBatchInvoice.DateDischarged;
                var dateOfDeath = await GetDateOfDeath(Convert.ToInt32(switchBatchInvoice.PossiblePersonEventId));

                if (dateOfDeath != DateTime.MinValue)
                {
                    SwitchUnderAssessReasonEnum switchUnderAssessReasonEnum = SwitchUnderAssessReasonEnum.InvalidDate;
                    var ruleRequest = new RuleRequest();
                    switch (ruleName)
                    {
                        case "TreatmentFromDeathOfDate":
                            ruleRequest.Data = "{\"TreatmentFromDate\": \"" + treatmentFromDate.ToString() + "\", \"DateOfDeath\": \"" + dateOfDeath.ToString() + "\"}";
                            ruleRequest.RuleNames = new List<string>() { MediCareRuleTask.TreatmentFromDateAfterDateOfDeath.Constants.MedicalInvoiceDateOfDeathRuleName };
                            switchUnderAssessReasonEnum = SwitchUnderAssessReasonEnum.ServiceDateafterDateofDeath;
                            break;
                        case "TreatmentToDeathOfDate":
                            ruleRequest.Data = "{\"TreatmentToDate\": \"" + treatmentToDate.ToString() + "\", \"DateOfDeath\": \"" + dateOfDeath.ToString() + "\"}";
                            ruleRequest.RuleNames = new List<string>() { MediCareRuleTask.TreatmentToDateAfterDateOfDeath.Constants.MedicalInvoiceDateOfDeathRuleName };
                            switchUnderAssessReasonEnum = SwitchUnderAssessReasonEnum.ServiceDateafterDateofDeath;
                            break;
                    }

                    switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);
                    if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                    {
                        var switchBatchInvoiceUnderAssessReason = new SwitchBatchInvoiceUnderAssessReason
                        {
                            SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                            SwitchUnderAssessReason = switchUnderAssessReasonEnum,
                            UnderAssessReason = Utility.GetEnumDisplayName(switchUnderAssessReasonEnum),
                            IsActive = true,
                            IsDeleted = false
                        };

                        switchInvoiceValidations.InvoiceUnderAssessReasons.Add(switchBatchInvoiceUnderAssessReason);
                    }
                }
            }
            return switchInvoiceValidations;
        }

        private async Task<DateTime> GetDateOfDeath(int personEventID)
        {
            DateTime dateOfDeath = DateTime.MinValue;
            if (personEventID > 0)
            {
                var deathDetails = await _eventService.GetPersonEventDeathDetailByPersonEventId(personEventID);
                if (deathDetails != null && deathDetails.DeathDate != null)
                {
                    return deathDetails.DeathDate;
                }
            }
            return dateOfDeath;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateStaleInvoice(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId
            };

            if (switchBatchInvoice != null)
            {
                var treatmentFromDate = switchBatchInvoice.DateAdmitted;
                var treatmentToDate = switchBatchInvoice.DateDischarged;

                var staleInvoiceData = "{\"TreatmentFromDate\": \"" + treatmentFromDate.ToString() + "\", \"TreatmentToDate\": \"" + treatmentToDate.ToString() + "\"}";
                var ruleRequestStaleInvoice = new RuleRequest()
                {
                    Data = staleInvoiceData,
                    RuleNames = new List<string>() { MediCareRuleTask.StaleInvoice.Constants.StaleInvoiceRuleName }
                };

                switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequestStaleInvoice);

                if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                {
                    var switchBatchInvoiceUnderAssessReason = new SwitchBatchInvoiceUnderAssessReason
                    {
                        SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                        SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.StaleInvoice,
                        UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.StaleInvoice),
                        IsActive = true,
                        IsDeleted = false
                    };

                    switchInvoiceValidations.InvoiceUnderAssessReasons.Add(switchBatchInvoiceUnderAssessReason);
                }
            }
            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateServiceDateInFuture(int switchBatchInvoiceLineId, DateTime? serviceDate)
        {

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoiceLineId
            };

            if (serviceDate.HasValue)
            {
                var ruleData = "{\"ServiceDate\": \"" + serviceDate.ToString() + "\"}";

                var ruleRequest = new RuleRequest()
                {
                    Data = ruleData,
                    RuleNames = new List<string>() { MediCareRuleTask.ServiceDateInFuture.Constants.ServiceDateInFutureRuleName }
                };

                switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);

                if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                {
                    var switchBatchInvoiceLineUnderAssessReason = new SwitchBatchInvoiceLineUnderAssessReason
                    {
                        SwitchBatchInvoiceLineId = switchBatchInvoiceLineId,
                        SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.ServiceDateonInvoiceisFutureDated,
                        UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.ServiceDateonInvoiceisFutureDated),
                        IsActive = true,
                        IsDeleted = false
                    };

                    switchInvoiceValidations.InvoiceLineUnderAssessReasons.Add(switchBatchInvoiceLineUnderAssessReason);
                }
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateBatchInvoiceDates(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId
            };

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var formats = new[] { "dd/MM/yyyy HH:mm:ss", "dd-MM-yyyy HH:mm:ss", "yyyy-MM-dd HH:mm:ss", "yyyy/MM/dd HH:mm:ss" };

                if (switchBatchInvoice != null)
                {
                    var invoiceDateRuleData = "{\"InvoiceDate\": \"" + switchBatchInvoice.InvoiceDate +
                        "\", \"TreatmentFromDate\": \"" + switchBatchInvoice.DateAdmitted +
                        "\", \"TreatmentToDate\": \"" + switchBatchInvoice.DateDischarged + "\"," +
                        "\"SubmittedDate\": \"" + switchBatchInvoice.DateSubmitted +
                        "\",\"ReceivedDate\": \"" + switchBatchInvoice.DateReceived + "\"}";

                    var ruleRequest = new RuleRequest()
                    {
                        Data = invoiceDateRuleData,
                        RuleNames = new List<string>() { MediCareRuleTask.DateIsValid.Constants.DateIsValidRuleName }
                    };

                    switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);
                    if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                    {
                        switchBatchInvoice.SwitchBatchInvoiceUnderAssessReasons.Add(new SwitchBatchInvoiceUnderAssessReason
                        {
                            SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                            SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.InvalidDate,
                            UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.InvalidDate),
                            IsActive = true,
                            IsDeleted = false
                        });
                    }
                }
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateInvoiceLineServiceDateFormat(int switchBatchInvoiceLineId, DateTime? serviceDate)
        {
            Contract.Requires(serviceDate != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoiceLineId
            };

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var formats = new[] { "dd/MM/yyyy HH:mm:ss", "dd-MM-yyyy HH:mm:ss", "yyyy-MM-dd HH:mm:ss", "yyyy/MM/dd HH:mm:ss" };

                string invoiceServiceDate = serviceDate.ToString();

                bool isValid = DateTime.TryParseExact(invoiceServiceDate, formats, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out DateTime checkValidDateValue);

                var serviceDateValid = "{\"ServiceDateInvoiceValid\": \"" + isValid + "\"}";
                var ruleRequest = new RuleRequest()
                {
                    Data = serviceDateValid,
                    RuleNames = new List<string>() { MediCareRuleTask.ServiceDateIsValid.Constants.ServiceDateIsValideRuleName }
                };

                switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);
                if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                {
                    var switchBatchInvoiceLineUnderAssessReason = new SwitchBatchInvoiceLineUnderAssessReason
                    {
                        SwitchBatchInvoiceLineId = switchBatchInvoiceLineId,
                        SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.InvalidDate,
                        UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.InvalidDate),
                        IsActive = true,
                        IsDeleted = false
                    };

                    switchInvoiceValidations.InvoiceLineUnderAssessReasons.Add(switchBatchInvoiceLineUnderAssessReason);
                }
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateICD10CodeFormatBatchInvoice(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId
            };

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var validatedLineiCD10Codes = new List<RuleRequestResult>();
                RuleRequestResult iCD10CodeFormatIsVaidRuleResult;
                if (switchBatchInvoice.SwitchBatchInvoiceLines.Count > 0)
                {
                    foreach (var item in switchBatchInvoice.SwitchBatchInvoiceLines)
                    {
                        var results = ValidationUtils.ValidateICD10CodeFormat(item.Icd10Code);
                        var isValid = results.Count <= 0;
                        var icd10CodeFormatValid = "{\"ICD10CodeFormatValid\": \"" + isValid + "\"}";
                        var ruleRequest = new RuleRequest()
                        {
                            Data = icd10CodeFormatValid,
                            RuleNames = new List<string>() { MediCareRuleTask.ICD10CodeFormatValid.Constants.ICD10CodeFormatValidRuleName },
                            ExecutionFilter = "medical"
                        };
                        iCD10CodeFormatIsVaidRuleResult = await _rulesEngine.ExecuteRules(ruleRequest);
                        validatedLineiCD10Codes.Add(iCD10CodeFormatIsVaidRuleResult);

                        switchInvoiceValidations.RuleRequestResult = iCD10CodeFormatIsVaidRuleResult; // Check for multiple lines

                        if (!iCD10CodeFormatIsVaidRuleResult.OverallSuccess)
                        {

                            var switchBatchInvoiceLineUnderAssessReason = new SwitchBatchInvoiceLineUnderAssessReason
                            {
                                SwitchBatchInvoiceLineId = item.SwitchBatchInvoiceLineId,
                                SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.ICD10Codesuppliedhasinvalidformat,
                                UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.ICD10Codesuppliedhasinvalidformat),
                                IsActive = true,
                                IsDeleted = false
                            };

                            switchInvoiceValidations.InvoiceLineUnderAssessReasons.Add(switchBatchInvoiceLineUnderAssessReason);
                        }
                    }

                    var allICD10CodesFailed = validatedLineiCD10Codes.TrueForAll(a => !a.OverallSuccess);

                    if (allICD10CodesFailed)
                    {
                        var switchBatchInvoiceUnderAssessReason = new SwitchBatchInvoiceUnderAssessReason
                        {
                            SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                            SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.ICD10Codesuppliedhasinvalidformat,
                            UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.ICD10Codesuppliedhasinvalidformat),
                            IsActive = true,
                            IsDeleted = false
                        };

                        switchInvoiceValidations.InvoiceUnderAssessReasons.Add(switchBatchInvoiceUnderAssessReason);
                    }

                }
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateMedicalInvoiceICD10Codes(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId
            };

            if (switchBatchInvoice?.SwitchBatchInvoiceLines == null || !switchBatchInvoice.SwitchBatchInvoiceLines.Any())
            {
                return switchInvoiceValidations;
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var switchBatchInvoiceLines = switchBatchInvoice.SwitchBatchInvoiceLines.Select(x => x).ToList();
                var medicalPreAuthExistCheckParams = new MedicalPreAuthExistCheckParams()
                {
                    DateAdmitted = switchBatchInvoice?.DateAdmitted,
                    DateDischarged = switchBatchInvoice?.DateDischarged,
                    PersonEventId = switchBatchInvoice.PossiblePersonEventId,
                    HealthCareProviderId = switchBatchInvoice.HealthCareProviderId
                };
                var preAuthorisations = await _invoiceCommonService
                    .CheckIfPreAuthExistsCommon(medicalPreAuthExistCheckParams);
                var isChronic = await _medicalInvoiceClaimService.IsChronic(
                    Convert.ToInt32(switchBatchInvoice.PossiblePersonEventId),
                    Convert.ToDateTime(switchBatchInvoice.DateAdmitted));
                var isPreAuthRequired =
                    await _invoiceCommonService.IsPreAuthRequired(
                        Convert.ToInt32(switchBatchInvoice.HealthCareProviderId), isChronic);
                var preAuthId = (preAuthorisations.Count > 0 && isPreAuthRequired)
                    ? preAuthorisations.Select(x => x.PreAuthId).FirstOrDefault()
                    : 0;

                //Validate ICD10Codes on Medical Invoice against Claim Injury
                var invoiceLineIcd10Codes = new List<InvoiceLineICD10Code>();
                foreach (var icd10Code in from invoiceLine in switchBatchInvoiceLines
                                          let splitters = new char[] { ' ', '/' }
                                          from icd10Code in invoiceLine.Icd10Code.Split(splitters)
                                          where invoiceLineIcd10Codes.All(line => line.Icd10Code.Trim() != icd10Code.Trim()) &&
                                                !string.IsNullOrWhiteSpace(icd10Code.Trim())
                                          select icd10Code)
                {
                    invoiceLineIcd10Codes.Add(new InvoiceLineICD10Code()
                    { Icd10CodeId = 0, Icd10Code = icd10Code.Trim(), BodySideId = 0 });
                }

                //then get claim ICD10 ClaimInjuries, PreAuthICD10Codes, & Submitted ICD10CodesToValidate 
                var ruleDataIcd10Codes = await _invoiceCommonService.GetInvoiceLineClaimInjuriesAsync(
                    Convert.ToInt32(switchBatchInvoice.PossiblePersonEventId), preAuthId, invoiceLineIcd10Codes);

                var ruleRequest = new RuleRequest()
                {
                    Data = ruleDataIcd10Codes,
                    RuleNames = new List<string>()
                        { MediCareRuleTask.ICD10CodeMatch.Constants.MedicalInvoiceClaimInjuryName },
                    ExecutionFilter = "medical"
                };

                switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);

                if (isPreAuthRequired && !switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                {
                    //If ICD10 mismatch with claim, look for pre-auth.  If there is a pre-auth with ICD10 mismatch on claim and pre-auth = Pend
                    //BatchStatusEnum will be updated once enum values loaded
                    switchBatchInvoice.SwitchInvoiceStatus = SwitchInvoiceStatusEnum.PendingValidation;
                }
                else
                {
                    //If ICD10 mismatch with claim, then we reject (No Auth)
                    //BatchStatusEnum will be updated once enum values loaded
                    switchBatchInvoice.SwitchInvoiceStatus = SwitchInvoiceStatusEnum.Deleted;
                }
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateExternalCauseCodesSupplied(int switchBatchInvoiceLineId, string lineICD10Code)
        {
            Contract.Requires(!string.IsNullOrWhiteSpace(lineICD10Code));

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoiceLineId
            };

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                char[] splitters = new char[] { ' ', '/' };
                List<int> icd10CodeIds = new List<int>();
                foreach (var icd10Code in lineICD10Code.Split(splitters))
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

                switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequestExternal);
                if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
                {
                    var switchBatchInvoiceLineUnderAssessReason = new SwitchBatchInvoiceLineUnderAssessReason
                    {
                        SwitchBatchInvoiceLineId = switchBatchInvoiceLineId,
                        SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.OnlyexternalICD10causecodesupplied,
                        UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.OnlyexternalICD10causecodesupplied),
                        IsActive = true,
                        IsDeleted = false
                    };

                    switchInvoiceValidations.InvoiceLineUnderAssessReasons.Add(switchBatchInvoiceLineUnderAssessReason);
                }
                return switchInvoiceValidations;
            }
        }

        public async Task<string> GetClaimLiabilityStatus(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            string liabilityStatus = string.Empty;
            if (switchBatchInvoice?.PossiblePersonEventId != null)
            {
                var medicalInvoiceClaimQuery = await _medicalInvoiceClaimService.GetMedicalInvoiceClaimByPersonEventId(Convert.ToInt32(switchBatchInvoice.PossiblePersonEventId));
                if (medicalInvoiceClaimQuery != null)
                {
                    liabilityStatus = medicalInvoiceClaimQuery.ClaimLiabilityStatus;
                }
            }
            return liabilityStatus;
        }

        public async Task<string> GetClaimReferenceNumberByClaimId(int claimId)
        {
            string claimReferenceNumber = string.Empty;
            if (claimId > 0)
            {
                var claimDetails = await _claimService.GetClaimDetailsById(claimId);
                if (claimDetails != null)
                {
                    claimReferenceNumber = claimDetails.ClaimReferenceNumber;
                }
            }
            return claimReferenceNumber;
        }

        public async Task<bool> CheckIfIsValidClaim(string claimReferenceNumber)
        {
            bool isValidClaim = false;
            if (!string.IsNullOrEmpty(claimReferenceNumber))
            {
                string claimReferenceNumberValue = CleanClaimNumberCharacters(claimReferenceNumber);
                var claimsList = await _claimService.GetClaimsByClaimReferenceNumber(claimReferenceNumberValue);
                if (claimsList != null && claimsList.Count > 0)
                {
                    foreach (var claim in claimsList)
                    {
                        if (claim.ClaimId > 0)
                        {
                            isValidClaim = true;
                            break;
                        }
                    }
                }
            }
            return isValidClaim;
        }

        private string CleanClaimNumberCharacters(string claimReferenceNumber)
        {
            return claimReferenceNumber?.Replace(@"\", "/").Replace("*", "").Replace("-", "").Replace("_", "").Replace("   ", "").Replace(" ", "");
        }

        private string GetClaimsByMissingClaimReferenceNumberSlashes(string claimReferenceNumber)
        {
            List<int> forwardSlashPositions = new List<int> { 1, 9 };

            if (!string.IsNullOrEmpty(claimReferenceNumber) && char.IsLetter(claimReferenceNumber[0]))
            {
                StringBuilder sb = new StringBuilder(claimReferenceNumber);

                foreach (int position in forwardSlashPositions)
                {
                    if (position < sb.Length && sb[position] != '/')
                    {
                        sb.Insert(position, "/");
                    }
                }
                return sb.ToString().Substring(0, 10);

            }
            return claimReferenceNumber;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateInvoiceAmountGreaterThanZero(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoice.SwitchBatchInvoiceId
            };

            var ruleData = "{\"InvoiceAmount\": \"" + switchBatchInvoice.TotalInvoiceAmount + "\"}";
            var ruleRequest = new RuleRequest()
            {
                Data = ruleData,
                RuleNames = new List<string>() { MediCareRuleTask.InvoiceAmountGreaterThanZero.Constants.InvoiceAmountGreaterThanZeroRuleName },
                ExecutionFilter = "medical"
            };

            switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);
            if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
            {
                var switchBatchInvoiceUnderAssessReason = new SwitchBatchInvoiceUnderAssessReason
                {
                    SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                    SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.Amountorquantityiszero,
                    UnderAssessReason = SwitchUnderAssessReasonEnum.Amountorquantityiszero.GetDescription(),
                    IsActive = true,
                    IsDeleted = false
                };

                switchInvoiceValidations.InvoiceUnderAssessReasons.Add(switchBatchInvoiceUnderAssessReason);
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateInvoiceLineAmountGreaterThanZero(SwitchBatchInvoiceLine switchBatchInvoiceLine)
        {
            Contract.Requires(switchBatchInvoiceLine != null);

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoiceLine.SwitchBatchInvoiceLineId
            };

            var ruleData = "{\"InvoiceLineAmount\": \"" + switchBatchInvoiceLine.TotalInvoiceLineCost + "\"}";
            var ruleRequest = new RuleRequest()
            {
                Data = ruleData,
                RuleNames = new List<string>() { MediCareRuleTask.InvoiceLineAmountGreaterThanZero.Constants.InvoiceLineAmountGreaterThanZeroRuleName },
                ExecutionFilter = "medical"
            };

            switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);
            if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
            {
                var switchBatchInvoiceLineUnderAssessReason = new SwitchBatchInvoiceLineUnderAssessReason
                {
                    SwitchBatchInvoiceLineId = switchBatchInvoiceLine.SwitchBatchInvoiceLineId,
                    SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.Amountorquantityiszero,
                    UnderAssessReason = SwitchUnderAssessReasonEnum.Amountorquantityiszero.GetDescription(),
                    IsActive = true,
                    IsDeleted = false
                };

                switchInvoiceValidations.InvoiceLineUnderAssessReasons.Add(switchBatchInvoiceLineUnderAssessReason);
            }

            return switchInvoiceValidations;
        }

        public async Task UpdateSwitchBatchAfterInvoiceIsProcessed(int switchBatchInvoiceId, int switchBatchId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var switchBatch = await _medicalSwitchBatchRepository.FirstOrDefaultAsync(b =>
                    b.SwitchBatchId == switchBatchId);
                if (switchBatch == null) return;
                var switchBatchUnprocessedInvoices = await _medicalSwitchBatchInvoiceRepository
                    .Where(i => i.SwitchBatchId == switchBatch.SwitchBatchId && i.InvoiceId == null && i.SwitchInvoiceStatus != SwitchInvoiceStatusEnum.Deleted).ToListAsync();
                if (switchBatchUnprocessedInvoices.Count == 1 &&
                    switchBatchUnprocessedInvoices[0].SwitchBatchInvoiceId == switchBatchInvoiceId)
                {
                    switchBatch.DateCompleted = DateTimeHelper.SaNow;
                    switchBatch.IsProcessed = true;
                }
                else
                {
                    switchBatch.DateCompleted = null;
                }

                var switchBatchProcessedInvoices = await _medicalSwitchBatchInvoiceRepository
                    .Where(i => i.SwitchBatchId == switchBatch.SwitchBatchId && (i.InvoiceId != null || i.SwitchInvoiceStatus == SwitchInvoiceStatusEnum.Deleted)).ToListAsync();
                switchBatch.InvoicesProcessed = switchBatchProcessedInvoices.Count + 1;

                var switchBatchInvoice =
                    await _medicalSwitchBatchInvoiceRepository.SingleAsync(b => b.SwitchBatchInvoiceId == switchBatchInvoiceId);
                if (switchBatchInvoice.TotalInvoiceAmountInclusive != null)
                    switchBatch.AmountProcessed =
                        switchBatchProcessedInvoices.Sum(i => Convert.ToDecimal(i.TotalInvoiceAmountInclusive)) +
                        switchBatchInvoice.TotalInvoiceAmountInclusive.Value;


                _medicalSwitchBatchRepository.Update(switchBatch);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task MarkSwitchBatchInvoiceAsProcessed(int switchBatchInvoiceId, int medicalInvoiceId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _medicalSwitchBatchInvoiceRepository.FirstOrDefaultAsync(a => a.SwitchBatchInvoiceId == switchBatchInvoiceId);
                if (entity == null) return;
                entity.InvoiceId = medicalInvoiceId;
                entity.IsProcessed = true;
                entity.ModifiedBy = RmaIdentity.Email;
                entity.SwitchInvoiceStatus = entity.SwitchInvoiceStatus == SwitchInvoiceStatusEnum.Reinstated ||
                                             entity.SwitchInvoiceStatus == SwitchInvoiceStatusEnum.ManualProcess
                    ? SwitchInvoiceStatusEnum.UserLinked
                    : SwitchInvoiceStatusEnum.AutoLinked;
                _medicalSwitchBatchInvoiceRepository.Update(entity);

                await UpdateSwitchBatchAfterInvoiceIsProcessed(entity.SwitchBatchInvoiceId, entity.SwitchBatchId);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<bool> MapSwitchBatchInvoice(SwitchBatchInvoiceMapParams switchBatchInvoiceMapParams)
        {
            Contract.Requires(switchBatchInvoiceMapParams != null);
            RmaIdentity.DemandPermission(Permissions.MapSwitchMedicalInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var switchBatchinvoice = await _medicalSwitchBatchInvoiceRepository.FirstOrDefaultAsync(b => b.SwitchBatchInvoiceId == switchBatchInvoiceMapParams.SwitchBatchInvoiceId);

                if (switchBatchInvoiceMapParams.PossiblePersonEventId > 0)
                    switchBatchinvoice.PossiblePersonEventId = switchBatchInvoiceMapParams.PossiblePersonEventId;
                else
                    switchBatchinvoice.PossiblePersonEventId = null;
                if (switchBatchInvoiceMapParams.PossibleEventId > 0)
                    switchBatchinvoice.PossibleEventId = switchBatchInvoiceMapParams.PossibleEventId;
                else
                    switchBatchinvoice.PossibleEventId = null;
                if (switchBatchInvoiceMapParams.ClaimId > 0)
                    switchBatchinvoice.ClaimId = switchBatchInvoiceMapParams.ClaimId;
                else
                    switchBatchinvoice.ClaimId = null;
                switchBatchinvoice.ClaimReferenceNumberMatch = string.IsNullOrWhiteSpace(switchBatchInvoiceMapParams.ClaimReferenceNumberMatch) ? null : switchBatchInvoiceMapParams.ClaimReferenceNumberMatch;
                switchBatchinvoice.ModifiedBy = RmaIdentity.Email;

                _medicalSwitchBatchInvoiceRepository.Update(switchBatchinvoice);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task<SwitchInvoiceStatusEnum> GetBatchInvoiceStatusForUnderAssessReasons(
            List<int> invoiceUnderAssessReasonList)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var filteredActionList = await _medicalSwitchUnderAssessReasonSetting
                    .Where<medical_SwitchUnderAssessReasonSetting>(n => invoiceUnderAssessReasonList.Contains(n.Id))
                    .Select(x => x.Action).Distinct().ToListAsync();
                if (filteredActionList.Any())
                {
                    if (filteredActionList.Contains(SwitchInvoiceStatusEnum.Deleted.GetDescription()))
                    {
                        return SwitchInvoiceStatusEnum.Deleted;
                    }

                    if (filteredActionList.Contains(SwitchInvoiceStatusEnum.ManualProcess.GetDescription()))
                    {
                        return SwitchInvoiceStatusEnum.ManualProcess;
                    }

                    return SwitchInvoiceStatusEnum.AutoLinked;
                }

                return SwitchInvoiceStatusEnum.AutoLinked;
            }
        }

        public async Task<SwitchInvoiceValidationModel> ValidateSwitchInvoiceAllLineStatus(int switchBatchInvoiceId, bool isSwitchInvoiceAllLineActionReject)
        {

            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoiceId
            };

            if (isSwitchInvoiceAllLineActionReject)
            {
                var switchBatchInvoiceUnderAssessReason = new SwitchBatchInvoiceUnderAssessReason
                {
                    SwitchBatchInvoiceId = switchBatchInvoiceId,
                    SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.TheInvoiceRejectedForNoValidLines,
                    UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.TheInvoiceRejectedForNoValidLines),
                    IsActive = true,
                    IsDeleted = false
                };

                switchInvoiceValidations.InvoiceUnderAssessReasons.Add(switchBatchInvoiceUnderAssessReason);
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateDuplicateSwitchInvoice(int switchBatchInvoiceId, bool isDuplicateInvoiceExists)
        {
            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoiceId
            };

            var duplicateExists = "{\"DuplicateInvoiceExists\": \"" + isDuplicateInvoiceExists + "\"}";
            var ruleRequest = new RuleRequest()
            {
                Data = duplicateExists,
                RuleNames = new List<string>() { MediCareRuleTask.DuplicateInvoice.Constants.DuplicateInvoiceRuleName }
            };

            switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);

            if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
            {
                var switchBatchInvoiceUnderAssessReason = new SwitchBatchInvoiceUnderAssessReason
                {
                    SwitchBatchInvoiceId = switchBatchInvoiceId,
                    SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.InvoiceisaduplicaterefertoPortalfordetails,
                    UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.InvoiceisaduplicaterefertoPortalfordetails),
                    IsActive = true,
                    IsDeleted = false
                };

                switchInvoiceValidations.InvoiceUnderAssessReasons.Add(switchBatchInvoiceUnderAssessReason);
            }

            return switchInvoiceValidations;
        }

        public async Task<SwitchInvoiceValidationModel> ValidateDuplicateSwitchInvoiceLine(int switchBatchInvoiceLineId, bool isDuplicateInvoiceLineExists)
        {
            var switchInvoiceValidations = new SwitchInvoiceValidationModel
            {
                RuleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() },
                InvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>(),
                InvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>(),
                ValidatedObjectId = switchBatchInvoiceLineId
            };

            var duplicateExists = "{\"DuplicateInvoiceLineExists\": \"" + isDuplicateInvoiceLineExists + "\"}";
            var ruleRequest = new RuleRequest()
            {
                Data = duplicateExists,
                RuleNames = new List<string>()
                    { MediCareRuleTask.DuplicateLineItem.Constants.DuplicateLineItemValidationRuleName }
            };

            switchInvoiceValidations.RuleRequestResult = await _rulesEngine.ExecuteRules(ruleRequest);

            if (!switchInvoiceValidations.RuleRequestResult.OverallSuccess)
            {
                var switchBatchInvoiceLineUnderAssessReason = new SwitchBatchInvoiceLineUnderAssessReason
                {
                    SwitchBatchInvoiceLineId = switchBatchInvoiceLineId,
                    SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.CodeisaduplicaterefertoPortalfordetails,
                    UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.CodeisaduplicaterefertoPortalfordetails),
                    IsActive = true,
                    IsDeleted = false
                };
                switchInvoiceValidations.InvoiceLineUnderAssessReasons.Add(switchBatchInvoiceLineUnderAssessReason);
            }

            return switchInvoiceValidations;
        }
    }
}
