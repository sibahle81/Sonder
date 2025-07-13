using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class RunCommissionRequest
    {
        public string Period { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
