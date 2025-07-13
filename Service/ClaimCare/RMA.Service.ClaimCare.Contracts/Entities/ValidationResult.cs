using System;
using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ValidationResult
    {
        public bool Result { get; set; }
        public List<string> Message { get; set; }
        public DateTime EmitDate { get; set; }
    }
}
