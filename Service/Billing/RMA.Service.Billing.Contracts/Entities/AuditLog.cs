using System;
using System.Runtime.Serialization;

namespace RMA.Service.Billing.Contracts.Entities
{
    [DataContract]
    public class AuditResult
    {
        [DataMember]
        public int Id { get; set; }
        [DataMember]
        public int ItemId { get; set; }
        [DataMember]
        public string ItemType { get; set; }
        [DataMember]
        public string Action { get; set; }
        [DataMember]
        public string OldItem { get; set; }
        [DataMember]
        public string NewItem { get; set; }
        [DataMember]
        public DateTime Date { get; set; }
        [DataMember]
        public string Username { get; set; }
        [DataMember]
        public string CorrolationToken { get; set; }

        public AuditResult(int id, int itemId, string itemType, DateTime date, string username, string action, string correlationToken, string oldItem, string newItem)
        {
            Id = id;
            ItemId = itemId;
            ItemType = itemType;
            Date = date;
            Username = username;
            Action = action;
            CorrolationToken = correlationToken;
            OldItem = oldItem;
            NewItem = newItem;
            //ExtractPropertyDetails(null);
        }
    }
}
