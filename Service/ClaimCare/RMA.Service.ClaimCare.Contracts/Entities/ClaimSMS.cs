using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimSMS
    {
        public int PersonEventId { get; set; }
        public int ClaimId { get; set; }
        public TemplateTypeEnum TemplateType { get; set; }
        public string MobileNumber { get; set; }
        public Dictionary<string, string> Tokens { get; set; }
    }
}