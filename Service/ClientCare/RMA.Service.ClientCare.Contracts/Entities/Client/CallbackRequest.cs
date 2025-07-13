using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class CallbackRequest : AuditDetails
    {
        public string Username { get; set; }
        public string ContactNumber { get; set; }
        public LanguageEnum Language { get; set; }
        public string Comment { get; set; }
        //ENUM => ID Conversions
        public int LanguageId
        {
            get => (int)Language;
            set => Language = (LanguageEnum)value;
        }
    }
}