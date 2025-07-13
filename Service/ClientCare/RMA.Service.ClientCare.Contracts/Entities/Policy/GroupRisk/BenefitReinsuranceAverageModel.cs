using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk
{
    public class BenefitReinsuranceAverageModel
    {
        public int? BenefitReinsAverageId { get; set; }
        public int? BenefitDetailId { get; set; }
        public int? TreatyId { get; set; }
        public decimal? ReinsAverage { get; set; }
        public DateTime EffectiveDate   { get; set; }
        public string TreatyName { get; set; }
    }
}
