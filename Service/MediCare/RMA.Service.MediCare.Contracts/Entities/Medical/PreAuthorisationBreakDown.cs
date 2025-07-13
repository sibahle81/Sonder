using System;
using System.Collections.Generic;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PreAuthorisationBreakdown : Common.Entities.AuditDetails
    {
        public int PreAuthBreakdownId { get; set; }
        public int PreAuthId { get; set; }
        public int? MedicalItemId { get; set; }
        public int? TariffId { get; set; }
        public int? TreatmentCodeId { get; set; }
        public DateTime DateAuthorisedFrom { get; set; }
        public DateTime DateAuthorisedTo { get; set; }
        public decimal RequestedTreatments { get; set; }
        public decimal? AuthorisedTreatments { get; set; }
        public decimal RequestedAmount { get; set; }
        public decimal? AuthorisedAmount { get; set; }
        public bool? IsAuthorised { get; set; }
        public string AuthorisedReason { get; set; }
        public bool? IsRejected { get; set; }
        public string RejectedReason { get; set; }
        public string ReviewComments { get; set; }
        public int? SolId { get; set; }
        public decimal? TariffAmount { get; set; }
        public bool? IsClinicalUpdate { get; set; }
        public List<PreAuthLevelOfCare> LevelOfCare { get; set; }
        public string TariffCode { get; set; }
        public string TariffDescription { get; set; }
        public short? UpdateSequenceNo { get; set; }
        public int? ClinicalUpdateId { get; set; }
        public string TreatmentCode { get; set; }
        public string TreatmentCodeDescription { get; set; }
        public List<PreAuthBreakdownUnderAssessReason> PreAuthBreakdownUnderAssessReasons { get; set; }
    }
}
