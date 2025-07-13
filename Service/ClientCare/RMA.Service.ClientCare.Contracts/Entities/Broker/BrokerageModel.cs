using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Broker
{
    public class BrokerageModel
    {
        public string FspNumber { get; set; } // FSPNumber (length: 50)
        public string Name { get; set; } // Name (length: 255)
        public string TradeName { get; set; } // TradeName (length: 255)
        public string RegNo { get; set; } // RegNo (length: 255)
        public string Status { get; set; } // Status (length: 255)
        public bool IsActive { get; set; }
        public bool IsAuthorised { get; set; }
        public string Code { get; set; } // Code (length: 50)
        public List<RepresentativeModel> Representatives { get; set; }
    }
}