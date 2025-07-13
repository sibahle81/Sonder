namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class SchemeDeathRegistrationResult
    {
        public string RegistrationReferenceNumber { get; set; }
        public string PolicyNumber { get; set; }
        public bool IsOperationSuccessFull { get; set; }
        public string ResponseMessage { get; set; }
    }
}
