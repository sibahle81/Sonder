using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyOption
    {
        public int PolicyOptionId { get; set; } // PolicyOptionId (Primary key)
        public int PolicyId { get; set; } // PolicyId
        public int ProductOptionOptionItemValueId { get; set; } // ProductOptionOptionItemValueId
        public System.DateTime EffectiveDate { get; set; } // EffectiveDate
        public decimal? OverrideValue { get; set; } // OverrideValue
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        public OptionItemFieldEnum? OptionItemField { get; set; }
    }
}
