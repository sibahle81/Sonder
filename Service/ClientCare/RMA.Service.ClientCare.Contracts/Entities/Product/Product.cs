using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class Product
    {
        public int Id { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
        public int? UnderwriterId { get; set; } // UnderwriterId
        public ProductClassEnum ProductClass { get; set; } // ProductClassId
        public string Name { get; set; } // Name (length: 50)
        public string Code { get; set; } // Code (length: 50)
        public string Description { get; set; } // Description (length: 255)
        public System.DateTime StartDate { get; set; } // StartDate
        public System.DateTime? EndDate { get; set; } // EndDate
        public List<Note> ProductNotes { get; set; }
        public List<RuleItem> RuleItems { get; set; }
        public List<ProductBankAccount> ProductBankAccounts { get; set; }
        public ProductCategoryTypeEnum? ProductCategoryType { get; set; }

        // OTHER
        public ProductStatusEnum ProductStatus => GetProductStatus(EndDate);
        public string ProductStatusText => GetProductStatus(EndDate).DisplayAttributeValue();

        private static ProductStatusEnum GetProductStatus(DateTime? endDate)
        {
            return !endDate.HasValue || endDate.Value.Date >= DateTimeHelper.SaNow
                ? ProductStatusEnum.OpenForBusiness
                : ProductStatusEnum.ClosedForBusiness;
        }

        public int ProductClassId
        {
            get => (int)ProductClass;
            set => ProductClass = (ProductClassEnum)value;
        }
    }
}