using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk
{
    public class PersonInsuredCategory
    {
        public int PersonInsuredCategoryId { get; set; } // PersonInsuredCategoryId (Primary key)
        public int PersonId { get; set; } // PersonId
        public int? PersonEmploymentId { get; set; } // PersonEmploymentId
        public int BenefitCategoryId { get; set; } // BenefitCategoryId
        public System.DateTime EffectiveDate { get; set; } // EffectiveDate
        public PersonInsuredCategoryStatusEnum? PersonInsuredCategoryStatus { get; set; } // PersonInsuredCategoryStatusId
        public System.DateTime? DateJoinedPolicy { get; set; } // DateJoinedPolicy
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public int BenefitDetailId { get; set; }
        public int RolePlayerTypeId { get; set; }

    }
}
