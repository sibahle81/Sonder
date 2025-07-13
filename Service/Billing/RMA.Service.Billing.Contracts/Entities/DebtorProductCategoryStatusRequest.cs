using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class DebtorProductCategoryStatusRequest
    {
        public int RoleplayerId { get; set; }
        public int ProductCategoryTypeId { get; set; }
        public int StatusId { get; set; }
    }
}
