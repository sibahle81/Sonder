namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class EstimateType
    {
        public int EstimateTypeId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsAlwaysApplicable { get; set; }
        public int ClaimEstimateGroupId { get; set; }
        public bool IsRecoverable { get; set; }
        public bool? IncludeVat { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}
