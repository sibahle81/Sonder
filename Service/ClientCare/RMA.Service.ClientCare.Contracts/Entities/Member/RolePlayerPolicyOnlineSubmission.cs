using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class RolePlayerPolicyOnlineSubmission
    {
        public int RolePlayerPolicyOnlineSubmissionId { get; set; } // RolePlayerPolicyOnlineSubmissionId (Primary key)
        public int RolePlayerId { get; set; } // RolePlayerId
        public int PolicyId { get; set; } // PolicyId
        public RolePlayerPolicyDeclarationTypeEnum RolePlayerPolicyDeclarationType { get; set; } // RolePlayerPolicyDeclarationTypeId
        public int ProductId { get; set; } // ProductId
        public int DeclarationYear { get; set; } // DeclarationYear
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        public List<RolePlayerPolicyOnlineSubmissionDetail> RolePlayerPolicyOnlineSubmissionDetails { get; set; }
    }
}