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

    public class ProductNotesController : RmaApiController
    {
        private readonly IProductNoteService _productNoteService;
        private const int ProductManager = 2;

        public ProductNotesController(IProductNoteService productNoteService)
        {
            _productNoteService = productNoteService;
        }

        //GET: clc/api/ProductNotes/Detail/{id}
        [HttpGet("Detail/{id}")]
        public async Task<ActionResult<Note>> GetNote(int id)
        {
            var note = await _productNoteService.GetNote(id);
            return Ok(note);
        }

        // GET: clc/api/Product/ProductNotes/Detail/{id}
        [HttpGet("Detail/{manager}/{noteId}")]
        public async Task<ActionResult<Note>> GetNoteDetail(int manager, int noteId)
        {
            if (!manager.Equals(ProductManager))
            {
                throw new Exception($"Invalid note manager {manager} specified.");
            }
            var note = await _productNoteService.GetNote(noteId);
            return Ok(note);
        }


        // GET: clc/api/Product/ProductNotes/{itemType}/{productId}
        [HttpGet("{itemType}/{productId}")]
        public async Task<ActionResult<IEnumerable<Note>>> Get(string itemType, int productId)
        {
            var notes = await _productNoteService.GetNotes(productId);
            return Ok(notes);
        }

        //POST: clc/api/Product/ProductNotes/{noteModel}
        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Note noteModel)
        {
            var id = await _productNoteService.AddNote(noteModel);
            return Ok(id);
        }

        //PUT: clc/api/Product/ProductNotes/{noteModel}
        [HttpPut]
        public async Task<ActionResult> Put([FromBody] Note noteModel)
        {
            await _productNoteService.EditNote(noteModel);
            return Ok();
        }
    }
}