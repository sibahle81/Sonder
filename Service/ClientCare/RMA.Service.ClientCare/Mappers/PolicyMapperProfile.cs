using AutoMapper;

using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Database.Entities;

using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace RMA.Service.ClientCare.Mappers
{
    public class PolicyMapperProfile : Profile
    {
        public PolicyMapperProfile()
        {
            CreateMap<policy_PolicyNote, PolicyNote>()
               .ForMember(t => t.Id, opt => opt.Ignore())
               .ForMember(t => t.ItemId, opt => opt.Ignore())
               .ForMember(t => t.ItemType, opt => opt.Ignore())
               .ForMember(t => t.IsActive, opt => opt.Ignore())
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<policy_PolicyNote>(s.PolicyNoteId));

            CreateMap<policy_Note, PolicyNote>()
                .ForMember(t => t.PolicyId, opt => opt.MapFrom(s => s.ItemId))
                .ForMember(t => t.PolicyNoteId, opt => opt.MapFrom(s => s.ItemId))
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<policy_Note>(s.Id));

            CreateMap<policy_PolicyNote, Note>()
                .ForMember(t => t.Id, opt => opt.MapFrom(s => s.PolicyNoteId))
                .ForMember(t => t.ItemId, opt => opt.MapFrom(s => s.PolicyId))
                .ForMember(t => t.ItemType, opt => opt.Ignore())
                .ForMember(t => t.Reason, opt => opt.Ignore())
                .ReverseMap()
                .ForMember(t => t.PolicyNoteId, opt => opt.MapFrom(s => s.Id))
                .ForMember(t => t.PolicyId, opt => opt.MapFrom(s => s.ItemId))
                .ConstructUsing(s => MapperExtensions.GetEntity<policy_PolicyNote>(s.Id));

            CreateMap<policy_Policy, Policy>()
                    .ForMember(s => s.QuoteV2, opt => opt.Ignore())
                    .ForMember(s => s.ProductCategoryType, opt => opt.Ignore())
                    .ForMember(s => s.TargetedPolicyInceptionDate, opt => opt.Ignore())
                    .ForMember(s => s.PremiumAdjustmentAmount, opt => opt.Ignore())
                    .ForMember(s => s.PolicyCancelReasonId, opt => opt.Ignore())
                    .ForMember(s => s.CanAdd, opt => opt.Ignore())
                    .ForMember(s => s.CanEdit, opt => opt.Ignore())
                    .ForMember(s => s.CanRemove, opt => opt.Ignore())
                    .ForMember(s => s.ClientName, opt => opt.Ignore())
                    .ForMember(s => s.BrokerageName, opt => opt.Ignore())
                    .ForMember(s => s.RepresentativeName, opt => opt.Ignore())
                    .ForMember(s => s.PaymentFrequencyId, opt => opt.Ignore())
                    .ForMember(s => s.PaymentMethodId, opt => opt.Ignore())
                    .ForMember(s => s.PolicyStatusId, opt => opt.Ignore())
                    .ForMember(s => s.ClientReference,
                        opt => opt.MapFrom(s => string.IsNullOrEmpty(s.ClientReference) ? null : s.ClientReference))
                    .ForMember(s => s.TenantId,
                        opt => opt.MapFrom(d =>
                            d.TenantId == 0
                                ? 1
                                : d.TenantId))
                    .ForMember(s => s.RolePlayerPolicyOnlineSubmissions, opt => opt.Ignore())
                    .ReverseMap()
                    .ForMember(s => s.QuoteV2, opt => opt.Ignore())
                    .ForMember(s => s.ClientReference, opt => opt.MapFrom(s => string.IsNullOrEmpty(s.ClientReference) ? null : s.ClientReference))
                    .ForMember(s => s.Brokerage, opt => opt.MapFrom(s => s.Brokerage))
                    .ForMember(s => s.ParentPolicy, opt => opt.Ignore())
                    .ForMember(s => s.Policies, opt => opt.Ignore())
                    .ForMember(s => s.Insurer, opt => opt.Ignore())
                    .ForMember(s => s.Brokerage, opt => opt.Ignore())
                    .ForMember(s => s.ProductOption, opt => opt.Ignore())
                    .ForMember(s => s.PolicyOwner, opt => opt.Ignore())
                    .ForMember(s => s.InsurerGroupSchemeAccesses, opt => opt.Ignore())
                    .ForMember(s => s.TenantId,
                        opt => opt.MapFrom(d =>
                            d.TenantId == 0
                                ? 1
                                : d.TenantId))
                    .ForMember(s => s.PolicyProductDeviations, opt => opt.Ignore())
                    .ForMember(s => s.AnnualIncreases, opt => opt.Ignore())
                    .ForMember(s => s.PremiumPaybacks, opt => opt.Ignore())
                    .ForMember(s => s.PolicyBinders, opt => opt.Ignore())
                    .ForMember(s => s.PolicyDetails, opt => opt.Ignore())
                    .ForMember(s => s.PolicyOptions, opt => opt.Ignore())
                    .ForMember(s => s.PolicyTreaties, opt => opt.Ignore())
                    .ForMember(s => s.PolicyContactOverrides, opt => opt.Ignore());

            CreateMap<policy_PolicyContact, PolicyContact>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<policy_PolicyContact>(s.PolicyContactId));

            CreateMap<policy_PolicyDocumentCommunicationMatrix, PolicyDocumentCommunicationMatrix>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<policy_PolicyDocumentCommunicationMatrix>(s.PolicyDocumentCommunicationMatrixId));

            CreateMap<policy_PolicyBroker, PolicyBroker>()
                .ReverseMap()
                .ForMember(s => s.Policy, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<policy_PolicyBroker>(s.PolicyBrokerId));

            CreateMap<policy_PolicyMovement, PolicyMovement>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<policy_PolicyMovement>(s.PolicyMovementId));

            CreateMap<policy_PolicyInsuredLife, PolicyInsuredLife>()
                .ForMember(s => s.PolicyNumber, opt => opt.Ignore())
                .ForMember(s => s.PolicyStatusId, opt => opt.Ignore())
                .ForMember(s => s.RolePlayer, opt => opt.Ignore())
                .ReverseMap()
                .ForMember(s => s.RolePlayerType, opt => opt.Ignore())
                .ForMember(s => s.Policy, opt => opt.Ignore())
                .ForMember(s => s.Benefit, opt => opt.Ignore())
                .ForMember(s => s.RolePlayer, opt => opt.Ignore());

            CreateMap<policy_ChildCover, ChildCover>()
                .ReverseMap();

            CreateMap<policy_PremiumListingError, PremiumListingError>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<policy_PremiumListingError>(s.Id));

            CreateMap<policy_PremiumListingSchedule, PremiumListingSchedule>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<policy_PremiumListingSchedule>(s.Id));

            CreateMap<policy_PremiumListingErrorAudit, PremiumListingErrorAudit>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<policy_PremiumListingErrorAudit>(s.Id));

            CreateMap<policy_PremiumListingFileAudit, PremiumListingFileAudit>()
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<policy_PremiumListingFileAudit>(s.Id));

            CreateMap<policy_InsuredLifeFileAudit, InsuredLifeFileAudit>()
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<policy_InsuredLifeFileAudit>(s.Id));

            CreateMap<policy_PolicyChangeProduct, PolicyChangeProduct>()
                .ReverseMap()
                .ForMember(s => s.Policy, opt => opt.Ignore())
                .ForMember(s => s.ProductOption, opt => opt.Ignore());

            CreateMap<policy_PolicyChangeBenefit, PolicyChangeBenefit>()
                .ReverseMap()
                .ForMember(s => s.PolicyChangeProduct, opt => opt.Ignore())
                .ForMember(s => s.OldBenefit, opt => opt.Ignore())
                .ForMember(s => s.NewBenefit, opt => opt.Ignore());

            CreateMap<policy_PolicyStatusChangeAudit, PolicyStatusChangeAudit>()
               .ForMember(s => s.VapsPolicies, opt => opt.Ignore())
               .ForMember(s => s.Policy, opt => opt.Ignore())
               .ReverseMap()
               .ForMember(s => s.Policy, opt => opt.Ignore())
               .ConstructUsing(s => MapperExtensions.GetEntity<policy_PolicyStatusChangeAudit>(s.PolicyStatusChangeAuditId));

            CreateMap<policy_Cover, Cover>()
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<policy_Cover>(s.CoverId));

            CreateMap<policy_CategoryInsuredCover, CategoryInsuredCover>()
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<policy_CategoryInsuredCover>(s.CategoryInsuredCoverId));

            CreateMap<policy_AnnualIncrease, AnnualIncrease>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<policy_AnnualIncrease>(s.AnnualIncreaseId));

            CreateMap<Load_StageGroupRisk, StageGroupRiskMember>()
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<Load_StageGroupRisk>(s.StageGroupRiskId));

            CreateMap<policy_PremiumPayback, PremiumPayback>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<policy_PremiumPayback>(s.PremiumPaybackId));

            CreateMap<reinsurance_Treaty, ReinsuranceTreaty>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<reinsurance_Treaty>(s.TreatyId));

            CreateMap<product_BenefitOptionItemValue, BenefitOptionItemValueResponse>()
                .ForMember(s => s.BenefitId, o => o.MapFrom(x => x.BenefitId))
                .ForMember(s => s.BenefitOptionItemValueId, o => o.MapFrom(x => x.BenefitOptionItemValueId))
                .ForMember(s => s.OptionItemName, o => o.MapFrom(x => x.OptionItem.Name))
                .ForMember(s => s.OptionTypeCode, o => o.MapFrom(x => x.OptionItem.OptionType.Code))
                .ForMember(s => s.OptionItemField, o => o.MapFrom(x => x.OptionItemField))
                .ForMember(s => s.OptionItemCode, o => o.MapFrom(x => x.OptionItem.Code))
                .ForMember(s => s.OverrideValue, o => o.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<product_BenefitOptionItemValue>(s.BenefitOptionItemValueId));

            CreateMap<policy_PolicyBenefitCategory, PolicyBenefitCategory>()
                .ReverseMap()
                .ForMember(s => s.BenefitCategoryOptions, opt => opt.Ignore())
                .ForMember(s => s.PolicyBenefitDetail, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<policy_PolicyBenefitCategory>(s.BenefitCategoryId));

            CreateMap<policy_PolicyBenefitDetail, PolicyBenefitDetail>()
                .ReverseMap()
                .ForMember(s => s.BenefitPayrolls, opt => opt.Ignore())
                .ForMember(s => s.BenefitRates, opt => opt.Ignore())
                .ForMember(s => s.BenefitReinsAverages, opt => opt.Ignore())
                .ForMember(s => s.PolicyBenefitCategories, opt => opt.Ignore())
                .ForMember(s => s.PolicyBenefitOptions, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<policy_PolicyBenefitDetail>(s.BenefitDetailId));

            CreateMap<policy_PolicyDetail, PolicyDetail>()
               .ReverseMap()
               .ForMember(s => s.Policy, opt => opt.Ignore())
               .ForMember(s => s.QuoteV2, opt => opt.Ignore())
               .ConstructUsing(s => MapperExtensions.GetEntity<policy_PolicyDetail>(s.PolicyDetailId));

            CreateMap<product_ProductOptionOptionItemValue, ProductOptionItemValuesResponse>()
                .ForMember(s => s.OptionItemName, o => o.MapFrom(x => x.OptionItem.Name))
                .ForMember(s => s.OptionTypeCode, o => o.MapFrom(x => x.OptionItem.OptionType.Code))
                .ForMember(s => s.OptionItemField, o => o.MapFrom(x => x.OptionItemField))
                .ForMember(s => s.OptionItemCode, o => o.MapFrom(x => x.OptionItem.Code))
                .ForMember(s => s.OverrideValue, o => o.MapFrom(x => x.Value))
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<product_ProductOptionOptionItemValue>(s.ProductOptionOptionItemValueId));

            CreateMap<policy_PersonInsuredCategory, PersonInsuredCategory>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<policy_PersonInsuredCategory>(s.PersonInsuredCategoryId));

            CreateMap<policy_InsuredSumAssured, InsuredSumAssured>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<policy_InsuredSumAssured>(s.InsuredSumAssuredId));

            CreateMap<policy_PostRetirementMedicalAnnuityInvoiceHeader, PostRetirementMedicalAnnuityInvoiceHeader>()
               .ForMember(s => s.CompanyName, opt => opt.Ignore())
               .ForMember(s => s.CompanyBankAccountNumber, opt => opt.Ignore())
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<policy_PostRetirementMedicalAnnuityInvoiceHeader>(s.PostRetirementMedicalAnnuityInvoiceHeaderId));
        }

        private readonly SemaphoreSlim _locker = new SemaphoreSlim(1, 1);

        private policy_PolicyBroker GetPolicyRepresentative(ICollection<policy_PolicyBroker> policyBrokers)
        {
            policy_PolicyBroker representative;
            _locker.Wait();
            try
            {
                representative = policyBrokers.Where(r => r.EffectiveDate <= DateTimeHelper.SaNow).
                    OrderByDescending(r => r.EffectiveDate).First();
            }
            finally
            {
                _locker.Release();
            }
            return representative;
        }
    }
}
