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
    public partial class client_FinPayee : IAuditableEntity, ISoftDeleteEntity
    {
        public int RolePlayerId { get; set; } // RolePlayerId (Primary key)
        public string FinPayeNumber { get; set; } // FinPayeNumber (length: 50)
        public bool IsAuthorised { get; set; } // IsAuthorised
        public string AuthroisedBy { get; set; } // AuthroisedBy (length: 50)
        public System.DateTime? AuthorisedDate { get; set; } // AuthorisedDate
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public int? IndustryId { get; set; } // IndustryId
        public DebtorStatusEnum? DebtorStatus { get; set; } // DebtorStatusId

        // Reverse navigation

        /// <summary>
        /// Child billing_DebtorStatusProductCategories where [DebtorStatusProductCategory].[RolePlayerId] point to this entity (FK_DebtorStatusProductCategory_FinPayee)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<billing_DebtorStatusProductCategory> DebtorStatusProductCategories { get; set; } // DebtorStatusProductCategory.FK_DebtorStatusProductCategory_FinPayee
        /// <summary>
        /// Child billing_Interests where [Interest].[RolePlayerId] point to this entity (FK_Interest_FinPayee)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<billing_Interest> Interests { get; set; } // Interest.FK_Interest_FinPayee
        /// <summary>
        /// Child billing_LegalCommissionRecons where [LegalCommissionRecon].[RoleplayerId] point to this entity (FK_LegalCommissionRecon_FinPayee)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<billing_LegalCommissionRecon> LegalCommissionRecons { get; set; } // LegalCommissionRecon.FK_LegalCommissionRecon_FinPayee
        /// <summary>
        /// Child billing_SuspenseDebtorBankMappings where [SuspenseDebtorBankMapping].[RoleplayerId] point to this entity (FK_SuspenseDebtorBankMapping_FinPayee)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<billing_SuspenseDebtorBankMapping> SuspenseDebtorBankMappings { get; set; } // SuspenseDebtorBankMapping.FK_SuspenseDebtorBankMapping_FinPayee
        /// <summary>
        /// Child billing_Transactions where [Transactions].[RolePlayerId] point to this entity (FK_Transactions_FinPayee)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<billing_Transaction> Transactions { get; set; } // Transactions.FK_Transactions_FinPayee

        // Foreign keys

        /// <summary>
        /// Parent client_RolePlayer pointed by [FinPayee].([RolePlayerId]) (FK_RolePlayerFinPaye_RolePlayer)
        /// </summary>
        public virtual client_RolePlayer RolePlayer { get; set; } // FK_RolePlayerFinPaye_RolePlayer

        public client_FinPayee()
        {
            DebtorStatusProductCategories = new System.Collections.Generic.List<billing_DebtorStatusProductCategory>();
            Interests = new System.Collections.Generic.List<billing_Interest>();
            LegalCommissionRecons = new System.Collections.Generic.List<billing_LegalCommissionRecon>();
            SuspenseDebtorBankMappings = new System.Collections.Generic.List<billing_SuspenseDebtorBankMapping>();
            Transactions = new System.Collections.Generic.List<billing_Transaction>();
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
