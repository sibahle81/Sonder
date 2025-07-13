using RMA.Common.Enums;

using System.Collections.Generic;

namespace RMA.Common.Entities
{
    public class TemplateSmsRequest
    {
        public int TemplateId { get; set; }
        public string Campaign { get; set; }
        public RMADepartmentEnum Department { get; set; }
        public Dictionary<string, string> Tokens { get; set; }
        public List<string> SmsNumbers { get; set; }
        public string Name { get; set; }
        public string ItemType { get; set; }
        public int ItemId { get; set; }
    }
}
