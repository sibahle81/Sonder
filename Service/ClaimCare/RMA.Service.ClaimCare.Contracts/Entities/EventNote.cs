using RMA.Common.Entities;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class EventNote : AuditDetails
    {
        public int EventNoteId { get; set; } // ClaimNoteId (Primary key)
        public int EventId { get; set; } // ClaimId
        public string Text { get; set; } // Text
        public new bool IsDeleted { get; set; } // IsDeleted
        public new string CreatedBy { get; set; } // CreatedBy (length: 50)
        public new System.DateTime CreatedDate { get; set; } // CreatedDate
        public new string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public new System.DateTime ModifiedDate { get; set; } // ModifiedD
    }
}