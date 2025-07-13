namespace RMA.Service.Integrations.Contracts.Entities.Hyphen
{
    public class RootHyphenVerificationResult
    {
        public bool success { get; set; }
        public string errmsg { get; set; }
        public int count { get; set; }
        public HyphenVerificationResult response { get; set; }
    }
}
