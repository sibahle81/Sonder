namespace RMA.Service.Billing.Contracts.Entities
{
    public class TermsArrangementNote
    {

        public int Id { get; set; } // Id (Primary key)
        public int TermArrangementId { get; set; } // TermArrangementId
        public int ItemId { get; set; } // ItemId
        public int ItemType { get; set; } // ItemType (length: 50)
        public string Text { get; set; } // Text
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

    }
}
