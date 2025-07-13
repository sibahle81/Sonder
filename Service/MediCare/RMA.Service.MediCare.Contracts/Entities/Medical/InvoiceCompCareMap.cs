namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class InvoiceCompCareMap : Common.Entities.AuditDetails
    {
        public int InvoiceCompCareMapId { get; set; }
        public int InvoiceId { get; set; }
        public int CompCareInvoiceId { get; set; }
        public int CompCareClaimId { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public int CompCareHealthCareProviderId { get; set; }
        public string HealthCareProviderName { get; set; }
        public string PracticeNumber { get; set; }
        public string CompCareMessageId { get; set; }
    }
}
