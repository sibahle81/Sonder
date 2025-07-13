using System;

namespace RMA.Service.Admin.BusinessProcessManager.Contracts.Entities
{
    public class Approval
    {
        public int Id { get; set; }
        public int ItemId { get; set; }
        public int TablePK { get; set; }
        public string TableName { get; set; }
        public string ItemType { get; set; }
        public int ApprovalTypeId { get; set; }
        public bool Approved { get; set; }
        public string Comment { get; set; }
        public DateTime ApprovalDate { get; set; }
        public string ApprovalBy { get; set; }
    }
}