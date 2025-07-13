namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PersonEventNote
    {
        public int PersonEventNoteId { get; set; } // PersonEventNoteId (Primary key)
        public int PersonEventId { get; set; } // PersonEventId
        public string Text { get; set; } // Text
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
