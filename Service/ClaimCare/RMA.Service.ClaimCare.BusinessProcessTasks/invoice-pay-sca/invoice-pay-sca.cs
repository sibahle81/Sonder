using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.BusinessProcessTasks
{
    public class InvoicePayScaWizard : IWizardProcess
    {
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IPolicyService _policyService;
        private readonly IClaimService _claimService;
        private readonly IClaimInvoiceService _claimInvoiceService;

        public InvoicePayScaWizard(
              IRolePlayerService rolePlayerService,
              IPolicyService policyService,
              IClaimService claimService,
              IClaimInvoiceService claimInvoiceService)
        {
            _rolePlayerService = rolePlayerService;
            _policyService = policyService;
            _claimService = claimService;
            _claimInvoiceService = claimInvoiceService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var personEvent = context.Deserialize<PersonEvent>(context.Data);

            if (personEvent.Claims?.Count > 0)
            {
                foreach (var item in personEvent.Claims)
                {
                     await _policyService.GetPolicy(Convert.ToInt32(item.PolicyId));
                }
            }

            var claimInvoice = await _claimInvoiceService.GetClaimInvoiceByClaimInvoiceId(personEvent.ClaimInvoiceId);
            var label = $"Invoice Payment Approval: ({claimInvoice.ClaimInvoiceType.DisplayAttributeValue()}) invoice of {claimInvoice.InvoiceAmount:C} submitted for PEV reference number: ({personEvent.PersonEventReferenceNumber})";

            var stepData = new ArrayList() { personEvent };
            return await context.CreateWizard(label, stepData);
        }

        public  Task SubmitWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }


        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var ruleResults = new List<RuleResult>();

            return await Task.FromResult(new RuleRequestResult()
            {
                OverallSuccess = true,
                RequestId = Guid.NewGuid(),
                RuleResults = ruleResults
            });

        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardId, string currentWizardName)
        {
            return await Task.FromResult(string.Empty);
        }

        public  Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnApprove(IWizardContext context)
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

        public Task OverrideWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
