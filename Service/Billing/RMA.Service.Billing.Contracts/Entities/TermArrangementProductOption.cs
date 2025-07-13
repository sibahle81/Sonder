namespace RMA.Service.Billing.Contracts.Entities
{
    public class TermArrangementProductOption
    {
        public int TermArrangementProductOptionId { get; set; } // TermArrangementProducOptionId (Primary key)
        public int ProductOptionId { get; set; } // ProductOptionId
        public int TermArrangementId { get; set; } // TermArrangementId
        public decimal ContractAmount { get; set; } // ContractAmount
        public string ProductOptionName { get; set; }
        public string FinPayenumber { get; set; }
        public int RoleplayerId { get; set; }
    }
}
