
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class TransactionSearchRequest
    {
        public int? RolePlayerId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public TransactionTypeEnum? TransactionType { get; set; }
        public PagedRequest PagedRequest { get; set; }
    }
}