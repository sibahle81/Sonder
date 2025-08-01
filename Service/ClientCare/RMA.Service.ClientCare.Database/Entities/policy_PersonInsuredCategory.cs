//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//		
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using RMA.Common.Database.Contracts.Repository;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Database.Entities
{
    public partial class policy_PersonInsuredCategory : IAuditableEntity, ISoftDeleteEntity
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
        public int BenefitDetailId { get; set; } // BenefitDetailId
        public int RolePlayerTypeId { get; set; } // RolePlayerTypeId

        public policy_PersonInsuredCategory()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
