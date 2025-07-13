using System.Runtime.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe
{
    [DataContract]
    public class SubmitSubscriptionList
    {
        [DataMember(Name = "subscriptionListName", IsRequired = true)]
        public string SubscriptionListName { get; set; }

        [DataMember(Name = "fspSubscriptions", IsRequired = true)]
        public FSPSubscription[] FSPSubscriptions { get; set; }
    }
}
