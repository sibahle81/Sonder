using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.MediCare.Contracts.Entities.Medical;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Common.Security;

namespace RMA.Service.MediCare.BusinessProcessTasks.MedicalInvoiceQueryWizard
{
    public class MedicalInvoiceQueryResponseWizard : IWizardProcess
    {
        private readonly IConfigurationService _configuration;
        private readonly IRoleService _roleService;
        private readonly IUserService _userService;
        private readonly IRolePlayerQueryService _rolePlayerQueryService;

        public MedicalInvoiceQueryResponseWizard(IConfigurationService configuration,
            IRoleService roleService,
            IUserService userService,
            IRolePlayerQueryService rolePlayerQueryService)
        {
            _configuration = configuration;
            _roleService = roleService;
            _userService = userService;
            _rolePlayerQueryService = rolePlayerQueryService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null)
                return await Task.FromResult(-1).ConfigureAwait(false);

            var invoiceQueryDetail = context.Deserialize<InvoiceQueryDetails>(context.Data);

            string label = "Capture Medical Invoice Query Response";
            var stepData = new ArrayList() { invoiceQueryDetail };
            var wizardId = await context.CreateWizard(label, stepData).ConfigureAwait(false);

            return await Task.FromResult(wizardId).ConfigureAwait(false);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null) return;

            try
            {
                var wizard = context.Deserialize<Wizard>(context.Data);
                var stepData = context.Deserialize<ArrayList>(wizard.Data);
                var queryDetails = context.Deserialize<InvoiceQueryDetails>(stepData[0].ToString());

                var response = new RolePlayerItemQueryResponse()
                {
                    RolePlayerItemQueryId = queryDetails.Id,
                    QueryResponse = queryDetails.QueryResponse,
                    IsDeleted = false,
                    CreatedBy = RmaIdentity.Email,
                    ModifiedBy = RmaIdentity.Email,
                };

                await _rolePlayerQueryService.AddRolePlayerItemQueryResponse(response).ConfigureAwait(true);


                var rolePlayerItemQuery = await _rolePlayerQueryService.GetRolePlayerItemQueryById(queryDetails.Id).ConfigureAwait(true);
                rolePlayerItemQuery.RolePlayerItemQueryStatus = queryDetails.RolePlayerItemQueryStatus;

                await _rolePlayerQueryService.UpdateRolePlayerItemQuery(rolePlayerItemQuery).ConfigureAwait(true);

                await context.UpdateWizard(wizard).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                ex.LogException();
                throw;
            }
        }

        public async Task OnSaveStep(IWizardContext context)
        {
            if (context == null) return;

            try
            {
                // use this if you want to do custom actions

                return;
            }
            catch (Exception ex)
            {
                ex.LogException();
                throw;
            }
        }

        public async Task UpdateStatus(IWizardContext context)
        {
            return;
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return string.Empty;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            Contract.Requires(context != null);
            var ruleResults = new List<RuleResult>();

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var pensionClaimResponse = context.Deserialize<InvoiceQueryDetails>(stepData[0].ToString());

            var failedResult = ruleResults.FirstOrDefault(a => !a.Passed);

            var overallSuccess = failedResult == null ? true : false;

            return new RuleRequestResult()
            {
                OverallSuccess = overallSuccess,
                RequestId = Guid.NewGuid(),
                RuleResults = ruleResults
            };
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
            if (context == null) return;
            return;
        }

        public async Task OverrideWizard(IWizardContext context)
        {
            return;
        }

        public async Task<bool> CanApproveAsync(decimal cvAmount, RoleEnum role)
        {
            return true;
        }

        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
