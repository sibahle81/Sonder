using System.Runtime.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe
{
    [DataContract]
    public class RootSubmitSubscriptionList
    {
        [DataMember(Name = "request", IsRequired = true)]
        public SubmitSubscriptionList SubmitSubscriptionList { get; set; }
    }
}
