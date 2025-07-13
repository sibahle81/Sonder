using AutoMapper;

using Newtonsoft.Json;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.Integrations.Contracts.Entities.MediCare;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Entities.Teba;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Constants;
using RMA.Service.MediCare.Database.Entities;
using RMA.Service.MediCare.RuleTasks.Enums;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;
using TebaInvoice = RMA.Service.MediCare.Contracts.Entities.Medical.TebaInvoice;
using TebaInvoiceLine = RMA.Service.MediCare.Contracts.Entities.Medical.TebaInvoiceLine;

namespace RMA.Service.MediCare.Services.Medical
{
    public class InvoiceHelperFacade : RemotingStatelessService, IInvoiceHelperService
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
        private readonly IRepository<medical_TariffBaseUnitCostType> _tariffBaseUnitCostTypeRepository;
        private readonly IMediCareService _mediCareService;
        private readonly IUserService _userService;
        private readonly IWizardService _wizardService;
        private readonly IRoleService _roleService;
        private readonly IWizardConfigurationRouteSettingService _wizardConfigurationRouteSettingService;
        private readonly MedicalWorkflowManagement _medicalWorkflowManagement;
        private readonly IInvoiceCommonService _invoiceCommonService;
        private readonly IConfigurationService _configurationService;
        private readonly IClaimService _claimService;
        private readonly IPayeeTypeService _payeeTypeService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IHealthCareProviderService _healthcareProviderService;
        private readonly ICompCareIntegrationService _compCareIntegrationService;
        private readonly IInvoiceCompCareMapService _invoiceCompCareMapService;
        private readonly IUnderAssessReasonService _underAssessReasonService;
        private readonly ISwitchInvoiceHelperService _switchInvoiceHelperService;

        public InvoiceHelperFacade(StatelessServiceContext context
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
            , IRepository<medical_TariffBaseUnitCostType> tariffBaseUnitCostTypeRepository
            , IUserService userService
            , IMediCareService mediCareService
            , IWizardService wizardService
            , IRoleService roleService
            , IWizardConfigurationRouteSettingService wizardConfigurationRouteSettingService
            , IInvoiceCommonService invoiceCommonService
            , IConfigurationService configurationService
            , IClaimService claimService
            , IPayeeTypeService payeeTypeService
            , IDocumentGeneratorService documentGeneratorService
            , IHealthCareProviderService healthcareProviderService
            , ICompCareIntegrationService compCareIntegrationService
            , IInvoiceCompCareMapService invoiceCompCareMapService
            , IUnderAssessReasonService underAssessReasonService
            , ISwitchInvoiceHelperService switchInvoiceHelperService
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
            _tariffBaseUnitCostTypeRepository = tariffBaseUnitCostTypeRepository;
            _userService = userService;
            _mediCareService = mediCareService;
            _wizardService = wizardService;
            _roleService = roleService;
            _wizardConfigurationRouteSettingService = wizardConfigurationRouteSettingService;
            _medicalWorkflowManagement = new MedicalWorkflowManagement(_mediCareService, _wizardService, _roleService, _userService, _wizardConfigurationRouteSettingService);
            _invoiceCommonService = invoiceCommonService;
            _configurationService = configurationService;
            _claimService = claimService;
            _payeeTypeService = payeeTypeService;
            _documentGeneratorService = documentGeneratorService;
            _healthcareProviderService = healthcareProviderService;
            _compCareIntegrationService = compCareIntegrationService;
            _invoiceCompCareMapService = invoiceCompCareMapService;
            _underAssessReasonService = underAssessReasonService;
            _switchInvoiceHelperService = switchInvoiceHelperService;
        }

        public async Task<bool> AutoReinstateMedicalInvoice(int invoiceId, int tebaInvoiceId, int personEventId)
        {
            bool useTebaInvoiceId = tebaInvoiceId > 0;
            var invoiceIdsResult = await _invoiceCommonService.GetPendingInvoiceIdsByPersonEventId(invoiceId, tebaInvoiceId, personEventId);

            foreach (var invId in invoiceIdsResult)
            {
                if (useTebaInvoiceId)
                {
                    await ReinstateMedicalInvoice(0, invId);

                }
                else if (!useTebaInvoiceId)
                {
                    await ReinstateMedicalInvoice(invId, 0);
                }

            }

            return true;
        }

        public async Task<List<InvoiceUnderAssessReason>> ReinstateMedicalInvoice(int invoiceId, int tebaInvoiceId)
        {
            return await AutoPayRun(invoiceId, tebaInvoiceId);
        }

