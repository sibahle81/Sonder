using RMA.Common.Entities.DatabaseQuery;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class PagedpaymentRequestResult<T> : PagedRequestResult<T>
    {
        [DataMember]
        public decimal? TotalAmount { get; set; }
    }
}
