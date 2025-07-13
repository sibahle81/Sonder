namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class Integration : Common.Entities.AuditDetails
    {
        public string SourceSystemReference { get; set; }
        public string SourceSystemRoutingId { get; set; }
        public string ServiceBusMessageType { get; set; }
        public string RequestGuid { get; set; }
        public string ReturnCode { get; set; }
        public string ReturnMessage { get; set; }
    }
}