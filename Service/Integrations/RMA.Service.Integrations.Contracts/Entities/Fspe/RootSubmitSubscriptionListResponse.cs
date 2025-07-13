using System.Runtime.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe
{
    [DataContract]
    public class RootSubmitSubscriptionListResponse
    {
        [DataMember(Name = "message", IsRequired = true)]
        public string Message { get; set; }

        [DataMember(Name = "statusCode", IsRequired = true)]
        public string StatusCode { get; set; }

        [DataMember(Name = "userReference", IsRequired = true)]
        public string UserReference { get; set; }

        [DataMember(Name = "subscriptionListName", IsRequired = true)]
        public string SubscriptionListName { get; set; }
    }
}