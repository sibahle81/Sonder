namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class SwitchBatchInvoiceMapParams
    {
        public int SwitchBatchInvoiceId { get; set; }
        public int PossiblePersonEventId { get; set; }
        public int PossibleEventId { get; set; }
        public int ClaimId { get; set; }
        public string ClaimReferenceNumberMatch { get; set; }
    }
}
