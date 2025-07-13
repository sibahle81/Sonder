using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Contracts.Entities.CFP
{
    public class ContactDetails
    {
        public string Mobile { get; set; }
        public string Telephone { get; set; } = "";
        public string Email { get; set; } = "";
        public string PreferredMethodOfCommunication { get; set; }

    }
}
