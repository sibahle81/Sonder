using System.Collections.Generic;

namespace RMA.Service.Integrations.Contracts.Entities.CompCare
{
    public class MedicalReportCategory
    {
        public int Key { get; set; }
        public string Value { get; set; }
    }

    public class ResponseMedicalReportCategory
    {
        public List<MedicalReportCategory> medicalReportCategories { get; set; }
    }

    public class RootMedicalReportCategory
    {
        public ResponseMedicalReportCategory response { get; set; }
    }

}


