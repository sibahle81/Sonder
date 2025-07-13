namespace RMA.Service.Billing.Contracts.Entities
{
    public class AdhocPaymentInstructionsTermArrangementSchedule
    {
        public int AdhocPaymentInstructionsTermArrangementScheduleId { get; set; } // AdhocPaymentInstructionsTermArrangementScheduleId (Primary key)
        public int AdhocPaymentInstructionId { get; set; } // AdhocPaymentInstructionId
        public int TermArrangementScheduleId { get; set; } // TermArrangementScheduleId
        public decimal Amount { get; set; } // Amount
        public bool IsDeleted { get; set; } // IsDeleted
        public bool IsActive { get; set; } // IsActive
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public AdhocPaymentInstruction AdhocPaymentInstruction { set; get; } // AdhocPaymentInstruction
    }
}
