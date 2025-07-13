using AutoMapper;

using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Client;
using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.Integrations.Contracts.Entities.Qlink;

using System;

namespace RMA.Service.ClientCare.Mappers
{
    public class ClientMappingProfile : Profile
    {
        public ClientMappingProfile()
        {
            CreateMap<client_Declaration, Declaration>()
                .ForMember(s => s.DependentDeclarations, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<client_Declaration>(s.DeclarationId));

            CreateMap<client_IndustryClassRenewal, IndustryClassRenewal>()
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<client_IndustryClassRenewal>(s.IndustryClassRenewalId));

            CreateMap<client_IndustryClassDeclarationConfiguration, IndustryClassDeclarationConfiguration>()
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<client_IndustryClassDeclarationConfiguration>(s.IndustryClassDeclarationConfigurationId));

            CreateMap<client_LetterOfGoodStanding, LetterOfGoodStanding>()
                .ForMember(s => s.MemberEmail, opt => opt.Ignore())
                .ForMember(s => s.MemberName, opt => opt.Ignore())
                .ForMember(s => s.PolicyId, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<client_LetterOfGoodStanding>(s.LetterOfGoodStandingId));

            CreateMap<client_Rate, ClientRate>()
                .ForMember(s => s.PolicyNumber, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<client_Rate>(s.RatesId));

