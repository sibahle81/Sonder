using Newtonsoft.Json;

namespace RMA.Service.Integrations.Contracts.Entities
{
    public class EmailNotificationResponse
    {
        [JsonProperty(PropertyName = "requestGUID")]
        public string RequestGUID { get; set; }

        [JsonProperty(PropertyName = "statusCode")]
        public string StatusCode { get; set; }
    }
}
