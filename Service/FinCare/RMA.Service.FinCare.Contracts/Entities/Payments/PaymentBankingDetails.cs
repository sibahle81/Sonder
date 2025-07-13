using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class PaymentBankingDetails
    {
        public int PaymentId { get; set; }
        public string Bank { get; set; }
        public string BankBranch { get; set; }
        public string AccountNumber { get; set; }
        public BankAccountTypeEnum AccountType { get; set; }
    }
}
