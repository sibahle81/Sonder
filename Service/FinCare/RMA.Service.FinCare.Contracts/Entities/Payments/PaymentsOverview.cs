

using System;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class PaymentsOverview
    {
        public DateTime Date { get; set; }
        public string PaymentType { get; set; }

        public string Product { get; set; }

        public string SenderAccountNo { get; set; }

        public decimal TotalAmount { get; set; }

        public int NoOfPayee { get; set; }

        public int NoOfTransactions { get; set; }
    }
}
