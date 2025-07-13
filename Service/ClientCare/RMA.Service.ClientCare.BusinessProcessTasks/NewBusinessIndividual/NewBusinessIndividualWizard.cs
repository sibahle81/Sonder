using Newtonsoft.Json;

using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
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
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.NewBusinessIndividual
{
    public class NewBusinessIndividualWizard : IWizardProcess
    {
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IProductService _productService;
        private readonly IProductOptionService _productOptionService;
        private readonly IBenefitService _benefitService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IPolicyCommunicationService _policyCommunicationService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IInvoiceService _invoiceService;
        private readonly IConfigurationService _configurationService;
        private readonly IUserService _userService;
        private readonly IWizardService _wizardService;
        private readonly IRepresentativeService _representativeService;
        private readonly IPolicyCaseService _caseService;

        private readonly int[] _ageRules = new int[] { 11, 12, 13, 14 };

        public NewBusinessIndividualWizard(
            IRolePlayerService rolePlayerService,
            IProductService productService,
            IProductOptionService productOptionService,
            IBenefitService benefitService,
            IDocumentGeneratorService documentGeneratorService,
            IPolicyCommunicationService policyCommunicationService,
            IDocumentIndexService documentIndexService,
            IInvoiceService invoiceService,
            IConfigurationService configurationService,
            IUserService userService,
            IWizardService wizardService,
            IPolicyCaseService caseService,
            IRepresentativeService representativeService
        )
        {
            _rolePlayerService = rolePlayerService;
            _productService = productService;
            _productOptionService = productOptionService;
            _benefitService = benefitService;
            _documentIndexService = documentIndexService;
            _documentGeneratorService = documentGeneratorService;
            _policyCommunicationService = policyCommunicationService;
            _invoiceService = invoiceService;
            _configurationService = configurationService;
            _userService = userService;
            _wizardService = wizardService;
            _representativeService = representativeService;
            _caseService = caseService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var caseModel = context.Deserialize<Case>(context.Data);
            var label = $"New Business (Individual): {caseModel.Code}";

            var policy = new RolePlayerPolicy
            {
                RepresentativeId = caseModel.RepresentativeId,
                BrokerageId = caseModel.BrokerageId,
                PolicyStatus = PolicyStatusEnum.PendingFirstPremium,
                PolicyNumber = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.PolicyNumber, "01"),
                ClientReference = caseModel.ClientReference,
                PaymentFrequency = PaymentFrequencyEnum.Monthly,
                AdminPercentage = 0,
                CommissionPercentage = 0,
                PolicyInceptionDate = DateTimeHelper.StartOfNextMonth
            };

            if (caseModel.MainMember.Person == null)
            {
                caseModel.MainMember.Person = new Person();
                caseModel.MainMember.Person.IsAlive = true;
                caseModel.MainMember.RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
            }
            else if (caseModel.MainMember.Person.IdType == IdTypeEnum.SAIDDocument && caseModel.MainMember.Person.IdNumber.Length == 13)
            {
                var rolePlayer = await GetRolePlayerByIdNumber(caseModel.MainMember.Person.IdNumber);
                if (rolePlayer != null)
                {
                    caseModel.MainMember = rolePlayer;
                }
            }

            caseModel.MainMember.Policies = new List<RolePlayerPolicy> { policy };

            var stepData = new ArrayList() { caseModel };
            var wizardId = await context.CreateWizard(label, stepData);
            return await Task.FromResult(wizardId);
        }

        private async Task<RolePlayer> GetRolePlayerByIdNumber(string idNumber)
        {
            var rolePlayers = await _rolePlayerService.GetPersonRolePlayerByIdNumber(IdTypeEnum.SAIDDocument, idNumber);
            if (rolePlayers.Count > 0)
            {
                return rolePlayers.FirstOrDefault(rp => rp.Person.IdNumber == idNumber);
            }

            return null;
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var @case = context.Deserialize<Case>(stepData[0].ToString());

            Case parentPolicyCase = null;
            if (@case.MainMember.Policies[0].ParentPolicyId.HasValue)
            {
                parentPolicyCase = await _caseService.GetCaseByPolicyId(@case.MainMember.Policies[0].ParentPolicyId.Value);
            }

            @case.MainMember.Policies.First().PolicyStatus = @case.MainMember.Policies[0].PolicyInceptionDate < DateTimeHelper.SaNow
                ? PolicyStatusEnum.Active
                : PolicyStatusEnum.PendingFirstPremium;

            var updatedCase = await this._rolePlayerService.RolePlayerIndividualWizardSubmit(@case);

            try
            {
                if (@case.MainMember.Policies[0].PolicyNumber != updatedCase.MainMember.Policies[0].PolicyNumber)
                {
                    @case = updatedCase;
                    stepData = new ArrayList { @case };
                    wizard.Data = JsonConvert.SerializeObject(stepData);
                    await context.UpdateWizard(wizard);
                }

                await _invoiceService.GenerateInvoice(@case.MainMember.Policies[0].PolicyId, ClientTypeEnum.Individual);
            }
            catch (Exception ex)
            {
                ex.LogException();
            }

            try
            {
                await UpdateDocumentKeyValues(@case.Code, @case.MainMember.Policies[0].PolicyNumber);
                @case.Representative = await _representativeService.GetRepresentativeWithNoRefData(@case.MainMember.Policies[0].RepresentativeId);
                await _policyCommunicationService.SendFuneralPolicyDocuments(
                    wizard.Id,
                    @case,
                    parentPolicyCase,
                    PolicySendDocsProcessTypeEnum.SendIndividualFuneralPolicySchedule);
            }
            catch (Exception ex)
            {
                ex.LogException();
            }

            var memberPortalBroker = await _configurationService.GetModuleSetting(SystemSettings.MemberPortalRoleBroker);
            var isBrokerOnPortal = await _userService.GetUsersByRoleAndEmail(memberPortalBroker, wizard.ModifiedBy);

            if (isBrokerOnPortal != null)
            {
                var approvedMessage = await _configurationService.GetModuleSetting(SystemSettings.CaseApprovedMessage);
                var request = new RejectWizardRequest()
                {
                    WizardId = wizard.Id,
                    Comment = @case.Code + ":" + approvedMessage,
                    RejectedBy = wizard.CreatedBy
                };
                await SendNotification(wizard, request, $": New Case {@case.Code} was Approved");
            }
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var newCase = context.Deserialize<Case>(stepData[0].ToString());

            var ruleResults = new List<RuleResult>();

            if (newCase.MainMember == null) return GetRuleRequestResult(false, "Main member has not been added");
            if (newCase.MainMember.Policies == null) return GetRuleRequestResult(false, "No policy information has been added");
            if (newCase.MainMember.Policies.Count == 0) return GetRuleRequestResult(false, "No policy information has been added");

            // General funeral validations
            ruleResults.AddRange(await CheckFuneralRules(context, newCase));
            // Validate product
            ruleResults.AddRange(await CheckProductRules(context, newCase));
            // Validate product options
            ruleResults.AddRange(await CheckProductOptionRules(context, newCase));
            // Validate benefits
            ruleResults.AddRange(await CheckBenefitRules(context, newCase));
            //validate roleplayers
            ruleResults.AddRange(await CheckRoleplayersForMultipleRelationsRule(newCase));

            var errors = ruleResults.Where(rr => !rr.Passed).ToList().Count;
            return GetRuleRequestResult(errors == 0, ruleResults);
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
                        {
                            return new List<RuleResult>() { GetRuleResult(false, $"Invalid benefit has been selected for {member.DisplayName}") };
                        }

                        var executeRules = benefit.RuleItems.ToList();

                        if (member.JoinDate < rulesRelaxDate)
                        {
                            executeRules = executeRules.Where(s => !_ageRules.Contains(s.RuleId)).ToList();
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

        private Task<List<RuleResult>> CheckRoleplayersForMultipleRelationsRule(Case newCase)
        {
            var messages = new List<string>();
            var roleplayerRelationship = new Dictionary<string, string>();

            //ADD MAIN MEMBER
            roleplayerRelationship.Add($"Main Member {newCase.MainMember.DisplayName}: Identity number ({newCase.MainMember.Person.IdNumber}) has been used by several roleplayers", newCase.MainMember.Person.IdNumber);

            //Extended Family
            foreach (var extendedFamilyMember in newCase.ExtendedFamily)
            {
                roleplayerRelationship.Add($"Extended Family {extendedFamilyMember.DisplayName}: Identity number ({extendedFamilyMember.Person.IdNumber}) has been used by several roleplayers", extendedFamilyMember.Person.IdNumber);
            }

            //Children
            foreach (var child in newCase.Children)
            {
                roleplayerRelationship.Add($"Child {child.DisplayName}: Identity number ({child.Person.IdNumber}) has been used by several roleplayers", child.Person.IdNumber);
            }

            //Spouce
            foreach (var spouce in newCase.Spouse)
            {
                var idNumber = spouce.Person.IdNumber != null ? spouce.Person.IdNumber : spouce.Person.PassportNumber;
                roleplayerRelationship.Add($"Spouse {spouce.DisplayName}: Identity number ({spouce.Person.IdNumber}) has been used by several roleplayers", spouce.Person.IdNumber);
            }

            //Keep only the duplicates
            var duplicates = roleplayerRelationship.Where(i => roleplayerRelationship.Any(t => t.Key != i.Key && t.Value == i.Value)).ToDictionary(i => i.Key, i => i.Value);

            foreach (var duplicate in duplicates)
            {
                messages.Add(duplicate.Key);
            }

            var result = new RuleResult
            {
                Passed = messages.Count == 0,
                RuleName = "Multiple Relations",
                MessageList = messages
            };

            return Task.FromResult(new List<RuleResult> { result });
        }

        private RuleResult GetRuleResult(bool success, string message)
        {
            return new RuleResult
            {
                Passed = success,
                RuleName = "New Individual Business",
                MessageList = new List<string>() { message }
            };
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

        private async Task<bool> UpdateDocumentKeyValues(string oldKeyValue, string newKeyValue)
        {
            return await _documentIndexService.UpdateDocumentKeyValues(oldKeyValue, newKeyValue);
        }

        private async Task SendNotification(Wizard wizard, RejectWizardRequest rejectWizardRequest, string title)
        {
            await _wizardService.SendWizardNotification("member-portal-notification", title,
                rejectWizardRequest.Comment, null, 0, wizard.ModifiedBy);
        }

        #region Not Implimented
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

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            Contract.Requires(context != null);
            if (rejectWizardRequest != null)
            {
                var wizard = context.Deserialize<Wizard>(context.Data);
                var stepData = context.Deserialize<ArrayList>(wizard.Data);
                var @case = context.Deserialize<Case>(stepData[0].ToString());

                var memberPortalBroker = await _configurationService.GetModuleSetting(SystemSettings.MemberPortalRoleBroker);
                var isBrokerOnPortal = await _userService.GetUsersByRoleAndEmail(memberPortalBroker, wizard.CreatedBy);
                if (isBrokerOnPortal != null)
                {
                    await SendNotification(wizard, rejectWizardRequest, $"New Case {@case.Code} was Rejected");
                }
            }
        }

        public async Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            Contract.Requires(context != null);
            if (rejectWizardRequest != null)
            {
                var wizard = context.Deserialize<Wizard>(context.Data);
                var stepData = context.Deserialize<ArrayList>(wizard.Data);
                var @case = context.Deserialize<Case>(stepData[0].ToString());

                var memberPortalBroker = await _configurationService.GetModuleSetting(SystemSettings.MemberPortalRoleBroker);
                var isBrokerOnPortal = await _userService.GetUsersByRoleAndEmail(memberPortalBroker, wizard.CreatedBy);
                if (isBrokerOnPortal != null)
                {
                    await SendNotification(wizard, rejectWizardRequest, $": New Case {@case.Code} was Disputed");

                    wizard.LockedToUser = wizard.CreatedBy;
                    wizard.WizardStatus = WizardStatusEnum.Disputed;
                    wizard.WizardStatusId = (int)WizardStatusEnum.Disputed;
                    await _wizardService.UpdateWizard(wizard);
                }
            }
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
        #endregion
    }
}
