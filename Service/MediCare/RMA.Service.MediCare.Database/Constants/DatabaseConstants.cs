namespace RMA.Service.MediCare.Database.Constants
{
    public static class DatabaseConstants
    {
        public const string GetMedicalBusinessProcesses = "medical.GetMedicalBusinessProcesses @WorkPoolId, @UserID, @PageIndex, @PageSize, @RecordCount OUT, @SearchQuery, @SortColumn, @SortOrder";
        public const string GetCompCareMedicalInvoice = "medical.GetCompCareMedicalInvoice @InvoiceId";
        public const string GetCompCareMedicalInvoiceLines = "medical.GetCompCareMedicalInvoiceLines @InvoiceId";
        public const string GetHealthCareProviderByIdForSTPIntegration = "medical.USP_GetHealthCareProviderByIdForSTPIntegration @HealthCareProviderId";
        public const string AutoPaySystemUser = "AutoPaySystemUser@randmutual.co.za";
        public const string CheckAndInsertTariff = "medical.USP_CheckAndInsertTariff @ItemCode, @CCTariffId, @PractitionerTypeId, @ServiceDate";
        public const string CheckMedicalReportOnInvoiceCC = "medical.USP_CheckMedicalReportOnInvoiceCC @PersonEventID, @MedicalServiceProviderID, @TreatmentDateFrom, @PrevUnderAssessReasonID";
        public const string MedicalInvoiceStatusUpdates = "Medical.MedicalInvoiceStatusUpdates";
        public const string SearchForInvoices = "medical.SearchForInvoices @PageIndex, @PageSize, @SortColumn, @SortOrder, @ClaimReference, @AccountNumber, @InvoiceDate, @InvoceStatus, @SwitchBatchInvoiceStatus, @PracticeNumber, @PractitionerType, @SupplierInvoiceNumber, @TreatmentDateFrom, @TreatmentDateTo, @RecordCount OUT";
        public const string CheckICD10CodeMatchInjurygrouping = "medical.CheckICD10CodeMatchInjurygrouping @ICD10Code, @PersonEventID, @MedicalServiceProviderID, @IsValid OUT";
        public const string GetMedicalPreAuthPool = "[medical].[GetMedicalPreAuthPool]   @PageNumber, @RowsOfPage, @SortingCol, @SortType, @SearchCreatia, @AssignedToUserId, @UserLoggedIn, @WorkpoolId, @IsUserBox, @RecordCount OUT";
        public const string GetMedicalInvoiceWorkPool = "[medical].[GetMedicalInvoiceWorkPool]   @PageNumber, @RowsOfPage, @SortingCol, @SortType, @SearchCreatia, @AssignedToUserId, @UserLoggedIn, @WorkpoolId, @IsUserBox, @RecordCount OUT";
    }
}
