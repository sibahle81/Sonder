using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Product
{
    [Route("api/Product/[controller]")]

    public class BenefitNotesController : RmaApiController
    {
        private readonly IBenefitNoteService _benefitNoteService;
        private const int BenefitManager = 12;

        public BenefitNotesController(IBenefitNoteService benefitNoteService)
        {
            _benefitNoteService = benefitNoteService;
        }

        // GET: clc/api/Product/BenefitNotes/Detail/{id}
        [HttpGet("Detail/{manager}/{noteId}")]
        public async Task<ActionResult<Note>> GetNoteDetail(int manager, int noteId)
        {
            if (!manager.Equals(BenefitManager))
            {
                throw new Exception($"Invalid note manager {manager} specified.");
            }
            var note = await _benefitNoteService.GetNote(noteId);
            return Ok(note);
        }


        // GET: clc/api/Product/BenefitNotes/{itemType}/{itemId}
        [HttpGet("{itemType}/{itemId}")]
        public async Task<ActionResult<IEnumerable<Note>>> Get(string itemType, int itemId)
        {
            var notes = await _benefitNoteService.GetNotes(itemType, itemId);
            return Ok(notes);
        }

        //POST: clc/api/Product/BenefitNotes/{noteModel}
        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Note noteModel)
        {
            var id = await _benefitNoteService.AddNote(noteModel);
            return Ok(id);
        }

        //PUT: clc/api/Product/BenefitNotes/{noteModel}
        [HttpPut]
        public async Task<ActionResult> Put([FromBody] Note noteModel)
        {
            await _benefitNoteService.EditNote(noteModel);
            return Ok();
        }
    }
}