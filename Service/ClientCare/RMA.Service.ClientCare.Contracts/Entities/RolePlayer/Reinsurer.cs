using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class Reinsurer
    {
        public int RolePlayerId { get; set; } // RolePlayerId (Primary key)
        public string Code { get; set; } // Code (length: 30)
        public string Name { get; set; } // Name (length: 255)
        public string Description { get; set; } // Description (length: 255)
        public string FspNumber { get; set; } // FSPNumber (length: 50)
        public string CompanyRegNo { get; set; } // CompanyRegNo (length: 50)
        public string VatRegistrationNo { get; set; } // VatRegistrationNo (length: 50)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
