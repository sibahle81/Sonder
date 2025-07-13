using Microsoft.AspNetCore.Mvc;

using RMA.Common.Security;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class FollowUpController : RmaApiController
    {
        private readonly IFollowUpService _followUp;

        public FollowUpController(IFollowUpService followUp)
        {
            _followUp = followUp;
        }

        // GET: mdm/api/FollowUp/GetActiveFollowUps
        [HttpGet("GetActiveFollowUps")]
        public async Task<ActionResult> GetActiveFollowUps()
        {
            ////var username = GetUsername();
            //var followUps = _followUp.GetActiveFollowUps(username);
            return Ok();
        }

        // GET: mdm/api/FollowUp
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FollowUp>>> Get()
        {
            var followUps = await _followUp.GetFollowUps();
            return Ok(followUps);
        }

        // GET: mdm/api/FollowUp/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<FollowUp>> Get(int id)
        {
            var followUp = await _followUp.GetFollowUp(id);
            return Ok(followUp);
        }

        //POST: mdm/api/FollowUp/{followUp}
        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] FollowUp followUp)
        {
            var id = await _followUp.AddFollowUp(followUp, RmaIdentity.Username);
            return Ok(id);
        }

        //PUT: mdm/api/FollowUp/{followUp}
        [HttpPut]
        public async Task<ActionResult> Put([FromBody] FollowUp followUp)
        {
            await _followUp.UpdateFollowUp(followUp, RmaIdentity.Username);
            return Ok();
        }

        // Delete mdm/api/FollowUp/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _followUp.RemoveFollowUp(id, RmaIdentity.Username);
            return Ok();
        }
    }
}