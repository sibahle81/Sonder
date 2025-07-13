using AutoMapper;

using Newtonsoft.Json;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Constants;
using RMA.Service.MediCare.Database.Entities;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;
using WorkPool = RMA.Service.MediCare.Contracts.Entities.Medical.WorkPool;

namespace RMA.Service.MediCare.Services.Medical
{
    public class PreAuthorisationFacade : RemotingStatelessService, IPreAuthorisationService
    {
        private const string SoftDeleteFilter = "SoftDeletes";
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<medical_PreAuthorisation> _preAuthorisationRepository;
        private readonly IRepository<medical_ProsthetistQuote> _prosthetistQuoteRepository;
        private readonly IRepository<medical_QuotationType> _quotationTypeRepository;
        private readonly IRepository<medical_ProsthetistType> _prosthetistTypeRepository;
        private readonly IRepository<medical_ProstheticItemCategory> _prostheticItemCategoryRepository;
        private readonly IRepository<medical_ProstheticItem> _prostheticItemRepository;
        private readonly IRepository<medical_PreAuthorisationBreakdown> _preAuthorisationBreakdownRepository;
        private readonly IRepository<medical_HealthCareProvider> _healthCareProviderRepository;
        private readonly IRepository<medical_PreAuthTreatmentBasket> _preAuthTreatmentBasketsRepository;
        private readonly IRepository<medical_PreAuthIcd10Code> _icd10CodesRepository;
        private readonly IRepository<medical_PreAuthActivity> _preAuthActivitiesRepository;
        private readonly IRepository<medical_PreAuthRejectReason> _preAuthRejectReasonRepository;
        private readonly IRepository<medical_Tariff> _tariffRepository;
        private readonly IRepository<medical_TreatmentCode> _treatmentCodeRepository;
        private readonly IRepository<medical_LevelOfCare> _levelOfCareRepository;
        private readonly IRepository<medical_MedicalItem> _medicalItemRepository;
        private readonly IRepository<medical_PreAuthLevelOfCare> _preAuthLevelOfCareRepository;
        private readonly IRepository<medical_ChronicMedicationList> _preAuthChronicMedicationList;
        private readonly IUserService _userService;
        private readonly IMediCareService _mediCareService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IPreAuthClaimService _preAuthClaimService;
        private readonly IRepository<medical_ClinicalUpdate> _clinicalUpdateRepository;
        private readonly IRepository<medical_ClinicalUpdateTreatmentProtocol> _clinicalUpdateTreatmentProtocolRepository;
        private readonly IRepository<medical_TreatmentProtocol> _treatmentProtocolRepository;
        private readonly IRepository<medical_ClinicalUpdateTreatmentPlan> _clinicalUpdateTreatmentPlanRepository;
        private readonly IRepository<medical_PreAuthPractitionerTypeSetting> _preAuthPractitionerTypeSettingRepository;
        private readonly IRepository<medical_Workflow> _workflowRepository;
        private readonly IRepository<medical_TreatmentBasket> _treatmentBasketRepository;
        private readonly IRepository<medical_TreatmentBasketMedicalItem> _treatmentBasketMedicalItemRepository;
        private readonly IRepository<medical_PractitionerType> _practitionerTypeRepository;
        private readonly IRepository<medical_ChronicMedicalHistory> _chronicMedicalHistoryRepository;
        private readonly IRepository<medical_ChronicScriptMedicine> _chronicScriptMedicineRepository;
        private readonly IRepository<medical_ChronicScriptMedicineRenewal> _chronicScriptMedicineRenewalRepository;
        private readonly IRepository<medical_PreAuthorisationUnderAssessReason> _preAuthorisationUnderAssessReasonRepository;


        private readonly IInvoiceHelperService _invoiceHelperService;
        private readonly IPreAuthHelperService _preAuthHelperService;
        private readonly IConfigurationService _configurationService;
        private readonly IWizardService _wizardService;
        private readonly ISerializerService _serializerService;
        private readonly IRoleService _roleService;
        private readonly ISLAService _slaService;
        private readonly IUserReminderService _userReminderService;

        public PreAuthorisationFacade(StatelessServiceContext context
            , IDocumentGeneratorService documentGeneratorService
            , IUserService userService
            , IUserReminderService userReminderService
            , IPreAuthClaimService preAuthClaimService
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<medical_PreAuthorisation> preAuthorisationRepository
            , IRepository<medical_ProsthetistQuote> prosthetistQuoteRepository
            , IRepository<medical_QuotationType> quotationTypeRepository
            , IRepository<medical_ProsthetistType> prosthetistTypeRepository
            , IRepository<medical_ProstheticItemCategory> prostheticItemCategoryRepository
            , IRepository<medical_ProstheticItem> prostheticItemRepository
            , IRepository<medical_PreAuthorisationBreakdown> preAuthorisationBreakdownRepository
            , IRepository<medical_HealthCareProvider> healthCareProviderRepository
            , IRepository<medical_PreAuthTreatmentBasket> preAuthTreatmentBasketsRepository
            , IRepository<medical_PreAuthIcd10Code> icd10CodesRepository
            , IRepository<medical_PreAuthActivity> preAuthActivitiesRepository
            , IRepository<medical_PreAuthRejectReason> preAuthRejectReasonRepository
            , IMediCareService mediCareService
            , IRepository<medical_Tariff> tariffRepository
            , IRepository<medical_LevelOfCare> levelOfCareRepository
            , IRepository<medical_TreatmentCode> treatmentCodeRepository
            , IRepository<medical_MedicalItem> medicalItemRepository
            , IRepository<medical_PreAuthLevelOfCare> preAuthLevelOfCareRepository
            , IRepository<medical_ChronicMedicationList> preAuthChronicMedicationList
            , IRepository<medical_ClinicalUpdate> clinicalUpdateRepository
            , IRepository<medical_ClinicalUpdateTreatmentProtocol> clinicalUpdateTreatmentProtocolRepository
            , IRepository<medical_TreatmentProtocol> treatmentProtocolRepository
            , IRepository<medical_PreAuthPractitionerTypeSetting> preAuthPractitionerTypeSettingRepository
            , IRepository<medical_Workflow> workflowRepository
            , IRepository<medical_ClinicalUpdateTreatmentPlan> clinicalUpdateTreatmentPlanRepository
            , IRepository<medical_TreatmentBasket> treatmentBasketRepository
            , IRepository<medical_TreatmentBasketMedicalItem> treatmentBasketMedicalItemRepository
            , IRepository<medical_PractitionerType> practitionerTypeRepository
            , IRepository<medical_ChronicMedicalHistory> chronicMedicalHistoryRepository
            , IRepository<medical_ChronicScriptMedicine> chronicScriptMedicineRepository
            , IRepository<medical_ChronicScriptMedicineRenewal> chronicScriptMedicineRenewalRepository
            , IRepository<medical_PreAuthorisationUnderAssessReason> medicalPreAuthorisationUnderAssessReason
            , IInvoiceHelperService invoiceHelperService
            , IPreAuthHelperService preAuthHelperService
            , IConfigurationService configurationService
            , IWizardService wizardService,
              ISerializerService serializerService,
              IRoleService roleService,
              ISLAService slaService)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _preAuthorisationRepository = preAuthorisationRepository;
            _prosthetistQuoteRepository = prosthetistQuoteRepository;
            _quotationTypeRepository = quotationTypeRepository;
            _prosthetistTypeRepository = prosthetistTypeRepository;
            _prostheticItemCategoryRepository = prostheticItemCategoryRepository;
            _prostheticItemRepository = prostheticItemRepository;
            _preAuthorisationBreakdownRepository = preAuthorisationBreakdownRepository;
            _healthCareProviderRepository = healthCareProviderRepository;
            _userService = userService;
            _userReminderService = userReminderService;
            _preAuthClaimService = preAuthClaimService;
            _preAuthTreatmentBasketsRepository = preAuthTreatmentBasketsRepository;
            _icd10CodesRepository = icd10CodesRepository;
            _preAuthActivitiesRepository = preAuthActivitiesRepository;
            _preAuthRejectReasonRepository = preAuthRejectReasonRepository;
            _mediCareService = mediCareService;
            _documentGeneratorService = documentGeneratorService;
            _tariffRepository = tariffRepository;
            _medicalItemRepository = medicalItemRepository;
            _preAuthLevelOfCareRepository = preAuthLevelOfCareRepository;
            _preAuthChronicMedicationList = preAuthChronicMedicationList;
            _clinicalUpdateRepository = clinicalUpdateRepository;
            _treatmentCodeRepository = treatmentCodeRepository;
            _levelOfCareRepository = levelOfCareRepository;
            _clinicalUpdateTreatmentProtocolRepository = clinicalUpdateTreatmentProtocolRepository;
            _treatmentProtocolRepository = treatmentProtocolRepository;
            _clinicalUpdateTreatmentPlanRepository = clinicalUpdateTreatmentPlanRepository;
            _preAuthPractitionerTypeSettingRepository = preAuthPractitionerTypeSettingRepository;
            _workflowRepository = workflowRepository;
            _treatmentBasketRepository = treatmentBasketRepository;
            _treatmentBasketMedicalItemRepository = treatmentBasketMedicalItemRepository;
            _practitionerTypeRepository = practitionerTypeRepository;
            _chronicMedicalHistoryRepository = chronicMedicalHistoryRepository;
            _chronicScriptMedicineRepository = chronicScriptMedicineRepository;
            _chronicScriptMedicineRenewalRepository = chronicScriptMedicineRenewalRepository;
            _preAuthorisationUnderAssessReasonRepository = medicalPreAuthorisationUnderAssessReason;
            _invoiceHelperService = invoiceHelperService;
            _preAuthHelperService = preAuthHelperService;
            _configurationService = configurationService;
            _serializerService = serializerService;
            _wizardService = wizardService;
            _roleService = roleService;
            _slaService = slaService;
        }

