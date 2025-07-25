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
    public partial class billing_DebtorPayment : IAuditableEntity, ISoftDeleteEntity
    {
        public int DebtorPaymentId { get; set; } // DebtorPaymentId (Primary key)
        public int BankStatementEntryId { get; set; } // BankStatementEntryId
        public int? TransactionId { get; set; } // TransactionId
        public DebtorPaymentStatusEnum DebtorPaymentStatus { get; set; } // DebtorPaymentStatusId
        public decimal Amount { get; set; } // Amount
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string Reference { get; set; } // Reference (length: 100)
        public string BankAccountNumber { get; set; } // BankAccountNumber (length: 17)

        // Foreign keys

        /// <summary>
        /// Parent finance_BankStatementEntry pointed by [DebtorPayment].([BankStatementEntryId]) (FK_DebtorPayment_BankStatementEntry)
        /// </summary>
        public virtual finance_BankStatementEntry BankStatementEntry { get; set; } // FK_DebtorPayment_BankStatementEntry

        public billing_DebtorPayment()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
