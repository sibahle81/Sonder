using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class Email : AuditDetails
    {
        public Email()
        {
            Tokens = new Dictionary<string, string>();
        }

        public int CampaignId { get; set; }
        public int TemplateId { get; set; }
        public Dictionary<string, string> Tokens { get; set; }
    }
}