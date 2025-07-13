using System.Collections.Generic;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class RuleResultResponse
    {
        public RuleResultResponse()
        {
            MessageList = new List<string>();
        }

        public string RuleName { get; set; }
        public bool Passed { get; set; }
        public List<string> MessageList { get; set; }
    }
}
