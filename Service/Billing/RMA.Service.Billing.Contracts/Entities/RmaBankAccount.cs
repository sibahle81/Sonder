namespace RMA.Service.Billing.Contracts.Entities
{
    public class RmaBankAccount
    {
        public int RmaBankAccountId { get; set; } // RmaBankAccountId (Primary key)
        public string Product { get; set; } // Product (length: 50)
        public string Description { get; set; } // Description (length: 255)
        public string AccountNumber { get; set; } // AccountNumber (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public string SearchFilter { get; set; }
    }
}
