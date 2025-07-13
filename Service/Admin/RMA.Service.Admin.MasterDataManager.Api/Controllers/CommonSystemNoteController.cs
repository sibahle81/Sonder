using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Threading.Tasks;


namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class CommonSystemNoteController : RmaApiController
    {

        private readonly ICommonSystemNoteService _commonSystemNoteService;

        public CommonSystemNoteController(
            ICommonSystemNoteService commonSystemNoteService
           )
        {
            _commonSystemNoteService = commonSystemNoteService;
        }

        [HttpPost("CreateCommonSystemNote")]
        public async Task<ActionResult<int>> CreateCommonSystemNote([FromBody] CommonSystemNote note)
        {
            var result = await _commonSystemNoteService.CreateCommonSystemNote(note);
            return Ok(result);
        }

        [HttpPut("UpdateCommonSystemNote")]
        public async Task<ActionResult<int>> UpdateCommonSystemNote([FromBody] CommonSystemNote note)
        {
            var result = await _commonSystemNoteService.UpdateCommonSystemNote(note);
            return Ok(result);
        }

        [HttpPost("GetPagedCommonSystemNotes")]
        public async Task<ActionResult<PagedRequestResult<CommonSystemNote>>> GetPagedCommonSystemNotes([FromBody] CommonSystemNoteSearchRequest commonSystemNoteSearchRequest)
        {
            var result = await _commonSystemNoteService.GetPagedCommonSystemNotes(commonSystemNoteSearchRequest);
            return Ok(result);
        }

        [HttpGet("GetCommonSystemNote/{id}")]
        public async Task<ActionResult<CommonSystemNote>> GetCommonSystemNote(int id)
        {
            var commonNote = await _commonSystemNoteService.GetCommonSystemNote(id);
            return Ok(commonNote);
        }

    }
}
