using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Product
{
    [Route("api/Product/[controller]")]

    public class ProductOptionCoverController : RmaApiController
    {
        private readonly IProductOptionCoverService _productOptionCoverService;

        public ProductOptionCoverController(IProductOptionCoverService productOptionCoverService)
        {
            _productOptionCoverService = productOptionCoverService;
        }

        //GET: clc/api/Product/ProductOptionCover/ByProductId/{productId}
        [HttpGet("ByProductId/{productId}")]
        public async Task<ActionResult<IEnumerable<ProductOptionCover>>> ByProductId(int productId)
        {
            return Ok(await _productOptionCoverService.GetProductOptionCoverByProductId(productId));
        }

        //GET: clc/api/Product/ProductOptionCover/ByProductId/{optionId}
        [HttpGet("ByOption/{optionId}")]
        public async Task<ActionResult<IEnumerable<ProductOptionCover>>> GetProductOptionCoversByOption(int optionId)
        {
            return Ok(await _productOptionCoverService.GetProductOptionCoverByproductOptionId(optionId));
        }

        //GET: clc/api/Product/ProductOptionCover
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductOptionCover>>> Get()
        {
            return Ok(await _productOptionCoverService.GetProductOptionCover());
        }

        //GET: clc/api/Product/ProductOptionCover/many/{ids}
        [HttpGet("many/{ids}")]
        public async Task<ActionResult<IEnumerable<ProductOptionCover>>> ByIds(string ids)
        {
            if (string.IsNullOrWhiteSpace(ids)) return Ok();
            var listIds = ids.Split(',').Select(int.Parse).ToList();
            return Ok(await _productOptionCoverService.GetProductsOptionCoversByIds(listIds));
        }

        //GET: clc/api/Product/ProductOptionCover/ById/{id}
        [HttpGet("ById/{id}")]
        public async Task<ActionResult<ProductOptionCover>> ById(int id)
        {
            return Ok(await _productOptionCoverService.GetProductOptionCoverById(id));
        }
    }
}