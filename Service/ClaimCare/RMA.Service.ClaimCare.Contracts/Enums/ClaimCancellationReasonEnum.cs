using System.ComponentModel.DataAnnotations;

namespace RMA.Service.ClaimCare.Contracts.Enums
{
    public enum ClaimCancellationReasonEnum
    {
        [Display(Name = "Default")]
        Default = 0,
        [Display(Name = "Captured in error")]
        Capturedinerror = 1,
        [Display(Name = "Duplicate claim")]
        Duplicateclaim = 2,
        [Display(Name = "Incorrect life assured")]
        Incorrectlifeassured = 3,
        [Display(Name = "Incorrect cause of death")]
        Incorrectcauseofdeath = 4,
        [Display(Name = "Admin error")]
        Adminerror = 5,
    }
}
