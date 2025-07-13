using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Broker
{
    public class BrokerageContact
    {
        public int Id { get; set; } // Id (Primary key)
        public int BrokerageId { get; set; } // BrokerageId
        public string FirstName { get; set; } // FirstName (length: 255)
        public string LastName { get; set; } // LastName (length: 255)
        public string IdNumber { get; set; } // IdNumber (length: 50)
        public int? IdType { get; set; } // IdType
        public ContactTypeEnum ContactType { get; set; } // ContactTypeId
        public string Email { get; set; } // Email (length: 255)
        public string TelephoneNumber { get; set; } // TelephoneNumber (length: 20)
        public string MobileNumber { get; set; } // MobileNumber (length: 20)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public DateTime? DateOfBirth { get; set; } // DateOfBirth
    }
}
