namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyResponse
    {
        public string ClientReference { get; set; }
        public string PolicyNumber { get; set; }
        public string PolicyStatus { get; set; }
        public bool IsOperationSuccessFull { get; set; }
        public string ResponseMessage { get; set; }
    }
}
