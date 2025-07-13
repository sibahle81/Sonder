using RMA.Common.Entities;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class PrimeRate : AuditDetails
    {
        public decimal Value { get; set; }
        public System.DateTime? StartDate { get; set; }
        public System.DateTime? EndDate { get; set; }

    }
}