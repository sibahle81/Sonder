namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class MedicalSwitchBatchUnmappedParams
    {
        public int MedicalInvoiceId { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public int PossiblePersonEventId { get; set; }
        public int PossibleEventId { get; set; }
        public int SwitchBatchId { get; set; }
        public string SwitchBatchNumber { get; set; }
        public int SwitchBatchInvoiceId { get; set; }
    }
}
