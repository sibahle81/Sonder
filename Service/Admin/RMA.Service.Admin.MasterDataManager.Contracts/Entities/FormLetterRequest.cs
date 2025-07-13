using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class FormLetterRequest
    {
        public string DocumentName { get; set; }
        public string JsonDocumentData { get; set; }
        public FormLetterTypeEnum DocumentType { get; set; }
        public string ModifiedBy { get; set; }

        //Front End Compatibility
        public int DocumentTypeId
        {
            get => (int)DocumentType;
            set => DocumentType = (FormLetterTypeEnum)value;
        }
    }
}