using Microsoft.AspNetCore.Mvc;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.FinCare.Contracts.Entities.Finance;
using RMA.Service.FinCare.Contracts.Interfaces.Finance;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Api.Controllers.Finance
{
    [Route("api/Finance/[controller]")]
    public class RecoveryReceiptController : RmaApiController
    {
        private readonly IRecoveryReceiptService _recoveryReceiptService;

        public RecoveryReceiptController(IRecoveryReceiptService recoveryReceiptService)
        {
            _recoveryReceiptService = recoveryReceiptService;
        }

        [HttpPost("CreateRecoveryReceipt")]
        public async Task<ActionResult<RecoveryReceipt>> CreateRecoveryReceipt([FromBody] RecoveryReceipt recoveryReceipt)
        {
            var result = await _recoveryReceiptService.CreateRecoveryReceipt(recoveryReceipt);
            return Ok(result);
        }

        [HttpPost("GetRecoveryReceipt")]
        public async Task<ActionResult<RecoveryReceipt>> GetRecoveryReceipt([FromBody] int recoveryReceiptId)
        {
            var result = await _recoveryReceiptService.GetRecoveryReceipt(recoveryReceiptId);
            return Ok(result);
        }

        [HttpPost("UpdateRecoveryReceipt")]
        public async Task<ActionResult<RecoveryReceipt>> UpdateRecoveryReceipt([FromBody] RecoveryReceipt recoveryReceipt)
        {
            var result = await _recoveryReceiptService.UpdateRecoveryReceipt(recoveryReceipt);
            return Ok(result);
        }

        [HttpPost("GetPagedRecoveryReceipts")]
        public async Task<ActionResult<PagedRequestResult<RecoveryReceipt>>> GetPagedRecoveryReceipts([FromBody] RecoveryReceiptSearchRequest recoveryReceiptSearchRequest)
        {
            var results = await _recoveryReceiptService.GetPagedRecoveryReceipts(recoveryReceiptSearchRequest);
            return Ok(results);
        }
    }
}