            CreateMap<client_MaxAverageEarning, MaxAverageEarning>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<client_MaxAverageEarning>(s.MaxAverageEarningsId));

            CreateMap<client_LiveInAllowance, LiveInAllowance>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<client_LiveInAllowance>(s.LiveInAllowanceId));

            CreateMap<client_DeclarationPenaltyPercentage, DeclarationPenaltyPercentage>()
              .ReverseMap()
              .ConstructUsing(s => MapperExtensions.GetEntity<client_DeclarationPenaltyPercentage>(s.DeclarationPenaltyPercentageId));

            CreateMap<client_InflationPercentage, InflationPercentage>()
              .ReverseMap()
              .ConstructUsing(s => MapperExtensions.GetEntity<client_InflationPercentage>(s.InflationPercentageId));

            CreateMap<client_MinimumAllowablePremium, MinimumAllowablePremium>()
              .ReverseMap()
              .ConstructUsing(s => MapperExtensions.GetEntity<client_MinimumAllowablePremium>(s.MinimumAllowablePremiumId));

            CreateMap<client_DeclarationAllowance, DeclarationAllowance>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<client_DeclarationAllowance>(s.DeclarationAllowanceId));

            CreateMap<client_DeclarationBillingIntegration, DeclarationBillingIntegration>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<client_DeclarationBillingIntegration>(s.DeclarationBillingIntegrationId));

            CreateMap<QlinkTransactionModel, client_QlinkTransaction>()
                .ForMember(s => s.QlinkReservationTransactions_QlinkChildTransactionId, opt => opt.Ignore())
                .ForMember(s => s.QlinkReservationTransactions_QlinkParentTransactionId, opt => opt.Ignore())
               .ReverseMap();

            CreateMap<QlinkReservationTransactionModel, client_QlinkReservationTransaction>()
                   .ForMember(s => s.QlinkChildTransaction, opt => opt.Ignore())
                   .ForMember(s => s.QlinkParentTransaction, opt => opt.Ignore())
                   .ForMember(s => s.Comment, opt => opt.Ignore())
             .ReverseMap();

            CreateMap<client_RolePlayerPolicyOnlineSubmission, RolePlayerPolicyOnlineSubmission>()
              .ReverseMap()
              .ConstructUsing(s => MapperExtensions.GetEntity<client_RolePlayerPolicyOnlineSubmission>(s.RolePlayerPolicyOnlineSubmissionId));

            CreateMap<client_RolePlayerPolicyOnlineSubmissionDetail, RolePlayerPolicyOnlineSubmissionDetail>()
             .ReverseMap()
             .ConstructUsing(s => MapperExtensions.GetEntityIncludeDeleted<client_RolePlayerPolicyOnlineSubmissionDetail>(s.RolePlayerPolicyOnlineSubmissionDetailId));

            CreateMap<client_RolePlayerPolicyDeclaration, RolePlayerPolicyDeclaration>()
               .ForMember(s => s.RolePlayerPolicyTransactions, opt => opt.Ignore())
               .ForMember(s => s.ProrataDays, opt => opt.Ignore())
               .ForMember(s => s.FullYearDays, opt => opt.Ignore())
               .ForMember(s => s.OriginalTotalPremium, opt => opt.Ignore())
               .ForMember(s => s.OriginalEarningsPerEmployee, opt => opt.Ignore())
               .ForMember(s => s.InvoiceAmount, opt => opt.Ignore())
               .ForMember(s => s.AdjustmentAmount, opt => opt.Ignore())
               .ForMember(s => s.RequiresTransactionModification, opt => opt.Ignore())
               .ForMember(s => s.AllRequiredDocumentsUploaded, opt => opt.Ignore())
              .ReverseMap()
              .ConstructUsing(s => MapperExtensions.GetEntity<client_RolePlayerPolicyDeclaration>(s.RolePlayerPolicyDeclarationId));

            CreateMap<client_RolePlayerPolicyDeclarationDetail, RolePlayerPolicyDeclarationDetail>()
             .ForMember(t => t.OriginalPremium, opt => opt.MapFrom(s => Math.Round(s.Premium.Value, 2)))
             .ReverseMap()
             .ConstructUsing(s => MapperExtensions.GetEntityIncludeDeleted<client_RolePlayerPolicyDeclarationDetail>(s.RolePlayerPolicyDeclarationDetailId));

            CreateMap<client_RolePlayerPolicyTransaction, RolePlayerPolicyTransaction>()
             .ForMember(s => s.SourceProcess, opt => opt.Ignore())
             .ReverseMap()
             .ConstructUsing(s => MapperExtensions.GetEntity<client_RolePlayerPolicyTransaction>(s.RolePlayerPolicyTransactionId));

            CreateMap<client_RolePlayerPolicyTransactionDetail, RolePlayerPolicyTransactionDetail>()
             .ForMember(t => t.OriginalPremium, opt => opt.MapFrom(s => Math.Round(s.Premium, 2)))
             .ReverseMap()
             .ConstructUsing(s => MapperExtensions.GetEntity<client_RolePlayerPolicyTransactionDetail>(s.RolePlayerPolicyTransactionDetailId));

            CreateMap<RolePlayerPolicyTransaction, Invoice>()
                  .ForMember(t => t.PolicyId, opt => opt.MapFrom(s => s.PolicyId))
                  .ForMember(t => t.InvoiceStatus, opt => opt.MapFrom(s => s.TotalAmount.Value < 0 ? InvoiceStatusEnum.Queued : InvoiceStatusEnum.Queued))
                  .ForMember(t => t.InvoiceDate, opt => opt.MapFrom(s => DateTimeHelper.SaNow < s.EffectiveDate ? s.EffectiveDate : DateTimeHelper.SaNow))
                  .ForMember(t => t.CollectionDate, opt => opt.Ignore())
                  .ForMember(t => t.TotalInvoiceAmount, opt => opt.MapFrom(s => Math.Round(s.TotalAmount.Value, 2)))
                  .ForMember(t => t.InvoiceNumber, opt => opt.MapFrom(s => s.DocumentNumber))
                  .ForMember(s => s.InvoiceId, opt => opt.Ignore())
                  .ForMember(s => s.LinkedInvoiceId, opt => opt.Ignore())
                  .ForMember(s => s.Reason, opt => opt.Ignore())
                  .ForMember(s => s.InvoiceLineItems, opt => opt.Ignore())
                  .ForMember(s => s.NotificationDate, opt => opt.Ignore())
                  .ForMember(s => s.Balance, opt => opt.Ignore())
                  .ForMember(s => s.Transactions, opt => opt.Ignore())
                  .ForMember(t => t.SourceModule, opt => opt.MapFrom(s => SourceModuleEnum.ClientCare))
                  .ForMember(t => t.SourceProcess, opt => opt.MapFrom(s => SourceProcessEnum.ManuallyAuthorised))
                  .ForMember(t => t.InvoiceLineItems, opt => opt.MapFrom(s => s.RolePlayerPolicyTransactionDetails));


            CreateMap<client_RolePlayerPolicyTransaction, Invoice>()
                 .ForMember(t => t.PolicyId, opt => opt.MapFrom(s => s.PolicyId))
                 .ForMember(t => t.InvoiceStatus, opt => opt.MapFrom(s => s.TotalAmount.Value < 0 ? InvoiceStatusEnum.Queued : InvoiceStatusEnum.Queued))
                 .ForMember(t => t.InvoiceDate, opt => opt.MapFrom(s => DateTimeHelper.SaNow < s.EffectiveDate ? s.EffectiveDate : DateTimeHelper.SaNow))
                 .ForMember(t => t.CollectionDate, opt => opt.Ignore())
                 .ForMember(t => t.TotalInvoiceAmount, opt => opt.MapFrom(s => Math.Round(s.TotalAmount.Value, 2)))
                 .ForMember(t => t.InvoiceNumber, opt => opt.MapFrom(s => s.DocumentNumber))
                 .ForMember(s => s.InvoiceId, opt => opt.Ignore())
                 .ForMember(s => s.LinkedInvoiceId, opt => opt.Ignore())
                 .ForMember(s => s.Reason, opt => opt.Ignore())
                 .ForMember(s => s.InvoiceLineItems, opt => opt.Ignore())
                 .ForMember(s => s.NotificationDate, opt => opt.Ignore())
                 .ForMember(s => s.Balance, opt => opt.Ignore())
                 .ForMember(s => s.Transactions, opt => opt.Ignore())
                 .ForMember(t => t.SourceModule, opt => opt.MapFrom(s => SourceModuleEnum.ClientCare))
                 .ForMember(t => t.SourceProcess, opt => opt.MapFrom(s => SourceProcessEnum.BundleRaise))
                 .ForMember(t => t.InvoiceLineItems, opt => opt.MapFrom(s => s.RolePlayerPolicyTransactionDetails));

            CreateMap<RolePlayerPolicyTransactionDetail, InvoiceLineItem>()
                  .ForMember(s => s.CoverStartDate, opt => opt.MapFrom(t => t.EffectiveFrom))
                  .ForMember(s => s.CoverEndDate, opt => opt.MapFrom(t => t.EffectiveTo))
                  .ForMember(s => s.InsurableItem, opt => opt.MapFrom(t => t.CategoryInsured.ToString()))
                  .ForMember(s => s.NoOfEmployees, opt => opt.MapFrom(t => t.NumberOfEmployees))
                  .ForMember(s => s.Earnings, opt => opt.MapFrom(t => t.TotalEarnings))
                  .ForMember(s => s.Rate, opt => opt.MapFrom(t => t.Rate))
                  .ForMember(s => s.Amount, opt => opt.MapFrom(t => t.Premium))
                  .ForMember(s => s.InvoiceLineItemsId, opt => opt.Ignore())
                  .ForMember(s => s.InvoiceId, opt => opt.Ignore())
                  .ForMember(s => s.PolicyId, opt => opt.Ignore())
                  .ForMember(s => s.PolicyStatus, opt => opt.Ignore())
                  .ForMember(s => s.IsExcludedDueToStatus, opt => opt.Ignore())
                  .ForMember(s => s.PremiumPayable, opt => opt.Ignore())
                  .ForMember(s => s.Percentage, opt => opt.Ignore())
                  .ForMember(s => s.ActualPremium, opt => opt.Ignore())
                  .ForMember(s => s.Invoice, opt => opt.Ignore())
                  .ForMember(s => s.PaymentAmount, opt => opt.Ignore())
                  .ForMember(s => s.IsActive, opt => opt.Ignore())
                  .ForMember(s => s.BenefitPayrollId, opt => opt.Ignore())
                  .ForMember(s => s.BenefitRateId, opt => opt.Ignore())
                  .ReverseMap();

            CreateMap<client_RolePlayerPolicyTransactionDetail, InvoiceLineItem>()
                  .ForMember(s => s.CoverStartDate, opt => opt.MapFrom(t => t.EffectiveFrom))
                  .ForMember(s => s.CoverEndDate, opt => opt.MapFrom(t => t.EffectiveTo))
                  .ForMember(s => s.InsurableItem, opt => opt.MapFrom(t => t.CategoryInsured.ToString()))
                  .ForMember(s => s.NoOfEmployees, opt => opt.MapFrom(t => t.NumberOfEmployees))
                  .ForMember(s => s.Earnings, opt => opt.MapFrom(t => t.TotalEarnings))
                  .ForMember(s => s.Rate, opt => opt.MapFrom(t => t.Rate))
                  .ForMember(s => s.Amount, opt => opt.MapFrom(t => t.Premium))
                  .ForMember(s => s.InvoiceLineItemsId, opt => opt.Ignore())
                  .ForMember(s => s.InvoiceId, opt => opt.Ignore())
                  .ForMember(s => s.PolicyId, opt => opt.Ignore())
                  .ForMember(s => s.PolicyStatus, opt => opt.Ignore())
                  .ForMember(s => s.IsExcludedDueToStatus, opt => opt.Ignore())
                  .ForMember(s => s.PremiumPayable, opt => opt.Ignore())
                  .ForMember(s => s.Percentage, opt => opt.Ignore())
                  .ForMember(s => s.ActualPremium, opt => opt.Ignore())
                  .ForMember(s => s.Invoice, opt => opt.Ignore())
                  .ForMember(s => s.PaymentAmount, opt => opt.Ignore())
                  .ForMember(s => s.IsActive, opt => opt.Ignore())
                  .ForMember(s => s.BenefitPayrollId, opt => opt.Ignore())
                  .ForMember(s => s.BenefitRateId, opt => opt.Ignore())
                  .ReverseMap();

            CreateMap<Load_Rate, LoadRate>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<Load_Rate>(s.RatesId));

            CreateMap<client_OrganisationOptionItemValue, OrganisationOptionItemValue>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<client_OrganisationOptionItemValue>(s.OrganisationOptionItemValueId));

            CreateMap<Load_ConsolidatedFuneralMember, ConsolidatedFuneralMember>()
                .ForMember(x => x.CellNo, opt => opt.MapFrom(y => y.CelNo))
                .ReverseMap()
                .ForMember(x => x.CelNo, opt => opt.MapFrom(y => y.CellNo));
        }
    }
}










