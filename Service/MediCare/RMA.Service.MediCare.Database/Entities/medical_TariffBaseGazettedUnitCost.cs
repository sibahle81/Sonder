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

namespace RMA.Service.MediCare.Database.Entities
{
    public partial class medical_TariffBaseGazettedUnitCost : IAuditableEntity, ISoftDeleteEntity
    {
        public int TariffBaseGazettedUnitCostId { get; set; } // TariffBaseGazettedUnitCostId (Primary key)
        public int TariffBaseUnitCostId { get; set; } // TariffBaseUnitCostId
        public string Description { get; set; } // Description (length: 100)
        public decimal GazettedPercentageApplied { get; set; } // GazettedPercentageApplied
        public System.DateTime EffectiveFrom { get; set; } // EffectiveFrom
        public System.DateTime? EffectiveTo { get; set; } // EffectiveTo
        public decimal UnitPrice { get; set; } // UnitPrice
        public bool IsDeleted { get; set; } // IsDeleted
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate

        // Foreign keys

        /// <summary>
        /// Parent medical_TariffBaseUnitCost pointed by [TariffBaseGazettedUnitCost].([TariffBaseUnitCostId]) (FK_TariffBaseGazettedUnitCost_TariffBaseUnitCost)
        /// </summary>
        public virtual medical_TariffBaseUnitCost TariffBaseUnitCost { get; set; } // FK_TariffBaseGazettedUnitCost_TariffBaseUnitCost

        public medical_TariffBaseGazettedUnitCost()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
