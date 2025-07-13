using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class Claim : AuditDetails
    {

        public Claim()
        {
            ClaimBenefits = new List<ClaimBenefit>();
            ClaimInvoices = new List<ClaimInvoice>();
            ClaimRuleAudits = new List<ClaimRuleAudit>();
            ClaimNotes = new List<ClaimNote>();
        }

        public int ClaimId { get; set; } // ClaimId (Primary key)
        public int PersonEventId { get; set; } // PersonEventId
        public string ClaimReferenceNumber { get; set; } // ClaimReferenceNumber (length: 50)
        public ClaimStatusEnum ClaimStatus { get; set; } // ClaimStatusId
        public ClaimLiabilityStatusEnum ClaimLiabilityStatus { get; set; } // ClaimLiabilityStatusId
        public System.DateTime? ClaimStatusChangeDate { get; set; }
        public int ClaimLiabilityStatusId { get; set; } // ClaimLiabilityStatusId
        public bool IsCancelled { get; set; } // IsCancelled
        public ClaimCancellationReasonEnum? ClaimCancellationReason { get; set; } // ClaimCancellationReasonId
        public bool IsClosed { get; set; } // IsClosed
        public bool IsRuleOverridden { get; set; }
        public decimal DisabilityPercentage { get; set; } // DisabilityPercentage
        public decimal? FamilyAllowance { get; set; } // FamilyAllowance
        public int? ClaimClosedReasonId { get; set; } // ClaimClosedReasonId
        public int? PolicyId { get; set; } // PolicyId
        public int WizardId { get; set; } // ModifiedDate
        public DateTime PersonEventDeathDate { get; set; } // ModifiedDate
        public int? UnderwriterId { get; set; }
        public bool InvestigationRequired { get; set; }
        public bool PdVerified { get; set; }


        public List<ClaimBenefit> ClaimBenefits { get; set; }
        public List<ClaimInvoice> ClaimInvoices { get; set; }

        public List<ClaimNote> ClaimNotes { get; set; }

        /// <summary>
        /// Child claim_ClaimRuleAudits where [ClaimRuleAudit].[ClaimId] point to this entity (FK_ClaimRuleAudit_Claim)
        /// </summary>
        public List<ClaimRuleAudit> ClaimRuleAudits { get; set; }

        /// <summary>
        /// Parent common_ClaimLiabilityStatu pointed by [Claim].([ClaimLiabilityStatusId]) (FK_Claim_ClaimLiabilityStatus)
        /// </summary>

        // Old fields in the database
        public string ClaimNumber { get; set; } // ClaimNumber (length: 50)
        public decimal? TotalBenefitAmount { get; set; } // TotalBenefitAmount
        public int? AssignedToUserId { get; set; } // AssignedToUserId
        public int? WorkPoolId { get; set; } // WorkPoolId
        public int? PaymentId { get; set; } // PaymentId
        public string ClaimantEmail { get; set; } // ClaimantEmail (length: 50)
        public int PolicyCount { get; set; }

        //ENUM => ID Conversions
        public int ClaimStatusId
        {
            get => (int)ClaimStatus;
            set => ClaimStatus = (ClaimStatusEnum)value;
        }
        public decimal CAA { get; set; }
    }
}