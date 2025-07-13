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
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

using Roleplayer = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.RolePlayer;

namespace RMA.Service.ClientCare.BusinessProcessTasks.ContinuePolicyWizard
{
    public class ContinuePolicyWizard : IWizardProcess
    {
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IPolicyCaseService _caseService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IPolicyCommunicationService _policyCommunicationService;
        private readonly IInvoiceService _invoiceService;
        private readonly ICollectionService _collectionService;
        private readonly IRepresentativeService _representativeService;
        private readonly IConfigurationService _configurationService;
        private readonly IProductService _productService;
        private readonly IProductOptionService _productOptionService;
        private readonly IBenefitService _benefitService;

        private int[] ageRules = new int[] { 11, 12, 13, 14 };

        public ContinuePolicyWizard(IRolePlayerPolicyService rolePlayerPolicyService,
            IPolicyCaseService caseService,
            IDocumentIndexService documentIndexService,
            IPolicyCommunicationService policyCommunicationService,
            IInvoiceService invoiceService,
            ICollectionService collectionService,
            IRepresentativeService representativeService,
            IConfigurationService configurationService,
            IProductService productService,
            IProductOptionService productOptionService,
            IBenefitService benefitService
        )
        {
            _caseService = caseService;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _documentIndexService = documentIndexService;
            _policyCommunicationService = policyCommunicationService;
            _invoiceService = invoiceService;
            _collectionService = collectionService;
            _representativeService = representativeService;
            _configurationService = configurationService;
            _productService = productService;
            _productOptionService = productOptionService;
            _benefitService = benefitService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            RmaIdentity.DemandPermission(Permissions.CreateContinuePolicyCaseWizard);

            var contextData = context.Deserialize<Case>(context.Data);
            var caseModel = await _caseService.GetCaseByPolicyId(context.LinkedItemId);
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

            Case parentPolicyCase = null;
            if (policyCase.MainMember.Policies[0].ParentPolicyId.HasValue)
            {
                parentPolicyCase = await _caseService.GetCaseByPolicyId(policyCase.MainMember.Policies[0].ParentPolicyId.Value);
            }

            // Remove new main member from the previous category where it was
            policyCase = UpdateMainMemberPolicy(policyCase);

            // Remove all the deleted roleplayers that have been moved to another section
            // e.g. extended family to child
            var removalDate = DateTimeHelper.SaNow;
            policyCase = RemoveDeletedRolePlayers(policyCase, ref removalDate);

            // Remove existing policies from the new main member object
            if (policyCase.NewMainMember?.Policies?.Count > 0)
            {
                policyCase.NewMainMember.Policies[0] = null;
            }

            await _rolePlayerPolicyService.ContinuePolicy(policyCase);
            await _rolePlayerPolicyService.UpdatePolicyPremiums(policyCase);
            await CreateContinuationInvoices(policyCase);

            var policy = policyCase.MainMember.Policies[0];
            policyCase.MainMember = policyCase.NewMainMember;
            policyCase.MainMember.Policies.Insert(0, policy);
            await SendPolicyDocuments(wizard, policyCase, parentPolicyCase);
        }

        private Case UpdateMainMemberPolicy(Case policyCase)
        {
            var mainMemberId = policyCase.NewMainMember.RolePlayerId;
            policyCase.Spouse = RemoveMember(mainMemberId, policyCase.Spouse);
            policyCase.Children = RemoveMember(mainMemberId, policyCase.Children);
            policyCase.ExtendedFamily = RemoveMember(mainMemberId, policyCase.ExtendedFamily);
            policyCase.Beneficiaries = ClearRedundantData(policyCase.Beneficiaries);

            // Make sure the main member is active
            policyCase.NewMainMember.IsDeleted = false;
            policyCase.NewMainMember.EndDate = null;
            if (policyCase.NewMainMember.Person != null)
            {
                policyCase.NewMainMember.Person.IsDeleted = false;
            }
            return policyCase;
        }

        private List<Roleplayer> ClearRedundantData(List<Roleplayer> beneficiaries)
        {
            beneficiaries.ForEach(b =>
            {
                b.Policies = null;
                b.Benefits = null;
            });
            return beneficiaries;
        }

        private List<Roleplayer> RemoveMember(int mainMemberId, List<Roleplayer> members)
        {
            if (members == null || members.Count == 0) return new List<Roleplayer>();
            return members.Where(m => m.RolePlayerId != mainMemberId).ToList();
        }

        private Case RemoveDeletedRolePlayers(Case policyCase, ref DateTime removalDate)
        {
            policyCase.Spouse = RemoveDeletedMembers(policyCase.MainMember, policyCase.Spouse);
            policyCase.Children = RemoveDeletedMembers(policyCase.MainMember, policyCase.Children);
            policyCase.ExtendedFamily = RemoveDeletedMembers(policyCase.MainMember, policyCase.ExtendedFamily);
            foreach (var spouse in policyCase.Spouse)
            {
                if (!spouse.IsDeleted)
                {
                    // Check if there is a deleted entry in children or extendedFamily
                    // members and remove that one if it exists
                    policyCase.Children = RemoveDeletedMembers(spouse, policyCase.Children);
                    policyCase.ExtendedFamily = RemoveDeletedMembers(spouse, policyCase.ExtendedFamily);
                }
                else if (spouse.EndDate?.ToSaDateTime() < removalDate)
                {
                    removalDate = spouse.EndDate.HasValue ? spouse.EndDate.Value.ToSaDateTime() : DateTimeHelper.SaNow.Date;
                }
            }
            foreach (var child in policyCase.Children)
            {
                if (!child.IsDeleted)
                {
                    policyCase.Spouse = RemoveDeletedMembers(child, policyCase.Spouse);
                    policyCase.ExtendedFamily = RemoveDeletedMembers(child, policyCase.ExtendedFamily);
                }
                else if (child.EndDate?.ToSaDateTime() < removalDate)
                {
                    removalDate = child.EndDate.HasValue ? child.EndDate.Value.ToSaDateTime() : DateTimeHelper.SaNow.Date;
                }
            }
            foreach (var member in policyCase.ExtendedFamily)
            {
                if (!member.IsDeleted)
                {
                    policyCase.Spouse = RemoveDeletedMembers(member, policyCase.Spouse);
                    policyCase.Children = RemoveDeletedMembers(member, policyCase.Children);
                }
                else if (member.EndDate?.ToSaDateTime() < removalDate)
                {
                    removalDate = member.EndDate.HasValue ? member.EndDate.Value.ToSaDateTime() : DateTimeHelper.SaNow.Date;
                }
            }
            return policyCase;
        }

