using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Entities.Broker;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Client;
using RMA.Service.Integrations.Contracts.Entities.Fspe;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Client
{
    [Route("api/Broker/[controller]")]

    public class RepresentativeController : RmaApiController
    {
        private readonly IRepresentativeService _brokerService;
        private readonly ILastViewedService _lastViewedService;

        public RepresentativeController(IRepresentativeService representativeService, ILastViewedService lastViewedService)
        {
            _brokerService = representativeService;
            _lastViewedService = lastViewedService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Representative>> Get(int id)
        {
            var broker = await _brokerService.GetRepresentative(id);
            return Ok(broker);
        }

        [HttpGet("GetBrokeragesForRepresentative/{representativeId}")]
        public async Task<ActionResult<IEnumerable<Brokerage>>> GetBrokeragesForRepresentative(int representativeId)
        {
            var brokerage = await _brokerService.GetBrokeragesForRepresentative(representativeId);
            return Ok(brokerage);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Representative>>> Get()
        {
            var results = await _brokerService.GetRepresentatives();
            return Ok(results);
        }

        [HttpGet("GetBrokersByBrokerageId/{brokerageId}")]
        public async Task<ActionResult<IEnumerable<Representative>>> GetBrokersByBrokerageId(int brokerageId)
        {
            var brokerList = await _brokerService.GetRepresentativeByBrokerageId(brokerageId);
            return Ok(brokerList);
        }

        [HttpGet("GetBrokersByJuristicRepId/{representativeId}")]
        public async Task<ActionResult<IEnumerable<Representative>>> GetBrokersByJuristicRepId(int representativeId)
        {
            var brokerList = await _brokerService.GetRepresentativesByJuristicRepId(representativeId);
            return Ok(brokerList);
        }

        [HttpGet("GetJuristicRepresentatives")]
        public async Task<ActionResult<IEnumerable<Representative>>> GetJuristicRepresentatives([FromQuery] List<int> brokerageId)
        {
            var brokerList = await _brokerService.GetJuristicRepresentatives(brokerageId);
            return Ok(brokerList);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Representative representative)
        {
            var brokerId = await _brokerService.AddRepresentative(representative);
            return Ok(brokerId);
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] Representative representative)
        {
            await _brokerService.EditRepresentative(representative);
            return Ok();
        }

        [HttpGet("SearchNaturalRepresentatives/{query}")]
        public async Task<ActionResult<List<Representative>>> SearchNaturalRepresentatives(string query)
        {
            var brokerList = await _brokerService.SearchNaturalRepresentatives(query);
            return Ok(brokerList);
        }

        [HttpGet("SearchBrokers/{query}")]
        public async Task<ActionResult<IEnumerable<Representative>>> SearchBrokers(string query)
        {
            var brokerList = await _brokerService.SearchRepresentative(query);
            return Ok(brokerList);
        }

        [HttpGet("Search/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Representative>>> SearchBrokerages(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var brokerages = await _brokerService.SearchRepresentatives(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(brokerages);
        }

        [HttpGet("LastViewed")]
        public async Task<ActionResult<IEnumerable<Representative>>> LastViewed()
        {
            var brokerList = await _lastViewedService.GetLastViewedRepresentatives();
            return Ok(brokerList);
        }

        [HttpGet("GetProductsRepCanSell/{representativeId}/{brokerageId}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Product.Product>>> GetProductsRepCanSell(int representativeId, int brokerageId)
        {
            var brokerList = await _brokerService.GetProductsRepCanSell(representativeId, brokerageId);
            return Ok(brokerList);
        }

        [HttpPost("GetBrokeragesEligibleToReceiveRepresentativePolicies")]
        public async Task<ActionResult<IEnumerable<Brokerage>>> GetBrokeragesEligibleToReceiveRepresentativePolicies([FromBody] PolicyBrokerMoveRequest policyMoveRequest)
        {
            List<Brokerage> brokerList = new List<Brokerage>();
            if (policyMoveRequest != null)
            {
                brokerList = await _brokerService.GetBrokeragesEligibleToReceiveRepresentativePolicies(policyMoveRequest.SourceRepresentativeId, policyMoveRequest.ProductIds);
            }
            return Ok(brokerList);
        }

        [HttpPost("IsRepAllowedToSellProducts")]
        public async Task<ActionResult<bool>> IsRepAllowedToSellProducts([FromBody] PolicyBrokerMoveRequest policyMoveRequest)
        {
            bool result = false;
            if (policyMoveRequest != null)
            {
                result = await _brokerService.IsRepAllowedToSellProducts(policyMoveRequest.SourceRepresentativeId, policyMoveRequest.ProductIds);
            }
            return Ok(result);
        }

        [HttpGet("GetInternalAndExternalContactsByRepId/{repId}")]
        public async Task<ActionResult<IEnumerable<ContactPerson>>> GetInternalAndExternalContactsByRepId(int repId)
        {
            var brokerList = await _brokerService.GetInternalAndExternalContactsByRepId(repId);
            return Ok(brokerList);
        }


        [HttpGet("GetJuristicRepresentativesActivePolicies")]
        public async Task<ActionResult<List<Representative>>> GetJuristicRepresentativesActivePolicies()
        {
            var data = await _brokerService.GetJuristicRepresentativesActivePolicies();
            return Ok(data);
        }
    }
}