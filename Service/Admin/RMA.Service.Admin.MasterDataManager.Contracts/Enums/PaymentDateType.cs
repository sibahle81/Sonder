using System.ComponentModel.DataAnnotations;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Enums
{
    public enum PaymentDateType
    {
        [Display(Name = "None")]
        None = 0,

        [Display(Name = "Transaction")]
        Transaction = 1,

        [Display(Name = "Processed")]
        Processed = 2,

        [Display(Name = "Received")]
        Received = 3
    }
}