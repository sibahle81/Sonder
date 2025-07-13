using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.FinCare.Contracts.Entities.Payments;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Api.Controllers
{
    [Route("api/billing/[controller]")]
    public class InterBankTransferController : RmaApiController
    {
        private readonly IInterBankTransferService _interBankTransferService;

        public InterBankTransferController(IInterBankTransferService interBankTransferService)
        {
            _interBankTransferService = interBankTransferService;
        }


        [HttpGet("GetBankAccounts")]
        public async Task<ActionResult<List<RmaBankAccount>>> GetBankAccounts()
        {
            var result = await _interBankTransferService.GetRmaBankAccounts();
            return Ok(result);
        }

        [HttpGet("GetCompanyBranchBankAccounts")]
        public async Task<ActionResult<List<CompanyBranchBankAccount>>> GetCompanyBranchBankAccounts()
        {
            var result = await _interBankTransferService.GetCompanyBranchBankAccounts();
            return Ok(result);
        }

        [HttpPost("GetTransactionByBank")]
        public async Task<RmaBankAccountTransaction> GetTransactionByBank([FromBody] RmaBankAccount rmaBankAccount)
        {
            var result = await _interBankTransferService.GetTransactionByBank(rmaBankAccount);
            return result;
        }
        [HttpPost("CreateInterBankTransferWizard")]
        public async Task<ActionResult<bool>> CreateInterBankTransferWizard([FromBody] InterBankTransfer interBankTransfer)
        {
            await _interBankTransferService.CreateInterBankTransferWizard(interBankTransfer);
            return Ok(true);
        }
        [HttpGet("GetRmaBankAccount/{rmaBankAccountId}")]
        public async Task<RmaBankAccount> GetRmaBankAccount(int rmaBankAccountId)
        {
            var result = await _interBankTransferService.GetRmaBankAccount(rmaBankAccountId);
            return result;
        }
        [HttpGet("CompleteTransferToBank/{interBankTransferId}")]
        public async Task<bool> CompleteTransferToBank(int interBankTransferId)
        {
            var result = await _interBankTransferService.CompleteTransferToBank(interBankTransferId);
            return result;
        }

        [HttpGet("GetDebtorBankAccounts/{debtorNumber}")]
        public async Task<ActionResult<List<RmaBankAccount>>> GetDebtorBankAccounts(string debtorNumber)
        {
            var result = await _interBankTransferService.GetDebtorBankAccounts(debtorNumber);
            return Ok(result);
        }

        [HttpPost("TransferFromBankToBank")]
        public async Task<ActionResult> TransferFromBankToBank(Payment payment)
        {
            var paymentId = await _interBankTransferService.TransferFromBankToBank(payment);

            return Ok(paymentId);
        }
    }
}