namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ClinicalUpdateTreatmentProtocol : Common.Entities.AuditDetails
    {
        public int ClinicalUpdateTreatmentProtocolId { get; set; }
        public int ClinicalUpdateId { get; set; }
        public int TreatmentProtocolId { get; set; }
        public string TreatmentProtocolDescription { get; set; }
    }
}
