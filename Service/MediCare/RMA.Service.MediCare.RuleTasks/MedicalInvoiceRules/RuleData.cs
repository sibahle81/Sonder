using System;

namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules
{
    public class RuleData
    {
        public DateTime? EventDate { get; set; }
        public DateTime? TreatmentFromDate { get; set; }
        public DateTime? TreatmentToDate { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public DateTime? DateOfDeath { get; set; }
    }
}
