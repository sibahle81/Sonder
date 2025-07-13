namespace RMA.Service.Billing.Contracts.Entities
{
    public class DebtorCompanyAndBranchModel
    {
        public int RoleplayerId { get; set; }
        public string FinPayeNumber { get; set; }
        public string DisplayName { get; set; }
        public int? CompanyNumber { get; set; }
        public int? BranchNumber { get; set; }
        public int? IndustryClassId { get; set; }
    }
}
