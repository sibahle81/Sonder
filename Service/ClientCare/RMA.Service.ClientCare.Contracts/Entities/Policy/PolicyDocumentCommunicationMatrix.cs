namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyDocumentCommunicationMatrix
    {
        public int PolicyDocumentCommunicationMatrixId { get; set; }
        public int PolicyId { get; set; }
        public bool SendPolicyDocsToBroker { get; set; }
        public bool SendPolicyDocsToAdmin { get; set; }
        public bool SendPolicyDocsToMember { get; set; }
        public bool SendPolicyDocsToScheme { get; set; }
        public bool SendPaymentScheduleToBroker { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}
