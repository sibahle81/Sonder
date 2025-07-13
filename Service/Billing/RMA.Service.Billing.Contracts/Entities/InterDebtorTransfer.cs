using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class InterDebtorTransfer
    {
        public int InterDebtorTransferId { get; set; } // InterDebtorTransferId (Primary key)
        public decimal TransferAmount { get; set; } // TransferAmount
        public AllocationProgressStatusEnum? AllocationProgressStatus { get; set; } // AllocationProgressStatusId
        public string FromDebtorNumber { get; set; } // FromDebtorNumber (length: 50)
        public string ReceiverDebtorNumber { get; set; } // ReceiverDebtorNumber (length: 50)
        public string FromAccountNumber { get; set; }
        public string ReceiverAccountNumber { get; set; }
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public List<Transaction> Transactions { get; set; }
        public List<Note> InterDebtorTransferNotes { get; set; }
        public List<InterDebtorTransferDetail> InterDebtorTransferDetails { get; set; }
        public PeriodStatusEnum PeriodStatus { get; set; } = PeriodStatusEnum.Current;
        public int ReceiverRolePlayerId { get; set; }
        public bool ReceiverHasInvoicesOutstanding { get; set; }
    }
}
