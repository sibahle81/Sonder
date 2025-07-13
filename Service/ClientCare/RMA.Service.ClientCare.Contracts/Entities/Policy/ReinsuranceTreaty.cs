using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class ReinsuranceTreaty
    {
        public int TreatyId { get; set; } // TreatyId (Primary key)
        public int ReinsurerId { get; set; } // ReinsurerId
        public string TreatyNumber { get; set; } // TreatyNumber (length: 20)
        public string TreatyName { get; set; } // TreatyName (length: 100)
        public int TreatyTypeId { get; set; } // TreatyTypeId
        public System.DateTime StartDate { get; set; } // StartDate
        public System.DateTime? EndDate { get; set; } // EndDate
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
