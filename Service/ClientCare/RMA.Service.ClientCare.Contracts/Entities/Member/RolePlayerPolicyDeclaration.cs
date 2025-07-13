using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class RolePlayerPolicyDeclaration
    {
        public int RolePlayerPolicyDeclarationId { get; set; }
        public int TenantId { get; set; }
        public int RolePlayerId { get; set; }
        public int PolicyId { get; set; }
        public RolePlayerPolicyDeclarationStatusEnum RolePlayerPolicyDeclarationStatus { get; set; }
        public RolePlayerPolicyDeclarationTypeEnum RolePlayerPolicyDeclarationType { get; set; }
        public int ProductId { get; set; }
        public int DeclarationYear { get; set; }
        public decimal? PenaltyPercentage { get; set; }
        public decimal? TotalPremium { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public decimal? VariancePercentage { get; set; }
        public string VarianceReason { get; set; }
        public bool AllRequiredDocumentsUploaded { get; set; }

        public List<RolePlayerPolicyDeclarationDetail> RolePlayerPolicyDeclarationDetails { get; set; }

        public int ProrataDays { get; set; }
        public int FullYearDays { get; set; }
        public decimal? OriginalTotalPremium { get; set; }
        public decimal? InvoiceAmount { get; set; }
        public decimal? AdjustmentAmount { get; set; }
        public bool RequiresTransactionModification { get; set; }
        public decimal? OriginalEarningsPerEmployee { get; set; }

        public List<RolePlayerPolicyTransaction> RolePlayerPolicyTransactions { get; set; }
    }
}