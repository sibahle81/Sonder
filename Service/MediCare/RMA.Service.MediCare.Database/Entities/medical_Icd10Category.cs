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
    public partial class medical_Icd10Category : IAuditableEntity, ISoftDeleteEntity, IEntityStatus
    {
        public int Icd10CategoryId { get; set; } // ICD10CategoryId (Primary key)
        public string Icd10CategoryCode { get; set; } // ICD10CategoryCode (length: 8)
        public string Icd10CategoryDescription { get; set; } // ICD10CategoryDescription (length: 1000)
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        // Reverse navigation

        /// <summary>
        /// Child medical_Icd10SubCategory where [ICD10SubCategory].[ICD10CategoryId] point to this entity (FK_ICD10SubCategory_ICD10Category)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_Icd10SubCategory> Icd10SubCategory { get; set; } // ICD10SubCategory.FK_ICD10SubCategory_ICD10Category

        public medical_Icd10Category()
        {
            IsActive = true;
            IsDeleted = false;
            CreatedDate = System.DateTime.Now;
            ModifiedDate = System.DateTime.Now;
            Icd10SubCategory = new System.Collections.Generic.List<medical_Icd10SubCategory>();
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
