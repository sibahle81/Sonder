namespace RMA.Service.Admin.MasterDataManager.Contracts.Constants
{
    public static class SystemSettings
    {
        public const string CampaignManagerSmtPort = "CampaignManager_SMTPPort";
        public const string CampaignManagerSmtpUsername = "CampaignManager_SMTPUsername";
        public const string CampaignManagerSmtpPassword = "CampaignManager_SMTPPassword";
        public const string CampaignManagerSmtpHost = "CampaignManager_SMTPHost";
        public const string CampaignManagerSmtpEnableSsl = "CampaignManager_SMTPEnableSSL";
        public const string HomeAffairsVerificationBaseUrl = "HomeAffairsVerification_BaseUrl";
        public const string HomeAffairsTransUnionVerificationBaseUrl = "HomeAffairsTransUnionVerificationBaseUrl";
        public const string HomeAffairsVerificationV2BaseUrl = "HomeAffairsVerificationV2_BaseUrl";
        public const string HomeAffairsSubcriptionKey = "HomeAffairs_SubcriptionKey";
        public const string HomeAffairsTransUnionSubcriptionKey = "HomeAffairsTransUnionSubcriptionKey";
        public const string HomeAffairsVerificationRequestHeaderKey = "HomeAffairs_Verification_RequestHeaderKey";

        public const string RMAFuneralGroupPolicyWelcomeLetter = "RMAFuneralGroupPolicyWelcomeLetter";
        public const string RMACFPFuneralWelcomeLetter = "RMACFPFuneralWelcomeLetter";
        public const string RMAConsolidatedFuneralPolicyScheduleEmailBody = "RMAConsolidatedFuneralPolicyScheduleEmailBody";
        public const string RMAFuneralGroupPolicyMembershipCertificate = "RMAFuneralGroupPolicyMembershipCertificate";
        public const string PolicyAmendmentCover = "PolicyAmendmentCover";
        public const string PaymentManagerEmailNotificationSender = "PaymentManager_EmailNotificationSender";
        public const string PaymentManagerEmailNotificationOverrideAddress = "PaymentManager_EmailNotificationOverrideAddress";
        public const string PaymentManagerIsLiveEnvironment = "PaymentManager_IsLiveEnvironment";
        public const string PaymentManagerFuneralIndividualBranch = "PaymentManager_Funeral_Individual_Branch";
        public const string PaymentManagerFuneralGroupBranch = "PaymentManager_Funeral_Group_Branch";
        public const string PaymentManagerSenderAccountConfigErrorRecipients = "PaymentManager_SenderAccountConfigError_Recipients";
        public const string PaymentManagerHyphenServiceErrorRecipients = "PaymentManager_HyphenServiceError_Recipients";
        public const string PaymentManagerFuneralCompanyCode = "PaymentManager_Funeral_CompanyCode";
        public const string PaymentManagerEmailLogo = "PaymentManager_EmailLogo";
        public const string COIDMedicalInvoiceCompanyNo = "COIDMedicalInvoiceCompanyNo";

        public const string SchedulerServer = "SchedulerServer";
        public const string IncludeNewPossibleBenefitsDue = "IncludeNewPossibleBenefitsDue";
        public const string AstuteUserName = "AstuteUserName";
        public const string AstutePassword = "AstutePassword";
        public const string AstuteUrl = "AstuteUrl";

        public const string HyphenAccountVerificationUrl = "HyphenAccountVerificationUrl";
        public const string HyphenAccountVerificationSubscriptionKey = "HyphenAccountVerificationSubscriptionKey";
        public const string HyphenFacsRequestUrl = "HyphenFacsRequestUrl";
        public const string HyphenFacsRequestSubscriptionKey = "HyphenFacsRequestSubscriptionKey";
        public const string HyphenStatementApiUrl = "HyphenStatementApiUrl";
        public const string HyphenStatementBaseApiUrl = "HyphenStatementBaseApiUrl";

        public const string SSRSBaseUrl = "ssrsBaseUrl";
        public const string SsrsServer = "SsrsServer";
        public const string SsrsEnvironment = "SsrsEnvironment";

        public const string RMAFuneralNewBusinessIndividualPolicyScheduleEmailBody = "RMAFuneralNewBusinessIndividualPolicyScheduleEmailBody";
        public const string RMAFuneralAmendedIndividualPolicyScheduleEmailBody = "RMAFuneralAmendedIndividualPolicyScheduleEmailBody";
        public const string AllowExternalCommunication = "AllowExternalCommunication";
        public const string PolicyManagerEmailNotificationSender = "PolicyManager_EmailNotificationSender";
        public const string PremiumListingEmailReceiver = "Premium_Listing_EmailReceiver";
        public const string ServiceBusTopicName = "ServiceBusTopicName";
        public const string ServiceBusSubscriptionName = "ServiceBusSubscriptionName";
        public const string ServiceBusConnectionString = "ServiceBusConnectionString";
        public const string RMAFuneralNewBusinessIndividualPolicyCancellationEmailBody = "RMAFuneralNewBusinessIndividualPolicyCancellationEmailBody";
        public const string RMAFuneralNewBusinessGroupPolicyMemberCertificateEmailBody = "RMAFuneralNewBusinessGroupPolicyMemberCertificateEmailBody";
        public const string InternalCommunicationEmails = "InternalCommunicationEmails";
        public const string Section55MaxCap05 = "Section55_MaxCap0_5";
        public const string ClaimNotificationOnly = "ClaimNotificationOnly";
        public const string Section55MaxCap14up = "Section55_MaxCap14up";
        public const string Section55MaxCap613 = "Section55_MaxCap6_13";
        public const string UnderOne = "ChildRuleUnder1";
        public const string ChildRuleUnder5 = "ChildRule1_5";
        public const string ChildRuleUnder13 = "ChildRule6_13";
        public const string ChildRuleUnder21 = "ChildRuleUnder14_21";
        public const string ChildRuleStudying24 = "ChildRuleStudying22_24";
        public const string ChildRuleDisabled200 = "ChildRuleDisabled_200";
        public const string MaximumCap21Up = "MaximumCap_21Up";
        public const string FuneralTracingMaxAmount = "FuneralTracingMaxAmount";
        public const string CoidBankAccount = "CoidBankAccount";
        public const string NonCoidBankAccount = "NonCoidBankAccount";
        public const string IntegrationScanCareDocumentConnectionString = "Integration:ScanCareDocumentConnectionString";
        public const string RMAOnePremiumMissedLetter = "RMAOnePremiumMissedLetter";
        public const string RMASecondPremiumMissedLetter = "RMASecondPremiumMissedLetter";
        public const string RMALapseLetter = "RMALapseLetter";
        public const string GoldWageName = "GoldWageName";
        public const string CoindProductId = "COIDProductId";
        public const string MaxDbRecords = "MaxDbRecords";
        public const string BenefitsFeatureFlag = "benefitsFeatureFlag";
        public const string LoadInsuredLivesFeatureFlag = "LoadInsuredLivesFeatureFlag";
        public const string PolicyIncreaseNotificationSms = "PolicyIncreaseNotificationSms";
        public const string PolicyIncreaseNotificationRecipient = "PolicyIncreaseNotificationRecipient";
        //Premium payback
        public const string PremiumPaybackNotificationSms = "PremiumPaybackNotificationSms";
        public const string PremiumPaybackConfirmationSms = "PremiumPaybackConfirmationSms";
        public const string PremiumPaybackAccount = "PremiumPaybackAccount";
        public const string PremiumPaybackCompany = "PremiumPaybackCompany";
        public const string PremiumPaybackBranch = "PremiumPaybackBranch";
        public const string PremiumPaybackErrorWizardRecipient = "PremiumPaybackErrorWizardRecipient";
        public const string PremiumPaybackApprovalWizardRecipient = "PremiumPaybackApprovalWizardRecipient";
        public const string PremiumPaybackNotificationTemplate = "PremiumPaybackNotificationTemplate";
        public const string PremiumPaybackFinancialRecipient = "PremiumPaybackFinancialRecipient";
        public const string PremiumPaybackFinancialTemplate = "PremiumPaybackFinancialTemplate";
        public const string PremiumPaybackPaymentRecipient = "PremiumPaybackPaymentRecipient";
        public const string PremiumPaybackPaymentTemplate = "PremiumPaybackPaymentTemplate";

        //NEW
        public const string AllowBrokerageBackDate = "AllowBrokerageBackDate";
        public const string AllowedDocumentTypes = "AllowedDocumentTypes";
        public const string Environment = "Environment";
        public const string FinancialPeriodSpillOverDays = "FinancialPeriodSpillOverDays";
        public const string InterBankTransferActionLink = "InterBankTransferActionLink";
        public const string NewMemberActivationLinkValidity = "NewMemberActivationLinkValidity";
        public const string NewMemberActivationLink = "NewMemberActivationLink";
        public const string NewMemberActivationHrefVopdSuccess = "NewMemberActivationHrefVopdSuccess";
        public const string MemberPortalQuoteLink = "MemberPortalQuoteLink";
        public const string NewMemberActivationHrefVopdFailure = "NewMemberActivationHrefVopdFailure";
        public const string MemberPasswordResetLinkValidity = "MemberPasswordResetLinkValidity";
        public const string MemberPasswordResetLink = "MemberPasswordResetLink";
        public const string MemberPasswordResetMessage = "MemberPasswordResetMessage";
        public const string NewMemberVopdFailedMessage = "NewMemberVopdFailedMessage";
        public const string NewMemberVopdSuccessMessage = "NewMemberVopdSuccessMessage";
        public const string MemberPortalQuoteMessage = "MemberPortalQuoteMessage";
        public const string NewMemberActivationLinkInvalid = "NewMemberActivationLinkInvalid";
        public const string NewMemberActivationLinkInactive = "NewMemberActivationLinkInactive";
        public const string NewMemberActivationSuccess = "NewMemberActivationSuccess";

        public const string SystemUser = "SystemUser";
        public const string SystemUserAccount = "system@randmutual.co.za";

        public const string MemberRole = "MemberRole";

        public const string SennaFSP = "SennaFSP";
        public const string SennaAccountDescription = "SennaAccountDescription";

        //Not Used
        public const string ActiveDomainDirectory = "ActiveDomainDirectory";
        public const string RMAClaimCareLogoFooter = "RMAClaimCareLogoFooter";
        public const string RMAClaimCareLogoHeader = "RMAClaimCareLogoHeader";
        public const string RMAFuneralEmailBody = "RMAFuneralEmailBody";
        public const string RMAFSPNumber = "RMA_FSPNumber";
        public const string SSRSReportEnvironmentDirectory = "SSRSReportEnvironmentDirectory";
        public const string SSRSReportManagerBearerToken = "SSRSReportManagerBearerToken";
        public const string ComissionFromBankAccountNumber = "Comission_FromBankAccountNumber";
        public const string SMSApiUrl = "SMSApiUrl";
        public const string SMSOcpApimSubscriptionKey = "SMSOcpApimSubscriptionKey";
        public const string EmailApiUrl = "EmailApiUrl";
        public const string EmailOcpApimSubscriptionKey = "EmailOcpApimSubscriptionKey";

        //compcare
        public const string CCClaimsAPIUrl = "CCClaimsAPIUrl";
        public const string CCClaimsOcpApimSubscriptionKey = "CCClaimsOcpApimSubscriptionKey";
        public const string CCMedicalReportAPIUrl = "CCMedicalReportAPIUrl";
        public const string CCMedicalReportOcpApimSubscriptionKey = "CCMedicalReportOcpApimSubscriptionKey";
        public const string HealthCareProviderAPIUrl = "HealthCareProviderAPIUrl";
        public const string HealthCareProviderOcpApimSubscriptionKey = "HealthCareProviderOcpApimSubscriptionKey";
        public const string ReportCategoriesAPIUrl = "ReportCategoriesAPIUrl";
        public const string ReportTypesAPIUrl = "ReportTypesAPIUrl";

        public const string InternalCommunicationSmsNumber = "InternalCommunicationSmsNumber";

        public const string RMAFuneralInvoice = "RMAFuneralInvoice";
        public const string RMACoidInvoice = "RMACoidInvoice";
        public const string PolicyApprovalCutOffDay = "PolicyApprovalCutOffDay";

        public const string FuneralCollectionsTransactionType = "FuneralCollectionsTransactionType";

        public const string ClaimsManagerEmailNotificationSender = "ClaimsManager_EmailNotificationSender";
        public const string RMACommissionStatementNotificationEmailBody = "RMACommissionStatementNotificationEmailBody";

        public const string RMAFuneralNewBusinessIndividualPolicyScheduleSmsMessage = "RMAFuneralNewBusinessIndividualPolicyScheduleSmsMessage";
        public const string RMAFuneralUpdatedPolicyScheduleSmsMessage = "RMAFuneralUpdatedPolicyScheduleSmsMessage";
        public const string RMAConsolidatedFuneralPolicyScheduleSmsMessage = "RMAConsolidatedFuneralPolicyScheduleSmsMessage";
        public const string ConsolidatedFuneralPremiumIncreaseSmsMessage = "ConsolidatedFuneralPremiumIncreaseSmsMessage";

        public const string RMACOIDQuoteAccectDeclineSmsMessage = "RMACOIDQuoteAccectDeclineSmsMessage";
        public const string PolicyScheduleShortUrl = "PolicyScheduleShortUrl";
        public const string QuoteAcceptDeclineShortUrl = "QuoteAcceptDeclineShortUrl";
        public const string PolicyDocumentsOneTimePinMessage = "PolicyDocumentsOneTimePinMessage";
        public const string BrokerageWelcomeLetterEmailBody = "BrokerageWelcomeLetterEmailBody";

        public const string BankStatementImportErrorRecipients = "BankStatementImportErrorRecipients";

        //DigiCare
        public const string IsCompCareMedicalReportStatusUpdateIntegrationLoggingRequired = "IsCompCareMedicalReportStatusUpdateIntegrationLoggingRequired";
        public const string DigiCareSourceSystemReference = "DigiCareSourceSystemReference";
        public const string IsHealthCareProviderSearchIntegrationLoggingRequired = "IsHealthCareProviderSearchIntegrationLoggingRequired";
        public const string IsClaimSearchIntegrationLoggingRequired = "IsClaimSearchIntegrationLoggingRequired";
        public const string IsMedicalReportCategoriesIntegrationLoggingRequired = "IsMedicalReportCategoriesIntegrationLoggingRequired";
        public const string IsMedicalReportTypesIntegrationLoggingRequired = "IsMedicalReportTypesIntegrationLoggingRequired";
        public const string IsSubmitCompCareMedicalReportIntegrationLoggingRequired = "IsSubmitCompCareMedicalReportIntegrationLoggingRequired";
        public const string MedicalFormUpdateStatusServiceBusConnectionString = "MedicalFormUpdateStatusServiceBusConnectionString";
        public const string MedicalFormUpdateStatusServiceBusSubscription = "MedicalFormUpdateStatusServiceBusSubscription";
        public const string MedicalFormUpdateStatusServiceBusTopic = "MedicalFormUpdateStatusServiceBusTopic";
        public const string DigiFormCapturerRole = "DigiFormCapturerRole";
        public const string NewHealthCareProviderRegistrationMessage = "NewHealthCareProviderRegistrationMessage";

        //Feature Flags
        public const string AllowBilling = "AllowBilling";
        public const string RMAFuneralStatement = "RMAFuneralStatement";
        public const int AdministratorRoleId = 1;

        //Member Portal
        public const string MemberPortalRoleIndividual = "MemberPortalRoleIndividual";
        public const string MemberPortalRoleBroker = "MemberPortalRoleBroker";
        public const string PremiumListingApprovedMessage = "PremiumListingApprovedMessage";
        public const string CaseApprovedMessage = "CaseApprovedMessage";
        public const string DelinkMemberPortalMessage = "DelinkMemberPortalMessage";
        public const string MemberPortalPolicyInformationReport = "PolicyInformationReport";
        public const string PremiumListingEmailTemplate = "PremiumListingEmailTemplate";
        public const string CreateIndividualCasePermission = "CreateIndividualCasePermission";
        public const string CreateGroupCasePermission = "CreateGroupCasePermission";
        public const string CreateManagePolicyCase = "CreateManagePolicyCase";
        public const string PremiumPaymentFileThreshold = "PremiumPaymentFileThreshold";
        public const string PremiumPaymentCutOffDay = "PremiumPaymentCutOffDay";

        // Fspe Integration
        public const string FSPEApiUrl = "FSPEApiUrl";
        public const string FSPEOcpApimSubscriptionKey = "FSPEOcpApimSubscriptionKey";
        public const string FSPESubscriptionListName = "FSPESubscriptionListName";
        public const string FSPESubscriptionServiceBusConnectionString = "FSPESubscriptionServiceBusConnectionString";
        public const string FSPESubscriptionServiceBusSubscription = "FSPESubscriptionServiceBusSubscription";
        public const string FSPESubscriptionServiceBusTopic = "FSPESubscriptionServiceBusTopic";
        public const string FSPERequestElapsedExpiry = "FSPERequestElapsedExpiry";
        public const string FSPESucessNotification = "FSPESucessNotification";
        public const string FSPEElapsedNotification = "FSPEElapsedNotification";
        public const string FSPENotificationRecepients = "FSPENotificationRecepients";

        // Leads
        public const string COIDProductId = "COIDProductId";
        public const string WizardConfigurationQuotation = "quotation";

        public const string LeadSLAStage1Days = "LeadSLAStage1Days";
        public const string LeadSLAStage2Days = "LeadSLAStage2Days";
        public const string LeadEscalationLevel1 = "Lead Escalation Level1";
        public const string LeadEscalationLevel2 = "Lead Escalation Level2";
        public const string LeadEscalationLevel2ManagerRole = "Membership Manager";
        public const string LeadEscalationNotificationSubject = "The lead is over the SLA count";
        public const string COIDQuoteEmailTemplate = "COIDQuoteEmailTemplate";
        public const string GPAProductId = "GPAProductId";
        public const string AccidentalDeathRate = "accidental_death_rate";
        public const string PermanentDisabilityRate = "permanent_disability_rate";
        public const string AccidentalDeathMultiple = "accidental_death_multiple";
        public const string PermanentDisabilityMultiple = "permanent_disability_multiple";
        public const string TotalDisabilityMultiple = "total_disability_multiple";
        public const string PartialDisabilityMultiple = "partial_disability_multiple";
        public const string MedicalRate = "medical_rate";
        public const string MedicalCover = "medical_cover";
        public const string TotalDisabilityRate = "total_disability_rate";
        public const string PartialDisabilityRate = "partial_disability_rate";
        public const string Expenses = "expenses_margin";
        public const string Contingency = "contingency_margin";
        public const string Profit = "profit_margin";

        public const string DefaultBrokerage = "DefaultBrokerage";
        public const string EuropAssistFee = "EuropAssistFee";

        public const string UnloggedTransactionCount = "UnloggedTransactionCount";
        public const string BatchEmailCount = "BatchEmailCount";

        public const string AccidentAcknowledgeSMS = "AccidentAcknowledgeSMS";
        public const string DiseaseAcknowledgeSMS = "DiseaseAcknowledgeSMS";
        public const string RequirementsOutstandingSMS = "RequirementsOutstandingSMS";
        public const string AdditionalDocumentRequest = "AdditionalDocumentRequest";
        public const string FollowUpSMS = "FollowUpSMS";
        public const string NotificationAcknowledgement = "NotificationAcknowledgement";
        public const string ClaimAcknowledgedSMS = "ClaimAcknowledgedSMS";
        public const string NotificationClosedSMS = "NotificationClosedSMS";

        public const string SuspiciousTransactionsAPI = "SuspiciousTransactionsAPI";
        public const string SuspiciousTransactionsSubscriptionKey = "SuspiciousTransactionsSubscriptionKey";
        public const string SuspiciousTransactionAuthorization = "SuspiciousTransactionAuthorization";
        public const string SuspiciousTransactionApiWorkspaces = "SuspiciousTransactionApiWorkspaces";
        public const string SuspiciousTransactionApiServices = "SuspiciousTransactionApiServices";
        public const string SuspiciousTransactionApiVersion = "SuspiciousTransactionApiVersion";

        public const string MedicalReportStandardTolerance = "MedicalReportStandardTolerance";
        public const string RadiologyreportTolerance = "RadiologyreportTolerance";

        public const string MedicalInvoiceAmountTolerance = "MedicalInvoiceAmountTolerance";

        public const string TwentyFourHrNoResponse = "24HrNoResponse";
        public const string FortyEightHrNoResponse = "48HrNoResponse";

        //MediCare
        public const string TotalMedicalEstimatesLimit = "TotalMedicalEstimatesLimit";
        public const string STPAutoPayLimit = "STPAutoPayLimit";
        public const string AutoPayLineItemsAllowedUnderAssessReasons = "AutoPayLineItemsAllowedUnderAssessReasons";
        public const string FranchiseMedInvAmtLimit = "FranchiseMedInvAmtLimit";
        public const string MedicalInvoiceCreationCount = "MedicalInvoiceCreationCount";
        public const string MedicalInvoiceAutoPayCount = "MedicalInvoiceAutoPayCount";
        public const string TebaPracticeNumberKey = "TebaPracticeNumberKey";

        //FinCare
        public const string BulkAllocationFileThreshold = "BulkAllocationFileThreshold";
        public const string TermsArrangementsInadequatePaymentNotification = "TermsArrangementsInadequatePaymentNotification";
        public const string TermsArrangementsMissedPaymentNotification = "TermsArrangementsMissedPaymentNotification";
        public const string TermsArrangementsInadequatePaymentEmailNotification = "TermsArrangementsInadequatePaymentEmailNotification";
        public const string TermsArrangementsMissedPaymentStatusUpdateNotification = "TermsArrangementsMissedPaymentStatusUpdateNotification";
        public const string WizardConfigurationId = "WizardConfigurationId";
        public const string TermsArrangementsMissedPaymentEmailNotification = "TermsArrangementsMissedPaymentEmailNotification";
        public const string TermsArrangementTwoMissedPayment = "TermsArrangementTwoMissedPayment";
        public const string GracePeriod = "GracePeriod";
        public const string TermsArrangementsIncompleteApplicationsEmailNotification = "TermsArrangementsIncompleteApplicationsEmailNotification";
        public const string TermsArrangementsPaymentsDueSoonRemindersEmailNotification = "TermsArrangementsPaymentsDueSoonRemindersEmailNotification";
        public const string IncompleteApplicationReminderFrequency = "IncompleteApplicationReminderFrequency";
        public const string IncompleteApplicationReminderMaxDays = "IncompleteApplicationReminderMaxDays";

        //Integration
        public const string MessageTypeSubscriptionServiceBusReceiveConnectionString = "MessageTypeSubscriptionServiceBusReceiveConnectionString";
        public const string MessageTypeSubscriptionServiceBusReceiveSubscription = "MessageTypeSubscriptionServiceBusReceiveSubscription";
        public const string MessageTypeSubscriptionServiceBusReceiveTopic = "MessageTypeSubscriptionServiceBusReceiveTopic";
        public const string MessageTypeSubscriptionServiceBusSendConnectionString = "MessageTypeSubscriptionServiceBusSendConnectionString";
        public const string MessageTypeSubscriptionServiceBusSendTopic = "MessageTypeSubscriptionServiceBusSendTopic";
        public const string IntegrationEnviroment = "IntegrationEnviroment";
        public const string ThreshHoldAmount = "ThreshHoldAmount";

        //ClientCare
        public const string MaxBenefitCoverLessTwoYears = "MaxBenefitCoverLessTwoYears";
        public const string MaxBenefitCover = "MaxBenefitCover";
        public const string MaxBenefitCoverEmailSender = "MaxBenefitCoverEmailSender";
        public const string MaxBenefitCoverEmailRecipient = "MaxBenefitCoverEmailRecipient";
        public const string LetterOfGoodStanding = "LetterOfGoodStanding";
        public const string MemberRenewalLetter = "MemberRenewalLetter";
        public const string DeclarationInitiationSms = "DeclarationInitiationSms";
        public const string ApplicationUrl = "ApplicationUrl";
        public const string ChildOverAgeNotification = "ChildOverAgeNotification";
        public const string ChildOverAgeFinalNotification = "ChildOverAgeFinalNotification";
        public const string ChildOverAgeEmailBody = "ChildOverAgeEmailBody";
        public const string ChildOverAgeEmailBodyFinal = "ChildOverAgeEmailBodyFinal";
        public const string MetalEstimatedEarnings = "MetalEstimatedEarnings";
        public const string MiningEstimatedEarnings = "MiningEstimatedEarnings";
        public const string OtherEstimatedEarnings = "OtherEstimatedEarnings";
        public const string NewPolicyNotificationRecipient = "NewPolicyNotificationRecipient";
        public const string NewPolicyNotificationMessageBody = "NewPolicyNotificationMessageBody";
        public const string StopOrderPaymentFileEmailBody = "StopOrderPaymentFileEmailBody";

        //ClaimCare Documents Follow Up
        public const string DocumentsFollowUpBody = "DocumentsFollowUpBody";
        public const string AcknowledgementBody = "AcknowledgementBody";
        public const string DailyTestEnvironmentSMSLimit = "DailyTestEnvironmentSMSLimit";
        public const string AcknowledgementRecords = "AcknowledgementRecords";
        public const string LiabilityAcceptanceMessage = "LiabilityAcceptanceSMS";
        public const string AcknowledgeDiseaseClaim = "AcknowledgeDiseaseClaim";
        public const string AcknowledgeAccidentClaim = "AcknowledgeAccidentClaim";
        public const string ZeroPercentClosureMessage = "ZeroPercentClosureMessage";
        public const string LiabiltyAcceptanceSubject = "Liability Acceptance Letter";
        public const string LiabilityAcceptanceFileName = "LiabilityAcceptanceLetter";
        public const string TTDRejected = "TTDRejected";
        public const string PdPaidCloseLetterSubject = "Pd Paid and Close Letter";
        public const string PdPaidCloseLetterFileName = "PdPaidCloseLetterSMS";
        public const string PdPaidCloseLetterMessage = "PdPaidCloseLetterSMS";
        public const string PdApprovedSubject = "Pd Approved Letter";
        public const string PdApprovedFileName = "PDApprovedLetter";
        public const string PdApprovedMessage = "PdApprovedMessage";
        public const string ClaimClosed = "ClaimClosed";
        public const string ClaimClosedSubject = "Claim Closed";
        public const string ClaimClosedFileName = "ClaimClosedLetter";
        public const string ClaimFuneralExp = "Funeral Expenses";
        public const string ClaimClosedNilPDFileName = "NilPDLetter";
        public const string ClaimClosedNilPDSubject = "Claim Closed - Nil PD";
        public const string TTDBenefit = "COID Temporary Total Disability(TTD)";
        public const string ClaimRecaptureSubject = "Claim Earnings Recapture";
        public const string ClaimRecaptureEarningsFileName = "ClaimRecaptureEarnings";
        public const string TTDRejectSubject = "TTD Reject Letter";
        public const string TTDRejectFileName = "TTDRejectLetter";
     
        //PensCare
        public const string RMAProofOfLife = "RMAProofOfLifeEmail";
        public const string PensionIncrease = "PensionIncreaseEmailTemplate";
        public const string UnsuccessfulCommutationEmailTemplate = "UnsuccessfulCommutationletterEmailTemplate";
        public const string SuccessfulCommutationEmailTemplate = "SuccessfulCommutationletterEmailTemplate";
        public const string ChildTurnsEighteen = "ChildTurnsEighteenEmailTemplate";
        public const string ChildExtensionEmailTemplate = "ChildExtensionEmailTemplate";
        public const string ChildToTurnEighteen = "ChildToTurnEighteenEmailTemplate";
        public const string PensionNotificationSender = "PensionNotificationSender";
        public const string SendChildExtensionNotificationEmailSender = "SendChildExtensionNotificationEmailSender";

        //Qlink
        public const string QlinkTransactionApiUrl = "QlinkTransactionApiUrl";
        public const string QlinkOcpApimSubscriptionKey = "QlinkOcpApimSubscriptionKey";
        public const string PauseQLinkMonthlyPremiumQueueListener = "PauseQLinkMonthlyPremiumQueueListener";
        public const string QlinkPersalPolicyStatusApiUrl = "QlinkPersalPolicyStatusApiUrl";
        public const string QLinkSubscriptionServiceBusReceiveConnectionString = "QLinkSubscriptionServiceBusReceiveConnectionString";
        public const string QLinkSubscriptionServiceBusReceiveSubscription = "QLinkSubscriptionServiceBusReceiveSubscription";
        public const string QLinkSubscriptionServiceBusReceiveTopic = "QLinkSubscriptionServiceBusReceiveTopic";
        public const string QLinkRequestApiUrl = "QLinkRequestApiUrl";
        public const string QLinkOcpApimSubscriptionKey = "QLinkOcpApimSubscriptionKey";
        public const string QLinkStartProcessingHour = "QLinkStartProcessingHour";
        public const string QLinkStopProcessingHour = "QLinkStopProcessingHour";
        public const string QlinkDailyStartProcessingHour = "QlinkDailyStartProcessingHour";
        public const string QlinkFalsePositiveSubscriptionServiceBusReceiveConnectionString = "QlinkFalsePositiveSubscriptionServiceBusReceiveConnectionString";
        public const string QlinkFalsePositiveSubscriptionServiceBusReceiveSubscription = "QlinkFalsePositiveSubscriptionServiceBusReceiveSubscription";
        public const string QlinkFalsePositiveSubscriptionServiceBusReceiveTopic = "QlinkFalsePositiveSubscriptionServiceBusReceiveTopic";

        //Cfp
        public const string CfpRequestApiUrl = "CfpRequestApiUrl";
        public const string CfpOcpApimSubscriptionKey = "CfpOcpApimSubscriptionKey";
        public const string CfpSubscriptionServiceBusReceiveConnectionString = "CfpSubscriptionServiceBusReceiveConnectionString";
        public const string CfpSubscriptionServiceBusReceiveSubscription = "CfpSubscriptionServiceBusReceiveSubscription";
        public const string CfpSubscriptionServiceBusReceiveTopic = "CfpSubscriptionServiceBusReceiveTopic";
        public const string CfpInvoiceAllocationBankAccountNumber = "CfpInvoiceAllocationBankAccountNumber";
        public const string CfpTabletCompanyName = "CfpTabletCompanyName";
        public const string CfpErrorRecipient = "CfpErrorRecipient";
        public const string CfpErrorMessageTemplate = "CfpErrorMessageTemplate";
        public const string CfpPolicyApprovedRecipient = "CfpPolicyApprovedRecipient";
        public const string CfpPolicyApprovedTemplate = "CfpPolicyApprovedTemplate";
        public const string CfpTop50PlusMunicipalitiesBankAccountNumber = "CfpTop50PlusMunicipalitiesBankAccountNumber";
        public const string CfpTop50PlusMunicipalitiesCompanyAcronymPlusReferenceList = "CfpTop50PlusMunicipalitiesCompanyAcronymPlusReferenceList";
        
        //Mvp
        public const string MvpRequestApiUrl = "MvpRequestApiUrl";
        public const string MvpOcpApimSubscriptionKey = "MvpOcpApimSubscriptionKey";
        public const string MvpSubscriptionServiceBusReceiveConnectionString = "MvpSubscriptionServiceBusReceiveConnectionString";
        public const string MvpSubscriptionServiceBusReceiveSubscription = "MvpSubscriptionServiceBusReceiveSubscription";
        public const string MvpSubscriptionServiceBusReceiveTopic = "MvpSubscriptionServiceBusReceiveTopic";
        public const string MvpInvoiceAllocationBankAccountNumber = "MvpInvoiceAllocationBankAccountNumber";
        public const string MvpTabletCompanyName = "MvpTabletCompanyName";
        public const string MvpErrorRecipient = "MvpErrorRecipient";
        public const string MvpErrorMessageTemplate = "MvpErrorMessageTemplate";
        public const string MvpPolicyApprovedRecipient = "MvpPolicyApprovedRecipient";
        public const string MvpPolicyApprovedTemplate = "MvpPolicyApprovedTemplate";
        public const string RMAMvpPolicyScheduleEmailBody = "RMAMvpPolicyScheduleEmailBody";
        public const string RMAMvpPolicyScheduleSmsBody = "RMAMvpPolicyScheduleSmsBody";
        public const string RMAMvpNameFilter = "RMAMvpNameFilter";
        public const string RMAMvpNewBusinessIndividualPolicyCancellationEmailBody = "RMAMvpNewBusinessIndividualPolicyCancellationEmailBody";

        //billing
        public const string TermArrangementMOAEmail = "TermsArrangementMOAEmail";
        public const string TermsUnsuccessfulInitiatonEmail = "TermsUnsuccessfulInitiatonEmail";
        public const string DebitOrderDaysInAdvance = "DebitOrderDaysInAdvance";
        public const string PdfDocPass = "PdfPassword";
        public const string RMACreditNoteMessage = "RMACreditNoteMessage";
        public const string TermArrangementTwoDaysBeforeMonthEnd = "TermArrangementTwoDaysBeforeMonthEnd";
        public const string RMACoidStatement = "RMACoidStatement";
        public const string TermsApplicationStatusEmail = "TermsApplicationStatusEmail";
        public const string MissingStatementBankAccountNumber = "MissingStatementBankAccountNumber";
        public const string InterbankAuthorizerRoleId = "InterbankAuthorizerRoleId";
        public const string BillingBankChart = "BillingBankChart";
        public const string SuspenseBSChart = "SuspenseBSChart";
        public const string StandardBSChart = "StandardBSChart";
        public const string UnearnedChart = "UnearnedChart";
        public const string BankandCashSpecialistRoleId = "BankandCashSpecialistRoleId";
        public const string InterBankTransferQueuedEmailNotification = "InterBankTransferQueuedEmailNotification";
        public const string BillingDisableCoidFeatureFlag = "Disable_COID_VAPS_E2E_Billing";
        public const string BankStatementProcessingCount = "BankStatementProcessingCount";
        public const string RefundFailedNotification = "RefundFailedNotification";
        public const string CollectionsEmail = "CollectionsEmail";
        public const string TermsDaysBeforeMonthendNotice = "TermsDaysBeforeMonthendNotice";
        public const string AllocatedLogDaysExtension = "AllocatedLogDaysExtension";
        public const string TermArrangementAdditionalGraceDays = "TermArrangementAdditionalGraceDays";

        //Sms Status 
        public const string SmsStatusSubscriptionServiceBusReceiveConnectionString = "SmsStatusSubscriptionServiceBusReceiveConnectionString";
        public const string SmsStatusSubscriptionServiceBusReceiveSubscription = "SmsStatusSubscriptionServiceBusReceiveSubscription";
        public const string SmsStatusSubscriptionServiceBusReceiveTopic = "SmsStatusSubscriptionServiceBusReceiveTopic";
        public const string PauseSmsPolicyScheduleDelivery = "PauseSmsPolicyScheduleDelivery";
        public const string LoadPolicyScheduleReferenceDataOnly = "LoadPolicyScheduleReferenceData";

        //Switch Batch
        public const string SwitchBatchSubscriptionServiceBusConnectionString = "SwitchBatchSubscriptionServiceBusConnectionString";
        public const string SwitchBatchSubscriptionServiceBusTopic = "SwitchBatchSubscriptionServiceBusTopic";
        public const string SwitchBatchSubscriptionServiceBusSubscription = "SwitchBatchSubscriptionServiceBusSubscription";
        public const string SwitchBatchApiUrl = "SwitchBatchApiUrl";
        public const string SwitchBatchOcpApimSubscriptionKey = "SwitchBatchOcpApimSubscriptionKey";

        //FNB Fintegrate
        public const string FintegrateIPAddress = "FintegrateIPAddress";
        public const string FintegrateIPAddressPort = "FintegrateIPAddressPort";
        public const string FintegrateRemoteFolder = "FintegrateRemoteFolder";
        public const string FintegrateUserName = "FintegrateUserName";
        public const string FintegratePassword = "FintegratePassword";

        //DebtCare Email 
        public const string DebtCareFromEmailAddress = "DebtCareFromEmailAddress";

        //MarketingCare 
        public const string MarketingCareUnsubscribeUrl = "MarketingCareUnsubscribeUrl";
        public const string MarketingCareAuthenticationKey = "MarketingCareAuthenticationKey";
        public const string MarketingCareFromEmailAddress = "MarketingCareFromEmailAddress";

        public const string FinanceTeamUserEmails = "FinanceTeamUserEmails";

        public const string FinCareDisableCoidFeatureFlag = "Disable_COID_VAPS_E2E_FinCare";
        public const string RMAPaymentSchedulePerBrokerReportEmailBody = "RMAPaymentSchedulePerBrokerReportEmailBody";
        public const string RMAPaymentSchedulePerBrokerReportEmaiFrom = "RMAPaymentSchedulePerBrokerReportEmaiFrom";
        public const string RMAPaymentSchedulePerBrokerReportEmaiBcc = "RMAPaymentSchedulePerBrokerReportEmaiBcc";

        // Azure AD
        public const string AzureAdClientId = "AzureAdClientId";
        public const string AzureAdTenantId = "AzureAdTenantId";
        public const string AzureAdClientSecret = "AzureAdClientSecret";

        // Exchange Monitor
        public const string ExchangeMonitorPollInterval = "ExchangeMonitorPollInterval";
        public const string ExchangeMonitorPageSize = "ExchangeMonitorPageSize";

        // Open AI
        public const string OpenAiApiKey = "OpenAiApiKey";
        public const string OpenAiUrl = "OpenAiUrl";

        //Sftp 
        public const string SftpSubmitRequestApiUrl = "SftpSubmitRequestApiUrl";
        public const string SftpQueryRequestStatusApiUrl = "SftpQueryRequestStatusApiUrl";
        public const string SftpOcpApimSubscriptionKey = "SftpOcpApimSubscriptionKey";
    }
}
