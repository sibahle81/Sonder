using Autofac;

using RMA.Common.Constants;
using RMA.Common.Service.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.MediCare.RuleTasks.ClaimValidationRules.ClaimOutstandingRequirements;
using RMA.Service.MediCare.RuleTasks.HealthcareProviderCheckRules;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.AmountLimitValidation;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.CheckIfAmountOrQuantitySubmitted;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.CheckIfCorrectCodeSubmitted;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.CheckIfRequestedAmountEqualsToLineTotalSubmitted;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.DateIsValid;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.DuplicateInvoice;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.DuplicateLineItem;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.ExternalCauseCode;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.FranchiseAmountLimit;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.ICD10CodeFormatValid;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.ICD10CodeMatch;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.ICD10CodePractitionerTypeMapping;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.IDPassportMatch;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.InvoiceCountGreaterThanFour;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.InvoiceDateBeforeEventDate;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.MedicalReport;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.NoInvoiceLines;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.PersonNameMatch;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.ServiceDateAndPracticeDate;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.ServiceDateInFuture;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.ServiceDateIsValid;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.StaleInvoice;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TariffCode;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TreatmentFromDateAfterDateOfDeath;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TreatmentFromDateBeforeEventDate;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TreatmentToDateAfterDateOfDeath;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TreatmentToDateBeforeEventDate;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TwoYear;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.UnmatchedClaim;
using RMA.Service.MediCare.RuleTasks.PreAuthRules;
using RMA.Service.MediCare.RuleTasks.PreAuthRules.DuplicatePreAuth;
using RMA.Service.MediCare.RuleTasks.PreAuthRules.ProhibitedPractitionerType;

