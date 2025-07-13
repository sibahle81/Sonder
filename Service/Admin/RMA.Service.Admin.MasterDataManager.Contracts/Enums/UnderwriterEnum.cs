using System.ComponentModel.DataAnnotations;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Enums
{
    public enum UnderwriterEnum
    {
        [Display(Name = "RMA Mutual Assurance")]
        RMAMutualAssurance = 1,
        [Display(Name = "RMA Life Assurance")]
        RMALifeAssurance = 2,
    }
}