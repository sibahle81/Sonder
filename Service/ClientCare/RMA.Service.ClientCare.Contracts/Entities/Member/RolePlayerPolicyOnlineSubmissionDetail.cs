using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class RolePlayerPolicyOnlineSubmissionDetail
    {
        public int RolePlayerPolicyOnlineSubmissionDetailId { get; set; } // RolePlayerPolicyOnlineSubmissionDetailId (Primary key)
        public int RolePlayerPolicyOnlineSubmissionId { get; set; } // RolePlayerPolicyOnlineSubmissionId
        public int ProductOptionId { get; set; } // ProductOptionId
        public CategoryInsuredEnum CategoryInsured { get; set; } // CategoryInsuredId
        public int AverageNumberOfEmployees { get; set; } // AverageNumberOfEmployees
        public decimal AverageEmployeeEarnings { get; set; } // AverageEmployeeEarnings
        public decimal? LiveInAllowance { get; set; } // LiveInAllowance
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}