
namespace RMA.Service.FinCare.Contracts.Entities.Commissions
{
    public class CommissionPoolSearchParams
    {
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public string OrderBy { get; set; }
        public string Direction { get; set; }
        public string CurrentQuery { get; set; }
        public bool ReAllocate { get; set; }
        public int UserLoggedIn { get; set; }
        public int WorkPoolId { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public int CommissionStatusId { get; set; }
    }
}
