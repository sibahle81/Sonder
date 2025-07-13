using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class TreatmentBasketMedicalItem : Common.Entities.AuditDetails
    {
        public int TreatmentBasketMedicalItemId { get; set; } // TreatmentBasketMedicalItemId (Primary key)
        public int TreatmentBasketId { get; set; } // TreatmentBasketId
        public int? TreatmentCodeId { get; set; } // TreatmentCodeId
        public int? MedicalItemId { get; set; } // MedicalItemId
        public PractitionerTypeEnum PractitionerType { get; set; } // PractitionerTypeId
    }
}