        public async Task<List<InvoiceUnderAssessReason>> AutoPayRun(int invoiceId, int tebaInvoiceId)
        {
            bool useMediInvoiceId = invoiceId > 0;
            List<InvoiceUnderAssessReason> invoiceUnderAssessReasons = new List<InvoiceUnderAssessReason>();
            InvoiceValidationModel invoiceHeaderValidationsResult = new InvoiceValidationModel();
            InvoiceValidationModel invoiceLineValidationsResult = new InvoiceValidationModel();
            var invoiceDetails = new InvoiceDetails();
            var tebaInvoice = new TebaInvoice();
            //Below is a list of all cliam statuses that are considered as Liability accepted in Medicare
            List<InvoiceStatusEnum> step1InvoiceStatuses = new List<InvoiceStatusEnum>
            {
                InvoiceStatusEnum.Captured,
                InvoiceStatusEnum.Pending,
                InvoiceStatusEnum.Rejected
            };

            if (useMediInvoiceId)
            {
                invoiceDetails = await _invoiceCommonService.GetInvoiceDetails(invoiceId);
            }
            else if (!useMediInvoiceId)
            {
                tebaInvoice = await _invoiceCommonService.GetTebaInvoice(tebaInvoiceId);
            }

            if (invoiceDetails != null || tebaInvoice != null)
            {
                var isTrueInvoiceStatus = step1InvoiceStatuses.Contains(invoiceDetails.InvoiceStatus);
                var isTrueTebaInvoiceStatus = step1InvoiceStatuses.Contains(tebaInvoice.InvoiceStatus);
                // Step 1: Only run if invoice is captured, edited or reinstated and needs to be validated
                if (isTrueInvoiceStatus || isTrueTebaInvoiceStatus)
                {

                    if (useMediInvoiceId && isTrueInvoiceStatus)
                    {
                        invoiceHeaderValidationsResult = await _invoiceCommonService.ExecuteInvoiceValidations(invoiceDetails);
                        invoiceLineValidationsResult = await _invoiceCommonService.ExecuteInvoiceLineValidations(invoiceDetails);
                    }
                    else if (!useMediInvoiceId && isTrueTebaInvoiceStatus)
                    {
                        invoiceHeaderValidationsResult = await _invoiceCommonService.ExecuteTebaInvoiceValidations(tebaInvoice);
                        invoiceLineValidationsResult = await _invoiceCommonService.ExecuteTebaInvoiceLineValidations(tebaInvoice);
                    }

                    if (invoiceHeaderValidationsResult != null && invoiceHeaderValidationsResult.UnderAssessReasons.Any())
                    {
                        await _invoiceCommonService.SaveInvoiceUnderAssessReasonsToDB(invoiceId, tebaInvoiceId, invoiceHeaderValidationsResult.UnderAssessReasons);
                    }

                    if (invoiceLineValidationsResult != null && invoiceLineValidationsResult.LineUnderAssessReasons.Any())
                    {
                        await _invoiceCommonService.SaveInvoiceLineUnderAssessReasonsToDB(invoiceLineValidationsResult.LineUnderAssessReasons);
                    }

                    if (invoiceHeaderValidationsResult != null && invoiceHeaderValidationsResult.UnderAssessReasons.Any())
                    {
                        invoiceHeaderValidationsResult.UnderAssessReasons.ForEach(result =>
                        {
                            invoiceUnderAssessReasons.Add(result);
                        });
                    }

                    if (invoiceUnderAssessReasons.Count > 0 && !checkInvoiceAmountExceedsAllocatedAmountOnly(invoiceUnderAssessReasons.Count, invoiceUnderAssessReasons))
                    {
                        invoiceDetails.InvoiceStatus = await _invoiceCommonService.SetInvoiceStatus(invoiceId, tebaInvoiceId, invoiceUnderAssessReasons, InvoiceStatusEnum.Validated);
                    }
                    else
                    {
                        invoiceDetails.InvoiceStatus = InvoiceStatusEnum.Validated;
                    }

                    if (invoiceDetails.InvoiceStatus == InvoiceStatusEnum.Pending && invoiceHeaderValidationsResult != null && invoiceLineValidationsResult != null)
                    {
                        if(invoiceDetails != null)
                            await _medicalWorkflowManagement.SendNotificationForPendMedicalInvoice(invoiceDetails, invoiceHeaderValidationsResult.UnderAssessReasons, invoiceLineValidationsResult.LineUnderAssessReasons);
                    }

                    if (invoiceDetails.InvoiceStatus == InvoiceStatusEnum.Rejected && invoiceHeaderValidationsResult != null && invoiceLineValidationsResult != null
                        && invoiceHeaderValidationsResult.RuleRequestResult.RuleResults.Any(x => x.RuleName == "Claim liability status validation" && !x.Passed))
                    {
                        if (invoiceDetails != null)
                            await _medicalWorkflowManagement.SendNotificationForRejectMedicalInvoice(invoiceDetails, invoiceHeaderValidationsResult.UnderAssessReasons, invoiceLineValidationsResult.LineUnderAssessReasons, true);
                    }
                }

                // Step 2: Only run if Invoice is validated and needs to be allocated
                var invoiceLines = new List<InvoiceLine>();
                var tebaInvoiceLines = new List<TebaInvoiceLine>();
                if (invoiceDetails.InvoiceStatus == InvoiceStatusEnum.Validated || tebaInvoice.InvoiceStatus == InvoiceStatusEnum.Validated)
                {
                    decimal invoiceAuthorisedAmount = 0.00M, invoiceAuthorisedVat = 0.00M;

                    if (invoiceDetails.InvoiceLineDetails != null && invoiceDetails.InvoiceLineDetails.Count > 0)
                    {

                        foreach (var invoiceLine in invoiceDetails.InvoiceLineDetails)
                        {
                            //exclude rejected lines
                            if (invoiceLine != null && (invoiceLine.InvoiceLineUnderAssessReasons == null || invoiceLine.InvoiceLineUnderAssessReasons.Count == 0))
                            {
                                invoiceLine.AuthorisedQuantity = Convert.ToDecimal(invoiceLine.RequestedQuantity);
                                invoiceLine.AuthorisedAmount = invoiceLine.RequestedAmount;
                                invoiceLine.AuthorisedVat = invoiceLine.RequestedVat;
                                invoiceAuthorisedAmount += Convert.ToDecimal(invoiceLine.AuthorisedAmount);
                                invoiceAuthorisedVat += Convert.ToDecimal(invoiceLine.AuthorisedVat);
                            }

                            invoiceLines.Add(invoiceLine);
                        }
                        invoiceDetails.InvoiceLines = invoiceLines;

                        invoiceDetails.AuthorisedAmount = invoiceAuthorisedAmount;
                        invoiceDetails.AuthorisedVat = invoiceAuthorisedVat;

                        var autoAssessResult = await _invoiceCommonService.AutoAssessInvoice(invoiceDetails);
                        if (autoAssessResult?.Count > 0)
                        {
                            await _invoiceCommonService.SaveInvoiceUnderAssessReasonsToDB(invoiceId, tebaInvoiceId, autoAssessResult);

                            if (!checkInvoiceAmountExceedsAllocatedAmountOnly(autoAssessResult.Count, autoAssessResult))
                            {
                                invoiceDetails.InvoiceStatus = await _invoiceCommonService.SetInvoiceStatus(invoiceId, tebaInvoiceId, autoAssessResult, InvoiceStatusEnum.Allocated);
                            }
                            else
                            {
                                invoiceDetails.InvoiceStatus = InvoiceStatusEnum.Allocated;
                            }

                            autoAssessResult.ForEach(result =>
                            {
                                invoiceUnderAssessReasons.Add(result);
                            });
                        }
                        else
                        {
                            //after validation process is done if all looks fine then update invoice status with Allocated.
                            //This is an in-memory save as permanet save has already been done by AutoAssessInvoice method
                            invoiceDetails.InvoiceStatus = InvoiceStatusEnum.Allocated;
                        }
                    }
                    else if (tebaInvoice.TebaInvoiceLines != null && tebaInvoice.TebaInvoiceLines.Count > 0)
                    {

                        foreach (var tebaInvoiceLine in tebaInvoice.TebaInvoiceLines)
                        {
                            //exclude rejected lines
                            if (tebaInvoiceLine != null && (tebaInvoiceLine.InvoiceLineUnderAssessReasons == null || tebaInvoiceLine.InvoiceLineUnderAssessReasons.Count == 0))
                            {
                                tebaInvoiceLine.AuthorisedQuantity = Convert.ToDecimal(tebaInvoiceLine.RequestedQuantity);
                                tebaInvoiceLine.AuthorisedAmount = tebaInvoiceLine.RequestedAmount;
                                tebaInvoiceLine.AuthorisedVat = tebaInvoiceLine.RequestedVat;
                                invoiceAuthorisedAmount += Convert.ToDecimal(tebaInvoiceLine.AuthorisedAmount);
                                invoiceAuthorisedVat += Convert.ToDecimal(tebaInvoiceLine.AuthorisedVat);
                            }

                            tebaInvoiceLines.Add(tebaInvoiceLine);
                        }
                        tebaInvoice.TebaInvoiceLines = tebaInvoiceLines;

                        tebaInvoice.AuthorisedAmount = invoiceAuthorisedAmount;
                        tebaInvoice.AuthorisedVat = invoiceAuthorisedVat;

                        var autoAssessResult = await _invoiceCommonService.AutoAssessTebaInvoice(tebaInvoice);
                        if (autoAssessResult?.Count > 0)
                        {
                            await _invoiceCommonService.SaveInvoiceUnderAssessReasonsToDB(invoiceId, tebaInvoiceId, autoAssessResult);

                            if (!checkInvoiceAmountExceedsAllocatedAmountOnly(autoAssessResult.Count, autoAssessResult))
                            {
                                tebaInvoice.InvoiceStatus = await _invoiceCommonService.SetInvoiceStatus(invoiceId, tebaInvoiceId, autoAssessResult, InvoiceStatusEnum.Allocated);
                            }
                            else
                            {
                                tebaInvoice.InvoiceStatus = InvoiceStatusEnum.Allocated;
                            }

                            autoAssessResult.ForEach(result =>
                            {
                                invoiceUnderAssessReasons.Add(result);
                            });
                        }
                        else
                        {
                            //after validation process is done if all looks fine then update invoice status with Allocated.
                            //This is an in-memory save as permanet save has already been done by AutoAssessInvoice method
                            tebaInvoice.InvoiceStatus = InvoiceStatusEnum.Allocated;
                        }
                    }


                }

                // Step 3: Only run if Invoice is allocated and requires payment request
                if (invoiceDetails.InvoiceStatus == InvoiceStatusEnum.Allocated || tebaInvoice.InvoiceStatus == InvoiceStatusEnum.Allocated)
                {
                    //Validate Payment Request
                    List<InvoiceUnderAssessReason > validatePaymentRequestResult = new List<InvoiceUnderAssessReason> ();
                    
                    if (useMediInvoiceId)
                    {
                        validatePaymentRequestResult = await _invoiceCommonService.ValidatePaymentRequest(invoiceDetails);
                    }
                    else if (!useMediInvoiceId)
                    {
                        validatePaymentRequestResult = await _invoiceCommonService.ValidateTebaPaymentRequest(tebaInvoice);
                    }

                    if (validatePaymentRequestResult.Any())
                    {
                        if (validatePaymentRequestResult.Count > 0)
                        {
                            await _invoiceCommonService.SaveInvoiceUnderAssessReasonsToDB(invoiceId, tebaInvoiceId, validatePaymentRequestResult);
                            validatePaymentRequestResult.ForEach(result =>
                            {
                                invoiceUnderAssessReasons.Add(result);
                            });

                            if (!checkInvoiceAmountExceedsAllocatedAmountOnly(validatePaymentRequestResult.Count, validatePaymentRequestResult))
                            {
                                await _invoiceCommonService.SetInvoiceStatus(invoiceId, tebaInvoiceId, validatePaymentRequestResult, InvoiceStatusEnum.PaymentRequested);
                            }
                        }

                    }
                }
            }

            return invoiceUnderAssessReasons;
        }

