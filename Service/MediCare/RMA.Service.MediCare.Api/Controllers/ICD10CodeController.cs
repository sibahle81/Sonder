using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Api.Controllers
{
    [Route("api/[controller]")]
    public class ICD10CodeController : RmaApiController
    {
        private readonly IICD10CodeService _icd10CodeService;

        public ICD10CodeController(IICD10CodeService icd10CodeService)
        {
            _icd10CodeService = icd10CodeService;
        }

        [HttpGet("GetICD10CodeById/{icd10CodeId}")]
        public async Task<ActionResult<ICD10Code>> GetICD10CodeById(int icd10CodeId)
        {
            var icd10Code = await _icd10CodeService.GetICD10CodeById(icd10CodeId);
            return Ok(icd10Code);
        }

        [HttpPost("GetICD10CodesByEventTypeDRGAndSubCategory")]
        public async Task<ActionResult<IEnumerable<ICD10Code>>> GetICD10CodesByEventTypeDRGAndSubCategory([FromBody] ICD10CodeModel icd10CodeModel)
        {
            var icd10Codes = await _icd10CodeService.GetICD10CodesByEventTypeDRGAndSubCategory(icd10CodeModel);
            return Ok(icd10Codes);
        }

        [HttpPost("GetICD10SubCategoriesByEventTypeDRGAndCategory")]
        public async Task<ActionResult<IEnumerable<ICD10SubCategory>>> GetICD10SubCategoriesByEventTypeDRGAndCategory([FromBody] ICD10CodeModel icd10CodeModel)
        {
            var icd10SubCategories = await _icd10CodeService.GetICD10SubCategoriesByEventTypeDRGAndCategory(icd10CodeModel);
            return Ok(icd10SubCategories);
        }

        [HttpPost("GetICD10CategoriesByEventTypeAndDiagnosticGroup")]
        public async Task<ActionResult<IEnumerable<ICD10Category>>> GetICD10CategoriesByEventTypeAndDiagnosticGroup([FromBody] ICD10CodeModel icd10CodeModel)
        {
            var icd10Categories = await _icd10CodeService.GetICD10CategoriesByEventTypeAndDiagnosticGroup(icd10CodeModel);
            return Ok(icd10Categories);
        }

        [HttpGet("GetICD10DiagonosticGroupsByEventType/{eventType}")]
        public async Task<ActionResult<IEnumerable<ICD10DiagnosticGroup>>> GetICD10DiagonosticGroupsByEventType(EventTypeEnum eventType)
        {
            var icd10DiagnosticGroups = await _icd10CodeService.GetICD10DiagonosticGroupsByEventType(eventType);
            return Ok(icd10DiagnosticGroups);
        }

        [HttpGet("FilterICD10Code/{filter}")]
        public async Task<ActionResult<List<ICD10CodeModel>>> FilterICD10Code(string filter)
        {
            var result = await _icd10CodeService.FilterICD10Code(filter);
            return Ok(result);
        }

        [HttpGet("SearchICD10Codes/{page}/{pageSize}/{orderBy}/{sortDirection}/{subCategoryId?}/{eventType}/{query?}")]
        public async Task<ActionResult> PagedICD10Code(int page = 1, int pageSize = 5, string orderBy = "ICD10Code", string sortDirection = "asc", int subCategoryId = 0, EventTypeEnum eventType = EventTypeEnum.Accident, string query = "")
        {
            var result = await _icd10CodeService.PagedICD10Code(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), subCategoryId, eventType);
            return Ok(result);
        }

        [HttpGet("GetICD10SubCategoriesByEventType/{eventType}")]
        public async Task<ActionResult> GetICD10SubCategoriesByEventType(EventTypeEnum eventType)
        {
            var result = await _icd10CodeService.GetICD10SubCategoriesByEventType(eventType);
            return Ok(result);
        }

        [HttpGet("GetICD10Codes/{icd10CodeIds}")]
        public async Task<ActionResult> GetICD10SubCategoriesByEventType(string icd10CodeIds)
        {
            var result = await _icd10CodeService.GetICD10Codes(icd10CodeIds);
            return Ok(result);
        }

        [HttpGet("PagedICD10CodeClaims/{page}/{pageSize}/{orderBy}/{sortDirection}/{eventType}/{query?}")]
        public async Task<ActionResult> PagedICD10CodeClaims(int page = 1, int pageSize = 5, string orderBy = "ICD10Code", string sortDirection = "asc", string query = "", int subCategoryId = 0, EventTypeEnum eventTypeEnum = EventTypeEnum.Accident)
        {
            var result = await _icd10CodeService.PagedICD10CodeClaims(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), eventTypeEnum);
            return Ok(result);
        }

        [HttpPost("GetICD10CodesDescription")]
        public async Task<ActionResult<List<ICD10Code>>> GetICD10CodesDescription([FromBody] List<string> icd10CodesLines)
        {
            var result = await _icd10CodeService.GetICD10CodesDescription(icd10CodesLines);
            return Ok(result);
        }

        [HttpGet("GetICD10SubCategoryListByEventType/{eventType}")]
        public async Task<ActionResult> GetICD10SubCategoryListByEventType(EventTypeEnum eventType)
        {
            var result = await _icd10CodeService.GetICD10SubCategoryListByEventType(eventType);
            return Ok(result);
        }

        [HttpGet("GetPagedICD10SubCategories/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult> GetPagedICD10SubCategories(int page = 1, int pageSize = 5, string orderBy = "Icd10SubCategoryId", string sortDirection = "asc", string query = "")
        {
            var result = await _icd10CodeService.GetPagedICD10SubCategories(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(result);
        }

        [HttpGet("CheckICD10CodeMatchInjurygrouping/{icd10Codes}/{personEventId}/{healthCareProviderId}")]
        public async Task<ActionResult<List<ICD10CodeMatch>>> CheckICD10CodeMatchInjurygrouping(string icd10Codes, int personEventId, int healthCareProviderId)
        {
            var results = await _icd10CodeService.CheckICD10CodeMatchInjurygrouping(icd10Codes, personEventId, healthCareProviderId);
            return Ok(results);
        }
    }
}
