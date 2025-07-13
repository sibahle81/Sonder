using RMA.Common.Entities;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyCancellationRequest : AuditDetails
    {
        public int PolicyId { get; set; }
        public int ClientId { get; set; }
        public string Status { get; set; }
        public string RequestReason { get; set; }
        public DateTime RequestDate { get; set; }
    }
}