using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;

using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.SecurityManager.Api.Controllers
{
    public class UniqueValidationController : RmaApiController
    {
        private readonly IUniqueFieldValidatorService _uniqueFieldValidatorService;

        public UniqueValidationController(IUniqueFieldValidatorService uniqueFieldValidatorService)
        {
            _uniqueFieldValidatorService = uniqueFieldValidatorService;
        }

        [HttpPost]
        public async Task<ActionResult<bool>> Post([FromBody] UniqueValidationRequest uniqueValidationRequest)
        {
            var result = await _uniqueFieldValidatorService.Exists(uniqueValidationRequest);
            return Ok(result);
        }
    }
}