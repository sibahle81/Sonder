namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PersonEventSearchParams
    {
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public string OrderBy { get; set; }
        public string Direction { get; set; }
        public string CurrentQuery { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public int IsStp { get; set; }
        public int Stm { get; set; }
        public int ClaimStatus { get; set; }
        public int LiabilityStatus { get; set; }
        public int RolePlayerId { get; set; }
        public bool ViewAll { get; set; }
        public bool Filter { get; set; }
    }
}