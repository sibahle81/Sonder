namespace RMA.Common.Entities
{
    public class ValidityCheck
    {
        public int ValidityChecksetId { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public int ItemId { get; set; }
        public bool IsChecked { get; set; }
    }
}
