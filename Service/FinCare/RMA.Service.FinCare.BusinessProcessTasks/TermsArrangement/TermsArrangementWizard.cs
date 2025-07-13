using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.BusinessProcessTasks.TermsArrangement
{
    public class TermsArrangementWizard : IWizardProcess
    {
        private readonly ITermsArrangementService _termsArrangementService;
        private readonly IBillingService _billingService;
        private readonly IProductOptionService _productOptionService;
        private readonly IBankAccountService _bankAccountService;
        private readonly IProductService _productService;
        public TermsArrangementWizard(ITermsArrangementService termsArrangementService,
            IBillingService billingService,
            IBankAccountService bankAccountService, IProductOptionService productOptionService, IProductService productService)
        {
            _termsArrangementService = termsArrangementService;
            _billingService = billingService;
            _bankAccountService = bankAccountService;
            _productOptionService = productOptionService;
            _productService = productService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var termsArrangement = context?.Deserialize<TermArrangement>(context.Data);

            if (termsArrangement != null)
            {
                termsArrangement.StartDate = termsArrangement.StartDate.ToSaDateTime();

                termsArrangement.TermArrangementStatus = TermArrangementStatusEnum.ApplicationInProgress;
                var productOptions = await _productOptionService.GetProductOptionsByIds(termsArrangement.TermArrangementProductOptions
                   .Select(c => c.ProductOptionId).ToList());
                var bankaccountId = await GetProductBankAccount(productOptions);
                termsArrangement.BankAccountId = bankaccountId;

                //Get distinct product names

                List<string> productNames = new List<string>();

                foreach (var productOption in productOptions.OrderBy(x => x.Code))
                {
                    var product = await _productOptionService.GetProductByProductOptionId(productOption.Id);

                    if (!productNames.Contains(product.Code))
                    {
                        productNames.Add(product.Code);
                    }
                }

                var productsLabel = productNames.Count > 0 ? " [" + string.Join(", ", productNames) + "]" : "";
                var stepData = new ArrayList() { termsArrangement };
                string label = $"Debtor:{termsArrangement.MemberNumber}" + productsLabel;
                return await context.CreateWizard(label, stepData);
            }
            return await Task.FromResult(0);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context?.Deserialize<ArrayList>(wizard.Data);

            var termsArrangement = context?.Deserialize<TermArrangement>(stepData[0].ToString());
            if (termsArrangement != null)
            {
                await _termsArrangementService.ApproveTermsArrangement(termsArrangement, wizard.Id);
                var note = new BillingNote
                {
                    ItemId = termsArrangement.RolePlayerId.Value,
                    ItemType = BillingNoteTypeEnum.TermsArrangement.GetDescription(),
                    Text = $"Term arrangement approved"
                };
                await _billingService.AddBillingNote(note);
            }

        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context?.Deserialize<ArrayList>(wizard.Data);

            var termsArrangement = context?.Deserialize<TermArrangement>(stepData[0].ToString());
            if (termsArrangement != null)
            {
                var comment = string.Empty;
                if (!string.IsNullOrEmpty(rejectWizardRequest?.Comment))
                {
                    comment = rejectWizardRequest.Comment;
                }
                await _termsArrangementService.RejectTermApplication(termsArrangement, comment);
                var text = string.Empty;
                text = (!string.IsNullOrEmpty(comment)) ? $"Term arrangement rejected with comment: {comment}" : "Term arrangement rejected";

                var note = new BillingNote
                {
                    ItemId = termsArrangement.RolePlayerId.Value,
                    ItemType = BillingNoteTypeEnum.TermsArrangement.GetDescription(),
                    Text = text
                };
                await _billingService.AddBillingNote(note);
            }
        }

        #region Not Implemented
        public Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var ruleResults = new List<RuleResult>();
            return Task.FromResult(GetRuleRequestResult(true, ruleResults));
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

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            await Task.CompletedTask;
        }

        public Task OnApprove(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task OnRequestForApproval(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context?.Deserialize<ArrayList>(wizard.Data);

            var termsArrangement = context?.Deserialize<TermArrangement>(stepData[0].ToString());
            if (termsArrangement != null)
            {
                var isAutomaticApproval = await VerifyAutomaticApproval(termsArrangement, context, wizard);
                if (isAutomaticApproval)
                    await DoAutomaticApproval(termsArrangement, context, wizard);
            }
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
        #endregion

        private async Task<bool> VerifyAutomaticApproval(TermArrangement termsArrangement, IWizardContext context, Wizard wizard)
        {
            var roleplayerId = (int)termsArrangement.RolePlayerId;
            var isAutomaticApproval = false;

            var noAutoApprovalReasons = await _termsArrangementService.CanAutoApproveTermArrangementApplication(roleplayerId, termsArrangement);
            if (noAutoApprovalReasons.Count == 0)
                isAutomaticApproval = true;
            else
            {
                if (wizard != null)
                {
                    var wizardData = context?.Deserialize<ArrayList>(wizard.Data);
                    var arrangement = context?.Deserialize<TermArrangement>(wizardData[0].ToString());
                    arrangement.NoAutoApprovalReasons = new List<string>();
                    arrangement.NoAutoApprovalReasons.AddRange(noAutoApprovalReasons);
                    arrangement.NoAutoApprovalReasons = noAutoApprovalReasons;
                    wizardData[0] = arrangement;
                    wizard.Data = context.Serialize(wizardData);
                    wizard.WizardStatus = WizardStatusEnum.AwaitingApproval;
                    wizard.LockedToUser = null;
                }
                await context?.UpdateWizard(wizard);
            }
            return isAutomaticApproval;
        }

        private async Task DoAutomaticApproval(TermArrangement termsArrangement, IWizardContext context, Wizard wizard)
        {
            Contract.Requires(context != null);
            await _termsArrangementService.ApproveTermsArrangement(termsArrangement, wizard.Id);

            if (wizard != null)
            {
                wizard.WizardStatus = WizardStatusEnum.Completed;
                wizard.LockedToUser = null;
            }
            await context?.UpdateWizard(wizard);
        }

        private async Task<int> GetProductBankAccount(List<ProductOption> productOptions)
        {
            var bankaccountId = 0;
            var products = await _productService.GetProductsByIds(productOptions.Select(p => p.ProductId).ToList());

            if (products.Where(p => p.ProductClassId == (int)ProductClassEnum.Statutory).ToList().Count > 0)
            {
                var coidProduct = products.FirstOrDefault(p => p.ProductClassId == (int)ProductClassEnum.Statutory);
                bankaccountId = await GetBankAccountId(coidProduct);
            }
            else if (products.Where(p => p.ProductClassId == (int)ProductClassEnum.Assistance).ToList().Count > 0
                && products.Where(p => p.ProductClassId == (int)ProductClassEnum.Statutory).ToList().Count > 0)
            {
                var coidProduct = products.FirstOrDefault(p => p.ProductClassId == (int)ProductClassEnum.Statutory);
                bankaccountId = await GetBankAccountId(coidProduct);
            }
            else if (products.Where(p => p.ProductClassId == (int)ProductClassEnum.Assistance).ToList().Count > 0
                && products.Where(p => p.ProductClassId == (int)ProductClassEnum.Statutory).ToList().Count == 0)
            {
                var vapsProduct = products.FirstOrDefault(p => p.ProductClassId == (int)ProductClassEnum.Assistance);
                bankaccountId = await GetBankAccountId(vapsProduct);
            }
            return bankaccountId;
        }

        private async Task<int> GetBankAccountId(Product product)
        {
            var productBankAccounts = await _productService.GetProductBankAccountsByProductId(product.Id);
            var bankaccountId = productBankAccounts.FirstOrDefault()?.BankAccountId;
            var rmaBankAccount = await _bankAccountService.GetBankAccountById((int)bankaccountId);
            return rmaBankAccount.Id;
        }
    }
}