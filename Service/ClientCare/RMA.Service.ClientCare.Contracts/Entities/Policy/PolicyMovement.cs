using RMA.Service.ClientCare.Contracts.Entities.Broker;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyMovement
    {
        public int PolicyMovementId { get; set; } // PolicyMovementId (Primary key)
        public string MovementRefNo { get; set; } // MovementRefNo (length: 50)
        public Brokerage DestinationBrokerage { get; set; } // FK_PolicyMovements_Brokerage1
        public Brokerage SourceBrokerage { get; set; } // FK_PolicyMovements_Brokerage
        public Representative DestinationRep { get; set; } // FK_PolicyMovements_Representative1
        public Representative SourceRep { get; set; } // FK_PolicyMovements_Representative
        public int SourceRepId { get; set; } // SourceRepId
        public int SourceBrokerageId { get; set; } // SourceBrokerageId
        public int DestinationRepId { get; set; } // DestinationRepId
        public int DestinationBrokerageId { get; set; } // DestinationBrokerageId
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public bool IsDeleted { get; set; } // IsDeleted

        public List<RolePlayerPolicy> Policies { get; set; }
        public System.DateTime EffectiveDate { get; set; }
    }
}
