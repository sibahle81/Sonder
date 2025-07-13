using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class CoverTypeModel
    {
        public List<int> CoverTypeIds { get; set; }
        public int BrokerageId { get; set; }
        public int RolePlayerId { get; set; }
        public PaymentTypeEnum? PaymentType { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
    }
}
