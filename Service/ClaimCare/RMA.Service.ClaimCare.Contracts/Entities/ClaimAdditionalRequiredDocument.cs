namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimAdditionalRequiredDocument
    {
        public string DocumentName { get; set; }
        public int ClaimAdditionalRequiredDocumentId { get; set; }
        public int PersoneventId { get; set; }
        public int DocumentId { get; set; }
        public bool IsUploaded { get; set; }
        public int DocumentGroupId { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public bool VisibletoMember { get; set; }
        public string RequestNote { get; set; }
    }
}
