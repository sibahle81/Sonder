using RMA.Common.Entities;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class Stillborn : AuditDetails
    {
        public int FuneralRegistryDetailId { get; set; } // FuneralId
        public int GenderId { get; set; } // GenderId
        public int GestationPeriod { get; set; } // GestationPeriod
    }
}