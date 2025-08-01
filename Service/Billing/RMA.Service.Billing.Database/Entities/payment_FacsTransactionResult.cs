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

namespace RMA.Service.Billing.Database.Entities
{
    public partial class payment_FacsTransactionResult : IAuditableEntity, ISoftDeleteEntity, IEntityStatus
    {
        public int Id { get; set; } // Id (Primary key)
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public bool CanEdit { get; set; } // CanEdit
        public int? PaymentId { get; set; } // PaymentId
        public string TransactionType { get; set; } // TransactionType (length: 5)
        public string DocumentType { get; set; } // DocumentType (length: 2)
        public string Reference1 { get; set; } // Reference1 (length: 2)
        public string Reference2 { get; set; } // Reference2 (length: 20)
        public string Amount { get; set; } // Amount (length: 11)
        public string ActionDate { get; set; } // ActionDate (length: 10)
        public string RequisitionNumber { get; set; } // RequisitionNumber (length: 9)
        public string DocumentNumber { get; set; } // DocumentNumber (length: 8)
        public string AgencyPrefix { get; set; } // AgencyPrefix (length: 1)
        public string AgencyNumber { get; set; } // AgencyNumber (length: 6)
        public string DepositType { get; set; } // DepositType (length: 2)
        public string ChequeClearanceCode { get; set; } // ChequeClearanceCode (length: 10)
        public string ChequeNumber { get; set; } // ChequeNumber (length: 9)
        public string BankAccountNumber { get; set; } // BankAccountNumber (length: 17)
        public string UniqueUserCode { get; set; } // UniqueUserCode (length: 4)
        public int? CollectionId { get; set; } // CollectionId

        // Foreign keys

        /// <summary>
        /// Parent billing_Collection pointed by [FacsTransactionResults].([CollectionId]) (FK_FacsTransactionResults_Collections)
        /// </summary>
        public virtual billing_Collection Collection { get; set; } // FK_FacsTransactionResults_Collections

        /// <summary>
        /// Parent payment_Payment pointed by [FacsTransactionResults].([PaymentId]) (FK_Payment_PaymentId)
        /// </summary>
        public virtual payment_Payment Payment { get; set; } // FK_Payment_PaymentId

        public payment_FacsTransactionResult()
        {
            CanEdit = true;
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
