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
    public partial class policy_PostRetirementMedicalAnnuityInvoiceDetail : IAuditableEntity, ISoftDeleteEntity
    {
        public int PostRetirementMedicalAnnuityInvoiceDetailId { get; set; } // PostRetirementMedicalAnnuityInvoiceDetailId (Primary key)
        public int PostRetirementMedicalAnnuityInvoiceHeaderId { get; set; } // PostRetirementMedicalAnnuityInvoiceHeaderId
        public int? EmployeeRolePlayerId { get; set; } // EmployeeRolePlayerId
        public string MedicalAidNumber { get; set; } // MedicalAidNumber (length: 50)
        public string MedicalAidOption { get; set; } // MedicalAidOption (length: 50)
        public System.DateTime EffectiveDate { get; set; } // EffectiveDate
        public System.DateTime? LapseDate { get; set; } // LapseDate
        public string Name { get; set; } // Name (length: 50)
        public string Surname { get; set; } // Surname (length: 50)
        public string IdNumber { get; set; } // IdNumber (length: 13)
        public string EmployeeNumber { get; set; } // EmployeeNumber (length: 50)
        public int NumberOfDependents { get; set; } // NumberOfDependents
        public int NumberOfSpouses { get; set; } // NumberOfSpouses
        public int NumberOfChildren { get; set; } // NumberOfChildren
        public int NumberOfAdults { get; set; } // NumberOfAdults
        public decimal EmployeeContributionAmount { get; set; } // EmployeeContributionAmount
        public decimal EmployeeMsaContributionAmount { get; set; } // EmployeeMSAContributionAmount
        public decimal BillAmount { get; set; } // BillAmount
        public decimal PaymentAmount { get; set; } // PaymentAmount
        public string CalculationFormula { get; set; } // CalculationFormula (length: 50)
        public System.DateTime? ProcessedDate { get; set; } // ProcessedDate
        public bool IsProcessed { get; set; } // IsProcessed
        public string ValidationMessage { get; set; } // ValidationMessage (length: 500)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        // Foreign keys

        /// <summary>
        /// Parent client_Person pointed by [PostRetirementMedicalAnnuityInvoiceDetail].([EmployeeRolePlayerId]) (FK_PostRetirementMedicalAidInvoiceDetail_Person)
        /// </summary>
        public virtual client_Person Person { get; set; } // FK_PostRetirementMedicalAidInvoiceDetail_Person

        /// <summary>
        /// Parent policy_PostRetirementMedicalAnnuityInvoiceHeader pointed by [PostRetirementMedicalAnnuityInvoiceDetail].([PostRetirementMedicalAnnuityInvoiceHeaderId]) (FK_PostRetirementMedicalAidInvoiceDetail_PostRetirementMedicalAidInvoiceHeader)
        /// </summary>
        public virtual policy_PostRetirementMedicalAnnuityInvoiceHeader PostRetirementMedicalAnnuityInvoiceHeader { get; set; } // FK_PostRetirementMedicalAidInvoiceDetail_PostRetirementMedicalAidInvoiceHeader

        public policy_PostRetirementMedicalAnnuityInvoiceDetail()
        {
            EmployeeMsaContributionAmount = 0m;
            PaymentAmount = 0m;
            IsProcessed = false;
            IsDeleted = false;
            CreatedBy = "original_login()";
            CreatedDate = System.DateTime.Now;
            ModifiedBy = "original_login()";
            ModifiedDate = System.DateTime.Now;
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
