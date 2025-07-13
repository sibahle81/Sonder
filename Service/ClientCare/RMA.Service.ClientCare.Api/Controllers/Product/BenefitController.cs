using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Product
{
    [Route("api/Product/[controller]")]

    public class BenefitController : RmaApiController
    {
        private readonly IBenefitService _benefitService;
        private readonly ILastViewedService _lastViewedService;

        public BenefitController(IBenefitService benefitService, ILastViewedService lastViewedService)
        {
            _benefitService = benefitService;
            _lastViewedService = lastViewedService;
        }

        // GET: clc/api/Product/Benefit
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Benefit>>> Get()
        {
            var benefits = await _benefitService.GetBenefits();
            return Ok(benefits);
        }

        //Temove?
        [HttpGet("Product/{productid}")]
        public async Task<ActionResult<IEnumerable<Benefit>>> GetBenefitsByProductId(int productid)
        {
            var benefits = await _benefitService.GetBenefitsByProductId(productid);
            return Ok(benefits);
        }

        // GET: clc/api/Product/Benefit/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Benefit>> Get(int id)
        {
            var benefit = await _benefitService.GetBenefit(id);
            return Ok(benefit);
        }

        // GET: clc/api/Product/Benefit/GetBenefitsByBenefitIds
        [HttpGet("GetBenefitsByBenefitIds")]
        public async Task<ActionResult<Benefit>> GetBenefitsByBenefitIds([FromQuery] List<int> id)
        {
            var benefits = await _benefitService.GetBenefitsByBenefitIds(id);
            return Ok(benefits);
        }

        // GET: clc/api/Product/Benefit/GetProductBenefitRates
        [HttpGet("GetProductBenefitRates/{productOptionId}/{coverMemberTypeId}")]
        public async Task<ActionResult<ProductOption>> GetProductBenefitRates(int productOptionId, int coverMemberTypeId)
        {
            var benefits = await _benefitService.GetProductBenefitRates(productOptionId, coverMemberTypeId);
            return Ok(benefits);
        }

        // GET clc/api/Product/Benefit/LastViewed
        [HttpGet("LastViewed")]
        public async Task<ActionResult<IEnumerable<RMA.Service.ClientCare.Contracts.Entities.Product.LastViewedItem>>> LastViewed()
        {
            var items = await _lastViewedService.GetLastViewedItemsForUserByName("product_Benefit");
            return Ok(items);
        }

        // GET: clc/api/Product/Product/Search/{page}/{pageSize}/{orderBy?}/{sortDirection?}/{query?}
        [HttpGet("Search/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Benefit>>> Search(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var benefits = await _benefitService.SearchBenefits(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(benefits);
        }

        // GET: clc/api/Product/Benefit/GetBenefitTypes
        [HttpGet("GetBenefitTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetBenefitTypes()
        {
            var result = await _benefitService.GetBenefitTypes();
            return Ok(result);
        }

        // GET:clc/api/Product/Benefit/GetDisabilityBenefitTerms
        [HttpGet("GetDisabilityBenefitTerms")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetDisabilityBenefitTerms()
        {
            var result = await _benefitService.GetDisabilityBenefitTerms();
            return Ok(result);
        }

        // GET: clc/api/Product/Benefit/GetCoverMemberTypes
        [HttpGet("GetCoverMemberTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetCoverMemberTypes()
        {
            var result = await _benefitService.GetCoverMemberTypes();
            return Ok(result);
        }

        // GET: clc/api/Product/Benefit/GetEarningTypes
        [HttpGet("GetEarningTypes")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetEarningTypes()
        {
            var result = await _benefitService.GetEarningTypes();
            return Ok(result);
        }

        [HttpPost("UploadBenefits")]
        public async Task<ActionResult<ImportBenefitsSummary>> UploadBenefits([FromBody] FileContentImport content)
        {
            var res = await _benefitService.UploadBenefits(content);
            return Ok(res);
        }

        [HttpGet("BenefitUploadErrorAudit/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<BenefitsUploadErrorAuditDetails>>> GetPagedBenefitsErrorAudit(int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "desc", string query = "")
        {
            var benefits = await _benefitService.GetPagedBenefitsErrorAudit(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "desc"));
            return Ok(benefits);
        }
       
    }
}
