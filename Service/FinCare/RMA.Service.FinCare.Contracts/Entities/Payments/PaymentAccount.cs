using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class PaymentAccount : AuditDetails
    {
        public string AccountNumber { get; set; } // AccountNumber (length: 17)
        public string AccountNumberDesc { get; set; } // AccountNumberDesc (length: 100)
        public string TransactionType { get; set; } // TransactionType (length: 5)
        public string DocType { get; set; } // DocType (length: 2)
        public PaymentTypeEnum PaymentType { get; set; } // PaymentTypeId
        public ClientTypeEnum? ClientType { get; set; }
    }
}
