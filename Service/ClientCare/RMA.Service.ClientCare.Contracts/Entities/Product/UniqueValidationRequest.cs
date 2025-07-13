namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class UniqueValidationRequest
    {
        public string Table { get; set; }
        public string Field { get; set; }
        public string Value { get; set; }
        public string MetaValue { get; set; }
    }
}