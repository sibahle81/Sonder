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
    public partial class broker_RepresentativeFscaLicenseCategory : IAuditableEntity, ISoftDeleteEntity
    {
        public int Id { get; set; } // Id (Primary key)
        public int RepresentativeId { get; set; } // RepresentativeId
        public int FscaLicenseCategoryId { get; set; } // FscaLicenseCategoryId
        public int BrokerageId { get; set; } // BrokerageId
        public System.DateTime? AdviceDateActive { get; set; } // AdviceDateActive
        public System.DateTime? IntermediaryDateActive { get; set; } // IntermediaryDateActive
        public System.DateTime? SusDateActive { get; set; } // SusDateActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        // Foreign keys

        /// <summary>
        /// Parent broker_Brokerage pointed by [RepresentativeFscaLicenseCategory].([BrokerageId]) (FK_RepresentativeFscaLicenseCategory_Brokerage)
        /// </summary>
        public virtual broker_Brokerage Brokerage { get; set; } // FK_RepresentativeFscaLicenseCategory_Brokerage

        /// <summary>
        /// Parent broker_FscaLicenseCategory pointed by [RepresentativeFscaLicenseCategory].([FscaLicenseCategoryId]) (FK_AgentFscaLicenseCategory_FscaLicenseCategory)
        /// </summary>
        public virtual broker_FscaLicenseCategory FscaLicenseCategory { get; set; } // FK_AgentFscaLicenseCategory_FscaLicenseCategory

        /// <summary>
        /// Parent broker_Representative pointed by [RepresentativeFscaLicenseCategory].([RepresentativeId]) (FK_RepresentativeFscaLicenseCategory_Representative)
        /// </summary>
        public virtual broker_Representative Representative { get; set; } // FK_RepresentativeFscaLicenseCategory_Representative

        public broker_RepresentativeFscaLicenseCategory()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
