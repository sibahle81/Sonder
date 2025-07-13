using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.FinCare.Contracts.Entities.Payments;
using RMA.Service.FinCare.Contracts.Enums;
using RMA.Service.FinCare.Contracts.Interfaces.Payments;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Api.Controllers.Payment
{
    public class PaymentController : RmaApiController
    {
        private readonly IPaymentService _paymentService;
        private readonly IPaymentCreatorService _paymentCreatorService;
        private readonly IPaymentCommunicationService _paymentCommunicationService;

        public PaymentController(IPaymentService paymentService, IPaymentCreatorService paymentCreatorService, IPaymentCommunicationService paymentCommunicationService)
        {
            _paymentService = paymentService;
            _paymentCreatorService = paymentCreatorService;
            _paymentCommunicationService = paymentCommunicationService;
        }

        [HttpPost("SubmitPendingPayments")]
        public async Task<ActionResult> SubmitPendingPayments()
        {
            await _paymentService.QueuePendingPayments();
            return Ok();
        }

        [HttpPost("DoPaymentReconciliations")]
        public async Task<ActionResult> ProcessBankStatements()
        {
            await _paymentService.DoPaymentReconciliations();
            return Ok();
        }

        //GET: fin/api/Payment/Payment/{paymentType}/{paymentStatus}/{claimType}/startDate}/{endDate}
        [HttpGet("GetPayments")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Payments.Payment>>> GetPayments(DateTime startDate, DateTime endDate,
            PaymentTypeEnum? paymentType = null, PaymentStatusEnum? paymentStatus = null, EntityType entityType = EntityType.All, int pageSize = 0, int pageIndex = 0)
        {
            var payments = await _paymentService.Get(paymentType, paymentStatus, startDate, endDate, entityType, pageSize, pageIndex);
            return Ok(payments);
        }


        //GET: fin/api/Payment/Payment/Search/{query}/{searchFilterTypeId}
        [HttpGet("Search/{query}/{searchFilterTypeId}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Payments.Payment>>> Search(string query,
            int searchFilterTypeId)
        {
            var searchResults = await _paymentService.Search(query, searchFilterTypeId);
            return Ok(searchResults);
        }

        //PUT: fin/api/Payment/Payment/SubmitPayment/{paymentId}
        [HttpPost("SubmitPayment/{paymentId}")]
        public async Task<ActionResult<Contracts.Entities.Payments.Payment>> SubmitPayment(int paymentId)
        {
            var result = await _paymentService.QueuePayment(paymentId, string.Empty);
            return Ok(result);
        }

        //PUT: fin/api/Payment/Payment/SubmitPayments/{payment}
        [HttpPut("SubmitPayments")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Payments.Payment>>> SubmitPayments(
           [FromBody] List<Contracts.Entities.Payments.Payment> payments)
        {
            await _paymentService.QueuePayments(payments, string.Empty);
            return Ok();
        }

        [HttpPut("ProcessTaxPayments")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Payments.Payment>>> ProcessTaxPayments(
           [FromBody] List<Contracts.Entities.Payments.Payment> payments)
        {
            await _paymentService.ProcessTaxPayments(payments, string.Empty);
            return Ok();
        }

        //PUT: fin/api/Payment/Payment/ReversePayment/{payment}
        [HttpPut("ReversePayment")]
        public async Task<ActionResult<Contracts.Entities.Payments.Payment>> ReversePayment([FromBody] Contracts.Entities.Payments.Payment payment)
        {
            var result = await _paymentService.ReversePayment(payment);
            return Ok(result);
        }

        //PUT: fin/api/Payment/Payment/UpdateEmailAddress/{paymentId}}
        [HttpPut("UpdateEmailAddress/{paymentId}")]
        public async Task<ActionResult<Contracts.Entities.Payments.Payment>> UpdateEmailAddress(int paymentId, [FromBody] string emailAddress)
        {
            var result = await _paymentService.UpdateEmailAddress(paymentId, emailAddress);
            return Ok(result);
        }

        [HttpPost("SendPaymentNotification/{paymentId}")]
        public async Task<ActionResult<Contracts.Entities.Payments.Payment>> SendPaymentNotification(int paymentId)
        {
            var result = await _paymentService.SendNotification(paymentId);

            return Ok(result);
        }

        [HttpPut("SendRemittanceNotification")]
        public async Task<ActionResult<Contracts.Entities.Payments.Payment>> SendRemittanceNotification(
            [FromBody] Contracts.Entities.Payments.Payment payment)
        {
            bool result = false;

            if (payment != null)
            {
                result = payment.PaymentStatus == PaymentStatusEnum.Rejected
                    ? await _paymentService.SendPaymentRejectionNotification(payment, true)
                    : await _paymentCommunicationService.SendRemittance(payment.PaymentId);
            }

            return Ok(result);
        }

        //PUT: fin/api/Finance/Payment/UpdateFsbAccreditation/{payment}
        [HttpPut("UpdateFsbAccreditation")]
        public async Task<ActionResult<Contracts.Entities.Payments.Payment>> UpdateFsbAccreditation(
            [FromBody] Contracts.Entities.Payments.Payment payment)
        {
            if (payment == null)
            {
                throw new ArgumentNullException(nameof(payment));
            }
            //BUG: update the input params to only accept the two used params
            var result = await _paymentService.UpdateFsbAccreditation(payment.PaymentId, payment.FsbAccredited.Value);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Contracts.Entities.Payments.Payment payment)
        {
            var paymentId = await _paymentCreatorService.Create(payment);
            return Ok(paymentId);
        }

        [HttpPost("Multiple")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Payments.Payment>>> AddPayments(
           [FromBody] List<Contracts.Entities.Payments.Payment> payments)
        {
            var id = await _paymentCreatorService.AddPayments(payments);
            return Ok(id);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Contracts.Entities.Payments.Payment>> Get(int id)
        {
            var payment = await _paymentService.GetById(id);
            return Ok(payment);
        }

        [HttpGet("GetByPolicyId/{id}")]
        public async Task<ActionResult<Contracts.Entities.Payments.Payment>> GetByPolicyId(int id)
        {
            var payment = await _paymentService.GetByPolicyId(id);
            return Ok(payment);
        }

        [HttpGet("GetPaymentsByPolicyId/{id}")]
        public async Task<ActionResult<List<Contracts.Entities.Payments.Payment>>> GetPaymentsByPolicyId(int id)
        {
            var payments = await _paymentService.GetPaymentsByPolicyId(id);
            return Ok(payments);
        }

        [HttpGet("GetPaymentByClaimId/{id}")]
        public async Task<ActionResult<Contracts.Entities.Payments.Payment>> GetPaymentByClaimId(int id)
        {
            var payment = await _paymentService.GetPaymentByClaimId(id);
            return Ok(payment);
        }

        [HttpGet("ProcessPaymentForGeneral/{id}")]
        public async Task<ActionResult<bool>> ProcessPaymentForGeneral(int id)
        {
            var payment = await _paymentService.ProcessPaymentForGeneral(id);
            return Ok(payment);
        }

        [HttpGet("GetPaymentByAllocationId/{allocationId}")]
        public async Task<ActionResult<Contracts.Entities.Payments.Payment>> GetPaymentByAllocationId(int allocationId)
        {
            var payment = await _paymentService.GetPaymentByAllocationId(allocationId);
            return Ok(payment);
        }

        [HttpGet("GetPaymentsByAllocationId/{allocationId}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Payments.Payment>>> GetPaymentsByAllocationId(int allocationId)
        {
            var payments = await _paymentService.GetPaymentsByAllocationId(allocationId);
            return Ok(payments);
        }

        [HttpGet("AllSubmitted")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Payments.Payment>>> GetAllPayments()
        {
            var payments = await _paymentService.GetAllPayments();
            return Ok(payments);
        }

        [HttpPost("PaymentRecall")]
        public async Task<ActionResult<int>> PaymentRecall(List<Contracts.Entities.Payments.Payment> paymentList)
        {
            var res = await _paymentService.PaymentRecall(paymentList);
            return Ok(res);
        }

        [HttpPost("BatchPaymentRecall")]
        public async Task<ActionResult<int>> BatchPaymentRecall(string batchRef)
        {
            var res = await _paymentService.BatchPaymentRecall(batchRef);
            return Ok(res);
        }

        [HttpGet("GetDailyEstimates")]
        public async Task<ActionResult<PolicyPayment>> GetDailyEstimates(string startDate, string endDate)
        {
            var payments = await _paymentService.GetDailyEstimates(startDate, endDate);
            return Ok(payments);
        }

        [HttpGet("GetDailyPaymentEstimates")]
        public async Task<ActionResult<PaymentEstimate>> GetDailyPaymentEstimates(string startDate, string endDate)
        {
            var payments = await _paymentService.GetDailyPaymentEstimates(startDate, endDate);
            return Ok(payments);
        }

        [HttpGet("GetGoldWagePayments")]
        public async Task<ActionResult<PolicyPayment>> GetGoldWagePayments()
        {
            var payments = await _paymentService.GetGoldWagePayments();
            return Ok(payments);
        }

        [HttpPost("GetPaymentsOverview")]
        public async Task<ActionResult<PolicyPayment>> GetPaymentsOverview([FromBody] CoverTypeModel coverTypeModel)
        {
            return await _paymentService.GetClaimPaymentOverview(coverTypeModel);
        }

        [HttpPost("GetPaymentsOverviewByPaymentType")]
        public async Task<ActionResult<PolicyPayment>> GetPaymentsOverviewByPaymentType([FromBody] PaymentTypeEnum paymentType)
        {
            return await _paymentService.GetPaymentsOverviewByPaymentType(paymentType);
        }

        [HttpGet("GetSchemePaymentsByProductOptionId/{productOptionId}/{paymentType}")]
        public async Task<PolicyPayment> GetSchemePaymentsByProductOptionId(int productOptionId, PaymentTypeEnum paymentType)
        {
            var result = await _paymentService.GetSchemePaymentsByProductOptionId(productOptionId, paymentType);
            return result;
        }

        [HttpPost("GetCorporateClaimPayments")]
        public async Task<PolicyPayment> GetCorporateClaimPayments([FromBody] CoverTypeModel coverTypeModel)
        {
            return await _paymentService.GetCorporateClaimPayments(coverTypeModel);
        }

        [HttpGet("GetPaymentNotificationAudit/{paymentId}")]
        public async Task<ActionResult<IEnumerable<EmailAudit>>> GetPaymentNotificationAudit(int paymentId)
        {
            var result = await _paymentService.GetPaymentNotificationAudit(paymentId);
            return result;
        }

        [HttpGet("GetAllocationsByMedicalInvoiceId/{medicalInvoiceId}/{paymentType}")]
        public async Task<ActionResult<IEnumerable<Allocation>>> GetAllocationsByMedicalInvoiceId(int medicalInvoiceId, PaymentTypeEnum PaymentType)
        {
            var result = await _paymentService.GetAllocationsByMedicalInvoiceId(medicalInvoiceId, PaymentType);
            return Ok(result);
        }

        [HttpGet("GetAllocationsByClaimInvoiceId/{claimInvoiceId}")]
        public async Task<ActionResult<IEnumerable<Allocation>>> GetAllocationsByClaimInvoiceId(int claimInvoiceId)
        {
            var result = await _paymentService.GetAllocationsByClaimInvoiceId(claimInvoiceId);
            return Ok(result);
        }

        [HttpPut("UpdateAllocation")]
        public async Task<ActionResult<int>> UpdateAllocation([FromBody] Allocation allocation)
        {
            var id = await _paymentService.UpdateAllocation(allocation);
            return Ok(id);
        }

        [HttpPost("SearchPaymentsPaged/{paymentStatusId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Contracts.Entities.Payments.Payment>>> SearchPaymentsPaged(int paymentStatusId, [FromBody] List<PaymentTypeEnum> paymentTypes, int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var payments = await _paymentService.SearchPaymentsPaged(paymentStatusId, paymentTypes, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(payments);
        }

        [HttpPost("PolicyPaymentsSearchPaged/{policyId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Contracts.Entities.Payments.Payment>>> PolicyPaymentsSearchPaged(int policyId, int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var payments = await _paymentService.PolicyPaymentsSearchPaged(policyId, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(payments);
        }

        [HttpGet("GetPaymentWorkPool/{reAllocate}/{userLoggedIn}/{workPoolId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Contracts.Entities.Payments.Payment>>> GetPaymentWorkPool(bool reAllocate, int userLoggedIn, int workPoolId, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var payments = await _paymentService.GetPaymentWorkPool(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), reAllocate, userLoggedIn, workPoolId);
            return Ok(payments);
        }

        [HttpPost("GetPaymentsPaged")]
        public async Task<ActionResult<PagedRequestResult<Contracts.Entities.Payments.Payment>>> GetPaymentsPaged([FromBody] PaymentPoolSearchParams searchParams)
        {
            var payments = await _paymentService.GetPaymentsPaged(searchParams);
            return Ok(payments);
        }

        [HttpGet("GetBankBalances")]
        public async Task<ActionResult<BankBalance>> GetBankBalanceAsync()
        {
            var balances = await _paymentService.GetBankBalanceAsync();
            return Ok(balances);
        }

        [HttpPost("EmailCommissionStatementToBroker")]
        public async Task<ActionResult> EmailCommissionStatementToBroker(EmailCommissionStatementRequest emailCommissionStatementRequest)
        {
            await _paymentService.EmailCommissionStatementToBroker(emailCommissionStatementRequest);
            return Ok();
        }

        [HttpGet("GetEstimatePayment")]
        public async Task<ActionResult<EstimatePaymentResponse>> GetEstimatePayments()
        {
            var payments = await _paymentService.GetEstimatePayments();
            return Ok(payments);
        }

        [HttpPost("GetRemittanceTransactionsList")]
        public async Task<ActionResult<List<Contracts.Entities.Payments.GetRemittanceTransactionsListResponse>>> GetRemittanceTransactionsList([FromBody] GetRemittanceTransactionsListRequest getRemittanceTransactionsListRequest)
        {
            var remittancesList = await _paymentService.GetRemittanceTransactionsList(getRemittanceTransactionsListRequest);
            return Ok(remittancesList);
        }

        [HttpGet("GetRemittanceTransactionsListDetails/{batchReferenceNumber}")]
        public async Task<ActionResult<GetRemittanceTransactionsListDetailsResponse>> GetRemittanceTransactionsListDetails(string batchReferenceNumber)
        {
            var remittancesDetailsList = await _paymentService.GetRemittanceTransactionsListDetails(batchReferenceNumber);
            return Ok(remittancesDetailsList);
        }


        [HttpGet("GetMSPGroups")]
        public async Task<ActionResult<GetMSPGroupsResponse>> GetMSPGroups()
        {
            var mspGroupsList = await _paymentService.GetMSPGroups();
            return Ok(mspGroupsList);
        }

        [HttpGet("GetPolicyPaymentDetails")]
        public async Task<ActionResult<PolicyBasedPayments>> GetPolicyPaymentDetails(int policyId, string startDate, string endDate)
        {
            var result = await _paymentService.GetPolicyPaymentDetails(policyId, startDate, endDate);
            return result;
        }
        [HttpPost("SubmitAllPayments")]
        public async Task<ActionResult> SubmitAllPayments([FromBody] PaymentPoolSearchParams searchParams)
        {
            await _paymentService.SubmitAllPayments(searchParams);
            return Ok();
        }

        [HttpGet("GetPaymentsOverviewPaged/{startDate}/{endDate}/{page}/{pageSize}/{orderBy}/{sortDirection}")]
        public async Task<ActionResult<PagedRequestResult<PaymentsOverview>>> GetPaymentsOverviewPaged(DateTime startDate, DateTime endDate, int page = 1, int pageSize = 1, string orderBy = "PaymentType", string sortDirection = "asc")
        {
            var paymentsOverview = await _paymentService.GetPaymentsOverviewPaged(startDate, endDate, new PagedRequest(null, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(paymentsOverview);
        }
        [HttpGet("GetPaymentsProductOverview/{startDate}/{endDate}/{paymentStatusId}/{product}/{query?}")]
        public async Task<ActionResult<List<PaymentsProductOverview>>> GetPaymentsProductOverview(DateTime startDate, DateTime endDate, int paymentStatusId, string product, string query = null)
        {
            var paymentsOverview = await _paymentService.GetPaymentsProductOverview(startDate, endDate, paymentStatusId, product.Decode(), query.Decode());
            return Ok(paymentsOverview);
        }

        [HttpPost("SendRemittance/{paymentId}")]
        public async Task<ActionResult> SendRemittance(int paymentId)
        {
            await _paymentService.SendRemittance(paymentId);
            return Ok();
        }

        [HttpPost("ProcessPaymentResponse/{paymentId}")]
        public async Task<ActionResult> ProcessPaymentResponse(int paymentId)
        {
            _ = await _paymentService.ProcessPaymentResponse(paymentId);
            return Ok();
        }
    }
}
