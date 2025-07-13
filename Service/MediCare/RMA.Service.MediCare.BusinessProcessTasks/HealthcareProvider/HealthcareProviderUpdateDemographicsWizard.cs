using AutoMapper;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.BusinessProcessTasks
{
    public class HealthcareProviderUpdateDemographicsWizard : IWizardProcess
    {
        private readonly IUserRegistrationService _userRegistrationService;
        private readonly IUserService _userService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IHealthCareProviderService _healthCareProviderService;
        private readonly IPoolWorkFlowService _poolWorkFlowService;
        private readonly ISLAService _slaService;
        public HealthcareProviderUpdateDemographicsWizard(
            IUserRegistrationService userRegistrationService,
            IUserService userService,
            IRolePlayerService rolePlayerService,
            IDocumentIndexService documentIndexService,
            IHealthCareProviderService healthCareProviderService,
             IPoolWorkFlowService poolWorkFlowService,
             ISLAService slaService
        )
        {
            _userRegistrationService = userRegistrationService;
            _rolePlayerService = rolePlayerService;
            _documentIndexService = documentIndexService;
            _userService = userService;
            _healthCareProviderService = healthCareProviderService;
            _poolWorkFlowService = poolWorkFlowService;
            _slaService = slaService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var rolePlayer = context.Deserialize<RolePlayer>(context.Data);
            var roleplayerId = context.LinkedItemId;
            var label = $"Update Demographics Healthcare Provider {rolePlayer.HealthCareProvider.Name}";
            var stepData = new ArrayList { rolePlayer };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var rolePlayer = context.Deserialize<RolePlayer>(stepData[0].ToString());
            var roleplayerId = context.LinkedItemId;

            await _rolePlayerService.EditRolePlayer(rolePlayer);

        }

        public async Task CancelWizard(IWizardContext context)
        {
            return;
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return;
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

        private async Task CreatePoolWorkFlow(RolePlayer healthCareProfessional, string reason)
        {
            var poolWorkFlow = new PoolWorkFlow()
            {
                PoolWorkFlowItemType = PoolWorkFlowItemTypeEnum.MedicalHcp,
                ItemId = healthCareProfessional.RolePlayerId,
                WorkPool = WorkPoolEnum.MIAMedicalPool,
                AssignedByUserId = RmaIdentity.UserId,
                AssignedToUserId = null,
                EffectiveFrom = DateTimeHelper.SaNow,
                EffectiveTo = null,
                Instruction = $"{reason}"
            };

            await UpdateSLAForWorkpool(healthCareProfessional, reason);
            await _poolWorkFlowService.HandlePoolWorkFlow(poolWorkFlow);
        }

        private async Task UpdateSLAForWorkpool(RolePlayer healthCareProfessional, string reason)
        {
            SLAItemTypeEnum slaItemType = SLAItemTypeEnum.MiaMedicalPool;

            var slaStatusChangeAudit = new SlaStatusChangeAudit
            {
                SLAItemType = slaItemType,
                ItemId = healthCareProfessional.RolePlayerId,
                Status = "Pending Review",
                EffectiveFrom = DateTimeHelper.SaNow,
                Reason = $"{reason}"
            };

            DateTime? effectiveTo = null;

            slaStatusChangeAudit.EffictiveTo = effectiveTo;
            await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
        }

    }

}
