namespace RMA.Service.Billing.Database.Constants
{
    public static class DatabaseConstants
    {
        public const string SearchInvoicesStoredProcedure = "billing.SearchInvoices @FilterType, @Filter, @ShowActive, @pageNumber,@pageSize,@recordCount OUTPUT";

        public const string RaisePendingInstallmentPremiums =
            "billing.RaisePendingInstallmentPremiums @clientTypeId, @paymentFrequencyId, @policyId, @reportOnly, @commit, @forceRaisePremium, @date";

        public const string PostToAbility = "billing.PostCollectionsToAbility @User, @UserPass, @ModuleNo, @TranTypeNo, @BankAccount" +
           ",@BankReference, @DailyTotal, @DocTypeFlag, @TransactionType, @Currency, @yyyy, @mm, @AppErrorNo, @AppErrorMess, @company_no" +
           ",@branch_no, @level1_no, @level2_no, @level3_no, @chart_no, @Industry, @DocType, @TransModuleNo, @TransTypeNo, @TransTypeSysNo," +
            "@TransUserNo, @ourRefNo, @yourRefNo";

        public const string PostingToAbility = "finance.PostingToAbility @User, @UserPass, @ModuleNo, @TranTypeNo, @BankAccount" +
           ",@BankReference, @DailyTotal, @DocTypeFlag, @TransactionType, @Currency, @yyyy, @mm, @AppErrorNo, @AppErrorMess, @company_no" +
           ",@branch_no, @level1_no, @level2_no, @level3_no, @chart_no, @analysis_no";

        public const string PostingRecoveriesToAbility = "finance.PostingRecoveriesToAbility @User, @UserPass, @ModuleNo, @TranTypeNo, @BankAccount" +
           ",@BankReference, @DailyTotal, @DocTypeFlag, @TransactionType, @Currency, @yyyy, @mm, @AppErrorNo, @AppErrorMess, @company_no" +
           ",@branch_no, @level1_no, @level2_no, @level3_no, @chart_no";

        public const string SearchAccountsStoredProcedure = "billing.SearchAccounts @FilterType, @Filter, @ShowActive";

        public const string GetAccountHistoryStoredProcedure = "billing.GetAccountHistory @PolicyId";

        public const string SearchForInvoiceByBankStatementReference = "billing.SearchForInvoiceByBankStatementReference @statementReference";

        public const string GetTransactionsByBank = "billing.GetTransactionsByBank @accountNumber, @searchFilter";

        public const string GetAccountHistoryByRolePlayer = "billing.GetAccountHistoryByRolePlayer @RolePlayerId";

        public const string GenerateJournalUserPass = "billing.SetJournalUser @user, @PasswordNew";

        public const string GetPendingInvoicesStoredProcedure = "billing.GetPendingInvoices @PolicyId";

        public const string DebitOrderReportStoredProcedure = "billing.DebitOrderReport  @periodYear, @periodMonth, @startDate, @endDate, @industryId, @productId, @debitOrderTypeId, @RMABankAccount";

        public const string GetUnallocatedPaymentsPagedStoredProcedure = "billing.GetUnallocatedPaymentsPaged @DateType, @DateFrom, @DateTo, @Search, @Page, @PageSize, @OrderBy, @isAscending, @BankAccNum";

        public const string GetUnallocatedPaymentsStoredProcedure = "billing.GetUnallocatedPayments @DateType, @DateFrom, @DateTo, @Search, @BankAccNum";

        public const string GetAllocatedPaymentsStoredProcedure = "billing.GetAllocatedPayments @startDate, @endDate, @dateType, @bankAccNum, @productId, @periodYear, @periodMonth";

        public const string GetEuropAssistPremiumsStoredProcedure = "billing.GetEuropeAssistPremiums";

        public const string BankStatementAnalysisStoredProcedure = "billing.BankStatementAnalysis";

        public const string GetAccountHistoryForRefund = "billing.GetAccountHistoryForRefund @rolePlayerId";

