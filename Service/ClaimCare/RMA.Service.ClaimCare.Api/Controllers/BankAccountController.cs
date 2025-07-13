using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RMA.Common.Web.Controllers;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

namespace RMA.Service.ClaimCare.Api.Controllers
{
    public class BankAccountController : RmaApiController
    {
        private readonly IBankAccountService _bankAccountService;

        public BankAccountController(IBankAccountService bankAccountService)
        {
            _bankAccountService = bankAccountService;
        }

        // GET: api/BankAccount
        //[HttpGet]
        //public async Task<ActionResult<List<BankAccount>>> Get()
        //{
        //    return Ok(await _bankAccountService.GetAll());
        //}

        //GET: api/BankAccount/1
        [HttpGet]
        public async Task<ActionResult<BankAccount>> Get(int id)
        {
            return Ok(await _bankAccountService.Get(id));
        }

        [HttpGet("GetBankAccountByClaimId/{claimId}")]
        public async Task<ActionResult<List<BankAccount>>> GetBankAccountByClaimId(
            int claimId)
        {
            return Ok(await _bankAccountService.GetBankAccountByClaimId(claimId));
        }

        [HttpGet("GetBankAccountByClientBankAccountId/{bankAccountId}")]
        public async Task<ActionResult<List<BankAccount>>> GetBankAccountByClientBankAccountId(
            int bankAccountId)
        {
            return Ok(await _bankAccountService.GetBankAccountByClaimId(bankAccountId));
        }

        // POST api/BankAccount/
        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] BankAccount bodyCollector)
        {
            var bodyCollectorId = await _bankAccountService.Create(bodyCollector);
            return Ok(bodyCollectorId);
        }

        //PUT: api/BankAccount
        public async Task<ActionResult> Put([FromBody] BankAccount bankAccount)
        {
            await _bankAccountService.Update(bankAccount);
            return Ok();
        }
    }
}