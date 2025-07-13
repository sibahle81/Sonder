using System.ComponentModel.DataAnnotations;

namespace RMA.Common.Enums
{
    public enum RMADepartmentEnum
    {
        [Display(Name = "Unknown")]
        Unknown = 0,

        [Display(Name = "Billing")]
        Billing = 1,

        [Display(Name = "Claims")]
        Claims = 2,

        [Display(Name = "Contact Center")]
        ContactCenter = 3,

        [Display(Name = "Finance")]
        Finance = 4,

        [Display(Name = "ICT")]
        ICT = 5,

        [Display(Name = "Integration")]
        Integration = 6,

        [Display(Name = "Life Operations")]
        LifeOperations = 7,

        [Display(Name = "Medical")]
        Medical = 8,

        [Display(Name = "Membership")]
        Membership = 9,

        [Display(Name = "Pensions")]
        Pensions = 10,

        [Display(Name = "Sales And Marketing")]
        SalesAndMarketing = 11,

        [Display(Name = "Unspecified")]
        Unspecified = 12,

        [Display(Name = "Retentions")]
        Retentions = 13,

        [Display(Name = "Debtors")]
        Debtors = 14,

        [Display(Name = "Legal")]
        Legal = 15,
    }

    public enum DocumentSystemNameEnum
    {
        [Display(Name = "CommonManager")]
        CommonManager = 1,

        [Display(Name = "ProductManager")]
        ProductManager = 2,

        [Display(Name = "LeadManager")]
        LeadManager = 3,

        [Display(Name = "QuoteManager")]
        QuoteManager = 4,

        [Display(Name = "MemberManager")]
        MemberManager = 5,

        [Display(Name = "PolicyManager")]
        PolicyManager = 6,

        [Display(Name = "ClaimManager")]
        ClaimManager = 7,

        [Display(Name = "BillingManager")]
        BillingManager = 8,

        [Display(Name = "PensCareManager")]
        PensCareManager = 9,

        [Display(Name = "ChildExtensionManager")]
        ChildExtensionManager = 10,

        [Display(Name = "WizardManager")]
        WizardManager = 11,

        [Display(Name = "LegalCareManager")]
        LegalCareManager = 12,

        [Display(Name = "DebtCareManager")]
        DebtCareManager = 13,

        [Display(Name = "MediCareManager")]
        MediCareManager = 14,

        [Display(Name = "RolePlayerDocuments")]
        RolePlayerDocuments = 15,

        [Display(Name = "HcpManagerDocuments")]
        HcpManagerDocuments = 16
    }

    public enum BusinessAreaEnum
    {
        [Display(Name = "Unknown")]
        Unknown = 0,

        [Display(Name = "NewBusinessOnboarding")]
        NewBusinessOnboarding = 1,

        [Display(Name = "RetentionsCancellations")]
        RetentionsCancellations = 2,

        [Display(Name = "RetentionsFirstMissedPremiums")]
        RetentionsFirstMissedPremiums = 3,

        [Display(Name = "RetentionsSecondMissedPremiums")]
        RetentionsSecondMissedPremiums = 4,

        [Display(Name = "RetentionsLapsed")]
        RetentionsLapsed = 5,

        [Display(Name = "RetentionsOverAge")]
        RetentionsOverAge = 6,

        [Display(Name = "NewBusinessActivation")]
        NewBusinessActivation = 7,

        [Display(Name = "ClaimAccidentReporting")]
        ClaimAccidentReporting = 8,

        [Display(Name = "ClaimDiseaseNotification")]
        ClaimDiseaseNotification = 9,

        [Display(Name = "ClaimDocumentsFollowUp")]
        ClaimDocumentsFollowUp = 10,

        [Display(Name = "ClaimActionNotification")]
        ClaimActionNotification = 11,

        [Display(Name = "ClaimRecoveryNotification")]
        ClaimRecoveryNotification = 12,

        [Display(Name = "RetentionsReinstatements")]
        RetentionsReinstatements = 13,

        [Display(Name = "NewBusinessPolicyTransfer")]
        NewBusinessPolicyTransfer = 14,

        [Display(Name = "MembershipClientContactChange")]
        MembershipClientContactChange = 15,

        [Display(Name = "MembershipMemberDeclarations")]
        MembershipMemberDeclarations = 16,

        [Display(Name = "CFPolicyUpdate")]
        CFPolicyUpdate = 17,

        [Display(Name = "CFActivations")]
        CFActivations = 18,

        [Display(Name = "CFAnnualIncrease")]
        CFAnnualIncrease = 19,

        [Display(Name = "RetentionsBirthDay")]
        RetentionsBirthDay = 20,

        [Display(Name = "CFPremiumPayback")]
        CFPremiumPayback = 21,

        [Display(Name = "MissedPremiumCommunication")]
        MissedPremiumCommunication = 22,

        [Display(Name = "DebtCollection")]
        DebtCollection = 23,

        [Display(Name = "CampaignTargetAudience")]
        CampaignTargetAudience = 24,

        [Display(Name = "TemplatedSms")]
        TemplatedSms = 25,

        [Display(Name = "PaymentConfirmations")]
        PaymentConfirmations = 26,

        [Display(Name = "StopOrderPaymentFiles")]
        StopOrderPaymentFiles = 27
    }
}

