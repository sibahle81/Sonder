using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class BankAccountServiceType
    {
        public int Id { get; set; }
        public int BankAccountId { get; set; }
        public int ServiceType { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }

        public virtual ClientBankAccount BankAccount { get; set; }
    }
}