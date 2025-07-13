using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class BenefitImportRequest
    {
        public int ProductId { get; set; }
        public string ProductOptionName { get; set; }
        public CoverTypeEnum CoverType { get; set; }
        public DateTime EffectiveDate { get; set; }
        public decimal AdminFee { get; set; }
        public decimal Commission { get; set; }
        public decimal BinderFee { get; set; }
        public int WaitingPeriod { get; set; }
        public string Content { get; set; }
    }
}
