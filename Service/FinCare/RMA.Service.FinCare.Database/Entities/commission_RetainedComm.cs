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
    public partial class commission_RetainedComm : ILazyLoadSafeEntity
    {
        public int Id { get; set; } // ID (Primary key)
        public int CommissionId { get; set; } // CommissionID
        public System.DateTime CommCalcDate { get; set; } // CommCalcDate
        public System.DateTime RetReleaseCalcDate { get; set; } // RetReleaseCalcDate
        public decimal Originalretention { get; set; } // ORIGINALRETENTION
        public decimal ReleasedRetention { get; set; } // ReleasedRetention
        public decimal RetentionBalance { get; set; } // RetentionBalance

        public commission_RetainedComm()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
