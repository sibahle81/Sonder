using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.BusinessProcessTasks.NewMemberWizard
{
    public class NewMemberWizard : IWizardProcess
    {
        private readonly IMemberService _memberService;
        private readonly IWizardService _wizardService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IUserRegistrationService _userRegistrationService;
        private readonly IUserService _userService;

        public NewMemberWizard(IMemberService memberService, IWizardService wizardService, IRolePlayerService rolePlayerService, IUserRegistrationService userRegistrationService, IUserService userService)
        {
            _memberService = memberService;
            _wizardService = wizardService;
            _rolePlayerService = rolePlayerService;
            _userRegistrationService = userRegistrationService;
            _userService = userService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var member = context.Deserialize<RolePlayer>(context.Data);

            string memberNumber = string.Empty;
            if (member.FinPayee != null)
            {
                memberNumber = member.FinPayee.FinPayeNumber;
            }

            if (string.IsNullOrEmpty(memberNumber))
            {
                memberNumber = await _memberService.GenerateMemberNumber(member.DisplayName);
            }

            member.FinPayee = new FinPayee
            {
                FinPayeNumber = memberNumber,
                IndustryId = Convert.ToInt32(member.Company.IndustryId)
            };

            // create the member and allow the wizard to edit the "New Member" through the wizard so that any
            // quotes that are accepted while the member wizard is still running will be able to start using the
            // created member roleplayer id reserved when creating the lead
            var rolePlayerId = await _memberService.CreateMember(member);
            var newMember = await _memberService.GetMemberById(rolePlayerId);

            var label = $"Update Member: {member.DisplayName}({member.FinPayee.FinPayeNumber})";

            var stepData = new ArrayList() { newMember };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var member = context.Deserialize<RolePlayer>(stepData[0].ToString());
            await _memberService.UpdateMember(member);
            await RegisterNewMember(member);
        }

        private async Task RegisterNewMember(RolePlayer member)
        {
            var rolePlayerContact = member.RolePlayerContacts.FirstOrDefault(s => s.ContactDesignationType == Admin.MasterDataManager.Contracts.Enums.ContactDesignationTypeEnum.PrimaryContact);
            var userContact = new Usercontact
            {
                Email = rolePlayerContact.EmailAddress,
            };

            var userDetails = new UserDetails
            {
                CompanyRegistrationNumber = member.Company.CompanyRegNo,
                Name = rolePlayerContact.Firstname,
                Surname = rolePlayerContact.Surname,
                UserProfileType = Admin.MasterDataManager.Contracts.Enums.UserProfileTypeEnum.Company,
                UserContact = userContact,
                IsInternalUser = false,
                RolePlayerId = member.RolePlayerId
            };

            var result = await _userRegistrationService.RegisterUserDetails(userDetails);
        }
        #region Not Implemented
        public async Task CancelWizard(IWizardContext context)
        { return; }

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
        private async Task SendNotification(int linkedItemId, string message, string title)
        {
            if (linkedItemId > 0)
            {
                var wizard = await _wizardService.GetWizardByLinkedItemAndConfigId(linkedItemId, 68);
                await _wizardService.SendWizardNotification("quote-accepted-notification", title,
                    message, null, wizard.LinkedItemId, wizard.CreatedBy);
            }
        }
        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        #endregion
    }

}
