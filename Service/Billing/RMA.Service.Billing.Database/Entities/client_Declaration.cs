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
    public partial class client_Declaration : IAuditableEntity, ISoftDeleteEntity
    {
        public int DeclarationId { get; set; } // DeclarationId (Primary key)
        public DeclarationStatusEnum DeclarationStatus { get; set; } // DeclarationStatusId
        public DeclarationTypeEnum DeclarationType { get; set; } // DeclarationTypeId
        public DeclarationRenewalStatusEnum DeclarationRenewalStatus { get; set; } // DeclarationRenewalStatusId
        public int RolePlayerId { get; set; } // RolePlayerId
        public int DeclarationYear { get; set; } // DeclarationYear
        public int? ProductOptionId { get; set; } // ProductOptionId
        public int? AverageEmployeeCount { get; set; } // AverageEmployeeCount
        public decimal? AverageEarnings { get; set; } // AverageEarnings
        public decimal? PenaltyPercentage { get; set; } // PenaltyPercentage
        public decimal? Rate { get; set; } // Rate
        public decimal? Premium { get; set; } // Premium
        public decimal? PenaltyRate { get; set; } // PenaltyRate
        public decimal? PenaltyPremium { get; set; } // PenaltyPremium
        public decimal? Adjustment { get; set; } // Adjustment
        public string Comment { get; set; } // Comment (length: 255)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        // Reverse navigation

        /// <summary>
        /// Child client_DeclarationAllowances where [DeclarationAllowance].[DeclarationId] point to this entity (FK_Declaration_DeclarationAllowance)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<client_DeclarationAllowance> DeclarationAllowances { get; set; } // DeclarationAllowance.FK_Declaration_DeclarationAllowance
        /// <summary>
        /// Child client_DeclarationBillingIntegrations where [DeclarationBillingIntegration].[DeclarationId] point to this entity (FK_Declaration_DeclarationBillingIntegration)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<client_DeclarationBillingIntegration> DeclarationBillingIntegrations { get; set; } // DeclarationBillingIntegration.FK_Declaration_DeclarationBillingIntegration

        // Foreign keys

        /// <summary>
        /// Parent client_RolePlayer pointed by [Declaration].([RolePlayerId]) (FK_Declaration_RolePlayer)
        /// </summary>
        public virtual client_RolePlayer RolePlayer { get; set; } // FK_Declaration_RolePlayer

        public client_Declaration()
        {
            DeclarationAllowances = new System.Collections.Generic.List<client_DeclarationAllowance>();
            DeclarationBillingIntegrations = new System.Collections.Generic.List<client_DeclarationBillingIntegration>();
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
