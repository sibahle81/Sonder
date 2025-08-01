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
    public partial class claim_Earning : IAuditableEntity, ISoftDeleteEntity
    {
        public int EarningId { get; set; } // EarningId (Primary key)
        public int PersonEventId { get; set; } // PersonEventId
        public decimal? VariableSubTotal { get; set; } // VariableSubTotal
        public decimal? NonVariableSubTotal { get; set; } // NonVariableSubTotal
        public decimal? Total { get; set; } // Total
        public bool IsVerified { get; set; } // IsVerified
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public bool IsEstimated { get; set; } // IsEstimated
        public EarningsTypeEnum EarningsType { get; set; } // EarningsTypeId
        public string Sec51EmpNo { get; set; } // Sec51EmpNo (length: 255)
        public System.DateTime? Sec51DateOfQualification { get; set; } // Sec51DateOfQualification
        public System.DateTime? Sec51DateOfEngagement { get; set; } // Sec51DateOfEngagement
        public System.DateTime? Sec51DateOfBirth { get; set; } // Sec51DateOfBirth

        // Reverse navigation

        /// <summary>
        /// Child claim_CaaInvoices where [CAAInvoice].[EarningsId] point to this entity (FK_CAAInvoice_Earnings)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<claim_CaaInvoice> CaaInvoices { get; set; } // CAAInvoice.FK_CAAInvoice_Earnings
        /// <summary>
        /// Child claim_ClaimEstimates where [ClaimEstimate].[EarningsID] point to this entity (FK_ClaimEstimate_Earnings)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<claim_ClaimEstimate> ClaimEstimates { get; set; } // ClaimEstimate.FK_ClaimEstimate_Earnings
        /// <summary>
        /// Child claim_EarningDetails where [EarningDetails].[EarningId] point to this entity (FK__EarningDe__Earni__5F42FA94)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<claim_EarningDetail> EarningDetails { get; set; } // EarningDetails.FK__EarningDe__Earni__5F42FA94
        /// <summary>
        /// Child claim_FamilyAllowanceAwards where [FamilyAllowanceAward].[EarningsId] point to this entity (FK_FamilyAllowanceAward_Earnings)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<claim_FamilyAllowanceAward> FamilyAllowanceAwards { get; set; } // FamilyAllowanceAward.FK_FamilyAllowanceAward_Earnings

        // Foreign keys

        /// <summary>
        /// Parent claim_PersonEvent pointed by [Earnings].([PersonEventId]) (FK_Earnings_PersonEvent)
        /// </summary>
        public virtual claim_PersonEvent PersonEvent { get; set; } // FK_Earnings_PersonEvent

        public claim_Earning()
        {
            IsVerified = false;
            IsEstimated = false;
            CaaInvoices = new System.Collections.Generic.List<claim_CaaInvoice>();
            ClaimEstimates = new System.Collections.Generic.List<claim_ClaimEstimate>();
            EarningDetails = new System.Collections.Generic.List<claim_EarningDetail>();
            FamilyAllowanceAwards = new System.Collections.Generic.List<claim_FamilyAllowanceAward>();
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