        public async Task<int> AddPreAuthorisation(PreAuthorisation preAuth)
        {
            RmaIdentity.DemandPermission(Permissions.CreatePreAuthorisationWizard);

            if (preAuth == null) return 0;

            // Get Claim Status and Set PreAuthStatus to ClaimUndecided if Liability is not accepted
            //Below is a list of all cliam statuses that are considered as Liability accepted in Medicare
            List<ClaimLiabilityStatusEnum> acceptedClaimLiabilityStatuses = new List<ClaimLiabilityStatusEnum>
            {
                ClaimLiabilityStatusEnum.Accepted,
                ClaimLiabilityStatusEnum.LiabilityAccepted,
                ClaimLiabilityStatusEnum.FullLiabilityAccepted,
                ClaimLiabilityStatusEnum.MedicalLiability
            };

            var claimLiabilityStatus = await _preAuthClaimService.GetClaimLiabilityStatus(Convert.ToInt32(preAuth.PersonEventId));
            if (!acceptedClaimLiabilityStatuses.Contains(claimLiabilityStatus))
            {
                preAuth.PreAuthStatus = PreAuthStatusEnum.ClaimUndecided;
            }

            preAuth.DateAuthorisedFrom = preAuth.DateAuthorisedFrom.ToSaDateTime();
            preAuth.DateAuthorisedTo = preAuth.DateAuthorisedTo.ToSaDateTime();
            preAuth.InjuryDate = preAuth.InjuryDate.ToSaDateTime();

            if (preAuth.PreAuthorisationBreakdowns != null)
            {
                foreach (var preAuthorisationBreakdown in preAuth.PreAuthorisationBreakdowns)
                {
                    preAuthorisationBreakdown.DateAuthorisedFrom = preAuthorisationBreakdown.DateAuthorisedFrom.ToSaDateTime();
                    preAuthorisationBreakdown.DateAuthorisedTo = preAuthorisationBreakdown.DateAuthorisedTo.ToSaDateTime();
                }
            }




            if (preAuth.SubPreAuthorisations != null)
            {
                foreach (PreAuthorisation subPreAuth in preAuth.SubPreAuthorisations)
                {
                    subPreAuth.PreAuthStatus = !acceptedClaimLiabilityStatuses.Contains(claimLiabilityStatus) ? PreAuthStatusEnum.ClaimUndecided : PreAuthStatusEnum.PendingReview;
                    subPreAuth.DateAuthorisedFrom = subPreAuth.DateAuthorisedFrom.ToSaDateTime();
                    subPreAuth.DateAuthorisedTo = subPreAuth.DateAuthorisedTo.ToSaDateTime();
                    if (subPreAuth.PreAuthorisationBreakdowns != null)
                    {
                        foreach (var subPreAuthBreakdown in subPreAuth.PreAuthorisationBreakdowns)
                        {
                            subPreAuthBreakdown.DateAuthorisedFrom = subPreAuthBreakdown.DateAuthorisedFrom.ToSaDateTime();
                            subPreAuthBreakdown.DateAuthorisedTo = subPreAuthBreakdown.DateAuthorisedTo.ToSaDateTime();
                        }
                    }
                }
            }

            using (var scope = _dbContextScopeFactory.Create())
            {
                switch (preAuth.PreAuthType)
                {
                    case PreAuthTypeEnum.Treatment:
                        preAuth.PreAuthNumber = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.TreatmentAuth, string.Empty);
                        break;
                    case PreAuthTypeEnum.Hospitalization:
                        preAuth.PreAuthNumber = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.HospitalAuth, string.Empty);
                        break;
                    case PreAuthTypeEnum.Prosthetic:
                        preAuth.PreAuthNumber = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.ProstheticAuth, string.Empty);
                        break;
                    case PreAuthTypeEnum.ChronicMedication:
                        preAuth.PreAuthNumber = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.ChronicAuth, string.Empty);
                        break;
                }

                if (preAuth.SubPreAuthorisations != null)
                {
                    foreach (var subPreAuth in preAuth.SubPreAuthorisations)
                    {
                        switch (subPreAuth.PreAuthType)
                        {
                            case PreAuthTypeEnum.TreatingDoctor:
                                subPreAuth.PreAuthNumber = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.TreatingDocAuth, string.Empty);
                                break;
                            case PreAuthTypeEnum.PhysioOTAuth:
                                subPreAuth.PreAuthNumber = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.PhysioOTAuth, string.Empty);
                                break;
                        }
                    }
                }

                // Set PreAuth Activity
                preAuth.PreAuthActivities = new List<PreAuthActivity>();
                preAuth.PreAuthActivities?.Add(new PreAuthActivity
                {
                    PreAuthActivityType = PreAuthActivityTypeEnum.NewRequest,
                    PreAuthStatus = !acceptedClaimLiabilityStatuses.Contains(claimLiabilityStatus) ? PreAuthStatusEnum.ClaimUndecided : PreAuthStatusEnum.PendingReview,
                    Comment = "PreAuth created",
                    ModifiedBy = preAuth.ModifiedBy,
                    ModifiedDate = DateTime.Now,
                    CreatedBy = preAuth.CreatedBy,
                    CreatedDate = DateTime.Now
                });

                //Saving Under assess reasons
                var preAuthBreakdownUnderAssessReasonList = await _preAuthHelperService.BuildPreAuthBreakdownUnderAssessReasonList(preAuth);
                await _preAuthHelperService.SavePreAuthBreakdownUnderAssessReason(preAuthBreakdownUnderAssessReasonList, false);

                var entity = Mapper.Map<medical_PreAuthorisation>(preAuth);
                _preAuthorisationRepository.Create(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.PreAuthId;
            }
        }

        public async Task<PreAuthorisation> GetPreAuthorisationById(int preAuthorisationId)
        {
            return await _preAuthHelperService.GetPreAuthDetails(string.Empty, preAuthorisationId);
        }

        public async Task<PreAuthorisation> GetPreAuthorisationByPreAuthNumber(string preAuthNumber)
        {
            return await _preAuthHelperService.GetPreAuthDetails(preAuthNumber, 0);
        }

        public async Task<PagedRequestResult<PreAuthorisation>> GetPreAuthorisationsByUser(PagedRequest request)
        {
            if (request == null) return new PagedRequestResult<PreAuthorisation>();

            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (request?.OrderBy.ToLower() == "PreAuthId") request.OrderBy = "PreAuthId";

                var user = await _userService.GetUserByEmail(RmaIdentity.Email);
                var healthCareProviderIds = new List<int>();
                if (!user.IsInternalUser)
                {
                    var userHealthCareProviderDetails = await _userService.GetHealthCareProvidersLinkedToUser(RmaIdentity.Email);
                    healthCareProviderIds.AddRange(userHealthCareProviderDetails.Select(userHealthCareProvider => userHealthCareProvider.HealthCareProviderId));
                }
                _preAuthorisationRepository.DisableFilter(SoftDeleteFilter);
                var preAuthorisationSearch = JsonConvert.DeserializeObject<PreAuthorisation>(request?.SearchCriteria);
                var preAuthorisationRepo = (IQueryable<medical_PreAuthorisation>)null;

                preAuthorisationRepo = _preAuthorisationRepository.Where(a => a.PreAuthType == ((int)preAuthorisationSearch.PreAuthType > 0 ? preAuthorisationSearch.PreAuthType : a.PreAuthType)
                    && a.PreAuthType != PreAuthTypeEnum.TreatingDoctor);

                var preAuthList = await (
                        from pa in preAuthorisationRepo
                        join hcp in _healthCareProviderRepository on pa.HealthCareProviderId equals hcp.RolePlayerId
                        where hcp.RolePlayerId == (preAuthorisationSearch.HealthCareProviderId > 0 ? preAuthorisationSearch.HealthCareProviderId : hcp.RolePlayerId)
                        && pa.PreAuthType == ((int)preAuthorisationSearch.PreAuthType > 0 ? preAuthorisationSearch.PreAuthType : pa.PreAuthType)
                        && pa.ClaimId == (preAuthorisationSearch.ClaimId > 0 ? preAuthorisationSearch.ClaimId : pa.ClaimId)
                        && (user.IsInternalUser
                            || healthCareProviderIds.Any(healthCareProviderId => healthCareProviderId == hcp.RolePlayerId))
                        select new PreAuthorisation
                        {
                            PreAuthId = pa.PreAuthId,
                            PreAuthNumber = pa.PreAuthNumber,
                            PreAuthStatus = pa.PreAuthStatus,
                            DateAuthorisedFrom = pa.DateAuthorisedFrom,
                            DateAuthorisedTo = pa.DateAuthorisedTo,
                            DateAuthorised = pa.DateAuthorised,
                            RequestComments = pa.RequestComments,
                            PracticeNumber = hcp.PracticeNumber,
                            HealthCareProviderName = hcp.Name,
                            PersonEventId = pa.PersonEventId,
                            IsRequestFromHcp = pa.IsRequestFromHcp,
                            PreAuthType = pa.PreAuthType,
                            IsDeleted = pa.IsDeleted,
                            CreatedBy = pa.CreatedBy,
                            ModifiedBy = pa.ModifiedBy
                        }).Distinct().ToPagedResult(request);

                _preAuthorisationRepository.EnableFilter(SoftDeleteFilter);
                foreach (var preAuth in preAuthList.Data)
                {
                    preAuth.PreAuthNumber = await _preAuthHelperService.GetMaskedPreAuthNumber(preAuth.PreAuthNumber, preAuth.PreAuthStatus);
                    preAuth.ClaimReferenceNumber = await _preAuthClaimService.GetClaimReferenceNumberByPersonEventId(Convert.ToInt32(preAuth.PersonEventId));
                }

                if (preAuthList.Data.Count > 0)
                {
                    var returnResult = new PagedRequestResult<PreAuthorisation>
                    {
                        Page = preAuthList.Page,
                        PageCount = preAuthList.PageCount,
                        RowCount = preAuthList.RowCount,
                        PageSize = preAuthList.PageSize,
                        Data = preAuthList.Data
                    };

                    return returnResult;
                }
            }
            return new PagedRequestResult<PreAuthorisation>();
        }

        public async Task<PagedRequestResult<PreAuthorisation>> GetPreAuthorisationsByPersonEvent(PagedRequest request)
        {
            if (request == null) return new PagedRequestResult<PreAuthorisation>();

            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (request?.OrderBy.ToLower() == "PreAuthId") request.OrderBy = "PreAuthId";

                var preAuthorisationSearch = JsonConvert.DeserializeObject<PreAuthorisation>(request?.SearchCriteria);

                var preAuthorisation = await _preAuthorisationRepository
                    .Where(a => (a.PersonEventId == preAuthorisationSearch.PersonEventId) && a.PreAuthType == PreAuthTypeEnum.Hospitalization
                    ).ToPagedResult(request);

                foreach (var preAuth in preAuthorisation.Data)
                {
                    preAuth.PreAuthNumber = await _preAuthHelperService.GetMaskedPreAuthNumber(preAuth.PreAuthNumber, preAuth.PreAuthStatus);
                }

                if (preAuthorisation.Data.Count > 0)
                {
                    var returnResult = new PagedRequestResult<PreAuthorisation>
                    {
                        Page = preAuthorisation.Page,
                        PageCount = preAuthorisation.PageCount,
                        RowCount = preAuthorisation.RowCount,
                        PageSize = preAuthorisation.PageSize,
                        Data = new List<PreAuthorisation>()
                    };

                    var mappedPreAuthorisation = Mapper.Map<List<PreAuthorisation>>(preAuthorisation.Data);
                    foreach (var item in mappedPreAuthorisation)
                    {
                        returnResult.Data.Add(item);
                    }
                    return returnResult;
                }
            }
            return new PagedRequestResult<PreAuthorisation>();
        }

        public async Task<PagedRequestResult<PreAuthorisation>> SearchPreAuthorisation(PagedRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.SearchCriteria)) return new PagedRequestResult<PreAuthorisation>();

            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (request?.OrderBy.ToLower() == "PreAuthId") request.OrderBy = "PreAuthId";

                var preAuthorisationRepo = (IQueryable<medical_PreAuthorisation>)null;
                var personEventId = await _preAuthClaimService.GetPersonEventIdByClaimReferenceNumber(request.SearchCriteria);

                var user = await _userService.GetUserByEmail(RmaIdentity.Email);
                var healthCareProviderIds = new List<int>();
                if (!user.IsInternalUser)
                {
                    var userHealthCareProviderDetails = await _userService.GetHealthCareProvidersLinkedToUser(RmaIdentity.Email);
                    healthCareProviderIds.AddRange(userHealthCareProviderDetails.Select(userHealthCareProvider => userHealthCareProvider.HealthCareProviderId));
                }

                preAuthorisationRepo = _preAuthorisationRepository.Where(a => a.PreAuthType == PreAuthTypeEnum.Hospitalization && ((personEventId <= 0 || a.PersonEventId == personEventId) || a.PreAuthNumber == request.SearchCriteria));

                var preAuthList = await (
                            from pa in preAuthorisationRepo
                            join hcp in _healthCareProviderRepository on pa.HealthCareProviderId equals hcp.RolePlayerId
                            where (user.IsInternalUser
                                      || healthCareProviderIds.Any(healthCareProviderId => healthCareProviderId == hcp.RolePlayerId))
                            select new PreAuthorisation
                            {
                                PreAuthId = pa.PreAuthId,
                                PreAuthNumber = pa.PreAuthNumber,
                                PreAuthStatus = pa.PreAuthStatus,
                                DateAuthorisedFrom = pa.DateAuthorisedFrom,
                                DateAuthorisedTo = pa.DateAuthorisedTo,
                                DateAuthorised = pa.DateAuthorised,
                                RequestComments = pa.RequestComments,
                                PracticeNumber = hcp.PracticeNumber,
                                HealthCareProviderName = hcp.Name,
                                PersonEventId = pa.PersonEventId,
                                IsRequestFromHcp = pa.IsRequestFromHcp,
                                PreAuthType = pa.PreAuthType,
                                CreatedBy = pa.CreatedBy,
                                ModifiedBy = pa.ModifiedBy
                            }).Distinct().ToPagedResult(request);

                if (personEventId == 0)
                {
                    preAuthList = await (
                       from pa in preAuthorisationRepo
                       join hcp in _healthCareProviderRepository on pa.HealthCareProviderId equals hcp.RolePlayerId
                       where pa.PreAuthStatus == PreAuthStatusEnum.Authorised
                       select new PreAuthorisation
                       {
                           PreAuthId = pa.PreAuthId,
                           PreAuthNumber = pa.PreAuthNumber,
                           PreAuthStatus = pa.PreAuthStatus,
                           DateAuthorisedFrom = pa.DateAuthorisedFrom,
                           DateAuthorisedTo = pa.DateAuthorisedTo,
                           DateAuthorised = pa.DateAuthorised,
                           RequestComments = pa.RequestComments,
                           PracticeNumber = hcp.PracticeNumber,
                           HealthCareProviderName = hcp.Name,
                           PersonEventId = pa.PersonEventId,
                           IsRequestFromHcp = pa.IsRequestFromHcp,
                           PreAuthType = pa.PreAuthType,
                           CreatedBy = pa.CreatedBy,
                           ModifiedBy = pa.ModifiedBy
                       }).Distinct().ToPagedResult(request);
                }

                foreach (var preAuth in preAuthList.Data)
                {
                    preAuth.PreAuthNumber = await _preAuthHelperService.GetMaskedPreAuthNumber(preAuth.PreAuthNumber, preAuth.PreAuthStatus);
                    preAuth.ClaimReferenceNumber = await _preAuthClaimService.GetClaimReferenceNumberByPersonEventId(Convert.ToInt32(preAuth.PersonEventId));
                }

                if (preAuthList.Data.Count > 0)
                {
                    return new PagedRequestResult<PreAuthorisation>
                    {
                        Page = preAuthList.Page,
                        PageCount = preAuthList.PageCount,
                        RowCount = preAuthList.RowCount,
                        PageSize = preAuthList.PageSize,
                        Data = preAuthList.Data
                    };
                }
            }
            return new PagedRequestResult<PreAuthorisation>();
        }

        public async Task<PagedRequestResult<PreAuthorisation>> SearchPreAuthorisations(PagedRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.SearchCriteria)) return new PagedRequestResult<PreAuthorisation>();

            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (request?.OrderBy.ToLower() == "PreAuthId") request.OrderBy = "PreAuthId";
                var preAuthorisationSearch = JsonConvert.DeserializeObject<PreAuthorisation>(request?.SearchCriteria);
                var preAuthorisations = await _preAuthorisationRepository
                    .Where(a => (string.IsNullOrEmpty(preAuthorisationSearch.PreAuthNumber) ? a.PreAuthNumber != null : a.PreAuthNumber.Equals(preAuthorisationSearch.PreAuthNumber))
                    && (string.IsNullOrEmpty(preAuthorisationSearch.RequestComments) ? a.RequestComments != null : a.RequestComments.Contains(preAuthorisationSearch.RequestComments))
                    && (string.IsNullOrEmpty(preAuthorisationSearch.ReviewComments) ? a.ReviewComments != null : a.ReviewComments.Contains(preAuthorisationSearch.ReviewComments))
                    && a.PreAuthType == PreAuthTypeEnum.Hospitalization).ToPagedResult(request);

                foreach (var preAuth in preAuthorisations.Data)
                {
                    preAuth.PreAuthNumber = await _preAuthHelperService.GetMaskedPreAuthNumber(preAuth.PreAuthNumber, preAuth.PreAuthStatus);
                }

                if (preAuthorisations.Data.Count > 0)
                {
                    var returnResult = new PagedRequestResult<PreAuthorisation>
                    {
                        Page = preAuthorisations.Page,
                        PageCount = preAuthorisations.PageCount,
                        RowCount = preAuthorisations.RowCount,
                        PageSize = preAuthorisations.PageSize,
                        Data = new List<PreAuthorisation>()
                    };

                    var mappedPreAuthorisation = Mapper.Map<List<PreAuthorisation>>(preAuthorisations.Data);
                    foreach (var item in mappedPreAuthorisation)
                    {
                        returnResult.Data.Add(item);
                    }

                    return returnResult;
                }
            }
            return new PagedRequestResult<PreAuthorisation>();
        }

        public async Task<bool> CheckIfDuplicateLineItem(int personEventId, int healthCareProviderId, int tariffId, DateTime preAuthFromDate, DateTime preAuthToDate)
        {
            var isDuplicate = false;
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var preAuthBreakDownList = await (from pa in _preAuthorisationRepository
                                                  join pabr in _preAuthorisationBreakdownRepository on pa.PreAuthId equals pabr.PreAuthId
                                                  where pa.PersonEventId == personEventId && pabr.TariffId == tariffId
                                                  select pabr).ToListAsync();
                foreach (var preAuthBreakDown in preAuthBreakDownList)
                {
                    if (preAuthBreakDown.DateAuthorisedFrom.ToShortDateString() == preAuthFromDate.ToShortDateString()
                        && preAuthBreakDown.DateAuthorisedTo.ToShortDateString() == preAuthToDate.ToShortDateString())
                    {
                        isDuplicate = true;
                    }
                }
            }
            return isDuplicate;
        }

        public async Task<bool> IsDuplicatePreAuth(int personEventId, int healthCareProviderId, DateTime preAuthFromDate, DateTime preAuthToDate)
        {
            var isDuplicateAuth = false;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var preAuthorisationList = await _preAuthorisationRepository
                   .Where(a => (a.PersonEventId == personEventId && a.HealthCareProviderId == healthCareProviderId)).ToListAsync();

                foreach (var preAuthorisation in preAuthorisationList)
                {
                    if (preAuthorisation.DateAuthorisedFrom.ToShortDateString() == preAuthFromDate.ToShortDateString() && preAuthorisation.DateAuthorisedTo.ToShortDateString() == preAuthToDate.ToShortDateString())
                    {
                        isDuplicateAuth = true;
                    }
                }
            }
            return isDuplicateAuth;
        }

        public async Task<List<PreAuthRejectReason>> GetPreAuthRejectReasonList()
        {
            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var preAuthRejectReasons = await _preAuthRejectReasonRepository
                    .ToListAsync();
                return Mapper.Map<List<PreAuthRejectReason>>(preAuthRejectReasons);
            }
        }

        public async Task UpdatePreAuthorisation(PreAuthorisation preAuthorisation)
        {
            RmaIdentity.DemandPermission(Permissions.CreatePreAuthorisationWizard);

            if (preAuthorisation == null) return;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var preAuthEntity = await _preAuthorisationRepository.SingleAsync(s => s.PreAuthId == preAuthorisation.PreAuthId);
                await _preAuthorisationRepository.LoadAsync(preAuthEntity, a => a.PreAuthorisationBreakdowns);
                await _preAuthorisationRepository.LoadAsync(preAuthEntity, a => a.PreAuthIcd10Code);
                await _preAuthorisationRepository.LoadAsync(preAuthEntity, a => a.PreAuthTreatmentBaskets);
                await _preAuthorisationRepository.LoadAsync(preAuthEntity, a => a.PreAuthActivities);
                await _preAuthorisationRepository.LoadAsync(preAuthEntity, a => a.PreAuthorisations);
                await _preAuthorisationRepository.LoadAsync(preAuthEntity.PreAuthorisations, a => a.PreAuthorisationBreakdowns);
                await _preAuthorisationRepository.LoadAsync(preAuthEntity.PreAuthorisations, a => a.PreAuthIcd10Code);
                await _preAuthorisationRepository.LoadAsync(preAuthEntity, a => a.PreAuthMotivationForClaimReopenings);
                await _preAuthorisationRepository.LoadAsync(preAuthEntity, a => a.PreAuthRehabilitations);
                await _preAuthorisationRepository.LoadAsync(preAuthEntity, a => a.ChronicMedicationForms);
                await _preAuthorisationRepository.LoadAsync(preAuthEntity, a => a.ChronicMedicationFormRenewals);

                // Set Main PreAuth values
                preAuthEntity = SetPreAuthEntityValue(preAuthEntity, preAuthorisation);

                // Set Treating Doctor PreAuth values
                var treatingDocAuth = preAuthorisation.SubPreAuthorisations?.Where(a => a.PreAuthType == PreAuthTypeEnum.TreatingDoctor).FirstOrDefault();
                var treatingDocAuthEntity = preAuthEntity.PreAuthorisations.FirstOrDefault(a => a.PreAuthType == PreAuthTypeEnum.TreatingDoctor);

                if (treatingDocAuthEntity != null && treatingDocAuth != null)
                {
                    treatingDocAuthEntity = SetPreAuthEntityValue(treatingDocAuthEntity, treatingDocAuth);
                }

                // Set Physio OT PreAuth values
                var physioOTAuth = preAuthorisation.SubPreAuthorisations?.Where(a => a.PreAuthType == PreAuthTypeEnum.PhysioOTAuth).FirstOrDefault();
                var physioOTAuthEntity = preAuthEntity.PreAuthorisations.FirstOrDefault(a => a.PreAuthType == PreAuthTypeEnum.PhysioOTAuth);

                if (physioOTAuthEntity != null && physioOTAuth != null)
                {
                    physioOTAuthEntity = SetPreAuthEntityValue(physioOTAuthEntity, physioOTAuth);
                }

                // Set PreAuth Activity
                preAuthEntity.PreAuthActivities?.Add(new medical_PreAuthActivity
                {
                    PreAuthActivityType = PreAuthActivityTypeEnum.Edited,
                    PreAuthId = preAuthEntity.PreAuthId,
                    PreAuthStatus = preAuthEntity.PreAuthStatus,
                    Comment = "PreAuth updated",
                    ModifiedBy = preAuthEntity.ModifiedBy,
                    ModifiedDate = DateTime.Now,
                    CreatedBy = preAuthEntity.CreatedBy,
                    CreatedDate = DateTime.Now
                });

                //Saving Under assess reasons
                var preAuthBreakdownUnderAssessReasonList = await _preAuthHelperService.BuildPreAuthBreakdownUnderAssessReasonList(preAuthorisation);
                await _preAuthHelperService.SavePreAuthBreakdownUnderAssessReason(preAuthBreakdownUnderAssessReasonList, true);

                _preAuthorisationRepository.Update(preAuthEntity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                //AutoReinstateMedicalInvoice after PreAuth is Reviewed or Edited
                if (preAuthorisation.PersonEventId != null)
                    await _invoiceHelperService.AutoReinstateMedicalInvoice(0, 0, (int)preAuthorisation.PersonEventId).ConfigureAwait(false);
            }
        }

        private medical_PreAuthorisation SetPreAuthEntityValue(medical_PreAuthorisation preAuthEntity, PreAuthorisation preAuthorisation)
        {
            //Set PreAuth value for update
            if (preAuthorisation.InjuryDate != null && preAuthorisation.InjuryDate != DateTime.MinValue)
            {
                preAuthEntity.InjuryDate = preAuthorisation.InjuryDate.ToSaDateTime();
            }
            if (preAuthorisation.ProstheticQuotationType != null)
            {
                preAuthEntity.ProstheticQuotationType = preAuthorisation.ProstheticQuotationType;
            }
            if (preAuthorisation.HealthCareProviderId > 0)
            {
                preAuthEntity.HealthCareProviderId = preAuthorisation.HealthCareProviderId;
            }
            if (preAuthorisation.DateAuthorisedFrom != DateTime.MinValue)
            {
                preAuthEntity.DateAuthorisedFrom = preAuthorisation.DateAuthorisedFrom.ToSaDateTime();
            }
            if (preAuthorisation.DateAuthorisedTo != DateTime.MinValue)
            {
                preAuthEntity.DateAuthorisedTo = preAuthorisation.DateAuthorisedTo.ToSaDateTime();
            }
            preAuthEntity.PreAuthStatus = preAuthorisation.PreAuthStatus;
            if (!string.IsNullOrWhiteSpace(preAuthorisation.ReviewComments))
            {
                preAuthEntity.ReviewComments = preAuthorisation.ReviewComments;
            }
            if (!string.IsNullOrWhiteSpace(preAuthorisation.RequestComments))
            {
                preAuthEntity.RequestComments = preAuthorisation.RequestComments;
            }
            if (preAuthorisation.AuthorisedAmount > 0)
            {
                preAuthEntity.AuthorisedAmount = preAuthorisation.AuthorisedAmount;
            }
            if (preAuthEntity.PreAuthStatus == PreAuthStatusEnum.Authorised)
            {
                preAuthEntity.DateAuthorised = DateTime.Now;
            }
            if (preAuthorisation.IsInHospital.HasValue)
                preAuthEntity.IsInHospital = preAuthorisation.IsInHospital;

            preAuthEntity.IsRehabilitationRequest = preAuthorisation.IsRehabilitationRequest;
            preAuthEntity.IsClaimReopeningRequest = preAuthorisation.IsClaimReopeningRequest;

            if (preAuthorisation?.ChronicMedicationForms?.Count > 0)
            {
                foreach (var item in preAuthorisation.ChronicMedicationForms)
                {
                    foreach (var itemEntity in preAuthEntity.ChronicMedicationForms)
                    {
                        itemEntity.Allergies = item.Allergies;
                        itemEntity.BloodPressure = item.BloodPressure;
                        itemEntity.ChronicMedicationFormId = item.ChronicMedicationFormId;
                        foreach (var history in item.ChronicMedicalHistories)
                        {
                            var chronicMedicalHistory = _chronicMedicalHistoryRepository.Where(x => x.ChronicMedicalHistoryId == history.ChronicMedicalHistoryId).SingleOrDefault();
                            if (chronicMedicalHistory != null)
                            {
                                chronicMedicalHistory.Treatment = history.Treatment;
                                chronicMedicalHistory.DateDiagnosed = history.DateDiagnosed;
                                chronicMedicalHistory.Disease = history.Disease;
                                itemEntity.ChronicMedicalHistories.Add(chronicMedicalHistory);
                            }
                            else
                            {
                                itemEntity.ChronicMedicalHistories.Add(Mapper.Map<medical_ChronicMedicalHistory>(history));
                            }
                        }

                        foreach (var medicine in item.ChronicScriptMedicines)
                        {
                            var chronicScriptMedicine = _chronicScriptMedicineRepository.Where(x => x.ChronicScriptMedicineId == medicine.ChronicScriptMedicineId).SingleOrDefault();
                            if (chronicScriptMedicine != null)
                            {
                                chronicScriptMedicine.Description = medicine.Description;
                                chronicScriptMedicine.Dosage = medicine.Dosage;
                                chronicScriptMedicine.Icd10Code = medicine.Icd10Code;
                                chronicScriptMedicine.MedicinePrescribed = medicine.MedicinePrescribed;
                                chronicScriptMedicine.NumberOfRepeats = medicine.NumberOfRepeats;
                                itemEntity.ChronicScriptMedicines.Add(chronicScriptMedicine);
                            }
                            else
                            {
                                itemEntity.ChronicScriptMedicines.Add(Mapper.Map<medical_ChronicScriptMedicine>(medicine));
                            }

                        }

                        itemEntity.DateConsulted = item.DateConsulted;
                        itemEntity.DateFormFilled = item.DateFormFilled;
                        itemEntity.DateSignedByHcp = item.DateSignedByHcp;
                        itemEntity.DateSubmitted = item.DateSubmitted;
                        itemEntity.DeliveryAddress = item.DeliveryAddress;
                        itemEntity.DeliveryMethod = item.DeliveryMethod;
                        itemEntity.Description = item.Description;
                        itemEntity.Height = item.Height;
                        itemEntity.HivStatus = item.HivStatus;
                        itemEntity.Hobbies = item.Hobbies;
                        itemEntity.Urine = item.Urine;
                        itemEntity.Weight = item.Weight;
                    }
                }


            }

            if (preAuthorisation?.ChronicMedicationFormRenewals?.Count > 0)
            {
                foreach (var item in preAuthorisation.ChronicMedicationFormRenewals)
                {
                    foreach (var itemEntity in preAuthEntity.ChronicMedicationFormRenewals)
                    {
                        itemEntity.AuthorisedChronicAuthorisationId = item.AuthorisedChronicAuthorisationId;
                        itemEntity.Description = item.Description;
                        itemEntity.IsNeurogenicPain = item.IsNeurogenicPain;
                        itemEntity.IsMechanicalPain = item.IsMechanicalPain;
                        itemEntity.IsDegenerativePain = item.IsDegenerativePain;
                        itemEntity.IsMuslcespasmPain = item.IsMuslcespasmPain;
                        itemEntity.IsFibromialgiaPain = item.IsFibromialgiaPain;
                        itemEntity.PainEvaluation = item.PainEvaluation;
                        itemEntity.ContinuousDuration = item.ContinuousDuration;
                        itemEntity.IsLifeStyleChanges = item.IsLifeStyleChanges;
                        itemEntity.IsPhysiotherapy = item.IsPsychotherapy;
                        itemEntity.IsNerveBlock = item.IsNerveBlock;
                        itemEntity.IsArthroplasty = item.IsArthroplasty;
                        itemEntity.IsPsychotherapy = item.IsPsychotherapy;
                        itemEntity.IsAccupuncture = item.IsAccupuncture;
                        itemEntity.DateSubmitted = item.DateSubmitted;
                        itemEntity.DateConsulted = item.DateConsulted;
                        itemEntity.DateSignedByHcp = item.DateSignedByHcp;
                        itemEntity.DeliveryAddress = item.DeliveryAddress;
                        itemEntity.DeliveryMethod = item.DeliveryMethod;

                        foreach (var medicine in item.ChronicScriptMedicineRenewals)
                        {
                            var chronicScriptMedicine = _chronicScriptMedicineRenewalRepository.Where(x => x.ChronicScriptMedicineRenewalId == medicine.ChronicScriptMedicineRenewalId).SingleOrDefault();
                            if (chronicScriptMedicine != null)
                            {
                                chronicScriptMedicine.Description = medicine.Description;
                                chronicScriptMedicine.Dosage = medicine.Dosage;
                                chronicScriptMedicine.Icd10Code = medicine.Icd10Code;
                                chronicScriptMedicine.MedicinePrescribed = medicine.MedicinePrescribed;
                                chronicScriptMedicine.NumberOfRepeats = medicine.NumberOfRepeats;
                                itemEntity.ChronicScriptMedicineRenewals.Add(chronicScriptMedicine);
                            }
                            else
                            {
                                itemEntity.ChronicScriptMedicineRenewals.Add(Mapper.Map<medical_ChronicScriptMedicineRenewal>(medicine));
                            }

                        }
                    }
                }
            }

            if (preAuthorisation.IsRehabilitationRequest != null && preAuthorisation.IsRehabilitationRequest.Value)
            {
                if (preAuthEntity?.PreAuthRehabilitations?.Count > 0)
                {
                    foreach (var item in preAuthorisation.PreAuthRehabilitations)
                    {
                        foreach (var itemEntity in preAuthEntity.PreAuthRehabilitations)
                        {
                            if (item.PreAuthRehabilitationId > 0 && item.PreAuthRehabilitationId == itemEntity.PreAuthRehabilitationId)
                            {
                                itemEntity.TherapistName = item.TherapistName;
                                itemEntity.InitialConsultationDate = item.InitialConsultationDate;
                                itemEntity.RehabilitationGoal = item.RehabilitationGoal;
                                itemEntity.TreatmentFrequency = item.TreatmentFrequency;
                                itemEntity.TreatmentDuration = item.TreatmentDuration;
                                itemEntity.TreatmentSessionCount = item.TreatmentSessionCount;
                                itemEntity.ReferringDoctorContact = item.ReferringDoctorContact;
                                itemEntity.ReferringDoctorId = item.ReferringDoctorId;
                            }
                        }
                    }
                }
                else
                {
                    preAuthEntity.PreAuthRehabilitations.Add(Mapper.Map<medical_PreAuthRehabilitation>(preAuthorisation.PreAuthRehabilitations.SingleOrDefault()));
                }
            }

            if (preAuthorisation.IsClaimReopeningRequest != null && preAuthorisation.IsClaimReopeningRequest.Value)
            {
                if (preAuthEntity?.PreAuthMotivationForClaimReopenings?.Count > 0)
                {
                    foreach (var item in preAuthorisation.PreAuthMotivationForClaimReopenings)
                    {
                        foreach (var itemEntity in preAuthEntity.PreAuthMotivationForClaimReopenings)
                        {
                            if (item.PreAuthMotivationForClaimReopeningId > 0 && item.PreAuthMotivationForClaimReopeningId == itemEntity.PreAuthMotivationForClaimReopeningId)
                            {
                                itemEntity.InjuryDetails = item.InjuryDetails;
                                itemEntity.AdmissionDate = item.AdmissionDate;
                                itemEntity.ProcedureDate = item.ProcedureDate;
                                itemEntity.RelationWithOldInjury = item.RelationWithOldInjury;
                                itemEntity.Motivation = item.Motivation;
                                itemEntity.Comment = item.Comment;
                                itemEntity.ReferringDoctorId = item.ReferringDoctorId;
                            }
                        }
                    }
                }
                else
                {
                    preAuthEntity.PreAuthMotivationForClaimReopenings.Add(Mapper.Map<medical_PreAuthMotivationForClaimReopening>(preAuthorisation.PreAuthMotivationForClaimReopenings.SingleOrDefault()));
                }
            }

            // Set PreAuth line-items value
            foreach (var lineItem in preAuthorisation.PreAuthorisationBreakdowns)
            {
                var preAuthLevelOfCareEntity = _preAuthLevelOfCareRepository.Where(x => x.PreAuthBreakdownId == lineItem.PreAuthBreakdownId).ToList();
                foreach (var lineItemEntity in preAuthEntity.PreAuthorisationBreakdowns)
                {
                    if (lineItem.PreAuthBreakdownId > 0 && lineItem.PreAuthBreakdownId == lineItemEntity.PreAuthBreakdownId)
                    {
                        lineItemEntity.MedicalItemId = lineItem.MedicalItemId;
                        lineItemEntity.TariffId = lineItem.TariffId;
                        lineItemEntity.TreatmentCodeId = lineItem.TreatmentCodeId;
                        lineItemEntity.DateAuthorisedFrom = lineItem.DateAuthorisedFrom.ToSaDateTime();
                        lineItemEntity.DateAuthorisedTo = lineItem.DateAuthorisedTo.ToSaDateTime();
                        lineItemEntity.AuthorisedTreatments = lineItem.AuthorisedTreatments;
                        lineItemEntity.RequestedTreatments = lineItem.RequestedTreatments;
                        lineItemEntity.RequestedAmount = lineItem.RequestedAmount;
                        lineItemEntity.AuthorisedAmount = lineItem.AuthorisedAmount;
                        lineItemEntity.IsAuthorised = lineItem.IsAuthorised;
                        lineItemEntity.AuthorisedReason = lineItem.AuthorisedReason;
                        lineItemEntity.IsRejected = lineItem.IsRejected;
                        lineItemEntity.RejectedReason = string.IsNullOrWhiteSpace(lineItem.RejectedReason) ? lineItemEntity.RejectedReason : lineItem.RejectedReason;
                        lineItemEntity.ReviewComments = string.IsNullOrWhiteSpace(lineItem.ReviewComments) ? lineItemEntity.ReviewComments : lineItem.ReviewComments;
                        lineItemEntity.TariffAmount = lineItem.TariffAmount;
                        lineItemEntity.IsClinicalUpdate = lineItem.IsClinicalUpdate;
                        lineItemEntity.ModifiedBy = lineItem.ModifiedBy;
                        lineItemEntity.ModifiedDate = lineItem.ModifiedDate;
                        lineItemEntity.IsDeleted = lineItem.IsDeleted;

                        if (preAuthLevelOfCareEntity?.Count > 0)
                        {
                            preAuthLevelOfCareEntity.ForEach(item =>
                            {
                                item.LevelOfCareId = lineItem.LevelOfCare[0].LevelOfCareId;
                                item.DateTimeAdmitted = lineItem.LevelOfCare[0].DateTimeAdmitted;
                                item.DateTimeDischarged = lineItem.LevelOfCare[0].DateTimeDischarged;
                                item.LengthOfStay = lineItem.LevelOfCare[0].LengthOfStay;
                                item.CreatedBy = lineItem.CreatedBy;
                                item.CreatedDate = lineItem.CreatedDate;
                                item.ModifiedBy = lineItem.ModifiedBy;
                                item.ModifiedDate = lineItem.ModifiedDate;
                                item.IsDeleted = false;
                            });
                            lineItemEntity.PreAuthLevelOfCares = preAuthLevelOfCareEntity;
                        }

                        break;
                    }
                    else if (lineItem.PreAuthBreakdownId <= 0)
                    {
                        preAuthEntity.PreAuthorisationBreakdowns.Add(CreateNewPreAuthBreakdownItemWithLevelOfCare(preAuthorisation, lineItem));
                        break;
                    }
                }
                if (preAuthEntity?.PreAuthorisationBreakdowns?.Count == 0 && lineItem.PreAuthBreakdownId == 0)
                {
                    preAuthEntity.PreAuthorisationBreakdowns.Add(Mapper.Map<medical_PreAuthorisationBreakdown>(_preAuthHelperService.CreateNewPreAuthBreakdownItemWithLevelOfCare(preAuthorisation, lineItem)));
                }
            }

            // Set PreAuth ICD10Codes value
            foreach (var preauthICD10Code in preAuthorisation.PreAuthIcd10Codes)
            {
                foreach (var preauthICD10CodeEntity in preAuthEntity.PreAuthIcd10Code)
                {
                    if (preauthICD10Code.PreAuthIcd10CodeId > 0 && preauthICD10Code.Icd10Code == preauthICD10CodeEntity.Icd10Code)
                    {
                        preauthICD10CodeEntity.Icd10Code = preauthICD10Code.Icd10Code;
                        preauthICD10CodeEntity.Icd10CodeId = preauthICD10Code.Icd10CodeId;
                        preauthICD10CodeEntity.BodySideId = preauthICD10Code.BodySideId;
                        preauthICD10CodeEntity.IsMatching = preauthICD10Code.IsMatching;
                        preauthICD10CodeEntity.IsAuthorised = preauthICD10Code.IsAuthorised;
                        preauthICD10CodeEntity.IsClinicalUpdate = preauthICD10Code.IsClinicalUpdate;
                        preauthICD10CodeEntity.InjuryType = preauthICD10Code.InjuryType;
                        break;
                    }
                    else if (preauthICD10Code.PreAuthIcd10CodeId == 0)
                    {
                        if (preAuthEntity.PreAuthIcd10Code.Where(x => x.Icd10Code == preauthICD10Code.Icd10Code
                        && x.BodySideId == preauthICD10Code.BodySideId
                        && x.InjuryType == preauthICD10Code.InjuryType).ToList().Count == 0)
                        {
                            preAuthEntity.PreAuthIcd10Code.Add(new medical_PreAuthIcd10Code
                            {
                                Icd10Code = preauthICD10Code.Icd10Code,
                                Icd10CodeId = preauthICD10Code.Icd10CodeId,
                                BodySideId = preauthICD10Code.BodySideId,
                                IsMatching = preauthICD10Code.IsMatching,
                                IsAuthorised = preauthICD10Code.IsAuthorised,
                                IsClinicalUpdate = preauthICD10Code.IsClinicalUpdate,
                                InjuryType = preauthICD10Code.InjuryType
                            });
                        }
                        break;
                    }
                }
            }

            //Check for deleted ICD10Codes
            foreach (var preauthICD10CodeEntity in preAuthEntity.PreAuthIcd10Code)
            {
                if (preAuthorisation.PreAuthIcd10Codes.Where(x => x.Icd10Code == preauthICD10CodeEntity.Icd10Code).ToList().Count == 0)
                {
                    preauthICD10CodeEntity.IsDeleted = true;
                }
            }
            //Check for deleted TreatmentBaskets
            foreach (var preauthTreatmentBasketEntity in preAuthEntity.PreAuthTreatmentBaskets)
            {
                if (preAuthorisation.PreAuthTreatmentBaskets.Where(x => x.TreatmentBasketId == preauthTreatmentBasketEntity.TreatmentBasketId).ToList().Count == 0)
                {
                    preauthTreatmentBasketEntity.IsDeleted = true;
                }
            }
            return preAuthEntity;
        }

        private medical_PreAuthorisationBreakdown CreateNewPreAuthBreakdownItemWithLevelOfCare(PreAuthorisation preAuthorisation, PreAuthorisationBreakdown lineItem)
        {
            var newBreakdownItem = new medical_PreAuthorisationBreakdown
            {
                PreAuthId = preAuthorisation.PreAuthId,
                MedicalItemId = lineItem.MedicalItemId,
                TariffId = lineItem.TariffId,
                TreatmentCodeId = lineItem.TreatmentCodeId,
                DateAuthorisedFrom = lineItem.DateAuthorisedFrom.ToSaDateTime(),
                DateAuthorisedTo = lineItem.DateAuthorisedTo.ToSaDateTime(),
                RequestedTreatments = lineItem.RequestedTreatments,
                AuthorisedTreatments = lineItem.AuthorisedTreatments,
                RequestedAmount = lineItem.RequestedAmount,
                AuthorisedAmount = lineItem.AuthorisedAmount,
                IsAuthorised = lineItem.IsAuthorised,
                AuthorisedReason = lineItem.AuthorisedReason,
                IsRejected = lineItem.IsRejected,
                RejectedReason = string.IsNullOrWhiteSpace(lineItem.RejectedReason) ? string.Empty : lineItem.RejectedReason,
                ReviewComments = string.IsNullOrWhiteSpace(lineItem.ReviewComments) ? string.Empty : lineItem.ReviewComments,
                TariffAmount = lineItem.TariffAmount,
                IsClinicalUpdate = lineItem.IsClinicalUpdate,
                CreatedBy = lineItem.CreatedBy,
                CreatedDate = lineItem.CreatedDate,
                ModifiedBy = lineItem.ModifiedBy,
                ModifiedDate = lineItem.ModifiedDate
            };
            if (lineItem.LevelOfCare != null)
            {
                var levelOfCareNew = new medical_PreAuthLevelOfCare
                {
                    LevelOfCareId = lineItem.LevelOfCare[0].LevelOfCareId,
                    DateTimeAdmitted = lineItem.LevelOfCare[0].DateTimeAdmitted,
                    DateTimeDischarged = lineItem.LevelOfCare[0].DateTimeDischarged,
                    LengthOfStay = lineItem.LevelOfCare[0].LengthOfStay,
                    CreatedBy = lineItem.CreatedBy,
                    CreatedDate = lineItem.CreatedDate,
                    ModifiedBy = lineItem.ModifiedBy,
                    ModifiedDate = lineItem.ModifiedDate,
                    IsDeleted = false
                };
                newBreakdownItem?.PreAuthLevelOfCares.Add(levelOfCareNew);
            }
            return newBreakdownItem;
        }
        public async Task DeletePreAuthorisation(int preAuthId)
        {
            var userReminders = new List<UserReminder>();
            using (var scope = _dbContextScopeFactory.Create())
            {
                var preAuthEntity = await _preAuthorisationRepository.SingleAsync(c => c.PreAuthId == preAuthId);
                preAuthEntity.IsDeleted = true;
                _preAuthorisationRepository.Update(preAuthEntity);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                var recipients = await _userService.SearchUsersByPermission("Preauth manager view");

                foreach (var recipient in recipients)
                {
                    var userReminder = new UserReminder
                    {
                        AssignedToUserId = recipient.Id,
                        UserReminderItemType = UserReminderItemTypeEnum.MedicareAllMainNotifications,
                        UserReminderType = UserReminderTypeEnum.SystemNotification,
                        CreatedBy = RmaIdentity.UsernameOrBlank,
                        AlertDateTime = DateTimeHelper.SaNow,
                        Text = $"Deleted PreAuth which has paid invoices {preAuthEntity.PreAuthNumber}"
                    };

                    userReminders.Add(userReminder);
                }
            }
            _ = Task.Run(() => _userReminderService.CreateUserReminders(userReminders));
        }

        public async Task<ClinicalUpdate> GetClinicalUpdate(int clinicalUpdateId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);
            ClinicalUpdate clinicalUpdate;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                clinicalUpdate = await (
                        from cu in _clinicalUpdateRepository
                        join pa in _preAuthorisationRepository on cu.PreAuthId equals pa.PreAuthId
                        join hcp in _healthCareProviderRepository on pa.HealthCareProviderId equals hcp.RolePlayerId
                        where cu.ClinicalUpdateId == clinicalUpdateId
                        select new ClinicalUpdate
                        {
                            ClinicalUpdateId = cu.ClinicalUpdateId,
                            PreAuthId = pa.PreAuthId,
                            Diagnosis = cu.Diagnosis,
                            Medication = cu.Medication,
                            Comments = cu.Comments,
                            VisitCompletionDate = cu.VisitCompletionDate,
                            InterimAccountBalance = cu.InterimAccountBalance,
                            DischargeDate = cu.DischargeDate,
                            SubsequentCare = cu.SubsequentCare,
                            UpdateSequenceNo = cu.UpdateSequenceNo,
                            ClinicalUpdateStatus = (PreAuthStatusEnum)cu.StatusId,
                            ReviewComment = cu.ReviewComment,
                            ReviewDate = cu.ReviewDate
                        }).Distinct().FirstOrDefaultAsync();

                if (clinicalUpdate != null)
                {

                    clinicalUpdate.ClinicalUpdateTreatmentProtocols = await (
                        from ctp in _clinicalUpdateTreatmentProtocolRepository
                        join tp in _treatmentProtocolRepository on ctp.TreatmentProtocolId equals tp.Id
                        where ctp.ClinicalUpdateId == clinicalUpdate.ClinicalUpdateId
                        select new ClinicalUpdateTreatmentProtocol
                        {
                            ClinicalUpdateTreatmentProtocolId = ctp.ClinicalUpdateTreatmentProtocolId,
                            ClinicalUpdateId = ctp.ClinicalUpdateId,
                            TreatmentProtocolDescription = tp.Name
                        }).Distinct().ToListAsync();

                    clinicalUpdate.ClinicalUpdateTreatmentPlans = Mapper.Map<List<ClinicalUpdateTreatmentPlan>>(_clinicalUpdateTreatmentPlanRepository.
                        Where(x => x.ClinicalUpdateId == clinicalUpdateId).ToList());

                    clinicalUpdate.PreAuthTreatmentBaskets = Mapper.Map<List<PreAuthTreatmentBasket>>(_preAuthTreatmentBasketsRepository.
                        Where(x => x.PreAuthId == clinicalUpdate.PreAuthId && x.ClinicalUpdateId == clinicalUpdateId
                        && x.IsClinicalUpdate).ToList());

                    clinicalUpdate.PreAuthorisationBreakdowns = await (
                        from pab in _preAuthorisationBreakdownRepository
                        join tar in _tariffRepository on pab.TariffId equals tar.TariffId
                        join med in _medicalItemRepository on tar.MedicalItemId equals med.MedicalItemId
                        where pab.PreAuthId == clinicalUpdate.PreAuthId && pab.IsClinicalUpdate == true
                        && pab.ClinicalUpdateId == clinicalUpdateId
                        select new PreAuthorisationBreakdown
                        {
                            PreAuthBreakdownId = pab.PreAuthBreakdownId,
                            PreAuthId = pab.PreAuthId,
                            MedicalItemId = pab.MedicalItemId,
                            TariffId = pab.TariffId,
                            TreatmentCodeId = pab.TreatmentCodeId,
                            DateAuthorisedFrom = pab.DateAuthorisedFrom,
                            DateAuthorisedTo = pab.DateAuthorisedTo,
                            RequestedTreatments = pab.RequestedTreatments,
                            AuthorisedTreatments = pab.AuthorisedTreatments,
                            RequestedAmount = pab.RequestedAmount,
                            AuthorisedAmount = pab.AuthorisedAmount,
                            IsAuthorised = pab.IsAuthorised,
                            AuthorisedReason = pab.AuthorisedReason,
                            IsRejected = pab.IsRejected,
                            RejectedReason = pab.RejectedReason,
                            ReviewComments = pab.ReviewComments,
                            TariffAmount = pab.TariffAmount,
                            IsClinicalUpdate = pab.IsClinicalUpdate,
                            TariffCode = tar.ItemCode,
                            TariffDescription = med.Name,
                            UpdateSequenceNo = pab.UpdateSequenceNo
                        }).Distinct().ToListAsync();

                    foreach (PreAuthorisationBreakdown preAuthorisationBreakdown in clinicalUpdate.PreAuthorisationBreakdowns)
                    {
                        string itemCode = string.Empty;
                        if (preAuthorisationBreakdown.TariffId > 0)
                        {
                            var tariffCodes = _tariffRepository.First(x => x.TariffId == preAuthorisationBreakdown.TariffId);
                            itemCode = tariffCodes.ItemCode;
                            preAuthorisationBreakdown.TariffCode = tariffCodes.ItemCode;
                            var medicalItem = _medicalItemRepository.First(x => x.MedicalItemId == tariffCodes.MedicalItemId);
                            preAuthorisationBreakdown.TariffDescription = medicalItem.Description;
                        }
                        if (preAuthorisationBreakdown.TreatmentCodeId > 0)
                        {
                            var treatmentCode = await _treatmentCodeRepository.FirstOrDefaultAsync(x => x.TreatmentCodeId == preAuthorisationBreakdown.TreatmentCodeId);
                            if (treatmentCode != null)
                            {
                                preAuthorisationBreakdown.TreatmentCode = treatmentCode.Code;
                                preAuthorisationBreakdown.TreatmentCodeDescription = treatmentCode.Description;
                            }
                        }

                        var preAuthLevelOfCare = _preAuthLevelOfCareRepository.Where(x => x.PreAuthBreakdownId == preAuthorisationBreakdown.PreAuthBreakdownId).ToList();
                        if (preAuthLevelOfCare.Count > 0)
                        {
                            var levelOfCareId = preAuthLevelOfCare.First()?.LevelOfCareId ?? 0;
                            if (levelOfCareId > 0)
                            {
                                var levelOfCare = _levelOfCareRepository.First(x => x.Id == levelOfCareId);
                                preAuthorisationBreakdown.LevelOfCare = new List<PreAuthLevelOfCare>
                                {
                                    new PreAuthLevelOfCare
                                    {
                                        TariffCode = itemCode,
                                        PreAuthLevelOfCareId = preAuthLevelOfCare.FirstOrDefault()?.PreAuthLevelOfCareId ?? 0,
                                        PreAuthBreakdownId = preAuthLevelOfCare.FirstOrDefault()?.PreAuthBreakdownId ?? 0,
                                        LevelOfCareId = levelOfCareId,
                                        LevelOfCare = levelOfCare.Description,
                                        DateTimeAdmitted = preAuthLevelOfCare.FirstOrDefault()?.DateTimeAdmitted ?? default,
                                        DateTimeDischarged = preAuthLevelOfCare.FirstOrDefault()?.DateTimeDischarged ?? default,
                                        LengthOfStay = preAuthLevelOfCare.FirstOrDefault()?.LengthOfStay ?? 0
                                    }
                                };
                            }
                        }
                    }


                    clinicalUpdate.PreAuthIcd10Codes = Mapper.Map<List<PreAuthIcd10Code>>(_icd10CodesRepository
                        .Where(x => x.PreAuthId == clinicalUpdate.PreAuthId && x.ClinicalUpdateId == clinicalUpdateId
                        && x.IsClinicalUpdate).ToList());
                }
            }
            return clinicalUpdate;
        }

        public async Task<List<ClinicalUpdate>> GetPreAuthClinicalUpdates(int preAuthId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);
            var user = await _userService.GetUserByEmail(RmaIdentity.Email);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var clinicalUpdates = await _clinicalUpdateRepository.Where(i => i.PreAuthId == preAuthId)
                    .ToListAsync();
                return Mapper.Map<List<ClinicalUpdate>>(clinicalUpdates);
            }
        }

        public async Task<List<ClinicalUpdate>> GetClinicalUpdatesList(string requestData)
        {

            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                IQueryable<medical_ClinicalUpdate> query;

                var user = await _userService.GetUserByEmail(RmaIdentity.Email);
                var personEventId = await _preAuthClaimService.GetPersonEventIdByClaimReferenceNumber(requestData);

                query = (from cu in _clinicalUpdateRepository
                         join pa in _preAuthorisationRepository on cu.PreAuthId equals pa.PreAuthId
                         where (user.IsInternalUser || cu.CreatedBy.Equals(RmaIdentity.Email))
                         && (string.IsNullOrEmpty(requestData) || pa.PreAuthNumber.Equals(requestData)
                            || pa.PersonEventId == personEventId)
                         select cu).Distinct();

                return query.Select(x => new ClinicalUpdate()
                {
                    ClinicalUpdateId = x.ClinicalUpdateId,
                    PreAuthId = x.PreAuthId,
                    PreAuthNumber = x.PreAuthorisation.PreAuthNumber,
                    Diagnosis = x.Diagnosis,
                    Medication = x.Medication,
                    Comments = x.Comments,
                    VisitCompletionDate = x.VisitCompletionDate,
                    InterimAccountBalance = x.InterimAccountBalance,
                    DischargeDate = x.DischargeDate,
                    SubsequentCare = x.SubsequentCare,
                    UpdateSequenceNo = x.UpdateSequenceNo,
                    ClinicalUpdateStatus = (PreAuthStatusEnum)x.StatusId
                }).ToList();
            }
        }

        public async Task<PagedRequestResult<ClinicalUpdate>> GetClinicalUpdatesData(PagedRequest request)
        {
            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);

            if (request == null) return new PagedRequestResult<ClinicalUpdate>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                IQueryable<medical_ClinicalUpdate> query;

                string requestData = request?.SearchCriteria;

                var user = await _userService.GetUserByEmail(RmaIdentity.Email);

                var personEventId = await _preAuthClaimService.GetPersonEventIdByClaimReferenceNumber(requestData);

                query = (from cu in _clinicalUpdateRepository
                         join pa in _preAuthorisationRepository on cu.PreAuthId equals pa.PreAuthId
                         where (user.IsInternalUser || cu.CreatedBy.Equals(RmaIdentity.Email))
                         && (string.IsNullOrEmpty(requestData) || pa.PreAuthNumber.Equals(requestData)
                            || pa.PersonEventId == personEventId)
                         select cu).Distinct();

                var clinicalItems = await query.Select(x =>
                 new ClinicalUpdate()
                 {
                     ClinicalUpdateId = x.ClinicalUpdateId,
                     PreAuthId = x.PreAuthId,
                     PreAuthNumber = x.PreAuthorisation.PreAuthNumber,
                     Diagnosis = x.Diagnosis,
                     Medication = x.Medication,
                     Comments = x.Comments,
                     VisitCompletionDate = x.VisitCompletionDate,
                     InterimAccountBalance = x.InterimAccountBalance,
                     DischargeDate = x.DischargeDate,
                     SubsequentCare = x.SubsequentCare,
                     UpdateSequenceNo = x.UpdateSequenceNo,
                     ClinicalUpdateStatus = (PreAuthStatusEnum)x.StatusId
                 }).ToPagedResult(request);
                return clinicalItems;
            }

        }



        public async Task<List<PreAuthorisation>> GetAuthorisedPreAuths(int personEventId, bool includeTreatingDoctor)
        {
            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);
            var user = await _userService.GetUserByEmail(RmaIdentity.Email);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                List<medical_PreAuthorisation> preAuthorisations = new List<medical_PreAuthorisation>();
                if (includeTreatingDoctor)
                {
                    preAuthorisations = await _preAuthorisationRepository
                        .Where(i => i.PersonEventId == personEventId && i.PreAuthStatus == PreAuthStatusEnum.Authorised
                                && (user.IsInternalUser || i.CreatedBy.Equals(RmaIdentity.Email))).OrderByDescending(p => p.PreAuthId).ToListAsync();
                }
                else
                {
                    preAuthorisations = await _preAuthorisationRepository
                        .Where(i => i.PersonEventId == personEventId && i.PreAuthStatus == PreAuthStatusEnum.Authorised && i.PreAuthType != PreAuthTypeEnum.TreatingDoctor
                                && (user.IsInternalUser || i.CreatedBy.Equals(RmaIdentity.Email))).OrderByDescending(p => p.PreAuthId).ToListAsync();
                }
                return Mapper.Map<List<PreAuthorisation>>(preAuthorisations);
            }
        }

        public async Task<List<PreAuthorisation>> GetPreAuthsByClaimId(int claimId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);
            var user = await _userService.GetUserByEmail(RmaIdentity.Email);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var preAuthorisationRepository = await _preAuthorisationRepository
                    .Where(i => i.ClaimId == claimId && i.PreAuthType == PreAuthTypeEnum.ChronicMedication).ToListAsync();

                return Mapper.Map<List<PreAuthorisation>>(preAuthorisationRepository);
            }
        }

        public async Task<List<PreAuthorisation>> GetPreAuthsForPractitionerTypeTreatmentBasket(int personEventId, int practitionerTypeId, DateTime invoiceTreatmentFromDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var preAuthorisationList = await (from pa in _preAuthorisationRepository
                                                  join ptb in _preAuthTreatmentBasketsRepository on pa.PreAuthId equals ptb.PreAuthId
                                                  join tb in _treatmentBasketRepository on ptb.TreatmentBasketId equals tb.TreatmentBasketId
                                                  join tbmi in _treatmentBasketMedicalItemRepository on tb.TreatmentBasketId equals tbmi.TreatmentBasketId
                                                  join hcp in _healthCareProviderRepository on pa.HealthCareProviderId equals hcp.RolePlayerId
                                                  join pt in _practitionerTypeRepository on hcp.ProviderTypeId equals pt.PractitionerTypeId
                                                  where pa.PreAuthStatus == PreAuthStatusEnum.Authorised && pa.PreAuthType == PreAuthTypeEnum.Hospitalization
                                                  && pa.PersonEventId == personEventId && pt.PractitionerTypeId == practitionerTypeId
                                                  && (pa.DateAuthorisedFrom <= invoiceTreatmentFromDate && pa.DateAuthorisedTo >= invoiceTreatmentFromDate)
                                                  select new PreAuthorisation
                                                  {
                                                      PreAuthId = pa.PreAuthId,
                                                      PreAuthNumber = pa.PreAuthNumber,
                                                      PreAuthStatus = pa.PreAuthStatus,
                                                      PreAuthType = pa.PreAuthType

                                                  }).Distinct().ToListAsync();
                return preAuthorisationList;
            }
        }

        public async Task<int> AddClinicalUpdate(ClinicalUpdate clinicalUpdate)
        {
            if (clinicalUpdate == null) return -1;

            var clinicalUpdateId = 0;

            using (var scope = _dbContextScopeFactory.Create())
            {
                clinicalUpdate.IsActive = true;

                var clinicalUpdateEntity = await _clinicalUpdateRepository.Where(c => c.PreAuthId == clinicalUpdate.PreAuthId).OrderByDescending(c => c.UpdateSequenceNo).FirstOrDefaultAsync();

                clinicalUpdate.UpdateSequenceNo = clinicalUpdateEntity != null ? clinicalUpdateEntity.UpdateSequenceNo : 0;
                clinicalUpdate.UpdateSequenceNo++;

                var clinicalUpdateActivity = new PreAuthActivity
                {
                    PreAuthId = clinicalUpdate.PreAuthId,
                    PreAuthActivityType = PreAuthActivityTypeEnum.ClinicalUpdateNewRequest,
                    PreAuthStatus = PreAuthStatusEnum.PendingReview,
                    Comment = "ClinicalUpdate created",
                    ModifiedBy = clinicalUpdate.ModifiedBy,
                    ModifiedDate = DateTime.Now,
                    CreatedBy = clinicalUpdate.CreatedBy,
                    CreatedDate = DateTime.Now
                };
                var clinicalUpdateActivityEntity = Mapper.Map<medical_PreAuthActivity>(clinicalUpdateActivity);
                var entity = Mapper.Map<medical_ClinicalUpdate>(clinicalUpdate);
                entity.StatusId = (int)PreAuthStatusEnum.PendingReview;
                entity.PreAuthorisationBreakdowns.Clear();
                entity.PreAuthIcd10Code.Clear();
                entity.PreAuthTreatmentBaskets.Clear();
                entity.ClinicalUpdateTreatmentProtocols.Clear();
                entity.ClinicalUpdateTreatmentPlans.Clear();
                _clinicalUpdateRepository.Create(entity);
                _preAuthActivitiesRepository.Create(clinicalUpdateActivityEntity);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                clinicalUpdateId = entity.ClinicalUpdateId;
            }

            using (var scope = _dbContextScopeFactory.Create())
            {
                if (clinicalUpdate.PreAuthorisationBreakdowns != null)
                {
                    foreach (var preAuthBreakdown in clinicalUpdate.PreAuthorisationBreakdowns)
                    {
                        preAuthBreakdown.IsClinicalUpdate = true;
                        preAuthBreakdown.UpdateSequenceNo = clinicalUpdate.UpdateSequenceNo;
                        preAuthBreakdown.ClinicalUpdateId = clinicalUpdateId;
                        preAuthBreakdown.DateAuthorisedFrom = preAuthBreakdown.DateAuthorisedFrom.ToSaDateTime();
                        preAuthBreakdown.DateAuthorisedTo = preAuthBreakdown.DateAuthorisedTo.ToSaDateTime();

                        var breakdowEntity = Mapper.Map<medical_PreAuthorisationBreakdown>(preAuthBreakdown);
                        _preAuthorisationBreakdownRepository.Create(breakdowEntity);
                    }
                }
                if (clinicalUpdate.PreAuthIcd10Codes != null)
                {
                    foreach (var preAuthIcd10Code in clinicalUpdate.PreAuthIcd10Codes)
                    {
                        preAuthIcd10Code.IsClinicalUpdate = true;
                        preAuthIcd10Code.UpdateSequenceNo = clinicalUpdate.UpdateSequenceNo;
                        preAuthIcd10Code.ClinicalUpdateId = clinicalUpdateId;
                        var icd10CodeEntity = Mapper.Map<medical_PreAuthIcd10Code>(preAuthIcd10Code);
                        _icd10CodesRepository.Create(icd10CodeEntity);
                    }
                }
                if (clinicalUpdate.PreAuthTreatmentBaskets != null)
                {
                    foreach (var preAuthTreatmentBasket in clinicalUpdate.PreAuthTreatmentBaskets)
                    {
                        preAuthTreatmentBasket.IsClinicalUpdate = true;
                        preAuthTreatmentBasket.UpdateSequenceNo = clinicalUpdate.UpdateSequenceNo;
                        preAuthTreatmentBasket.ClinicalUpdateId = clinicalUpdateId;
                        var preAuthTreatmentBasketEntity = Mapper.Map<medical_PreAuthTreatmentBasket>(preAuthTreatmentBasket);
                        _preAuthTreatmentBasketsRepository.Create(preAuthTreatmentBasketEntity);
                    }
                }
                if (clinicalUpdate.ClinicalUpdateTreatmentPlans != null)
                {
                    foreach (var treatmentPlan in clinicalUpdate.ClinicalUpdateTreatmentPlans)
                    {
                        treatmentPlan.ClinicalUpdateId = clinicalUpdateId;
                        var treatmentPlanEntity = Mapper.Map<medical_ClinicalUpdateTreatmentPlan>(treatmentPlan);
                        _clinicalUpdateTreatmentPlanRepository.Create(treatmentPlanEntity);
                    }
                }
                if (clinicalUpdate.ClinicalUpdateTreatmentProtocols != null)
                {
                    foreach (var treatmentProtocol in clinicalUpdate.ClinicalUpdateTreatmentProtocols)
                    {
                        treatmentProtocol.ClinicalUpdateId = clinicalUpdateId;
                        var treatmentProtocolEntity = Mapper.Map<medical_ClinicalUpdateTreatmentProtocol>(treatmentProtocol);
                        treatmentProtocolEntity.TreatmentProtocol = null;
                        treatmentProtocolEntity.IsActive = true;
                        _clinicalUpdateTreatmentProtocolRepository.Create(treatmentProtocolEntity);
                    }
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return clinicalUpdateId;
            }
        }

        public async Task UpdateClinicalUpdate(ClinicalUpdate clinicalUpdate)
        {
            if (clinicalUpdate == null) return;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var clinicalUpdateEntity = await _clinicalUpdateRepository.SingleAsync(c => c.ClinicalUpdateId == clinicalUpdate.ClinicalUpdateId);

                await _clinicalUpdateRepository.LoadAsync(clinicalUpdateEntity, a => a.ClinicalUpdateTreatmentProtocols);
                await _clinicalUpdateRepository.LoadAsync(clinicalUpdateEntity, a => a.ClinicalUpdateTreatmentPlans);
                await _clinicalUpdateRepository.LoadAsync(clinicalUpdateEntity, a => a.PreAuthorisationBreakdowns);
                await _clinicalUpdateRepository.LoadAsync(clinicalUpdateEntity, a => a.PreAuthIcd10Code);
                await _clinicalUpdateRepository.LoadAsync(clinicalUpdateEntity, a => a.PreAuthTreatmentBaskets);

                clinicalUpdateEntity = SetClinicalUpdateEntityValue(clinicalUpdateEntity, clinicalUpdate);

                var clinicalUpdateActivity = new PreAuthActivity
                {
                    PreAuthId = clinicalUpdate.PreAuthId,
                    PreAuthActivityType = PreAuthActivityTypeEnum.ClinicalUpdateEdit,
                    PreAuthStatus = (PreAuthStatusEnum)clinicalUpdateEntity.StatusId,
                    Comment = "ClinicalUpdate updated",
                    ModifiedBy = clinicalUpdate.ModifiedBy,
                    ModifiedDate = DateTime.Now,
                    CreatedBy = clinicalUpdate.CreatedBy,
                    CreatedDate = DateTime.Now
                };
                var clinicalUpdateActivityEntity = Mapper.Map<medical_PreAuthActivity>(clinicalUpdateActivity);
                _clinicalUpdateRepository.Update(clinicalUpdateEntity);
                _preAuthActivitiesRepository.Create(clinicalUpdateActivityEntity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private medical_ClinicalUpdate SetClinicalUpdateEntityValue(medical_ClinicalUpdate clinicalUpdateEntity, ClinicalUpdate clinicalUpdate)
        {
            clinicalUpdateEntity.StatusId = (int)clinicalUpdate.ClinicalUpdateStatus;
            clinicalUpdateEntity.Medication = clinicalUpdate.Medication;
            clinicalUpdateEntity.Comments = clinicalUpdate.Comments;
            clinicalUpdateEntity.Diagnosis = clinicalUpdate.Diagnosis;
            clinicalUpdateEntity.DischargeDate = clinicalUpdate.DischargeDate;
            clinicalUpdateEntity.InterimAccountBalance = clinicalUpdate.InterimAccountBalance;
            clinicalUpdateEntity.SubsequentCare = clinicalUpdate.SubsequentCare;

            if (clinicalUpdate.ClinicalUpdateStatus == PreAuthStatusEnum.Authorised)
            {
                clinicalUpdateEntity.ReviewComment = clinicalUpdate.ReviewComment;
                clinicalUpdateEntity.ReviewDate = DateTime.Now;
            }

            foreach (var lineItem in clinicalUpdate.PreAuthorisationBreakdowns)
            {
                foreach (var lineItemEntity in clinicalUpdateEntity.PreAuthorisationBreakdowns)
                {
                    if (lineItem.PreAuthBreakdownId > 0 && lineItem.PreAuthBreakdownId == lineItemEntity.PreAuthBreakdownId)
                    {
                        lineItemEntity.IsAuthorised = lineItem.IsAuthorised;
                        break;
                    }
                    else if (lineItem.PreAuthBreakdownId == 0)
                    {
                        clinicalUpdateEntity.PreAuthorisationBreakdowns.Add(new medical_PreAuthorisationBreakdown
                        {
                            PreAuthId = clinicalUpdate.PreAuthId,
                            MedicalItemId = lineItem.MedicalItemId,
                            TariffId = lineItem.TariffId,
                            TreatmentCodeId = lineItem.TreatmentCodeId,
                            DateAuthorisedFrom = lineItem.DateAuthorisedFrom.ToSaDateTime(),
                            DateAuthorisedTo = lineItem.DateAuthorisedTo.ToSaDateTime(),
                            RequestedTreatments = lineItem.RequestedTreatments,
                            AuthorisedTreatments = lineItem.AuthorisedTreatments,
                            RequestedAmount = lineItem.RequestedAmount,
                            AuthorisedAmount = lineItem.AuthorisedAmount,
                            IsAuthorised = lineItem.IsAuthorised,
                            AuthorisedReason = lineItem.AuthorisedReason,
                            IsRejected = lineItem.IsRejected,
                            RejectedReason = lineItem.RejectedReason,
                            ReviewComments = lineItem.ReviewComments,
                            TariffAmount = lineItem.TariffAmount,
                            IsClinicalUpdate = true,
                            UpdateSequenceNo = clinicalUpdate.UpdateSequenceNo,
                            ClinicalUpdateId = clinicalUpdate.ClinicalUpdateId,
                            CreatedBy = lineItem.CreatedBy,
                            CreatedDate = lineItem.CreatedDate,
                            ModifiedBy = lineItem.ModifiedBy,
                            ModifiedDate = lineItem.ModifiedDate
                        });
                        break;
                    }
                }
            }

            if (clinicalUpdateEntity.PreAuthIcd10Code.Count == 0)
            {
                foreach (var preauthICD10Code in clinicalUpdate.PreAuthIcd10Codes)
                {
                    clinicalUpdateEntity.PreAuthIcd10Code.Add(new medical_PreAuthIcd10Code
                    {
                        PreAuthId = clinicalUpdate.PreAuthId,
                        Icd10Code = preauthICD10Code.Icd10Code,
                        Icd10CodeId = preauthICD10Code.Icd10CodeId,
                        BodySideId = preauthICD10Code.BodySideId,
                        IsMatching = preauthICD10Code.IsMatching,
                        IsAuthorised = preauthICD10Code.IsAuthorised,
                        IsClinicalUpdate = true,
                        InjuryType = preauthICD10Code.InjuryType,
                        UpdateSequenceNo = clinicalUpdate.UpdateSequenceNo,
                        ClinicalUpdateId = clinicalUpdate.ClinicalUpdateId,
                        CreatedBy = preauthICD10Code.CreatedBy,
                        CreatedDate = preauthICD10Code.CreatedDate,
                        ModifiedBy = preauthICD10Code.ModifiedBy,
                        ModifiedDate = preauthICD10Code.ModifiedDate
                    });
                }
            }
            else
            {
                foreach (var preauthICD10Code in clinicalUpdate.PreAuthIcd10Codes)
                {
                    foreach (var preauthICD10CodeEntity in clinicalUpdateEntity.PreAuthIcd10Code)
                    {
                        if (preauthICD10Code.PreAuthIcd10CodeId > 0 && preauthICD10Code.PreAuthIcd10CodeId == preauthICD10CodeEntity.PreAuthIcd10CodeId)
                        {
                            preauthICD10CodeEntity.IsAuthorised = preauthICD10Code.IsAuthorised;
                            break;
                        }
                        else if (preauthICD10Code.PreAuthIcd10CodeId == 0)
                        {
                            if (clinicalUpdateEntity.PreAuthIcd10Code.Where(x => x.Icd10Code == preauthICD10Code.Icd10Code
                            && x.Icd10CodeId == preauthICD10Code.Icd10CodeId
                            && x.BodySideId == preauthICD10Code.BodySideId
                            && x.InjuryType == preauthICD10Code.InjuryType).ToList().Count == 0)
                            {
                                clinicalUpdateEntity.PreAuthIcd10Code.Add(new medical_PreAuthIcd10Code
                                {
                                    PreAuthId = clinicalUpdate.PreAuthId,
                                    Icd10Code = preauthICD10Code.Icd10Code,
                                    Icd10CodeId = preauthICD10Code.Icd10CodeId,
                                    BodySideId = preauthICD10Code.BodySideId,
                                    IsMatching = preauthICD10Code.IsMatching,
                                    IsAuthorised = preauthICD10Code.IsAuthorised,
                                    IsClinicalUpdate = true,
                                    InjuryType = preauthICD10Code.InjuryType,
                                    UpdateSequenceNo = clinicalUpdate.UpdateSequenceNo,
                                    ClinicalUpdateId = clinicalUpdate.ClinicalUpdateId,
                                    CreatedBy = preauthICD10Code.CreatedBy,
                                    CreatedDate = preauthICD10Code.CreatedDate,
                                    ModifiedBy = preauthICD10Code.ModifiedBy,
                                    ModifiedDate = preauthICD10Code.ModifiedDate
                                });
                            }
                            break;
                        }
                    }
                }
            }

            foreach (var treatmentBasket in clinicalUpdate.PreAuthTreatmentBaskets)
            {
                foreach (var treatmentBasketEntity in clinicalUpdateEntity.PreAuthTreatmentBaskets)
                {
                    if (treatmentBasket.PreAuthTreatmentBasketId > 0 && treatmentBasket.PreAuthTreatmentBasketId == treatmentBasketEntity.PreAuthTreatmentBasketId)
                    {
                        treatmentBasketEntity.IsAuthorised = treatmentBasket.IsAuthorised;
                        break;
                    }
                    else if (treatmentBasket.PreAuthTreatmentBasketId == 0)
                    {
                        clinicalUpdateEntity.PreAuthTreatmentBaskets.Add(new medical_PreAuthTreatmentBasket
                        {
                            TreatmentBasketId = treatmentBasket.TreatmentBasketId,
                            PreAuthId = clinicalUpdate.PreAuthId,
                            IsClinicalUpdate = true,
                            UpdateSequenceNo = clinicalUpdate.UpdateSequenceNo,
                            ClinicalUpdateId = clinicalUpdate.ClinicalUpdateId,
                            CreatedBy = treatmentBasket.CreatedBy,
                            CreatedDate = treatmentBasket.CreatedDate,
                            ModifiedBy = treatmentBasket.ModifiedBy,
                            ModifiedDate = treatmentBasket.ModifiedDate
                        });
                        break;
                    }
                }
            }

            return clinicalUpdateEntity;
        }

        public async Task DeleteClinicalUpdate(int clinicalUpdateId)
        {
            if (clinicalUpdateId > 0) return;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var clinicalUpdateEntity = await _clinicalUpdateRepository.SingleAsync(c => c.ClinicalUpdateId == clinicalUpdateId);
                clinicalUpdateEntity.IsActive = false;
                clinicalUpdateEntity.IsDeleted = true;
                _clinicalUpdateRepository.Update(clinicalUpdateEntity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<PreAuthPractitionerTypeSetting> GetPreAuthPractitionerTypeSetting(int preAuthTypeId, int practitionerTypeId)
        {
            using (_dbContextScopeFactory.Create())
            {
                var preAuthPractitionerTypeSetting =
                    await _preAuthPractitionerTypeSettingRepository.SingleOrDefaultAsync(x =>
                        x.PreAuthType == (PreAuthTypeEnum)preAuthTypeId && x.PractitionerTypeId == practitionerTypeId) ??
                    new medical_PreAuthPractitionerTypeSetting();

                return Mapper.Map<PreAuthPractitionerTypeSetting>(preAuthPractitionerTypeSetting);
            }
        }

        public async Task<PreAuthActivity> GetPreAuthActivity(int preAuthId, PreAuthStatusEnum preAuthStatus)
        {
            using (_dbContextScopeFactory.Create())
            {
                var preAuthActivity = await _preAuthActivitiesRepository.FirstOrDefaultAsync(x => x.PreAuthId == preAuthId && x.PreAuthStatus == preAuthStatus);
                return Mapper.Map<PreAuthActivity>(preAuthActivity);
            }
        }

        public async Task<PagedRequestResult<WorkPool>> GetMedicalBusinessProcesses(WorkPoolEnum workPool, int userId, PagedRequest pagedRequest)
        {
            List<WorkPool> medicalBusinessProcessResult;
            int recordCount = 0;

            if (pagedRequest == null)
            {
                throw new NullReferenceException("PagedRequest cannot be null");
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("WorkPoolId", (int)workPool),
                    new SqlParameter("UserID", userId),
                    new SqlParameter("PageIndex", pagedRequest.Page),
                    new SqlParameter("PageSize", pagedRequest.PageSize),
                    new SqlParameter("RecordCount", SqlDbType.Int),
                    new SqlParameter("SearchQuery", pagedRequest.SearchCriteria == null ? string.Empty : pagedRequest.SearchCriteria),
                    new SqlParameter("SortColumn", pagedRequest.OrderBy ),
                    new SqlParameter("SortOrder", pagedRequest.IsAscending ? "ASC" : "DESC" )
                };
                parameters[4].Direction = ParameterDirection.Output;

                medicalBusinessProcessResult = await _preAuthorisationRepository.SqlQueryAsync<WorkPool>(
                  DatabaseConstants.GetMedicalBusinessProcesses, parameters);
                recordCount = (int)parameters[4].Value;
            }
            var processedResult = await _preAuthHelperService.ProcessMedicalBusinessResult(medicalBusinessProcessResult);

            return new PagedRequestResult<WorkPool>
            {
                Page = pagedRequest.Page,
                PageCount = processedResult.Count,
                RowCount = recordCount,
                PageSize = pagedRequest.PageSize,
                Data = processedResult
            };
        }

        private static string UserSlaHours(TimeSpan? userSla)
        {
            if (!userSla.HasValue)
            {
                userSla = TimeSpan.Zero;
            }

            return $"{userSla.GetValueOrDefault().Days:D2} days,{userSla.GetValueOrDefault().Hours:D2} hrs,{userSla.GetValueOrDefault().Minutes:D2} mins";
        }

        public async Task CreateWorkflow(Workflow workflow)
        {
            if (workflow != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    _workflowRepository.Create(new medical_Workflow
                    {
                        WorkPool = WorkPoolEnum.Medicalpool,
                        WizardId = workflow.WizardId,
                        ReferenceId = workflow.ReferenceId,
                        ReferenceType = workflow.ReferenceType,
                        Description = workflow.Description,
                        AssignedToUserId = workflow.AssignedToUserId,
                        AssignedToRoleId = workflow.AssignedToRoleId,
                        EndDateTime = workflow.EndDateTime,
                        StartDateTime = workflow.StartDateTime,
                        WizardURL = workflow.WizardURL,
                        LockedToUserId = workflow.LockedToUserId
                    });
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
            else
            {
                throw new NullReferenceException();
            }
        }

        public async Task UpdateWorkflow(Workflow workflow)
        {
            if (workflow != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var workflowEntity = await _workflowRepository.Where(x => x.WorkflowId == workflow.WorkflowId).FirstOrDefaultAsync();

                    workflowEntity.WorkPool = WorkPoolEnum.Medicalpool;
                    workflowEntity.WizardId = workflow.WizardId;
                    workflowEntity.ReferenceId = workflow.ReferenceId;
                    workflowEntity.ReferenceType = workflow.ReferenceType;
                    workflowEntity.Description = workflow.Description;
                    workflowEntity.AssignedToUserId = workflow.AssignedToUserId;
                    workflowEntity.AssignedToRoleId = workflow.AssignedToRoleId;
                    workflowEntity.EndDateTime = workflow.EndDateTime;
                    workflowEntity.StartDateTime = workflow.StartDateTime;
                    workflowEntity.WizardURL = workflow.WizardURL;
                    workflowEntity.LockedToUserId = workflow.LockedToUserId;
                    _workflowRepository.Update(workflowEntity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
            else
            {
                throw new NullReferenceException();
            }
        }

        public async Task<int> LockOrUnlockWorkflow(Workflow workflow)
        {
            Contract.Requires(workflow != null);
            Contract.Requires(workflow.WizardId > 0);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var workflowEntity = await _workflowRepository.Where(x => x.WizardId == workflow.WizardId).FirstOrDefaultAsync();
                if (workflowEntity != null)
                {
                    workflowEntity.LockedToUserId = workflow.LockedToUserId;
                    _workflowRepository.Update(workflowEntity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    return await Task.FromResult(1);
                }
            }
            return await Task.FromResult(0);
        }

        public async Task<int> AssignWorkflow(Workflow workflow)
        {
            Contract.Requires(workflow != null);
            Contract.Requires(workflow.WizardId > 0 && workflow.AssignedToUserId > 0);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var workflowEntity = await _workflowRepository.Where(x => x.WizardId == workflow.WizardId).FirstOrDefaultAsync();
                if (workflowEntity != null)
                {
                    workflowEntity.AssignedToUserId = workflow.AssignedToUserId;
                    _workflowRepository.Update(workflowEntity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    return await Task.FromResult(1);
                }
            }
            return await Task.FromResult(0);
        }

        public async Task<int> ReAssignWorkflow(Workflow workflow)
        {
            Contract.Requires(workflow != null);
            Contract.Requires(workflow.WizardId > 0 && workflow.AssignedToUserId > 0);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var workflowEntity = await _workflowRepository.Where(x => x.WizardId == workflow.WizardId).FirstOrDefaultAsync();
                if (workflowEntity != null)
                {
                    workflowEntity.AssignedToUserId = workflow.AssignedToUserId;
                    _workflowRepository.Update(workflowEntity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    return await Task.FromResult(1);
                }
            }
            return await Task.FromResult(0);
        }

        public async Task CloseWorkFlow(Workflow workflow)
        {
            if (workflow != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var workflowEntity = await _workflowRepository.Where(x => x.WorkflowId == workflow.WorkflowId).FirstOrDefaultAsync();
                    workflowEntity.AssignedToUserId = workflow.AssignedToUserId;
                    workflowEntity.EndDateTime = workflow.EndDateTime;
                    _workflowRepository.Update(workflowEntity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
            else
            {
                throw new NullReferenceException();
            }
        }

        public async Task EscalateWorkflow(Workflow workflow)
        {
            if (workflow != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var workflowEntity = await _workflowRepository.Where(x => x.WorkflowId == workflow.WorkflowId).FirstOrDefaultAsync();
                    workflowEntity.AssignedToUserId = workflow.AssignedToUserId;
                    workflowEntity.AssignedToRoleId = workflow.AssignedToRoleId;
                    _workflowRepository.Update(workflowEntity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
            else
            {
                throw new NullReferenceException();
            }
        }

        public async Task<List<PreAuthorisation>> SearchForPreAuthorisation(PreAuthSearchModel preAuthSearchModel)
        {
            if (preAuthSearchModel != null)
            {
                RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var user = await _userService.GetUserByEmail(RmaIdentity.Email);
                    var healthCareProviderIds = new List<int>();
                    if (!user.IsInternalUser)
                    {
                        var userHealthCareProviderDetails = await _userService.GetHealthCareProvidersLinkedToUser(RmaIdentity.Email);
                        healthCareProviderIds.AddRange(userHealthCareProviderDetails.Select(userHealthCareProvider => userHealthCareProvider.HealthCareProviderId));
                    }

                    var isPreAuthNumberSearch = !string.IsNullOrWhiteSpace(preAuthSearchModel.PreAuthNumber);

                    int personEventId = 0;
                    if (!string.IsNullOrWhiteSpace(preAuthSearchModel.ClaimReferenceNumber))
                    {
                        personEventId = await _preAuthClaimService.GetPersonEventIdByClaimReferenceNumber(preAuthSearchModel.ClaimReferenceNumber);
                    }

                    var preAuthList = await (
                        from pa in _preAuthorisationRepository
                        join hcp in _healthCareProviderRepository on pa.HealthCareProviderId equals hcp.RolePlayerId
                        where (pa.PreAuthNumber == (isPreAuthNumberSearch ? preAuthSearchModel.PreAuthNumber : pa.PreAuthNumber) && pa.PreAuthStatus == (isPreAuthNumberSearch ? PreAuthStatusEnum.Authorised : pa.PreAuthStatus))
                              && (pa.PersonEventId == (personEventId > 0 ? personEventId : pa.PersonEventId))
                              && (hcp.PracticeNumber == (string.IsNullOrEmpty(preAuthSearchModel.PracticeNumber) ? hcp.PracticeNumber : preAuthSearchModel.PracticeNumber))
                              && (user.IsInternalUser
                                  || healthCareProviderIds.Any(healthCareProviderId => healthCareProviderId == hcp.RolePlayerId))
                        select new PreAuthorisation
                        {
                            PreAuthId = pa.PreAuthId,
                            PreAuthNumber = pa.PreAuthNumber,
                            PreAuthStatus = pa.PreAuthStatus,
                            DateAuthorisedFrom = pa.DateAuthorisedFrom,
                            DateAuthorisedTo = pa.DateAuthorisedTo,
                            DateAuthorised = pa.DateAuthorised,
                            RequestComments = pa.RequestComments,
                            PracticeNumber = hcp.PracticeNumber,
                            HealthCareProviderName = hcp.Name,
                            PersonEventId = pa.PersonEventId,
                            IsRequestFromHcp = pa.IsRequestFromHcp,
                            PreAuthType = pa.PreAuthType,
                            CreatedBy = pa.CreatedBy,
                            ModifiedBy = pa.ModifiedBy
                        }).Distinct().ToListAsync();

                    foreach (var preAuth in preAuthList)
                    {
                        preAuth.PreAuthNumber = await _preAuthHelperService.GetMaskedPreAuthNumber(preAuth.PreAuthNumber, preAuth.PreAuthStatus);
                        preAuth.ClaimReferenceNumber = await _preAuthClaimService.GetClaimReferenceNumberByPersonEventId(Convert.ToInt32(preAuth.PersonEventId));
                    }

                    return preAuthList;
                }
            }

            return new List<PreAuthorisation>();
        }

        public async Task<PagedRequestResult<PreAuthorisation>> SearchForPreAuthorisations(SearchPreAuthPagedRequest searchPreAuthPagedRequest)
        {
            if (searchPreAuthPagedRequest == null)
                return new PagedRequestResult<PreAuthorisation>();

            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);

            var dateAuthorisedFrom = searchPreAuthPagedRequest.DateAuthorisedFrom ?? DateTime.MinValue;
            var dateAuthorisedTo = searchPreAuthPagedRequest.DateAuthorisedTo ?? DateTime.MinValue;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (string.IsNullOrEmpty(searchPreAuthPagedRequest.OrderBy))
                {
                    searchPreAuthPagedRequest.OrderBy = "PreAuthId";
                }

                var user = await _userService.GetUserByEmail(RmaIdentity.Email);
                var healthCareProviderIds = new List<int>();
                if (!user.IsInternalUser)
                {
                    var userHealthCareProviderDetails = await _userService.GetHealthCareProvidersLinkedToUser(RmaIdentity.Email);
                    healthCareProviderIds.AddRange(userHealthCareProviderDetails.Select(userHealthCareProvider => userHealthCareProvider.HealthCareProviderId));
                }

                var preAuthList = await (
                    from pa in _preAuthorisationRepository
                    join hcp in _healthCareProviderRepository on pa.HealthCareProviderId equals hcp.RolePlayerId
                    where pa.PreAuthNumber == (!string.IsNullOrEmpty(searchPreAuthPagedRequest.PreAuthNumber) ? searchPreAuthPagedRequest.PreAuthNumber : pa.PreAuthNumber)
                    && pa.PreAuthType == (searchPreAuthPagedRequest.PreAuthTypeId > 0 ? (PreAuthTypeEnum)searchPreAuthPagedRequest.PreAuthTypeId : pa.PreAuthType)
                    && pa.PreAuthStatus == (searchPreAuthPagedRequest.PreAuthStatusId > 0 ? (PreAuthStatusEnum)searchPreAuthPagedRequest.PreAuthStatusId : pa.PreAuthStatus)
                    && hcp.RolePlayerId == (searchPreAuthPagedRequest.HealthCareProviderId > 0 ? searchPreAuthPagedRequest.HealthCareProviderId : hcp.RolePlayerId)
                    && pa.DateAuthorisedFrom == (dateAuthorisedFrom != DateTime.MinValue ? searchPreAuthPagedRequest.DateAuthorisedFrom : pa.DateAuthorisedFrom)
                    && pa.DateAuthorisedTo == (dateAuthorisedFrom != DateTime.MinValue ? searchPreAuthPagedRequest.DateAuthorisedTo : pa.DateAuthorisedTo)
                    && pa.ClaimId == (searchPreAuthPagedRequest.ClaimId > 0 ? searchPreAuthPagedRequest.ClaimId : pa.ClaimId)
                    && (user.IsInternalUser
                        || healthCareProviderIds.Any(healthCareProviderId => healthCareProviderId == hcp.RolePlayerId))
                    select new PreAuthorisation
                    {
                        PreAuthId = pa.PreAuthId,
                        PreAuthNumber = pa.PreAuthNumber,
                        PreAuthStatus = pa.PreAuthStatus,
                        DateAuthorisedFrom = pa.DateAuthorisedFrom,
                        DateAuthorisedTo = pa.DateAuthorisedTo,
                        DateAuthorised = pa.DateAuthorised,
                        RequestedAmount = pa.RequestedAmount,
                        AuthorisedAmount = pa.AuthorisedAmount,
                        RequestComments = pa.RequestComments,
                        PracticeNumber = hcp.PracticeNumber,
                        HealthCareProviderName = hcp.Name,
                        PersonEventId = pa.PersonEventId,
                        IsRequestFromHcp = pa.IsRequestFromHcp,
                        PreAuthType = pa.PreAuthType,
                        CreatedBy = pa.CreatedBy,
                        CreatedDate = pa.CreatedDate,
                        ModifiedBy = pa.ModifiedBy
                    }).Distinct().ToPagedResult(searchPreAuthPagedRequest);

                var preAuthorisations = Mapper.Map<List<PreAuthorisation>>(preAuthList.Data);

                foreach (var preAuth in preAuthorisations)
                {
                    preAuth.PreAuthNumber = await _preAuthHelperService.GetMaskedPreAuthNumber(preAuth.PreAuthNumber, preAuth.PreAuthStatus);
                    preAuth.ClaimReferenceNumber = await _preAuthClaimService.GetClaimReferenceNumberByPersonEventId(Convert.ToInt32(preAuth.PersonEventId));
                }

                return new PagedRequestResult<PreAuthorisation>
                {
                    Page = preAuthList.Page,
                    PageCount = preAuthList.PageCount,
                    RowCount = preAuthList.RowCount,
                    PageSize = preAuthList.PageSize,
                    Data = preAuthorisations
                };
            }
        }

        public async Task<List<PreAuthBreakdownUnderAssessReason>> ExecutePreauthBreakdownUnderAssessReasonValidations(PreAuthorisation preAuthorisation)
        {
            Contract.Requires(preAuthorisation != null);
            Contract.Requires(preAuthorisation.PreAuthorisationBreakdowns != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                List<PreAuthBreakdownUnderAssessReason> preAuthBreakdownUnderAssessReason = new List<PreAuthBreakdownUnderAssessReason> { };
                if (preAuthorisation != null && preAuthorisation.PreAuthorisationBreakdowns != null)
                {
                    foreach (var breakdownItem in preAuthorisation.PreAuthorisationBreakdowns)
                    {
                        if (!string.IsNullOrEmpty(breakdownItem.TariffCode))
                        {
                            var breakdownItemCodeLimit = await _mediCareService.GetPreAuthCodeLimit(breakdownItem.TariffCode, preAuthorisation.PractitionerTypeId);

                            if (breakdownItemCodeLimit.AuthorisationQuantityLimit > 0 && breakdownItemCodeLimit.AuthorisationQuantityLimit < breakdownItem.RequestedTreatments)
                            {
                                //will be updated once all values are in from business (UnderAssessReasonId & UnderAssessReason )
                                preAuthBreakdownUnderAssessReason.Add(new PreAuthBreakdownUnderAssessReason
                                {
                                    Id = 0,
                                    PreAuthBreakdownId = breakdownItem.PreAuthBreakdownId,
                                    UnderAssessReasonId = 44,
                                    UnderAssessReason = "Authorisation code quantity limit reached for the practitioner",
                                    Comments = "TariffCode Limit Reached"
                                });
                            }
                        }
                    }
                }
                return preAuthBreakdownUnderAssessReason;
            }
        }

        public async Task<List<PreAuthorisation>> GetInvoicePreAuthNumbers(DateTime treatmentFromDate, int healthCareProviderId, int personEventId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);
            List<PreAuthorisation> preAuthDetailsList = new List<PreAuthorisation>();

            try
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var preauthList = await _preAuthorisationRepository
                        .Where(p => p.HealthCareProviderId == healthCareProviderId && p.PersonEventId == personEventId
                         && p.PreAuthStatus == PreAuthStatusEnum.Authorised && p.DateAuthorisedFrom <= treatmentFromDate && p.DateAuthorisedTo >= treatmentFromDate).ToListAsync();
                    return Mapper.Map<List<PreAuthorisation>>(preauthList);
                }
            }
            catch (Exception ex)
            {
                ex.LogException();
                return preAuthDetailsList;
            }
        }

        public async Task<List<PreAuthorisation>> GetInvoiceMappedPreAuthorisations(List<int> preAuthIds)
        {
            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var preAuthorisationRepository = await _preAuthorisationRepository
                .Where(x => preAuthIds.Contains(x.PreAuthId)).ToListAsync();
                return Mapper.Map<List<PreAuthorisation>>(preAuthorisationRepository);
            }
        }

        public async Task<List<PreAuthorisation>> CheckIfPreAuthExists(MedicalPreAuthExistCheckParams medicalPreAuthExistCheckParams)
        {
            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var preAuthorisationRepository = await _preAuthorisationRepository
                    .Where(x => x.HealthCareProviderId == medicalPreAuthExistCheckParams.HealthCareProviderId && x.PersonEventId == medicalPreAuthExistCheckParams.PersonEventId &&
                           (x.DateAuthorisedFrom <= medicalPreAuthExistCheckParams.DateAdmitted && x.DateAuthorisedTo >= medicalPreAuthExistCheckParams.DateAdmitted) ||
                           (x.DateAuthorisedFrom <= medicalPreAuthExistCheckParams.DateDischarged && x.DateAuthorisedTo >= medicalPreAuthExistCheckParams.DateDischarged)).ToListAsync();
                return Mapper.Map<List<PreAuthorisation>>(preAuthorisationRepository);
            }
        }

        public async Task<string> CheckIfDuplicatePreAuth(PreAuthorisation preAuthorisation)
        {
            bool duplicateFound = false;
            List<medical_PreAuthorisation> results = new List<medical_PreAuthorisation>();

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                if (preAuthorisation != null)
                {
                    DateTime dateAuthorisedFrom = preAuthorisation.DateAuthorisedFrom.ToSaDateTime();
                    DateTime dateAuthorisedTo = preAuthorisation.DateAuthorisedTo.ToSaDateTime();

                    results = await _preAuthorisationRepository.Where(i => i.PreAuthId != preAuthorisation.PreAuthId &&
                        i.HealthCareProviderId == preAuthorisation.HealthCareProviderId &&
                        i.PersonEventId == preAuthorisation.PersonEventId &&
                        i.PreAuthType == preAuthorisation.PreAuthType &&
                        i.DateAuthorisedFrom == dateAuthorisedFrom &&
                        i.DateAuthorisedTo == dateAuthorisedTo &&
                        i.PreAuthStatus != PreAuthStatusEnum.Deleted).ToListAsync();

                    if (results.Count > 0)
                        duplicateFound = true;
                }
            }
            return "{\"DuplicatePreAuthExist\": \"" + duplicateFound + "\"}";
        }

        public async Task<string> CheckIfProhibitedPractitionerType(int healthCareProviderId)
        {
            bool prohibitedPractitionerType = false;

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                if (healthCareProviderId > 0)
                {
                    var healthCareProvider = await (
                        from hcp in _healthCareProviderRepository
                        where hcp.RolePlayerId.Equals(healthCareProviderId)
                        select new HealthCareProvider
                        {
                            ProviderTypeId = hcp.ProviderTypeId
                        }).FirstOrDefaultAsync();

                    if (healthCareProvider?.ProviderTypeId > 0)
                    {
                        var treatmentAuthProhibitedPractitionerTypeId = await _configurationService.GetModuleSetting(Constants.MediCareConstants.TreatmentAuthProhibitedPractitionerTypeId);
                        if (!string.IsNullOrWhiteSpace(treatmentAuthProhibitedPractitionerTypeId) && healthCareProvider.ProviderTypeId == Convert.ToInt32(treatmentAuthProhibitedPractitionerTypeId))
                            prohibitedPractitionerType = true;
                    }
                }
            }
            return "{\"IsProhibitedPractitionerType\": \"" + prohibitedPractitionerType + "\"}";
        }

        public async Task<int> AddProsthetistQuote(ProsthetistQuote prosthetistQuote)
        {
            RmaIdentity.DemandPermission(Permissions.CreatePreAuthorisationWizard);
            Contract.Requires(prosthetistQuote != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<medical_ProsthetistQuote>(prosthetistQuote);
                _prosthetistQuoteRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.ProsthetistQuoteId;
            }
        }

        public async Task<ProsthetistQuote> GetProsthetistQuotationsById(int prosthetistQuoteId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var healthCareProviderRepository = _healthCareProviderRepository.Select(x => x);

                var prosthetistQuote = await (
                from pa in _prosthetistQuoteRepository
                join hcp in healthCareProviderRepository on pa.RolePlayerId equals hcp.RolePlayerId
                where pa.ProsthetistQuoteId == prosthetistQuoteId
                select new ProsthetistQuote
                {
                    ProsthetistQuoteId = pa.ProsthetistQuoteId,
                    RolePlayerId = pa.RolePlayerId,
                    ProsthetistId = pa.ProsthetistId,
                    PensionCaseId = pa.PensionCaseId,
                    ClaimId = pa.ClaimId,
                    QuotationAmount = pa.QuotationAmount,
                    Comments = pa.Comments,
                    ProstheticType = pa.ProstheticType,
                    ProsTypeSpecification = pa.ProsTypeSpecification,
                    IsApproved = pa.IsApproved,
                    ReviewedBy = pa.ReviewedBy,
                    ReviewedDateTime = pa.ReviewedDateTime,
                    ReviewedComments = pa.ReviewedComments,
                    SignedBy = pa.SignedBy,
                    IsSentForReview = pa.IsSentForReview,
                    ProstheticQuotationType = pa.ProstheticQuotationType,
                    ProstheticQuoteStatus = pa.ProstheticQuoteStatus,
                    IsRejected = pa.IsRejected,
                    IsAutoApproved = pa.IsAutoApproved,
                    IsRequestInfo = pa.IsRequestInfo,
                    CreatedBy = pa.CreatedBy,
                    HealthCareProviderName = hcp.Name,
                    PreAuthId = pa.PreAuthId
                }).Distinct().FirstOrDefaultAsync();

                return prosthetistQuote;
            }
        }

        public async Task<PagedRequestResult<ProsthetistQuote>> SearchProsthetistQuotations(PagedRequest request)
        {
            if (request == null) return new PagedRequestResult<ProsthetistQuote>();

            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (request?.OrderBy.ToLower() == "ProsthetistQuoteId") request.OrderBy = "ProsthetistQuoteId";
                var prosthetistQuoteSearch = JsonConvert.DeserializeObject<ProsthetistQuote>(request?.SearchCriteria);
                var user = await _userService.GetUserByEmail(RmaIdentity.Email);
                IQueryable<medical_ProsthetistQuote> prosthetistQuoteQuery = _prosthetistQuoteRepository;

                if (!user.IsInternalUser)
                {
                    prosthetistQuoteQuery = prosthetistQuoteQuery
                   .Where(a => !string.IsNullOrEmpty(prosthetistQuoteSearch.CreatedBy.Trim()) && a.CreatedBy.Equals(RmaIdentity.Email));
                }

                if (prosthetistQuoteSearch.ClaimId > 0)
                    prosthetistQuoteQuery = prosthetistQuoteQuery.Where(a => a.ClaimId == prosthetistQuoteSearch.ClaimId);

                if (prosthetistQuoteSearch.PreAuthId > 0)
                {//Quotation linked with PreAuthorisation.
                    prosthetistQuoteQuery = prosthetistQuoteQuery
                    .Where(a => a.PreAuthId == prosthetistQuoteSearch.PreAuthId);
                }
                else
                {
                    prosthetistQuoteQuery = prosthetistQuoteQuery.Where(a => a.ProsthetistQuoteId > 0);
                }

                var prosthetistQuoteList = await (
                        from pa in prosthetistQuoteQuery
                        join hcp in _healthCareProviderRepository on pa.RolePlayerId equals hcp.RolePlayerId
                        select new ProsthetistQuote
                        {
                            ProsthetistQuoteId = pa.ProsthetistQuoteId,
                            RolePlayerId = pa.RolePlayerId,
                            ProsthetistId = pa.ProsthetistId,
                            PensionCaseId = pa.PensionCaseId,
                            ClaimId = pa.ClaimId,
                            QuotationAmount = pa.QuotationAmount,
                            Comments = pa.Comments,
                            ProstheticType = pa.ProstheticType,
                            ProsTypeSpecification = pa.ProsTypeSpecification,
                            IsApproved = pa.IsApproved,
                            ReviewedBy = pa.ReviewedBy,
                            ReviewedDateTime = pa.ReviewedDateTime,
                            ReviewedComments = pa.ReviewedComments,
                            SignedBy = pa.SignedBy,
                            IsSentForReview = pa.IsSentForReview,
                            ProstheticQuotationType = pa.ProstheticQuotationType,
                            ProstheticQuoteStatus = pa.ProstheticQuoteStatus,
                            IsRejected = pa.IsRejected,
                            IsAutoApproved = pa.IsAutoApproved,
                            IsRequestInfo = pa.IsRequestInfo,
                            CreatedBy = pa.CreatedBy,
                            HealthCareProviderName = hcp.Name,
                            PreAuthId = pa.PreAuthId
                        }).Distinct().ToPagedResult(request);
                if (prosthetistQuoteList.Data.Count > 0)
                {
                    return new PagedRequestResult<ProsthetistQuote>
                    {
                        Page = prosthetistQuoteList.Page,
                        PageCount = prosthetistQuoteList.PageCount,
                        RowCount = prosthetistQuoteList.RowCount,
                        PageSize = prosthetistQuoteList.PageSize,
                        Data = prosthetistQuoteList.Data
                    };
                }
            }

            return new PagedRequestResult<ProsthetistQuote>();
        }

        public async Task UpdateProsthetistQuote(ProsthetistQuote prosthetistQuote)
        {
            if (prosthetistQuote == null) return;
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _prosthetistQuoteRepository.Where(x => x.ProsthetistQuoteId == prosthetistQuote.ProsthetistQuoteId).FirstOrDefaultAsync();
                entity.RolePlayerId = prosthetistQuote.RolePlayerId;
                entity.ProsthetistId = prosthetistQuote.ProsthetistId;
                entity.PensionCaseId = prosthetistQuote.PensionCaseId;
                entity.ClaimId = prosthetistQuote.ClaimId;
                entity.QuotationAmount = prosthetistQuote.QuotationAmount;
                entity.Comments = prosthetistQuote.Comments;
                entity.ProstheticType = prosthetistQuote.ProstheticType;
                entity.ProsTypeSpecification = prosthetistQuote.ProsTypeSpecification;
                entity.IsApproved = prosthetistQuote.IsApproved;
                entity.ReviewedBy = prosthetistQuote.ReviewedBy;
                entity.ReviewedDateTime = prosthetistQuote.ReviewedDateTime;
                entity.ReviewedComments = prosthetistQuote.ReviewedComments;
                entity.SignedBy = prosthetistQuote.SignedBy;
                entity.IsSentForReview = prosthetistQuote.IsSentForReview;
                entity.ProstheticQuotationType = prosthetistQuote.ProstheticQuotationType;
                entity.IsRejected = prosthetistQuote.IsRejected;
                entity.IsAutoApproved = prosthetistQuote.IsAutoApproved;
                entity.IsRequestInfo = prosthetistQuote.IsRequestInfo;
                entity.IsActive = prosthetistQuote.IsActive;
                entity.IsDeleted = prosthetistQuote.IsDeleted;
                entity.ModifiedBy = RmaIdentity.Email;
                entity.ModifiedDate = DateTimeHelper.SaNow;
                entity.ProstheticQuoteStatus = prosthetistQuote.ProstheticQuoteStatus;
                entity.PreAuthId = prosthetistQuote.PreAuthId;
                _prosthetistQuoteRepository.Update(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<PagedRequestResult<MedicareWorkPool>> GetMedicalWorkPool(PagedRequest request, string assignedToUserId, int userLoggedIn, int workpoolId, bool isUserBox)
        {
            Contract.Requires(request != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("PageNumber", request.Page),
                    new SqlParameter("RowsOfPage", request.PageSize),
                    new SqlParameter("SortingCol", request.OrderBy),
                    new SqlParameter("SortType", request.IsAscending ? "ASC" : "DESC"),
                    new SqlParameter("SearchCreatia", request.SearchCriteria == null ? string.Empty : request.SearchCriteria),
                    new SqlParameter("AssignedToUserId", assignedToUserId),
                    new SqlParameter("UserLoggedIn", userLoggedIn),
                    new SqlParameter("WorkpoolId", workpoolId),
                    new SqlParameter("IsUserBox", isUserBox),
                    new SqlParameter("RecordCount", SqlDbType.Int),
                };

                parameters[9].Direction = ParameterDirection.Output;

                var searchResult = new List<MedicareWorkPool>();
                if (workpoolId == (int)WorkPoolEnum.MIAMedicalPool)
                    searchResult = await _preAuthorisationRepository.SqlQueryAsync<MedicareWorkPool>(DatabaseConstants.GetMedicalInvoiceWorkPool, parameters);
                else if (workpoolId == (int)WorkPoolEnum.MAAMedicalPool)
                    searchResult = await _preAuthorisationRepository.SqlQueryAsync<MedicareWorkPool>(DatabaseConstants.GetMedicalPreAuthPool, parameters);

                int recordCount = int.TryParse(parameters[9]?.Value?.ToString(), out int result) ? result : 0;

                return new PagedRequestResult<MedicareWorkPool>()
                {
                    Page = request.Page,
                    PageCount = (searchResult?.Count) ?? 0,
                    RowCount = recordCount,
                    PageSize = request.PageSize,
                    Data = searchResult
                };
            }
        }

        public async Task<bool> CreateReviewWizard(PreAuthorisation preAuthorisation)
        {
            if (preAuthorisation != null)
                if (preAuthorisation.PersonEventId.HasValue)
                {
                    if (preAuthorisation.IsRequestFromHcp == true)
                    {
                        var medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.MedicalAdminAssistant);
                        var preAuthClaimQuery = await _preAuthClaimService.GetPreAuthClaimDetailByPersonEventId((int)preAuthorisation.PersonEventId);
                        var eventDate = preAuthClaimQuery.EventDate;
                        var type = "review-preauth";
                        bool olderThanTwoYears = false;
                        var differenceBetweenDates = (DateTime.Now - eventDate).TotalDays;
                        if (differenceBetweenDates > (365 * 2))
                        {
                            olderThanTwoYears = true;
                        }
                        bool isInHospital = false;
                        if (preAuthorisation.IsInHospital.HasValue)
                        {
                            isInHospital = (bool)preAuthorisation.IsInHospital.Value;
                        }
                        if (!olderThanTwoYears)
                        {
                            var claim = await _preAuthClaimService.GetPreAuthClaimDetailByClaimId((int)preAuthorisation.ClaimId);
                            if (preAuthorisation.PreAuthType == PreAuthTypeEnum.Treatment)
                            {
                                if (!isInHospital && (claim.ClaimStatus == ClaimStatusEnum.Open || claim.ClaimStatus == ClaimStatusEnum.Closed
                                    || claim.ClaimStatus == ClaimStatusEnum.ManuallyAcknowledged || claim.ClaimStatus == ClaimStatusEnum.Finalized
                                    || claim.ClaimStatus == ClaimStatusEnum.AutoAcknowledged))
                                    medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.ClinicalClaimsAdjudicator); 
                            }
                        }
                        var data = _serializerService.Serialize(preAuthorisation);

                        var wizardRequest = new StartWizardRequest()
                        {
                            Data = data,
                            Type = type,
                            LinkedItemId = preAuthorisation.PreAuthId,
                            LockedToUser = null,
                            RequestInitiatedByBackgroundProcess = true,
                            CustomRoutingRoleId = medicalUserRole.Id
                        };
                   var wizard =  await _wizardService.StartWizard(wizardRequest);

                        var slaStatusChangeAudit = new SlaStatusChangeAudit
                        {
                            SLAItemType = SLAItemTypeEnum.WorkPoolWorkflows,
                            ItemId = wizard.Id,
                            Status = "New",
                            EffectiveFrom = DateTimeHelper.SaNow,
                            Reason = "Preauth submitted for review",
                            CreatedBy = "System"
                        };

                        await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
                    }
                }

            return await Task.FromResult(true);
        }

        public async Task<int> AddPreAuthorisationUnderAssessReason(PreAuthorisationUnderAssessReason preAuthorisationUnderAssessReason)
        {
            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<medical_PreAuthorisationUnderAssessReason>(preAuthorisationUnderAssessReason);
                _preAuthorisationUnderAssessReasonRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.Id;
            }
        }

        public async Task<bool> CreateProstheticReviewWizard(int wizardId, int roleId)
        {
            try
            {
                Wizard wizard = await _wizardService.GetWizard(wizardId);
                if (wizard == null)
                    return false;

                var stepData = JsonConvert.DeserializeObject<ArrayList>(wizard.Data);
                if (stepData == null || stepData.Count == 0)
                    return false;

                var preAuthForm = JsonConvert.DeserializeObject<PreAuthorisation>(stepData[0]?.ToString());
                if (preAuthForm == null)
                    return false;

                var startWizardRequest = new StartWizardRequest
                {
                    Type = "review-prosthetic-preauth",
                    LinkedItemId = preAuthForm.PreAuthId,
                    Data = JsonConvert.SerializeObject(preAuthForm),
                    RequestInitiatedByBackgroundProcess = true,
                    CustomRoutingRoleId = roleId
                };

                return await _wizardService.StartWizard(startWizardRequest) != null;
            }
            catch (Exception ex)
            {
                ex.LogException();
                return false;
            }
        }

    }
}
