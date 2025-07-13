using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class RolePlayerPolicyTransaction
    {
        public int RolePlayerPolicyTransactionId { get; set; } // RolePlayerPolicyTransactionId (Primary key)
        public int TenantId { get; set; } // TenantId
        public int RolePlayerId { get; set; } // RolePlayerId
        public int PolicyId { get; set; } // PolicyId
        public int CoverPeriod { get; set; } // CoverPeriod
        public TransactionTypeEnum TransactionType { get; set; } // TransactionTypeId
        public string DocumentNumber { get; set; } // DocumentNumber (length: 50)
        public decimal? TotalAmount { get; set; } // TotalAmount
        public System.DateTime EffectiveDate { get; set; } // EffectiveDate
        public System.DateTime? SentDate { get; set; } // SentDate
        public RolePlayerPolicyTransactionStatusEnum RolePlayerPolicyTransactionStatus { get; set; } // RolePlayerPolicyTransactionStatusId
        public bool IsDeleted { get; set; } // isDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public SourceProcessEnum? SourceProcess { get; set; }
        public System.DateTime? DocumentDate { get; set; } // DocumentDate

        public List<RolePlayerPolicyTransactionDetail> RolePlayerPolicyTransactionDetails { get; set; }
    }
}