using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Policy
{
    [AllowAnonymous]
    [Route("api/Policy/[controller]")]
    public class ClientPolicyScheduleDocumentsController : Controller
    {
        private readonly IClientPolicyScheduleDocumentsService _clientPolicyScheduleDocumentsService;
        private readonly IPolicyCaseService _policyCaseService;

        public ClientPolicyScheduleDocumentsController(
            IClientPolicyScheduleDocumentsService clientPolicyScheduleDocumentsService,
            IPolicyCaseService policyCaseService
        )
        {
            _clientPolicyScheduleDocumentsService = clientPolicyScheduleDocumentsService;
            _policyCaseService = policyCaseService;
        }

        [HttpGet("GetOneTimePinByPolicyNumber/{policyNumber}")]
        public async Task<ActionResult<Contracts.Entities.Policy.OneTimePinModel>> GetOneTimePinByPolicyNumber(string policyNumber)
        {
            var oneTimePinModel = await _clientPolicyScheduleDocumentsService.GetOneTimePinByPolicyNumber(policyNumber);
            return Ok(oneTimePinModel);
        }

        [HttpGet("GetPolicyDocumentsByPolicyNumber/{policyNumber}/{oneTimePin}")]
        public async Task<ActionResult<List<RMA.Common.Entities.MailAttachment>>> GetPolicyDocumentsByPolicyNumber(string policyNumber, int oneTimePin)
        {
            var policyDocuments = await _clientPolicyScheduleDocumentsService.GetPolicyDocumentsByPolicyNumber(policyNumber, oneTimePin);
            return Ok(policyDocuments);
        }

        [HttpGet("GetDocumentPassword/{policyId}")]
        public async Task<ActionResult<string>> GetDocumentPassword(int policyId)
        {
            Case caseModel = await _policyCaseService.GetCaseByPolicyId(policyId);
            var policyPasswordHint= await _clientPolicyScheduleDocumentsService.GetDocumentPassword(caseModel);
            return Ok(policyPasswordHint);
        }
    }
}