using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class MedicalReportFormWizardDetail
    {
        public int MedicalReportFormWizardDetailId { get; set; }
        public int WorkItemId { get; set; }
        public int? MedicalReportFormId { get; set; }
        public MedicalFormReportTypeEnum? MedicalFormReportType { get; set; }
        public int? WizardId { get; set; }
        public int? DocumentId { get; set; }
        public int PersonEventId { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}
