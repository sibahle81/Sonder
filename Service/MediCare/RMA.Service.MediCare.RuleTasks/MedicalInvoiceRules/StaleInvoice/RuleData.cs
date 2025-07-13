using System;

namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.StaleInvoice
{
    public class RuleData
    {
        public DateTime? TreatmentFromDate { get; set; }
        public DateTime? TreatmentToDate { get; set; }
    }
}
