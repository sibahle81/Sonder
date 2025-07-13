using AutoMapper;

using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Database.Entities;

using System;
using System.Linq;

using Product = RMA.Service.ClientCare.Contracts.Entities.Product.Product;
using ProductOption = RMA.Service.ClientCare.Contracts.Entities.Product.ProductOption;

namespace RMA.Service.ClientCare.Mappers
{
    public class ProductMappingProfile : Profile
    {
        /// <summary>
        /// Create the mappers that map the database types to the contract types
        /// </summary>
        public ProductMappingProfile()
        {

            CreateMap<product_Product, Product>()
                .ForMember(s => s.ProductClassId, opt => opt.Ignore())
                .ForMember(s => s.ProductStatusText, opt => opt.Ignore())
                .ForMember(s => s.ProductStatus, opt => opt.Ignore())
                .ForMember(s => s.RuleItems, opt => opt.Ignore())
                .ForMember(s => s.ProductCategoryType, opt => opt.Ignore())
                .ReverseMap()
                .ForMember(s => s.ProductRules, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<product_Product>(s.Id));

            CreateMap<product_ProductOption, ProductOption>()
                .ForMember(s => s.BenefitsIds, opt => opt.MapFrom(op => op.Benefits.Select(b => b.Id)))
                .ForMember(s => s.CoverTypeIds, opt => opt.Ignore())
                .ForMember(s => s.PaymentFrequencyIds, opt => opt.Ignore())
                .ForMember(s => s.RuleItems, opt => opt.Ignore())
                .ForMember(s => s.StatusText, opt => opt.Ignore())
                .ForMember(s => s.OptionStatus, opt => opt.Ignore())
                .ForMember(s => s.Product, opt => opt.MapFrom(c => c.Product))
                .ReverseMap()
                .ForMember(s => s.ProductOptionRules, opt => opt.Ignore())
                .ForMember(d => d.Benefits, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<product_ProductOption>(s.Id));

            //Product
            CreateMap<product_Benefit, Benefit>()
                .ForMember(t => t.EndDate, opt => opt.MapFrom(s => s.EndDate ?? DateTime.MaxValue))
                .ForMember(s => s.EarningTypeIds, opt => opt.MapFrom(op => op.BenefitEarningsTypes != null ? op.BenefitEarningsTypes.Select(ben => ben.EarningsType) : null))
                .ForMember(s => s.MedicalReportTypeIds, opt => opt.MapFrom(op => op.BenefitMedicalReportTypes != null ? op.BenefitMedicalReportTypes.Select(ben => ben.MedicalReportType) : null))
                .ForMember(s => s.productOptionIds, opt => opt.Ignore())
                .ForMember(s => s.StatusText, opt => opt.Ignore())
                .ForMember(s => s.BenefitStatus, opt => opt.Ignore())
                .ForMember(s => s.BenefitRateLatest, opt => opt.Ignore())
                .ForMember(s => s.BenefitBaseRateLatest, opt => opt.Ignore())
                .ForMember(s => s.BillingLevel, opt => opt.Ignore())
                .AfterMap((src, dst) =>
                {
                    foreach (var rate in dst.BenefitRates)
                    {
                        rate.BenefitRateStatusText = rate.EffectiveDate < DateTimeHelper.SaNow
                                                     && dst.BenefitRates.Any(x => x.EffectiveDate > rate.EffectiveDate && x.EffectiveDate <= DateTimeHelper.SaNow)
                             ? "Historic"
                            : (rate.EffectiveDate == dst.BenefitRates.Where(x => x.EffectiveDate <= DateTimeHelper.SaNow)
                                   .Max(x => x.EffectiveDate)
                                ? "Current"
                                : "Future");
                    }
                })
                .ForMember(s => s.RuleItems, opt => opt.Ignore())

                // Temporary fix until Benefit class is fixed
                .ForMember(s => s.EstimateTypeId, opt => opt.MapFrom(b => (int?)b.EstimateType))

                .ReverseMap()
                .ForMember(s => s.EstimateType, opt => opt.MapFrom(b => (EstimateTypeEnum?)b.EstimateTypeId))
                .ForMember(s => s.ProductOptions, opt => opt.Ignore())
                .ForMember(s => s.BenefitRules, opt => opt.Ignore())
                .ForMember(s => s.Policies, opt => opt.Ignore())
                .ForMember(s => s.ProductOptions, opt => opt.Ignore())
                .AfterMap((src, dest) =>
                {
                    if (src.EarningTypeIds != null)
                    {
                        foreach (var earningTypeId in src.EarningTypeIds)
                        {
                            dest.BenefitEarningsTypes.Add(new product_BenefitEarningsType
                            {
                                EarningsType = (EarningsTypeEnum)earningTypeId
                            });
                        }
                    }

                    if (src.MedicalReportTypeIds != null)
                    {
                        foreach (var medicalReportTypeId in src.MedicalReportTypeIds)
                        {
                            dest.BenefitMedicalReportTypes.Add(new product_BenefitMedicalReportType
                            {
                                MedicalReportType = (MedicalReportTypeEnum)medicalReportTypeId
                            });
                        }
                    }
                })
                .ConstructUsing(s => MapperExtensions.GetEntity<product_Benefit>(s.Id));

            CreateMap<product_BenefitRate, BenefitRate>()
               .ForMember(s => s.BenefitRateStatusText, opt => opt.Ignore())
               .ReverseMap()
                  .ConstructUsing(s => MapperExtensions.GetEntity<product_BenefitRate>(s.Id));

            CreateMap<product_DiscountType, DiscountType>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<product_DiscountType>(s.Id));

