namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class AccountSearchResult
    {
        public int RolePlayerId { get; set; }
        public string FinPayeNumber { get; set; }
        public string DisplayName { get; set; }
        public string EmailAddress { get; set; }
        public bool IsAuthorised { get; set; }
        public string AuthroisedBy { get; set; }
        public System.DateTime? AuthorisedDate { get; set; }
        public int? IndustryId { get; set; }
    }
}








