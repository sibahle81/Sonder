using AutoMapper;
using Newtonsoft.Json;
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities.Payments;
using RMA.Service.Billing.Contracts.Enums;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Entities;
using RMA.Service.Billing.Entities;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using TinyCsvParser.Mapping;
using DatabaseConstants = RMA.Service.Billing.Database.Constants.DatabaseConstants;
using FinPayee = RMA.Service.Billing.Contracts.Entities.FinPayee;
using RefundHeader = RMA.Service.Billing.Contracts.Entities.RefundHeader;

namespace RMA.Service.Billing.Services
{
    public class BillingFacade : RemotingStatelessService, IBillingService
    {
        private const string BillingModulePermissions = "BillingModulePermissions";
        private const string OcpApimSubscriptionKeyHeader = "Ocp-Apim-Subscription-Key";
        private const string QlinkPaymentRecord = "QREC";
        private const string QlinkPaymentReversalRecord = "QREV";
        private const string RecordId = "91";
        private const string TransactionType = "RMA09";
        private const string PartnerName = "Matla";
        private const char commaDelimiter = ',';
        private const char pipeDelimiter = '|';
        private const char semiColonDelimiter = ';';

        /// <summary>
        /// This number represents the biggest date we can have as an OLE Automation date.
        /// This is mostly used by Excel. It represents the date 9999 December 31, 23:59:59
        /// </summary>
        private const double highestOleAutomationDate = 2958465.99999999;

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<client_FinPayee> _finPayeeRepository;
        private readonly IRepository<billing_Note> _billingNotesRepository;
        private readonly IRepository<billing_AgeAnalysisNote> _ageAnalysisNotesRepository;
        private readonly IRepository<billing_InterDebtorTransfer> _interDebtorTransferRepository;
        private readonly IRepository<billing_InterDebtorTransferNote> _interDebtorTransferNotesRepository;
        private readonly IRepository<billing_InterBankTransferNote> _interBankTransferNotesRepository;
        private readonly IRepository<billing_InterBankTransfer> _interBankTransferRepository;
        private readonly IRepository<finance_BankStatementEntry> _bankStatementEntryRepository;
        private readonly IRepository<Load_QLinkPaymentRecordStaging> _qLinkPaymentRecordStagingRepository;
        private readonly IRepository<billing_AutoAllocationBankAccount> _billingAutoAllocationBankAccountRepository;
        private readonly IPolicyService _policyService;
        private readonly IPolicyNoteService _policyNoteService;
        private readonly ISendEmailService _sendEmailService;
        private readonly IConfigurationService _configurationService;
        private readonly IWizardService _wizardService;
        private readonly IHttpClientService _httpClientService;
        private readonly IRepository<billing_Transaction> _transactionRepository;
        private readonly ReaderWriterLockSlim _cfpEntriesToAllocateIdsLock;
        private readonly IBankAccountService _bankAccountService;
        private readonly IRepository<billing_InterestIndicator> _interestIndicatorRepository;
        private readonly IRepository<billing_RefundRoleLimit> _billingRefundRoleLimitRepository;
        private readonly IIndustryService _industryService;
        private readonly IRepository<billing_IndustryFinancialYear> _industryFinancialYearRepository;
        private readonly IRepository<billing_DebtorStatusRule> _debtorStatusRuleRepository;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IRepository<billing_CompanyBranch> _companyBranchRepository;
        private readonly IRepository<Load_PaymentStaging> _paymentStagingRepository;
        private readonly IRepository<Load_PaymentStagingFile> _paymentStagingFileRepository;
        private readonly IRepository<Load_PremiumWriteOffFile> _premiumWriteOffFileRepository;
        private readonly IRepository<Load_PremiumWriteOffContent> _premiumWriteOffContentRepository;
        private readonly IRepository<billing_DebtorStatusProductCategory> _debtorStatusProductCategoryRepository;
        private readonly IRepository<billing_ForecastRate> _forecastRateRepository;
        private readonly IRepository<billing_SuspenseDebtorBankMapping> _suspenseDebtorBankMappingRepository;
        private readonly IRepository<billing_LegalCommissionRecon> _legalCommissionReconRepository;
        private readonly IRoleService _roleService;
        private readonly IUserReminderService _userReminderService;
        private readonly IUserService _userService;
        private readonly IRepository<billing_RefundHeader> _refundHeaderRepository;
        private readonly IRepository<Load_LegalHandOverFileDetail> _legalHandOverDetailRepository;
        private readonly IRepository<Load_LegalHandOverFile> _legalHandOverFileRepository;
        /// <summary>
        /// Over user of the facade patten.
        /// We should not be injecting repositories and services into the facade(s), repositories should be abstracted away for more efficient unit testability
        /// 
        public BillingFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<client_FinPayee> finPayeeRepository,
            IRepository<billing_Note> billingNotesRepository,
            IRepository<billing_AgeAnalysisNote> ageAnalysisNotesRepository,
            IRepository<billing_InterDebtorTransfer> interDebtorTransferRepository,
            IRepository<billing_InterDebtorTransferNote> interDebtorTransferNotesRepository,
            IRepository<billing_InterBankTransferNote> interBankTransferNotesRepository,
            IRepository<billing_InterBankTransfer> interBankTransferRepository,
            IRepository<finance_BankStatementEntry> bankStatementEntryRepository,
            IRepository<Load_QLinkPaymentRecordStaging> qLinkPaymentRecordStagingRepository,
            IPolicyService policyService,
            IPolicyNoteService policyNoteService,
            ISendEmailService sendEmailService,
            IConfigurationService configurationService,
            IWizardService wizardService,
            IRepository<billing_Transaction> transactionRepository,
            IBankAccountService bankAccountService,
            IRepository<billing_AutoAllocationBankAccount> billingAutoAllocationBankAccountRepository,
            IRepository<billing_InterestIndicator> interestIndicatorRepository,
            IRepository<billing_RefundRoleLimit> billingRefundRoleLimitRepository,
            IRolePlayerService rolePlayerService,
            IIndustryService industryService,
            IRepository<billing_IndustryFinancialYear> industryFinancialYearRepository,
            IRepository<billing_DebtorStatusRule> debtorStatusRuleRepository,
            IRepository<billing_CompanyBranch> companyBranchRepository,
            IRepository<Load_PaymentStaging> paymentStagingRepository,
            IRepository<Load_PaymentStagingFile> paymentStagingFileRepository,
            IHttpClientService httpClientService,
            IRepository<Load_PremiumWriteOffContent> premiumWriteOffContentRepository,
            IRepository<Load_PremiumWriteOffFile> premiumWriteOffFileRepository,
            IRepository<billing_DebtorStatusProductCategory> debtorStatusProductCategoryRepository,
            IRepository<billing_ForecastRate> forecastRateRepository,
            IRepository<billing_SuspenseDebtorBankMapping> suspenseDebtorBankMappingRepository,
            IRoleService roleService,
            IUserReminderService userReminderService,
            IUserService userService,
            IRepository<billing_RefundHeader> refundHeaderRepository,
            IRepository<billing_LegalCommissionRecon> legalCommissionReconRepository,
            IRepository<Load_LegalHandOverFileDetail> legalHandOverDetailRepository,
            IRepository<Load_LegalHandOverFile> legalHandOverFileRepository
            ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _finPayeeRepository = finPayeeRepository;
            _billingNotesRepository = billingNotesRepository;
            _ageAnalysisNotesRepository = ageAnalysisNotesRepository;
            _interDebtorTransferRepository = interDebtorTransferRepository;
            _interDebtorTransferNotesRepository = interDebtorTransferNotesRepository;
            _policyService = policyService;
            _policyNoteService = policyNoteService;
            _interBankTransferNotesRepository = interBankTransferNotesRepository;
            _interBankTransferRepository = interBankTransferRepository;
            _qLinkPaymentRecordStagingRepository = qLinkPaymentRecordStagingRepository;
            _sendEmailService = sendEmailService;
            _configurationService = configurationService;
            _bankStatementEntryRepository = bankStatementEntryRepository;
            _wizardService = wizardService;
            _transactionRepository = transactionRepository;
            _cfpEntriesToAllocateIdsLock = new ReaderWriterLockSlim();
            _bankAccountService = bankAccountService;
            _billingAutoAllocationBankAccountRepository = billingAutoAllocationBankAccountRepository;
            _interestIndicatorRepository = interestIndicatorRepository;
            _billingRefundRoleLimitRepository = billingRefundRoleLimitRepository;
            _industryService = industryService;
            _industryFinancialYearRepository = industryFinancialYearRepository;
            _debtorStatusRuleRepository = debtorStatusRuleRepository;
            _rolePlayerService = rolePlayerService;
            _companyBranchRepository = companyBranchRepository;
            _paymentStagingRepository = paymentStagingRepository;
            _paymentStagingFileRepository = paymentStagingFileRepository;
            _httpClientService = httpClientService;
            _premiumWriteOffContentRepository = premiumWriteOffContentRepository;
            _premiumWriteOffFileRepository = premiumWriteOffFileRepository;
            _debtorStatusProductCategoryRepository = debtorStatusProductCategoryRepository;
            _forecastRateRepository = forecastRateRepository;
            _suspenseDebtorBankMappingRepository = suspenseDebtorBankMappingRepository;
            _userReminderService = userReminderService;
            _roleService = roleService;
            _userService = userService;
            _refundHeaderRepository = refundHeaderRepository;
            _legalCommissionReconRepository = legalCommissionReconRepository;
            _legalHandOverDetailRepository = legalHandOverDetailRepository;
            _legalHandOverFileRepository = legalHandOverFileRepository;
        }

