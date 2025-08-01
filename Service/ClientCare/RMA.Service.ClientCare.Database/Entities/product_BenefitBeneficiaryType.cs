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

namespace RMA.Service.ClientCare.Database.Entities
{
    public partial class product_BenefitBeneficiaryType : ILazyLoadSafeEntity
    {
        public int BenefitId { get; set; } // BenefitId (Primary key)
        public BeneficiaryTypeEnum BeneficiaryType { get; set; } // BeneficiaryTypeId (Primary key)

        // Foreign keys

        /// <summary>
        /// Parent product_Benefit pointed by [BenefitBeneficiaryType].([BenefitId]) (FK_BenefitBeneficiaryType_Benefit)
        /// </summary>
        public virtual product_Benefit Benefit { get; set; } // FK_BenefitBeneficiaryType_Benefit

        public product_BenefitBeneficiaryType()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
