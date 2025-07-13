namespace RMA.Service.MediCare.RuleTasks.HealthcareProviderCheckRules
{
    public class RuleData
    {
        public string PracticeNumber { get; set; }
        public bool IsActive { get; set; }
        public bool IsMedicalReportExist { get; set; }
        public bool IsMedicalReportRequired { get; set; }
    }
}
