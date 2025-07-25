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
    public partial class client_VopdResponse : ILazyLoadSafeEntity
    {
        public int VopdResponseId { get; set; } // VopdResponseId (Primary key)
        public int RolePlayerId { get; set; } // RolePlayerId
        public VopdStatusEnum VopdStatus { get; set; } // VopdStatusId
        public string Reason { get; set; } // Reason (length: 255)
        public bool? Identity { get; set; } // Identity
        public bool? MaritalStatus { get; set; } // MaritalStatus
        public bool? Death { get; set; } // Death
        public System.DateTime? DateVerified { get; set; } // DateVerified
        public string IdNumber { get; set; } // IdNumber (length: 13)
        public string Surname { get; set; } // Surname (length: 50)
        public string DeceasedStatus { get; set; } // DeceasedStatus (length: 50)
        public string DateOfDeath { get; set; } // DateOfDeath (length: 50)
        public string Firstname { get; set; } // Firstname (length: 50)
        public System.DateTime? SubmittedDate { get; set; } // SubmittedDate
        public System.DateTime? ResubmittedDate { get; set; } // ResubmittedDate
        public int? OverrideCount { get; set; } // OverrideCount

        public client_VopdResponse()
        {
            OverrideCount = 0;
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
