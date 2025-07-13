using Microsoft.AspNetCore.Mvc;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using System.Threading.Tasks;
using static RMA.Service.Integrations.Contracts.Entities.CompCare.SuspiciousTransactionResponse;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Policy
{
    [Route("api/Policy/[controller]")]
    public class PolicyDocumentController : RmaApiController
    {
        private readonly IPolicyDocumentService _policyDocumentService;

        public PolicyDocumentController(
            IPolicyDocumentService policyDocumentService
        )
        {
            _policyDocumentService = policyDocumentService;
        }

        [HttpGet("CreatePolicyWelcomePack/{policyNumber}")]
        public async Task<ActionResult<bool>> CreatePolicyWelcomePack(string policyNumber)
        {
            var result = await _policyDocumentService.CreatePolicyWelcomePack(policyNumber);
            return Ok(result);
        }

        [HttpGet("RefreshPolicyDocument/{policyNumber}/{documentType}/{documentRefreshReason}")]
        public async Task<ActionResult<bool>> RefreshPolicyDocument(string policyNumber, DocumentTypeEnum documentType, DocumentRefreshReasonEnum documentRefreshReason)
        {
            var result = await _policyDocumentService.RefreshPolicyDocument(policyNumber, documentType, documentRefreshReason);
            return Ok(result > 0);
        }



        [HttpGet("GetPolicyCommunicationMatrix/{policyId}")]
        public async Task<ActionResult<PolicyDocumentCommunicationMatrix>> GetPolicyCommunicationMatrix(int policyId)
        {
            var result = await _policyDocumentService.GetPolicyDocumentCommunicationMatrix(policyId);
            return Ok(result);
        }

        [HttpPost(" SendPolicyDocuments/{policyId}/{policyCommunicationType}")]
        public async Task<IActionResult> SendPolicyDocuments(int policyId, string policyCommunicationType)
        {
            bool result = await _policyDocumentService.SendPolicyDocuments(policyId, policyCommunicationType);

            if (result)
                return Ok(new { Success = true, Message = "Policy documents sent successfully." });
            else
                return BadRequest(new { Success = false, Message = "Failed to send documents schedule." });
        }

        [HttpGet("SendUnfullfilledCommunications")]

        public async Task<IActionResult> SendUnfullfilledCommunications()
        {
            var result = await _policyDocumentService.SendUnfullfilledCommunications();
            return Ok(result);
        }

        [HttpGet("SendUnfullfilledOnceOffCommunications")]

        public async Task<IActionResult> SendUnfullfilledOnceOffCommunications()
        {
            var result = await _policyDocumentService.SendUnfullfilledCommunications();
            return Ok(result);
        }


        [HttpGet("SendUnfullfilledSchemeCommunications")]
        public async Task<IActionResult> SendUnfullfilledSchemeCommunications()
        {
            var result = await _policyDocumentService.SendUnfullfilledSchemeCommunications();
            return Ok(result);
        }

        [HttpGet("SendUnfullfilledOnceOfSchemefCommunications")]

        public async Task<IActionResult> SendUnfullfilledOnceOffSchemeCommunications()
        {
            var result = await _policyDocumentService.SendUnfullfilledOnceOffSchemeCommunications();
            return Ok(result);
        }





    }
}
