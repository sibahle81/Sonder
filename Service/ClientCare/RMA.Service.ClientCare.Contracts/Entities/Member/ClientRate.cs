﻿namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class ClientRate
    {
        public int RatesId { get; set; } // RatesId (Primary key)
        public string Product { get; set; } // Product (length: 3)
        public string MemberNo { get; set; } // MemberNo (length: 10)
        public int Category { get; set; } // Category
        public string BenefitSet { get; set; } // BenefitSet (length: 40)
        public string RateType { get; set; } // RateType (length: 10)
        public decimal? Rate { get; set; } // Rate
        public System.DateTime? StartDate { get; set; } // StartDate
        public System.DateTime? EndDate { get; set; } // EndDate
        public string RefNo { get; set; } // RefNo (length: 50)
        public string CompanyName { get; set; } // CompanyName (length: 100)
        public string Industry { get; set; } // Industry (length: 200)
        public string IndustryGroup { get; set; } // IndustryGroup (length: 50)
        public decimal? IndRate { get; set; } // IndRate
        public decimal? PremRate { get; set; } // PremRate
        public decimal? GpLimited { get; set; } // GPLimited
        public decimal? FinalRate { get; set; } // FinalRate
        public decimal? DiscountOrLoading { get; set; } // DiscountOrLoading
        public string DiscountOrLoadingStatus { get; set; } // DiscountOrLoadingStatus (length: 50)
        public int? RatingYear { get; set; } // RatingYear
        public System.DateTime? LoadDate { get; set; } // LoadDate
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string PolicyNumber { get; set; }
    }
}