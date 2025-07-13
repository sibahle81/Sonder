using System.ComponentModel.DataAnnotations;

namespace RMA.Service.ClaimCare.Contracts.Enums
{
    public enum ClaimReferralTypeLimitGroupEnum
    {
        [Display(Name = "Payment", GroupName = "Payment")]
        Payment = 1,
        [Display(Name = "Liability", GroupName = "Liability")]
        Liability = 2,
        [Display(Name = "Fatal", GroupName = "Fatal")]
        Fatal = 3,
        [Display(Name = "Pension", GroupName = "Pension")]
        Pension = 4,
        [Display(Name = "Investigation", GroupName = "Investigation")]
        Investigation = 5,
        [Display(Name = "Medical", GroupName = "Medical")]
        Medical = 6,
        [Display(Name = "TemporaryTotalDisablement", GroupName = "TemporaryTotalDisablement")]
        TemporaryTotalDisablement = 7,
        [Display(Name = "LumpSum", GroupName = "LumpSum")]
        LumpSum = 8,
        [Display(Name = "Legal", GroupName = "Legal")]
        Legal = 9,
        [Display(Name = "Recovery", GroupName = "Recovery")]
        Recovery = 10,
    }
}
