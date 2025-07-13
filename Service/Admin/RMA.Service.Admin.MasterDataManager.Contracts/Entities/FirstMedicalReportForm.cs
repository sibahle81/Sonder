namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class FirstMedicalReportForm
    {
        public int FirstMedicalReportFormId { get; set; }
        public int MedicalReportFormId { get; set; }
        public string ClinicalDescription { get; set; }
        public string MechanismOfInjury { get; set; }
        public bool IsInjuryMechanismConsistent { get; set; }
        public bool IsPreExistingConditions { get; set; }
        public string PreExistingConditions { get; set; }
        public System.DateTime? FirstDayOff { get; set; }
        public System.DateTime? LastDayOff { get; set; }
        public int? EstimatedDaysOff { get; set; }
        public System.DateTime? FirstConsultationDate { get; set; }

        public MedicalReportForm MedicalReportForm { get; set; }
    }
}
