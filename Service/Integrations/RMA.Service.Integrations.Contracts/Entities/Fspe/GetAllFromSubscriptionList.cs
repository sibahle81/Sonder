using System.Runtime.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe
{
    [DataContract]
    public class GetAllFromSubscriptionList
    {
        [DataMember(Name = "getSubscriptionList", IsRequired = true)]
        public string GetSubscriptionList { get; set; } = "RMA";
    }
}
