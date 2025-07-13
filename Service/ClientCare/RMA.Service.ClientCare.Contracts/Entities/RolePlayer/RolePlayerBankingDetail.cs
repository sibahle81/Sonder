using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class RolePlayerBankingDetail
    {
        public int RolePlayerId { get; set; } // RolePlayerId
        public int PurposeId { get; set; } // PurposeId
        public System.DateTime EffectiveDate { get; set; } // EffectiveDate
        public string AccountNumber { get; set; } // AccountNumber (length: 50)
        public int BankBranchId { get; set; } // BankBranchId
        public BankAccountTypeEnum BankAccountType { get; set; } // BankAccountTypeId
        public string AccountHolderName { get; set; } // AccountHolderName (length: 255)
        public string AccountHolderIdNumber { get; set; } // AccountHolderIdNumber (length: 50)
        public string BranchCode { get; set; } // BranchCode (length: 50)
        public string ApprovalRequestedFor { get; set; } // ApprovalRequestedFor (length: 50)
        public int? ApprovalRequestId { get; set; } // ApprovalRequestId
        public bool? IsApproved { get; set; } // IsApproved
        public string Reason { get; set; } // Reason (length: 255)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public int RolePlayerBankingId { get; set; } // RolePlayerBankingId (Primary key)
        public string BankName { get; set; }
        public bool IsForeign { get; set; }
        public string BankBranchName { get; set; }
        public string AccountType { get; set; }
        public string Initials { get; set; }
    }
}