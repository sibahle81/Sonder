using System.ComponentModel.DataAnnotations;

namespace RMA.Service.ClaimCare.Contracts.Enums
{
    public enum ClaimStatusEnum
    {
        [Display(Name = "New", GroupName = "New")]
        New = 1,
        [Display(Name = "Received", GroupName = "New")]
        Received = 2,
        [Display(Name = "Pending Requirements", GroupName = "Pending")]
        PendingRequirements = 3,
        [Display(Name = "Awaiting Decision", GroupName = "Pending")]
        AwaitingDecision = 4,
        [Display(Name = "Pending Policy Admin", GroupName = "Pending")]
        PendingPolicyAdmin = 5,
        [Display(Name = "Closed", GroupName = "Closed")]
        Closed = 6,
        [Display(Name = "Cancelled", GroupName = "Declined")]
        Cancelled = 7,
        [Display(Name = "Awaiting Reversal Decision", GroupName = "Reversed")]
        AwaitingReversalDecision = 8,
        [Display(Name = "Paid", GroupName = "Paid")]
        Paid = 9,
        [Display(Name = "Declined", GroupName = "Declined")]
        Declined = 10,
        [Display(Name = "Pending Investigations", GroupName = "Pending")]
        PendingInvestigations = 11,
        [Display(Name = "Investigation Completed", GroupName = "Pending")]
        InvestigationCompleted = 12,
        [Display(Name = "Approved", GroupName = "Approved")]
        Approved = 13,
        [Display(Name = "Authorised", GroupName = "Authorised")]
        Authorised = 14,
        [Display(Name = "Re-opened", GroupName = "Pending")]
        Reopened = 15,
        [Display(Name = "Ex-Gratia", GroupName = "Re-opened")]
        ExGratia = 16,
        [Display(Name = "Ex-Gratia Approved", GroupName = "Ex-Gratia")]
        ExGratiaApproved = 17,
        [Display(Name = "Ex-Gratia Authorised", GroupName = "Ex-Gratia")]
        ExGratiaAuthorised = 18,
        [Display(Name = "No Claim", GroupName = "Declined")]
        NoClaim = 19,
        [Display(Name = "Unclaimed", GroupName = "Unclaimed benefit")]
        Unclaimed = 20,
        [Display(Name = "Return To Assessor", GroupName = "Pending")]
        ReturnToAssessor = 21,
        [Display(Name = "Waived", GroupName = "Pending")]
        Waived = 22,
        [Display(Name = "Unpaid", GroupName = "Unpaid")]
        Unpaid = 23,
        [Display(Name = "Policy Admin Completed", GroupName = "Pending")]
        PolicyAdminCompleted = 24,
        [Display(Name = "Payment Recovery", GroupName = "Payment Recovery")]
        PaymentRecovery = 25,
        [Display(Name = "Awaiting Decline Decision", GroupName = "Awaiting Decline Decision")]
        AwaitingDeclineDecision = 26,
        [Display(Name = "Return To Assessor", GroupName = "Declined")]
        ReturnToAssessorAfterDeclined = 27,
        [Display(Name = "Reversed", GroupName = "Pending")]
        Reversed = 28,
        [Display(Name = "Reversal Rejected", GroupName = "Reversed")]
        ReversalRejected = 29,
        [Display(Name = "Legal Recovery", GroupName = "Legal Recovery")]
        LegalRecovery = 30,
        [Display(Name = "Repay", GroupName = "Pending")]
        Repay = 31,
        [Display(Name = "Payment Recovered", GroupName = "Payment Recovered")]
        PaymentRecovered = 33,
        [Display(Name = "Payment Loss", GroupName = "Payment Loss")]
        PaymentLoss = 34,
        [Display(Name = "Tracing", GroupName = "Tracing")]
        Tracing = 35,
        [Display(Name = "Submitted", GroupName = "New")]
        Submitted = 36,
        [Display(Name = "Pending Acknowledgement", GroupName = "Pending")]
        PendingAcknowledgement = 37,
        [Display(Name = "Auto-Acknowledged", GroupName = "Acknowledged")]
        AutoAcknowledged = 39,
        [Display(Name = "Finalized", GroupName = "Closed")]
        Finalized = 40,
        [Display(Name = "Closed", GroupName = "Closed")]
        ClaimClosed = 41,
        [Display(Name = "Open", GroupName = "Open")]
        Open = 42,
        [Display(Name = "Manually Acknowledged", GroupName = "Manually Acknowledged")]
        ManuallyAcknowledged = 44,
        [Display(Name = "Unacknowledged", GroupName = "Unacknowledged")]
        Unacknowledged = 45,
        [Display(Name = "Delete", GroupName = "Delete")]
        Deleted = 46,
        [Display(Name = "Unknown Status", GroupName = "Unknown Status")]
        UnknownStatus = 47,
        [Display(Name = "PR Pen Only", GroupName = "PR Pen Only")]
        PRPenOnly = 48,
    }
}
