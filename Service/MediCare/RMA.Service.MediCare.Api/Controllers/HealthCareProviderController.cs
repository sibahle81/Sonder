using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860
namespace RMA.Service.MediCare.Api.Controllers
{
    [Route("api/[controller]")]
    public class HealthCareProviderController : RmaApiController
    {
        private readonly IHealthCareProviderService _healthCareProviderService;
        private const string DefaultSortOrder = "desc";
        private const string AscendingOrder = "asc";

        public HealthCareProviderController(IHealthCareProviderService healthCareProviderService)
        {
            _healthCareProviderService = healthCareProviderService;
        }

        [HttpGet("GetHealthCareProviderById/{healthCareProviderId}")]
        public async Task<ActionResult<HealthCareProvider>> GetHealthCareProviderById(int healthCareProviderId)
        {
            var healthCareProvider = await _healthCareProviderService.GetHealthCareProviderById(healthCareProviderId);
            return Ok(healthCareProvider);
        }

        [AllowAnonymous]
        [HttpGet("SearchHealthCareProviderByPracticeNumber/{practiceNumber}")]
        public async Task<ActionResult<HealthCareProvider>> SearchHealthCareProviderByPracticeNumber(string practiceNumber)
        {
            var healthCareProvider = await _healthCareProviderService.SearchHealthCareProviderByPracticeNumber(practiceNumber);
            return Ok(healthCareProvider);
        }

        [AllowAnonymous]
        [HttpGet("SearchHealthCareProviderByPracticeNumberQueryParam")]
        public async Task<ActionResult<HealthCareProvider>> SearchHealthCareProviderByPracticeNumberQueryParam([FromQuery] string practiceNumber)
        {
            var healthCareProvider = await _healthCareProviderService.SearchHealthCareProviderByPracticeNumber(practiceNumber);
            return Ok(healthCareProvider);
        }

        [HttpGet("GetHealthCareProviders")]
        public async Task<ActionResult<IEnumerable<HealthCareProvider>>> GetHealthCareProviders()
        {
            var healthCareProviders = await _healthCareProviderService.GetHealthCareProviders();
            return Ok(healthCareProviders);
        }

        [HttpGet("GetJvHealthCareProviders")]
        public async Task<ActionResult<IEnumerable<HealthCareProvider>>> GetJvHealthCareProviders()
        {
            var healthCareProviders = await _healthCareProviderService.GetJvHealthCareProviders();
            return Ok(healthCareProviders);
        }

        [HttpPost("AddHealthCareProvider")]
        public async Task<ActionResult<int>> AddHealthCareProvider([FromBody] HealthCareProvider healthCareProviderModel)
        {
            var id = await _healthCareProviderService.AddHealthCareProvider(healthCareProviderModel);
            return Ok(id);
        }

        [HttpPut("EditHealthCareProvider")]
        public async Task<ActionResult<int>> Put([FromBody] HealthCareProvider healthCareProviderModel)
        {
            var id = await _healthCareProviderService.EditHealthCareProvider(healthCareProviderModel);
            return Ok(id);
        }

        [HttpGet("Search/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<IEnumerable<HealthCareProvider>>> SearchHealthCareProviders(int page = 1, int pageSize = 5, string orderBy = "HealthCareProviderId", string sortDirection = DefaultSortOrder, string query = "")
        {
            var result = await _healthCareProviderService.SearchHealthCareProviders(new PagedRequest(query, page, pageSize, orderBy, sortDirection == AscendingOrder));
            return Ok(result);
        }
        [HttpGet("SearchHealthCareProvidersForInvoiceReports/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<IEnumerable<HealthCareProvider>>> SearchHealthCareProvidersForInvoiceReports(int page = 1, int pageSize = 5, string orderBy = "HealthCareProviderId", string sortDirection = DefaultSortOrder, string query = "")
        {
            var result = await _healthCareProviderService.SearchHealthCareProvidersForInvoiceReports(new PagedRequest(query, page, pageSize, orderBy, sortDirection == AscendingOrder));
            return Ok(result);
        }

        [HttpGet("FilterHealthCareProviders/{filter}")]
        public async Task<ActionResult<List<HealthCareProvider>>> FilterHealthCareProviders(string filter)
        {
            var result = await _healthCareProviderService.FilterHealthCareProviders(filter);
            return Ok(result);
        }
        [HttpGet("IsHcpHospital/{filter}")]
        public async Task<ActionResult<List<HealthCareProvider>>> IsHcpHospital(string filter)
        {
            var result = await _healthCareProviderService.IsHcpHospital(filter); 
            return Ok(result);
        }

        [HttpGet("GetHealthCareProviderAgreedTariff/{healthCareProviderId}/{isChronic}/{serviceDate}")]
        public async Task<ActionResult<int>> GetHealthCareProviderAgreedTariff(int healthCareProviderId, bool isChronic, DateTime serviceDate)
        {
            var result = await _healthCareProviderService.GetHealthCareProviderAgreedTariff(healthCareProviderId, isChronic, serviceDate);
            return Ok(result);
        }

        [HttpGet("GetHealthCareProviderAgreedTariffTypeIds/{healthCareProviderId}/{isChronic}/{serviceDate}")]
        public async Task<ActionResult<string>> GetHealthCareProviderAgreedTariffTypeIds(int healthCareProviderId, bool isChronic, DateTime serviceDate)
        {
            var result = await _healthCareProviderService.GetHealthCareProviderAgreedTariffTypeIds(healthCareProviderId, isChronic, serviceDate);
            return Ok(result);
        }

        [HttpGet("GetHealthCareProviderVatAmount/{isVatRegistered}/{invoiceDate}")]
        public async Task<ActionResult<decimal>> GetHealthCareProviderVatAmount(bool isVatRegistered, DateTime invoiceDate)
        {
            var result = await _healthCareProviderService.GetHealthCareProviderVatAmount(isVatRegistered, invoiceDate);
            return Ok(result);
        }

        [HttpGet("FilterHealthCareProvidersLinkedToExternalUser/{filter}")]
        public async Task<ActionResult<List<HealthCareProvider>>> FilterHealthCareProvidersLinkedToExternalUser(string filter)
        {
            var result = await _healthCareProviderService.FilterHealthCareProvidersLinkedToExternalUser(filter);
            return Ok(result);
        }


        [HttpGet("GetPagedHealthCareProviders/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<HealthCareProvider>>> GetPagedHealthCareProviders(int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var results = await _healthCareProviderService.GetPagedHealthCareProviders(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(results);
        }

    }
}