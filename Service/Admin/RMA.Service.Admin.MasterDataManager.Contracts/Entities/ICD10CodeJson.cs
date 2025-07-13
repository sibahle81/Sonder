using Newtonsoft.Json;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class ICD10CodeJsonObject
    {
        [JsonProperty("icd10Code")]
        public string Icd10Level4Code { get; set; }

        [JsonProperty("bodySideAffected")]
        public int BodySideAffected { get; set; }

        [JsonProperty("severity")]
        public int Severity { get; set; }
    }

}
