namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class InsuredLifeErrorAudit
    {
        public int Id { get; set; }
        public string MemberNumber { get; set; }
        public string PolicyNumber { get; set; }
        public string IdNumber { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string FileIdentifier { get; set; }
        public string ErrorCategory { get; set; }
        public string ErrorMessage { get; set; }
    }
}
