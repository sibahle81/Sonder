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
    public partial class common_EuropAssistPremiumMatrix : IAuditableEntity, ISoftDeleteEntity
    {
        public int Id { get; set; } // Id (Primary key)
        public decimal BasePremium { get; set; } // BasePremium
        public decimal ProfitExpenseLoadingPremium { get; set; } // ProfitExpenseLoadingPremium
        public System.DateTime StartDate { get; set; } // StartDate
        public System.DateTime? EndDate { get; set; } // EndDate
        public string Note { get; set; } // Note (length: 250)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        public common_EuropAssistPremiumMatrix()
        {
            IsDeleted = false;
            CreatedDate = System.DateTime.Now;
            ModifiedDate = System.DateTime.Now;
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