        public const string SearchForClaimRecoveryInvoiceByBankStatementReference = "billing.SearchForClaimRecoveryInvoiceByBankStatementReference @statementReference";

        public const string CollectionsAgeingReportStoredProcedure = "billing.CollectionsAgeingReport  @EndDate, @IndustryId, @BalanceTypeId, @DebtorStatus, @ClientTypeId, @ProductName";

        public const string GetDuplicateInvoices = "billing.GetDuplicateInvoices";

        public const string GetCancelledPolicyOutstandingInvoices = "billing.GetCancelledPolicyOutstandingInvoices";

        public const string GetUnsettledInvoices = "billing.GetUnsettledInvoices @rolePlayerId";
        public const string GetUnsettledInvoicesForPolicies = "billing.GetUnsettledInvoicesForPolicies @rolePlayerId, @policyIds";

        public const string RaiseInterestForUnpaidInvoices = "billing.RaiseInterestForUnpaidInvoices @periodId, @industryClassId, @productCategoryId";
        public const string BulkAllocateStagedAllocations = "billing.BulkAllocateStagedAllocations  @fileId";
        public const string BulkAllocateSmallFile = "billing.BulkAllocateSmallFile @bulkAllocationFileId";
        public const string GetUnallocatedPaymentsMultiFilters = "billing.GetUnallocatedPaymentsMultiFilters @DateType, @DateFrom, @DateTo, @Search, @Page, @PageSize, @OrderBy, @isAscending, @BankAccNum ,@recordCount OUTPUT";
        public const string GenerateGroupInvoice = "billing.GenerateGroupInvoice @policyId, @invoiceDate,@collectionDate,@createdBy,@invoiceId OUTPUT";
        public const string AdjustInterestForBudgetedDeclarations = "billing.AdjustDebtorInterestBasedOnBudgetedDeclarations";
        public const string GetPaidClaimAmountsForPolicy = "billing.GetPaidClaimAmountsForPolicy @policyId";
        public const string GetDebtorDebitTransactions = "billing.GetDebtorDebitTransactions @rolePlayerId";
        public const string SearchMultipleDebtorsByBankStatementReference = "billing.SearchMultipleDebtorsByBankStatementReference @userReference,@userReference2";
        public const string SearchForDebtorByBankStatementReference = "billing.SearchForDebtorBankStatementReference @statementReference";
        public const string AllocatePaymentToDebitTransactions = "billing.AllocatePaymentToDebitTransactions @rolePlayerId,@amountPaid,@bankstatementEntryId,@rmaReference";
        public const string AllocateTransactionToCorrectIndustry = "billing.AllocateTransactionToCorrectIndustry @rolePlayerId,@bankAccountNumber";
        public const string SearchForDebtorByBankStatementEntryId = "billing.SearchForDebtorByBankStatementEntryId @bankStatementEntryId";
        public const string CreateCreditNoteForInvoice = "billing.CreateCreditNoteForInvoice @policyId, @rolePlayerId";
        public const string RaiseInterestForUnpaidInvoicesForDefaultedTerms = "billing.RaiseInterestForUnpaidInvoicesForDefaultedTerms";
        public const string GetDebtorProductBalancesForTerms = "billing.GetDebtorProductBalancesForTerms @rolePlayerId,@underWritingYearId";
        public const string CreateAdhocInterest = "billing.CreateAdhocInterest @invoiceId,@interestDates,@currentPeriodPostingDate,@user";
        public const string GetBundleRaiseCancellations = "billing.GetBundleRaiseCancellations";
        public const string GetDebtorCreditBalance = "billing.GetDebtorCreditBalance @rolePlayerId";
        public const string AllocateCreditBalanceToDebitTransactions = "billing.AllocateCreditBalanceToDebitTransactions @rolePlayerId";
        public const string GetInvoicesReadyToCollect = "billing.GetInvoicesReadyToCollect @collectionGenerationStartDate,@effectiveDate";
        public const string GetPaidInvoicesPendingLetterOfGoodStanding = "billing.GetPaidInvoicesPendingLetterOfGoodStanding";
        public const string SearchCreditNotes = "billing.SearchCreditNotes @FilterType, @Filter, @ShowActive, @pageNumber,@pageSize,@recordCount OUTPUT";
        public const string GetDebtorsByAccountNumber = "billing.GetDebtorsByAccountNumber @rmaBankAccount, @searchText";
        public const string GetDebtorProductBalances = "billing.GetDebtorProductBalances @rolePlayerId";
        public const string GetTransactionsCreditForTransfer = "billing.GetTransactionsCreditForTransfer @startDate,@endDate,@rolePlayerId,@bankAccount";
        public const string GetDebtorOpenTransactions = "billing.GetDebtorOpenTransactions @rolePlayerId, @policyIds, @transactionTypeId, @outputBalance Output";
        public const string GetDebtorTransactionHistory = "billing.GetDebtorTransactionHistory @rolePlayerId,@startDate,@endDate";
        public const string GetDebtorOpeningClosingBalanceByPolicy = "billing.DebtorOpeningClosingBalanceByPolicy @policyId";
        public const string GetCreditTransactionsToRefund = "billing.GetCreditTransactionsToRefund @rolePlayerId";
        public const string GetInvoicesAndCreditNotesReadyForEmailSending = "billing.GetInvoicesAndCreditNotesReadyForEmailSending @batchSize, @industryId, @transactionTypesCommaSeparatedString";
        public const string GetProductCategoryBalances = "billing.GetProductCategoryBalances @rolePlayerId";
        public const string GetDebtorOpenCreditTransactions = "billing.GetDebtorOpenCreditTransactions @rolePlayerId";
        public const string GetDebtorReclassficationRefundBreakDown = "billing.GetDebtorReclassficationRefundBreakDown @rolePlayerId";
        public const string GetDebtorCancellationRefundBreakDown = "billing.GetDebtorCancellationRefundBreakDown @rolePlayerId";
        public const string GetDebtorsByCompanyAndBranch = "billing.GetDebtorsByCompanyAndBranch @industryClassId,@companyNumber,@branchNumber";
        public const string GetDebtorsByCompanyBranchAndDate = "billing.GetDebtorsByCompanyBranchAndDate @companyNumber,@branchNumber, @startDate, @endDate";
        public const string GetAllocationLookups = "billing.GetAllocationLookups";
        public const string UpdateAllocationLookups = "billing.UpdateAllocationLookups @AllocationLookupIdList";
        public const string GetAllocationLookupsByDebtor = "billing.GetAllocationLookupsByDebtor @DebtorNumber";
        public const string CalculateInvoiceBalance = "billing.CalculateInvoiceBalance @invoiceId, @totalInvoiceAmount";
        public const string GetAbilityCollectionsToPost = "billing.GetAbilityCollectionsToPost @companyNo, @branchNo";
        public const string GetUnprocessedAllocationLookups = "billing.GetUnprocessedAllocationLookups";
        public const string RaiseEarnedIncomeInvoices = "billing.RaiseEarnedIncomeInvoices";
        public const string GetBouncedTransactionsForTransfer = "billing.GetBouncedTransactionsForTransfer @rolePlayerId,@bankAccount,@period";
        public const string GetMonthlyBrokerPaymentSchedule = "billing.GetMonthlyBrokerPaymentSchedule";
        public const string GetForecastRates = "billing.GetForecastRates";
        public const string UpdateForecastRate = "billing.UpdateForecastRate @EffectiveFrom,@EffectiveTo,@ForecastRate,@ProductId,@CreatedBy,@IsDeleted";
        public const string GetAbilityTransactionDetails = "billing.GetAbilityTransactionDetails @TransactionId";
        public const string CommitStagedInterest = "billing.CommitStagedInterest @periodId, @industryClassId, @productCategoryId";
        public const string GetExistingPayment = "billing.GetExistingPayment @PartialUserReference, @StatementDate, @NettAmount";
    }
}
