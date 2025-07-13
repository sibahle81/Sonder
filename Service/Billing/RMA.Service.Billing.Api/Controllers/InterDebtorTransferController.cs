using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;

using System.Threading.Tasks;

namespace RMA.Service.Billing.Api.Controllers
{
    [Route("api/billing/[controller]")]
    public class InterDebtorTransferController : RmaApiController
    {
        private readonly IInterDebtorTransferService _interDebtorTransferService;

        public InterDebtorTransferController(IInterDebtorTransferService interDebtorTransferService)
        {
            _interDebtorTransferService = interDebtorTransferService;
        }


        [HttpPost("InitiateTransferToDebtor")]
        public async Task<InterDebtorTransfer> InitiateTransferToDebtor([FromBody] InterDebtorTransfer interDebtorTransfer)
        {
            var result = await _interDebtorTransferService.InitiateTransferToDebtor(interDebtorTransfer);
            return result;
        }

        [HttpGet("CheckDebtorsHaveIdenticalIndustryClass/{fromDebtorNumber}/{toDebtorNumber}")]
        public async Task<ActionResult<bool>> CheckDebtorsHaveIdenticalIndustryClass(string fromDebtorNumber, string toDebtorNumber)
        {
            var result = await _interDebtorTransferService.CheckDebtorsHaveIdenticalIndustryClass(fromDebtorNumber, toDebtorNumber);
            return Ok(result);
        }

        [HttpGet("CheckDebtorsHaveIdenticalBankAccounts/{fromDebtorNumber}/{toDebtorNumber}")]
        public async Task<ActionResult<bool>> CheckDebtorsHaveIdenticalBankAccounts(string fromAccountNumber, string toAccountNumber)
        {
            var result = await _interDebtorTransferService.CheckDebtorsHaveIdenticalBankAccounts(fromAccountNumber, toAccountNumber);
            return Ok(result);
        }
    }
}