using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Integrations.Contracts.Entities.Qlink
{
    public class QlinkTransactionModel
    {

        public int QlinkTransactionId { get; set; }

        public QLinkTransactionTypeEnum QLinkTransactionType { get; set; }
        public string ItemType { get; set; }

        public int ItemId { get; set; }

        public string Request { get; set; }

        public string Response { get; set; }

        public int StatusCode { get; set; }

        public bool IsDeleted { get; set; }

        public System.DateTime CreatedDate { get; set; }

        public string CreatedBy { get; set; }

        public System.DateTime ModifiedDate { get; set; }

        public string ModifiedBy { get; set; }

        public bool IsFalsePositive { get; set; }

    }
}