namespace RMA.Service.MediCare.RuleTasks
{
    public class ServiceRegistry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            ConsumeTheirServices(builder);
            builder.RegisterType<PreAuthFromDateRule>().As<IRule>().Named<IRule>(PreAuthFromDateRule.RuleName);
            builder.RegisterType<PreAuthToDateRule>().As<IRule>().Named<IRule>(PreAuthToDateRule.RuleName);
            builder.RegisterType<PreAuthInjuryDateRule>().As<IRule>().Named<IRule>(PreAuthInjuryDateRule.RuleName);
            builder.RegisterType<AuthFromDateAfterDateOfDeathRule>().As<IRule>().Named<IRule>(AuthFromDateAfterDateOfDeathRule.RuleName);
            builder.RegisterType<AuthToDateNotAfterDateOfDeathRule>().As<IRule>().Named<IRule>(AuthToDateNotAfterDateOfDeathRule.RuleName);
            builder.RegisterType<TreatmentFromDateAfterDateOfDeathRule>().As<IRule>().Named<IRule>(TreatmentFromDateAfterDateOfDeathRule.RuleName);
            builder.RegisterType<TreatmentToDateAfterDateOfDeathRule>().As<IRule>().Named<IRule>(TreatmentToDateAfterDateOfDeathRule.RuleName);
            builder.RegisterType<TreatmentFromDateBeforeEventDateRule>().As<IRule>().Named<IRule>(TreatmentFromDateBeforeEventDateRule.RuleName);
            builder.RegisterType<TreatmentToDateBeforeEventDateRule>().As<IRule>().Named<IRule>(TreatmentToDateBeforeEventDateRule.RuleName);
            builder.RegisterType<InvoiceDateBeforeEventDateRule>().As<IRule>().Named<IRule>(InvoiceDateBeforeEventDateRule.RuleName);
            builder.RegisterType<DuplicateInvoiceRule>().As<IRule>().Named<IRule>(DuplicateInvoiceRule.RuleName);
            builder.RegisterType<AmountLimitValidationRule>().As<IRule>().Named<IRule>(AmountLimitValidationRule.RuleName);
            builder.RegisterType<UnmatchedClaimRule>().As<IRule>().Named<IRule>(UnmatchedClaimRule.RuleName);
            builder.RegisterType<ServiceDateInFutureRule>().As<IRule>().Named<IRule>(ServiceDateInFutureRule.RuleName);
            builder.RegisterType<ServiceDateAndPracticeDateRule>().As<IRule>().Named<IRule>(ServiceDateAndPracticeDateRule.RuleName);
            builder.RegisterType<IDPassportMatchRule>().As<IRule>().Named<IRule>(IDPassportMatchRule.RuleName);
            builder.RegisterType<PersonNameMatchRule>().As<IRule>().Named<IRule>(PersonNameMatchRule.RuleName);
            builder.RegisterType<MedicalReportRule>().As<IRule>().Named<IRule>(MedicalReportRule.RuleName);
            builder.RegisterType<ICD10CodeRule>().As<IRule>().Named<IRule>(ICD10CodeRule.RuleName);
            builder.RegisterType<MedicalReportRequiredRule>().As<IRule>().Named<IRule>(MedicalReportRequiredRule.RuleName);
            builder.RegisterType<TariffCodeRule>().As<IRule>().Named<IRule>(TariffCodeRule.RuleName);
            builder.RegisterType<ExternalCauseCodeRule>().As<IRule>().Named<IRule>(ExternalCauseCodeRule.RuleName);
            builder.RegisterType<ICD10CodePractitionerTypeMappingRule>().As<IRule>().Named<IRule>(ICD10CodePractitionerTypeMappingRule.RuleName);
            builder.RegisterType<StaleInvoiceRule>().As<IRule>().Named<IRule>(StaleInvoiceRule.RuleName);
            builder.RegisterType<TwoYearRule>().As<IRule>().Named<IRule>(TwoYearRule.RuleName);
            builder.RegisterType<InvoiceCountGreaterThanFourRule>().As<IRule>().Named<IRule>(InvoiceCountGreaterThanFourRule.RuleName);
            builder.RegisterType<HealthcareProviderIsActiveRule>().As<IRule>().Named<IRule>(HealthcareProviderIsActiveRule.RuleName);
            builder.RegisterType<ClaimOutstandingRequirementsRule>().As<IRule>().Named<IRule>(ClaimOutstandingRequirementsRule.RuleName);
            builder.RegisterType<NoInvoiceLinesRule>().As<IRule>().Named<IRule>(NoInvoiceLinesRule.RuleName);
            builder.RegisterType<CheckIfCorrectCodeSubmittedRule>().As<IRule>().Named<IRule>(CheckIfCorrectCodeSubmittedRule.RuleName);
            builder.RegisterType<DuplicateLineItemRule>().As<IRule>().Named<IRule>(DuplicateLineItemRule.RuleName);
            builder.RegisterType<FranchiseAmountLimitRule>().As<IRule>().Named<IRule>(FranchiseAmountLimitRule.RuleName);
            builder.RegisterType<CheckIfAmountOrQuantitySubmittedRule>().As<IRule>().Named<IRule>(CheckIfAmountOrQuantitySubmittedRule.RuleName);
            builder.RegisterType<CheckIfRequestedAmountEqualsToLineTotalSubmittedRule>().As<IRule>().Named<IRule>(CheckIfRequestedAmountEqualsToLineTotalSubmittedRule.RuleName);
            builder.RegisterType<DateIsValidRule>().As<IRule>().Named<IRule>(DateIsValidRule.RuleName);
            builder.RegisterType<DuplicatePreAuthRule>().As<IRule>().Named<IRule>(DuplicatePreAuthRule.RuleName);
            builder.RegisterType<ProhibitedPractitionerTypeRule>().As<IRule>().Named<IRule>(ProhibitedPractitionerTypeRule.RuleName);
            builder.RegisterType<ICD10CodeFormatValidRule>().As<IRule>().Named<IRule>(ICD10CodeFormatValidRule.RuleName);
            builder.RegisterType<ServiceDateIsValidRule>().As<IRule>().Named<IRule>(ServiceDateIsValidRule.RuleName);
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            builder.UseStatelessService<IPublicHolidayService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IRuleService>(AppNames.Admin, AppPrefix.RulesManager);
            builder.UseStatelessService<IPublicHolidayService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IConfigurationService>(AppNames.Admin, AppPrefix.MasterDataManager);
        }
    }
}
