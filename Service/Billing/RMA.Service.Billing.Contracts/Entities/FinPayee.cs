
namespace RMA.Service.Billing.Contracts.Entities
{
    public class FinPayee
    {
        public int RolePlayerId { get; set; }
        public string FinPayeNumber { get; set; }
        public bool IsAuthorised { get; set; }
        public string AuthroisedBy { get; set; }
        public System.DateTime? AuthorisedDate { get; set; }
        public int? IndustryId { get; set; } // IndustryId
    }
}