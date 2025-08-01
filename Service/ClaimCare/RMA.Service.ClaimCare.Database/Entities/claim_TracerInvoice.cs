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
    public partial class claim_TracerInvoice : IAuditableEntity, ISoftDeleteEntity
    {
        public int TracerInvoiceId { get; set; } // TracerInvoiceId (Primary key)
        public int ClaimId { get; set; } // ClaimId
        public int RolePlayerId { get; set; } // RolePlayerId
        public decimal? TracingFee { get; set; } // TracingFee
        public int PaymentStatus { get; set; } // PaymentStatus
        public string Reason { get; set; } // Reason (length: 100)
        public System.DateTime? PayDate { get; set; } // PayDate
        public int? PaymentId { get; set; } // PaymentId
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        // Foreign keys

        /// <summary>
        /// Parent claim_Claim pointed by [TracerInvoice].([ClaimId]) (FK_TracerInvoice_Claim)
        /// </summary>
        public virtual claim_Claim Claim { get; set; } // FK_TracerInvoice_Claim

        public claim_TracerInvoice()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
