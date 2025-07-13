namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class FinalMedicalReportForm
    {
        public int FinalMedicalReportFormId { get; set; }
        public int MedicalReportFormId { get; set; }
        public string MechanismOfInjury { get; set; }
        public string injuryOrDiseaseDescription { get; set; }
        public string AdditionalContributoryCauses { get; set; }
        public string ImpairmentFindings { get; set; }
        public bool IsStabilised { get; set; }
        public System.DateTime? DateReturnToWork { get; set; }
        public System.DateTime? DateStabilised { get; set; }
        public System.DateTime? PevStabilisedDate { get; set; }
        public MedicalReportForm MedicalReportForm { get; set; }

    }
}
