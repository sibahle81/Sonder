using System.ComponentModel.DataAnnotations;

namespace RMA.Service.ClaimCare.Contracts.Enums
{
    public enum ClaimAccidentCloseLetterTypeEnum
    {
        [Display(Name = "NillPdLetter", GroupName = "NillPdLetter")]
        NillPdLetter = 1,
        [Display(Name = "PdPaid0To30Percent", GroupName = "PdPaid0To30Percent")]
        PdPaid0To30Percent = 2,
        [Display(Name = "LiabilityNotAccepted", GroupName = "LiabilityNotAccepted")]
        LiabilityNotAccepted = 3,
        [Display(Name = "InterimReason", GroupName = "InterimReason")]
        InterimReason = 4,
        [Display(Name = "Repuadiate", GroupName = "Repuadiate")]
        Repuadiate = 5,
        [Display(Name = "PdPaidCloseLetter", GroupName = "PdPaidCloseLetter")]
        PdPaidCloseLetter = 6,
    }
}
