using Autofac;

using RMA.Common.Constants;
using RMA.Common.Service.Extensions;

using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Services;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClientCare.BusinessProcessTasks.Agents;
using RMA.Service.ClientCare.BusinessProcessTasks.BrokerageWizard;
using RMA.Service.ClientCare.BusinessProcessTasks.ChangePolicyStatusWizard;
using RMA.Service.ClientCare.BusinessProcessTasks.ClientCareNotification;
using RMA.Service.ClientCare.BusinessProcessTasks.CommissionPaymentRejectionNotifications;
using RMA.Service.ClientCare.BusinessProcessTasks.ManagePolicyGroupWizard;
using RMA.Service.ClientCare.BusinessProcessTasks.ManagePolicyIndividualWizard;
using RMA.Service.ClientCare.BusinessProcessTasks.MoveBrokerPolicy;
using RMA.Service.ClientCare.BusinessProcessTasks.MovePolicyScheme;
using RMA.Service.ClientCare.BusinessProcessTasks.UpgradePolicy;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Lead;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Quote;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

namespace RMA.Service.ClientCare.BusinessProcessTasks
{
    public class ProcessServiceRegistry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            ConsumeTheirServices(builder);

            //Product Wizard
            builder.RegisterType<ProductWizard.ProductWizard>().Named<IWizardProcess>("product");

            //Benefit Wizard
            builder.RegisterType<BenefitWizard.BenefitWizard>().Named<IWizardProcess>("benefit");

            //Product Option Wizard
            builder.RegisterType<ProductOptionWizard.ProductOptionWizard>().Named<IWizardProcess>("product-option");

            //Link Agent Wizard
            builder.RegisterType<Agents.LinkAgentWizard>().Named<IWizardProcess>("link-agent");

            // Cancel Policy
            builder.RegisterType<CancelPolicy.StartWizard>();
            builder.RegisterType<CancelPolicy.SubmitWizard>();
            builder.RegisterType<CancelPolicy.CancelPolicy>().Named<IWizardProcess>("cancel-policy");

            //Inter Bank Transfer
            builder.RegisterType<InterBankTransfer.StartWizard>();
            builder.RegisterType<InterBankTransfer.SubmitWizard>();

            //Create/Manage Brokerage
            builder.RegisterType<ManageBrokerageWizard>().Named<IWizardProcess>("brokerage-manager");

            builder.RegisterType<ManageAgentWizard>().Named<IWizardProcess>("broker-manager");

            //Create/Manage BinderPartner
            builder.RegisterType<ManageBinderPartnerWizard>().Named<IWizardProcess>("binderpartner-manager");

            //create/group risk policies 
            builder.RegisterType<ManageGroupRiskPoliciesWizard>().Named<IWizardProcess>("manage-group-risk-policies");

            //Create/Indivdual Wizard
            builder.RegisterType<NewBusinessIndividual.NewBusinessIndividualWizard>().Named<IWizardProcess>("new-business-individual");

            //Create/Group Wizard
            builder.RegisterType<NewBusinessGroup.NewBusinessGroupWizard>().Named<IWizardProcess>("new-business-group");

            //Premium Listing
            builder.RegisterType<PremiumListing.PremiumListing>().Named<IWizardProcess>("premium-listing");
            builder.RegisterType<PremiumListingSchedule.PremiumListingSchedules>().Named<IWizardProcess>("premium-listing-documents");
            builder.RegisterType<ConsolidatedFuneralOnboarding.ConsolidatedFuneralOnboarding>().Named<IWizardProcess>("cfp-onboarding");
            builder.RegisterType<MyValuePlusOnboarding.MyValuePlusOnboarding>().Named<IWizardProcess>("mvp-onboarding");
            builder.RegisterType<GroupRiskOnboarding.GroupRiskOnboarding>().Named<IWizardProcess>("grouprisk-onboarding");

            //Premium Payback
            builder.RegisterType<PolicyPremiumPayback.PolicyPremiumPayback>().Named<IWizardProcess>("policy-premium-payback");
            builder.RegisterType<PolicyPremiumPayback.PolicyPremiumPaybackErrors>().Named<IWizardProcess>("policy-premium-payback-errors");

