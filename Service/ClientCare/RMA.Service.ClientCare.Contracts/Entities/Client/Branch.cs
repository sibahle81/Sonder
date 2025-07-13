using RMA.Common.Entities;

namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class Branch : AuditDetails
    {
        public int ClientId { get; set; }
        public string Name { get; set; }
        public int? AddressId { get; set; }
    }
}