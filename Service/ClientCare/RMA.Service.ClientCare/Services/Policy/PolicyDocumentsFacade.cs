using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Fabric;
using System.Net;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class PolicyDocumentsFacade : RemotingStatelessService, IPolicyDocumentsService
    {
        private readonly IConfigurationService _configurationService;
        private readonly IPolicyCaseService _caseService;
        private readonly IWizardService _wizardService;
        private readonly ISerializerService _serializer;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<product_Product> _productRepository;
        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IRepository<client_Person> _personRepository;
        private readonly IRepository<policy_PolicyLifeExtension> _lifeExtensionRepository;
       
        private string _reportserverUrl;
        private string _parameters;

        private WebHeaderCollection _headerCollection;

        public PolicyDocumentsFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IConfigurationService configurationService,
            IPolicyCaseService caseService,
            IWizardService wizardService,
            ISerializerService serializer,
            IDocumentIndexService documentIndexService,
            IDocumentGeneratorService documentGeneratorService,
            IRepository<product_Product> productRepository,
            IRepository<policy_Policy> policyRepository,
            IRepository<client_Person> personRepository,
            IRepository<policy_PolicyLifeExtension> lifeExtensionRepository
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _configurationService = configurationService;
            _caseService = caseService;
            _wizardService = wizardService;
            _serializer = serializer;
            _documentIndexService = documentIndexService;
            _documentGeneratorService = documentGeneratorService;
            _productRepository = productRepository;
            _policyRepository = policyRepository;
            _personRepository = personRepository;
            _lifeExtensionRepository = lifeExtensionRepository;           
            Task.Run(() => this.SetupPolicyDocumentsVariables()).Wait();
        }

        private async Task SetupPolicyDocumentsVariables()
        {
            _reportserverUrl = $"{await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl)}RMA.Reports.ClientCare.Policy";
        }

        public async Task<List<MailAttachment>> GetFuneralPolicyDocumentsByWizardId(int wizardId)
        {
            _parameters = $"&wizardId={wizardId}&rs:Command=ClearSession";

            var environment = await _configurationService.GetModuleSetting("Environment");

            _headerCollection = new WebHeaderCollection
            {
                { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                { SystemSettings.Environment,  environment}
            };

            var welcomeLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAFuneralWelcomeLetter{_parameters}&rs:Format=PDF"), _headerCollection);
            var policySchedule = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAFuneralPolicySchedule{_parameters}&rs:Format=PDF"), _headerCollection);
            var termsAndConditions = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAFuneralCoverTermsAndConditions.pdf{_parameters}&rs:Format=PDF"), _headerCollection);

            var attachments = new List<MailAttachment>
                {
                    new MailAttachment { AttachmentByteData = welcomeLetter, FileName = "WelcomeLetter.pdf", FileType = "application/pdf"},
                    new MailAttachment { AttachmentByteData = policySchedule, FileName = "PolicySchedule.pdf", FileType = "application/pdf"},
                    new MailAttachment { AttachmentByteData = termsAndConditions, FileName = "TermsAndConditions.pdf", FileType = "application/pdf"}
                };

            return attachments;
        }

        public async Task<List<MailAttachment>> GetFuneralPolicyDocumentsByPolicyId(int policyId, string parentPolicyNumber)
        {
            try
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var environment = await _configurationService.GetModuleSetting("Environment");
                    _headerCollection = new WebHeaderCollection
                    {
                        { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                        { SystemSettings.Environment,  environment}
                    };

                    var policy = await _policyRepository.SingleAsync(s => s.PolicyId == policyId);
                    await _policyRepository.LoadAsync(policy, d => d.ProductOption);
                    var product = await _productRepository.SingleAsync(s => s.Id == policy.ProductOption.ProductId);
                    var policyLifeExtension = await _lifeExtensionRepository.SingleOrDefaultAsync(s => s.PolicyId == policyId);
                    var person = await _personRepository.SingleAsync(s => s.RolePlayerId == policy.PolicyOwnerId);

                    var password = person?.IdNumber ?? policy.PolicyNumber;
                    var attachments = new List<MailAttachment>();

                    if (product.ProductClass == ProductClassEnum.MedicalAnnuity)
                    {
                        // Medical Annuity
                        attachments = await GenerateMedicalAnnuityDocumentsByPolicyId(policyId, password);
                    }
                    else if (product.ProductClass == ProductClassEnum.ValuePlus)
                    {
                        // MVP
                        attachments = await GenerateMvpPolicyDocumentsByPolicyId(policyId, policy.PolicyNumber, password);
                    }
                    else if (policyLifeExtension != null)
                    {
                        // Consolidated Funeral
                        attachments = await GenerateConsolidatedFuneralDocumentsByPolicyId(policyId, policy.PolicyNumber, password);
                    }
                    else
                    {
                        // Group scheme member
                        attachments = await GenerateFuneralSchemeDocumentsByPolicyId(policyId, parentPolicyNumber ?? policy.PolicyNumber, password);
                    }

                    return attachments;
                }
            }
            catch (Exception ex)
            {
                ex.LogException("Fetch Member Documents");
                throw;
            }
        }

        private async Task<List<MailAttachment>> GenerateMedicalAnnuityDocumentsByPolicyId(int policyId, string passcode)
        {
            var attachments = new List<MailAttachment>();
            List<MailAttachment> policyDocuments = new List<MailAttachment>();
            if (policyId > 0)
            {
                policyDocuments = await GeneratePRMAPolicyDocumentsByPolicyId(policyId);
            }

            foreach (var policyDocument in policyDocuments)
            {
                if (policyDocument != null)
                {
                    const string policyScheduleFileName = "PolicySchedule.pdf";
                    if (policyDocument.FileName.Equals(policyScheduleFileName))
                    {
                        var policySchedule = policyDocuments.Find(x => x.FileName == policyScheduleFileName);
                        var encryptedPolicySchedule = await GetEncryptedFile(passcode, passcode, policySchedule.AttachmentByteData);
                        attachments.Add(new MailAttachment { AttachmentByteData = encryptedPolicySchedule.encryptedDocumentBytes, FileName = policyScheduleFileName, FileType = "application/pdf" });
                    }
                    const string welcomeLetterFileName = "WelcomeLetter.pdf";
                    if (policyDocument.FileName.Equals(welcomeLetterFileName))
                    {
                        var policySchedule = policyDocuments.Find(x => x.FileName == welcomeLetterFileName);
                        var encryptedPolicySchedule = await GetEncryptedFile(passcode, passcode, policySchedule.AttachmentByteData);
                        attachments.Add(new MailAttachment { AttachmentByteData = encryptedPolicySchedule.encryptedDocumentBytes, FileName = welcomeLetterFileName, FileType = "application/pdf" });
                    }
                    const string termsAndConditionsFileName = "TermsAndConditions.pdf";
                    if (policyDocument.FileName.Equals(termsAndConditionsFileName))
                    {
                        var termsAndConditions = policyDocuments.Find(x => x.FileName == termsAndConditionsFileName);
                        attachments.Add(new MailAttachment { AttachmentByteData = termsAndConditions.AttachmentByteData, FileName = termsAndConditionsFileName, FileType = "application/pdf" });
                    }
                }
            }
            return attachments;
        }

        private async Task<List<MailAttachment>> GeneratePRMAPolicyDocumentsByPolicyId(int policyId)
        {
            const int wizardId = 0;
            var attachments = new List<MailAttachment>();

            // Welcome letter
            _parameters = $"&PolicyId={policyId}&rs:Command=ClearSession";
            var welcomeLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/PRMAWelcomeLetter{_parameters}&rs:Format=PDF"), _headerCollection);
            if (welcomeLetter.Length > 0)
            {
                attachments.Add(new MailAttachment { AttachmentByteData = welcomeLetter, FileName = "WelcomeLetter.pdf", FileType = "application/pdf" });
            }

            // Policy schedule
            _parameters = $"&wizardId={wizardId}&policyId={policyId}&rs:Command=ClearSession";
            var policySchedule = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/PRMAPolicySchedule{_parameters}&rs:Format=PDF"), _headerCollection);
            if (policySchedule.Length > 0)
            {
                attachments.Add(new MailAttachment { AttachmentByteData = policySchedule, FileName = "PolicySchedule.pdf", FileType = "application/pdf" });
            }

            // Terms & Conditions
            var termsAndConditions = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/PRMA_FAQS.pdf&rs:Format=PDF"), _headerCollection);
            if (termsAndConditions.Length > 0)
            {
                attachments.Add(new MailAttachment { AttachmentByteData = termsAndConditions, FileName = "TermsAndConditions.pdf", FileType = "application/pdf" });
            }

            return attachments;
        }

        private async Task<List<MailAttachment>> GenerateMvpPolicyDocumentsByPolicyId(int policyId, string policyNumber, string password)
        {
            var attachments = new List<MailAttachment>();

            _parameters = $"&policyId={policyId}&rs:Command=ClearSession";
            var welcomeLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAMVPWelcomeLetter{_parameters}&rs:Format=PDF"), _headerCollection);
            if (welcomeLetter.Length > 0)
            {
                var fileEncryptWelcomeRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = welcomeLetter };
                var encryptedWelcomeLetter = await _documentGeneratorService.PasswordProtectPdf(policyNumber, password, fileEncryptWelcomeRequest);
                welcomeLetter = encryptedWelcomeLetter.encryptedDocumentBytes;
                attachments.Add(new MailAttachment { AttachmentByteData = welcomeLetter, FileName = "WelcomeLetter.pdf", FileType = "application/pdf" });
            }

            var mvpPolicySchedule = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAMVPPolicySchedule{_parameters}&rs:Format=PDF"), _headerCollection);
            if (mvpPolicySchedule.Length > 0)
            {
                var fileEncryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = mvpPolicySchedule };
                var encryptedSchedule = await _documentGeneratorService.PasswordProtectPdf(policyNumber, password, fileEncryptRequest);
                mvpPolicySchedule = encryptedSchedule.encryptedDocumentBytes;
                attachments.Add(new MailAttachment { AttachmentByteData = mvpPolicySchedule, FileName = "PolicySchedule.pdf", FileType = "application/pdf" });
            }

            var mvpTermsAndConditions = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/MVPLifeTermsAndConditions.pdf&rs:Format=PDF"), _headerCollection);
            if (mvpTermsAndConditions.Length > 0)
            {
                attachments.Add(new MailAttachment { AttachmentByteData = mvpTermsAndConditions, FileName = "TermsAndConditions.pdf", FileType = "application/pdf" });
            }

            return attachments;
        }

        private async Task<List<MailAttachment>> GenerateConsolidatedFuneralDocumentsByPolicyId(int policyId, string policyNumber, string password)
        {
            var attachments = new List<MailAttachment>();

            _parameters = $"&wizardId={policyId}&rs:Command=ClearSession";
            var welcomeLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMACFPFuneralGroupWelcomeLetter{_parameters}&rs:Format=PDF"), _headerCollection);
            if (welcomeLetter.Length > 0)
            {
                var fileEncryptWelcomeRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = welcomeLetter };
                var encryptedWelcomeLetter = await _documentGeneratorService.PasswordProtectPdf(policyNumber, password, fileEncryptWelcomeRequest);
                welcomeLetter = encryptedWelcomeLetter.encryptedDocumentBytes;
                attachments.Add(new MailAttachment { AttachmentByteData = welcomeLetter, FileName = "WelcomeLetter.pdf", FileType = "application/pdf" });
            }

            _parameters = $"&policyId={policyId}&rs:Command=ClearSession";
            var cfpPolicySchedule = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMACFPPolicySchedule{_parameters}&rs:Format=PDF"), _headerCollection);
            if (cfpPolicySchedule.Length > 0)
            {
                var fileEncryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = cfpPolicySchedule };
                var encryptedSchedule = await _documentGeneratorService.PasswordProtectPdf(policyNumber, password, fileEncryptRequest);
                cfpPolicySchedule = encryptedSchedule.encryptedDocumentBytes;
                attachments.Add(new MailAttachment { AttachmentByteData = cfpPolicySchedule, FileName = "PolicySchedule.pdf", FileType = "application/pdf" });
            }

            var cfpTermsAndConditions = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMACFPFuneralPolicyGroupTermsAndConditions.pdf&rs:Format=PDF"), _headerCollection);
            if (cfpTermsAndConditions.Length > 0)
            {
                attachments.Add(new MailAttachment { AttachmentByteData = cfpTermsAndConditions, FileName = "TermsAndConditions.pdf", FileType = "application/pdf" });
            }

            return attachments;
        }

        private async Task<List<MailAttachment>> GenerateFuneralSchemeDocumentsByPolicyId(int policyId, string policyNumber, string password)
        {
            var attachments = new List<MailAttachment>();

            _parameters = $"&policyId={policyId}&rs:Command=ClearSession";
            var welcomeLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAFuneralWelcomeLetter{_parameters}&rs:Format=PDF"), _headerCollection);
            if (welcomeLetter.Length > 0)
            {
                var fileEncryptWelcomeRequest = new FileEncryptRequest { documentBytes = welcomeLetter };
                var encryptedWelcomeLetter = await _documentGeneratorService.PasswordProtectPdf(policyNumber, password, fileEncryptWelcomeRequest);
                welcomeLetter = encryptedWelcomeLetter.encryptedDocumentBytes;
                attachments.Add(new MailAttachment { AttachmentByteData = welcomeLetter, FileName = "WelcomeLetter.pdf", FileType = "application/pdf" });
            }

            var policySchedule = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAFuneralPolicySchedule{_parameters}&rs:Format=PDF"), _headerCollection);
            if (policySchedule.Length > 0)
            {
                var fileEncryptRequest = new FileEncryptRequest { documentBytes = policySchedule };
                var encryptedSchedule = await _documentGeneratorService.PasswordProtectPdf(policyNumber, password, fileEncryptRequest);
                policySchedule = encryptedSchedule.encryptedDocumentBytes;
                attachments.Add(new MailAttachment { AttachmentByteData = policySchedule, FileName = "PolicySchedule.pdf", FileType = "application/pdf" });
            }

            var termsAndConditions = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAFuneralCoverTermsAndConditions.pdf&rs:Format=PDF"), _headerCollection);
            if (termsAndConditions.Length > 0)
            {
                attachments.Add(new MailAttachment { AttachmentByteData = termsAndConditions, FileName = "TermsAndConditions.pdf", FileType = "application/pdf" });
            }

            return attachments;
        }        
        private async Task<FileEncryptResponse> GetEncryptedFile(string clientReference, string password, byte[] content)
        {
            var request = new FileEncryptRequest { documentBytes = content };
            var response = await _documentGeneratorService.PasswordProtectPdf(clientReference, password, request);
            return response;
        }

        private async Task<byte[]> GetUriDocumentByteData(Uri url, WebHeaderCollection webHeaderCollection = null)
        {
            return await url.GetUriDataAsync(webHeaderCollection);
        }
    }
}
