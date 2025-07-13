using System;

namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TreatmentFromDateBeforeEventDate
{
    public class RuleData
    {
        public DateTime? EventDate { get; set; }
        public DateTime? TreatmentFromDate { get; set; }
    }
}
