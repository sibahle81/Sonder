namespace RMA.Service.FinCare.Database.Constants
{
    public static class DatabaseConstants
    {
        public const string PostingToAbility = "finance.PostingToAbility @User, @UserPass, @ModuleNo, @TranTypeNo, @BankAccount" +
            ",@BankReference, @DailyTotal, @DocTypeFlag, @TransactionType, @Currency, @yyyy, @mm, @AppErrorNo, @AppErrorMess, @company_no" +
            ",@branch_no, @level1_no, @level2_no, @level3_no, @chart_no, @analysis_no";

        public const string CommissionAccounts = "commission.GetCommissionAccounts";
        public const string DailyCommissionRun = "commission.DailyCommissionRun";
        public const string GetPaymentOverview = "payment.GetPaymentOverview @CoverTypeIds, @BrokerageId, @PaymentTypeId";
        public const string GetClaimPaymentOverview = "payment.GetClaimPaymentOverview @CoverTypeIds, @StartDate, @EndDate";
        public const string GetDailyPayments = "payment.GetDailyPayments @StartDate, @EndDate";
        public const string GetPayementsByPolicyId = "payment.GetPolicyPaymentDetailsByPolicyId @PolicyId, @StartDate, @EndDate";
        public const string GetAllReconciliationPayments = "payment.GetAllReconciliationPayments @PaymentStatus, @PaymentType, @StartDate, @EndDate";
        public const string GetQueuedPendingPayments = "payment.GetQueuedPendingPayments @PaymentStatus, @PaymentType, @StartDate, @EndDate";
        public const string GetRejectedPayments = "payment.GetRejectedPayments @PaymentStatus, @PaymentType, @StartDate, @EndDate";
        public const string SearchPayments = "payment.paymentSearch @PolicyNumber, @ClaimNumber, @AccountNumber, @Payee, @IdNumber";
        public const string ProcessStagingTransaction = "billing.ProcessStagedBankstatementImport";
        public const string GetImportedStatements = "billing.GetImportedStatements @statementDate";
        public const string CreatePremiumPaybackDebitNote = "billing.CreatePremiumPaybackDebitNote @paymentId, @userId";

        public const string GetPaymentPool = "[payment].[GetPaymentPool]  @PageNumber,@RowsOfPage,@SortingCol, @SortType, @SearchCreatia,@ReAllocate, @UserLoggedIn, @WorkpoolId, @RecordCount OUT";
        public const string PaymentPoolSearch = "[payment].[PaymentPoolSearch]  @PageNumber,@RowsOfPage,@SortingCol, @SortType, @SearchCreatia,@ReAllocate, @UserLoggedIn, @WorkpoolId,@StartDate,@EndDate,@PaymentTypeId,@PaymentStatusId,@ClaimTypeId,@ProductTypeId,@CoidPaymentTypeId,@PensionPaymentTypeId, @RecordCount OUT";
        public const string CommissionPoolSearch = "[commission].[CommissionPoolSearch]  @PageNumber,@RowsOfPage,@SortingCol, @SortType, @SearchCreatia,@ReAllocate, @UserLoggedIn, @WorkpoolId,@StartDate,@EndDate,@CommissionStatusId, @RecordCount OUT";
        public const string GetBankAccountBalances = "[payment].[GetBankAccountBalances]";
        public const string GetEstimatePaymentPool = "[payment].[GetEstimatePayments]";
        public const string GetPaymentsPaged = "[payment].[GetPaymentsPaged] @DateFrom, @DateTo, @PaymentTypeId, @ClaimTypeId, @PaymentStatusId, @Query, @Page, @PageSize, @OrderBy, @isAscending, @RowCount OUTPUT, @TotalAmount OUTPUT";
        public const string GetPayments = "[payment].[GetPayments] @DateFrom, @DateTo, @PaymentTypeId, @ClaimTypeId, @PaymentStatusId, @Query";

        public const string GetMissingBankStatement = "billing.GetMissingBankStatement @BankAccountNumber";
        public const string RemittancesTransactionsSearch = "[payment].[RemittancesTransactionsSearch] @StartDate,@EndDate";
        public const string RemittancesTransactionsListSearch = "[payment].[RemittancesTransactionsListSearch] @BatchReference";
        public const string GetMSPGroups = "[payment].[GetMSPGroups]";
        public const string GetDailyPaymentEstimates = "[payment].[GetDailyPaymentEstimatesForDashboard] @StartDate, @EndDate";

        public const string GetPaymentsOverviewPaged = "[payment].[GetPaymentsOverviewPaged] @DateFrom, @DateTo, @Page, @PageSize, @OrderBy, @isAscending, @RowCount OUTPUT";
        public const string GetPaymentsProductOverview = "[payment].[GetPaymentsProductOverview] @DateFrom, @DateTo, @PaymentStatusId, @Product, @Query";
    }
}
