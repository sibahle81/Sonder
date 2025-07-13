using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.Database.Constants;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.ClientCare.Mappers;

using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using TinyCsvParser;
using TinyCsvParser.Mapping;

using Transaction = RMA.Service.Billing.Contracts.Entities.Transaction;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class PremiumListingFacade : RemotingStatelessService, IPremiumListingService
    {
        private const char commaDelimiter = ',';
        private const char pipeDelimiter = '|';
        private const string childPolicyAllocations = "ChildPolicyAllocations";

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IScheduledTaskService _scheduledTaskService;
        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IRepository<Load_PremiumListing> _premiumListingRepository;
        private readonly IRepository<client_RolePlayer> _rolePlayerRepository;
        private readonly IRepository<Load_PremiumListingError> _premiumListingErrorReposity;
        private readonly IRepository<Load_PremiumListingMessage> _premiumListingMessageRepository;
        private readonly IRepository<Load_PremiumPaymentDueCreditNote> _premiumPaymentDueCreditNoteRepository;
        private readonly IRepository<Load_PremiumListingPaymentFile> _premiumListingPaymentFileRepository;
        private readonly IRepository<Load_PremiumListingPaymentError> _premiumListingPaymentErrorRepository;
        private readonly IRepository<Load_PremiumListingMember> _premiumListingMemberRepository;
        private readonly IRepository<Load_PremiumPaymentFileValidation> _premiumPaymentFileValidationRepository;
        private readonly IRepository<Load_PremiumPaymentFileValidationContent> _premiumPaymentFileValidationContentRepository;
        private readonly IConfigurationService _configurationService;
        private readonly ITransactionService _transactionService;
        private readonly IPolicyCommunicationService _communicationService;
        private readonly IPolicyService _policyService;
        private readonly IOnboardingNotificationService _notificationService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IRepository<client_Person> _personRepository;

        public PremiumListingFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IScheduledTaskService scheduledTaskService,
            IRepository<policy_Policy> policyRepository,
            IRepository<Load_PremiumListing> premiumListingRepository,
            IRepository<client_RolePlayer> rolePlayerRepository,
            IRepository<Load_PremiumListingError> premiumListingErrorReposity,
            IRepository<Load_PremiumListingMessage> premiumListingMessageRepository,
            IRepository<Load_PremiumPaymentDueCreditNote> premiumPaymentDueCreditNoteRepository,
            IRepository<Load_PremiumListingPaymentFile> premiumListingPaymentFileRepository,
            IRepository<Load_PremiumListingPaymentError> premiumListingPaymentErrorRepository,
            IRepository<Load_PremiumListingMember> premiumListingMemberRepository,
            IRepository<Load_PremiumPaymentFileValidation> premiumPaymentFileValidationRepository,
            IRepository<Load_PremiumPaymentFileValidationContent> premiumPaymentFileValidationContentRepository,
            IConfigurationService configurationService,
            ITransactionService transactionService,
            IPolicyCommunicationService communicationService,
            IPolicyService policyService,
            IOnboardingNotificationService notificationService,
            IRolePlayerService rolePlayerService,
            IRepository<client_Person> personRepository
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _policyRepository = policyRepository;
            _premiumListingRepository = premiumListingRepository;
            _rolePlayerRepository = rolePlayerRepository;
            _premiumListingErrorReposity = premiumListingErrorReposity;
            _premiumListingMessageRepository = premiumListingMessageRepository;
            _scheduledTaskService = scheduledTaskService;
            _premiumPaymentDueCreditNoteRepository = premiumPaymentDueCreditNoteRepository;
            _premiumListingPaymentFileRepository = premiumListingPaymentFileRepository;
            _premiumListingPaymentErrorRepository = premiumListingPaymentErrorRepository;
            _premiumListingMemberRepository = premiumListingMemberRepository;
            _premiumPaymentFileValidationRepository = premiumPaymentFileValidationRepository;
            _premiumPaymentFileValidationContentRepository = premiumPaymentFileValidationContentRepository;
            _configurationService = configurationService;
            _transactionService = transactionService;
            _communicationService = communicationService;
            _policyService = policyService;
            _notificationService = notificationService;
            _rolePlayerService = rolePlayerService;
            _personRepository = personRepository;
        }

        public async Task<PolicyMember> GetPolicyMemberDetails(string policyNumber)
        {
            if(string.IsNullOrWhiteSpace(policyNumber)) return null;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policy = await _policyRepository.SingleOrDefaultAsync(s => s.PolicyNumber == policyNumber);
                if (policy == null)
                {
                    return null;
                }

                var rolePlayer = await _rolePlayerRepository.SingleOrDefaultAsync(s => s.RolePlayerId == policy.PolicyOwnerId);
                await _rolePlayerRepository.LoadAsync(rolePlayer, s => s.Person);
                return rolePlayer == null || rolePlayer.EmailAddress == null
                    ? null
                    : new PolicyMember
                    {
                        PolicyId = policy.PolicyId,
                        PolicyNumber = policy.PolicyNumber,
                        RolePlayerId = rolePlayer.RolePlayerId,
                        MemberName = rolePlayer.DisplayName,
                        IdNumber = rolePlayer.Person.IdNumber,
                        EmailAddress = rolePlayer.EmailAddress ?? "",
                        CellPhoneNumber = rolePlayer.CellNumber ?? "",
                        PreferredCommunicationTypeId = rolePlayer.PreferredCommunicationTypeId ?? 1
                    };
            }
        }

        public async Task<List<PolicyMember>> GetGroupOnboardedMemberDetails(Guid fileIdentifier)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyIds = await _premiumListingMemberRepository
                    .Where(s => s.FileIdentifier == fileIdentifier && s.CoverMemberType == CoverMemberTypeEnum.MainMember)
                    .Select(s => s.PolicyId)
                    .Distinct()
                    .ToListAsync();
                var childPolicies = await _policyRepository
                    .Where(p => policyIds.Contains(p.PolicyId))
                    .ToListAsync();

                if (childPolicies?.Count == 0)
                {
                    return new List<PolicyMember>();
                }

                await _policyRepository.LoadAsync(childPolicies, p => p.PolicyOwner);

                return childPolicies
                    .Select(p => new PolicyMember
                    {
                        PolicyId = p.PolicyId,
                        PolicyNumber = p.PolicyNumber,
                        RolePlayerId = p.PolicyOwner.RolePlayerId,
                        MemberName = p.PolicyOwner.DisplayName,
                        EmailAddress = p.PolicyOwner.EmailAddress ?? "",
                        IsEuropAssist = p.IsEuropAssist,
                        CellPhoneNumber = p.PolicyOwner.CellNumber ?? "",
                        PreferredCommunicationTypeId = p.PolicyOwner.PreferredCommunicationTypeId ?? 1
                    })
                    .ToList();
            }
        }

        public async Task<List<PolicyMember>> GetGroupPolicyMemberDetails(int parentPolicyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policy = await _policyRepository.FirstOrDefaultAsync(s => s.PolicyId == parentPolicyId);
                if (policy == null)
                {
                    return new List<PolicyMember>();
                }

                var validPolicyStatuses = new PolicyStatusEnum[] {
                    PolicyStatusEnum.Active,
                    PolicyStatusEnum.Transferred,
                    PolicyStatusEnum.PendingFirstPremium,
                    PolicyStatusEnum.PendingReinstatement,
                    PolicyStatusEnum.PendingContinuation,
                    PolicyStatusEnum.Continued,
                    PolicyStatusEnum.Reinstated
                };

                var childPolicies = await (from p in _policyRepository
                                           join r in _rolePlayerRepository
                                              on p.PolicyOwnerId
                                              equals r.RolePlayerId
                                           where p.ParentPolicyId == parentPolicyId
                                             && validPolicyStatuses.Contains(p.PolicyStatus)
                                           select new PolicyMember
                                           {
                                               PolicyId = p.PolicyId,
                                               PolicyNumber = p.PolicyNumber,
                                               RolePlayerId = r.RolePlayerId,
                                               MemberName = r.DisplayName,
                                               EmailAddress = r.EmailAddress ?? "",
                                               IsEuropAssist = p.IsEuropAssist,
                                               CellPhoneNumber = r.CellNumber ?? "",
                                               PreferredCommunicationTypeId = r.PreferredCommunicationTypeId ?? 1
                                           }
                                ).ToListAsync();
                return childPolicies;
            }
        }

        public async Task<List<int>> GetMemberPolicyIds(int parentPolicyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _policyRepository
                    .Where(s => s.ParentPolicyId == parentPolicyId
                        && (s.PolicyStatus == PolicyStatusEnum.Active
                         || s.PolicyStatus == PolicyStatusEnum.PendingFirstPremium))
                    .ToListAsync();
                var policyIds = data.Select(s => s.PolicyId).ToList();
                return policyIds;
            }
        }

        public async Task<int> GetGroupPolicyId(Guid fileIdentifier)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var premiumListing = await _premiumListingRepository
                    .FirstOrDefaultAsync(s => s.FileIdentifier == fileIdentifier);
                if (premiumListing != null)
                {
                    var policy = await _policyRepository
                        .FirstOrDefaultAsync(s => s.PolicyNumber == premiumListing.PolicyNumber);
                    if (policy != null)
                    {
                        return policy.PolicyId;
                    }
                }
                return -1;
            }
        }

        public async Task<string> GetGroupPolicyNumber(Guid fileIdentifier)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var premiumListing = await _premiumListingRepository
                    .FirstOrDefaultAsync(s => s.FileIdentifier == fileIdentifier);
                return premiumListing == null ? null : premiumListing.PolicyNumber;
            }
        }

        public async Task<int> UploadPremiumPayments(FileContentImport content)
        {
            var childPolicyAllocationsStoringFile = await _configurationService.IsFeatureFlagSettingEnabled(childPolicyAllocations);
            if (content == null)
            {
                throw new NullReferenceException("File content cannot be null");
            }
            if (string.IsNullOrEmpty(content.Data))
            {
                throw new NullReferenceException("File content cannot be null");
            }

            var decodedString = Convert.FromBase64String(content.Data);
            var fileData = Encoding.UTF8.GetString(decodedString, 0, decodedString.Length);

            var fileName = string.Empty;

            if (!string.IsNullOrEmpty(content.FileName))
            {
                fileName = content?.FileName;
            }

            const string newLine = "\n";
            var csvParserOptions = new CsvParserOptions(true, commaDelimiter);
            var csvMapper = new PremiumListingPaymentMapping();
            var csvParser = new CsvParser<Load_PremiumListingPayment>(csvParserOptions, csvMapper);
            var csvReaderOptions = new CsvReaderOptions(new[] { newLine });
            var records = csvParser.ReadFromString(csvReaderOptions, fileData).ToList();

            var rowNumber = 1;
            var fileIdentifier = Guid.NewGuid();
            var payments = new List<Load_PremiumListingPayment>();

            var totalFileAmount = 0m;
            if (childPolicyAllocationsStoringFile)
            {
                await SavePaymentFileDetails(fileIdentifier, fileName);
            }
            foreach (var record in records)
            {
                if (!record.IsValid)
                {
                    var line = record.Error.UnmappedRow;
                    var message = GetValidationMessage(line, rowNumber, record.Error);
                    throw new Exception(message);
                }

                totalFileAmount += Convert.ToDecimal(record.Result?.PaymentAmount);
                var premiumPayment = record.Result;
                premiumPayment.FileIdentifier = fileIdentifier;
                payments.Add(premiumPayment);
                rowNumber++;
            }

            await ImportPayments(payments);
            await ImportPremiumListingPayments(fileIdentifier);
            return records.Count;
        }

        public async Task<int> ValidatePaymentFile(FileContentImport content)
        {
            var fileIdentifier = Guid.NewGuid();

            if (content == null)
            {
                throw new NullReferenceException("File content cannot be null");
            }
            if (string.IsNullOrEmpty(content.Data))
            {
                throw new NullReferenceException("File content cannot be null");
            }

            var decodedString = Convert.FromBase64String(content.Data);
            var fileData = Encoding.UTF8.GetString(decodedString, 0, decodedString.Length);

            var fileName = string.Empty;

            if (!string.IsNullOrEmpty(content.FileName))
            {
                fileName = content?.FileName;
            }

            const string newLine = "\n";
            var csvParserOptions = new CsvParserOptions(true, commaDelimiter);
            var csvMapper = new ValidatePaymentFilesMapping();
            var csvParser = new CsvParser<Load_PremiumPaymentFileValidationContent>(csvParserOptions, csvMapper);
            var csvReaderOptions = new CsvReaderOptions(new[] { newLine });
            var records = csvParser.ReadFromString(csvReaderOptions, fileData).ToList();

            var rowNumber = 1;

            var payments = new List<Load_PremiumPaymentFileValidationContent>();

            var totalFileAmount = 0m;
            var savedFile = await SaveFileDetails(fileName, fileIdentifier);
            foreach (var record in records.Where(c => !string.IsNullOrEmpty(c.Result.GroupPolicyNumber)))
            {
                if (!record.IsValid)
                {
                    var line = record.Error.UnmappedRow;
                    var message = GetValidationMessage(line, rowNumber, record.Error);
                    throw new Exception(message);
                }
                if (Convert.ToDecimal(record.Result?.PaymentAmount, CultureInfo.InvariantCulture) > 0)
                    totalFileAmount += Convert.ToDecimal(record.Result?.PaymentAmount, CultureInfo.InvariantCulture);

                var premiumPayment = record.Result;
                payments.Add(premiumPayment);
                rowNumber++;
            }
            await ImportFileContent(payments, savedFile.FileId, fileIdentifier);
            await ValidatePremiumListingPayments(fileIdentifier);
            return savedFile.FileId;
        }

        private string GetValidationMessage(string line, int rowNumber, CsvMappingError error)
        {
            var values = line.Split(new char[] { commaDelimiter });
            if (values.Length == 1 && line.IndexOf(pipeDelimiter) >= 0)
            {
                values = line.Split(new char[] { pipeDelimiter });
            }
            if (values.Length == 1)
            {
                return "Invalid file delimiter found. Please check file structure";
            }
            else if (values.Length != 6)
            {
                return $"All the required data has not been supplied on line {rowNumber}.";
            }
            return $"Error on line {rowNumber} column {error.ColumnIndex}: {error.Value}";
        }

        private async Task<int> ImportPremiumListingPayments(Guid fileIdentifier)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var fileIdentifierParameter = new SqlParameter { ParameterName = "@fileIdentifier", Value = fileIdentifier };
                var userIdParameter = new SqlParameter { ParameterName = "@userId", Value = !string.IsNullOrEmpty(RmaIdentity.Email) ? RmaIdentity.Email : RmaIdentity.ClientId };
                const string procedure = "[Load].[ImportPremiumListingPaymentsNoValidations] @fileIdentifier, @userId";
                var count = await _premiumListingPaymentFileRepository.SqlQueryAsync<int>(procedure, fileIdentifierParameter, userIdParameter);
                return count[0];
            }
        }

        public async Task ProcessPendingPremiumListingPaymentFiles()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                const string procedure = "[Load].[ImportPendingPremiumListingPayments]";
                await _policyRepository.SqlQueryAsync<int>(procedure);
            }
        }


        private async Task<int> ImportPayments(List<Load_PremiumListingPayment> payments)
        {
            if (payments?.Count > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    try
                    {
                        string sql;
                        var recordCount = 0;
                        const int importCount = 1000;
                        while (payments.Count > 0)
                        {
                            var count = payments.Count >= importCount ? importCount : payments.Count;
                            var records = payments.GetRange(0, count);
                            sql = GetPremiumListingPaymentSql(records);
                            await _policyRepository.ExecuteSqlCommandAsync(sql);
                            payments.RemoveRange(0, count);
                            recordCount += count;
                        }
                        return recordCount;
                    }
                    catch (Exception ex)
                    {
                        ex.LogException(ex.Message);
                        return 0;
                    }
                }
            }
            return 0;
        }

        private async Task<int> ImportFileContent(List<Load_PremiumPaymentFileValidationContent> payments, int fileId, Guid fileIdentifier)
        {
            if (payments?.Count > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    try
                    {
                        string sql;
                        var recordCount = 0;
                        const int importCount = 1000;
                        while (payments.Count > 0)
                        {
                            var count = payments.Count >= importCount ? importCount : payments.Count;
                            var records = payments.GetRange(0, count);
                            sql = GetValidatePaymentsFileSql(records, fileId, fileIdentifier);
                            await _premiumPaymentFileValidationContentRepository.ExecuteSqlCommandAsync(sql);
                            payments.RemoveRange(0, count);
                            recordCount += count;
                        }
                        return recordCount;
                    }
                    catch (Exception ex)
                    {
                        ex.LogException(ex.Message);
                        return 0;
                    }
                }
            }
            return 0;
        }

        private string GetPremiumListingPaymentSql(List<Load_PremiumListingPayment> records)
        {
            var sbQuery = new StringBuilder();
            var sql = "INSERT INTO [Load].[PremiumListingPayment] ([FileIdentifier],[Company],[GroupPolicyNumber],[MemberPolicyNumber],[MemberIdNumber],[PaymentDate],[PaymentAmount]) values";
            sbQuery.Append(sql);
            foreach (var rec in records)
            {
                var valuesQuery = string.Format("('{0}',{1},{2},{3},{4},{5},{6}),",
                    rec.FileIdentifier,
                    SetLength(rec.Company, 256).Quoted(),
                    SetLength(rec.GroupPolicyNumber, 64).Quoted(),
                    SetLength(rec.MemberPolicyNumber, 64).Quoted(),
                    SetLength(rec.MemberIdNumber, 32).Quoted(),
                    SetLength(rec.PaymentDate, 32).Quoted(),
                    SetLength(rec.PaymentAmount, 32).Quoted()
                );
                sbQuery.Append(valuesQuery);
            }
            return sbQuery.ToString().TrimEnd(new char[] { ',' });
        }

        private string GetValidatePaymentsFileSql(List<Load_PremiumPaymentFileValidationContent> records, int fileId, Guid fileIdentifier)
        {
            var sbQuery = new StringBuilder();
            var sql = "INSERT INTO [Load].[PremiumPaymentFileValidationContent] ([FileId],[Company],[GroupPolicyNumber],[MemberIdNumber],[PaymentDate],[PaymentAmount],FileIdentifier, MemberNumber) values";
            sbQuery.Append(sql);
            foreach (var rec in records)
            {
                var valuesQuery = string.Format("({0},{1},{2},{3},{4},{5},'{6}',{7}),",
                    fileId,
                    SetLength(rec.Company, 256).Quoted(),
                    SetLength(rec.GroupPolicyNumber, 64).Quoted(),
                    SetLength(rec.MemberIdNumber, 32).Quoted(),
                    SetLength(rec.PaymentDate, 32).Quoted(),
                    SetLength(rec.PaymentAmount, 32).Quoted(),
                    fileIdentifier,
                    SetLength(rec.Name, 32).Quoted()

                );
                sbQuery.Append(valuesQuery);
            }
            return sbQuery.ToString().TrimEnd(new char[] { ',' });
        }

        private string SetLength(string value, int len)
        {
            value = value.Trim();
            return value.Length > len ? value.Substring(0, len) : value;
        }

        public async Task<ImportInsuredLivesSummary> ImportGroupPolicyMembers(ImportInsuredLivesRequest importRequest)
        {
            Contract.Requires(importRequest != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var fileIdentifierParameter = new SqlParameter { ParameterName = "@fileIdentifier", Value = importRequest?.FileIdentifier };
                var saveInsuredLivesParameter = new SqlParameter { ParameterName = "@saveInsuredLives", Value = importRequest?.SaveInsuredLives == true ? 1 : 0 };
                var procedure = "";
                switch (importRequest?.Version)
                {
                    case 1:
                        procedure = "[policy].[ImportInsuredLives] @fileIdentifier, @saveInsuredLives";
                        break;
                    case 2:
                        procedure = "[policy].[ImportPremiumListing] @fileIdentifier, @saveInsuredLives";
                        break;
                    default:
                        throw new BusinessException($"Premium listing version {importRequest?.Version} does not exist.");
                }
                var summary = await _policyRepository
                    .SqlQueryAsync<ImportInsuredLivesSummary>(
                        procedure,
                        fileIdentifierParameter,
                        saveInsuredLivesParameter
                );
                return summary[0];
            }
        }

        public async Task<ImportInsuredLivesSummary> ImportGroupPolicy(string wizardName, ImportInsuredLivesRequest importRequest)
        {
            Contract.Requires(importRequest != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (!importRequest.SaveInsuredLives)
                {
                    // Clear errors and messages for the import
                    await _policyRepository
                       .ExecuteSqlCommandAsync(
                           "[Load].[SetupPremiumListingImport] @fileIdentifier",
                           new SqlParameter { ParameterName = "@fileIdentifier", Value = importRequest.FileIdentifier }
                       );
                    // Add company and benefit details
                    await _policyRepository
                        .ExecuteSqlCommandAsync(
                            "[Load].[ImportPremiumListingCompany] @fileIdentifier, @userId",
                            new SqlParameter { ParameterName = "@fileIdentifier", Value = importRequest.FileIdentifier },
                            new SqlParameter { ParameterName = "@userId", Value = RmaIdentity.Email }
                        );
                    // Load group policy members (this only takes a couple of seconds, even for large files)
                    await _policyRepository
                        .ExecuteSqlCommandAsync(
                            "[Load].[InsertPremiumListingMembers] @fileIdentifier",
                            new SqlParameter { ParameterName = "@fileIdentifier", Value = importRequest.FileIdentifier }
                        );
                    // Calculate dob's from id numbers, age, join age, existing roleplayers and policy id's
                    await _policyRepository
                        .ExecuteSqlCommandAsync(
                            "[Load].[UpdatePremiumListingMembers] @fileIdentifier, @createNewPolicies",
                            new SqlParameter { ParameterName = "@fileIdentifier", Value = importRequest.FileIdentifier },
                            new SqlParameter { ParameterName = "@createNewPolicies", Value = importRequest.CreateNewPolicies ? 1 : 0 }
                        );
                    // Run validations.
                    await _policyRepository
                        .ExecuteSqlCommandAsync(
                            "[Load].[ValidatePremiumListing] @fileIdentifier",
                            new SqlParameter { ParameterName = "@fileIdentifier", Value = importRequest.FileIdentifier }
                        );
                    // Get the import summary 
                    return await GetPremiumListingImportSummary(importRequest.FileIdentifier);
                }
                else
                {
                    // Import the group policy members from the file
                    var parentPolicyId = await _policyRepository
                        .SqlQueryAsync<int>(
                            "[Load].[ImportPremiumListingMembers] @fileIdentifier, @userId",
                            new SqlParameter { ParameterName = "@fileIdentifier", Value = importRequest.FileIdentifier },
                            new SqlParameter { ParameterName = "@userId", Value = RmaIdentity.Email }
                        );
                    // Update parent policy premiums
                    await _policyRepository
                        .ExecuteSqlCommandAsync(
                            "[policy].[UpdateChildPolicyPremiums] @policyId, @userId",
                                new SqlParameter { ParameterName = "@policyId", Value = parentPolicyId[0] },
                                new SqlParameter { ParameterName = "@userId", Value = RmaIdentity.Email }
                        );

                    // Send policy documents
                    _ = Task.Run(() => SendPolicyDocuments(parentPolicyId[0], importRequest));

                    // Send list of imported policies to business
                    await _notificationService.SendPremiumListingNewPolicyNotification(wizardName, new Guid(importRequest.FileIdentifier));

                    // Get the import summary 
                    return await GetPremiumListingImportSummary(importRequest.FileIdentifier);
                }
            }
        }

        private async Task<int> SendPolicyDocuments(int parentPolicyId, ImportInsuredLivesRequest importRequest)
        {
            Contract.Requires( importRequest != null );
            using (_dbContextScopeFactory.CreateReadOnly(DbContextScopeOption.ForceCreateNew))
            {
                try
                {
                    var count = 0;
                    // Send group policy schedule to parent policy holder
                    var parentPolicy = await _policyService.GetPolicy(parentPolicyId);
                    var parentPolicyMember = await GetPolicyMemberDetails(parentPolicy.PolicyNumber);
                    await _communicationService.SendGroupSchemePolicyDocuments(
                        parentPolicy,
                        parentPolicyId,
                        parentPolicyMember.PolicyNumber,
                        parentPolicyMember.MemberName,
                        parentPolicyMember.EmailAddress,
                        false,
                        true,
                        false
                       );

                    // Send membership certificates to each member who was updated from this onboarding file
                    var fileIdentifier = Guid.Parse(importRequest.FileIdentifier);
                    var members = await _premiumListingMemberRepository
                        .Where(p => p.FileIdentifier == fileIdentifier
                                 && p.CoverMemberType == CoverMemberTypeEnum.MainMember)
                        .ToListAsync();
                    foreach (var member in members)
                    {
                        if (member.PreferredCommunication.HasValue)
                        {
                            var policy = await _policyService.GetPolicy(member.PolicyId);
                            var policyMember = await GetPolicyMemberDetails(policy.PolicyNumber);
                            var communicationType = (CommunicationTypeEnum)member.PreferredCommunication.Value;
                            switch (communicationType)
                            {
                                case CommunicationTypeEnum.Email:
                                    if (policyMember.EmailAddress.IsValidEmail())
                                    {
                                        await _communicationService.SendPremiumListingGroupPolicyMemberPolicyDocuments(
                                            policy,
                                            policy.PolicyId,
                                            policy.PolicyNumber,
                                            policyMember.MemberName,
                                            policyMember.IdNumber,
                                            policyMember.EmailAddress,
                                            false,
                                            !member.PolicyExists,
                                            true,
                                            !member.PolicyExists
                                        );
                                        count++;
                                    }
                                    break;
                                case CommunicationTypeEnum.SMS:
                                    if (StringExtensions.IsValidPhone(policyMember.CellPhoneNumber))
                                    {
                                        await _communicationService.SendPremiumListingPolicyScheduleBySms(policy, policyMember);
                                        count++;
                                    }
                                    break;
                            }
                        }
                    }
                    return count;
                }
                catch (Exception ex)
                {
                    ex.LogException("Premium Listing Documentation Send Error");
                    throw;
                }
            }
        }

        private async Task CreatePremiumListingPolicyScheduleWizard(int wizardId, string userId)
        {
            await _policyRepository
                .ExecuteSqlCommandAsync(
                    "[bpm].[CreatePremiumListingPolicyScheduleWizard] @wizardId, @userId",
                        new SqlParameter { ParameterName = "@wizardId", Value = wizardId },
                        new SqlParameter { ParameterName = "@userId", Value = userId }
                );
        }

        private async Task<ImportInsuredLivesSummary> GetPremiumListingImportSummary(string fileIdentifier)
        {
            var fileIdentifierParameter = new SqlParameter { ParameterName = "@fileIdentifier", Value = fileIdentifier };
            var summary = await _policyRepository
                .SqlQueryAsync<ImportInsuredLivesSummary>(
                    "[Load].[PremiumListingSummary] @fileIdentifier",
                    fileIdentifierParameter
                );
            return summary[0];
        }

        public async Task<string> GetUploadMessage(Guid fileIdentifier)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _premiumListingMessageRepository
                    .FirstOrDefaultAsync(s => s.FileIdentifier == fileIdentifier);
                return data == null ? "No update found." : data.Message;
            }
        }

        public async Task<RuleRequestResult> GetGroupPolicyImportErrors(string fileIdentifier)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var identifier = new Guid(fileIdentifier);
                var data = await _premiumListingErrorReposity
                    .Where(e => e.FileIdentifier == identifier)
                    .OrderBy(e => e.Id)
                    .ToListAsync();
                var errors = Mapper.Map<List<PremiumListingError>>(data);

                var fileErrors = GetRuleResult("File Import Error", errors.Where(e => e.ErrorCategory == "File Import Error").ToList());
                if (fileErrors.Passed)
                {
                    var result = new RuleRequestResult()
                    {
                        OverallSuccess = false,
                        RequestId = Guid.NewGuid(),
                        RuleResults = new List<RuleResult>()
                    };
                    var paymentErrors = GetRuleResult("Payments", errors.Where(e => e.ErrorCategory == "Payments").ToList());
                    if (paymentErrors.MessageList.Count > 0)
                    {
                        result.RuleResults.Add(paymentErrors);
                    }
                    else
                    {
                        // Read the error categories from the onboarding validation errors, because
                        // pre-defined categories limit the dynamic addition of errors in the
                        // [Load].[ValidatePremiumListing] stored procedure
                        var categories = errors.Select(e => e.ErrorCategory).Distinct();
                        foreach (var category in categories)
                        {
                            var list = GetRuleResult(category, errors.Where(e => e.ErrorCategory == category).ToList());
                            result.RuleResults.Add(list);
                        }
                        // If there were no errors, just add a blank rule result indicating this
                        if (result.RuleResults.Count == 0)
                        {
                            var list = GetRuleResult("Group Onboarding Import", new List<PremiumListingError>());
                            result.RuleResults.Add(list);
                        }
                    }
                    result.OverallSuccess = errors.Count == 0;
                    return result;
                }
                else
                {
                    var result = new RuleRequestResult()
                    {
                        OverallSuccess = false,
                        RequestId = Guid.NewGuid(),
                        RuleResults = new List<RuleResult>()
                    };
                    result.RuleResults.Add(fileErrors);
                    return result;
                }
            }
        }

        private RuleResult GetRuleResult(string ruleName, List<PremiumListingError> errors)
        {
            var result = new RuleResult
            {
                RuleName = ruleName,
                Passed = errors.Count == 0,
                MessageList = errors.Select(e => e.ErrorMessage).Distinct().ToList<string>()
            };
            return result;
        }

        public async Task<string> GetMainMemberEmail(int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _policyRepository.FirstOrDefaultAsync(s => s.PolicyId == policyId && s.PolicyStatus == PolicyStatusEnum.Active);

                if (data != null)
                {
                    var mainMemberEmail = await _rolePlayerRepository.FirstOrDefaultAsync(s => s.RolePlayerId == data.PolicyOwnerId);
                    return mainMemberEmail.EmailAddress ?? "Empty Email";
                }
                else
                {
                    return "Empty Data";
                }
            }
        }

        public async Task<int> UploadBulkPaymentListing(int unallocatedPaymentId, FileContentImport content)
        {
            if (content == null)
            {
                throw new NullReferenceException("File content cannot be null");
            }
            if (string.IsNullOrEmpty(content.Data))
            {
                throw new NullReferenceException("File content cannot be null");
            }

            var decodedString = Convert.FromBase64String(content.Data);
            var fileData = Encoding.UTF8.GetString(decodedString, 0, decodedString.Length);

            const string newLine = "\n";
            var csvParserOptions = new CsvParserOptions(true, commaDelimiter);
            var csvMapper = new BulkPaymentListingMapping();
            var csvParser = new CsvParser<Load_BulkPaymentListing>(csvParserOptions, csvMapper);
            var csvReaderOptions = new CsvReaderOptions(new[] { newLine });
            var records = csvParser.ReadFromString(csvReaderOptions, fileData).ToList();

            var rowNumber = 1;
            var fileIdentifier = Guid.NewGuid();
            var payments = new List<Load_BulkPaymentListing>();

            foreach (var record in records)
            {
                if (!record.IsValid)
                {
                    var line = record.Error.UnmappedRow;
                    var message = GetBulkPaymentListingValidationMessage(line, rowNumber, record.Error);
                    throw new Exception(message);
                }
                var premiumPayment = record.Result;
                premiumPayment.FileIdentifier = fileIdentifier;
                premiumPayment.CreatedDate = DateTimeHelper.SaNow;
                payments.Add(premiumPayment);
                rowNumber++;
            }

            await ImportBulkPaymentListing(payments);
            await AllocateBulkPaymentListing(unallocatedPaymentId, fileIdentifier);
            return rowNumber - 1;
        }

        private string GetBulkPaymentListingValidationMessage(string line, int rowNumber, CsvMappingError error)
        {
            var values = line.Split(new char[] { commaDelimiter });
            if (values.Length == 1 && line.IndexOf(pipeDelimiter) >= 0)
            {
                values = line.Split(new char[] { pipeDelimiter });
            }
            if (values.Length == 1)
            {
                return "Invalid file delimiter found. Please check file structure";
            }
            else if (values.Length != 2)
            {
                return $"All the required data has not been supplied on line {rowNumber}.";
            }
            return $"Error on line {rowNumber} column {error.ColumnIndex}: {error.Value}";
        }

        private async Task<int> ImportBulkPaymentListing(List<Load_BulkPaymentListing> payments)
        {
            if (payments?.Count > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    try
                    {
                        string sql;
                        var recordCount = 0;
                        const int importCount = 1000;
                        while (payments.Count > 0)
                        {
                            var count = payments.Count >= importCount ? importCount : payments.Count;
                            var records = payments.GetRange(0, count);
                            sql = GetBulkPaymentListingSql(records);
                            await _policyRepository.ExecuteSqlCommandAsync(sql);
                            payments.RemoveRange(0, count);
                            recordCount += count;
                        }
                        return recordCount;
                    }
                    catch (Exception ex)
                    {
                        ex.LogException(ex.Message);
                        return 0;
                    }
                }
            }
            return 0;
        }

        private string GetBulkPaymentListingSql(List<Load_BulkPaymentListing> records)
        {
            var sql = "INSERT INTO [Load].[BulkPaymentListing] ([FileIdentifier],[PolicyNumber],[CreatedDate],[PaymentAmount]) values";
            foreach (var rec in records)
            {
                sql += string.Format("('{0}',{1},{2},{3}),",
                    rec.FileIdentifier,
                    rec.PolicyNumber.Quoted(),
                    rec.CreatedDate.ToSaDateTime().ToShortDateString().Quoted(),
                    rec.PaymentAmount
                );
            }
            return sql.TrimEnd(new char[] { ',' });
        }

        private async Task AllocateBulkPaymentListing(int unallocatedPaymentId, Guid fileIdentifier)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var fileIdentifierParameter = new SqlParameter { ParameterName = "@fileIdentifier", Value = fileIdentifier };
                var userIdParameter = new SqlParameter { ParameterName = "@userId", Value = RmaIdentity.Email };
                var unallocatedPaymentParameter = new SqlParameter { ParameterName = "@unallocatedPaymentId", Value = unallocatedPaymentId };
                const string procedure = "[Load].[AllocateBulkPaymentListing] @fileIdentifier, @userId, @unallocatedPaymentId";
                await _policyRepository.ExecuteSqlCommandAsync(procedure, fileIdentifierParameter, userIdParameter, unallocatedPaymentParameter);
            }
        }

        public Task<int> ValidatePremiumListingFile(FileContentImport content)
        {
            if (content == null)
            {
                throw new NullReferenceException("File content cannot be null");
            }
            if (string.IsNullOrEmpty(content.Data))
            {
                throw new NullReferenceException("File content cannot be null");
            }

            var decodedString = Convert.FromBase64String(content.Data);
            var fileData = Encoding.UTF8.GetString(decodedString, 0, decodedString.Length);

            const string newLine = "\n";
            var csvParserOptions = new CsvParserOptions(true, commaDelimiter);
            var csvMapper = new PremiumListingPaymentMapping();
            var csvParser = new CsvParser<Load_PremiumListingPayment>(csvParserOptions, csvMapper);
            var csvReaderOptions = new CsvReaderOptions(new[] { newLine });
            var records = csvParser.ReadFromString(csvReaderOptions, fileData).ToList();

            var rowNumber = 1;
            var fileIdentifier = Guid.NewGuid();
            var payments = new List<Load_PremiumListingPayment>();

            foreach (var record in records)
            {
                if (!record.IsValid)
                {
                    var line = record.Error.UnmappedRow;
                    var message = GetValidationMessage(line, rowNumber, record.Error);
                    throw new Exception(message);
                }
            }
            return Task.FromResult(1);
        }

        private async Task<decimal> GeRaisedPremiumListingTotalByMonth(string parentPolicyNumber, DateTime invoiceDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var parentPolicyNumberParameter = new SqlParameter { ParameterName = "@parentPolicyNumber", Value = parentPolicyNumber };
                var invoiceDateParameter = new SqlParameter { ParameterName = "@invoiceDate", Value = invoiceDate };

                var amounts = await _policyRepository.SqlQueryAsync<decimal?>(Database.Constants.DatabaseConstants.GeRaisedPremiumListingTotalByMonth, parentPolicyNumberParameter, invoiceDateParameter);
                return amounts[0].HasValue ? (decimal)amounts[0] : 0;
            }
        }


        private async Task ResetPremiumPaymentsScheduledTask()
        {
            try
            {
                var scheduledTasks = await _scheduledTaskService.ScheduledTasks();
                var scheduledTaskName = ConfiguredScheduledTasksEnum.ProcessPremiumPaymentFiles.DisplayAttributeValue();
                var scheduledTask = scheduledTasks.FirstOrDefault(s => s.ScheduledTaskType.Description == scheduledTaskName);
                if (scheduledTask != null)
                {
                    var scheduleId = scheduledTask.ScheduledTaskId;
                    _ = await _scheduledTaskService.ResetToCurrentDateAndTime(scheduleId);
                }
            }
            catch (Exception ex)
            {
                ex.LogException("No scheduler configured to process premium payment files");
            }
        }

        private async Task ResetPremiumCreditNotesScheduledTask()
        {
            try
            {
                var scheduledTasks = await _scheduledTaskService.ScheduledTasks();
                var scheduledTaskName = ConfiguredScheduledTasksEnum.CreatePremiumPaymentCreditNotes.DisplayAttributeValue();
                var scheduledTask = scheduledTasks.FirstOrDefault(s => s.ScheduledTaskType.Description == scheduledTaskName);
                if (scheduledTask != null)
                {
                    var scheduleId = scheduledTask.ScheduledTaskId;
                    _ = await _scheduledTaskService.ResetToCurrentDateAndTime(scheduleId);
                }
            }
            catch (Exception ex)
            {
                ex.LogException("No scheduler configured to Queue pending premium payment credit notes");
            }
        }

        private async Task<Load_PremiumListingPaymentFile> SavePaymentFileDetails(Guid fileIdentifier, string fileName)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var file = new Load_PremiumListingPaymentFile
                {
                    FileIdentifier = fileIdentifier,
                    FileName = fileName,
                    IsDeleted = false,
                    FileProcessingStatusId = (int?)UploadedFileProcessingStatusEnum.Pending
                };
                var created = _premiumListingPaymentFileRepository.Create(file);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return created;
            }
        }

        private async Task<Load_PremiumListingPaymentFile> SavePremiumPaymentLinkedFileDetails(Guid fileIdentifier, string fileName, int linkedTransactionId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var file = new Load_PremiumListingPaymentFile
                {
                    FileIdentifier = fileIdentifier,
                    FileName = fileName,
                    IsDeleted = false,
                    FileProcessingStatusId = (int?)UploadedFileProcessingStatusEnum.Pending,
                    LinkedTransactionId = linkedTransactionId

                };
                var created = _premiumListingPaymentFileRepository.Create(file);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return created;
            }
        }

        private async Task<Load_PremiumPaymentFileValidation> SaveFileDetails(string fileName, Guid fileIdentifier)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var file = new Load_PremiumPaymentFileValidation
                {
                    FileName = fileName,
                    IsDeleted = false,
                    ProcessStatusId = (int?)UploadedFileProcessingStatusEnum.Pending,
                    FileIdentifier = fileIdentifier
                };
                var created = _premiumPaymentFileValidationRepository.Create(file);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return created;
            }
        }

        public async Task<List<PremiumListingFile>> GetPremiumListingPaymentFiles(int statusId, DateTime startDate, DateTime endDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var _startDate = startDate.StartOfTheDay();
                var _endDate = endDate.EndOfTheDay();

                var querable = _premiumListingPaymentFileRepository.Where(c => !c.IsDeleted);

                if (statusId != 0)
                {
                    querable = querable.Where(c => c.FileProcessingStatusId == statusId);
                }
                if (_endDate.Year != 2999)
                {
                    querable = querable.Where(c => c.CreatedDate >= _startDate && c.CreatedDate <= _endDate);
                }
                var results = await querable.ToListAsync();
                return Mapper.Map<List<PremiumListingFile>>(results);
            }
        }

        public async Task<List<PremiumPaymentException>> GetPremiumListingPaymentErrors(Guid fileIdentifier)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var fileIdentifierParameter = new SqlParameter { ParameterName = "@fileIdentifier", Value = fileIdentifier };
                const string procedure = DatabaseConstants.GetPremiumListingPaymentErrors;
                var results = await _policyRepository.SqlQueryAsync<PremiumPaymentException>(procedure, fileIdentifierParameter);
                return results;
            }
        }

        private async Task<int> ValidatePremiumListingPayments(Guid fileIdentifier)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var fileIdentifierParameter = new SqlParameter { ParameterName = "@fileIdentifier", Value = fileIdentifier };
                var userIdParameter = new SqlParameter { ParameterName = "@userId", Value = RmaIdentity.Email };
                const string procedure = "[Load].[ValidatePremiumListingPayments] @fileIdentifier, @userId";
                var count = await _premiumPaymentFileValidationContentRepository.SqlQueryAsync<int>(procedure, fileIdentifierParameter, userIdParameter);
                return count[0];
            }
        }

        public async Task<int> ReverseLastPremiumPayments(int linkedTransactionId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var transactionParameter = new SqlParameter { ParameterName = "@linkedTransactionId", Value = linkedTransactionId };
                var userIdParameter = new SqlParameter { ParameterName = "@userId", Value = RmaIdentity.Email };
                const string procedure = "[billing].[ReversePremiumListingPayments] @linkedTransactionId, @userId";
                var count = await _premiumPaymentFileValidationContentRepository.SqlQueryAsync<int>(procedure, transactionParameter, userIdParameter);
                return count[0];
            }
        }

        public async Task<int> UploadPremiumPaymentsWithFileLinking(FileImportPremiumPayementModel content)
        {
            if (content == null)
            {
                throw new NullReferenceException("File content cannot be null");
            }
            if (string.IsNullOrEmpty(content.Data))
            {
                throw new NullReferenceException("File content cannot be null");
            }

            var decodedString = Convert.FromBase64String(content.Data);
            var fileData = Encoding.UTF8.GetString(decodedString, 0, decodedString.Length);

            var fileName = string.Empty;

            if (!string.IsNullOrEmpty(content.FileName))
            {
                fileName = content?.FileName;
            }

            const string newLine = "\n";
            var csvParserOptions = new CsvParserOptions(true, commaDelimiter);
            var csvMapper = new PremiumListingPaymentMapping();
            var csvParser = new CsvParser<Load_PremiumListingPayment>(csvParserOptions, csvMapper);
            var csvReaderOptions = new CsvReaderOptions(new[] { newLine });
            var records = csvParser.ReadFromString(csvReaderOptions, fileData).ToList();

            var rowNumber = 1;
            var fileIdentifier = Guid.NewGuid();
            var linkedTransactionId = 0;
            var payments = new List<Load_PremiumListingPayment>();

            if (content.TransactionLinkedId.HasValue)
            {
                linkedTransactionId = (int)content.TransactionLinkedId;
            }

            var totalFileAmount = 0m;
            _ = await SavePremiumPaymentLinkedFileDetails(fileIdentifier, fileName, linkedTransactionId);
            foreach (var record in records.Where(c => !string.IsNullOrEmpty(c.Result.PaymentAmount)))
            {
                if (!record.IsValid)
                {
                    var line = record.Error.UnmappedRow;
                    var message = GetValidationMessage(line, rowNumber, record.Error);
                    throw new Exception(message);
                }

                totalFileAmount += Convert.ToDecimal(record.Result?.PaymentAmount, CultureInfo.InvariantCulture);
                var premiumPayment = record.Result;
                premiumPayment.FileIdentifier = fileIdentifier;
                payments.Add(premiumPayment);
                rowNumber++;
            }

            var debtorTransaction = await _transactionService.GetTransaction(linkedTransactionId);

            if (totalFileAmount > debtorTransaction.Amount)
            {
                throw new Exception("Premium listing payment allocation total amount cannot exceed the debtor transaction amount.");
            }

            await ImportPayments(payments);
            var processed = await ImportPremiumListingPayments(fileIdentifier);
            var percentageProcessed = (int)((processed / records.Count) * 100);
            return percentageProcessed;
        }

        public async Task<PagedRequestResult<PremiumListingMember>> GetPremiumListingMembers(PagedRequest pagedRequest)
        {
            Contract.Requires(pagedRequest != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _policyRepository
                   .SqlQueryAsync<PremiumListingMember>(
                       "[Load].[GetPremiumListingMembers] @fileIdentifier, @pageSize, @page",
                       new SqlParameter { ParameterName = "@fileIdentifier", Value = new Guid(pagedRequest.SearchCriteria) },
                       new SqlParameter { ParameterName = "@pageSize", Value = pagedRequest.PageSize },
                       new SqlParameter { ParameterName = "@page", Value = pagedRequest.Page }
                   );

                var records = data.Count > 0 ? data[0].Records : 0;
                var pages = (int)Math.Ceiling((decimal)records / (decimal)pagedRequest.PageSize);

                return new PagedRequestResult<PremiumListingMember>()
                {
                    Page = pagedRequest.Page,
                    PageCount = pages,
                    RowCount = records,
                    PageSize = pagedRequest.PageSize,
                    Data = data
                };
            }
        }

        private async Task<Transaction> GetCreditTransactionForRolePlayer(int rolePlayerId, double schemeTotalPaymentAmount)
        {
            var creditTransactionsForRolePlayer =
                await _transactionService.GetTransactionByRoleplayerIdAndTransactionType(
                   rolePlayerId, TransactionTypeEnum.Payment);

            if (creditTransactionsForRolePlayer.Count == 0)
            {
                return null;
            }

            var possibleCreditTransactionsForAllocation = new List<Transaction>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                foreach (var creditTransactionForRolePlayer in creditTransactionsForRolePlayer)
                {
                    var totalAmountPaidFromCreditTransaction = await _transactionService.GetTotalAmountPaidToPremiumListingByTransactionId(creditTransactionForRolePlayer.TransactionId);
                    var paymentBalance = decimal.ToDouble(creditTransactionForRolePlayer.Amount) - decimal.ToDouble(totalAmountPaidFromCreditTransaction);

                    if (schemeTotalPaymentAmount <= paymentBalance)
                    {
                        possibleCreditTransactionsForAllocation.Add(creditTransactionForRolePlayer);
                    }
                }
            }

            if (possibleCreditTransactionsForAllocation.Count == 0)
            {
                return null;
            }

            possibleCreditTransactionsForAllocation = possibleCreditTransactionsForAllocation.OrderByDescending(x => x.Amount).ThenByDescending(x => x.TransactionDate).ToList();
            var closestCreditTransactionForRolePlayer = possibleCreditTransactionsForAllocation.FirstOrDefault(x => decimal.ToDouble(x.Amount) <= schemeTotalPaymentAmount);

            if (closestCreditTransactionForRolePlayer == null)
            {
                closestCreditTransactionForRolePlayer = creditTransactionsForRolePlayer.FirstOrDefault();
            }

            return closestCreditTransactionForRolePlayer;
        }

        private async Task<Transaction> GetCreditTransactionForRolePlayer(int transactionId, int rolePlayerId, double schemeTotalPaymentAmount)
        {
            var creditTransactionsForRolePlayer =
                await _transactionService.GetTransactionByRoleplayerIdAndTransactionType(
                   rolePlayerId, TransactionTypeEnum.Payment);

            if (creditTransactionsForRolePlayer.Count == 0)
            {
                return null;
            }

            var selectedCreditTransactionsForRolePlayer = creditTransactionsForRolePlayer.FirstOrDefault(x => x.TransactionId == transactionId);

            if (selectedCreditTransactionsForRolePlayer == null)
            {
                return null;
            }

            var totalAmountPaidFromCreditTransaction = await _transactionService.GetTotalAmountPaidToPremiumListingByTransactionId(selectedCreditTransactionsForRolePlayer.TransactionId);
            var paymentBalance = decimal.ToDouble(selectedCreditTransactionsForRolePlayer.Amount) - decimal.ToDouble(totalAmountPaidFromCreditTransaction);

            if (schemeTotalPaymentAmount <= paymentBalance)
            {
                return selectedCreditTransactionsForRolePlayer;
            }
            else
            {
                return null;
            }
        }

        public async Task<List<PaymentAllocationRecord>> UploadPremiumPaymentsLinking(PaymentAllocationScheme paymentAllocationScheme)
        {

            if (paymentAllocationScheme == null)
            {
                throw new Exception("Premium listing is not provided.");
            }

            if (paymentAllocationScheme.TransactionId == 0)
            {
                throw new Exception("Payment Transaction Id in Premium listing is not provided.");
            }

            if (paymentAllocationScheme.TotalPaymentAmount != paymentAllocationScheme.PaymentAllocationRecords.Sum(x => x.Amount))
            {
                throw new Exception("Premium listing total amount doesn't match scheme total amount provided.");
            }

            var fileIdentifier = Guid.NewGuid();
            var linkedTransactionId = 0;
            var payments = new List<Load_PremiumListingPayment>();

            var rolePlayer = await GetParentPolicyRolePlayer(paymentAllocationScheme?.ParentPolicyNumber);
            if (rolePlayer == null)
            {
                throw new Exception("Cannot find debtor to allocate premium listing to.");
            }

            var fileName = rolePlayer.DisplayName;

            var linkedTransaction = await GetCreditTransactionForRolePlayer(paymentAllocationScheme.TransactionId, rolePlayer.RolePlayerId, decimal.ToDouble(paymentAllocationScheme.TotalPaymentAmount));

            if (linkedTransaction == null)
            {
                throw new Exception("Cannot find debtor payment transaction to allocate to premium listing.");
            }

            linkedTransactionId = linkedTransaction.TransactionId;

            var childPolicyMembers =
                await GetChildPoliciesByParentPolicyNumber(paymentAllocationScheme?.ParentPolicyNumber);

            _ = await SavePremiumPaymentLinkedFileDetails(fileIdentifier, fileName, linkedTransactionId);

            foreach (var record in paymentAllocationScheme.PaymentAllocationRecords)
            {
                var childPolicyMember = childPolicyMembers.FirstOrDefault(x => x.PolicyNumber == record.PolicyNumber);
                if (childPolicyMember == null)
                {
                    continue;
                }

                var premiumPayment = new Load_PremiumListingPayment
                {
                    FileIdentifier = fileIdentifier,
                    GroupPolicyNumber = paymentAllocationScheme.ParentPolicyNumber,
                    MemberPolicyNumber = record.PolicyNumber,
                    PaymentDate = record.PolicyMonth.ToString("yyyy-MM-dd"),
                    PaymentAmount = record.Amount.ToString(CultureInfo.InvariantCulture),
                    Company = rolePlayer.DisplayName,
                    MemberIdNumber = childPolicyMember?.IdNumber,
                };

                payments.Add(premiumPayment);
            }

            var modifiedBy = !string.IsNullOrEmpty(RmaIdentity.Email) ? RmaIdentity.Email : RmaIdentity.ClientId;
            var importResults = 0;

            if (payments.Count == 0)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var premiumListingFile = await _premiumListingPaymentFileRepository.FirstOrDefaultAsync(x => x.FileIdentifier == fileIdentifier
                    && x.LinkedTransactionId.Value == linkedTransactionId);

                    premiumListingFile.FileProcessingStatusId = (int)UploadedFileProcessingStatusEnum.Failed;
                    premiumListingFile.ModifiedBy = modifiedBy;
                    premiumListingFile.ModifiedDate = DateTimeHelper.SaNow;

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }

                return paymentAllocationScheme.PaymentAllocationRecords;

            }

            importResults = await ImportPayments(payments);

            if (importResults > 0)
            {
                paymentAllocationScheme.PaymentAllocationRecords = await _transactionService.AllocatePaymentsToPremiumListingTransactions(fileIdentifier, linkedTransactionId, modifiedBy, paymentAllocationScheme);
            }

            return paymentAllocationScheme.PaymentAllocationRecords;
        }

        public async Task<client_RolePlayer> GetParentPolicyRolePlayer(string policyNumber)
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {

                var rolePlayerResults = await (from policy in _policyRepository.Where(x =>
                        x.PolicyNumber == policyNumber && x.PolicyPayeeId == x.PolicyOwnerId)
                                               join rolePlayer in _rolePlayerRepository on new { policy.PolicyOwnerId, policy.PolicyPayeeId }
                                                   equals new { PolicyOwnerId = rolePlayer.RolePlayerId, PolicyPayeeId = rolePlayer.RolePlayerId }

                                               select rolePlayer).FirstOrDefaultAsync();

                return rolePlayerResults;
            }
        }


        public async Task<List<PolicyMinimumData>> GetChildPoliciesByParentPolicyNumber(string policyNumber)
        {
            var policies = new List<PolicyMinimumData>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var parentPolicy = await _policyRepository
                  .SingleOrDefaultAsync(p => p.PolicyNumber == policyNumber);

                if (parentPolicy != null)
                {
                    policies = await (from policy in _policyRepository
                                      join rolePlayer in _rolePlayerRepository on policy.PolicyOwnerId equals rolePlayer.RolePlayerId
                                      join person in _personRepository on rolePlayer.RolePlayerId equals person.RolePlayerId
                                      where policy.ParentPolicyId == parentPolicy.PolicyId

                                      select new PolicyMinimumData
                                      {
                                          PolicyId = policy.PolicyId,
                                          PolicyNumber = policy.PolicyNumber,
                                          DisplayName = rolePlayer.DisplayName,
                                          IdNumber = person.IdNumber,
                                          PolicyStatus = policy.PolicyStatus,
                                          InstallmentPremium = policy.InstallmentPremium
                                      }
                                    ).Distinct().ToListAsync();
                }
                return policies;
            }
        }

        public async Task<int> AllocatePremiumPayments(PremiumAllocationRequest content)
        {
            try
            {
                Contract.Requires(content != null);
                int fileId = content.FileId;
                int linkedTransactionId = content.linkedTransactionId;

                decimal balance = 0;
                if (content.Balance.HasValue)
                    balance = content.Balance.Value;
                var totalFileAmount = 0m;

                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var fileContents = await _premiumPaymentFileValidationContentRepository.Where(f => f.FileId == fileId).ToListAsync();

                    if (fileContents != null)
                    {
                        foreach (var fileContent in fileContents)
                        {
                            totalFileAmount += Convert.ToDecimal(fileContent?.PaymentAmount, CultureInfo.InvariantCulture);
                        }
                    }

                    if (totalFileAmount > balance)
                    {
                        throw new Exception("Premium listing payment allocation total amount cannot exceed the debtor transaction amount.");
                    }
                    var transactionParameter = new SqlParameter { ParameterName = "@linkedTransactionId", Value = linkedTransactionId };
                    var userIdParameter = new SqlParameter { ParameterName = "@userId", Value = RmaIdentity.Email };
                    var fileIdParameter = new SqlParameter { ParameterName = "@fileId", Value = fileId };

                    const string procedure = "[Load].[AllocatPremuimPayments] @linkedTransactionId, @userId, @fileId";
                    var count = await _premiumPaymentFileValidationContentRepository.SqlQueryAsync<int>(procedure, transactionParameter, userIdParameter, fileIdParameter);
                    return count[0];
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error allocating premium listing > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<PremiumListingFile> GetPremiumPaymentFile(int fileId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var file = new PremiumListingFile();
                var results = await _premiumPaymentFileValidationRepository.FirstOrDefaultAsync(c => c.FileId == fileId);
                if (results != null)
                    file = Mapper.Map<PremiumListingFile>(results);
                return file;
            }
        }

        public async Task<List<PremiumListingFile>> GetPremiumListingPaymentFilesByDate(string policyNumber, DateTime startDate, DateTime endDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var _startDate = startDate.StartOfTheDay();
                var _endDate = endDate.EndOfTheDay();
                var results = new List<PremiumListingFile>();
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    if (!string.IsNullOrEmpty(policyNumber))
                    {
                        var fileIdsForPolicy = await _premiumPaymentFileValidationContentRepository
                            .Where(f => f.GroupPolicyNumber == policyNumber)
                            .Select(c => c.FileId).Distinct().ToListAsync();

                        if (fileIdsForPolicy.Count > 0)
                        {
                            var entities = await _premiumPaymentFileValidationRepository
                                .Where(f => fileIdsForPolicy.Contains(f.FileId)
                                && f.CreatedDate >= startDate && f.CreatedDate <= endDate)
                                 .OrderBy(c => c.CreatedDate)
                                .ToListAsync();
                            results = Mapper.Map<List<PremiumListingFile>>(entities);
                        }

                    }
                    else
                    {
                        var entities = await _premiumPaymentFileValidationRepository
                               .Where(f => f.CreatedDate >= startDate && f.CreatedDate <= endDate)
                               .OrderBy(c => c.CreatedDate)
                               .ToListAsync();
                        results = Mapper.Map<List<PremiumListingFile>>(entities);
                    }
                    return results;
                }
            }
        }
    }
}
