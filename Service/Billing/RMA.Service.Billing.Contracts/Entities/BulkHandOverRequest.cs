using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class BulkHandOverRequest
    {
        public List<LegalHandOverFileDetail> Details { get; set; }
        public string FileName { get; set; }
    }
}
