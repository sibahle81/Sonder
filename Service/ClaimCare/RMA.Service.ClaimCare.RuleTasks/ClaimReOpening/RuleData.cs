using System;

namespace RMA.Service.ClaimCare.RuleTasks.ClaimReOpening
{
    public class RuleData
    {
        public DateTime EventDate { get; set; }

        public DateTime RequestDate { get; set; }

        public bool HasActiveTreatments { get; set; }
        public bool HasActiveInvoices { get; set; }
        public bool HasActiveMedicalReportForms { get; set; }
    }
}
