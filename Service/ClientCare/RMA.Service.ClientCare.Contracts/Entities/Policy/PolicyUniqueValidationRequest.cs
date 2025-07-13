namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyUniqueValidationRequest
    {
        public string Value { get; set; }
        public string Table { get; set; }
        public string Field { get; set; }
        public string MetaValue { get; set; }
    }
}