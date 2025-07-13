using System.Collections.Generic;
using System.Runtime.Serialization;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Audit
{
    [DataContract]
    public class AuditLogLookupDetail
    {
        [DataMember]
        public string ItemType { get; set; }
        [DataMember]
        public List<AuditLogLookupItem> LookupAuditResultDetails { get; set; }
    }
}
