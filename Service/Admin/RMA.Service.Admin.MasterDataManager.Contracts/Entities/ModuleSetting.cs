using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class ModuleSetting : AuditDetails
    {
        public string Key { get; set; } // Key (length: 255)
        public string Value { get; set; } // Value
        public List<string> Keys { get; set; }
    }
}
