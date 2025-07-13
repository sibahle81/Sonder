using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class CreditNoteSendRequest
    {
        public List<int> TransactionIds { get; set; }
        public int RoleplayerId { get; set; }
        public string CreditNoteNumber { get; set; }
        public string ToAddress { get; set; }
    }
}
