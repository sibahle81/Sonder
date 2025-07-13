using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Quote
{
    public class QuoteEmailRequest
    {
        public QuoteV2 Quote { get; set; }
        public List<string> EmailAddresses { get; set; }
    }
}
