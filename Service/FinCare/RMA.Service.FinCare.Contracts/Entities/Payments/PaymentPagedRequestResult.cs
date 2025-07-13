using RMA.Common.Entities.DatabaseQuery;
using System.Runtime.Serialization;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class PaymentPagedRequestResult<T> : PagedRequestResult<T>
    {
        [DataMember]
        public decimal? TotalAmount { get; set; }
    }
}