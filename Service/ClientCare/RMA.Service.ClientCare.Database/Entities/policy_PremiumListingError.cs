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
    public partial class policy_PremiumListingError : ILazyLoadSafeEntity
    {
        public int Id { get; set; } // Id (Primary key)
        public string FileIdentifier { get; set; } // FileIdentifier (length: 512)
        public string ErrorCategory { get; set; } // ErrorCategory (length: 64)
        public string ErrorMessage { get; set; } // ErrorMessage (length: 1024)

        public policy_PremiumListingError()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
