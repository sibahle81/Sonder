using System.Runtime.Serialization;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Audit
{
    [DataContract]
    public class AuditLogPropertyDetail
    {
        public AuditLogPropertyDetail(string propertyName, string oldValue, string newValue)
        {
            PropertyName = propertyName;
            OldValue = oldValue;
            NewValue = newValue;

            HasChanged = oldValue?.GetHashCode() != newValue?.GetHashCode();
        }

        [DataMember]
        public string PropertyName { get; set; }
        [DataMember]
        public string OldValue { get; set; }
        [DataMember]
        public string NewValue { get; set; }
        [DataMember]
        public bool HasChanged { get; set; }
    }
}
