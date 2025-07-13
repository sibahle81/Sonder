namespace RMA.Service.ClientCare.Contracts.Entities.Lead
{
    public class LeadNote
    {
        public int NoteId { get; set; } // NoteId (Primary key)
        public int LeadId { get; set; } // LeadId
        public string Note { get; set; } // Note (length: 1000)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}