using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class EuropAssistPremiumMatrixController : RmaApiController
    {
        private readonly IEuropAssistPremiumMatrixService _europAssistPremiumMatrixService;

        public EuropAssistPremiumMatrixController(IEuropAssistPremiumMatrixService europAssistPremiumMatrixService)
        {
            _europAssistPremiumMatrixService = europAssistPremiumMatrixService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EuropAssistPremiumMatrix>>> Get()
        {
            var europAssistPremiumMatrices = await _europAssistPremiumMatrixService.GetEuropAssistPremiumMatrices();
            return Ok(europAssistPremiumMatrices);
        }
    }
}
