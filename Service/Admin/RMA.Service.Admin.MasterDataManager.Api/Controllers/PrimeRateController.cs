using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class PrimeRateController : RmaApiController
    {
        private readonly IPrimeRateService _primeRateRepository;

        public PrimeRateController(IPrimeRateService primeRateRepository)
        {
            _primeRateRepository = primeRateRepository;
        }

        // GET: mdm/api/PrimeRate
        [HttpGet]
        public async Task<ActionResult<PrimeRate>> Get()
        {
            var primeRate = await _primeRateRepository.GetLatestPrimeRate();
            return Ok(primeRate);
        }

        // GET: mdm/api/PrimeRate/history
        [HttpGet("history")]
        public async Task<ActionResult<PrimeRate>> GetAll()
        {
            var primeRates = await _primeRateRepository.GetAllPrimeRates();
            return Ok(primeRates);
        }

        // POST: mdm/api/PrimeRate
        [HttpPost]
        public async Task<ActionResult<int>> Post(PrimeRate period)
        {
            var id = await _primeRateRepository.AddPrimeRate(period);
            return Ok(id);
        }

    }
}