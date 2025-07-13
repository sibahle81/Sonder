using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PersonEventDiseaseDetail
    {
        public int PersonEventId { get; set; } // PersonEventId (Primary key)
        public string NatureOfDisease { get; set; } // NatureOfDisease (length: 50)
        public DiseaseTypeEnum? TypeOfDisease { get; set; } // TypeOfDiseaseId
        public int? CauseOfDiseaseId { get; set; } // CauseOfDiseaseId
        public System.DateTime? DateDiagnosis { get; set; } // DateDiagnosis
    }
}
