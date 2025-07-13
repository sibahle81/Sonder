using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimSearchResult
    {
        public int ClaimId { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public int PersonEventId { get; set; }
        public string PersonEventReferenceNumber { get; set; }
        public int EventId { get; set; }
        public string EventReferenceNumber { get; set; }
        public DateTime EventDate { get; set; }
        public int? MemberSiteId { get; set; }
        public string MemberSiteDisplayName { get; set; }
        public int? ClaimantId { get; set; }
        public string ClaimantDisplayName { get; set; }

    }
}