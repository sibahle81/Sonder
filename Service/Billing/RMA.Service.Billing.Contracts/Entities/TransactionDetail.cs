using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Billing.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class TransactionDetail
    {
        public int? TransactionId { get; set; }

        public TransactionTypeEnum? TransactionType {  get; set; }
        public int? RolePlayerId { get; set; }
        public int? TransactionTypeLinkId { get; set; }
        public string FinPayeNumber { get; set; }
        public int? PolicyId { get; set; }
        public int? BrokerageId { get; set; }
        public string FspNumber { get; set; }
        public int? ProductOptionId { get; set; }
        public string ProductName { get; set; }
        public int? ProductId { get; set; }
        public int? IndustryId { get; set; }
        public int? IndustryClassId { get; set; }
        public int? RolePlayerTypeId { get; set; }
        public bool? IsFuneralProduct { get; set; }
        public string StrDate { get; set; }
        public int? ProductClass { get; set; }
        public int? BankStatementEntryId { get; set; }
        public string BankAccountNumber { get; set; }
        public string UnpaddedBankAccountNumber { get; set; }
        public string BankDepartmentName { get; set; }
        public string BrokerName { get; set; }
        public int? InvoiceId { get; set; }
        public int? AbilityCollectionChartPrefixId { get; set; }
        public string AbilityCollectionChartPrefix { get; set; }
    }

}
