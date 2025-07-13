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

    public class DiscountTypeController : RmaApiController
    {
        private readonly IDiscountTypeService _discountTypeService;
        private readonly ILastViewedService _lastViewedService;

        public DiscountTypeController(IDiscountTypeService discountTypeService, ILastViewedService lastViewedService)
        {
            _discountTypeService = discountTypeService;
            _lastViewedService = lastViewedService;
        }

        // GET: clc/api/Product/DiscountType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DiscountType>>> Get()
        {
            var discountTypes = await _discountTypeService.GetDiscountTypes();
            return Ok(discountTypes);
        }

        //GET: clc/api/Product/DiscountType/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<DiscountType>> Get(int id)
        {
            var discountType = await _discountTypeService.GetDiscountType(id);
            return Ok(discountType);
        }

        //POST: clc/api/Product/DiscountType/{discountType}
        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] DiscountType discountType)
        {
            var id = await _discountTypeService.AddDiscountType(discountType);
            return Ok(id);
        }

        //PUT: clc/api/Product/DiscountType/{discountType}
        [HttpPut]
        public async Task<ActionResult> Put([FromBody] DiscountType discountType)
        {
            await _discountTypeService.EditDiscountType(discountType);
            return Ok();
        }

        // GET clc/api/Product/LastViewed
        [HttpGet("LastViewed")]
        public async Task<ActionResult<IEnumerable<LastViewedItem>>> LastViewed()
        {
            var items = await _lastViewedService.GetLastViewedItemsForUserByName("product_DiscountType");
            return Ok(items);
        }

        // GET: clc/api/Product/DiscountType/Search/{query}
        [HttpGet("Search/{query}")]
        public async Task<ActionResult<IEnumerable<DiscountType>>> SearchDiscountTypes(string query)
        {
            var discountTypes = await _discountTypeService.SearchDiscountTypes(query);
            return Ok(discountTypes);
        }
    }
}