using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class ProductStatusController : RmaApiController
    {
        private readonly IProductStatusService _statusService;

        public ProductStatusController(IProductStatusService productStatusService)
        {
            _statusService = productStatusService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetProductStatuses()
        {
            var productStatuses = await _statusService.GetProductStatuses();
            return Ok(productStatuses);
        }
    }
}