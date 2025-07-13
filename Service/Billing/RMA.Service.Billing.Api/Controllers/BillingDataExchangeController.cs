using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Billing.Contracts.Entities.DataExchange.Import;
using RMA.Service.Billing.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Api.Controllers
{
    /// <summary>
    /// Tightly coupled to billing for now, needs to utilize the generic data exchange service
    /// </summary>
    [Route("api/billing/[controller]")]
    public class BillingDataExchangeController : RmaApiController
    {
        private readonly IDataExchangeService _dataExchangeService;
        public BillingDataExchangeController(IDataExchangeService dataExchangeService)
        {
            _dataExchangeService = dataExchangeService;
        }

        [HttpPost("PostBinaryData")]
        public async Task PostBinaryData([FromBody] byte[] bytes) => await _dataExchangeService.PostBinaryDataAsync(bytes);

        [HttpPost("PostData")]
        public async Task PostData([FromBody] List<BillingDataExchangeModel> dataExchangeModels) => await _dataExchangeService.PostDataAsync(dataExchangeModels);

        [HttpGet("GetDataById/{Id}")]
        public async Task<IActionResult> GetDataById(int id) => Ok(await _dataExchangeService.GetDataByIdAsync(id));
    }
}