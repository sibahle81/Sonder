using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Constants;
using RMA.Service.Admin.MasterDataManager.Database.Entities;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using LocationCategoryEnum = RMA.Service.Admin.MasterDataManager.Contracts.Enums.LocationCategoryEnum;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class LookupFacade : RemotingStatelessService, ILookupService
    {
        private readonly IRepository<common_PreviousInsurer> _previousInsurerRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_Industry> _industryRepository; 
        private readonly IRepository<common_PmpRegion> _pmpRegionRepository;
        private readonly IRepository<common_ClaimTypeMapping> _claimTypeMappingsRepository;
        private readonly IRepository<common_DesignationType> _designationTypeRepository;
        private readonly IRepository<common_OptionType> _optionTypeRepository;
        private readonly IRepository<common_LookupValue> _LookupValueRepository;
        private readonly IMapper _mapper;

        public LookupFacade(StatelessServiceContext context,
            IRepository<common_PreviousInsurer> previousInsurerRepository,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<common_Industry> industryRepository, 
            IRepository<common_PmpRegion> pmpRegionRepository,
            IRepository<common_DesignationType> designationTypeRepository,
            IRepository<common_LookupValue> lookupValueRepository,
            IRepository<common_ClaimTypeMapping> claimTypeMappingsRepository,
            IRepository<common_OptionType> optionTypeRepository,
            IMapper mapper) : base(context)
        {
            _previousInsurerRepository = previousInsurerRepository;
            _dbContextScopeFactory = dbContextScopeFactory;
            _industryRepository = industryRepository;
            _claimTypeMappingsRepository = claimTypeMappingsRepository;
            _optionTypeRepository = optionTypeRepository;
            _designationTypeRepository = designationTypeRepository;
            _pmpRegionRepository = pmpRegionRepository;
            _LookupValueRepository = lookupValueRepository;
            _mapper = mapper;

        }

        public async Task<List<Lookup>> GetAddressTypes()
        {
            return await Task.Run(() => typeof(AddressTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetApprovalTypes()
        {
            return await Task.Run(() => typeof(ApprovalTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetBankAccountServiceTypes()
        {
            return await Task.Run(() => typeof(BankAccountServiceTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetBankAccountTypes()
        {
            return await Task.Run(() => typeof(BankAccountTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetBeneficiaryTypes()
        {
            return await Task.Run(() => typeof(BeneficiaryTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetBeneficiaryTypesById(List<int> ids)
        {
            return await Task.Run(() => typeof(BeneficiaryTypeEnum)
                .ToLookupList()
                .Where(lu => ids.Contains(lu.Id))
                .ToList()
            );
        }

        public async Task<List<Lookup>> GetBenefitTypes()
        {
            return await Task.Run(() => typeof(BenefitTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetCampaignAudienceTypes()
        {
            return await Task.Run(() => typeof(CampaignAudienceTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetCampaignCategories()
        {
            return await Task.Run(() => typeof(CampaignCategoryEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetCampaignItemTypes()
        {
            return await Task.Run(() => typeof(CampaignItemTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetCampaignStatuses()
        {
            return await Task.Run(() => typeof(CampaignStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetCampaignTypes()
        {
            return await Task.Run(() => typeof(CampaignTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetCancellationReasons()
        {
            return await Task.Run(() => typeof(CancellationReasonEnum).ToLookupList());
        }

        public async Task<List<Lookup>> CoidPolicyCancelReason()
        {
            return await Task.Run(() => typeof(CoidCancellationReasonEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetCaseStatuses()
        {
            return await Task.Run(() => typeof(CaseStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetCities()
        {
            throw new NotImplementedException();
            // return await Task.Run(() => typeof(CitiesEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetClaimTypes()
        {
            return await Task.Run(() => typeof(ClaimTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetClaimTypesByEventAndParentInsuranceType(EventTypeEnum eventType, int parentInsuranceTypeId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var list = new List<Lookup>();
                var claimTypes = await _claimTypeMappingsRepository.Where(ctm => ctm.EventType == eventType && ctm.ParentInsuranceTypeId == parentInsuranceTypeId).Select(a => a.ClaimType).ToListAsync();
                foreach (ClaimTypeEnum claimType in claimTypes)
                {
                    list.Add(new Lookup()
                    {
                        Id = (int)claimType,
                        Name = claimType.DisplayAttributeValue(),
                        Description = claimType.DisplayAttributeValue()
                    });
                }

                return list;
            }
        }

        public async Task<List<Lookup>> GetClaimTypesByEvent(EventTypeEnum eventType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var list = new List<Lookup>();
                var claimTypes = await _claimTypeMappingsRepository.Where(ctm => ctm.EventType == eventType).Select(a => a.ClaimType).ToListAsync();
                foreach (ClaimTypeEnum claimType in claimTypes)
                {
                    list.Add(new Lookup()
                    {
                        Id = (int)claimType,
                        Name = claimType.DisplayAttributeValue(),
                        Description = claimType.DisplayAttributeValue()
                    });
                }
                return list;
            }
        }

        public async Task<List<Lookup>> GetClientItemTypes()
        {
            return await Task.Run(() => typeof(ClientItemTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetClientStatuses()
        {
            return await Task.Run(() => typeof(ClientStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetClientTypes()
        {
            return await Task.Run(() => typeof(ClientTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetCommunicationTypes()
        {
            return await Task.Run(() => typeof(CommunicationTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetContactTypes()
        {
            return await Task.Run(() => typeof(ContactTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetCoverMemberTypes()
        {
            return await Task.Run(() => typeof(CoverMemberTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetCoverTypes()
        {
            return await Task.Run(() => typeof(CoverTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetDeathTypes()
        {
            return await Task.Run(() => typeof(DeathTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetDebitOrderRejectionReasons()
        {
            return await Task.Run(() => typeof(DebitOrderRejectionReasonEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetDebitOrderStatuses()
        {
            return await Task.Run(() => typeof(DebitOrderStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetDecisions()
        {
            return await Task.Run(() => typeof(ClaimInvoiceDecisionEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetDeclarationStatuses()
        {
            return await Task.Run(() => typeof(DeclarationStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetDeclarationTypes()
        {
            return await Task.Run(() => typeof(DeclarationTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetDocumentCategories()
        {
            return await Task.Run(() => typeof(DocumentCategoryEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetDocumentCategoryTypes()
        {
            return await Task.Run(() => typeof(DocumentCategoryTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetDocumentTypes()
        {
            return await Task.Run(() => typeof(DocumentTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetEarningStatuses()
        {
            return await Task.Run(() => typeof(EarningStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetEarningsTypes()
        {
            return await Task.Run(() => typeof(EarningsTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetEarningsTypesById(List<int> ids)
        {
            return await Task.Run(() => typeof(EarningsTypeEnum)
                .ToLookupList()
                .Where(lu => ids.Contains(lu.Id))
                .ToList()
            );
        }

        public async Task<List<Lookup>> GetEnquiryQueryTypes()
        {
            return await Task.Run(() => typeof(EnquiryQueryTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetEventTypes()
        {
            //return await Task.Run(() => typeof(EventTypeEnum).ToLookupList());
            throw new NotImplementedException();
        }

        public async Task<List<Lookup>> GetFormLetterTypes()
        {
            return await Task.Run(() => typeof(FormLetterTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetIdTypes()
        {
            return await Task.Run(() => typeof(IdTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetImportStatuses()
        {
            return await Task.Run(() => typeof(ImportStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetImportTypes()
        {
            return await Task.Run(() => typeof(ImportTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetIndustryClasses()
        {
            return await Task.Run(() => typeof(IndustryClassEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetInsureLifeCancelReasons()
        {
            return await Task.Run(() => typeof(InsureLifeCancelReasonEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetItemTypes()
        {
            return await Task.Run(() => typeof(ItemTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetLanguages()
        {
            return await Task.Run(() => typeof(LanguageEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetLeadClientStatuses()
        {
            return await Task.Run(() => typeof(LeadClientStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetLeadItemTypes()
        {
            return await Task.Run(() => typeof(LeadItemTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetMedicalReportTypes()
        {
            return await Task.Run(() => typeof(MedicalReportTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetMedicalReportTypesById(List<int> ids)
        {
            return await Task.Run(() => typeof(MedicalReportTypeEnum)
                .ToLookupList()
                .Where(lu => ids.Contains(lu.Id))
                .ToList()
            );
        }

        public async Task<List<Lookup>> GetMembershipTypes()
        {
            return await Task.Run(() => typeof(MembershipTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetNotificationTemplateTypes()
        {
            return await Task.Run(() => typeof(NotificationTemplateTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetPaymentAllocationStatuses()
        {
            return await Task.Run(() => typeof(PaymentAllocationStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetPaymentArrangementStatuses()
        {
            return await Task.Run(() => typeof(PaymentArrangementStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetPaymentFrequencies()
        {
            return await Task.Run(() => typeof(PaymentFrequencyEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetPaymentMethods()
        {
            return await Task.Run(() => typeof(PaymentMethodEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetPaymentRejectionTypes()
        {
            return await Task.Run(() => typeof(PaymentRejectionTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetPaymentStatuses()
        {
            return await Task.Run(() => typeof(PaymentStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetPaymentTypes()
        {
            return await Task.Run(() => typeof(PaymentTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetPhoneTypes()
        {
            return await Task.Run(() => typeof(PhoneTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetPolicyItemTypes()
        {
            return await Task.Run(() => typeof(PolicyItemTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetPolicyStatuses()
        {
            return await Task.Run(() => typeof(PolicyStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetProductClasses()
        {
            return await Task.Run(() => typeof(ProductClassEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetProductItemTypes()
        {
            return await Task.Run(() => typeof(ProductItemTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetProductStatuses()
        {
            return await Task.Run(() => typeof(ProductStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetQuoteStatuses()
        {
            return await Task.Run(() => typeof(QuoteStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetRateStatuses()
        {
            return await Task.Run(() => typeof(RateStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetRateTypes()
        {
            return await Task.Run(() => typeof(RateTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetRecipientTypes()
        {
            return await Task.Run(() => typeof(RecipientTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetRegions()
        {
            return await Task.Run(() => typeof(RegionEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetRepRoles()
        {
            return await Task.Run(() => typeof(RepRoleEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetRepTypes()
        {
            return await Task.Run(() => typeof(RepTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetRulesItemTypes()
        {
            return await Task.Run(() => typeof(RulesItemTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetRuleTypes()
        {
            return await Task.Run(() => typeof(RuleTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetSecurityItemTypes()
        {
            return await Task.Run(() => typeof(SecurityItemTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetServiceTypes()
        {
            return await Task.Run(() => typeof(ServiceTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetSkillSubCategories()
        {
            return await Task.Run(() => typeof(SkillSubCategoryEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetTaskScheduleFrequencies()
        {
            return await Task.Run(() => typeof(TaskScheduleFrequencyEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetTemplateTypes()
        {
            return await Task.Run(() => typeof(TemplateTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetTitles()
        {
            return await Task.Run(() => typeof(TitleEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetTransactionTypes()
        {
            return await Task.Run(() => typeof(TransactionTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetSuspiciousTransactionTypes()
        {
            return await Task.Run(() => typeof(SuspiciousTransactionStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetAuthenticationTypes()
        {
            return await Task.Run(() => typeof(AuthenticationTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetWizardPermissionTypes()
        {
            return await Task.Run(() => typeof(WizardPermissionTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetWizardStatuses()
        {
            return await Task.Run(() => typeof(WizardStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetWordProcessingDocumentTypes()
        {
            return await Task.Run(() => typeof(WordProcessingDocumentTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetWorkPools()
        {
            return await Task.Run(() => typeof(WorkPoolEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetInvoiceStatuses()
        {
            return await Task.Run(() => typeof(InvoiceStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetInsuredLifeStatuses()
        {
            return await Task.Run(() => typeof(InsuredLifeStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetRolePlayerTypes()
        {
            return await Task.Run(() => typeof(RolePlayerTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetCommissionWithholdingReason()
        {
            return await Task.Run(() => typeof(CommissionWithholdingReasonEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetCommissionActionType()
        {
            return await Task.Run(() => typeof(CommissionActionTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetRefundReason()
        {
            return await Task.Run(() => typeof(RefundReasonEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetPreviousInsurers()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return _previousInsurerRepository.Select(s => new Lookup
                {
                    Id = s.Id,
                    Name = s.Name
                }).ToList();
            }
        }

        public async Task<List<Lookup>> GetBodySideAffected()
        {
            var result = await Task.Run(() => typeof(BodySideAffectedTypeEnum).ToLookupList());

            return result.OrderBy(a => a.Id).ToList();
        }

        public async Task<List<Lookup>> GetWorkOptions()
        {
            return await Task.Run(() => typeof(WorkOptionTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetProductType()
        {
            return await Task.Run(() => typeof(ProductTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> CoverOptionTypes()
        {
            return await Task.Run(() => typeof(CoverOptionEnum).ToLookupList());
        }


        public async Task<List<Lookup>> GetPortalTypes()
        {
            return await Task.Run(() => typeof(PortalTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetUserProfileTypes()
        {
            return await Task.Run(() => typeof(UserProfileTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetInjurySeverity()
        {
            return await Task.Run(() => typeof(InjurySeverityTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetMedicalFormReportType()
        {
            return await Task.Run(() => typeof(MedicalFormReportTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetMedicalReportCategory()
        {
            return await Task.Run(() => typeof(MedicalReportCategoryEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetWorkItemState()
        {
            return await Task.Run(() => typeof(WorkItemStateEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetPreAuthTypes()
        {
            return await Task.Run(() => typeof(PreAuthTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetPreAuthStatuses()
        {
            return await Task.Run(() => typeof(PreAuthStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetIndustries()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _industryRepository.Select(s => new Lookup
                {
                    Id = s.Id,
                    Name = s.Name

                }).ToListAsync();
            }
        }

        public async Task<List<Lookup>> GetReInstateReason()
        {
            return await Task.Run(() => typeof(ReinstateReasonEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetLocationCategory()
        {
            return await Task.Run(() => typeof(LocationCategoryEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetContactDesignationType()
        {
            return await Task.Run(() => typeof(ContactDesignationTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetContactInformationType()
        {
            return await Task.Run(() => typeof(ContactInformationTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetGenders()
        {
            return await Task.Run(() => typeof(GenderEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetMarriageTypes()
        {
            return await Task.Run(() => typeof(MarriageTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetMaritalStatus()
        {
            return await Task.Run(() => typeof(MaritalStatusEnum).ToLookupList());
        }
        public async Task<List<Lookup>> GetNationalities()
        {
            return await Task.Run(() => typeof(NationalityEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetDaysOffWork()
        {
            return await Task.Run(() => typeof(DaysBookedOffEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetDebitOrderTypes()
        {
            return await Task.Run(() => typeof(CollectionTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetPensionTypes()
        {
            return await Task.Run(() => typeof(PensionTypeEnum).ToLookupList());
        }
        public async Task<List<Lookup>> GetClaimLiabilityStatuses()
        {
            return await Task.Run(() => typeof(ClaimLiabilityStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetUploadedFileProcessingStatuses()
        {
            return await Task.Run(() => typeof(UploadedFileProcessingStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetLedgerStatusChangeReasons()
        {
            return await Task.Run(() => typeof(LedgerStatusChangeReasonsEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetLedgerStatuses()
        {
            return await Task.Run(() => typeof(PensionLedgerStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetInterestProvisionedStatuses()
        {
            return await Task.Run(() => typeof(InterestProvisionedStatusEnum).ToLookupList());
        }
        public async Task<List<Lookup>> GetEntryTypes()
        {
            return await Task.Run(() => typeof(EntryTypeEnum).ToLookupList());
        }
        public async Task<List<Lookup>> GetScheduleTypes()
        {
            return await Task.Run(() => typeof(ScheduleTypeEnum).ToLookupList());
        }
        public async Task<List<Lookup>> EntryStatuses()
        {
            return await Task.Run(() => typeof(EntryStatusEnum).ToLookupList());
        }
        public async Task<List<Lookup>> EntryChangeReasons()
        {
            return await Task.Run(() => typeof(EntryChangeReasonEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetPopulationGroups()
        {
            return await Task.Run(() => typeof(PopulationGroupEnum).ToLookupList());
        }
        public async Task<List<Lookup>> IncreaseTypes()
        {
            return await Task.Run(() => typeof(PensionIncreaseTypeEnum).ToLookupList());
        }
        public async Task<List<Lookup>> IncreaseLegislativeValues()
        {
            return await Task.Run(() => typeof(PensionIncreaseLegislativeValueEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetMedicalPractitionerTypes()
        {
            return await Task.Run(() => typeof(PractitionerTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetMedicalInvoiceStatuses()
        {
            return await Task.Run(() => typeof(InvoiceStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetAdditionalTaxTypes()
        {
            return await Task.Run(() => typeof(AdditionalTaxTypeEnum).ToLookupList());
        }
        public async Task<List<Lookup>> GetDebtorStatuses()
        {
            var result = await Task.Run(() => typeof(DebtorStatusEnum).ToLookupList());
            return result;
        }


        public async Task<List<Lookup>> GetCommissionStatuses()
        {
            return await Task.Run(() => typeof(CommissionStatusEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetClaimInvoiceTypes()
        {
            return await Task.Run(() => typeof(ClaimInvoiceTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetPeriodChangeReasons()
        {
            //using (_dbContextScopeFactory.CreateReadOnly())
            //{
            //    return await _periodChangeReasonRepository.Select(s => new Lookup // TABLE DOES NOT EXIST ON DEV DB
            //    {
            //        Id = s.Id,
            //        Name = s.Name

            //    }).ToListAsync();
            //}
            throw new NotImplementedException();
        }

        public async Task<List<Lookup>> GetCompanyIdTypes()
        {
            return await Task.Run(() => typeof(CompanyIdTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetCompanyLevelTypes()
        {
            return await Task.Run(() => typeof(CompanyLevelEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetDesignationTypes(string filter)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                List<common_DesignationType> result = new List<common_DesignationType>();

                if (filter != null)
                {
                    result = await _designationTypeRepository.Where(d => d.Name.Contains(filter)).ToListAsync();
                }
                else
                {
                    result = await _designationTypeRepository.Take(100).ToListAsync();
                }

                return _mapper.Map<List<Lookup>>(result);
            }
        }

        public async Task<List<Lookup>> GetProductCategory()
        {
            return await Task.Run(() => typeof(ProductCategoryTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetDisabilityBenefitTerms()
        {
            return await Task.Run(() => typeof(DisabilityBenefitTermEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetGroupCoverAmountOptions()
        {
            return await Task.Run(() => typeof(GroupCoverAmountOptionEnum).ToLookupList());
        }
        public async Task<List<Lookup>> CommutationReasons()
        {
            return await Task.Run(() => typeof(CommutationReasonEnum).ToLookupList());
        }
        public async Task<List<Lookup>> CommutationSchedules()
        {
            return await Task.Run(() => typeof(CommutationScheduleEnum).ToLookupList());
        }
        public async Task<List<Lookup>> GetUnderwrittenOptions()
        {
            return await Task.Run(() => typeof(UnderwrittenEnum).ToLookupList());
        }
        public async Task<List<Lookup>> GetPolicyHolderOptions()
        {
            return await Task.Run(() => typeof(PolicyHolderTypeEnum).ToLookupList());
        }        
        public async Task<List<Lookup>> GetPersonInsuredCategoryStatuses()
        {
            return await Task.Run(() => typeof(PersonInsuredCategoryStatusEnum).ToLookupList());
        }


        public async Task<List<Lookup>> GetOptionTypes(string brokerageType, DateTime? effectiveDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (!effectiveDate.HasValue)
                {
                    effectiveDate = DateTimeHelper.SaNow;
                }

                var parameters = new List<SqlParameter>();
                parameters.Add(new SqlParameter { ParameterName = "@EffectiveDate", SqlDbType = SqlDbType.DateTime, Value = effectiveDate });
                parameters.Add(new SqlParameter { ParameterName = "@BrokerType", SqlDbType = SqlDbType.VarChar, Value = brokerageType });

                var productOptionTypes = await _optionTypeRepository.SqlQueryAsync<ProductOptionTypeConfiguration>(
                DatabaseConstants.GetBrokerageConfigOptionTypes, parameters.ToArray());

                return productOptionTypes.Select(s => new Lookup
                {
                    Id = s.OptionTypeId,
                    Name = s.OptionTypeName
                }).ToList();
            }
        }

        public async Task<List<Lookup>> GetPolicyOnboardOptions()
        {
            return await Task.Run(() => typeof(PolicyOnboardOptionEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetClaimTypesByEventAndProductCategory(EventTypeEnum eventType, int parentInsuranceTypeId, ProductCategoryTypeEnum productCategoryType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var list = new List<Lookup>();
                var claimTypes = await _claimTypeMappingsRepository.Where(ctm => ctm.EventType == eventType && ctm.ParentInsuranceTypeId == parentInsuranceTypeId && ctm.ProductCategoryType != null && ctm.ProductCategoryType == productCategoryType).Select(a => a.ClaimType).ToListAsync();
                foreach (ClaimTypeEnum claimType in claimTypes)
                {
                    list.Add(new Lookup()
                    {
                        Id = (int)claimType,
                        Name = claimType.DisplayAttributeValue(),
                        Description = claimType.DisplayAttributeValue()
                    });
                }
                return list;
            }
        }

        public async Task<List<Lookup>> GetPMPRegions()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _pmpRegionRepository.Select(s => new Lookup
                {
                    Id = s.PmpRegionId,
                    Name = s.Name

                }).ToListAsync();
            }
        }

        public async Task<LookupValue> GetLookUpValueByLookupTypeEnum(LookupTypeEnum lookupType, DateTime serviceDate)
        {
            var serviceDatePassed = (serviceDate != null) ? serviceDate : DateTimeHelper.SaNow;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _LookupValueRepository.FirstOrDefaultAsync(i =>
                i.LookupType == lookupType
                && (serviceDatePassed >= i.StartDate && i.EndDate <= serviceDatePassed));

                return _mapper.Map<LookupValue>(entity);
            }
        }

        public async Task<List<Lookup>> GetDocumentRefreshReasons()
        {
            return await Task.Run(() => typeof(DocumentRefreshReasonEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetRolePlayerItemQueryTypes()
        {
            return await Task.Run(() => typeof(RolePlayerItemQueryTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetRolePlayerQueryItemTypes()
        {
            return await Task.Run(() => typeof(RolePlayerQueryItemTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetRolePlayerItemQueryCategories()
        {
            return await Task.Run(() => typeof(RolePlayerItemQueryCategoryEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetRolePlayerItemQueryStatuses()
        {
            return await Task.Run(() => typeof(RolePlayerItemQueryStatusEnum).ToLookupList());
        }        
    }
}
