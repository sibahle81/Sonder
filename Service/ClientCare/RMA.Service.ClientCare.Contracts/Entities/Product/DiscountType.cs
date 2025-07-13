using RMA.Common.Entities;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class DiscountType : AuditDetails
    {
        public decimal DiscountPercentage { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public DateTime EffectiveDate { get; set; }
        public string Description { get; set; }
    }
}