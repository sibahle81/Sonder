using RMA.Common.Entities;

namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class ClientNote : AuditDetails
    {
        public int ItemId { get; set; }
        public string ItemType { get; set; }
        public string Text { get; set; }
    }
}