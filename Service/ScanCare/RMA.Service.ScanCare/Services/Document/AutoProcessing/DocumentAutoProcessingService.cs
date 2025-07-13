using System;
using System.Collections.Generic;
using System.Fabric;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using RMA.Common.Extensions;
using System.Web;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Integrations.Contracts.Interfaces.AzureBlob;
using RMA.Service.ScanCare.Contracts.Entities.AutoProcessing;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;
using RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing;
using iTextSharp.text.pdf.parser;
using System.Drawing.Imaging;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using RMA.Common.Enums;
using Tesseract;
using static System.IO.Path;
using ImageFormat = System.Drawing.Imaging.ImageFormat;
using DocumentFormat.OpenXml.Packaging;
using iTextSharp.text.pdf;
using RMA.Common.Service.Diagnostics;
using RMA.Common.Service.ServiceBus.Producers;

namespace RMA.Service.ScanCare.Services.Document.AutoProcessing
{
    /// <summary>
    /// Service for classifying and indexing documents.
    /// Processes indexMessages by retrieving the stored document content from Azure Blob Storage,
    /// classifying each document using a hybrid rule-based/OpenAI approach,
    /// and extracting identifiers (e.g., claim or policy numbers) based on the system name.
    /// </summary>
    public class DocumentAutoProcessingService : RemotingStatelessService, IDocumentAutoProcessingService
    {
        private readonly IBinaryStorageService _binaryStorageService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IDocumentClassifierService _documentClassifierService;

        public DocumentAutoProcessingService(StatelessServiceContext context, IBinaryStorageService binaryStorageService,
            IDocumentIndexService documentIndexService, IDocumentClassifierService documentClassifierService)
            : base(context)
        {
            _binaryStorageService = binaryStorageService;
            _documentIndexService = documentIndexService;
            _documentClassifierService = documentClassifierService;
        }

        /// <summary>ExtractText  
        /// PDF - iTextSharp  
        /// Images - Tesseract OCR  
        /// DOCX - OpenXml  
        /// TXT - raw UTF-8 (fallback)  
        /// </summary>
        // keep the existing using-statements; only this method changes
        private async Task<string> ExtractText(byte[] bytes, string fileName)
        {
            // PDF
            if (fileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    using (var reader = new PdfReader(bytes))
                    {
                        var sb = new StringBuilder();
                        for (int p = 1; p <= reader.NumberOfPages; p++)
                        {
                            sb.AppendLine(
                                PdfTextExtractor.GetTextFromPage(reader, p,
                                    new SimpleTextExtractionStrategy()));
                        }
                        return sb.ToString();
                    }
                }
                catch { /* fall through */ }
            }

            // DOCX
            if (fileName.EndsWith(".docx", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    using (var ms = new MemoryStream(bytes))
                    using (var doc = WordprocessingDocument.Open(ms, false))
                    {
                        var body = doc.MainDocumentPart?.Document?.Body;
                        return body != null ? body.InnerText : string.Empty;
                    }
                }
                catch { /* fall through */ }
            }

            // TXT
            if (fileName.EndsWith(".txt", StringComparison.OrdinalIgnoreCase))
                return Encoding.UTF8.GetString(bytes);   // adjust if other encodings are required

            // Images  (OCR via Tesseract)
            var ext = GetExtension(fileName).ToLowerInvariant();
            bool IsBitmapExt(string e) =>
                e == ".jpg" || e == ".jpeg" || e == ".png" ||
                e == ".bmp" || e == ".tif" || e == ".tiff";

            if (IsBitmapExt(ext))
            {
                try
                {
                    using (var engine = new TesseractEngine(@"./tessdata", "eng", EngineMode.Default))
                    {
                        engine.DefaultPageSegMode = Tesseract.PageSegMode.Auto;

                        using (var ms = new MemoryStream(bytes))
                        using (var img = Image.FromStream(ms))
                        {
                            var sb = new StringBuilder();

                            // single-page images
                            if (!ImageFormat.Tiff.Equals(img.RawFormat))
                            {
                                using (var bmp = new Bitmap(img))
                                using (var pix = Tesseract.PixConverter.ToPix(bmp))
                                using (var page = engine.Process(pix))
                                {
                                    sb.AppendLine(page.GetText());
                                }
                            }
                            // multi-page TIFF
                            else
                            {
                                int frames = img.GetFrameCount(FrameDimension.Page);
                                for (int i = 0; i < frames; i++)
                                {
                                    img.SelectActiveFrame(FrameDimension.Page, i);
                                    using (var bmpFrame = new Bitmap(img))
                                    using (var pix = Tesseract.PixConverter.ToPix(bmpFrame))
                                    using (var page = engine.Process(pix))
                                    {
                                        sb.AppendLine(page.GetText());
                                    }
                                }
                            }
                            return sb.ToString();
                        }
                    }
                }
                catch { /* OCR failed – return empty string below */ }
            }

            // default: nothing extracted
            return string.Empty;
        }


