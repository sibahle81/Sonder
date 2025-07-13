using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class RolePlayerContactInformation
    {
        public int RolePlayerContactInformationId { get; set; } // RolePlayerContactInformationId (Primary key)
        public int RolePlayerContactId { get; set; } // RolePlayerContactId
        public ContactInformationTypeEnum ContactInformationType { get; set; } // ContactInformationTypeId
        public bool IsDeleted { get; set; } // isDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

    }
}
