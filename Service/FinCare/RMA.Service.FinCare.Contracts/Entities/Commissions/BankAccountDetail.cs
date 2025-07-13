using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.FinCare.Contracts.Entities.Commissions
{
    public class BankAccountDetail
    {
        public int BankBranchId { get; set; }
        public string AccountNumber { get; set; }
        public string AccountHolderName { get; set; }
        public string BranchCode { get; set; }
        public BankAccountTypeEnum? BankAccountType { get; set; }
    }
}
