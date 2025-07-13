using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Api.Controllers
{
    public class NoteController : RmaApiController
    {
        private readonly INoteService _noteService;

        public NoteController(INoteService noteService)
        {
            _noteService = noteService;
        }

        [HttpGet("Detail/{id}")]
        public async Task<ActionResult<ClaimNote>> GetNote(int id)
        {
            var note = await _noteService.GetNote(id);
            return Ok(note);
        }

        [HttpGet("Detail/{manager}/{noteId}")]
        public async Task<ActionResult<ClaimNote>> GetNoteDetail(int manager, int noteId)
        {
            //if (!manager.Equals(EventManager))
            //{
            //    throw new Exception($"Invalid note manager {manager} specified.");
            //}
            var note = await _noteService.GetNote(noteId);
            return Ok(note);
        }

        //Get: clm/api/GetNote/{_claimId}
        [HttpGet("{itemType}/{itemId}")]
        public async Task<ActionResult<IEnumerable<ClaimNote>>> Get(string itemType, int itemId)
        {
            var notes = await _noteService.GeNotes(itemType, itemId);
            return Ok(notes);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Note noteModel)
        {
            var id = await _noteService.AddNote(noteModel);
            return Ok(id);
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] ClaimNote noteModel)
        {
            await _noteService.EditNote(noteModel);
            return Ok();
        }
    }
}