namespace RMA.Service.Billing.Contracts.Entities
{
    public class PaymentStagingRecordFile
    {
        public int Id { get; set; }
        public System.Guid FileIdentifier { get; set; }
        public string FileName { get; set; }
        public string Company { get; set; }
        public string PaymentMonthYear { get; set; }
        public decimal TotalPaymentReceived { get; set; }
        public decimal CollectionFeePercentage { get; set; }
        public decimal CollectionFeeAmount { get; set; }
        public decimal CollectionFeeVatPercentage { get; set; }
        public decimal CollectionFeeVatAmount { get; set; }
        public decimal TotalPayment { get; set; }
        public int? FileProcessingStatusId { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}
