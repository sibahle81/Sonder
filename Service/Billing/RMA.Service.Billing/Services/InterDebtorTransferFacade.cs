using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Enums;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.FinCare.Contracts.Entities.Commissions;
using RMA.Service.FinCare.Contracts.Interfaces.Commissions;

using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using Transaction = RMA.Service.Billing.Contracts.Entities.Transaction;

namespace RMA.Service.Billing.Services
{
    public class InterDebtorTransferFacade : RemotingStatelessService, IInterDebtorTransferService
    {
        private const string BillingModulePermissions = "BillingModulePermissions";
        private const string BillingIdt = "IDT";

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<billing_InterDebtorTransfer> _interDebtorTransferRepository;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IIndustryService _industryService;
        private readonly IInterBankTransferService _interBankTransferService;
        private readonly IRepository<billing_RmaBankAccount> _rmaBankAccountRepository;
        private readonly IProductOptionService _productOptionService;
        private readonly IBankAccountService _bankAccountService;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IPaymentAllocationService _paymentAllocationService;
        private readonly IConfigurationService _configurationService;
        private readonly IPeriodService _periodService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IRepository<billing_Invoice> _invoiceRepository;
        private readonly IRepository<billing_Transaction> _transactionRepository;
        private readonly ICommissionService _commissionService;
        private readonly IInvoiceService _invoiceService;
        private readonly IClaimRecoveryInvoiceService _claimRecoveryInvoiceService;
        private readonly IRepository<billing_InvoiceAllocation> _invoiceAllocationRepository;
        private readonly IRepository<billing_DebitTransactionAllocation> _debitAllocationRepository;
        private readonly IRepository<billing_ClaimRecoveryInvoice> _claimRecoveryInvoiceRepository;
        private readonly IBillingService _billingService;


        public InterDebtorTransferFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<billing_InterDebtorTransfer> interDebtorTransferRepository,
            IRolePlayerService rolePlayerService,
            IIndustryService industryService,
            IInterBankTransferService interBankTransferService,
            IRepository<billing_RmaBankAccount> rmaBankAccountRepository,
            IProductOptionService productOptionService,
            IBankAccountService bankAccountService,
            IRolePlayerPolicyService rolePlayerPolicyService,
            IPaymentAllocationService paymentAllocationService,
            IConfigurationService configurationService,
            IPeriodService periodService,
            IDocumentGeneratorService documentGeneratorService,
            IRepository<billing_Invoice> invoiceRepository,
            IRepository<billing_Transaction> transactionsRepository,
            ICommissionService commissionService,
            IInvoiceService invoiceService,
            IClaimRecoveryInvoiceService claimRecoveryInvoiceService,
            IRepository<billing_InvoiceAllocation> invoiceAllocationRepository,
            IRepository<billing_DebitTransactionAllocation> debitAllocationRepository,
            IRepository<billing_ClaimRecoveryInvoice> claimRecoveryInvoiceRepository,
            IBillingService billingService
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _interDebtorTransferRepository = interDebtorTransferRepository;
            _rolePlayerService = rolePlayerService;
            _industryService = industryService;
            _interBankTransferService = interBankTransferService;
            _rmaBankAccountRepository = rmaBankAccountRepository;
            _productOptionService = productOptionService;
            _bankAccountService = bankAccountService;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _paymentAllocationService = paymentAllocationService;
            _configurationService = configurationService;
            _periodService = periodService;
            _documentGeneratorService = documentGeneratorService;
            _invoiceRepository = invoiceRepository;
            _transactionRepository = transactionsRepository;
            _commissionService = commissionService;
            _invoiceService = invoiceService;
            _claimRecoveryInvoiceService = claimRecoveryInvoiceService;
            _invoiceAllocationRepository = invoiceAllocationRepository;
            _debitAllocationRepository = debitAllocationRepository;
            _claimRecoveryInvoiceRepository = claimRecoveryInvoiceRepository;
            _billingService = billingService;
        }

