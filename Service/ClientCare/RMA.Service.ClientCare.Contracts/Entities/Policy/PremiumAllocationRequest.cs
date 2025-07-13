using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PremiumAllocationRequest
    {
        public decimal? Balance { get; set; } = 0;
        public int FileId { get; set;}
        public int linkedTransactionId { get; set; }
    }
}