            //Create/Manage Policies
            builder.RegisterType<ManagePolicyIndividual>().Named<IWizardProcess>("manage-policy-individual");
            builder.RegisterType<ManagePolicyGroup>().Named<IWizardProcess>("manage-policy-group");
            builder.RegisterType<ChangePolicyStatus>().Named<IWizardProcess>("change-policy-status");
            builder.RegisterType<ClientCareNotificationTask>().Named<IWizardProcess>("clientcare-notification");
            builder.RegisterType<UpgradeDowngradePolicy>().Named<IWizardProcess>("upgrade-downgrade-policy");

            //Create/Cancel Policy Individual
            builder.RegisterType<CancelIndividualPolicyWizard.CancelIndividualPolicyWizard>().Named<IWizardProcess>("cancel-policy-individual");
            builder.RegisterType<CancelGroupPolicyWizard.CancelGroupPolicyWizard>().Named<IWizardProcess>("cancel-policy-group");

            // Maintain policy members wizard
            builder.RegisterType<MemberRelations.MemberRelationsWizard>().Named<IWizardProcess>("maintain-policy-members");
            builder.RegisterType<ManagePolicyGroupMemberWizard.ManagePolicyGroupMember>().Named<IWizardProcess>("maintain-group-member");

            //Move Broker Policies
            builder.RegisterType<MoveBrokerPolicyWizard>().Named<IWizardProcess>("move-broker-policies");
            builder.RegisterType<MovePolicySchemeWizard>().Named<IWizardProcess>("move-policy-scheme");

            //Continue Policy
            builder.RegisterType<ContinuePolicyWizard.ContinuePolicyWizard>().Named<IWizardProcess>("continue-policy");

            //Reinstate Policy
            builder.RegisterType<ReinstatePolicyWizard.ReinstatePolicyWizard>().Named<IWizardProcess>("reinstate-policy");
            builder.RegisterType<CommissionPaymentRejectedNotificationTask>().Named<IWizardProcess>("commission-payment-rejected-notification");
            builder.RegisterType<CommissionPaymentBankingUpdatedNotificationTask>().Named<IWizardProcess>("commission-payment-banking-updated-notification");
            builder.RegisterType<FSPEImportNotificationTask>().Named<IWizardProcess>("fspe-import-notification");

            // Quotation
            builder.RegisterType<RMAMutualAssuranceQuotationWizard.RMAMutualAssuranceQuotationWizard>().Named<IWizardProcess>("rma-quotation");
            builder.RegisterType<RMLMutualAssuranceQuotationWizard.RMLMutualAssuranceQuotationWizard>().Named<IWizardProcess>("rml-quotation");

            //Member
            builder.RegisterType<MemberWizard.MemberWizard>().Named<IWizardProcess>("member");

            // RolePlayer
            builder.RegisterType<RolePlayerOnboardingWizard.RolePlayerOnboardingWizard>().Named<IWizardProcess>("roleplayer-onboarding");

            //Lapse policy
            builder.RegisterType<LapsePolicy.LapsePolicyWizard>().Named<IWizardProcess>("lapse-policy");

            //RMA RML Policy (NON-FUNERAL)
            builder.RegisterType<Policy.RMAMutualAssurancePolicyWizard>().Named<IWizardProcess>("rma-policy");
            builder.RegisterType<Policy.RMALifeAssurancePolicyWizard>().Named<IWizardProcess>("rml-policy");
            builder.RegisterType<Policy.RMARMLCancelPolicyWizard>().Named<IWizardProcess>("rma-rml-policy-cancellation");
            builder.RegisterType<Policy.RMARMLReinstatePolicyWizard>().Named<IWizardProcess>("rma-rml-policy-reinstatement");
            builder.RegisterType<Policy.RMARMLMaintainPolicyWizard>().Named<IWizardProcess>("rma-rml-policy-maintanance");