        private List<Roleplayer> RemoveDeletedMembers(Roleplayer roleplayer, List<Roleplayer> members)
        {
            members.RemoveAll(m => m.IsDeleted
                && ((m.RolePlayerId > 0 && m.RolePlayerId == roleplayer.RolePlayerId)
                 || (m.RolePlayerId == 0 && m.Person.IdNumber == roleplayer.Person.IdNumber)));
            return members;
        }

        private async Task SendPolicyDocuments(Wizard wizard, Case policyCase, Case parentPolicyCase)
        {
            try
            {
                await UpdateDocumentKeyValues(policyCase.Code, policyCase.MainMember.Policies[0].PolicyNumber);
                policyCase.Representative = await _representativeService.GetRepresentativeWithNoRefData(policyCase.MainMember.Policies[0].RepresentativeId);
                await _policyCommunicationService.SendFuneralPolicyDocuments(wizard.Id, policyCase, parentPolicyCase, PolicySendDocsProcessTypeEnum.SendIndividualFuneralPolicySchedule);
            }
            catch (Exception ex)
            {
                ex.LogException();
            }
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

        private async Task CreateContinuationInvoices(Case policyCase)
        {
            var policy = policyCase.MainMember.Policies[0];
            var mainMember = policyCase.NewMainMember;

            policy.PolicyStatus = PolicyStatusEnum.Continued;
            await _rolePlayerPolicyService.UpdatePolicyStatus(policy);

            if (policy.ContinuationEffectiveDate != null)
                await _invoiceService.GenerateContinuationInvoices(policy.PolicyId, (DateTime)policy.ContinuationEffectiveDate);

            if (policy.AdhocDebitDate != null)
            {
                var totalOutstanding = await _invoiceService
                    .GetTotalPendingRaisedForReinstatement(policy.PolicyId, (DateTime)policy.PolicyPauseDate);
                if (totalOutstanding > 0)
                {
                    var collectionInstructions = new List<AdhocPaymentInstruction>();
                    var instruction = new AdhocPaymentInstruction
                    {
                        Amount = totalOutstanding,
                        AdhocPaymentInstructionStatus = AdhocPaymentInstructionStatusEnum.Pending,
                        Reason = "Policy Continuation",
                        RolePlayerId = mainMember.RolePlayerId,
                        RolePlayerName = mainMember.DisplayName,
                        DateToPay = (DateTime)policy.AdhocDebitDate
                    };
                    collectionInstructions.Add(instruction);
                    await _collectionService.AddhocCollections(collectionInstructions);
                }
            }
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
            var newCase = context.Deserialize<Case>(stepData[0].ToString());

            var currentPolicy = newCase.MainMember.Policies[0];
            newCase.MainMember = newCase.NewMainMember;
            newCase.MainMember.Policies[0].ProductOption = currentPolicy.ProductOption;

            var ruleResults = new List<RuleResult>();

            // New main member was on policy validation
            var memberResult = await CheckMemberOnPolicy(currentPolicy.PolicyId, newCase.NewMainMember.RolePlayerId);
            ruleResults.Add(memberResult);
            // General funeral validations
            ruleResults.AddRange(await CheckFuneralRules(context, newCase));
            // Validate product
            ruleResults.AddRange(await CheckProductRules(context, newCase));
            // Validate product options
            ruleResults.AddRange(await CheckProductOptionRules(context, newCase));
            // Validate benefits
            ruleResults.AddRange(await CheckBenefitRules(context, newCase));

            var errors = ruleResults.Where(rr => !rr.Passed).ToList().Count;
            return GetRuleRequestResult(errors == 0, ruleResults);
        }

        private async Task<RuleResult> CheckMemberOnPolicy(int policyId, int rolePlayerId)
        {
            var members = await _rolePlayerPolicyService.GetPolicyMembers(policyId);
            if (members == null || members.Count == 0)
            {
                return GetRuleResult(false, "New main member is not an existing member on the policy");
            }
            var member = members.Where(m => m.RolePlayerId == rolePlayerId).LastOrDefault();
            if (member == null)
            {
                return GetRuleResult(false, "New main member is not an existing member on the policy");
            }
            else
            {
                return GetRuleResult(true, "New main member is an existing member on the policy");
            }
        }


        private RuleResult GetRuleResult(bool success, string message)
        {
            return new RuleResult
            {
                Passed = success,
                RuleName = "Continue Policy",
                MessageList = new List<string>() { message }
            };
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
