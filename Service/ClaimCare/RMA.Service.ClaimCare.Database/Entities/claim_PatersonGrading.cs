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
    public partial class claim_PatersonGrading : IAuditableEntity, ISoftDeleteEntity, IEntityStatus
    {
        public int PatersonGradingId { get; set; } // PatersonGradingID (Primary key)
        public string Code { get; set; } // Code (length: 50)
        public string Description { get; set; } // Description (length: 250)
        public bool IsSkilled { get; set; } // IsSkilled
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 30)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        public claim_PatersonGrading()
        {
            IsDeleted = false;
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
