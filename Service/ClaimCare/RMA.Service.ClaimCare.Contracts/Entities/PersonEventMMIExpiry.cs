using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PersonEventMMIExpiry
    {
        public int PersonEventId { get; set; }
        public int OutstandingMedicalReportFormId { get; set; }
        public int RoleplayerId { get; set; }
        public string EmailAddress { get; set; }
        public int LagReceivedToExpiry { get; set; }
        public DateTime ReportDate { get; set; }
        public DateTime MMIExpiryDate { get; set; }
        public int Mmi { get; set; }
        public string InjuryDescription { get; set; }
        public DateTime DateOfIncident { get; set; }
        public string CompanyNumber { get; set; }
        public string EmployeeName { get; set; }
        public string ClaimNumber { get; set; }
        public string HcpName { get; set; }
    }
}
