using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk
{
    public class PolicyBenefitRate
    {
        public int BenefitRateId { get; set; } // BenefitRateId (Primary key)
        public int BenefitDetailId { get; set; } // BenefitDetailId
        public int? BenefitCategoryId { get; set; } // BenefitCategoryId
        public System.DateTime EffectiveDate { get; set; } // EffectiveDate
        public string BillingBasis { get; set; } // BillingBasis (length: 1)
        public decimal RateValue { get; set; } // RateValue
        public RateStatusEnum RateStatus { get; set; } // RateStatusId
        public bool IsPercentageSplit { get; set; } // IsPercentageSplit
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
