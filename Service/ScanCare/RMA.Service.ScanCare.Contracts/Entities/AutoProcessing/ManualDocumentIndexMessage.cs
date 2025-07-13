using RMA.Common.Entities;
using System;
using System.Collections.Generic;

namespace RMA.Service.ScanCare.Contracts.Entities.AutoProcessing
{
    /// <summary>
    /// Sent when the automatic pipeline cannot fully classify / identify
    /// a batch and the documents must be routed to the manual-indexing
    /// workflow.
    /// </summary>
    public sealed class ManualDocumentIndexMessage : ServiceBusMessageBase
    {
        /// <summary>E-mail batch identifier (same value across the batch).</summary>
        public Guid BatchId { get; set; }

        /// <summary>Source system that generated the e-mail (e.g. “ClaimManager”).</summary>
        public string SystemName { get; set; }

        public string EmailSubject { get; set; }
        public string EmailBody { get; set; }

        /// <summary>
        /// All attachment references (blob URIs + original names) that belong
        /// to the batch.
        /// </summary>
        public List<DocumentReferenceItem> Docs { get; set; }

        /// <summary>
        /// The identifier(s) that *were* detected (may be empty).  
        /// UI can pre-populate these for the operator.
        /// </summary>
        public Dictionary<string, string> Identifiers { get; set; }
    }
}
