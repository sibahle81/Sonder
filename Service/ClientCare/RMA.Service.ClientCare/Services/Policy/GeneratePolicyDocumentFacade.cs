using Castle.Core.Internal;
using ClosedXML;
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Enums.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ScanCare.Contracts.Entities;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

using PolicyModel = RMA.Service.ClientCare.Contracts.Entities.Policy.Policy;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class GeneratePolicyDocumentFacade : RemotingStatelessService, IGeneratePolicyDocumentService
    {
        private readonly IConfigurationService _configurationService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IDocumentGeneratorService _documentGeneratorService;

        private readonly WebHeaderCollection _headerCollection;

        private string _parameters;
        private string _reportServerUrl;
        private string _reportEnviroment;
        private readonly string _reportCategoryUrl = "RMA.Reports.ClientCare.Policy/";

        public GeneratePolicyDocumentFacade(
            StatelessServiceContext context,
            IConfigurationService configurationService,
            IDocumentIndexService documentIndexService,
            IDocumentGeneratorService documentGeneratorService
        ) : base(context)
        {
            _parameters = null;
            _headerCollection = null;
            _configurationService = configurationService;
            _documentIndexService = documentIndexService;
            _documentGeneratorService = documentGeneratorService;
            Task.Run(() => this.SetupPolicyCommunicationVariables()).Wait();
        }

        private async Task SetupPolicyCommunicationVariables()
        {
            _reportServerUrl = await _configurationService.GetModuleSetting(SystemSettings.SsrsServer);
            _reportEnviroment = await _configurationService.GetModuleSetting(SystemSettings.SsrsEnvironment);
        }

        public async Task CreatePolicyDocumentsIfNotExists(PolicyModel policy, string parentPolicyNumber)
        {
            if (string.IsNullOrEmpty(_reportServerUrl) || string.IsNullOrEmpty(_reportEnviroment))
                await SetupPolicyCommunicationVariables();

            if (policy == null) return;

            if (IsProductOptionDocumentTemplateConfigured(policy))
            {
                await CreatePolicyDocumentsForProductOption(policy);
                return;
            }

            try
            {
                if (policy.ProductOption.Product.ProductClass == ProductClassEnum.ValuePlus)
                {
                    await CreatePolicyDocumentsForMVP(policy, false);
                }
                else if (policy.ProductOption.Product.ProductClass == ProductClassEnum.MedicalAnnuity)
                {
                    await CreatePolicyDocumentsForMedicalAnnuity(policy, false);
                }
                else if (policy.PolicyLifeExtension != null)
                {
                    await CreatePolicyDocumentsForCFP(policy, false);
                }
                else if (IsSchemePolicy(policy))
                {
                    await CreatePolicyDocumentsForScheme(policy, false);
                }
                else if (IsSchemeMember(policy))
                {
                    await CreatePolicyDocumentsForGroupIndividual(policy, false);
                }
                else if (IsIndividualPolicy(policy))
                {
                    await CreatePolicyDocumentsForIndividual(policy, false);
                }
            }
            catch (Exception ex)
            {
                ex.LogException("Document Generation Error");
                throw;
            }
        }

        public async Task CreatePolicyShedulesOnly(PolicyModel policy)
        {
            if (policy == null) return;

            if (string.IsNullOrEmpty(_reportServerUrl) || string.IsNullOrEmpty(_reportEnviroment))
                await SetupPolicyCommunicationVariables();

            try
            {
                if (policy.ProductOption.Product.ProductClass == ProductClassEnum.ValuePlus)
                {
                    await CreatePolicyDocumentsForMVP(policy, true);
                }
                else if (policy.ProductOption.Product.ProductClass == ProductClassEnum.MedicalAnnuity)
                {
                    await CreatePolicyDocumentsForMedicalAnnuity(policy, true);
                }
                else if (policy.PolicyLifeExtension != null)
                {
                    await CreatePolicyDocumentsForCFP(policy, true);
                }
                else if (IsSchemePolicy(policy))
                {
                    await CreatePolicyDocumentsForScheme(policy, true); // Is this required for missing policies stabilisation
                }
                else if (IsSchemeMember(policy))
                {
                    await CreatePolicyDocumentsForGroupIndividual(policy, true);
                }
                else if (IsIndividualPolicy(policy))
                {
                    await CreatePolicyDocumentsForIndividual(policy, true);
                }
            }
            catch (Exception ex)
            {
                ex.LogException("Document Generation Error " + policy.PolicyId.ToString());
            }
        }

        private bool IsIndividualPolicy(PolicyModel policy)
        {
            if (policy.PolicyOwner?.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Person)
            {
                return policy.ParentPolicyId == null;
            }
            return false;
        }

        private bool IsSchemeMember(PolicyModel policy)
        {
            if (policy.PolicyOwner?.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Person)
            {
                return policy.ParentPolicyId != null;
            }
            return false;
        }

        private bool IsSchemePolicy(PolicyModel policy)
        {
            return policy.PolicyOwner?.RolePlayerIdentificationType != RolePlayerIdentificationTypeEnum.Person;
        }

        private async Task CreatePolicyDocumentsForScheme(PolicyModel policy, bool forcePolicyScheduleRefresh)
        {
            Contract.Requires(policy != null);
            var groupPolicyScheduleExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.GroupPolicySchedule);
            var welcomeLetterExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.WelcomeLetter);
            var termsAndConditionsExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.TermsConditions);

            var password = policy.PolicyNumber;

            var policyIdentifier = policy.PolicyOwner?.Person != null
                                ? $"{policy.PolicyOwner?.Person?.FirstName}-{policy.PolicyOwner?.Person?.Surname}-{policy.PolicyNumber}"
                                : policy.PolicyNumber;

            if (!groupPolicyScheduleExists || forcePolicyScheduleRefresh)
            {
                _parameters = $"&policyId={policy.PolicyId}&counter=1&rs:Command=ClearSession";
                var uri = await GetSsrsUri($"RMAFuneralGroupPolicySchedule{_parameters}&rs:Format=PDF");
                var policySchedule = await GetUriDocumentByteData(uri, _headerCollection);
                if (policySchedule?.Length > 0)
                {
                    var document = await GetEncryptedFile(password, policySchedule);
                    await SavePolicyDocument(policy.PolicyNumber, $"PolicySchedule-{policyIdentifier}.pdf", document.encryptedDocumentBytes, DocumentSetEnum.PolicyDocumentsgroup, DocumentTypeEnum.GroupPolicySchedule);

                }
                else
                {
                    throw new Exception($"Could not create Scheme Policy Schedule: {uri}");
                }
            }

            if (!welcomeLetterExists)
            {
                _parameters = $"&policyId={policy.PolicyId}&counter=1&rs:Command=ClearSession";
                var uri = await GetSsrsUri($"RMAFuneralGroupWelcomeLetter{_parameters}&rs:Format=PDF");
                var welcomeLetter = await GetUriDocumentByteData(uri, _headerCollection);
                if (welcomeLetter?.Length > 0)
                {
                    var document = await GetEncryptedFile(password, welcomeLetter);
                    await SavePolicyDocument(policy.PolicyNumber, "WelcomeLetter.pdf", document.encryptedDocumentBytes, DocumentSetEnum.PolicyDocumentsgroup, DocumentTypeEnum.WelcomeLetter);
                }
                else
                {
                    throw new Exception($"Could not create Scheme Welcome Letter: {uri}");
                }
            }

            if (!termsAndConditionsExists)
            {
                var uri = await GetSsrsUri($"RMAFuneralPolicyGroupTermsAndConditions.pdf");
                var termsAndConditions = await GetUriDocumentByteData(uri, _headerCollection);
                if (termsAndConditions?.Length > 0)
                {
                    await SavePolicyDocument(policy.PolicyNumber, "TermsAndConditions.pdf", termsAndConditions, DocumentSetEnum.PolicyDocumentsgroup, DocumentTypeEnum.TermsConditions);
                }
                else
                {
                    throw new Exception($"Could not create Scheme Terms and Conditions: {uri}");
                }
            }
        }

        private async Task CreatePolicyDocumentsForGroupIndividual(PolicyModel policy, bool forcePolicyScheduleRefresh)
        {
            Contract.Requires(policy != null);
            var policyScheduleExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.PolicySchedule);
            var welcomeLetterExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.WelcomeLetter);
            var termsAndConditionsExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.TermsConditions);

            var password = policy.PolicyOwner?.Person?.IdNumber ?? policy.PolicyNumber;

            var policyIdentifier = policy.PolicyOwner?.Person != null
                                ? $"{policy.PolicyOwner?.Person?.FirstName}-{policy.PolicyOwner?.Person?.Surname}-{policy.PolicyNumber}"
                                : policy.PolicyNumber;

            if (!policyScheduleExists || forcePolicyScheduleRefresh)
            {
                _parameters = $"&policyId={policy.PolicyId}&counter=1&rs:Command=ClearSession";
                var uri = await GetSsrsUri($"RMAGroupPolicyMemberCertificate{_parameters}&rs:Format=PDF");
                var membershipCertificate = await GetUriDocumentByteData(uri, _headerCollection);
                if (membershipCertificate?.Length > 0)
                {
                    var document = await GetEncryptedFile(password, membershipCertificate);
                    await SavePolicyDocument(policy.PolicyNumber, $"PolicySchedule-{policyIdentifier}.pdf", document.encryptedDocumentBytes, DocumentSetEnum.PolicyDocumentsindividual, DocumentTypeEnum.PolicySchedule);
                }
                else
                {
                    throw new Exception($"Could not create Group Child Policy Schedule: {uri}");
                }
            }

            if (!welcomeLetterExists)
            {
                _parameters = $"&policyId={policy.PolicyId}&rs:Command=ClearSession";
                var uri = await GetSsrsUri($"RMAFuneralWelcomeLetter{_parameters}&rs:Format=PDF");
                var welcomeLetter = await GetUriDocumentByteData(uri, _headerCollection);
                if (welcomeLetter?.Length > 0)
                {
                    var document = await GetEncryptedFile(password, welcomeLetter);
                    await SavePolicyDocument(policy.PolicyNumber, "WelcomeLetter.pdf", document.encryptedDocumentBytes, DocumentSetEnum.PolicyDocuments, DocumentTypeEnum.WelcomeLetter);
                }
                else
                {
                    throw new Exception($"Could not create Group Child Policy Welcome Letter: {uri}");
                }
            }

            if (!termsAndConditionsExists)
            {
                var uri = await GetSsrsUri($"RMAFuneralCoverTermsAndConditions.pdf");
                var termsAndConditions = await GetUriDocumentByteData(uri, _headerCollection);
                if (termsAndConditions.Length > 0)
                {
                    await SavePolicyDocument(policy.PolicyNumber, "TermsAndConditions.pdf", termsAndConditions, DocumentSetEnum.PolicyDocuments, DocumentTypeEnum.TermsConditions);
                }
                else
                {
                    throw new Exception($"Could not create Group Child Policy Terms and Conditions: {uri}");
                }
            }
        }

        private async Task CreatePolicyDocumentsForIndividual(PolicyModel policy, bool forcePolicyScheduleRefresh)
        {
            Contract.Requires(policy != null);
            var policyScheduleExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.PolicySchedule);
            var welcomeLetterExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.WelcomeLetter);
            var termsAndConditionsExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.TermsConditions);

            var password = policy.PolicyOwner?.Person?.IdNumber ?? policy.PolicyNumber;

            var policyIdentifier = policy.PolicyOwner?.Person != null
                                ? $"{policy.PolicyOwner?.Person?.FirstName}-{policy.PolicyOwner?.Person?.Surname}-{policy.PolicyNumber}"
                                : policy.PolicyNumber;

            _parameters = $"&policyId={policy.PolicyId}&rs:Command=ClearSession";

            if (!policyScheduleExists || forcePolicyScheduleRefresh)
            {
                var uri = await GetSsrsUri($"RMAFuneralPolicySchedule{_parameters}&rs:Format=PDF");
                var policySchedule = await GetUriDocumentByteData(uri, _headerCollection);
                if (policySchedule?.Length > 0)
                {
                    var document = await GetEncryptedFile(password, policySchedule);
                    await SavePolicyDocument(policy.PolicyNumber, $"PolicySchedule-{policyIdentifier}.pdf", document.encryptedDocumentBytes, DocumentSetEnum.PolicyDocuments, DocumentTypeEnum.PolicySchedule);
                }
                else
                {
                    throw new Exception($"Could not create Individual Policy Schedule: {uri}");
                }
            }

            if (!welcomeLetterExists)
            {
                var uri = await GetSsrsUri($"RMAFuneralWelcomeLetter{_parameters}&rs:Format=PDF");
                var welcomeLetter = await GetUriDocumentByteData(uri, _headerCollection);
                if (welcomeLetter?.Length > 0)
                {
                    var document = await GetEncryptedFile(password, welcomeLetter);
                    await SavePolicyDocument(policy.PolicyNumber, "WelcomeLetter.pdf", document.encryptedDocumentBytes, DocumentSetEnum.PolicyDocuments, DocumentTypeEnum.WelcomeLetter);
                }
                else
                {
                    throw new Exception($"Could not create Individual Welcome Letter: {uri}");
                }
            }

            if (!termsAndConditionsExists)
            {
                var uri = await GetSsrsUri("RMAFuneralCoverTermsAndConditions.pdf");
                var termsAndConditions = await GetUriDocumentByteData(uri, _headerCollection);
                if (termsAndConditions.Length > 0)
                {
                    await SavePolicyDocument(policy.PolicyNumber, "TermsAndConditions.pdf", termsAndConditions, DocumentSetEnum.PolicyDocuments, DocumentTypeEnum.TermsConditions);
                }
                else
                {
                    throw new Exception($"Could not create Individual Terms and Conditions: {uri}");
                }
            }
        }

        private async Task CreatePolicyDocumentsForCFP(PolicyModel policy, bool forcePolicyScheduleRefresh)
        {
            Contract.Requires(policy != null);  
            var policyScheduleExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.PolicySchedule);
            var welcomeLetterExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.WelcomeLetter);
            var termsAndConditionsExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.TermsConditions);

            var password = policy.PolicyOwner?.Person?.IdNumber ?? policy.PolicyNumber;

            var policyIdentifier = policy.PolicyOwner?.Person != null
                                ? $"{policy.PolicyOwner?.Person?.FirstName}-{policy.PolicyOwner?.Person?.Surname}-{policy.PolicyNumber}"
                                : policy.PolicyNumber;

            if (!policyScheduleExists || forcePolicyScheduleRefresh)
            {
                _parameters = $"&policyId={policy.PolicyId}&rs:Command=ClearSession";
                var uri = await GetSsrsUri($"RMACFPPolicySchedule{_parameters}&rs:Format=PDF");
                var policySchedule = await GetUriDocumentByteData(uri, _headerCollection);
                if (policySchedule?.Length > 0)
                {
                    var document = await GetEncryptedFile(password, policySchedule);
                    await SavePolicyDocument(policy.PolicyNumber, $"PolicySchedule-{policyIdentifier}.pdf", document.encryptedDocumentBytes, DocumentSetEnum.PolicyDocuments, DocumentTypeEnum.PolicySchedule);
                }
                else
                {
                    throw new Exception($"Could not create CF Policy Schedule: {uri}");
                }
            }

            if (!welcomeLetterExists)
            {
                _parameters = $"&wizardId={policy.PolicyId}&counter=1&rs:Command=ClearSession";
                var uri = await GetSsrsUri($"RMACFPFuneralGroupWelcomeLetter{_parameters}&rs:Format=PDF");
                var welcomeLetter = await GetUriDocumentByteData(uri, _headerCollection);
                if (welcomeLetter?.Length > 0)
                {
                    var document = await GetEncryptedFile(password, welcomeLetter);
                    await SavePolicyDocument(policy.PolicyNumber, "WelcomeLetter.pdf", document.encryptedDocumentBytes, DocumentSetEnum.PolicyDocuments, DocumentTypeEnum.WelcomeLetter);
                }
                else
                {
                    throw new Exception($"Could not create CFP Welcome Letter: {uri}");
                }
            }

            if (!termsAndConditionsExists)
            {
                var uri = await GetSsrsUri("RMACFPFuneralPolicyGroupTermsAndConditions.pdf");
                var termsAndConditions = await GetUriDocumentByteData(uri, _headerCollection);
                if (termsAndConditions.Length > 0)
                {
                    await SavePolicyDocument(policy.PolicyNumber, "TermsAndConditions.pdf", termsAndConditions, DocumentSetEnum.PolicyDocuments, DocumentTypeEnum.TermsConditions);
                }
                else
                {
                    throw new Exception($"Could not create CFP Terms and Conditions: {uri}");
                }
            }
        }

        private async Task CreatePolicyDocumentsForMedicalAnnuity(PolicyModel policy, bool forcePolicyScheduleRefresh)
        {
            Contract.Requires(policy != null);
            //TODO: Remove these checks, and pass as variables, check from the calling method
            var policyScheduleExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.PolicySchedule);
            var welcomeLetterExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.WelcomeLetter);
            var termsAndConditionsExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.TermsConditions);

            var password = policy.PolicyOwner?.Person?.IdNumber ?? policy.PolicyNumber;

            var policyIdentifier = policy.PolicyOwner?.Person != null
                                ? $"{policy.PolicyOwner?.Person?.FirstName}-{policy.PolicyOwner?.Person?.Surname}-{policy.PolicyNumber}"
                                : policy.PolicyNumber;

            if (!policyScheduleExists || forcePolicyScheduleRefresh)
            {
                _parameters = $"&policyId={policy.PolicyId}&wizardId=0&rs:Command=ClearSession";
                var uri = await GetSsrsUri($"PRMAPolicySchedule{_parameters}&rs:Format=PDF");
                var policySchedule = await GetUriDocumentByteData(uri, _headerCollection);
                if (policySchedule?.Length > 0)
                {
                    var document = await GetEncryptedFile(password, policySchedule);
                    await SavePolicyDocument(policy.PolicyNumber, $"PolicySchedule-{policyIdentifier}.pdf", document.encryptedDocumentBytes, DocumentSetEnum.PolicyDocuments, DocumentTypeEnum.PolicySchedule);
                }
                else
                {
                    throw new Exception($"Could not create PRMA Policy Schedule: {uri}");
                }
            }

            if (!welcomeLetterExists)
            {
                _parameters = $"&policyId={policy.PolicyId}&wizardId=0&rs:Command=ClearSession";
                var uri = await GetSsrsUri($"PRMAWelcomeLetter{_parameters}&rs:Format=PDF");
                var welcomeLetter = await GetUriDocumentByteData(uri, _headerCollection);
                if (welcomeLetter?.Length > 0)
                {
                    var document = await GetEncryptedFile(password, welcomeLetter);
                    await SavePolicyDocument(policy.PolicyNumber, "WelcomeLetter.pdf", document.encryptedDocumentBytes, DocumentSetEnum.PolicyDocuments, DocumentTypeEnum.WelcomeLetter);
                }
                else
                {
                    throw new Exception($"Could not create PRMA Welcome Letter: {uri}");
                }
            }

            if (!termsAndConditionsExists)
            {
                var uri = new Uri("PRMATermsAndConditions.pdf");
                var termsAndConditions = await GetUriDocumentByteData(uri, _headerCollection);
                if (termsAndConditions?.Length > 0)
                {
                    await SavePolicyDocument(policy.PolicyNumber, "TermsAndConditions.pdf", termsAndConditions, DocumentSetEnum.PolicyDocuments, DocumentTypeEnum.TermsConditions);
                }
                else
                {
                    throw new Exception($"Could not create PRMA Terms and Conditions: {uri}");
                }
            }
        }

        private async Task CreatePolicyDocumentsForMVP(PolicyModel policy, bool forcePolicyScheduleRefresh)
        {
            Contract.Requires( policy != null );
            _parameters = $"&policyId={policy.PolicyId}&rs:Command=ClearSession";

            var policyScheduleExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.PolicySchedule);
            var welcomeLetterExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.WelcomeLetter);
            var termsAndConditionsExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.TermsConditions);

            var password = policy.PolicyOwner?.Person?.IdNumber ?? policy.PolicyNumber;

            var policyIdentifier = policy.PolicyOwner?.Person != null
                                ? $"{policy.PolicyOwner?.Person?.FirstName}-{policy.PolicyOwner?.Person?.Surname}-{policy.PolicyNumber}"
                                : policy.PolicyNumber;

            if (!policyScheduleExists || forcePolicyScheduleRefresh)
            {
                var uri = await GetSsrsUri($"RMAMVPPolicySchedule{_parameters}&rs:Format=PDF");
                var policySchedule = await GetUriDocumentByteData(uri, _headerCollection);
                if (policySchedule?.Length > 0)
                {
                    var document = await GetEncryptedFile(password, policySchedule);
                    await SavePolicyDocument(policy.PolicyNumber, $"PolicySchedule-{policyIdentifier}.pdf", document.encryptedDocumentBytes, DocumentSetEnum.PolicyDocuments, DocumentTypeEnum.PolicySchedule);
                }
            }

            if (!welcomeLetterExists)
            {
                var uri = await GetSsrsUri($"RMAMVPWelcomeLetter{_parameters}&rs:Format=PDF");
                var welcomeLetter = await GetUriDocumentByteData(uri, _headerCollection);
                if (welcomeLetter?.Length > 0)
                {
                    var document = await GetEncryptedFile(password, welcomeLetter);
                    await SavePolicyDocument(policy.PolicyNumber, "WelcomeLetter.pdf", document.encryptedDocumentBytes, DocumentSetEnum.PolicyDocuments, DocumentTypeEnum.WelcomeLetter);
                }
            }

            if (!termsAndConditionsExists)
            {
                var uri = await GetSsrsUri("MVPLifeTermsAndConditions.pdf");
                var termsAndConditions = await GetUriDocumentByteData(uri, _headerCollection);
                if (termsAndConditions?.Length > 0)
                {
                    await SavePolicyDocument(policy.PolicyNumber, "TermsAndConditions.pdf", termsAndConditions, DocumentSetEnum.PolicyDocuments, DocumentTypeEnum.TermsConditions);
                }
            }
        }

        private async Task CreatePolicyDocumentsForProductOption(PolicyModel policy)
        {
            Contract.Requires(policy != null);
            var policyScheduleExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.PolicySchedule);
            var welcomeLetterExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.WelcomeLetter);
            var termsAndConditionsExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.TermsConditions);

            var password = policy.PolicyNumber;

            var policyIdentifier = policy.PolicyOwner?.Person != null
                                ? $"{policy.PolicyOwner?.Person?.FirstName}-{policy.PolicyOwner?.Person?.Surname}-{policy.PolicyNumber}"
                                : policy.PolicyNumber;

            var policyScheduleName = policy.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.PolicyScheduler)?.FirstOrDefault()?.Value;
            var welcomeLetterName = policy.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.WelcomeLetter)?.FirstOrDefault()?.Value;
            var termsAndConditionsName = policy.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.TermsAndConditions)?.FirstOrDefault()?.Value;
            _parameters = $"&policyId={policy.PolicyId}&rs:Command=ClearSession";

            if (!policyScheduleExists && !string.IsNullOrEmpty(policyScheduleName))
            {
                var uri = await GetSsrsUri($"{policyScheduleName}{_parameters}&rs:Format=PDF");
                var policySchedule = await GetUriDocumentByteData(uri, _headerCollection);
                if (policySchedule?.Length > 0)
                {
                    var document = await GetEncryptedFile(password, policySchedule);
                    await SavePolicyDocument(policy.PolicyNumber, $"PolicySchedule-{policyIdentifier}.pdf", document.encryptedDocumentBytes, DocumentSetEnum.PolicyDocuments, DocumentTypeEnum.PolicySchedule);
                }
                else
                {
                    throw new Exception($"Could not create Policy Schedule: {uri}");
                }
            }

            if (!welcomeLetterExists && !string.IsNullOrEmpty(welcomeLetterName))
            {
                var uri = await GetSsrsUri($"{welcomeLetterName}{_parameters}&rs:Format=PDF");
                var welcomeLetter = await GetUriDocumentByteData(uri, _headerCollection);
                if (welcomeLetter?.Length > 0)
                {
                    var document = await GetEncryptedFile(password, welcomeLetter);
                    await SavePolicyDocument(policy.PolicyNumber, "WelcomeLetter.pdf", document.encryptedDocumentBytes, DocumentSetEnum.PolicyDocuments, DocumentTypeEnum.WelcomeLetter);
                }
                else
                {
                    throw new Exception($"Could not create Welcome Letter: {uri}");
                }
            }

            if (!termsAndConditionsExists && !string.IsNullOrEmpty(termsAndConditionsName))
            {
                var uri = await GetSsrsUri($"{termsAndConditionsName}.pdf");
                var termsAndConditions = await GetUriDocumentByteData(uri, _headerCollection);
                if (termsAndConditions.Length > 0)
                {
                    await SavePolicyDocument(policy.PolicyNumber, "TermsAndConditions.pdf", termsAndConditions, DocumentSetEnum.PolicyDocuments, DocumentTypeEnum.TermsConditions);
                }
                else
                {
                    throw new Exception($"Could not create Terms and Conditions: {uri}");
                }
            }
        }

        private bool IsProductOptionDocumentTemplateConfigured(PolicyModel policy)
        {
            if (policy.ProductOption.ProductOptionSettings == null) return false;

            if (string.IsNullOrEmpty(policy.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.PolicyScheduler)?.FirstOrDefault()?.Value)) return false;
            if (string.IsNullOrEmpty(policy.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.WelcomeLetter)?.FirstOrDefault()?.Value)) return false;
            if (string.IsNullOrEmpty(policy.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.TermsAndConditions)?.FirstOrDefault()?.Value)) return false;

            return true;
        }

        private async Task SavePolicyDocument(string policyNumber, string fileName, byte[] byteDate, DocumentSetEnum documentSet, DocumentTypeEnum documentType)
        {
            await UploadPolicyDocument
            (
                documentType,
                fileName,
                new Dictionary<string, string> { { "CaseCode", policyNumber } },
                "application/pdf",
                documentSet,
                byteDate
            );
        }

        private async Task UploadPolicyDocument(DocumentTypeEnum documentType, string fileName, Dictionary<string, string> keys, string fileExtension, DocumentSetEnum documentSet, byte[] documentBytes)
        {
            var policyDocument = new Document
            {
                DocTypeId = (int)documentType,
                SystemName = "PolicyManager",
                FileName = fileName,
                Keys = keys,
                DocumentStatus = DocumentStatusEnum.Received,
                FileExtension = fileExtension,
                DocumentSet = documentSet,
                FileAsBase64 = Convert.ToBase64String(documentBytes),
                MimeType = MimeMapping.GetMimeMapping(fileName)
            };
            await _documentIndexService.UploadDocument(policyDocument);
        }

        private Task<Uri> GetSsrsUri(string reportUrl)
        {
            if (string.IsNullOrWhiteSpace(_reportServerUrl))
                throw new ArgumentNullException(nameof(_reportServerUrl), "Report server URL is null or empty.");

            if (string.IsNullOrWhiteSpace(_reportEnviroment))
                throw new ArgumentNullException(nameof(_reportEnviroment), "Report environment URL is null or empty.");

            Uri serverUri = new Uri(_reportServerUrl);
            Uri reportUri = new Uri($"{_reportEnviroment}{_reportCategoryUrl}{reportUrl}", UriKind.Relative);
            var uri = new Uri(serverUri, reportUri);
            return Task.FromResult(uri);
        }

        private async Task<byte[]> GetUriDocumentByteData(Uri url, WebHeaderCollection webHeaderCollection = null)
        {
            return await url.GetUriDataAsync(webHeaderCollection);
        }

        private async Task<FileEncryptResponse> GetEncryptedFile(string password, byte[] content)
        {
            var request = new FileEncryptRequest { documentBytes = content };
            var response = await _documentGeneratorService.PasswordProtectPdf(password, password, request);
            return response;
        }

         public async Task CreatePolicyCancellationLetter(PolicyMinimumData policy)
        {
            Contract.Requires(policy != null);
            var cancellationLetterExists = await _documentIndexService.PolicyScheduleDocumentExists(policy.PolicyNumber, DocumentTypeEnum.ConfirmationofCancellation);

            var password = policy.IdNumber ?? policy.PolicyNumber;         

            _parameters = $"&wizardId={0}&policyId={policy.PolicyId}&rs:Command=ClearSession";
            if (!string.IsNullOrEmpty(_parameters))
            {
                var uri = await GetSsrsUri($"RMAFuneralPolicyCancellationLetter{_parameters}&rs:Format=PDF");
                var cancellationLetter = await GetUriDocumentByteData(uri, _headerCollection);
                if (cancellationLetter?.Length > 0)
                {
                    var document = await GetEncryptedFile(password, cancellationLetter);
                    await SavePolicyDocument(policy.PolicyNumber, "PolicyCancellation.pdf", document.encryptedDocumentBytes, DocumentSetEnum.PolicyCancellation, DocumentTypeEnum.ConfirmationofCancellation);
                }
            }
         }
          
    }
}