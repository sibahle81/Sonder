using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class BankController : RmaApiController
    {
        private readonly IBankService _bankRepository;

        public BankController(IBankService bankRepository)
        {
            _bankRepository = bankRepository;
        }

        // GET: mdm/api/Bank
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Bank>>> Get()
        {
            var levels = await _bankRepository.GetBanks();
            return Ok(levels);
        }

        // GET: mdm/api/Bank/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Bank>> Get(int id)
        {
            return Ok(await _bankRepository.GetBank(id));
        }
    }
}