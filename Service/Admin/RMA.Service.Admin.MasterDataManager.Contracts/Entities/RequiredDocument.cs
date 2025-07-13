using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class RequiredDocument
    {
        public string Name { get; set; }
        public DocumentCategoryEnum DocumentCategory { get; set; }
        public int ModuleId { get; set; }
        public string Module { get; set; }

        //Front End Compatibility
        public int DocumentCategoryId
        {
            get => (int)DocumentCategory;
            set => DocumentCategory = (DocumentCategoryEnum)value;
        }
        public string DocumentCategoryName => DocumentCategory.DisplayAttributeValue();
    }
}