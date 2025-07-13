using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyholderBirthdaySMSModel
    {
        public int RolePlayerId { get; set; }
        public string DisplayName { get; set; }
        public string CellNumber { get; set; }
        public string EmailAddress { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Message { get; set; }
    }
}