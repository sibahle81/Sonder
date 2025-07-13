namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class LoadRate
    {
        public int RatesId { get; set; } // RatesId (Primary key)
        public string Product { get; set; } // Product (length: 255)
        public string MemberNo { get; set; } // MemberNo (length: 50)
        public int Category { get; set; } // Category
        public decimal Rate { get; set; } // Rate
        public int RatingYear { get; set; } // RatingYear
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}