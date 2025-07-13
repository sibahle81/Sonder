using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class CoverTypeModel
    {
        public List<int> CoverTypeIds { get; set; }
        public int BrokerageId { get; set; }
        public int RolePlayerId { get; set; }
    }
}
