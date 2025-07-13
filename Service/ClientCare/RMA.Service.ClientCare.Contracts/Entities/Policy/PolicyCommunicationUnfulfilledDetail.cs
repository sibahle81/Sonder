using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
   public class PolicyCommunicationUnfulfilledDetail
    {
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }

        public string PolicyScheduleCommsSent { get; set; }


    }
}
