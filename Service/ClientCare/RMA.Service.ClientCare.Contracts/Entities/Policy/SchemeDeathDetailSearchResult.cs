namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class SchemeDeathDetailSearchResult
    {
        public string PolicyNumber { get; set; }
        public string ProductName { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public string Status { get; set; }
        public string StatusReason { get; set; }
        public string IdNumber { get; set; }
        public string MemberFirstName { get; set; }
        public string MemberLastName { get; set; }
        public string MemberRole { get; set; }
    }
}
