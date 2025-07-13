using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class SundryServiceProvider
    {
        public int RolePlayerId { get; set; } // RolePlayerId (Primary key)
        public string Name { get; set; }
        public string Description { get; set; }
        public string CompanyNumber { get; set; }
        public System.DateTime? DateStarted { get; set; }
        public System.DateTime? DateClosed { get; set; }
        public SundryServiceProviderTypeEnum SundryServiceProviderType { get; set; }
        public bool IsVat { get; set; }
        public string VatRegNumber { get; set; }
        public bool? IsAuthorised { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public string ModifiedBy { get; set; }
    }
}