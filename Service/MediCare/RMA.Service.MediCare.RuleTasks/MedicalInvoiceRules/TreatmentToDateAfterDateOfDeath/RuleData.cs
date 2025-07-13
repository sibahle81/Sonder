using System;

namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TreatmentToDateAfterDateOfDeath
{
    public class RuleData
    {
        public DateTime? TreatmentToDate { get; set; }
        public DateTime? DateOfDeath { get; set; }
    }
}
