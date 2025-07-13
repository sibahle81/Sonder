using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Entities.Quote;
using RMA.Service.ClientCare.Contracts.Interfaces.Quote;

using System.Collections.Generic;
using System.Threading.Tasks;

using QuoteModel = RMA.Service.ClientCare.Contracts.Entities.Quote.Quote;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Quote
{
    [Route("api/Quote/[controller]")]
    public class QuoteController : RmaApiController
    {
        private readonly IQuoteService _quoteService;

        public QuoteController(
            IQuoteService quoteService
        )
        {
            _quoteService = quoteService;
        }


        [AllowAnonymous]
        [HttpGet("GetOneTimePinByQuoteNumber/{quoteNumber}")]
        public async Task<ActionResult<OneTimePinModel>> GetOneTimePinByQuoteNumber(string quoteNumber)
        {
            var oneTimePinModel = await _quoteService.GetOneTimePinByQuoteNumber(quoteNumber);
            return Ok(oneTimePinModel);
        }

        [AllowAnonymous]
        [HttpGet("GetOneTimePinByQuoteNumberViaEmail/{quoteNumber}")]
        public async Task<ActionResult<OneTimePinModel>> GetOneTimePinByQuoteNumberViaEmail(string quoteNumber)
        {
            var oneTimePinModel = await _quoteService.GetOneTimePinByQuoteNumberViaEmail(quoteNumber);
            return Ok(oneTimePinModel);
        }

        [AllowAnonymous]
        [HttpGet("GetQuoteDetailsByQuoteNumber/{quoteNumber}/{oneTimePin}")]
        public async Task<ActionResult<QuoteModel>> GetQuoteDetailsByQuoteNumber(string quoteNumber, int oneTimePin)
        {
            var quoteModel = await _quoteService.GetQuoteByQuoteNumber(quoteNumber, oneTimePin);
            return Ok(quoteModel);
        }

        [AllowAnonymous]
        [HttpGet("GenerateMemberNumber/{memberName}")]
        public async Task<ActionResult<string>> GenerateMemberNumber(string memberName)
        {
            var memberNumber = await _quoteService.GenerateMemberNumber(memberName);
            return Ok(memberNumber);
        }

        [HttpGet("GetPagedQuotesV2/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<QuoteV2>>> GetPagedQuotesV2(int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var quotesV2 = await _quoteService.GetPagedQuotesV2(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(quotesV2);
        }

        [HttpGet("SearchQuotesV2Paged/{rolePlayerId}/{quoteStatusId}/{clientTypeId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<QuoteV2>>> SearchQuotesV2Paged(int rolePlayerId, int quoteStatusId, int clientTypeId, int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var quotesV2 = await _quoteService.SearchQuotesV2Paged(rolePlayerId, quoteStatusId, clientTypeId, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(quotesV2);
        }

        [HttpGet("GetQuoteV2/{quoteId}")]
        public async Task<ActionResult<List<QuoteV2>>> GetQuoteV2(int quoteId)
        {
            var data = await _quoteService.GetQuoteV2(quoteId);
            return Ok(data);
        }

        [HttpPost("CreateQuotes")]
        public async Task<ActionResult<int>> CreateQuotes([FromBody] List<QuoteV2> quotes)
        {
            var result = await _quoteService.CreateQuotes(quotes);
            return Ok(result);
        }

        [HttpPut("UpdateQuote")]
        public async Task<ActionResult<int>> UpdateQuote([FromBody] QuoteV2 quote)
        {
            var result = await _quoteService.UpdateQuote(quote);
            return Ok(result);
        }

        [HttpPut("UpdateQuotes")]
        public async Task<ActionResult<int>> UpdateQuotes([FromBody] List<QuoteV2> quotes)
        {
            var result = await _quoteService.UpdateQuotes(quotes);
            return Ok(result);
        }

        [HttpGet("GetQuotesV2/{leadId}")]
        public async Task<ActionResult<List<QuoteV2>>> GetQuotesV2(int leadId)
        {
            var data = await _quoteService.GetQuotesV2(leadId);
            return Ok(data);
        }

        [HttpPost("EmailQuote")]
        public async Task<ActionResult> EmailQuote([FromBody] QuoteEmailRequest quoteEmailRequest)
        {
            await _quoteService.EmailQuote(quoteEmailRequest?.EmailAddresses, quoteEmailRequest.Quote);
            return Ok();
        }
    }
}