using CommonServiceLocator;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.BusinessProcessTasks.TebaInvoiceWizards
{
    public class TebaInvoiceCaptureWizard : IWizardProcess
    {
        private readonly IInvoiceService _invoiceService;
        private readonly IInvoiceHelperService _invoiceHelperService;
        private readonly IUserService _userService;
        private IRuleContext _context;
        private readonly IPoolWorkFlowService _poolWorkFlowService;
        private readonly ISLAService _slaService;
        private readonly IWizardService _wizardService;
        private readonly ITravelAuthorisationService _travelAuthorisationService;

        public TebaInvoiceCaptureWizard(IInvoiceService invoiceService,
            IUserService userService
            , IInvoiceHelperService invoiceHelperService
            , IPoolWorkFlowService poolWorkFlowService
            , ITravelAuthorisationService travelAuthorisationService
            , IWizardService wizardService
            , ISLAService slaService)
        {
            _invoiceService = invoiceService;
            _invoiceHelperService = invoiceHelperService;
            _userService = userService;
            _poolWorkFlowService = poolWorkFlowService;
            _travelAuthorisationService = travelAuthorisationService;
            _slaService = slaService;
            _wizardService = wizardService;
            _context = ServiceLocator.Current.GetInstance<IRuleContext>();
        }

        public async Task CancelWizard(IWizardContext context)
        {
            if (context == null) return;
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

            var tebaInvoiceDetails = context.Deserialize<TebaInvoice>(stepData[0].ToString());

            var invoiceHeaderValidationsResult = await _invoiceHelperService.ExecuteTebaInvoiceValidationsHelper(tebaInvoiceDetails);
            ruleRequestResult = invoiceHeaderValidationsResult.RuleRequestResult;

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
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null) return await Task.FromResult(-1).ConfigureAwait(false);

            var workItemModel = context.Deserialize<Contracts.Entities.Medical.TebaInvoice>(context.Data);
            var label = "Teba Invoice Capture Form";

            var stepData = new ArrayList() { workItemModel };
            var wizardId = await context.CreateWizard(label, stepData).ConfigureAwait(false);

            return await Task.FromResult(wizardId).ConfigureAwait(false);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context?.Deserialize<ArrayList>(wizard.Data);
            var tebaInvoice = context?.Deserialize<Contracts.Entities.Medical.TebaInvoice>(stepData[0].ToString());
            int tebaInvoiceId = 0;

            if (context == null) return;

            if (tebaInvoice.TebaInvoiceId > 0 && tebaInvoice.TebaInvoiceLines.Count > 0)
            {
                tebaInvoice.ModifiedDate = DateTimeHelper.SaNow;
                tebaInvoiceId = await _invoiceHelperService.EditTebaInvoiceHelper(tebaInvoice).ConfigureAwait(false);
            }
            else
            {
                tebaInvoiceId = await _invoiceHelperService.AddTebaInvoice(tebaInvoice).ConfigureAwait(false);
            }

            var getTebaInvoice = await _invoiceHelperService.GetTebaInvoiceHelper(tebaInvoiceId).ConfigureAwait(false);
            //validate to get status for futher processing and routing
            var invoiceHeaderValidationsResult = await _invoiceHelperService.ExecuteTebaInvoiceValidationsHelper(getTebaInvoice);
            var invoiceLineValidationsResult = await _invoiceHelperService.ExecuteTebaInvoiceLineValidationsHelper(getTebaInvoice);

            var invoiceStatusResult = await _invoiceHelperService.GetInvoiceStatusForUnderAssessReasonssHelper(tebaInvoiceId, invoiceHeaderValidationsResult.UnderAssessReasons, getTebaInvoice.InvoiceStatus);

            getTebaInvoice.InvoiceStatus = invoiceStatusResult;
            getTebaInvoice.ModifiedDate = DateTimeHelper.SaNow;
            getTebaInvoice.InvoiceUnderAssessReasons.Clear();
            getTebaInvoice.InvoiceUnderAssessReasons = invoiceHeaderValidationsResult.UnderAssessReasons;

            if (invoiceLineValidationsResult.LineUnderAssessReasons != null && invoiceLineValidationsResult.LineUnderAssessReasons.Count > 0)
            {
                for (int i = 0; i < getTebaInvoice.TebaInvoiceLines.Count; i++)
                {
                    var newLineValidations = invoiceLineValidationsResult.LineUnderAssessReasons.FindAll(x => x.TebaInvoiceLineId == getTebaInvoice.TebaInvoiceLines[i].TebaInvoiceLineId);
                    if (newLineValidations != null && newLineValidations.Count > 0)
                    {
                        getTebaInvoice.TebaInvoiceLines[i].InvoiceLineUnderAssessReasons.Clear();
                        getTebaInvoice.TebaInvoiceLines[i].InvoiceLineUnderAssessReasons = newLineValidations;
                    }
                }
            }

            await _invoiceHelperService.EditTebaInvoiceHelper(getTebaInvoice);
            var preAuthDetails = await _travelAuthorisationService.GetTravelAuthorisation((int)tebaInvoice.PreAuthId).ConfigureAwait(true);
            //Below is a list of all InvoiceStatusEnum that are considered for review
            List<InvoiceStatusEnum> reviewStatuses = new List<InvoiceStatusEnum>
            {
                InvoiceStatusEnum.Pending,
                InvoiceStatusEnum.Rejected,
                InvoiceStatusEnum.Deleted,
                InvoiceStatusEnum.FinallyRejected,
                InvoiceStatusEnum.Unknown
            };

            bool pendRejectStatus = false;

            foreach (var underAssessReason in invoiceHeaderValidationsResult.UnderAssessReasons)
            {
                if (reviewStatuses.Contains(underAssessReason.InvoiceStatus))
                {
                    pendRejectStatus = true;
                }
            }

            if (pendRejectStatus)
            {
                const string wizardType = "teba-invoices-pend-reject-process";

                var reviewWizard = new StartWizardRequest()
                {
                    Data = context.Serialize(getTebaInvoice),
                    Type = wizardType,
                    LinkedItemId = getTebaInvoice.TebaInvoiceId,
                    LockedToUser = preAuthDetails.CreatedBy ?? null,
                    RequestInitiatedByBackgroundProcess = true
                };

                await _wizardService.StartWizard(reviewWizard);
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

    }
}
