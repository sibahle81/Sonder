using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class RolePlayerPolicyTransactionDetail
    {
        public int RolePlayerPolicyTransactionDetailId { get; set; } // RolePlayerPolicyTransactionDetailId (Primary key)
        public int RolePlayerPolicyTransactionId { get; set; } // RolePlayerPolicyTransactionId
        public int ProductOptionId { get; set; } // ProductOptionId (length: 10)
        public CategoryInsuredEnum CategoryInsured { get; set; } // CategoryInsuredId
        public decimal Rate { get; set; } // Rate
        public int NumberOfEmployees { get; set; } // NumberOfEmployees
        public decimal TotalEarnings { get; set; } // TotalEarnings
        public decimal? OriginalPremium { get; set; }
        public decimal Premium { get; set; } // Premium
        public int LiveInAllowance { get; set; } // LiveInAllowance
        public System.DateTime EffectiveFrom { get; set; } // EffectiveFrom
        public System.DateTime EffectiveTo { get; set; } // EffectiveTo
        public bool IsDeleted { get; set; } // IsDeleted
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
    }
}