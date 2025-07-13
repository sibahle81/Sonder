using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class Event
    {
        public int EventId { get; set; } // EventId (Primary key)
        public string EventReferenceNumber { get; set; } // EventReferenceNumber (length: 50)
        public string Description { get; set; } // Description (length: 2048)
        public EventTypeEnum EventType { get; set; } // EventTypeId
        public EventStatusEnum EventStatus { get; set; } // EventStatusId
        public AdviseMethodEnum AdviseMethod { get; set; } // AdviseMethodId
        public int? RiskAddressId { get; set; } // RiskAddressId
        public System.DateTime DateAdvised { get; set; } // DateAdvised
        public System.DateTime EventDate { get; set; } // EventDate
        public int? WizardId { get; set; } // WizardId
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public LocationCategoryEnum? LocationCategory { get; set; } // LocationCategoryID
        public int? NumberOfInjuredEmployees { get; set; } // NumberOfInjuredEmployees
        public int? NumberOfDeceasedEmployees { get; set; } // NumberOfDeceasedEmployees
        public int? MemberSiteId { get; set; } // MemberSiteId

        public List<EventNote> EventNotes { get; set; }
        public List<PersonEvent> PersonEvents { get; set; }

        public RolePlayer CompanyRolePlayer { get; set; }
        public ProductCategoryTypeEnum? ProductCategoryType { get; set; }
    }
}