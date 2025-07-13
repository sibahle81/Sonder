using RMA.Service.Admin.RulesManager.Contracts.Entities;

using System.Collections.Generic;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class SwitchInvoiceValidationModel
    {
        public RuleRequestResult RuleRequestResult { get; set; }
        public List<SwitchBatchInvoiceUnderAssessReason> InvoiceUnderAssessReasons { get; set; }
        public List<SwitchBatchInvoiceLineUnderAssessReason> InvoiceLineUnderAssessReasons { get; set; }
        public int ValidatedObjectId { get; set; }
    }
}
