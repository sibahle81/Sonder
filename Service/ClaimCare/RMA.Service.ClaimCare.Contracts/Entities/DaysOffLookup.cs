﻿
namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class DaysOffLookup
    {
        public int DaysOffLookupId { get; set; }
        public decimal Minimum { get; set; }
        public decimal Average { get; set; }
        public decimal Maximum { get; set; }
        public System.DateTime StartDate { get; set; }
        public System.DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}