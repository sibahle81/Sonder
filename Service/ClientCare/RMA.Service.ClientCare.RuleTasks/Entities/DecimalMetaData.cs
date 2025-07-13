namespace RMA.Service.ClientCare.RuleTasks.Entities
{
    public class DecimalMetaData
    {
        public int ruleId { get; set; }
        public string fieldName { get; set; }
        public string fieldType { get; set; }
        public decimal fieldValue { get; set; }
        public decimal defaultValue { get; set; }
        public string fieldDescription { get; set; }
    }
}
