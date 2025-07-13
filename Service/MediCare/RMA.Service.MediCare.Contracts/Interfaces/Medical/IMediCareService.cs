using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.MediCare.Contracts.Entities.Medical;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface IMediCareService : IService
    {
        Task<List<TreatmentBasket>> GetTreatmentBaskets();
        Task<List<LevelOfCare>> GetLevelOfCare();
        Task<List<TariffType>> GetTariffTypes();
        Task<TreatmentBasket> GetTreatmentBasketForICD10CodeId(int icd10CodeId);
        Task<TariffSearch> SearchTariff(string tariffCode, string tariffTypeIds, int practitionerTypeId, DateTime tariffDate);
        Task<List<TariffSearch>> GetTariffDetails(List<TariffSearch> tariffSearches);
        Task<TariffSearchCriteria> GetTariff(int tariffId);
        Task<List<TariffSearch>> GetTariffByCode(string[] tariffCode);
        Task<TariffSearch> CheckAndInsertTariff(string itemCode, int CompCareTariffId, int practitionerTypeId, DateTime serviceDate);
        Task<PagedRequestResult<TariffSearchCriteria>> SearchAllTariffs(PagedRequest request);
        Task<PagedRequestResult<TreatmentCode>> SearchTreatmentCodeDetails(PagedRequest treatmentCodeSearchString);
        Task<PagedRequestResult<CrosswalkSearch>> SearchCrosswalk(PagedRequest request);
        Task<List<TreatmentPlan>> GetTreatmentPlans();
        Task<List<TreatmentProtocol>> GetTreatmentProtocols();
        Task<AdmissionCode> CheckAdmissionCode(string itemCode, int practitionerTypeId);
        Task<bool> IsAuthorisationCodeLimitValid(decimal requestedQuantity, string itemCode, DateTime breakdownFromDate, int practitionerTypeId, int personEventId);
        Task<List<MutualInclusiveExclusiveCode>> GetMutualExclusiveCodes(string itemCode);
        Task<List<MutualInclusiveExclusiveCode>> GetMutualInclusiveCodes(string itemCode);
        Task CreateWorkflow(Workflow workflow);
        Task<PreAuthCodeLimit> GetPreAuthCodeLimit(string medicalItemCode, int practitionerTypeId);
        Task<List<ChronicMedicationList>> GetChronicMedicationList();
        Task<List<Entities.Medical.Service>> GetServices();
        Task<List<ClinicVenue>> GetClinicVenue();
    }
}