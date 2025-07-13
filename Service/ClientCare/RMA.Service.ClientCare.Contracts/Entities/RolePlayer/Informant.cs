namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class Informant
    {
        public int RolePlayerId { get; set; }
        public string IdNumber { get; set; }
        public string PassportNumber { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public System.DateTime DateOfBirth { get; set; }
        public int BeneficiaryTypeId { get; set; }
        public string ContactNumber { get; set; }
    }
}