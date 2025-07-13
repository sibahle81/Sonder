using Autofac;

using RMA.Common.Constants;
using RMA.Common.Service.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.BusinessProcessTasks.claimsRejectionNotification;
using RMA.Service.ClaimCare.BusinessProcessTasks.CMS_VOPD_Results_Notification;
using RMA.Service.ClaimCare.BusinessProcessTasks.FuneralTracing;
using RMA.Service.ClaimCare.BusinessProcessTasks.Section_40_notification;
using RMA.Service.ClaimCare.BusinessProcessTasks.TraceDocument;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.DigiCare.Contracts.Interfaces.Digi;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

namespace RMA.Service.ClaimCare.BusinessProcessTasks
{
    public class ProcessServiceRegistry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            ConsumeTheirServices(builder);
            builder.RegisterType<RegisterFuneralTask>().Named<IWizardProcess>("register-funeral-claim");
            builder.RegisterType<EventWizard>().Named<IWizardProcess>("manage-event");
            builder.RegisterType<ClaimBeneficiaryWizard>().Named<IWizardProcess>("create-beneficiary");
            builder.RegisterType<CreateBankingDetailsWizard>().Named<IWizardProcess>("create-banking-details");
            builder.RegisterType<UpdateBankingDetailsWizard>().Named<IWizardProcess>("update-banking-details");
            builder.RegisterType<RolePlayerApproval>().Named<IWizardProcess>("role-player");
            builder.RegisterType<ClaimsRejectionNotificationTask>().Named<IWizardProcess>("claims-rejection-notification");
            builder.RegisterType<CreateFuneralTracingWizard>().Named<IWizardProcess>("funeral-tracing");
            builder.RegisterType<ClaimInvestigationWizard>().Named<IWizardProcess>("claims-investigation");
            builder.RegisterType<TraceDocumentWizard>().Named<IWizardProcess>("trace-document");
            builder.RegisterType<ClaimAccidentWizard>().Named<IWizardProcess>("accident-claim");
            builder.RegisterType<ClaimDiseaseWizard>().Named<IWizardProcess>("disease-claim");
            builder.RegisterType<ClaimIncidentNotificationTask>().Named<IWizardProcess>("capture-claim-notification");
            builder.RegisterType<DiseaseIncidentNotificationTask>().Named<IWizardProcess>("disease-incident-notification");
            builder.RegisterType<AddInjuredEmployeeWizard>().Named<IWizardProcess>("add-injured-employees");
            builder.RegisterType<CMCVOPDResultsNotification>().Named<IWizardProcess>("CMC-VOPD-notification");
            builder.RegisterType<Section40Notification>().Named<IWizardProcess>("Section-40-notification");
            builder.RegisterType<CadDocumentRequestTask>().Named<IWizardProcess>("cad-document-request-wizard");
            builder.RegisterType<ClaimInvestigationCoidWizard>().Named<IWizardProcess>("claim-investigation-coid");
            builder.RegisterType<ClaimEarningsValidationWizard>().Named<IWizardProcess>("claim-earnings-validate");
            builder.RegisterType<ClaimAbove30percentpdScaWizard>().Named<IWizardProcess>("claim-above30percentpd-sca");
            builder.RegisterType<ClaimPensionPMCAWizard>().Named<IWizardProcess>("claim-pension-pmca");
            builder.RegisterType<ClaimSection51Wizard>().Named<IWizardProcess>("claim-section51");
            builder.RegisterType<ClaimMedicalAdvisorCoidWizard>().Named<IWizardProcess>("claim-medical-advisor-coid");
            builder.RegisterType<ClaimScaValidateWizard>().Named<IWizardProcess>("claim-sca-validate");
            builder.RegisterType<ClaimCcaValidateWizard>().Named<IWizardProcess>("claim-cca-validate");
            builder.RegisterType<ClaimPaymentReversalWizard>().Named<IWizardProcess>("claim-payment-reversal");
            builder.RegisterType<CADRequestInvoicePaymentWizard>().Named<IWizardProcess>("cad-request-invoice-payment");
            builder.RegisterType<TTDNearing18MonthsWizard>().Named<IWizardProcess>("ttd-nearing-18months");
            builder.RegisterType<MedicalReportMismatchWizard>().Named<IWizardProcess>("1st-medical-report-mismatch");
            builder.RegisterType<InvoicePayScaWizard>().Named<IWizardProcess>("invoice-payment-approval");
            builder.RegisterType<CaptureEarningsWizard>().Named<IWizardProcess>("capture-earnings");
            builder.RegisterType<DisabilityAssessmentApprovalWizard>().Named<IWizardProcess>("disability-assessment-approval");
            builder.RegisterType<ClaimComplianceWizard>().Named<IWizardProcess>("claim-compliance");
            builder.RegisterType<UploadFinalMedicalReportCCAWizard>().Named<IWizardProcess>("upload-final-medical-report-workflow-cca");
            builder.RegisterType<ReviewInjuryIcd10CodeWizard>().Named<IWizardProcess>("review-injury-icd10-codes");
            builder.RegisterType<MmiExpiryExtensionWizard>().Named<IWizardProcess>("mmi-expiry-extension");
            builder.RegisterType<CaptureEarningsOverrideWizard>().Named<IWizardProcess>("capture-earnings-override");
            builder.RegisterType<DisabilityToFatalWizard>().Named<IWizardProcess>("disability-to-fatal");
            builder.RegisterType<CaptureEarningsSection51Wizard>().Named<IWizardProcess>("capture-earnings-section-51");
            builder.RegisterType<ClaimLiabilityApprovalWizard>().Named<IWizardProcess>("claim-liability-approval");
            builder.RegisterType<UploadSection90ReviewReportWizard>().Named<IWizardProcess>("upload-section90-review-report");
            builder.RegisterType<PaymentAuthorisationRequestWizard>().Named<IWizardProcess>("payment-authorisation-request");
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            builder.UseStatelessService<IClaimService>(AppNames.ClientCare, AppPrefix.Claim);
            builder.UseStatelessService<IEventService>(AppNames.ClaimCare, AppPrefix.Event);
            builder.UseStatelessService<IBankAccountService>(AppNames.ClientCare, AppPrefix.Client);
            builder.UseStatelessService<IDocumentIndexService>(AppNames.ScanCare, AppPrefix.Document);
            builder.UseStatelessService<IEligibilityService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IPolicyService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IRolePlayerService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.UseStatelessService<IAccidentService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IClaimCommunicationService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<ISuspiciousTransactionModelService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<MediCare.Contracts.Interfaces.Medical.IICD10CodeService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IMedicalEstimatesService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IMedicalFormService>(AppNames.DigiCare, AppPrefix.Digi);
            builder.UseStatelessService<IDigiService>(AppNames.DigiCare, AppPrefix.Digi);
            builder.UseStatelessService<IIndustryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IConfigurationService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IClaimRequirementService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IClaimFinalizedIntegrationService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IClaimInvoiceService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IUserReminderService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPoolWorkFlowService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICommonSystemNoteService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IClaimEarningService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IWizardService>(AppNames.Admin, AppPrefix.BusinessProcessManager);
            builder.UseStatelessService<ISLAService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBrokerageService>(AppNames.ClientCare, AppPrefix.Broker);
        }
    }
}


