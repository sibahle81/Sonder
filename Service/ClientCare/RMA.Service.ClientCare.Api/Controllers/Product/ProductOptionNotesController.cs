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

    public class ProductOptionNotesController : RmaApiController
    {
        private readonly IProductOptionNoteService _notesService;
        private const int NotesManager = 13;

        public ProductOptionNotesController(IProductOptionNoteService notesService)
        {
            _notesService = notesService;
        }

        //GET: clc/api/ProductOptionNotes/Detail/{id}
        [HttpGet("Detail/{id}")]
        public async Task<ActionResult<Note>> GetNote(int id)
        {
            var note = await _notesService.GetNote(id);
            return Ok(note);
        }

        // GET: clc/api/Product/ProductOptionNotes/Detail/{id}
        [HttpGet("Detail/{manager}/{noteId}")]
        public async Task<ActionResult<Note>> GetNoteDetail(int manager, int noteId)
        {
            if (!manager.Equals(NotesManager))
            {
                throw new Exception($"Invalid note manager {manager} specified.");
            }
            var note = await _notesService.GetNote(noteId);
            return Ok(note);
        }

        // GET: clc/api/Product/ProductOptionNotes/{itemType}/{productId}
        [HttpGet("{itemType}/{productId}")]
        public async Task<ActionResult<IEnumerable<Note>>> Get(string itemType, int productId)
        {
            var notes = await _notesService.GetNotes(productId);
            return Ok(notes);
        }

        //POST: clc/api/Product/ProductOptionNotes/{noteModel}
        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Note noteModel)
        {
            var id = await _notesService.AddNote(noteModel);
            return Ok(id);
        }

        //PUT: clc/api/Product/ProductOptionNotes/{noteModel}
        [HttpPut]
        public async Task<ActionResult> Put([FromBody] Note noteModel)
        {
            await _notesService.EditNote(noteModel);
            return Ok();
        }
    }
}