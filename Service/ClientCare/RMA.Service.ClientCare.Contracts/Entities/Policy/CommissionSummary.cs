using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;

using ClientBankAccount = RMA.Service.ClientCare.Contracts.Entities.Client.ClientBankAccount;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class CommissionSummary : AuditDetails
    {
        public int CommissionHeaderId { get; set; }

        public int BrokerageId { get; set; }

        public string BrokerageName { get; set; }

        public int BankAccountId { get; set; }
        public virtual ClientBankAccount BankAccount { get; set; }

        public Bank Bank { get; set; }

        public int NumberOfPolicies { get; set; }

        public decimal Commission { get; set; }
        public string Period { get; set; }
        public virtual CommissionHeader CommissionHeader { get; set; }

        public virtual IList<CommissionDetail> CommissionDetails { get; set; }
        public int? PaymentId { get; set; }
        public int? StatusId { get; set; }
        public string Status { get; set; }

    }
}
