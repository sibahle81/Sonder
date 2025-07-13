namespace RMA.Service.ClaimCare.Database.Constants
{
    public static class DatabaseConstants
    {
        public const string ClaimSearchStoredProcedure = "claim.Search @FilterType, @Filter, @ShowActive";
        public const string FuneralClaimReportStoredProcedure = "claim.ClaimReport @DateFrom, @DateTo, @ClaimStatusId";
        public const string GetClaimWorkPoolsPaged = "[claim].[GetClaimWorkPoolsPaged] @WorkPoolId, @UserId,@SelectedUserId, @Query, @Page, @PageSize, @OrderBy, @isAscending, @RowCount OUT";
        public const string ClaimSearchPoliciesStoredProcedure = "claim.SearchPoliciesWithoutClaim @FilterType, @Filter, @ShowActive";
        public const string ClaimSearchInsuredLivesStoredProcedure = "claim.SearchInsuredLives @FilterType, @Filter, @ShowActive, @PageIndex, @PageSize, @SortColumn, @SortOrder, @RecordCount OUT";
        public const string CreateRolePlayerForApprovalStoredProcedure = "claim.CreateRolePlayerForClaimProcess @Reference, @User, @StepData, @RowId";
        public const string ClaimantInsuredLivesStoredProcedure = "claim.SearchClaimantInsuredLives @FilterType, @Filter, @ShowActive, @PageIndex, @PageSize, @SortColumn, @SortOrder, @RecordCount OUT";
        public const string ClaimDashboardCorporateStoredProcedure = "claim.ClaimDashboardCorporateStoredProcedure @CoverTypeIds";
        public const string GetClaimByCoverTypeIdBrokerageId = "claim.GetClaimByCoverTypeIdBrokerageId @CoverTypeIds";
        public const string GetVopdOverview = "claim.GetVopdOverview @startDate, @endDate, @notificationType, @claimType, @insuranceType, @benefitDue, @filter";
        public const string GetStmOverview = "claim.GetStmOverview @startDate, @endDate, @notificationType, @claimType, @insuranceType, @benefitDue, @filter";
        public const string GetExitReasonClaimOverview = "claim.GetSTPOverview @startDate, @endDate, @benefitDue, @filter";
        public const string GetCorporateClaims = "claim.GetCorporateClaims @CoverTypeIds";
        public const string GetChannelsForClaims = "[claim].[FuneralClaimCapturedChannels] @Brokerage";
        public const string GetSchemesForClaims = "[claim].[FuneralClaimCapturedScheme] @Channel";
        public const string GetBrokersByProducstLinkedToClaims = "[claim].[FuneralClaimPaidBrokers] @Product";
        public const string GetSchemesByBrokeragesLinkedToClaims = "[claim].[FuneralClaimPaidScheme] @Brokerage";
        public const string PersonEventSearchStoredProcedure = "[claim].[PersonEventSearch]  @PageNumber,@RowsOfPage,@SortingCol, @SortType, @SearchCreatia, @StartDate, @EndDate, @IsStp, @Stm, @claimStatus, @liabilityStatus,@rolePlayerId, @ViewAll, @Filter, @RecordCount OUT";
        public const string ExitReasonSearch = "[claim].[ExitReasonSearch]  @PageNumber,@RowsOfPage,@SortingCol, @SortType, @SearchCreatia,@ExitReasonId, @RecordCount OUT";
        public const string ValidateIsStraigthThroughProcess = "[claim].[ValidateIsSTPClaim] @PolicyOwner, @InsuranceType, @ClaimType, @BenefitId, @ReportDate";
        public const string NonStpPersonEvents = "[claim].[NonStpPersonEventSearch]  @PageNumber,@RowsOfPage,@SortingCol, @SortType, @SearchCreatia, @RecordCount OUT";
        public const string CmcPoolData = "[claim].[CMCPoolSearch]  @PageNumber,@RowsOfPage,@SortingCol, @SortType, @SearchCreatia, @RecordCount OUT";
        public const string InvestigationPoolData = "[claim].[InvestigationPool]  @PageNumber,@RowsOfPage,@SortingCol, @SortType, @SearchCreatia, @RecordCount OUT";
        public const string AssesorPoolData = "[claim].[AssesorPool]  @PageNumber,@RowsOfPage,@SortingCol, @SortType, @SearchCreatia, @RecordCount OUT";

        public const string EventSearchStoredProcedure = "[claim].[EventSearch]  @PageNumber,@RowsOfPage,@SortingCol, @SortType, @SearchCreatia, @StartDate, @EndDate, @EventType, @ViewAll, @Filter, @RecordCount OUT";

        public const string MedicalSwitchBatchPersonEventSearchStoredProcedure = "[claim].[MedicalSwitchBatchPersonEventSearch]  @IndustryNumber, @SurName, @FirstName, @OtherInitial, @IDNumber, @OtherIDNumber, @DateOfBirthCriterion, @EmployeeNumber, @PassportNumber, @CountryOfPassportID, @EventID, @MainClaimRefNo, @DateOfEventCriterion, @PageNumber, @RowsOfPage, @SortingCol, @SortType, @RecordCount OUT";

        public const string GetMedicalEstimateLookupStoredProcedure = "[claim].[GetMedicalEstimateLookup] @EventTypeId,	@ICD10Codes , @ReportDate";
        public const string GetEventsWithNoNotificationSentStoredProcedure = "[claim].[GetEventsWithNoNotificationSent]";
        public const string GetAutoAdjudicateClaims = "[claim].[GetAutoAdjudicateClaims] @isNotificationOnly";
        public const string CheckCompCareDocumentsUploaded = "[claim].[CheckCompCareDocumentsUploaded] @CompcareClaimNumber ,@IdNumber";
        public const string GetCompCareMedicalReports = "[claim].[GetCompCareMedicalReports] @CompCarePersonEventId ";
        public const string GetCompCareDocumentsNotUploaded = "[claim].[GetCompCareDocumentsNotUploaded] @CompcareClaimNumber ,@IdNumber";
        public const string GetCorrectICD10CodeForIntegration = "[Claim].[GetCorrectICD10CodeForIntegration] @CompcarePersonEventId, @ICD10CodeId";

        public const string GetClaimValidationsSTPIntegrationStoredProcedure = "claim.USP_GetClaimDetailsForSTPIntegration @ClaimReferenceNumber";
        public const string CheckClaimMedicalBenefitsExistForSTPIntegration = "claim.USP_CheckClaimMedicalBenefitsExistForSTPIntegration @ClaimReferenceNumber";
        public const string GetClaimInjuryValidationsSTPIntegrationStoredProcedure = "claim.USP_GetClaimInjuryDetailsForSTPIntegration @ClaimReferenceNumber";
        public const string GetClaimsPendingAcknowledgement = "[claim].[GetClaimsPendingAcknowledgement] @isNotificationOnly";
        public const string GetClaimsPendingFinalization = "[claim].[GetClaimsPendingFinalization] @isNotificationOnly";//TODO: to be removed
        public const string CheckIfCompCareClaimIsStillSTP = "[claim].[CheckIfCompCareClaimIsStillSTP] @CompCarePersonEventId ";

        public const string SendCommunicationByServiceBusEnabled = "SendCommunicationByServiceBusEnabled";
        public const string GetSection40ClaimToReOpen = "[claim].[GetSection40ClaimToReOpen]";
        public const string GetDiseaseClaimsToAutoAcknowledge = "[claim].[GetDiseaseClaimsToAutoAcknowledge]";//TODO: to be removed
        public const string GetAccidentClaimsToAutoAcknowledge = "[claim].[GetAccidentClaimsToAutoAcknowledge]";//TODO: to be removed
        public const string GetClaimsToAutoAcknowledgeByEventType = "[claim].[GetClaimsToAutoAcknowledgeByEventType] @EventTypeId";
        public const string GetClaimToAcknowledge = "[claim].[GetClaimToAcknowledge] @PersonEventId";
        public const string ClaimInvoiceData = "[claim].[ClaimInvoiceSearch]  @PageNumber,@RowsOfPage,@SortingCol, @SortType, @SearchCreatia,@ClaimInvoiceType,@ClaimId, @RecordCount OUT";
        public const string ReinstateClaimInvoice = "[claim].[ReinstateClaimInvoice] @ClaimInvoiceId";
        public const string ClaimGetRejectedMainInvoice = "[claim].[ClaimGetRejectedMainInvoice]  @ClaimInvoiceType,@ClaimInvoiceId";
        public const string ClaimGetRejectedChildInvoice = "[claim].[ClaimGetRejectedChildInvoice]  @ClaimInvoiceType,@ClaimInvoiceId";
        public const string GetReferralTypeLimitConfiguration = "[claim].[GetReferralTypeLimitConfiguration]";
        public const string SaveReferralTypeLimitConfiguration = "[claim].[SaveReferralTypeLimitConfiguration] @ReferralTypeLimitConfigurationId,@ReferralTypeId,@Limit,@PermissionName,@RecordCount Out";
        public const string GetTTDs18MonthsOldSP = "[claim].[TTDsNearing18Months]";
        public const string GetPagedClaimInvoices = "[claim].[GetPagedClaimInvoices]  @PageNumber,@RowsOfPage,@SortingCol, @SortType, @SearchCreatia, @PersonEventId, @RecordCount OUT";
        public const string GetPagedClaimInvoicesByPersonEventId = "[claim].[GetPagedClaimInvoicesByPersonEventId]  @PageNumber,@RowsOfPage,@SortingCol, @SortType, @SearchCreatia, @PersonEventId, @RecordCount OUT";
        public const string ClaimMemberInsuredLivesStoredProcedure = "claim.MemberInsuredLives @Filter, @ShowActive, @PageIndex, @PageSize, @SortColumn, @SortOrder, @RecordCount OUT";
        public const string GetPagedClaimInvoiceAllocations = "[claim].[GetPagedClaimInvoiceAllocations]  @PersonEventId, @SearchTerm, @PageNumber, @RowsOfPage";
        public const string GetHcpsWithMMINearingExpiry = "[claim].[GetHcpsWithMMINearingExpiry]";
        public const string GetPensionClaimPDRecoveries = "[claim].[GetPensionClaimPdRecoveries] @RolePlayerId";

        //Claim Pools
        public const string GetPool = "[claim].[GetPool]  @PageNumber, @RowsOfPage, @SortingCol, @SortType, @SearchCreatia, @AssignedToUserId, @UserLoggedIn, @WorkpoolId, @IsUserBox, @RecordCount OUT";
    }
}
