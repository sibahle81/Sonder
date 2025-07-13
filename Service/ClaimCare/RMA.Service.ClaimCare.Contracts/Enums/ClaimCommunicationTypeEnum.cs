using System.ComponentModel.DataAnnotations;

namespace RMA.Service.ClaimCare.Contracts.Enums
{
    public enum ClaimCommunicationTypeEnum
    {
        [Display(Name = "NotificationAcknowledgement", GroupName = "NotificationAcknowledgement")]
        NotificationAcknowledgement = 1,
        [Display(Name = "NotificationClosed", GroupName = "NotificationClosed")]
        NotificationClosed = 2,
        [Display(Name = "NotificationReceipt", GroupName = "NotificationReceipt")]
        NotificationReceipt = 3,
        [Display(Name = "DocumentsFollowUp", GroupName = "DocumentsFollowUp")]
        DocumentsFollowUp = 4,
        [Display(Name = "TeamLeaderNotification", GroupName = "TeamLeaderNotification")]
        TeamLeaderNotification = 5,
        [Display(Name = "LiabilityAcceptanceNotification", GroupName = "LiabilityAcceptanceNotification")]
        LiabilityAcceptanceNotification = 6,
        [Display(Name = "NotificationOfZeroPercentClosure", GroupName = "NotificationOfZeroPercentClosure")]
        NotificationOfZeroPercentClosure = 7,
        [Display(Name = "TTDRejected", GroupName = "TTDRejected")]
        TTDRejected = 8,
        [Display(Name = "PdPaidCloseLetter", GroupName = "PdPaidCloseLetter")]
        PdPaidCloseLetter = 9,
        [Display(Name = "CloseClaimNotification", GroupName = "CloseClaimNotification")]
        CloseClaimNotification = 10,
        [Display(Name = "RecaptureEarnings", GroupName = "RecaptureEarnings")]
        RecaptureEarnings = 11,
        [Display(Name = "RequestAdditionDocuments", GroupName = "RequestAdditionDocuments")]
        RequestAdditionDocuments = 12,
        [Display(Name = "PdApprovedLetter", GroupName = "PdApprovedLetter")]
        PdApprovedLetter = 13,
        [Display(Name = "NILPdLetter", GroupName = "NILPdLetter")]
        NILPdLetter = 14,
    }
}
