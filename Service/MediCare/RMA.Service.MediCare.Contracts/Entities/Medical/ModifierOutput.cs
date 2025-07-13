using System;
using System.Collections.Generic;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ModifierOutput
    {
        public string ModifierCode { get; set; }
        public string ModifierDescription { get; set; }
        public DateTime ModifierServiceDate { get; set; }
        public decimal ModifierQuantity { get; set; }
        public decimal ModifierAmount { get; set; }
        public decimal TotalIncusiveAmount { get; set; }
        public List<InvoiceLineDetails> ModifiedInvoiceLines { get; set; }
    }
}
