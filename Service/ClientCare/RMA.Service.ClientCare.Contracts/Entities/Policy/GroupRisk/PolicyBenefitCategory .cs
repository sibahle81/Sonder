using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk
{
    public class PolicyBenefitCategory
    {
        public int BenefitCategoryId { get; set; } // BenefitCategoryId (Primary key)
        public int BenefitDetailId { get; set; } // BenefitDetailId
        public string Name { get; set; } // Name (length: 50)
        public string Description { get; set; } // Description (length: 100)
        public System.DateTime StartDate { get; set; } // StartDate
        public System.DateTime? EndDate { get; set; } // EndDate
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
