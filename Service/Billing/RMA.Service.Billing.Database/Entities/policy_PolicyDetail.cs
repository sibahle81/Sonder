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

namespace RMA.Service.Billing.Database.Entities
{
    public partial class policy_PolicyDetail : IAuditableEntity, ISoftDeleteEntity
    {
        public int PolicyDetailId { get; set; } // PolicyDetailId (Primary key)
        public int PolicyId { get; set; } // PolicyId
        public System.DateTime EffectiveDate { get; set; } // EffectiveDate
        public byte PolicyAnniversaryMonth { get; set; } // PolicyAnniversaryMonth
        public string PolicyName { get; set; } // PolicyName (length: 100)
        public PaymentFrequencyEnum? PaymentFrequency { get; set; } // PaymentFrequencyId
        public int PolicyAdministratorId { get; set; } // PolicyAdministratorId
        public int PolicyConsultantId { get; set; } // PolicyConsultantId
        public int? PolicyHolderId { get; set; } // PolicyHolderId
        public int? QuoteId { get; set; } // QuoteId
        public System.DateTime? LastReviewDate { get; set; } // LastReviewDate
        public System.DateTime? NextReviewDate { get; set; } // NextReviewDate
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        // Foreign keys

        /// <summary>
        /// Parent client_RolePlayer pointed by [PolicyDetail].([PolicyHolderId]) (RolePlayer_PolicyDetail)
        /// </summary>
        public virtual client_RolePlayer RolePlayer { get; set; } // RolePlayer_PolicyDetail

        /// <summary>
        /// Parent policy_Policy pointed by [PolicyDetail].([PolicyId]) (Policy_PolicyDetail)
        /// </summary>
        public virtual policy_Policy Policy { get; set; } // Policy_PolicyDetail

        public policy_PolicyDetail()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
