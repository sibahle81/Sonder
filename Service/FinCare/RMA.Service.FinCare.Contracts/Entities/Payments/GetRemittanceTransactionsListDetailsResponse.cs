using System;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class GetRemittanceTransactionsListDetailsResponse
    {
        public int PaymentId { get; set; }
        public string BatchReference { get; set; }
        public string Reference { get; set; }
        public string Payee { get; set; }
        public DateTime ReconciliationDate { get; set; }
    }
}
