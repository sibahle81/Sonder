using RMA.Common.Entities;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyDocument : AuditDetails
    {
        public int PolicyId { get; set; }
        public string Name { get; set; }
        public Guid DocumentToken { get; set; }
        public int? RequiredDocumentId { get; set; }

    }
}