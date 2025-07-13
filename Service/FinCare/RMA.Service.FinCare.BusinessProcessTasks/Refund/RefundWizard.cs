using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.FinCare.Contracts.Interfaces.Payments;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

using Wizard = RMA.Service.Admin.BusinessProcessManager.Contracts.Entities.Wizard;

namespace RMA.Service.FinCare.BusinessProcessTasks.Refund
{
    public class RefundWizard : IWizardProcess
    {
        private readonly IPaymentCreatorService _paymentCreatorService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IBillingService _billingService;
        private readonly IRoleService _roleService;
        private readonly IWizardService _wizardService;
        private readonly IBankBranchService _bankBranchService;
        private readonly ISendEmailService _sendEmailService;
        private readonly IConfigurationService _configService;
        private readonly IIndustryService _industryService;
        private readonly ITransactionService _transactionService;
        private const string approvalURL = "ApprovalURL";
        private const string refundApprovalNotification = "RefundApprovalNotification";
        private const string awaitingSupportingDocuments = "Awaiting supporting documents";

        public RefundWizard(IPaymentCreatorService paymentCreatorService,
            IRolePlayerPolicyService rolePlayerPolicyService,
            IRolePlayerService rolePlayerService,
            IDocumentIndexService documentIndexService,
            IBillingService billingService,
            IRoleService roleService,
            ISendEmailService sendEmailService,
            IConfigurationService configService,
            IIndustryService industryService,
            IWizardService wizardService, IBankBranchService bankBranchService,
            ITransactionService transactionService)
        {
            _paymentCreatorService = paymentCreatorService;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _documentIndexService = documentIndexService;
            _billingService = billingService;
            _roleService = roleService;
            _wizardService = wizardService;
            _bankBranchService = bankBranchService;
            _sendEmailService = sendEmailService;
            _configService = configService;
            _rolePlayerService = rolePlayerService;
            _industryService = industryService;
            _transactionService = transactionService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var refund = context.Deserialize<Billing.Contracts.Entities.Refund>(context.Data);
            string label = string.Empty;

            refund.RefundDate = DateTime.Now;
            label = $"Refund for {refund.FinPayeNumber}";

            if (refund.RefundAmount > 0)
            {
                var rolePlayerContactDetails = await _rolePlayerService.GetRolePlayerContactDetails(refund.RolePlayerId);
                if (rolePlayerContactDetails != null && rolePlayerContactDetails.Count > 0)
                {
                    var activeContacts = rolePlayerContactDetails.LastOrDefault(b => !b.IsDeleted);
                    if (activeContacts != null)
                        refund.GroupEmail = !string.IsNullOrEmpty(activeContacts.EmailAddress) ? activeContacts.EmailAddress : string.Empty;
                }
            }

            var stepData = new ArrayList() { refund };

            var headerId = await _transactionService.CreateRefund(refund);
            refund.RefundHeaderId = headerId;

            var wizardId = await context.CreateWizard(label, stepData);

            await _documentIndexService.UpdateDocumentKeys(Common.Enums.DocumentSystemNameEnum.BillingManager, "tempWizardId", refund.TempDocumentKeyValue, "wizardId", $"{wizardId.ToString()}");

            return wizardId;
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var refund = context.Deserialize<Billing.Contracts.Entities.Refund>(stepData[0].ToString());

            if (refund != null)
            {
                try
                {
                    await _transactionService.RealeaseRefundForPayment(refund);
                    var note = new BillingNote
                    {
                        ItemId = refund.RolePlayerId,
                        ItemType = BillingNoteTypeEnum.Refund.GetDescription(),
                        Text = $"Refund to the amount of {refund.RefundAmount} approved"
                    };
                    await _billingService.AddBillingNote(note);
                    await _documentIndexService.UpdateDocumentKeys(Common.Enums.DocumentSystemNameEnum.BillingManager, "wizardId", wizard.Id.ToString(), "roleplayerId", $"{refund.RolePlayerId.ToString()}");
                }
                catch (Exception ex)
                {
                    ex.LogException();
                }
            }
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            return await Task.FromResult(new RuleRequestResult
            {
                OverallSuccess = true,
                RuleResults = new List<RuleResult>(),
                RequestId = Guid.NewGuid()
            });
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return await Task.FromResult<string>(string.Empty);
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var refund = context.Deserialize<RMA.Service.Billing.Contracts.Entities.Refund>(stepData[0].ToString());

            if (refund != null)
            {
                var note = new BillingNote
                {
                    ItemId = refund.RolePlayerId,
                    ItemType = BillingNoteTypeEnum.Refund.GetDescription(),
                    Text = $"Refund to the amount of {refund.RefundAmount} rejected"
                };
                await _billingService.AddBillingNote(note);
            }
        }

