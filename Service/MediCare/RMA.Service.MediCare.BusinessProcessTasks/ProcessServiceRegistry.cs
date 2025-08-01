﻿using Autofac;
using RMA.Common.Constants;
using RMA.Common.Service.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.SDK;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClaimCare.RuleTasks.PreAuthClaim;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.FinCare.BusinessProcessTasks.Notification;
using RMA.Service.MediCare.BusinessProcessTasks.HealthcareProvider;
using RMA.Service.MediCare.BusinessProcessTasks.MedicalInvoiceQueryWizard;
using RMA.Service.MediCare.BusinessProcessTasks.MedicalInvoiceWizard;
using RMA.Service.MediCare.BusinessProcessTasks.PMPScheduleWizard;
using RMA.Service.MediCare.BusinessProcessTasks.PreAuthorizationChronicWizard;
using RMA.Service.MediCare.BusinessProcessTasks.PreAuthorizationProstheticWizard;
using RMA.Service.MediCare.BusinessProcessTasks.PreAuthorizationTreatmentWizard;
using RMA.Service.MediCare.BusinessProcessTasks.PreAuthorizationWizard;
using RMA.Service.MediCare.BusinessProcessTasks.TebaInvoiceWizards;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.RuleTasks.ClaimValidationRules.ClaimOutstandingRequirements;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.AmountLimitValidation;
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
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.MedicalReport;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.NoInvoiceLines;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.ServiceDateAndPracticeDate;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.ServiceDateInFuture;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.StaleInvoice;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TariffCode;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TreatmentFromDateAfterDateOfDeath;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TreatmentFromDateBeforeEventDate;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TreatmentToDateAfterDateOfDeath;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TreatmentToDateBeforeEventDate;
using RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.TwoYear;
using RMA.Service.MediCare.RuleTasks.PreAuthRules;
using RMA.Service.MediCare.RuleTasks.PreAuthRules.DuplicatePreAuth;
using RMA.Service.MediCare.RuleTasks.PreAuthRules.ProhibitedPractitionerType;
using RMA.Service.PensCare.Contracts.Interfaces.ClaimMap;
using RMA.Service.PensCare.Contracts.Interfaces.PMP;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

namespace RMA.Service.MediCare.BusinessProcessTasks
{
    public class ProcessServiceRegistry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {//--force rebuild 12:50PM April, 16, 2025

