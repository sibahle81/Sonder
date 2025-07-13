using RMA.Common.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Common.Entities
{
    public class SendSmsRequest
    {
        public string Campaign { get; set; }
        public RMADepartmentEnum Department { get; set; }
        public BusinessAreaEnum BusinessArea { get; set; }
        public string Message { get; set; }
        public DateTime WhenToSend { get; set; }
        public string LastChangedBy { get; set; }
        public List<string> SmsNumbers { get; set; }
        public string ItemType { get; set; }
        public int ItemId { get; set; }
        public int BulkSmsRequestHeaderId { get; set; }
        public int BulkSmsRequestDetailId { get; set; }
        public string SmsNumber { get; set; }
        public int SendAttemptCount { get; set; }
        public int SmsBatch { get; set; }
    }
}