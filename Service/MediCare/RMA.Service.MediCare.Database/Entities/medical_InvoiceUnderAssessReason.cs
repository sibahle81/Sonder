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

namespace RMA.Service.MediCare.Database.Entities
{
    public partial class medical_InvoiceUnderAssessReason : IAuditableEntity, ISoftDeleteEntity, IEntityStatus
    {
        public int Id { get; set; } // Id (Primary key)
        public int? InvoiceId { get; set; } // InvoiceId
        public int UnderAssessReasonId { get; set; } // UnderAssessReasonId
        public string UnderAssessReason { get; set; } // UnderAssessReason (length: 2048)
        public string Comments { get; set; } // Comments (length: 2048)
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public int? TebaInvoiceId { get; set; } // TebaInvoiceId

        // Foreign keys

        /// <summary>
        /// Parent medical_Invoice pointed by [InvoiceUnderAssessReason].([InvoiceId]) (FK_Invoice_InvoiceUnderAssessReason_InvoiceId)
        /// </summary>
        public virtual medical_Invoice Invoice { get; set; } // FK_Invoice_InvoiceUnderAssessReason_InvoiceId

        /// <summary>
        /// Parent medical_TebaInvoice pointed by [InvoiceUnderAssessReason].([TebaInvoiceId]) (FK_Invoice_InvoiceUnderAssessReason_TebaInvoiceId)
        /// </summary>
        public virtual medical_TebaInvoice TebaInvoice { get; set; } // FK_Invoice_InvoiceUnderAssessReason_TebaInvoiceId

        public medical_InvoiceUnderAssessReason()
        {
            IsActive = true;
            IsDeleted = false;
            CreatedDate = System.DateTime.Now;
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
