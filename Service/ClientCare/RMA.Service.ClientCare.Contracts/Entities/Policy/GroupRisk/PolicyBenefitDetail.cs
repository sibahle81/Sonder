using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk
{
    public class PolicyBenefitDetail
    {
        public int BenefitDetailId { get; set; } // BenefitDetailId (Primary key)
        public int PolicyId { get; set; } // PolicyId
        public int BenefitId { get; set; } // BenefitId
        public System.DateTime StartDate { get; set; } // StartDate
        public System.DateTime? EndDate { get; set; } // EndDate
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public List<PolicyBenefitRate> BenefitRates { get; set; }
    }
}
