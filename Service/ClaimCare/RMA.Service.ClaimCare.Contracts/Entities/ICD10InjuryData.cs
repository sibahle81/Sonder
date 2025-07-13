using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ICD10InjuryData
    {
        public List<ICD10Injury> ClaimInjuries { get; set; }
        public List<ICD10Injury> PreAuthICD10Codes { get; set; }
        public List<ICD10Injury> ICD10CodesToValidate { get; set; }
    }
}
