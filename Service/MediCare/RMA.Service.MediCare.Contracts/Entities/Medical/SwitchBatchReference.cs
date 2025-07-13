using RMA.Common.Entities;

using System.Runtime.Serialization;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    [DataContract]
    public class SwitchBatchReference : ServiceBusMessageBase
    {
        [DataMember]
        public string BatchReference { get; set; }
    }
}
