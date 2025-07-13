namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PreAuthWizardFilterSearch : Common.Entities.AuditDetails
    {
        public string ContainsText { get; set; }
        public string ContainsDate { get; set; }
        public string HealthCareProviderName { get; set; }
        public string TemporaryReferenceNo { get; set; }
    }
}
