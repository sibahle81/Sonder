using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.BusinessProcessTasks.BundleRaise
{
    public class BundleRaiseWizard : IWizardProcess
    {
        private readonly IPolicyService _policyService;
        private readonly IBillingService _billingService;
        private readonly IInvoiceService _invoiceService;
        private readonly IPolicyNoteService _policyNoteService;

        public BundleRaiseWizard(IPolicyService policyService,
            IBillingService billingService,
            IInvoiceService invoiceService,
            IPolicyNoteService policyNoteService)
        {
            _policyService = policyService;
            _billingService = billingService;
            _invoiceService = invoiceService;
            _policyNoteService = policyNoteService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var bundleRaise = context.Deserialize<Billing.Contracts.Entities.BundleRaise>(context.Data); // All selected policies to be raise will be passed in here
            var label = $"Bundle Raise (x{bundleRaise.Policies.Count})";

            foreach (var policy in bundleRaise.Policies)
            {
                policy.PolicyStatus = PolicyStatusEnum.Released;
                await _policyService.EditPolicy(policy);
            }

            var stepData = new ArrayList() { bundleRaise };

            var wizardId = await context.CreateWizard(label, stepData);

            await _billingService.SetBundleRaiseStatusToAwaitingApproval(wizardId);

            return wizardId;
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var bundleRaise = context.Deserialize<Billing.Contracts.Entities.BundleRaise>(stepData[0].ToString());

            foreach (var policy in bundleRaise.Policies)
            {
                if (policy.PolicyStatus == PolicyStatusEnum.Released)
                {
                    policy.PolicyStatus = PolicyStatusEnum.PendingRelease;
                }

                await _policyService.EditPolicy(policy);

                if (policy.PolicyStatus == PolicyStatusEnum.PendingFirstPremium)
                {
                    await _invoiceService.GenerateInvoice(policy.PolicyId, ClientTypeEnum.Company);
                    var invoice = await _invoiceService.GetInvoiceByPolicyId(policy.PolicyId);
                    await _billingService.LogApprovedBundleRaise(invoice.PolicyId, invoice.InvoiceId, invoice.TotalInvoiceAmount, wizard.ModifiedBy);
                    try
                    {
                        foreach (var note in bundleRaise.BundleRaiseNotes)
                        {
                            note.ItemId = policy.PolicyId;
                            await _policyNoteService.AddNote(note);
                        }
                    }
                    catch (Exception ex)
                    {
                        ex.LogException(ex.Message);
                    }
                }
            }
        }

        public async Task CancelWizard(IWizardContext context)
        {
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policies = context.Deserialize<List<Policy>>(stepData[0].ToString());

            foreach (var policy in policies)
            {
                policy.PolicyStatus = PolicyStatusEnum.PendingRelease;
                await _policyService.EditPolicy(policy);
            }
        }
        public async Task OverrideWizard(IWizardContext context)
        {
            return;
        }
        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policies = context.Deserialize<List<Policy>>(stepData[0].ToString());

            foreach (var policy in policies)
            {
                policy.PolicyStatus = PolicyStatusEnum.PendingRelease;
                await _policyService.EditPolicy(policy);
            }
        }

        #region Not Implemented
        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var ruleResults = new List<RuleResult>();
            return GetRuleRequestResult(true, ruleResults);
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

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return await Task.FromResult<string>(string.Empty);
        }

        public async Task UpdateStatus(IWizardContext context)
        {
            return;
        }

        public async Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return;
        }

        public async Task OnApprove(IWizardContext context)
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
        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        #endregion
    }
}
