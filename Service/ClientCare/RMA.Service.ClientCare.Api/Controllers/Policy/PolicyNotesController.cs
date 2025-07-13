using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Policy
{
    [Route("api/Policy/[controller]")]
    public class PolicyNotesController : RmaApiController
    {
        private readonly IPolicyNoteService _policyNoteService;
        public PolicyNotesController(IPolicyNoteService policyNoteService)
        {
            _policyNoteService = policyNoteService;
        }

        [HttpGet("Detail/{noteId}")]
        public async Task<ActionResult<PolicyNote>> GetNoteDetail(int noteId)
        {
            var note = await _policyNoteService.GetNote(noteId);
            return Ok(note);
        }

        [HttpGet("{itemType}/{policyId}")]
        public async Task<ActionResult<IEnumerable<PolicyNote>>> Get(int policyId)
        {
            var notes = await _policyNoteService.GetNotes(policyId);
            return Ok(notes);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Note noteModel)
        {
            var id = await _policyNoteService.AddNote(noteModel);
            return Ok(id);
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] Note noteModel)
        {
            await _policyNoteService.EditNote(noteModel);
            return Ok();
        }

        [HttpPost("AddPolicyNote")]
        public async Task<ActionResult<int>> AddPolicyNote([FromBody] PolicyNote policyNote)
        {
            var id = await _policyNoteService.AddPolicyNote(policyNote);
            return Ok(id);
        }

        [HttpPut("EditPolicyNote")]
        public async Task<ActionResult> EditPolicyNote([FromBody] PolicyNote policyNote)
        {
            await _policyNoteService.EditPolicyNote(policyNote);
            return Ok();
        }
    }
}