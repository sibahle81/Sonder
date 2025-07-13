namespace RMA.Service.ClientCare.Contracts.Entities.Policy.Integrations.Request
{
    public class BeneficiaryBankingDetails
    {
        public string AccountHolderName { get; set; }
        public string AccountHolderSurname { get; set; }

        public string AccountNumber { get; set; }
        public string Bank { get; set; }
        public string BranchCode { get; set; }

        public int AccountType { get; set; }



    }
}
