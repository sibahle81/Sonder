using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimPaymentRequestMessage : ServiceBusMessageBase
    {
        public string Payee { get; set; } // PayeeDetails (length: 50)
        public string Bank { get; set; } // Bank (length: 50)
        public string BankBranch { get; set; } //BankBranch
        public string AccountNo { get; set; } // AccountDetails (length: 17)
        public decimal Amount { get; set; } // AmountPayable
        public string Product { get; set; } // Product (length: 50)
        public string IdNumber { get; set; } // IdNumber
        public string EmailAddress { get; set; } // EmailAddress
        public ClientTypeEnum ClientType { get; set; }
        public string ClaimReference { get; set; }
        public string PolicyReference { get; set; }
        public int PolicyId { get; set; } // PolicyId
        public int ClaimType { get; set; }
        public int AccountType { get; set; } // AccountTypeId
        public int ClaimId { get; set; } // ClaimId
        public int BeneficiaryId { get; set; } // BeneficiaryId

        //ENUM => ID Conversions
        public int ClientTypeId
        {
            get => (int)ClientType;
            set => ClientType = (ClientTypeEnum)value;
        }
    }
}
