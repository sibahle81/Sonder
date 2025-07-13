using System;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PaymentDetails : Common.Entities.AuditDetails
    {
        public int PaymentId { get; set; }
        public string PaymentStatus { get; set; }
        public bool IsReversal { get; set; }
        public string Payee { get; set; }
        public decimal Amount { get; set; }
        public DateTime DateAuthorised { get; set; }
        public DateTime DatePaid { get; set; }
        public string PaymentStatusReason { get; set; }
    }
}
