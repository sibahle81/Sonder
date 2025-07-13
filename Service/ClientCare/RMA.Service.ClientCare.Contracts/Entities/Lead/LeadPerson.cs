using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Lead
{
    public class LeadPerson
    {
        public int LeadId { get; set; } // LeadId (Primary key)
        public IdTypeEnum IdType { get; set; } // IdTypeId
        public string IdNumber { get; set; } // IdNumber (length: 15)
        public string FirstName { get; set; } // FirstName (length: 50)
        public string Surname { get; set; } // Surname (length: 50)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}