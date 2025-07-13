namespace RMA.Service.Billing.Contracts.Entities
{
    public class AutoAllocationAccount
    {
        public int AutoAllocationBankAccountId { get; set; }
        public int BankAccountId { get; set; }
        public string BankAccountNumber { get; set; }
        public string Description { get; set; }
        public bool IsConfigured { get; set; } = false;
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public bool IsDeleted { get; set; } // IsDeleted
    }
}
