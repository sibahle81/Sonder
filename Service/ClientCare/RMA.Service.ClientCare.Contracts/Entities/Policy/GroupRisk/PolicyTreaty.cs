using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk
{
    public class PolicyTreaty
    {
        public int PolicyTreatyId { get; set; } // PolicyTreatyId (Primary key)
        public int PolicyId { get; set; } // PolicyId
        public int TreatyId { get; set; } // TreatyId
        public System.DateTime EffectiveDate { get; set; } // EffectiveDate
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
