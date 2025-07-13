namespace RMA.Service.Billing.Contracts.Entities.Payments
{
    public class FileContentImport
    {
        public string Data { get; set; }
        public PaymentStagingRecordFile PaymentStagingRecordFile { get; set; }
    }
}
