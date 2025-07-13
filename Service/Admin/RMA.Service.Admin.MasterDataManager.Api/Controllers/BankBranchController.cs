using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class BankBranchController : RmaApiController
    {
        private readonly IBankBranchService _bankBranchRepository;

        public BankBranchController(IBankBranchService bankBranchRepository)
        {
            _bankBranchRepository = bankBranchRepository;
        }

        // GET: mdm/api/BankBranch/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<BankBranch>>> Get(int id)
        {
            var branches = await _bankBranchRepository.GetBranchesByBankId(id);
            return Ok(branches);
        }

        // GET: mdm/api/BankBranch
        [HttpGet]
        public async Task<ActionResult<BankBranch>> Get()
        {
            var branches = await _bankBranchRepository.GetBranches();
            return Ok(branches);
        }
    }
}