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
    public partial class claim_PolBenEarningsRangeCalc : IAuditableEntity, ISoftDeleteEntity
    {
        public int PolBenEarningsRangeCalcsId { get; set; } // PolBenEarningsRangeCalcsId (Primary key)
        public int? PolicyBenefitId { get; set; } // PolicyBenefitId
        public decimal EarningsEligibilityLow { get; set; } // EarningsEligibilityLow
        public decimal EarningsEligibilityHigh { get; set; } // EarningsEligibilityHigh
        public System.DateTime StartDate { get; set; } // StartDate
        public System.DateTime EndDate { get; set; } // EndDate
        public decimal MinEarnings { get; set; } // MinEarnings
        public decimal MaxEarnings { get; set; } // MaxEarnings
        public decimal PolicyMultiplier { get; set; } // PolicyMultiplier
        public decimal EarningsAllocation { get; set; } // EarningsAllocation
        public bool IsStatPolicyBenefit { get; set; } // IsStatPolicyBenefit
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        public claim_PolBenEarningsRangeCalc()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
