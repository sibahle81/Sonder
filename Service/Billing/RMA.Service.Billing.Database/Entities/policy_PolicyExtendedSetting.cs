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
    public partial class policy_PolicyExtendedSetting : IAuditableEntity, ISoftDeleteEntity
    {
        public int PolicyExtendedSettingsId { get; set; } // PolicyExtendedSettingsId (Primary key)
        public int PolicyId { get; set; } // PolicyId
        public int PremiumWaiverTypeId { get; set; } // PremiumWaiverTypeId
        public int VapsOptionId { get; set; } // VapsOptionId
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string MainMemberLifeBenefitOption { get; set; } // MainMemberLifeBenefitOption (length: 100)
        public string MainMemberFuneralBenefitOption { get; set; } // MainMemberFuneralBenefitOption (length: 100)

        // Foreign keys

        /// <summary>
        /// Parent policy_Policy pointed by [PolicyExtendedSettings].([PolicyId]) (FKPolicyExtendedSettings_Policy)
        /// </summary>
        public virtual policy_Policy Policy { get; set; } // FKPolicyExtendedSettings_Policy

        public policy_PolicyExtendedSetting()
        {
            IsDeleted = false;
            CreatedDate = System.DateTime.Now;
            ModifiedDate = System.DateTime.Now;
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
