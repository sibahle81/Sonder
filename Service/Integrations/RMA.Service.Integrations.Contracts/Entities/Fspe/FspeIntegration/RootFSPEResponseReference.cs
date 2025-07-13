using RMA.Common.Entities;

using System.Runtime.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [DataContract]
    public class RootFSPEResponseReference : ServiceBusMessageBase
    {
        [DataMember(Name = "fspeResponseReference", IsRequired = true)]
        public FSPEResponseReference FSPEResponse;
    }
}
