using RMA.Common.Entities;

namespace RMA.Service.Integrations.Contracts.Entities.Hyphen
{
    public class RootHyphenVerificationBankResponse : ServiceBusMessageBase
    {
        public bool success { get; set; }
        public string errmsg { get; set; }
        public int count { get; set; }
        public HyphenVerificationBankResponse Response { get; set; }
    }
}
