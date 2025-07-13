using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ICD10EstimateFilter
    {
        public EventTypeEnum EventType { get; set; }
        public string Icd10Codes { get; set; }
        public DateTime ReportDate { get; set; }
        public int Icd10DiagnosticGroupId { get; set; }
    }
}
