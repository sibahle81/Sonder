namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class PaymentPoolSearchParams
    {
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public int PaymentTypeId { get; set; }
        public int ClaimTypeId { get; set; }
        public int PaymentStatusId { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public string OrderBy { get; set; }
        public bool IsAscending { get; set; }
        public string Query { get; set; }

        public bool ReAllocate { get; set; }
        public int UserLoggedIn { get; set; }
        public int WorkPoolId { get; set; }     
        public int CoidPaymentTypeId { get; set; }
        public int PensionPaymentTypeId { get; set; }
    }
}
