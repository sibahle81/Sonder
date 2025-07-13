using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.ServiceProcess;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LookupController : RmaApiController
    {
        private readonly ILookupService _lookupService;

        public LookupController(ILookupService lookupService)
        {
            _lookupService = lookupService;
        }

        [HttpGet("AddressType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetAddressTypes()
        {
            return await _lookupService.GetAddressTypes();
        }

        [HttpGet("ApprovalType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetApprovalTypes()
        {
            return await _lookupService.GetApprovalTypes();
        }

        [HttpGet("BankAccountServiceType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetBankAccountServiceTypes()
        {
            return await _lookupService.GetBankAccountServiceTypes();
        }

        [HttpGet("BankAccountType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetBankAccountTypes()
        {
            return await _lookupService.GetBankAccountTypes();
        }

        [HttpGet("BeneficiaryType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetBeneficiaryTypes()
        {
            return await _lookupService.GetBeneficiaryTypes();
        }

        [HttpGet("BenefitType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetBenefitTypes()
        {
            return await _lookupService.GetBenefitTypes();
        }



        [HttpGet("CampaignAudienceType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetCampaignAudienceTypes()
        {
            return await _lookupService.GetCampaignAudienceTypes();
        }

        [HttpGet("CampaignCategory")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetCampaignCategories()
        {
            return await _lookupService.GetCampaignCategories();
        }

        [HttpGet("CampaignItemType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetCampaignItemTypes()
        {
            return await _lookupService.GetCampaignItemTypes();
        }

        [HttpGet("CampaignStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetCampaignStatuses()
        {
            return await _lookupService.GetCampaignStatuses();
        }

        [HttpGet("CampaignType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetCampaignTypes()
        {
            return await _lookupService.GetCampaignTypes();
        }

        [HttpGet("CancellationReason")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetCancellationReasons()
        {
            return await _lookupService.GetCancellationReasons();
        }


        [HttpGet("CoidPolicyCancelReason")]
        public async Task<ActionResult<IEnumerable<Lookup>>> CoidPolicyCancelReason()
        {
            return await _lookupService.CoidPolicyCancelReason();
        }

        [HttpGet("CaseStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetCaseStatuses()
        {
            return await _lookupService.GetCaseStatuses();
        }
        [HttpGet("ClaimType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetClaimTypes()
        {
            return await _lookupService.GetClaimTypes();
        }

        [HttpGet("GetClaimTypesByEventAndParentInsuranceType/{eventType}/{parentInsuranceTypeId}")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetClaimTypes(EventTypeEnum eventType, int parentInsuranceTypeId)
        {
            return await _lookupService.GetClaimTypesByEventAndParentInsuranceType(eventType, parentInsuranceTypeId);
        }

        [HttpGet("GetClaimTypesByEvent/{eventType}")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetClaimTypesByEvent(EventTypeEnum eventType)
        {
            return await _lookupService.GetClaimTypesByEvent(eventType);
        }

        [HttpGet("ClientItemType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetClientItemTypes()
        {
            return await _lookupService.GetClientItemTypes();
        }

        [HttpGet("ClientStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetClientStatuses()
        {
            return await _lookupService.GetClientStatuses();
        }

        [HttpGet("ClientType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetClientTypes()
        {
            return await _lookupService.GetClientTypes();
        }

        [HttpGet("CommunicationType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetCommunicationTypes()
        {
            return await _lookupService.GetCommunicationTypes();
        }

        [HttpGet("ContactType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetContactTypes()
        {
            return await _lookupService.GetContactTypes();
        }

        [HttpGet("CoverMemberType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetCoverMemberTypes()
        {
            return await _lookupService.GetCoverMemberTypes();
        }

        [HttpGet("CoverType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetCoverTypes()
        {
            return await _lookupService.GetCoverTypes();
        }

        [HttpGet("DeathType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetDeathTypes()
        {
            return await _lookupService.GetDeathTypes();
        }

        [HttpGet("DebitOrderRejectionReason")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetDebitOrderRejectionReasons()
        {
            return await _lookupService.GetDebitOrderRejectionReasons();
        }

        [HttpGet("DebitOrderStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetDebitOrderStatuses()
        {
            return await _lookupService.GetDebitOrderStatuses();
        }

        [HttpGet("Decision")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetDecisions()
        {
            return await _lookupService.GetDecisions();
        }

        [HttpGet("DeclarationStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetDeclarationStatuses()
        {
            return await _lookupService.GetDeclarationStatuses();
        }

        [HttpGet("DeclarationType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetDeclarationTypes()
        {
            return await _lookupService.GetDeclarationTypes();
        }

        [HttpGet("DocumentCategory")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetDocumentCategories()
        {
            return await _lookupService.GetDocumentCategories();
        }

        [HttpGet("DocumentCategoryType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetDocumentCategoryTypes()
        {
            return await _lookupService.GetDocumentCategoryTypes();
        }

        [HttpGet("DocumentType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetDocumentTypes()
        {
            return await _lookupService.GetDocumentTypes();
        }

        [HttpGet("EarningStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetEarningStatuses()
        {
            return await _lookupService.GetEarningStatuses();
        }

        [HttpGet("EarningsType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetEarningsTypes()
        {
            return await _lookupService.GetEarningsTypes();
        }

        [HttpGet("EnquiryQueryType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetEnquiryQueryTypes()
        {
            return await _lookupService.GetEnquiryQueryTypes();
        }
        [HttpGet("EventType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetEventTypes()
        {
            return await _lookupService.GetEventTypes();
        }

        [HttpGet("FormLetterType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetFormLetterTypes()
        {
            return await _lookupService.GetFormLetterTypes();
        }

        [HttpGet("IdType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetIdTypes()
        {
            return await _lookupService.GetIdTypes();
        }

        [HttpGet("UserProfileTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetUserProfileTypes()
        {
            return await _lookupService.GetUserProfileTypes();
        }

        [HttpGet("ImportStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetImportStatuses()
        {
            return await _lookupService.GetImportStatuses();
        }

        [HttpGet("ImportType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetImportTypes()
        {
            return await _lookupService.GetImportTypes();
        }

        [HttpGet("IndustryClass")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetIndustryClasses()
        {
            return await _lookupService.GetIndustryClasses();
        }

        [HttpGet("InsureLifeCancelReason")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetInsureLifeCancelReasons()
        {
            return await _lookupService.GetInsureLifeCancelReasons();
        }

        [HttpGet("ItemType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetItemTypes()
        {
            return await _lookupService.GetItemTypes();
        }

        [HttpGet("Language")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetLanguages()
        {
            return await _lookupService.GetLanguages();
        }

        [HttpGet("LeadClientStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetLeadClientStatuses()
        {
            return await _lookupService.GetLeadClientStatuses();
        }

        [HttpGet("LeadItemType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetLeadItemTypes()
        {
            return await _lookupService.GetLeadItemTypes();
        }

        [HttpGet("MedicalReportType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetMedicalReportTypes()
        {
            return await _lookupService.GetMedicalReportTypes();
        }

        [HttpGet("MembershipType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetMembershipTypes()
        {
            return await _lookupService.GetMembershipTypes();
        }

        [HttpGet("NotificationTemplateType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetNotificationTemplateTypes()
        {
            return await _lookupService.GetNotificationTemplateTypes();
        }

        [HttpGet("PaymentAllocationStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetPaymentAllocationStatuses()
        {
            return await _lookupService.GetPaymentAllocationStatuses();
        }

        [HttpGet("PaymentArrangementStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetPaymentArrangementStatuses()
        {
            return await _lookupService.GetPaymentArrangementStatuses();
        }

        [HttpGet("PaymentFrequency")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetPaymentFrequencies()
        {
            return await _lookupService.GetPaymentFrequencies();
        }

        [HttpGet("PaymentMethod")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetPaymentMethods()
        {
            return await _lookupService.GetPaymentMethods();
        }

        [HttpGet("PaymentRejectionType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetPaymentRejectionTypes()
        {
            return await _lookupService.GetPaymentRejectionTypes();
        }

        [HttpGet("PaymentStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetPaymentStatuses()
        {
            return await _lookupService.GetPaymentStatuses();
        }

        [HttpGet("PaymentType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetPaymentTypes()
        {
            return await _lookupService.GetPaymentTypes();
        }

        [HttpGet("PhoneType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetPhoneTypes()
        {
            return await _lookupService.GetPhoneTypes();
        }

        [HttpGet("PolicyItemType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetPolicyItemTypes()
        {
            return await _lookupService.GetPolicyItemTypes();
        }

        [HttpGet("PolicyStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetPolicyStatuses()
        {
            return await _lookupService.GetPolicyStatuses();
        }

        [HttpGet("ProductClass")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetProductClasses()
        {
            return await _lookupService.GetProductClasses();
        }

        [HttpGet("ProductItemType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetProductItemTypes()
        {
            return await _lookupService.GetProductItemTypes();
        }

        [HttpGet("ProductStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetProductStatuses()
        {
            return await _lookupService.GetProductStatuses();
        }

        [HttpGet("QuoteStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetQuoteStatuses()
        {
            return await _lookupService.GetQuoteStatuses();
        }

        [HttpGet("RateStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetRateStatuses()
        {
            return await _lookupService.GetRateStatuses();
        }

        [HttpGet("RateType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetRateTypes()
        {
            return await _lookupService.GetRateTypes();
        }

        [HttpGet("RecipientType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetRecipientTypes()
        {
            return await _lookupService.GetRecipientTypes();
        }

        [HttpGet("Region")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetRegions()
        {
            return await _lookupService.GetRegions();
        }

        [HttpGet("RepRole")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetRepRoles()
        {
            return await _lookupService.GetRepRoles();
        }

        [HttpGet("RepType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetRepTypes()
        {
            return await _lookupService.GetRepTypes();
        }

        [HttpGet("RulesItemType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetRulesItemTypes()
        {
            return await _lookupService.GetRulesItemTypes();
        }

        [HttpGet("RuleType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetRuleTypes()
        {
            return await _lookupService.GetRuleTypes();
        }

        [HttpGet("SecurityItemType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetSecurityItemTypes()
        {
            return await _lookupService.GetSecurityItemTypes();
        }

        [HttpGet("ServiceType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetServiceTypes()
        {
            return await _lookupService.GetServiceTypes();
        }

        [HttpGet("SkillSubCategory")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetSkillSubCategories()
        {
            return await _lookupService.GetSkillSubCategories();
        }

        [HttpGet("TaskScheduleFrequency")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetTaskScheduleFrequencies()
        {
            return await _lookupService.GetTaskScheduleFrequencies();
        }

        [HttpGet("TemplateType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetTemplateTypes()
        {
            return await _lookupService.GetTemplateTypes();
        }

        [HttpGet("Title")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetTitles()
        {
            return await _lookupService.GetTitles();
        }

        [HttpGet("TransactionType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetTransactionTypes()
        {
            return await _lookupService.GetTransactionTypes();
        }

        [HttpGet("SuspiciousTransactionType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetSuspiciousTransactionTypes()
        {
            return await _lookupService.GetSuspiciousTransactionTypes();
        }

        [HttpGet("AuthenticationType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetAuthenticationTypes()
        {
            return await _lookupService.GetAuthenticationTypes();
        }

        [HttpGet("WizardPermissionType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetWizardPermissionTypes()
        {
            return await _lookupService.GetWizardPermissionTypes();
        }

        [HttpGet("WizardStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetWizardStatuses()
        {
            return await _lookupService.GetWizardStatuses();
        }

        [HttpGet("WordProcessingDocumentType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetWordProcessingDocumentTypes()
        {
            return await _lookupService.GetWordProcessingDocumentTypes();
        }

        [HttpGet("WorkPool")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetWorkPools()
        {
            return await _lookupService.GetWorkPools();
        }

        [HttpGet("BeneficiaryTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetBeneficiaryTypesById([FromQuery] List<int> id)
        {
            return await _lookupService.GetBeneficiaryTypesById(id);
        }

        [HttpGet("EarningsTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetEarningsTypesById([FromQuery] List<int> id)
        {
            return await _lookupService.GetEarningsTypesById(id);
        }

        [HttpGet("MedicalReportTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetMedicalReportTypesById([FromQuery] List<int> id)
        {
            return await _lookupService.GetMedicalReportTypesById(id);
        }

        [HttpGet("Cities")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetCities()
        {
            return await _lookupService.GetCities();
        }

        [HttpGet("InvoiceStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetInvoiceStatuses()
        {
            return await _lookupService.GetInvoiceStatuses();
        }

        [HttpGet("InsuredLifeStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetInsuredLifeStatuses()
        {
            return await _lookupService.GetInsuredLifeStatuses();
        }

        [HttpGet("RolePlayerType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetRolePlayerTypes()
        {
            return await _lookupService.GetRolePlayerTypes();
        }

        [HttpGet("CommissionWithholdingReason")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetCommissionWithholdingReason()
        {
            return await _lookupService.GetCommissionWithholdingReason();
        }

        [HttpGet("CommissionActionType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetCommissionActionType()
        {
            return await _lookupService.GetCommissionActionType();
        }

        [HttpGet("RefundReason")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetRefundReason()
        {
            return await _lookupService.GetRefundReason();
        }

        [HttpGet("Insurers")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetPreviousInsurers()
        {
            return await _lookupService.GetPreviousInsurers();
        }

        [HttpGet("BodySideAffected")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetBodySideAffected()
        {
            return await _lookupService.GetBodySideAffected();
        }

        [HttpGet("WorkOptions")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetWorkOptions()
        {
            return await _lookupService.GetWorkOptions();
        }

        [HttpGet("ProductType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetProductTypes()
        {
            return await _lookupService.GetProductType();
        }

        [HttpGet("CoverOptionTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> CoverOptionTypes()
        {
            return await _lookupService.CoverOptionTypes();
        }


        [HttpGet("InjurySeverity")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetInjurySeverity()
        {
            return await _lookupService.GetInjurySeverity();
        }

        [HttpGet("MedicalFormReportType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetMedicalFormReportType()
        {
            return await _lookupService.GetMedicalFormReportType();
        }

        [HttpGet("MedicalReportCategory")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetMedicalReportCategory()
        {
            return await _lookupService.GetMedicalReportCategory();
        }

        [HttpGet("WorkItemState")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetWorkItemState()
        {
            return await _lookupService.GetWorkItemState();
        }

        [HttpGet("PreAuthType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetPreAuthTypes()
        {
            return await _lookupService.GetPreAuthTypes();
        }

        [HttpGet("PreAuthStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetPreAuthStatuses()
        {
            return await _lookupService.GetPreAuthStatuses();
        }

        [HttpGet("GetReInstateReason")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetReInstateReason()
        {
            return await _lookupService.GetReInstateReason();
        }

        [HttpGet("GetLocationCategory")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetLocationCategory()
        {
            return await _lookupService.GetLocationCategory();
        }

        [HttpGet("GetContactDesignationType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetContactDesignationType()
        {
            return await _lookupService.GetContactDesignationType();
        }

        [HttpGet("GetContactInformationType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetContactInformationType()
        {
            return await _lookupService.GetContactInformationType();
        }


        [HttpGet("GetGenders")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetGenders()
        {
            return await _lookupService.GetGenders();
        }

        [HttpGet("GetMarriageTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetMarriageTypes()
        {
            return await _lookupService.GetMarriageTypes();
        }

        [HttpGet("GetMaritalStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetMaritalStatus()
        {
            return await _lookupService.GetMaritalStatus();
        }

        [HttpGet("GetNationalities")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetNationalities()
        {
            return await _lookupService.GetNationalities();
        }

        [HttpGet("DaysOffWork")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetDaysOffWork()
        {
            return await _lookupService.GetDaysOffWork();
        }

        [HttpGet("DebitOrderType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetDebitOrderTypes()
        {
            return await _lookupService.GetDebitOrderTypes();
        }

        [HttpGet("PensionType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetPensionTypes()
        {
            return await _lookupService.GetPensionTypes();
        }

        [HttpGet("ClaimLiabilityStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetClaimLiabilityStatuses()
        {
            return await _lookupService.GetClaimLiabilityStatuses();
        }

        [HttpGet("UploadedFileProcessingStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetUploadedFileStatuses()
        {
            return await _lookupService.GetUploadedFileProcessingStatuses();
        }

        [HttpGet("LedgerStatusChangeReasons")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetLedgerStatusChangeReasons()
        {
            return await _lookupService.GetLedgerStatusChangeReasons();
        }

        [HttpGet("LedgerStatuses")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetLedgerStatuses()
        {
            return await _lookupService.GetLedgerStatuses();
        }

        [HttpGet("InterestProvisionedStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetInterestProvisionedStatuses()
        {
            return await _lookupService.GetInterestProvisionedStatuses();
        }
        [HttpGet("EntryTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetEntryTypes()
        {
            return await _lookupService.GetEntryTypes();
        }
        [HttpGet("ScheduleTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetScheduleTypes()
        {
            return await _lookupService.GetScheduleTypes();
        }
        [HttpGet("EntryStatuses")]
        public async Task<ActionResult<IEnumerable<Lookup>>> EntryStatuses()
        {
            return await _lookupService.EntryStatuses();
        }
        [HttpGet("EntryChangeReasons")]
        public async Task<ActionResult<IEnumerable<Lookup>>> EntryChangeReasons()
        {
            return await _lookupService.EntryChangeReasons();
        }


        [HttpGet("PopulationGroups")]
        public async Task<ActionResult<IEnumerable<Lookup>>> PopulationGroups()
        {
            return await _lookupService.GetPopulationGroups();
        }

        [HttpGet("IncreaseTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> IncreaseTypes()
        {
            return await _lookupService.IncreaseTypes();
        }

        [HttpGet("IncreaseLegislativeValues")]
        public async Task<ActionResult<IEnumerable<Lookup>>> IncreaseLegislativeValues()
        {
            return await _lookupService.IncreaseLegislativeValues();
        }

        [HttpGet("MedicalInvoiceStatuses")]
        public async Task<ActionResult<IEnumerable<Lookup>>> MedicalInvoiceStatuses()
        {
            return await _lookupService.GetMedicalInvoiceStatuses();
        }

        [HttpGet("MedicalPractitionerTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetMedicalPractitionerTypes()
        {
            return await _lookupService.GetMedicalPractitionerTypes();
        }

        [HttpGet("AdditionalTaxTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetAdditionalTaxTypes()
        {
            return await _lookupService.GetAdditionalTaxTypes();
        }

        [HttpGet("DebtorStatuses")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetDebtorStatuses()
        {
            return await _lookupService.GetDebtorStatuses();
        }

        [HttpGet("CommissionStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetComissionStatuses()
        {
            return await _lookupService.GetCommissionStatuses();
        }

        [HttpGet("ClaimInvoiceType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetClaimInvoiceTypes()
        {
            return await _lookupService.GetClaimInvoiceTypes();
        }

        [HttpGet("GetPeriodChangeReasons")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetPeriodChangeReasons()
        {
            return await _lookupService.GetPeriodChangeReasons();
        }

        [HttpGet("GetCompanyIdTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetCompanyIdTypes()
        {
            return await _lookupService.GetCompanyIdTypes();
        }

        [HttpGet("GetCompanyLevelTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetCompanyLevelTypes()
        {
            return await _lookupService.GetCompanyLevelTypes();
        }

        [HttpGet("GetDesignationTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetDesignationTypes([FromQuery] string filter)
        {
            return await _lookupService.GetDesignationTypes(filter);
        }

        [HttpGet("ProductCategories")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetProductCategory()
        {
            return await _lookupService.GetProductCategory();
        }

        [HttpGet("DisabilityBenefitTerm")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetDisabilityBenefitTerm()
        {
            return await _lookupService.GetDisabilityBenefitTerms();
        }

        [HttpGet("GroupCoverAmountOptions")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetGroupCoverAmountOptions()
        {
            return await _lookupService.GetGroupCoverAmountOptions();
        }
        [HttpGet("CommutationReasons")]
        public async Task<ActionResult<IEnumerable<Lookup>>> CommutationReasons()
        {
            return await _lookupService.CommutationReasons();
        }
        [HttpGet("CommutationSchedules")]
        public async Task<ActionResult<IEnumerable<Lookup>>> CommutationSchedules()
        {
            return await _lookupService.CommutationSchedules();
        }
        [HttpGet("UnderwrittenOptions")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetUnderwrittenOptions()
        {
            return await _lookupService.GetUnderwrittenOptions();
        }
        [HttpGet("PolicyHolderOptions")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetPolicyHolderOptions()
        {
            return await _lookupService.GetPolicyHolderOptions();
        }
        [HttpGet("PersonInsuredCategoryStatuses")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetPersonInsuredCategoryStatuses()
        {
            return await _lookupService.GetPersonInsuredCategoryStatuses();
        }

        [HttpGet("OptionType/{brokerageType}/{effectiveDate}")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetOptionTypes(string brokerageType, DateTime? effectiveDate)
        {
            return await _lookupService.GetOptionTypes(brokerageType, effectiveDate);
        }

        [HttpGet("PolicyOnboardOptions")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetPolicyOnboardOptions()
        {
            return await _lookupService.GetPolicyOnboardOptions();
        }

        [HttpGet("GetClaimTypesByEventAndProductCategory/{eventType}/{parentInsuranceTypeId}/{productCategoryType}")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetClaimTypesByEventAndProductCategory(EventTypeEnum eventType, int parentInsuranceTypeId, ProductCategoryTypeEnum productCategoryType)
        {
            return await _lookupService.GetClaimTypesByEventAndProductCategory(eventType, parentInsuranceTypeId, productCategoryType);
        }

        [HttpGet("GetPMPRegions")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetPMPRegions()
        {
            return await _lookupService.GetPMPRegions();
        }

        [HttpGet("GetLookUpValueByLookupTypeEnum/{lookupType}/{serviceDate}")]
        public async Task<ActionResult<LookupValue>> GetLookUpValueByLookupTypeEnum(LookupTypeEnum lookupType, DateTime serviceDate)
        {
            return await _lookupService.GetLookUpValueByLookupTypeEnum(lookupType, serviceDate);
        }

        [HttpGet("DocumentRefreshReasons")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetDocumentRefreshReasons()
        {
            return await _lookupService.GetDocumentRefreshReasons();
        }

        [HttpGet("RolePlayerItemQueryTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetRolePlayerItemQueryTypes()
        {
            return await _lookupService.GetRolePlayerItemQueryTypes();
        }

        [HttpGet("RolePlayerQueryItemTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetRolePlayerQueryItemTypes()
        {
            return await _lookupService.GetRolePlayerQueryItemTypes();
        }

        [HttpGet("RolePlayerItemQueryCategories")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetRolePlayerItemQueryCategories()
        {
            return await _lookupService.GetRolePlayerItemQueryCategories();
        }

        [HttpGet("RolePlayerItemQueryStatuses")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetRolePlayerItemQueryStatuses()
        {
            return await _lookupService.GetRolePlayerItemQueryStatuses();
        }

    }

}
