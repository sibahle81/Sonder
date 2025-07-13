using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.Admin.RulesManager.Contracts.Entities
{
    public class Rule : AuditDetails
    {
        public RuleTypeEnum RuleType { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public string ExecutionFilter { get; set; }
        public bool IsConfigurable { get; set; }
        public string ConfigurationMetaData { get; set; }
        public DateTime DateViewed { get; set; }

        //Front End Compatibility
        public int RuleTypeId
        {
            get => (int)RuleType;
            set => RuleType = (RuleTypeEnum)value;
        }
    }
}