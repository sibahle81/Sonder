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
    public partial class billing_TermBulkAllocation : IAuditableEntity, ISoftDeleteEntity
    {
        public int TermBulkAllocationId { get; set; } // TermBulkAllocationId (Primary key)
        public int TransactionId { get; set; } // TransactionId
        public int? BankstatementEntryId { get; set; } // BankstatementEntryId
        public System.DateTime? StatementDate { get; set; } // StatementDate
        public decimal? Amount { get; set; } // Amount
        public int RoleplayerId { get; set; } // RoleplayerId
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public bool IsDeleted { get; set; } // IsDeleted
        public bool IsPendingLog { get; set; } // IsPendingLog

        public billing_TermBulkAllocation()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
