using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Product;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class RolePlayerPolicy
    {
        public int PolicyId { get; set; } // PolicyId (Primary key)
        public int TenantId { get; set; } // TenantId
        public int InsurerId { get; set; } // InsurerId
        public string Insurer { get; set; } // Insurer
        public int? QuoteId { get; set; } // QuoteId 
        public int ProductOptionId { get; set; } // ProductOptionId
        public int PolicyOwnerId { get; set; } // PolicyOwnerId
        public int PolicyPayeeId { get; set; } // PolicyPayeeId
        public PaymentFrequencyEnum PaymentFrequency { get; set; } // PaymentFrequencyId
        public PaymentMethodEnum? PaymentMethod { get; set; } // PaymentMethodId
        public string PolicyNumber { get; set; } // PolicyNumber (length: 50)
        public System.DateTime PolicyInceptionDate { get; set; } // PolicyInceptionDate
        public System.DateTime? ParentPolicyInceptionDate { get; set; } // ParentPolicyInceptionDate
        public System.DateTime? ExpiryDate { get; set; } // ExpiryDate
        public System.DateTime? CancellationInitiatedDate { get; set; } // CancellationInitiatedDate
        public string CancellationInitiatedBy { get; set; } // CancellationInitiatedBy (length: 50)
        public System.DateTime? CancellationDate { get; set; } // CancellationDate
        public System.DateTime FirstInstallmentDate { get; set; } // FirstInstallmentDate
        public System.DateTime? LastInstallmentDate { get; set; } // LastInstallmentDate
        public int? RegularInstallmentDayOfMonth { get; set; } // RegularInstallmentDayOfMonth
        public int? DecemberInstallmentDayOfMonth { get; set; } // DecemberInstallmentDayOfMonth
        public PolicyStatusEnum PolicyStatus { get; set; } // PolicyStatusId
        public decimal AnnualPremium { get; set; } // AnnualPremium
        public decimal InstallmentPremium { get; set; } // InstallmentPremium
        public decimal AdminPercentage { get; set; } // CommissionPercentage
        public decimal CommissionPercentage { get; set; } // CommissionPercentage
        public decimal BinderFeePercentage { get; set; } // BinderFeePercentage
        public decimal PremiumAdjustmentPercentage { get; set; } // PremiumAdjustmentPercentage
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public Product.ProductOption ProductOption { get; set; }
        public List<Note> PolicyNotes { get; set; }
        public List<Benefit> Benefits { get; set; }
        public string ClientReference { get; set; } // PolicyNumber (length: 50)
        public List<RolePlayer> PolicyInsuredLives { get; set; }
        public List<PolicyInsuredLife> InsuredLives { get; set; }
        public RolePlayer PolicyOwner { get; set; } // PolicyOwnerId    
        public System.DateTime? LastLapsedDate { get; set; } // LastLapsedDate
        public int? LapsedCount { get; set; } // LapsedCount
        public System.DateTime? LastReinstateDate { get; set; } // LastReinstateDate
        public PolicyCancelReasonEnum? PolicyCancelReason { get; set; } // CancellationReasonId
        public PolicyDocumentCommunicationMatrix PolicyDocumentCommunicationMatrix { get; set; }
        public List<PolicyBroker> PolicyBrokers { get; set; }
        public int? PolicyMovementId { get; set; } // PolicyMovementId
        public int RepresentativeId { get; set; }
        public int? JuristicRepresentativeId { get; set; }
        public int BrokerageId { get; set; }
        public int? ParentPolicyId { get; set; } // ParentPolicyId
        public System.DateTime? ContinuationEffectiveDate { get; set; }
        public System.DateTime? LapseEffectiveDate { get; set; }
        public System.DateTime? PolicyPauseDate { get; set; }
        public RefundTypeEnum? RefundType { get; set; }
        public bool? EligibleForRefund { get; set; }
        public bool IsGroupPolicy { get; set; }
        public decimal? RefundAmount { get; set; }
        public System.DateTime? AdhocDebitDate { get; set; }
        public bool CanLapse { get; set; }
        public bool IsEuropAssist { get; set; } // IsEuropAssist
        public System.DateTime? EuropAssistEffectiveDate { get; set; } // EuropAssistEffectiveDate
        public System.DateTime? EuropAssistEndDate { get; set; } // EuropAssistEndDate 
        public int? ReinstateReasonId { get; set; } // ReinstateReasonId
        public string ParentPolicyNumber { get; set; } // ParentPolicyId
        public PolicyLifeExtension PolicyLifeExtension { get; set; }
        public PolicyContact BrokerPolicyContact { get; set; }
        public PolicyContact AdminPolicyContact { get; set; }
        public PolicyContact FirstAlternativePolicyContact { get; set; }
        public PolicyContact SecondAlternativePolicyContact { get; set; }

        public RolePlayerPolicy()
        {
            PolicyDocumentCommunicationMatrix = new PolicyDocumentCommunicationMatrix();
            BrokerPolicyContact = new PolicyContact() { ContactType = ContactTypeEnum.BrokerContact };
            AdminPolicyContact = new PolicyContact() { ContactType = ContactTypeEnum.Administrator };
            FirstAlternativePolicyContact = new PolicyContact() { ContactType = ContactTypeEnum.FirstAlternativePolicyContact };
            SecondAlternativePolicyContact = new PolicyContact() { ContactType = ContactTypeEnum.SecondAlternativePolicyContact };
        }

        public override string ToString()
        {
            return $"{PolicyNumber} - {PolicyStatus} - {PolicyInceptionDate:yyyy-MM-dd}";
        }
    }
}