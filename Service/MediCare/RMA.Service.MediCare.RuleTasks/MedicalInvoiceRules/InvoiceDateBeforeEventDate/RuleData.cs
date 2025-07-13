using System;

namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.InvoiceDateBeforeEventDate
{
    public class RuleData
    {
        public DateTime? EventDate { get; set; }
        public DateTime? InvoiceDate { get; set; }
    }
}
