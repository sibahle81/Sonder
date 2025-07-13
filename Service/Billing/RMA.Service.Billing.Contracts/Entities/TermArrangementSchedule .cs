using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class TermArrangementSchedule
    {
        public int TermArrangementScheduleId { get; set; } // TermArrangementScheduleId (Primary key)
        public int TermArrangementId { get; set; } // TermArrangementId
        public string MemberName { get; set; }
        public string MemberNumber { get; set; }
        public string PolicyNumber { get; set; }
        public string NotificationMessage { get; set; }
        public decimal Amount { get; set; } // Amount
        public TermArrangementScheduleStatusEnum TermArrangementScheduleStatus { get; set; } // TermArrangementScheduleStatusId
        public decimal Balance { get; set; } // Balance
        public DateTime PaymentDate { get; set; } // PaymentDate
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public DateTime ModifiedDate { get; set; } // ModifiedDate
        public DateTime? AllocationDate { get; set; }
        public bool LoGProcessed { get; set; }
        public bool MissedPaymentProcessed { get; set; }
        public bool? IsCollectionDisabled { get; set; } // IsCollectionDisabled
        public bool CollectBalance { get; set; } // CollectBalance
        public List<AdhocPaymentInstructionsTermArrangementSchedule> AdhocPaymentInstructionsTermArrangementSchedules { get; set; } //AdhocPaymentInstructionsTermArrangementSchedules

    }
}
