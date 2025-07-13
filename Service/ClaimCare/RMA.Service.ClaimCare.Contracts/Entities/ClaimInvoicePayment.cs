using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Enums;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimInvoicePayment : AuditDetails
    {
        public int ClaimId { get; set; }
        public int ClaimInvoiceType { get; set; }
        public string BenefitName { get; set; }
        public string BenefitCode { get; set; }
        public Decimal EstimatedValue { get; set; }
        public CoverMemberTypeEnum CoverMemberType { get; set; }
        public Decimal InvoiceAmount { get; set; }
        public Decimal AuthorizedAmount { get; set; }

        public DateTime? InvoiceDate { get; set; }
        public ClaimInvoiceStatus ClaimInvoiceStatus { get; set; }
        public bool included { get; set; }
    }
}