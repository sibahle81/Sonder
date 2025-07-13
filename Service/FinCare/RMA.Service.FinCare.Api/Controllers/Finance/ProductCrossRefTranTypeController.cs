using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.FinCare.Contracts.Entities.Finance;
using RMA.Service.FinCare.Contracts.Interfaces.Finance;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Api.Controllers.Finance
{
    [Route("api/Finance/[controller]")]

    public class ProductCrossRefTranTypeController : RmaApiController
    {
        private readonly IProductCrossRefTranTypeService _productCrossRefTranTypeService;

        public ProductCrossRefTranTypeController(IProductCrossRefTranTypeService productCrossRefTranTypeService)
        {
            _productCrossRefTranTypeService = productCrossRefTranTypeService;
        }

        //GET: fin/api/Finance/ProductCrossRefTranType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductCrossRefTranType>>> Get()
        {
            var productCrossRefTranTypes = await _productCrossRefTranTypeService.GetProductCrossRefTranTypes();
            return Ok(productCrossRefTranTypes);
        }

        //GET: fin/api/Finance/ProductCrossRefTranType/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductCrossRefTranType>> Get(int id)
        {
            var productCrossRefTranType = await _productCrossRefTranTypeService.GetProductCrossRefTranType(id);
            return Ok(productCrossRefTranType);
        }

        //POST: fin/api/Finance/ProductCrossRefTranType/{productCrossRefTranType}
        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] ProductCrossRefTranType productCrossRefTranType)
        {
            var res = await _productCrossRefTranTypeService.AddProductCrossRefTranType(productCrossRefTranType);
            return Ok(res);
        }

        //PUT: fin/api/Finance/ProductCrossRefTranType/{productCrossRefTranType}
        [HttpPut]
        public async Task<ActionResult<ProductCrossRefTranType>> Put([FromBody] ProductCrossRefTranType productCrossRefTranType)
        {
            await _productCrossRefTranTypeService.EditProductCrossRefTranType(productCrossRefTranType);
            return Ok();
        }

        //DELETE: fin/api/Finance/ProductCrossRefTranType/{productCrossRefTranType}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _productCrossRefTranTypeService.RemoveProductCrossRefTranType(id);
            return Ok();
        }
    }
}