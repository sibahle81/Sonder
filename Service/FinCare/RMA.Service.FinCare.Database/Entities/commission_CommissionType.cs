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
    public partial class commission_CommissionType : ILazyLoadSafeEntity
    {
        public int Id { get; set; } // id (Primary key)
        public int CommissionTypeId { get; set; } // CommissionTypeID
        public string CommissionType { get; set; } // CommissionType (length: 50)
        public string SpName { get; set; } // SP_NAME (length: 50)
        public System.DateTime Createddt { get; set; } // createddt
        public System.DateTime Validfrom { get; set; } // validfrom
        public System.DateTime? Validto { get; set; } // validto

        public commission_CommissionType()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
