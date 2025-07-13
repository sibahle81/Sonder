namespace RMA.Service.ScanCare.Contracts.Entities.AutoProcessing
{
    /// <summary>
    /// Represents one logical document extracted from
    /// a larger source (PDF, TIFF, ZIP, etc.).
    /// </summary>
    public class DocumentPart
    {
        /// <summary>The file-name to use when persisting to blob storage.</summary>
        public string FileName { get; set; }

        /// <summary>Raw bytes of this individual document.</summary>
        public byte[] Data { get; set; }

        /// <summary>1-based page number where this part starts in the source file.</summary>
        public int PageStart { get; set; }

        /// <summary>1-based page number where this part ends in the source file.</summary>
        public int PageEnd { get; set; }
    }
}
