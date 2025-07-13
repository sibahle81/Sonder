using RMA.Common.Entities.DatabaseQuery;

using System;
using System.Runtime.Serialization;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    [DataContract]
    public class SearchPreAuthPagedRequest : PagedRequest
    {
        [DataMember]
        public string PreAuthNumber { get; set; }
        [DataMember]
        public int PreAuthTypeId { get; set; }
        [DataMember]
        public int PreAuthStatusId { get; set; }
        [DataMember]
        public int HealthCareProviderId { get; set; }
        [DataMember]
        public DateTime? DateAuthorisedFrom { get; set; }
        [DataMember]
        public DateTime? DateAuthorisedTo { get; set; }
        [DataMember]
        public int? ClaimId { get; set; }

        public SearchPreAuthPagedRequest(int page, int pageSize, string preAuthNumber, int preAuthTypeId, int preAuthStatusId,
            int healthCareProviderId, DateTime? dateAuthorisedFrom, DateTime? dateAuthorisedTo, int? claimId)
        {
            SearchCriteria = string.Empty;
            Page = page;
            PageSize = pageSize;
            IsAscending = true;
            PreAuthNumber = preAuthNumber;
            PreAuthTypeId = preAuthTypeId;
            PreAuthStatusId = preAuthStatusId;
            HealthCareProviderId = healthCareProviderId;
            DateAuthorisedFrom = dateAuthorisedFrom;
            DateAuthorisedTo = dateAuthorisedTo;
            ClaimId = claimId;
        }
    }
}
