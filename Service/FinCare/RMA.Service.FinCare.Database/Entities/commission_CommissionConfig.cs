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
    public partial class commission_CommissionConfig : ILazyLoadSafeEntity
    {
        public int Id { get; set; } // ID (Primary key)
        public int ConfigId { get; set; } // ConfigID
        public int CommissionTypeId { get; set; } // CommissionTypeID
        public string BrokerId { get; set; } // BrokerID (length: 20)
        public string ProductIDs { get; set; } // ProductIDs (length: 100)

        public commission_CommissionConfig()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
