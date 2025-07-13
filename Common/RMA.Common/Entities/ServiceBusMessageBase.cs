using System;

namespace RMA.Common.Entities
{
    public class ServiceBusMessageBase
    {
        public ServiceBusMessageBase()
        {
            MessageId = Guid.NewGuid().ToString();
        }

        public string MessageId { get; set; }
        public string ImpersonateUser { get; set; }
    }
}
