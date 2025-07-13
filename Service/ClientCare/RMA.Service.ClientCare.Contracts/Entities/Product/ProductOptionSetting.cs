using RMA.Service.ClientCare.Contracts.Enums.Product;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class ProductOptionSetting
    {
        public int Id { get; set; } // Id (Primary key)
        public int ProductOptionId { get; set; } // ProductOptionId
        public string Name { get; set; } // Name (length: 50)
		public string Value { get; set; } // Value
		public int SettingTypeId { get; set; } // SettingTypeId
		public int SettingCategoryId { get; set; } // SettingCategoryId
        public string Description { get; set; } //Description		
		public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}