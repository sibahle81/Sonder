using RMA.Common.Entities;

namespace RMA.Service.Billing.Contracts.Integration.Hyphen
{
    public class RootHyphenFACSResponse : ServiceBusMessageBase
    {
        public HyphenFACSResponse hyphenFACSResponse { get; set; }
    }
}
