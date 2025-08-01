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
    public partial class medical_ServiceDrgGroup : IAuditableEntity, ISoftDeleteEntity, IEntityStatus
    {
        public int ServiceDrgGroupId { get; set; } // ServiceDRGGroupId (Primary key)
        public int ServiceId { get; set; } // ServiceId
        public int? Icd10DiagnosticGroupId { get; set; } // ICD10DiagnosticGroupId
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        // Foreign keys

        /// <summary>
        /// Parent medical_Icd10DiagnosticGroup pointed by [ServiceDRGGroup].([Icd10DiagnosticGroupId]) (FK_medical_ServiceDRGGroup_ICD10DiagnosticGroupId)
        /// </summary>
        public virtual medical_Icd10DiagnosticGroup Icd10DiagnosticGroup { get; set; } // FK_medical_ServiceDRGGroup_ICD10DiagnosticGroupId

        public medical_ServiceDrgGroup()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
