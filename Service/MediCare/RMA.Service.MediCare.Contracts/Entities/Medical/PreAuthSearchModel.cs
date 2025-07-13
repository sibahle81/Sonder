namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PreAuthSearchModel
    {
        public string PreAuthNumber { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public string PracticeNumber { get; set; }
        public int HealthCareProviderId { get; set; }
        public string CreatedBy { get; set; }
    }
}
