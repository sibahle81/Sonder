using System.Runtime.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe
{
    [DataContract]
    public class FSPSubscription
    {
        [DataMember(Name = "fspReference", IsRequired = true)]
        public string FSPReference { get; set; }

        [DataMember(Name = "idNumbers", IsRequired = true)]
        public string[] IDNumbers { get; set; }
    }
}
