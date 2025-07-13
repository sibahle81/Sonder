using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

using Newtonsoft.Json;

using OpenXmlPowerTools;

using PdfSharp.Pdf;
using PdfSharp.Pdf.IO;
using PdfSharp.Pdf.Security;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Diagnostics.Contracts;
using System.Drawing;
using System.Fabric;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Linq;
using System.Xml.Schema;

using WebSupergoo.ABCpdf11;

using Table = DocumentFormat.OpenXml.Wordprocessing.Table;
using TableCell = DocumentFormat.OpenXml.Wordprocessing.TableCell;
using TableRow = DocumentFormat.OpenXml.Wordprocessing.TableRow;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class DocumentGeneratorFacade : RemotingStatelessService, IDocumentGeneratorService
    {
        private readonly IDocumentGenerationAuditService _documentAuditService;
        private readonly IDocumentTemplateService _documentTemplateService;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_DocumentNumber> _documentNumberRepository;

        public DocumentGeneratorFacade(StatelessServiceContext state,
            IDocumentGenerationAuditService documentAuditService,
            IDocumentTemplateService documentTemplateService,
            IRepository<common_DocumentNumber> documentNumberRepository,
            IDbContextScopeFactory dbContextScopeFactory) :
            base(state)
        {
            _documentAuditService = documentAuditService;
            _documentTemplateService = documentTemplateService;
            _documentNumberRepository = documentNumberRepository;
            _dbContextScopeFactory = dbContextScopeFactory;
        }

        public async Task<byte[]> GenerateDocument(byte[] byteData, string templateData)
        {
            Contract.Requires(byteData != null);
            using (var stream = new MemoryStream())
            {
                await stream.WriteAsync(byteData, 0, (int)byteData.Length);
                using (var openXmlDoc = WordprocessingDocument.Open(stream, true))
                {
                    openXmlDoc.ChangeDocumentType(WordprocessingDocumentType.Document);

                    // Find all placeholders
                    var placeHolders = openXmlDoc.MainDocumentPart.RootElement.Descendants<SdtContentRun>();

                    var xDocument = XDocument.Parse(templateData);

                    foreach (var placeHolder in placeHolders)
                    {
                        var placeHolderText = placeHolder.Descendants<Text>().FirstOrDefault()
                            ?.InnerText
                            .Trim()
                            .ToLower();

                        foreach (var element in xDocument.Descendants())
                        {
                            if (element.Name.ToString().ToLower().Trim() != placeHolderText) continue;
                            Debug.WriteLine($"{placeHolderText} => {element.Value}");
                            var run = placeHolder.Descendants<Run>().FirstOrDefault();
                            if (run == null) continue;
                            run.RemoveAllChildren(); // Remove children

                            if (element.HasElements) //For MultiLine Items
                            {
                                var format = element.Attribute("format")?.Value.ToLower() ?? "list";
                                if (format == "table") //if Table Create table format to add to document
                                {
                                    var table = CreateTable(element);
                                    run.Append(table);
                                }
                                else
                                {
                                    var listItems = element.Descendants().Select(n => n.Value).ToList();
                                    foreach (var item in listItems)
                                    {
                                        //TODO: Insert in Bullet List
                                        run.AppendChild<Text>(new Text(item));
                                        run.AppendChild<Break>(new Break());
                                    }
                                }
                            }
                            else
                            {
                                run.AppendChild<Text>(new Text(element.Value));
                            }
                        }
                    }

                    openXmlDoc.Save();

                    return ConvertDocumentToPdf(openXmlDoc);
                }

                // return stream.ToArray();
            }
        }

        public async Task<int> GenerateTableId(DocumentNumberTypeEnum documentNumberType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {

                var documentNumber = await _documentNumberRepository.SqlQueryAsync<common_DocumentNumber>("[Common].[GetReferenceNumber] @DocumentType", new SqlParameter { ParameterName = "@DocumentType", Value = documentNumberType.ToString() });
                if (documentNumber == null || documentNumber.Count < 1)
                    throw new BusinessException("Document number type does not exist please check Document Numbers Table");

                var docNum = documentNumber.First();

                return docNum.NextNumber;
            }
        }

        public async Task<string> GenerateDocumentNumber(DocumentNumberTypeEnum documentNumberType, string prefixSuffix)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var documentNumber = await _documentNumberRepository.SqlQueryAsync<common_DocumentNumber>("[Common].[GetReferenceNumber] @DocumentType", new SqlParameter { ParameterName = "@DocumentType", Value = documentNumberType.ToString() });
                if (documentNumber == null || documentNumber.Count < 1)
                    throw new BusinessException("Document number type does not exist please check Document Numbers Table");
                var docNum = documentNumber.First();
                return BuildDocumentNumber(docNum, docNum.NextNumber, prefixSuffix);

                //var prefixSuffixVal = prefixSuffix;
                //if (docNum.PrefixSuffixLength > 1 && !string.IsNullOrEmpty(prefixSuffix))
                //{
                //    prefixSuffixVal = prefixSuffix.PadRight(docNum.PrefixSuffixLength + 1, ' ').Substring(0, docNum.PrefixSuffixLength);
                //}

                //var yearMonth = DateTime.Now.ToString("yyyyMM");
                //var century = DateTime.Now.ToString("yy");
                //docNum.Format = docNum.Format.Replace("{yyyyMM}", yearMonth);
                //docNum.Format = docNum.Format.Replace("{yy}", century);

                //var value = string.Format(docNum.Format, prefixSuffixVal, docNum.NextNumber);

                //value = string.Concat(value.Where(c => !char.IsWhiteSpace(c)));
                //return value.ToUpper();
            }
        }

        public async Task<string> GetDocumentNumber(DocumentNumberTypeEnum documentNumberType, int nextNumber, string prefixSuffix)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var documentNumber = await _documentNumberRepository.SingleOrDefaultAsync(dn => dn.Id == (int)documentNumberType);
                if (documentNumber == null)
                    throw new BusinessException("Document number type does not exist please check Document Numbers Table");
                return BuildDocumentNumber(documentNumber, nextNumber, prefixSuffix);
            }
        }

        private static string BuildDocumentNumber(common_DocumentNumber documentNumber, int nextNumber, string prefixSuffix)
        {
            var prefixSuffixVal = prefixSuffix;
            if (documentNumber.PrefixSuffixLength > 1 && !string.IsNullOrEmpty(prefixSuffix))
            {
                prefixSuffixVal = prefixSuffix.PadRight(documentNumber.PrefixSuffixLength + 1, ' ').Substring(0, documentNumber.PrefixSuffixLength);
            }

            var yearMonth = DateTime.Now.ToString("yyyyMM");
            var century = DateTime.Now.ToString("yy");
            documentNumber.Format = documentNumber.Format.Replace("{yyyyMM}", yearMonth);
            documentNumber.Format = documentNumber.Format.Replace("{yy}", century);

            var value = string.Format(documentNumber.Format, prefixSuffixVal, nextNumber);

            value = string.Concat(value.Where(c => !char.IsWhiteSpace(c)));
            return value.ToUpper();
        }

        private static byte[] ConvertDocumentToPdf(WordprocessingDocument openXmlDoc)
        {

            //TODO: I will eventually add code to process headers.

            var settings = new HtmlConverterSettings()
            {
                ImageHandler = imageInfo =>
                {
                    var imageType = imageInfo.ContentType.Split('/')[1].ToLower();
                    var imageFileName = $"data:image/{imageType};base64,";
                    try
                    {
                        var converter = new ImageConverter();
                        var bytes = (byte[])converter.ConvertTo(imageInfo.Bitmap, typeof(byte[]));
                        imageFileName += Convert.ToBase64String(bytes, 0, bytes.Length);
                    }
                    catch (Exception)
                    {
                        return null;
                    }

                    var img = new XElement(Xhtml.img,
                        new XAttribute(NoNamespace.src, imageFileName),
                        imageInfo.ImgStyleAttribute,
                        imageInfo.AltText != null ? new XAttribute(NoNamespace.alt, imageInfo.AltText) : null);
                    return img;
                }
            };

            var html = HtmlConverter.ConvertToHtml(openXmlDoc, settings);
            using (Doc pdfDocument = new Doc())
            {
                pdfDocument.HtmlOptions.Engine = EngineType.Chrome;
                pdfDocument.HtmlOptions.UseScript = true;
                pdfDocument.HtmlOptions.Media = MediaType.Screen;
                pdfDocument.HtmlOptions.InitialWidth = 800;
                pdfDocument.Rect.Inset(72, 72);
                var xHtml = html.ToStringNewLineOnAttributes();
                var docId = pdfDocument.AddImageHtml(xHtml);
                while (true)
                {
                    // pdfDocument.FrameRect();
                    if (!pdfDocument.Chainable(docId))
                        break;
                    pdfDocument.Page = pdfDocument.AddPage();
                    docId = pdfDocument.AddImageToChain(docId);
                }

                for (var i = 1; i <= pdfDocument.PageCount; i++)
                {
                    pdfDocument.PageNumber = i;
                    pdfDocument.Flatten();
                }

                return pdfDocument.GetData().ToArray();
            }
        }

        public async Task<byte[]> ConvertHtmlToPdf(string htmlDoc)
        {

            var settings = new HtmlConverterSettings()
            {
                ImageHandler = imageInfo =>
                {
                    var imageType = imageInfo.ContentType.Split('/')[1].ToLower();
                    var imageFileName = $"data:image/{imageType};base64,";
                    try
                    {
                        var converter = new ImageConverter();
                        var bytes = (byte[])converter.ConvertTo(imageInfo.Bitmap, typeof(byte[]));
                        imageFileName += Convert.ToBase64String(bytes, 0, bytes.Length);
                    }
                    catch (Exception ex)
                    {
                        ex.LogException();
                    }

                    var img = new XElement(Xhtml.img,
                        new XAttribute(NoNamespace.src, imageFileName),
                        imageInfo.ImgStyleAttribute,
                        imageInfo.AltText != null ? new XAttribute(NoNamespace.alt, imageInfo.AltText) : null);
                    return img;
                }
            };

            using (Doc pdfDocument = new Doc())
            {
                pdfDocument.HtmlOptions.Engine = EngineType.Chrome;
                pdfDocument.HtmlOptions.UseScript = true;
                pdfDocument.HtmlOptions.Media = MediaType.Screen;
                pdfDocument.HtmlOptions.InitialWidth = 800;
                pdfDocument.Rect.Inset(72, 72);
                var xHtml = htmlDoc;
                var docId = pdfDocument.AddImageHtml(xHtml);
                while (true)
                {
                    // pdfDocument.FrameRect();
                    if (!pdfDocument.Chainable(docId))
                        break;
                    pdfDocument.Page = pdfDocument.AddPage();
                    docId = pdfDocument.AddImageToChain(docId);
                }

                for (var i = 1; i <= pdfDocument.PageCount; i++)
                {
                    pdfDocument.PageNumber = i;
                    pdfDocument.Flatten();
                }

                return pdfDocument.GetData().ToArray();
            }
        }

        private static Table CreateTable(XElement element)
        {
            var table = new Table();
            var tableProperties = CreateTableProperties();
            table.AppendChild(tableProperties);

            var tableHeaders = CreateTableHeaders(element.Attribute("headers")?.Value);
            if (tableHeaders != null) table.Append(tableHeaders);

            foreach (var descendant in element.Elements())
            {
                var tableRow = new TableRow();
                foreach (var (item, tableCell) in from item in descendant.Descendants()
                                                  let tableCell = new TableCell()
                                                  select (item, tableCell))
                {
                    tableCell.Append(new TableCellProperties(new TableCellWidth()
                    { Type = TableWidthUnitValues.Auto }));
                    tableCell.Append(new Paragraph(new Run(new Text(item.Value))));
                    tableRow.Append(tableCell);
                    Debug.WriteLine($"Row:{descendant.Name} Column:{item.Value}");
                }

                table.Append(tableRow);
            }

            return table;
        }

        private static TableRow CreateTableHeaders(string value)
        {
            if (string.IsNullOrEmpty(value)) return null;
            var headers = value.Split('|');
            var tableRow = new TableRow();

            var tableRowProperties = new TableRowProperties();
            var tableHeader = new TableHeader() { Val = OnOffOnlyValues.On };
            tableRowProperties.Append(tableHeader);
            tableRow.Append(tableRowProperties);


            foreach (var header in headers)
            {
                var tableCell = new TableCell();
                var headerRun = new Run();
                var runProperties = headerRun.AppendChild(new RunProperties());
                var bold = new Bold
                {
                    Val = OnOffValue.FromBoolean(true)
                };
                runProperties.AppendChild(bold);
                headerRun.Append(new Text(header));
                tableCell.Append(new TableCellProperties(new TableCellWidth() { Type = TableWidthUnitValues.Auto }));
                tableCell.Append(new Paragraph(headerRun));
                tableRow.Append(tableCell);
            }

            return tableRow;
        }

        private static TableProperties CreateTableProperties()
        {
            var tblProperties = new TableProperties(
                new TableBorders(new TopBorder() { Val = new EnumValue<BorderValues>(BorderValues.Birds), Size = 24 },
                    new BottomBorder() { Val = new EnumValue<BorderValues>(BorderValues.Birds), Size = 24 },
                    new LeftBorder() { Val = new EnumValue<BorderValues>(BorderValues.Birds), Size = 24 },
                    new RightBorder() { Val = new EnumValue<BorderValues>(BorderValues.Birds), Size = 24 },
                    new InsideHorizontalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Birds), Size = 24 },
                    new InsideVerticalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Birds), Size = 24 }));

            tblProperties.AppendChild(new TableWidth() { Width = "5000", Type = TableWidthUnitValues.Pct });

            return tblProperties;
        }

        public async Task<byte[]> GetFileByteData(string filePath)
        {
            Contract.Requires(filePath != null);
            byte[] byteData = null;
            if (filePath.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                byteData = GetFromWebLink(filePath);
            }
            else if (File.Exists(filePath))
            {
                byteData = GetFromFileSystem(filePath);
            }
            else
            {
                throw new FileNotFoundException($"Could not find the file from supplied path: {filePath}");
            }

            return await Task.FromResult(byteData);
        }

        private static byte[] GetFromWebLink(string path)
        {
            byte[] byteData;
            using (var webClient = new WebClient())
            {
                byteData = webClient.DownloadData(path);
            }

            return byteData;
        }

        private static byte[] GetFromFileSystem(string path)
        {
            return File.ReadAllBytes(path);
        }

        public async Task<FormLetterResponse> GenerateDocumentLetter(FormLetterRequest request)
        {
            Contract.Requires(request != null);
            var response = new FormLetterResponse(request);
            var template = await _documentTemplateService.GetDocumentTemplateById((int)request.DocumentTypeId);
            XmlDocument xmlData;
            try
            {
                xmlData = JsonConvert.DeserializeXmlNode(request.JsonDocumentData);
            }
            catch (Exception)
            {
                xmlData = JsonConvert.DeserializeXmlNode(request.JsonDocumentData, request.DocumentName);
            }
            var validated = ValidateXmlSchema(template, xmlData);
            var byteData = await GetFileByteData(template.Location);
            response.ByteData = await GenerateDocument(byteData, xmlData.OuterXml);

            await AddAudit(template, validated, xmlData);

            return response;
        }

        public async Task<byte[]> GenerateWordDocument(byte[] byteData, Dictionary<string, string> documentTokens)
        {
            Contract.Requires(byteData != null);
            Contract.Requires(documentTokens != null);
            using (MemoryStream stream = new MemoryStream())
            {
                byte[] document = byteData;
                try
                {
                    await stream.WriteAsync(byteData, 0, (int)byteData.Length);

                    using (WordprocessingDocument doc = WordprocessingDocument.Open(stream, true))
                    {
                        foreach (var documentToken in documentTokens)
                        {
                            string modifiedString = null;
                            foreach (Paragraph p in doc.MainDocumentPart.Document.Body.Descendants<Paragraph>().Where<Paragraph>(p => p.InnerText.Contains(documentToken.Key)))
                            {
                                Run[] runArr = p.Descendants<Run>().ToArray();
                                // foreach each run
                                foreach (Run run in runArr)
                                {
                                    string innerText = run.InnerText;
                                    modifiedString = run.InnerText.Replace(documentToken.Key, documentToken.Value);
                                    // if the InnerText doesn't modify
                                    if (modifiedString != run.InnerText)
                                    {
                                        Text t = new Text(modifiedString);
                                        run.RemoveAllChildren<Text>();
                                        run.AppendChild<Text>(t);
                                    }
                                }
                            }
                        }
                        doc.MainDocumentPart.Document.Save();
                        document = stream.ToArray();
                    }
                    stream.Close();
                }
                catch (Exception ex)
                {
                    ex.LogException();
                }
                return await Task.FromResult(document);
            }
        }

        private async Task AddAudit(DocumentTemplate template, bool validated, XmlDocument xmlData)
        {
            await _documentAuditService.AddAudit(new DocumentGeneratorAudit()
            {
                TimeStamp = DateTimeHelper.SaNow,
                DocumentTemplateId = template.Id,
                IsValidated = validated,
                Request = xmlData.OuterXml,
                RequestedBy = RmaIdentity.Username,
                RequestId = Guid.NewGuid()
            });
        }

        private bool ValidateXmlSchema(DocumentTemplate template, XmlDocument xmlData)
        {
            if (string.IsNullOrEmpty(template.SchemaValidator)) return false;
            using (var schema = XmlReader.Create(new StringReader(template.SchemaValidator)))
            {
                var schemas = new XmlSchemaSet();
                schemas.Add("", schema);
                xmlData.Schemas.Add(schemas);
                var eventHandler = new ValidationEventHandler(ValidationEventHandler);
                xmlData.Validate(eventHandler);
                return true;
            }
        }

        private  static void ValidationEventHandler(object sender, ValidationEventArgs e)
        {
            switch (e.Severity)
            {
                case XmlSeverityType.Error:
                    throw new BusinessException("Unable to generate requested document. Please see logs for details.");
                case XmlSeverityType.Warning:
                    break;
            }
        }

        public async Task<int> GetNextDocumentNumber(DocumentNumberTypeEnum documentNumberType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var number = await _documentNumberRepository.SingleOrDefaultAsync(dn => dn.Id == (int)documentNumberType);
                if (number is null) return 1;
                return number.NextNumber + 1;
            }
        }

        public async Task SetNextDocumentNumber(DocumentNumberTypeEnum documentNumberType, int nextNumber)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var number = await _documentNumberRepository.SingleOrDefaultAsync(dn => dn.Id == (int)documentNumberType);
                if (number is null)
                    throw new Exception($"Could not find document number with id {documentNumberType}");
                number.NextNumber = nextNumber;
                _documentNumberRepository.Update(number);
                await scope.SaveChangesAsync();
            }
        }

        /// <summary>
        /// pass protect pdfs sent out to clients
        /// </summary>
        /// <param name="userPassword">password that the user will input</param>
        /// <param name="ownerPassword">required password the sender uses to unlock</param>
        /// <param name="request">object carrying byte array of pdf to encrypt</param>
        /// <returns>password protected doc in bytes</returns>
        public async Task<FileEncryptResponse> PasswordProtectPdf(string userPassword, string ownerPassword, FileEncryptRequest request)
        {
            PdfDocument document;
            using (MemoryStream stream = new MemoryStream(request?.documentBytes))
            {
                document = PdfReader.Open(stream);
                PdfSecuritySettings securitySettings = document.SecuritySettings;
                securitySettings.UserPassword = userPassword;
                securitySettings.OwnerPassword = ownerPassword;
            }
            var response = new FileEncryptResponse();
            using (MemoryStream streamFinal = new MemoryStream())
            {
                // Saves the document as stream
                document.Save(streamFinal);
                document.Close();
                // Converts the PdfDocument object to byte form.
                response.encryptedDocumentBytes = streamFinal.ToArray();
            }
            return await Task.FromResult(response);
        }
    }
}