        public async Task<List<InvoiceUnderAssessReason>> AutoPayRunSTPIntegration(int invoiceId)
        {
            var invoiceUnderAssessReasons = new List<InvoiceUnderAssessReason>();
            var invoiceDetails = await _invoiceCommonService.GetInvoiceDetails(invoiceId);
            bool stpIsFeatureFlagSettingEnabled = await _invoiceCommonService.GetSTPIsFeatureFlagSettingEnabledCommon();

            if (invoiceDetails != null)
            {
                // Step 1: Only run if invoice is captured, edited or reinstated and needs to be validated
                if (invoiceDetails.InvoiceStatus == InvoiceStatusEnum.Captured || invoiceDetails.InvoiceStatus == InvoiceStatusEnum.Pending
                        || invoiceDetails.InvoiceStatus == InvoiceStatusEnum.Rejected)
                {

                    var invoiceHeaderValidationsResult = await _invoiceCommonService.ExecuteInvoiceValidationsSTPIntegration(invoiceDetails);
                    if (invoiceHeaderValidationsResult != null && invoiceHeaderValidationsResult.UnderAssessReasons?.Count > 0)
                    {
                        await _invoiceCommonService.SaveInvoiceUnderAssessReasonsToDB(invoiceDetails.InvoiceId, 0, invoiceHeaderValidationsResult.UnderAssessReasons);
                    }
                    var invoiceLineValidationsResult = await _invoiceCommonService.ExecuteInvoiceLineValidationsSTPIntegration(invoiceDetails);
                    if (invoiceLineValidationsResult != null && invoiceLineValidationsResult.LineUnderAssessReasons?.Count > 0)
                    {
                        await _invoiceCommonService.SaveInvoiceLineUnderAssessReasonsToDB(invoiceLineValidationsResult.LineUnderAssessReasons);

                        var rejectForICDMismatch = false;
                        var invoiceDetailsUpdated = await _invoiceCommonService.GetInvoiceDetails(invoiceId);

                        foreach (var lineItem in invoiceDetailsUpdated.InvoiceLineDetails)
                        {
                            if (lineItem.InvoiceLineUnderAssessReasons.Any(
                                result => result.UnderAssessReasonId.Equals((int)UnderAssessReasonEnum.icd10CodeMismatchToClaimICD10)))
                            {
                                rejectForICDMismatch = true;
                            }
                            else
                            {
                                rejectForICDMismatch = false;
                                break;
                            }
                        }

                        if (rejectForICDMismatch)
                        {
                            var underAssessReason = await _underAssessReasonService.GetUnderAssessReason((int)UnderAssessReasonEnum.icd10CodeMismatchToClaimICD10Reject);
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason { UnderAssessReasonId = (int)UnderAssessReasonEnum.icd10CodeMismatchToClaimICD10Reject, UnderAssessReason = underAssessReason.Description });
                        }
                    }

                    if (invoiceHeaderValidationsResult != null && invoiceHeaderValidationsResult.UnderAssessReasons?.Count > 0)
                    {
                        invoiceHeaderValidationsResult.UnderAssessReasons.ForEach(result =>
                        {
                            invoiceUnderAssessReasons.Add(result);
                        });
                    }

                    if (!checkInvoiceAmountExceedsAllocatedAmountOnly(invoiceUnderAssessReasons.Count, invoiceUnderAssessReasons))
                    {
                        invoiceDetails.InvoiceStatus = await _invoiceCommonService.SetInvoiceStatus(invoiceId, 0, invoiceUnderAssessReasons, InvoiceStatusEnum.Validated);
                    }

                    //post updates to compcare
                    await _compCareIntegrationService.SendMedicalInvoiceResponseMessage(invoiceId, Integrations.Contracts.Enums.ActionEnum.Update);
                }

                // Step 2: Only run if Invoice is validated and needs to be allocated
                var invoiceLines = new List<InvoiceLine>();
                if (invoiceDetails.InvoiceStatus == InvoiceStatusEnum.Validated)
                {
                    decimal invoiceAuthorisedAmount = 0.00M, invoiceAuthorisedVat = 0.00M;

                    foreach (var invoiceLine in invoiceDetails.InvoiceLineDetails)
                    {
                        var currentInvoiceLine = await _invoiceCommonService.SetInvoiceLine(invoiceLine);

                        invoiceLines.Add(currentInvoiceLine);

                        //exclude rejected lines
                        if (invoiceLine != null && (invoiceLine.InvoiceLineUnderAssessReasons == null || invoiceLine.InvoiceLineUnderAssessReasons.Count == 0))
                        {
                            invoiceLine.AuthorisedQuantity = Convert.ToDecimal(invoiceLine.RequestedQuantity);
                            invoiceLine.AuthorisedAmount = invoiceLine.RequestedAmount;
                            invoiceLine.AuthorisedVat = invoiceLine.RequestedVat;
                            invoiceAuthorisedAmount += Convert.ToDecimal(invoiceLine.AuthorisedAmount);
                            invoiceAuthorisedVat += Convert.ToDecimal(invoiceLine.AuthorisedVat);
                        }
                    }
                    invoiceDetails.InvoiceLines = invoiceLines;

                    invoiceDetails.AuthorisedAmount = invoiceAuthorisedAmount;
                    invoiceDetails.AuthorisedVat = invoiceAuthorisedVat;

                    var autoAssessResult = await _invoiceCommonService.AutoAssessInvoice(invoiceDetails);
                    if (autoAssessResult?.Count > 0)
                    {
                        await _invoiceCommonService.SaveInvoiceUnderAssessReasonsToDB(invoiceDetails.InvoiceId, 0, autoAssessResult);
                    }

                    if (!checkInvoiceAmountExceedsAllocatedAmountOnly(autoAssessResult.Count, autoAssessResult))
                    {

                        invoiceDetails.InvoiceStatus = await _invoiceCommonService.SetInvoiceStatus(invoiceId, 0, autoAssessResult, InvoiceStatusEnum.Allocated);
                    }

                    //post updates to compcare
                    await _compCareIntegrationService.SendMedicalInvoiceResponseMessage(invoiceId, Integrations.Contracts.Enums.ActionEnum.Update);
                }

                // Step 3: Only run if Invoice is allocated and requires payment request
                if (invoiceDetails.InvoiceStatus == InvoiceStatusEnum.Allocated)
                {
                    //Validate Payment Request
                    var validatePaymentRequestResult = await _invoiceCommonService.ValidatePaymentRequest(invoiceDetails);
                    if (validatePaymentRequestResult.Any())
                    {
                        if (validatePaymentRequestResult.Count > 0)
                        {
                            await _invoiceCommonService.SaveInvoiceUnderAssessReasonsToDB(invoiceDetails.InvoiceId, 0, validatePaymentRequestResult);
                            validatePaymentRequestResult.ForEach(result =>
                            {
                                invoiceUnderAssessReasons.Add(result);
                            });

                            if (!checkInvoiceAmountExceedsAllocatedAmountOnly(validatePaymentRequestResult.Count, validatePaymentRequestResult))
                            {
                                await _invoiceCommonService.SetInvoiceStatus(invoiceId, 0, validatePaymentRequestResult, InvoiceStatusEnum.PaymentRequested);
                            }

                        }

                    }

                    if (stpIsFeatureFlagSettingEnabled)
                    {
                        //post updates to compcare
                        await _compCareIntegrationService.SendMedicalInvoiceResponseMessage(invoiceId, Integrations.Contracts.Enums.ActionEnum.Update);
                    }

                }
            }

