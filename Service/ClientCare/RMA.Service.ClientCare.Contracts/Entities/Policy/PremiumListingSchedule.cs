namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PremiumListingSchedule
    {
        public int Id { get; set; }
        public System.Guid FileIdentifier { get; set; }
        public int PolicyId { get; set; }
        public int ActionType { get; set; }
    }
}
