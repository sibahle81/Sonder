using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Database.Constants;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.FinCare.Contracts.Entities.Payments;
using RMA.Service.FinCare.Contracts.Interfaces.Payments;
using RMA.Service.Integrations.Contracts.Entities.Hyphen;
using RMA.Service.Integrations.Contracts.Interfaces.Hyphen;

using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Globalization;
using System.Linq;
using System.Linq.Dynamic;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class LifeExtensionFacade : RemotingStatelessService, ILifeExtensionService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;

        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IRepository<client_RolePlayer> _rolePlayerRepository;
        private readonly IRepository<policy_AnnualIncrease> _increaseRepository;
        private readonly IRepository<broker_BrokerageContact> _brokerageContactRepository;
        private readonly IRepository<policy_PremiumPayback> _paybackRepository;
        private readonly IRepository<client_RolePlayerBankingDetail> _bankingRepository;
        private readonly IRepository<client_Person> _personRepository;
        private readonly IRepository<policy_PolicyNote> _policyNoteRepository;

        private readonly IHyphenAccountVerificationService _bankVerificationService;
        private readonly IPolicyCommunicationService _communicationService;
        private readonly ITransactionCreatorService _transactionService;
        private readonly IPaymentCreatorService _paymentCreatorService;
        private readonly IConfigurationService _configurationService;
        private readonly IQLinkService _qlinkService;
        private readonly IBankService _bankService;

        private const string BankVerficationSuccess = "00";
        
        public LifeExtensionFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<policy_Policy> policyRepository,
            IRepository<client_RolePlayer> rolePlayerRepository,
            IRepository<policy_AnnualIncrease> increaseRepository,
            IRepository<broker_BrokerageContact> brokerageContactRepository,
            IRepository<policy_PremiumPayback> paybackRepository,
            IRepository<client_RolePlayerBankingDetail> bankingRepository,
            IRepository<client_Person> personRepository,
            IRepository<policy_PolicyNote> policyNoteRepository,
            IHyphenAccountVerificationService bankVerificationService,
            IPolicyCommunicationService communicationService,
            ITransactionCreatorService transactionService,
            IPaymentCreatorService paymentCreatorService,
            IConfigurationService configurationService,
            IQLinkService qlinkService,
            IBankService bankService
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _policyRepository = policyRepository;
            _rolePlayerRepository = rolePlayerRepository;
            _increaseRepository = increaseRepository;
            _brokerageContactRepository = brokerageContactRepository;
            _paybackRepository = paybackRepository;
            _bankingRepository = bankingRepository;
            _personRepository = personRepository;
            _policyNoteRepository = policyNoteRepository;
            _bankVerificationService = bankVerificationService;
            _communicationService = communicationService;
            _configurationService = configurationService;
            _transactionService = transactionService;
            _paymentCreatorService = paymentCreatorService;
            _qlinkService = qlinkService;
            _bankService = bankService;
        }

        #region Annual Increases
        public async Task<int> CalculateAnnualIncreases()
        {
            await ReadPoliciesDueForAnnualIncrease();
            var count = await CalculateAnnualIncrease();
            return count;
        }

        public async Task<int> SendQlinkUpdateTransactions()
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var count = 0;
                var policyNumbers = new List<string>();
                var requests = await _qlinkService.FetchQlinkPendingIncreaseRequests(PolicyIncreaseStatusEnum.IncreaseCalculated);
                if (requests.Count > 0)
                {
                    // Get the list of policies that are due for an increase, and where the increase has been calculated.
                    var increases = await _increaseRepository
                        .Where(s => s.PolicyIncreaseStatus == PolicyIncreaseStatusEnum.IncreaseCalculated)
                        .ToListAsync();
                    // Check if the policies are active in QLink
                    foreach (var increase in increases)
                    {
                        var request = requests.FirstOrDefault(s => s.ItemId == increase.PolicyId);
                        var active = await _qlinkService.CheckPolicyIsActiveOnQlinkAsync(request.ReferenceNumber);
                        if (active)
                        {
                            policyNumbers.Add(request.ReferenceNumber.Replace('X', '-'));
                            increase.PolicyIncreaseStatus = PolicyIncreaseStatusEnum.QLinkRequestSent;
                            count++;
                        }
                        else
                        {
                            increase.PolicyIncreaseStatus = PolicyIncreaseStatusEnum.IncreaseFailed;
                            increase.IncreaseFailedReason = "Policy is not active in QLink";
                        }
                        requests.Remove(request);
                    }
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);
                return count;
            }
        }

        public async Task<int> ProcessAnnualIncreaseTransactions()
        {
            // Run inside scope because the Qlink processes do database updates
            using (var scope = _dbContextScopeFactory.Create())
            {
                var count = await _qlinkService.ProcessAnnualIncreaseTransactions(PolicyIncreaseStatusEnum.QLinkRequestSent);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return count;
            }
        }

        public async Task<int> SendAnnualIncreaseNotifications(string taskHandlerName)
        {
            var message = "";
            try
            {
                // Process QLink update requests
                await ProcessQlinkUpdateTransactions();
                // Sent the increase notifications
                var count = await SendIncreaseNotifications();
                // Send notification
                if (count > 0)
                {
                    message = $"The scheduled task ran successfully and {count} increase notifications were sent";
                    await SendAnnualIncreaseTaskNotification(taskHandlerName, message, true);
                }
                return count;
            }
            catch (Exception ex)
            {
                message = $"The scheduled task failed with the following error:\r\n{ex}";
                await SendAnnualIncreaseTaskNotification(taskHandlerName, message, false);
                throw;
            }
        }

        private async Task<int> ProcessQlinkUpdateTransactions()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                // Use a stored procedure because it is a bulk calculation and update
                var count = await _increaseRepository
                   .SqlQueryAsync<int>(
                       DatabaseConstants.CheckAnnualIncreaseQlinkUpdateStatus,
                       new SqlParameter { ParameterName = "@userId", Value = String.IsNullOrEmpty(RmaIdentity.Email) ? "BackendProcess" : RmaIdentity.Email }
                   );
                return count[0];
            }
        }

        private async Task<int> SendIncreaseNotifications()
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                try
                {
                    var count = 0;
                    var increases = await _increaseRepository
                        .Where(s => s.PolicyIncreaseStatus == PolicyIncreaseStatusEnum.QLinkRequestSuccessful)
                        .ToListAsync();
                    foreach (var increase in increases)
                    {
                        var annualIncrease = Mapper.Map<AnnualIncrease>(increase);
                        // Get the required policy details
                        var policy = await _policyRepository.SingleOrDefaultAsync(s => s.PolicyId == increase.PolicyId);
                        // Get the broker's contact details
                        var brokerageContacts = await _brokerageContactRepository
                            .Where(s => s.BrokerageId == policy.BrokerageId
                                     && s.Email != null)
                            .OrderByDescending(s => s.Id)
                            .Select(s => s.Email)
                            .ToListAsync();
                        var brokerageEmail = GetValidEmailAddress(brokerageContacts);
                        // Get the member and contact details
                        var member = await GetPolicyMemberDetails(policy);
                        // Send the policy increase notification
                        try
                        {
                            var sent = false;
                            switch ((CommunicationTypeEnum)member.PreferredCommunicationTypeId)
                            {
                                case CommunicationTypeEnum.Email:
                                    // Send to the brokerage if the member does not have
                                    // a valid email address
                                    if (!member.EmailAddress.IsValidEmail())
                                    {
                                        member.EmailAddress = brokerageEmail;
                                    }
                                    // Send the email
                                    sent = await SendAnnualIncreaseEmail(member, increase, annualIncrease);
                                    if (!sent)
                                    {
                                        throw new Exception($"Policy increase notification email to {member.EmailAddress} failed");
                                    }
                                    break;
                                case CommunicationTypeEnum.SMS:
                                    // Check if the member has a valid mobile number
                                    if (member.CellPhoneNumber.IsValidPhone())
                                    {
                                        // Send the SMS
                                        sent = await _communicationService.SendAnnualIncreaseSms(member, annualIncrease);
                                    }
                                    // If the sms failed, try email
                                    if (!sent)
                                    {
                                        // Check if the member has a valid email address, and send it there if valid.
                                        // Otherwise send to brokerage
                                        if (!member.EmailAddress.IsValidEmail())
                                        {
                                            member.EmailAddress = brokerageEmail;
                                        }
                                        // Send the email
                                        sent = await SendAnnualIncreaseEmail(member, increase, annualIncrease);
                                        if (!sent)
                                        {
                                            throw new Exception($"Policy increase SMS to {member.CellPhoneNumber} and notification email to {member.EmailAddress} failed");
                                        }
                                    }
                                    break;
                                default:
                                    // Send an email notification to the broker
                                    member.EmailAddress = brokerageEmail;
                                    sent = await SendAnnualIncreaseEmail(member, increase, annualIncrease);
                                    if (!sent)
                                    {
                                        throw new Exception($"Policy increase notification email to {member.EmailAddress} failed");
                                    }
                                    break;
                            }
                            increase.PolicyIncreaseStatus = PolicyIncreaseStatusEnum.NotificationSent;
                        }
                        catch (Exception ex)
                        {
                            increase.IncreaseFailedReason = ex.Message;
                        }
                        _increaseRepository.Update(increase);
                        count++;
                    }
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    return count;
                }
                catch (Exception ex)
                {
                    ex.LogException("Annual Increase Notification Error");
                    throw;
                }
            }
        }

        private async Task<bool> SendAnnualIncreaseEmail(PolicyMember member, policy_AnnualIncrease increase, AnnualIncrease annualIncrease)
        {
            var sent = await _communicationService.SendAnnualIncreaseEmail(member, annualIncrease);
            if (sent)
            {
                increase.PolicyIncreaseStatus = PolicyIncreaseStatusEnum.NotificationSent;
                increase.NotificationSendDate = DateTime.Now;
            }
            return sent;
        }

        private string GetValidEmailAddress(List<string> brokerageContacts)
        {
            // Return the first valid email address
            foreach (var email in brokerageContacts)
            {
                if (email.IsValidEmail()) return email;
            }
            return null;
        }

        private async Task<PolicyMember> GetPolicyMemberDetails(policy_Policy policy)
        {
            var rolePlayer = await _rolePlayerRepository.SingleOrDefaultAsync(s => s.RolePlayerId == policy.PolicyOwnerId);
            return new PolicyMember
            {
                PolicyId = policy.PolicyId,
                PolicyNumber = policy.PolicyNumber,
                RolePlayerId = rolePlayer.RolePlayerId,
                MemberName = rolePlayer.DisplayName,
                EmailAddress = rolePlayer.EmailAddress ?? "",
                CellPhoneNumber = rolePlayer.CellNumber ?? "",
                PreferredCommunicationTypeId = rolePlayer.PreferredCommunicationTypeId ?? 1
            };
        }

        public async Task<int> ApplyAnnualIncreases()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                // Use a stored procedure because it is a bulk calculation and update
                var policyIds = await _increaseRepository
                   .SqlQueryAsync<int>(
                       DatabaseConstants.ApplyAnnualConsolidatedFuneralPremiumIncreases,
                       new SqlParameter { ParameterName = "@policyIncreaseStatusId", Value = PolicyIncreaseStatusEnum.IncreaseSuccessful },
                       new SqlParameter { ParameterName = "@userId", Value = String.IsNullOrEmpty(RmaIdentity.Email) ? "BackendProcess" : RmaIdentity.Email }
                   );
                var count = policyIds.Count;
                _ = Task.Run(() => SendPolicyIncreaseSchedules(policyIds));
                return count;
            }
        }

        private async Task SendPolicyIncreaseSchedules(List<int> policyIds)
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                // Send the new policy schedules
                foreach (var policyId in policyIds)
                {
                    var policy = await _policyRepository.SingleOrDefaultAsync(s => s.PolicyId == policyId);
                    // Get the member and contact details
                    var member = await GetPolicyMemberDetails(policy);
                    // Send the policy increase notification
                    switch ((CommunicationTypeEnum)member.PreferredCommunicationTypeId)
                    {
                        case CommunicationTypeEnum.Email:
                            if (member.EmailAddress.IsValidEmail())
                            {
                                await _communicationService.SendAnnualIncreasePolicyScheduleEmail(member);
                            }
                            break;
                        case CommunicationTypeEnum.SMS:
                            if (member.CellPhoneNumber.IsValidPhone())
                            {
                                await _communicationService.SendAnnualIncreasePolicyScheduleSms(member);
                            }
                            break;
                    }
                }
            }
        }

        private async Task ReadPoliciesDueForAnnualIncrease()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                // Set up the policies due for an increase. Use a stored
                // procedure because of the complexity of the task
                await _increaseRepository
                   .ExecuteSqlCommandAsync(
                       DatabaseConstants.SetupConsolidatedFuneralAnnualIncreases,
                       new SqlParameter { ParameterName = "@userId", Value = String.IsNullOrEmpty(RmaIdentity.Email) ? "BackendProcess" : RmaIdentity.Email }
                   );
            }
        }

        private async Task<int> CalculateAnnualIncrease()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                // Use a stored procedure because it is a bulk calculation and update
                var count = await _increaseRepository
                   .SqlQueryAsync<int>(
                       DatabaseConstants.CalculateConsolidatedFuneralAnnualIncrease,
                       new SqlParameter { ParameterName = "@currentPolicyIncreaseStatusId", Value = PolicyIncreaseStatusEnum.Unprocessed },
                       new SqlParameter { ParameterName = "@nextPolicyIncreaseStatusId", Value = PolicyIncreaseStatusEnum.IncreaseCalculated },
                       new SqlParameter { ParameterName = "@userId", Value = String.IsNullOrEmpty(RmaIdentity.Email) ? "BackendProcess" : RmaIdentity.Email }
                   );
                return count[0];
            }
        }

        public async Task SendAnnualIncreaseTaskNotification(string taskHandlerName, string message, bool success)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                try
                {
                    var recipient = await _configurationService.GetModuleSetting(SystemSettings.PolicyIncreaseNotificationRecipient);
                    if (recipient != null && recipient.IsValidEmail())
                    {
                        if (!success)
                        {
                            taskHandlerName = $"ERROR: {taskHandlerName}";
                        }
                        var body = new StringBuilder();
                        body.Append("<p>Good day</p>");
                        body.Append($"<p>{message}</p>");
                        body.Append("<p>Regards,<br/>The RMA Team</p>");
                        await _communicationService.SendEmail(recipient, taskHandlerName, body.ToString());
                    }
                }
                catch (Exception ex)
                {
                    ex.LogException($"Annual Increase {taskHandlerName} Error");
                    // Do not throw - not critical
                }
            }
        }
        #endregion

        #region Premium Payback
        public async Task<int> ProcessPaybackPayments()
        {
            var count = 0;
            var paybacks = await GetApprovedPaybacks();
            if (paybacks.Count > 0)
            {
                // Get configuration details
                var paymentAccount = await _configurationService.GetModuleSetting(SystemSettings.PremiumPaybackAccount);
                var paymentCompany = await _configurationService.GetModuleSetting(SystemSettings.PremiumPaybackCompany);
                var paymentBranch = await _configurationService.GetModuleSetting(SystemSettings.PremiumPaybackBranch);

                // Get a batch reference number 
                var today = DateTime.Now;
                var batchReference = $"PPB{today:yyyyMMddHHmmss}";

                // Get a list of all the banks
                var banks = await _bankService.GetBanks();

                foreach (var payback in paybacks)
                {
                    count += await CreatePaybackPayment(payback, banks, paymentAccount, paymentCompany, paymentBranch, batchReference);
                }
            }
            return count;
        }

        private async Task<int> CreatePaybackPayment(
            PremiumPaybackItem payback,
            List<Bank> banks,
            string paymentAccount,
            string paymentCompany,
            string paymentBranch,
            string batchReference)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var count = 0;
                var rolePlayer = await _rolePlayerRepository.SingleOrDefaultAsync(s => s.RolePlayerId == payback.RolePlayerId);
                var premiumPayback = await _paybackRepository.SingleOrDefaultAsync(s => s.PremiumPaybackId == payback.PremiumPaybackId);
                var bank = banks.SingleOrDefault(s => s.Id == payback.BankId);
                // Create credit note
                var creditNoteReference = $"Premium Payback Credit Note - {payback.PaybackDate:MMMM} {payback.PaybackDate:yyyy}";
                await _transactionService.CreateCreditNoteForPremiumPayback(
                    payback.RolePlayerId,
                    payback.PaybackAmount,
                    creditNoteReference,
                    DateTimeHelper.SaNow.Date
                );
                // Create payment
                var payment = CreatePayment(payback, bank.Name, paymentAccount, paymentCompany, paymentBranch, batchReference);
                var paymentId = await _paymentCreatorService.Create(payment);
                // Update premium payback status
                if (paymentId > 0)
                {
                    premiumPayback.PremiumPaybackStatus = PremiumPaybackStatusEnum.PaybackPending;
                    premiumPayback.PremiumPaidDate = DateTimeHelper.SaNow.Date;
                    _paybackRepository.Update(premiumPayback);
                    count++;
                }
                // Save the changes
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return count;
            }
        }

        private async Task<List<PremiumPaybackItem>> GetApprovedPaybacks()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var paybacks = await _paybackRepository
                    .SqlQueryAsync<PremiumPaybackItem>(DatabaseConstants.GetConfirmedPremiumPaybackPayments);
                return paybacks;
            }
        }

        private async Task<bool> GeneratePolicyPremiumPaybackErrorTask()
        {
            var wizardNames = await _increaseRepository
               .SqlQueryAsync<string>(
                   DatabaseConstants.GeneratePolicyPremiumPaybackErrorTask,
                   new SqlParameter { ParameterName = "@userId", Value = String.IsNullOrEmpty(RmaIdentity.Email) ? "BackendProcess" : RmaIdentity.Email }
               );
            var wizardName = wizardNames[0];
            await SendPremiumPaybackErrorWizardNotification(wizardName);
            return !string.IsNullOrEmpty(wizardName);
        }

        private async Task SendPremiumPaybackErrorWizardNotification(string wizardName)
        {
            if (!string.IsNullOrEmpty(wizardName))
            {
                var recipient = await _configurationService.GetModuleSetting(SystemSettings.PremiumPaybackErrorWizardRecipient);
                if (!string.IsNullOrEmpty(recipient))
                {
                    const string subject = "Premium Payback Error Wizard Notification";
                    await SendNewWizardNotification(subject, recipient, wizardName);
                }
            }
        }

        private async Task<bool> GeneratePolicyPremiumPaybackTask()
        {
            var wizardNames = await _increaseRepository
               .SqlQueryAsync<string>(
                   DatabaseConstants.GeneratePolicyPremiumPaybackTask,
                  new SqlParameter { ParameterName = "@userId", Value = String.IsNullOrEmpty(RmaIdentity.Email) ? "BackendProcess" : RmaIdentity.Email }
               );
            var wizardName = wizardNames[0];
            if (!string.IsNullOrEmpty(wizardName))
            {
                var recipient = await _configurationService.GetModuleSetting(SystemSettings.PremiumPaybackApprovalWizardRecipient);
                if (!string.IsNullOrEmpty(recipient))
                {
                    const string subject = "Premium Payback Wizard Notification";
                    await SendNewWizardNotification(subject, recipient, wizardName);
                }
            }
            return !string.IsNullOrEmpty(wizardName);
        }

        private async Task SendNewWizardNotification(string subject, string recipient, string wizardName)
        {
            // Build the message body
            var content = await _configurationService.GetModuleSetting(SystemSettings.PremiumPaybackNotificationTemplate);
            if (!string.IsNullOrEmpty(content))
            {
                // Add the members to the message body
                content = content.Replace("{0}", wizardName);
                // Send the email
                await _communicationService.SendEmail(recipient, subject, content);
            }
        }

        private Payment CreatePayment(PremiumPaybackItem payback, string bank, string paymentAccount, string company, string branch, string batchReference)
        {
            var payment = new Payment
            {
                PolicyId = payback.PolicyId,
                PaymentStatus = PaymentStatusEnum.Pending,
                PaymentType = PaymentTypeEnum.PremiumPayback,
                Payee = payback.PolicyOwner,
                Bank = bank,
                BankBranch = payback.BranchCode,
                AccountNo = payback.AccountNumber,
                Amount = payback.PaybackAmount,
                Product = "Individual",
                Company = company,
                Branch = branch,
                SenderAccountNo = paymentAccount,
                BankAccountType = payback.BankAccountType,
                IdNumber = payback.IdNumber,
                ClientType = ClientTypeEnum.Individual,
                BatchReference = batchReference,
                PolicyReference = payback.PolicyNumber,
                Reference = $"RMACASH {payback.PolicyId:0000000} {payback.PaybackDate:yyMM}",
                PayeeId = payback.RolePlayerId,
                IsDebtorCheck = false,
                IsReversed = false,
                IsActive = true,
                PaymentMethod = PaymentMethodEnum.EFT,
            };
            return payment;
        }

        public async Task CompletePremiumPaybackPayment(int policyId, decimal amount)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var data = await _paybackRepository
                    .Where(s => s.PolicyId == policyId
                        && s.PaybackAmount == amount
                        && s.PremiumPaybackStatus == PremiumPaybackStatusEnum.PaybackPending)
                    .OrderByDescending(s => s.CreatedDate)
                    .FirstOrDefaultAsync();
                if (data != null)
                {
                    var payback = Mapper.Map<PremiumPayback>(data);
                    // Get the member contact details
                    var policy = await _policyRepository.SingleOrDefaultAsync(s => s.PolicyId == payback.PolicyId);
                    var member = await GetPolicyMemberDetails(policy);
                    // Get the business notification email address
                    var recipient = await _configurationService.GetModuleSetting(SystemSettings.PremiumPaybackPaymentRecipient);
                    // Send the email
                    var content = await _configurationService.GetModuleSetting(SystemSettings.PremiumPaybackPaymentTemplate);
                    if (!string.IsNullOrEmpty(content))
                    {
                        var email = member.EmailAddress.IsValidEmail() ? member.EmailAddress : null;
                        var date = DateTimeHelper.SaNow.Date;
                        content = content.Replace("[Date]", $"{date:d MMMM yyyy}");
                        content = content.Replace("[PolicyNumber]", policy.PolicyNumber);
                        content = content.Replace("[MemberName]", member.MemberName);
                        content = content.Replace("[Amount]", amount.ToString("#,##0.00", CultureInfo.InvariantCulture));

                        var sendEmailToMember = member.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.Email && member.EmailAddress.IsValidEmail();
                        var sendSmsToMember = member.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.SMS && member.CellPhoneNumber.IsValidPhone();

                        if (sendEmailToMember)
                        {
                            await _communicationService.SendEmailWithCopies(email, null, recipient, "Premium Payback Confirmation", content);
                        }
                        else
                        {
                            if (sendSmsToMember)
                            {
                                await _communicationService.SendPaybackConfirmationSms(member, payback);
                            }
                            await _communicationService.SendEmailWithCopies(recipient, null, null, "Premium Payback Confirmation", content);
                        }
                    }
                    // Update the payback status
                    payback.PremiumPaybackStatus = PremiumPaybackStatusEnum.PaybackSuccessful;
                    payback.PremiumPaidDate = DateTimeHelper.SaNow.Date;
                    _paybackRepository.Update(Mapper.Map<policy_PremiumPayback>(payback));
                    // Save a note on the policy
                    var note = new policy_PolicyNote
                    {
                        PolicyId = payback.PolicyId,
                        Text = $"Premium payback amount of { payback.PaybackAmount.Value.ToString("#,##0.00", CultureInfo.InvariantCulture) } paid to member bank account",
                        IsDeleted = false
                    };
                    _policyNoteRepository.Create(note);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<int> SendPremiumPaybackNotifications()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                // Use a stored procedure because it is a bulk insert
                var count = await _increaseRepository
                   .SqlQueryAsync<int>(
                       DatabaseConstants.SetupPremiumPaybackNotifications,
                       new SqlParameter { ParameterName = "@userId", Value = String.IsNullOrEmpty(RmaIdentity.Email) ? "BackendProcess" : RmaIdentity.Email }
                   );
                return count[0];
            }
        }

        public async Task<int> CalculatePremiumPaybacks()
        {
            var count = await CalculatePolicyPremiumPaybacks();
            await GeneratePremiumPaybackWizards();
            return count;
        }

        private async Task GeneratePremiumPaybackWizards()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                // Generate the billing wizard to approve payments
                await GeneratePolicyPremiumPaybackTask();
                // Create a wizard for payback records bank account verification errors
                await GeneratePolicyPremiumPaybackErrorTask();
            }
        }

        private async Task<int> CalculatePolicyPremiumPaybacks()
        {
            // Read the policies due for premium payback
            var policies = await ReadPoliciesDueForPayBack();
            // Validate the banking details
            var accounts = await VerifyBankingDetails();
            // Return the higher number
            return Math.Max(policies, accounts);
        }

        private async Task<List<PremiumPayback>> GetCalculatedPremiumPaybacks()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var paybacks = await _paybackRepository
                    .Where(s => s.PremiumPaybackStatus == PremiumPaybackStatusEnum.PaybackCalculated)
                    .ToListAsync();
                return Mapper.Map<List<PremiumPayback>>(paybacks);
            }
        }

        private async Task<List<PolicyBankVerificationDetails>> GetPremiumPaybackAccounts(List<PremiumPayback> paybacks)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyIds = paybacks.Select(s => s.PolicyId).ToList();
                var accounts = await (from p in _policyRepository
                                      where policyIds.Contains(p.PolicyId)
                                      join b in _bankingRepository on p.PolicyOwnerId equals b.RolePlayerId
                                      join per in _personRepository on b.RolePlayerId equals per.RolePlayerId
                                      select new PolicyBankVerificationDetails
                                      {
                                          PolicyId = p.PolicyId,
                                          Initials = per.FirstName,
                                          Surname = per.Surname,
                                          IdNumber = string.IsNullOrEmpty(b.AccountHolderIdNumber)
                                            ? per.IdNumber
                                            : b.AccountHolderIdNumber,
                                          BranchCode = b.BranchCode,
                                          BankAccountNumber = b.AccountNumber,
                                          BankAccountType = b.BankAccountType,
                                          CreatedDate = b.CreatedDate
                                      })
                    .ToListAsync();
                accounts = accounts.OrderBy(s => s.PolicyId).ThenByDescending(s => s.CreatedDate).ToList();
                return accounts;
            }
        }

        private async Task<int> ValidateBankAccount(PolicyBankVerificationDetails account, PremiumPayback payback)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var count = 0;
                try
                {
                    var verification = await _bankVerificationService.VerifyAccount(
                        account.BankAccountNumber,
                        account.BankAccountType,
                        account.BranchCode,
                        GetInitials(account.Initials),
                        account.Surname,
                        account.IdNumber
                    );
                    if (BankAccountVerified(verification, out string errorMessage))
                    {
                        payback.PremiumPaybackStatus = PremiumPaybackStatusEnum.BankAccountVerified;
                        count++;
                    }
                    else
                    {
                        throw new Exception(errorMessage);
                    }
                }
                catch (Exception ex)
                {
                    payback.PremiumPaybackStatus = PremiumPaybackStatusEnum.BankAccountError;
                    payback.PaybackFailedReason = $"Bank Account Error: {ex.Message}";
                }
                // Update the payback record
                var record = Mapper.Map<policy_PremiumPayback>(payback);
                _paybackRepository.Update(record);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return count;
            }
        }

        private bool BankAccountVerified(RootHyphenVerificationResult verification, out string errorMessage)
        {
            try
            {
                if (!verification.success)
                {
                    throw new Exception(verification.errmsg);
                }
                if (!verification.response.accountExists.Equals(BankVerficationSuccess))
                {
                    throw new Exception("The bank account does not exist");
                }
                if (!verification.response.accountOpen.Equals(BankVerficationSuccess))
                {
                    throw new Exception("The bank account is not open");
                }
                if (!verification.response.accountTypeValid.Equals(BankVerficationSuccess))
                {
                    throw new Exception("The bank account type is incorrect");
                }
                if (!verification.response.accountIdMatch.Equals(BankVerficationSuccess))
                {
                    throw new Exception("The bank account holder ID number is incorrect");
                }
                errorMessage = String.Empty;
                return true;
            }
            catch (Exception ex)
            {
                errorMessage = ex.Message;
                return false;
            }
        }

        private async Task<int> VerifyBankingDetails()
        {
            var count = 0;
            var paybacks = await GetCalculatedPremiumPaybacks();
            if (paybacks.Count > 0)
            {
                var accounts = await GetPremiumPaybackAccounts(paybacks);
                while (accounts.Count > 0)
                {
                    var account = accounts[0];
                    var payback = paybacks.FirstOrDefault(s => s.PolicyId == account.PolicyId);
                    try
                    {
                        // Validate the bank account & update the payback record
                        count += await ValidateBankAccount(account, payback);
                        // Remove all other accounts with the same policyId
                        accounts.RemoveAll(s => s.PolicyId == account.PolicyId);
                    }
                    catch (Exception ex)
                    {
                        ex.LogException($"Premium Payback Hyphen Validation Error for Policy {account.PolicyId}");
                        throw;
                    }
                }
            }
            return count;
        }

        private string GetInitials(string fullName)
        {
            if (string.IsNullOrWhiteSpace(fullName))
                return string.Empty;

            return string.Concat(
                fullName.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(namePart => namePart[0])
                .ToArray()
            )
            .ToUpper();
        }

        private async Task<int> ReadPoliciesDueForPayBack()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                // Use a stored procedure because it is a bulk insert
                var count = await _increaseRepository
                   .SqlQueryAsync<int>(
                       DatabaseConstants.CalculateConsolidatedFuneralCashBack,
                       new SqlParameter { ParameterName = "@userId", Value = String.IsNullOrEmpty(RmaIdentity.Email) ? "BackendProcess" : RmaIdentity.Email }
                   );
                return count[0];
            }
        }
        #endregion

        #region Premium Payback Wizard
        public async Task<PremiumPaybackItem> ValidatePaybackBankAccount(PremiumPaybackItem payback)
        {
            Contract.Requires(payback != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var person = await _personRepository.SingleOrDefaultAsync(s => s.RolePlayerId == payback.RolePlayerId);
                var bankAccount = await _bankingRepository.SingleOrDefaultAsync(s => s.RolePlayerBankingId == payback.RolePlayerBankingId);

                var idNumber = string.IsNullOrWhiteSpace(bankAccount.AccountHolderIdNumber)
                    ? person.IdNumber
                    : bankAccount.AccountHolderIdNumber;

                var verification = await _bankVerificationService.VerifyAccount(
                    payback.AccountNumber,
                    payback.BankAccountType.Value,
                    payback.BranchCode,
                    GetInitials(person.FirstName),
                    person.Surname.ToUpper(),
                    idNumber
                );
                if (BankAccountVerified(verification, out string errorMessage))
                {
                    // Save the banking details
                    var account = new client_RolePlayerBankingDetail
                    {
                        RolePlayerId = payback.RolePlayerId,
                        PurposeId = (int)BankingPurposeEnum.Payments,
                        EffectiveDate = DateTimeHelper.SaNow.Date,
                        AccountNumber = payback.AccountNumber,
                        BankBranchId = payback.BankBranchId.Value,
                        BranchCode = payback.BranchCode,
                        BankAccountType = payback.BankAccountType.Value,
                        AccountHolderName = payback.PolicyOwner.ToUpper(),
                        AccountHolderIdNumber = idNumber
                    };
                    _bankingRepository.Create(account);
                    var premiumPayback = await _paybackRepository.SingleOrDefaultAsync(s => s.PremiumPaybackId == payback.PremiumPaybackId);
                    UpdatePaybackStatus(premiumPayback, payback,
                        PremiumPaybackStatusEnum.BankAccountVerified,
                        null
                    );
                    var note = new policy_PolicyNote
                    {
                        PolicyId = payback.PolicyId,
                        Text = $"Bank account number updated to {payback.AccountNumber} via Premium Payback Wizard",
                        IsDeleted = false
                    };
                    _policyNoteRepository.Create(note);
                }
                else
                {
                    var premiumPayback = await _paybackRepository.SingleOrDefaultAsync(s => s.PremiumPaybackId == payback.PremiumPaybackId);
                    UpdatePaybackStatus(premiumPayback, payback,
                        PremiumPaybackStatusEnum.BankAccountError,
                        $"Bank Account Error: {errorMessage}"
                    );
                }
                // Save the changes
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return payback;
            }
        }

        public async Task<PremiumPaybackItem> RejectPaybackPayment(PremiumPaybackItem payback)
        {
            Contract.Requires(payback != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                // Update the premium payback record
                var premiumPayback = await _paybackRepository.SingleOrDefaultAsync(s => s.PremiumPaybackId == payback.PremiumPaybackId);
                UpdatePaybackStatus(premiumPayback, payback, payback.PremiumPaybackStatus, payback.PaybackFailedReason);
                // Add a policy note
                var note = new policy_PolicyNote
                {
                    PolicyId = payback.PolicyId,
                    Text = $"Payment Rejected: {payback.PaybackFailedReason}",
                    IsDeleted = false
                };
                _policyNoteRepository.Create(note);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return payback;
            }
        }

        private async Task<bool> SendPremiumPaybackNotification(PremiumPaybackItem payback)
        {
            var premiumPayback = await _paybackRepository.SingleOrDefaultAsync(s => s.PremiumPaybackId == payback.PremiumPaybackId);
            if (payback.MobileNumber.IsValidPhone())
            {
                var policy = await _policyRepository.SingleOrDefaultAsync(s => s.PolicyId == payback.PolicyId);
                var member = await GetPolicyMemberDetails(policy);
                member.CellPhoneNumber = payback.MobileNumber;
                var sent = await _communicationService.SendPaybackNotificationSms(member, Mapper.Map<PremiumPayback>(premiumPayback));
                if (sent)
                {
                    UpdatePaybackStatus(premiumPayback, payback, PremiumPaybackStatusEnum.NotificationSent, "");
                }
                else
                {
                    UpdatePaybackStatus(premiumPayback, payback,
                        PremiumPaybackStatusEnum.NotificationFailed,
                        "Notification Error: SMS transmission failure"
                    );
                }
            }
            else
            {
                UpdatePaybackStatus(premiumPayback, payback,
                    PremiumPaybackStatusEnum.NotificationFailed,
                    $"Notification Error: {payback.MobileNumber} is not a valid mobile number"
                );
            }
            return false;
        }

        private void UpdatePaybackStatus(policy_PremiumPayback premiumPayback, PremiumPaybackItem payback, PremiumPaybackStatusEnum paybackStatus, string failedReason)
        {
            var sendDate = paybackStatus == PremiumPaybackStatusEnum.NotificationSent
                ? DateTimeHelper.SaNow.Date
                : (DateTime?)null;
            // Update the premium payback record
            premiumPayback.PremiumPaybackStatus = paybackStatus;
            premiumPayback.PaybackFailedReason = failedReason;
            premiumPayback.NotificationSendDate = sendDate;
            _paybackRepository.Update(premiumPayback);
            // Update the return object
            payback.PremiumPaybackStatus = paybackStatus;
            payback.PaybackFailedReason = failedReason;
            payback.NotificationDate = sendDate;
        }

        public async Task GeneratePolicyPremiumPaybackTask(PremiumPaybackCase @case)
        {
            Contract.Requires(@case != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                // Generate a wizard to approve the payments where the bank account
                // has been successfully verified
                _ = await GeneratePolicyPremiumPaybackTask();
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task GeneratePolicyPremiumPaybackErrorTask(string paybackItems)
        {
            Contract.Requires(paybackItems != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                // Create a new premium payback error wizard with the items passed as parameter
                var wizardNames = await _increaseRepository
                    .SqlQueryAsync<string>(
                        DatabaseConstants.GeneratePolicyPremiumPaybackRemainingErrorTask,
                        new SqlParameter { ParameterName = "@paybackData", Value = paybackItems },
                        new SqlParameter { ParameterName = "@userId", Value = String.IsNullOrEmpty(RmaIdentity.Email) ? "BackendProcess" : RmaIdentity.Email }
                    );
                await SendPremiumPaybackErrorWizardNotification(wizardNames[0]);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task SetupApprovedPremiumPayments(PremiumPaybackCase @case)
        {
            Contract.Requires(@case != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                foreach (var payback in @case.PaybackItems)
                {
                    if (payback.PremiumPaybackStatus == PremiumPaybackStatusEnum.BankAccountVerified)
                    {
                        var premiumPayback = await _paybackRepository
                            .SingleOrDefaultAsync(s => s.PremiumPaybackId == payback.PremiumPaybackId);
                        premiumPayback.PremiumPaybackStatus = PremiumPaybackStatusEnum.PaybackApproved;
                        premiumPayback.PaybackFailedReason = null;
                        _paybackRepository.Update(premiumPayback);
                    }
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task SendPremiumPaybackAmount()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var paybacks = await _paybackRepository
                    .Where(s => s.PremiumPaybackStatus == PremiumPaybackStatusEnum.PaybackApproved)
                    .ToListAsync();
                if (paybacks.Count > 0)
                {
                    var recipient = await _configurationService.GetModuleSetting(SystemSettings.PremiumPaybackFinancialRecipient);
                    if (!string.IsNullOrEmpty(recipient))
                    {
                        var content = await _configurationService.GetModuleSetting(SystemSettings.PremiumPaybackFinancialTemplate);
                        if (!string.IsNullOrEmpty(content))
                        {
                            var paymentAccount = await _configurationService.GetModuleSetting(SystemSettings.PremiumPaybackAccount);
                            var paybackDate = paybacks.Max(s => s.PaybackDate);
                            var amount = paybacks.Sum(s => s.PaybackAmount);
                            content = content.Replace("{0}", amount.Value.ToString("#,##0.00", CultureInfo.InvariantCulture));
                            content = content.Replace("{1}", paybackDate.ToString("d MMMM yyyy"));
                            content = content.Replace("{2}", paymentAccount);
                            var subject = $"Premium Payback Consolidated Amount {paybackDate: MMMM yyyy}";
                            await _communicationService.SendEmail(recipient, subject, content);
                        }
                    }
                }
            }
        }
        #endregion
    }
}
