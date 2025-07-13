namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class TariffBaseGazettedUnitCost
    {
        public int TariffBaseGazettedUnitCostId { get; set; } // TariffBaseGazettedUnitCostId (Primary key)
        public int TariffBaseUnitCostId { get; set; } // TariffBaseUnitCostId
        public string Description { get; set; } // Description (length: 100)
        public decimal GazettedPercentageApplied { get; set; } // GazettedPercentageApplied
        public System.DateTime EffectiveFrom { get; set; } // EffectiveFrom
        public System.DateTime? EffectiveTo { get; set; } // EffectiveTo
        public decimal UnitPrice { get; set; } // UnitPrice
        public bool IsDeleted { get; set; } // IsDeleted
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
    }
}
