using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Api.Controllers
{
    [Route("api/Billing/[controller]")]
    public class AbilityCollectionsController : RmaApiController
    {
        private readonly IAbilityCollectionsService _abilityCollectionsService;

        public AbilityCollectionsController(IAbilityCollectionsService abilityCollectionsService)
        {
            _abilityCollectionsService = abilityCollectionsService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AbilityCollections>>> Get()
        {
            var abilityPostings = await _abilityCollectionsService.GetAbilityPostings(-1,-1);
            return Ok(abilityPostings);
        }

        [HttpGet("ByCompanyNoAndBranchNo")]
        public async Task<ActionResult<IEnumerable<AbilityCollections>>> ByCompanyNoAndBranchNo(int companyNo,
          int branchNo )
        {
            var abilityPostings = await _abilityCollectionsService.GetAbilityPostings(companyNo, branchNo);
            return Ok(abilityPostings);
        }

        [HttpGet("Recovery")]
        public async Task<ActionResult<IEnumerable<AbilityCollections>>> GetRecoveries()
        {
            var abilityPostings = await _abilityCollectionsService.GetRecoveryAbilityPostings();
            return Ok(abilityPostings);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AbilityCollections>> Get(int id)
        {
            var post = await _abilityCollectionsService.GetAbilityPosting(id);
            return Ok(post);
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] AbilityCollections abilityPosting)
        {
            var res = await _abilityCollectionsService.AddAbilityPosting(abilityPosting);
            return Ok(res);
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] AbilityCollections abilityPosting)
        {
            await _abilityCollectionsService.EditAbilityPosting(abilityPosting);
            return Ok();
        }

        [HttpGet("Process")]
        public async Task<ActionResult<IEnumerable<AbilityCollections>>> SendToAbility()
        {
            var abilityPostings = await _abilityCollectionsService.GetAbilityPostingsToProcess();
            return Ok(abilityPostings);
        }

        [HttpGet("PostRecoveries")]
        public async Task<ActionResult<IEnumerable<AbilityCollections>>> PostRecoveries()
        {
            var abilityPostings = await _abilityCollectionsService.GetRecoveriesPostingsToProcess();
            return Ok(abilityPostings);
        }

        [HttpGet("ProcessTransactions")]
        public async Task<ActionResult> ProcessTransactionItems()
        {
            await _abilityCollectionsService.ProcessAbilityPostingItems();
            return Ok();
        }

        [HttpGet("GetAbilityIncomeAndBalanceSheetCharts")]
        public async Task<ActionResult<IEnumerable<AbilityChart>>> GetAbilityIncomeAndBalanceSheetCharts()
        {
            var results = await _abilityCollectionsService.GetAbilityIncomeAndBalanceSheetCharts();
            return Ok(results);
        }


        [HttpPost("PostCollectionSummaryToAbility")]
        public async Task<ActionResult<bool>> PostCollectionSummaryToAbility([FromBody] AbilityCollectionPostingRequest request)
        {
            var result = await _abilityCollectionsService.PostCollectionSummaryToAbility(request);
            return Ok(result);
        }
    }
}
