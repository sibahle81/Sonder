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
    public partial class commission_PolicyStatu : ILazyLoadSafeEntity
    {
        public int StatusId { get; set; } // StatusID (Primary key)
        public string Status { get; set; } // Status (length: 20)

        public commission_PolicyStatu()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
