using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Broker
{
    public class BrokerageBankAccount
    {
        public int Id { get; set; } // Id (Primary key)
        public int BrokerageId { get; set; } // BrokerageId
        public DateTime EffectiveDate { get; set; } // EffectiveDate
        public string AccountNumber { get; set; } // AccountNumber (length: 50)
        public int BankBranchId { get; set; } // BankBranchId
        public BankAccountTypeEnum BankAccountType { get; set; } // BankAccountTypeId
        public string AccountHolderName { get; set; } // AccountHolderName (length: 255)
        public string BranchCode { get; set; } // BranchCode (length: 50)
        public string ApprovalRequestedFor { get; set; } // ApprovalRequestedFor (length: 50)
        public int? ApprovalRequestId { get; set; } // ApprovalRequestId
        public bool? IsApproved { get; set; } // IsApproved
        public string Reason { get; set; } // Reason (length: 255)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public DateTime ModifiedDate { get; set; } // ModifiedDate
        public BankAccountVerificationFeedbackEnum? BankAccountVerificationFeedback { get; set; } // BankAccountVerificationFeedbackId
    }
}
