using RMA.Common.Entities;

using System;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class SmsStatusRequestReferenceMessage : ServiceBusMessageBase
    {
        public DateTime RegistrationDate { get; set; }
        public DateTime StatusReportDate { get; set; }
        public string SmsNumber { get; set; }
        public string SmsReference { get; set; }
        public string ErrorDescription { get; set; }
        public int Status { get; set; }
        public string StatusDescription { get; set; }
        public string Operator { get; set; }
        public string Campaign { get; set; }
        public string Department { get; set; }
        public string UserName { get; set; }

    }
}

