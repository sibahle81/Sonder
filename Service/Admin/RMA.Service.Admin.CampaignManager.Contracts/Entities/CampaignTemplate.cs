using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class CampaignTemplate : AuditDetails
    {
        public string Name { get; set; }
        public string Template { get; set; }
        public TemplateTypeEnum? TemplateType { get; set; }

        public DateTime? DateViewed { get; set; }
        public CampaignTypeEnum CampaignTemplateType { get; set; }

        //Front End Compatibility
        public int? TemplateTypeId
        {
            get => (int?)TemplateType;
            set => TemplateType = (TemplateTypeEnum?)value;
        }
    }
}
