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
    }
}
