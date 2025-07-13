using System;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class GetRemittanceTransactionsListResponse
    {
        public string BatchReference { get; set; }
        public int TotalNoOfTransactions { get; set; }
        public DateTime BatchCreatedDate { get; set; }
    }
}