            ConsumeTheirServices(builder);
            builder.RegisterType<PreAuthorizationFormWizard>().Named<IWizardProcess>("preauth-capture-form");
            builder.RegisterType<PreAuthorisationReviewWizard>().Named<IWizardProcess>("review-preauth");
            builder.RegisterType<PreAuthorisationEditWizard>().Named<IWizardProcess>("edit-preauth");
            builder.RegisterType<MedicalInvoiceFormWizard>().Named<IWizardProcess>("capture-medical-invoice");
            builder.RegisterType<MedicalInvoiceFormWizard>().Named<IWizardProcess>("edit-medical-invoice");
            builder.RegisterType<NotificationTask>().Named<IWizardProcess>("capture-preauth-notification");
            builder.RegisterType<PreAuthorisationEditWizard>().Named<IWizardProcess>("edit-preauth-notification");
            builder.RegisterType<PreAuthorisationReviewWizard>().Named<IWizardProcess>("review-preauth-notification");
            builder.RegisterType<NotificationTask>().Named<IWizardProcess>("capture-medical-invoice-notification");
            builder.RegisterType<NotificationTask>().Named<IWizardProcess>("pend-medical-invoice-notification");
            builder.RegisterType<NotificationTask>().Named<IWizardProcess>("reject-medical-invoice-notification");
            builder.RegisterType<PreAuthorizationTreatmentCaptureWizard>().Named<IWizardProcess>("capture-preauth-treatment");
            builder.RegisterType<PreAuthorizationTreatmentEditWizard>().Named<IWizardProcess>("edit-preauth-treatment");
            builder.RegisterType<PreAuthorizationTreatmentReviewWizard>().Named<IWizardProcess>("review-treatment-preauth");
            builder.RegisterType<PreAuthorizationProsthetistQuoteCaptureWizard>().Named<IWizardProcess>("capture-preauth-prosthetist-quote");
            builder.RegisterType<PreAuthorizationProsthetistQuoteReviewWizard>().Named<IWizardProcess>("review-preauth-prosthetist-quote");
            builder.RegisterType<PreAuthorizationChronicCaptureWizard>().Named<IWizardProcess>("capture-preauth-chronic");
            builder.RegisterType<PreAuthorizationChronicReviewWizard>().Named<IWizardProcess>("review-chronic-preauth");
            builder.RegisterType<PreAuthorizationChronicEditWizard>().Named<IWizardProcess>("edit-chronic-preauth");
            builder.RegisterType<PreAuthorizationProsthetistAuthCaptureWizard>().Named<IWizardProcess>("capture-preauth-prosthetist");
            builder.RegisterType<PreAuthorizationProstheticReviewWizard>().Named<IWizardProcess>("review-prosthetic-preauth");
            builder.RegisterType<PreAuthorizationProstheticEditWizard>().Named<IWizardProcess>("edit-prosthetic-preauth");
            builder.RegisterType<HealthcareProviderRegistrationWizard>().Named<IWizardProcess>("healthcare-provider-registration");
            builder.RegisterType<PMPScheduleFormWizard>().Named<IWizardProcess>("pmp-schedule");
            builder.RegisterType<HealthcareProviderUpdateDemographicsWizard>().Named<IWizardProcess>("update-healthcare-provider-demographics");
            builder.RegisterType<HealthcareProviderBankingDetailsWizard>().Named<IWizardProcess>("update-healthcare-provider-banking-details");
            builder.RegisterType<TebaInvoiceCaptureWizard>().Named<IWizardProcess>("capture-teba-invoice");
            builder.RegisterType< TebaInvoicePendRejectProcessWizard > ().Named<IWizardProcess>("teba-invoices-pend-reject-process");
            builder.RegisterType<MaaPreauthRoutingWizard>().Named<IWizardProcess>("maa-preauth-review-routing");
            builder.RegisterType<MedicalInvoiceAssessmentWizard>().Named<IWizardProcess>("medical-invoice-assessment");
            builder.RegisterType<PreAuthorisationReviewWizard>().Named<IWizardProcess>("review-preauth-hum");
            builder.RegisterType<PreAuthorisationReviewWizard>().Named<IWizardProcess>("review-preauth-cca");
            builder.RegisterType<PreAuthorisationReviewWizard>().Named<IWizardProcess>("review-preauth-case-management");
            builder.RegisterType<MedicalInvoiceQueryResponseWizard>().Named<IWizardProcess>("medical-invoice-query-response");
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            builder.UseStatelessService<IPreAuthorisationService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IHealthCareProviderService>(AppNames.MediCare, AppPrefix.Medical);
            builder.RegisterType<RuleContext>().As<IRuleContext>();
            builder.RegisterType<ClaimLiabilityStatusRule>().As<IRule>().Named<IRule>(ClaimLiabilityStatusRule.RuleName);
            builder.RegisterType<PreAuthFromDateRule>().As<IRule>().Named<IRule>(PreAuthFromDateRule.RuleName);
            builder.RegisterType<PreAuthToDateRule>().As<IRule>().Named<IRule>(PreAuthToDateRule.RuleName);
            builder.RegisterType<PreAuthInjuryDateRule>().As<IRule>().Named<IRule>(PreAuthInjuryDateRule.RuleName);
            builder.RegisterType<AuthFromDateAfterDateOfDeathRule>().As<IRule>().Named<IRule>(AuthFromDateAfterDateOfDeathRule.RuleName);
            builder.RegisterType<AuthToDateNotAfterDateOfDeathRule>().As<IRule>().Named<IRule>(AuthToDateNotAfterDateOfDeathRule.RuleName);
            builder.RegisterType<ProstheticEarlyReplacementRule>().As<IRule>().Named<IRule>(ProstheticEarlyReplacementRule.RuleName);
            builder.UseStatelessService<IPreAuthClaimService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IInvoiceService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IInvoiceHelperService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<ITravelAuthorisationService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IInvoiceMedicalSwitchService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IPMPService>(AppNames.PensCare, AppPrefix.PMP);
            builder.UseStatelessService<IMedicalInvoiceClaimService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IPensionClaimMapService>(AppNames.PensCare, AppPrefix.ClaimMap);
            builder.UseStatelessService<IRolePlayerService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.RegisterType<ClaimCare.RuleTasks.MedicalInvoice.ClaimLiabilityStatus.ClaimLiabilityStatusRule>().As<IRule>().Named<IRule>(ClaimCare.RuleTasks.MedicalInvoice.ClaimLiabilityStatus.ClaimLiabilityStatusRule.RuleName);
            builder.RegisterType<ClaimCare.RuleTasks.MedicalInvoice.ICD10Code.ICD10CodeRule>().As<IRule>().Named<IRule>(ClaimCare.RuleTasks.MedicalInvoice.ICD10Code.ICD10CodeRule.RuleName);
            builder.RegisterType<ClaimCare.RuleTasks.MedicalInvoice.MedicalBenefit.MedicalBenefitRule>().As<IRule>().Named<IRule>(ClaimCare.RuleTasks.MedicalInvoice.MedicalBenefit.MedicalBenefitRule.RuleName);
            builder.RegisterType<TreatmentFromDateAfterDateOfDeathRule>().As<IRule>().Named<IRule>(TreatmentFromDateAfterDateOfDeathRule.RuleName);
            builder.RegisterType<TreatmentToDateAfterDateOfDeathRule>().As<IRule>().Named<IRule>(TreatmentToDateAfterDateOfDeathRule.RuleName);
            builder.RegisterType<TreatmentFromDateBeforeEventDateRule>().As<IRule>().Named<IRule>(TreatmentFromDateBeforeEventDateRule.RuleName);
            builder.RegisterType<TreatmentToDateBeforeEventDateRule>().As<IRule>().Named<IRule>(TreatmentToDateBeforeEventDateRule.RuleName);
            builder.RegisterType<InvoiceDateBeforeEventDateRule>().As<IRule>().Named<IRule>(InvoiceDateBeforeEventDateRule.RuleName);
            builder.RegisterType<DuplicateInvoiceRule>().As<IRule>().Named<IRule>(DuplicateInvoiceRule.RuleName);
            builder.RegisterType<AmountLimitValidationRule>().As<IRule>().Named<IRule>(AmountLimitValidationRule.RuleName);
            builder.RegisterType<ServiceDateInFutureRule>().As<IRule>().Named<IRule>(ServiceDateInFutureRule.RuleName);
            builder.RegisterType<ServiceDateAndPracticeDateRule>().As<IRule>().Named<IRule>(ServiceDateAndPracticeDateRule.RuleName);
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
            builder.UseStatelessService<IDocumentGeneratorService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IDocumentIndexService>(AppNames.ScanCare, AppPrefix.Document);
            builder.UseStatelessService<IUserService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IRoleService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IPermissionService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IWizardService>(AppNames.Admin, AppPrefix.BusinessProcessManager);
            builder.UseStatelessService<ISLAService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IRolePlayerQueryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IMedicareCommunicationService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IEventService>(AppNames.ClaimCare, AppPrefix.Event);
            builder.UseStatelessService<IClaimService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IUserService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IHealthCareProviderService>(AppNames.MediCare, AppPrefix.Medical);
        }
    }
}