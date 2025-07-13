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
    public class BrokerageNotesController : RmaApiController
    {
        private readonly IBrokerageNoteService _brokerageNoteService;
        private const int BrokerageManager = 14;

        public BrokerageNotesController(IBrokerageNoteService brokerageNoteService)
        {
            _brokerageNoteService = brokerageNoteService;
        }


        [HttpGet("Detail/{id}")]
        public async Task<ActionResult<Note>> GetNote(int id)
        {
            var note = await _brokerageNoteService.GetNote(id);
            return Ok(note);
        }

        [HttpGet("Detail/{manager}/{noteId}")]
        public async Task<ActionResult<Note>> GetNoteDetail(int manager, int noteId)
        {
            if (!manager.Equals(BrokerageManager))
            {
                throw new Exception($"Invalid note manager {manager} specified.");
            }
            var note = await _brokerageNoteService.GetNote(noteId);
            return Ok(note);
        }


        [HttpGet("{itemType}/{brokerageId}")]
        public async Task<ActionResult<IEnumerable<Note>>> Get(string itemType, int brokerageId)
        {
            var notes = await _brokerageNoteService.GetNotes(brokerageId);
            return Ok(notes);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Note noteModel)
        {
            var id = await _brokerageNoteService.AddNote(noteModel);
            return Ok(id);
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] Note noteModel)
        {
            await _brokerageNoteService.EditNote(noteModel);
            return Ok();
        }
    }
}
