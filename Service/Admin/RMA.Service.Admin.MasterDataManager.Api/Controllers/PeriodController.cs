using Microsoft.AspNetCore.Mvc;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class PeriodController : RmaApiController
    {
        private readonly IPeriodService _periodRepository;

        public PeriodController(IPeriodService periodRepository)
        {
            _periodRepository = periodRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Period>>> Get()
        {
            var periods = await _periodRepository.GetPeriods();
            return Ok(periods);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Period>> Get(int id)
        {
            var period = await _periodRepository.GetPeriodById(id);
            return Ok(period);
        }

        [HttpGet("GetCurrentPeriod")]
        public async Task<ActionResult<Period>> GetCurrentPeriod()
        {
            var period = await _periodRepository.GetCurrentPeriod();
            return Ok(period);
        }

        [HttpGet("GetLatestPeriod")]
        public async Task<ActionResult<Period>> GetLatestPeriod()
        {
            var period = await _periodRepository.GetLatestPeriod();
            return Ok(period);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post(Period period)
        {
            var id = await _periodRepository.AddPeriod(period);
            return Ok(id);
        }

        [HttpPut]
        public async Task<ActionResult> Put(Period period)
        {
            await _periodRepository.EditPeriod(period);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _periodRepository.RemovePeriod(id);
            return Ok();
        }

        [HttpGet("CreateBillingPeriods")]
        public async Task<ActionResult<int>> CreateBillingPeriods()
        {
            var result = await _periodRepository.GenerateBillingPeriods();
            return Ok(result);
        }

        [HttpGet("RollBillingPeriod/{runPeriodConcurrently}")]
        public async Task<ActionResult<int>> RollBillingPeriods(bool runPeriodConcurrently)
        {
            var result = await _periodRepository.RollBillingPeriods(runPeriodConcurrently);
            return Ok(result);
        }

        [HttpGet("GetPeriodByYearAndMonth/{year}/{month}")]
        public async Task<ActionResult<int>> GetPeriodByYearAndMonth(int year, int month)
        {
            var result = await _periodRepository.GetPeriodByYearAndMonth(year, month);
            return Ok(result);
        }
    }
}
