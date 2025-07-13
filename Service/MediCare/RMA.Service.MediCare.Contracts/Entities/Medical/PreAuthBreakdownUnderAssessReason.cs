namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PreAuthBreakdownUnderAssessReason : Common.Entities.AuditDetails
    {
        public new int Id { get; set; }
        public int PreAuthBreakdownId { get; set; }
        public int UnderAssessReasonId { get; set; }
        public string UnderAssessReason { get; set; }
        public string Comments { get; set; }
    }
}
