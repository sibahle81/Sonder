using System;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class PasswordResetAuthorization
    {
        public string Email { get; set; }
        public string Token { get; set; }
        public DateTime CreationDate { get; set; }
        public bool HasExpired { get; set; }
    }
}