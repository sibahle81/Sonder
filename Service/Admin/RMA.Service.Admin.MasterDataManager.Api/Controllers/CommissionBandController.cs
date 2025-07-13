using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class CommissionBandController : RmaApiController
    {
        private readonly ICommissionBandService _commissionBandService;

        public CommissionBandController(ICommissionBandService commissionBandService)
        {
            _commissionBandService = commissionBandService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CommissionBand>>> Get()
        {
            var commissionBands = await _commissionBandService.GetCommissionBands();
            return Ok(commissionBands);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<CommissionBand>> Get(int id)
        {
            var commissionBand = await _commissionBandService.GetCommissionBandById(id);
            return Ok(commissionBand);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post(CommissionBand commissionBand)
        {
            var id = await _commissionBandService.AddCommissionBand(commissionBand);
            return Ok(id);
        }

        [HttpPut]
        public async Task<ActionResult> Put(CommissionBand commissionBand)
        {
            await _commissionBandService.EditCommissionBand(commissionBand);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _commissionBandService.RemoveCommissionBandRepository(id);
            return Ok();
        }
    }
}
