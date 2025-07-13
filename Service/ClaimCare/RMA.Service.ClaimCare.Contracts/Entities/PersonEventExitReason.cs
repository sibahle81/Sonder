namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PersonEventExitReason
    {
        public int ClaimStpExitReasonId { get; set; }
        public int PersonEventId { get; set; }
        public int StpExitReasonId { get; set; }
        public string ExitReasonName { get; set; }
        public string Description { get; set; }
        public System.DateTime CreatedDate { get; set; }
    }
}
