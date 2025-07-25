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
    public partial class medical_PractitionerTypeRCodeMapping : IAuditableEntity, ISoftDeleteEntity, IEntityStatus
    {
        public int PractitionerTypeId { get; set; } // PractitionerTypeID (Primary key)
        public string Icd10Code { get; set; } // ICD10Code (Primary key) (length: 20)
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        // Foreign keys

        /// <summary>
        /// Parent medical_PractitionerType pointed by [PractitionerTypeRCodeMapping].([PractitionerTypeId]) (FK_PractitionerTypeRCodeMapping_PractitionerType)
        /// </summary>
        public virtual medical_PractitionerType PractitionerType { get; set; } // FK_PractitionerTypeRCodeMapping_PractitionerType

        public medical_PractitionerTypeRCodeMapping()
        {
            IsActive = false;
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
