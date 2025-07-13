using System.Runtime.Serialization;
namespace RMA.Service.Integrations.Contracts.Entities.Fspe
{
    [DataContract]
    public class RootGetAllFromSubscriptionList
    {
        [DataMember(Name = "request", IsRequired = true)]
        public GetAllFromSubscriptionList GetAllFromSubscriptionList { get; set; }
    }
}
