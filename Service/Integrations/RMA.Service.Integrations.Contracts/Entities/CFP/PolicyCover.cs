using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Contracts.Entities.CFP
{
    public class PolicyCover
    {
        public string BenefitName { get; set; } = "";
        public DateTime? CommencementDate { get; set; } = null;
        public decimal Premium { get; set; } = 0;
        public decimal CoverAmount { get; set; } = 0;
        public decimal Allocation { get; set; } = 100;
    }
}
