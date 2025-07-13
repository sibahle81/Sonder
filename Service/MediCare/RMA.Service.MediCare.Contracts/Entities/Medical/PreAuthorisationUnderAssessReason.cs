namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PreAuthorisationUnderAssessReason : Common.Entities.AuditDetails
    {
        public int PreAuthorisationUnderAssessReasonId { get; set; }
        public int PreAuthId { get; set; }
        public int UnderAssessReasonId { get; set; }
        public string UnderAssessReason { get; set; }
        public string Comments { get; set; }
    }
}
