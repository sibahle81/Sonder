using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;

using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Policy.Integrations.Request;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Api.Controllers.Policy
{
    [Route("api/Policy/[controller]")]
    public class PolicyIntegrationController : RmaApiController
    {
        private readonly IPolicyIntegrationService _policyIntegrationService;

        public PolicyIntegrationController(
            IPolicyIntegrationService policyIntegrationService
        )
        {
            _policyIntegrationService = policyIntegrationService;
        }

        // POST clc/api/Policy/PolicyIntegration/Create
        [HttpPost("Create")]
        public async Task<ActionResult<PolicyResponse>> CreateSchemeChildPolicyRestricted([FromBody] PolicyData policy)
        {
            var result = await _policyIntegrationService.CreateSchemeChildPolicyRestricted(policy);
            return Ok(result);
        }

        // POST clc/api/Policy/PolicyIntegration/V2/Create
        [HttpPost("V2/Create")]
        public async Task<ActionResult<PolicyResponse>> CreateSchemeChildPolicy([FromBody] PolicyData policy)
        {
            var result = await _policyIntegrationService.CreateSchemeChildPolicy(policy);
            return Ok(result);
        }

        // POST clc/api/Policy/PolicyIntegration/Update
        [HttpPost("Update")]
        public async Task<ActionResult<PolicyResponse>> UpdateSchemeChildPolicyRestricted([FromBody] PolicyData policy)
        {
            var result = await _policyIntegrationService.UpdateSchemeChildPolicyRestricted(policy);
            return Ok(result);
        }


        // POST clc/api/Policy/PolicyIntegration/v2/Update
        [HttpPost("V2/Update")]
        public async Task<ActionResult<PolicyResponse>> UpdateSchemeChildPolicy([FromBody] PolicyData policy)
        {
            var result = await _policyIntegrationService.UpdateSchemeChildPolicy(policy);
            return Ok(result);
        }

        // POST clc/api/Policy/PolicyIntegration/ProcessStagedRequest
        [HttpGet("ProcessStagedRequest")]
        public async Task<ActionResult<bool>> ProcessStagedRequest()
        {
            var result = await _policyIntegrationService.ProcessStagedPolicyIntegrationRequests();
            return Ok(result);
        }

        // GET clc/api/Policy/PolicyIntegration/GetPolicyInfo/{policyNumber}
        [HttpGet("GetPolicyInfo/{policyNumber}")]
        public async Task<ActionResult<PolicyResponse>> GetPolicyInfo(string policyNumber)
        {
            var policyInfo = await _policyIntegrationService.GetPolicyInfo(policyNumber);
            return Ok(policyInfo);
        }

        // POST clc/api/Policy/PolicyIntegration/CreateCDAPolicy
        [HttpPost("CreateCDAPolicy/{referenceNumber}")]
        public async Task<ActionResult<int>> CreateCDAPolicy(string referenceNumber)
        {
            var result = await _policyIntegrationService.CreateCDAPolicy(new PolicyDataRequest { ReferenceNumber = referenceNumber });
            return Ok(result);
        }

        // GET clc/api/Policy/PolicyIntegration/GetRolePlayerByPolicyNumber/{parentPolicyNumber}
        [HttpGet("GetRolePlayerByPolicyNumber/{parentPolicyNumber}")]
        public async Task<ActionResult<PolicyOperationResult>> GetRolePlayerByPolicyNumber(string parentPolicyNumber)
        {
            var result = (await _policyIntegrationService.GetParentPolicy(parentPolicyNumber));
            return Ok(result);
        }
        // GET clc/api/Policy/PolicyIntegration/GetChildPoliciesByParentPolicyNumber/{parentPolicyNumber}
        [HttpGet("GetChildPoliciesByParentPolicyNumber/{parentPolicyNumber}")]
        public async Task<ActionResult<List<PolicyMinimumData>>> GetChildPoliciesByParentPolicyNumber(string parentPolicyNumber)
        {
            var result = (await _policyIntegrationService.GetChildPoliciesByParentPolicyNumber(parentPolicyNumber));
            return Ok(result);
        }
        // POST clc/api/Policy/PolicyIntegration/AllocateSchemePayments
        [HttpPost("AllocateSchemePayments")]
        public async Task<ActionResult<SchemePaymentAllocationResponse>> AllocateSchemePayments([FromBody] PaymentAllocationScheme paymentAllocationScheme)
        {
            var result = await _policyIntegrationService.AllocateSchemePayments(paymentAllocationScheme);
            return Ok(result);
        }

        // GET clc/api/Policy/PolicyIntegration/GetSchemePaymentAllocationStatus/{parentPolicyNumber}/{invoiceDate}  Format : mm-dd-yyyy
        [HttpGet("GetSchemePaymentAllocationStatus/{parentPolicyNumber}/{paymentDate}/")]
        public async Task<ActionResult<List<PaymentAllocationRecord>>> GetSchemePaymentAllocationStatus(string parentPolicyNumber, DateTime paymentDate)
        {
            var result = await _policyIntegrationService.GetSchemePaymentAllocationStatus(parentPolicyNumber, paymentDate);
            return Ok(result);
        }

        // GET clc/api/Policy/PolicyIntegration/GetSchemePremiumListingByInvoiceDate/{parentPolicyNumber}/{invoiceDate}  Format : mm-dd-yyyy
        [HttpGet("GetSchemePremiumListingByInvoiceDate/{parentPolicyNumber}/{invoiceDate}/")]
        public async Task<ActionResult<List<PaymentAllocationRecord>>> GetSchemePremiumListingByInvoiceDate(string parentPolicyNumber, DateTime invoiceDate)
        {
            var result = await _policyIntegrationService.GetPremiumListingTransactionsByInvoiceDate(parentPolicyNumber, invoiceDate);
            return Ok(result);
        }

        // POST clc/api/Policy/PolicyIntegration/UpdatePolicyStatus
        [HttpPost("UpdatePolicyStatus/")]
        public async Task<ActionResult<PolicyResponse>> UpdatePolicyStatus([FromBody] PolicyMinimumData policyMinimumData)
        {
            var result = await _policyIntegrationService.UpdatePolicyStatus(policyMinimumData);
            return Ok(result);
        }

        // POST clc/api/Policy/PolicyIntegration/PolicyStatusAmendment
        [HttpPost("PolicyStatusAmendment/")]
        public async Task<ActionResult<PolicyResponse>> PolicyStatusAmendment([FromBody] PolicyMinimumData policyMinimumData)
        {
            var result = await _policyIntegrationService.PolicyStatusAmendment(policyMinimumData);
            return Ok(result);
        }


        [HttpGet("GetSchemePaymentCreditTransactions/{parentPolicyNumber}")]
        public async Task<ActionResult<List<PaymentAllocationRecord>>> GetSchemePaymentCreditTransactions(string parentPolicyNumber)
        {
            var result = await _policyIntegrationService.GetSchemePaymentCreditTransactions(parentPolicyNumber);
            return Ok(result);
        }

        [HttpGet("GetParentPolicies/{query?}")]
        public async Task<ActionResult<List<Contracts.Entities.Policy.Policy>>> GetParentPolicies(string query)
        {
            var result = await _policyIntegrationService.GetParentPolicies(query);
            return Ok(result);
        }

        [HttpPost("CreateEventForDeathClaim")]
        public async Task<ActionResult<SchemeDeathRegistrationResult>> CreateEventForDeathClaim([FromBody] SchemeDeathDetailExternal schemeDeathDetail)
        {
            var result = await _policyIntegrationService.CreateEventForDeathClaim(schemeDeathDetail);
            return Ok(result);
        }

        [HttpGet("SearchDeathClaim/{query}/{pageSize?}")]
        public async Task<ActionResult<List<DeathClaimResponse>>> SearchDeathClaim(string query, int pageSize = 100)
        {
            var result = await _policyIntegrationService.SearchDeathClaim(query, pageSize);
            return Ok(result);
        }


        // GET clc/api/Policy/PolicyIntegration/GetPolicyProductOptionInformationByIdNumber/{IdNumber}
        [HttpGet("GetPolicyProductOptionInformationByIdNumber/{IdNumber}")]
        public async Task<ActionResult<List<PolicyProductOptionModel>>> GetPolicyProductOptionInformationByIdNumber(string IdNumber)
        {
            var result = await _policyIntegrationService.GetPolicyProductOptionInformationByIdNumberAsync(IdNumber);
            if (result != null)
                return Ok(result);

            return NotFound();
        }

        [HttpPost("v2/CreateEventForDeathClaim")]
        public async Task<ActionResult<SchemeDeathRegistrationResult>> CreateEventForMIDeathClaims([FromBody] SchemeDeathDetailRequest schemeDeathDetail)
        {
            var result = await _policyIntegrationService.CreateEventForDeathClaims(schemeDeathDetail);
            return Ok(result);
        }


        // GET clc/api/Policy/PolicyIntegration/GetEuropAssistFee/
        [HttpGet("GetEuropAssistFee")]
        public async Task<IActionResult> GetEuropAssistFee()
        {
            var fee = await _policyIntegrationService.GetEuropAssistFee();

            return new JsonResult(new { europAssist = fee });
        }


        // GET clc/api/Policy/PolicyIntegration/GetGroupSchemePremiumRoundingExclusions/
        [HttpGet("GetGroupSchemePremiumRoundingExclusions")]
        public async Task<ActionResult<List<GroupSchemePremiumRoundingExclusion>>> GetGroupSchemePremiumRoundingExclusions()
        {
            var result = await _policyIntegrationService.GetGroupSchemePremiumRoundingExclusions();

            return Ok(result);
        }

        [HttpPost("SendPoliciesToGeneratePolicySchedule")]
        public async Task<ActionResult<bool>> SendPoliciesToGeneratePolicySchedule([FromBody] List<int> policyIds)
        {
            await _policyIntegrationService.SendPoliciesToGenaratePolicySchedules(policyIds);
            return Ok(true);
        }


        [HttpPost("SendPolicySchedule/{policyId}/{policyCommunicationType}")]
        public async Task<IActionResult> SendPolicySchedule(int policyId, string policyCommunicationType)
        {
            bool result = await _policyIntegrationService.SendPolicySchedule(policyId,policyCommunicationType);

            if (result)
                return Ok(new { Success = true, Message = "Policy schedule sent successfully." });
            else
                return BadRequest(new { Success = false, Message = "Failed to send policy schedule." });
        }

        [HttpPost("ProcessPolicyScheduleEmailQueue")]
        public async Task<IActionResult> ProcessPolicyScheduleEmailQueue()
        {
            bool result = await _policyIntegrationService.ProcessPolicyScheduleEmailQueue();
            if (result)
                return Ok(new { Success = true, Message = "Policy schedule processed successfully." });
            else
                return BadRequest(new { Success = false, Message = "Failed to process policy schedule." });
        }
    }
}