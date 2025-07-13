using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.MediCare.Constants;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Entities;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class PreAuthHelperFacade : RemotingStatelessService, IPreAuthHelperService
    {
        private const string SoftDeleteFilter = "SoftDeletes";
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<medical_PreAuthorisation> _preAuthorisationRepository;
        private readonly IRepository<medical_PreAuthorisationBreakdown> _preAuthorisationBreakdownRepository;
        private readonly IRepository<medical_HealthCareProvider> _healthCareProviderRepository;
        private readonly IRepository<medical_PreAuthTreatmentBasket> _preAuthTreatmentBasketsRepository;
        private readonly IRepository<medical_PreAuthIcd10Code> _icd10CodesRepository;
        private readonly IRepository<medical_PreAuthActivity> _preAuthActivitiesRepository;
        private readonly IRepository<medical_Tariff> _tariffRepository;
        private readonly IRepository<medical_TreatmentCode> _treatmentCodeRepository;
        private readonly IRepository<medical_ChronicMedicationForm> _preAuthchronicMedicationFormRepository;
        private readonly IRepository<medical_ChronicMedicalHistory> _chronicMedicalHistoryRepository;
        private readonly IRepository<medical_ChronicScriptMedicineRenewal> _chronicScriptMedicineRenewalRepository;
        private readonly IRepository<medical_ChronicScriptMedicine> _chronicScriptMedicineRepository;
        private readonly IRepository<medical_ChronicMedicationFormRenewal> _preAuthchronicMedicationFormRenewalRepository;
        private readonly IRepository<medical_MedicalItem> _medicalItemRepository;
        private readonly IRepository<medical_PreAuthLevelOfCare> _preAuthLevelOfCareRepository;
        private readonly IRepository<medical_LevelOfCare> _levelOfCareRepository;
        private readonly IUserService _userService;
        private readonly IRepository<medical_Icd10Code> _icd10CodeRepositary;
        private readonly IPreAuthBreakdownUnderAssessReasonService _preAuthBreakdownUnderAssessReasonService;
        private readonly IRepository<medical_PreAuthRehabilitation> _preAuthRehabilitationRepository;
        private readonly IRepository<medical_PreAuthMotivationForClaimReopening> _preAuthMotivationForClaimReopenings;

        public PreAuthHelperFacade(StatelessServiceContext context
            , IUserService userService
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<medical_PreAuthorisation> preAuthorisationRepository
            , IRepository<medical_PreAuthorisationBreakdown> preAuthorisationBreakdownRepository
            , IRepository<medical_HealthCareProvider> healthCareProviderRepository
            , IRepository<medical_PreAuthTreatmentBasket> preAuthTreatmentBasketsRepository
            , IRepository<medical_PreAuthIcd10Code> icd10CodesRepository
            , IRepository<medical_PreAuthActivity> preAuthActivitiesRepository
            , IRepository<medical_Tariff> tariffRepository
            , IRepository<medical_TreatmentCode> treatmentCodeRepository
            , IRepository<medical_MedicalItem> medicalItemRepository
            , IRepository<medical_PreAuthLevelOfCare> preAuthLevelOfCareRepository
            , IRepository<medical_LevelOfCare> levelOfCareRepository
            , IRepository<medical_Icd10Code> icd10CodeRepository
            , IPreAuthBreakdownUnderAssessReasonService preAuthBreakdownUnderAssessReasonService
            , IRepository<medical_PreAuthRehabilitation> preAuthRehabilitationRepository
            , IRepository<medical_PreAuthMotivationForClaimReopening> preAuthMotivationForClaimReopenings
            , IRepository<medical_ChronicMedicationForm> preAuthchronicMedicationFormRepository
            , IRepository<medical_ChronicMedicationFormRenewal> preAuthchronicMedicationFormRenewalRepository
            , IRepository<medical_ChronicMedicalHistory> chronicMedicalHistoryRepository
            , IRepository<medical_ChronicScriptMedicineRenewal> chronicScriptMedicineRenewalRepository
            , IRepository<medical_ChronicScriptMedicine> chronicScriptMedicineRepository
            )
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _preAuthorisationRepository = preAuthorisationRepository;
            _preAuthorisationBreakdownRepository = preAuthorisationBreakdownRepository;
            _healthCareProviderRepository = healthCareProviderRepository;
            _userService = userService;
            _preAuthTreatmentBasketsRepository = preAuthTreatmentBasketsRepository;
            _icd10CodesRepository = icd10CodesRepository;
            _preAuthActivitiesRepository = preAuthActivitiesRepository;
            _tariffRepository = tariffRepository;
            _treatmentCodeRepository = treatmentCodeRepository;
            _medicalItemRepository = medicalItemRepository;
            _preAuthLevelOfCareRepository = preAuthLevelOfCareRepository;
            _levelOfCareRepository = levelOfCareRepository;
            _icd10CodeRepositary = icd10CodeRepository;
            _preAuthBreakdownUnderAssessReasonService = preAuthBreakdownUnderAssessReasonService;
            _preAuthRehabilitationRepository = preAuthRehabilitationRepository;
            _preAuthMotivationForClaimReopenings = preAuthMotivationForClaimReopenings;
            _preAuthchronicMedicationFormRepository = preAuthchronicMedicationFormRepository;
            _preAuthchronicMedicationFormRenewalRepository = preAuthchronicMedicationFormRenewalRepository;
            _chronicMedicalHistoryRepository = chronicMedicalHistoryRepository;
            _chronicScriptMedicineRenewalRepository = chronicScriptMedicineRenewalRepository;
            _chronicScriptMedicineRepository = chronicScriptMedicineRepository;
        }

        public async Task<PreAuthorisation> GetPreAuthDetails(string preAuthNumber, int preAuthId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);
            var user = await _userService.GetUserByEmail(RmaIdentity.Email);
            var healthCareProviderId = 0;
            var isInternalUser = string.IsNullOrEmpty(RmaIdentity.Email) || (user != null && user.IsInternalUser);


            PreAuthorisation preAuthorisation;
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                _preAuthorisationRepository.DisableFilter(SoftDeleteFilter);

                if (!isInternalUser)
                {
                    var userHealthCareProviderDetails = await _userService.GetHealthCareProvidersLinkedToUser(RmaIdentity.Email);
                    if (userHealthCareProviderDetails.Any())
                    {
                        var userHealthCareProviderIds = userHealthCareProviderDetails.Select(Id => Id.HealthCareProviderId);
                        var healthCareProvider = await (
                             from pa in _preAuthorisationRepository
                             join hcp in _healthCareProviderRepository on pa.HealthCareProviderId equals hcp.RolePlayerId
                             where (pa.PreAuthNumber == preAuthNumber || pa.PreAuthId == preAuthId) &&
                                  userHealthCareProviderIds.Contains(pa.HealthCareProviderId)
                             select pa
                            ).Distinct().FirstOrDefaultAsync();

                        if (healthCareProvider != null)
                        {
                            preAuthId = healthCareProvider.PreAuthId;
                            healthCareProviderId = healthCareProvider.HealthCareProviderId;
                        }
                    }
                }

                preAuthorisation = Mapper.Map<PreAuthorisation>(await (
                       from pa in _preAuthorisationRepository
                       join hcp in _healthCareProviderRepository on pa.HealthCareProviderId equals hcp.RolePlayerId
                       where (preAuthId == 0 || pa.PreAuthId == preAuthId)
                       && (string.IsNullOrEmpty(preAuthNumber) || pa.PreAuthNumber.Equals(preAuthNumber))
                       && (isInternalUser || (pa.HealthCareProviderId == healthCareProviderId || pa.CreatedBy.Equals(RmaIdentity.Email)))
                       select pa
                       ).Distinct().FirstOrDefaultAsync()
                       );

                //If no PreAuths are returned, use HospitalAuthId for Treating Doctor Auth as search criteria
                if (preAuthorisation == null)
                {
                    preAuthorisation = Mapper.Map<PreAuthorisation>(await (
                        from pa in _preAuthorisationRepository
                        join hcp in _healthCareProviderRepository on pa.HealthCareProviderId equals hcp.RolePlayerId
                        where (preAuthId == 0 || pa.HospitalAuthId == preAuthId)
                        && (string.IsNullOrEmpty(preAuthNumber) || pa.PreAuthNumber.Equals(preAuthNumber))
                        && (isInternalUser || (pa.HealthCareProviderId == healthCareProviderId || pa.CreatedBy.Equals(RmaIdentity.Email)))
                        select pa
                        ).Distinct().FirstOrDefaultAsync()
                        );
                }

                if (preAuthorisation != null)
                {
                    //Mask PreAuthNumber if Status other than Authorised
                    if (string.IsNullOrEmpty(preAuthorisation.HealthCareProviderName))
                    {
                        preAuthorisation.HealthCareProviderName = _healthCareProviderRepository.FirstOrDefault(hcp => hcp.RolePlayerId == preAuthorisation.HealthCareProviderId)?.Name;
                    }
                    if (string.IsNullOrEmpty(preAuthorisation.PracticeNumber))
                    {
                        preAuthorisation.PracticeNumber = _healthCareProviderRepository.FirstOrDefault(hcp => hcp.RolePlayerId == preAuthorisation.HealthCareProviderId)?.PracticeNumber;
                    }
                    if (preAuthorisation.PractitionerTypeId == 0)
                    {
                        preAuthorisation.PractitionerTypeId = (int)_healthCareProviderRepository.FirstOrDefault(hcp => hcp.RolePlayerId == preAuthorisation.HealthCareProviderId)?.ProviderTypeId;
                    }

                    preAuthorisation.PreAuthRehabilitations = Mapper.Map<List<PreAuthRehabilitation>>(_preAuthRehabilitationRepository.Where(x => x.PreAuthId == preAuthorisation.PreAuthId).ToList());
                    foreach (PreAuthRehabilitation preAuthRehabilitation in preAuthorisation.PreAuthRehabilitations)
                    {
                        preAuthRehabilitation.HealthCareProviderName = _healthCareProviderRepository.FirstOrDefault(hcp => hcp.RolePlayerId == preAuthRehabilitation.ReferringDoctorId)?.Name;
                    }

                    preAuthorisation.PreAuthMotivationForClaimReopenings = Mapper.Map<List<PreAuthMotivationForClaimReopening>>(_preAuthMotivationForClaimReopenings.Where(x => x.PreAuthId == preAuthorisation.PreAuthId).ToList());

                    preAuthorisation.PreAuthNumber = await GetMaskedPreAuthNumber(preAuthorisation.PreAuthNumber, preAuthorisation.PreAuthStatus);
                    preAuthorisation.PreAuthorisationBreakdowns = Mapper.Map<List<PreAuthorisationBreakdown>>(_preAuthorisationBreakdownRepository.Where(x => x.PreAuthId == preAuthorisation.PreAuthId).ToList());
                    foreach (PreAuthorisationBreakdown preAuthorisationBreakdown in preAuthorisation.PreAuthorisationBreakdowns)
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
                                preAuthorisationBreakdown.LevelOfCare.Add(new PreAuthLevelOfCare
                                {
                                    TariffCode = itemCode,
                                    PreAuthLevelOfCareId = preAuthLevelOfCare.FirstOrDefault()?.PreAuthLevelOfCareId ?? 0,
                                    PreAuthBreakdownId = preAuthLevelOfCare.FirstOrDefault()?.PreAuthBreakdownId ?? 0,
                                    LevelOfCareId = levelOfCareId,
                                    LevelOfCare = levelOfCare.Description,
                                    DateTimeAdmitted = preAuthLevelOfCare.FirstOrDefault()?.DateTimeAdmitted ?? default,
                                    DateTimeDischarged = preAuthLevelOfCare.FirstOrDefault()?.DateTimeDischarged ?? default,
                                    LengthOfStay = preAuthLevelOfCare.FirstOrDefault()?.LengthOfStay ?? 0
                                });
                            }
                        }
                    }


                    var preAuthIcd10Codes = await (
                        from icd in _icd10CodesRepository
                        join icddesc in _icd10CodeRepositary on icd.Icd10CodeId equals icddesc.Icd10CodeId
                        where icd.PreAuthId == preAuthorisation.PreAuthId
                        && !icd.IsDeleted
                        select new PreAuthIcd10Code
                        {
                            PreAuthIcd10CodeId = icd.PreAuthIcd10CodeId,
                            PreAuthId = icd.PreAuthId,
                            Icd10Code = icd.Icd10Code,
                            Icd10CodeId = icd.Icd10CodeId,
                            BodySideId = icd.BodySideId,
                            IsMatching = icd.IsMatching,
                            IsAuthorised = icd.IsAuthorised,
                            InjuryType = icd.InjuryType,
                            RequesterType = icd.RequesterType,
                            IsClinicalUpdate = icd.IsClinicalUpdate,
                            UpdateSequenceNo = icd.UpdateSequenceNo,
                            ClinicalUpdateId = icd.ClinicalUpdateId,
                            Description = icddesc.Icd10CodeDescription,
                            CreatedBy = icddesc.CreatedBy,
                            ModifiedBy = icddesc.ModifiedBy
                        }).Distinct().ToListAsync();

                    preAuthorisation.PreAuthIcd10Codes = preAuthIcd10Codes;
                    preAuthorisation.ChronicMedicationFormRenewals = Mapper.Map<List<ChronicMedicationFormRenewal>>(_preAuthchronicMedicationFormRenewalRepository.Where(x => x.PreAuthId == preAuthorisation.PreAuthId).ToList());
                    preAuthorisation.ChronicMedicationForms = Mapper.Map<List<ChronicMedicationForm>>(_preAuthchronicMedicationFormRepository.Where(x => x.PreAuthId == preAuthorisation.PreAuthId).ToList());
                    if (preAuthorisation.ChronicMedicationForms != null && preAuthorisation.ChronicMedicationForms.Count > 0)
                    {
                        foreach (var medicationForm in preAuthorisation.ChronicMedicationForms)
                        {
                            var chronicMedicalHistory = Mapper.Map<List<ChronicMedicationHistory>>(_chronicMedicalHistoryRepository.Where(x => x.ChronicMedicationFormId == medicationForm.ChronicMedicationFormId).ToList());
                            medicationForm.ChronicMedicalHistories = chronicMedicalHistory;
                            var chronicScriptMedicine = Mapper.Map<List<ChronicScriptMedicine>>(_chronicScriptMedicineRepository.Where(x => x.ChronicMedicationFormId == medicationForm.ChronicMedicationFormId).ToList());
                            medicationForm.ChronicScriptMedicines = chronicScriptMedicine;
                        }
                    }
                    if (preAuthorisation.ChronicMedicationFormRenewals != null && preAuthorisation.ChronicMedicationFormRenewals.Count > 0)
                    {
                        foreach (var medicationFormRenewal in preAuthorisation.ChronicMedicationFormRenewals)
                        {
                            var chronicScriptMedicalRenewals = Mapper.Map<List<ChronicScriptMedicineRenewal>>(_chronicScriptMedicineRenewalRepository.Where(x => x.ChronicMedicationFormRenewalId == medicationFormRenewal.ChronicMedicationFormRenewalId).ToList());
                            medicationFormRenewal.ChronicScriptMedicineRenewals = chronicScriptMedicalRenewals;

                        }
                    }

                    preAuthorisation.PreAuthActivities = Mapper.Map<List<PreAuthActivity>>(_preAuthActivitiesRepository.Where(x => x.PreAuthId == preAuthorisation.PreAuthId).ToList());
                    preAuthorisation.PreAuthTreatmentBaskets = Mapper.Map<List<PreAuthTreatmentBasket>>(_preAuthTreatmentBasketsRepository.Where(x => x.PreAuthId == preAuthorisation.PreAuthId).ToList());
                    preAuthorisation.SubPreAuthorisations = Mapper.Map<List<PreAuthorisation>>(_preAuthorisationRepository.Where(x => x.HospitalAuthId == preAuthorisation.PreAuthId).ToList());
                    if (preAuthorisation.SubPreAuthorisations != null)
                    {
                        foreach (var subpreAuthorisation in preAuthorisation.SubPreAuthorisations)
                        {
                            subpreAuthorisation.PreAuthorisationBreakdowns = Mapper.Map<List<PreAuthorisationBreakdown>>(_preAuthorisationBreakdownRepository.Where(x => x.PreAuthId == subpreAuthorisation.PreAuthId).ToList());
                            foreach (PreAuthorisationBreakdown preAuthorisationBreakdown in subpreAuthorisation.PreAuthorisationBreakdowns)
                            {
                                var tariffCodes = _tariffRepository.FirstOrDefault(x => x.TariffId == preAuthorisationBreakdown.TariffId);
                                preAuthorisationBreakdown.TariffCode = tariffCodes?.ItemCode ?? "";
                                var medicalItem = (tariffCodes?.MedicalItemId > 0) ? _medicalItemRepository.FirstOrDefault(x => x.MedicalItemId == tariffCodes.MedicalItemId) : null;
                                if (medicalItem != null)
                                    preAuthorisationBreakdown.TariffDescription = medicalItem.Description;
                                if (preAuthorisationBreakdown.TreatmentCodeId > 0)
                                {
                                    var treatmentCodes = _treatmentCodeRepository.First(x => x.TreatmentCodeId == preAuthorisationBreakdown.TreatmentCodeId);
                                    preAuthorisationBreakdown.TreatmentCode = treatmentCodes.Code;
                                    preAuthorisationBreakdown.TreatmentCodeDescription = treatmentCodes.Description;
                                }
                            }
                            subpreAuthorisation.PreAuthIcd10Codes = Mapper.Map<List<PreAuthIcd10Code>>(_icd10CodesRepository.Where(x => x.PreAuthId == subpreAuthorisation.PreAuthId).ToList());
                            subpreAuthorisation.PreAuthActivities = Mapper.Map<List<PreAuthActivity>>(_preAuthActivitiesRepository.Where(x => x.PreAuthId == subpreAuthorisation.PreAuthId).ToList());
                            //Mask PreAuthNumber if Status other than Authorised for SubPreAuthorisations also
                            subpreAuthorisation.PreAuthNumber = await GetMaskedPreAuthNumber(subpreAuthorisation.PreAuthNumber, subpreAuthorisation.PreAuthStatus);
                        }
                    }
                }
                
                _preAuthorisationRepository.EnableFilter(SoftDeleteFilter);
            }
            return preAuthorisation;
        }

        public async Task<List<string>> CheckPreAuthValidations(PreAuthorisation preAuth)
        {
            var validationResult = new List<string>();

            if (preAuth != null)
            {
                if (preAuth.PreAuthorisationBreakdowns != null)
                {
                    if (preAuth.PreAuthorisationBreakdowns.Count == 0)
                    {
                        validationResult.Add("Please capture at least one line item.");
                    }
                }
                if (preAuth.PreAuthIcd10Codes != null)
                {
                    if (preAuth.PreAuthIcd10Codes.Count == 0)
                    {
                        validationResult.Add("Please capture at least one ICD10 code.");
                    }
                }
            }

            return validationResult;
        }

        public async Task<PreAuthorisationBreakdown> CreateNewPreAuthBreakdownItemWithLevelOfCare(PreAuthorisation preAuthorisation, PreAuthorisationBreakdown lineItem)
        {
            Contract.Requires(preAuthorisation != null);
            Contract.Requires(lineItem != null);
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
            return Mapper.Map<PreAuthorisationBreakdown>(newBreakdownItem);
        }
        public async Task<string> GetMaskedPreAuthNumber(string unmaskedPreAuthNumber, PreAuthStatusEnum? preAuthStatusId)
        {
            string maskedPreAuthNumber = Regex.Replace(unmaskedPreAuthNumber, MediCareConstants.RegexCheckMaskedPreAuthNumber, "X");
            return (preAuthStatusId != PreAuthStatusEnum.Authorised) ? maskedPreAuthNumber : unmaskedPreAuthNumber;
        }

        private static string UserSlaHours(TimeSpan? userSla)
        {
            if (!userSla.HasValue)
            {
                userSla = TimeSpan.Zero;
            }

            return $"{userSla.GetValueOrDefault().Days:D2} days,{userSla.GetValueOrDefault().Hours:D2} hrs,{userSla.GetValueOrDefault().Minutes:D2} mins";
        }

        public async Task<List<PreAuthBreakdownUnderAssessReason>> BuildPreAuthBreakdownUnderAssessReasonList(PreAuthorisation preAuthorisation)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                List<PreAuthBreakdownUnderAssessReason> preAuthBreakdownUnderAssessReasonList = new List<PreAuthBreakdownUnderAssessReason> { };
                foreach (var breakdownItem in preAuthorisation?.PreAuthorisationBreakdowns)
                {
                    if (breakdownItem?.PreAuthBreakdownUnderAssessReasons != null)
                    {
                        foreach (var underAssessReasons in breakdownItem.PreAuthBreakdownUnderAssessReasons)
                        {
                            preAuthBreakdownUnderAssessReasonList.Add(underAssessReasons);
                        }
                    }
                }
                return preAuthBreakdownUnderAssessReasonList;
            }
        }

        public async Task<PreAuthorisation> GetPreAuthorisation(string preAuthNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var preAuth = await _preAuthorisationRepository.Where(p => p.PreAuthNumber == preAuthNumber && p.PreAuthStatus == PreAuthStatusEnum.Authorised).FirstOrDefaultAsync();
                return Mapper.Map<PreAuthorisation>(preAuth);
            }
        }

        public async Task<List<WorkPool>> ProcessMedicalBusinessResult(List<WorkPool> workPoolList)
        {
            Contract.Requires(workPoolList != null);
            List<WorkPool> result = new List<WorkPool>();
            //User SLA
            var tUserSla = new TimeSpan(0, 3, 0, 0);
            var tUserSlaAmber = new TimeSpan(0, 8, 0, 0);
            var nUserSla = -2;

            foreach (var item in workPoolList)
            {
                //Additional result data to be added below                
                item.ReferenceNumber = await GetMaskedPreAuthNumber(item.ReferenceNumber, item.PreAuthStatus);

                if (item.UserSLA.HasValue)
                {
                    nUserSla = TimeSpan.Compare(item.UserSLA.GetValueOrDefault(), tUserSla);
                    if (nUserSla == (int)PreAuthSLACompareEnum.RedSla)
                    {
                        var nUserSlaAmber = TimeSpan.Compare(item.UserSLA.GetValueOrDefault(), tUserSlaAmber);

                        if (nUserSlaAmber == (int)PreAuthSLACompareEnum.GreenSla || nUserSlaAmber == (int)PreAuthSLACompareEnum.AmberSla)
                        {
                            nUserSla = (int)PreAuthSLACompareEnum.GreenSlaDefault;
                        }
                    }

                    item.UserSLAHours = UserSlaHours(item.UserSLA);
                }
                else
                {
                    item.UserSLAHours = UserSlaHours(item.UserSLA);
                }

                item.NUserSLA = nUserSla;

                result.Add(item);
            }
            return result;
        }

        public async Task<int> SavePreAuthBreakdownUnderAssessReason(List<PreAuthBreakdownUnderAssessReason> preAuthBreakdownUnderAssessReason, bool checkOnEditPreauth)
        {
            Contract.Requires(preAuthBreakdownUnderAssessReason != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                int lastID = 0;
                foreach (var underAssessReason in preAuthBreakdownUnderAssessReason)
                {
                    var existingLineUnderAssessReasons = new List<PreAuthBreakdownUnderAssessReason> { };
                    if (checkOnEditPreauth)
                    {
                        existingLineUnderAssessReasons = await _preAuthBreakdownUnderAssessReasonService.GetPreAuthBreakdownUnderAssessReasonByPreAuthBreakdownId(underAssessReason.PreAuthBreakdownId);
                    }

                    if (existingLineUnderAssessReasons.Where(x => x.UnderAssessReasonId == underAssessReason.UnderAssessReasonId && x.PreAuthBreakdownId == underAssessReason.PreAuthBreakdownId).ToList().Count == 0 && underAssessReason.PreAuthBreakdownId > 0)
                    {
                        lastID = await _preAuthBreakdownUnderAssessReasonService.AddPreAuthBreakdownUnderAssessReason(underAssessReason);
                    }
                }
                return lastID;
            }
        }
    }
}
