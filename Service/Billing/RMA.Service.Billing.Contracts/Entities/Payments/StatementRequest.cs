using System;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities.Payments
{
    public class StatementRequest
    {
        public string SalaryMonth { get; set; }
        public List<PaymentStagingRecord> PaymentRecords { get; set; }
        public Guid FileIdentifier { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
        public string StatementNumber { get; set; }
    }
}
