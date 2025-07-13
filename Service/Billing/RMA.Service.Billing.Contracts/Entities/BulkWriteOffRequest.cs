using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class BulkWriteOffRequest
    {
        public List<BulkWriteOffModel> Data { get; set; }
        public string FileName { get; set; }
    }
}
