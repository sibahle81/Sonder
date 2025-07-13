using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.BusinessProcessManager.Api.Controllers
{
    public class NotesController : RmaApiController
    {
        private readonly INoteService _noteService;
        private const int BpmManager = 4;

        public NotesController(INoteService noteService)
        {
            _noteService = noteService;
        }

        // GET: bpm/api/Notes/GetNote/{id}
        [HttpGet("Detail/{manager}/{noteId}")]
        public async Task<ActionResult<Note>> GetNoteDetail(int manager, int noteId)
        {
            if (!manager.Equals(BpmManager))
            {
                throw new Exception($"Invalid note manager {manager} specified.");
            }
            var note = await _noteService.GetNote(noteId);
            return Ok(note);
        }

        // GET: bpm/api/Notes/{itemType}/{itemId}
        [HttpGet("{itemType}/{itemId}")]
        public async Task<ActionResult<IEnumerable<Note>>> Get(string itemType, int itemId)
        {
            var notes = await _noteService.GetNotes(itemType, itemId);
            return Ok(notes);
        }

        //PUT: bpm/api/Notes/GetNote/{noteModel}
        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Note noteModel)
        {
            var id = await _noteService.AddNote(noteModel);
            return Ok(id);
        }
    }
}