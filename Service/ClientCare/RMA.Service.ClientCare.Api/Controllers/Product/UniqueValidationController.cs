using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;

using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Product
{
    [Route("api/Product/[controller]")]

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