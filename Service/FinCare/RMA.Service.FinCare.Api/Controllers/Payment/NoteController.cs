using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.FinCare.Contracts.Interfaces.Payments;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Api.Controllers.Payment
{
    public class NoteController : RmaApiController
    {
        private readonly IPaymentNoteService _noteService;


        public NoteController(IPaymentNoteService noteService)
        {
            _noteService = noteService;
        }

        [HttpGet("GetNote/{noteId}")]
        public async Task<ActionResult<Note>> GetNote(int noteId)
        {
            var note = await _noteService.GetNote(noteId);
            return Ok(note);
        }

        [HttpGet("GetNotes/{paymentId}")]
        public async Task<ActionResult<IEnumerable<Note>>> GetNotes(int paymentId)
        {
            var notes = await _noteService.GetNotes(paymentId);
            return Ok(notes);
        }

        [HttpPost]
        public async Task<ActionResult<int>> AddNote([FromBody] Note noteModel)
        {
            var id = await _noteService.AddNote(noteModel);
            return Ok(id);
        }

        [HttpPut]
        public async Task<ActionResult> EditNote([FromBody] Note noteModel)
        {
            await _noteService.EditNote(noteModel);
            return Ok();
        }
    }
}
