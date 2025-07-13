
namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class CommissionBand
    {
        public int CommissionBandId { get; set; } // CommissionBandId (Primary key)
        public string CommissionBandName { get; set; } // CommissionBandName (length: 50)
        public decimal MinSalaryBand { get; set; } // MinSalaryBand
        public decimal MaxSalaryBand { get; set; } // MaxSalaryBand
        public decimal CommissionRate { get; set; } // CommissionRate
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
