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
using RMA.Service.ClaimCare.Contracts.Enums;

namespace RMA.Service.ClaimCare.Database.Entities
{
    public partial class claim_PersonEventClaimRequirement : IAuditableEntity, ILazyLoadSafeEntity
    {
        public int PersonEventClaimRequirementId { get; set; } // PersonEventClaimRequirementId (Primary key)
        public int PersonEventId { get; set; } // PersonEventId
        public int ClaimRequirementCategoryId { get; set; } // ClaimRequirementCategoryId
        public string Instruction { get; set; } // Instruction (length: 500)
        public System.DateTime DateOpened { get; set; } // DateOpened
        public System.DateTime? DateClosed { get; set; } // DateClosed
        public bool IsDeleted { get; set; } // isDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 100)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 100)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public bool? IsMinimumRequirement { get; set; } // IsMinimumRequirement
        public bool? IsMemberVisible { get; set; } // IsMemberVisible

        // Foreign keys

        /// <summary>
        /// Parent claim_ClaimRequirementCategory pointed by [PersonEventClaimRequirement].([ClaimRequirementCategoryId]) (FK_PersonEventClaimRequirement_ClaimRequirementCategory)
        /// </summary>
        public virtual claim_ClaimRequirementCategory ClaimRequirementCategory { get; set; } // FK_PersonEventClaimRequirement_ClaimRequirementCategory

        /// <summary>
        /// Parent claim_PersonEvent pointed by [PersonEventClaimRequirement].([PersonEventId]) (FK_PersonEventClaimRequirement_PersonEvent)
        /// </summary>
        public virtual claim_PersonEvent PersonEvent { get; set; } // FK_PersonEventClaimRequirement_PersonEvent

        public claim_PersonEventClaimRequirement()
        {
            IsDeleted = false;
            CreatedDate = System.DateTime.Now;
            ModifiedDate = System.DateTime.Now;
            IsMinimumRequirement = false;
            IsMemberVisible = false;
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
