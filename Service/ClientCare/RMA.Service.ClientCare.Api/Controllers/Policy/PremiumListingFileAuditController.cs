using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Api.Controllers.Policy
{
    [Route("api/Policy/[controller]")]
    public class PremiumListingFileAuditController : RmaApiController
    {
        private readonly IPremiumListingFileAuditService _premiumListingFileAuditService;

        public PremiumListingFileAuditController(IPremiumListingFileAuditService premiumListingFileAuditService)
        {
            _premiumListingFileAuditService = premiumListingFileAuditService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PremiumListingFileAudit>>> Get()
        {
            var premiumListingFileAudits = await _premiumListingFileAuditService.GetPremiumListingFileAudits();
            return Ok(premiumListingFileAudits);
        }

        [HttpGet("GetPremiumListingFileAuditsByBrokerEmail/{email}")]
        public async Task<ActionResult<IEnumerable<PremiumListingFileAudit>>> GetPremiumListingFileAuditsByBrokerEmail(string email)
        {
            var premiumListingFileAudits = await _premiumListingFileAuditService.GetPremiumListingFileAuditsByBrokerEmail(email);
            return Ok(premiumListingFileAudits);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PremiumListingFileAudit>> Get(int id)
        {
            var premiumListingFileAudit = await _premiumListingFileAuditService.GetPremiumListingFileAudit(id);
            return Ok(premiumListingFileAudit);
        }

        [HttpPost("BrokerUploadPremiumListing")]
        public async Task<ActionResult<int>> BrokerImportPremiumListing([FromBody] FileContentImport content)
        {
            var count = await _premiumListingFileAuditService.BrokerImportPremiumListing(content);
            return Ok(count);
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] PremiumListingFileAudit premiumListingFileAudit)
        {
            var res = await _premiumListingFileAuditService.AddPremiumListingFileAudit(premiumListingFileAudit);
            return Ok(res);
        }


    }
}
