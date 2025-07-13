using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk
{
    public class PremiumRateComponentModel
    {
        public int? BenefitRateDetailId { get; set; } // add this to the FE
        public int BenefitRateId { get; set; }
        public int ComponentId { get; set; }
        public string ComponentCode { get; set; }
        public string ComponentName { get; set; }
        public decimal ReinsuranceTreatyRmlValue { get; set; }
        public decimal ReinsuranceTreatyReassValue { get; set; }
        public decimal TotalRateComponentValue { get; set; }
        public bool ZeroRateReinsuranceTreatyReassValue { get; set; }
        public bool? AllowNegativeValue { get; set; }
    }
}
