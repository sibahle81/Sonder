using RMA.Service.MediCare.Contracts.Entities.Medical;

using System.Collections.Generic;

namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.Modifier
{
    public class RuleData
    {
        public bool IsModifier { get; set; }
        public bool IsFirstLineModifier { get; set; }
        public List<InvoiceLineDetails> InvoiceLines { get; set; }
        public bool IsDentalLineModifier { get; set; }
        public bool IsMaxilloLineModifier { get; set; }
    }
}
