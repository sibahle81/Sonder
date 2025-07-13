
namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyBrokerage
    {
        public int PolicyId { get; set; }
        public int BrokerageId { get; set; }
        public string DisplayName { get; set; }
        public int PolicyStatusId { get; set; }
        public string IdNumber { get; set; }
        public int? RepresentativeId { get; set; }
        public string PolicyNumber { get; set; }

        public string FspNumber { get; set; }
    }
}
