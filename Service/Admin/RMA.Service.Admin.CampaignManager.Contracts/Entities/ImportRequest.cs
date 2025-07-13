using System;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class ImportRequest
    {
        public int CampaignId { get; set; }
        public Uri FileUri { get; set; }
        public Guid FileToken { get; set; }
    }
}