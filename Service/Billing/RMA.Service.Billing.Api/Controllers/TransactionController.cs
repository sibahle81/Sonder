using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Api.Controllers
{
    [Route("api/billing/[controller]")]

    public class TransactionController : RmaApiController
    {
        private readonly ITransactionService _transactionService;

        public TransactionController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Transaction>>> Get()
        {
            var result = await _transactionService.GetTransactions();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Transaction>> Get(int id)
        {
            var transaction = await _transactionService.GetTransaction(id);
            return Ok(transaction);
        }

        [HttpPost("CreateCreditNote")]
        public async Task<ActionResult<List<Transaction>>> CreateCreditNote([FromBody] Transaction transaction)
        {
            if (transaction != null)
                transaction.TransactionType = TransactionTypeEnum.CreditNote;
            var result = await _transactionService.AddTransaction(transaction);
            return Ok(result);
        }

        [HttpPost("CreateCreditNotes")]
        public async Task<ActionResult<List<Transaction>>> CreateCreditNote(List<Transaction> transactions)
        {
            if (transactions?.Count > 0)
            {
                foreach (var transaction in transactions)
                {
                    transaction.TransactionType = TransactionTypeEnum.CreditNote;
                }

                await _transactionService.AddTransactions(transactions);
            }
            return Ok();
        }

        [HttpGet("GetTransactionByRoleplayerId/{roleplayerId}")]
        public async Task<ActionResult<List<Transaction>>> GetTransactionByRoleplayerId(int roleplayerId)
        {
            var result = await _transactionService.GetTransactionByRoleplayerId(roleplayerId);
            return Ok(result);
        }

        [HttpGet("GetTransactionByRoleplayerIdAndTransactionType/{roleplayerId}/{transactionType}")]
        public async Task<ActionResult<List<Transaction>>> GetTransactionByRoleplayerIdAndTransactionType(int roleplayerId, TransactionTypeEnum transactionType)
        {
            var result = await _transactionService.GetTransactionByRoleplayerIdAndTransactionType(roleplayerId, transactionType);
            return Ok(result);
        }

        [HttpPost("CreatePaymentTransactionReversals")]
        public async Task<ActionResult<bool>> CreatePaymentTransactionReversals([FromBody] TransactionsReversalRequest request)
        {
            if (request?.TransactionIds?.Count > 0)
            {
                await _transactionService.ReversePaymentTransactionsByIds(request);
            }
            return Ok();
        }

        [HttpGet("GetTransactionsForTransfer/{debtorNumber}")]
        public async Task<ActionResult<List<Transaction>>> GetTransactionsForTransfer(string debtorNumber)
        {
            var result = await _transactionService.GetTransactionsForTransfer(debtorNumber);
            return Ok(result);
        }

        [HttpGet("GetCurrentPeriodDebtorBalance/{roleplayerId}")]
        public async Task<ActionResult<decimal>> GetCurrentPeriodDebtorBalance(int roleplayerId)
        {
            var result = await _transactionService.GetCurrentPeriodDebtorBalance(roleplayerId);
            return Ok(result);
        }

        [HttpGet("GetDebtorNetBalance/{roleplayerId}")]
        public async Task<ActionResult<decimal>> GetDebtorNetBalance(int roleplayerId)
        {
            var result = await _transactionService.GetDebtorNetBalance(roleplayerId);
            return Ok(result);
        }

        [HttpGet("GetTransactionsForReAllocation/{roleplayerId}/{transactionType}")]
        public async Task<ActionResult<List<Transaction>>> GetTransactionsForReAllocation(int roleplayerId, TransactionTypeEnum transactionType)
        {
            var result = await _transactionService.GetTransactionsForReAllocation(roleplayerId, transactionType);
            return Ok(result);
        }

        [HttpGet("GetTransactionsForReAllocationByPolicy/{policyId}/{transactionType}")]
        public async Task<ActionResult<List<Transaction>>> GetTransactionsForReAllocationByPolicy(int policyId, TransactionTypeEnum transactionType)
        {
            var result = await _transactionService.GetTransactionsForReAllocationByPolicy(policyId, transactionType);
            return Ok(result);
        }

        [HttpGet("GetTransactionsForReversal/{roleplayerId}/{transactionType}")]
        public async Task<ActionResult<List<Transaction>>> GetTransactionsForReversal(int roleplayerId, TransactionTypeEnum transactionType)
        {
            var result = await _transactionService.GetTransactionsForReversal(roleplayerId, transactionType);
            return Ok(result);
        }

        [HttpGet("GetDebitTransactionsForAllocation/{roleplayerId}/{amount}")]
        public async Task<ActionResult<List<Transaction>>> GetDebitTransactionsForAllocation(int roleplayerId, decimal amount)
        {
            var result = await _transactionService.GetDebitTransactionsForAllocation(roleplayerId, amount);
            return Ok(result);
        }

        [HttpPost("GetTransactionsForRefund")]
        public async Task<ActionResult<List<CreditTransaction>>> GetTransactionsForRefund([FromBody] RefundTransactionsRequest request)
        {
            var result = await _transactionService.GetTransactionsForRefund(request);
            return Ok(result);
        }

        [HttpGet("GetPremiumListingTransactions/{policyId}")]
        public async Task<ActionResult<List<PremiumListingTransaction>>> GetPremiumListingTransactions(int policyId)
        {
            var result = await _transactionService.GetPremiumListingTransactions(policyId);
            return Ok(result);
        }

        [HttpGet("PremiumListingTransactionsForPolicy/{policyId}/{page}/{pageSize}/{orderBy}/{sortDirection}")]
        public async Task<ActionResult<PagedRequestResult<PremiumListingTransaction>>> GetPremiumListingTransactionsForPolicy(
            string policyId = "0", int page = 1, int pageSize = 5, string orderBy = "InvoiceDate", string sortDirection = "asc")
        {
            var request = new PagedRequest(policyId, page, pageSize, orderBy, sortDirection == "asc");
            var result = await _transactionService.GetPremiumListingTransactionsForPolicy(request);
            return Ok(result);
        }

        [HttpGet("PremiumListingTransactionsTotal/{policyId}")]
        public async Task<ActionResult<double>> GetPremiumListingTransactionsTotal(int policyId)
        {
            var result = await _transactionService.GetPremiumListingTransactionsTotal(policyId);
            return Ok(result);
        }

        [HttpGet("GetPaymentsForReturnAllocation/{roleplayerId}/{paymentReturnAmount}")]
        public async Task<ActionResult<List<Transaction>>> GetTransactionByRoleplayerId(int roleplayerId, decimal paymentReturnAmount)
        {
            var result = await _transactionService.GetPaymentsForReturnAllocation(roleplayerId, paymentReturnAmount);
            return Ok(result);
        }

        [HttpGet("GetTransactionByRoleplayerIdAndDate/{roleplayerId}/{transactionType}/{startDate}/{endDate}/")]
        public async Task<ActionResult<List<Transaction>>> GetTransactionByRoleplayerIdAndDate(int roleplayerId, TransactionTypeEnum transactionType, DateTime startDate, DateTime endDate)
        {
            var result = await _transactionService.GetTransactionByRoleplayerIdAndDate(roleplayerId, transactionType, startDate, endDate);
            return Ok(result);
        }

        [HttpPost("ReverseDebitTransactionsForOpenPeriod")]
        public async Task<ActionResult<bool>> ReverseDebitTransactionsForOpenPeriod([FromBody] List<int> transactionIds)
        {
            await _transactionService.ReverseDebitTransactionsForOpenPeriodByIds(transactionIds);
            return Ok();
        }

        [HttpPost("BackDateTransactions")]
        public async Task<ActionResult<bool>> BackDateTransactions([FromBody] TransactionsBackDatingRequest request)
        {
            if (request == null)
                return BadRequest();

            await _transactionService.BackDateTransactions(request);
            return Ok();
        }

        [HttpPost("GetTransactionsByIds")]
        public async Task<ActionResult<bool>> GetTransactionsByIds([FromBody] List<int> transactionIds)
        {
            var results = await _transactionService.GetTransactionsByIds(transactionIds);
            return Ok(results);
        }

        [HttpPost("DownwardAdjustment")]
        public async Task<ActionResult<bool>> DownwardTransactionAdjustment([FromBody] TransactionAdjustment request)
        {
            if (request == null)
                return BadRequest();

            await _transactionService.DoDownwardTransactionAdjustment(request);
            return Ok();
        }

        [HttpPost("UpwardAdjustment")]
        public async Task<ActionResult<bool>> UpwardTransactionAdjustment([FromBody] TransactionAdjustment request)
        {
            if (request == null)
                return BadRequest();

            await _transactionService.DoUpwardTransactionAdjustment(request);
            return Ok();
        }

        [HttpPost("OpenPeriodInterestAdjustment")]
        public async Task<ActionResult<bool>> OpenPeriodInterestAdjustment([FromBody] TransactionAdjustment request)
        {
            if (request == null)
                return BadRequest();

            await _transactionService.DoOpenPeriodInterestAdjustment(request);
            return Ok();
        }

        [HttpGet("GetDebtorInvoiceTransactionHistory/{roleplayerId}")]
        public async Task<ActionResult<List<Statement>>> GetDebtorInvoiceTransactionHistory(int roleplayerId)
        {
            var result = await _transactionService.GetDebtorInvoiceTransactionHistory(roleplayerId);
            return Ok(result);
        }

        [HttpGet("GetInvoiceMonthsPendingInterest/{invoiceTransactionId}")]
        public async Task<ActionResult<List<PendingInterestDate>>> GetInvoiceMonthsPendingInterest(int invoiceTransactionId)
        {
            var result = await _transactionService.GetInvoiceMonthsPendingInterest(invoiceTransactionId);
            return Ok(result);
        }

        [HttpGet("GetDebtorInterestTransactionHistory/{rolePlayerId}")]
        public async Task<ActionResult<IEnumerable<Statement>>> GetDebtorInterestTransactionHistory(int rolePlayerId)
        {
            var statements = await _transactionService.GetDebtorInterestTransactionHistory(rolePlayerId);
            return Ok(statements);
        }

        [HttpPost("CreateAdhocInterestForSpecifiedDates")]
        public async Task<ActionResult<bool>> CreateAdhocInterestForSpecifiedDates([FromBody] AdhocInterestRequest request)
        {
            await _transactionService.CreateAdhocInterestForSpecifiedDates(request);
            return Ok();
        }

        [HttpPost("WriteOffBadDebt")]
        public async Task<ActionResult<bool>> WriteOffBadDebt([FromBody] BadDebtWriteOffRequest request)
        {
            await _transactionService.WriteOffBadDebt(request);
            return Ok();
        }

        [HttpPost("GetDebtorInvoiceTransactionHistoryByPolicy")]
        public async Task<ActionResult<List<Statement>>> GetDebtorInvoiceTransactionHistoryByPolicy([FromBody] DebtorStatementRequest request)
        {
            var result = await _transactionService.GetDebtorInvoiceTransactionHistoryByPolicy(request);
            return Ok(result);
        }

        [HttpPost("GetDebtorInterestTransactionHistoryByPolicy")]
        public async Task<ActionResult<List<Statement>>> GetDebtorInterestTransactionHistoryByPolicy([FromBody] DebtorStatementRequest request)
        {
            var result = await _transactionService.GetDebtorInterestTransactionHistoryByPolicy(request);
            return Ok(result);
        }

        [HttpPost("GetInvoiceTransactionsWrittenOffByPolicy")]
        public async Task<ActionResult<List<Statement>>> GetInvoiceTransactionsWrittenOffByPolicy([FromBody] DebtorStatementRequest request)
        {
            var result = await _transactionService.GetInvoiceTransactionsWrittenOffByPolicy(request);
            return Ok(result);
        }

        [HttpPost("GetTransactionsWrittenOffByRolePlayer")]
        public async Task<ActionResult<List<Statement>>> GetTransactionsWrittenOffByRolePlayer([FromBody] DebtorStatementRequest request)
        {
            var result = await _transactionService.GetTransactionsWrittenOffByRolePlayer(request);
            return Ok(result);
        }

        [HttpPost("GetInterestTransactionsWrittenOffByPolicy")]
        public async Task<ActionResult<List<Statement>>> GetInterestTransactionsWrittenOffByPolicy([FromBody] DebtorStatementRequest request)
        {
            var result = await _transactionService.GetInterestTransactionsWrittenOffByPolicy(request);
            return Ok(result);
        }

        [HttpPost("ReinstateBadDebt")]
        public async Task<ActionResult<bool>> ReinstateBadDebt([FromBody] BadDebtReinstateRequest request)
        {
            var result = await _transactionService.ReinstateBadDebt(request);
            return Ok(result);
        }

        [HttpGet("GetDebtorInvoiceTransactionHistoryForAdhocInterest/{roleplayerId}")]
        public async Task<ActionResult<List<Statement>>> GetDebtorInvoiceTransactionHistoryForAdhocInterest(int roleplayerId)
        {
            var result = await _transactionService.GetDebtorInvoiceTransactionHistoryForAdhocInterest(roleplayerId);
            return Ok(result);
        }

        [HttpPost("GetTransactionsForTransferByAccountNumber")]
        public async Task<ActionResult<List<Transaction>>> GetTransactionsForTransferByAccountNumber([FromBody] InterDebtorTransactionRequest request)
        {
            var results = await _transactionService.GetTransactionsForTransferByAccountNumber(request);
            return Ok(results);
        }

        [HttpPost("GetDebtorsByAccountNumber")]
        public async Task<ActionResult<List<DebtorAccountNumberModel>>> GetDebtorsByAccountNumber([FromBody] InterDebtorToDebtorRequest request)
        {
            var results = await _transactionService.GetDebtorsByAccountNumber(request);
            return Ok(results);
        }

        [HttpPost("ReallocateCredit")]
        public async Task<ActionResult<bool>> ReallocateCredit([FromBody] TransactionTransfer request)
        {
            var results = await _transactionService.ReallocateCredit(request);
            return Ok(results);
        }

        [HttpPost("GetDebtorOpenTransactions")]
        public async Task<ActionResult<List<Statement>>> GetDebtorOpenTransactions([FromBody] DebtorOpenTransactionsRequest request)
        {
            var results = await _transactionService.GetDebtorOpenTransactions(request);
            return Ok(results);
        }

        [HttpGet("GetHistoryDebtorBalance/{roleplayerId}")]
        public async Task<ActionResult<decimal>> GetHistoryDebtorBalance(int roleplayerId)
        {
            var results = await _transactionService.GetHistoryDebtorBalance(roleplayerId);
            return Ok(results);
        }

        [HttpPost("ReallocateDebtorBalance")]
        public async Task<ActionResult<bool>> ReallocateDebtorBalance([FromBody] DebtorCreditReallocationRequest request)
        {
            var results = await _transactionService.ReallocateDebtorBalance(request);
            return Ok(results);
        }

        [HttpGet("GetReclassificationBalanceByPolicy/{roleplayerId}/{policyId}")]
        public async Task<ActionResult<decimal>> GetReclassificationBalanceByPolicy(int roleplayerId, int policyId)
        {
            var results = await _transactionService.GetReclassificationBalanceByPolicy(roleplayerId, policyId);
            return Ok(results);
        }

        [HttpGet("GetCancellationBalanceByPolicy/{roleplayerId}/{policyId}")]
        public async Task<ActionResult<decimal>> GetCancellationBalanceByPolicy(int roleplayerId, int policyId)
        {
            var results = await _transactionService.GetCancellationBalanceByPolicy(roleplayerId, policyId);
            return Ok(results);
        }

        [HttpGet("GetDebtorCreditBalance/{roleplayerId}")]
        public async Task<ActionResult<decimal>> GetDebtorCreditBalance(int roleplayerId)
        {
            var results = await _transactionService.GetDebtorCreditBalance(roleplayerId);
            return Ok(results);
        }

        [HttpGet("GetDebtorReclassficationRefundBreakDown/{roleplayerId}")]
        public async Task<ActionResult<List<DebtorProductCategoryBalance>>> GetDebtorReclassficationRefundBreakDown(int roleplayerId)
        {
            var results = await _transactionService.GetDebtorReclassficationRefundBreakDown(roleplayerId);
            return Ok(results);
        }

        [HttpGet("GetDebtorCancellationRefundBreakDown/{roleplayerId}")]
        public async Task<ActionResult<List<DebtorProductCategoryBalance>>> GetDebtorCancellationRefundBreakDown(int roleplayerId)
        {
            var results = await _transactionService.GetDebtorCancellationRefundBreakDown(roleplayerId);
            return Ok(results);
        }

        [HttpGet("GetDebtorClaimRecoveriesBalance/{roleplayerId}")]
        public async Task<ActionResult<List<DebtorProductCategoryBalance>>> GetDebtorClaimRecoveriesBalance(int roleplayerId)
        {
            var results = await _transactionService.GetDebtorClaimRecoveriesBalance(roleplayerId);
            return Ok(results);
        }

        [HttpPost("GetBouncedTransactionsForTransfer")]
        public async Task<ActionResult<List<Transaction>>> GetBouncedTransactionsForTransfer([FromBody] InterDebtorTransactionRequest request)
        {
            var results = await _transactionService.GetBouncedTransactionsForTransfer(request);
            return Ok(results);
        }

        [HttpGet("GetPremiumAllocatedTransactionsByRoleplayer/{roleplayerId}/{transactionType}/{startDate}/{endDate}/")]
        public async Task<ActionResult<List<Transaction>>> GetPremiumAllocatedTransactionsByRoleplayer(int roleplayerId, TransactionTypeEnum transactionType, DateTime startDate, DateTime endDate)
        {
            var result = await _transactionService.GetPremiumAllocatedTransactionsByRoleplayer(roleplayerId, transactionType, startDate, endDate);
            return Ok(result);
        }

        [HttpPost("GetPagedTransactions")]
        public async Task<ActionResult<PagedRequestResult<Transaction>>> GetPagedTransactions([FromBody] TransactionSearchRequest transactionSearchRequest)
        {
            var results = await _transactionService.GetPagedTransactions(transactionSearchRequest);
            return Ok(results);
        }
    }
}