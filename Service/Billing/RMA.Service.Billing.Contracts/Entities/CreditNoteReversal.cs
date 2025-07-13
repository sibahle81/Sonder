using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class CreditNoteReversals
    {
        public int RolePlayerId { get; set; }
        public FinPayee DebtorAccount { get; set; }
        public string FinPayeeNumber { get; set; }
        public bool IsAuthorised { get; set; }
        public string AuthorisedBy { get; set; }
        public DateTime? AuthorisedDate { get; set; }
        public List<Transaction> Transactions { get; set; }
        public List<Note> Notes { get; set; }
        public string RequestCode { get; set; }
        public bool IsPaymentReAllocation { get; set; }
        public string ReAllocationReceiverFinPayeeNumber { get; set; }
        public bool IsCreditNoteReAllocation { get; set; }
        public PeriodStatusEnum PeriodStatus { get; set; } = PeriodStatusEnum.Current;
        public List<InvoiceAllocation> InvoiceAllocations { get; set; } = new List<InvoiceAllocation>();
        public int? ToRolePlayerId { get; set; }
    }
}
