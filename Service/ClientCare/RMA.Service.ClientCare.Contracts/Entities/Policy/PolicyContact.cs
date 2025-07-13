using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyContact
    {
        public int PolicyContactId { get; set; }
        public int PolicyId { get; set; }
        public ContactTypeEnum ContactType { get; set; }
        public string ContactName { get; set; }
        public string EmailAddress { get; set; }
        public string TelephoneNumber { get; set; }
        public string MobileNumber { get; set; }
        public string AlternativeNumber { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; } 
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}
