using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Lead;
using RMA.Service.ClientCare.Contracts.Entities.Quote;
using RMA.Service.ClientCare.Contracts.Interfaces.Lead;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Quote;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.RMAMutualAssuranceQuotationWizard
{
    public class RMAMutualAssuranceQuotationWizard : IWizardProcess
    {
        private readonly ILeadService _leadService;
        private readonly IQuoteService _quoteService;
        private readonly IProductOptionService _productOptionService;
        private readonly ILeadCommunicationService _leadCommunicationService;
        private readonly IWizardService _wizardService;

        public RMAMutualAssuranceQuotationWizard(
            ILeadService leadService,
            IQuoteService quoteService,
            ILeadCommunicationService leadCommunicationService,
            IProductOptionService productOptionService,
            IWizardService wizardService
            )
        {
            _leadService = leadService;
            _quoteService = quoteService;
            _leadCommunicationService = leadCommunicationService;
            _productOptionService = productOptionService;
            _wizardService = wizardService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var quote = context.Deserialize<QuoteV2>(context.Data);

            var action = quote.QuoteStatus == QuoteStatusEnum.New ? "New" : "Amend";
            var lead = await _leadService.GetLead(quote.LeadId);

            var productOptionIds = new List<int>();
            foreach (var quoteDetail in quote.QuoteDetailsV2)
            {
                productOptionIds.Add(quoteDetail.ProductOptionId);
            }

            var productOptions = await _productOptionService.GetProductOptionsByIds(productOptionIds);
            var productOptionNames = string.Empty;
            for (int i = 0; i <= productOptions.Count - 1; i++)
            {
                if (i > 0)
                {
                    productOptionNames += " + " + productOptions[i].Name + " (" + productOptions[i].Code + ")";
                }
                else
                {
                    productOptionNames += productOptions[i].Name + " (" + productOptions[i].Code + ")";
                }
            }

            if (action == "Amend")
            {
                quote.QuoteStatus = QuoteStatusEnum.Amending;
                await _quoteService.UpdateQuote(quote);
            }

            var label = $"{action} Quote {quote.QuotationNumber} ({productOptionNames.Trim()}) for {lead.DisplayName} ({lead.Code})";

            var stepData = new ArrayList() { quote };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var quote = context.Deserialize<QuoteV2>(stepData[0].ToString());
            var lead = await _leadService.GetLead(quote.LeadId);

            quote.QuoteStatus = lead?.Company != null && lead.Company.IndustryClass == IndustryClassEnum.Metals ? QuoteStatusEnum.AutoAccepted : QuoteStatusEnum.Quoted;

            await _quoteService.UpdateQuote(quote);
            _ = Task.Run(() => EmailQuote(lead, quote));

            if (quote.QuoteStatus == QuoteStatusEnum.AutoAccepted)
            {
                await StartMemberWizard(context, Convert.ToInt32(lead.RolePlayerId), quote);
            }
        }

        private async Task StartMemberWizard(IWizardContext context, int rolePlayerId, QuoteV2 quote)
        {
            var startWizardRequest = new StartWizardRequest
            {
                LinkedItemId = rolePlayerId,
                Type = "member",
                Data = context.Serialize(quote)
            };

            await _wizardService.StartWizard(startWizardRequest);
        }

        private async Task EmailQuote(Lead lead, QuoteV2 quotation)
        {
            try
            {
                var emailAddresses = new List<string>();

                foreach (var contact in lead.ContactV2)
                {
                    if (contact.PreferredCommunicationTypeId == Convert.ToInt32(CommunicationTypeEnum.Email))
                    {
                        emailAddresses.Add(contact.EmailAddress);
                    }
                }

                var parameters = new Dictionary<string, string>();
                parameters.Add("QuoteId", Convert.ToString(quotation.QuoteId));

                if (emailAddresses.Count > 0)
                {
                    await _leadCommunicationService.SendRMAAssuranceQuoteEmail(quotation, emailAddresses, parameters);
                }
            }
            catch (Exception ex)
            {
                // DO NOTHING
                var exception = ex;
            }
        }

        public async Task CancelWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var quote = context.Deserialize<QuoteV2>(stepData[0].ToString());

            quote.QuoteStatus = QuoteStatusEnum.Rejected;
            quote.DeclineReason = $"{wizard.Name} was cancelled by {wizard.ModifiedBy}";

            await _quoteService.UpdateQuote(quote);
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            Contract.Requires(context != null && rejectWizardRequest != null);
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var quote = context.Deserialize<QuoteV2>(stepData[0].ToString());

            quote.QuoteStatus = QuoteStatusEnum.Rejected;
            quote.DeclineReason = $"{wizard.Name} was rejected by {wizard.ModifiedBy} with comment: {rejectWizardRequest.Comment}";

            await _quoteService.UpdateQuote(quote);
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
        public async Task OverrideWizard(IWizardContext context)
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
