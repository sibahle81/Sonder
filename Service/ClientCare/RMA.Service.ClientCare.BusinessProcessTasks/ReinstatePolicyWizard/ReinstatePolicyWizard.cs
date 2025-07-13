using RMA.Common.Extensions;
using RMA.Common.Security;

using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.Contracts.Utils;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.ReinstatePolicyWizard
{
    public class ReinstatePolicyWizard : IWizardProcess
    {
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IPolicyCaseService _caseService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IInvoiceService _invoiceService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly ICollectionService _collectionService;
        private readonly ITransactionService _transactionService;
        private readonly IPolicyCommunicationService _communicationService;

        private readonly IConfigurationService _configurationService;
        private readonly IPolicyService _policyService;
        private readonly IProductService _productService;
        private readonly IProductOptionService _productOptionService;
        private readonly IBenefitService _benefitService;

        private readonly string reinstateForbiddenMonths = "ReinstateForbiddenMonths";
        private readonly int defaultMonths = 24;

        private int[] ageRules = new int[] { 11, 12, 13, 14 };

        public ReinstatePolicyWizard(IRolePlayerPolicyService rolePlayerPolicyService,
            IPolicyCaseService caseService,
            IRolePlayerService rolePlayerService,
            IInvoiceService invoiceService,
            IDocumentIndexService documentIndexService,
            ICollectionService collectionService,
            ITransactionService transactionService,
            IPolicyCommunicationService communicationService,
            IConfigurationService configurationService,
            IPolicyService policyService,
            IProductService productService,
            IProductOptionService productOptionService,
            IBenefitService benefitService
        )
        {
            _caseService = caseService;
            _rolePlayerService = rolePlayerService;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _invoiceService = invoiceService;
            _documentIndexService = documentIndexService;
            _collectionService = collectionService;
            _transactionService = transactionService;
            _communicationService = communicationService;
            _configurationService = configurationService;
            _policyService = policyService;
            _productService = productService;
            _productOptionService = productOptionService;
            _benefitService = benefitService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            RmaIdentity.DemandPermission(Permissions.CreateReinstatePolicyCaseWizard);

            var caseModel = new Case();
            var contextData = context.Deserialize<Case>(context.Data);
            caseModel = await _caseService.GetCaseByPolicyId(context.LinkedItemId);
            caseModel.CaseTypeId = contextData.CaseTypeId;
            caseModel.Code = contextData.Code;

            var stepData = new ArrayList() { caseModel };
            var wizardId = await AddWizard(context, stepData);
            return await Task.FromResult(wizardId);
        }

        private async Task<int> AddWizard(IWizardContext context, ArrayList stepData)
        {
            var caseModel = stepData[0] as Case;
            var displayName = Enum.GetName(typeof(CaseTypeEnum), caseModel.CaseTypeId);
            var label = Regex.Replace(displayName, "(\\B[A-Z])", " $1");
            label = $"{label}: {caseModel.Code} - {caseModel.MainMember.DisplayName}";
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policyCase = context.Deserialize<Case>(stepData[0].ToString());

            var policy = policyCase.MainMember.Policies[0];
            policy.PolicyStatus = PolicyStatusEnum.Reinstated;
            policy.LastReinstateDate = DateTimeHelper.SaNow;
            await _rolePlayerPolicyService.EditPolicy(policyCase);
            await _rolePlayerPolicyService.UpdatePolicyStatus(policy);

            await _rolePlayerPolicyService.UpdatePolicyPremiums(policyCase);

            if (policy.LastReinstateDate.HasValue && policy.AdhocDebitDate.HasValue)
            {
                await _invoiceService.GenerateReinstatementInvoices(policy.PolicyId, (DateTime)policy.LastReinstateDate);

                var totalOutstanding = await _transactionService.GetPolicyPremiumBalance(policy.PolicyId);
                if (totalOutstanding > 0)
                {
                    var roleplayerName = policy.PolicyOwner != null ? policy.PolicyOwner.DisplayName : string.Empty;
                    var debtor = await _rolePlayerService.GetFinPayeeByRolePlayerId(policy.PolicyOwnerId);

                    // Group scheme child policies won't have debtors
                    if (debtor != null)
                    {
                        var instruction = new AdhocPaymentInstruction
                        {
                            Amount = totalOutstanding,
                            AdhocPaymentInstructionStatus = AdhocPaymentInstructionStatusEnum.Pending,
                            Reason = "Policy Reinstatement",
                            RolePlayerId = policy.PolicyOwnerId,
                            RolePlayerName = roleplayerName,
                            DateToPay = policy.AdhocDebitDate.Value,
                            FinPayeNumber = debtor.FinPayeNumber
                        };

                        var bankingDetails = await _rolePlayerService.GetActiveBankingDetails(policy.PolicyOwnerId);
                        if (bankingDetails != null)
                        {
                            instruction.BankAccountNumber = bankingDetails.AccountNumber;
                            instruction.BankAccountType = bankingDetails.BankAccountType.GetDescription();
                            instruction.Bank = bankingDetails.BankName;
                            instruction.BankBranchCode = bankingDetails.BranchCode;
                            instruction.BankAccountHolder = bankingDetails.AccountHolderName;
                            instruction.BankAccountEffectiveDate = bankingDetails.EffectiveDate;
                        }
                        await _collectionService.CreateAdhocDebitOrderWizard(instruction);
                    }
                }
            }

            // Send policy welcome pack in background task
            _ = Task.Run(() => SendWelcomePack(wizard.Id, policyCase));

            try
            {
                await UpdateDocumentKeyValues(policyCase.Code, policyCase.MainMember.Policies[0].PolicyNumber);
            }
            catch (Exception ex)
            {
                ex.LogException();
            }
        }

        private async Task SendWelcomePack(int wizardId, Case policyCase)
        {
            await _communicationService.SendFuneralPolicyDocuments(wizardId, policyCase, null, PolicySendDocsProcessTypeEnum.SendIndividualFuneralPolicySchedule);
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return await Task.FromResult(string.Empty);
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var @case = context.Deserialize<Case>(stepData[0].ToString());

            var ruleResults = new List<RuleResult>();

            // Check policy not reinstated in the last x months
            ruleResults.Add(await CheckReinstatedRules(@case));

            // General funeral validations
            ruleResults.AddRange(await CheckFuneralRules(context, @case));
            // Validate product
            ruleResults.AddRange(await CheckProductRules(context, @case));
            // Validate product options
            ruleResults.AddRange(await CheckProductOptionRules(context, @case));
            // Validate benefits
            ruleResults.AddRange(await CheckBenefitRules(context, @case));
            //validate roleplayers
            ruleResults.AddRange(await CheckRoleplayersForMultipleRelationsRule(@case));

            var errors = ruleResults.Where(rr => !rr.Passed).ToList().Count;
            return GetRuleRequestResult(errors == 0, ruleResults);
        }

        private async Task<RuleResult> CheckReinstatedRules(Case @case)
        {
            var setting = await _configurationService.GetModuleSetting(this.reinstateForbiddenMonths);
            if (!int.TryParse(setting, out int months))
            {
                months = defaultMonths;
            }

            var entity = await _policyService.GetPolicyWithoutReferenceData(@case.MainMember.Policies[0].PolicyId);
            var lastReinstateDate = entity.LastReinstateDate;

            if (!lastReinstateDate.HasValue)
            {
                return GetRuleResult(true, "The policy has never been reinstated");
            }

            var cutoff = DateTime.Today.AddMonths(-months).Date;
            if (lastReinstateDate.Value > cutoff)
            {
                return GetRuleResult(false, $"The policy has been reinstated within the last {months} months on {lastReinstateDate.Value:yyyy-MM-dd}");
            }

            return GetRuleResult(true, $"The policy has not been reinstated with the last {months} months");
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

        private RuleResult GetRuleResult(bool success, string message)
        {
            return new RuleResult
            {
                Passed = success,
                RuleName = "Reinstate Policy",
                MessageList = new List<string>() { message }
            };
        }

        private Task<List<RuleResult>> CheckRoleplayersForMultipleRelationsRule(Case newCase)
        {
            var messages = new List<string>();
            var roleplayerRelations = new Dictionary<string, string>();

            // Add main member
            roleplayerRelations.Add(PersonHelper.GetIdOrPassport(newCase.MainMember.Person), newCase.MainMember.DisplayName);

            // Add spouse
            foreach (var spouse in newCase.Spouse)
            {
                if (!spouse.IsDeleted)
                {
                    if (roleplayerRelations.ContainsKey(PersonHelper.GetIdOrPassport(spouse.Person)))
                    {
                        messages.Add($"Spouse {spouse.DisplayName}: Identity number ({PersonHelper.GetIdOrPassport(spouse.Person)}) has been used by several roleplayers");
                    }
                    else
                    {
                        roleplayerRelations.Add(PersonHelper.GetIdOrPassport(spouse.Person), spouse.DisplayName);
                    }
                }
            }

            // Add childern
            foreach (var child in newCase.Children)
            {
                if (!child.IsDeleted)
                {
                    if (roleplayerRelations.ContainsKey(PersonHelper.GetIdOrPassport(child.Person)))
                    {
                        messages.Add($"Child {child.DisplayName}: Identity number ({PersonHelper.GetIdOrPassport(child.Person)}) has been used by several roleplayers");
                    }
                    else
                    {
                        roleplayerRelations.Add(PersonHelper.GetIdOrPassport(child.Person), child.DisplayName);
                    }
                }
            }

            // Add extended family members
            foreach (var relation in newCase.ExtendedFamily)
            {
                if (!relation.IsDeleted)
                {
                    if (roleplayerRelations.ContainsKey(PersonHelper.GetIdOrPassport(relation.Person)))
                    {
                        messages.Add($"Family member {relation.DisplayName}: Identity number ({PersonHelper.GetIdOrPassport(relation.Person)}) has been used by several roleplayers");
                    }
                    else
                    {
                        roleplayerRelations.Add(PersonHelper.GetIdOrPassport(relation.Person), relation.DisplayName);
                    }
                }
            }

            var result = new RuleResult
            {
                Passed = messages.Count == 0,
                RuleName = "Multiple Relations",
                MessageList = messages
            };

            return Task.FromResult(new List<RuleResult> { result });
        }

        private async Task<IEnumerable<RuleResult>> CheckFuneralRules(IWizardContext context, Case newCase)
        {
            var list = new List<RuleResult>();
            var ruleRequest = new RuleRequest
            {
                RuleNames = new List<string> { "Maximum Individual Cover" },
                Data = context.Serialize(newCase),
                ExecutionFilter = "funeral"
            };
            var ruleRequestResults = await context.ExecuteRules(ruleRequest);
            list.AddRange(ruleRequestResults.RuleResults);
            return list;
        }

        private async Task<List<RuleResult>> CheckBenefitRules(IWizardContext context, Case newCase)
        {
            var list = new List<RuleResult>();
            list.AddRange(await CheckBenefitRules(context, newCase.MainMember));
            list.AddRange(await CheckBenefitRules(context, newCase.Spouse));
            list.AddRange(await CheckBenefitRules(context, newCase.Children));
            list.AddRange(await CheckBenefitRules(context, newCase.ExtendedFamily));
            return list;
        }

        private async Task<List<RuleResult>> CheckBenefitRules(IWizardContext context, List<RolePlayer> members)
        {
            var list = new List<RuleResult>();
            if (members != null)
            {
                foreach (var member in members)
                {
                    list.AddRange(await CheckBenefitRules(context, member));
                }
            }
            return list;
        }

        private async Task<List<RuleResult>> CheckBenefitRules(IWizardContext context, RolePlayer member)
        {
            var list = new List<RuleResult>();
            var rulesRelaxDate = DateTime.Parse(await _configurationService.GetModuleSetting("OnboardingRulesRelax"));
            if (member != null && member.Person != null)
            {
                if (member.Benefits != null && member.Benefits.Count > 0)
                {
                    foreach (var memberBenefit in member.Benefits)
                    {
                        var benefit = await _benefitService.GetBenefit(memberBenefit.Id);
                        if (benefit == null)
                            return new List<RuleResult>() { GetRuleResult(false, $"Invalid benefit has been selected for {member.DisplayName}") };

                        var executeRules = benefit.RuleItems.ToList();
                        if (member.JoinDate < rulesRelaxDate)
                        {
                            executeRules = executeRules.Where(s => !ageRules.Contains(s.RuleId)).ToList();
                        }

                        var ruleIds = executeRules.Select(ri => ri.RuleId).ToList();
                        var ruleRequest = new RuleRequest
                        {
                            RuleIds = ruleIds,
                            RuleItems = executeRules,
                            Data = context.Serialize(member),
                            ExecutionFilter = "benefit"
                        };
                        var ruleRequestResults = await context.ExecuteRules(ruleRequest);
                        list.AddRange(ruleRequestResults.RuleResults);
                    }
                }
            }
            return list;
        }

        private async Task<List<RuleResult>> CheckProductOptionRules(IWizardContext context, Case newCase)
        {
            var list = new List<RuleResult>();
            foreach (var policyOwner in newCase.MainMember.Policies)
            {
                if (policyOwner.ProductOption != null)
                {
                    if (policyOwner.ProductOptionId > 0)
                    {
                        var productOption = await _productOptionService.GetProductOption(policyOwner.ProductOptionId);
                        if (productOption == null) return new List<RuleResult>() { GetRuleResult(false, "Invalid product option has been selected") };
                        var ruleRequest = new RuleRequest
                        {
                            RuleIds = productOption.RuleItems.Select(ri => ri.RuleId).ToList<int>(),
                            RuleItems = productOption.RuleItems,
                            Data = context.Serialize(newCase),
                            ExecutionFilter = "productOption"
                        };
                        var ruleRequestResults = await context.ExecuteRules(ruleRequest);
                        list.AddRange(ruleRequestResults.RuleResults);
                    }
                }
                else
                {
                    list.Add(GetRuleResult(false, "Main member product option has not been selected."));
                }
            }
            return list;
        }

        private async Task<List<RuleResult>> CheckProductRules(IWizardContext context, Case newCase)
        {
            var product = await _productService.GetProduct(newCase.ProductId);
            if (product == null) return new List<RuleResult>() { GetRuleResult(false, "Invalid product has been selected") };
            var ruleRequest = new RuleRequest
            {
                RuleIds = product.RuleItems.Select(ri => ri.RuleId).ToList<int>(),
                RuleItems = product.RuleItems,
                Data = context.Serialize(newCase),
                ExecutionFilter = "product"
            };
            var ruleRequestResults = await context.ExecuteRules(ruleRequest);
            return ruleRequestResults.RuleResults;
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

        public Task OnSaveStep(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OverrideWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        private async Task<bool> UpdateDocumentKeyValues(string oldKeyValue, string newKeyValue)
        {
            return await _documentIndexService.UpdateDocumentKeyValues(oldKeyValue, newKeyValue);
        }

        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
