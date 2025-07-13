using System.Collections.Generic;

namespace RMA.Service.Integrations.Contracts.Entities.CompCare
{

    // Root myDeserializedClass = JsonConvert.DeserializeObject<Root>(myJsonResponse); 
    public class MedicalReportType
    {
        public int Key { get; set; }
        public string Value { get; set; }
    }

    public class ResponseMedicalReportType
    {
        public List<MedicalReportType> medicalReportTypes { get; set; }
    }

    public class RootMedicalReportType
    {
        public ResponseMedicalReportType response { get; set; }
    }



}