            //Insured Lives
            builder.RegisterType<InsuredLives.InsuredLives>().Named<IWizardProcess>("insured-lives");

            //Renewals
            builder.RegisterType<IndustryClassRenewalWizard.IndustryClassRenewalWizard>().Named<IWizardProcess>("industry-class-renewals");
            builder.RegisterType<DeclarationVarianceWizard.DeclarationVarianceWizard>().Named<IWizardProcess>("declaration-variance");
            builder.RegisterType<DeclarationAssistanceWizard.DeclarationAssistanceWizard>().Named<IWizardProcess>("declaration-assistance");
            builder.RegisterType<RateAdjustmentWizard.RateAdjustmentWizard>().Named<IWizardProcess>("rate-adjustment");
            builder.RegisterType<WhatsappCompanyList.WhatsappCompanyList>().Named<IWizardProcess>("whatsapp-company-list");

            //Declaration Configuration
            builder.RegisterType<IndustryClassDeclarationConfigurationWizard.IndustryClassDeclarationConfigurationWizard>().Named<IWizardProcess>("industry-class-declaration-configuration");

            //group risk premium rates
            builder.RegisterType<ManageGroupRiskPremiumRates.ManageGroupRiskPremiumRates>().Named<IWizardProcess>("manage-grouprisk-premium-rates");
            
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            builder.UseStatelessService<ISkillCategoryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IBenefitSetService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<IBenefitService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<IProductService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<IPolicyService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IUserService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IPeriodService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IGeneratePolicyScheduleService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IProductSkillCategoryService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<IProductRuleService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<IProductOptionService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<IProductOptionRuleService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<IProductOptionCoverService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<IDocumentGeneratorService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IProductNoteService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<IBenefitRuleService>(AppNames.ClientCare, AppPrefix.Product);
            builder.UseStatelessService<IBrokerageService>(AppNames.ClientCare, AppPrefix.Broker);
            builder.UseStatelessService<IRepresentativeService>(AppNames.ClientCare, AppPrefix.Broker);
            builder.UseStatelessService<IRolePlayerService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.UseStatelessService<IRolePlayerPolicyService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.UseStatelessService<IPolicyInsuredLifeService>(AppNames.ClientCare, AppPrefix.RolePlayer);
            builder.UseStatelessService<IPolicyCaseService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IPolicyCommunicationService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IDocumentIndexService>(AppNames.ScanCare, AppPrefix.Document);
            builder.UseStatelessService<IInvoiceService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<IPremiumListingService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IConsolidatedFuneralService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IMyValuePlusService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IWizardService>(AppNames.Admin, AppPrefix.BusinessProcessManager);
            builder.UseStatelessService<IConfigurationService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ITransactionCreatorService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<ITransactionService>(AppNames.Billing, AppPrefix.Billing);
            builder.UseStatelessService<ILeadService>(AppNames.ClientCare, AppPrefix.Lead);
            builder.UseStatelessService<IQuoteService>(AppNames.ClientCare, AppPrefix.Quote);
            builder.UseStatelessService<ILeadCommunicationService>(AppNames.ClientCare, AppPrefix.Lead);
            builder.UseStatelessService<IMemberService>(AppNames.ClientCare, AppPrefix.Member);
            builder.UseStatelessService<IRateIndustryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ILookupService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<ICommissionBandService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IIndustryService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IDeclarationService>(AppNames.ClientCare, AppPrefix.Member);
            builder.UseStatelessService<ILetterOfGoodStandingService>(AppNames.ClientCare, AppPrefix.Member);
            builder.UseStatelessService<ISLAService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IClaimService>(AppNames.ClaimCare, AppPrefix.Claim);
            builder.UseStatelessService<IQLinkService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IGroupRiskService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<ILifeExtensionService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IBillingFuneralPolicyChangeService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<ICommonSystemNoteService>(AppNames.ClientCare, AppPrefix.Policy);
            builder.UseStatelessService<IRolePlayerNoteService>(AppNames.ClientCare, AppPrefix.RolePlayer);
        }
    }
}
