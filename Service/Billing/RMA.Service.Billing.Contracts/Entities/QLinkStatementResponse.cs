using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class QLinkStatementResponse
    {
        public string StatusCode { get; set; }
        public string Message { get; set; }
        public string SalaryMonth { get; set; }
        public List<PaymentRecord> PaymentRecords { get; set; }
    }
}
