using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.FinCare.Contracts.Entities.Commissions;
using RMA.Service.FinCare.Contracts.Interfaces.Commissions;

using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Api.Controllers.Commissions
{
    [Route("api/Commissions/[controller]")]
    public class CommissionController : RmaApiController
    {
        private readonly ICommissionService _commissionService;

        public CommissionController(ICommissionService commissionService)
        {
            _commissionService = commissionService;
        }


        [HttpGet("GetCommissionDetailByHeaderId/{headerId}")]
        public async Task<ActionResult<List<CommissionDetail>>> GetCommissionDetailByHeaderId(int headerId)
        {
            var commission = await _commissionService.GetCommissionDetailsByHeaderId(headerId);
            return Ok(commission);
        }

        [HttpGet("GetCommissionAccounts")]
        public async Task<ActionResult<List<CommissionAccount>>> GetCommissionAccounts()
        {
            var commission = await _commissionService.GetCommissionAccounts();
            return Ok(commission);
        }

        [HttpGet("GetCommissionsByAccount/{accountTypeId}/{accountId}/{headerStatusId}")]
        public async Task<ActionResult<List<CommissionHeader>>> GetCommissionsByAccount(int accountTypeId, int accountId, int headerStatusId)
        {
            var commission = await _commissionService.GetCommissionsByAccount(accountTypeId, accountId, headerStatusId);
            return Ok(commission);
        }

        [HttpGet("GetPendingCommissions")]
        public async Task<ActionResult<List<CommissionHeader>>> GetPendingCommissions()
        {
            var commission = await _commissionService.GetCommissionsByStatus(new List<CommissionStatusEnum> { CommissionStatusEnum.Pending });
            return Ok(commission);
        }

        [HttpGet("GetCommissions")]
        public async Task<ActionResult<List<CommissionHeader>>> GetCommissions()
        {
            var commission = await _commissionService.GetCommissions();
            return Ok(commission);
        }

        [HttpGet("GetCommissionDetailById/{detailId}")]
        public async Task<ActionResult<CommissionDetail>> GetCommissionDetailById(int detailId)
        {
            var commission = await _commissionService.GetCommissionDetailById(detailId);
            return Ok(commission);
        }

        [HttpGet("SearchCommissionAccounts/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<CommissionAccount>>> SearchBrokerages(int page = 1, int pageSize = 5, string orderBy = "accountId", string sortDirection = "asc", string query = "")
        {
            var commssionAccounts = await _commissionService.SearchCommissionAccounts(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(commssionAccounts);
        }

        [HttpGet("GetCommissionsCurrentlyWithheld")]
        public async Task<ActionResult<List<CommissionHeader>>> GetCommissionsCurrentlyWithheld()
        {
            var commission = await _commissionService.GetCommissionsByStatus(new List<CommissionStatusEnum> { CommissionStatusEnum.WithHeld });
            return Ok(commission);
        }

        [HttpPost("ReleaseCommission")]
        //public async Task<ActionResult> SubmitApprovedPayments(List<CommissionHeader> approvedPayments)
        public async Task<ActionResult> SubmitApprovedPayments(CommissionPaymentRequest paymentRequest)
        {
            if (paymentRequest == null)
            {
                throw new ArgumentNullException(nameof(paymentRequest));
            }
            await _commissionService.ReleaseCommission(paymentRequest.CommissonHeaders);
            return Ok();
        }

        [HttpGet("GetCommissionsCurrentlyRejected")]
        public async Task<ActionResult<CommissionDetail>> GetCommissionsCurrentlyRejected()
        {
            var commission = await _commissionService.GetCommissionsByStatus(new List<CommissionStatusEnum> { CommissionStatusEnum.Rejected });
            return Ok(commission);
        }

        [HttpGet("GetBrokerCommissionStatement/{accountTypeId}/{accountId}/{periodId}")]
        public async Task<ActionResult<List<CommissionStatementModel>>> GetBrokerCommissionStatement(int accountTypeId, int accountId, int periodId)
        {
            var commissionStatement = await _commissionService.GetBrokerCommissionStatementByPeriod(accountTypeId, accountId, periodId);
            return Ok(commissionStatement);
        }

        [HttpGet("GetCommissionPeriodsByAccountAndType/{accountTypeId}/{accountId}")]
        public async Task<ActionResult<CommissionDetail>> GetCommissionPeriodsByAccountAndType(int accountTypeId, int accountId)
        {
            var commissionStatement = await _commissionService.GetCommissionPeriodsByAccountAndType(accountTypeId, accountId);
            return Ok(commissionStatement);
        }

        [HttpPost("ReSubmitBankRejectedCommissions")]
        public async Task<ActionResult> ReSubmitBankRejectedCommissions(CommissionPaymentRequest paymentRequest)
        {
            if (paymentRequest == null)
            {
                throw new ArgumentNullException(nameof(paymentRequest));
            }
            await _commissionService.ReSubmitBankRejectedCommissions(paymentRequest.CommissonHeaders);
            return Ok();
        }

        //TO DO: REMOVE
        [HttpGet("GetCommissionAuditTrail/{startDate}/{endDate}")]
        public async Task<ActionResult<CommissionAuditTrailModel>> GetCommissionAuditTrail(string startDate, string endDate)
        {
            var _startDate = DateTime.Parse(startDate, CultureInfo.CurrentCulture);
            var _endDate = DateTime.Parse(endDate, CultureInfo.CurrentCulture);

            var commissionStatement = await _commissionService.GetCommissionAuditTrail(_startDate, _endDate);
            return Ok(commissionStatement);
        }

        [HttpGet("GetCommissionAuditTrailByAccountId/{startDate}/{endDate}/{accountId}/{accountTypeId}")]
        public async Task<ActionResult<CommissionAuditTrailModel>> GetCommissionAuditTrailByAccountId(string startDate, string endDate, int accountId, int accountTypeId)
        {
            var _startDate = DateTime.Parse(startDate, CultureInfo.CurrentCulture);
            var _endDate = DateTime.Parse(endDate, CultureInfo.CurrentCulture);

            var commissionStatement = await _commissionService.GetCommissionAuditTrailByAccountId(_startDate, _endDate, accountId, accountTypeId);
            return Ok(commissionStatement);
        }

        [HttpPost("ReSendStatement")]
        public async Task<ActionResult> ReSendStatement(ReSendStatementRequest request)
        {
            await _commissionService.ResendCommissionStatment(request);
            return Ok();
        }

        [HttpGet("GetCommissionPeriodicCommunicationSent/{accountTypeId}/{accountId}/{periodId}")]
        public async Task<ActionResult<List<EmailAudit>>> GetCommissionPeriodicCommunicationSent(int accountTypeId, int accountId, int periodId)
        {
            var results = await _commissionService.GetCommissionPeriodicCommunicationSent(accountTypeId, accountId, periodId);
            return Ok(results);
        }

        [HttpGet("GetCommissionPeriodsForReports")]
        public async Task<ActionResult<CommissionDetail>> GetCommissionPeriodsForReports()
        {
            var commissionStatement = await _commissionService.GetCommissionPeriodsForReports();
            return Ok(commissionStatement);
        }

        [HttpGet("GetCommissionAccountByAccountId/{accountTypeId}/{accountId}")]
        public async Task<ActionResult<List<CommissionHeader>>> GetCommissionAccountByAccountId(int accountTypeId, int accountId)
        {
            var commission = await _commissionService.GetCommissionAccountByAccountId(accountTypeId, accountId);
            return Ok(commission);
        }

        [HttpGet("GetCommissionClawBackAccountSummary/{accountTypeId}/{accountId}")]
        public async Task<ActionResult<CommissionClawBackAccount>> GetCommissionClawBackAccountSummary(int accountTypeId, int accountId)
        {
            var clawBackAccount = await _commissionService.GetCommissionClawBackAccountSummary(accountTypeId, accountId);
            return Ok(clawBackAccount);
        }

        [HttpGet("GetCommissionClawBackAccountMovementByHeaderId/{headerId}")]
        public async Task<ActionResult<List<CommissionClawBackAccountMovement>>> GetCommissionClawBackAccountMovementByHeaderId(int headerId)
        {
            var clawBackAccountMovements = await _commissionService.GetCommissionClawBackAccountMovementByHeaderId(headerId);
            return Ok(clawBackAccountMovements);
        }

        [HttpPost("CommissionPoolSearch")]
        public async Task<ActionResult<PagedRequestResult<CommissionHeader>>> PaymentPoolSearch([FromBody] CommissionPoolSearchParams commissionPoolSearchParams)
        {
            var payments = await _commissionService.CommissionPoolSearch(commissionPoolSearchParams);
            return Ok(payments);
        }

        [HttpGet("GetCommissionPeriodByPeriodId/{periodId}")]
        public async Task<ActionResult<List<CommissionPeriod>>> GetCommissionPeriodByPeriodId(int periodId)
        {
            var commissionPeriod = await _commissionService.GetCommissionPeriodByPeriod(periodId);
            return Ok(commissionPeriod);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post(CommissionPeriod commissionPeriod)
        {
            var id = await _commissionService.AddCommissionPeriod(commissionPeriod);
            return Ok(id);
        }

        [HttpPut]
        public async Task<ActionResult> Put(CommissionPeriod commissionPeriod)
        {
            await _commissionService.EditCommissionPeriod(commissionPeriod);
            return Ok();
        }

        [HttpPut("UpdateCommissionHeader")]
        public async Task<ActionResult> UpdateCommissionHeader([FromBody] CommissionHeader commissionHeader)
        {
            await _commissionService.UpdateCommissionHeader(commissionHeader);
            return Ok();
        }
    }
}
