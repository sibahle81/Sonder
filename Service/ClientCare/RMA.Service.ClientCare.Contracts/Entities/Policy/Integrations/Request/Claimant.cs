namespace RMA.Service.ClientCare.Contracts.Entities.Policy.Integrations.Request
{
    public class Claimant
    {
        public string Title { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string RelationshipToDeceased { get; set; }
        public string IdNumber { get; set; }
        public string ContactNumber { get; set; }
    }
}
