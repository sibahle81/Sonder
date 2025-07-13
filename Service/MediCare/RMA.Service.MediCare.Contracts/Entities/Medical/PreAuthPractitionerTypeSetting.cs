using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PreAuthPractitionerTypeSetting
    {
        public int PreAuthPractitionerTypeSettingId { get; set; }
        public PreAuthTypeEnum PreAuthType { get; set; }
        public int PractitionerTypeId { get; set; }
        public bool IsHospital { get; set; }
        public bool IsTreatingDoctor { get; set; }
    }
}
