using System;
namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PremiumListing
    {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string IDNumber { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string PassportNumber { get; set; }
        public string IndustryNumber { get; set; }
        public string Company { get; set; }
        public string Country { get; set; }
        public DateTime Date { get; set; }
        public decimal TotalAmount { get; set; }
        public string ExecutionId { get; set; }
        public string FileIdentifier { get; set; }
        public string FileName { get; set; }
    }
}
