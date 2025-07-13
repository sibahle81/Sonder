using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.WhatsappCompanyList
{
    public class WhatsappCompanyList : IWizardProcess
    {
        private readonly IDeclarationService _declarationService;
        private readonly IPolicyCommunicationService _policyCommunicationService;

        public WhatsappCompanyList(IDeclarationService declarationService,
                                   IPolicyCommunicationService policyCommunicationService)
        {
            _declarationService = declarationService;
            _policyCommunicationService = policyCommunicationService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var industryClass = context.LinkedItemId;
            var industryClassEnum = (Admin.MasterDataManager.Contracts.Enums.IndustryClassEnum)industryClass;

            var label = $"Whatsapp Company List for {industryClassEnum}";

            var rolePlayers = await _declarationService.GenerateWhatsAppList(industryClassEnum);

            var stepData = new ArrayList() { rolePlayers };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var rolePlayers = context.Deserialize<List<RolePlayer>>(stepData[0].ToString());

            await _policyCommunicationService.SendBulkDeclarationSms(rolePlayers);
        }

        public async Task OverrideWizard(IWizardContext context)
        {
            return;
        }

        public async Task CancelWizard(IWizardContext context)
        {
            return;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var ruleResults = new List<RuleResult>();
            return GetRuleRequestResult(true, ruleResults);
        }

        private RuleRequestResult GetRuleRequestResult(bool success, List<RuleResult> results)
        {
            return new RuleRequestResult
            {
                RequestId = System.Guid.NewGuid(),
                RuleResults = results,
                OverallSuccess = success
            };
        }
        private RuleResult GetRuleResult(bool success, string message, string ruleName)
        {
            var messages = new List<string> { message };

            return new RuleResult
            {
                MessageList = messages,
                Passed = success,
                RuleName = ruleName
            };
        }

        public async Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return null;
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return string.Empty;
        }

        public async Task UpdateStatus(IWizardContext context)
        {
            return;
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
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

        public async Task OnSetApprovalStages(IWizardContext context)
        {
            return;
        }
    }
}
