using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class Enquiry : AuditDetails
    {
        public int ClientId { get; set; }
        public string Username { get; set; }
        public string ContactNumber { get; set; }
        public LanguageEnum Language { get; set; }
        public string Text { get; set; }
    }
}