using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Product
{
    [Route("api/Product/[controller]")]

    public class ProductOptionController : RmaApiController
    {
        private readonly IProductOptionService _productOptionService;
        private readonly ILastViewedService _lastViewedService;

        public ProductOptionController(IProductOptionService productOptionService, ILastViewedService lastViewedService)
        {
            _productOptionService = productOptionService;
            _lastViewedService = lastViewedService;
        }

        //GET: clc/api/Product/ProductOption/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductOption>> Get(int id)
        {
            var productOption = await _productOptionService.GetProductOption(id);
            return Ok(productOption);
        }

        //GET: clc/api/Product/ProductOptions
        [HttpGet]
        public async Task<ActionResult<List<ProductOption>>> Get()
        {
            var productOptions = await _productOptionService.GetProductOptions();
            return Ok(productOptions);
        }

        [HttpGet("NamesByProductId/{productId}")]
        public async Task<ActionResult<IEnumerable<ProductOption>>> NamesByProductId(int productId)
        {
            var productOptions = await _productOptionService.GetProductOptionNamesByProductId(productId);
            return Ok(productOptions);
        }

        //GET: clc/api/Product/ByProductId/{productId}
        [HttpGet("ByProductId/{productId}")]
        public async Task<ActionResult<IEnumerable<ProductOption>>> ByProductId(int productId)
        {
            var productOptions = await _productOptionService.GetProductOptionsByProductId(productId);
            return Ok(productOptions);
        }

        //DELETE: clc/api/Product/ProductOption/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _productOptionService.RemoveProductOption(id);
            return Ok();
        }

        // GET: clc/api/Product/ProductOption/SearchProductOption/{page}/{pageSize}/{orderBy?}/{sortDirection?}/{query?}
        [HttpGet("SearchProductOptions/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<ProductOption>>> SearchProductOptions(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var products = await _productOptionService.SearchProductOptions(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(products);
        }

        // GET clc/api/Product/ProductOption/LastViewed
        [HttpGet("LastViewed")]
        public async Task<ActionResult<IEnumerable<LastViewedItem>>> LastViewed()
        {
            var items = await _lastViewedService.GetLastViewedItemsForUserByName("product_ProductOption");
            return Ok(items);
        }

        [HttpGet("GetBenefitsForProductOptionAndCoverType/{productOptionId}/{coverMemberTypeId}")]
        public async Task<ActionResult<IEnumerable<BenefitModel>>> GetBenefitsForProductOptionAndCoverType(int productOptionId, int coverMemberTypeId)
        {
            var benefits = await _productOptionService.GetBenefitsForProductOptionAndCoverType(productOptionId, coverMemberTypeId);
            return Ok(benefits);
        }

        // GET: clc/api/Product/GetCoverMemberTypeBenefits
        [HttpGet("GetCoverMemberTypeBenefits/{productOptionId}/{coverMemberTypeId}")]
        public async Task<ActionResult<IEnumerable<Benefit>>> GetCoverMemberTypeBenefitsForProductOption(int productOptionId, int coverMemberTypeId)
        {
            var benefits = await _productOptionService.GetCoverMemberTypeBenefitsForProductOption(productOptionId, (CoverMemberTypeEnum)coverMemberTypeId);
            return Ok(benefits);
        }        

        // GET: clc/api/Product/Benefit
        [HttpGet("GetBenefitsForOption/{productOptionId}")]
        public async Task<ActionResult<IEnumerable<Benefit>>> GetBenefitsForOption(int productOptionId)
        {
            var benefits = await _productOptionService.GetBenefitsForOption(productOptionId);
            return Ok(benefits);
        }

        [HttpPost("GetBenefitsForOptionAndBenefits/{productOptionId}")]
        public async Task<ActionResult<IEnumerable<Benefit>>> GetBenefitsForOptionAndBenefits(int productOptionId, [FromBody] List<int> benefitIds)
        {
            var benefits = await _productOptionService.GetBenefitsForOptionAndBenefits(productOptionId, benefitIds);
            return Ok(benefits);
        }

        [HttpGet("GetBenefitsForProductOption/{productOptionId}")]
        public async Task<ActionResult<IEnumerable<BenefitModel>>> GetBenefitsForProductOption(int productOptionId)
        {
            var benefits = await _productOptionService.GetBenefitsForProductOption(productOptionId);
            return Ok(benefits);
        }

        [HttpGet("GetBrokerProductOptions/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<ProductOption>>> GetBrokerProductOptions(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var products = await _productOptionService.GetBrokerProductOptions(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(products);
        }

        [HttpGet("GetBrokerProductOptionsByProductId/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<ProductOption>>> GetBrokerProductOptionsByProductId(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var products = await _productOptionService.GetBrokerProductOptionsByProductId(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(products);
        }

        [HttpGet("GetBenefitsForExtendedMembers/{mainMemberOptionId}")]
        public async Task<ActionResult<IEnumerable<Benefit>>> GetBenefitsForExtendedMembers(int mainMemberOptionId)
        {
            var benefits = await _productOptionService.GetBenefitsForExtendedMembers(mainMemberOptionId);
            return Ok(benefits);
        }

        [HttpPost("GetProductOptionsByCoverTypeIds")]
        public async Task<ActionResult<IEnumerable<ProductOption>>> GetProductOptionsByCoverTypeIds([FromBody] List<int> coverTypes)
        {
            var benefits = await _productOptionService.GetProductOptionsByCoverTypeIds(coverTypes);
            return Ok(benefits);
        }

        [HttpGet("GetProductOptionWithAllOption")]
        public async Task<ActionResult<List<string>>> GetProductOptionWithAllOption()
        {
            var productOptions = await _productOptionService.GetProductOptionWithAllOption();
            return Ok(productOptions);
        }

        [HttpGet("GetProductOptionPaymentFrequency/{productOptionId}")]
        public async Task<ActionResult<List<ProductOptionPaymentFrequency>>> GetProductOptionPaymentFrequency(int productOptionId)
        {
            var productOptionPaymentFrequencies = await _productOptionService.GetBenefitsForOption(productOptionId);
            return Ok(productOptionPaymentFrequencies);
        }

        //GET: clc/api/Product/ProductOption/GetTemplate/{templateId}
        [HttpGet("GetTemplate/{templateId}")]
        public async Task<ActionResult<Template>> GetTemplate(int templateId)
        {
            var template = await _productOptionService.GetTemplate(templateId);
            return Ok(template);
        }

        //GET: clc/api/Product/ProductOptions/GetTemplates
        [HttpGet("GetTemplates")]
        public async Task<ActionResult<List<Template>>> GetTemplates()
        {
            var templates = await _productOptionService.GetTemplates();
            return Ok(templates);
        }


        [HttpPost("ImportBenefits")]
        public async Task<ActionResult<int>> ImportBenefits([FromBody] BenefitImportRequest request)
        {
            var count = await _productOptionService.ImportBenefits(request);
            return Ok(count);
        }

        [HttpGet("GetProductOptionsByProductIds/{productIds}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Product.Product>>> GetProductOptionsByProductIds(string productIds)
        {
            var productIdsList = productIds?.Split(',').Select(int.Parse).ToList();
            var productsOptions = await _productOptionService.GetProductOptionsByProductIds(productIdsList);
            return Ok(productsOptions);
        }

        [HttpGet("GetProductOptionsByIds/{ids}")]
        public async Task<ActionResult<List<ProductOption>>> GetProductOptionsByIds(string ids)
        {
            var productOptionIds = ids?.Split(',').Select(int.Parse).ToList();
            var productsOptions = await _productOptionService.GetProductOptionsByIds(productOptionIds);
            return Ok(productsOptions);
        }

        [HttpGet("GetProductOptionsByIdsForDeclarations/{ids}")]
        public async Task<ActionResult<List<ProductOption>>> GetProductOptionsByIdsForDeclarations(string ids)
        {
            var productOptionIds = ids?.Split(',').Select(int.Parse).ToList();
            var productsOptions = await _productOptionService.GetProductOptionsByIdsForDeclarations(productOptionIds);
            return Ok(productsOptions);
        }

        [HttpGet("GetProductOptionsWithAllowanceTypes")]
        public async Task<ActionResult<List<ProductOption>>> GetProductOptionsWithAllowanceTypes()
        {
            var productOptions = await _productOptionService.GetProductOptionsWithAllowanceTypes();
            return Ok(productOptions);
        }

        [HttpGet("GetProductOptionsWithDependencies")]
        public async Task<ActionResult<List<ProductOption>>> GetProductOptionsWithDependencies()
        {
            var productOptions = await _productOptionService.GetProductOptionsWithDependencies();
            return Ok(productOptions);
        }

        [HttpGet("GetProductOptionsIncludeDeleted")]
        public async Task<ActionResult<List<ProductOption>>> GetProductOptionsIncludeDeleted()
        {
            var productOptions = await _productOptionService.GetProductOptionsIncludeDeleted();
            return Ok(productOptions);
        }

        [HttpGet("GetBenefitsByProductOptionId/{productOptionId}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Product.Benefit>>> GetBenefitsByProductOptionId(int productOptionId)
        {
            var productsOptionsBenefits = await _productOptionService.GetBenefitsByProductOptionId(productOptionId);
            return Ok(productsOptionsBenefits);
        }

        [HttpGet("GetProductOptionsThatAllowTermArrangements")]
        public async Task<ActionResult<List<ProductOption>>> GetProductOptionsThatAllowTermArrangements()
        {
            var productOptions = await _productOptionService.GetProductOptionsThatAllowTermArrangements();
            return Ok(productOptions);
        }

    }
}