namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class BankBranch
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public int BankId { get; set; }
        public Bank Bank { get; set; }
    }
}