
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class BankAccount
    {
        public int Id { get; set; }
        public string DepartmentName { get; set; }
        public int BankId { get; set; }
        public string BankName { get; set; }
        public string BranchName { get; set; }
        public string BranchCode { get; set; }
        public int BankAccountTypeId { get; set; }
        public string AccountNumber { get; set; }
        public string AccountName { get; set; }
        public int BranchId { get; set; }
        public ClientTypeEnum? ClientType { get; set; }
        public string TransactionType { get; set; }

        //Front End Compatibility
        public int? ClientTypeId
        {
            get => (int?)ClientType;
            set => ClientType = (ClientTypeEnum?)value;
        }
    }
}