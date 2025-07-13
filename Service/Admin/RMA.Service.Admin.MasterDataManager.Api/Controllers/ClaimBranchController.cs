using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class ClaimBranchController : RmaApiController
    {
        private readonly IClaimBranchService _claimBranchRepository;

        public ClaimBranchController(IClaimBranchService claimBranchRepository)
        {
            _claimBranchRepository = claimBranchRepository;
        }

        // GET: mdm/api/ClaimBranch
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RMABranch>>> Get()
        {
            var branches = await _claimBranchRepository.GetClaimBranches();
            return Ok(branches);
        }
    }
}