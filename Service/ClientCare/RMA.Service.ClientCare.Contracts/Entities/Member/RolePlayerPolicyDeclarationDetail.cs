using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class RolePlayerPolicyDeclarationDetail
    {
        public int RolePlayerPolicyDeclarationDetailId { get; set; }
        public int RolePlayerPolicyDeclarationId { get; set; }
        public int ProductOptionId { get; set; }
        public CategoryInsuredEnum CategoryInsured { get; set; }
        public decimal Rate { get; set; }
        public int AverageNumberOfEmployees { get; set; } // represents total number of employees for entire cover cycle
        public decimal AverageEmployeeEarnings { get; set; } // represents total earnings of total employees for entire cover cycle
        public decimal? OriginalPremium { get; set; }
        public decimal Premium { get; set; }
        public decimal? LiveInAllowance { get; set; } // represents number of employees receiving live in allowance, not the earnings value
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public System.DateTime EffectiveFrom { get; set; }
        public System.DateTime EffectiveTo { get; set; }
    }
}