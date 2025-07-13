using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Constants;
using RMA.Service.Billing.Database.Entities;

using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Fabric;
using System.Linq;
using System.Linq.Dynamic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Services
{
    public class PaymentAllocationLookupFacade : RemotingStatelessService, IPaymentAllocationLookupService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<billing_AllocationLookup> _paymentAllocationLookupRepository;
        private readonly IRepository<finance_BankStatementEntry> _facsStatementRepository;
        private readonly ICollectionService _collectionService;
        private readonly ITransactionService _transactionService;
        private readonly IPaymentAllocationService _paymentAllocationService;

        public PaymentAllocationLookupFacade(StatelessServiceContext context,
            IRepository<billing_AllocationLookup> allocationLookupRepository,
            IRepository<finance_BankStatementEntry> facsStatementRepository,
            IDbContextScopeFactory dbContextScopeFactory,
            ICollectionService collectionService,
            ITransactionService transactionService,
            IPaymentAllocationService bankStatementEntryService) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _paymentAllocationLookupRepository = allocationLookupRepository;
            _facsStatementRepository = facsStatementRepository;
            _collectionService = collectionService;
            _transactionService = transactionService;
            _paymentAllocationService = bankStatementEntryService;
        }

        public async Task<bool> CreateAllocationLookups(List<PaymentAllocationLookup> paymentAllocationLookups)
        {
            if (paymentAllocationLookups == null || paymentAllocationLookups.Count == 0
                || paymentAllocationLookups.All(x => string.IsNullOrWhiteSpace(x.UserReference)))
            {
                return false;
            }

            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    foreach (var allocationLookupEntity in Mapper.Map<List<billing_AllocationLookup>>(paymentAllocationLookups))
                    {
                        if (allocationLookupEntity != null && !string.IsNullOrWhiteSpace(allocationLookupEntity.UserReference))
                        {
                            _paymentAllocationLookupRepository.Create(allocationLookupEntity);
                        }
                    }

                    await scope.SaveChangesAsync();
                }
            }
            catch(Exception ex)
            {
                if(ex.InnerException?.Message != null && ex.InnerException.Message.IndexOf("Violation of UNIQUE KEY", StringComparison.OrdinalIgnoreCase) >= 0)
                {
                    throw new Exception("User Reference already allocated to a debtor.");
                }

                return false;
            }

            await AllocatePaymentsFromReferenceLookups();

            return true;
        }

        public async Task AllocatePaymentsFromReferenceLookups()
        {
            const string systemUser = "AllocationLookupService";

            var allocationLookups = await GetUnprocessedAllocationLookups();
            var allocationLookupIdListToUpdate = new List<int>();

            using (var scope = _dbContextScopeFactory.Create())
            {
                foreach (var allocationLookup in allocationLookups)
                {
                    if (string.IsNullOrWhiteSpace(allocationLookup.UserReference)
                        || string.IsNullOrWhiteSpace(allocationLookup.DebtorNumber))
                    {
                        continue;
                    }

                    var documentTypes = new string[] { "PT" };

                    var bankStatementEntries = await _facsStatementRepository
                        .Where(MatchBankStatements(allocationLookup, documentTypes))
                        .ToListAsync();

                    if (!allocationLookupIdListToUpdate.Any(x => x == allocationLookup.Id))
                    {
                        allocationLookupIdListToUpdate.Add(allocationLookup.Id);
                    }

                    foreach (var bankStatementEntry in bankStatementEntries)
                    {
                        var unallocatedPayment = await _paymentAllocationService.GetUnallocatedPaymentsByBankStatementEntry(bankStatementEntry.BankStatementEntryId);

                        if (unallocatedPayment == null || unallocatedPayment.Count == 0)
                        {
                            continue;
                        }

                        var transactionType = TransactionTypeEnum.Payment;
                        var transactionTypeLink = 2;

                        if (bankStatementEntry.NettAmount < 0)
                        {
                            transactionType = TransactionTypeEnum.PaymentReversal;
                            transactionTypeLink = 1;
                        }

                        var bankStatementDate = bankStatementEntry.StatementDate.HasValue ? bankStatementEntry.StatementDate.Value.ToString("dd/MM/yyyy") : "";

                        var transaction = new Contracts.Entities.Transaction()
                        {
                            PeriodId = (int)PeriodStatusEnum.Current,
                            Amount = (decimal)bankStatementEntry.NettAmount / 100,
                            BankStatementEntryId = bankStatementEntry.BankStatementEntryId,
                            TransactionTypeLinkId = transactionTypeLink,
                            InvoiceId = null,
                            RolePlayerId = allocationLookup.RolePlayerId,
                            RmaReference = $"{bankStatementEntry.StatementNumber}/{bankStatementEntry.StatementLineNumber} {bankStatementDate}",
                            TransactionType = transactionType,
                            TransactionDate = DateTimeHelper.SaNow,
                            CreatedBy = systemUser,
                            ModifiedBy = systemUser
                        };

                        var transactionAddResult = await _transactionService.AddTransaction(transaction);

                        if (transactionAddResult > 0)
                        {
                            await _paymentAllocationService.ReduceUnallocatedBalance(bankStatementEntry.BankStatementEntryId, transaction.Amount);
                        }
                    }
                }

                var sqlParameter = new SqlParameter() { ParameterName = "AllocationLookupIdList", Value = string.Join(",", allocationLookupIdListToUpdate) };
                await _paymentAllocationLookupRepository.ExecuteSqlCommandAsync(DatabaseConstants.UpdateAllocationLookups, sqlParameter);

                var result = await scope.SaveChangesAsync();
            }
        }

        private static Expression<Func<finance_BankStatementEntry, bool>> MatchBankStatements(PaymentAllocationLookup paymentAllocationLookup, string[] documentTypes)
        {
            var reference = paymentAllocationLookup.UserReference;
            return bse => ((bse.UserReference2.Equals(reference, StringComparison.OrdinalIgnoreCase) || bse.Code2.Equals(reference, StringComparison.OrdinalIgnoreCase))
                            && bse.RecordId == "91" && !documentTypes.Any(x => x.Equals(bse.DocumentType, StringComparison.OrdinalIgnoreCase)))
                        || 
                            (bse.UserReference.Equals(reference, StringComparison.OrdinalIgnoreCase) 
                            && bse.RecordId == "91" && !documentTypes.Any(x => x.Equals(bse.DocumentType, StringComparison.OrdinalIgnoreCase)));
        }

        private async Task<List<PaymentAllocationLookup>> GetUnprocessedAllocationLookups()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var paymentAllocationLookups = await _paymentAllocationLookupRepository
                    .SqlQueryAsync<PaymentAllocationLookup>(DatabaseConstants.GetUnprocessedAllocationLookups);

                if (paymentAllocationLookups == null)
                {
                    return new List<PaymentAllocationLookup>();
                }

                return paymentAllocationLookups;
            }
        }

        public async Task<PaymentAllocationLookup> GetAllocationLookup(int paymentAllocationLookupId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var paymentAllocationLookup = await _paymentAllocationLookupRepository
                    .SingleAsync(x => x.Id == paymentAllocationLookupId);

                if (paymentAllocationLookup == null) return null;

                return Mapper.Map<PaymentAllocationLookup>(paymentAllocationLookup);
            }
        }

        public async Task<List<PaymentAllocationLookup>> GetAllocationLookups()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var allocationLookups = await _paymentAllocationLookupRepository
                    .SqlQueryAsync<PaymentAllocationLookup>(DatabaseConstants.GetAllocationLookups);

                return Mapper.Map<List<PaymentAllocationLookup>>(allocationLookups);
            }
        }

        public async Task<List<PaymentAllocationLookup>> GetAllocationLookupsByDebtorNumber(string debtorNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var sqlParameter = new SqlParameter() { ParameterName = "DebtorNumber", Value = debtorNumber };

                var allocationLookups = await _paymentAllocationLookupRepository
                    .SqlQueryAsync<PaymentAllocationLookup>(DatabaseConstants.GetAllocationLookupsByDebtor, sqlParameter);

                return Mapper.Map<List<PaymentAllocationLookup>>(allocationLookups);
            }
        }

        public async Task<bool> DeleteAllocationLookup(int allocationLookupId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var paymentAllocationLookup = await _paymentAllocationLookupRepository
                    .SingleAsync(x => x.Id == allocationLookupId);

                if (paymentAllocationLookup == null)
                    return false;

                paymentAllocationLookup.IsDeleted = true;
                paymentAllocationLookup.ModifiedBy = RmaIdentity.Username;

                _paymentAllocationLookupRepository.Update(paymentAllocationLookup);

                return await scope.SaveChangesAsync() > 0;
            }
        }
    }
}
