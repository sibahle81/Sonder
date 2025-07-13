using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class RmaBankAccountTransaction
    {
        public int RmaBankAccountId { get; set; } // RmaBankAccountId (Primary key)
        public string Product { get; set; } // Product (length: 50)
        public string Description { get; set; } // Description (length: 255)
        public string AccountNumber { get; set; } // AccountNumber (length: 50)
        public List<UnallocatedBankImport> Transactions { get; set; }
    }
}
