using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.FinCare.Contracts.Entities.Commissions
{
    public class CommissionStatementCommunicationModel
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string EmailAddress { get; set; }
        public int ItemId { get; set; }
        public string ItemType { get; set; }
        public List<MailAttachment> MailAttachments { get; set; }
    }
}
