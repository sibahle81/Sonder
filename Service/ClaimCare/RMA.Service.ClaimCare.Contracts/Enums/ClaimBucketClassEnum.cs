using System.ComponentModel.DataAnnotations;

namespace RMA.Service.ClaimCare.Contracts.Enums
{
    public enum ClaimBucketClassEnum
    {
        [Display(Name = "Unclassified", GroupName = "Unclassified")]
        Unclassified = 0,
        [Display(Name = "Fatals", GroupName = "Fatals")]
        Fatals = 1,
        [Display(Name = "PD Pension", GroupName = "PDPension")]
        PDPension = 2,
        [Display(Name = "PD Lump", GroupName = "PD Lump")]
        PDLump = 3,
        [Display(Name = "Days <= 14", GroupName = "Days <= 14")]
        DaysLessOrEquals14 = 4,
        [Display(Name = "Days > 14", GroupName = "Days > 14")]
        DaysGreaterThan14 = 5,
        [Display(Name = "Medical", GroupName = "Medical")]
        Medical = 6,
        [Display(Name = "Treat & Return", GroupName = "Treat & Return")]
        TreatAndReturn = 7,
        [Display(Name = "1st Degree", GroupName = "1st Degree")]
        FirstDegree = 10,
        [Display(Name = "2nd Degree", GroupName = "2nd Degree")]
        SecondDegree = 11,
        [Display(Name = "No Award Expected", GroupName = "No Award Expected")]
        NoAwardExpected = 12,
        [Display(Name = "Current", GroupName = "Current")]
        Current = 13,
        [Display(Name = "Minor Injury", GroupName = "Minor Injury")]
        MinorInjury = 14,
        [Display(Name = "Notification Only", GroupName = "Notification Only")]
        NotificationOnly = 15,
    }
}
