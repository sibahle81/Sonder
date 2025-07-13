using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.ClientCare.Contracts.Entities.Quote;

using System.Collections.Generic;
using System.Threading.Tasks;

using QuoteModel = RMA.Service.ClientCare.Contracts.Entities.Quote.Quote;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Quote
{
    public interface IQuoteService : IService
    {
        Task<OneTimePinModel> GetOneTimePinByQuoteNumber(string quoteNumber);
        Task<QuoteModel> GetQuoteByQuoteNumber(string quoteNumber, int oneTimePin);
        Task<OneTimePinModel> GetOneTimePinByQuoteNumberViaEmail(string quoteNumber);
        Task<string> GenerateMemberNumber(string memberName);

        Task<PagedRequestResult<QuoteV2>> GetPagedQuotesV2(PagedRequest pagedRequest);
        Task<PagedRequestResult<QuoteV2>> SearchQuotesV2Paged(int rolePlayerId, int quoteStatusId, int clientTypeId, PagedRequest pagedRequest);
        Task<QuoteV2> GetQuoteV2(int quoteId);
        Task<int> CreateQuotes(List<QuoteV2> quotes);
        Task<int> UpdateQuotes(List<QuoteV2> quotes);
        Task<int> UpdateQuote(QuoteV2 quote);
        Task<List<QuoteV2>> GetQuotesV2(int leadId);
        Task EmailQuote(List<string> emailAddresses, QuoteV2 quote);
    }
}
