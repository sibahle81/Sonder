using System.Collections.Generic;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class TariffBaseUnitCost : Common.Entities.AuditDetails
    {
        public int TariffBaseUnitCostId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int PublicationId { get; set; }
        public decimal UnitPrice { get; set; }
        public int UnitTypeId { get; set; }
        public System.DateTime? ValidFrom { get; set; }
        public System.DateTime? ValidTo { get; set; }
        public int TariffTypeId { get; set; }
        public int? TariffBaseUnitCostTypeId { get; set; }
        public bool? IsCopiedFromNrpl { get; set; }
        public List<TariffBaseGazettedUnitCost> TariffBaseGazettedUnitCosts { get; set; }
}
}
