using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class PaymentAllocationLookup
    {
        public int Id { get; set; }
        public int RolePlayerId { get; set; }
        public int BankStatementEntryId { get; set; }
        public string DebtorNumber { get; set; }
        public string DebtorName { get; set; }
        public string UserReference { get; set; }
        public DateTime? DateProcessed { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
    }
}
