namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PatersonGrading
    {
        public int PatersonGradingId { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public bool IsSkilled { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}