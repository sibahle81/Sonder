using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class CreditNoteAccount
    {
        public int RolePlayerId { get; set; }
        public List<int> PolicyIds { get; set; }
        public string FinPayeeNumber { get; set; }
        public bool IsAuthorised { get; set; }
        public string AuthorisedBy { get; set; }
        public DateTime? AuthorisedDate { get; set; }
        public List<Transaction> Transactions { get; set; }
        public Note Note { get; set; }
        public bool IsPaymentReAllocation { get; set; }
        public bool IsCreditNoteReAllocation { get; set; }
        public string ReAllocationOriginalFinPayeeNumber { get; set; }
        public PeriodStatusEnum PeriodStatus { get; set; } = PeriodStatusEnum.Current;
    }
}



