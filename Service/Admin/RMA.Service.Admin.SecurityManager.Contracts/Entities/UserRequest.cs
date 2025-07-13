namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class UserRequest
    {
        public User user { get; set; }
        public string OldPassword { get; set; }
    }
}