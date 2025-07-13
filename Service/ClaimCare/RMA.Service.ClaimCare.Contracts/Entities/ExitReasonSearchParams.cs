namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ExitReasonSearchParams
    {
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public string OrderBy { get; set; }
        public string Direction { get; set; }
        public string CurrentQuery { get; set; }
        public int ExitReasonId { get; set; }

    }
}