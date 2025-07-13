namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class MemberLogs
    {
        public int LetterOfGoodStandingId { get; set; } // LetterOfGoodStandingId (Primary key)
        public int RolePlayerId { get; set; } // RolePlayerId
        public int? ProductOptionId { get; set; } // ProductOptionId
        public System.DateTime? IssueDate { get; set; } // IssueDate
        public string CertificateNo { get; set; } // CertificateNo (length: 50)
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string MemberEmail { get; set; }
        public string MemberName { get; set; }
    }
}