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

namespace RMA.Service.MediCare.Database.Entities
{
    public partial class medical_PreAuthRejectReason : IAuditableEntity, ISoftDeleteEntity, IEntityStatus
    {
        public int Id { get; set; } // Id (Primary key)
        public string Name { get; set; } // Name (length: 50)
        public string Description { get; set; } // Description (length: 1000)
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        // Reverse navigation

        /// <summary>
        /// Child medical_PreAuthBreakdownUnderAssessReasons where [PreAuthBreakdownUnderAssessReason].[UnderAssessReasonId] point to this entity (FK_PreAuthBreakdownUnderAssessReason_PreAuthRejectReason_UnderAssessReasonId)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_PreAuthBreakdownUnderAssessReason> PreAuthBreakdownUnderAssessReasons { get; set; } // PreAuthBreakdownUnderAssessReason.FK_PreAuthBreakdownUnderAssessReason_PreAuthRejectReason_UnderAssessReasonId
        /// <summary>
        /// Child medical_PreAuthorisationUnderAssessReasons where [PreAuthorisationUnderAssessReason].[UnderAssessReasonId] point to this entity (FK_PreAuthorisationUnderAssessReason_PreAuthRejectReason)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_PreAuthorisationUnderAssessReason> PreAuthorisationUnderAssessReasons { get; set; } // PreAuthorisationUnderAssessReason.FK_PreAuthorisationUnderAssessReason_PreAuthRejectReason

        public medical_PreAuthRejectReason()
        {
            PreAuthBreakdownUnderAssessReasons = new System.Collections.Generic.List<medical_PreAuthBreakdownUnderAssessReason>();
            PreAuthorisationUnderAssessReasons = new System.Collections.Generic.List<medical_PreAuthorisationUnderAssessReason>();
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
