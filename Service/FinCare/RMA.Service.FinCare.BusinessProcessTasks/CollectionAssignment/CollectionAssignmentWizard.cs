using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.BusinessProcessTasks.CollectionAssignment
{
    public class CollectionAssignmentWizard : IWizardProcess
    {

        private readonly IAgeAnalysisService _ageAnalysisService;
        private readonly ISendEmailService _emailService;

        public CollectionAssignmentWizard(
            IAgeAnalysisService ageAnalysisService,
            ISendEmailService emailService
        )
        {
            _ageAnalysisService = ageAnalysisService;
            _emailService = emailService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));
            var collection = context.Deserialize<CollectionAgent>(context.Data);
            var today = DateTime.Today.ToString("yyyy/MM/dd");
            var stepData = new ArrayList() { collection };

            var wizardId = await context.CreateWizardAsync($"Outstanding Collections : {collection.Agent.DisplayName} {today}", stepData, collection.Agent.Email);
            await NotifyCollectionAgent(wizardId, collection);

            return await Task.FromResult(wizardId);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var collectionAgent = context.Deserialize<CollectionAgent>(stepData[0].ToString());

            await _ageAnalysisService.ClearCollectionAgents(collectionAgent);
        }

        private async Task NotifyCollectionAgent(int wizardId, CollectionAgent collectionAgent)
        {
            if (collectionAgent.Agent.Email.IsValidEmail())
            {
                var now = DateTime.Now;
                var emailRequest = new SendMailRequest
                {
                    ItemId = -1,
                    ItemType = "AgeAnalysis",
                    Recipients = collectionAgent.Agent.Email,
                    Body = GetEmailBody(wizardId, collectionAgent),
                    IsHtml = true,
                    Subject = $"RMA Collections: {now.ToString("ddd, d MMMM yyyy")}"
                };

                await _emailService.SendEmail(emailRequest);
            }
        }

        private string GetEmailBody(int WizardId, CollectionAgent collectionAgent)
        {
            Environment.GetEnvironmentVariable("");
            string html = $"<p>{GetGreeting()}, {collectionAgent.Agent.DisplayName}</p>";
            html += $"<p>{collectionAgent.AccountIds.Count} collections have been assigned to you. "
                + "Please log in to the RMA Comp Care Portal to process them</p>";
            html += "<p>Kind regards,<br/>The RMA Team</p>";
            return html;
        }

        private string GetGreeting()
        {
            var now = DateTime.Now.ToSaDateTime();
            if (now.Hour < 12)
            {
                return "Good morning";
            }
            else if (now.Hour < 17)
            {
                return "Good afternoon";
            }
            else
            {
                return "Good evening";
            }
        }

        public Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var requestResult = new RuleRequestResult
            {
                RequestId = Guid.NewGuid(),
                RuleResults = new List<RuleResult> {
                    new RuleResult
                    {
                        RuleName = "Collection Assignment",
                        Passed = true,
                        MessageList = new List<string>()
                    }
                },
                OverallSuccess = true
            };
            return Task.FromResult(requestResult);
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return await Task.FromResult<string>(string.Empty);
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

        public Task UpdateStatus(IWizardContext context)
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
