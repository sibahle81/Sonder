using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.Contracts.Utils;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

namespace RMA.Service.ClientCare.BusinessProcessTasks.ManageGroupRiskPremiumRates
{
    public class ManageGroupRiskPremiumRates : IWizardProcess
    {
        private readonly ISerializerService _serializer;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IGroupRiskPolicyCaseService _groupRiskPolicyCaseService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly ICommonSystemNoteService _commonSystemNoteService;
        private readonly IUserReminderService _userReminderService;
        private readonly IUserService _userService;

        public ManageGroupRiskPremiumRates(
            ISerializerService serializerService,
            IRolePlayerService rolePlayerService,
            IGroupRiskPolicyCaseService groupRiskPolicyCaseService,
            IDocumentIndexService documentIndexService,
            ICommonSystemNoteService commonSystemNoteService,
            IUserReminderService userReminderService,
            IUserService userService)
        {
            _serializer = serializerService;
            _rolePlayerService = rolePlayerService;
            _groupRiskPolicyCaseService = groupRiskPolicyCaseService;
            _documentIndexService = documentIndexService;
            _commonSystemNoteService = commonSystemNoteService;
            _userReminderService = userReminderService;
            _userService = userService;
        }
        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context != null)
            {
                var wizardId = await AddWizard(context);
                return await Task.FromResult(wizardId);
            }
            return 0;
        }

        private async Task<int> AddWizard(IWizardContext context)
        {
            var groupRiskEmployerPremiumRateModel = new GroupRiskEmployerPremiumRateModel();
            var isNew = context.LinkedItemId <= 0;

            if (!isNew)
            {
                groupRiskEmployerPremiumRateModel = await _groupRiskPolicyCaseService.GetGroupRiskEmployerPremiumRateModel(context.LinkedItemId);
            }
            else
            {
                groupRiskEmployerPremiumRateModel = context.Deserialize<GroupRiskEmployerPremiumRateModel>(context?.Data);
            }
    
             var stepData = new ArrayList() { groupRiskEmployerPremiumRateModel };

            var rolePlayer = await _rolePlayerService.GetRolePlayerWithoutReferenceData(groupRiskEmployerPremiumRateModel.EmployerRolePlayerId);

            string label = "";
            if (rolePlayer != null)
            {
                 label = !isNew
                ? $"Update Premium Rates-{rolePlayer.DisplayName}"
                : $"Premium Rates- {rolePlayer.DisplayName}";
            }

            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context?.Deserialize<ArrayList>(wizard.Data);
            var groupRiskEmployerPremiumRateModel = context?.Deserialize<GroupRiskEmployerPremiumRateModel>(stepData[0].ToString());
            _ = await _groupRiskPolicyCaseService.CreatePremiumRates(groupRiskEmployerPremiumRateModel);

            foreach (var groupRiskPolicy in groupRiskEmployerPremiumRateModel.PolicyPremiumRateDetailModels)
            {
                await _documentIndexService.UpdateDocumentKeys(DocumentSystemNameEnum.PolicyManager, "WizardId", wizard.Id.ToString(), "PolicyId", groupRiskPolicy.PolicyId.ToString());
                await _commonSystemNoteService.UpdateCommonSystemNoteKeys(ModuleTypeEnum.ClientCare, NoteItemTypeEnum.Wizard, wizard.Id, NoteItemTypeEnum.Policy, groupRiskPolicy.PolicyId);
            }
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {

            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context?.Deserialize<ArrayList>(wizard.Data);
            var groupRiskEmployerPremiumRateModel = context?.Deserialize<GroupRiskEmployerPremiumRateModel>(stepData[0].ToString());
            var ruleResults = new List<RuleResult>();

            var policyIds = groupRiskEmployerPremiumRateModel.PolicyPremiumRateDetailModels.Select(x => x.PolicyId).ToList();
            var policyBenefitDetails = await _groupRiskPolicyCaseService.GetPolicyBenefitDetail(policyIds);

            if (policyBenefitDetails.Count == 0)
            {
                ruleResults.Add(new RuleResult { Passed = false, RuleName = "Policy Benefit Details", MessageList = new List<string> { "Policy benefit details missing." } });
            }


            foreach (var premiumRate in groupRiskEmployerPremiumRateModel.PolicyPremiumRateDetailModels)
            {
                if(string.IsNullOrEmpty(premiumRate.BillingMethodCode))
                {
                    ruleResults.Add(new RuleResult { Passed = false, RuleName = "Policy Benefit Details", MessageList = new List<string> { $"Billing Basis missing for policy {premiumRate.PolicyName} with benefit {premiumRate.BenefitName} ." } });
                }

                if (string.IsNullOrEmpty(premiumRate.BillingLevelCode))
                {
                    ruleResults.Add(new RuleResult { Passed = false, RuleName = "Policy Benefit Details", MessageList = new List<string> { $"Billing level missing for policy {premiumRate.PolicyName} with benefit {premiumRate.BenefitName} ." } });
                }

                if (premiumRate.BenefitId <= 0)
                {
                    ruleResults.Add(new RuleResult { Passed = false, RuleName = "Policy Benefit Details", MessageList = new List<string> { $"Benefit level missing for policy {premiumRate.PolicyName}." } });
                }


                if (premiumRate.BenefitCategoryId  == default   &&  premiumRate.BillingLevelName != GroupRiskPolicyCaseUtility.BenefitBillingLevelName)
                {
                    ruleResults.Add(new RuleResult { Passed = false, RuleName = "Policy Benefit Details", MessageList = new List<string> { $"Benefit Category missing for policy {premiumRate.PolicyName} with benefit {premiumRate.BenefitName} ." } });
                }
            }

            if (policyBenefitDetails.Count > 0)
            {
                foreach (var premiumRate in groupRiskEmployerPremiumRateModel.PolicyPremiumRateDetailModels)
                {
                    var premiumRateDetail = policyBenefitDetails.Where(x => x.PolicyId == premiumRate.PolicyId && x.BenefitDetailId == premiumRate.BenefitDetailId && x.BenefitId == premiumRate.BenefitId && x.StartDate > premiumRate.EffectiveDate).ToList();

                    if (premiumRateDetail.Count > 0)
                    {
                        ruleResults.Add(new RuleResult { Passed = false, RuleName = "Premium Rate Effective Date", MessageList = new List<string> { $"Premium rate with Benefit {premiumRate.BenefitName} cannot have effective date {premiumRate.EffectiveDate} which is before {premiumRateDetail.FirstOrDefault()?.StartDate.ToString("dd-MM-yyyy")}" } });

                    }
                }
            }

            return new RuleRequestResult()
            {
                OverallSuccess = ruleResults.Count <= 0,
                RequestId = Guid.NewGuid(),
                RuleResults = ruleResults
            };
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            string name = string.Empty;
            try
            {
                var datain = JValue.Parse(data);
                var groupRiskEmployerModel = _serializer.Deserialize<GroupRiskCaseModel>(datain[0].ToString());

                if (currentwizardname == null) { return string.Empty; }
                var newname = groupRiskEmployerModel.Code;
                var oldname = currentwizardname.Split(':')[0];
                if (!string.IsNullOrEmpty(newname))
                {
                    name = oldname.Trim() + " : " + newname.Trim();
                }
                else
                {
                    name = oldname.Trim();
                }

            }
            catch (Exception ex)
            {
                ex.LogException();
            }
            return name;

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

        private RuleRequestResult GetRuleRequestResult(bool success, string message, string ruleName)
        {
            return new RuleRequestResult
            {
                RequestId = Guid.NewGuid(),
                RuleResults = new List<RuleResult>() { GetRuleResult(success, message, ruleName) },
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
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context?.Deserialize<ArrayList>(wizard.Data);
            var groupRiskEmployerPremiumRateModel = context?.Deserialize<GroupRiskEmployerPremiumRateModel>(stepData[0].ToString());
            var rolePlayer = await _rolePlayerService.GetRolePlayerWithoutReferenceData(groupRiskEmployerPremiumRateModel.EmployerRolePlayerId);

            try
            {
                var link = $"/clientcare/member-manager/manage-grouprisk-premium-rates/continue/{wizard.Id}";
                var recipients = await _userService.SearchUsersByPermission("Approve Group Risk Premium Rate");

                var userReminders = recipients.Select(recipient => new  UserReminder
                {
                    UserReminderType = UserReminderTypeEnum.SystemNotification,
                    UserReminderItemType = UserReminderItemTypeEnum.PolicyPremiumRate,
                    AlertDateTime = DateTimeHelper.SaNow,
                    Text = $"Approval request for wizard Billing : {rolePlayer.DisplayName}",
                    LinkUrl = link,
                    AssignedToUserId = recipient.Id
                }).ToList();

                _ = Task.Run(() => _userReminderService.CreateUserReminders(userReminders));
                
            }
            catch (Exception e)
            {
                e.LogException();
            }
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
    }
}
