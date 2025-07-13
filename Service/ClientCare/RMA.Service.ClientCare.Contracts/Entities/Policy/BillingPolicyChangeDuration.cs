using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class BillingPolicyChangeDuration
    {
        public int FromPeriodId { set; get; }
        public int ToPeriodId { set; get; }
    }
}
