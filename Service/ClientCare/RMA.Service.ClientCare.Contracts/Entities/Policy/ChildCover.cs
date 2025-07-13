namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class ChildCover
    {
        public int Id { get; set; }
        public int StartingAge { get; set; }
        public int EndingAge { get; set; }
        public decimal CoverPercentage { get; set; }
        public decimal MaxCapCover { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}