        /// <summary>
        /// Indexes every document reference contained in the message
        /// Download the binary blob from Azure Blob Storage
        /// Run <c>ExtractText</c> to obtain searchable text (PDF text-layer or OCR for images)
        /// Classify the document via the DocumentClassifierService (rules → OpenAI fallback)
        /// Extract business identifiers (claim / policy numbers, etc.)
        /// Persist indexing data by calling UploadDocument
        /// Non-fatal errors on an individual file are logged and the loop continues with the next file,
        /// ensuring that one corrupt blob cannot fail the entire batch.
        /// </summary>
        public async Task IndexDocuments(DocumentAutoIndexMessage indexMessage)
        {
            // guards
            if (indexMessage?.Docs == null || indexMessage.Docs.Count == 0) return;

            var stagedForIndex = new List<Contracts.Entities.Document>();
            var identifiers = new Dictionary<string, string>();
            bool allClassified = true;

            foreach (var docRef in indexMessage.Docs)
            {
                try
                {
                    // pull binary
                    var blob = await _binaryStorageService.GetDocument(docRef.BlobUri);
                    if (blob?.Data == null || blob.Data.Length == 0) throw new InvalidOperationException("empty blob");

                    // plain text (OCR / PDF / text )
                    var text = await ExtractText(blob.Data, docRef.FileName);

                    // classify (must succeed for every attachment)
                    var input = new DocumentClassificationInput
                    {
                        EmailSubject = indexMessage.EmailSubject,
                        EmailBody = indexMessage.EmailBody,
                        AttachmentFileName = docRef.FileName,
                        AttachmentContent = text,
                        DocumentSystemNameId = (int)Enum.Parse(typeof(DocumentSystemNameEnum), indexMessage.SystemName, true)
                    };

                    var docType = await _documentClassifierService.ClassifyDocument(input);
                    if (docType == DocumentTypeEnum.Other) allClassified = false;

                    // identifiers – keep FIRST successful extraction only
                    if (identifiers == null || identifiers.Count == 0)
                        identifiers = ExtractIdentifiers(indexMessage, text);

                    // stage document (even if identifiers still null; decision later)
                    stagedForIndex.Add(new Contracts.Entities.Document
                    {
                        DocTypeId = (int)docType,
                        SystemName = indexMessage.SystemName,
                        DocumentUri = docRef.BlobUri,
                        FileName = docRef.FileName,
                        FileExtension = GetExtension(docRef.FileName),
                        DocumentStatus = DocumentStatusEnum.Received,
                        Keys = new Dictionary<string, string>(), // temp – filled after loop
                        DocumentSet = DocumentSetEnum.ClaimsAdditionalDocuments,
                        FileAsBase64 = Convert.ToBase64String(blob.Data),
                        MimeType = MimeMapping.GetMimeMapping(docRef.FileName ?? string.Empty)
                    });
                }
                catch (Exception ex)
                {
                    ex.LogException($"Indexing error on {docRef.FileName}");
                    allClassified = false; // guarantees manual route
                }
            }

            // decision
            // ------------------------------------------------------------------ decision
            bool idFound = identifiers != null && identifiers.Count > 0;
            bool requireManual = !allClassified || !idFound;

            if (requireManual)
            {
                // build a lightweight message that contains only references,
                // never the raw bytes
                var manualIndexMessage = new ManualDocumentIndexMessage
                {
                    BatchId = indexMessage.BatchId,
                    EmailSubject = indexMessage.EmailSubject,
                    EmailBody = indexMessage.EmailBody,
                    SystemName = indexMessage.SystemName,
                    Docs = indexMessage.Docs        // blob-URIs + file names
                };

                // push to the manual-index queue
                var manualProducer = new ServiceBusQueueProducer<ManualDocumentIndexMessage, ManualDocumentIndexListener>(
                        ManualDocumentIndexListener.QueueName);

                await manualProducer.PublishMessageAsync(manualIndexMessage);
                ServiceEventSource.Current.ServiceMessage(
                   Context, $"Batch {manualIndexMessage.BatchId} routed to Manual-Index workflow.");
                return;            // stop automatic pipeline here
            }
           
            // continue with automatic path

            // propagate the common identifiers to all staged docs
            foreach (var d in stagedForIndex) d.Keys = identifiers;

            foreach (var d in stagedForIndex)
                await _documentIndexService.LinkExistingBlob(d.DocumentUri, d.SystemName, d.DocTypeId, d.FileName,
                    d.FileExtension, d.Keys.Keys.First(), d.Keys.Values.First(), DocumentStatusEnum.Accepted);
        }

        /// <summary>
        /// Tries to extract a single primary identifier (e.g. claim- or policy-no) from the combined text of subject, body and attachment.
        /// </summary>
        private static Dictionary<string, string> ExtractIdentifiers(DocumentAutoIndexMessage message,
            string attachmentContent)
        {
            // normalise the searchable text
            var haystack = $"{message.EmailSubject} {message.EmailBody} {attachmentContent}"
                .Replace("\r", " ")
                .Replace("\n", " ")
                .Trim()
                .ToLowerInvariant();

            if (string.IsNullOrEmpty(haystack))
                return new Dictionary<string, string>(0);

            // pattern catalogue
            // TODO: Patterns to be defined in DB configuration table
            var catalog = new Dictionary<string, (string key, Regex rx)[]>(StringComparer.OrdinalIgnoreCase)
            {
                ["ClaimManager"] = new[]
                {
                    ("PersonEvent",
                        new Regex(@"\bclaim\s*(?:number)?\s*[:#-]?\s*(\d{5,})",
                            RegexOptions.IgnoreCase | RegexOptions.Compiled))
                },

                ["PolicyManager"] = new[]
                {
                    ("CaseCode",
                        new Regex(@"\bpolicy\s*(?:number)?\s*[:#-]?\s*([A-Z0-9\-]{6,})",
                            RegexOptions.IgnoreCase | RegexOptions.Compiled))
                }
            };

            if (!catalog.TryGetValue(message.SystemName, out var patterns))
                return new Dictionary<string, string>(0); // system unknown

            // only the *first* successful match wins – stop searching afterwards
            foreach (var (key, rx) in patterns)
            {
                var m = rx.Match(haystack);
                if (m.Success && m.Groups.Count > 1)
                {
                    return new Dictionary<string, string>(1)
                    {
                        [key] = m.Groups[1].Value
                    };
                }
            }

            // no hit
            return new Dictionary<string, string>(0);
        }
    }
}
