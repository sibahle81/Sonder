using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class InterBankTransfer
    {
        public int InterBankTransferId { get; set; }
        public int? FromTransactionId { get; set; } // FromTransactionId
        public int? ToTransactionId { get; set; } // ToTransactionId
        public int ToRmaBankAccountId { get; set; } // RmaBankAccountId (Primary key)
        public string ToAccountNumber { get; set; } // AccountNumber (length: 50)
        public int FromRmaBankAccountId { get; set; } // RmaBankAccountId (Primary key)
        public string FromAccountNumber { get; set; } // AccountNumber (length: 50)
        public decimal OriginalAmount { get; set; }
        public decimal TransferAmount { get; set; }
        public string ReceiverDebtorNumber { get; set; }
        public TransactionTypeEnum? TransactionType { get; set; }
        public string FromTransactionReference { get; set; }
        public string ToTransactionReference { get; set; }
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public AllocationProgressStatusEnum? AllocationProgressStatus { get; set; }
        public int? InterDebtorTransferId { get; set; }
        public InterDebtorTransfer InterDebtorTransfer { get; set; }
        public List<Note> InterBankTransferNotes { get; set; }
        public bool IsInitiatedByClaimPayment { get; set; }
        public PeriodStatusEnum PeriodStatus { get; set; } = PeriodStatusEnum.Current;
        public string RequestCode { get; set; }
        public List<InterBankTransferDetail> InterBankTransferDetails { get; set; }
        public int? FromRolePlayerId { get; set; } // FromRolePlayerId
        public int? ToRolePlayerId { get; set; } // ToRolePlayerId
    }
}