            return invoiceUnderAssessReasons;
        }

        private bool checkInvoiceAmountExceedsAllocatedAmountOnly(int underAssessReasonCount, List<InvoiceUnderAssessReason> underAssessReasons)
        {
            return (underAssessReasonCount == 1 && underAssessReasons.Any(a => (UnderAssessReasonEnum)a.UnderAssessReasonId == UnderAssessReasonEnum.invoiceAmountExceedsAllocatedAmount));
        }
        
        public async Task<List<InvoiceDetails>> GetValidatedSTPInvoicesNotMappedToPreAuth()
        {
            RmaIdentity.DemandPermission(Permissions.ViewMedicalInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var medicalInvoiceAutoPayCount = await _configurationService.GetModuleSetting(SystemSettings.MedicalInvoiceAutoPayCount);

                var invoicesDetails = await (
                    from i in _invoiceRepository
                    join hcp in _healthCareProviderRepository on i.HealthCareProviderId equals hcp.RolePlayerId
                    join pt in _practitionerTypeRepository on hcp.ProviderTypeId equals pt.PractitionerTypeId
                    where i.InvoiceStatus == InvoiceStatusEnum.Validated && (i.PreAuthId == null || i.PreAuthId <= 0)
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
                        ModifiedDate = i.ModifiedDate,
                        IsExcludeAutoPay = hcp.IsExcludeAutoPay
                    }).OrderByDescending(i => i.CreatedDate).Take(medicalInvoiceAutoPayCount.ToInt().Value).ToListAsync();

                if (invoicesDetails != null)
                {
                    var stpAutoPayLimitValue = await _configurationService.GetModuleSetting(SystemSettings.STPAutoPayLimit);
                    decimal stpAutoPayLimit = 0;

                    if (!string.IsNullOrWhiteSpace(stpAutoPayLimitValue))
                    {
                        var amountToleranceValue = await _configurationService.GetModuleAmountToleranceByKey(SystemSettings.MedicalInvoiceAmountTolerance).ConfigureAwait(true);
                        decimal amountTolerance = Convert.ToDecimal(amountToleranceValue) > 0 ? Convert.ToDecimal(amountToleranceValue) : 0;

                        stpAutoPayLimit = Convert.ToDecimal(stpAutoPayLimitValue) + amountTolerance;
                    }

                    foreach (var item in invoicesDetails.ToList())
                    {
                        if (item.PersonEventId > 0 && item.IsExcludeAutoPay)
                        {
                            var personEvent = await _claimService.GetPersonEventByClaimId((int)item.ClaimId);
                            if (!personEvent.IsStraightThroughProcess)
                            {
                                invoicesDetails.Remove(item);
                            }
                            else
                            {
                                var cumulativeTotal = await _invoiceCommonService.GetCumulativeTotalForPersonEvent(personEvent.PersonEventId);

                                if (cumulativeTotal > stpAutoPayLimit)
                                {
                                    invoicesDetails.Remove(item);
                                }
                                else
                                {
                                    var lineItemsAllowedUnderAssessReasons = await _configurationService.GetModuleSetting(SystemSettings.AutoPayLineItemsAllowedUnderAssessReasons);
                                    string[] allowedUnderAssessReasons = lineItemsAllowedUnderAssessReasons.Split(',');

                                    item.InvoiceUnderAssessReasons = Mapper.Map<List<InvoiceUnderAssessReason>>(_invoiceUnderAssessReasonRepository.Where(x => x.InvoiceId == item.InvoiceId).ToList());

                                    var payeeType = await _payeeTypeService.GetPayeeTypeById(item.PayeeTypeId);
                                    item.PayeeType = payeeType.Name;

                                    var invoiceLineRepository = _invoiceLineRepository.Select(i => i);
                                    item.InvoiceLineDetails = await (
                                            from i in _invoiceLineRepository
                                            join tb in _tariffBaseUnitCostTypeRepository on i.TariffBaseUnitCostTypeId equals tb.TariffBaseUnitCostTypeId
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
                                                TariffBaseUnitCostType = tb.Name,
                                                TariffDescription = mi.Description,
                                                DefaultQuantity = mi.DefaultQuantity,
                                                IsActive = i.IsActive,
                                                CreatedBy = i.CreatedBy,
                                                CreatedDate = i.CreatedDate,
                                                ModifiedBy = i.ModifiedBy,
                                                ModifiedDate = i.ModifiedDate,
                                                IsModifier = i.IsModifier
                                            }).ToListAsync();

                                    if (item.InvoiceLineDetails?.Count > 0)
                                    {
                                        foreach (var invoiceLine in item.InvoiceLineDetails.ToList())
                                        {
                                            invoiceLine.InvoiceLineUnderAssessReasons = Mapper.Map<List<InvoiceLineUnderAssessReason>>(_invoiceLineUnderAssessReasonRepository.Where(x => x.InvoiceLineId == invoiceLine.InvoiceLineId).ToList());

                                            if (invoiceLine.InvoiceLineUnderAssessReasons?.Count > 0)
                                            {
                                                var invoiceLineUnderAssessReasons = invoiceLine.InvoiceLineUnderAssessReasons.Where(i => !allowedUnderAssessReasons.Contains(i.UnderAssessReasonId.ToString()));
                                                if (invoiceLineUnderAssessReasons.Any())
                                                {
                                                    item.InvoiceLineDetails.Remove(invoiceLine);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            if (item.InvoiceStatus != InvoiceStatusEnum.Validated)
                            {
                                invoicesDetails.Remove(item);
                            }
                            var liabilityAccepted = await _invoiceCommonService.ClaimLiabilityAccepted(Convert.ToInt32(item.PersonEventId));
                            if (!liabilityAccepted)
                            {
                                invoicesDetails.Remove(item);
                            }

                            var payeeBankingDetailsApproved = await _invoiceCommonService.GetAuthorisedPayeeBankDetailsByRolePlayerId(item.HealthCareProviderId);
                            if (payeeBankingDetailsApproved == null || !Convert.ToBoolean(payeeBankingDetailsApproved.IsApproved))
                            {
                                invoicesDetails.Remove(item);
                            }
                        }
                    }
                }

                return invoicesDetails;
            }
        }

        public async Task<List<Invoice>> GetCapturedInvoices()
        {
            RmaIdentity.DemandPermission(Permissions.ViewMedicalInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var medicalInvoiceAutoPayCount = await _configurationService.GetModuleSetting(SystemSettings.MedicalInvoiceAutoPayCount);
                var entities = await _invoiceRepository.
                    Where(i => i.InvoiceStatus == InvoiceStatusEnum.Captured)
                    .OrderByDescending(i => i.CreatedDate).Take(medicalInvoiceAutoPayCount.ToInt().Value).ToListAsync();
                return Mapper.Map<List<Invoice>>(entities);
            }
        }

        public async Task<List<TebaInvoice>> GetCapturedTebaInvoices()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var medicalInvoiceAutoPayCount = await _configurationService.GetModuleSetting(SystemSettings.MedicalInvoiceAutoPayCount);
                var entities = await _tebaInvoiceRepository.
                    Where(i => i.InvoiceStatus == InvoiceStatusEnum.Captured)
                    .OrderByDescending(i => i.CreatedDate).Take(medicalInvoiceAutoPayCount.ToInt().Value).ToListAsync();
                return Mapper.Map<List<TebaInvoice>>(entities);
            }
        }

        public async Task<int> AddInvoice(Invoice invoice)
        {
            Contract.Requires(invoice != null);

            RmaIdentity.DemandPermission(Permissions.AddMedicalInvoice);
            var invoiceId = 0;
            using (var scope = _dbContextScopeFactory.Create())
            {
                invoice.InvoiceNumber = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.MedicalInvoiceNumber, string.Empty);

                var entity = Mapper.Map<medical_Invoice>(invoice);
                _invoiceRepository.Create(entity);
                await scope.SaveChangesAsync();

                invoiceId = entity.InvoiceId;
            }

            try
            {
                if (invoice.SwitchBatchInvoiceId.HasValue && invoice.SwitchBatchInvoiceId.Value > 0)
                    await _switchInvoiceHelperService.MarkSwitchBatchInvoiceAsProcessed(
                        invoice.SwitchBatchInvoiceId.Value,
                        invoiceId);
            }
            catch (Exception ex)
            {
                ex.LogException();
            }

            try
            {
                await _invoiceCommonService.AddInvoicePreAuthMap(invoiceId, 0, invoice?.MedicalInvoicePreAuths);
                await _invoiceCommonService.AddInvoiceReportMap(invoiceId, invoice?.MedicalInvoiceReports,
                    Convert.ToDateTime(invoice?.InvoiceDate.ToSaDateTime()));
                await _medicalWorkflowManagement.SendNotificationForCaptureMedicalInvoice(invoice);
            }
            catch (Exception ex)
            {
                ex.LogException();
            }

            return invoiceId;
        }

        public async Task<bool> MapSwitchBatchInvoice(SwitchBatchInvoiceMapParams switchBatchInvoiceMapParams)
        {
            return await _switchInvoiceHelperService.MapSwitchBatchInvoice(switchBatchInvoiceMapParams);
        }

        public async Task<int> EditInvoiceStatusHelper(Invoice invoice)
        {
            return await _invoiceCommonService.EditInvoiceStatus(invoice);
        }

        public async Task<int> EditTebaInvoiceStatusHelper(TebaInvoice tebaInvoice)
        {
            return await _invoiceCommonService.EditTebaInvoiceStatus(tebaInvoice);
        }

        public async Task<InvoiceStatusEnum> GetInvoiceStatusForUnderAssessReasonssHelper(int invoiceId, List<InvoiceUnderAssessReason> invoiceUnderAssessReasons, InvoiceStatusEnum invoiceStatus)
        {
            return await _invoiceCommonService.GetInvoiceStatusForUnderAssessReasons(invoiceId, invoiceUnderAssessReasons, invoiceStatus);
        }

        public async Task<TebaInvoice> GetTebaInvoiceHelper(int tebaInvoiceId)
        {
            return await _invoiceCommonService.GetTebaInvoice(tebaInvoiceId);
        }

        public async Task<InvoiceValidationModel> ExecuteInvoiceValidationsHelper(InvoiceDetails invoiceDetails)
        {
            return await _invoiceCommonService.ExecuteInvoiceValidations(invoiceDetails);
        }

        public async Task<InvoiceValidationModel> ExecuteTebaInvoiceValidationsHelper(TebaInvoice tebaInvoice)
        {
            return await _invoiceCommonService.ExecuteTebaInvoiceValidations(tebaInvoice);
        }

        public async Task<InvoiceValidationModel> ExecuteTebaInvoiceLineValidationsHelper(TebaInvoice tebaInvoice)
        {
            return await _invoiceCommonService.ExecuteTebaInvoiceLineValidations(tebaInvoice);
        }

        public async Task SaveInvoiceLineUnderAssessReasonsToDBHelper(List<InvoiceLineUnderAssessReason> invoiceLineUnderAssessReasons)
        {
            await _invoiceCommonService.SaveInvoiceLineUnderAssessReasonsToDB(invoiceLineUnderAssessReasons);
        }

        public async Task SaveInvoiceUnderAssessReasonsToDBHelper(int invoiceId, int tebaInvoiceId, List<InvoiceUnderAssessReason> invoiceUnderAssessReasons)
        {
            await _invoiceCommonService.SaveInvoiceUnderAssessReasonsToDB(invoiceId, tebaInvoiceId, invoiceUnderAssessReasons);
        }

        public async Task<int> EditInvoiceHelper(Invoice invoice)
        {
            return await _invoiceCommonService.EditInvoice(invoice);
        }

        public async Task<int> EditTebaInvoiceHelper(TebaInvoice tebaInvoice)
        {
            return await _invoiceCommonService.EditTebaInvoice(tebaInvoice);
        }

        public async Task<int> ProcessMedicalInvoiceIntegrationMessage(string message, string messageId)
        {
            Contract.Requires(message != null);
            var invoiceId = 0;
            try
            {
                var medicalInvoiceUpdateMessage = JsonConvert.DeserializeObject<MedicalInvoiceUpdateMessage>(message);
                var compCareInvoice = await _invoiceCommonService.GetMedicalInvoiceFromCompCare(medicalInvoiceUpdateMessage.CompCareMedicalInvoiceId);
                var compCareInvoiceId = compCareInvoice.InvoiceId;
                if (medicalInvoiceUpdateMessage.Action == Integrations.Contracts.Enums.ActionEnum.Add)
                {
                    var compCareMapEntry =
                        await _invoiceCompCareMapService.GetInvoiceCompCareMapByCompCareInvoiceId(compCareInvoiceId);
                    // Only create new invoice if there is no existing entry in compcare map table
                    if (compCareMapEntry == null)
                    {
                        var invoiceToCapture = new Invoice();
                        invoiceToCapture.AuthorisedAmount = compCareInvoice.AuthorisedAmount;
                        invoiceToCapture.AuthorisedTotalInclusive = compCareInvoice.AuthorisedTotalInclusive;
                        invoiceToCapture.AuthorisedVat = compCareInvoice.AuthorisedVat;
                        invoiceToCapture.ClaimId = compCareInvoice.ClaimId;
                        invoiceToCapture.Comments = compCareInvoice.Comments;
                        invoiceToCapture.CreatedBy = DatabaseConstants.AutoPaySystemUser;
                        invoiceToCapture.CreatedDate = DateTime.Now;
                        invoiceToCapture.ModifiedBy = DatabaseConstants.AutoPaySystemUser;
                        invoiceToCapture.ModifiedDate = DateTime.Now;
                        invoiceToCapture.DateAdmitted = compCareInvoice.DateAdmitted;
                        invoiceToCapture.DateDischarged = compCareInvoice.DateDischarged;
                        invoiceToCapture.DateReceived = compCareInvoice.DateReceived;
                        invoiceToCapture.DateSubmitted = compCareInvoice.DateSubmitted;
                        invoiceToCapture.HcpAccountNumber = compCareInvoice.HcpAccountNumber;
                        invoiceToCapture.HcpInvoiceNumber = compCareInvoice.HcpInvoiceNumber;
                        invoiceToCapture.HealthCareProviderId = compCareInvoice.HealthCareProviderId;
                        invoiceToCapture.InvoiceAmount = compCareInvoice.InvoiceAmount;
                        invoiceToCapture.InvoiceDate = compCareInvoice.InvoiceDate;
                        invoiceToCapture.InvoiceId = 0;
                        invoiceToCapture.PersonEventId = compCareInvoice.PersonEventId;
                        invoiceToCapture.InvoiceNumber = compCareInvoice.InvoiceNumber;
                        invoiceToCapture.InvoiceStatus = compCareInvoice.InvoiceStatus;
                        invoiceToCapture.InvoiceTotalInclusive = compCareInvoice.InvoiceTotalInclusive;
                        invoiceToCapture.InvoiceVat = compCareInvoice.InvoiceVat;
                        invoiceToCapture.PayeeId = compCareInvoice.PayeeId;
                        invoiceToCapture.PayeeTypeId = compCareInvoice.PayeeTypeId;
                        invoiceToCapture.InvoiceLines = new List<InvoiceLine>();
                        foreach (var line in compCareInvoice.InvoiceLines)
                        {
                            var invoiceLine = new InvoiceLine();
                            invoiceLine.AuthorisedAmount = line.AuthorisedAmount;
                            invoiceLine.AuthorisedAmountInclusive = line.AuthorisedAmountInclusive;
                            invoiceLine.AuthorisedQuantity = line.AuthorisedQuantity;
                            invoiceLine.AuthorisedVat = line.AuthorisedVat;
                            invoiceLine.CreditAmount = line.CreditAmount;
                            invoiceLine.InvoiceLineId = line.InvoiceLineId;
                            invoiceLine.Icd10Code = line.Icd10Code;
                            invoiceLine.HcpTariffCode = line.HcpTariffCode;
                            invoiceLine.CreatedBy = line.CreatedBy;
                            invoiceLine.CreatedDate = line.CreatedDate;
                            invoiceLine.ModifiedBy = line.ModifiedBy;
                            invoiceLine.ModifiedDate = line.ModifiedDate;
                            invoiceLine.CalculateOperands = line.CalculateOperands;
                            invoiceLine.RequestedAmount = line.RequestedAmount;
                            invoiceLine.RequestedAmountInclusive = line.RequestedAmountInclusive;
                            invoiceLine.RequestedQuantity = line.RequestedQuantity;
                            invoiceLine.RequestedVat = line.RequestedVat;
                            invoiceLine.MedicalItemId = line.MedicalItemId;
                            invoiceLine.TariffAmount = line.TariffAmount;
                            invoiceLine.TariffBaseUnitCostTypeId = line.TariffBaseUnitCostTypeId;
                            invoiceLine.TariffId = line.TariffId;
                            invoiceLine.TotalTariffAmount = line.TotalTariffAmount;
                            invoiceLine.TotalTariffAmountInclusive = line.TotalTariffAmountInclusive;
                            invoiceLine.TotalTariffVat = line.TotalTariffVat;
                            invoiceLine.TreatmentCodeId = line.TreatmentCodeId;
                            invoiceLine.ServiceTimeStart = line.ServiceTimeStart;
                            invoiceLine.ServiceTimeEnd = line.ServiceTimeEnd;
                            invoiceLine.ServiceDate = line.ServiceDate;
                            invoiceLine.VatPercentage = line.VatPercentage;
                            invoiceLine.VatCode = line.VatCode;
                            invoiceToCapture.InvoiceLines.Add(invoiceLine);
                        }

                        var healthCareProvider =
                            await _healthcareProviderService.SearchHealthCareProviderByPracticeNumber(compCareInvoice
                                .PracticeNumber);
                        var claim = await _claimService.GetClaimByCompCarePersonEventId(Convert.ToInt32(compCareInvoice.PersonEventId));
                        if (healthCareProvider != null && claim != null)
                        {
                            invoiceToCapture.HealthCareProviderId = healthCareProvider.RolePlayerId;
                            invoiceToCapture.PersonEventId = claim.PersonEventId;
                            invoiceToCapture.ClaimId = claim.ClaimId;
                            invoiceToCapture.InvoiceId = 0;
                            invoiceToCapture.InvoiceStatus = InvoiceStatusEnum.Captured;
                            invoiceToCapture.IsActive = true;
                            foreach (var invoiceLine in invoiceToCapture.InvoiceLines)
                            {
                                invoiceLine.IsActive = true;
                                invoiceLine.CreatedBy = DatabaseConstants.AutoPaySystemUser;
                                invoiceLine.CreatedDate = DateTime.Now;
                                invoiceLine.ModifiedBy = DatabaseConstants.AutoPaySystemUser;
                                invoiceLine.ModifiedDate = DateTime.Now;
                                var tariffDetail = await _mediCareService.CheckAndInsertTariff(invoiceLine.HcpTariffCode, invoiceLine.TariffId, healthCareProvider.ProviderTypeId, invoiceLine.ServiceDate);
                                if (tariffDetail != null)
                                {
                                    invoiceLine.TariffId = tariffDetail.TariffId;
                                    invoiceLine.MedicalItemId = tariffDetail.MedicalItemId;
                                    invoiceLine.HcpTariffCode = tariffDetail.TariffCode;
                                    invoiceLine.TariffAmount = tariffDetail.TariffAmount;
                                }
                            }
                            invoiceId = await AddInvoice(invoiceToCapture);
                            bool stpIsFeatureFlagSettingEnabled = await _invoiceCommonService.GetSTPIsFeatureFlagSettingEnabledCommon();
                            if (stpIsFeatureFlagSettingEnabled && invoiceId > 0)
                            {
                                var invoiceCompCareMap = new InvoiceCompCareMap()
                                {
                                    InvoiceId = invoiceId,
                                    CompCareInvoiceId = compCareInvoiceId,
                                    CompCareClaimId = Convert.ToInt32(compCareInvoice.ClaimId),
                                    ClaimReferenceNumber = compCareInvoice.ClaimReferenceNumber,
                                    CompCareHealthCareProviderId = compCareInvoice.HealthCareProviderId,
                                    HealthCareProviderName = compCareInvoice.HealthCareProviderName,
                                    PracticeNumber = healthCareProvider.PracticeNumber,
                                    CompCareMessageId = messageId,
                                    IsDeleted = false,
                                    CreatedBy = DatabaseConstants.AutoPaySystemUser,
                                    CreatedDate = DateTime.Now,
                                    ModifiedBy = DatabaseConstants.AutoPaySystemUser,
                                    ModifiedDate = DateTime.Now
                                };

                                await _invoiceCompCareMapService.AddInvoiceCompCareMap(invoiceCompCareMap);

                                await _compCareIntegrationService.SendMedicalInvoiceResponseMessage(invoiceId, Integrations.Contracts.Enums.ActionEnum.Add);

                                await AutoPayRunSTPIntegration(invoiceId);
                            }
                        }
                    }
                }
                else if (medicalInvoiceUpdateMessage.Action == Integrations.Contracts.Enums.ActionEnum.Reinstate)
                {
                    var invoiceCompCareMap = await _invoiceCompCareMapService.GetInvoiceCompCareMapByCompCareInvoiceId(compCareInvoiceId);
                    await ReinstateMedicalInvoice(invoiceCompCareMap.InvoiceId,0);
                    invoiceId = invoiceCompCareMap.InvoiceId;

                    await _compCareIntegrationService.SendMedicalInvoiceResponseMessage(invoiceId, Integrations.Contracts.Enums.ActionEnum.Reinstate);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Creating a Medical Invoice from CompCare: {messageId} - Error Message {ex.Message}");
                throw;
            }
            return invoiceId;
        }

        public async Task<bool> ForceReinstateMedicalInvoice(int invoiceId, int tebaInvoiceId)
        {
            bool useMediInvoiceId = invoiceId > 0;
            var invoiceDetails = new InvoiceDetails();
            var tebaInvoice = new TebaInvoice();
            // Allocate the invoice
            var invoiceAllocation = new MedicalInvoicePaymentAllocation
            {
                PaymentAllocationStatus = PaymentAllocationStatusEnum.PendingPayment
            };

            if (useMediInvoiceId)
            {
                invoiceDetails = await _invoiceCommonService.GetInvoiceDetails(invoiceId);
                // Allocate the medical invoice
                invoiceAllocation.PayeeId = invoiceDetails.HealthCareProviderId;
                invoiceAllocation.MedicalInvoiceId = invoiceDetails.InvoiceId;
                invoiceAllocation.AssessedAmount = invoiceDetails.AuthorisedAmount;
                invoiceAllocation.AssessedVat = invoiceDetails.AuthorisedVat;
                invoiceAllocation.PaymentType = PaymentTypeEnum.MedicalInvoice;

                invoiceDetails.InvoiceStatus = InvoiceStatusEnum.ReInstated;
                await _invoiceCommonService.EditInvoiceStatus(invoiceDetails);

            }
            else if (!useMediInvoiceId)
            {
                tebaInvoice = await _invoiceCommonService.GetTebaInvoice(tebaInvoiceId);
                // Allocate the teba invoice
                invoiceAllocation.PayeeId = tebaInvoice.InvoicerId;
                invoiceAllocation.MedicalInvoiceId = tebaInvoice.TebaInvoiceId;
                invoiceAllocation.AssessedAmount = tebaInvoice.AuthorisedAmount;
                invoiceAllocation.AssessedVat = tebaInvoice.AuthorisedVat;
                invoiceAllocation.PaymentType = PaymentTypeEnum.TebaInvoice;

                tebaInvoice.InvoiceStatus = InvoiceStatusEnum.ReInstated;
                await _invoiceCommonService.EditTebaInvoiceStatus(tebaInvoice);
            }

            if (invoiceDetails != null)
            {
                var invoiceAssessAllocateData = new InvoiceAssessAllocateData()
                {
                    InvoiceDetail = invoiceDetails,
                    TebaInvoice = tebaInvoice,
                    InvoiceAllocation = invoiceAllocation
                };

                await _invoiceCommonService.AssessAllocationSubmit(invoiceAssessAllocateData);



                if (useMediInvoiceId)
                {
                    //when allocation is done update medical invoice & lines totals (Authorized amounts)
                    await _invoiceCommonService.EditInvoiceAuthorisedAmounts(invoiceDetails);
                }
                else if (!useMediInvoiceId)
                {
                    //when allocation is done update teba invoice & lines totals (Authorized amounts)
                    await _invoiceCommonService.EditTebaInvoiceAuthorisedAmounts(tebaInvoice);
                }

                return true;
            }

            return false;
        }

        public async Task<List<InvoiceUnderAssessReason>> ValidateInvoiceRun(int invoiceId, int tebaInvoiceId)
        {
            bool useMediInvoiceId = invoiceId > 0;
            InvoiceDetails invoiceDetails = new InvoiceDetails();
            TebaInvoice tebaInvoice = new TebaInvoice();
            var invoiceUnderAssessReasons = new List<InvoiceUnderAssessReason>();
            var invoiceHeaderValidationsResult = new InvoiceValidationModel();
            var invoiceLineValidationsResult = new InvoiceValidationModel();

            if (useMediInvoiceId)
            {
                invoiceDetails = await _invoiceCommonService.GetInvoiceDetails(invoiceId);
                invoiceHeaderValidationsResult = await _invoiceCommonService.ExecuteInvoiceValidations(invoiceDetails);
                invoiceLineValidationsResult = await _invoiceCommonService.ExecuteInvoiceLineValidations(invoiceDetails);
            }
            else if (!useMediInvoiceId)
            {
                tebaInvoice = await _invoiceCommonService.GetTebaInvoice(tebaInvoiceId);
                invoiceHeaderValidationsResult = await _invoiceCommonService.ExecuteTebaInvoiceValidations(tebaInvoice);
                invoiceLineValidationsResult = await _invoiceCommonService.ExecuteTebaInvoiceLineValidations(tebaInvoice);
            }


            if (invoiceHeaderValidationsResult != null && invoiceHeaderValidationsResult.UnderAssessReasons.Any())
            {
                await _invoiceCommonService.SaveInvoiceUnderAssessReasonsToDB(invoiceId, tebaInvoiceId, invoiceHeaderValidationsResult.UnderAssessReasons);
            }

            if (invoiceLineValidationsResult != null && invoiceLineValidationsResult.LineUnderAssessReasons.Any())
            {
                await _invoiceCommonService.SaveInvoiceLineUnderAssessReasonsToDB(invoiceLineValidationsResult.LineUnderAssessReasons);
            }

            if (invoiceHeaderValidationsResult != null && invoiceHeaderValidationsResult.UnderAssessReasons.Any())
            {
                invoiceHeaderValidationsResult.UnderAssessReasons.ForEach(result =>
                {
                    invoiceUnderAssessReasons.Add(result);
                });
            }

            invoiceDetails.InvoiceStatus = await _invoiceCommonService.SetInvoiceStatus(invoiceId, tebaInvoiceId, invoiceUnderAssessReasons, InvoiceStatusEnum.Validated);

            return invoiceUnderAssessReasons;
        }

        public async Task<int> AddTebaInvoice(TebaInvoice tebaInvoice)
        {
            Contract.Requires(tebaInvoice != null);

            var tebaInvoiceId = 0;
            using (var scope = _dbContextScopeFactory.Create())
            {
                tebaInvoice.InvoiceNumber = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.TebaInvoiceNumber, string.Empty);

                var entity = Mapper.Map<medical_TebaInvoice>(tebaInvoice);
                _tebaInvoiceRepository.Create(entity);
                await scope.SaveChangesAsync();

                tebaInvoiceId = entity.TebaInvoiceId;
            }

            try
            {
                if (tebaInvoice.SwitchBatchInvoiceId.HasValue && tebaInvoice.SwitchBatchInvoiceId.Value > 0)
                    await _switchInvoiceHelperService.MarkSwitchBatchInvoiceAsProcessed(
                        tebaInvoice.SwitchBatchInvoiceId.Value,
                        tebaInvoiceId);
            }
            catch (Exception ex)
            {
                ex.LogException();
            }

            try
            {
                await _invoiceCommonService.AddInvoicePreAuthMap(0, tebaInvoiceId, tebaInvoice?.MedicalInvoicePreAuths);
            }
            catch (Exception ex)
            {
                ex.LogException();
            }

            return tebaInvoiceId;
        }
    }
}

