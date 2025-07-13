using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.RolePlayer
{
    [Route("api/RolePlayer/[controller]")]

    public class RolePlayerNotesController : RmaApiController
    {
        private readonly IRolePlayerNoteService _rolePlayerNoteService;
        private const int RolePlayerManager = 16;

        public RolePlayerNotesController(IRolePlayerNoteService rolePlayerNoteService)
        {
            _rolePlayerNoteService = rolePlayerNoteService;
        }

        //GET: clc/api/RolePlayerNotes/Detail/{id}
        [HttpGet("Detail/{id}")]
        public async Task<ActionResult<Note>> GetNote(int id)
        {
            var note = await _rolePlayerNoteService.GetNote(id);
            return Ok(note);
        }

        // GET: clc/api/RolePlayer/RolePlayerNotes/Detail/{id}
        [HttpGet("Detail/{manager}/{noteId}")]
        public async Task<ActionResult<Note>> GetNoteDetail(int manager, int noteId)
        {
            if (!manager.Equals(RolePlayerManager))
            {
                throw new Exception($"Invalid note manager {manager} specified.");
            }
            var note = await _rolePlayerNoteService.GetNote(noteId);
            return Ok(note);
        }


        // GET: clc/api/RolePlayer/RolePlayerNotes/{rolePlayerId}
        [HttpGet("{rolePlayerId}")]
        public async Task<ActionResult<IEnumerable<Note>>> Get(int rolePlayerId)
        {
            var notes = await _rolePlayerNoteService.GetNotes(rolePlayerId);
            return Ok(notes);
        }

        //POST: clc/api/RolePlayer/RolePlayerNotes/{noteModel}
        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Note noteModel)
        {
            var id = await _rolePlayerNoteService.AddNote(noteModel);
            return Ok(id);
        }

        //PUT: clc/api/RolePlayer/RolePlayerNotes/{noteModel}
        [HttpPut]
        public async Task<ActionResult> Put([FromBody] Note noteModel)
        {
            await _rolePlayerNoteService.EditNote(noteModel);
            return Ok();
        }
    }
}