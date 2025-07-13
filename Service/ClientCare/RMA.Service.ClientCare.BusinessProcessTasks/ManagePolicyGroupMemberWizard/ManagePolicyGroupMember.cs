using RMA.Common.Security;
using RMA.Common.Service.ServiceBus.Producers;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.ManagePolicyGroupMemberWizard
{
    public class ManagePolicyGroupMember : IWizardProcess
    {
        private readonly IPolicyService _policyService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IBenefitService _benefitService;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IProductOptionService _productOptionService;
        private readonly IConfigurationService _configurationService;
        private readonly IPremiumListingService _premiumListingService;
        private readonly IPolicyCommunicationService _communicationService;
        private readonly IBillingFuneralPolicyChangeService _billingFuneralPolicyChangeService;

        private readonly int[] ageRules = new int[] { 11, 12, 13, 14 };
        private const string PolicyAmendmentNotificationFlag = "AmendmentLetterFlag";
        public const string PolicyChangesQueueName = "mcc.fin.billingpolicychanges";

        public ManagePolicyGroupMember(
            IPolicyService policyService,
            IRolePlayerService rolePlayerService,
            IBenefitService benefitService,
            IProductOptionService productOptionService,
            IRolePlayerPolicyService rolePlayerPolicyService,
            IConfigurationService configurationService,
            IPremiumListingService premiumListingService,
            IPolicyCommunicationService communicationService,
            IBillingFuneralPolicyChangeService billingFuneralPolicyChangeService
        )
        {
            _policyService = policyService;
            _rolePlayerService = rolePlayerService;
            _benefitService = benefitService;
            _productOptionService = productOptionService;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _configurationService = configurationService;
            _premiumListingService = premiumListingService;
            _communicationService = communicationService;
            _billingFuneralPolicyChangeService = billingFuneralPolicyChangeService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            RmaIdentity.DemandPermission(Permissions.CreateManagePolicyCaseWizard);

            var memberPolicy = context.Deserialize<RolePlayerGroupPolicy>(context.Data);

            var policy = await _policyService.GetPolicy(memberPolicy.ParentPolicyId);
            var rolePlayer = await _rolePlayerService.GetPersonDetailsByIdNumber(memberPolicy.MainMember.Person.IdType, memberPolicy.MainMember.Person.IdNumber);
            if (rolePlayer.RolePlayerId > 0)
            {
                memberPolicy.MainMember = rolePlayer;
                memberPolicy.MainMember.FuneralParlor = null;
            }

            memberPolicy.CaseTypeId = (int)CaseTypeEnum.GroupPolicyMember;
            memberPolicy.CompanyName = policy.ClientName;
            memberPolicy.PolicyInceptionDate = Convert.ToDateTime(policy.PolicyInceptionDate);
            memberPolicy.ProductOptionId = policy.ProductOptionId;


            memberPolicy.MainMember.Policies = new List<RolePlayerPolicy> { GetNewPolicy(policy) };
            if (!memberPolicy.MainMember.JoinDate.HasValue || memberPolicy.MainMember.JoinDate.Value.Year <= 1800)
            {
                memberPolicy.MainMember.JoinDate = policy.PolicyInceptionDate;
            }
            memberPolicy.Spouse = new List<RolePlayer>();
            memberPolicy.Children = new List<RolePlayer>();
            memberPolicy.ExtendedFamily = new List<RolePlayer>();
            memberPolicy.Beneficiaries = new List<RolePlayer>();

            var stepData = new ArrayList() { memberPolicy };
            var label = $"Maintain Group Policy Member: {memberPolicy.Code}";
            var wizardId = await context.CreateWizard(label, stepData);

            return await Task.FromResult(wizardId);
        }

        private RolePlayerPolicy GetNewPolicy(Contracts.Entities.Policy.Policy policy)
        {
            var rolePlayerPolicy = new RolePlayerPolicy
            {
                PolicyId = 0,
                ProductOptionId = policy.ProductOptionId,
                PaymentFrequency = policy.PaymentFrequency,
                PaymentMethod = policy.PaymentMethod,
                PolicyStatus = policy.PolicyStatus,
                PolicyInceptionDate = Convert.ToDateTime(policy.PolicyInceptionDate)
            };
            rolePlayerPolicy.Benefits = new List<Benefit>();
            rolePlayerPolicy.Benefits.Add(
                new Benefit { Id = 0 }
            );

            return rolePlayerPolicy;
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            RmaIdentity.DemandPermission(Permissions.CreateManagePolicyCaseWizard);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var policy = GetWizardData(context, wizard.Data);
            var updatedPolicy = policy.MainMember.Policies[0];
            var existingPolicy = await _policyService.GetPolicyWithoutReferenceData(policy.MainMember.Policies[0].PolicyId);
            var existingChildMemberCount = await _policyService.GetChildPolicyCount(existingPolicy.PolicyId);

            var policyId = await _rolePlayerPolicyService.CreateGroupPolicyMember(policy);
            await _rolePlayerPolicyService.UpdateChildPolicyPremiums(policy.ParentPolicyId);

            var newChildMemberCount = await _policyService.GetChildPolicyCount(existingPolicy.PolicyId);

            decimal invoiceTotal = updatedPolicy.InstallmentPremium - existingPolicy.InstallmentPremium;

            if (newChildMemberCount != existingChildMemberCount && invoiceTotal != 0)
            {
                var basePremiumAmount = Math.Abs(invoiceTotal);

                // queue policyChanged message for billing processing
                var billingPolicyChangeMessage = new BillingPolicyChangeMessage()
                {
                    OldPolicyDetails = new BillingPolicyChangeDetail
                    {
                        PolicyId = existingPolicy.PolicyId,
                        DecemberInstallmentDayOfMonth = existingPolicy.DecemberInstallmentDayOfMonth,
                        FirstInstallmentDate = existingPolicy.FirstInstallmentDate,
                        PolicyInceptionDate = (DateTime)existingPolicy.PolicyInceptionDate,
                        PolicyStatus = existingPolicy.PolicyStatus,
                        InstallmentPremium = existingPolicy.InstallmentPremium
                    },
                    NewPolicyDetails = new BillingPolicyChangeDetail
                    {
                        PolicyId = updatedPolicy.PolicyId,
                        DecemberInstallmentDayOfMonth = updatedPolicy.DecemberInstallmentDayOfMonth,
                        FirstInstallmentDate = updatedPolicy.FirstInstallmentDate,
                        PolicyInceptionDate = updatedPolicy.PolicyInceptionDate,
                        PolicyStatus = updatedPolicy.PolicyStatus,
                        InstallmentPremium = updatedPolicy.InstallmentPremium,
                        AdministrationPercentage = updatedPolicy.AdminPercentage,
                        BinderFeePercentage = updatedPolicy.BinderFeePercentage,
                        CommissionPercentage = updatedPolicy.CommissionPercentage,
                        PremiumAdjustmentPercentage = updatedPolicy.PremiumAdjustmentPercentage
                    },
                    RequestedByUsername = SystemSettings.SystemUserAccount,
                    IsGroupPolicy = false,
                    PolicyChangeMessageType = PolicyChangeMessageTypeEnum.MemberCountChange,
                    SourceModule = SourceModuleEnum.ClientCare,
                    AdjustmentAmount = basePremiumAmount
                };

                await _billingFuneralPolicyChangeService.ProcessBillingPolicyChanges(billingPolicyChangeMessage);
            }
            _ = Task.Run(() => SendPolicyDocuments(policy, policyId));
        }

        private async Task SendPolicyDocuments(RolePlayerGroupPolicy policy, int policyId)
        {
            var parentPolicy = await _policyService.GetPolicy(policy.ParentPolicyId);
            var parentPolicyMember = await _premiumListingService.GetPolicyMemberDetails(parentPolicy.PolicyNumber);

            await _communicationService.SendGroupPolicyOrganisationDocuments(parentPolicy, policy.ParentPolicyId, parentPolicyMember.PolicyNumber, parentPolicyMember.MemberName, parentPolicyMember.EmailAddress);
            await _communicationService.SendGroupPolicyMemberDocuments(policyId, parentPolicyMember.PolicyNumber, parentPolicyMember.MemberName, parentPolicyMember.EmailAddress, parentPolicy.IsEuropAssist);
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var policy = GetWizardData(context, wizard.Data);

            var ruleResults = new List<RuleResult>();

            if (policy.MainMember == null) return GetRuleRequestResult(false, "Main member has not been added");

            var policyExists = await PolicyAlreadyExists(policy);
            if (policyExists)
            {
                return GetRuleRequestResult(false, $"A policy for member {policy.MainMember.DisplayName} {GetClientReference(policy.ClientReference)}already exists on parent policy {policy.ParentPolicyNumber}.");
            }
            else
            {
                // General funeral validations
                ruleResults.AddRange(await CheckFuneralRules(context, policy));
                // Validate product options
                ruleResults.AddRange(await CheckProductOptionRules(context, policy));
                // Validate benefits
                ruleResults.AddRange(await CheckBenefitRules(context, policy));
            }
            var errors = ruleResults.Where(rr => !rr.Passed).ToList().Count;
            return GetRuleRequestResult(errors == 0, ruleResults);
        }

        private string GetClientReference(string reference)
        {
            if (String.IsNullOrEmpty(reference)) return "";
            return $"with client reference {reference} ";
        }

        private async Task<bool> PolicyAlreadyExists(RolePlayerGroupPolicy memberPolicy)
        {
            var policy = await _policyService.GetChildPolicy(
                memberPolicy.ParentPolicyId,
                memberPolicy.ClientReference,
                memberPolicy.MainMember.Person.IdType,
                memberPolicy.MainMember.Person.IdNumber);
            return policy != null;
        }

        private async Task<List<RuleResult>> CheckBenefitRules(IWizardContext context, RolePlayerGroupPolicy newCase)
        {
            var list = new List<RuleResult>();
            list.AddRange(await CheckBenefitRules(context, newCase.MainMember));
            list.AddRange(await CheckBenefitRuless(context, newCase.Spouse));
            list.AddRange(await CheckBenefitRuless(context, newCase.Children));
            list.AddRange(await CheckBenefitRuless(context, newCase.ExtendedFamily));
            return list;
        }

        private async Task<List<RuleResult>> CheckBenefitRuless(IWizardContext context, List<RolePlayer> members)
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

        private async Task<List<RuleResult>> CheckProductOptionRules(IWizardContext context, RolePlayerGroupPolicy newCase)
        {
            var list = new List<RuleResult>();
            var productOptionId = newCase.ProductOptionId;
            foreach (var policyOwner in newCase.MainMember.Policies)
            {
                var productOption = await _productOptionService.GetProductOption(productOptionId);
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
            return list;
        }

        private async Task<IEnumerable<RuleResult>> CheckFuneralRules(IWizardContext context, RolePlayerGroupPolicy newCase)
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

        private RuleRequestResult GetRuleRequestResult(bool success, string message)
        {
            return new RuleRequestResult
            {
                RequestId = Guid.NewGuid(),
                RuleResults = new List<RuleResult>() { GetRuleResult(success, message) },
                OverallSuccess = success
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

        private RuleResult GetRuleResult(bool success, string message)
        {
            return new RuleResult
            {
                Passed = success,
                RuleName = "Group Policy Member",
                MessageList = new List<string>() { message }
            };
        }

        private RolePlayerGroupPolicy GetWizardData(IWizardContext context, string json)
        {
            if (json.StartsWith("["))
            {
                var stepData = context.Deserialize<List<RolePlayerGroupPolicy>>(json);
                return stepData[0];
            }
            else
            {
                return context.Deserialize<RolePlayerGroupPolicy>(json);
            }
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public Task<string> ChangeTheNameWizard(string data, int wizardId, string currentWizardName)
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

        public Task OnSaveStep(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        public async Task OverrideWizard(IWizardContext context)
        {
            return;
        }
        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
