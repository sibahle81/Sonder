namespace RMA.Service.Billing.Contracts.Entities
{
    public class AdhocInterestCalculation
    {
        public int AdhocInterestCalculationId { get; set; } // AdhocInterestCalculation (Primary key)
        public System.DateTime Date { get; set; }   // 
        public string Reason { get; set; } // Reason (length: 50)
        public decimal Amount { get; set; } // Amount
        public int RolePlayerId { get; set; } // RolePlayerId
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)

    }
}