            CreateMap<product_ProductNote, Note>()
                .ForMember(t => t.ItemType, opt => opt.Ignore())
                .ForMember(t => t.Reason, opt => opt.Ignore())
                .ForMember(t => t.ItemId, opt => opt.MapFrom(s => s.ProductId))
                .ReverseMap()
                .ForMember(t => t.ProductId, opt => opt.MapFrom(s => s.ItemId))
                .ConstructUsing(s => MapperExtensions.GetEntity<product_ProductNote>(s.Id));

            CreateMap<product_BenefitNote, Note>()
                .ForMember(t => t.ItemType, opt => opt.Ignore())
                .ForMember(t => t.Reason, opt => opt.Ignore())
                .ForMember(t => t.ItemId, opt => opt.MapFrom(s => s.BenefitId))
                .ReverseMap()
                .ForMember(t => t.BenefitId, opt => opt.MapFrom(s => s.ItemId))
                .ConstructUsing(s => MapperExtensions.GetEntity<product_BenefitNote>(s.Id));

            CreateMap<product_ProductOptionNote, Note>()
                .ForMember(t => t.ItemType, opt => opt.Ignore())
                .ForMember(t => t.Reason, opt => opt.Ignore())
                .ForMember(t => t.ItemId, opt => opt.MapFrom(s => s.ProductOptionId))
                .ReverseMap()
                .ForMember(t => t.ProductOptionId, opt => opt.MapFrom(s => s.ItemId))
                .ConstructUsing(s => MapperExtensions.GetEntity<product_ProductOptionNote>(s.Id));

            CreateMap<product_ProductRule, RuleItem>()
                .ForMember(s => s.ItemId, opts => opts.MapFrom(t => t.ProductId))
                .ReverseMap()
                .ForMember(s => s.ProductId, opts => opts.MapFrom(t => t.ItemId))
                .ConstructUsing(s => MapperExtensions.GetEntity<product_ProductRule>(s.Id));

            CreateMap<product_ProductOptionRule, RuleItem>()
                .ForMember(s => s.ItemId, opts => opts.MapFrom(t => t.ProductOptionId))
                .ReverseMap()
                .ForMember(s => s.ProductOptionId, opts => opts.MapFrom(t => t.ItemId))
                .ConstructUsing(s => MapperExtensions.GetEntity<product_ProductOptionRule>(s.Id));

            CreateMap<product_BenefitRule, RuleItem>()
                .ForMember(s => s.ItemId, opts => opts.MapFrom(t => t.BenefitId))
                .ReverseMap()
                .ForMember(s => s.BenefitId, opts => opts.MapFrom(t => t.ItemId))
                .ConstructUsing(s => MapperExtensions.GetEntity<product_BenefitRule>(s.Id));

