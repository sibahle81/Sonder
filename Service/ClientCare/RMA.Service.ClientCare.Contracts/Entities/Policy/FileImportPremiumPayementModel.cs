namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class FileImportPremiumPayementModel
    {
        public string Data { get; set; }
        public string FileName { get; set; }
        public int UserId { get; set; }
        public int? TransactionLinkedId { get; set; }
    }
}


