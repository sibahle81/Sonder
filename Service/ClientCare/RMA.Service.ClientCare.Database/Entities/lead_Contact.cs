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
    public partial class lead_Contact : IAuditableEntity, ISoftDeleteEntity
    {
        public int ContactId { get; set; } // ContactId (Primary key)
        public int LeadId { get; set; } // LeadId
        public string Name { get; set; } // Name (length: 150)
        public CommunicationTypeEnum CommunicationType { get; set; } // CommunicationTypeId
        public string CommunicationTypeValue { get; set; } // CommunicationTypeValue (length: 50)
        public bool IsPreferred { get; set; } // IsPreferred
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        // Foreign keys

        /// <summary>
        /// Parent lead_Lead pointed by [Contact].([LeadId]) (FK_Lead_Contact_LeadId)
        /// </summary>
        public virtual lead_Lead Lead { get; set; } // FK_Lead_Contact_LeadId

        public lead_Contact()
        {
            IsPreferred = false;
            IsDeleted = false;
            CreatedDate = System.DateTime.Now;
            ModifiedDate = System.DateTime.Now;
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