            CreateMap<product_ProductBankAccount, ProductBankAccount>()
                .ReverseMap()
                .ForMember(s => s.Product, opt => opt.Ignore())
                .ConstructUsingServiceLocator();

            CreateMap<product_ProductOptionPaymentFrequency, ProductOptionPaymentFrequency>()
                .ReverseMap()
                .ForMember(s => s.ProductOption, opt => opt.Ignore());

            CreateMap<product_ProductOptionDependency, ProductOptionDependency>()
               .ReverseMap()
               .ForMember(s => s.ProductOption, opt => opt.Ignore())
               .ConstructUsing(s => MapperExtensions.GetEntity<product_ProductOptionDependency>(s.ProductOptionDependencyId));

            CreateMap<Load_BenefitsUploadErrorAudit, BenefitsUploadErrorAuditDetails>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<Load_BenefitsUploadErrorAudit>(s.Id));

            CreateMap<product_ProductOptionAllowanceType, ProductOptionAllowanceType>()
                .ReverseMap()
                .ForMember(s => s.ProductOption, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<product_ProductOptionAllowanceType>(s.ProductOptionAllowanceTypeId));

            CreateMap<product_ProductOptionBillingIntegration, ProductOptionBillingIntegration>()
                .ReverseMap()
                .ForMember(s => s.ProductOption, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<product_ProductOptionBillingIntegration>(s.ProductOptionBillingIntegrationId));

            CreateMap<product_ProductOptionSetting, ProductOptionSetting>()
                .ForMember(s => s.Id, opts => opts.MapFrom(t => t.ProductOptionId))
                .ReverseMap()
                .ForMember(s => s.ProductOptionId, opts => opts.MapFrom(t => t.Id))
                .ConstructUsing(s => MapperExtensions.GetEntity<product_ProductOptionSetting>(s.Id));

            CreateMap<product_Template, Template>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<product_Template>(s.TemplateId));

            CreateMap<product_BenefitAddBeneficiary, BenefitAddBeneficiary>()
                .ForMember(t => t.EndDate, opt => opt.MapFrom(s => s.EndDate ?? DateTime.MaxValue))
                .ReverseMap()
                .ForMember(s => s.Benefit, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<product_BenefitAddBeneficiary>(s.BenefitAddBeneficiariesId));

            CreateMap<product_BenefitCaptureEarning, BenefitCaptureEarning>()
                .ForMember(t => t.EndDate, opt => opt.MapFrom(s => s.EndDate ?? DateTime.MaxValue))
                .ReverseMap()
                .ForMember(s => s.Benefit, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<product_BenefitCaptureEarning>(s.BenefitCaptureEarningsId));

            CreateMap<product_BenefitCompensationAmount, BenefitCompensationAmount>()
                .ForMember(t => t.EndDate, opt => opt.MapFrom(s => s.EndDate ?? DateTime.MaxValue))
                .ReverseMap()
                .ForMember(s => s.Benefit, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<product_BenefitCompensationAmount>(s.BenefitCompensationAmountId));

            CreateMap<product_BenefitCoverMemberType, BenefitCoverMemberType>()
                .ForMember(t => t.EndDate, opt => opt.MapFrom(s => s.EndDate ?? DateTime.MaxValue))
                .ReverseMap()
                .ForMember(s => s.Benefit, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<product_BenefitCoverMemberType>(s.BenefitCoverMemberTypeId));

            CreateMap<product_BenefitMedicalReportRequired, BenefitMedicalReportRequired>()
                .ForMember(t => t.EndDate, opt => opt.MapFrom(s => s.EndDate ?? DateTime.MaxValue))
                .ReverseMap()
                .ForMember(s => s.Benefit, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<product_BenefitMedicalReportRequired>(s.BenefitMedicalReportRequiredId));

            CreateMap<product_ProductBenefitFormula, ProductBenefitFormula>()                      
                   .ReverseMap()
                   .ForMember(s => s.Benefit, opt => opt.Ignore())
                   .ConstructUsing(s => MapperExtensions.GetEntity<product_ProductBenefitFormula>(s.ProductBenefitFormulaId));
        }
    }
}
