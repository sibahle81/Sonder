using AutoMapper;
using Newtonsoft.Json;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;
using RMA.Service.MediCare.Constants;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Constants;
using RMA.Service.MediCare.Database.Entities;

using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Fabric;
using System.Linq;
using System.Linq.Dynamic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    /// <summary>
    /// An instance of this class is created for each service instance by the Service Fabric runtime.
    /// </summary>
    public class MediCareFacade : RemotingStatelessService, IMediCareService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<medical_Tariff> _tariffRepository;
        private readonly IRepository<medical_TariffType> _tariffTypeRepository;
        private readonly IRepository<medical_TreatmentCode> _treatmentCodeRepository;
        private readonly IRepository<medical_MedicalItem> _medicalItemRepository;
        private readonly IRepository<medical_TariffBaseUnitCost> _tariffBaseUnitCostRepository;
        private readonly IRepository<medical_Icd10Code> _icd10CodeRepository;
        private readonly IRepository<medical_TreatmentBasket> _treatmentBasketRepository;
        private readonly IRepository<medical_TreatmentBasketInjury> _treatmentBasketInjuryRepository;
        private readonly IRepository<medical_LevelOfCare> _medicalLevelOfCare;
        private readonly IRepository<medical_ChronicMedicationList> _medicalChronicMedicationList;
        private readonly IRepository<medical_MedicalItemTreatmentCode> _medicalItemTreatmentCode;
        private readonly IRepository<medical_TreatmentPlan> _treatmentPlanRepository;
        private readonly IRepository<medical_TreatmentProtocol> _treatmentProtocolRepository;
        private readonly IRepository<medical_AdmissionCode> _admissionCodeRepository;
        private readonly IRepository<medical_PractitionerType> _practitionerTypeRepository;
        private readonly IRepository<medical_PreAuthCodeLimit> _preAuthCodeLimits;
        private readonly IRepository<medical_HealthCareProvider> _healthCareProviderRepository;
        private readonly IRepository<medical_PreAuthorisation> _preAuthorisationRepository;
        private readonly IRepository<medical_PreAuthorisationBreakdown> _preAuthorisationBreakdownRepository;
        private readonly IRepository<medical_MutualInclusiveExclusiveCode> _mutualInclusiveExclusiveCodeRepository;
        private readonly IRuleService _ruleService;
        private readonly IRepository<medical_Workflow> _medicalWorkflowRepository;
        private readonly IRepository<medical_Modifier> _modifierRepository;
        private readonly IRepository<medical_Service> _serviceRepository;
        private readonly IRepository<medical_ClinicVenue> _clinicVenueRepository;
        private readonly IRepository<medical_TariffBaseGazettedUnitCost> _tariffBaseGazettedUnitCost;

        public MediCareFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<medical_Tariff> tariffRepository
            , IRepository<medical_TariffType> tariffTypeRepository
            , IRepository<medical_TreatmentCode> treatmentCodeRepository
            , IRepository<medical_MedicalItem> medicalItemRepository
            , IRepository<medical_TariffBaseUnitCost> tariffBaseUnitCostRepository
            , IRepository<medical_Icd10Code> icd10CodeRepository
            , IRepository<medical_TreatmentBasket> treatmentBasketRepository
            , IRepository<medical_TreatmentBasketInjury> treatmentBasketInjuryRepository
            , IRepository<medical_LevelOfCare> medicalLevelOfCare
            , IRepository<medical_MedicalItemTreatmentCode> medicalItemTreatmentCode
            , IRepository<medical_TreatmentPlan> treatmentPlanRepository
            , IRepository<medical_TreatmentProtocol> treatmentProtocolRepository
            , IRepository<medical_AdmissionCode> admissionCodeRepository
            , IRepository<medical_PractitionerType> practitionerTypeRepository
            , IRepository<medical_PreAuthCodeLimit> preAuthCodeLimits
            , IRepository<medical_PreAuthorisation> preAuthorisationRepository
            , IRepository<medical_HealthCareProvider> healthCareProviderRepository
            , IRepository<medical_PreAuthorisationBreakdown> preAuthorisationBreakdownRepository
            , IRepository<medical_MutualInclusiveExclusiveCode> mutualInclusiveExclusiveCodeRepository
            , IRepository<medical_ChronicMedicationList> medicalChronicMedicationList
            , IRuleService ruleService
            , IRepository<medical_Workflow> medicalWorkflowRepository
            , IRepository<medical_Modifier> modifierRepository
            , IRepository<medical_Service> serviceRepository
            , IRepository<medical_ClinicVenue> clinicVenueRepository
            , IRepository<medical_TariffBaseGazettedUnitCost> tariffBaseGazettedUnitCost)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _tariffRepository = tariffRepository;
            _tariffTypeRepository = tariffTypeRepository;
            _treatmentCodeRepository = treatmentCodeRepository;
            _medicalItemRepository = medicalItemRepository;
            _tariffBaseUnitCostRepository = tariffBaseUnitCostRepository;
            _icd10CodeRepository = icd10CodeRepository;
            _treatmentBasketRepository = treatmentBasketRepository;
            _treatmentBasketInjuryRepository = treatmentBasketInjuryRepository;
            _medicalLevelOfCare = medicalLevelOfCare;
            _medicalItemTreatmentCode = medicalItemTreatmentCode;
            _treatmentPlanRepository = treatmentPlanRepository;
            _treatmentProtocolRepository = treatmentProtocolRepository;
            _admissionCodeRepository = admissionCodeRepository;
            _practitionerTypeRepository = practitionerTypeRepository;
            _preAuthCodeLimits = preAuthCodeLimits;
            _preAuthorisationRepository = preAuthorisationRepository;
            _preAuthorisationBreakdownRepository = preAuthorisationBreakdownRepository;
            _healthCareProviderRepository = healthCareProviderRepository;
            _mutualInclusiveExclusiveCodeRepository = mutualInclusiveExclusiveCodeRepository;
            _ruleService = ruleService;
            _medicalWorkflowRepository = medicalWorkflowRepository;
            _medicalChronicMedicationList = medicalChronicMedicationList;
            _modifierRepository = modifierRepository;
            _serviceRepository = serviceRepository;
            _clinicVenueRepository = clinicVenueRepository;
            _tariffBaseGazettedUnitCost = tariffBaseGazettedUnitCost;
        }

        public async Task<TreatmentBasket> GetTreatmentBasketForICD10CodeId(int icd10CodeId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _treatmentBasketInjuryRepository.FirstOrDefaultAsync(x => x.Icd10CodeId == icd10CodeId);
                if (entity != null)
                {
                    await _treatmentBasketInjuryRepository.LoadAsync(entity, x => x.TreatmentBasket);
                }
                return Mapper.Map<TreatmentBasket>(entity);
            }
        }

        public async Task<List<LevelOfCare>> GetLevelOfCare()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await _medicalLevelOfCare.Select(x => new LevelOfCare()
                {
                    Name = x.Name,
                    Id = x.Id,
                    LevelOfCareId = x.Id
                }).ToListAsync();
            }
        }

        public async Task<List<ChronicMedicationList>> GetChronicMedicationList()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await _medicalChronicMedicationList.Select(x => new ChronicMedicationList()
                {
                    Name = x.Name,
                    CmlId = x.CmlId,
                    Description = x.Description
                }).ToListAsync();
            }
        }

        public async Task<List<TreatmentBasket>> GetTreatmentBaskets()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var query = (from x in _treatmentBasketInjuryRepository
                             join y in _icd10CodeRepository on x.Icd10CodeId equals y.Icd10CodeId
                             join z in _treatmentBasketRepository on x.TreatmentBasketId equals z.TreatmentBasketId
                             select new { z.TreatmentBasketId, y.Icd10Code, z.Description }).Distinct();

                var result = await query.Select(x => new TreatmentBasket()
                {
                    TreatmentBasketId = x.TreatmentBasketId,
                    Icd10Code = x.Icd10Code,
                    Description = x.Description
                })
                .ToListAsync();

                return result;
            }
        }

        public async Task<TariffSearch> SearchTariff(string tariffCode, string tariffTypeIds, int practitionerTypeId, DateTime tariffDate)
        {
            List<int> tariffTypes = tariffTypeIds?.Split(',').Select(int.Parse).ToList();

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var tariff = await _tariffRepository.FirstOrDefaultAsync(t => t.ItemCode == tariffCode && tariffTypes.Contains(t.TariffTypeId)
                                                                        && (t.PractitionerType == PractitionerTypeEnum.UnknownAnyType || t.PractitionerType == (PractitionerTypeEnum)practitionerTypeId) && t.ValidFrom <= tariffDate && t.ValidTo >= tariffDate);

                if (tariff != null)
                {
                    var medicalItem = await _medicalItemRepository.FirstOrDefaultAsync(mi => mi.MedicalItemId == tariff.MedicalItemId);

                    var tariffBaseUnitCost = await _tariffBaseUnitCostRepository.FirstOrDefaultAsync(tbuc => tbuc.TariffBaseUnitCostId == tariff.TariffBaseUnitCostId);
                    await _tariffBaseUnitCostRepository.LoadAsync(tariffBaseUnitCost, x => x.TariffBaseGazettedUnitCosts);
                    var mappedTariffBaseUnitCost = Mapper.Map<TariffBaseUnitCost>(tariffBaseUnitCost);

                    var practitionerType = await _practitionerTypeRepository.FirstOrDefaultAsync(pt => pt.PractitionerTypeId == (int)tariff.PractitionerType);

                    bool isModifier = false;
                    if (medicalItem != null && medicalItem?.MedicalItemId > 0 && medicalItem.MedicalItemTypeId == MediCareConstants.MODIFIER_MEDICAL_ITEM_TYPE)
                    {
                        var modifier = await _modifierRepository.Where(x => x.Code == tariffCode && x.IsActive == true).FirstOrDefaultAsync();

                        if (modifier != null)
                            isModifier = true;
                    }

                    if (medicalItem != null && tariffBaseUnitCost != null)
                    {
                        return new TariffSearch
                        {
                            TariffId = tariff.TariffId,
                            TariffCode = tariff.ItemCode,
                            TariffTypeId = tariff.TariffTypeId,
                            MedicalItemId = tariff.MedicalItemId,
                            TariffDescription = medicalItem.Description,
                            DefaultQuantity = medicalItem.DefaultQuantity,
                            TariffAmount = tariff.RecommendedUnits * tariffBaseUnitCost.UnitPrice,
                            PractitionerTypeId = (int)tariff.PractitionerType,
                            TariffDate = tariffDate,
                            PractitionerType = practitionerType.Name,
                            TariffBaseUnitCostTypeId = Convert.ToInt32(tariffBaseUnitCost.TariffBaseUnitCostTypeId),
                            PublicationId = tariffBaseUnitCost.PublicationId,
                            IsModifier = isModifier,
                            TariffBaseUnitCostId = mappedTariffBaseUnitCost.TariffBaseUnitCostId,
                            TariffBaseUnitCost = mappedTariffBaseUnitCost
                        };
                    }
                    else
                    {
                        return new TariffSearch();
                    }
                }
                else
                {
                    return new TariffSearch();
                }
            }
        }

        public async Task<List<TariffSearch>> GetTariffDetails(List<TariffSearch> tariffSearches)
        {
            var results = new List<TariffSearch>();

            if (tariffSearches == null || tariffSearches.Count == 0)
            {
                return results;
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                foreach (var item in tariffSearches)
                {
                    var result = await SearchTariff(item.TariffCode, item.TariffTypeId.ToString(), item.PractitionerTypeId, item.TariffDate);
                    if (result != null)
                    {
                        results.Add(result);
                    }
                }

                return results;
            }
        }

        public async Task<TariffSearchCriteria> GetTariff(int tariffId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var tariff = await _tariffRepository.FirstOrDefaultAsync(t => t.TariffId == tariffId);
                if (tariff != null)
                {
                    var medicalItem = await _medicalItemRepository.FirstOrDefaultAsync(mi => mi.MedicalItemId == tariff.MedicalItemId);

                    var tariffBaseUnitCost = await _tariffBaseUnitCostRepository.FirstOrDefaultAsync(tbuc => tbuc.TariffBaseUnitCostId == tariff.TariffBaseUnitCostId);
                    await _tariffBaseUnitCostRepository.LoadAsync(tariffBaseUnitCost, x => x.TariffBaseGazettedUnitCosts);
                    var mappedTariffBaseUnitCost = Mapper.Map<TariffBaseUnitCost>(tariffBaseUnitCost);

                    var practitionerType = await _practitionerTypeRepository.FirstOrDefaultAsync(pt => pt.PractitionerTypeId == (int)tariff.PractitionerType);

                    bool isModifier = false;
                    if (medicalItem != null && medicalItem?.MedicalItemId > 0 && medicalItem.MedicalItemTypeId == MediCareConstants.MODIFIER_MEDICAL_ITEM_TYPE)
                    {
                        var modifier = await _modifierRepository.Where(x => x.Code == tariff.ItemCode && x.IsActive == true).FirstOrDefaultAsync();

                        if (modifier != null)
                            isModifier = true;
                    }

                    if (medicalItem != null && tariffBaseUnitCost != null)
                    {
                        return new TariffSearchCriteria
                        {
                            TariffId = tariff.TariffId,
                            TariffCode = tariff.ItemCode,
                            TariffTypeId = tariff.TariffTypeId,
                            MedicalItemId = tariff.MedicalItemId,
                            ValidFrom = tariff.ValidFrom,
                            ValidTo = tariff.ValidTo,
                            TariffDescription = medicalItem.Description,
                            DefaultQuantity = medicalItem.DefaultQuantity,
                            TariffAmount = tariff.RecommendedUnits * tariffBaseUnitCost.UnitPrice,
                            PractitionerTypeId = (int)tariff.PractitionerType,
                            PractitionerType = practitionerType.Name,
                            ItemCost = medicalItem.DefaultQuantity * tariffBaseUnitCost?.UnitPrice,
                            BasicUnitCost = tariffBaseUnitCost?.UnitPrice,
                            RecomendedUnits = tariff.RecommendedUnits,
                            UnitType = tariffBaseUnitCost?.UnitType.ToString(),
                            TariffBaseUnitCost = mappedTariffBaseUnitCost
                        };
                    }
                    else
                    {
                        return new TariffSearchCriteria();
                    }
                }
                else
                {
                    return new TariffSearchCriteria();
                }
            }
        }

        public async Task<List<TariffSearch>> GetTariffByCode(string[] tariffCode)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var tariffs = await _tariffRepository.Where(t => tariffCode.Contains(t.ItemCode)).ToListAsync();
                var tariffSearches = Mapper.Map<List<TariffSearch>>(tariffs);

                foreach (var tariffSearch in tariffSearches)
                {
                    var tariffBaseUnitCost = await _tariffBaseUnitCostRepository.FirstOrDefaultAsync(tbuc => tbuc.TariffBaseUnitCostId == tariffSearch.TariffBaseUnitCostId);
                    await _tariffBaseUnitCostRepository.LoadAsync(tariffBaseUnitCost, x => x.TariffBaseGazettedUnitCosts);
                    tariffSearch.TariffBaseUnitCost = Mapper.Map<TariffBaseUnitCost>(tariffBaseUnitCost);
                }

                return Mapper.Map<List<TariffSearch>>(tariffs);
            }
        }

        public async Task<List<TariffType>> GetTariffTypes()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await _tariffTypeRepository.Select(x => new TariffType()
                {
                    Name = x.Name,
                    Id = x.TariffTypeId,
                    Description = x.Description
                }).ToListAsync();
            }
        }

        public async Task<TariffSearch> CheckAndInsertTariff(string itemCode, int CompCareTariffId, int practitionerTypeId, DateTime serviceDate)
        {
            TariffSearch tariffDetail = new TariffSearch();
            using (_dbContextScopeFactory.Create())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("ItemCode", itemCode),
                    new SqlParameter("CCTariffId", CompCareTariffId),
                    new SqlParameter("PractitionerTypeId", practitionerTypeId),
                    new SqlParameter("ServiceDate", serviceDate)
                };

                try
                {
                    var tariff = await _tariffRepository.FirstOrDefaultAsync();
                    var tariffDetails = await _tariffRepository.SqlQueryAsync<TariffSearch>(DatabaseConstants.CheckAndInsertTariff, parameters);
                    if (tariffDetails?.Count > 0)
                    {
                        tariffDetail = tariffDetails[0];
                    }
                }
                catch (Exception ex)
                {
                    var tst = ex.Message;
                }
            }
            return tariffDetail;
        }


        public async Task<PagedRequestResult<TariffSearchCriteria>> SearchAllTariffs(PagedRequest request)
        {
            if (request == null) return new PagedRequestResult<TariffSearchCriteria>();
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                if (request?.OrderBy.ToLower() == "TariffId")
                {
                    request.OrderBy = "TariffId";
                }

                var tariffSearch = JsonConvert.DeserializeObject<TariffSearch>(request?.SearchCriteria);
                var tarrifCodes = _tariffRepository.AsQueryable();
                var tariffBaseUnitCostRepository = _tariffBaseUnitCostRepository.AsQueryable();
                var tariffBaseGazettedUnitCost = _tariffBaseGazettedUnitCost.AsQueryable();
                var medicalItem = _medicalItemRepository.AsQueryable();
                var practitionerType = _practitionerTypeRepository.AsQueryable();
                var tariffType = _tariffTypeRepository.AsQueryable();

                if (!string.IsNullOrEmpty(tariffSearch.TariffCode))
                {
                    tarrifCodes.Where(t => t.ItemCode == tariffSearch.TariffCode);
                }

                if (tariffSearch.TariffTypeId > 0)
                {
                    tarrifCodes.Where(t => t.TariffTypeId == tariffSearch.TariffTypeId);
                    tariffType.Where(tt => tt.TariffTypeId == tariffSearch.TariffTypeId);
                }

                if (tariffSearch.PractitionerTypeId > 0)
                {
                    tarrifCodes.Where(t => t.PractitionerType == (PractitionerTypeEnum)tariffSearch.PractitionerTypeId);
                    practitionerType.Where(p => p.PractitionerTypeId == tariffSearch.PractitionerTypeId);
                }

                if (!string.IsNullOrEmpty(tariffSearch.TariffDescription))
                {
                    medicalItem.Where(m => m.Description == tariffSearch.TariffDescription || m.Description.Contains(tariffSearch.TariffDescription));
                }

                if (tariffSearch.TariffDate != DateTime.MinValue)
                {
                    tariffBaseGazettedUnitCost.Where(bgu => bgu.EffectiveFrom <= tariffSearch.TariffDate && (bgu.EffectiveTo ?? DateTime.MaxValue) >= tariffSearch.TariffDate);
                }
                else
                {
                    await _tariffBaseUnitCostRepository.LoadAsync(tariffBaseUnitCostRepository, x => x.TariffBaseGazettedUnitCosts);
                }
                var mappedTariffBaseUnitCost = Mapper.Map<TariffBaseUnitCost>(tariffBaseUnitCostRepository);

                //If date is included, use the new GazettedTarrifs if it exists, otherwise use what we have.
                if (_tariffBaseGazettedUnitCost.Any() && tariffSearch.TariffDate != DateTime.MinValue) 
                {

                    var tariffCodesSearch = await (
                        from t in tarrifCodes
                        join mi in medicalItem on t.MedicalItemId equals mi.MedicalItemId
                        join tbuc in tariffBaseUnitCostRepository on t.TariffBaseUnitCostId equals tbuc.TariffBaseUnitCostId
                        join tbguc in tariffBaseGazettedUnitCost on t.TariffBaseUnitCostId equals tbguc.TariffBaseUnitCostId
                        join tt in tariffType on t.TariffTypeId equals tt.TariffTypeId
                        join pt in practitionerType on (int)t.PractitionerType equals pt.PractitionerTypeId
                        select new TariffSearchCriteria
                        {
                            TariffId = t.TariffId,
                            TariffCode = t.ItemCode,
                            TariffTypeId = t.TariffTypeId,
                            TariffType = tt.Name,
                            TariffDescription = mi.Description,
                            ValidFrom = t.ValidFrom,
                            ValidTo = t.ValidTo,
                            ItemCost = mi.DefaultQuantity * tbguc.UnitPrice,
                            DefaultQuantity = mi.DefaultQuantity,
                            PractitionerType = pt.Name,
                            BasicUnitCost = tbguc.UnitPrice,
                            RecomendedUnits = t.RecommendedUnits,
                            UnitType = tbuc.UnitType.ToString(),
                            TariffBaseUnitCostTypeId = (tbuc.TariffBaseUnitCostTypeId ?? 0),
                            TariffBaseUnitCost = mappedTariffBaseUnitCost
                        }).ToPagedResult(request);

                    return tariffCodesSearch;
                }
                else
                {                    

                    var tariffCodesSearch = await (
                        from t in tarrifCodes
                        join mi in medicalItem on t.MedicalItemId equals mi.MedicalItemId
                        join tbuc in tariffBaseUnitCostRepository on t.TariffBaseUnitCostId equals tbuc.TariffBaseUnitCostId
                        join tt in tariffType on t.TariffTypeId equals tt.TariffTypeId
                        join pt in practitionerType on (int)t.PractitionerType equals pt.PractitionerTypeId

                        select new TariffSearchCriteria
                        {
                            TariffId = t.TariffId,
                            TariffCode = t.ItemCode,
                            TariffTypeId = t.TariffTypeId,
                            TariffType = tt.Name,
                            TariffDescription = mi.Description,
                            ValidFrom = t.ValidFrom,
                            ValidTo = t.ValidTo,
                            ItemCost = mi.DefaultQuantity * tbuc.UnitPrice,
                            DefaultQuantity = mi.DefaultQuantity,
                            PractitionerType = pt.Name,
                            BasicUnitCost = tbuc.UnitPrice,
                            RecomendedUnits = t.RecommendedUnits,
                            UnitType = tbuc.UnitType.ToString(),
                            TariffBaseUnitCostTypeId = (tbuc.TariffBaseUnitCostTypeId ?? 0),
                            TariffBaseUnitCost = mappedTariffBaseUnitCost
                        }).ToPagedResult(request);

                    return tariffCodesSearch;
                }
            }
        }


        public async Task<PagedRequestResult<TreatmentCode>> SearchTreatmentCodeDetails(PagedRequest treatmentCodeSearchString)
        {
            if (treatmentCodeSearchString == null) return new PagedRequestResult<TreatmentCode>();

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                if (treatmentCodeSearchString?.OrderBy.ToLower() == "TreatmentCodeId") treatmentCodeSearchString.OrderBy = "TreatmentCodeId";

                var TreatmentSearch = JsonConvert.DeserializeObject<TreatmentCode>(treatmentCodeSearchString?.SearchCriteria);

                TreatmentSearch.Code = TreatmentSearch.Code.TrimWithNull();
                TreatmentSearch.Description = TreatmentSearch.Description.TrimWithNull();

                if (TreatmentSearch.Code == null && TreatmentSearch.Description == null)
                    return new PagedRequestResult<TreatmentCode>();

                var query = _treatmentCodeRepository.Where(x => x.IsCpt == true && x.IsActive);

                if (!string.IsNullOrEmpty(TreatmentSearch.Code))
                {
                    query = query.Where(x => x.Code != null && x.Code.Contains(TreatmentSearch.Code));
                }

                if (!string.IsNullOrEmpty(TreatmentSearch.Description))
                {
                    query = query.Where(x => x.Description != null && x.Description.Contains(TreatmentSearch.Description));
                }

                var entities = await query.ToPagedResult(treatmentCodeSearchString);

                if (entities.Data.Count > 0)
                {
                    var returnResult = new PagedRequestResult<TreatmentCode>
                    {
                        Page = entities.Page,
                        PageCount = entities.PageCount,
                        RowCount = entities.RowCount,
                        PageSize = entities.PageSize,
                        Data = new List<TreatmentCode>()
                    };

                    var mappedTreatmentCodes = Mapper.Map<List<TreatmentCode>>(entities.Data);
                    foreach (var item in mappedTreatmentCodes)
                    {
                        returnResult.Data.Add(item);
                    }

                    return returnResult;
                }

            }
            return new PagedRequestResult<TreatmentCode>();
        }

        public async Task<PagedRequestResult<CrosswalkSearch>> SearchCrosswalk(PagedRequest request)
        {
            var crosswalkSearch = new PagedRequestResult<CrosswalkSearch>();
            if (request == null)
            {
                return crosswalkSearch;
            }

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var rplDetails = JsonConvert.DeserializeObject<CrosswalkSearch>(request?.SearchCriteria);

                var practitionerType = await _practitionerTypeRepository.Where(pt =>
                    (
                        pt.IsGp || pt.IsDentist || pt.IsAmbulance || pt.IsAnaesthetist || pt.IsSpecialist
                    ) && pt.IsHospital == false && pt.IsActive && pt.PractitionerTypeId == rplDetails.PractitionerTypeId).ToListAsync();

                if (practitionerType.Any())
                {
                    crosswalkSearch = await GetMappedCrosswalk(request);
                    if (crosswalkSearch.Data.Count <= 0)
                    {
                        crosswalkSearch = await GetNoMapCrosswalk(request);
                    }
                }
                else
                {
                    crosswalkSearch = await GetTreatmentCodes(request);
                }
            }
            return crosswalkSearch;
        }

        private async Task<PagedRequestResult<CrosswalkSearch>> GetMappedCrosswalk(PagedRequest request)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                if (string.Equals(request.OrderBy, "tariffid", StringComparison.OrdinalIgnoreCase))
                {
                    request.OrderBy = "TariffId";
                }
                var rplDetails = JsonConvert.DeserializeObject<CrosswalkSearch>(request.SearchCriteria);

                var tarrifCodes = _tariffRepository.AsQueryable();
                var tariffBaseGazettedUnitCost = _tariffBaseGazettedUnitCost.AsQueryable();
                var medicalItemTreatmentCode = _medicalItemTreatmentCode.AsQueryable();
                var treatmentCodes = _treatmentCodeRepository.AsQueryable();
                var medicalItem = _medicalItemRepository.AsQueryable();
                var tariffBaseUnitCost = _tariffBaseUnitCostRepository.AsQueryable();

                tarrifCodes = _tariffRepository.Where(t => t.TariffTypeId == rplDetails.TariffTypeId
                                                        && t.PractitionerType == (PractitionerTypeEnum)rplDetails.PractitionerTypeId);
                medicalItemTreatmentCode = medicalItemTreatmentCode.Where(m => m.TreatmentCodeId == rplDetails.TreatmentCodeId);
                treatmentCodes = treatmentCodes.Where(m => m.TreatmentCodeId == rplDetails.TreatmentCodeId);

                PagedRequestResult<CrosswalkSearch> crosswalkSearch = new PagedRequestResult<CrosswalkSearch>();

                if (tariffBaseGazettedUnitCost.Any())
                {
                    tariffBaseGazettedUnitCost.Where(g => g.EffectiveFrom <= rplDetails.TariffDate && (g.EffectiveTo ?? DateTime.MaxValue) >= rplDetails.TariffDate);

                    crosswalkSearch = await (
                            from t in tarrifCodes
                            join mitc in medicalItemTreatmentCode on t.MedicalItemId equals mitc.MedicalItemId
                            join mi in medicalItem on mitc.MedicalItemId equals mi.MedicalItemId
                            join tc in treatmentCodes on mitc.TreatmentCodeId equals tc.TreatmentCodeId
                            join tbguc in tariffBaseGazettedUnitCost on t.TariffBaseUnitCostId equals tbguc.TariffBaseUnitCostId
                            select new CrosswalkSearch
                            {
                                TariffId = t.TariffId,
                                TariffCode = t.ItemCode,
                                TariffDescription = mi.Description,
                                DefaultQuantity = mi.DefaultQuantity,
                                TariffAmount = t.RecommendedUnits * tbguc.UnitPrice,
                                TreatmentCodeId = mitc.TreatmentCodeId,
                                TreatmentCodeDescription = tc.Description,
                                TariffTypeId = t.TariffTypeId,
                                PractitionerTypeId = (int)t.PractitionerType,
                                MedicalItemId = mi.MedicalItemId
                            }).ToPagedResult(request);
                }
                else
                {
                    tarrifCodes = tarrifCodes.Where(t => t.ValidFrom <= rplDetails.TariffDate && t.ValidTo >= rplDetails.TariffDate);

                    crosswalkSearch = await (
                            from t in tarrifCodes
                            join mitc in medicalItemTreatmentCode on t.MedicalItemId equals mitc.MedicalItemId
                            join mi in medicalItem on mitc.MedicalItemId equals mi.MedicalItemId
                            join tc in treatmentCodes on mitc.TreatmentCodeId equals tc.TreatmentCodeId
                            join tbuc in tariffBaseUnitCost on t.TariffBaseUnitCostId equals tbuc.TariffBaseUnitCostId
                            select new CrosswalkSearch
                            {
                                TariffId = t.TariffId,
                                TariffCode = t.ItemCode,
                                TariffDescription = mi.Description,
                                DefaultQuantity = mi.DefaultQuantity,
                                TariffAmount = t.RecommendedUnits * tbuc.UnitPrice,
                                TreatmentCodeId = mitc.TreatmentCodeId,
                                TreatmentCodeDescription = tc.Description,
                                TariffTypeId = t.TariffTypeId,
                                PractitionerTypeId = (int)t.PractitionerType,
                                MedicalItemId = mi.MedicalItemId
                            }).ToPagedResult(request);
                }

                return crosswalkSearch;
            }
        }

        private async Task<PagedRequestResult<CrosswalkSearch>> GetTreatmentCodes(PagedRequest request)
        {
            var crosswalkSearch = new PagedRequestResult<CrosswalkSearch>();
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var rplDetails = JsonConvert.DeserializeObject<CrosswalkSearch>(request?.SearchCriteria);

                crosswalkSearch = await (from tc in _treatmentCodeRepository.Where(t => t.TreatmentCodeId == rplDetails.TreatmentCodeId)
                                         select new CrosswalkSearch
                                         {
                                             TariffId = 0,
                                             TariffCode = "",
                                             TariffDescription = "",
                                             DefaultQuantity = 1,
                                             TariffAmount = 0,
                                             TreatmentCodeId = tc.TreatmentCodeId,
                                             TreatmentCodeDescription = tc.Description,
                                             TariffTypeId = 0,
                                             PractitionerTypeId = rplDetails.PractitionerTypeId,
                                             MedicalItemId = 0
                                         }).ToPagedResult(request);
            }
            return crosswalkSearch;
        }

        private async Task<PagedRequestResult<CrosswalkSearch>> GetNoMapCrosswalk(PagedRequest request)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                if (string.Equals(request.OrderBy, "tariffid", StringComparison.OrdinalIgnoreCase))
                {
                    request.OrderBy = "TariffId";
                }
                var rplDetails = JsonConvert.DeserializeObject<CrosswalkSearch>(request.SearchCriteria);

                var tarrifCodes = _tariffRepository.AsQueryable();
                var medicalItemTreatmentCode = _medicalItemTreatmentCode.AsQueryable();
                var medicalItem = _medicalItemRepository.AsQueryable();
                var treatmentCodes = _treatmentCodeRepository.AsQueryable();

                PagedRequestResult<CrosswalkSearch> crosswalkSearch = new PagedRequestResult<CrosswalkSearch>();

                crosswalkSearch = await (
                    from t in tarrifCodes
                    join mitc in medicalItemTreatmentCode on t.MedicalItemId equals mitc.MedicalItemId
                    join mi in medicalItem on mitc.MedicalItemId equals mi.MedicalItemId
                    join tc in treatmentCodes on mitc.TreatmentCodeId equals tc.TreatmentCodeId
                    where t.PractitionerType == (PractitionerTypeEnum)rplDetails.PractitionerTypeId
                    && t.ValidFrom <= rplDetails.TariffDate
                    && t.ValidTo >= rplDetails.TariffDate
                    && mitc.TreatmentCodeId == rplDetails.TreatmentCodeId
                    select new CrosswalkSearch
                    {
                        TariffId = t.TariffId,
                        TariffCode = t.ItemCode,
                        TariffDescription = mi.Description,
                        DefaultQuantity = mi.DefaultQuantity,
                        TariffAmount = 0,
                        TreatmentCodeId = mitc.TreatmentCodeId,
                        TreatmentCodeDescription = tc.Description,
                        TariffTypeId = t.TariffTypeId,
                        PractitionerTypeId = (int)t.PractitionerType,
                        MedicalItemId = mi.MedicalItemId
                    }).ToPagedResult(request);


                return crosswalkSearch;
            }
        }


        public async Task<List<TreatmentPlan>> GetTreatmentPlans()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await _treatmentPlanRepository.Select(x => new TreatmentPlan()
                {
                    Name = x.Name,
                    Id = x.Id
                }).ToListAsync();
            }
        }

        public async Task<List<TreatmentProtocol>> GetTreatmentProtocols()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await _treatmentProtocolRepository.Select(x => new TreatmentProtocol()
                {
                    Name = x.Name,
                    TreatmentProtocolId = x.Id,
                    LevelOfCareId = x.LevelOfCareId
                }).ToListAsync();
            }
        }

        public async Task<AdmissionCode> CheckAdmissionCode(string itemCode, int practitionerTypeId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _admissionCodeRepository.FirstOrDefaultAsync(x => x.ItemCode == itemCode && x.PractitionerType == (PractitionerTypeEnum)practitionerTypeId);
                if (entity != null)
                {
                    return Mapper.Map<AdmissionCode>(entity);
                }
                else
                {
                    return new AdmissionCode() { };
                }
            }
        }

        public async Task<bool> IsAuthorisationCodeLimitValid(decimal requestedQuantity, string itemCode, DateTime breakdownFromDate, int practitionerTypeId, int personEventId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var preAuthCodeLimit = await _preAuthCodeLimits
                    .Where(a => a.MedicalItemCode == itemCode && a.PractitionerType == (PractitionerTypeEnum)practitionerTypeId).FirstOrDefaultAsync();

                var authorisationDaysLimit = (preAuthCodeLimit?.AuthorisationDaysLimit != null) ? Convert.ToInt32(preAuthCodeLimit.AuthorisationDaysLimit) : 0;
                decimal authorisedQuantity = 0;
                var preAuthBreakDownList = await (from pa in _preAuthorisationRepository
                                                  join pabr in _preAuthorisationBreakdownRepository on pa.PreAuthId equals pabr.PreAuthId
                                                  join hp in _healthCareProviderRepository on pa.HealthCareProviderId equals hp.RolePlayerId
                                                  join mi in _medicalItemRepository on pabr.MedicalItemId equals mi.MedicalItemId
                                                  where pa.PersonEventId == personEventId && mi.ItemCode == itemCode
                                                  && !pa.IsDeleted && pabr.IsAuthorised == true
                                                  && hp.ProviderTypeId == practitionerTypeId
                                                  select pabr).ToListAsync();

                if (preAuthBreakDownList == null || preAuthCodeLimit == null)
                    return true;

                foreach (var preAuthBreakDown in preAuthBreakDownList)
                {
                    if (preAuthBreakDown.DateAuthorisedFrom.Date >= DateTime.Now.AddDays(-authorisationDaysLimit)
                        && preAuthBreakDown.DateAuthorisedTo.Date <= breakdownFromDate)
                    {
                        authorisedQuantity += Convert.ToDecimal(preAuthBreakDown.AuthorisedTreatments);
                    }
                }

                return preAuthCodeLimit?.AuthorisationQuantityLimit >= requestedQuantity + authorisedQuantity;

            }
        }

        public async Task<List<MutualInclusiveExclusiveCode>> GetMutualExclusiveCodes(string itemCode)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var ruleData = await _ruleService.GetRuleByCode("TRMUTEX");
                int mutualExclusiveRuleId = Convert.ToInt32(ruleData?.Id);

                var mutualInclusiveExclusiveCodeRepository = await _mutualInclusiveExclusiveCodeRepository
                    .Where(x => x.RuleId == mutualExclusiveRuleId && (x.MatchedCode == itemCode || x.MainCode == itemCode)
                    ).ToListAsync();

                return Mapper.Map<List<MutualInclusiveExclusiveCode>>(mutualInclusiveExclusiveCodeRepository);
            }
        }

        public async Task<List<MutualInclusiveExclusiveCode>> GetMutualInclusiveCodes(string itemCode)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var ruleData = await _ruleService.GetRuleByCode("TRMUTIN");
                int mutualInclusiveRuleId = Convert.ToInt32(ruleData?.Id);

                var mutualInclusiveExclusiveCodeRepository = await _mutualInclusiveExclusiveCodeRepository
                    .Where(x => x.RuleId == mutualInclusiveRuleId && (x.MatchedCode == itemCode || x.MainCode == itemCode)
                    ).ToListAsync();

                return Mapper.Map<List<MutualInclusiveExclusiveCode>>(mutualInclusiveExclusiveCodeRepository);
            }
        }

        public async Task CreateWorkflow(Workflow workflow)
        {
            if (workflow != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    _medicalWorkflowRepository.Create(new medical_Workflow
                    {
                        WorkPool = WorkPoolEnum.Medicalpool,
                        WizardId = workflow.WizardId,
                        ReferenceId = workflow.ReferenceId,
                        ReferenceType = workflow.ReferenceType,
                        Description = workflow.Description,
                        AssignedToUserId = workflow.AssignedToUserId,
                        AssignedToRoleId = workflow.AssignedToRoleId,
                        EndDateTime = workflow.EndDateTime,
                        StartDateTime = workflow.StartDateTime
                    });
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        public async Task<PreAuthCodeLimit> GetPreAuthCodeLimit(string medicalItemCode, int practitionerTypeId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var preAuthCodeLimit = await _preAuthCodeLimits
                    .Where(a => a.MedicalItemCode == medicalItemCode && a.PractitionerType == (PractitionerTypeEnum)practitionerTypeId).FirstOrDefaultAsync();

                if (preAuthCodeLimit != null)
                {
                    return Mapper.Map<PreAuthCodeLimit>(preAuthCodeLimit);
                }
                else
                {
                    return new PreAuthCodeLimit() { };
                }
            }
        }

        public async Task<List<Contracts.Entities.Medical.Service>> GetServices()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var services = await _serviceRepository.Where(s => s.ServiceId > 1).ToListAsync();

                return Mapper.Map<List<Contracts.Entities.Medical.Service>>(services);
            }
        }

        public async Task<List<ClinicVenue>> GetClinicVenue()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await _clinicVenueRepository.Select(x => new ClinicVenue()
                {
                    ClinicVenueId = x.ClinicVenueId,
                    Name = x.Name
                }).ToListAsync();
            }
        }
    }
}
