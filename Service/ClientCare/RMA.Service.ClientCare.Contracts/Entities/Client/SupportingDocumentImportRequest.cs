using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class SupportingDocumentImportRequest : AuditDetails
    {
        public List<SupportingDocument> Documents { get; set; }
    }
}