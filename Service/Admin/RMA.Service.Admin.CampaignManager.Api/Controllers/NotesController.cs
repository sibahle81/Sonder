using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.CampaignManager.Api.Controllers
{
    public class NotesController : RmaApiController
    {
        private readonly INoteService _noteService;

        public NotesController(INoteService noteService)
        {
            _noteService = noteService;
        }

        [HttpGet("{itemType}/{itemId}")]
        public async Task<ActionResult<IEnumerable<Note>>> Get(string itemType, int itemId)
        {
            var notes = await _noteService.GetNotes(itemType, itemId);
            return Ok(notes);
        }

        [HttpGet("ById/{id}")]
        public async Task<ActionResult<Note>> GetNote(int id)
        {
            var note = await _noteService.GetNoteById(id);
            return Ok(note);
        }

        [HttpGet("Detail/{noteId}")]
        public async Task<ActionResult<Note>> GetNoteDetail(int noteId)
        {
            var note = await _noteService.GetNoteById(noteId);
            return Ok(note);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Note note)
        {
            var id = await _noteService.AddNote(note);
            return Ok(id);
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] Note note)
        {
            await _noteService.EditNote(note);
            return Ok();
        }
    }
}