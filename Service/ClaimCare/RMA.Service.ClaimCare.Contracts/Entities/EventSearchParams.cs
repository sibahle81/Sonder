namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class EventSearchParams
    {
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public string OrderBy { get; set; }
        public string Direction { get; set; }
        public string CurrentQuery { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public int EventType { get; set; }
        public bool ViewAll { get; set; }
        public bool Filter { get; set; }
    }
}