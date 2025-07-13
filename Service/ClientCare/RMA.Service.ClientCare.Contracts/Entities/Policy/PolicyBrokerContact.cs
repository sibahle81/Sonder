using RMA.Service.Billing.Database.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyBrokerContact
    {
        public int PolicyBrokerContactId { get; set; } 
        public int PolicyId { get; set; } 
        public string ContactName { get; set; } 
        public string ContactNumber { get; set; } 
        public string EmailAddress { get; set; } 
        public bool IsDeleted { get; set; } 
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; } 
        public string ModifiedBy { get; set; } 
        public System.DateTime ModifiedDate { get; set; }    
    }
}
