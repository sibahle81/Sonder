using System.ComponentModel.DataAnnotations;

namespace RMA.Service.ClaimCare.Contracts.Enums
{
    public enum ClaimReOpenReasonEnum
    {
        [Display(Name = "Ex-gratia")]
        Exgratia = 1,
        [Display(Name = "Incorrect claim decision")]
        Incorrectclaimdecision = 2,
        [Display(Name = "Ombudsman")]
        Ombudsman = 3,
        [Display(Name = "Outstanding Requirements received")]
        Outstandingrequirementsreceived = 4,
        [Display(Name = "Incorrectly Cancelled")]
        Incorrectlycancelled = 5,
        [Display(Name = "Pre-mature closure")]
        Prematureclosure = 6,
    }

    public enum ClaimRepayReasonEnum
    {
        [Display(Name = "Incorrect person")]
        Incorrectperson = 1,
        [Display(Name = "Ombudsman Instruction")]
        OmbudsmanInstruction = 2,
        [Display(Name = "Incorrect amount")]
        Incorrectamount = 3,
        [Display(Name = "Ex-gratia amount")]
        Exgratiaamount = 4,
        [Display(Name = "First payment rejected")]
        Firstpaymentrejected = 5,
        [Display(Name = "Legal instruction")]
        Legalinstruction = 6,
    }
}
