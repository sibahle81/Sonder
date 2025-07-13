using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class BankAccountServiceTypeController : RmaApiController
    {
        private readonly IBankAccountServiceTypeService _serviceTypeRepository;

        public BankAccountServiceTypeController(IBankAccountServiceTypeService bankAccountServiceTypeRepository)
        {
            _serviceTypeRepository = bankAccountServiceTypeRepository;
        }

        // GET: mdm/api/BankAccountServiceType
        [HttpGet]
        public async Task<ActionResult<Lookup>> Get()
        {
            var serviceTypes = await _serviceTypeRepository.GetBankAccountServiceTypes();
            return Ok(serviceTypes);
        }
    }
}