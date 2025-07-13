using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Billing.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Api.Controllers
{
    [Route("api/billing/[controller]")]
    public class InterDebtorTransferNotesController : RmaApiController
    {
        private readonly IInterDebtorTransferNoteService _noteService;

        public InterDebtorTransferNotesController(IInterDebtorTransferNoteService noteService)
        {
            _noteService = noteService;
        }


        [HttpGet("Detail/{id}")]
        public async Task<ActionResult<Note>> GetNote(int id)
        {
            var note = await _noteService.GetNote(id);
            return Ok(note);
        }

        [HttpGet("Detail/{manager}/{noteId}")]
        public async Task<ActionResult<Note>> GetNoteDetail(int manager, int noteId)
        {
            var note = await _noteService.GetNote(noteId);
            return Ok(note);
        }


        [HttpGet("{itemType}/{interDebtorTransferId}")]
        public async Task<ActionResult<IEnumerable<Note>>> Get(string itemType, int interDebtorTransferId)
        {
            var notes = await _noteService.GetNotes(interDebtorTransferId);
            return Ok(notes);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Note noteModel)
        {
            var id = await _noteService.AddNote(noteModel);
            return Ok(id);
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] Note noteModel)
        {
            await _noteService.EditNote(noteModel);
            return Ok();
        }
    }
}
