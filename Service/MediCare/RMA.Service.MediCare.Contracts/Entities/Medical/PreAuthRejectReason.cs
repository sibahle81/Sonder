namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PreAuthRejectReason : Common.Entities.AuditDetails
    {
        public int PreAuthRejectReasonId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }
}
