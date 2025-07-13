using System;
using System.Collections.Generic;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class RuleRequestResultResponse
    {
        public Guid RequestId { get; set; }

        public bool OverallSuccess { get; set; }

        public List<RuleResultResponse> RuleResults { get; set; }
    }
}
