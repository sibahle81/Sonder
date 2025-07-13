namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class TariffType : Common.Entities.AuditDetails
    {
        public int TariffTypeId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsBaseType { get; set; }
    }
}
