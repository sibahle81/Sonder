using System;
using System.ComponentModel.DataAnnotations;

public class DeathClaimResponse
{
    [Required]
    public string PolicyNumber { get; set; }

    [Required]
    public string ClaimReferenceNumber { get; set; }

    [Required]
    public string ClaimStatus { get; set; }

    [Required]
    public decimal ClaimAmount { get; set; }

    public decimal? ApprovedClaimAmountPaid { get; set; }

    public DateTime? ClaimPaymentDate { get; set; }

    public decimal? RepudiatedAmount { get; set; }

    public string ClaimRepudiationReason { get; set; }

    public DateTime? ClaimRepudiationDate { get; set; }

    public string ProductName { get; set; }

    public string StatusReason { get; set; }
    public string IdNumber { get; set; }
    public string MemberFirstName { get; set; }
    public string MemberLastName { get; set; }
    public string MemberRole { get; set; }

    public DateTime? ClaimChangeDate { get; set; }


}
