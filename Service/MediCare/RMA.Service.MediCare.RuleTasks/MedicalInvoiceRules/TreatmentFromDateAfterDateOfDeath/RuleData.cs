using System;

namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TreatmentFromDateAfterDateOfDeath
{
    public class RuleData
    {
        public DateTime? TreatmentFromDate { get; set; }
        public DateTime? DateOfDeath { get; set; }
    }
}
