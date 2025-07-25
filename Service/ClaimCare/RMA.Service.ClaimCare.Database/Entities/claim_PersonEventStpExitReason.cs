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
    public partial class claim_PersonEventStpExitReason : IAuditableEntity, ISoftDeleteEntity
    {
        public int ClaimStpExitReasonId { get; set; } // ClaimSTPExitReasonID (Primary key)
        public int PersonEventId { get; set; } // PersonEventID
        public int StpExitReasonId { get; set; } // STPExitReasonID
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        // Foreign keys

        /// <summary>
        /// Parent claim_PersonEvent pointed by [PersonEventSTPExitReasons].([PersonEventId]) (FK_PersonEventSTPExitReasons_PersonEvent)
        /// </summary>
        public virtual claim_PersonEvent PersonEvent { get; set; } // FK_PersonEventSTPExitReasons_PersonEvent

        /// <summary>
        /// Parent claim_StpExitReason pointed by [PersonEventSTPExitReasons].([StpExitReasonId]) (FK_PersonEventSTPExitReasons_STPExitReason)
        /// </summary>
        public virtual claim_StpExitReason StpExitReason { get; set; } // FK_PersonEventSTPExitReasons_STPExitReason

        public claim_PersonEventStpExitReason()
        {
            IsDeleted = false;
            CreatedDate = System.DateTime.Now;
            ModifiedDate = System.DateTime.Now;
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
