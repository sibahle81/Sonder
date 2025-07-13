using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class BankAccountController : RmaApiController
    {
        private readonly IBankAccountService _bankAccountRepository;

        public BankAccountController(IBankAccountService bankAccountRepository)
        {
            _bankAccountRepository = bankAccountRepository;
        }

        // GET: mdm/api/BankAccount
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BankAccount>>> Get()
        {
            var levels = await _bankAccountRepository.GetBankAccounts();
            return Ok(levels);
        }

        // GET: mdm/api/BankAccount/{departmentName}
        [HttpGet("{departmentName}")]
        public async Task<ActionResult<BankAccount>> Get(string departmentName)
        {
            var levels = await _bankAccountRepository.GetBankAccount(departmentName);
            return Ok(levels);
        }
    }
}