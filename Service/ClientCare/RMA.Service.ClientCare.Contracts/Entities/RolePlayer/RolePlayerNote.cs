namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class RolePlayerNote
    {
        public int RolePlayerNoteId { get; set; } // RolePlayerNoteId (Primary key)
        public int RolePlayerId { get; set; } // RolePlayerId
        public string Text { get; set; } // Text
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
