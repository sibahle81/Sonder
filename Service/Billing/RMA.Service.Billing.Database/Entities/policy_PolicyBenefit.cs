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
    public partial class policy_PolicyBenefit : ILazyLoadSafeEntity
    {
        public int PolicyId { get; set; } // PolicyId (Primary key)
        public int BenifitId { get; set; } // BenifitId (Primary key)

        // Reverse navigation

        /// <summary>
        /// Child policy_PolicyBenefitDetails where [PolicyBenefitDetail].([BenefitId], [PolicyId]) point to this entity (PolicyBenefit_PolicyBenefitDetail)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<policy_PolicyBenefitDetail> PolicyBenefitDetails { get; set; } // PolicyBenefitDetail.PolicyBenefit_PolicyBenefitDetail

        // Foreign keys

        /// <summary>
        /// Parent policy_Policy pointed by [PolicyBenefit].([PolicyId]) (FK_PolicyBenefit_Policy)
        /// </summary>
        public virtual policy_Policy Policy { get; set; } // FK_PolicyBenefit_Policy

        public policy_PolicyBenefit()
        {
            PolicyBenefitDetails = new System.Collections.Generic.List<policy_PolicyBenefitDetail>();
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
