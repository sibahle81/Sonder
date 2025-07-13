using CommonServiceLocator;
using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.PensCare.Contracts.Interfaces.ClaimMap;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using TebaInvoice = RMA.Service.MediCare.Contracts.Entities.Medical.TebaInvoice;

namespace RMA.Service.MediCare.BusinessProcessTasks.TebaInvoiceWizards
{
    public class TebaInvoicePendRejectProcessWizard : IWizardProcess
    {
        private readonly IPreAuthorisationService _preAuthorisationService;
        private readonly IPreAuthClaimService _preAuthClaimService;
        private readonly IWizardService _wizardService;
        private readonly IUserService _userService;
        private readonly IRoleService _roleService;
        private IRuleContext _context;
        private readonly IPensionClaimMapService _pensionClaimMapService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IInvoiceHelperService _invoiceHelperService;

        public TebaInvoicePendRejectProcessWizard(
             IPreAuthorisationService preAuthorisationService,
             IPreAuthClaimService preAuthClaimService,
             IUserService userService,
             IInvoiceHelperService invoiceHelperService,
             IRoleService roleService,
             IWizardService wizardService,
             IPensionClaimMapService pensionClaimMapService,
             IRolePlayerService rolePlayerService
            )
        {
            _preAuthorisationService = preAuthorisationService;
            _preAuthClaimService = preAuthClaimService;
            _wizardService = wizardService;
            _userService = userService;
            _roleService = roleService;
            _invoiceHelperService = invoiceHelperService;
            _pensionClaimMapService = pensionClaimMapService;
            _rolePlayerService = rolePlayerService;
            _context = ServiceLocator.Current.GetInstance<IRuleContext>();
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null) return await Task.FromResult(-1).ConfigureAwait(false);

            var workItemModel = context.Deserialize<TebaInvoice>(context.Data);
            var label = "Teba Invoices Pended or Rejected Review";

            var stepData = new ArrayList() { workItemModel };
            var wizardId = await context.CreateWizard(label, stepData).ConfigureAwait(false);

            return await Task.FromResult(wizardId).ConfigureAwait(false);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null) return;
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var tebaInvoice = context.Deserialize<TebaInvoice>(stepData[0].ToString());
            int tebaInvoiceId = tebaInvoice.TebaInvoiceId > 0 ? tebaInvoice.TebaInvoiceId : 0;

            //validate to get status for futher processing and routing
            var invoiceHeaderValidationsResult = await _invoiceHelperService.ExecuteTebaInvoiceValidationsHelper(tebaInvoice);
            var invoiceLineValidationsResult = await _invoiceHelperService.ExecuteTebaInvoiceLineValidationsHelper(tebaInvoice);

            var invoiceStatusResult = await _invoiceHelperService.GetInvoiceStatusForUnderAssessReasonssHelper(tebaInvoiceId, invoiceHeaderValidationsResult.UnderAssessReasons, tebaInvoice.InvoiceStatus);

            tebaInvoice.InvoiceStatus = invoiceStatusResult;
            tebaInvoice.ModifiedDate = DateTimeHelper.SaNow;
            tebaInvoice.InvoiceUnderAssessReasons.Clear();
            tebaInvoice.InvoiceUnderAssessReasons = invoiceHeaderValidationsResult.UnderAssessReasons;

            if (invoiceLineValidationsResult.LineUnderAssessReasons != null && invoiceLineValidationsResult.LineUnderAssessReasons.Count > 0)
            {
                for (int i = 0; i < tebaInvoice.TebaInvoiceLines.Count; i++)
                {
                    var newLineValidations = invoiceLineValidationsResult.LineUnderAssessReasons.FindAll(x => x.TebaInvoiceLineId == tebaInvoice.TebaInvoiceLines[i].TebaInvoiceLineId);
                    if (newLineValidations != null && newLineValidations.Count > 0)
                    {
                        tebaInvoice.TebaInvoiceLines[i].InvoiceLineUnderAssessReasons.Clear();
                        tebaInvoice.TebaInvoiceLines[i].InvoiceLineUnderAssessReasons = newLineValidations;
                    }
                }
            }

            int invoiceId = await _invoiceHelperService.EditTebaInvoiceHelper(tebaInvoice).ConfigureAwait(false);
            wizard.Data = context.Serialize(tebaInvoice);
            if (invoiceHeaderValidationsResult.UnderAssessReasons.Count > 0)
            {
                SetWizardInProgress(wizard); 
            }
            else
            {
                SetWizardCompleted(wizard);
            }

            await _wizardService.UpdateWizard(wizard);
        }

        private Wizard SetWizardCompleted(Wizard wizard)
        {
            wizard.WizardStatusId = (int)WizardStatusEnum.Completed;
            wizard.WizardStatusText = WizardStatusEnum.Completed.DisplayAttributeValue();

            return wizard;
        }

        private Wizard SetWizardInProgress(Wizard wizard)
        {
            wizard.WizardStatusId = (int)WizardStatusEnum.InProgress;
            wizard.WizardStatusText = WizardStatusEnum.InProgress.DisplayAttributeValue();

            return wizard;
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

        private RuleRequestResult GetRuleRequestResult(bool success, List<RuleResult> results)
        {
            return new RuleRequestResult
            {
                RequestId = Guid.NewGuid(),
                RuleResults = results,
                OverallSuccess = success
            };
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return string.Empty;
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public Task OnApprove(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnRequestForApproval(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnSaveStep(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OverrideWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
