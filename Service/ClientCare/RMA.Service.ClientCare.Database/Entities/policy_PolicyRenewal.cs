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
    public partial class policy_PolicyRenewal : ILazyLoadSafeEntity
    {
        public int PolicyRenewalId { get; set; } // PolicyRenewalId (Primary key)
        public int PolicyId { get; set; } // PolicyId
        public int PolicyRenewalDate { get; set; } // PolicyRenewalDate
        public decimal Premium { get; set; } // Premium
        public decimal CoverAmount { get; set; } // CoverAmount

        // Foreign keys

        /// <summary>
        /// Parent policy_Policy pointed by [PolicyRenewal].([PolicyId]) (FK_PolicyExtension_Policy)
        /// </summary>
        public virtual policy_Policy Policy { get; set; } // FK_PolicyExtension_Policy

        public policy_PolicyRenewal()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
