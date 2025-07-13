namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyOperationResult
    {
        public bool IsOperationSuccessful { get; set; }
        public string ErrorMessage { get; set; }
        public PolicyResponse PolicyResponse { get; set; }
        public Policy Policy { get; set; }
    }
}
