using RMA.Common.Entities;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class ClientCoverOption : AuditDetails
    {
        public int ClientCoverId { get; set; }
        public int ProductOptionCoverId { get; set; }
        public int? NumberOfMembers { get; set; }
        public decimal? Premium { get; set; }
        public bool IsMainFamily { get; set; }
        public string ProductOptionName { get; set; }
        public decimal TotalPerLine { get; set; }
        public int ProductOptionId { get; set; }
    }
}