using Autofac;

using RMA.Common.Constants;
using RMA.Common.Database;
using RMA.Common.Service;
using RMA.Common.Service.Extensions;
using RMA.Common.Service.ServiceLocation;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Database;
using RMA.Service.Admin.RulesManager.SDK;
using RMA.Service.Audit.Contracts.Interfaces;
using RMA.Service.ClaimCare.RuleTasks.MedicalInvoice.ClaimLiabilityStatus;
using RMA.Service.MediCare.RuleTasks.ClaimValidationRules.ClaimOutstandingRequirements;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.AmountLimitValidation;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.CheckIfAmountOrQuantitySubmitted;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.CheckIfCorrectCodeSubmitted;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.CheckIfRequestedAmountEqualsToLineTotalSubmitted;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.DateIsValid;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.DuplicateInvoice;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.DuplicateLineItem;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.ExternalCauseCode;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.FranchiseAmountLimit;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.ICD10CodeMatch;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.InvoiceCountGreaterThanFour;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.InvoiceDateBeforeEventDate;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.InvoiceIsActive;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.MedicalReport;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.NoInvoiceLines;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.RequestedAmountCannotExceedAllocated;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.ServiceDateAndPracticeDate;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.ServiceDateInFuture;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.StaleInvoice;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TariffCode;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TotalAssessedAmount;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TreatmentFromDateAfterDateOfDeath;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TreatmentFromDateBeforeEventDate;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TreatmentToDateAfterDateOfDeath;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TreatmentToDateBeforeEventDate;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TwoYear;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.VatCalculationFromServiceDate;
using RMA.Service.MediCare.RuleTasks.PreAuthRules.DuplicatePreAuth;
using RMA.Service.MediCare.RuleTasks.PreAuthRules.ProhibitedPractitionerType;

namespace RMA.Service.Admin.RulesManager
{
    public static partial class ContainerConfiguration
    {
        public static ContainerBuilder Configure()
        {
            // Start with the trusty old container builder.
            var builder = new ContainerBuilder();
            builder.RegisterModule<ServiceFabricServiceRegistry>();

            // Register any regular dependencies.
            builder.RegisterModule<CommonServiceServiceRegistry>();
            builder.RegisterModule<CommonDatabaseServiceRegistry>();
            builder.RegisterModule<EfDbContextServiceRegistry>();

            builder.RegisterType<RuleHost>().As<IRuleHost>();
            builder.RegisterType<RuleContext>().As<IRuleContext>();

            //Register task libraries
            builder.RegisterModule<ClientCare.RuleTasks.ServiceRegistry>();
            builder.RegisterModule<ClaimCare.RuleTasks.ServiceRegistry>();
            builder.RegisterModule<FinCare.RuleTasks.ServiceRegistry>();
            builder.RegisterModule<MediCare.RuleTasks.ServiceRegistry>();

            ConsumeTheirServices(builder);
            HostOurServices(builder);

            return builder;
        }

        private static void HostOurServices(ContainerBuilder builder)
        {
            //Call the generated code
            HostOurServicesPartial(builder);
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            //if any other module services are used register them here
            builder.UseStatelessService<IAuditLogV1Service>(AppNames.Audit, AppPrefix.Audit);
            builder.UseStatelessService<ILastViewedV1Service>(AppNames.Audit, AppPrefix.Audit);
            builder.RegisterType<TreatmentFromDateAfterDateOfDeathRule>().As<IRule>().Named<IRule>(TreatmentFromDateAfterDateOfDeathRule.RuleName);
            builder.RegisterType<TreatmentToDateAfterDateOfDeathRule>().As<IRule>().Named<IRule>(TreatmentToDateAfterDateOfDeathRule.RuleName);
            builder.RegisterType<TreatmentFromDateBeforeEventDateRule>().As<IRule>().Named<IRule>(TreatmentFromDateBeforeEventDateRule.RuleName);
            builder.RegisterType<TreatmentToDateBeforeEventDateRule>().As<IRule>().Named<IRule>(TreatmentToDateBeforeEventDateRule.RuleName);
            builder.RegisterType<InvoiceDateBeforeEventDateRule>().As<IRule>().Named<IRule>(InvoiceDateBeforeEventDateRule.RuleName);
            builder.RegisterType<DuplicateInvoiceRule>().As<IRule>().Named<IRule>(DuplicateInvoiceRule.RuleName);
            builder.RegisterType<AmountLimitValidationRule>().As<IRule>().Named<IRule>(AmountLimitValidationRule.RuleName);
            builder.RegisterType<ClaimLiabilityStatusRule>().As<IRule>().Named<IRule>(ClaimLiabilityStatusRule.RuleName);
            builder.RegisterType<AmountNotGreaterThanTariffRule>().As<IRule>().Named<IRule>(AmountNotGreaterThanTariffRule.RuleName);
            builder.RegisterType<TotalAssessedAmountRule>().As<IRule>().Named<IRule>(TotalAssessedAmountRule.RuleName);
            builder.RegisterType<VatCalculationFromServiceDateRule>().As<IRule>().Named<IRule>(VatCalculationFromServiceDateRule.RuleName);
            builder.RegisterType<ServiceDateInFutureRule>().As<IRule>().Named<IRule>(ServiceDateInFutureRule.RuleName);
            builder.RegisterType<RequestedAmountCannotExceedAllocatedAmountRule>().As<IRule>().Named<IRule>(RequestedAmountCannotExceedAllocatedAmountRule.RuleName);
            builder.RegisterType<ServiceDateAndPracticeDateRule>().As<IRule>().Named<IRule>(ServiceDateAndPracticeDateRule.RuleName);
            builder.RegisterType<InvoiceIsActiveRule>().As<IRule>().Named<IRule>(InvoiceIsActiveRule.RuleName);
            builder.RegisterType<MedicalReportRule>().As<IRule>().Named<IRule>(MedicalReportRule.RuleName);
            builder.RegisterType<ICD10CodeRule>().As<IRule>().Named<IRule>(ICD10CodeRule.RuleName);
            builder.RegisterType<TariffCodeRule>().As<IRule>().Named<IRule>(TariffCodeRule.RuleName);
            builder.RegisterType<ExternalCauseCodeRule>().As<IRule>().Named<IRule>(ExternalCauseCodeRule.RuleName);
            builder.RegisterType<StaleInvoiceRule>().As<IRule>().Named<IRule>(StaleInvoiceRule.RuleName);
            builder.RegisterType<TwoYearRule>().As<IRule>().Named<IRule>(TwoYearRule.RuleName);
            builder.RegisterType<InvoiceCountGreaterThanFourRule>().As<IRule>().Named<IRule>(InvoiceCountGreaterThanFourRule.RuleName);
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
        }
    }
}