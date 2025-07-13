using RMA.Service.ClientCare.Contracts.Entities.Broker;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyBroker
    {
        public int PolicyId { get; set; } // PolicyId
        public int RepId { get; set; } // RepId
        public int BrokerageId { get; set; } // BrokerageId
        public int? JuristicRepId { get; set; } // JuristicRepId
        public System.DateTime EffectiveDate { get; set; } // EffectiveDate
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public int PolicyBrokerId { get; set; } // PolicyBrokerId (Primary key)
        public bool IsDeleted { get; set; } // IsDeleted
        public Brokerage Brokerage { get; set; } // FK_PolicyBroker_Brokerage

        /// <summary>
        /// Parent broker_Representative pointed by [PolicyBroker].([JuristicRepId]) (FK_PolicyBroker_Representative1)
        /// </summary>
        public Representative JuristicRep { get; set; } // FK_PolicyBroker_Representative1

        /// <summary>
        /// Parent broker_Representative pointed by [PolicyBroker].([RepId]) (FK_PolicyBroker_Representative)
        /// </summary>
        public Representative Rep { get; set; } // FK_PolicyBroker_Representative

    }
}