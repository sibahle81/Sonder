using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class InterDebtorTransferDetail
    {
        public int InterDebtorTransferDetailId { get; set; } // InterDebtorTransferDetailId (Primary key)
        public decimal Amount { get; set; } // Amount
        public int InterDebtorTransferId { get; set; } // InterDebtorTransferId
        public DateTime CreatedDate { get; set; } // CreatedDate
        public DateTime ModifiedDate { get; set; } // ModifiedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public int LinkedTransactionId { get; set; }
    }
}
