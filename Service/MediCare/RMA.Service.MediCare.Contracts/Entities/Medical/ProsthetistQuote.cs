using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{

    public class ProsthetistQuote : Common.Entities.AuditDetails
    {
        public int ProsthetistQuoteId { get; set; } // ProsthetistQuoteId (Primary key)
        public int RolePlayerId { get; set; } // RolePlayerId
        public int? ProsthetistId { get; set; } // ProsthetistId
        public int? PensionCaseId { get; set; } // PensionCaseId
        public int ClaimId { get; set; } // ClaimId
        public decimal? QuotationAmount { get; set; } // QuotationAmount
        public string Comments { get; set; } // Comments (length: 2000)
        public ProstheticTypeEnum ProstheticType { get; set; } // ProstheticTypeId
        public string ProsTypeSpecification { get; set; } // ProsTypeSpecification (length: 200)
        public bool? IsApproved { get; set; } // IsApproved
        public int? ReviewedBy { get; set; } // ReviewedBy
        public System.DateTime? ReviewedDateTime { get; set; } // ReviewedDateTime
        public string ReviewedComments { get; set; } // ReviewedComments (length: 200)
        public int? SignedBy { get; set; } // SignedBy
        public bool? IsSentForReview { get; set; } // IsSentForReview
        public ProstheticQuotationTypeEnum? ProstheticQuotationType { get; set; } // QuotationTypeID
        public bool? IsRejected { get; set; } // IsRejected
        public bool? IsAutoApproved { get; set; } // IsAutoApproved
        public bool? IsRequestInfo { get; set; } // IsRequestInfo
        public ProstheticQuoteStatusEnum? ProstheticQuoteStatus { get; set; } // ProstheticQuoteStatusId
        public int? PreAuthId { get; set; } // PreAuthId
        //extra properties
        public string PreAuthNumber { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public string HealthCareProviderName { get; set; }
        public int? PersonEventId { get; set; }
        public bool? IsInternalUser { get; set; }

    }
}
