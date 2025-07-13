using System;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class SearchPreAuthCriteria
    {
        public string PreAuthNumber { get; set; }
        public int PreAuthTypeId { get; set; }
        public int PreAuthStatusId { get; set; }
        public int HealthCareProviderId { get; set; }
        public DateTime? DateAuthorisedFrom { get; set; }
        public DateTime? DateAuthorisedTo { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
        public int? ClaimId { get; set; }
    }
}
