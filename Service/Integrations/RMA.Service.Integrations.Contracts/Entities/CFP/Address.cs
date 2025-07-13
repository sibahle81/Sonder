using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Contracts.Entities.CFP
{
    public class Address
    {
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; } = "";
        public string Suburb { get; set; } = "";
        public string City { get; set; }
        public string Province { get; set; }
        public string Country { get; set; }
        public string PostalCode { get; set; }
    }
}
