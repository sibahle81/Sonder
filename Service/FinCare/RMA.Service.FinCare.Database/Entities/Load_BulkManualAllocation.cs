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
    public partial class Load_BulkManualAllocation : ISoftDeleteEntity
    {
        public int Id { get; set; } // Id (Primary key)
        public string BankAccountNumber { get; set; } // BankAccountNumber (length: 50)
        public string UserReference { get; set; } // UserReference (length: 200)
        public string StatementReference { get; set; } // StatementReference (length: 200)
        public string TransactionDate { get; set; } // TransactionDate (length: 50)
        public string Amount { get; set; } // Amount (length: 50)
        public string Status { get; set; } // Status (length: 50)
        public string UserReference2 { get; set; } // UserReference2 (length: 200)
        public string ReferenceType { get; set; } // ReferenceType (length: 100)
        public string Allocatable { get; set; } // Allocatable (length: 10)
        public string AllocateTo { get; set; } // AllocateTo (length: 200)
        public int BulkAllocationFileId { get; set; } // BulkAllocationFileId
        public string Error { get; set; } // Error (length: 500)
        public bool IsDeleted { get; set; } // IsDeleted
        public int? LineProcessingStatusId { get; set; } // LineProcessingStatusId
        public int? PeriodId { get; set; } // PeriodId

        // Foreign keys

        /// <summary>
        /// Parent Load_BulkAllocationFile pointed by [BulkManualAllocation].([BulkAllocationFileId]) (FK_BulkManualAllocation_BulkManualAllocation1)
        /// </summary>
        public virtual Load_BulkAllocationFile BulkAllocationFile { get; set; } // FK_BulkManualAllocation_BulkManualAllocation1

        public Load_BulkManualAllocation()
        {
            IsDeleted = false;
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
