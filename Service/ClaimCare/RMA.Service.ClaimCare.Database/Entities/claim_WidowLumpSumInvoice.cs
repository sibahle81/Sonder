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
    public partial class claim_WidowLumpSumInvoice : IAuditableEntity, ISoftDeleteEntity
    {
        public int ClaimInvoiceId { get; set; } // ClaimInvoiceId (Primary key)
        public string Description { get; set; } // Description (length: 255)
        public int PayeeTypeId { get; set; } // PayeeTypeId
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public int ClaimId { get; set; } // ClaimId
        public int? PayeeRolePlayerId { get; set; } // PayeeRolePlayerId

        // Foreign keys

        /// <summary>
        /// Parent claim_Claim pointed by [WidowLumpSumInvoice].([ClaimId]) (FK_WidowLumpSumInvoice_Claim)
        /// </summary>
        public virtual claim_Claim Claim { get; set; } // FK_WidowLumpSumInvoice_Claim

        /// <summary>
        /// Parent claim_ClaimInvoice pointed by [WidowLumpSumInvoice].([ClaimInvoiceId]) (FK_WidowLumpSumInvoice_ClaimInvoice)
        /// </summary>
        public virtual claim_ClaimInvoice ClaimInvoice { get; set; } // FK_WidowLumpSumInvoice_ClaimInvoice

        public claim_WidowLumpSumInvoice()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
