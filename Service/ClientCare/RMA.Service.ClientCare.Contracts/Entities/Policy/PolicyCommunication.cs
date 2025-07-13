using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyCommunication
    {
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public string DisplayName { get; set; }
        public string TellNumber { get; set; }
        public string CellNumber { get; set; }
        public string EmailAddress { get; set; }
        public int? PreferredCommunicationTypeId { get; set; }
        public string CCEmail { get; set; }
        public DateTime InvoiceDate { get; set; }
    }
}
