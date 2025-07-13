using Microsoft.AspNetCore.Mvc;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities.PolicyPaymentAllocation;
using RMA.Service.Billing.Contracts.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Api.Controllers
{
    [Route("api/Billing/[controller]")]

    public class PaymentAllocationController : RmaApiController
    {

        private readonly IPaymentAllocationService _paymentAllocationService;
        private readonly ITransactionService _transactionService;
        private readonly IInterDebtorTransferService _interDebtorTransferService;

        public PaymentAllocationController(IPaymentAllocationService paymentAllocationService, ITransactionService transactionService, IInterDebtorTransferService interDebtorTransferService)
        {
            _paymentAllocationService = paymentAllocationService;
            _transactionService = transactionService;
            _interDebtorTransferService = interDebtorTransferService;
        }
        [HttpGet("GetUnAllocatedPaymentById/{unallocatedPaymentId}")]
        public async Task<ActionResult<UnallocatedBankImportPayment>> GetUnAllocatedPaymentById(int unallocatedPaymentId)
        {
            var unallocatedPayments = await _paymentAllocationService.GetUnallocatedPayment(unallocatedPaymentId);
            return Ok(unallocatedPayments);
        }

        [HttpGet("GetUnAllocatedPayments")]
        public async Task<ActionResult<IEnumerable<UnallocatedBankImport>>> GetUnAllocatedPayments()
        {
            var unallocatedPayments = await _paymentAllocationService.GetUnAllocatedPayments();
            return Ok(unallocatedPayments);
        }

        [HttpGet("SearchUnAllocatedPayments/{query}")]
        public async Task<ActionResult<IEnumerable<UnallocatedBankImport>>> SearchUnAllocatedPayments(string query)
        {
            var unallocatedPayments = await _paymentAllocationService.SearchUnAllocatedPayments(query);
            return Ok(unallocatedPayments);
        }

        [HttpPost("ManualAllocations")]
        public async Task<ActionResult<bool>> ManualAllocations([FromBody] List<ManualPaymentAllocation> manualPaymentAllocations)
        {
            bool processed = false;
            if (manualPaymentAllocations != null)
            {
                var allocationsToInvoice = new List<ManualPaymentAllocation>();
                var allocationsToDebtor = new List<ManualPaymentAllocation>();
                var allocationsToDebit = new List<ManualPaymentAllocation>();

                var maintainInvoiceAllocation = manualPaymentAllocations[0].AllocationType == AllocationTypeCodeEnum.Inv.GetDescription().ToUpper() || manualPaymentAllocations[0].AllocationType == AllocationTypeCodeEnum.Rec.GetDescription().ToUpper();

                foreach (var manualPaymentAllocation in manualPaymentAllocations)
                {
                    if (manualPaymentAllocation.InvoiceId == 0 && manualPaymentAllocation.ClaimRecoveryInvoiceId == 0 && manualPaymentAllocations[0].AllocationType != AllocationTypeCodeEnum.Tra.GetDescription().ToUpper())
                    {
                        allocationsToDebtor.Add(manualPaymentAllocation);
                    }
                    else if (manualPaymentAllocation.DebitTransaction != null && manualPaymentAllocations[0].AllocationType == AllocationTypeCodeEnum.Tra.GetDescription().ToUpper())
                    {
                        manualPaymentAllocation.DebitTransaction.Balance += manualPaymentAllocation.AllocatedAmount;
                        allocationsToDebit.Add(manualPaymentAllocation);
                    }
                    else
                    {
                        allocationsToInvoice.Add(manualPaymentAllocation);
                    }
                }

                if (allocationsToInvoice.Count > 0)
                {
                    processed = await _paymentAllocationService.AllocatePaymentsToInvoices(manualPaymentAllocations);
                }

                if (allocationsToDebit.Count > 0)
                {
                    processed = await _paymentAllocationService.DoDebitTransactionAllocations(manualPaymentAllocations);
                }

                if (allocationsToDebtor.Count > 0)
                {
                    if (maintainInvoiceAllocation)
                    {
                        processed = await _paymentAllocationService.AllocatePaymentsToInvoices(manualPaymentAllocations);
                    }
                    else
                    {
                        processed = await _paymentAllocationService.AllocatePaymentsToDebtor(manualPaymentAllocations);
                    }
                }
            }

            return Ok(processed);
        }

        [HttpGet("GetPaymentTransactionsAllocatedToDebtorAccount/{rolePlayerId}")]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetPaymentTransactionsAllocatedToDebtorAccount(int rolePlayerId)
        {
            return await _paymentAllocationService.GetPaymentTransactionsAllocatedToDebtorAccount(rolePlayerId);
        }

        [HttpGet("GetTransactionAllocatedToDebtorAccount/{transactionId}")]
        public async Task<ActionResult<Transaction>> GetTransactionAllocatedToDebtorAccount(int transactionId)
        {
            return await _paymentAllocationService.GetTransactionAllocatedToDebtorAccount(transactionId);
        }

        [HttpGet("GetTransaction/{transactionId}")]
        public async Task<ActionResult<Transaction>> GetTransaction(int transactionId)
        {
            return await _paymentAllocationService.GetTransaction(transactionId);
        }

        [HttpGet("GetDebtorRefunds/{rolePlayerId}")]
        public async Task<ActionResult<IEnumerable<RefundHeader>>> GetDebtorRefunds(int rolePlayerId)
        {
            return await _transactionService.GetDebtorRefunds(rolePlayerId);
        }

        [HttpGet("GetDebtorInterDebtorTransfers/{rolePlayerId}")]
        public async Task<ActionResult<IEnumerable<InterDebtorTransfer>>> GetDebtorInterDebtorTransfers(int rolePlayerId)
        {
            return await _interDebtorTransferService.GetDebtorInterDebtorTransfers(rolePlayerId);
        }

        [HttpPost("DoDebitTransactionAllocations")]
        public async Task<ActionResult<bool>> DoDebitTransactionAllocations([FromBody] List<ManualPaymentAllocation> manualPaymentAllocations)
        {
            var processed = await _paymentAllocationService.DoDebitTransactionAllocations(manualPaymentAllocations);
            return Ok(processed);
        }

        [HttpPost("BulkManualAllocations")]
        public async Task<ActionResult<int>> BulkManualAllocations([FromBody] FileContentModel content)
        {
            var count = await _paymentAllocationService.BulkManualAllocations(content);
            return Ok(count);
        }

        [HttpGet("GetBulkPaymentFileDetails/{fileId}")]
        public async Task<ActionResult<List<BulkManualAllocation>>> GetBulkPaymentFileDetails(int fileId)
        {
            return await _paymentAllocationService.GetBulkPaymentFileDetails(fileId);
        }

        [HttpGet("GetBulkPaymentFiles")]
        public async Task<ActionResult<List<BulkAllocationFile>>> GetBulkPaymentFiles()
        {
            var results = await _paymentAllocationService.GetBulkPaymentFiles();
            return Ok(results);
        }

        [HttpPost("EditBulkAllocations")]
        public async Task<ActionResult<int>> EditBulkAllocations([FromBody] List<BulkManualAllocation> content)
        {
            var count = await _paymentAllocationService.EditBulkAllocations(content);
            return Ok(count);
        }


        [HttpPost("DeleteBulkAllocations")]
        public async Task<ActionResult<int>> DeleteBulkAllocations([FromBody] List<int> content)
        {
            var count = await _paymentAllocationService.DeleteBulkAllocations(content);
            return Ok(count);
        }

        [HttpPost("AllocatePremiumPaymentToDebtorAndInvoice")]
        public async Task<ActionResult<int>> AllocatePremiumPaymentToDebtorAndInvoice(PremiumPaymentRequest request)
        {
            var results = await _paymentAllocationService.AllocatePremiumPaymentToDebtorAndInvoice(request);
            return Ok(results);
        }

        [HttpGet("GetTransactionInvoiceAllocations/{transactionId}")]
        public async Task<ActionResult<List<InvoiceAllocation>>> GetTransactionInvoiceAllocations(int transactionId)
        {
            var results = await _paymentAllocationService.GetTransactionInvoiceAllocations(transactionId);
            return Ok(results);

        }

        [HttpPost("ExceptionFailedlAllocations")]
        public async Task<ActionResult<int>> ExceptionFailedlAllocations([FromBody] FileContentModel content)
        {
            var count = await _paymentAllocationService.ExceptionFailedlAllocations(content);
            return Ok(count);
        }

        [HttpGet("GetExceptionAllocationFiles")]
        public async Task<ActionResult<List<ExcptionAllocationFile>>> GetExceptionAllocationFiles()
        {
            var results = await _paymentAllocationService.GetExceptionAllocationFiles();
            return Ok(results);
        }

        [HttpGet("GetExceptionAllocationDetails/{fileId}")]
        public async Task<ActionResult<List<ExceptionAllocation>>> GetExceptionAllocationDetails(int fileId)
        {
            return await _paymentAllocationService.GetExceptionAllocationDetails(fileId);
        }

        [HttpGet("GetBulkPaymentAllocationFiles/{startDate}/{endDate}/{pageNumber}/{pageSize}/{orderBy}/{sort}")]
        public async Task<ActionResult<PagedRequestResult<BulkAllocationFile>>> GetBulkPaymentAllocationFiles( string startDate, string endDate, int pageNumber, int pageSize
                                                                                    , string orderBy, string sort)
        {
            var result = await _paymentAllocationService.GetBulkPaymentAllocationFiles(startDate, endDate, pageNumber, pageSize
                                                                                    , orderBy, sort);
            return Ok(result);
        }

        [HttpPost("AllocatePaymentToPolicy")]
        public async Task<ActionResult<bool>> AllocatePaymentToPolicy([FromBody] AllocatePaymentToPolicyRequest input)
        {
            var result = await _paymentAllocationService.AllocatePaymentToPolicy(input);
            return Ok(result);
        }

        [HttpPost("TransferPaymentFromPolicyToPolicy")]
        public async Task<ActionResult<bool>> TransferPaymentFromPolicyToPolicy([FromBody] TransferPaymentFromPolicyToPolicyRequest input)
        {
            var result = await _paymentAllocationService.TransferPaymentFromPolicyToPolicy(input);
            return Ok(result);
        }

        [HttpGet("GetPolicyPaymentTransactions/{policyId}/{billingMonth}")]
        public async Task<ActionResult<PolicyPaymentTransaction>> FetchPolicyPaymentTransactionsForBillingMonth(int policyId, DateTime billingMonth)
        {
            var result = await _paymentAllocationService.FetchPolicyPaymentTransactionsForBillingMonth(policyId, billingMonth);
            return Ok(result);
        }

        [HttpPost("ReversePolicyPayment")]
        public async Task<ActionResult<bool>> ReversePolicyPayment([FromBody] ReversePolicyPaymentRequest input)
        {
            var result = await _paymentAllocationService.ReversePaymentsAllocated(input);
            return Ok(result);
        }
    }
}