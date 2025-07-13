namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class AuthenticationResult
    {
        public string Token { get; set; }
        public bool IsSuccess { get; set; }
    }
}