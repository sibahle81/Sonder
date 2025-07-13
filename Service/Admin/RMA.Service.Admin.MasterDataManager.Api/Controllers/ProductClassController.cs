using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class ProductClassController : RmaApiController
    {
        private readonly IProductClassService _productRepository;

        public ProductClassController(IProductClassService productClassService)
        {
            _productRepository = productClassService;
        }

        // GET: mdm/api/ProductClass
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var productClasses = await _productRepository.GetProductClasses();
            return Ok(productClasses);
        }
    }
}