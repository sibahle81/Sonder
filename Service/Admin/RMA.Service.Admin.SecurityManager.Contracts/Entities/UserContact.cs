using RMA.Common.Entities;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class UserContact : AuditDetails
    {
        public int UserContactId { get; set; }
        public string CellPhoneNo { get; set; }
        public string TelephoneNo { get; set; }
        public string Email { get; set; }
        public int UserId { get; set; }
    }
}