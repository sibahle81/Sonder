using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Common.Entities
{
    public class SendCommunicationResult
    {
        public int PolicyId { get; set; }
        public bool IsSuccess { get; set; }
        public string Recipients { get; set; }
    }
}
