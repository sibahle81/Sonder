using System;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class TariffSearchCriteria
    {
        public int TariffId { get; set; }
        public string TariffCode { get; set; }
        public int TariffTypeId { get; set; }
        public string TariffType { get; set; }
        public string TariffDescription { get; set; }
        public int PractitionerTypeId { get; set; }
        public string PractitionerType { get; set; }
        public DateTime TariffDate { get; set; }
        public DateTime? ValidFrom { get; set; }
        public DateTime? ValidTo { get; set; }
        public decimal? ItemCost { get; set; }
        public decimal? BasicUnitCost { get; set; }
        public decimal? RecomendedUnits { get; set; }
        public string UnitType { get; set; }

        public bool IncludeNappi { get; set; }
        public int MedicalItemId { get; set; }
        public decimal DefaultQuantity { get; set; }
        public decimal TariffAmount { get; set; }
        public int TariffBaseUnitCostTypeId { get; set; }

        public TariffBaseUnitCost TariffBaseUnitCost { get; set; }
    }
}