        public async Task<InterDebtorTransfer> InitiateTransferToDebtor(InterDebtorTransfer interDebtorTransfer)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddTransfer);

            if (interDebtorTransfer == null)
            {
                return null;
            }

            var interDebtorReference = string.Empty;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<billing_InterDebtorTransfer>(interDebtorTransfer);
                entity.AllocationProgressStatus = AllocationProgressStatusEnum.UnAllocated;

                var fromDebtor =
                    await _rolePlayerService.GetFinPayeeByFinpayeNumber(interDebtorTransfer.FromDebtorNumber);

                var fromDebtorIndustry = await _industryService.GetIndustry(fromDebtor.IndustryId);

                var debtorPolicies = await
                    _rolePlayerPolicyService.GetPoliciesByPolicyOwnerIdNoRefData(fromDebtor.RolePlayerId);

                if (debtorPolicies.Count == 0)
                {
                    throw new BusinessException("From debtor does not have any policies");
                }

                ProductBankAccount productBankAccount = null;

                foreach (var policy in debtorPolicies)
                {
                    var product = await _productOptionService.GetProductByProductOptionId(policy.ProductOptionId);
                    productBankAccount = product.ProductBankAccounts.Find(p =>
                        p.IndustryClass == fromDebtorIndustry.IndustryClass);
                    if (productBankAccount != null)
                    {
                        break;
                    }
                }

                if (productBankAccount == null)
                {
                    throw new BusinessException("Could not find bank account for debtor industry class");
                }

                var bankAccount = await _bankAccountService.GetBankAccountByAccountNumber(
                    productBankAccount.BankAccountId);

                if (bankAccount == null)
                {
                    throw new BusinessException("Could not find bank account for debtor industry class");
                }

                interDebtorTransfer.FromAccountNumber = bankAccount.AccountNumber;

                if (interDebtorTransfer.ReceiverAccountNumber != interDebtorTransfer.FromAccountNumber && interDebtorTransfer.Transactions[0].TransactionType == TransactionTypeEnum.Payment)
                {
                    RmaIdentity.DemandPermission("Create inter-bank-transfer");
                }

                entity.InterDebtorTransferDetails = new List<billing_InterDebtorTransferDetail>();
                foreach (var tran in interDebtorTransfer.Transactions)
                {
                    entity.InterDebtorTransferDetails.Add(new billing_InterDebtorTransferDetail
                    {
                        Amount = tran.TransferAmount,
                        LinkedTransactionId = tran.TransactionId
                    });
                }

                _interDebtorTransferRepository.Create(entity);

                await scope.SaveChangesAsync();

                interDebtorTransfer.InterDebtorTransferId = entity.InterDebtorTransferId;
            }

            await CompleteTransferToDebtor(interDebtorTransfer);

            return interDebtorTransfer;
        }

        private async Task<bool> CompleteTransferToDebtor(InterDebtorTransfer interDebtorTransfer)
        {
            if (interDebtorTransfer == null) return false;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var fromDebtor = await _rolePlayerService.GetFinPayeeByFinpayeNumber(interDebtorTransfer.FromDebtorNumber);
                var toDebtor = await _rolePlayerService.GetFinPayeeByFinpayeNumber(interDebtorTransfer.ReceiverDebtorNumber);
                var fromDebtorIndustry = await _industryService.GetIndustry(fromDebtor.IndustryId);
                var toDebtorIndustry = await _industryService.GetIndustry(toDebtor.IndustryId);

                interDebtorTransfer.ReceiverRolePlayerId = toDebtor.RolePlayerId;
                interDebtorTransfer.ReceiverHasInvoicesOutstanding = await _paymentAllocationService.DoesDebtorHaveOutstandingInvoices(interDebtorTransfer.ReceiverRolePlayerId);

                var receiverBank = await _rmaBankAccountRepository
                    .Where(b => b.AccountNumber == interDebtorTransfer.ReceiverAccountNumber).FirstOrDefaultAsync();
                var fromBank = await _rmaBankAccountRepository
                    .Where(b => b.AccountNumber == interDebtorTransfer.FromAccountNumber).FirstOrDefaultAsync();

                if (receiverBank == null)
                {
                    throw new BusinessException("Could not find the receiver bank entry for account number: " +
                                                interDebtorTransfer.ReceiverAccountNumber);
                }

                if (fromBank == null)
                {
                    throw new BusinessException("Could not find bank entry for account number: " +
                                                interDebtorTransfer.FromAccountNumber);
                }
                if (receiverBank.AccountNumber != fromBank.AccountNumber)
                {
                    throw new BusinessException(
                        "The receiver and from debtors have different industry classes, but the bank account numbers for the classes are not identical. Cannot initiate InterDebtor transfer.");
                }

                var periodId = 0;
                var transactionDate = DateTime.Now.ToSaDateTime();
                var latestPeriod = await _periodService.GetLatestPeriod();

                if (latestPeriod != null)
                {
                    periodId = latestPeriod.Id;
                }
                else
                {
                    periodId = await GetPeriodId(PeriodStatusEnum.Current);
                }
                var postingDate = DateTime.Now.ToSaDateTime();
                var bouncedReversals = new List<Transaction>();

                bouncedReversals.AddRange(interDebtorTransfer.Transactions.Where(c => c.TransactionTypeLinkId == (int)TransactionActionType.Debit));
                if (bouncedReversals.Count > 0)
                    await _paymentAllocationService.DoBouncedReallocation(bouncedReversals, toDebtor.RolePlayerId, toDebtor.FinPayeNumber, fromDebtor.FinPayeNumber);

                foreach (var transaction in interDebtorTransfer.Transactions.Where(c => c.TransactionTypeLinkId == (int)TransactionActionType.Credit && c.Amount > 0))
                {
                    if (string.IsNullOrEmpty(transaction.BankReference))
                    {
                        transaction.BankReference = transaction.RmaReference;
                    }
                    if (transaction.InvoiceId.HasValue && transaction.InvoiceId == 0)
                        transaction.InvoiceId = null;

                    var newTransaction = new billing_Transaction
                    {
                        Amount = transaction.TransferAmount,
                        BankReference = interDebtorTransfer.FromAccountNumber,
                        InvoiceId = null,
                        TransactionDate = postingDate,
                        TransactionType = TransactionTypeEnum.InterDebtorTransfer,
                        TransactionTypeLinkId = (int)TransactionActionType.Debit,
                        BankStatementEntryId = null,
                        RolePlayerId = fromDebtor.RolePlayerId,
                        LinkedTransactionId = transaction.TransactionId,
                        RmaReference = await GenerateRmaReference(),
                        PeriodId = periodId
                    };

                    await AllocateDebitTransaction(Mapper.Map<Transaction>(newTransaction), fromDebtor.RolePlayerId, transaction.TransferAmount, transaction.TransactionId);

                    var text = $"Inter debtor transfer from {fromDebtor.FinPayeNumber} to {toDebtor.FinPayeNumber} for amount of {transaction.TransferAmount}";

                    var note = new BillingNote
                    {
                        ItemId = toDebtor.RolePlayerId,
                        ItemType = BillingNoteTypeEnum.InterDebtorTransfer.GetDescription().SplitCamelCaseText(),
                        Text = text
                    };
                    await _billingService.AddBillingNote(note);

                    var newCreditTransaction = new billing_Transaction
                    {
                        Amount = transaction.TransferAmount,
                        BankReference = interDebtorTransfer.FromAccountNumber,
                        InvoiceId = null,
                        TransactionDate = postingDate,
                        TransactionType = TransactionTypeEnum.InterDebtorTransfer,
                        TransactionTypeLinkId = (int)TransactionActionType.Credit,
                        BankStatementEntryId = null,
                        RolePlayerId = toDebtor.RolePlayerId,
                        LinkedTransactionId = transaction.TransactionId,
                        RmaReference = await GenerateRmaReference(),
                        PeriodId = periodId
                    };
                    await AllocateCreditTransaction(Mapper.Map<Transaction>(newCreditTransaction), toDebtor.RolePlayerId, transaction.TransferAmount, transaction.InvoiceId, null);

                    var textTo = $"Inter debtor transfer to {toDebtor.FinPayeNumber} from {fromDebtor.FinPayeNumber} for amount of {transaction.TransferAmount}";

                    var noteTo = new BillingNote
                    {
                        ItemId = fromDebtor.RolePlayerId,
                        ItemType = BillingNoteTypeEnum.InterDebtorTransfer.GetDescription().SplitCamelCaseText(),
                        Text = text
                    };
                    await _billingService.AddBillingNote(noteTo);
                }
                await scope.SaveChangesAsync();
            }
            return true;
        }

        public async Task MarkTransferAsAllocated(int interDebtorTransferId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var interDebtorTransfer =
                    await _interDebtorTransferRepository.SingleAsync(x =>
                        x.InterDebtorTransferId == interDebtorTransferId);
                if (interDebtorTransfer.AllocationProgressStatus != AllocationProgressStatusEnum.Allocated)
                {
                    interDebtorTransfer.AllocationProgressStatus = AllocationProgressStatusEnum.Allocated;
                    _interDebtorTransferRepository.Update(interDebtorTransfer);
                    await scope.SaveChangesAsync();
                }
            }
        }

        public async Task<bool> CheckDebtorsHaveIdenticalIndustryClass(string fromDebtorNumber, string toDebtorNumber)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var fromDebtor =
                    await _rolePlayerService.GetFinPayeeByFinpayeNumber(fromDebtorNumber);
                var toDebtor =
                    await _rolePlayerService.GetFinPayeeByFinpayeNumber(toDebtorNumber);

                if (fromDebtor == null || toDebtor == null) return false;



                Industry fromDebtorIndustry = null;
                Industry toDebtorIndustry = null;

                try
                {

                    fromDebtorIndustry = await _industryService.GetIndustry(fromDebtor.IndustryId);
                    toDebtorIndustry = await _industryService.GetIndustry(toDebtor.IndustryId);


                }
                catch (Exception)
                {
                    return false;
                }

                return fromDebtorIndustry.IndustryClass == toDebtorIndustry.IndustryClass;
            }
        }
        public async Task<bool> CheckDebtorsHaveIdenticalBankAccounts(string fromDebtorNumber, string toDebtorNumber)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {

                var fromDebtor = await _rolePlayerService.GetFinPayeeByFinpayeNumber(fromDebtorNumber);
                var toDebtor = await _rolePlayerService.GetFinPayeeByFinpayeNumber(toDebtorNumber);

                var debtorPolicies = await _rolePlayerPolicyService.GetPoliciesByPolicyOwnerIdNoRefData(fromDebtor.RolePlayerId);
                var fromDebtorIndustry = await _industryService.GetIndustry(fromDebtor.IndustryId);
                var toDebtorIndustry = await _industryService.GetIndustry(toDebtor.IndustryId);

                if (debtorPolicies.Count == 0)
                {
                    throw new BusinessException("From debtor does not have any policies");
                }

                ProductBankAccount toProductBankAccount = null;
                ProductBankAccount fromProductBankAccount = null;

                foreach (var policy in debtorPolicies)
                {
                    var product = await _productOptionService.GetProductByProductOptionId(policy.ProductOptionId);
                    toProductBankAccount = product.ProductBankAccounts.Find(p => p.IndustryClass == toDebtorIndustry.IndustryClass);
                    fromProductBankAccount = product.ProductBankAccounts.Find(p => p.IndustryClass == fromDebtorIndustry.IndustryClass);
                    if (fromProductBankAccount != null && toProductBankAccount != null)
                    {
                        break;
                    }
                }

                if (toProductBankAccount == null || fromProductBankAccount == null)
                {
                    throw new BusinessException("Could not find bank account for debtor industry class");
                }

                var tobankAccount = await _bankAccountService.GetBankAccountByAccountNumber(toProductBankAccount.BankAccountId);
                var frombankAccount = await _bankAccountService.GetBankAccountByAccountNumber(toProductBankAccount.BankAccountId);

                if (tobankAccount == null || frombankAccount == null)
                {
                    throw new BusinessException("Could not find bank account for debtor industry class");
                }
                return tobankAccount == frombankAccount;
            }
        }

        public async Task<List<InterDebtorTransfer>> GetDebtorInterDebtorTransfers(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewTransfer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var debtor = await _rolePlayerService.GetFinPayee(rolePlayerId);
                var entities = await _interDebtorTransferRepository.Where(c => c.FromDebtorNumber == debtor.FinPayeNumber).ToListAsync();
                foreach (var entity in entities)
                {
                    await _interDebtorTransferRepository.LoadAsync(entity, i => i.InterDebtorTransferDetails);
                }
                return Mapper.Map<List<InterDebtorTransfer>>(entities);
            }
        }

        public async Task<DateTime> DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum periodStatus)
        {
            var currentPeriod = await _periodService.GetCurrentPeriod();
            var latestPeriod = await _periodService.GetLatestPeriod();

            var now = DateTimeHelper.SaNow;

            switch (periodStatus)
            {
                case PeriodStatusEnum.Current:
                    if (currentPeriod == null) return now;
                    if (now < currentPeriod.EndDate) return now;
                    return currentPeriod.EndDate;
                case PeriodStatusEnum.Latest:
                    if (latestPeriod == null) return now;
                    if (now < latestPeriod.EndDate) return now;
                    return latestPeriod.EndDate;
                default:
                    return now;
            }
        }

        public async Task AllocateDebitTransaction(Transaction debitTransaction, int rolePlayerId, decimal amountToAllocate, int? linkedTransactionId)
        {
            if (debitTransaction == null)
            {
                throw new BusinessException("AllocateDebitTransaction Error: debitTransaction is null or empty");
            }

            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddPayments);

            if (amountToAllocate <= 0)
            {
                throw new TechnicalException(
                    $"AllocateDebitTransaction Error: Debit allocation for debtor with id: {rolePlayerId} failed. Amount must be greater than zero");
            }

            var commissionAllocations = new List<CommissionInvoicePaymentAllocation>();

            using (var scope = _dbContextScopeFactory.Create())
            {
                var transactionEntity = Mapper.Map<billing_Transaction>(debitTransaction);
                transactionEntity.LinkedTransactionId = linkedTransactionId;
                transactionEntity.RolePlayerId = rolePlayerId;
                transactionEntity.Amount = amountToAllocate;
                transactionEntity.InvoiceId = null;
                transactionEntity.Balance = debitTransaction.Balance;

                var linkedTransactionEntity = await _transactionRepository.Where(t => t.TransactionId == linkedTransactionId).SingleOrDefaultAsync();
                if (amountToAllocate == linkedTransactionEntity?.Amount)
                {
                    await _transactionRepository.LoadAsync(linkedTransactionEntity, t => t.InvoiceAllocations_TransactionId);
                    foreach (var invoiceAllocation in linkedTransactionEntity.InvoiceAllocations_TransactionId)
                    {
                        if (invoiceAllocation.InvoiceId.HasValue)
                        {
                            var invoiceEntity = await _invoiceRepository
                                .Where(i => i.InvoiceId == invoiceAllocation.InvoiceId).SingleAsync();

                            invoiceEntity.InvoiceStatus = InvoiceStatusEnum.Unpaid;

                            await _invoiceRepository.LoadAsync(invoiceEntity, i => i.Policy);

                            if (invoiceEntity.Policy.CommissionPercentage > 0 || invoiceEntity.Policy.AdminPercentage > 0)
                            {
                                var commision = new CommissionInvoicePaymentAllocation()
                                {
                                    InvoiceId = invoiceEntity.InvoiceId,
                                    Amount = decimal.Negate(amountToAllocate),
                                    TransactionDate = DateTimeHelper.SaNow,
                                    TransactionTypeLinkId = (int)TransactionActionType.Debit,
                                    IsProcessed = false
                                };
                                commissionAllocations.Add(commision);
                            }

                            _invoiceRepository.Update(invoiceEntity);
                        }
                    }

                    _transactionRepository.Update(linkedTransactionEntity);
                }

                _transactionRepository.Create(transactionEntity);

                if (commissionAllocations.Count > 0)
                {
                    await _commissionService.AddCommissions(commissionAllocations);
                }

                await scope.SaveChangesAsync();
            }
        }

        public async Task AllocateCreditTransaction(Transaction creditTransaction,
            int rolePlayerId, decimal amountToAllocate, int? invoiceId, int? claimRecoveryInvoiceId)
        {
            Contract.Requires(creditTransaction != null);
            if (amountToAllocate <= 0)
            {
                throw new TechnicalException(
                    $"AllocateCreditTransaction Error: Credit allocation for debtor with id: {rolePlayerId} failed. Amount must be greater than zero");
            }

            if (!invoiceId.HasValue && !claimRecoveryInvoiceId.HasValue)
            {
                await AllocateCreditTransactionToDebtor(creditTransaction, rolePlayerId, amountToAllocate);
            }
            else
            {
                if (invoiceId.HasValue)
                {
                    await AllocateCreditTransactionToInvoice(creditTransaction, amountToAllocate,
                        invoiceId.Value);
                }
                else if (claimRecoveryInvoiceId.HasValue)
                {
                    await AllocateCreditTransactionToInvoice(creditTransaction, amountToAllocate,
                        null, claimRecoveryInvoiceId.Value);
                }
            }
        }
        private async Task AllocateCreditTransactionToDebtor(Transaction transaction, int rolePlayerId, decimal amountToAllocate)
        {
            var commissionAllocations = new List<CommissionInvoicePaymentAllocation>();

            using (var scope = _dbContextScopeFactory.Create())
            {
                transaction.RolePlayerId = rolePlayerId;
                transaction.Amount = amountToAllocate;
                var transactionEntity = Mapper.Map<billing_Transaction>(transaction);
                transactionEntity.InvoiceId = null;
                transactionEntity.ClaimRecoveryInvoiceId = null;

                if (transactionEntity.TransactionType != TransactionTypeEnum.ClaimRecoveryPayment)
                {
                    var unsettledInvoices =
                        await _invoiceService.GetUnsettledInvoices(rolePlayerId, null);

                    if (unsettledInvoices.Count == 1)
                    {
                        var allocationAmount = amountToAllocate < unsettledInvoices[0].Balance
                            ? amountToAllocate
                            : unsettledInvoices[0].Balance;

                        transactionEntity.InvoiceAllocations_TransactionId.Add(new billing_InvoiceAllocation
                        {
                            InvoiceId = unsettledInvoices[0].InvoiceId,
                            Amount = allocationAmount,
                            BillingAllocationType = BillingAllocationTypeEnum.InvoiceAllocation,
                            TransactionTypeLinkId = (int)TransactionActionType.Credit
                        });

                        var invoiceEntity = Mapper.Map<billing_Invoice>(unsettledInvoices[0]);

                        invoiceEntity.InvoiceStatus = transaction.Amount < unsettledInvoices[0].Balance ? InvoiceStatusEnum.Partially : InvoiceStatusEnum.Paid;

                        await _invoiceRepository.LoadAsync(invoiceEntity, i => i.Policy);

                        if (invoiceEntity.InvoiceStatus == InvoiceStatusEnum.Paid || invoiceEntity.InvoiceStatus == InvoiceStatusEnum.Partially)
                        {
                            if (invoiceEntity.Policy.CommissionPercentage > 0 || invoiceEntity.Policy.AdminPercentage > 0)
                            {
                                var commision = new CommissionInvoicePaymentAllocation()
                                {
                                    InvoiceId = invoiceEntity.InvoiceId,
                                    Amount = allocationAmount,
                                    TransactionDate = DateTimeHelper.SaNow,
                                    TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                    IsProcessed = false
                                };
                                commissionAllocations.Add(commision);
                            }
                        }
                        if (invoiceEntity.InvoiceStatus == InvoiceStatusEnum.Paid)
                        {
                            switch (invoiceEntity.Policy.PolicyStatus)
                            {
                                case PolicyStatusEnum.PendingFirstPremium:
                                    invoiceEntity.Policy.PolicyStatus = PolicyStatusEnum.Active;
                                    break;
                            }
                        }

                        _invoiceRepository.Update(invoiceEntity);
                    }
                }
                else
                {
                    var unsettledInvoices =
                        await _claimRecoveryInvoiceService.GetUnsettledInvoices(rolePlayerId);

                    if (unsettledInvoices.Count == 1)
                    {
                        var allocationAmount = amountToAllocate < unsettledInvoices[0].Balance
                            ? amountToAllocate
                            : unsettledInvoices[0].Balance;

                        transactionEntity.InvoiceAllocations_TransactionId.Add(new billing_InvoiceAllocation
                        {
                            ClaimRecoveryId = unsettledInvoices[0].ClaimRecoveryInvoiceId,
                            Amount = allocationAmount,
                            BillingAllocationType = BillingAllocationTypeEnum.ClaimRecovery
                        });


                        var invoiceEntity = Mapper.Map<billing_ClaimRecoveryInvoice>(unsettledInvoices[0]);

                        invoiceEntity.InvoiceStatus = transaction.Amount < unsettledInvoices[0].Balance
                            ? InvoiceStatusEnum.Partially
                            : InvoiceStatusEnum.Paid;

                        _claimRecoveryInvoiceRepository.Update(invoiceEntity);
                    }
                }

                _transactionRepository.Create(transactionEntity);

                if (commissionAllocations.Count > 0)
                {
                    try
                    {
                        await _commissionService.AddCommissions(commissionAllocations);
                    }
                    catch (Exception ex)
                    {
                        ex.LogException();
                    }
                }

                await scope.SaveChangesAsync();
            }
        }

        public async Task AllocateCreditTransactionToInvoice(Transaction transaction, decimal amountToAllocate, int? invoiceId, int? claimRecoveryInvoiceId = null)
        {
            Contract.Requires(transaction != null);
            var commissionAllocations = new List<CommissionInvoicePaymentAllocation>();

            using (var scope = _dbContextScopeFactory.Create())
            {
                if (!claimRecoveryInvoiceId.HasValue)
                {
                    if (!invoiceId.HasValue)
                    {
                        return;
                    }

                    var invoice = await _invoiceService.GetInvoice(Convert.ToInt32(invoiceId));
                    if (invoice.Balance <= 0)
                    {
                        return;
                    }

                    billing_Transaction transactionEntity;
                    if (transaction.TransactionId > 0)
                    {
                        var transactionBalance = await GetTransactionBalance(transaction.TransactionId);
                        transactionBalance = Math.Abs(transactionBalance);

                        if (transactionBalance < amountToAllocate)
                        {
                            return;
                        }

                        transactionEntity = await _transactionRepository
                            .Where(t => t.TransactionId == transaction.TransactionId).SingleAsync();
                        await _transactionRepository.LoadAsync(transactionEntity, t => t.InvoiceAllocations_TransactionId);
                    }
                    else
                    {
                        transactionEntity = Mapper.Map<billing_Transaction>(transaction);
                    }

                    transactionEntity.InvoiceId = null;
                    transactionEntity.ClaimRecoveryInvoiceId = null;

                    var allocationAmount = amountToAllocate < invoice.Balance
                        ? amountToAllocate
                        : invoice.Balance;

                    transactionEntity.InvoiceAllocations_TransactionId.Add(new billing_InvoiceAllocation
                    {
                        InvoiceId = invoice.InvoiceId,
                        Amount = allocationAmount,
                        BillingAllocationType = BillingAllocationTypeEnum.InvoiceAllocation,
                        TransactionTypeLinkId = (int)TransactionActionType.Credit
                    });


                    var invoiceEntity = Mapper.Map<billing_Invoice>(invoice);

                    invoiceEntity.InvoiceStatus = allocationAmount < invoice.Balance ? InvoiceStatusEnum.Partially : InvoiceStatusEnum.Paid;
                    if (invoiceEntity.InvoiceStatus == InvoiceStatusEnum.Paid || invoiceEntity.InvoiceStatus == InvoiceStatusEnum.Partially)
                    {
                        await _invoiceRepository.LoadAsync(invoiceEntity, x => x.Policy);
                        if (invoiceEntity.Policy?.CommissionPercentage > 0 || invoiceEntity.Policy?.AdminPercentage > 0)
                        {
                            var commision = new CommissionInvoicePaymentAllocation()
                            {
                                InvoiceId = invoiceEntity.InvoiceId,
                                Amount = allocationAmount,
                                TransactionDate = DateTimeHelper.SaNow,
                                TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                IsProcessed = false
                            };
                            commissionAllocations.Add(commision);
                        }
                    }

                    if (invoiceEntity.InvoiceStatus == InvoiceStatusEnum.Paid)
                    {
                        await _invoiceRepository.LoadAsync(invoiceEntity, i => i.Policy);

                        switch (invoiceEntity.Policy.PolicyStatus)
                        {
                            case PolicyStatusEnum.PendingFirstPremium:
                                invoiceEntity.Policy.PolicyStatus = PolicyStatusEnum.Active;
                                break;
                        }
                    }

                    _invoiceRepository.Update(invoiceEntity);

                    if (transaction.TransactionId > 0)
                    {
                        _transactionRepository.Update(transactionEntity);
                    }
                    else
                    {
                        _transactionRepository.Create(transactionEntity);
                    }

                    if (commissionAllocations.Count > 0)
                    {
                        try
                        {
                            await _commissionService.AddCommissions(commissionAllocations);
                        }
                        catch (Exception ex)
                        {
                            ex.LogException();
                        }
                    }
                }
                else
                {
                    var invoice = await _claimRecoveryInvoiceService.GetInvoice(claimRecoveryInvoiceId.Value);
                    if (invoice.Balance <= 0)
                    {
                        return;
                    }

                    billing_Transaction transactionEntity;
                    if (transaction.TransactionId > 0)
                    {
                        var transactionBalance = await GetTransactionBalance(transaction.TransactionId);
                        transactionBalance = Math.Abs(transactionBalance);

                        if (transactionBalance < amountToAllocate)
                        {
                            return;
                        }

                        transactionEntity = await _transactionRepository
                            .Where(t => t.TransactionId == transaction.TransactionId).SingleAsync();
                        await _transactionRepository.LoadAsync(transactionEntity, t => t.InvoiceAllocations_TransactionId);
                    }
                    else
                    {
                        transactionEntity = Mapper.Map<billing_Transaction>(transaction);
                    }

                    transactionEntity.InvoiceId = null;
                    transactionEntity.ClaimRecoveryInvoiceId = null;

                    var allocationAmount = amountToAllocate < invoice.Balance
                        ? amountToAllocate
                        : invoice.Balance;

                    transactionEntity.InvoiceAllocations_TransactionId.Add(new billing_InvoiceAllocation
                    {
                        ClaimRecoveryId = invoice.ClaimRecoveryInvoiceId,
                        Amount = allocationAmount,
                        BillingAllocationType = BillingAllocationTypeEnum.ClaimRecovery
                    });

                    if (transaction.TransactionId > 0)
                    {
                        _transactionRepository.Update(transactionEntity);
                    }
                    else
                    {
                        _transactionRepository.Create(transactionEntity);
                    }

                    var invoiceEntity = Mapper.Map<billing_ClaimRecoveryInvoice>(invoice);

                    invoiceEntity.InvoiceStatus = allocationAmount < invoice.Balance
                        ? InvoiceStatusEnum.Partially
                        : InvoiceStatusEnum.Paid;

                    _claimRecoveryInvoiceRepository.Update(invoiceEntity);
                }

                await scope.SaveChangesAsync();
            }
        }

        public async Task<decimal> GetTransactionBalance(int transactionId)
        {
            var balance = 0.00m;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var transaction = await _transactionRepository.Where(t => t.TransactionId == transactionId).SingleAsync();

                await _transactionRepository.LoadAsync(transaction, t => t.InvoiceAllocations_TransactionId);

                if (transaction.TransactionType == TransactionTypeEnum.Invoice)
                {
                    var reversalTransaction = await _transactionRepository
                        .Where(t => t.LinkedTransactionId == transaction.TransactionId).FirstOrDefaultAsync();
                    if (reversalTransaction != null &&
                        (reversalTransaction.TransactionType == TransactionTypeEnum.InvoiceReversal))
                    {
                        return 0;
                    }

                    var invoiceAllocations = await _invoiceAllocationRepository
                        .Where(i => i.InvoiceId == transaction.InvoiceId).ToListAsync();
                    foreach (var allocation in invoiceAllocations)
                    {
                        var debitTransactions = await _transactionRepository
                            .Where(t => t.LinkedTransactionId == allocation.TransactionId).ToListAsync();
                        foreach (var debitTran in debitTransactions)
                        {
                            if (debitTran.TransactionType != TransactionTypeEnum.DebitReallocation && debitTran.TransactionType != TransactionTypeEnum.Refund && debitTran.TransactionType != TransactionTypeEnum.InterDebtorTransfer)
                            {
                                var creditTransaction = await _transactionRepository.SingleAsync(t => t.TransactionId == allocation.TransactionId);
                                if (creditTransaction.Amount == debitTran.Amount)
                                {
                                    allocation.Amount -= debitTran.Amount;
                                }
                            }
                        }
                    }

                    balance = transaction.Amount;

                    if (invoiceAllocations.Count > 0)
                    {
                        balance -= invoiceAllocations.Sum(i => i.Amount);
                    }

                    if (balance < 0)
                    {
                        balance = 0;
                    }

                    if (balance > transaction.Amount)
                    {
                        balance = transaction.Amount;
                    }

                    return balance;
                }
                else if (transaction.TransactionType == TransactionTypeEnum.ClaimRecoveryInvoice)
                {
                    var invoiceAllocations = await _invoiceAllocationRepository
                        .Where(i => i.ClaimRecoveryId == transaction.ClaimRecoveryInvoiceId).ToListAsync();
                    foreach (var allocation in invoiceAllocations)
                    {
                        var debitTransactions = await _transactionRepository
                            .Where(t => t.LinkedTransactionId == allocation.TransactionId).ToListAsync();
                        foreach (var debitTran in debitTransactions)
                        {
                            allocation.Amount -= debitTran.Amount;
                        }
                    }

                    balance = transaction.Amount;

                    if (invoiceAllocations.Count > 0)
                    {
                        balance -= invoiceAllocations.Sum(i => i.Amount);
                    }

                    if (balance < 0)
                    {
                        balance = 0;
                    }

                    if (balance > transaction.Amount)
                    {
                        balance = transaction.Amount;
                    }

                    return balance;
                }

                if (transaction.TransactionTypeLinkId == (int)TransactionActionType.Credit)
                {
                    balance = transaction.Amount - transaction.InvoiceAllocations_TransactionId.Sum(i => i.Amount);
                    var debitAllocations = await _debitAllocationRepository.Where(d => d.CreditTransactionId == transaction.TransactionId).ToListAsync();
                    balance -= debitAllocations.Sum(i => i.Amount);
                    balance = decimal.Negate(balance);

                    List<billing_Transaction> debitTransactionsForCreditTransaction;

                    switch (transaction.TransactionType)
                    {
                        case TransactionTypeEnum.Payment:
                            debitTransactionsForCreditTransaction = await _transactionRepository.Where(t =>
                                    t.LinkedTransactionId == transaction.TransactionId)
                                .ToListAsync();
                            if (debitTransactionsForCreditTransaction.Count > 0)
                            {
                                foreach (var debitTransaction in debitTransactionsForCreditTransaction)
                                {
                                    balance += debitTransaction.Amount;
                                }
                            }

                            if (balance > 0)
                            {
                                balance = 0;
                            }

                            return balance;
                        case TransactionTypeEnum.CreditNote:
                            debitTransactionsForCreditTransaction = await _transactionRepository.Where(t =>
                                    t.LinkedTransactionId == transaction.TransactionId)
                                .ToListAsync();
                            if (debitTransactionsForCreditTransaction.Count > 0)
                            {
                                foreach (var debitTransaction in debitTransactionsForCreditTransaction)
                                {
                                    balance += debitTransaction.Amount;
                                }
                            }

                            if (balance > 0)
                            {
                                balance = 0;
                            }

                            return balance;
                        case TransactionTypeEnum.CreditReallocation:
                            debitTransactionsForCreditTransaction = await _transactionRepository.Where(t =>
                                    t.LinkedTransactionId == transaction.TransactionId)
                                .ToListAsync();
                            if (debitTransactionsForCreditTransaction.Count > 0)
                            {
                                foreach (var debitTransaction in debitTransactionsForCreditTransaction)
                                {
                                    balance += debitTransaction.Amount;
                                }
                            }

                            if (balance > 0)
                            {
                                balance = 0;
                            }

                            return balance;
                        case TransactionTypeEnum.ClaimRecoveryPayment:
                            debitTransactionsForCreditTransaction = await _transactionRepository.Where(t =>
                                    t.LinkedTransactionId == transaction.TransactionId &&
                                    (t.TransactionType == TransactionTypeEnum.ClaimRecoveryPaymentReversal))
                                .ToListAsync();
                            if (debitTransactionsForCreditTransaction.Count > 0)
                            {
                                foreach (var debitTransaction in debitTransactionsForCreditTransaction)
                                {
                                    balance += debitTransaction.Amount;
                                }
                            }

                            if (balance > 0)
                            {
                                balance = 0;
                            }

                            return balance;
                        case TransactionTypeEnum.InvoiceReversal:
                            balance = 0;
                            return balance;
                    }
                }
                else if (transaction.TransactionTypeLinkId == (int)TransactionActionType.Debit && transaction.TransactionType != TransactionTypeEnum.Invoice)
                {
                    balance = transaction.Amount;

                    switch (transaction.TransactionType)
                    {
                        case TransactionTypeEnum.Interest:
                            var debitAllocations = await _debitAllocationRepository.Where(t =>
                                                           t.DebitTransactionId == transaction.TransactionId)
                                                         .ToListAsync();
                            if (debitAllocations.Count > 0)
                            {
                                foreach (var allocation in debitAllocations)
                                {
                                    balance -= allocation.Amount;
                                }
                                if (balance < 0)
                                {
                                    balance = 0;
                                }
                            }
                            return balance;
                        default:
                            balance = transaction.LinkedTransactionId != null ? ((transaction.TransactionType == TransactionTypeEnum.DebitReallocation
                        || transaction.TransactionType == TransactionTypeEnum.InterDebtorTransfer) ? transaction.Balance ?? 0 : 0)
                        : (transaction.TransactionType == TransactionTypeEnum.DebitNote || transaction.TransactionType == TransactionTypeEnum.PaymentReversal) ? transaction.Amount : 0;
                            return balance;
                    }
                }

                return balance;
            }
        }
        private async Task<string> GenerateRmaReference()
        {
            var transactionPrev = await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);
            return $"{BillingIdt}{DateTime.Now.ToString("yyyyMMdd")}0{transactionPrev}";
        }

        private async Task<int> GetPeriodId(PeriodStatusEnum periodStatus)
        {
            var currentPeriod = new Period();
            switch (periodStatus)
            {
                case PeriodStatusEnum.Current:
                    currentPeriod = await _periodService.GetCurrentPeriod();
                    return currentPeriod.Id;
                case PeriodStatusEnum.Latest:
                    var latestPeriod = await _periodService.GetLatestPeriod();
                    return latestPeriod.Id;
                default:
                    currentPeriod = await _periodService.GetCurrentPeriod();
                    return currentPeriod.Id;
            }
        }

    }
}

