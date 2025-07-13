namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PaymentAllocationDetails : Common.Entities.AuditDetails
    {
        public int AllocationId { get; set; }
        public string InvoiceType { get; set; }
        public decimal TotalAmount { get; set; }
        public int PayeeId { get; set; }
        public string PayeeName { get; set; }
        public string PayeeType { get; set; }
        public int AllocationStatusId { get; set; }
        public string AllocationStatus { get; set; }
        public int? MedicalInvoiceId { get; set; }
        public decimal AssessedAmount { get; set; }
        public decimal AssessedVat { get; set; }
    }
}
