using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class ProductOptionDependency
    {
        public int ProductOptionDependencyId { get; set; } // ProductOptionDependencyId (Primary key)
        public int? ProductOptionId { get; set; } // ProductOptionId
        public int ChildOptionId { get; set; } // ChildOptionId
        public IndustryClassEnum IndustryClass { get; set; } // IndustryClassId
        public decimal ChildPremiumPecentage { get; set; } // ChildPremiumPecentage
        public bool QuoteAutoAcceptParentAccount { get; set; } // QuoteAutoAcceptParentAccount
    }
}