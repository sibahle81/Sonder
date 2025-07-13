namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class Publication : Common.Entities.AuditDetails
    {
        public int PublicationId { get; set; }
        public string PublicationNo { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int TariffTypeId { get; set; }
        public System.DateTime ValidFrom { get; set; }
        public System.DateTime ValidTo { get; set; }
    }
}
