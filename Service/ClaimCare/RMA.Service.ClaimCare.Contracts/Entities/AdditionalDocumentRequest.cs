using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class AdditionalDocumentRequest
    {
        public List<RolePlayerContact> RolePlayerContacts { get; set; }
        public string Note { get; set; }
        public int PersonEventId { get; set; }
        public int ThirdDocumentsFollowUpDayCount { get; set; }
        public string Reason { get; set; }
    }
}