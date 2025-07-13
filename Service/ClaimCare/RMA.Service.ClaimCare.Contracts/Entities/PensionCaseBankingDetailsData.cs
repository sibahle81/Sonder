using System;
namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PensionCaseBankingDetailsData
    {
        public int BankId { get; set; }
        public int BankBranchId { get; set; }
        public int AccountType { get; set; }
        public string BranchCode { get; set; }
        public string AccountHolder { get; set; }
        public string AccountNumber { get; set; }
        public DateTime EffectiveDate { get; set; }
        public int RolePlayerId { get; set; }
        public string AccountHolderName { get; set; }
        public string AccountHolderSurname { get; set; }
    }
}
