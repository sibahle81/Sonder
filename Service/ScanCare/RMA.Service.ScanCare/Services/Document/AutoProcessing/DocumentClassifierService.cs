using Microsoft.Kiota.Abstractions.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ScanCare.Contracts.Entities.AutoProcessing;
using RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing;
using RMA.Service.ScanCare.Database.Entities;

using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Fabric;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ScanCare.Services.Document.AutoProcessing
{
    /// <summary>
    /// Classifies documents based on a set of rules stored in the database. Uses OpenAI as th fallback if no rules match
    /// </summary>
    public class DocumentClassifierService : RemotingStatelessService, IDocumentClassifierService
    {
        private readonly IRepository<documents_DocumentClassificationPattern> _documentClassificationRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IConfigurationService _configurationService;
        private string _openAiApiKey = string.Empty;
        private string _openAiEndpoint = string.Empty;

        public DocumentClassifierService(StatelessServiceContext context,
            IRepository<documents_DocumentClassificationPattern> documentClassificationRepository,
            IDbContextScopeFactory dbContextScopeFactory, IConfigurationService configurationService)
            : base(context)
        {
            _documentClassificationRepository = documentClassificationRepository;
            _dbContextScopeFactory = dbContextScopeFactory;
            _configurationService = configurationService;
        }

        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            // one-time initialisation
            _openAiApiKey = await _configurationService.GetModuleSetting(SystemSettings.OpenAiApiKey);

            _openAiEndpoint = await _configurationService.GetModuleSetting(SystemSettings.OpenAiUrl);

            if (string.IsNullOrWhiteSpace(_openAiEndpoint))
                throw new InvalidOperationException("OpenAI URL (OpenAiUrl) is not configured.");

            if (string.IsNullOrWhiteSpace(_openAiApiKey))
                throw new InvalidOperationException("OpenAI API key (OpenAiApiKey) is not configured.");

            // nothing else to do right now, so just stay alive
            await Task.Delay(Timeout.Infinite, cancellationToken);
        }


        /// <summary>
        ///  Scores the text against the rule-table and returns the best
        ///  <see cref="DocumentTypeEnum"/>; falls back to GPT if nothing matches.
        /// </summary>
        public async Task<DocumentTypeEnum> ClassifyDocument(DocumentClassificationInput input)
        {
            if (input == null) throw new ArgumentNullException(nameof(input));

            // build searchable text *once*
            var aggregatedText =
                $"{input.EmailSubject} {input.EmailBody} {input.AttachmentFileName} {input.AttachmentContent}";

            // fetch all patterns for the calling system in one shot
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var patterns = await _documentClassificationRepository
                    .Where(p => p.DocumentSystemNameId == input.DocumentSystemNameId &&
                                p.IsActive && !p.IsDeleted)
                    .ToListAsync();

                if (patterns.Count == 0)
                    return await ApplyOpenAiClassification(aggregatedText); // no rules – go GPT

                // accumulate score per DocType
                var score = new Dictionary<DocumentTypeEnum, int>();

                foreach (var pat in patterns)
                {
                    bool hit = pat.IsRegex
                        ? new Regex(pat.Pattern, RegexOptions.IgnoreCase | RegexOptions.Compiled)
                              .IsMatch(aggregatedText)
                        : aggregatedText.IndexOf(pat.Pattern, StringComparison.OrdinalIgnoreCase) >= 0;

                    if (!hit) continue;

                    if (!score.TryAdd(pat.DocumentType, pat.Weight))
                        score[pat.DocumentType] += pat.Weight;
                }

                // decide winner / fallback
                if (score.Count == 0)
                    return await ApplyOpenAiClassification(aggregatedText);

                var best = score.OrderByDescending(s => s.Value).First().Key;
                return Enum.IsDefined(typeof(DocumentTypeEnum), best)
                       ? best
                       : await ApplyOpenAiClassification(aggregatedText);
            }
        }


        // Returns a comma-separated list of ALL names inside DocumentTypeEnum.
        private string BuildAllDocumentTypeNames()
        {
           return string.Join(", ", Enum.GetNames(typeof(DocumentTypeEnum)));
        }

        /// <summary>
        /// Uses OpenAI’s chat completion API to classify a document when
        /// the rule-engine could not decide.  Falls back to <c>Other</c>
        /// on any error or if the returned value is not a recognised enum.
        /// </summary>
        private async Task<DocumentTypeEnum> ApplyOpenAiClassification(string aggregatedText)
        {
            // build the list dynamically so the code keeps working when new document types are added
            var allTypes = BuildAllDocumentTypeNames();

            var prompt =
                $"Classify the following document text into one of the document " +
                $"types ({allTypes}).\n\n" +
                $"Document Text:\n{aggregatedText}\n\n" +
                "Return ONLY this JSON: { \"document_type\": \"<type>\" }";

            var requestPayload = new
            {
                model = "gpt-3.5-turbo",
                messages = new object[]
                {
            new { role = "system", content = "You are an AI document classifier." },
            new { role = "user",   content = prompt }
                },
                max_tokens = 40,      // JSON answer is very small; keep it tight
                temperature = 0.0
            };

            // Call OpenAi
            using (var http = new HttpClient())
            {
                http.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", _openAiApiKey);

                using (var body = new StringContent(JsonConvert.SerializeObject(requestPayload), Encoding.UTF8,
                           "application/json"))
                {
                    try
                    {
                        var resp = await http.PostAsync(_openAiEndpoint, body);
                        if (!resp.IsSuccessStatusCode)
                            return DocumentTypeEnum.Other;

                        var raw = await resp.Content.ReadAsStringAsync();
                        var root = JObject.Parse(raw);
                        var answer = root["choices"]?[0]?["message"]?["content"]?.ToString();

                        if (string.IsNullOrWhiteSpace(answer))
                            return DocumentTypeEnum.Other;

                        var typeName = JObject.Parse(answer)["document_type"]?.ToString();

                        return Enum.TryParse(typeName, true, out DocumentTypeEnum parsed)
                            ? parsed
                            : DocumentTypeEnum.Other;
                    }
                    catch (Exception ex)
                    {
                        ex.LogException("OpenAI fallback classification failed");
                        return DocumentTypeEnum.Other;
                    }
                }
            }
        }
    }
}
