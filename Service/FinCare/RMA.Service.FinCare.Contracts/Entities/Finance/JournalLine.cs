namespace RMA.Service.FinCare.Contracts.Entities.Finance
{
    public class JournalLine
    {
        public string Detail_DocumentNumber { get; set; }
        public string Detail_JournalName { get; set; }
        public string Detail_TransactionDate { get; set; }
        public string Detail_TransactionDescription { get; set; }
        public string Detail_AccountType { get; set; }
        public string Detail_Company { get; set; }
        public string Detail_MainAccount { get; set; }
        public string Detail_AmountCurDebit { get; set; }
        public string Detail_DimBenefitType { get; set; }
        public string Detail_DimBranch { get; set; }
        public string Detail_DimCompany { get; set; }
        public string Detail_DimCostCenter { get; set; }
        public string Detail_DimProducts { get; set; }
        public string Detail_DimUnderwritingYear { get; set; }
        public string Detail_OffsetTransactionDescription { get; set; }
        public string Detail_OffsetAccountType { get; set; }
        public string Detail_OffsetCompany { get; set; }
        public string Detail_OffsetMainAccount { get; set; }
        public string Detail_OffsetDimBenefitType { get; set; }
        public string Detail_OffsetDimBranch { get; set; }
        public string Detail_OffsetDimCompany { get; set; }
        public string Detail_OffsetDimCostCenter { get; set; }
        public string Detail_OffsetDimProducts { get; set; }
        public string Detail_OffsetDimUnderwritingYear { get; set; }
    }
}
