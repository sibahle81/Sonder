using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Quote;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Lead
{
    public interface ILeadCommunicationService : IService
    {
        // Task SendQuote(int wizardId, LeadModel leadModel, string parameters, string reportPath);
        // Task SendQuotes(LeadModel lead, QuoteModel quote, List<Entities.Lead.LeadContact> leadContacts, string parameters, string reportPath);
        // Task<bool> SendOneTimePin(string itemType, int itemId, string cellNumber, int oneTimePin);
        // Task<bool> SendOneTimePinViaEmail(string itemType, int itemId, string emailReceiver, int oneTimePin);

        Task SendRMAAssuranceQuoteEmail(QuoteV2 quotation, List<string> toEmailAddresses, Dictionary<string, string> ssrsReportParameters);
        Task SendRMLAssuranceQuoteEmail(QuoteV2 quotation, List<string> toEmailAddresses, Dictionary<string, string> ssrsReportParameters, ProductCategoryTypeEnum productCategoryType);
    }
}

