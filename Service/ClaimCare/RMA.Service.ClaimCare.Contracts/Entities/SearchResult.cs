using RMA.Common.Entities;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class SearchResult : AuditDetails
    {
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public int? ClaimId { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public string Status { get; set; }
        public string StatusReason { get; set; }
        public int InsuredLifeId { get; set; }
        public string IdNumber { get; set; }
        public string MemberFirstName { get; set; }
        public string MemberLastName { get; set; }
        public string MemberRole { get; set; }
        public string IndustryNumber { get; set; }
        public System.DateTime DateOfBirth { get; set; }

        public string EmployeeNumber { get; set; }
        public int? WizardId { get; set; }
        public bool? IsRuleOverridden { get; set; }

        public decimal InvoiceAmount { get; set; }

        public decimal? AuthorisedAmount { get; set; }

        public DateTime? InvoiceDate { get; set; }

        public decimal? RepudiatedAmount { get; set; }

        public string ClaimRepudiationReason { get; set; }

        public DateTime? ClaimRepudiationDate { get; set; }

        public DateTime? ClaimChangeDate { get; set; }
    }
}