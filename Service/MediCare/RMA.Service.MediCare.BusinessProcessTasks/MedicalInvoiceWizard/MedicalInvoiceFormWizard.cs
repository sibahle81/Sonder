using CommonServiceLocator;
using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.RuleTasks;
using RMA.Service.MediCare.RuleTasks.Enums;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Fabric.Description;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.BusinessProcessTasks.MedicalInvoiceWizard
{
    public class MedicalInvoiceFormWizard : IWizardProcess
    {
        private readonly IInvoiceService _invoiceService;
        private readonly IInvoiceHelperService _invoiceHelperService;
        private readonly IUserService _userService;
        private IRuleContext _context;
        private readonly IPoolWorkFlowService _poolWorkFlowService;
        private readonly ISLAService _slaService;
        private readonly IDocumentIndexService _documentIndexService;

        public MedicalInvoiceFormWizard(IInvoiceService invoiceService,
            IUserService userService
            , IInvoiceHelperService invoiceHelperService
            , IPoolWorkFlowService poolWorkFlowService
            , IDocumentIndexService documentIndexService
            , ISLAService slaService)
        {
            _invoiceService = invoiceService;
            _invoiceHelperService = invoiceHelperService;
            _userService = userService;
            _poolWorkFlowService = poolWorkFlowService;
            _documentIndexService = documentIndexService;
            _slaService = slaService;
            _context = ServiceLocator.Current.GetInstance<IRuleContext>();
        }

        public async Task CancelWizard(IWizardContext context)
        {
            if (context == null) return;
            await CaptureInvoice(context, false, true);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return string.Empty;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            RuleRequestResult ruleRequestResult = new RuleRequestResult() { RuleResults = new List<RuleResult>() };
            if (context == null)
                return null;

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);

            var invoiceDetails = context.Deserialize<InvoiceDetails>(stepData[0].ToString());
            invoiceDetails.InvoiceLineDetails = new List<InvoiceLineDetails>();
            invoiceDetails.InvoiceLines.ForEach(line =>
            {
                invoiceDetails.InvoiceLineDetails.Add(new InvoiceLineDetails()
                {
                    InvoiceLineId = line.InvoiceLineId,
                    InvoiceId = line.InvoiceId,
                    ServiceDate = line.ServiceDate,
                    ServiceTimeStart = line.ServiceTimeStart,
                    ServiceTimeEnd = line.ServiceTimeEnd,
                    RequestedQuantity = line.RequestedQuantity,
                    AuthorisedQuantity = line.AuthorisedQuantity,
                    RequestedAmount = line.RequestedAmount,
                    RequestedVat = line.RequestedVat,
                    RequestedAmountInclusive = line.RequestedAmountInclusive,
                    AuthorisedAmount = line.AuthorisedAmount,
                    AuthorisedVat = line.AuthorisedVat,
                    AuthorisedAmountInclusive = line.AuthorisedAmountInclusive,
                    TotalTariffAmount = line.TotalTariffAmount,
                    TotalTariffVat = line.TotalTariffVat,
                    TotalTariffAmountInclusive = line.TotalTariffAmountInclusive,
                    TariffAmount = line.TariffAmount,
                    CreditAmount = line.CreditAmount,
                    VatCode = line.VatCode,
                    VatPercentage = line.VatPercentage,
                    TariffId = line.TariffId,
                    TreatmentCodeId = line.TreatmentCodeId,
                    MedicalItemId = line.MedicalItemId,
                    HcpTariffCode = line.HcpTariffCode,
                    TariffBaseUnitCostTypeId = line.TariffBaseUnitCostTypeId,
                    Description = line.Description,
                    SummaryInvoiceLineId = line.SummaryInvoiceLineId,
                    IsPerDiemCharge = line.IsPerDiemCharge,
                    IsDuplicate = line.IsDuplicate,
                    DuplicateInvoiceLineId = line.DuplicateInvoiceLineId,
                    CalculateOperands = line.CalculateOperands,
                    Icd10Code = line.Icd10Code,
                    InvoiceLineUnderAssessReasons = line.InvoiceLineUnderAssessReasons,
                    IsModifier = line.IsModifier
                });
            });
            var validationResult = await _invoiceHelperService.ExecuteInvoiceValidationsHelper(invoiceDetails);
            ruleRequestResult = validationResult.RuleRequestResult;

            return ruleRequestResult;
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task OnApprove(IWizardContext context)
        {
            return;
        }

        public async Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return;
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return;
        }

        public async Task OnRequestForApproval(IWizardContext context)
        {
            return;
        }

        public async Task OnSaveStep(IWizardContext context)
        {
            return;
        }

        public async Task OverrideWizard(IWizardContext context)
        {
            if (context == null) return;
            RmaIdentity.DemandPermission(Permissions.OverrideMedicalInvoiceReinstatement);
            await CaptureInvoice(context, true, false);
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null) return await Task.FromResult(-1).ConfigureAwait(false);

            var workItemModel = context.Deserialize<InvoiceDetails>(context.Data);
            var label = "Medical Invoice Form";

            var stepData = new ArrayList() { workItemModel };
            var wizardId = await context.CreateWizard(label, stepData).ConfigureAwait(false);

            return await Task.FromResult(wizardId).ConfigureAwait(false);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null) return;
            await CaptureInvoice(context, false, false);
        }

        public async Task CaptureInvoice(IWizardContext context, bool isOverride, bool isDelete)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context?.Deserialize<ArrayList>(wizard.Data);
            var invoiceForm = context?.Deserialize<Invoice>(stepData[0].ToString());
            var invoiceDetails = context?.Deserialize<InvoiceDetails>(stepData[0].ToString());

            if (invoiceDetails.ClaimId > 0 && invoiceDetails.HealthCareProviderId > 0 && invoiceDetails.InvoiceLines != null
                && (!isDelete || invoiceDetails.SwitchBatchInvoiceId > 0))
            {
                var newInvoiceStatus = InvoiceStatusEnum.Captured;
                var ruleRequestResults = await ExecuteWizardRules(context);
                List<InvoiceUnderAssessReason> invoiceUnderAssessReasons = new List<InvoiceUnderAssessReason>();

                foreach (var ruleRequestResult in ruleRequestResults.RuleResults)
                {
                    if (!ruleRequestResult.Passed)
                    {
                        if (isOverride)
                            invoiceForm.InvoiceStatus = InvoiceStatusEnum.Validated;
                        else
                            invoiceForm.InvoiceStatus = InvoiceStatusEnum.Rejected;

                        if (isDelete)
                            invoiceForm.InvoiceStatus = InvoiceStatusEnum.Deleted;

                        if (ruleRequestResult.RuleName == ClaimCare.RuleTasks.MedicalInvoice.ClaimLiabilityStatus.Constants.LiabilityStatusRuleName)
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason
                            {
                                InvoiceId = invoiceForm.InvoiceId,
                                UnderAssessReasonId = (int)UnderAssessReasonEnum.claimLiabilityNotAccepted,
                                UnderAssessReason = Utility.GetEnumDisplayName(UnderAssessReasonEnum.claimLiabilityNotAccepted),
                                IsActive = true
                            });
                        if (ruleRequestResult.RuleName == RuleTasks.MedicalInvoiceRules.TreatmentFromDateAfterDateOfDeath.Constants.MedicalInvoiceDateOfDeathRuleName
                            || ruleRequestResult.RuleName == RuleTasks.MedicalInvoiceRules.TreatmentToDateAfterDateOfDeath.Constants.MedicalInvoiceDateOfDeathRuleName)
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason
                            {
                                InvoiceId = invoiceForm.InvoiceId,
                                UnderAssessReasonId = (int)UnderAssessReasonEnum.serviceDateAfterDateOfDeath,
                                UnderAssessReason = Utility.GetEnumDisplayName(UnderAssessReasonEnum.serviceDateAfterDateOfDeath),
                                IsActive = true
                            });
                        if (ruleRequestResult.RuleName == RuleTasks.MedicalInvoiceRules.TreatmentFromDateBeforeEventDate.Constants.MedicalInvoiceEventDateRuleName
                            || ruleRequestResult.RuleName == RuleTasks.MedicalInvoiceRules.TreatmentToDateBeforeEventDate.Constants.MedicalInvoiceEventDateRuleName
                            || ruleRequestResult.RuleName == RuleTasks.MedicalInvoiceRules.InvoiceDateBeforeEventDate.Constants.MedicalInvoiceEventDateRuleName)
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason
                            {
                                InvoiceId = invoiceForm.InvoiceId,
                                UnderAssessReasonId = (int)UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate,
                                UnderAssessReason = Utility.GetEnumDisplayName(UnderAssessReasonEnum.servicDateOnInvoiceIsPreAccidentDiagnoisDate),
                                IsActive = true
                            });
                        if (ruleRequestResult.RuleName == ClaimCare.RuleTasks.MedicalInvoice.ICD10Code.Constants.MedicalInvoiceClaimInjuryPreAuthICD10CodeMessage)
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason
                            {
                                InvoiceId = invoiceForm.InvoiceId,
                                UnderAssessReasonId = (int)UnderAssessReasonEnum.icd10CodeMismatchToClaimICD10,
                                UnderAssessReason = Utility.GetEnumDisplayName(UnderAssessReasonEnum.icd10CodeMismatchToClaimICD10),
                                IsActive = true
                            });
                        if (ruleRequestResult.RuleName == ClaimCare.RuleTasks.MedicalInvoice.MedicalBenefit.Constants.MedicalBenefitRuleName)
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason
                            {
                                InvoiceId = invoiceForm.InvoiceId,
                                UnderAssessReasonId = (int)UnderAssessReasonEnum.noMedicalCover,
                                UnderAssessReason = Utility.GetEnumDisplayName(UnderAssessReasonEnum.noMedicalCover),
                                IsActive = true
                            });
                        if (ruleRequestResult.RuleName == RuleTasks.MedicalInvoiceRules.DuplicateInvoice.Constants.DuplicateInvoiceRuleName)
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason
                            {
                                InvoiceId = invoiceForm.InvoiceId,
                                UnderAssessReasonId = (int)UnderAssessReasonEnum.invoiceIsADuplicate,
                                UnderAssessReason = Utility.GetEnumDisplayName(UnderAssessReasonEnum.invoiceIsADuplicate),
                                IsActive = true
                            });
                        if (ruleRequestResult.RuleName == RuleTasks.HealthcareProviderCheckRules.Constants.MedialReportRequiredRuleName)
                        {
                            invoiceUnderAssessReasons.Add(new InvoiceUnderAssessReason
                            {
                                InvoiceId = invoiceForm.InvoiceId,
                                UnderAssessReasonId = (int)UnderAssessReasonEnum.medicalReportNotFoundForTreatingDoctor,
                                UnderAssessReason = Utility.GetEnumDisplayName(UnderAssessReasonEnum.medicalReportNotFoundForTreatingDoctor),
                                IsActive = true
                            });
                        }
                    }
                }
                invoiceForm.InvoiceUnderAssessReasons = invoiceUnderAssessReasons
                                                        .GroupBy(i => new { i.InvoiceId, i.UnderAssessReasonId, i.UnderAssessReason, i.IsActive })
                                                        .Select(i => i.First())
                                                        .ToList();

                if (invoiceForm.InvoiceLines != null && invoiceForm.InvoiceLines.Count > 0)
                {
                    foreach (var invoiceLine in invoiceForm.InvoiceLines)
                    {
                        if (invoiceLine.InvoiceLineUnderAssessReasons != null && invoiceLine.InvoiceLineUnderAssessReasons.Count > 0)
                        {
                            foreach (var invoiceLineUnderAssessReason in invoiceLine.InvoiceLineUnderAssessReasons)
                                invoiceLineUnderAssessReason.UnderAssessReason = Utility.GetEnumDisplayName((UnderAssessReasonEnum)invoiceLineUnderAssessReason.UnderAssessReasonId);
                        }
                    }
                }

                if (invoiceForm.InvoiceUnderAssessReasons.Count == 0)
                {
                    invoiceForm.InvoiceStatus = InvoiceStatusEnum.Validated;
                }
                else if (!isDelete && invoiceForm.InvoiceUnderAssessReasons.Count == 1)
                {
                    if (invoiceForm.InvoiceUnderAssessReasons[0].UnderAssessReasonId == (int)UnderAssessReasonEnum.medicalReportNotFoundForTreatingDoctor)
                    {
                        invoiceForm.InvoiceStatus = InvoiceStatusEnum.Pending;
                    }
                }

                if (wizard.LinkedItemId > 0)
                {
                    invoiceForm.ModifiedDate = DateTimeHelper.SaNow;
                    await _invoiceHelperService.EditInvoiceHelper(invoiceForm).ConfigureAwait(false);
                }
                else
                {
                    if (invoiceForm.InvoiceStatus != InvoiceStatusEnum.Captured)
                    {
                        newInvoiceStatus = invoiceForm.InvoiceStatus;
                        invoiceForm.InvoiceStatus = InvoiceStatusEnum.Captured;
                    }
                    invoiceForm.CreatedDate = DateTimeHelper.SaNow;
                    invoiceForm.ModifiedDate = DateTimeHelper.SaNow;
                    int invoiceId = await _invoiceHelperService.AddInvoice(invoiceForm).ConfigureAwait(false);
                    //after saving an invoice reindex against invoiceId instead of wizardId used on initial capture
                    await _documentIndexService.UpdateDocumentKeys(DocumentSystemNameEnum.MediCareManager, "MedicareMedicalInvoice", wizard.Id.ToString(), "MedicareMedicalInvoice", invoiceId.ToString());


                    if (invoiceId > 0)
                    {
                        var invoice = await _invoiceService.GetInvoice(invoiceId);
                        invoice.InvoiceStatus = newInvoiceStatus;
                        await _invoiceHelperService.EditInvoiceStatusHelper(invoice).ConfigureAwait(false);
                        invoiceForm.InvoiceId = invoiceId;

                        if (invoiceDetails.SwitchBatchInvoiceId > 0)
                        {
                            var switchBatchInvoiceMapParams = new SwitchBatchInvoiceMapParams()
                            {
                                SwitchBatchInvoiceId = (int)invoiceDetails.SwitchBatchInvoiceId,
                                PossiblePersonEventId = (int)invoiceDetails.PersonEventId,
                                PossibleEventId = (int)invoiceDetails.EventId,
                                ClaimId = (int)invoiceDetails.ClaimId,
                                ClaimReferenceNumberMatch = invoiceDetails.ClaimReferenceNumber
                            };
                            await _invoiceHelperService.MapSwitchBatchInvoice(switchBatchInvoiceMapParams);
                        }

                        if (invoice.InvoiceStatus == InvoiceStatusEnum.Validated)
                            await _invoiceService.CreateAssessmentWizard(invoice);
                    }


                    //Send Notification and create Review task
                    var recipients = await _userService.SearchUsersByPermission("Medical invoice manager view");

                    var userReminders = new List<UserReminder>();

                    foreach (var recipient in recipients)
                    {
                        var userReminder = new UserReminder
                        {
                            AssignedToUserId = recipient.Id,
                            UserReminderItemType = UserReminderItemTypeEnum.MedicareAllMainNotifications,
                            UserReminderType = UserReminderTypeEnum.SystemNotification,
                            Text = $"New Medical Invoice submitted by: {RmaIdentity.UsernameOrBlank}",
                            AlertDateTime = DateTimeHelper.SaNow,
                            CreatedBy = RmaIdentity.UsernameOrBlank,
                            LinkUrl = $"/medicare/view-medical-invoice/{invoiceId}"
                        };

                        userReminders.Add(userReminder);
                    }
                }
            }
        }

        public async Task UpdateStatus(IWizardContext context)
        {
            return;
        }

        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        private async Task CreatePoolWorkFlow(Invoice invoice, string reason)
        {
            var poolWorkFlow = new PoolWorkFlow()
            {
                PoolWorkFlowItemType = PoolWorkFlowItemTypeEnum.MedicalInvoice,
                ItemId = invoice.InvoiceId,
                WorkPool = WorkPoolEnum.MIAMedicalPool,
                AssignedByUserId = RmaIdentity.UserId,
                AssignedToUserId = null,
                EffectiveFrom = DateTimeHelper.SaNow,
                EffectiveTo = null,
                Instruction = $"{invoice.InvoiceStatus.GetDescription()}"
            };

            await UpdateSLAForWorkpool(invoice, reason);
            await _poolWorkFlowService.HandlePoolWorkFlow(poolWorkFlow);
        }

        private async Task UpdateSLAForWorkpool(Invoice invoice, string reason)
        {
            SLAItemTypeEnum slaItemType = SLAItemTypeEnum.MiaMedicalPool;

            var slaStatusChangeAudit = new SlaStatusChangeAudit
            {
                SLAItemType = slaItemType,
                ItemId = invoice.InvoiceId,
                Status = invoice.InvoiceStatus.GetDescription(),
                EffectiveFrom = DateTimeHelper.SaNow,
                Reason = $"{reason}"
            };

            DateTime? effectiveTo = null;

            slaStatusChangeAudit.EffictiveTo = effectiveTo;
            await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
        }
    }
}
