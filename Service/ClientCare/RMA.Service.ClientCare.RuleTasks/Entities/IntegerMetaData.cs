namespace RMA.Service.ClientCare.RuleTasks.Entities
{
    public class IntegerMetaData
    {
        public int ruleId { get; set; }
        public string fieldName { get; set; }
        public string fieldType { get; set; }
        public int fieldValue { get; set; }
        public int defaultValue { get; set; }
        public string fieldDescription { get; set; }
    }
}
