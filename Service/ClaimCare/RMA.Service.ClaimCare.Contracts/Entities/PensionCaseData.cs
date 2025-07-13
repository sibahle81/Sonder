using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PensionCaseData
    {
        public BenefitTypeEnum BenefitType { get; set; }
        public string PensionCaseNumber { get; set; }
        public int ClaimId { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public DateTime DateOfAccident { get; set; }
        public DateTime DateOfStabilisation { get; set; }
        public decimal PdPercentage { get; set; }
        public decimal Earnings { get; set; }
        public decimal PensionLumpSum { get; set; }
        public decimal EstimatedCv { get; set; }
        public string IndustryNumber { get; set; }
        public string Member { get; set; }
        public string ICD10Driver { get; set; }
        public string Drg { get; set; }
        public List<MonthlyPayment> MonthlyPayments { get; set; }
        public decimal PercentageIncrease { get; set; }
        public decimal WidowLumpSum { get; set; }
        public List<Increase> IncreaseList { get; set; }
        public DateTime Dos { get; set; }
        public decimal Caa { get; set; }
        public decimal VerifiedCV { get; set; }


    }


}
