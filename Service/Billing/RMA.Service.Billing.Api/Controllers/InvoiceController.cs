using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Billing.Contracts;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Api.Controllers
{
    [Route("api/billing/[controller]")]
    public class InvoiceController : RmaApiController
    {
        private readonly IInvoiceService _invoiceService;
        private readonly ITransactionService _transactionService;
        private readonly IClaimRecoveryInvoiceService _claimRecoveryInvoiceService;

        public InvoiceController(IInvoiceService invoiceService,
            IClaimRecoveryInvoiceService claimRecoveryInvoiceService,
            ITransactionService transactionService)
        {
            _invoiceService = invoiceService;
            _claimRecoveryInvoiceService = claimRecoveryInvoiceService;
            _transactionService = transactionService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Invoice>>> Get()
        {
            var result = await _invoiceService.GetInvoices();
            return Ok(result);
        }

        [HttpGet("GetInvoice/{invoiceId}")]
        public async Task<Invoice> GetInvoice(int invoiceId)
        {
            var result = await _invoiceService.GetInvoice(invoiceId);
            return result;
        }

        [HttpGet("GetInvoiceByInvoiceNumber/{invoiceNumber}")]
        public async Task<Invoice> GetInvoiceByInvoiceNumber(string invoiceNumber)
        {
            var result = await _invoiceService.GetInvoiceByInvoiceNumber(invoiceNumber);
            return result;
        }

        [HttpGet("GetInvoiceById/{invoiceId}")]
        public async Task<Invoice> GetInvoiceById(int invoiceId)
        {
            var result = await _invoiceService.GetInvoiceById(invoiceId);
            return result;
        }

        [HttpGet("GetInvoiceByPolicy/{policyId}")]
        public async Task<Invoice> GetInvoiceByPolicy(int policyId)
        {
            var result = await _invoiceService.GetInvoiceByPolicyId(policyId);
            return result;
        }

        [HttpPut("SendInvoice")]
        public async Task<ActionResult> SendInvoice([FromBody] InvoiceSearchResult invoiceSearchResult)
        {
            await _invoiceService.SendInvoiceDocument(invoiceSearchResult);
            return Ok();
        }

        [HttpPut("SendStatement")]
        public async Task<ActionResult> SendStatement([FromBody] InvoiceSearchResult invoiceSearchResult)
        {
            await _invoiceService.SendStatement(invoiceSearchResult);
            return Ok();
        }

        [HttpPut("SendTransactional")]
        public async Task<ActionResult> SendTransactional([FromBody] InvoiceSearchResult invoiceSearchResult)
        {
            await _invoiceService.SendTransactionalStatement(invoiceSearchResult);
            return Ok();
        }

        [HttpGet("SearchInvoices/{query}/{page}/{pageSize}/{orderBy}/{sortDirection}/{showActive}")]
        public async Task<ActionResult<List<InvoiceSearchResult>>> SearchPolicies(string query, int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", bool showActive = true)
        {
            var searchResults = await _invoiceService.SearchInvoices(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), showActive);
            return Ok(searchResults);
        }

        [HttpGet("SearchAccounts/{query}/{page}/{pageSize}/{orderBy}/{sortDirection}/{showActive}")]
        public async Task<ActionResult<List<SearchAccountResults>>> SearchAccounts(string query, int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", bool showActive = true)
        {
            var searchResults = await _invoiceService.SearchAccounts(new PagedRequest(query.Decode(), page, pageSize, orderBy, sortDirection == "asc"), showActive);
            return Ok(searchResults);
        }

        [HttpGet("GetUnPaidInvoices/{roleplayerId}/{isClaimRecovery}")]
        public async Task<ActionResult<IEnumerable<InvoicePaymentAllocation>>> GetUnPaidInvoices(int roleplayerId, bool isClaimRecovery)
        {
            List<InvoicePaymentAllocation> invoices;
            if (!isClaimRecovery)
            {
                invoices = await _invoiceService.GetUnPaidInvoices(roleplayerId);
            }
            else
            {
                invoices = await _claimRecoveryInvoiceService.GetUnPaidInvoices(roleplayerId);
            }

            return Ok(invoices);
        }

        [HttpGet("Search/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<InvoicePaymentAllocation>>> SearchBrokerages(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var brokerages = await _invoiceService.SearchUnPaidInvoices(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(brokerages);
        }

        [HttpGet("GetUnpaidInvoicesByPolicyId/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Invoice>>> GetUnpaidInvoicesByPolicyId(int page = 1, int pageSize = 5, string orderBy = "invoiceId", string sortDirection = "asc", string query = "")
        {
            var invoices = await _invoiceService.GetUnpaidInvoicesByPolicyId(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(invoices);
        }

        [HttpGet("GetStatement")]
        public async Task<ActionResult<PagedRequestResult<Transaction>>> GetStatement(int policyId, DateTime startDate, DateTime endDate, int page = 1, int pageSize = 25, string orderBy = "transactionDate", string sortDirection = "asc", TransactionTypeEnum transactionType = TransactionTypeEnum.All, string query = "")
        {
            var statements = await _transactionService.GetStatement(policyId, startDate, endDate, transactionType, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(statements);
        }

        [HttpGet("GetStatementByRolePlayer/{rolePlayerId}")]
        public async Task<ActionResult<IEnumerable<Statement>>> GetStatementByRolePlayer(int rolePlayerId)
        {
            var statements = await _transactionService.GetStatementByRolePlayer(rolePlayerId);
            return Ok(statements);
        }

        [HttpGet("SearchDebtors/{query}")]
        public async Task<ActionResult<List<SearchAccountResults>>> SearchDebtors(string query)
        {
            var searchResults = await _invoiceService.SearchDebtors(query);
            return Ok(searchResults);
        }

        [HttpGet("GetStatementByPolicy/{policyId}")]
        public async Task<ActionResult<IEnumerable<Statement>>> GetStatementByPolicy(int policyId)
        {
            var statements = await _transactionService.GetStatementByPolicy(policyId);
            statements = statements.Where(s => s.Balance != 0).ToList();
            return Ok(statements);
        }

        [HttpGet("GetStatementByPolicyPaged/{policyId}/{page}/{pageSize}/")]
        public async Task<ActionResult<PagedRequestResult<Statement>>> GetStatementByPolicyPaged(int policyId, int page = 1, int pageSize = 5)
        {
            var statements = await _transactionService.GetStatementByPolicyPaged(policyId, new PagedRequest(string.Empty, page, pageSize));
            return Ok(statements);
        }

        [HttpGet("GetUnPaidInvoicesByPolicy/{policyId}")]
        public async Task<ActionResult<IEnumerable<InvoicePaymentAllocation>>> GetUnPaidInvoicesByPolicy(int policyId)
        {
            var unpaidInvoices = await _invoiceService.GetUnPaidInvoicesByPolicy(policyId);
            return Ok(unpaidInvoices);
        }

        [HttpGet("GetPendingInvoicesByPolicy/{policyId}")]
        public async Task<ActionResult<IEnumerable<Invoice>>> GetPendingInvoicesByPolicy(int policyId)
        {
            var pendingInvoices = await _invoiceService.GetPendingInvoicesByPolicy(policyId);
            return Ok(pendingInvoices);
        }

        [HttpGet("GetDebtorPendingInvoices/{policyId}")]
        public async Task<ActionResult<IEnumerable<Invoice>>> GetDebtorPendingInvoices(int policyId)
        {
            var invoices = await _invoiceService.GetDebtorPendingInvoices(policyId);
            return Ok(invoices);
        }

        [HttpGet("GetPaidInvoicesByPolicyId/{policyId}")]
        public async Task<ActionResult<Invoice>> GetPaidInvoicesByPolicyId(int policyId)
        {
            var invoices = await _invoiceService.GetPaidInvoicesByPolicyId(policyId);
            return Ok(invoices);
        }

        [HttpGet("GetDebitOrderReport/{periodYear}/{periodMonth}/{startDate}/{endDate}/{industryId}/{productId}/{debitOrderTypeId}/{accountNumber}")]
        public async Task<ActionResult<DebitOrder>> GetDebitOrderReport(int periodYear, int periodMonth, string startDate, string endDate, int industryId, int productId, int debitOrderTypeId, string accountNumber)
        {
            var debitOrders = await _invoiceService.GetDebitOrderReport(periodYear, periodMonth, startDate, endDate, industryId, productId, debitOrderTypeId, accountNumber);
            return Ok(debitOrders);
        }

        [HttpGet("GetUnallocatedPaymentsPaged/{dateType}/{dateFrom}/{dateTo}/{bankAccNumber}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<UnallocatedPayments>>> GetUnallocatedPayments(PaymentDateType dateType, DateTime dateFrom, DateTime dateTo, string bankAccNumber, int page = 1, int pageSize = 5, string orderBy = "UnallocatedPaymentId", string sortDirection = "asc", string query = "")
        {
            var unallocatedPayments = await _invoiceService.GetUnallocatedPaymentsPaged(dateType, dateFrom, dateTo, bankAccNumber, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(unallocatedPayments);
        }
        [HttpGet("GetUnallocatedPayments/{dateType}/{dateFrom}/{dateTo}/{bankAccNumber}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<UnallocatedPayments>>> GetUnallocatedPayments(PaymentDateType dateType, DateTime dateFrom, DateTime dateTo, string bankAccNumber = "", string query = "")
        {
            var unallocatedPayments = await _invoiceService.GetUnallocatedPayments(dateType, dateFrom, dateTo, bankAccNumber, query.Decode());
            return Ok(unallocatedPayments);
        }

        [HttpGet("GetAllocatedPayments/{startDate}/{endDate}/{dateType}/{bankAccNumber}/{productId}/{periodYear}/{periodMonth}")]
        public async Task<ActionResult<AllocatedPayment>> GetAllocatedPayments(string startDate, string endDate, int dateType, int productId, int periodYear, int periodMonth, string bankAccNumber = "")
        {
            var allocatedPayments = await _invoiceService.GetAllocatedPayments(startDate, endDate, dateType, bankAccNumber, productId, periodYear, periodMonth);
            return Ok(allocatedPayments);
        }

        [HttpGet("GetEuropeAssistPremiums")]
        public async Task<ActionResult<AllocatedPayment>> GetEuropeAssistPremiums()
        {
            var europAssistPremiums = await _invoiceService.GetEuropeAssistPremiums();
            return Ok(europAssistPremiums);
        }

        [HttpGet("BankStatementAnalysis")]
        public async Task<ActionResult<StatementAnalysis>> BankStatementAnalysis()
        {
            var analysis = await _invoiceService.BankStatementAnalysis();
            return Ok(analysis);
        }

        [HttpGet("GetStatementForRefund/{rolePlayerId}")]
        public async Task<ActionResult<IEnumerable<Statement>>> GetStatementForRefund(int rolePlayerId)
        {
            var statements = await _transactionService.GetStatementsForRefunds(rolePlayerId);
            return Ok(statements);
        }

        [HttpGet("GetStatementForReversal/{rolePlayerId}")]
        public async Task<ActionResult<IEnumerable<Statement>>> GetStatementForReversal(int rolePlayerId)
        {
            var statements = await _transactionService.GetStatementsForReversals(rolePlayerId);
            return Ok(statements);
        }

        [HttpGet("GetPartiallyAndUnpaidInvoicesByPolicyId/{rolePlayerPolicyId}")]
        public async Task<ActionResult<IEnumerable<Statement>>> GetPartiallyAndUnpaidInvoicesByPolicyId(int rolePlayerPolicyId)
        {
            var invoices = await _invoiceService.GetPartiallyAndUnpaidInvoicesByPolicyId(rolePlayerPolicyId);
            return Ok(invoices);
        }

        [HttpGet("GetTotalPendingRaisedForReinstatement/{rolePlayerPolicyId}/{effectiveDate}")]
        public async Task<ActionResult<decimal>> GetTotalPendingRaisedForReinstatement(int rolePlayerPolicyId, string effectiveDate)
        {
            var parsedEffectiveDate = DateTime.Parse(effectiveDate);
            var total = await _invoiceService.GetTotalPendingRaisedForReinstatement(rolePlayerPolicyId, parsedEffectiveDate);
            return Ok(total);
        }

        [HttpGet("GetTotalPendingRaisedForContinuation/{rolePlayerPolicyId}/{effectiveDate}")]
        public async Task<ActionResult<decimal>> GetTotalPendingRaisedForContinuation(int rolePlayerPolicyId, string effectiveDate)
        {
            var parsedEffectiveDate = DateTime.Parse(effectiveDate);
            var total = await _invoiceService.GetTotalPendingRaisedForContinuation(rolePlayerPolicyId, parsedEffectiveDate);
            return Ok(total);
        }

        [HttpPost("ReverseAllocation/{invoiceAllocationId}")]
        public async Task<ActionResult<bool>> ReverseAllocation(int invoiceAllocationId)
        {
            bool result = await _invoiceService.ReverseAllocation(invoiceAllocationId);
            return Ok(result);
        }

        [HttpGet("GetPolicyInvoices/{policyId}/{page}/{pageSize}/{orderBy}/{sortDirection}")]
        public async Task<ActionResult<PagedRequestResult<Invoice>>> GetPolicyInvoices(int policyId, int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc")
        {
            var searchResults = await _invoiceService.GetPolicyInvoices(policyId, new PagedRequest(string.Empty, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(searchResults);
        }

        [HttpGet("GetInvoiceType/{invoiceId}")]
        public async Task<ActionResult<InvoiceTypeEnum>> GetInvoiceType(int invoiceId)
        {
            InvoiceTypeEnum result = await _invoiceService.GetInvoiceTypeByInvoiceId(invoiceId);
            return Ok(result);
        }

        [HttpGet("GetStatementsForInterestReversals/{rolePlayerId}")]
        public async Task<ActionResult<IEnumerable<Statement>>> GetStatementsForInterestReversals(int rolePlayerId)
        {
            var statements = await _transactionService.GetStatementsForInterestReversals(rolePlayerId);
            return Ok(statements);
        }

        [HttpGet("SearchDebtorInvoices/{roleplayerId}/{statusId}/{searchString}/{page}/{pageSize}/{orderBy}/{sortDirection}")]
        public async Task<ActionResult<PagedRequestResult<Invoice>>> SearchDebtorInvoices(int roleplayerId, int statusId, string searchString, int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc")
        {
            var searchResults = await _invoiceService.SearchDebtorInvoices(roleplayerId, statusId, new PagedRequest(searchString, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(searchResults);
        }

        [HttpGet("SearchRolePlayerInvoices/{rolePlayerId}/{invoiceStatusId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Invoice>>> SearchRolePlayerInvoices(int rolePlayerId, int invoiceStatusId, int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var searchResults = await _invoiceService.SearchRolePlayerInvoices(rolePlayerId, invoiceStatusId, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(searchResults);
        }

        [HttpPost("EmailDebtorInvoice")]
        public async Task<ActionResult<bool>> EmailDebtorInvoice([FromBody] InvoiceSendRequest request)
        {
            var result = await _invoiceService.EmailDebtorInvoice(request);
            return Ok(result);
        }

        [HttpPost("EmailDebtorCreditNote")]
        public async Task<ActionResult<bool>> EmailDebtorCreditNote([FromBody] CreditNoteSendRequest request)
        {
            var result = await _invoiceService.EmailDebtorCreditNote(request);
            return Ok(result);
        }


        [HttpGet("SearchCreditNotes/{query}/{page}/{pageSize}/{orderBy}/{sortDirection}/{showActive}")]
        public async Task<ActionResult<List<CreditNoteSearchResult>>> SearchCreditNotes(string query, int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", bool showActive = true)
        {
            var searchResults = await _invoiceService.SearchCreditNotes(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), showActive);
            return Ok(searchResults);
        }

        [HttpPost("GetUnPaidInvoicesByPolicies")]
        public async Task<ActionResult<IEnumerable<InvoicePaymentAllocation>>> GetUnPaidInvoicesByPolicies([FromBody] InvoiceAllocationSearchRequest request)
        {
            var invoices = new List<InvoicePaymentAllocation>();
            if (request != null)
                invoices = await _invoiceService.GetUnPaidInvoicesByPolicies(request.RoleplayerId, request.PolicyIds);
            return Ok(invoices);
        }

        [HttpPost("GetUnPaidInvoicesForPolicies")]
        public async Task<ActionResult<IEnumerable<InvoicePaymentAllocation>>> GetUnPaidInvoicesForPolicies([FromBody] InvoiceAllocationSearchRequest request)
        {
            if (request != null)
            {
                var results = await _invoiceService.GetUnPaidInvoicesForPolicies(request.RoleplayerId, request.PolicyIds);
                return Ok(results);
            }
            return Ok();
        }

        [HttpGet("GetInvoiceDocument/{invoiceId}")]
        public async Task<ActionResult<InvoiceDocumentModel>> GetInvoiceDocument(int invoiceId)
        {
            var result = await _invoiceService.GetInvoiceDocument(invoiceId);
            return Ok(result);
        }

        [HttpGet("GetDebtorOpeningAndClosingBalances/{roleplayerId}")]
        public async Task<ActionResult<List<DebtorOpeningClosingDetail>>> GetDebtorOpeningAndClosingBalances(int roleplayerId)
        {
            var result = await _invoiceService.GetDebtorOpeningAndClosingBalances(roleplayerId);
            return Ok(result);
        }

        [HttpGet("ProcessQueuedInvoicesAndCreditNotes")]
        public async Task<bool> ProcessQueuedInvoicesAndCreditNotes()
        {
            await _invoiceService.ProcessQueuedInvoicesAndCreditNotes();
            return true;
        }

        [HttpGet("MonitorCancelledPolicyInvoices")]
        public async Task<bool> MonitorCancelledPolicyInvoices()
        {
            await _invoiceService.MonitorCancelledPolicyInvoices();
            return true;
        }
    }
}
