using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class EventCause
    {
        public int EventCauseId { get; set; } // EventCauseID (Primary key)
        public string Name { get; set; } // Name (length: 50)
        public string Code { get; set; } // Code (length: 12)
        public string Description { get; set; } // Description (length: 250)
        public EventTypeEnum EventType { get; set; } // EventTypeID
        public bool IsThirdPartyInvolved { get; set; } // IsThirdPartyInvolved
        public string Icd10Codes { get; set; } // ICD10Codes (length: 50)
        public int? DiseaseTypeId { get; set; } // DiseaseTypeID
        public int? AccidentTypeId { get; set; } // AccidentTypeID
        public int? EventActionId { get; set; } // EventActionID
        public int? EventActivityId { get; set; } // EventActivityID
        public int? EventAgentId { get; set; } // EventAgentID
        public bool? IsNeedEarnings { get; set; } // IsNeedEarnings
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 30)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public int EventTypeId
        {
            get => (int)EventType;
            set => EventType = (EventTypeEnum)value;
        }
    }
}