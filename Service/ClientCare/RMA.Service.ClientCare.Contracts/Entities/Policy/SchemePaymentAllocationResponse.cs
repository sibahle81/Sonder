using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class SchemePaymentAllocationResponse
    {
        public List<PaymentAllocationRecord> PaymentAllocationRecords { get; set; }
        public bool IsOperationSuccessFull { get; set; }
        public string ResponseMessage { get; set; }

        public SchemePaymentAllocationResponse()
        {
            this.PaymentAllocationRecords = new List<PaymentAllocationRecord>();
        }
    }
}
