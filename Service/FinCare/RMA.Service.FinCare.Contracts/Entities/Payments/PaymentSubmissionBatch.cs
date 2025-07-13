using System.Collections.Generic;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class PaymentSubmissionBatch
    {
        public int Id { get; set; } // Id (Primary key)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string Reference { get; set; }
        public List<Payment> Payments { get; set; } // Payment.FK_Payment_PaymentSubmissionBatch
    }
}
