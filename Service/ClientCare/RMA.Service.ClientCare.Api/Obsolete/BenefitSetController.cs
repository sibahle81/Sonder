using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Product
{
    [Route("api/Product/[controller]")]

    public class BenefitSetController : RmaApiController
    {
        private readonly IBenefitSetService _benefitSetService;
        private readonly ILastViewedService _lastViewedService;

        public BenefitSetController(IBenefitSetService benefitSetService, ILastViewedService lastViewedService)
        {
            _benefitSetService = benefitSetService;
            _lastViewedService = lastViewedService;
        }

        // GET: clc/api/Product/BenefitSet
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BenefitSet>>> Get()
        {
            var benefits = await _benefitSetService.GetBenefitSets();
            return Ok(benefits);
        }

        // GET: clc/api/Product/BenefitSet/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Benefit>> Get(int id)
        {
            var benefit = await _benefitSetService.GetBenefitSet(id);
            return Ok(benefit);
        }

        // GET: clc/api/Product/BenefitSet/GetBenefitSetsForProduct/{productId}
        [HttpGet("BenefitSet/Product/{id}")]
        public async Task<ActionResult<IEnumerable<BenefitSet>>> GetBenefitSetsForProduct(int id)
        {
            var benefitSets = await _benefitSetService.GetBenefitSetsForProduct(id);
            return Ok(benefitSets);
        }

        // GET: clc/api/Product/BenefitSet/GetBenefitsForBenefitSet/{benefitSetId}
        [HttpGet("{id}/Benefit")]
        public async Task<ActionResult<IEnumerable<BenefitSet>>> GetBenefitsForBenefitSet(int id)
        {
            var benefits = await _benefitSetService.GetBenefitsForBenefitSet(id);
            return Ok(benefits);
        }

        //POST: clc/api/Product/BenefitSet/{benefitSet}
        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] BenefitSet benefitSet)
        {
            var id = await _benefitSetService.AddBenefitSet(benefitSet);
            return Ok(id);
        }

        //PUT: clc/api/Product/BenefitSet/{benefitSet}
        [HttpPut]
        public async Task<ActionResult> Put([FromBody] BenefitSet benefitSet)
        {
            await _benefitSetService.EditBenefitSet(benefitSet);
            return Ok();
        }

        // GET clc/api/Product/BenefitSet/LastViewed
        [HttpGet("LastViewed")]
        public async Task<ActionResult<IEnumerable<LastViewedItem>>> LastViewed()
        {
            var items = await _lastViewedService.GetLastViewedItemsForUserByName("product_BenefitSet");
            return Ok(items);
        }

        // GET: clc/api/Product/BenefitSet/SearchBenefits/{query}
        [HttpGet("SearchBenefits/{query}")]
        public async Task<ActionResult<IEnumerable<BenefitSet>>> SearchBenefits(string query)
        {
            var benefitSets = await _benefitSetService.SearchBenefitSets(query);
            return Ok(benefitSets);
        }

        // GET: clc/api/Product/BenefitSet/Lookup/{id}
        [HttpGet("Lookup/{id}")]
        public async Task<ActionResult<int>> GetBenfitIds(int id)
        {
            var benefitIds = await _benefitSetService.GetBenefitIdByBenefitSetId(id);
            return Ok(benefitIds);
        }
    }
}