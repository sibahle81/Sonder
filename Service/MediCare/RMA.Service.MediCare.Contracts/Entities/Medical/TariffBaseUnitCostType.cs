namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class TariffBaseUnitCostType : Common.Entities.AuditDetails
    {
        public int TariffBaseUnitCostTypeId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }
}
