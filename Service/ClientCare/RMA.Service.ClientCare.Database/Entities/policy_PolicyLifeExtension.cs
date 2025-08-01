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
    public partial class policy_PolicyLifeExtension : IAuditableEntity, ISoftDeleteEntity
    {
        public int PolicyLifeExtensionId { get; set; } // PolicyLifeExtensionId (Primary key)
        public int PolicyId { get; set; } // PolicyId
        public AnnualIncreaseTypeEnum AnnualIncreaseType { get; set; } // AnnualIncreaseTypeId
        public int? AnnualIncreaseMonth { get; set; } // AnnualIncreaseMonth
        public bool AffordabilityCheckPassed { get; set; } // AffordabilityCheckPassed
        public string AffordabilityCheckFailReason { get; set; } // AffordabilityCheckFailReason (length: 250)
        public bool IsEuropAssistExtended { get; set; } // IsEuropAssistExtended
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        // Foreign keys

        /// <summary>
        /// Parent policy_Policy pointed by [PolicyLifeExtension].([PolicyId]) (FK_PolicyLifeExtension_PolicyId)
        /// </summary>
        public virtual policy_Policy Policy { get; set; } // FK_PolicyLifeExtension_PolicyId

        public policy_PolicyLifeExtension()
        {
            AffordabilityCheckPassed = true;
            IsEuropAssistExtended = false;
            IsDeleted = false;
            CreatedDate = System.DateTime.Now;
            ModifiedDate = System.DateTime.Now;
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
