using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.BenefitWizard
{
    public class BenefitWizard : IWizardProcess
    {
        private readonly IBenefitService _benefitService;
        private readonly IBenefitRuleService _benefitRuleService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IWizardService _wizardService;

        public BenefitWizard(IBenefitService benefitService, IDocumentGeneratorService documentGeneratorService, IBenefitRuleService benefitRuleService, IWizardService wizardService)
        {
            _benefitService = benefitService;
            _documentGeneratorService = documentGeneratorService;
            _benefitRuleService = benefitRuleService;
            _wizardService = wizardService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            string name;
            ArrayList stepData;
            var benefitId = context.LinkedItemId;

            if (benefitId <= 0)
            {
                RmaIdentity.DemandPermission(Permissions.AddBenefit);
                var docuNumber = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.Benefit, "");
                var benefit = new Benefit() { Code = docuNumber, StartDate = DateTimeHelper.SaNow };
                name = $"Add benefit: {benefit.Code}";
                stepData = new ArrayList
                {
                    benefit
                };
            }
            else
            {
                RmaIdentity.DemandPermission(Permissions.EditBenefit);
                var benefit = await _benefitService.GetBenefit(benefitId);
                name = $"Edit benefit: {benefit.Code}";
                await SetBenefitRateStatuses(benefit);

                stepData = new ArrayList
                {
                    benefit
                };
            }

            return await context.CreateWizard(name, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var benefit = context.Deserialize<Benefit>(stepData[0].ToString());

            if (benefit.Id <= 0)
            {
                await _benefitService.AddBenefit(benefit, wizard.Id);
            }
            else
            {
                await _benefitService.EditBenefit(benefit, wizard.Id);
            }
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var benefitCase = context.Deserialize<Benefit>(stepData[0].ToString());
            var benefit = await _benefitService.GetBenefitByName(benefitCase.Name);

            var ruleResults = new List<RuleResult>();

            if (benefit != null)
            {
                if (benefitCase.Id == 0 || (benefitCase.Id > 0 && benefitCase.Id != benefit.Id))
                {
                    ruleResults.Add(
                        new RuleResult
                        {
                            Passed = false,
                            RuleName = "Duplicate Benefit",
                            MessageList = new List<string> { $"Benefit {benefit.Name} already exists." }
                        }
                    );
                }
            }

            RuleRequestResult result = new RuleRequestResult
            {
                OverallSuccess = ruleResults.Count == 0,
                RequestId = Guid.NewGuid(),
                RuleResults = ruleResults
            };
            return result;
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        private Task SetBenefitRateStatuses(Benefit benefit)
        {
            foreach (var rate in benefit.BenefitRates)
            {
                rate.BenefitRateStatusText = rate.EffectiveDate < DateTimeHelper.SaNow
                                             && benefit.BenefitRates.Any(x => x.EffectiveDate > rate.EffectiveDate && x.EffectiveDate <= DateTimeHelper.SaNow)
                    ? "Historic"
                    : (rate.EffectiveDate == benefit.BenefitRates.Where(x => x.EffectiveDate <= DateTimeHelper.SaNow)
                           .Max(x => x.EffectiveDate)
                        ? "Current"
                        : "Future");
            }

            return Task.CompletedTask;
        }

        public Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return Task.FromResult(string.Empty);
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
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

        public Task OverrideWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task OnSaveStep(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var benefit = context.Deserialize<ProductOption>(stepData[0].ToString());

            var label = benefit.Id == 0
                ? $"Add Benefit: '{benefit.Code}'"
                : $"Edit Benefit: '{benefit.Code}'";
            await _wizardService.EditWizardName(wizard.Id, label);
        }

        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
