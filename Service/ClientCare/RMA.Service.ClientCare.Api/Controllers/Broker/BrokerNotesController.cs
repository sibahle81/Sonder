using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Api.Controllers.Broker
{
    [Route("api/Broker/[controller]")]
    public class BrokerNotesController : RmaApiController
    {
        private readonly IRepresentativeNoteService _representativeNoteService;
        private const int RepresentativeManager = 15;

        public BrokerNotesController(IRepresentativeNoteService representativeNoteService)
        {
            _representativeNoteService = representativeNoteService;
        }


        [HttpGet("Detail/{id}")]
        public async Task<ActionResult<Note>> GetNote(int id)
        {
            var note = await _representativeNoteService.GetNote(id);
            return Ok(note);
        }

        [HttpGet("Detail/{manager}/{noteId}")]
        public async Task<ActionResult<Note>> GetNoteDetail(int manager, int noteId)
        {
            if (!manager.Equals(RepresentativeManager))
            {
                throw new Exception($"Invalid note manager {manager} specified.");
            }
            var note = await _representativeNoteService.GetNote(noteId);
            return Ok(note);
        }


        [HttpGet("{itemType}/{representativeId}")]
        public async Task<ActionResult<IEnumerable<Note>>> Get(string itemType, int representativeId)
        {
            var notes = await _representativeNoteService.GetNotes(representativeId);
            return Ok(notes);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Note noteModel)
        {
            var id = await _representativeNoteService.AddNote(noteModel);
            return Ok(id);
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] Note noteModel)
        {
            await _representativeNoteService.EditNote(noteModel);
            return Ok();
        }
    }
}
