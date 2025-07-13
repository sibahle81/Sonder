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
using RMA.Service.ClientCare.Contracts.Entities.Policy.Common;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
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
using RMA.Common.Enums;

namespace RMA.Service.MediCare.BusinessProcessTasks
{
    public class HealthcareProviderRegistrationWizard : IWizardProcess
    {
        private readonly IUserRegistrationService _userRegistrationService;
        private readonly IUserService _userService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IHealthCareProviderService _healthCareProviderService;
        private readonly IPoolWorkFlowService _poolWorkFlowService;
        private readonly ISLAService _slaService;
        public HealthcareProviderRegistrationWizard(
            IUserRegistrationService userRegistrationService,
            IUserService userService,
            IRolePlayerService rolePlayerService,
            IDocumentGeneratorService documentGeneratorService,
            IDocumentIndexService documentIndexService,
            IHealthCareProviderService healthCareProviderService,
             IPoolWorkFlowService poolWorkFlowService,
             ISLAService slaService
        )
        {
            _userRegistrationService = userRegistrationService;
            _rolePlayerService = rolePlayerService;
            _documentGeneratorService = documentGeneratorService;
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
            var label = $"New Healthcare Provider  {rolePlayer.HealthCareProvider.Name}";
            var stepData = new ArrayList { rolePlayer };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var rolePlayer = context.Deserialize<RolePlayer>(stepData[0].ToString());

            if (rolePlayer.MemberStatus == MemberStatusEnum.New)
            {
                rolePlayer.MemberStatus = MemberStatusEnum.Active;
                rolePlayer.HealthCareProvider.IsAuthorised = true;
                if (rolePlayer.RolePlayerId > 0)
                {
                    //on internal registration
                    await _rolePlayerService.EditRolePlayer(rolePlayer);
                }
                else
                {
                    //on external registration generate and reserve roleplayerId
                    int roleplayerId = await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);
                    rolePlayer.RolePlayerId = roleplayerId;
                    rolePlayer.HealthCareProvider.RolePlayerId = roleplayerId;
                    rolePlayer.RolePlayerAddresses.ForEach(address => address.RolePlayerId = roleplayerId);
                    rolePlayer.RolePlayerContacts.ForEach(contact => contact.RolePlayerId = roleplayerId);
                    rolePlayer.RolePlayerBankingDetails.ForEach(bank => bank.RolePlayerId = roleplayerId);

                    await _rolePlayerService.CreateRolePlayer(rolePlayer);
                    //after generating ID update document set with new roleplayerId to link HCP Documents to Roleplayer
                    await _documentIndexService.UpdateDocumentKeys(DocumentSystemNameEnum.MediCareManager, "RolePlayerId", context.LinkedItemId.ToString(), "RolePlayerId", roleplayerId.ToString());

                }

                var rolePlayerContact = rolePlayer.RolePlayerContacts.FirstOrDefault(s => s.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact) ?? rolePlayer.RolePlayerContacts.FirstOrDefault(s => !string.IsNullOrEmpty(s.EmailAddress));
                var userContact = new Admin.SecurityManager.Contracts.Entities.UserContact
                {
                    Email = rolePlayerContact.EmailAddress,
                };
                var userDetails = new UserDetails
                {
                    Name = rolePlayerContact.Firstname,
                    Surname = rolePlayerContact.Surname,
                    UserProfileType = UserProfileTypeEnum.HealthcareProvider,
                    UserContact = userContact,
                    IsInternalUser = false,
                    RolePlayerId = rolePlayer.RolePlayerId,
                    RoleName = "Health Care Provider",
                    PortalType = PortalTypeEnum.RMA
                };

                var result = await _userRegistrationService.RegisterUserDetails(userDetails);

            }
            else if (rolePlayer.MemberStatus == MemberStatusEnum.Active)
            {
                rolePlayer.HealthCareProvider.IsAuthorised = true;
                await _rolePlayerService.EditRolePlayer(rolePlayer);
            }
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
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var rolePlayer = context.Deserialize<RolePlayer>(stepData[0].ToString());
            var roleplayerId = context.LinkedItemId;

            var bankingDetails = await _rolePlayerService.GetActiveBankingDetails(rolePlayer.RolePlayerId);
            bankingDetails.IsApproved = true;
            await _rolePlayerService.UpdateBankingDetails(bankingDetails);

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
