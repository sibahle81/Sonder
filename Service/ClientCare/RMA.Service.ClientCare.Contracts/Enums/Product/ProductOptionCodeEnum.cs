using System.ComponentModel.DataAnnotations;

namespace RMA.Service.ClientCare.Contracts.Enums.Product
{
    public enum ProductOptionCodeEnum
    {
        [Display(Name = "AGLA")]
        ApprovedGLA = 1,
        [Display(Name = "UGLA")]
        UnApprovedGLA,
        [Display(Name = "SPO")]
        SpouseGroupLife,
        [Display(Name = "ULSD")]
        DisabilityLumpSum,
        [Display(Name = "DIB")]
        DisabilityIncome,
        [Display(Name = "TTD")]
        TotalTemporalDisability,
        [Display(Name = "CI")]
        CriticalIllness,
        [Display(Name = "FUNMF")]
        FuneralMemberFamily,
        [Display(Name = "FUNMFE")]
        FuneralMemberExtended
    }
}
