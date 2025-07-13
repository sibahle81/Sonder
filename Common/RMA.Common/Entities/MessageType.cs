using System;

namespace RMA.Common.Entities
{
    public class MessageType : ServiceBusMessageBase
    {
        public int ServiceBusMessageId { get; set; }
        public string MessageTaskType { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        public string Environment { get; set; }
        public DateTime EnqueuedTime { get; set; }
        public string MessageBody { get; set; }
        public string CorrelationID { get; set; }
        public DateTime MessageProcessedTime { get; set; }
        public DateTime? MessageProcessingCompletionTime { get; set; }
        public string MessageProcessingStatusText { get; set; }
        public string MessageTypeTaskHandler { get; set; }
        public string MessageUniqueId { get; set; }
    }
}
