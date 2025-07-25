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
    public partial class medical_ClinicalUpdate : IAuditableEntity, ISoftDeleteEntity, IEntityStatus
    {
        public int ClinicalUpdateId { get; set; } // ClinicalUpdateId (Primary key)
        public int PreAuthId { get; set; } // PreAuthId
        public string Diagnosis { get; set; } // Diagnosis (length: 2048)
        public string Medication { get; set; } // Medication (length: 2048)
        public string Comments { get; set; } // Comments (length: 2048)
        public System.DateTime? VisitCompletionDate { get; set; } // VisitCompletionDate
        public decimal? InterimAccountBalance { get; set; } // InterimAccountBalance
        public System.DateTime? DischargeDate { get; set; } // DischargeDate
        public string SubsequentCare { get; set; } // SubsequentCare (length: 200)
        public short? UpdateSequenceNo { get; set; } // UpdateSequenceNo
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public int? StatusId { get; set; } // StatusId
        public string ReviewComment { get; set; } // ReviewComment (length: 1000)
        public System.DateTime? ReviewDate { get; set; } // ReviewDate

        // Reverse navigation

        /// <summary>
        /// Child medical_ClinicalUpdateTreatmentPlans where [ClinicalUpdateTreatmentPlan].[ClinicalUpdateId] point to this entity (FK_ClinicalUpdateTreatmentPlan_ClinicalUpdate)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_ClinicalUpdateTreatmentPlan> ClinicalUpdateTreatmentPlans { get; set; } // ClinicalUpdateTreatmentPlan.FK_ClinicalUpdateTreatmentPlan_ClinicalUpdate
        /// <summary>
        /// Child medical_ClinicalUpdateTreatmentProtocols where [ClinicalUpdateTreatmentProtocol].[ClinicalUpdateId] point to this entity (FK_ClinicalUpdateTreatmentProtocol_ClinicalUpdate)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_ClinicalUpdateTreatmentProtocol> ClinicalUpdateTreatmentProtocols { get; set; } // ClinicalUpdateTreatmentProtocol.FK_ClinicalUpdateTreatmentProtocol_ClinicalUpdate
        /// <summary>
        /// Child medical_PreAuthIcd10Code where [PreAuthICD10Code].[ClinicalUpdateId] point to this entity (FK_PreAuthICD10Code_ClinicalUpdate)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_PreAuthIcd10Code> PreAuthIcd10Code { get; set; } // PreAuthICD10Code.FK_PreAuthICD10Code_ClinicalUpdate
        /// <summary>
        /// Child medical_PreAuthorisationBreakdowns where [PreAuthorisationBreakdown].[ClinicalUpdateId] point to this entity (FK_PreAuthorisationBreakdown_ClinicalUpdate)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_PreAuthorisationBreakdown> PreAuthorisationBreakdowns { get; set; } // PreAuthorisationBreakdown.FK_PreAuthorisationBreakdown_ClinicalUpdate
        /// <summary>
        /// Child medical_PreAuthTreatmentBaskets where [PreAuthTreatmentBasket].[ClinicalUpdateId] point to this entity (FK_PreAuthTreatmentBasket_ClinicalUpdate)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<medical_PreAuthTreatmentBasket> PreAuthTreatmentBaskets { get; set; } // PreAuthTreatmentBasket.FK_PreAuthTreatmentBasket_ClinicalUpdate

        // Foreign keys

        /// <summary>
        /// Parent medical_PreAuthorisation pointed by [ClinicalUpdate].([PreAuthId]) (FK_ClinicalUpdate_PreAuthorisation)
        /// </summary>
        public virtual medical_PreAuthorisation PreAuthorisation { get; set; } // FK_ClinicalUpdate_PreAuthorisation

        public medical_ClinicalUpdate()
        {
            ClinicalUpdateTreatmentPlans = new System.Collections.Generic.List<medical_ClinicalUpdateTreatmentPlan>();
            ClinicalUpdateTreatmentProtocols = new System.Collections.Generic.List<medical_ClinicalUpdateTreatmentProtocol>();
            PreAuthIcd10Code = new System.Collections.Generic.List<medical_PreAuthIcd10Code>();
            PreAuthorisationBreakdowns = new System.Collections.Generic.List<medical_PreAuthorisationBreakdown>();
            PreAuthTreatmentBaskets = new System.Collections.Generic.List<medical_PreAuthTreatmentBasket>();
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
