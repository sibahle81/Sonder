using System;

namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.DateIsValid
{
    public class RuleData
    {
        public bool DateIsValid { get; set; }
        public DateTime? ReceivedDate { get; set; }
        public DateTime? SubmittedDate { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public DateTime? TreatmentFromDate { get; set; }
        public DateTime? TreatmentToDate { get; set; }
    }
}
