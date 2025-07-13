using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Api.Controllers.Policy
{
    [Route("api/Policy/[controller]")]
    public class PremiumListingController : RmaApiController
    {
        private readonly IPremiumListingService _premiumListingService;
        private readonly IPolicyCommunicationService _policyCommunicationService;
        private readonly IPolicyService _policyService;

        public PremiumListingController(
            IPremiumListingService premiumListingService,
            IPolicyCommunicationService policyCommunicationService,
            IPolicyService policyService
        )
        {
            _premiumListingService = premiumListingService;
            _policyCommunicationService = policyCommunicationService;
            _policyService = policyService;
        }

        [HttpGet("GroupPolicyId/{fileIdentifier}")]
        public async Task<ActionResult<int>> GetGroupPolicyId(Guid fileIdentifier)
        {
            var result = await _premiumListingService.GetGroupPolicyId(fileIdentifier);
            return Ok(result);
        }

        [HttpGet("UploadMessage/{fileIdentifier}")]
        public async Task<ActionResult<string>> GetUploadMessage(Guid fileIdentifier)
        {
            var result = await _premiumListingService.GetUploadMessage(fileIdentifier);
            return Ok(result);
        }

        [HttpGet("GroupPolicyImportErrors/{fileIdentifier}")]
        public async Task<ActionResult<int>> GetPolicyMemberErrors(string fileIdentifier)
        {
            var result = await _premiumListingService.GetGroupPolicyImportErrors(fileIdentifier);
            return Ok(result);
        }

        [HttpPost("ImportGroupPolicyMembers")]
        public async Task<ActionResult<ImportInsuredLivesSummary>> ImportPolicyMembers([FromBody] ImportInsuredLivesRequest importRequest)
        {
            var summary = await _premiumListingService.ImportGroupPolicy("", importRequest);
            return Ok(summary);
        }

        [HttpPost("ImportGroupPolicy")]
        public async Task<ActionResult<ImportInsuredLivesSummary>> ImportPolicy([FromBody] ImportInsuredLivesRequest importRequest)
        {
            var summary = await _premiumListingService.ImportGroupPolicyMembers(importRequest);
            return Ok(summary);
        }

        [HttpPost("UploadPayments")]
        public async Task<ActionResult<int>> UploadPayments([FromBody] FileContentImport content)
        {
            var count = await _premiumListingService.UploadPremiumPayments(content);
            return Ok(count);
        }

        [HttpPost("UploadBulkPaymentListing/{unallocatedPaymentId}")]
        public async Task<ActionResult<int>> UploadBulkPaymentListing(int unallocatedPaymentId, [FromBody] FileContentImport content)
        {
            var count = await _premiumListingService.UploadBulkPaymentListing(unallocatedPaymentId, content);
            return Ok(count);
        }

        [HttpPost("SendGroupPolicyDocuments")]
        public async Task<ActionResult> SendGroupPolicyDocuments([FromBody] PolicyEmail policyEmail)
        {
            Contract.Requires(policyEmail != null);
            var policy = await _policyService.GetPolicyByNumber(policyEmail.PolicyNumber);
            var policyMember = await _premiumListingService.GetPolicyMemberDetails(policyEmail.PolicyNumber);
            var childPolicyMembers = await _premiumListingService.GetGroupPolicyMemberDetails(policyMember.PolicyId);
            await _policyCommunicationService.SendGroupOnboardingDocuments(policy, policyEmail, policyMember, false, true, false);
            await _policyCommunicationService.SendPremiumListingGroupPolicyMemberSchedules(policy, policyEmail, childPolicyMembers, false, true, false);
            return Ok();
        }

        [HttpPost("ValidatePremiumListingFile")]
        public async Task<ActionResult<int>> ValidatePremiumListingFile([FromBody] FileContentImport content)
        {
            var contentsValid = await _premiumListingService.ValidatePremiumListingFile(content);
            return Ok(contentsValid);
        }

        [HttpGet("GetPremiumListingPaymentFiles/{statusId}/{startDate}/{endDate}")]
        public async Task<ActionResult<List<PremiumListingFile>>> GetPremiumListingPaymentFiles(int statusId, DateTime startDate, DateTime endDate)
        {
            return await _premiumListingService.GetPremiumListingPaymentFiles(statusId, startDate, endDate);
        }

        [HttpGet("GetPremiumPaymentFileExceptions/{fileIdentifier}")]
        public async Task<ActionResult<List<PremiumPaymentException>>> GetPremiumPaymentFileExceptions(string fileIdentifier)
        {
            var result = await _premiumListingService.GetPremiumListingPaymentErrors(Guid.Parse(fileIdentifier));
            return Ok(result);
        }

        [HttpGet("GetPremiumListingMembers/{page}/{pageSize}/{orderBy}/{sortDirection}/{query}")]
        public async Task<ActionResult<PagedRequestResult<PremiumListingMember>>> GetPremiumListingMembers(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var members = await _premiumListingService.GetPremiumListingMembers(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(members);
        }

        [HttpPost("ValidatePaymentFile")]
        public async Task<ActionResult<int>> ValidatePaymentFile([FromBody] FileContentImport content)
        {
            var result = await _premiumListingService.ValidatePaymentFile(content);
            return Ok(result);
        }

        [HttpPost("UploadPremiumPaymentsWithFileLinking")]
        public async Task<ActionResult<int>> UploadPremiumPaymentsWithFileLinking([FromBody] FileImportPremiumPayementModel content)
        {
            var result = await _premiumListingService.UploadPremiumPaymentsWithFileLinking(content);
            return Ok(result);
        }

        [HttpPost("ReverseLastPremiumPayments/{linkedTransactionId}")]
        public async Task<ActionResult<bool>> ReverseLastPremiumPayments(int linkedTransactionId)
        {
            var result = await _premiumListingService.ReverseLastPremiumPayments(linkedTransactionId);
            return Ok(result);
        }

        [HttpPost("AllocatePremiumPayments")]
        public async Task<ActionResult<int>> AllocatePremiumPayments([FromBody] PremiumAllocationRequest content)
        {
            var result = await _premiumListingService.AllocatePremiumPayments(content);
            return Ok(result);
        }

        [HttpGet("GetPremiumPaymentFile/{fileId}")]
        public async Task<ActionResult<PremiumListingFile>> GetPremiumPaymentFile(int fileId, int linkedTransactionId)
        {
            var result = await _premiumListingService.GetPremiumPaymentFile(fileId);
            return Ok(result);
        }

        [HttpGet("GetPremiumListingPaymentFilesByDate/{policyNumber}/{startDate}/{endDate}")]
        public async Task<ActionResult<List<PremiumListingFile>>> GetPremiumListingPaymentFilesByDate(string policyNumber, DateTime startDate, DateTime endDate)
        {
            return await _premiumListingService.GetPremiumListingPaymentFilesByDate(policyNumber, startDate, endDate);
        }

    }
}
