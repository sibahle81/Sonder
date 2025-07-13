using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class Declaration
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

        public List<DeclarationAllowance> DeclarationAllowances { get; set; }
        public List<Declaration> DependentDeclarations { get; set; }
        public List<DeclarationBillingIntegration> DeclarationBillingIntegrations { get; set; }
    }
}