using System.Runtime.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [DataContract]
    public class FSPEResponseReference
    {
        [DataMember(Name = "claimCheckReference", IsRequired = true)]
        public string ClaimCheckReference { get; set; }
    }
}
