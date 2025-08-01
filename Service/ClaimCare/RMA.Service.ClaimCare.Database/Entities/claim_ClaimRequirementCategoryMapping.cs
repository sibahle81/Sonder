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
    public partial class claim_ClaimRequirementCategoryMapping : IAuditableEntity, ILazyLoadSafeEntity
    {
        public int ClaimRequirementCategoryMappingId { get; set; } // ClaimRequirementCategoryMappingId (Primary key)
        public int ClaimRequirementCategoryId { get; set; } // ClaimRequirementCategoryId
        public EventTypeEnum EventType { get; set; } // EventTypeId
        public bool IsFatal { get; set; } // isFatal
        public bool IsMva { get; set; } // IsMVA
        public bool IsTrainee { get; set; } // IsTrainee
        public bool IsAssault { get; set; } // isAssault
        public bool IsDeleted { get; set; } // isDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 100)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 100)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public int? DiseaseTypeId { get; set; } // DiseaseTypeId
        public bool? IsMinimumRequirement { get; set; } // IsMinimumRequirement

        // Foreign keys

        /// <summary>
        /// Parent claim_ClaimRequirementCategory pointed by [ClaimRequirementCategoryMapping].([ClaimRequirementCategoryId]) (FK_ClaimRequirementCategoryMapping_ClaimRequirementCategory)
        /// </summary>
        public virtual claim_ClaimRequirementCategory ClaimRequirementCategory { get; set; } // FK_ClaimRequirementCategoryMapping_ClaimRequirementCategory

        public claim_ClaimRequirementCategoryMapping()
        {
            IsFatal = false;
            IsMva = false;
            IsTrainee = false;
            IsAssault = false;
            IsDeleted = false;
            CreatedDate = System.DateTime.Now;
            ModifiedDate = System.DateTime.Now;
            IsMinimumRequirement = false;
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
