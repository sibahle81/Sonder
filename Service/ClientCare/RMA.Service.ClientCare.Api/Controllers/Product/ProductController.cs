using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using ILastViewedService = RMA.Service.ClientCare.Contracts.Interfaces.Product.ILastViewedService;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Product
{
    [Route("api/Product/[controller]")]

    public class ProductController : RmaApiController
    {
        private readonly ILastViewedService _lastViewedService;
        private readonly IProductService _productService;

        public ProductController(IProductService productService, ILastViewedService lastViewedService)
        {
            _productService = productService;
            _lastViewedService = lastViewedService;
        }

        // GET: clc/api/Product/Product
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Product.Product>>> Get()
        {
            var products = await _productService.GetProducts();
            return Ok(products);
        }

        //GET: clc/api/Product/Product/ClientType/{clientTypeId}
        [HttpGet("ClientType/{clientType}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Product.Product>>> GetProductsByClientTypeId(
            ClientTypeEnum clientType)
        {
            var products = await _productService.GetProductsByClientType(clientType);
            return Ok(products);
        }

        //GET: clc/api/Product/Product/{id}
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<Contracts.Entities.Product.Product>> Get(int id)
        {
            var product = await _productService.GetProduct(id);
            return Ok(product);
        }

        // GET clc/api/Product/Product/LastViewed
        [HttpGet("LastViewed")]
        public async Task<ActionResult<IEnumerable<LastViewedItem>>> LastViewed()
        {
            var items = await _lastViewedService.GetLastViewedItemsForUserByName("product_Product");
            return Ok(items);
        }

        // GET: clc/api/Product/Product/Search/{page}/{pageSize}/{orderBy?}/{sortDirection?}/{query?}
        [HttpGet("Search/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Contracts.Entities.Product.Product>>> SearchProducts(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var products = await _productService.SearchProducts(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(products);
        }

        // GET: clc/api/Product/Product/ProductIds/{productIds}
        [HttpGet("ProductIds/{productIds}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Product.Product>>> GetProductsByIds(string productIds)
        {
            var productIdsList = productIds?.Split(',').Select(int.Parse).ToList();
            var products = await _productService.GetProductsByIds(productIdsList);
            return Ok(products);
        }

        //GET: clc/api/Product/Product/ProductClass/{productClass}
        [HttpGet("ProductClass/{productClass}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Product.Product>>> ByProductClass(
            ProductClassEnum productClass)
        {
            var products = await _productService.GetProductByProductClass(productClass);
            return Ok(products);
        }

        //GET: clc/api/Product/Product/Underwriters
        [HttpGet("Underwriters")]
        public async Task<ActionResult<List<Underwriter>>> GetUnderwriters()
        {
            var underwriters = await _productService.GetUnderwriters();
            return Ok(underwriters);
        }

        // GET: clc/api/Product/Product/GetProductStatusTypes
        [HttpGet("GetProductStatusTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetProductStatusTypes()
        {
            var result = await _productService.GetProductStatusTypes();
            return Ok(result);
        }

        // GET: clc/api/Product/Product/GetProductClassTypes
        [HttpGet("GetProductClassTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetProductClassTypes()
        {
            var result = await _productService.GetProductClassTypes();
            return Ok(result);
        }

        // GET: clc/api/Product/Product/GetActiveProductsForRepresentative/{representativeId}
        [HttpGet("GetActiveProductsForRepresentative/{representativeId}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Product.Product>>> GetActiveProductsForRepresentative(int representativeId)
        {
            var result = await _productService.GetActiveProductsForRepresentative(representativeId);
            return Ok(result);
        }



        // GET: clc/api/Product/Product/GetActiveProductsForBroker/{brokerageId}
        [HttpGet("GetActiveProductsForBroker/{brokerageId}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Product.Product>>> GetActiveProductsForBroker(int brokerageId)
        {
            var result = await _productService.GetActiveProductsForBroker(brokerageId);
            return Ok(result);
        }


        [HttpGet("GetProductsWithAllOption")]
        public async Task<ActionResult> GetProductsWithAllOption()
        {
            var products = await _productService.GetProductsWithAllOption();
            return Ok(products);
        }

        [HttpGet("GetProductOptionDependencies")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Product.ProductOptionDependency>>> GetProductOptionDependencies()
        {
            var productDependencies = await _productService.GetProductOptionDependecies();
            return Ok(productDependencies);
        }

        [AllowAnonymous]
        [HttpGet("GetProductOptionDependenciesAnon")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Product.ProductOptionDependency>>> GetProductOptionDependenciesAnon()
        {
            var productDependencies = await _productService.GetProductOptionDependecies();
            return Ok(productDependencies);
        }

        [HttpGet("GetProductsExcludingCertainClasses/{excludedProductClassIds}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Product.Product>>> GetProductsExcludingCertainClasses(
            string excludedProductClassIds)
        {
            var productClassIdsList = excludedProductClassIds?.Split(',').Select(int.Parse).ToList();
            var products = await _productService.GetProductsExcludingCertainClasses(productClassIdsList);
            return Ok(products);
        }

    }
}