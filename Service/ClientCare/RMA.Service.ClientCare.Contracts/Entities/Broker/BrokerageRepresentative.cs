using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Broker
{
    public class BrokerageRepresentative
    {
        public int Id { get; set; } // Id (Primary key)
        public int BrokerageId { get; set; } // BrokerageId
        public int RepresentativeId { get; set; } // RepresentativeId
        public int? JuristicRepId { get; set; } // JuristicRepId
        public RepRoleEnum RepRole { get; set; } // RepRoleId
        public DateTime? StartDate { get; set; } // StartDate
        public DateTime? EndDate { get; set; } // EndDate
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
