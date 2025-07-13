using RMA.Service.Admin.RulesManager.Contracts.Entities;

using System.Collections.Generic;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class InvoiceValidationModel
    {
        public RuleRequestResult RuleRequestResult { get; set; }
        public List<InvoiceUnderAssessReason> UnderAssessReasons { get; set; }
        public List<InvoiceLineUnderAssessReason> LineUnderAssessReasons { get; set; }
    }
}
