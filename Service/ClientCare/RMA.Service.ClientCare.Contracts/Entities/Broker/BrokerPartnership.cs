namespace RMA.Service.ClientCare.Contracts.Entities.Broker
{
    public class BrokerPartnership
    {
        public int BrokerageId { get; set; } // BrokerageId (Primary key)
        public int Branch { get; set; } // Brunch
        public int Company { get; set; } // Company
        public int CostCenter { get; set; } // CostCenter
        public string BrokerCode { get; set; } // CostCenter
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        // Foreign keys
        public Brokerage Brokerage { get; set; } // FK_BrokerPartnership_Brokerage
    }
}
