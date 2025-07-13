using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Lead
{
    public class Lead
    {
        public int LeadId { get; set; } // LeadId (Primary key)
        public string Code { get; set; } // Code (length: 20)
        public ClientTypeEnum ClientType { get; set; } // ClientTypeId
        public int? RolePlayerId { get; set; } // RolePlayerId
        public string DisplayName { get; set; } // DisplayName (length: 255)
        public System.DateTime ReceivedDate { get; set; } // ReceivedDate
        public LeadClientStatusEnum LeadClientStatus { get; set; } // LeadClientStatusId
        public LeadSourceEnum LeadSource { get; set; } // LeadSourceId
        public string DeclineReason { get; set; } // DeclineReason (length: 255)
        public string AssignedTo { get; set; } // AssignedTo (length: 50)

        public LeadCompany Company { get; set; }
        public LeadPerson Person { get; set; }
        public List<LeadAddress> Addresses { get; set; }
        public List<LeadContact> Contacts { get; set; }
        public List<LeadContactV2> ContactV2 { get; set; }
        public List<LeadNote> Notes { get; set; }

        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate




    }
}