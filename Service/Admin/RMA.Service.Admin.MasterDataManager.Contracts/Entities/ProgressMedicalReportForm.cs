namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class ProgressMedicalReportForm
    {
        public int ProgressMedicalReportFormId { get; set; }
        public int MedicalReportFormId { get; set; }
        public string NotStabilisedReason { get; set; }
        public string TreatmentDetails { get; set; }
        public string SpecialistReferralsHistory { get; set; }
        public string RadiologyFindings { get; set; }
        public string OperationsProcedures { get; set; }
        public string PhysiotherapyTreatmentDetails { get; set; }
        public System.DateTime? DateStabilised { get; set; }
        public bool? IsStabilisedChecked { get; set; }
        public bool? IsTreatmentChecked { get; set; }
        public bool? IsSpecialistReferralsHistoryChecked { get; set; }
        public bool? IsRadiologyFindingsChecked { get; set; }
        public bool? IsOperationsProceduresChecked { get; set; }
        public bool? IsPhysiotherapyTreatmentDetailsChecked { get; set; }

        public MedicalReportForm MedicalReportForm { get; set; }
    }
}

