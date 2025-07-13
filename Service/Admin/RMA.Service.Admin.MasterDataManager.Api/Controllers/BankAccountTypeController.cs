using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class BankAccountTypeController : RmaApiController
    {
        private readonly IBankAccountTypeService _bankAccountTypeService;

        public BankAccountTypeController(IBankAccountTypeService bankAccountTypeService)
        {
            _bankAccountTypeService = bankAccountTypeService;
        }

        // GET: mdm/api/BankAccountType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var bankAccountTypes = await _bankAccountTypeService.GetBankAccountTypes();
            return Ok(bankAccountTypes);
        }
    }
}