using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class FinPayee
    {
        public int RolePlayerId { get; set; } // RolePlayerId (Primary key)
        public string FinPayeNumber { get; set; } // FinPayeNumber (length: 50)
        public bool IsAuthorised { get; set; } // IsAuthorised
        public string AuthroisedBy { get; set; } // AuthroisedBy (length: 50)
        public System.DateTime? AuthorisedDate { get; set; } // AuthorisedDate
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public int IndustryId { get; set; }
        public DebtorStatusEnum? DebtorStatus { get; set; } // DebtorStatusId
    }
}