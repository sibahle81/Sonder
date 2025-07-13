namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class ProductOptionRuleConfigurationModel
    {
        public int Id { get; set; }
        public int RuleId { get; set; }
        public string FieldName { get; set; }
        public string FieldType { get; set; }
        public string FieldValue { get; set; }
        public string FieldDescription { get; set; }
        public string MinLength { get; set; }
        public string MaxLength { get; set; }
        public string Min { get; set; }
        public string Max { get; set; }

    }
}
