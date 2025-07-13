using FileHelpers;

namespace RMA.Service.Billing.Contracts.Entities
{
    [DelimitedRecord(",")]
    [IgnoreEmptyLines()]
    [IgnoreFirst()]
    public class CollectionAgentImportFileModel
    {
        public string AccountId { get; set; }
        [FieldOptional]
        public string CollectionAgent { get; set; }
        [FieldOptional]
        public string DebtorsClerk { get; set; }
    }
}
