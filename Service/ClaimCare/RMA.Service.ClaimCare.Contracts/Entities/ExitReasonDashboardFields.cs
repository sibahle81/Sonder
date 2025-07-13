namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ExitReasonDashboardFields
    {
        public int PersonEventBucketClassId { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public bool Filter { get; set; }
    }
}