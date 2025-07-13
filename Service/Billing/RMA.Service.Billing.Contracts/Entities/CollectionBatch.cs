using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class CollectionBatch
    {
        public int CollectionBatchId { get; set; } // CollectionBatchId (Primary key)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string Reference { get; set; } // Reference (length: 250)
        public List<Collection> Collections { get; set; }
    }
}
