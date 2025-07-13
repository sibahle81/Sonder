namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class AuditLog
    {
        public int Id { get; set; } // Id (Primary key)
        public int ItemId { get; set; } // ItemId
        public string ItemType { get; set; } // ItemType (length: 50)
        public string Action { get; set; } // Action (length: 50)
        public string OldItem { get; set; } // OldItem
        public string NewItem { get; set; } // NewItem
        public System.DateTime Date { get; set; } // Date
        public string Username { get; set; } // Username (length: 50)
        public string CorrolationToken { get; set; } // CorrolationToken (length: 50)
    }
}