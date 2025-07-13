namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class UniqueValidationRequest
    {
        public string Value { get; set; }
        public string Table { get; set; }
        public string Field { get; set; }
        public string MetaValue { get; set; }
    }
}