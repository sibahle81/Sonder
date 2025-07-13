namespace RMA.Common.Entities
{
    public class LastViewedEntry : ServiceBusMessageBase
    {
        public int Id { get; set; } // Id (Primary key)
        public int ItemId { get; set; } // ItemId
        public string ItemType { get; set; } // ItemType (length: 50)
        public string Username { get; set; } // Username (length: 50)
        public System.DateTime Date { get; set; } // Date
    }
}
