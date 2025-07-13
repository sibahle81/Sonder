namespace RMA.Service.Billing.Contracts.Entities
{
    public class BillingNote
    {
        public int Id { get; set; }
        public int ItemId { get; set; }
        public string Context { get; set; }
        public string ItemType { get; set; }
        public string Text { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}