using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.MediCare.Constants;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class PreAuthInvoiceFacade : RemotingStatelessService, IPreAuthInvoiceService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<medical_PreAuthorisation> _preAuthorisationRepository;
        private readonly IRepository<medical_PreAuthorisationBreakdown> _preAuthorisationBreakdownRepository;
        private readonly IRepository<medical_HealthCareProvider> _healthCareProviderRepository;
        private readonly IRepository<medical_PreAuthTreatmentBasket> _preAuthTreatmentBasketsRepository;
        private readonly IRepository<medical_PreAuthIcd10Code> _icd10CodesRepository;
        private readonly IRepository<medical_PreAuthActivity> _preAuthActivitiesRepository;
        private readonly IRepository<medical_PreAuthRejectReason> _preAuthRejectReasonRepository;
        private readonly IRepository<medical_Tariff> _tariffRepository;
        private readonly IRepository<medical_TreatmentCode> _treatmentCodeRepository;
        private readonly IRepository<medical_MedicalItem> _medicalItemRepository;
        private readonly IRepository<medical_PreAuthLevelOfCare> _preAuthLevelOfCareRepository;
        private readonly IRepository<medical_LevelOfCare> _levelOfCareRepository;
        private readonly IUserService _userService;
        private readonly IRepository<medical_Icd10Code> _icd10CodeRepositary;


        public PreAuthInvoiceFacade(StatelessServiceContext context
            , IUserService userService
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<medical_PreAuthorisation> preAuthorisationRepository
            , IRepository<medical_PreAuthorisationBreakdown> preAuthorisationBreakdownRepository
            , IRepository<medical_HealthCareProvider> healthCareProviderRepository
            , IRepository<medical_PreAuthTreatmentBasket> preAuthTreatmentBasketsRepository
            , IRepository<medical_PreAuthIcd10Code> icd10CodesRepository
            , IRepository<medical_PreAuthActivity> preAuthActivitiesRepository
            , IRepository<medical_PreAuthRejectReason> preAuthRejectReasonRepository
            , IRepository<medical_Tariff> tariffRepository
            , IRepository<medical_TreatmentCode> treatmentCodeRepository
            , IRepository<medical_MedicalItem> medicalItemRepository
            , IRepository<medical_PreAuthLevelOfCare> preAuthLevelOfCareRepository
            , IRepository<medical_LevelOfCare> levelOfCareRepository
            , IRepository<medical_Icd10Code> icd10CodeRepositary
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
            _preAuthRejectReasonRepository = preAuthRejectReasonRepository;
            _tariffRepository = tariffRepository;
            _treatmentCodeRepository = treatmentCodeRepository;
            _medicalItemRepository = medicalItemRepository;
            _preAuthLevelOfCareRepository = preAuthLevelOfCareRepository;
            _levelOfCareRepository = levelOfCareRepository;
            _icd10CodeRepositary = icd10CodeRepositary;
        }

        public async Task<PreAuthorisation> GetMedicalInvoicePreAuthorisationById(int preAuthorisationId)
        {
            return await GetPreAuthDetails(string.Empty, preAuthorisationId);
        }

        private async Task<PreAuthorisation> GetPreAuthDetails(string preAuthNumber, int preAuthorisationId = 0)
        {
            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);
            var user = await _userService.GetUserByEmail(RmaIdentity.Email);
            var healthCareProviderId = 0;
            var isInternalUser = string.IsNullOrEmpty(RmaIdentity.Email) || (user != null && user.IsInternalUser);
            if (!isInternalUser)
            {
                var userHealthCareProviderDetails = await _userService.GetHealthCareProvidersLinkedToUser(RmaIdentity.Email);
                if (userHealthCareProviderDetails.Count > 0)
                {
                    healthCareProviderId = userHealthCareProviderDetails.First().HealthCareProviderId;
                }
            }

            PreAuthorisation preAuthorisation;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                preAuthorisation = Mapper.Map<PreAuthorisation>(await (
                        from pa in _preAuthorisationRepository
                        join hcp in _healthCareProviderRepository on pa.HealthCareProviderId equals hcp.RolePlayerId
                        where (preAuthorisationId == 0 || pa.PreAuthId == preAuthorisationId)
                              && (string.IsNullOrEmpty(preAuthNumber) || pa.PreAuthNumber.Equals(preAuthNumber))
                              && (isInternalUser || (pa.HealthCareProviderId == healthCareProviderId || pa.CreatedBy.Equals(RmaIdentity.Email)))
                        select pa
                    ).Distinct().FirstOrDefaultAsync()
                //If no PreAuths are returned, use HospitalAuthId for Treating Doctor Auth as search criteria
                ) ?? Mapper.Map<PreAuthorisation>(await (
                        from pa in _preAuthorisationRepository
                        join hcp in _healthCareProviderRepository on pa.HealthCareProviderId equals hcp.RolePlayerId
                        where (preAuthorisationId == 0 || pa.HospitalAuthId == preAuthorisationId)
                            && (string.IsNullOrEmpty(preAuthNumber) || pa.PreAuthNumber.Equals(preAuthNumber))
                            && isInternalUser || pa.HealthCareProviderId == healthCareProviderId || pa.CreatedBy.Equals(RmaIdentity.Email)
                        select pa
                    ).Distinct().FirstOrDefaultAsync()
                );

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
                    preAuthorisation.PreAuthNumber = GetMaskedPreAuthNumber(preAuthorisation.PreAuthNumber, preAuthorisation.PreAuthStatus);
                    preAuthorisation.PreAuthorisationBreakdowns = Mapper.Map<List<PreAuthorisationBreakdown>>(_preAuthorisationBreakdownRepository.Where(x => x.PreAuthId == preAuthorisation.PreAuthId).ToList());
                    foreach (PreAuthorisationBreakdown preAuthorisationBreakdown in preAuthorisation.PreAuthorisationBreakdowns)
                    {
                        string itemCode = string.Empty;
                        if (preAuthorisationBreakdown.TariffId > 0)
                        {
                            var tariffCodes = _tariffRepository.FirstOrDefault(x => x.TariffId == preAuthorisationBreakdown.TariffId);
                            itemCode = tariffCodes?.ItemCode;
                            preAuthorisationBreakdown.TariffCode = tariffCodes?.ItemCode;
                            var medicalItem = _medicalItemRepository.FirstOrDefault(x => x.MedicalItemId == tariffCodes.MedicalItemId);
                            preAuthorisationBreakdown.TariffDescription = medicalItem?.Description;
                        }
                        if (preAuthorisationBreakdown.TreatmentCodeId > 0)
                        {
                            var treatmentCodes = _treatmentCodeRepository.FirstOrDefault(x => x.TreatmentCodeId == preAuthorisationBreakdown.TreatmentCodeId);
                            preAuthorisationBreakdown.TreatmentCode = treatmentCodes?.Code;
                            preAuthorisationBreakdown.TreatmentCodeDescription = treatmentCodes?.Description;
                        }

                        var preAuthLevelOfCare = _preAuthLevelOfCareRepository.Where(x => x.PreAuthBreakdownId == preAuthorisationBreakdown.PreAuthBreakdownId).ToList();
                        if (preAuthLevelOfCare != null && preAuthLevelOfCare.Count > 0)
                        {
                            var levelOfCareId = preAuthLevelOfCare.FirstOrDefault()?.LevelOfCareId ?? 0;
                            if (levelOfCareId > 0)
                            {
                                var levelOfCare = _levelOfCareRepository.FirstOrDefault(x => x.Id == levelOfCareId);
                                preAuthorisationBreakdown.LevelOfCare.Add(new PreAuthLevelOfCare
                                {
                                    TariffCode = itemCode,
                                    PreAuthLevelOfCareId = preAuthLevelOfCare.FirstOrDefault()?.PreAuthLevelOfCareId ?? 0,
                                    PreAuthBreakdownId = preAuthLevelOfCare.FirstOrDefault()?.PreAuthBreakdownId ?? 0,
                                    LevelOfCareId = levelOfCareId,
                                    LevelOfCare = levelOfCare?.Description,
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

                    preAuthorisation.PreAuthActivities = Mapper.Map<List<PreAuthActivity>>(_preAuthActivitiesRepository.Where(x => x.PreAuthId == preAuthorisation.PreAuthId).ToList());
                    preAuthorisation.PreAuthTreatmentBaskets = Mapper.Map<List<PreAuthTreatmentBasket>>(_preAuthTreatmentBasketsRepository.Where(x => x.PreAuthId == preAuthorisation.PreAuthId).ToList());
                    preAuthorisation.SubPreAuthorisations = Mapper.Map<List<PreAuthorisation>>(_preAuthorisationRepository.Where(x => x.HospitalAuthId == preAuthorisation.PreAuthId).ToList());
                    if (preAuthorisation.SubPreAuthorisations != null)
                    {
                        foreach (PreAuthorisation subpreAuthorisation in preAuthorisation.SubPreAuthorisations)
                        {
                            subpreAuthorisation.PreAuthorisationBreakdowns = Mapper.Map<List<PreAuthorisationBreakdown>>(_preAuthorisationBreakdownRepository.Where(x => x.PreAuthId == subpreAuthorisation.PreAuthId).ToList());
                            foreach (PreAuthorisationBreakdown preAuthorisationBreakdown in subpreAuthorisation.PreAuthorisationBreakdowns)
                            {
                                var tariffCodes = _tariffRepository.FirstOrDefault(x => x.TariffId == preAuthorisationBreakdown.TariffId);
                                preAuthorisationBreakdown.TariffCode = tariffCodes.ItemCode;
                                var medicalItem = _medicalItemRepository.FirstOrDefault(x => x.MedicalItemId == tariffCodes.MedicalItemId);
                                preAuthorisationBreakdown.TariffDescription = medicalItem.Description;
                                if (preAuthorisationBreakdown.TreatmentCodeId > 0)
                                {
                                    var treatmentCodes = _treatmentCodeRepository.FirstOrDefault(x => x.TreatmentCodeId == preAuthorisationBreakdown.TreatmentCodeId);
                                    preAuthorisationBreakdown.TreatmentCode = treatmentCodes?.Code;
                                    preAuthorisationBreakdown.TreatmentCodeDescription = treatmentCodes?.Description;
                                }
                            }
                            subpreAuthorisation.PreAuthIcd10Codes = Mapper.Map<List<PreAuthIcd10Code>>(_icd10CodesRepository.Where(x => x.PreAuthId == subpreAuthorisation.PreAuthId).ToList());
                            subpreAuthorisation.PreAuthActivities = Mapper.Map<List<PreAuthActivity>>(_preAuthActivitiesRepository.Where(x => x.PreAuthId == subpreAuthorisation.PreAuthId).ToList());
                            //Mask PreAuthNumber if Status other than Authorised for SubPreAuthorisations also
                            subpreAuthorisation.PreAuthNumber = GetMaskedPreAuthNumber(subpreAuthorisation.PreAuthNumber, subpreAuthorisation.PreAuthStatus);
                        }
                    }
                }
            }
            return preAuthorisation;
        }

        private string GetMaskedPreAuthNumber(string unmaskedPreAuthNumber, PreAuthStatusEnum? preAuthStatusId)
        {
            string maskedPreAuthNumber = Regex.Replace(unmaskedPreAuthNumber, MediCareConstants.RegexCheckMaskedPreAuthNumber, "X");
            return (preAuthStatusId != PreAuthStatusEnum.Authorised) ? maskedPreAuthNumber : unmaskedPreAuthNumber;
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

    }
}
