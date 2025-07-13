using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ClinicalUpdate : Common.Entities.AuditDetails
    {
        public int ClinicalUpdateId { get; set; }
        public int PreAuthId { get; set; }
        public string Diagnosis { get; set; }
        public string PreAuthNumber { get; set; }
        public string Medication { get; set; }
        public string Comments { get; set; }
        public System.DateTime? VisitCompletionDate { get; set; }
        public decimal? InterimAccountBalance { get; set; }
        public System.DateTime? DischargeDate { get; set; }
        public string SubsequentCare { get; set; }
        public short? UpdateSequenceNo { get; set; }
        public List<ClinicalUpdateTreatmentPlan> ClinicalUpdateTreatmentPlans { get; set; }
        public List<ClinicalUpdateTreatmentProtocol> ClinicalUpdateTreatmentProtocols { get; set; }
        public List<PreAuthorisationBreakdown> PreAuthorisationBreakdowns { get; set; }
        public List<PreAuthIcd10Code> PreAuthIcd10Codes { get; set; }
        public List<PreAuthTreatmentBasket> PreAuthTreatmentBaskets { get; set; }
        public PreAuthStatusEnum? ClinicalUpdateStatus { get; set; }
        public string ReviewComment { get; set; }
        public System.DateTime? ReviewDate { get; set; }
    }
}
