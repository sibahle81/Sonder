using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimNotificationRequest
    {
        public int PersonEventId { get; set; }
        public string Message { get; set; }
        public string DefaultRoleName { get; set; }
    }
}
