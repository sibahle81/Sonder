namespace RMA.Service.ClaimCare.Contracts.Entities
{
    using Admin.MasterDataManager.Contracts.Enums;

    using Enums;

    public class ClaimNote
    {
        public int ClaimNoteId { get; set; } // ClaimNoteId (Primary key)
        public int EventId { get; set; }
        public int? PersonEventId { get; set; }
        public int ClaimId { get; set; } // ClaimId
        public string Text { get; set; } // Text
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public PersonEventStatusEnum? PersonEventStatus { get; set; } // PersonEventStatusId
        public ClaimStatusEnum? ClaimStatus { get; set; } // ClaimStatusId
        public string Reason { get; set; }
    }
}
