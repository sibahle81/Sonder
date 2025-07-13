using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class CollectionBankingDetail
    {
        public int RolePlayerId { get; set; }
        public string AccountNumber { get; set; } // AccountNumber (length: 50)
        public int BankBranchId { get; set; } // BankBranchId
        public BankAccountTypeEnum BankAccountType { get; set; } // BankAccountTypeId       
        public string BranchCode { get; set; } // BranchCode (length: 50)
    }
}
