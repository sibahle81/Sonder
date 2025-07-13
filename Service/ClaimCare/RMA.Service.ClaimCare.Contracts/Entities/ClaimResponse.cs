namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimResponse
    {
        public string ClaimNumber { get; set; }
        public string PolicyNumber { get; set; }
        public string ClaimStatus { get; set; }
        public bool IsOperationSuccessFull { get; set; }
        public string ResponseMessage { get; set; }
        public int AssignedToUserId { get; set; }
        public int PolicyId { get; set; }
    }
}