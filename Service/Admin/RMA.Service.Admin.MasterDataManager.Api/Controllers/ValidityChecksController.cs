using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class ValidityChecksController : RmaApiController
    {
        private readonly IValidityCheckSetService _validityCheckSetService;

        public ValidityChecksController(IValidityCheckSetService validityCheckSetService)
        {
            _validityCheckSetService = validityCheckSetService;
        }

        [HttpGet("GetValidityChecks/{checkType}")]
        public async Task<ActionResult<IEnumerable<ValidityCheckSet>>> Get(ValidityCheckTypeEnum checkType)
        {
            var validityChecks = await _validityCheckSetService.GetValidityChecks(checkType);
            return Ok(validityChecks);
        }

        [HttpGet("GetValidityCheckCategories/{checkType}")]
        public async Task<ActionResult<IEnumerable<ValidityCheckCategory>>> GetValidityCheckCategories(ValidityCheckTypeEnum checkType)
        {
            var validityChecks = await _validityCheckSetService.GetValidityCheckCategories(checkType);
            return Ok(validityChecks);
        }
    }
}