using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Entities.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;

using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Api.Controllers.BrokerOnboarding
{
    public class BrokerOnboardingController : RmaApiController
    {
        private readonly IBrokerageService _brokerageService;

        public BrokerOnboardingController(IBrokerageService brokerageService)
        {
            _brokerageService = brokerageService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Brokerage>> Get(int id)
        {
            var brokerage = await _brokerageService.GetBrokerage(id);
            return Ok(brokerage);
        }

        [HttpGet("GetByFSPNumber/{fspnumber}")]
        public async Task<ActionResult<Brokerage>> Get(string fspNumber)
        {
            var brokerage = await _brokerageService.GetBrokerageByFSPNumber(fspNumber);
            return Ok(brokerage);
        }
    }
}