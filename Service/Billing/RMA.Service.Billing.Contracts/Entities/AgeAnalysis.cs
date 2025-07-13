using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class AgeAnalysis
    {
        public string ControlNumber { get; set; }
        public string ControlName { get; set; }
        public int AccountId { get; set; }
        public string AccountNumber { get; set; }
        public string ClientName { get; set; }
        public string ProductName { get; set; }
        public string Industry { get; set; }
        public double Balance { get; set; }
        public double Interest { get; set; }
        public double Current { get; set; }
        public double Balance30Days { get; set; }
        public double Balance60Days { get; set; }
        public double Balance90Days { get; set; }
        public double Balance120Days { get; set; }
        public double Balance120PlusDays { get; set; }
        public string CollectionAgent { get; set; }
        public string DebtorsClerk { get; set; }
        public int? NoteId1 { get; set; }
        public string Note1 { get; set; }
        public string User1 { get; set; }
        public DateTime? Date1 { get; set; }
        public int? NoteId2 { get; set; }
        public string Note2 { get; set; }
        public string User2 { get; set; }
        public DateTime? Date2 { get; set; }
        public int? NoteId3 { get; set; }
        public string Note3 { get; set; }
        public string User3 { get; set; }
        public DateTime? Date3 { get; set; }
        public bool Selected { get; set; }
        public bool InterestIndicator { get; set; }
        public string ProductCoverType { get; set; }
    }
}
