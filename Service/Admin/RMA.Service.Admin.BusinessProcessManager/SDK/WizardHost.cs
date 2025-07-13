using CommonServiceLocator;

using RMA.Common.Entities;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;

using System;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.SDK
{
    public class WizardHost : IWizardHost
    {
        private readonly ISerializerService _serializer;
        private readonly ISendEmailService _emailService;
        private readonly IUserService _userService;
        private readonly IUserReminderService _userReminderService;

        public WizardHost(
            ISerializerService serializer,
            ISendEmailService emailService,
            IUserService userService,
            IUserReminderService userReminderService)
        {
            _serializer = serializer;
            _emailService = emailService;
            _userService = userService;
            _userReminderService = userReminderService;
        }

        public async Task CancelWizard(Wizard wizard)
        {
            var process = GetWizardProcess(wizard?.WizardConfiguration.Name);
            var context = CreateContext(wizard);

            await process.CancelWizard(context);
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(Wizard wizard)
        {
            var process = GetWizardProcess(wizard?.WizardConfiguration.Name);
            var context = CreateContext(wizard);

            return await process.ExecuteWizardRules(context);
        }

        public async Task<int?> GetCustomApproverRole(Wizard wizard)
        {
            try
            {
                var process = GetWizardProcess(wizard?.WizardConfiguration.Name);
                var context = CreateContext(wizard);

                return await process.GetCustomApproverRole(context);
            }
            catch (Exception ex)
            {
                ex.LogException();
                return -1;
            }
        }

        public async Task<int> StartWizard(StartWizardRequest wizardRequest)
        {
            if (wizardRequest == null) return await Task.FromResult(0);

            var process = GetWizardProcess(wizardRequest.Type);

            var context = ServiceLocator.Current.GetInstance<IWizardContext>();
            context.RequestInitiatedByBackgroundProcess = wizardRequest.RequestInitiatedByBackgroundProcess;
            context.Init(wizardRequest);

            return await process.StartWizard(context);
        }

        public async Task SubmitWizard(Wizard wizard)
        {
            if (wizard == null) return;
            var process = GetWizardProcess(wizard.WizardConfiguration.Name);
            var context = CreateContext(wizard);

            await process.SubmitWizard(context);
        }

        public async Task OverrideWizard(Wizard wizard)
        {
            if (wizard == null) return;
            var process = GetWizardProcess(wizard.WizardConfiguration.Name);
            var context = CreateContext(wizard);

            await process.OverrideWizard(context);
        }

        public async Task UpdateStatus(Wizard wizard)
        {
            if (wizard == null) return;
            var process = GetWizardProcess(wizard.WizardConfiguration.Name);
            var context = CreateContext(wizard);

            await process.UpdateStatus(context);
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, Wizard wizard)
        {
            Contract.Requires(wizard != null);
            if (wizard == null) return;
            var process = GetWizardProcess(wizard.WizardConfiguration.Name);
            var context = CreateContext(wizard);
            await process.OnRejected(rejectWizardRequest, context);

            var username = RmaIdentity.DisplayName + " (" + RmaIdentity.Email + ")";
            var createdByUser = await _userService.GetUserByEmail(wizard.CreatedBy);

            try
            {
                string html = $"<p>Dear {createdByUser.DisplayName}</p><p>Please note that your approval request for<br/><strong>{wizard.Name}</strong> was rejected by <strong>{username}</strong></p><p><strong>Reason<p><i>{rejectWizardRequest?.Comment}</i></p></strong></p>";

                var emailRequest = new SendMailRequest
                {
                    ItemId = -1,
                    ItemType = "Approval request rejected",
                    Recipients = wizard.CreatedBy,
                    Body = html,
                    IsHtml = true,
                    Subject = "Approval request rejected"
                };

                _ = Task.Run(() => _emailService.SendEmail(emailRequest));

                var assignedByUserId = RmaIdentity.UserId;
                var assignedToUserId = createdByUser.Id;

                var userReminder = new UserReminder
                {
                    UserReminderType = MasterDataManager.Contracts.Enums.UserReminderTypeEnum.SystemNotification,
                    AssignedByUserId = assignedByUserId,
                    AssignedToUserId = assignedToUserId,
                    Text = $"Approval request for wizard: {wizard.Name}, was rejected by {username}. Reason: {rejectWizardRequest?.Comment}"
                };

                await _userReminderService.CreateUserReminder(userReminder);
            }
            catch (Exception e)
            {
                e.LogException();
            }
        }

        public async Task OnDispute(RejectWizardRequest rejectWizardRequest, Wizard wizard)
        {
            if (wizard == null) return;
            var process = GetWizardProcess(wizard.WizardConfiguration.Name);
            var context = CreateContext(wizard);

            await process.OnDispute(rejectWizardRequest, context);
        }

        public async Task OnApprove(Wizard wizard)
        {
            if (wizard == null) return;
            var process = GetWizardProcess(wizard.WizardConfiguration.Name);
            var context = CreateContext(wizard);

            await process.OnApprove(context);
        }

        public async Task OnRequestForApproval(Wizard wizard)
        {
            if (wizard == null) return;
            var process = GetWizardProcess(wizard.WizardConfiguration.Name);
            var context = CreateContext(wizard);

            await process.OnRequestForApproval(context);
        }

        public async Task OnSaveStep(Wizard wizard)
        {
            if (wizard == null) return;
            var process = GetWizardProcess(wizard.WizardConfiguration.Name);
            var context = CreateContext(wizard);

            await process.OnSaveStep(context);
        }

        private static IWizardProcess GetWizardProcess(string name)
        {
            var wizard = ServiceLocator.Current.GetInstance<IWizardProcess>(name);
            if (wizard == null) throw new TechnicalException($"Cannot find IWizardProcess with name {name}");
            return wizard;
        }

        private IWizardContext CreateContext(Wizard wizard)
        {
            var wizardRequest = CreateWizardRequest(wizard);

            var context = ServiceLocator.Current.GetInstance<IWizardContext>();
            context.Init(wizardRequest);

            return context;
        }

        private StartWizardRequest CreateWizardRequest(Wizard wizard)
        {
            return new StartWizardRequest
            {
                Data = _serializer.Serialize(wizard),
                LinkedItemId = wizard.LinkedItemId,
                Type = wizard.WizardConfiguration.Name
            };
        }

        public async Task OnSetApprovalStages(Wizard wizard)
        {
            if (wizard == null) return;
            var process = GetWizardProcess(wizard.WizardConfiguration.Name);
            var context = CreateContext(wizard);

            await process.OnSetApprovalStages(context);
        }
    }
}