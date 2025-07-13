namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class LetterOfGoodStanding
    {
        public int LetterOfGoodStandingId { get; set; }
        public int RolePlayerId { get; set; }
        public System.DateTime IssueDate { get; set; }
        public System.DateTime ExpiryDate { get; set; }
        public string CertificateNo { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }

        // properties not in database
        public string MemberName { get; set; }
        public string MemberEmail { get; set; }
        public int PolicyId { get; set; }
    }
}