        public Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task OnApprove(IWizardContext context)
        {
            await SendApprovalEmail(context);
            return;
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

        public async Task OnSetApprovalStages(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context?.Deserialize<ArrayList>(wizard.Data);
            var refund = context?.Deserialize<RMA.Service.Billing.Contracts.Entities.Refund>(stepData[0].ToString());

            var stages = new List<WizardApprovalStage>();

            var refundRoleLimits = await _billingService.GetRefundRoleLimits();

            var refundAmount = refund?.RefundAmount;

            if (wizard != null && refundRoleLimits != null && refundRoleLimits.Count > 0)
            {
                var i = 1;
                if (!refund.OverrideMembershipApprover)
                {
                    stages.Add(new WizardApprovalStage
                    {
                        RoleId = (int)refundRoleLimits.FirstOrDefault(r => r.LimitEnd == 0)?.RoleId,
                        IsActive = true,
                        Stage = i,
                        StatusId = (int)WizardApprovalStageStatusEnum.Pending,
                        WizardId = wizard.Id
                    });
                    i++;
                }
                foreach (var limit in refundRoleLimits.Where(l => l.LimitEnd > 0).OrderBy(c => c.LimitStart))
                {
                    if (refundAmount > limit.LimitEnd || (refundAmount >= limit.LimitStart && refundAmount <= limit.LimitEnd))
                    {
                        stages.Add(new WizardApprovalStage
                        {
                            RoleId = limit.RoleId,
                            IsActive = true,
                            Stage = i,
                            StatusId = (int)WizardApprovalStageStatusEnum.Pending,
                            WizardId = wizard.Id
                        });
                        i++;
                    }
                }
                if (stages.Count > 0)
                {
                    await _wizardService.SaveWizardApprovalStages(stages);
                    wizard.CustomRoutingRoleId = (int)stages.FirstOrDefault(r => r.Stage == 1)?.RoleId;
                    wizard.WizardStatus = WizardStatusEnum.AwaitingApproval;
                    wizard.LockedToUser = null;
                    await context.UpdateWizard(wizard).ConfigureAwait(false);
                }
            }
        }
        private async Task SendApprovalEmail(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var refund = context.Deserialize<RMA.Service.Billing.Contracts.Entities.Refund>(stepData[0].ToString());

            var finPayee = await _rolePlayerService.GetFinPayee(refund.RolePlayerId);
            var industry = await _industryService.GetIndustry(finPayee.IndustryId);
            var recipients = await _configService.GetModuleSetting($"Role_{wizard.CustomRoutingRoleId}");
            var url = await _configService.GetModuleSetting(approvalURL);
            string body = await _configService.GetModuleSetting(refundApprovalNotification);

            if (!string.IsNullOrEmpty(body))
            {
                body = body.Replace("{0}", wizard.CustomRoutingRole);
                body = body.Replace("{1}", industry.Name);
                body = body.Replace("{2}", finPayee.FinPayeNumber);
                body = body.Replace("{3}", wizard.Id.ToString());
                body = body.Replace("{4}", refund.RefundAmount.ToString());
                body = body.Replace("{5}", refund.RefundReason.ToString());
                body = body.Replace("{6}", url);

                await _sendEmailService.SendEmail(new SendMailRequest
                {
                    ItemId = 0,
                    ItemType = "Notification",
                    Recipients = recipients,
                    RecipientsCC = null,
                    Subject = $"RMA Refund Approval Notification",
                    Body = body,
                    IsHtml = true,
                    Attachments = null
                });
            }
        }
    }
}
