namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class MutualInclusiveExclusiveCode : Common.Entities.AuditDetails
    {
        public int MutualInclusiveExclusiveCodeId { get; set; } // MutualInclusiveExclusiveCodeId (Primary key)
        public int RuleId { get; set; } // RuleId
        public string MainCode { get; set; } // MainCode (length: 50)
        public string MatchedCode { get; set; } // MatchedCode (length: 50)
    }
}
