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
    public partial class policy_BenefitRate : IAuditableEntity, ISoftDeleteEntity, IEntityStatus
    {
        public int BenefitRateId { get; set; } // BenefitRateId (Primary key)
        public int BenefitDetailId { get; set; } // BenefitDetailId
        public int? BenefitCategoryId { get; set; } // BenefitCategoryId
        public System.DateTime EffectiveDate { get; set; } // EffectiveDate
        public string BillingBasis { get; set; } // BillingBasis (length: 1)
        public decimal RateValue { get; set; } // RateValue
        public RateStatusEnum RateStatus { get; set; } // RateStatusId
        public bool IsPercentageSplit { get; set; } // IsPercentageSplit
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        // Reverse navigation

        /// <summary>
        /// Child policy_BenefitRateDetails where [BenefitRateDetail].[BenefitRateId] point to this entity (BenefitRate_BenefitRateDetail)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<policy_BenefitRateDetail> BenefitRateDetails { get; set; } // BenefitRateDetail.BenefitRate_BenefitRateDetail

        // Foreign keys

        /// <summary>
        /// Parent policy_PolicyBenefitDetail pointed by [BenefitRate].([BenefitDetailId]) (PolicyBenefitDetail_BenefitRate)
        /// </summary>
        public virtual policy_PolicyBenefitDetail PolicyBenefitDetail { get; set; } // PolicyBenefitDetail_BenefitRate

        public policy_BenefitRate()
        {
            BenefitRateDetails = new System.Collections.Generic.List<policy_BenefitRateDetail>();
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
