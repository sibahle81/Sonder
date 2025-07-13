using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Api.Controllers
{
    [Route("api/billing/[controller]")]
    public class TermsArrangementController : RmaApiController
    {
        private readonly ITermsArrangementService _termsArrangementService;

        public TermsArrangementController(ITermsArrangementService termsArrangementService)
        {
            _termsArrangementService = termsArrangementService;
        }
        [HttpPost("AddUnsuccessfulInitiation")]
        public async Task<ActionResult<int>> AddUnsuccessfulInitiation([FromBody] UnsuccessfulInitiation unsuccessfulInitiation)
        {
            var result = await _termsArrangementService.AddUnsuccessfulInitiation(unsuccessfulInitiation);
            return Ok(result);
        }

        [HttpGet("GetTermArrangementsByRolePlayerId/{roleplayerId}")]
        public async Task<ActionResult<List<TermArrangement>>> GetTermArrangementsByRolePlayerId(int roleplayerId)
        {
            var result = await _termsArrangementService.GetTermArrangementsByRolePlayerId(roleplayerId);
            return Ok(result);
        }

        [HttpGet("GetActiveTermArrangementsProductOptionsByRolePlayerId/{roleplayerId}")]
        public async Task<ActionResult<List<TermArrangement>>> GetActiveTermArrangementsProductOptionsByRolePlayerId(int roleplayerId)
        {
            var result = await _termsArrangementService.GetActiveTermArrangementsProductOptionsByRolePlayerId(roleplayerId);
            return Ok(result);
        }

        [HttpPost("AddTermArrangementNote")]
        public async Task<ActionResult<int>> AAddTermArrangementNote([FromBody] TermsArrangementNote termsArrangementNote)
        {
            var id = await _termsArrangementService.AddTermArrangementNote(termsArrangementNote);
            return Ok(id);
        }

        [HttpPut("EditTermArrangementSechedulesCollectionFlags")]
        public async Task<ActionResult> EditTermArrangementSchedules([FromBody] EditTermArrangementSchedules editTermArrangementSchedules)
        {
            if (editTermArrangementSchedules != null)
            {
                await _termsArrangementService.EditTermArrangementSechedulesCollectionFlags(editTermArrangementSchedules.termArrangementSchedules);
            }
            return Ok();
        }

        [HttpPut("AddTermArrangementNotes")]
        public async Task<ActionResult> AddTermArrangementNotes([FromBody] TermsArrangementNote termsArrangementNote)
        {
            await _termsArrangementService.AddTermArrangementNotes(termsArrangementNote);
            return Ok();
        }

        [HttpGet("GetAllTermNotesByTermArrangementId/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<TermsArrangementNote>>> GetAllTermNotesByTermArrangementId(int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var termArrangementNotes = await _termsArrangementService.GetAllTermNotesByTermArrangementId(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(termArrangementNotes);
        }

        [HttpGet("GetDebtorNetBalance/{roleplayerId}")]
        public async Task<ActionResult<List<decimal>>> GetDebtorNetBalance(int roleplayerId)
        {
            var result = await _termsArrangementService.GetDebtorNetBalance(roleplayerId);
            return Ok(result);
        }

        [HttpPost("SendMemoOfAgreement")]
        public async Task<ActionResult<int>> SendMemoOfAgreement([FromBody] TermsMemoOfAgreementEmail termsMemoOfAgreementEmail)
        {
            var result = await _termsArrangementService.SendMemoOfAgreementEmail(termsMemoOfAgreementEmail);
            return Ok(result);
        }

        [HttpGet("GetDebtorTermProductBalances/{roleplayerId}/{termBillingCycleId}")]
        public async Task<ActionResult<List<DebtorProductBalance>>> GetDebtorTermProductBalances(int roleplayerId, int termBillingCycleId)
        {
            var result = await _termsArrangementService.GetDebtorTermProductBalances(roleplayerId, termBillingCycleId);
            return Ok(result);
        }

        [HttpGet("GetActiveArrangementsByRoleplayer/{roleplayerId}/{financialYearPeriodId}")]
        public async Task<ActionResult<List<DebtorProductBalance>>> GetActiveArrangementByRoleplayer(int roleplayerId, int financialYearPeriodId)
        {
            var result = await _termsArrangementService.GetActiveArrangementsByRoleplayer(roleplayerId, financialYearPeriodId);
            return Ok(result);
        }

        [HttpPost("GetProductBalancesByPolicyIds")]
        public async Task<ActionResult<int>> GetProductBalancesByPolicyIds([FromBody] TermProductBalanceRequest request)
        {
            var result = await _termsArrangementService.GetProductBalancesByPolicyIds(request);
            return Ok(result);
        }

        [HttpGet("GetTermsDebitOrderDetails/ByTermArrangementId/{termArrangementId}")]
        public async Task<ActionResult<TermsDebitOrderDetail>> GetTermsDebitOrderDetailsByTermArrangementId(int termArrangementId)
        {
            var result = await _termsArrangementService.GetTermsDebitOrderDetailsByTermArrangementId(termArrangementId);
            return Ok(result);
        }

        [HttpGet("GetTermScheduleRefundBreakDown/{roleplayerId}")]
        public async Task<ActionResult<List<TermScheduleRefundBreakDown>>> GetTermScheduleRefundBreakDown(int roleplayerId)
        {
            var result = await _termsArrangementService.GetTermScheduleRefundBreakDown(roleplayerId);
            return Ok(result);
        }
    }
}
