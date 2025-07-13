using Newtonsoft.Json.Linq;
using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Broker;
using RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Linq.Dynamic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.BrokerageWizard
{
    public class ManageGroupRiskPoliciesWizard : IWizardProcess
    {
        private readonly ISerializerService _serializer;
        private readonly IGroupRiskPolicyCaseService _groupRiskPolicyCaseService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly ICommonSystemNoteService _commonSystemNoteService;
        private readonly IRolePlayerService _rolePlayerService;
        public ManageGroupRiskPoliciesWizard(ISerializerService serializerService, 
            IGroupRiskPolicyCaseService groupRiskPolicyCaseService,
            IDocumentIndexService documentIndexService,
            ICommonSystemNoteService commonSystemNoteService,
            IRolePlayerService rolePlayerService)
        {
            _serializer = serializerService;
            _groupRiskPolicyCaseService = groupRiskPolicyCaseService;
            _documentIndexService = documentIndexService;
            _commonSystemNoteService = commonSystemNoteService;
            _rolePlayerService = rolePlayerService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            int wizardId = 0;
            if (context != null)
            {
                wizardId = await AddWizard(context);
            }
            return await Task.FromResult(wizardId);
        }

        private async Task<int> AddWizard(IWizardContext context)
        {
            var groupRiskCaseModel = new GroupRiskCaseModel();
            var isNew = context.LinkedItemId <= 0;

            if (!isNew)
            {
                groupRiskCaseModel = await _groupRiskPolicyCaseService.GetSchemePoliciesByEmployerRolePlayerId(context.LinkedItemId);
                var rolePlayer = await _rolePlayerService.GetRolePlayerWithoutReferenceData(context.LinkedItemId);
                groupRiskCaseModel.Code = rolePlayer.DisplayName;
            }
            else
            {
                groupRiskCaseModel = context.Deserialize<GroupRiskCaseModel>(context?.Data);
            }
   
            var stepData = new ArrayList() { groupRiskCaseModel };

            var label = !isNew
                ? $"Edit Business (Group): {groupRiskCaseModel.Code}"
                : $"New Business (Group): {groupRiskCaseModel.Code}";

            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context?.Deserialize<ArrayList>(wizard.Data);
            var groupRiskCaseModel = context?.Deserialize<GroupRiskCaseModel>(stepData[0].ToString());
            if (IsNewPolicyWizard(context))
            {
                _ = await _groupRiskPolicyCaseService.CreateSchemePolicies(groupRiskCaseModel); 
            }
            else
            {
                _ = await _groupRiskPolicyCaseService.UpdateSchemePolicies(groupRiskCaseModel);
            }

            foreach (var groupRiskPolicy in groupRiskCaseModel.GroupRiskPolicies)
            {
                await _documentIndexService.UpdateDocumentKeys(DocumentSystemNameEnum.PolicyManager, "WizardId", wizard.Id.ToString(), "PolicyId", groupRiskPolicy.PolicyId.ToString());
                await _commonSystemNoteService.UpdateCommonSystemNoteKeys(ModuleTypeEnum.ClientCare, NoteItemTypeEnum.Wizard, wizard.Id, NoteItemTypeEnum.Policy, groupRiskPolicy.PolicyId);
            }

        }

        private bool IsNewPolicyWizard(IWizardContext context)
        {
            return context.LinkedItemId <= 0;
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context?.Deserialize<ArrayList>(wizard.Data);
            var groupRiskEmployerModel = context?.Deserialize<GroupRiskCaseModel>(stepData[0].ToString());

            var ruleResults = new List<RuleResult>();

            if (groupRiskEmployerModel.EmployerRolePlayerId == 0)
            {
                ruleResults.Add(GetRuleResult(false, "Employer has not been selected", "Employer"));
            }

            if (groupRiskEmployerModel.GroupRiskPolicies.Count == 0)
            {
                ruleResults.Add(GetRuleResult(false, "No Policies have been created", "Policies"));
            }

            if (groupRiskEmployerModel.GroupRiskPolicies.Count > 0 && groupRiskEmployerModel.GroupRiskPolicies.Any(y => y.SchemeStatusId != (int)PolicyStatusEnum.Active && y.SchemeStatusId != (int)PolicyStatusEnum.New))
            {
                ruleResults.Add(GetRuleResult(false, "There is/are policies with invalid status", "Policies"));
            }

            return new RuleRequestResult()
            {
                OverallSuccess = ruleResults.Count == 0,
                RequestId = Guid.NewGuid(),
                RuleResults = ruleResults
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
                var employer = await _rolePlayerService.GetRolePlayer(groupRiskEmployerModel.EmployerRolePlayerId);
                var newname = employer.DisplayName;
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