        public async Task<FinPayee> GetFinPayeeAccountByFinPayeeNumber(string finPayeeNumber)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewPayeeAccount);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var account = await _finPayeeRepository
                    .SingleOrDefaultAsync(s => s.FinPayeNumber == finPayeeNumber);
                if (account == null) return null;
                return Mapper.Map<FinPayee>(account);
            }
        }



        public async Task<bool> UpdateTheDebtorStatus(UpdateDebtorStatusRequest updateDebtorStatusRequest)
        {
            Contract.Requires(updateDebtorStatusRequest != null);
            DebtorStatusRule debtorStatusRule = null;

            var debtor = await _rolePlayerService.GetFinPayee(updateDebtorStatusRequest.RolePlayerId);
            if (debtor == null)
            {
                throw new Exception($"Debtor not found with RolePlayerId: {updateDebtorStatusRequest.RolePlayerId}");
            }
            debtor.DebtorStatus = updateDebtorStatusRequest.DebtorStatus;
            var isFinPayeeSaved = await _rolePlayerService.UpdateFinPayee(debtor);

            if (updateDebtorStatusRequest.DebtorStatus == null)
            {
                return await Task.FromResult(isFinPayeeSaved);
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var debtorStatusRuleEntity = await _debtorStatusRuleRepository.FirstOrDefaultAsync(x => x.DebtorStatus == updateDebtorStatusRequest.DebtorStatus);
                debtorStatusRule = Mapper.Map<DebtorStatusRule>(debtorStatusRuleEntity);
            }

            if (debtorStatusRule != null)
            {
                var industry = await _industryService.GetIndustry(debtor.IndustryId);
                if (industry.IndustryClass == IndustryClassEnum.Metals)
                {
                    await AddBillingInterestIndicator(new InterestIndicator { isActive = true, ChargeInterest = debtorStatusRule.InterestIndicator, RolePlayerId = updateDebtorStatusRequest.RolePlayerId, InterestDateFrom = DateTime.Now, InterestDateTo = DateTime.MaxValue });
                }
            }
            return await Task.FromResult(isFinPayeeSaved);
        }

        public async Task AddBillingNotes(List<BillingNote> billingNotes)
        {
            Contract.Requires(billingNotes != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddBillingNote);

            using (var scope = _dbContextScopeFactory.Create())
            {
                foreach (var billingNote in billingNotes)
                {
                    var entity = Mapper.Map<billing_Note>(billingNote);
                    _billingNotesRepository.Create(entity);
                }

                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }

        public async Task MonitorBankStatementImport()
        {
            try
            {
                var dateToCheck = DateTimeHelper.SaNow.AddDays(-1);
                if (dateToCheck.DayOfWeek == DayOfWeek.Sunday)
                {
                    return;
                }

                var startOfTheDay = dateToCheck.StartOfTheDay();
                var endOfTheDay = dateToCheck.EndOfTheDay();

                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var bankStatementImported = await _bankStatementEntryRepository.AnyAsync(b => b.StatementDate >= startOfTheDay && b.StatementDate <= endOfTheDay);

                    if (!bankStatementImported)
                    {
                        await SendBankStatementImportErrorAlert();
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Monitoring Bank Statement Import - Error Message {ex.Message}");
            }

        }

        private async Task SendBankStatementImportErrorAlert()
        {
            var recipients = await _configurationService.GetModuleSetting(SystemSettings.BankStatementImportErrorRecipients);
            var dateToCheck = DateTimeHelper.SaNow.AddDays(-1);
            var emailRequest = new SendMailRequest
            {
                Recipients = recipients,
                Body = $"Bank statement for {dateToCheck.ToShortDateString()} has not been imported.",
                IsHtml = false,
                FromAddress = "system@randmutual.co.za",
                Subject = "Bank statement not imported"
            };

            await _sendEmailService.SendEmail(emailRequest);
        }

        public async Task<int> AddBillingNote(BillingNote billingNote)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddBillingNote);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<billing_Note>(billingNote);
                _billingNotesRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.Id;
            }
        }

        public async Task<List<BillingNote>> GetAllBillingNotesByRoleplayerId(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewBillingNote);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var notes = new List<BillingNote>();

                var billingNotes = await GetBillingNotesByRoleplayerId(rolePlayerId);
                var ageAnalysisNotes = await GetAgeAnalysisNotesByRoleplayerId(rolePlayerId);
                var interDebtorTransferNotes = await GetInterDebtorTransferNotesByRoleplayerId(rolePlayerId);
                var interBankTransferNotes = await GetInterBankTransferNotesByRoleplayerId(rolePlayerId);
                var policyNotes = await GetPolicyNotesByRoleplayerId(rolePlayerId);

                notes.AddRange(billingNotes);
                notes.AddRange(ageAnalysisNotes);
                notes.AddRange(interDebtorTransferNotes);
                notes.AddRange(interBankTransferNotes);
                notes.AddRange(policyNotes);

                return notes;
            }
        }

        public async Task<List<BillingNote>> GetPolicyNotesByRoleplayerId(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewBillingNote);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var billingNotes = new List<BillingNote>();
                var policies = await _policyService.GetOnlyPoliciesByRolePlayer(rolePlayerId);
                foreach (var policy in policies)
                {
                    var policyNotes = await _policyNoteService.GetNotes(policy.PolicyId);
                    var notes = policyNotes.Select(s => new BillingNote
                    {
                        Context = "Policy",
                        Id = s.Id,
                        Text = s.Text,
                        CreatedBy = s.CreatedBy,
                        CreatedDate = s.CreatedDate
                    }).ToList();

                    billingNotes.AddRange(notes);
                }

                return billingNotes;
            }
        }

        public async Task<List<BillingNote>> GetBillingNotesByRoleplayerId(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var notes = new List<BillingNote>();
                var entities = await _billingNotesRepository
                    .Where(s => s.ItemId == rolePlayerId)
                    .OrderByDescending(c => c.Id).ToListAsync();
                notes = Mapper.Map<List<BillingNote>>(entities);
                return notes;
            }
        }

        private async Task<List<BillingNote>> GetAgeAnalysisNotesByRoleplayerId(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _ageAnalysisNotesRepository
                    .Where(s => s.RolePlayerId == rolePlayerId)
                    .Select(s => new BillingNote
                    {
                        Context = "Age Analysis",
                        Id = s.Id,
                        Text = s.Text,
                        CreatedBy = s.CreatedBy,
                        CreatedDate = s.CreatedDate
                    }).ToListAsync();
            }
        }

        private async Task<List<BillingNote>> GetInterDebtorTransferNotesByRoleplayerId(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var finpayee = await _finPayeeRepository.FirstOrDefaultAsync(s => s.RolePlayerId == rolePlayerId);
                var interDebtorTransferIds = await _interDebtorTransferRepository.Where(s => s.FromDebtorNumber == finpayee.FinPayeNumber || s.ReceiverDebtorNumber == finpayee.FinPayeNumber).Select(s => s.InterDebtorTransferId).ToListAsync();
                return await _interDebtorTransferNotesRepository
                    .Where(s => interDebtorTransferIds.Contains(s.InterDebtorTransferId))
                    .Select(s => new BillingNote
                    {
                        Context = "Inter Debtor Transfer",
                        Id = s.Id,
                        Text = s.Text,
                        CreatedBy = s.CreatedBy,
                        CreatedDate = s.CreatedDate
                    }).ToListAsync();
            }
        }

        private async Task<List<BillingNote>> GetInterBankTransferNotesByRoleplayerId(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var finpayee = await _finPayeeRepository.FirstOrDefaultAsync(s => s.RolePlayerId == rolePlayerId);
                var interBankTransferIds = await _interBankTransferRepository.Where(s => s.ReceiverDebtorNumber == finpayee.FinPayeNumber).Select(s => s.InterBankTransferId).ToListAsync();
                return await _interBankTransferNotesRepository
                    .Where(s => interBankTransferIds.Contains(s.InterBankTransferId))
                    .Select(s => new BillingNote
                    {
                        Context = "Inter Bank Transfer",
                        Id = s.Id,
                        Text = s.Text,
                        CreatedBy = s.CreatedBy,
                        CreatedDate = s.CreatedDate
                    }).ToListAsync();
            }
        }


        public async Task SetBundleRaiseStatusToAwaitingApproval(int wizardId)
        {
            await _wizardService.EditWizardStatus(wizardId, WizardStatusEnum.AwaitingApproval, 0);
        }

        private async Task ImportPaymentRecordsAsync(QLinkStatementResponse qLinkStatementResponse, string claimCheckReference)
        {
            Contract.Requires(qLinkStatementResponse != null);
            Contract.Requires(claimCheckReference != null);
            await StagePaymentRecordsAsync(qLinkStatementResponse.PaymentRecords, claimCheckReference, qLinkStatementResponse.SalaryMonth);
        }

        private async Task StagePaymentRecordsAsync(List<PaymentRecord> paymentRecords, string claimCheckReference, string salaryMonth)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var staggingentries = new List<Load_QLinkPaymentRecordStaging>();
                foreach (var record in paymentRecords)
                {
                    record.SalaryMonth = salaryMonth;
                    record.ClaimCheckReference = claimCheckReference;
                    staggingentries.Add(Mapper.Map<Load_QLinkPaymentRecordStaging>(record));
                }

                _qLinkPaymentRecordStagingRepository.Create(staggingentries);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task LoadBankStatementEntriesAsync(QLinkStatementResponse qLinkStatementResponse, string messageBusClaimCheckReference)
        {
            var internalClaimCheckReference = Guid.NewGuid();
            var entries = new List<finance_BankStatementEntry>();
            var acountNumber = await _configurationService.GetModuleSetting(SystemSettings.CfpInvoiceAllocationBankAccountNumber);
            using (var scope = _dbContextScopeFactory.Create())
            {
                int line = 1;

                var _qLinkStatementResponse = qLinkStatementResponse.PaymentRecords.Where(x => string.Equals(x.OperationType.Trim(), QlinkPaymentRecord, StringComparison.CurrentCultureIgnoreCase)
                                                            || string.Equals(x.OperationType.Trim(), QlinkPaymentReversalRecord, StringComparison.CurrentCultureIgnoreCase))
                                                            .OrderBy(y => y.OperationType);

                foreach (var entity in _qLinkStatementResponse)
                {
                    var policyNumber = entity.ReferenceNumber.Replace("X", "-");

                    DateTime? statementDate = GetDateTimeFromString(entity.StatementDate);
                    DateTime? hyphenDateProcessed = GetDateTimeFromString(entity.HyphenDateProcessed);
                    DateTime? hyphenDateReceived = GetDateTimeFromString(entity.HyphenDateReceived);

                    var statement = new finance_BankStatementEntry
                    {
                        BankStatementEntryType = BankStatementEntryTypeEnum.SalaryDeduction,
                        BankAccountNumber = acountNumber.PadLeft(16, '0').Trim(),
                        BankAndStatementDate = Convert.ToDateTime(string.Format("{0}{1}{2}{3}{4}", qLinkStatementResponse.SalaryMonth.Substring(0, 4), "-", qLinkStatementResponse.SalaryMonth.Substring(4, 2), "-", "01")).Date,
                        DocumentType = "",
                        UserReference = policyNumber,
                        UserReference1 = "PT",
                        UserReference2 = policyNumber,
                        NettAmount = Math.Abs(entity.Amount),
                        StatementDate = statementDate,
                        StatementLineNumber = line,
                        TransactionType = TransactionType,
                        ClaimCheckReference = internalClaimCheckReference,
                        StatementNumber = messageBusClaimCheckReference.Substring(12, 7),
                        RecordId = RecordId,
                        DebitCredit = string.Equals(entity.OperationType.Trim(), QlinkPaymentRecord, StringComparison.CurrentCultureIgnoreCase) ? "+" : "-",
                        TransactionDate = DateTime.Now,
                        HyphenDateProcessed = hyphenDateProcessed,
                        HyphenDateReceived = hyphenDateReceived,
                        Premium = Math.Abs(entity.Premium),
                        Commission = Math.Abs(entity.Commission)
                    };

                    line++;
                    entries.Add(statement);
                }

                _bankStatementEntryRepository.Create(entries);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task ImportPaymentRecordsAsync(StatementRequest statementRequest)
        {
            Contract.Requires(statementRequest != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var staggingEntries = new List<Load_PaymentStaging>();

                staggingEntries = Mapper.Map<List<Load_PaymentStaging>>(statementRequest.PaymentRecords);

                _paymentStagingRepository.Create(staggingEntries);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task LoadBankStatementEntriesAsync(StatementRequest statementRequest)
        {
            var internalClaimCheckReference = Guid.NewGuid();
            var entries = new List<finance_BankStatementEntry>();
            var accountNumber = await _configurationService.GetModuleSetting(SystemSettings.CfpTop50PlusMunicipalitiesBankAccountNumber);

            using (var scope = _dbContextScopeFactory.Create())
            {
                int line = 1;

                var result = DateTime.TryParse($"{statementRequest.SalaryMonth.Substring(0, 4)}-{statementRequest.SalaryMonth.Substring(4, 2)}-01", out DateTime bankAndStatementDate);
                if (!result)
                {
                    var spaceIndex = statementRequest.SalaryMonth.Replace("-", " ").IndexOf(' ');
                    if (spaceIndex > -1)
                    {
                        result = DateTime.TryParse($"01-{statementRequest.SalaryMonth.Substring(0, spaceIndex)}-{statementRequest.SalaryMonth.Substring(spaceIndex + 1, statementRequest.SalaryMonth.Length - spaceIndex - 1)}", out bankAndStatementDate);
                    }
                }

                foreach (var paymentRecord in statementRequest.PaymentRecords)
                {
                    var nettAmount = Convert.ToInt64(Math.Round(paymentRecord.PaymentReceived, 2) * 100L);

                    var statement = new finance_BankStatementEntry
                    {
                        BankStatementEntryType = BankStatementEntryTypeEnum.SalaryDeduction,
                        BankAccountNumber = accountNumber.PadLeft(16, '0').Trim(),
                        BankAndStatementDate = bankAndStatementDate,
                        DocumentType = "",
                        UserReference = paymentRecord.PolicyNumber.Replace("X", "-").Replace("x", "-"),
                        UserReference1 = "PT",
                        UserReference2 = paymentRecord.PolicyNumber.Replace("X", "-").Replace("x", "-"),
                        NettAmount = nettAmount,
                        StatementDate = bankAndStatementDate,
                        StatementLineNumber = line,
                        TransactionType = TransactionType,
                        ClaimCheckReference = internalClaimCheckReference,
                        StatementNumber = statementRequest.StatementNumber,
                        EStatementNumber = statementRequest.StatementNumber,
                        RecordId = RecordId,
                        DebitCredit = "+",
                        TransactionDate = DateTime.Now,
                        Premium = Math.Abs((int)paymentRecord.PaymentReceived),
                        Commission = Math.Abs(0),
                        CreatedBy = "BackendProcess",
                        ModifiedBy = "BackendProcess",
                        IsActive = true
                    };

                    line++;
                    entries.Add(statement);
                }

                _bankStatementEntryRepository.Create(entries);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private DateTime? GetDateTimeFromString(string dateString)
        {
            try
            {
                if (!string.IsNullOrEmpty(dateString))
                {
                    //This is the agreed format, we should receive from Craig
                    return DateTime.ParseExact(dateString, "yyyy-MM-dd", CultureInfo.InvariantCulture);
                }
                else
                {
                    return null;
                }
            }
            catch
            {
                return null;
            }
        }

        public async Task<QLinkStatementResponse> GetQLinkPaymentRecordsAsync(string claimCheckReference)
        {
            var qLinkRequestApiUrl = await _configurationService.GetModuleSetting(SystemSettings.QLinkRequestApiUrl);
            var qLinkSubscriptionKey =
                await _configurationService.GetModuleSetting(SystemSettings.QLinkOcpApimSubscriptionKey);

            HttpClientSettings httpClientSettings = new HttpClientSettings();
            httpClientSettings.AddDefaultRequestHeader(OcpApimSubscriptionKeyHeader, qLinkSubscriptionKey);

            using (var data = new StringContent(string.Empty, Encoding.UTF8, "application/json"))
            {
                var responseMessage = await _httpClientService.GetAsync(httpClientSettings, $"{qLinkRequestApiUrl}{claimCheckReference}");
                var responseString = await responseMessage.Content.ReadAsStringAsync();

                if (string.IsNullOrWhiteSpace(responseString))
                {
                    throw new Exception(
                        $"{nameof(GetQLinkPaymentRecordsAsync)} : {nameof(claimCheckReference)}: {claimCheckReference}, {nameof(responseString)} : {responseString}");
                }

                var policyRequestObject = JsonConvert.DeserializeObject<QLinkStatementResponse>(responseString);

                if (policyRequestObject?.PaymentRecords.Count == 0)
                {
                    throw new Exception(
                        $"{nameof(GetQLinkPaymentRecordsAsync)} : {nameof(claimCheckReference)}: {claimCheckReference}, {nameof(responseString)} : {responseString}");
                }

                if (policyRequestObject?.PaymentRecords.Count > 0)
                {
                    policyRequestObject.PaymentRecords = policyRequestObject.PaymentRecords
                        .Where(pr => pr.Partner == PartnerName).ToList();
                }

                return policyRequestObject;
            }
        }

        public async Task<bool> ImportQLinkPremiumTransactionsAsync(string claimCheckReference)
        {
            Contract.Requires(claimCheckReference != null);

            // Read file from QLink
            var qLinkStatementResponse = await GetQLinkPaymentRecordsAsync(claimCheckReference);

            // Filter out none Matla transactions 
            Contract.Requires(qLinkStatementResponse != null);
            Contract.Requires(qLinkStatementResponse.PaymentRecords != null);

            if (qLinkStatementResponse.PaymentRecords.Any(x =>
                string.IsNullOrWhiteSpace(x.StatementDate) || string.IsNullOrWhiteSpace(x.HyphenDateProcessed) ||
                string.IsNullOrWhiteSpace(x.HyphenDateReceived)))

            {
                throw new ArgumentNullException(
                    $"{nameof(ImportQLinkPremiumTransactionsAsync)} : Statement {claimCheckReference} has invalid (StatementDate/HypenDates)");
            }

            if (qLinkStatementResponse.PaymentRecords.Count > 0)
            {
                //// Stage and import payment records from QLink
                var t1 = Task.Run(() => ImportPaymentRecordsAsync(qLinkStatementResponse, claimCheckReference));
                var t2 = Task.Run(() => LoadBankStatementEntriesAsync(qLinkStatementResponse, claimCheckReference));
                await Task.WhenAll(t1, t2);

            }

            return true;
        }

        public async Task<FileUploadResponse> ImportSpreadsheetPremiumTransactionsAsync(FileContentImport fileContent)
        {
            Contract.Requires(fileContent != null);
            Contract.Requires(!string.IsNullOrWhiteSpace(fileContent.Data), "File contents cannot be empty");
            Contract.Requires(fileContent.PaymentStagingRecordFile != null, "File header/footer is required");
            Contract.Requires(fileContent.PaymentStagingRecordFile.FileName != null, "File name is required");

            var (existingPaymentTotalFound, statementNumber) = await DoesPaymentTotalExist(fileContent.PaymentStagingRecordFile);

            if (!existingPaymentTotalFound)
            {
                return new FileUploadResponse
                {
                    ErrorMessage = $"Existing payment for period {fileContent.PaymentStagingRecordFile.PaymentMonthYear} was not found.",
                    Success = false
                };
            }

            byte[] content = Convert.FromBase64String(fileContent.Data);
            const int StartingIndex = 0;
            var fileData = Encoding.UTF8.GetString(content, StartingIndex, content.Length);
            var paymentStagingRecords = new List<PaymentStagingRecord>();

            var fileIdentifier = Guid.NewGuid();
            char[] delimiters = new char[] { pipeDelimiter, semiColonDelimiter };

            var lines = fileData.GetLines();
            var headerFields = lines.First().GetFieldsFromHeader(delimiters);
            var propertyList = headerFields.MapHeaderToProperties<PaymentStagingRecord>().Where(x => x != null).ToList();
            var rows = lines.Skip(1).Where(x => !x.StartsWith($"{delimiters}{delimiters}{delimiters}"));

            DateTime? validDate;
            if (double.TryParse(fileContent.PaymentStagingRecordFile.PaymentMonthYear, out double _validDouble)
                && _validDouble < highestOleAutomationDate)
            {
                validDate = DateTime.FromOADate(_validDouble);
            }
            else
            {
                validDate = fileContent.PaymentStagingRecordFile.PaymentMonthYear.ParseDateTimeNullable();
            }

            var paymentStagingRecordHeader = new PaymentStagingRecordFile()
            {
                CollectionFeeAmount = fileContent.PaymentStagingRecordFile.CollectionFeeAmount,
                CollectionFeePercentage = fileContent.PaymentStagingRecordFile.CollectionFeePercentage,
                CollectionFeeVatAmount = fileContent.PaymentStagingRecordFile.CollectionFeeVatAmount,
                CollectionFeeVatPercentage = fileContent.PaymentStagingRecordFile.CollectionFeeVatPercentage,
                Company = fileContent.PaymentStagingRecordFile.Company,
                TotalPayment = fileContent.PaymentStagingRecordFile.TotalPayment,
                TotalPaymentReceived = fileContent.PaymentStagingRecordFile.TotalPaymentReceived,
                PaymentMonthYear = fileContent.PaymentStagingRecordFile.PaymentMonthYear,
                FileIdentifier = fileIdentifier,
                FileName = fileContent.PaymentStagingRecordFile.FileName,
                CreatedBy = RmaIdentity.Email,
                CreatedDate = DateTimeHelper.SaNow,
                ModifiedBy = RmaIdentity.Email,
                ModifiedDate = DateTimeHelper.SaNow
            };

            foreach (var line in rows)
            {
                var rowColumnCount = line.Split(delimiters)?.Length;

                if (line.All(x => x == delimiters[0] || x == delimiters[1])) // if true, treat as empty line and skip
                    continue;

                if (rowColumnCount != headerFields.Length)
                    continue;

                var paymentStagingRecord = new PaymentStagingRecord();

                for (var jCount = 0; jCount < rowColumnCount; jCount++)
                {
                    var columnName = headerFields[jCount].Replace(" ", string.Empty);
                    var columnValue = line.Split(delimiters)[jCount].StartsWith("'", StringComparison.InvariantCulture) ?
                        line.Split(delimiters)[jCount].Remove(0) : line.Split(delimiters)[jCount];

                    if (columnName.Equals("PayNo", StringComparison.OrdinalIgnoreCase)
                        || columnName.Equals("EmployeeNo", StringComparison.OrdinalIgnoreCase))
                    {
                        paymentStagingRecord.PayNumber = columnValue;
                        continue;
                    }

                    if (columnName.Equals("PolicyCode", StringComparison.OrdinalIgnoreCase))
                    {
                        paymentStagingRecord.PolicyNumber = columnValue;
                        continue;
                    }

                    if (columnName.Equals("DOC", StringComparison.OrdinalIgnoreCase)
                        || columnName.Equals("D", StringComparison.OrdinalIgnoreCase))
                    {
                        paymentStagingRecord.CommencementDate = columnValue;
                        continue;
                    }

                    if (columnName.Equals("SBPMPayrollCode", StringComparison.OrdinalIgnoreCase))
                    {
                        paymentStagingRecord.AreaCode = columnValue;
                        continue;
                    }

                    if (columnName.Equals("PaymentReceived", StringComparison.OrdinalIgnoreCase))
                    {
                        if (Decimal.TryParse(columnValue, out decimal paymentReceived))
                        {
                            paymentStagingRecord.PaymentReceived = paymentReceived;
                        }
                        else
                        {
                            _ = Decimal.TryParse(columnValue.Replace(".", ","), out paymentReceived);
                            paymentStagingRecord.PaymentReceived = paymentReceived;
                        }

                        break;
                    }

                    SetPropertyValues(paymentStagingRecord, columnName, columnValue);
                }

                if (string.IsNullOrEmpty(paymentStagingRecord.PolicyNumber)
                    && string.IsNullOrEmpty(paymentStagingRecord.Surname)
                    && string.IsNullOrEmpty(paymentStagingRecord.Initials))
                {
                    continue;
                }

                paymentStagingRecords.Add(paymentStagingRecord);
            }

            if (paymentStagingRecords.Count > 0)
            {
                paymentStagingRecords.ForEach(x =>
                {
                    x.FileIdentifier = fileIdentifier;
                    x.CreatedDate = DateTimeHelper.SaNow;
                    x.CreatedBy = RmaIdentity.Email;
                    x.ModifiedDate = DateTimeHelper.SaNow;
                    x.ModifiedBy = RmaIdentity.Email;
                });

                var statementFileHeader = Mapper.Map<Load_PaymentStagingFile>(paymentStagingRecordHeader);

                Load_PaymentStagingFile fileReference;

                using (var scope = _dbContextScopeFactory.Create())
                {
                    fileReference = _paymentStagingFileRepository.Create(statementFileHeader);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }

                var statementRequest = new StatementRequest()
                {
                    PaymentRecords = paymentStagingRecords,
                    SalaryMonth = fileReference.PaymentMonthYear,
                    FileIdentifier = fileIdentifier,
                    StatementNumber = statementNumber,
                    CreatedBy = RmaIdentity.Email,
                    CreatedDate = DateTimeHelper.SaNow,
                    ModifiedBy = RmaIdentity.Email,
                    ModifiedDate = DateTimeHelper.SaNow
                };

                var t1 = Task.Run(() => ImportPaymentRecordsAsync(statementRequest));
                var t2 = Task.Run(() => LoadBankStatementEntriesAsync(statementRequest));

                await Task.WhenAll(t1, t2);
            }

            return new FileUploadResponse
            {
                Success = true
            };
        }

        private async Task<(bool IsSuccess, string statementNumber)> DoesPaymentTotalExist(PaymentStagingRecordFile paymentStagingRecordFile)
        {
            string statementNumber = string.Empty;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (DateTime.TryParse(paymentStagingRecordFile.PaymentMonthYear, out DateTime statementDate))
                {
                    Int64 totalPaymentReceived = Convert.ToInt64(Math.Round(paymentStagingRecordFile.TotalPaymentReceived, 2) * 100L);
                    var partialUserReference = "";

                    var companyAcronymPlusReferenceList = await _configurationService.GetModuleSetting(SystemSettings.CfpTop50PlusMunicipalitiesCompanyAcronymPlusReferenceList);

                    var companyAcronymPlusReferences = companyAcronymPlusReferenceList.Split(new char[] { ';' }, StringSplitOptions.RemoveEmptyEntries);

                    var companyNameStartsWith = false;
                    foreach (var companyAcronymPlusReference in companyAcronymPlusReferences)
                    {
                        companyAcronymPlusReferences = companyAcronymPlusReference.Split(new char[] { '|', ',' }, StringSplitOptions.RemoveEmptyEntries);

                        companyNameStartsWith = companyAcronymPlusReferences.Length > 1 && companyAcronymPlusReferences.Any(x => paymentStagingRecordFile.Company.StartsWith(x.Trim(), StringComparison.OrdinalIgnoreCase));

                        if (companyNameStartsWith)
                        {
                            partialUserReference = companyAcronymPlusReferences[companyAcronymPlusReferences.Length - 1];

                            break;
                        }
                    }

                    var payments = await _bankStatementEntryRepository
                        .SqlQueryAsync<SimpleBankStatementEntryModel>(DatabaseConstants.GetExistingPayment,
                        new SqlParameter
                        {
                            ParameterName = "@PartialUserReference",
                            Value = partialUserReference
                        }, new SqlParameter
                        {
                            ParameterName = "@StatementDate",
                            Value = statementDate
                        }, new SqlParameter
                        {
                            ParameterName = "@NettAmount",
                            Value = totalPaymentReceived
                        });

                    if (payments != null && payments.Any())
                    {
                        statementNumber = payments[0].StatementNumber;
                    }

                    return (payments != null && payments.Count > 0, statementNumber);
                }

                return (false, statementNumber);
            }
        }

        private void SetPropertyValues(PaymentStagingRecord paymentStagingRecordFile, string columnName, string columnValue)
        {
            if (string.IsNullOrEmpty(columnName))
                return;

            var paymentRecordType = paymentStagingRecordFile.GetType();

            foreach (var property in paymentRecordType.GetProperties())
            {
                if (property.Name.Equals(columnName, StringComparison.OrdinalIgnoreCase))
                {
                    if ((property.PropertyType == typeof(Nullable<int>) || property.PropertyType == typeof(int)) && int.TryParse(columnValue, out int intValue))
                    {
                        property.SetValue(paymentStagingRecordFile, intValue);

                        break;
                    }

                    if (property.PropertyType == typeof(decimal) && decimal.TryParse(columnValue, out decimal decimalValue))
                    {
                        property.SetValue(paymentStagingRecordFile, decimalValue);

                        break;
                    }

                    if (property.PropertyType == typeof(DateTime))
                    {
                        DateTime? validDate;
                        if (double.TryParse(columnValue, out double _validDouble))
                        {
                            validDate = DateTime.FromOADate(_validDouble);
                        }
                        else
                        {
                            validDate = columnValue.ParseDateTimeNullable();//TryGetDate(columnValue);
                        }

                        property.SetValue(paymentStagingRecordFile, validDate);

                        break;
                    }

                    property.SetValue(paymentStagingRecordFile, columnValue);
                }
            }
        }

        public async Task<List<BillingNote>> GetBillingNotesByRoleplayerIdAndType(int rolePlayerId, BillingNoteTypeEnum noteType)
        {
            var billingNoteTypeText = noteType.GetDescription();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var notes = new List<BillingNote>();
                var entities = await _billingNotesRepository
                    .Where(s => s.ItemId == rolePlayerId && s.ItemType.Equals(billingNoteTypeText, StringComparison.InvariantCultureIgnoreCase))
                    .OrderByDescending(c => c.Id).ToListAsync();
                notes = Mapper.Map<List<BillingNote>>(entities);
                return notes;
            }
        }

        public async Task<List<PolicyProductCategory>> GetPolicyProductCategoriesByRoleplayerId(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyProductCategories = new List<PolicyProductCategory>();
                var finPayee = await _rolePlayerService.GetFinPayeeByRolePlayerId(rolePlayerId);
                var policies = await _policyService.GetPoliciesWithProductOptionByRolePlayer(rolePlayerId);
                var grouped = policies.GroupBy(c => c.ProductCategoryType);
                var vaps = new PolicyProductCategory() { ProductDescription = "Vaps", CategoryPolicies = new List<PolicyProductCategory>(), ProductOption = new ClientCare.Contracts.Entities.Product.ProductOption() { Code = string.Empty } };
                var statutory = new PolicyProductCategory() { ProductDescription = "Coid", CategoryPolicies = new List<PolicyProductCategory>(), ProductOption = new ClientCare.Contracts.Entities.Product.ProductOption() { Code = string.Empty } };
                var funeral = new PolicyProductCategory() { ProductDescription = "Funeral", CategoryPolicies = new List<PolicyProductCategory>(), ProductOption = new ClientCare.Contracts.Entities.Product.ProductOption() { Code = string.Empty } };

                if (finPayee != null)
                {
                    var industry = await _industryService.GetIndustry((int)finPayee.IndustryId);
                    var bankAccounts = await _bankAccountService.GetBankAccounts();

                    if (industry != null)
                        foreach (var group in grouped.Where(c => c.Key == ProductCategoryTypeEnum.VapsNoneStatutory || c.Key == ProductCategoryTypeEnum.VapsAssistance))
                        {
                            var accountId = GetRmaBankAccountIdByIndustryAndProduct(industry.IndustryClass, ProductCategoryTypeEnum.VapsNoneStatutory, bankAccounts);
                            foreach (var item in group)
                                vaps.CategoryPolicies.Add(new PolicyProductCategory
                                {
                                    PolicyId = item.PolicyId,
                                    CategoryPolicies = null,
                                    PolicyNumber = item.PolicyNumber,
                                    ProductCategory = null,
                                    ProductOption = item.ProductOption,
                                    ProductDescription = item.ProductCategoryType.GetDescription().SplitCamelCaseText(),
                                    RmaBankAccountId = accountId,
                                });
                            policyProductCategories.Add(vaps);
                        }

                    foreach (var group in grouped.Where(c => c.Key == ProductCategoryTypeEnum.Coid))
                    {
                        var accountId = GetRmaBankAccountIdByIndustryAndProduct(industry.IndustryClass, ProductCategoryTypeEnum.Coid, bankAccounts);
                        foreach (var item in group)
                            statutory.CategoryPolicies.Add(new PolicyProductCategory
                            {
                                PolicyId = item.PolicyId,
                                CategoryPolicies = null,
                                PolicyNumber = item.PolicyNumber,
                                ProductCategory = null,
                                ProductOption = item.ProductOption,
                                ProductDescription = item.ProductCategoryType.GetDescription().SplitCamelCaseText(),
                                RmaBankAccountId = accountId,
                            });
                        policyProductCategories.Add(statutory);
                    }

                    foreach (var group in grouped.Where(c => c.Key == ProductCategoryTypeEnum.Funeral))
                    {
                        var accountId = GetRmaBankAccountIdByIndustryAndProduct(industry.IndustryClass, ProductCategoryTypeEnum.Funeral, bankAccounts);
                        foreach (var item in group)
                            funeral.CategoryPolicies.Add(new PolicyProductCategory
                            {
                                PolicyId = item.PolicyId,
                                CategoryPolicies = null,
                                PolicyNumber = item.PolicyNumber,
                                ProductCategory = null,
                                ProductOption = item.ProductOption,
                                ProductDescription = item.ProductCategoryType.GetDescription().SplitCamelCaseText(),
                                RmaBankAccountId = accountId,
                            });
                        policyProductCategories.Add(funeral);
                    }
                }
                return policyProductCategories;
            }
        }

        public async Task<bool> CheckStagePaymentRecordsAreStagedAsync(string claimCheckReference)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var stagedRecordsCount = await _qLinkPaymentRecordStagingRepository.Where(x => x.ClaimCheckReference == claimCheckReference).CountAsync();
                return stagedRecordsCount > 0;

            }
        }

        public async Task<List<DebtorProductBalance>> GetProductBalancesByPolicyIds(DebtorProductBalanceRequest request)
        {
            Contract.Requires(request != null);
            var productBalances = new List<DebtorProductBalance>();
            var results = new List<DebtorProductBalance>();
            int roleplayerId = request.RoleplayerId;
            List<int> PolicyIds = request.PolicyIds;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                productBalances = await _transactionRepository.SqlQueryAsync<DebtorProductBalance>(
               DatabaseConstants.GetDebtorProductBalances,
               new SqlParameter("@roleplayerId", roleplayerId));

                var grouped = productBalances.Where(c => PolicyIds.Contains(c.PolicyId)).ToList().GroupBy(c => c.ProductOptionId);

                foreach (var group in grouped)
                {
                    results.Add(new DebtorProductBalance
                    {
                        PolicyId = group.Key,
                        Balance = group.Sum(c => c.Balance),
                        ProductOptionId = (int)group.FirstOrDefault()?.ProductOptionId,
                        ProductOptionName = group.FirstOrDefault()?.ProductOptionName
                    });
                }
                return results;
            }
        }

        public async Task<List<AutoAllocationAccount>> GetAutoAllocationAccounts()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var bankAccounts = await _bankAccountService.GetBankAccounts();

                var configuredAutoAccounts = await _billingAutoAllocationBankAccountRepository.ToListAsync();

                var results = new List<AutoAllocationAccount>();
                foreach (var account in bankAccounts)
                {
                    results.Add(
                        new AutoAllocationAccount
                        {
                            BankAccountId = account.Id,
                            BankAccountNumber = account.AccountNumber,
                            Description = account.DepartmentName,
                            IsConfigured = configuredAutoAccounts.Any(c => c.BankAccountId == account.Id) ? true : false
                        }
                        );
                }
                return results.OrderBy(r => r.Description).ToList();
            }
        }

        public async Task<bool> AddAllocationAccounts(List<AutoAllocationAccount> accounts)
        {
            if (accounts?.Count > 0)
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var removedAccounts = accounts.Where(c => !c.IsConfigured).ToList();
                    var addedAccounts = accounts.Where(c => c.IsConfigured).ToList();

                    var configuredAutoAccounts = await _billingAutoAllocationBankAccountRepository.ToListAsync();
                    var configuredAccountIds = configuredAutoAccounts.Select(c => c.BankAccountId).ToList();

                    var removed = new List<billing_AutoAllocationBankAccount>();
                    var removedAccountIds = removedAccounts.Select(c => c.BankAccountId).ToList();
                    foreach (var account in configuredAutoAccounts.Where(c => removedAccountIds.Contains(c.BankAccountId)))
                    {
                        account.IsDeleted = true;
                        removed.Add(Mapper.Map<billing_AutoAllocationBankAccount>(account));
                    }

                    var addedAccountIds = addedAccounts.Select(c => c.BankAccountId).ToList();
                    var updatedIds = configuredAutoAccounts.Where(c => addedAccountIds.Contains(c.BankAccountId) && c.IsDeleted).Select(c => c.BankAccountId).ToList();

                    if (removedAccounts?.Count > 0)
                        _billingAutoAllocationBankAccountRepository.Update(removed);

                    if (addedAccounts?.Count > 0)
                    {
                        var accountIdsToAdd = addedAccounts.Select(c => c.BankAccountId).Except(configuredAccountIds).ToList();
                        var accountsToAdd = addedAccounts.Where(c => accountIdsToAdd.Contains(c.BankAccountId)).ToList();
                        _billingAutoAllocationBankAccountRepository.Create(Mapper.Map<List<billing_AutoAllocationBankAccount>>(accountsToAdd));
                    }

                    if (updatedIds?.Count > 0)
                    {
                        var updatedAccounts = addedAccounts.Where(c => updatedIds.Contains(c.BankAccountId)).ToList();
                        _billingAutoAllocationBankAccountRepository.Update(Mapper.Map<List<billing_AutoAllocationBankAccount>>(updatedAccounts));
                    }

                    await scope.SaveChangesAsync()
                        .ConfigureAwait(false);
                }
            return true;
        }

        public async Task<InterestIndicator> GetBillingInterestIndicatorByRolePlayerId(int rolePlayerId)
        {
            //These contracts will only only show up in telemetry logs, if this rolePlayerId is not greater than zero the possibility of exceptions are there
            Contract.Requires(rolePlayerId > 0);

            if (rolePlayerId == 0)
                return new InterestIndicator(); //The assumption here is we return a new instance of the requested object if null and not throwing exceptions by default

            try
            {
                var interestIndicator = new InterestIndicator();
                var finpayee = await _rolePlayerService.GetFinPayee(rolePlayerId);
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var industry = await _industryService.GetIndustry(finpayee.IndustryId);
                    if (industry.IndustryClass != IndustryClassEnum.Metals)
                    {
                        return interestIndicator;
                    }
                    else if (industry.IndustryClass == IndustryClassEnum.Metals)
                    {
                        var indicator = await _interestIndicatorRepository
                                                .Where(x => x.RolePlayerId == rolePlayerId && !x.IsDeleted && x.IsActive)
                                                .OrderByDescending(x => x.CreatedDate)
                                                .FirstOrDefaultAsync();
                        if (indicator != null)
                            return Mapper.Map<InterestIndicator>(indicator);
                        else //default for metal is On with indefinite date                      
                            return new InterestIndicator { ChargeInterest = true, RolePlayerId = rolePlayerId, InterestDateFrom = new DateTime(1900, 1, 1), InterestDateTo = new DateTime(2999, 1, 1) };
                    }
                    return interestIndicator;
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"AddInterestIndicator Error : {ex.Message}");
                throw;
            }
        }

        public async Task<InterestIndicator> AddBillingInterestIndicator(InterestIndicator interestIndicator)
        {
            //These contracts will only only show up in telemetry logs, if this interestIndicator is null it will throw an exception down the line
            Contract.Requires(interestIndicator != null);

            if (interestIndicator is null) //The assumption here is we return a new instance of the requested object if null and not throwing exceptions by default
                return new InterestIndicator();

            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var existingActiveRolePlayerInterestIndicators = await _interestIndicatorRepository.Where(x => x.RolePlayerId == interestIndicator.RolePlayerId && x.IsActive).ToListAsync();
                    var indicator = Mapper.Map<InterestIndicator>(_interestIndicatorRepository.Create(Mapper.Map<billing_InterestIndicator>(interestIndicator)));
                    if (indicator != null)
                    {
                        foreach (var existingActiveRolePlayerInterestIndicator in existingActiveRolePlayerInterestIndicators)
                        {
                            existingActiveRolePlayerInterestIndicator.IsActive = false;
                            _interestIndicatorRepository.Update(existingActiveRolePlayerInterestIndicator);
                        }
                        await scope.SaveChangesAsync();
                        return indicator;
                    }
                }

                return new InterestIndicator();
            }
            catch (Exception ex)
            {
                //The assumption here is that this is the default standard for exception handling and the logging of the exceptions. The entire stack trace might be a better option depending on what happens in the middleware.
                ex.LogException($"AddInterestIndicator Error : {ex.Message}");
                throw;
            }
        }
        public async Task<List<RefundRoleLimit>> GetRefundRoleLimits()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var results = new List<RefundRoleLimit>();
                var refundRoleLimits = await _billingRefundRoleLimitRepository.ToListAsync();
                if (refundRoleLimits?.Count > 0)
                    results = Mapper.Map<List<RefundRoleLimit>>(refundRoleLimits);
                return results;
            }
        }

        public async Task<decimal> GetDebtorNetBalance(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var transactions = await _transactionRepository.Where(t => t.RolePlayerId == rolePlayerId
                                          && t.TransactionType != TransactionTypeEnum.ClaimRecoveryInvoice && t.TransactionType != TransactionTypeEnum.ClaimRecoveryPayment
                                          && t.TransactionType != TransactionTypeEnum.ClaimRecoveryPaymentReversal).ToListAsync();

                var debitAmount = transactions.Where(s => s.TransactionTypeLinkId == (int)TransactionActionType.Debit).Sum(x => x.Amount);
                var creditAmount = transactions.Where(s => s.TransactionTypeLinkId == (int)TransactionActionType.Credit).Sum(x => x.Amount);

                return debitAmount - creditAmount;
            }
        }

        private int GetRmaBankAccountIdByIndustryAndProduct(IndustryClassEnum industryClassType, ProductCategoryTypeEnum productCategoryType, List<BankAccount> bankAccounts)
        {
            var product = productCategoryType.GetDescription();
            var industryName = industryClassType.GetDescription();
            if (industryClassType == IndustryClassEnum.Metals && productCategoryType == ProductCategoryTypeEnum.Coid)
            {
                return (int)bankAccounts.Where(c => c.DepartmentName
                       .IndexOf(product, StringComparison.OrdinalIgnoreCase) > -1 && c.AccountName.IndexOf(industryName, StringComparison.OrdinalIgnoreCase) > -1)?.FirstOrDefault()?.Id;
            }
            else if (industryClassType == IndustryClassEnum.Mining && productCategoryType == ProductCategoryTypeEnum.Coid)
            {
                return (int)bankAccounts.Where(c => c.DepartmentName
                       .IndexOf(product, StringComparison.OrdinalIgnoreCase) > -1 && c.AccountName.IndexOf(industryName, StringComparison.OrdinalIgnoreCase) > -1)?.FirstOrDefault()?.Id;
            }
            else if (industryClassType == IndustryClassEnum.Group && productCategoryType == ProductCategoryTypeEnum.Funeral)
            {
                return (int)bankAccounts.Where(c => c.DepartmentName
                       .IndexOf(product, StringComparison.OrdinalIgnoreCase) > -1 && c.AccountName.IndexOf(industryName, StringComparison.OrdinalIgnoreCase) > -1)?.FirstOrDefault()?.Id;
            }
            else if (productCategoryType == ProductCategoryTypeEnum.VapsNoneStatutory)
            {
                product = "Funeral and Other Class";
                return (int)bankAccounts.Where(c => c.DepartmentName
                       .IndexOf(product, StringComparison.OrdinalIgnoreCase) > -1 && c.AccountName.IndexOf(industryName, StringComparison.OrdinalIgnoreCase) > -1)?.FirstOrDefault()?.Id;
            }
            return 0;
        }

        public async Task<List<DebtorProductCategoryBalance>> GetDebtorProductCategoryBalances(int roleplayerId)
        {
            var results = new List<DebtorProductCategoryBalance>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                results = await _transactionRepository.SqlQueryAsync<DebtorProductCategoryBalance>(
               DatabaseConstants.GetProductCategoryBalances,
               new SqlParameter("@roleplayerId", roleplayerId));
                return results;
            }
        }

        public async Task<bool> UpdateDebtorStatus(DebtorStatusModel debtorStatusModel)
        {
            var billingStatuses = new List<DebtCollectionStatusCodeEnum> { DebtCollectionStatusCodeEnum.Duplicatecompany, DebtCollectionStatusCodeEnum.Companysold, DebtCollectionStatusCodeEnum.Termrequest };
            Contract.Requires(debtorStatusModel != null);
            if (billingStatuses.Contains(debtorStatusModel.DebtorStatus))
            {
                var status = DebtorStatusEnum.DuplicateCompany;
                switch (debtorStatusModel.DebtorStatus)
                {
                    case DebtCollectionStatusCodeEnum.Duplicatecompany:
                        status = DebtorStatusEnum.DuplicateCompany;
                        break;
                    case DebtCollectionStatusCodeEnum.Termrequest:
                        status = DebtorStatusEnum.TermsRequestedWaitingSupportingDocuments;
                        break;
                    case DebtCollectionStatusCodeEnum.Companysold:
                        status = DebtorStatusEnum.CompanySold;
                        break;
                }

                var request = new UpdateDebtorStatusRequest { DebtorStatus = status, RolePlayerId = debtorStatusModel.RoleplayerId };
                await UpdateTheDebtorStatus(request);
            }
            return await Task.FromResult(true);
        }

        public async Task<List<DebtorOpenCreditTransaction>> GetDebtorOpenCreditTransactions(int roleplayerId)
        {
            var results = new List<DebtorOpenCreditTransaction>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                results = await _transactionRepository.SqlQueryAsync<DebtorOpenCreditTransaction>(
               DatabaseConstants.GetDebtorOpenCreditTransactions,
               new SqlParameter("@roleplayerId", roleplayerId));
                return results;
            }
        }


        public async Task<IndustryBillingCycle> GetCurrentBillingCycleByIndustryClass(IndustryClassEnum industryClass)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var billingCycles = await _industryFinancialYearRepository.Where(i => i.IndustryClass == industryClass && i.IsActive).ToListAsync();
                var industryBillingCycle = new IndustryBillingCycle();

                int financialPeriodEndDayOfMonth = 1;
                int financialPeriodStartMonth = 1;
                int financialPeriodEndMonth = 1;
                int financialPeriodStartDay = 1;
                int financialPeriodEndYear = 1900;
                int financialPeriodStartYear = 1900;
                if (billingCycles.Count > 0)
                {
                    if ((billingCycles.LastOrDefault()?.EndMonth).HasValue
                             && (billingCycles.LastOrDefault()?.EndDay).HasValue
                             && (billingCycles.FirstOrDefault()?.StartMonth).HasValue
                             && (billingCycles.FirstOrDefault()?.StartDay).HasValue)
                    {
                        financialPeriodEndMonth = (billingCycles.LastOrDefault()?.EndMonth).Value;
                        financialPeriodEndDayOfMonth = (billingCycles.LastOrDefault()?.EndDay).Value;
                        financialPeriodEndYear = (billingCycles.LastOrDefault()?.EndYear).Value;
                        financialPeriodStartMonth = (billingCycles.FirstOrDefault()?.StartMonth).Value;
                        financialPeriodStartDay = (billingCycles.FirstOrDefault()?.StartDay).Value;
                        financialPeriodStartYear = (billingCycles.FirstOrDefault()?.StartYear).Value;
                    }
                }
                industryBillingCycle.EndDate = new DateTime(financialPeriodEndYear, financialPeriodEndMonth, financialPeriodEndDayOfMonth);
                industryBillingCycle.StartDate = new DateTime(financialPeriodStartYear, financialPeriodStartMonth, financialPeriodStartDay);
                return industryBillingCycle;
            }
        }

        public async Task<List<DebtorCompanyAndBranchModel>> GetDebtorsByCompanyBranch(int industryClassId, int companyNumber, int branchNumber)
        {
            var results = new List<DebtorCompanyAndBranchModel>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                results = await _transactionRepository.SqlQueryAsync<DebtorCompanyAndBranchModel>(
                DatabaseConstants.GetDebtorsByCompanyAndBranch,
               new SqlParameter("@industryClassId", industryClassId),
               new SqlParameter("@companyNumber", companyNumber),
               new SqlParameter("@branchNumber", branchNumber));
                return results;
            }
        }

        public async Task<List<BranchModel>> GetBrachesByCompany(int companyNumber)
        {
            var results = new List<BranchModel>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var enties = await _companyBranchRepository.Where(c => c.CompanyNumber == companyNumber).ToListAsync();

                foreach (var item in enties)
                {
                    results.Add(new BranchModel { BranchName = item.BranchName, BranchNumber = item.BranchNumber });
                }
                return results;
            }
        }
        //these are not client_companies
        public async Task<List<CompanyModel>> GetCompanies()
        {
            var results = new List<CompanyModel>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var enties = await _companyBranchRepository.ToListAsync();

                foreach (var item in enties)
                {
                    results.Add(new CompanyModel { CompanyName = item.CompanyName, CompanyNumber = item.CompanyNumber });
                }
                return results;
            }
        }

        public async Task<List<DebtorCompanyAndBranchModel>> GetDebtorsByCompanyBranchAndDate(int companyNumber, int branchNumber, DateTime startDate, DateTime endDate)
        {
            var results = new List<DebtorCompanyAndBranchModel>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                results = await _transactionRepository.SqlQueryAsync<DebtorCompanyAndBranchModel>(
                DatabaseConstants.GetDebtorsByCompanyBranchAndDate,
               new SqlParameter("@companyNumber", companyNumber),
               new SqlParameter("@branchNumber", branchNumber),
               new SqlParameter("@startDate", startDate),
               new SqlParameter("@endDate", endDate));
                return results;
            }
        }

        public async Task<ProductCategoryTypeEnum> GetProductCategoryByRmaBankAccount(string bankAccountDescription)
        {
            var results = ProductCategoryTypeEnum.Funeral;
            if (bankAccountDescription?.IndexOf("coid", StringComparison.OrdinalIgnoreCase) > -1)
            {
                results = ProductCategoryTypeEnum.Coid;
                return await Task.FromResult(results);
            }
            else if ((bankAccountDescription?.IndexOf("class", StringComparison.OrdinalIgnoreCase) > -1 || bankAccountDescription?.IndexOf("other", StringComparison.OrdinalIgnoreCase) > -1)
            && (bankAccountDescription?.IndexOf("mining", StringComparison.OrdinalIgnoreCase) > -1 || bankAccountDescription?.IndexOf("metals", StringComparison.OrdinalIgnoreCase) > -1))
            {
                results = ProductCategoryTypeEnum.VapsNoneStatutory;
                return await Task.FromResult(results);
            }
            else if (bankAccountDescription?.IndexOf("funeral", StringComparison.OrdinalIgnoreCase) > -1 || bankAccountDescription?.IndexOf("sena", StringComparison.OrdinalIgnoreCase) > -1)
            {
                results = ProductCategoryTypeEnum.Funeral;
                return await Task.FromResult(results);
            }
            return await Task.FromResult(results);
        }


        public async Task<bool> WriteOffBulkPremiums(BulkWriteOffRequest content)
        {
            if (content == null)
            {
                throw new NullReferenceException("File content cannot be null");
            }

            var fileName = string.Empty;

            if (!string.IsNullOrEmpty(content.FileName))
            {
                fileName = content?.FileName;
            }

            var fileIdentifier = Guid.NewGuid();
            var writeOffs = new List<Load_PremiumWriteOffContent>();

            writeOffs = Mapper.Map<List<Load_PremiumWriteOffContent>>(content.Data);

            var writeOffFile = await SaveWriteOffFileDetails(fileIdentifier, fileName);
            if (writeOffs.Count > 0)
            {
                var results = await ImportWriteOffs(writeOffs, writeOffFile.PremiumWriteOffFileId);

                if (results > 0)
                    _ = Task.Run(() => FinalizeWriteOffs(writeOffFile.PremiumWriteOffFileId));

                return await Task.FromResult(true);
            }
            return await Task.FromResult(false);
        }

        private async Task<Load_PremiumWriteOffFile> SaveWriteOffFileDetails(Guid fileIdentifier, string fileName)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var file = new Load_PremiumWriteOffFile
                {
                    FileIdentifier = fileIdentifier,
                    FileName = fileName,
                    IsDeleted = false,
                    FileProcessingStatusId = (int?)UploadedFileProcessingStatusEnum.Pending
                };
                var created = _premiumWriteOffFileRepository.Create(file);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return created;
            }
        }

        private async Task<int> ImportWriteOffs(List<Load_PremiumWriteOffContent> writeOffContents, int fileId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                try
                {
                    string sql;
                    var recordCount = 0;
                    const int importCount = 1000;
                    while (writeOffContents.Count > 0)
                    {
                        var count = writeOffContents.Count >= importCount ? importCount : writeOffContents.Count;
                        var records = writeOffContents.GetRange(0, count);
                        sql = CreatePremiumWriteOffContentSql(records, fileId);
                        await _premiumWriteOffContentRepository.ExecuteSqlCommandAsync(sql);
                        writeOffContents.RemoveRange(0, count);
                        recordCount += count;
                    }
                    return recordCount;
                }
                catch (Exception ex)
                {
                    ex.LogException(ex.Message);
                    return 0;
                }
            }
        }

        private string CreatePremiumWriteOffContentSql(List<Load_PremiumWriteOffContent> records, int fileId)
        {
            var sbQuery = new StringBuilder();
            var sql = "INSERT INTO [Load].[PremiumWriteOffContent] (InterestReversalReference,InterestAmount,PremiumReference," +
                "PremiumAmount,MemberNumber,Status,DebtorsClerk, Reason, FileId,MemberName,FinancialYear,UnderwritingYear ) values";
            sbQuery.Append(sql);
            foreach (var rec in records)
            {
                var valuesQuery = string.Format("({0},{1},{2},{3},{4},{5},{6},{7},{8},{9},{10},{11}),",
                    SetLength(rec.InterestReversalReference, 100).Quoted(),
                    SetLength(rec.InterestAmount, 50).Quoted(),
                    SetLength(rec.PremiumReference, 100).Quoted(),
                    SetLength(rec.PremiumAmount, 50).Quoted(),
                    SetLength(rec.MemberNumber, 50).Quoted(),
                    SetLength(rec.Status, 50).Quoted(),
                    SetLength(rec.DebtorsClerk, 50).Quoted(),
                    SetLength(rec.Reason, 500).Quoted(),
                    SetLength(fileId.ToString(), 100).Quoted(),
                    SetLength(rec.MemberName, 50).Quoted(),
                    SetLength(rec.FinancialYear.Value.ToString(), 50).Quoted(),
                    SetLength(rec.UnderwritingYear.Value.ToString(), 50).Quoted()

                );
                sbQuery.Append(valuesQuery);
            }
            return sbQuery.ToString().TrimEnd(new char[] { ',' });
        }

        private string SetLength(string value, int len)
        {
            value = value.Trim();
            return value.Length > len ? value.Substring(0, len) : value;
        }

        private async Task<int> FinalizeWriteOffs(int fileId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var fileIdentifierParameter = new SqlParameter { ParameterName = "@fileId", Value = fileId };
                var userIdParameter = new SqlParameter { ParameterName = "@userId", Value = !string.IsNullOrEmpty(RmaIdentity.Email) ? RmaIdentity.Email : RmaIdentity.ClientId };
                const string procedure = "[billing].[WriteOffBulkPremiums] @fileId, @userId";
                var count = await _premiumWriteOffFileRepository.SqlQueryAsync<int>(procedure, fileIdentifierParameter, userIdParameter);
                return count[0];
            }
        }

        private string GetValidationMessage(string line, int rowNumber, CsvMappingError error)
        {
            var values = line.Split(new char[] { commaDelimiter });
            if (values.Length == 1 && line.IndexOf(pipeDelimiter) >= 0)
            {
                values = line.Split(new char[] { pipeDelimiter });
            }
            if (values.Length == 1)
            {
                return "Invalid file delimiter found. Please check file structure";
            }
            else if (values.Length != 6)
            {
                return $"All the required data has not been supplied on line {rowNumber}.";
            }
            return $"Error on line {rowNumber} column {error.ColumnIndex}: {error.Value}";
        }

        public async Task<bool> UpdateDebtorProductCategoryStatus(DebtorProductCategoryStatusRequest debtorProductCategoryStatusRequest)
        {
            Contract.Requires(debtorProductCategoryStatusRequest != null);
            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var previousStatusEntity = await _debtorStatusProductCategoryRepository.
                        FirstOrDefaultAsync(c => c.DebtorStatusProductCategoryId == debtorProductCategoryStatusRequest.ProductCategoryTypeId
                        && !c.IsDeleted && c.IsActive
                        );
                    if (previousStatusEntity != null)
                    {
                        previousStatusEntity.IsActive = false;
                        previousStatusEntity.IsDeleted = true;
                        previousStatusEntity.EndDate = DateTime.Now;
                        _debtorStatusProductCategoryRepository.Update(previousStatusEntity);
                    }

                    var newStatusEntity = new billing_DebtorStatusProductCategory
                    {
                        StartDate = DateTime.Now,
                        EndDate = DateTime.MaxValue,
                        RolePlayerId = debtorProductCategoryStatusRequest.RoleplayerId,
                        ProductCategoryType = (ProductCategoryTypeEnum)debtorProductCategoryStatusRequest.ProductCategoryTypeId,
                        IsActive = true
                    };
                    _debtorStatusProductCategoryRepository.Create(newStatusEntity);

                    await scope.SaveChangesAsync()
                          .ConfigureAwait(false);
                }

                DebtorStatusRule debtorStatusRule = null;
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var debtorStatusRuleEntity = await _debtorStatusRuleRepository.FirstOrDefaultAsync(x => x.DebtorStatus == (DebtorStatusEnum)debtorProductCategoryStatusRequest.StatusId);
                    debtorStatusRule = Mapper.Map<DebtorStatusRule>(debtorStatusRuleEntity);
                }

                if (debtorStatusRule != null)
                    await AddBillingInterestIndicator(new InterestIndicator { isActive = true, ChargeInterest = debtorStatusRule.InterestIndicator, RolePlayerId = debtorProductCategoryStatusRequest.RoleplayerId, InterestDateFrom = DateTime.Now, InterestDateTo = DateTime.MaxValue });

                return await Task.FromResult(true);
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when adding debtor product category status - Error Message {ex.Message} - Stacktrace {ex.StackTrace}");
                return await Task.FromResult(false);
            }
        }

        public async Task<List<ForecastRates>> GetAllForecastRates()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var forecastRates = await _forecastRateRepository
                    .SqlQueryAsync<ForecastRates>(DatabaseConstants.GetForecastRates);

                return Mapper.Map<List<ForecastRates>>(forecastRates);
            }

        }

        public async Task<int> UpdateForecastRate(ForecastRates forecastRates)
        {
            var result = new List<decimal>();
            if (forecastRates != null && !string.IsNullOrEmpty(forecastRates.ProductId.ToString()))
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var parameters = new List<SqlParameter>();
                    parameters.Add(new SqlParameter { ParameterName = "@EffectiveFrom", SqlDbType = SqlDbType.Date, Value = forecastRates.EffectiveFrom });
                    parameters.Add(new SqlParameter { ParameterName = "@EffectiveTo", SqlDbType = SqlDbType.Date, Value = forecastRates.EffectiveTo });
                    parameters.Add(new SqlParameter { ParameterName = "@ForecastRate", SqlDbType = SqlDbType.Decimal, Value = Convert.ToDecimal(forecastRates.ForecastRate) });
                    parameters.Add(new SqlParameter { ParameterName = "@ProductId", SqlDbType = SqlDbType.Int, Value = forecastRates.ProductId });
                    parameters.Add(new SqlParameter { ParameterName = "@CreatedBy", SqlDbType = SqlDbType.VarChar, Value = RmaIdentity.Username });
                    parameters.Add(new SqlParameter { ParameterName = "@IsDeleted", SqlDbType = SqlDbType.Bit, Value = 0 });
                    result = await _forecastRateRepository
                     .SqlQueryAsync<decimal>(DatabaseConstants.UpdateForecastRate, parameters.ToArray());

                }
            }
            return Convert.ToInt32(result.FirstOrDefault());
        }

        public async Task<List<string>> SearchAllowedAllocationToDebtorAccount(string finPayeNumber)
        {
            var banks = new List<string>();

            var finPayee = await GetFinPayeeAccountByFinPayeeNumber(finPayeNumber);

            if (finPayee != null)
            {
                var searchSuspenseDebtors = await GetSuspenseBankAccountMappingRolePlayer(finPayee.RolePlayerId);

                if (searchSuspenseDebtors?.Count > 0)
                {
                    foreach (var searchSuspenseDebtor in searchSuspenseDebtors)
                    {
                        var accountNumber = await _bankAccountService.GetBankAccountById(searchSuspenseDebtor.BankAccountId);

                        if (accountNumber != null)
                        {
                            banks.Add(accountNumber.AccountNumber);
                        }
                    }
                    return banks;
                }
                else
                {
                    var accountNumber = await _rolePlayerService.GetDebtorIndustryClassBankAccountNumber(finPayeNumber);
                    banks.Add(accountNumber);
                }
            }

            return banks;
        }

        private async Task<List<billing_SuspenseDebtorBankMapping>> GetSuspenseBankAccountMappingRolePlayer(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _suspenseDebtorBankMappingRepository
                  .Where(d => d.RoleplayerId == rolePlayerId).ToListAsync();
            }
        }



        public async Task<bool> SendRefundFailedNotification(int refundHeaderId, string reason)
        {
            try
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var refundHeader = await _refundHeaderRepository.FirstOrDefaultAsync(r => r.RefundHeaderId == refundHeaderId);
                    var userReminders = new List<UserReminder>();
                    var audience = new List<User>();

                    var clerkRole = await _roleService.GetRoleByName("Debtors Clerk");
                    var teamLeadRole = await _roleService.GetRoleByName("Debtors Clerk Team Leader");

                    var users = await _userService.GetUsersInRoles(new List<int> { clerkRole.Id, teamLeadRole.Id });

                    var emailBody = await _configurationService.GetModuleSetting(SystemSettings.RefundFailedNotification);
                    var collectionsEmail = await _configurationService.GetModuleSetting(SystemSettings.CollectionsEmail);
                    var fromAddress = await _configurationService.GetModuleSetting(SystemSettings.PolicyManagerEmailNotificationSender);
                    var status = refundHeader.RefundStatus.GetDescription();

                    var refundReference = refundHeader.Reference;

                    emailBody = emailBody.Replace("{0}", refundReference).
                                          Replace("{1}", status).
                                          Replace("{2}", reason);

                    if (users.Count > 0)
                    {
                        foreach (var user in users)
                        {
                            var userReminder = new UserReminder
                            {
                                ItemId = refundHeader.RefundHeaderId,
                                UserReminderType = UserReminderTypeEnum.SystemNotification,
                                AssignedToUserId = user.Id,
                                Text = $"Refund payment failed - Ref:{refundHeader.Reference}",
                            };


                            userReminders.Add(userReminder);
                        }
                    }

                    foreach (var userReminder in userReminders)
                        await _userReminderService.CreateUserReminder(userReminder);

                    var emailRequest = new SendMailRequest
                    {
                        Recipients = collectionsEmail,
                        Body = emailBody,
                        IsHtml = true,
                        Attachments = null,
                        FromAddress = fromAddress,
                        Subject = $"Refund Failed Notification",
                    };
                    await _sendEmailService.SendEmail(emailRequest);
                }

                return await Task.FromResult(true);
            }
            catch (Exception ex)
            {
                ex.LogException($"Error occured when creating refund notification for itemId - {refundHeaderId} - {ex.Message}");
                return await Task.FromResult(false);
            }
        }

        public async Task<bool> UpdateRefundHeader(RefundHeader header)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (header != null)
                {
                    var refundHeader = await _refundHeaderRepository.FirstOrDefaultAsync(r => r.RefundHeaderId == header.RefundHeaderId);

                    if (header.RefundStatus.HasValue)
                        refundHeader.RefundStatus = header.RefundStatus.Value;

                    _refundHeaderRepository.Update(refundHeader);

                    await scope.SaveChangesAsync()
                          .ConfigureAwait(false);

                    return await Task.FromResult(true);
                }
                return await Task.FromResult(false);

            }
        }


        public async Task<bool> UploadHandoverRecon(List<LegalCommissionRecon> recons)
        {
            Contract.Requires(recons != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var debtorNumbers = recons.Select(r => r.DebtorNumber).ToList();
                var roleplayers = await _finPayeeRepository.Where(c => debtorNumbers.Contains(c.FinPayeNumber)).ToListAsync();

                var dbEntities = recons.Select(x => new billing_LegalCommissionRecon()
                {
                    RoleplayerId = roleplayers.FirstOrDefault(r => r.FinPayeNumber == x.DebtorNumber)?.RolePlayerId,
                    AttorneyName = !string.IsNullOrEmpty(x.AttorneyName) ? FormatAttorneyName(x.AttorneyName) : string.Empty,
                    CommissionRate = x.CommissionRate,
                    DebtorName = x.DebtorName,
                    DebtorNumber = x.DebtorNumber,
                    LegalCollectionType = x.CollectionTypeId,
                    PeriodId = x.PeriodId,
                    UpdatedBalance = x.UpdatedBalance
                }).ToList();

                _legalCommissionReconRepository.Create(dbEntities);

                await scope.SaveChangesAsync()
                      .ConfigureAwait(false);

                return await Task.FromResult(true);
            }
        }

        public async Task<bool> BulkDebtorHandover(BulkHandOverRequest content)
        {
            if (content == null)
            {
                throw new NullReferenceException("File content cannot be null");
            }
            var fileName = string.Empty;

            if (!string.IsNullOrEmpty(content.FileName))
            {
                fileName = content?.FileName;
            }


            var fileIdentifier = Guid.NewGuid();
            var handOverDetails = new List<Load_LegalHandOverFileDetail>();

            handOverDetails = Mapper.Map<List<Load_LegalHandOverFileDetail>>(content.Details);

            var handoverFile = await SaveHandoverFile(fileIdentifier, fileName);
            if (handOverDetails.Count > 0)
            {
                var results = await ImportHandoverDetails(handOverDetails, handoverFile.LegalHandOverFileId);


                var finpayees = content.Details.Select(x => new RMA.Service.ClientCare.Contracts.Entities.RolePlayer.FinPayee()
                {
                    FinPayeNumber = x.DebtorNumber,
                    DebtorStatus = x.DebtorStatus

                }).ToList();

                await _rolePlayerService.BulkDebtorHandover(finpayees);

                return await Task.FromResult(true);
            }
            return await Task.FromResult(false);
        }

        private async Task<bool> ImportHandoverDetails(List<Load_LegalHandOverFileDetail> handOverDetails, int fileId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                handOverDetails.ForEach(d => d.LegalHandOverFileId = fileId);

                _legalHandOverDetailRepository.Create(handOverDetails);

                await scope.SaveChangesAsync()
                      .ConfigureAwait(false);

                return await Task.FromResult(true);
            }
        }

        private async Task<Load_LegalHandOverFile> SaveHandoverFile(Guid fileIdentifier, string fileName)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var file = new Load_LegalHandOverFile
                {
                    FileIdentifier = fileIdentifier,
                    FileName = fileName,
                    IsDeleted = false,
                    FileProcessingStatusId = (int?)UploadedFileProcessingStatusEnum.Pending
                };
                var created = _legalHandOverFileRepository.Create(file);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return created;
            }
        }

        public async Task<List<string>> GetAttorneysForRecon()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var attorneys = await _legalCommissionReconRepository
                    .Where(c => c.AttorneyName.Length > 0)
                    .Select(c => c.AttorneyName).Distinct().ToListAsync();
                return attorneys;
            }
        }

        private string FormatAttorneyName(string attorneyName)
        {
            if (!string.IsNullOrEmpty(attorneyName))
                attorneyName = attorneyName.Substring(attorneyName.IndexOf("{") + 1);

            return attorneyName.Replace("}", string.Empty);
        }
    }
}