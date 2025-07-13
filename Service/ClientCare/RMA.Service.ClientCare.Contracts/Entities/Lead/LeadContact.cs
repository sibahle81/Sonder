using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Lead
{
    public class LeadContact
    {
        public int ContactId { get; set; } // ContactId (Primary key)
        public int LeadId { get; set; } // LeadId
        public string Name { get; set; } // Name (length: 150)
        public CommunicationTypeEnum CommunicationType { get; set; } // CommunicationTypeId
        public string CommunicationTypeValue { get; set; } // CommunicationTypeValue (length: 50)
        public bool IsPreferred { get; set; } // IsPreferred
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}