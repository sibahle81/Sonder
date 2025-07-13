using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class RateIndustryController : RmaApiController
    {
        private readonly IRateIndustryService _rateIndustryRepository;

        public RateIndustryController(IRateIndustryService rateIndustryRepository)
        {
            _rateIndustryRepository = rateIndustryRepository;
        }

        // GET: mdm/api/RateIndustry
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RateIndustry>>> Get()
        {
            var rateIndustries = await _rateIndustryRepository.GetIndustryGroup();
            return Ok(rateIndustries);
        }

        // GET: mdm/api/RateIndustry/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<RateIndustry>> Get(int id)
        {
            var rateIndustries = await _rateIndustryRepository.GetRate(id);
            return Ok(rateIndustries);
        }

        // GET: mdm/api/RateIndustry/ByIndustryGroup/{industryGroup}
        [HttpGet("ByIndustryGroup/{industryGroup}")]
        public async Task<ActionResult<IEnumerable<RateIndustry>>> Get(string industryGroup)
        {
            var rateIndustries = await _rateIndustryRepository.GetRateIndustries(industryGroup);
            return Ok(rateIndustries);
        }

        // GET: mdm/api/RateIndustry/GetIndustryRates/{industryGroup}/{skillSubCategoryId}
        [HttpGet("GetIndustryRates/{industryGroup}/{skillSubCategory}")]
        public async Task<ActionResult<IEnumerable<RateIndustry>>> GetIndustryRates(string industryGroup,
            SkillSubCategoryEnum skillSubCategory)
        {
            var industryRates = await _rateIndustryRepository.GetIndustryRates(industryGroup, skillSubCategory);
            return Ok(industryRates);
        }

        // GET: mdm/api/RateIndustry/{industry}/{empCategory}
        [HttpGet("{industry}/{empCategory}")]
        public async Task<ActionResult<IEnumerable<RateIndustry>>> Get(string industry, string empCategory)
        {
            var rateIndustries = await _rateIndustryRepository.GetPremium(industry, empCategory);
            return Ok(rateIndustries);
        }

        // GET: mdm/api/RateIndustry/Obsolete/{industryGroup}/{id}/{empCategory}
        [HttpGet("Obsolete/{industryGroup}/{id}/{empCategory}")]
        [Obsolete("the industry group and emp category parameters are not required ** remove from front end, use Byid")]
        public async Task<ActionResult<IEnumerable<RateIndustry>>> Get(string industryGroup, int id, string empCategory)
        {
            var rateIndustries = await _rateIndustryRepository.GetRate(id);
            return Ok(rateIndustries);
        }

        // GET: mdm/api/RateIndustry/GetRates/{industryName}/{industryGroup}/{ratingYear}
        [HttpGet("GetRates/{industryName}/{industryGroup}/{ratingYear}")]
        public async Task<ActionResult<IEnumerable<RateIndustry>>> GetRates(string industryName, string industryGroup, int ratingYear)
        {
            var rateIndustries = await _rateIndustryRepository.GetRates(industryName, industryGroup, ratingYear);
            return Ok(rateIndustries);
        }

        // GET: mdm/api/RateIndustry/GetRatesForIndustry/{industryName}/{industryGroup}
        [HttpGet("GetRatesForIndustry/{industryName}/{industryGroup}")]
        public async Task<ActionResult<IEnumerable<RateIndustry>>> GetRatesForIndustry(string industryName, string industryGroup)
        {
            var rateIndustries = await _rateIndustryRepository.GetRatesForIndustry(industryName, industryGroup);
            return Ok(rateIndustries);
        }
    }
}