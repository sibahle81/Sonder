using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.FinCare.Contracts.Enums;

using System;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class FilterPaymentsRequest
    {
        public PaymentTypeEnum PaymentType { get; set; }
        public PaymentStatusEnum PaymentStatus { get; set; }
        public ClaimTypeEnum ClaimType { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public EntityType EntityType { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
    }
}
