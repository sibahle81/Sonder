using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class StpDash
    {
        public List<ExitReasonOverview> StpOverview { get; set; }
        public int? CheckInjuryCount { get; set; }
        public int? CheckVopd { get; set; }
        public int? Icd10Modified { get; set; }
    }
}