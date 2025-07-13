namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class TreatmentProtocol : Common.Entities.AuditDetails
    {
        public int TreatmentProtocolId { get; set; }
        public int LevelOfCareId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }
}
