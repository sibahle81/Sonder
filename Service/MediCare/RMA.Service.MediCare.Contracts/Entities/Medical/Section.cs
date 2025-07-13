namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class Section : Common.Entities.AuditDetails
    {
        public int SectionId { get; set; }
        public string SectionNo { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int PublicationId { get; set; }
    }
}
