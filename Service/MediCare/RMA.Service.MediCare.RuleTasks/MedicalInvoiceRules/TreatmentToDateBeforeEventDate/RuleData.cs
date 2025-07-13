using System;

namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TreatmentToDateBeforeEventDate
{
    public class RuleData
    {
        public DateTime? EventDate { get; set; }
        public DateTime? TreatmentToDate { get; set; }
    }
}
