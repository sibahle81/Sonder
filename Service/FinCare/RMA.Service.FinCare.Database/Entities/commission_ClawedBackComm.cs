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
using RMA.Service.FinCare.Contracts.Enums;

namespace RMA.Service.FinCare.Database.Entities
{
    public partial class commission_ClawedBackComm : ILazyLoadSafeEntity
    {
        public int CommissionId { get; set; } // CommissionID (Primary key)
        public System.DateTime CommCalcDate { get; set; } // CommCalcDate (Primary key)
        public System.DateTime ClawBackCalcDate { get; set; } // ClawBackCalcDate
        public decimal OriginalCommissionDue { get; set; } // OriginalCommissionDue
        public decimal RetentionBalance { get; set; } // RetentionBalance
        public decimal ClawBackAmount { get; set; } // ClawBackAmount
        public decimal RetentionOffset { get; set; } // RetentionOffset
        public decimal NewRetentionBalance { get; set; } // NewRetentionBalance
        public decimal RetentionRelease { get; set; } // RetentionRelease
        public decimal NetClawback { get; set; } // NetClawback

        public commission_ClawedBackComm()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
