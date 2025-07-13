using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Constants;
using RMA.Service.Billing.Database.Entities;

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Fabric;
using System.Globalization;
using System.Linq;
using System.Linq.Dynamic;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Services
{
    public class AbilityCollectionsFacade : RemotingStatelessService, IAbilityCollectionsService
    {
        private const string BillingModulePermissions = "BillingModulePermissions";

        private const string receiptReversal = "Receipt Reversal";
        private const string receipts = "Receipts";
        private const string invoice = "Invoice";
        private const string debitNote = "Debit Note";
        private const string creditNote = "Credit Note";
        private const string incomeStatement = "IS";
        private const string balanceSheet = "BS";
        private const string interDebtorTo = "Inter Debtor To";
        private const string interDebtorFrom = "Inter Debtor From";
        private const string reallocationCredit = "Reallocation - Credit";
        private const string reallocationDebit = "Reallocation - Debit";
        private const string refundReversal = "Refund Reversal";
        private const string refund = "Refund";
        private const string abilityDefaultBankAccount = "62679223497";
        private readonly IRepository<billing_AbilityCollection> _abilityCollectionRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IAbilityTransactionsAuditService _abilityTransactionsAuditService;
        private readonly IConfigurationService _configurationService;
        private readonly IRepository<finance_ProductCrossRefTranType> _productCrossRefTranTypeRepository;
        private readonly IPeriodService _periodService;
        private readonly IBankAccountService _bankAccountService;

        public AbilityCollectionsFacade(StatelessServiceContext context,
           IDbContextScopeFactory dbContextScopeFactory,
           IRepository<billing_AbilityCollection> abilityCollectionRepository,
           IAbilityTransactionsAuditService abilityTransactionsAuditService,
           IConfigurationService configurationService,
           IRepository<finance_ProductCrossRefTranType> productCrossRefTranTypeRepository,
           IPeriodService periodService, IBankAccountService bankAccountService)
           : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _abilityCollectionRepository = abilityCollectionRepository;
            _abilityTransactionsAuditService = abilityTransactionsAuditService;
            _configurationService = configurationService;
            _productCrossRefTranTypeRepository = productCrossRefTranTypeRepository;
            _periodService = periodService;
            _bankAccountService = bankAccountService;
        }

        public async Task<List<AbilityCollections>> GetAbilityPostings(int companyNo, int branchNo)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewAbilityCollections);
            using (_dbContextScopeFactory.CreateReadOnly())
            {

                List<SqlParameter> parametersList = new List<SqlParameter>();

                parametersList.Add(
                    new SqlParameter
                    {
                        ParameterName = "@companyNo",
                        SqlDbType = System.Data.SqlDbType.Int,
                        IsNullable = true,
                        Value = companyNo
                    });

                parametersList.Add(
                new SqlParameter
                {
                    ParameterName = "@branchNo",
                    SqlDbType = System.Data.SqlDbType.Int,
                    IsNullable = true,
                    Value = branchNo
                });

                var parameters = parametersList.ToArray();
                var results = await _abilityCollectionRepository.SqlQueryAsync<AbilityCollections>(
                DatabaseConstants.GetAbilityCollectionsToPost, parameters);
                return results;
            }
        }

        public async Task<List<AbilityCollections>> GetRecoveryAbilityPostings()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewAbilityCollections);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var abilityPostings = await _abilityCollectionRepository
                    .Where(x => x.Id > 0 && (bool)!x.IsBilling)
                    .OrderByDescending(a => a.CreatedDate)
                    .ProjectTo<AbilityCollections>().ToListAsync();
                return Mapper.Map<List<AbilityCollections>>(abilityPostings);
            }
        }

        public async Task<AbilityCollections> GetAbilityPosting(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewAbilityCollections);

            using (_dbContextScopeFactory.Create())
            {
                var abilityPosting = await _abilityCollectionRepository
                    .SingleAsync(pol => pol.Id == id,
                        $"Could not find ability posting with id {id}");

                return Mapper.Map<AbilityCollections>(abilityPosting);
            }
        }

        public async Task<int> AddAbilityPosting(AbilityCollections abilityCollections)
        {
            if (abilityCollections != null)
            {
                if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                    RmaIdentity.DemandPermission(Permissions.AddAbilityCollections);

                using (var scope = _dbContextScopeFactory.Create())
                {
                    abilityCollections.TransactionDate = DateTimeHelper.SaNow;
                    var entity = Mapper.Map<billing_AbilityCollection>(abilityCollections);
                    _abilityCollectionRepository.Create(entity);
                    return await scope.SaveChangesAsync()
                        .ConfigureAwait(false);
                }
            }
            return 0;
        }

        public async Task EditAbilityPosting(AbilityCollections abilityCollections)
        {
            if (abilityCollections != null)
            {
                if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                    RmaIdentity.DemandPermission(Permissions.EditAbilityCollections);

                using (var scope = _dbContextScopeFactory.Create())
                {
                    var dataCrossRef = await _abilityCollectionRepository.Where(x => x.Id == abilityCollections.Id).SingleAsync();

                    dataCrossRef.DailyTotal = abilityCollections.DailyTotal;
                    dataCrossRef.LineCount = abilityCollections.LineCount;
                    if (abilityCollections.BankAccountId.HasValue)
                    {
                        dataCrossRef.BankAccountId = abilityCollections.BankAccountId;
                    }
                    _abilityCollectionRepository.Update(dataCrossRef);
                    await scope.SaveChangesAsync()
                        .ConfigureAwait(false);
                }
            }
        }
        public async Task<int> GetIsChartNo(string transactionType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return (await _productCrossRefTranTypeRepository.Where(x => x.TransactionType == transactionType).FirstOrDefaultAsync()).ChartIsNo.Value;
            }
        }

        public async Task<int> GetBsChartNo(string transactionType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return (await _productCrossRefTranTypeRepository.Where(x => x.TransactionType == transactionType).FirstOrDefaultAsync()).ChartBsNo.Value;
            }
        }

        public async Task<finance_ProductCrossRefTranType> GetTransactionRef(string transactionType)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewProductCrossRefTranType);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return (await _productCrossRefTranTypeRepository.Where(x => x.TransactionType == transactionType).FirstOrDefaultAsync());
            }
        }

        public async Task<finance_ProductCrossRefTranType> GetTransactionRefDetails(string origin, string transactionType)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewProductCrossRefTranType);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return (await _productCrossRefTranTypeRepository.Where(x => x.TransactionType == transactionType && x.Origin == origin).FirstOrDefaultAsync());
            }
        }

        public async Task ProcessAbilityPostingItems()
        {
            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var postingItemList = await _abilityTransactionsAuditService.GetAbilityPostingAuditsToProcess();
                    var grouped = postingItemList.GroupBy(x => x.BankAccountId);
                    var productCrossRefTrans = await _productCrossRefTranTypeRepository.Where(c => c.IsActive && c.AbilityCollectionChartPrefix != null).ToListAsync();
                    var transactionTypes = new List<string> { receiptReversal, receipts, invoice, debitNote, creditNote, interDebtorFrom, interDebtorTo, reallocationCredit, reallocationDebit, refund, refundReversal };
                    var lookUpPrefixes = Enum.GetValues(typeof(AbilityCollectionChartPrefixEnum)).Cast<AbilityCollectionChartPrefixEnum>().ToList();

                    foreach (var postingItems in grouped)
                    {
                        var abiltyTransactionAudits = new List<AbilityTransactionsAudit>();
                        try
                        {
                            if (postingItems.ToList().Count > 0)
                            {
                                foreach (var transaction in postingItems)
                                {
                                    try
                                    {
                                        if (!string.IsNullOrEmpty(transaction.Reference))
                                        {
                                            var cleanedReference = transaction.Reference.Replace("-", "");
                                            var prefix = lookUpPrefixes.FirstOrDefault(c =>
                                            cleanedReference.StartsWith(c.DisplayAttributeValue(), StringComparison.InvariantCultureIgnoreCase) ||
                                            transaction.Reference.StartsWith(c.DisplayAttributeValue(), StringComparison.InvariantCultureIgnoreCase));
                                            if (prefix > 0)
                                            {
                                                transaction.AbilityCollectionChartPrefix = prefix;
                                                abiltyTransactionAudits.Add(transaction);
                                            }
                                        }
                                    }
                                    catch (Exception ex)
                                    {
                                        ex.LogException($"Error Processing Ability Posting with prefix  - Error Message {ex.Message}");
                                    }
                                }
                            }
                            if (abiltyTransactionAudits.Count > 0)
                            {
                                foreach (var transactionType in abiltyTransactionAudits.Select(c => c.Item).Distinct().ToList())
                                {
                                    var groupedTransactions = abiltyTransactionAudits.Where(c => c.Item.Equals(transactionType, StringComparison.InvariantCultureIgnoreCase))
                                        .GroupBy(x => x.AbilityCollectionChartPrefix);

                                    foreach (var transactions in groupedTransactions)
                                    {
                                        try
                                        {
                                            await CreateAbilityCollections(transactions.ToList(), (AbilityCollectionChartPrefixEnum)transactions.Key, transactionType, postingItems.Key);

                                        }
                                        catch (Exception ex)
                                        {
                                            ex.LogException($"Error Processing Ability Collections creation - Error Message {ex.Message}");
                                        }
                                    }
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            ex.LogException($"Error Processing Ability Collections Posting  Items - Error Message {ex.Message}");
                        }
                    }

                    await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                }

            }
            catch (Exception ex)
            {
                ex.LogException($"Error Processing Ability Collections Items - Error Message {ex.Message}");
            }
        }

        private async Task<AbilityCollections> GetAbilityCollectionsByReference(string reference)
        {
            using (_dbContextScopeFactory.Create())
            {
                var abilityPosting = await _abilityCollectionRepository
                    .Where(x => x.Reference.Contains(reference)).FirstOrDefaultAsync();

                return Mapper.Map<AbilityCollections>(abilityPosting);
            }
        }

        private async Task<List<AbilityCollections>> GetAbilityCollectionsListByReference(string reference)
        {
            using (_dbContextScopeFactory.Create())
            {
                var abilityPosting = await _abilityCollectionRepository
                    .Where(x => x.Reference.Contains(reference)).ToListAsync();

                return Mapper.Map<List<AbilityCollections>>(abilityPosting);
            }
        }

        public async Task<List<AbilityCollections>> GetAbilityPostingsToProcess()
        {
            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var abilityPostings = await _abilityCollectionRepository
                             .Where(x => !x.IsProcessed && (bool)x.IsBilling)
                       .ToListAsync();
                    var userName = await _configurationService.GetModuleSetting("AbilityUserName");
                    var userPassword = await _configurationService.GetModuleSetting("AbilityPassword");
                    foreach (var abilityPosting in abilityPostings)
                    {

                        try
                        {
                            string month = "";
                            decimal amt = 0;

                            if (abilityPosting.Reference.Contains("-") && Regex.IsMatch(abilityPosting.Reference.Substring(abilityPosting.Reference.Length - 8), @"^\d{8}$"))
                            {
                                string dateString = abilityPosting.Reference.Substring(abilityPosting.Reference.Length - 8);

                                if (DateTime.TryParseExact(dateString, "ddMMyyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime date))
                                {
                                    month = $"{date.Date:MM}";
                                }
                            }
                            else
                            {
                                if (abilityPosting.Reference.Length > 15)
                                {
                                    month = abilityPosting.Reference.Substring(13, 2);
                                }
                                else
                                {
                                    month = abilityPosting.Reference.Substring(9, 2);
                                }
                            }
                            var mm = Convert.ToInt32(month);
                            if (abilityPosting.TransactionType == "Credit Note")
                            {
                                amt -= abilityPosting.DailyTotal;
                            }
                            else
                            {
                                amt = abilityPosting.DailyTotal;
                            }
                            if ((abilityPosting.TransactionType == "Invoice" || abilityPosting.TransactionType == "Credit Note") && abilityPosting?.ChartIsNo > 0)
                            {
                                var referenceBankAccountNumber = "";

                                if (abilityPosting.BankAccountId.HasValue)
                                {
                                    var bank = await _bankAccountService.GetBankAccountById(abilityPosting.BankAccountId.Value);
                                    referenceBankAccountNumber = bank != null ? bank.AccountNumber : abilityDefaultBankAccount;
                                }
                                else
                                {
                                    referenceBankAccountNumber = abilityDefaultBankAccount;
                                }

                                SqlParameter[] parameters = {
                                            new SqlParameter("User", userName),
                                            new SqlParameter("UserPass", userPassword),
                                            new SqlParameter("ModuleNo", "cb"),
                                            new SqlParameter("TranTypeNo", 20),
                                            new SqlParameter("BankAccount", referenceBankAccountNumber),
                                            new SqlParameter("BankReference", abilityPosting.Reference),
                                            new SqlParameter("DailyTotal", amt),
                                            new SqlParameter("DocTypeFlag", 4),
                                            new SqlParameter("TransactionType", abilityPosting.TransactionType),
                                            new SqlParameter("Currency", "ZAR"),
                                            new SqlParameter("yyyy", (short)DateTime.UtcNow.Year),
                                            new SqlParameter("mm", (byte)mm),
                                            new SqlParameter("company_no", abilityPosting.CompanyNo),
                                            new SqlParameter("branch_no", abilityPosting.BranchNo),
                                            new SqlParameter("level1_no", abilityPosting.Level1),
                                            new SqlParameter("level2_no", abilityPosting.Level2),
                                            new SqlParameter("level3_no", DateTime.Now.Year.ToString()),
                                            new SqlParameter("chart_no", abilityPosting.ChartIsNo),
                                            new SqlParameter("AppErrorNo", SqlDbType.Int, 50),
                                            new SqlParameter("AppErrorMess", SqlDbType.NVarChar, 500),
                                            new SqlParameter("analysis_no", SqlDbType.VarChar, 10) {  Value = abilityPosting.Benefitcode != null ? (object)abilityPosting.Benefitcode : (object)DBNull.Value } };

                                parameters[18].Direction = ParameterDirection.Output;
                                parameters[19].Direction = ParameterDirection.Output;

                                await _abilityCollectionRepository.ExecuteSqlCommandAsync(
                                    DatabaseConstants.PostingToAbility, parameters
                                   );

                                abilityPosting.IsProcessed = true;
                                _abilityCollectionRepository.Update(abilityPosting);
                            }

                        }
                        catch (Exception scheduleEx)
                        {
                            scheduleEx.LogException($"Error in {nameof(GetAbilityPostingsToProcess)}. Id: {abilityPosting.Id}. Exception: {scheduleEx.Message}");
                        }
                    }

                    await PostTransactionsToBS(abilityPostings);
                    await scope.SaveChangesAsync()
                      .ConfigureAwait(false);

                    return Mapper.Map<List<AbilityCollections>>(abilityPostings);
                }

            }
            catch (Exception ex)
            {
                ex.LogException($"Error getting Getting Ability Postings To Process - Error Message {ex.Message}");
                return null;
            }
        }

        public async Task<List<AbilityCollections>> GetRecoveriesPostingsToProcess()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewAbilityCollections);

            using (var scope = _dbContextScopeFactory.Create())
            {

                var abilityPostings = await _abilityCollectionRepository
                    .Where(x => !x.IsProcessed && (bool)!x.IsBilling)
                   .ToListAsync();

                var userName = await _configurationService.GetModuleSetting("AbilityUserName");
                var userPassword = await _configurationService.GetModuleSetting("AbilityPassword");
                foreach (var abilityPosting in abilityPostings)
                {

                    SqlParameter[] parameters = {
                     new SqlParameter("User", userName),
                     new SqlParameter("UserPass", userPassword),
                     new SqlParameter("ModuleNo", "cb"),
                     new SqlParameter("TranTypeNo", 20),
                     new SqlParameter("BankAccount", "62679223497"),
                     new SqlParameter("BankReference", abilityPosting.Reference),
                     new SqlParameter("DailyTotal", abilityPosting.DailyTotal),
                     new SqlParameter("DocTypeFlag", 4),
                     new SqlParameter("TransactionType", abilityPosting.TransactionType),
                     new SqlParameter("Currency", "ZAR"),
                     new SqlParameter("yyyy", (short)DateTime.UtcNow.Year),
                     new SqlParameter("mm", (byte)DateTime.UtcNow.Month),
                     new SqlParameter("company_no", abilityPosting.CompanyNo),
                     new SqlParameter("branch_no", abilityPosting.BranchNo),
                     new SqlParameter("level1_no", abilityPosting.Level1),
                     new SqlParameter("level2_no", abilityPosting.Level2),
                     new SqlParameter("level3_no", "000"),
                     new SqlParameter("chart_no", abilityPosting.ChartIsNo),
                     new SqlParameter("AppErrorNo", SqlDbType.Int, 50),
                     new SqlParameter("AppErrorMess", SqlDbType.NVarChar, 500)
                    };

                    parameters[18].Direction = ParameterDirection.Output;
                    parameters[19].Direction = ParameterDirection.Output;

                    await _abilityCollectionRepository.ExecuteSqlCommandAsync(
                        DatabaseConstants.PostingRecoveriesToAbility, parameters
                       );

                    abilityPosting.IsProcessed = true;
                    _abilityCollectionRepository.Update(abilityPosting);

                }
                await scope.SaveChangesAsync()
                  .ConfigureAwait(false);

                return Mapper.Map<List<AbilityCollections>>(abilityPostings);
            }
        }

        public async Task PostTransactionsToBS(List<billing_AbilityCollection> abilityCollections)
        {
            if (abilityCollections != null)
            {
                try
                {
                    if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                        RmaIdentity.DemandPermission(Permissions.ProcessAbilityPostings);

                    var userName = await _configurationService.GetModuleSetting("AbilityUserName");
                    var userPassword = await _configurationService.GetModuleSetting("AbilityPassword");
                    foreach (var abilityCollection in abilityCollections)
                    {
                        if (!abilityCollection.ChartBsNo.HasValue)
                            continue;

                        if (!abilityCollection.BankAccountId.HasValue)
                            continue;

                        var bankAccountNumber = await _bankAccountService.GetBankAccountById((int)abilityCollection?.BankAccountId);

                        decimal amt = 0;
                        var mm = abilityCollection.TransactionDate.Month;

                        if (abilityCollection.TransactionType == "Receipts")
                        {
                            amt -= abilityCollection.DailyTotal;
                        }
                        else
                        {
                            amt = abilityCollection.DailyTotal;
                        }

                        SqlParameter[] parameters = {
                     new SqlParameter("User", userName),
                     new SqlParameter("UserPass", userPassword),
                     new SqlParameter("ModuleNo", "cb"),
                     new SqlParameter("TranTypeNo", 20),
                     new SqlParameter("BankAccount", bankAccountNumber.AccountNumber),
                     new SqlParameter("BankReference", abilityCollection.Reference),
                     new SqlParameter("DailyTotal", amt),
                     new SqlParameter("DocTypeFlag", 4),
                     new SqlParameter("TransactionType", abilityCollection.TransactionType),
                     new SqlParameter("Currency", "ZAR"),
                     new SqlParameter("yyyy", (short)DateTime.UtcNow.Year),
                     new SqlParameter("mm", (byte)mm),
                     new SqlParameter("company_no", abilityCollection.CompanyNo),
                     new SqlParameter("branch_no", abilityCollection.BranchNo),
                     new SqlParameter("level1_no", abilityCollection.Level1),
                     new SqlParameter("level2_no", abilityCollection.Level2),
                     new SqlParameter("level3_no", DateTime.Now.Year.ToString()),
                     new SqlParameter("chart_no", abilityCollection.ChartBsNo),
                     new SqlParameter("AppErrorNo", SqlDbType.Int, 50),
                     new SqlParameter("AppErrorMess", SqlDbType.NVarChar, 500),
                     new SqlParameter("analysis_no", SqlDbType.VarChar, 10) {  Value = abilityCollection.Benefitcode != null ? (object)abilityCollection.Benefitcode : (object)DBNull.Value }
                    };

                        parameters[18].Direction = ParameterDirection.Output;
                        parameters[19].Direction = ParameterDirection.Output;

                        await _abilityCollectionRepository.ExecuteSqlCommandAsync(
                            DatabaseConstants.PostingToAbility, parameters
                           );

                        abilityCollection.IsProcessed = true;
                        _abilityCollectionRepository.Update(abilityCollection);
                    }
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error Processing Ability Posting To BS - Error Message {ex.Message}");
                }

            }
        }
        private async Task CreateAbilityCollections(List<AbilityTransactionsAudit> transactionsAudits, AbilityCollectionChartPrefixEnum prefixEnum, string abilityCollectionTransactionType, int? bankAccountId)
        {
            string newReference;
            if (transactionsAudits?.Count != 0)
            {
                var productCrossRefTranType = await GetProductCrossRefTranTypeDetails(prefixEnum);
                if (productCrossRefTranType != null)
                {
                    var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);

                    foreach (var group in transactionsAudits.GroupBy(x => x.Reference).ToList())
                    {
                        try
                        {
                            var abilityCollection = new AbilityCollections();
                            abilityCollection.CompanyNo = productCrossRefTranType.CompanyNo;
                            abilityCollection.BranchNo = productCrossRefTranType.BranchNo;
                            abilityCollection.TransactionType = abilityCollectionTransactionType;
                            abilityCollection.Reference = group.FirstOrDefault()?.Reference;
                            abilityCollection.BatchReference = group.FirstOrDefault()?.ItemReference;
                            abilityCollection.TransactionDate = postingDate;
                            abilityCollection.Level1 = productCrossRefTranType.Level1;
                            abilityCollection.Level2 = productCrossRefTranType.Level2;
                            abilityCollection.Level3 = productCrossRefTranType.Level3.ToInt();
                            abilityCollection.ChartIsNo = productCrossRefTranType.ChartIsNo;
                            abilityCollection.ChartBsNo = productCrossRefTranType.ChartBsNo;
                            abilityCollection.DailyTotal = (decimal)group.Sum(x => x.Amount);
                            abilityCollection.IsProcessed = false;
                            abilityCollection.IsBilling = true;
                            abilityCollection.ChartIsName = productCrossRefTranType.ChartIsName;
                            abilityCollection.ChartBsName = productCrossRefTranType.ChartBsName;
                            abilityCollection.LineCount = group.Count();
                            abilityCollection.BankAccountId = bankAccountId;

                            var exists = await GetAbilityCollectionsByReference(abilityCollection.Reference);
                            if (exists != null && !exists.IsProcessed)
                            {
                                newReference = exists.Reference;
                                exists.DailyTotal = exists.DailyTotal + abilityCollection.DailyTotal;
                                exists.LineCount = exists.LineCount + abilityCollection.LineCount;
                                if (!exists.BankAccountId.HasValue)
                                {
                                    exists.BankAccountId = bankAccountId;
                                }
                                await EditAbilityPosting(exists);
                            }
                            else if (exists != null && exists.IsProcessed)
                            {
                                var itemNotProcessed = new AbilityCollections();
                                var items = await GetAbilityCollectionsListByReference(abilityCollection.Reference);
                                itemNotProcessed = items.Where(x => !x.IsProcessed).FirstOrDefault();
                                if (itemNotProcessed != null)
                                {
                                    newReference = itemNotProcessed.Reference;
                                    itemNotProcessed.DailyTotal = itemNotProcessed.DailyTotal + abilityCollection.DailyTotal;
                                    itemNotProcessed.LineCount = itemNotProcessed.LineCount + abilityCollection.LineCount;
                                    if (!exists.BankAccountId.HasValue)
                                    {
                                        exists.BankAccountId = bankAccountId;
                                    }
                                    await EditAbilityPosting(itemNotProcessed);
                                }
                                else
                                {
                                    abilityCollection.Reference = abilityCollection.Reference + "-" + Convert.ToString(items.Count);
                                    newReference = abilityCollection.Reference;
                                    await AddAbilityPosting(abilityCollection);
                                }
                            }
                            else
                            {
                                newReference = abilityCollection.Reference;
                                await AddAbilityPosting(abilityCollection);
                            }
                            foreach (var groupReceiptsReversal in group)
                            {
                                groupReceiptsReversal.Reference = newReference;
                                groupReceiptsReversal.IsProcessed = true;
                                groupReceiptsReversal.ModifiedDate = DateTimeHelper.SaNow;
                                groupReceiptsReversal.ModifiedBy = "BackendProcess";
                                await _abilityTransactionsAuditService.EditAbilityPostingAudit(groupReceiptsReversal);
                            }
                        }
                        catch (Exception ex)
                        {
                            ex.LogException($"Error creating ability collections - Error Message {ex.Message}");
                        }
                    }
                }
            }
        }

        public async Task<finance_ProductCrossRefTranType> GetProductCrossRefTranTypeDetails(AbilityCollectionChartPrefixEnum abilityCollectionChartPrefix)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewProductCrossRefTranType);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return (await _productCrossRefTranTypeRepository.Where(x => x.AbilityCollectionChartPrefix == abilityCollectionChartPrefix).FirstOrDefaultAsync());
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

        public async Task<List<AbilityChart>> GetAbilityIncomeAndBalanceSheetCharts()
        {
            var charts = new List<AbilityChart>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var balanceSheetCharts = await _productCrossRefTranTypeRepository
                    .Where(c => c.ChartBsNo > 0 && !c.ChartBsName.Contains("medical"))
                    .Select(c => c.ChartBsNo).Distinct().OrderBy(c => c).ToListAsync();
                foreach (var item in balanceSheetCharts)
                {
                    if (item.HasValue)
                        charts.Add(new AbilityChart { Chart = balanceSheet, ChartNumber = item.Value });
                }
                var incomeStatementCharts = await _productCrossRefTranTypeRepository
                    .Where(c => c.ChartIsNo > 0 && !c.ChartIsName.Contains("medical"))
                    .Select(c => c.ChartIsNo).Distinct().OrderBy(c => c).ToListAsync();
                foreach (var item in incomeStatementCharts)
                {
                    if (item.HasValue)
                        charts.Add(new AbilityChart { Chart = incomeStatement, ChartNumber = item.Value });
                }
            }
            return charts.OrderBy(c => c.ChartNumber).ToList();
        }

        public async Task<bool> PostCollectionSummaryToAbility(AbilityCollectionPostingRequest request)
        {
            var accounts = await _bankAccountService.GetBankAccounts();
            var bankaccountNumber = string.Empty;
            int currentItemId = 0;
            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var abilityPostings = await _abilityCollectionRepository
                        .Where(a => request.CollectionIds.Contains(a.Id) && (bool)a.IsBilling)
                       .ToListAsync();
                    var userName = await _configurationService.GetModuleSetting("AbilityUserName");
                    var userPassword = await _configurationService.GetModuleSetting("AbilityPassword");

                    foreach (var abilityPosting in abilityPostings)
                    {
                        currentItemId = abilityPosting.Id;
                        bankaccountNumber = string.Empty;
                        if (abilityPosting.BankAccountId.HasValue)
                            bankaccountNumber = accounts.FirstOrDefault(c => c.Id == abilityPosting.BankAccountId.Value)?.AccountNumber;

                        decimal amt = 0;

                        var mm = abilityPosting.TransactionDate.Month;
                        if (abilityPosting.TransactionType == "Credit Note")
                        {
                            amt -= abilityPosting.DailyTotal;
                        }
                        else
                        {
                            amt = abilityPosting.DailyTotal;
                        }

                        if (abilityPosting.ChartIsNo.HasValue)
                        {
                            SqlParameter[] parameters = {
                                 new SqlParameter("User", userName),
                                 new SqlParameter("UserPass", userPassword),
                                 new SqlParameter("ModuleNo", "cb"),
                                 new SqlParameter("TranTypeNo", 20),
                                 new SqlParameter("BankAccount", bankaccountNumber),
                                 new SqlParameter("BankReference", abilityPosting.Reference),
                                 new SqlParameter("DailyTotal", amt),
                                 new SqlParameter("DocTypeFlag", 4),
                                 new SqlParameter("TransactionType", abilityPosting.TransactionType),
                                 new SqlParameter("Currency", "ZAR"),
                                 new SqlParameter("yyyy", (short)DateTime.UtcNow.Year),
                                 new SqlParameter("mm", (byte)mm),
                                 new SqlParameter("company_no", abilityPosting.CompanyNo),
                                 new SqlParameter("branch_no", abilityPosting.BranchNo),
                                 new SqlParameter("level1_no", abilityPosting.Level1),
                                 new SqlParameter("level2_no", abilityPosting.Level2),
                                 new SqlParameter("level3_no", DateTime.Now.Year.ToString()),
                                 new SqlParameter("chart_no", abilityPosting.ChartIsNo),
                                 new SqlParameter("AppErrorNo", SqlDbType.Int, 50),
                                 new SqlParameter("AppErrorMess", SqlDbType.NVarChar, 500),
                                 new SqlParameter("analysis_no", SqlDbType.VarChar, 10) {  Value = abilityPosting.Benefitcode != null ? (object)abilityPosting.Benefitcode : (object)DBNull.Value }
                                };

                            parameters[18].Direction = ParameterDirection.Output;
                            parameters[19].Direction = ParameterDirection.Output;

                            await _abilityCollectionRepository.ExecuteSqlCommandAsync(
                                DatabaseConstants.PostingToAbility, parameters
                               );

                            abilityPosting.IsProcessed = true;
                            _abilityCollectionRepository.Update(abilityPosting);
                        }
                        await scope.SaveChangesAsync()
                         .ConfigureAwait(false);
                    }

                    await PostTransactionsToBS(abilityPostings);

                    return await Task.FromResult(true);
                }
            }
            catch (Exception ex)
            {
                if (!(ex.Message.IndexOf("this is a system chart", StringComparison.OrdinalIgnoreCase) >= 0))
                {
                    ex.LogException($"Error posting to Ability ItemId: {currentItemId} - Error Message {ex.Message}");
                }
                return await Task.FromResult(false);
            }
        }
    }
}
