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
    public partial class Load_Rate : IAuditableEntity, ISoftDeleteEntity
    {
        public int RatesId { get; set; } // RatesId (Primary key)
        public string Product { get; set; } // Product (length: 255)
        public string MemberNo { get; set; } // MemberNo (length: 50)
        public int Category { get; set; } // Category
        public decimal Rate { get; set; } // Rate
        public int RatingYear { get; set; } // RatingYear
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        public Load_Rate()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
