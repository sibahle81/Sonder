using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class BillingPolicyChangeDetail
    {
        public int PolicyId { get; set; }
        public int? ParentPolicyId { get; set; }
        public DateTime PolicyInceptionDate { get; set; }
        public int? DecemberInstallmentDayOfMonth { get; set; }
        public DateTime FirstInstallmentDate { get; set; }
        public bool? IsStillWithinCoolingOffPeriod { get; set; } = false;
        public PolicyStatusEnum PolicyStatus { get; set; }
        public PolicyCancelReasonEnum? PolicyCancelReason { get; set; }
        public CreditNoteTypeEnum? CreditNoteReason { get; set; }
        public bool? ClaimsAgainstPolicy { get; set; } = false;
        public bool? ClaimsToPolicy { get; set; }
        public decimal InstallmentPremium { get; set; }
        public DateTime ? EffectiveDate { get; set; }
        public decimal AdministrationPercentage { get; set; }
        public decimal BinderFeePercentage { get; set; }
        public decimal CommissionPercentage { get; set; }
        public decimal PremiumAdjustmentPercentage { get; set; }

        public List<BillingPolicyChangeDetail> ChildBillingPolicyChangeDetails { get; set; } = new List<BillingPolicyChangeDetail>();

        public List< PolicyInsuredLife> ExtendedFamilyPolicyInsuredLives { get; set; } = new List<PolicyInsuredLife>();
    }
}
