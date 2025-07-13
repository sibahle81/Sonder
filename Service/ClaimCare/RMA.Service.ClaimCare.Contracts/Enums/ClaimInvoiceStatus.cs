using System.ComponentModel.DataAnnotations;

namespace RMA.Service.ClaimCare.Contracts.Enums
{
    public enum ClaimInvoiceStatus
    {
        [Display(Name = "Unknown", GroupName = "Unknown")]
        Unknown = 0,
        [Display(Name = "Paid", GroupName = "Paid")]
        Paid = 1,
        [Display(Name = "Unpaid", GroupName = "Unpaid")]
        Unpaid = 2,
        [Display(Name = "Pending", GroupName = "Pending")]
        Pending = 3,
        [Display(Name = "Partially", GroupName = "Partially")]
        Partially = 4,
        [Display(Name = "Captured", GroupName = "Captured")]
        Captured = 5,
        [Display(Name = "Validated", GroupName = "Validated")]
        Validated = 6,
        [Display(Name = "Assessed", GroupName = "Assessed")]
        Assessed = 7,
        [Display(Name = "Allocated", GroupName = "Allocated")]
        Allocated = 8,
        [Display(Name = "Payment Requested", GroupName = "Payment Requested")]
        PaymentRequested = 9,
        [Display(Name = "Rejected", GroupName = "Rejected")]
        Rejected = 10,
        [Display(Name = "Finally Rejected", GroupName = "Finally Rejected")]
        FinallyRejected = 11,
        [Display(Name = "Deleted", GroupName = "Deleted")]
        Deleted = 12,
        [Display(Name = "Rejected 3rd party", GroupName = "Rejected 3rd Rejected")]
        Rejected3rdparty = 13,
        [Display(Name = "ReInstated", GroupName = "ReInstated")]
        ReInstated = 14,
        [Display(Name = "Queued", GroupName = "Queued")]
        Queued = 15,
        [Display(Name = "Requested For Approval", GroupName = "Requested For Approval")]
        RequestedForApproval = 16,
        [Display(Name = "Approved By SCA", GroupName = "Approved By SCA")]
        ApprovedBySCA = 17,
        [Display(Name = "Referred", GroupName = "Referred")]
        Referred = 18,
        [Display(Name = "Pending Authorization", GroupName = "Pending Authorization")]
        PendingAuthorization = 19,
        [Display(Name = "Converted To Pension", GroupName = "Converted To Pension")]
        ConvertedToPension = 20,
        [Display(Name = "Written Off", GroupName = "Written Off")]
        WrittenOff = 21,
        [Display(Name = "Payment Recalled", GroupName = "Payment Recalled")]
        PaymentRecalled = 22,
        [Display(Name = "Payment Reversed", GroupName = "Payment Reversed")]
        PaymentReversed = 23,
        [Display(Name = "Payment Rejected", GroupName = "Payment Rejected")]
        PaymentRejected = 24,
    }
}
