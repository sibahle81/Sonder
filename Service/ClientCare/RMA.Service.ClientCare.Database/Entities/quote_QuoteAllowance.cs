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
    public partial class quote_QuoteAllowance : ILazyLoadSafeEntity
    {
        public int QuoteAllowanceId { get; set; } // QuoteAllowanceId (Primary key)
        public int QuoteId { get; set; } // QuoteId
        public AllowanceTypeEnum AllowanceType { get; set; } // AllowanceTypeId
        public decimal? Allowance { get; set; } // Allowance

        // Foreign keys

        /// <summary>
        /// Parent quote_Quote pointed by [QuoteAllowance].([QuoteId]) (FK_Quote_QuoteAllowance)
        /// </summary>
        public virtual quote_Quote Quote { get; set; } // FK_Quote_QuoteAllowance

        public quote_QuoteAllowance()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
