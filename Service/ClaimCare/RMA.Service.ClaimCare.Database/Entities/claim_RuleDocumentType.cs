//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//		
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using RMA.Common.Database.Contracts.Repository;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Enums;

namespace RMA.Service.ClaimCare.Database.Entities
{
    public partial class claim_RuleDocumentType : ILazyLoadSafeEntity
    {
        public int Id { get; set; } // Id (Primary key)
        public int DocumentRuleId { get; set; } // DocumentRuleId
        public DocumentTypeEnum DocumentType { get; set; } // DocumentTypeId
        public bool IsRequired { get; set; } // isRequired

        public claim_RuleDocumentType()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
