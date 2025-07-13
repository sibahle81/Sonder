using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class ProductOption
    {
        public int Id { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
        public int ProductId { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Product Product { get; set; }
        public decimal MaxAdminFeePercentage { get; set; }
        public decimal MaxCommissionFeePercentage { get; set; }
        public decimal MaxBinderFeePercentage { get; set; }
        public ProductTypeEnum? ProductType { get; set; }
        public CoverTypeEnum CoverType { get; set; } = CoverTypeEnum.CorporateCompulsory;
        public int? CoverOptionTypeId { get; set; }
        public GroupCoverAmountOptionEnum? GroupCoverAmountOption { get; set; }
        public bool? IsTaxabled { get; set; }
        public string CommissionScale { get; set; }
        public List<Note> ProductOptionNotes { get; set; }
        public List<ProductOptionPaymentFrequency> ProductOptionPaymentFrequencies { get; set; }
        public List<int> BenefitsIds { get; set; }
        public List<RuleItem> RuleItems { get; set; }
        public List<CoverTypeEnum> CoverTypeIds { get; set; }
        public List<PaymentFrequencyEnum> PaymentFrequencyIds { get; set; }
        public List<Benefit> Benefits { get; set; }
        public ProductStatusEnum OptionStatus => GetOptionStatus(EndDate);
        public string StatusText => GetOptionStatus(EndDate).DisplayAttributeValue();
        public decimal? BaseRate { get; set; }
        public List<ProductOptionDependency> ProductOptionDependencies { get; set; }
        public List<ProductOptionAllowanceType> ProductOptionAllowanceTypes { get; set; }
        public List<ProductOptionBillingIntegration> ProductOptionBillingIntegrations { get; set; }
        public List<ProductOptionSetting> ProductOptionSettings { get; set; }

        private static ProductStatusEnum GetOptionStatus(DateTime? endDate)
        {
            return !endDate.HasValue || endDate.Value.Date >= DateTimeHelper.SaNow
                ? ProductStatusEnum.OpenForBusiness
                : ProductStatusEnum.ClosedForBusiness;
        }
    }
}