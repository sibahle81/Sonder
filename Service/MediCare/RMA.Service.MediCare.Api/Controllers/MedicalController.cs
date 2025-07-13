using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Api.Controllers
{
    [Route("api/[controller]")]
    public class MedicalController : RmaApiController
    {
        private readonly IMediCareService _mediCareService;
        private const string DefaultSortOrder = "desc";
        private const string AscendingOrder = "asc";

        public MedicalController(IMediCareService mediCareService)
        {
            _mediCareService = mediCareService;
        }

        [HttpGet("GetTreatmentBaskets")]
        public async Task<ActionResult<IEnumerable<TreatmentBasket>>> GetTreatmentBaskets()
        {
            var result = await _mediCareService.GetTreatmentBaskets();
            return Ok(result);
        }

        [HttpGet("GetLevelOfCare")]
        public async Task<ActionResult<IEnumerable<LevelOfCare>>> GetLevelOfCare()
        {
            return Ok(await _mediCareService.GetLevelOfCare());
        }

        [HttpGet("GetTariffTypes")]
        public async Task<ActionResult<IEnumerable<TariffType>>> GetTariffTypes()
        {
            return Ok(await _mediCareService.GetTariffTypes());
        }

        [HttpGet("GetChronicMedicationList")]
        public async Task<ActionResult<IEnumerable<ChronicMedicationList>>> GetChronicMedicationList()
        {
            return Ok(await _mediCareService.GetChronicMedicationList());
        }

        [HttpGet("GetTreatmentBasketForICD10CodeId/{icd10CodeId}")]
        public async Task<ActionResult<TreatmentBasket>> GetTreatmentBasketForICD10CodeId(int icd10CodeId)
        {
            var result = await _mediCareService.GetTreatmentBasketForICD10CodeId(icd10CodeId);
            return Ok(result);
        }

        [HttpGet("GetTariffSearchForTariffId/{tariffId}")]
        public async Task<ActionResult<TariffSearchCriteria>> GetTariffSearchForTariffId(int tariffId)
        {
            var result = await _mediCareService.GetTariff(tariffId);
            return Ok(result);
        }

        [HttpGet("SearchTariff/{tariffCode}/{tariffTypeIds}/{practitionerTypeId}/{tariffDate}")]
        public async Task<ActionResult<IEnumerable<TariffSearch>>> SearchTariff(string tariffCode, string tariffTypeIds, int practitionerTypeId, DateTime tariffDate)
        {
            var result = await _mediCareService.SearchTariff(tariffCode, tariffTypeIds, practitionerTypeId, tariffDate);
            return Ok(result);
        }

        [HttpPost("GetTariffDetails")]
        public async Task<ActionResult<List<TebaTariff>>> GetTariffDetails([FromBody] List<TariffSearch> tariffSearches)
        {
            var result = await _mediCareService.GetTariffDetails(tariffSearches);
            return Ok(result);
        }

        [HttpGet("SearchAllTariffs/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<IEnumerable<TariffSearch>>> SearchAllTariffs(int page = 1, int pageSize = 5, string orderBy = "TariffId", string sortDirection = DefaultSortOrder, string query = "")
        {
            var result = await _mediCareService.SearchAllTariffs(new PagedRequest(query, page, pageSize, orderBy, sortDirection == DefaultSortOrder));
            return Ok(result);
        }

        [HttpGet("SearchTreatmentCodeDetails/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<IEnumerable<TreatmentCode>>> SearchTreatmentCodeDetails(int page = 1, int pageSize = 5, string orderBy = "TreatmentCodeId", string sortDirection = DefaultSortOrder, string query = "")
        {
            var result = await _mediCareService.SearchTreatmentCodeDetails(new PagedRequest(query, page, pageSize, orderBy, sortDirection == AscendingOrder));
            return Ok(result);
        }

        [HttpGet("SearchCrosswalk/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<IEnumerable<CrosswalkSearch>>> SearchCrosswalk(int page = 1, int pageSize = 5, string orderBy = "TariffId", string sortDirection = DefaultSortOrder, string query = "")
        {
            var result = await _mediCareService.SearchCrosswalk(new PagedRequest(query, page, pageSize, orderBy, sortDirection == DefaultSortOrder));
            return Ok(result);
        }

        [HttpGet("GetTreatmentPlans")]
        public async Task<ActionResult<IEnumerable<TreatmentPlan>>> GetTreatmentPlans()
        {
            return Ok(await _mediCareService.GetTreatmentPlans());
        }

        [HttpGet("GetTreatmentProtocols")]
        public async Task<ActionResult<IEnumerable<TreatmentProtocol>>> GetTreatmentProtocols()
        {
            return Ok(await _mediCareService.GetTreatmentProtocols());
        }

        [HttpGet("CheckAdmissionCode/{itemCode}/{practitionerTypeId}")]
        public async Task<ActionResult<AdmissionCode>> CheckAdmissionCode(string itemCode, int practitionerTypeId)
        {
            return Ok(await _mediCareService.CheckAdmissionCode(itemCode, practitionerTypeId));
        }

        [HttpGet("IsAuthorisationCodeLimitValid/{quantity}/{itemCode}/{breakdownFromDate}/{practitionerTypeId}/{personEventId}")]
        public async Task<ActionResult<IEnumerable<bool>>> IsAuthorisationCodeLimitValid(decimal quantity, string itemCode, DateTime breakdownFromDate, int practitionerTypeId, int personEventId)
        {
            return Ok(await _mediCareService.IsAuthorisationCodeLimitValid(quantity, itemCode, breakdownFromDate, practitionerTypeId, personEventId));
        }

        [HttpGet("GetMutualExclusiveCodes/{itemCode}")]
        public async Task<ActionResult<IEnumerable<MutualInclusiveExclusiveCode>>> GetMutualExclusiveCodes(string itemCode)
        {
            return Ok(await _mediCareService.GetMutualExclusiveCodes(itemCode));
        }

        [HttpGet("GetMutualInclusiveCodes/{itemCode}")]
        public async Task<ActionResult<IEnumerable<MutualInclusiveExclusiveCode>>> GetMutualInclusiveCodes(string itemCode)
        {
            return Ok(await _mediCareService.GetMutualInclusiveCodes(itemCode));
        }

        [HttpGet("GetPreAuthCodeLimit/{medicalItemCode}/{practitionerTypeId}")]
        public async Task<ActionResult<PreAuthCodeLimit>> GetPreAuthCodeLimit(string medicalItemCode, int practitionerTypeId)
        {
            return Ok(await _mediCareService.GetPreAuthCodeLimit(medicalItemCode, practitionerTypeId));
        }

        [HttpGet("CheckAndInsertTariff/{itemCode}/{CompCareTariffId}/{practitionerTypeId}/{serviceDate}")]
        public async Task<ActionResult<TariffSearch>> CheckAndInsertTariff(string itemCode, int CompCareTariffId, int practitionerTypeId, DateTime serviceDate)
        {
            return Ok(await _mediCareService.CheckAndInsertTariff(itemCode, CompCareTariffId, practitionerTypeId, serviceDate));
        }

        [HttpGet("GetServices")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Medical.Service>>> GetServices()
        {
            var result = await _mediCareService.GetServices();
            return Ok(result);
        }

        [HttpGet("GetClinicVenue")]
        public async Task<ActionResult<IEnumerable<ClinicVenue>>> GetClinicVenue()
        {
            var result = await _mediCareService.GetClinicVenue();
            return Ok(result);
        }
    }
}
