using RMA.Common.Entities;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PensionClaimData : AuditDetails
    {
        public int? PersonEventId { get; set; }
        public int? ClaimId { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public string ProductCode { get; set; }
        public DateTime DateOfAccident { get; set; }
        public DateTime DateOfStabilisation { get; set; }
        public double Earnings { get; set; }
        public double? PensionLumpSum { get; set; }
        public decimal? EstimatedCv { get; set; }
        public double PercentageIncrease { get; set; }
        public decimal? WidowLumpSum { get; set; }
        public List<Increase> IncreaseList { get; set; }
        public decimal VerifiedCV { get; set; }
        public int PolicyId { get; set; }
        public double TotalCompensation { get; set; }
        public double FoodAndQuarters { get; set; }
        public string IndustryNumber { get; set; }
        public string Icd10Driver { get; set; }
        public string Drg { get; set; }
        public string Member { get; set; }
        public List<PensionBenefit> PensionBenefits { get; set; }
    }
}
