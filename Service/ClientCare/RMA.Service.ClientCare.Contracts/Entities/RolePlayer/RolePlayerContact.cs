using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class RolePlayerContact
    {
        public int RolePlayerContactId { get; set; } // RolePlayerContactId (Primary key)
        public int RolePlayerId { get; set; } // RolePlayerId
        public TitleEnum Title { get; set; } // TitleId
        public string Firstname { get; set; } // Firstname (length: 50)
        public string Surname { get; set; } // Surname (length: 50)
        public string EmailAddress { get; set; } // EmailAddress (length: 50)
        public string TelephoneNumber { get; set; } // TelephoneNumber (length: 11)
        public string ContactNumber { get; set; } // ContactNumber (length: 11)
        public CommunicationTypeEnum CommunicationType { get; set; } // CommunicationTypeId
        public ContactDesignationTypeEnum ContactDesignationType { get; set; } // ContactDesignationTypeId
        public bool IsDeleted { get; set; } // isDeleted
        public bool? IsConfirmed { get; set; } // IsConfirmed
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        public List<RolePlayerContactInformation> RolePlayerContactInformations { get; set; }
    }
}
