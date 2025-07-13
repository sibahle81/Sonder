using System.ComponentModel.DataAnnotations;

namespace RMA.Service.ClaimCare.Contracts.Enums
{
    public enum AuditItemTypeEnum
    {
        [Display(Name = "Event")]
        Event = 0,
        [Display(Name = "Claim")]
        Claim = 1,
    }
}
