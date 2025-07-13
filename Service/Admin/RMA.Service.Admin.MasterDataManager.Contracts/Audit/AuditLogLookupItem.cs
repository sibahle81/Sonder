using System.Runtime.Serialization;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Audit
{
    [DataContract]
    public class AuditLogLookupItem
    {
        [DataMember]
        public string Status { get; set; }
        [DataMember]
        public string Value { get; set; }
    }
}
