namespace RMA.Service.Billing.Contracts.Entities
{
    public class PaymentRecord
    {
        public string OperationType { get; set; }
        public string Payroll { get; set; }
        public string EmployeeNumber { get; set; }
        public string Surname { get; set; }
        public string Initials { get; set; }
        public string IdNumber { get; set; }
        public string ReferenceNumber { get; set; }
        public int Amount { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public string DeductionType { get; set; }
        public string Department { get; set; }
        public string Location { get; set; }
        public string BranchCode { get; set; }
        public string AppointmentCode { get; set; }
        public string Partner { get; set; }
        public string SalaryMonth { get; set; }
        public string ClaimCheckReference { get; set; }
        public string HyphenDateReceived { get; set; }
        public string HyphenDateProcessed { get; set; }
        public string StatementDate { get; set; }
        public int Commission { get; set; }
        public int Premium { get; set; }
    }
}
