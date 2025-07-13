using RMA.Common.Entities;

using System;

namespace RMA.Service.FinCare.Contracts.Entities.Commissions
{
    public class CommissionInvoicePaymentAllocation : AuditDetails
    {
        public int InvoicePaymentAllocationId { get; set; }
        public int InvoiceId { get; set; }
        public decimal Amount { get; set; }
        public DateTime TransactionDate { get; set; }
        public int TransactionTypeLinkId { get; set; }
        public bool IsProcessed { get; set; }
    }
}
