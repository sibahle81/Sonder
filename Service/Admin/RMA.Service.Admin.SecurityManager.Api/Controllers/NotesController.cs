using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.SecurityManager.Api.Controllers
{
    public class NotesController : RmaApiController
    {
        private readonly INoteService _noteService;
        private const int SecurityManager = 1;

        public NotesController(INoteService noteService)
        {
            _noteService = noteService;
        }

        // GET: sec/api/Notes/GetNote/{id}
        [HttpGet("GetNote/{id}")]
        public async Task<ActionResult<NoteModel>> GetNote(int id)
        {
            var note = await _noteService.GetNote(id);
            return Ok(note);
        }

        // GET: sec/api/Notes/{itemType}/{itemId}
        [HttpGet("{itemType}/{itemId}")]
        public async Task<ActionResult<IEnumerable<NoteModel>>> Get(string itemType, int itemId)
        {
            var notes = await _noteService.GetNotes(itemType, itemId);
            return Ok(notes);
        }

        // GET: clc/api/Client/Notes/Detail/{id}
        [HttpGet("Detail/{manager}/{noteId}")]
        public async Task<ActionResult<Note>> GetNoteDetail(int manager, int noteId)
        {
            if (!manager.Equals(SecurityManager))
            {
                throw new Exception($"Invalid note manager {manager} specified.");
            }
            var note = await _noteService.GetNote(noteId);
            return Ok(note);
        }


        //POST: sec/api/Notes/{note}
        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] NoteModel note)
        {
            var id = await _noteService.AddNote(note);
            return Ok(id);
        }

        //PUT: sec/api/Notes/{note}
        [HttpPut]
        public async Task<ActionResult> Put([FromBody] NoteModel note)
        {
            await _noteService.EditNote(note);
            return Ok();
        }
    }
}