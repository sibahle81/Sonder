using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Entities.Quote;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System.Collections.Generic;

using BrokerageModel = RMA.Service.ClientCare.Contracts.Entities.Broker.Brokerage;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class Policy
    {
        public int PolicyId { get; set; } // PolicyId (Primary key)
        public int TenantId { get; set; } // TenantId
        public int InsurerId { get; set; } // InsurerId
        public int? QuoteId { get; set; } // QuoteId
        public QuoteV2 QuoteV2 { get; set; } // QuoteV2 
        public int ProductOptionId { get; set; } // ProductOptionId
        public int PolicyOwnerId { get; set; } // PolicyOwnerId
        public RolePlayer.RolePlayer PolicyOwner { get; set; } // PolicyOwnerId
        public string ClientName { get; set; }
        public string BrokerageName { get; set; }
        public string RepresentativeName { get; set; }
        public int PolicyPayeeId { get; set; } // PolicyPayeeId
        public PaymentFrequencyEnum PaymentFrequency { get; set; } // PaymentFrequencyId
        public PaymentMethodEnum? PaymentMethod { get; set; } // PaymentMethodId
        public string PolicyNumber { get; set; } // PolicyNumber (length: 50)
        public System.DateTime? PolicyInceptionDate { get; set; } // PolicyInceptionDate
        public System.DateTime? TargetedPolicyInceptionDate { get; set; }
        public System.DateTime? ExpiryDate { get; set; } // ExpiryDate
        public string CancellationInitiatedBy { get; set; } // CancellationInitiatedBy
        public System.DateTime? CancellationInitiatedDate { get; set; } // CancellationInitiatedDate
        public System.DateTime? CancellationDate { get; set; } // CancellationDate        
        public System.DateTime FirstInstallmentDate { get; set; } // FirstInstallmentDate
        public System.DateTime? LastInstallmentDate { get; set; } // LastInstallmentDate
        public int? RegularInstallmentDayOfMonth { get; set; } // RegularInstallmentDayOfMonth
        public int? DecemberInstallmentDayOfMonth { get; set; } // DecemberInstallmentDayOfMonth
        public PolicyStatusEnum PolicyStatus { get; set; } // PolicyStatusId
        public decimal AnnualPremium { get; set; } // AnnualPremium
        public decimal InstallmentPremium { get; set; } // InstallmentPremium
        public decimal AdminPercentage { get; set; } // AdminPercentage
        public decimal CommissionPercentage { get; set; } // CommissionPercentage
        public decimal BinderFeePercentage { get; set; } // BinderFeePercentage
        public decimal PremiumAdjustmentPercentage { get; set; } // PremiumAdjustmentPercentage 
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public PolicyCancelReasonEnum? PolicyCancelReason { get; set; } // PolicyCancelReasonId
        public string ClientReference { get; set; } // ClientReference (length: 50)
        public System.DateTime? LastLapsedDate { get; set; } // LastLapsedDate
        public int? LapsedCount { get; set; } // LapsedCount
        public System.DateTime? LastReinstateDate { get; set; } // LastReinstateDate
        public bool CanEdit { get; set; }
        public bool CanAdd { get; set; }
        public bool CanRemove { get; set; }
        public List<PolicyBroker> PolicyBrokers { get; set; }
        public ProductOption ProductOption { get; set; }
        public int? PolicyMovementId { get; set; }
        public int RepresentativeId { get; set; }
        public int? JuristicRepresentativeId { get; set; }
        public int BrokerageId { get; set; }
        public List<PolicyInsuredLife> PolicyInsuredLives { get; set; }
        public List<RolePlayerRelation> RolePlayerRelations { get; set; }
        public BrokerageModel Brokerage { get; set; }
        public int? ParentPolicyId { get; set; }
        public System.DateTime? PolicyPauseDate { get; set; }
        public bool IsEuropAssist { get; set; }
        public System.DateTime? EuropAssistEffectiveDate { get; set; }
        public System.DateTime? EuropAssistEndDate { get; set; }
        public ReinstateReasonEnum? ReinstateReason { get; set; }
        public PolicyLifeExtension PolicyLifeExtension { get; set; }
        public List<PolicyStatusChangeAudit> PolicyStatusChangeAudits { get; set; }
        public List<RolePlayerPolicyDeclaration> RolePlayerPolicyDeclarations { get; set; }
        public List<RolePlayerPolicyOnlineSubmission> RolePlayerPolicyOnlineSubmissions { get; set; }
        public List<Cover> Covers { get; set; }
        public List<CategoryInsuredCover> CategoryInsuredCovers { get; set; }
        public List<PolicyContact> PolicyContacts { get; set; }
        public List<PolicyDocumentCommunicationMatrix> PolicyDocumentCommunicationMatrices { get; set; }
        public bool CanLapse { get; set; }
        public decimal PremiumAdjustmentAmount { get; set; }
        public ProductCategoryTypeEnum? ProductCategoryType { get; set; }

        public int? PaymentFrequencyId
        {
            get => (int?)PaymentFrequency;
            set => PaymentFrequency = (PaymentFrequencyEnum)value;
        }

        public int? PaymentMethodId
        {
            get => (int?)PaymentMethod;
            set => PaymentMethod = (PaymentMethodEnum?)value;
        }

        public int? PolicyStatusId
        {
            get => (int?)PolicyStatus;
            set => PolicyStatus = (PolicyStatusEnum)value;
        }

        public int? PolicyCancelReasonId
        {
            get => (int?)PolicyCancelReason;
            set => PolicyCancelReason = (PolicyCancelReasonEnum?)value;
        }
    }
}
