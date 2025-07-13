using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyDocumentTemplate
    {
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public int RolePlayerId { get; set; }
        public RolePlayerIdentificationTypeEnum RolePlayerIdentificationType { get; set; }
        public string MemberName { get; set; }
        public string IdNumber { get; set; }
        public SettingTypeEnum SettingType { get; set; }
        public string SettingValue { get; set; }
        public DocumentSetEnum DocumentSet { get; set; }
        public DocumentTypeEnum DocumentType { get; set; }
    }
}
