using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyBankVerificationDetails
    {
        public int PolicyId { get; set; }
        public string Initials { get; set; }
        public string Surname { get; set; }
        public string IdNumber { get; set; }
        public string BranchCode { get; set; }
        public string BankAccountNumber { get; set; }
        public BankAccountTypeEnum BankAccountType { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}