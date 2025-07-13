namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class StmDashboardFields
    {
        public int EventTypeId { get; set; }
        public int ClaimTypeId { get; set; }
        public int PersonEventBucketClassId { get; set; }
        public int InsuranceTypeId { get; set; }
        public bool Filter { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
    }
}