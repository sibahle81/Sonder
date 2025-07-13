using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class ProductBankAccount
    {
        public int ProductId { get; set; } // ProductId (Primary key)
        public int BankAccountId { get; set; } // BankAccountId (Primary key)
        public IndustryClassEnum IndustryClass { get; set; } // IndustryClassId (Primary key)
    }
}
