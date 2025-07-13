namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class DebtorSearchResult
    {
        public int RoleplayerId { get; set; }
        public string FinPayeNumber { get; set; }
        public string DisplayName { get; set; }
        public string EmailAddress { get; set; }
        public string IdNumber { get; set; }
        public string IndustryClass { get; set; }
        public int IndustryClassId { get; set; }
    }
}
