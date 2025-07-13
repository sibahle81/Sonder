namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class AffordabilityCheck
    {
        public int PolicyId { get; set; }
        public bool IsAffordable { get; set; }
        public string AffordabilityCheckFailReason { get; set; }
    }

}
