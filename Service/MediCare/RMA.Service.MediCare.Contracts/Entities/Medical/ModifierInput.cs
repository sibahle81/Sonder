using System;
using System.Collections.Generic;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ModifierInput
    {
        public string ModifierCode { get; set; }
        public string ModifierDescription { get; set; }
        public DateTime ModifierServiceDate { get; set; }
        public int HealthCareProviderId { get; set; }
        public int PractitionerTypeId { get; set; }
        public string TariffCode { get; set; }
        public DateTime TariffServiceDate { get; set; }
        public decimal TariffQuantity { get; set; }
        public decimal TariffAmount { get; set; }
        public decimal TariffDiscount { get; set; }
        public int TariffBaseUnitCostTypeId { get; set; }
        public int TariffTypeId { get; set; }
        public int PublicationId { get; set; }
        public bool IsModifier { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal PreviousLinesTotalAmount { get; set; }
        public InvoiceLineDetails PreviousInvoiceLine { get; set; }
        public List<InvoiceLineDetails> PreviousInvoiceLines { get; set; }
        public int TimeUnits { get; set; }
        public string SectionNo { get; set; }
        public decimal RecommendedUnits {  get; set; }
        public List<string> ReductionCodes { get; set; }
    }
}
