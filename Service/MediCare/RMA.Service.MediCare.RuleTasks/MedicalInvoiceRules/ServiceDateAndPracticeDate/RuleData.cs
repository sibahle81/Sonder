using System;

namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.ServiceDateAndPracticeDate
{
    public class RuleData
    {
        public DateTime? ServiceDate { get; set; }
        public DateTime? DatePracticeStarted { get; set; }
        public DateTime? DatePracticeClosed { get; set; }
    }
}
