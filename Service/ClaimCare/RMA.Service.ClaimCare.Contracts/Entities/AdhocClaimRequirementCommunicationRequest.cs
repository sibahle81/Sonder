using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class AdhocClaimRequirementCommunicationRequest
    {
        public string Subject { get; set; }
        public List<RolePlayerContact> RolePlayerContacts { get; set; }
        public string RequirementsHtml { get; set; }
        public string RequirementsCsv { get; set; }
        public int PersonEventId { get; set; }
        public string DisplayName { get; set; }
    }
}