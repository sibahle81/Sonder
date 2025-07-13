using RMA.Common.Entities.DatabaseQuery;

namespace RMA.Service.Integrations.Contracts.Entities.Qlink
{
    public class QlinkSearchRequest
    {
        public string ItemType { get; set; }
        public int ItemId { get; set; }
        public PagedRequest PagedRequest { get; set; }
    }
}
