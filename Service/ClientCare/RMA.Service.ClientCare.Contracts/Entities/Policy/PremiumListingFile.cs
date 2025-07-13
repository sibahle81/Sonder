namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PremiumListingFile
    {
        public int PremiumListingFileId { get; set; }
        public System.Guid FileIdentifier { get; set; }
        public string FileName { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public int? FileProcessingStatusId { get; set; }
        public string FileProcessingStatus { get; set; }
    }
}