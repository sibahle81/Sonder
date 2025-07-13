using System;

namespace RMA.Service.Integrations.Contracts.Entities.CFP
{
    public class PreviousInsurer
    {
        public string InsurerName { get; set; }
        public string PolicyNumber { get; set; }
        public DateTime JoinDate { get; set; }
        public DateTime? CancellationDate { get; set; } = null;
        public decimal CoverAmount { get; set; } = 0;
    }
}
