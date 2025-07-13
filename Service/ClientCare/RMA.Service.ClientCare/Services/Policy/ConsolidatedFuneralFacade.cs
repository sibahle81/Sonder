using AutoMapper;
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Client;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.Database.Constants;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.ClientCare.Mappers;
using RMA.Service.Integrations.Contracts.Entities.Vopd;

using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using TinyCsvParser;

using PolicyMember = RMA.Service.ClientCare.Contracts.Entities.Policy.Common.Member;
using PolicyModel = RMA.Service.ClientCare.Contracts.Entities.Policy.Policy;
using PolicyRequest = RMA.Service.ClientCare.Contracts.Entities.Policy.CFP.PolicyRequest;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class ConsolidatedFuneralFacade : RemotingStatelessService, IConsolidatedFuneralService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IRepository<Load_ConsolidatedFuneral> _funeralRepository;
        private readonly IRepository<Load_ConsolidatedFuneralMember> _memberRepository;
        private readonly IRepository<Load_ConsolidatedFuneralFile> _fileRepository;
        private readonly IRepository<Load_ConsolidatedFuneralError> _errorRepository;
        private readonly IRepository<client_UserVopdResponse> _userVopdRepository;
        private readonly IRepository<policy_PolicyLifeExtension> _policyLifeRepository;
        private readonly IRepository<client_RolePlayerPersalDetail> _rolePlayerPersalDetailRepository;
        private readonly IRepository<client_Person> _personRepository;

        private readonly IQLinkService _qlinkService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IConfigurationService _configurationService;
        private readonly IServiceBusMessage _serviceBusMessage;
        private readonly ILeadTimeTrackerService _leadTimeTrackerService;
        private readonly IOnboardingNotificationService _notificationService;
        private readonly IPolicyDocumentService _policyDocumentService;

        // remove 
        private readonly IPolicyCommunicationService _policyCommunicationService;

        private const string MainMember = "Main Member";
        private string productOption = "";
        private int clientReferenceNumber;
        private int excelRowNumber;

        public ConsolidatedFuneralFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<policy_Policy> policyRepository,
            IRepository<Load_ConsolidatedFuneral> funeralRepository,
            IRepository<Load_ConsolidatedFuneralMember> memberRepository,
            IRepository<Load_ConsolidatedFuneralFile> fileRepository,
            IRepository<Load_ConsolidatedFuneralError> errorRepository,
            IRepository<client_UserVopdResponse> userVopdRepository,
            IRepository<policy_PolicyLifeExtension> policyLifeRepository,
            IRepository<client_RolePlayerPersalDetail> rolePlayerPersalDetailRepository,
            IRepository<client_Person> personRepository,
            IQLinkService qlinkService,
            IRolePlayerService rolePlayerService,
            IConfigurationService configurationService,
            IServiceBusMessage serviceBusMessage,
            ILeadTimeTrackerService leadTimeTrackerService,
            IOnboardingNotificationService notificationService,
            IPolicyDocumentService policyDocumentService,

            // remove
            IPolicyCommunicationService policyCommunicationService

        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _policyRepository = policyRepository;
            _funeralRepository = funeralRepository;
            _memberRepository = memberRepository;
            _fileRepository = fileRepository;
            _errorRepository = errorRepository;
            _userVopdRepository = userVopdRepository;
            _policyLifeRepository = policyLifeRepository;
            _policyCommunicationService = policyCommunicationService;
            _qlinkService = qlinkService;
            _rolePlayerPersalDetailRepository = rolePlayerPersalDetailRepository;
            _personRepository = personRepository;
            _rolePlayerService = rolePlayerService;
            _configurationService = configurationService;
            _serviceBusMessage = serviceBusMessage;
            _leadTimeTrackerService = leadTimeTrackerService;
            _notificationService = notificationService;
            _policyDocumentService = policyDocumentService;
        }

        #region Upload onboarding spreadsheet
        public async Task<List<string>> ImportConsolidatedFuneral(
            PolicyOnboardOptionEnum policyOnboardOption,
            string policyNumber,
            string fileName,
            FileContentImport content
        )
        {
            Contract.Requires(content != null);

            if (string.IsNullOrEmpty(content.Data)) { throw new NullReferenceException("File content cannot be null"); }

            PolicyModel policy = null;
            Person policyOwner = null;

            if (policyOnboardOption == PolicyOnboardOptionEnum.UpdateSpecifiedPolicy)
            {
                policy = await GetPolicyDetail(policyNumber);
                if (policy is null)
                {
                    return new List<string> { $"Policy {policyNumber} does not exist in the system" };
                }
                else if (PolicyOnInvalidStatus(policy.PolicyStatus))
                {
                    return new List<string> { $"Policy {policyNumber} is on invalid status {policy.PolicyStatus.DisplayDescriptionAttributeValue()}" };
                }

                policyOwner = await GetPolicyOwner(policy.PolicyOwnerId);
            }

            clientReferenceNumber = 0;
            excelRowNumber = 0;

            var errors = new List<string>();
            var decodedString = Convert.FromBase64String(content.Data);
            const int StartingIndex = 0;
            var fileData = Encoding.UTF8.GetString(decodedString, StartingIndex, decodedString.Length);
            var companyIndex = fileData.IndexOf("Scheme Name", StringComparison.Ordinal);

            if (companyIndex != -1)
            {
                fileData = fileData.Substring(companyIndex);
            }

            const char delimiter = '|';
            const string newLine = "\n";

            var csvParserOptions = new CsvParserOptions(true, delimiter);
            var csvMapper = new ConsolidatedFuneralMapping();
            var csvParser = new CsvParser<Load_ConsolidatedFuneral>(csvParserOptions, csvMapper);
            var csvReaderOptions = new CsvReaderOptions(new[] { newLine });
            var records = csvParser.ReadFromString(csvReaderOptions, fileData).ToList();

            if (records.Count == 0)
            {
                errors.Add("The file does not contain any member details");
            }

            var fileIdentifier = Guid.NewGuid();
            var company = string.Empty;
            var funeralList = new List<Load_ConsolidatedFuneral>();

            var mainMember = CoverMemberTypeEnum.MainMember.DisplayAttributeValue();
            var stopOrder = PaymentMethodEnum.CorporateStopOrder.DisplayAttributeValue();

            var rowNumber = 5; // First line containing data in the spreadsheet.
            foreach (var record in records)
            {
                if (!record.IsValid)
                {
                    errors.Add($"Error on line {rowNumber} column {record.Error.ColumnIndex}: {record.Error.Value}");
                }
                else if (!IsBlankRow(record.Result))
                {
                    if (string.IsNullOrEmpty(company))
                    {
                        if (record.Result.ClientType.Equals(mainMember))
                        {
                            if (record.Result.PaymentMethod.Equals(stopOrder))
                            {
                                company = "Municipality";
                            }
                        }
                    }
                    if (policyOnboardOption == PolicyOnboardOptionEnum.UpdateSpecifiedPolicy)
                    {
                        record.Result.ClientReference = policyNumber;
                        if (record.Result.ClientType.Equals(MainMember, StringComparison.OrdinalIgnoreCase))
                        {
                            if (!record.Result.IdNumber.Equals(policyOwner.IdNumber))
                            {
                                errors.Add($"Member with ID number {record.Result.IdNumber} on line {rowNumber} does not own policy {policyNumber}");
                            }
                        }
                    }
                    if (record.Result.ClientType.Equals("Main Member"))
                    {
                        var policyNo = record.Result.ClientReference.Trim();
                        if (!String.IsNullOrEmpty(policyNo) && !policyNo.Equals("none"))
                        {
                            policy = await GetPolicyDetail(policyNo);
                            if (policy != null && PolicyOnInvalidStatus(policy.PolicyStatus))
                            {
                                errors.Add($"Policy {record.Result.ClientReference} is on invalid status {policy.PolicyStatus.DisplayDescriptionAttributeValue()}");
                            }
                        }
                    }
                    if (!record.Result.ClientType.Equals("Beneficiary"))
                    {
                        if (!ValidMonetaryValue(record.Result.Premium))
                        {
                            errors.Add($"Invalid premium for {record.Result.FirstName} {record.Result.Surname} on line {rowNumber}");
                        }
                        if (!ValidMonetaryValue(record.Result.CoverAmount))
                        {
                            errors.Add($"Invalid cover amount for {record.Result.FirstName} {record.Result.Surname} on line {rowNumber}");
                        }
                    }

                    var funeralData = record.Result;
                    funeralData.FileIdentifier = fileIdentifier;
                    funeralList.Add(funeralData);
                }
                rowNumber++;
            }

            if (errors.Count > 0) { return errors; }

            // Import the records in the background
            await SaveConsolidateFuneralFileDetails(fileIdentifier, fileName);
            await ImportConsolidatedFuneralRecords(fileIdentifier, policyOnboardOption, funeralList);
            await CreatedConsolidatedFuneralWizard(company, fileIdentifier, policyOnboardOption, policyNumber);

            return errors;

        }

        private bool PolicyOnInvalidStatus(PolicyStatusEnum policyStatus)
        {
            var invalidStatus = new List<PolicyStatusEnum> {
                        PolicyStatusEnum.Cancelled,
                        PolicyStatusEnum.Lapsed,
                        PolicyStatusEnum.NotTakenUp
                    };
            return invalidStatus.Contains(policyStatus);
        }

        private bool ValidMonetaryValue(string premium)
        {
            if (string.IsNullOrEmpty(premium)) return false;
            return decimal.TryParse(premium.Trim(), NumberStyles.AllowDecimalPoint, CultureInfo.InvariantCulture, out decimal value);
        }

        private async Task<Person> GetPolicyOwner(int policyOwnerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personData = await _personRepository.SingleOrDefaultAsync(s => s.RolePlayerId == policyOwnerId);
                var person = Mapper.Map<Person>(personData);
                return person;
            }
        }

        private async Task<PolicyModel> GetPolicyDetail(string policyNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyData = await _policyRepository.SingleOrDefaultAsync(s => s.PolicyNumber == policyNumber);
                if (policyData is null)
                {
                    return null;
                }
                var policy = Mapper.Map<PolicyModel>(policyData);
                return policy;
            }
        }

        private async Task CreatedConsolidatedFuneralWizard(string company, Guid fileIdentifier, PolicyOnboardOptionEnum policyOnboardOption, string policyNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                _ = await CreateWizardTask(company, fileIdentifier, policyOnboardOption, policyNumber, WizardStatusEnum.InProgress);
            }
        }

        private bool IsBlankRow(Load_ConsolidatedFuneral row)
        {
            return string.IsNullOrEmpty(row.ClientType)
                && string.IsNullOrEmpty(row.BenefitName)
                && string.IsNullOrEmpty(row.PreviousInsurer);
        }

        private async Task ImportConsolidatedFuneralRecords(Guid fileIdentifier, PolicyOnboardOptionEnum policyOnboardOption, List<Load_ConsolidatedFuneral> funeralList)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                try
                {
                    string sql;
                    const int importCount = 500;
                    while (funeralList.Count > 0)
                    {
                        var count = funeralList.Count >= importCount ? importCount : funeralList.Count;
                        var records = funeralList.GetRange(0, count);
                        sql = GetFuneralInsertSql(records);
                        await _funeralRepository.ExecuteSqlCommandAsync(sql);
                        funeralList.RemoveRange(0, count);
                    }
                    var data = await _fileRepository
                        .FirstOrDefaultAsync(s => s.FileIdentifier.Equals(fileIdentifier));
                    if (data != null)
                    {
                        // Validate the imported data. This can be done only once because
                        // the wizard data cannot be edited.
                        _ = await ImportConsolidatedFuneralPolicies(0, "", fileIdentifier, policyOnboardOption, true, false);
                    }
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    ex.LogException("Consolidated Funeral Upload Error");
                    throw;
                }
            }
        }

        private async Task<int> CreateWizardTask(string company, Guid fileIdentifier, PolicyOnboardOptionEnum policyOnboardOption, string policyNumber, WizardStatusEnum status)
        {
            if (string.IsNullOrEmpty(company))
            {
                company = "SA Government";
            }

            var email = string.IsNullOrEmpty(RmaIdentity.Email) ? RmaIdentity.BackendServiceName : RmaIdentity.Email;

            var fileIdentifierParameter = new SqlParameter { ParameterName = "@fileIdentifier", Value = fileIdentifier };
            var companyParameter = new SqlParameter { ParameterName = "@company", Value = company };
            var userIdParameter = new SqlParameter { ParameterName = "@userId", Value = email };
            var policyOnboardOptionParameter = new SqlParameter { ParameterName = "@policyOnboardOption", Value = (int)policyOnboardOption };
            var policyNumberParameter = new SqlParameter { ParameterName = "@policyNumber", Value = policyNumber };
            var wizardStatusParameter = new SqlParameter { ParameterName = "@wizardStatus", Value = (int)status };

            var results = await _funeralRepository.SqlQueryAsync<int>(
                DatabaseConstants.GenerateConsolidatedFuneralTask,
                    fileIdentifierParameter,
                    companyParameter,
                    userIdParameter,
                    policyOnboardOptionParameter,
                    policyNumberParameter,
                    wizardStatusParameter
            );

            return results.FirstOrDefault();
        }

        private string GetFuneralInsertSql(List<Load_ConsolidatedFuneral> records)
        {
            StringBuilder sql = new StringBuilder($"INSERT INTO [Load].[ConsolidatedFuneral] ({GetFieldNames()}) VALUES ");

            foreach (var rec in records)
            {
                excelRowNumber++;

                if (rec.ClientType.Equals("Main Member", StringComparison.OrdinalIgnoreCase))
                {
                    productOption = rec.ProductOption;
                    clientReferenceNumber++;
                }

                var clientReference = String.IsNullOrWhiteSpace(rec.ClientReference) ? $"XXX{clientReferenceNumber:000000000}" : rec.ClientReference;

                sql.Append(string.Format("('{0}',{1},{2},{3},{4},{5},{6},{7},{8},{9},{10},{11},{12},{13},{14},{15},{16},{17},{18},{19},{20},{21},{22},{23},{24},{25},{26},{27},{28},{29},{30},{31},{32},{33},{34},{35},{36},{37},{38},{39},{40},{41},{42},{43},{44},{45},{46},{47},{48},{49},{50}),",
                    rec.FileIdentifier,
                    SetLength(clientReference, 32).Quoted(),
                    SetLength(rec.ClientType, 32).Quoted(),
                    SetLength(rec.FirstName, 256).Quoted(),
                    SetLength(rec.Surname, 256).Quoted(),
                    SetLength(rec.MainMemberId, 32).Quoted(),
                    SetLength(rec.IdNumber, 32).Quoted(),
                    SetLength(rec.PassportNumber, 32).Quoted(),
                    SetLength(rec.DateOfBirth, 32).Quoted(),
                    SetLength(rec.Gender, 16).Quoted(),
                    SetLength(rec.BenefitName, 128).Quoted(),
                    SetLength(rec.JoinDate, 32).Quoted(),
                    SetLength(rec.AffordibilityChecked, 32).Quoted(),
                    SetLength(rec.Premium, 64).Quoted(),
                    SetLength(rec.CoverAmount, 64).Quoted(),
                    SetLength(rec.PreviousInsurer, 256).Quoted(),
                    SetLength(rec.PreviousInsurerPolicyNumber, 50).Quoted(),
                    SetLength(rec.PreviousInsurerStartDate, 32).Quoted(),
                    SetLength(rec.PreviousInsurerEndDate, 32).Quoted(),
                    SetLength(rec.PreviousInsurerCoverAmount, 64).Quoted(),
                    SetLength(rec.Address1, 256).Quoted(),
                    SetLength(rec.Address2, 256).Quoted(),
                    SetLength(rec.City, 256).Quoted(),
                    SetLength(rec.Province, 256).Quoted(),
                    SetLength(rec.Country, 256).Quoted(),
                    SetLength(rec.PostalCode, 8).Quoted(),
                    SetLength(rec.PostalAddress1, 256).Quoted(),
                    SetLength(rec.PostalAddress2, 256).Quoted(),
                    SetLength(rec.PostalCity, 256).Quoted(),
                    SetLength(rec.PostalProvince, 256).Quoted(),
                    SetLength(rec.PostalCountry, 256).Quoted(),
                    SetLength(rec.PostalPostCode, 8).Quoted(),
                    SetLength(rec.Telephone, 24).Quoted(),
                    SetLength(rec.Mobile, 24).Quoted(),
                    SetLength(rec.Email, 128).Quoted(),
                    SetLength(rec.PreferredCommunication, 24).Quoted(),
                    SetLength(productOption, 128).Quoted(),
                    SetLength(rec.AnnualIncreaseOption, 16).Quoted(),
                    SetLength(rec.IncreaseMonth, 16).Quoted(),
                    SetLength(rec.Employer, 128).Quoted(),
                    SetLength(rec.PersalNumber, 16).Quoted(),
                    SetLength(rec.Department, 64).Quoted(),
                    SetLength(rec.Bank, 64).Quoted(),
                    SetLength(rec.BranchCode, 16).Quoted(),
                    SetLength(rec.AccountNo, 32).Quoted(),
                    SetLength(rec.AccountType, 64).Quoted(),
                    SetLength(rec.DebitOrderDay, 8).Quoted(),
                    SetLength(rec.RepIdNumber, 16).Quoted(),
                    excelRowNumber,
                    SetLength(rec.PayrollCode, 32).Quoted(),
                    SetLength(rec.PaymentMethod, 64).Quoted()
                ));
            }

            return sql.ToString().TrimEnd(new char[] { ',' });
        }

        private object GetFieldNames()
        {
            var sql = new StringBuilder("[FileIdentifier],");
            sql.Append("[ClientReference],");
            sql.Append("[ClientType],");
            sql.Append("[FirstName],");
            sql.Append("[Surname],");
            sql.Append("[MainMemberID],");
            sql.Append("[IdNumber],");
            sql.Append("[PassportNumber],");
            sql.Append("[DateOfBirth],");
            sql.Append("[Gender],");
            sql.Append("[BenefitName],");
            sql.Append("[JoinDate],");
            sql.Append("[AffordibilityChecked],");
            sql.Append("[Premium],");
            sql.Append("[CoverAmount],");
            sql.Append("[PreviousInsurer],");
            sql.Append("[PreviousInsurerPolicyNumber],");
            sql.Append("[PreviousInsurerStartDate],");
            sql.Append("[PreviousInsurerEndDate],");
            sql.Append("[PreviousInsurerCoverAmount],");
            sql.Append("[Address1],");
            sql.Append("[Address2],");
            sql.Append("[City],");
            sql.Append("[Province],");
            sql.Append("[Country],");
            sql.Append("[PostalCode],");
            sql.Append("[PostalAddress1],");
            sql.Append("[PostalAddress2],");
            sql.Append("[PostalCity],");
            sql.Append("[PostalProvince],");
            sql.Append("[PostalCountry],");
            sql.Append("[PostalPostCode],");
            sql.Append("[Telephone],");
            sql.Append("[Mobile],");
            sql.Append("[Email],");
            sql.Append("[PreferredCommunication],");
            sql.Append("[ProductOption],");
            sql.Append("[AnnualIncreaseOption],");
            sql.Append("[IncreaseMonth],");
            sql.Append("[Employer],");
            sql.Append("[PersalNumber],");
            sql.Append("[Department],");
            sql.Append("[Bank],");
            sql.Append("[BranchCode],");
            sql.Append("[AccountNo],");
            sql.Append("[AccountType],");
            sql.Append("[DebitOrderDay],");
            sql.Append("[RepIdNumber],");
            sql.Append("[ExcelRowNumber],");
            sql.Append("[PayrollCode],");
            sql.Append("[PaymentMethod]");
            return sql;
        }

        private string SetLength(string value, int len)
        {
            if (value == null) return string.Empty;

            value = value.Trim();
            return value.Length > len ? value.Substring(0, len) : value;
        }

        private async Task SaveConsolidateFuneralFileDetails(Guid fileIdentifier, string fileName)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var file = new Load_ConsolidatedFuneralFile
                {
                    FileIdentifier = fileIdentifier,
                    FileName = fileName,
                    IsDeleted = false,
                    CreatedBy = RmaIdentity.Email,
                    CreatedDate = DateTime.Now,
                    ModifiedBy = RmaIdentity.Email,
                    ModifiedDate = DateTime.Now
                };
                _fileRepository.Create(file);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }
        #endregion

        #region Import consolidated funeral members
        public async Task<ImportInsuredLivesSummary> ImportConsolidatedFuneralPolicies(
            int wizardId,
            string wizardName,
            Guid fileIdentifier,
            PolicyOnboardOptionEnum policyOnboardOption,
            bool runValidations,
            bool runImport
        )
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                if (!runImport)
                {
                    // Populate the staging tables with the required values
                    await StageImportMemberDetails(fileIdentifier, policyOnboardOption);
                    // Get the upload summary
                    var summary = await GetImportedLivesSummary(fileIdentifier);
                    if (runValidations)
                    {
                        // Check for data / rule errors
                        var errorCount = await ValidatePolicies(fileIdentifier);
                        // Only run main member and spouse VOPD if there are no other errors
                        if (errorCount == 0)
                        {
                            errorCount += await RunMemberVopdChecks(fileIdentifier);
                        }
                        // Create a new summary with only the error count
                        summary = new ImportInsuredLivesSummary
                        {
                            RecordCount = errorCount
                        };
                    }
                    return summary;
                }
                else
                {
                    // Run the import
                    var importedPolicies = await ImportPolicies(fileIdentifier);
                    if (importedPolicies?.Count > 0)
                    {
                        foreach (var policy in importedPolicies)
                        {
                            // Update policy premium and lead tracker, and send Qlink
                            // transaction for each policy
                            await ProcessPolicies(fileIdentifier, importedPolicies);
                        }
                    }
                    // Send list of imported policies to business
                    _ = Task.Run(() => _notificationService.SendConsolidatedFuneralNewPolicyNotifications(wizardName, fileIdentifier));
                    //// Send policy documents
                    //_ = Task.Run(() => _policyCommunicationService.SendConsolidatedFuneralPolicyDocuments(importedPolicies));
                    // Get and return the summary of the imported members
                    return await GetImportedLivesSummary(fileIdentifier);
                }
            }
        }

        private async Task<int> ValidatePolicies(Guid fileIdentifier)
        {
            try
            {
                var errors = await _policyRepository
                    .SqlQueryAsync<int>(
                        DatabaseConstants.ValidateConsolidatedFuneral,
                          new SqlParameter { ParameterName = "@fileIdentifier", Value = fileIdentifier }
                    );
                return errors[0];
            }
            catch (Exception ex)
            {
                ex.LogException("Consolidated Funeral Validation Error", fileIdentifier);
                throw;
            }
        }

        private async Task StageImportMemberDetails(Guid fileIdentifier, PolicyOnboardOptionEnum policyOnboardOption)
        {
            try
            {
                var fileIdentifierParameter = new SqlParameter { ParameterName = "@fileIdentifier", Value = fileIdentifier };
                var policyOnboardOptionParameter = new SqlParameter { ParameterName = "@policyOnboardOption", Value = (int)policyOnboardOption };

                // Import the member details from the upload table to the import staging table
                await _policyRepository
                   .ExecuteSqlCommandAsync(
                       DatabaseConstants.InsertConsolidatedFuneralMembers,
                       fileIdentifierParameter
                   );
                // Get the associated benefits for the policies
                await _policyRepository
                    .ExecuteSqlCommandAsync(
                        DatabaseConstants.ImportConsolidatedFuneralBenefits,
                        fileIdentifierParameter
                    );
                // Import member banking details
                await _policyRepository
                    .ExecuteSqlCommandAsync(
                        DatabaseConstants.InsertConsolidatedFuneralBank,
                        fileIdentifierParameter
                    );
                // Insert previous insurance details
                await _policyRepository
                    .ExecuteSqlCommandAsync(
                        DatabaseConstants.InsertConsolidatedFuneralInsurance,
                        fileIdentifierParameter
                    );
                // Update imported data with required calculated and lookup values
                await _policyRepository
                    .ExecuteSqlCommandAsync(
                        DatabaseConstants.UpdateConsolidatedFuneralMembers,
                        fileIdentifierParameter,
                        policyOnboardOptionParameter
                    );
            }
            catch (Exception ex)
            {
                ex.LogException("Consolidated Funeral Staging Error", fileIdentifier);
                throw;
            }
        }

        private async Task<ImportInsuredLivesSummary> GetImportedLivesSummary(Guid fileIdentifier)
        {
            // Get the import summary
            var summary = await _policyRepository
                .SqlQueryAsync<ImportInsuredLivesSummary>(
                    DatabaseConstants.ConsolidatedFuneralSummary,
                    new SqlParameter { ParameterName = "@fileIdentifier", Value = fileIdentifier }
                );
            summary[0].RecordCount = (int)summary.Sum(s => s.Total);
            return summary[0];
        }

        private async Task ProcessPolicies(Guid fileIdentifier, List<ConsolidatedFuneralSummary> importedPolicies)
        {
            try
            {
                foreach (var policy in importedPolicies)
                {
                    // Update the policy premium
                    await _policyRepository.ExecuteSqlCommandAsync(
                        DatabaseConstants.UpdateConsolidatedFuneralPremium,
                            new SqlParameter("@policyId", policy.PolicyId),
                            new SqlParameter("@userId", RmaIdentity.Email ?? RmaIdentity.BackendServiceName)
                    );
                    // Send the Qlink transaction if required
                    if (policy.PaymentMethod == PaymentMethodEnum.GovernmentSalaryDeduction)
                    {
                        var qlinkTransactionType = policy.NewPolicy
                            ? QLinkTransactionTypeEnum.QADD
                            : QLinkTransactionTypeEnum.QUPD;
                        await SendQlinkTransaction(fileIdentifier, policy, qlinkTransactionType);
                    }
                    // Send policy documents in background thread
                    _ = Task.Run(() => SendPolicyDocuments(policy));
                    // Update the lead time tracker
                    _ = await _leadTimeTrackerService.UpdateLeadTimeTrackerPolicyIdAsyn(
                        policy.PolicyNumber,
                        fileIdentifier.ToString()
                    );
                }
            }
            catch (Exception ex)
            {
                ex.LogException("Consolidated Funeral Process Error", fileIdentifier);
                throw;
            }
        }

        private async Task SendPolicyDocuments(ConsolidatedFuneralSummary policy)
        {
            if (policy.NewPolicy)
            {
                await _policyDocumentService.CreatePolicyWelcomePack(policy.PolicyNumber);
                await _policyDocumentService.SendPolicyWelcomePack(policy.PolicyNumber);
            }
            else
            {
                await _policyDocumentService.RefreshPolicyDocument(policy.PolicyNumber, DocumentTypeEnum.PolicySchedule, null);
                await _policyDocumentService.SendPolicyDocument(policy.PolicyNumber, DocumentTypeEnum.PolicySchedule);
            }
        }

        private async Task SendQlinkTransaction(Guid fileIdentifier, ConsolidatedFuneralSummary policy, QLinkTransactionTypeEnum qlinkTransactionType)
        {
            try
            {
                _ = await _qlinkService.ProcessQlinkTransactionAsync(
                   new List<string> { policy.PolicyNumber },
                   qlinkTransactionType,
                   true
               );
            }
            catch (Exception ex)
            {
                ex.LogException("Consolidated Funeral Qlink Error", fileIdentifier, policy.PolicyNumber);
                // Do not throw because the policy has already been created, and the welcome pack
                // must go out. Send an error notification instead
                await _notificationService.SendQlinkErrorNotification(policy.PolicyNumber, ex.Message);
            }
        }

        private async Task<List<ConsolidatedFuneralSummary>> ImportPolicies(Guid fileIdentifier)
        {
            try
            {
                var consolidatedFuneralSummary = new List<ConsolidatedFuneralSummary>();
                var count = await _policyRepository
                    .SqlQueryAsync<int>(
                        DatabaseConstants.ImportConsolidatedFuneralMembers,
                        new SqlParameter { ParameterName = "@fileIdentifier", Value = fileIdentifier },
                        new SqlParameter { ParameterName = "@userId", Value = RmaIdentity.Email ?? RmaIdentity.BackendServiceName }
                    );
                if (count[0] > 0)
                {
                    consolidatedFuneralSummary = await _policyRepository
                      .SqlQueryAsync<ConsolidatedFuneralSummary>(
                          DatabaseConstants.GetConsolidatedFuneralSummary,
                          new SqlParameter { ParameterName = "@fileIdentifier", Value = fileIdentifier }
                      );
                }
                return consolidatedFuneralSummary;
            }
            catch (Exception ex)
            {
                ex.LogException("Consolidated Funeral Import Error", fileIdentifier);
                throw;
            }
        }

        private async Task<int> RunMemberVopdChecks(Guid fileIdentifier)
        {
            var count = 0;
            var members = await _memberRepository
                .Where(m => m.FileIdentifier == fileIdentifier
                         && (m.CoverMemberType == CoverMemberTypeEnum.MainMember
                          || m.CoverMemberType == CoverMemberTypeEnum.Spouse)
                         && m.IdNumber.Length == 13)
                .ToListAsync();
            foreach (var member in members)
            {
                count += await RunMemberVopdCheck(
                    fileIdentifier,
                    (RolePlayerTypeEnum)member.RolePlayerTypeId,
                    member.MainMemberIdNumber,
                    member.FirstName,
                    member.Surname,
                    member.IdNumber);
            }
            return count;
        }

        public async Task<RuleRequestResult> GetConsolidatedFuneralImportErrors(Guid fileIdentifier)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _errorRepository
                    .Where(e => e.FileIdentifier == fileIdentifier
                             && e.NotificationStatus == NotificationStatusEnum.Error)
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
                        var list = GetRuleResult("Consolidated Funeral Onboarding Import", new List<PremiumListingError>());
                        result.RuleResults.Add(list);
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

        public async Task<bool> OverrideCfpMemberVopd(VopdUpdateResponseModel vopdUpdateResponse)
        {
            Contract.Requires(vopdUpdateResponse != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var member = await _memberRepository
                  .Where(m => m.FileIdentifier == vopdUpdateResponse.FileIdentifier
                           && m.IdNumber == vopdUpdateResponse.IdNumber)
                  .FirstOrDefaultAsync();

                if (member == null)
                {
                    member = await _memberRepository
                   .Where(m => m.IdNumber == vopdUpdateResponse.IdNumber)
                   .FirstOrDefaultAsync();
                }

                if (member != null)
                {
                    await _rolePlayerService.OverrideRolePlayerVopd(vopdUpdateResponse);

                    if (vopdUpdateResponse.DateOfDeath != null && member.CoverMemberType == CoverMemberTypeEnum.Spouse)
                    {
                        await RemoveMemberFromPolicy(vopdUpdateResponse.FileIdentifier, vopdUpdateResponse.IdNumber);
                    }
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
            return await Task.FromResult(true);

        }
        #endregion

        #region Upload policy from tablet app
        public async Task<int> StageImportedConsolidatedFuneral(PolicyRequest policyRequest)
        {
            Contract.Requires(policyRequest != null);

            // Use the unique identifier that already comes with the import request
            if (!Guid.TryParse(policyRequest.RequestGUID, out Guid fileIdentifier))
            {
                fileIdentifier = Guid.NewGuid();
            }
            // Import the lead 
            var count = await ImportConsolidatedFuneralLead(policyRequest, fileIdentifier);
            // Send lead received notification if the lead was successfully imported
            if (count > 0)
            {
                _ = Task.Run(() => SendLeadReceivedNotification(fileIdentifier));
            }
            return count;

        }

        private async Task<int> ImportConsolidatedFuneralLead(PolicyRequest policyRequest, Guid fileIdentifier)
        {
            Contract.Requires(policyRequest != null);
            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    int returnCount = 0;
                    // Load the member details
                    var list = LoadConsolidatedFuneralMembers(policyRequest);
                    returnCount = list.Count;

                    // Clear existing records in the staging tables
                    var existingData = await _funeralRepository
                        .Where(f => f.FileIdentifier == fileIdentifier)
                        .ToListAsync();
                    if (existingData.Count > 0)
                    {
                        _funeralRepository.Delete(existingData);
                    }

                    list.ForEach(r => r.FileIdentifier = fileIdentifier);
                    await StageConsolidatedFuneralPolicy(list);

                    // Create wizard OR create policies directly
                    var createWizard = await _configurationService.IsFeatureFlagSettingEnabled("CreateCfpTabletWizard");
                    if (createWizard)
                    {
                        var company = await _configurationService.GetModuleSetting(SystemSettings.CfpTabletCompanyName);

                        // Get validations errors to determine wizard status.
                        await ImportConsolidatedFuneralPolicies(0, "", fileIdentifier, PolicyOnboardOptionEnum.UpdateDefaultPolicy, true, false);
                        var errors = await GetConsolidatedFuneralOnboardingErrors(fileIdentifier);
                        var wizardStatus = GetWizardStatus(errors);

                        var wizardId = await CreateWizardTask(company, fileIdentifier, PolicyOnboardOptionEnum.UpdateDefaultPolicy, "", wizardStatus);
                        _ = await _leadTimeTrackerService.UpdateLeadTimeTrackeWizardIdAsyn(wizardId, fileIdentifier.ToString());
                    }
                    else
                    {
                        // Validate the data
                        var result = await ImportConsolidatedFuneralPolicies(0, "", fileIdentifier, PolicyOnboardOptionEnum.UpdateDefaultPolicy, true, false);
                        // Import the data. RecordCount contains the number of errors
                        if (result.RecordCount == 0)
                        {
                            result = await ImportConsolidatedFuneralPolicies(0, "", fileIdentifier, PolicyOnboardOptionEnum.UpdateDefaultPolicy, false, true);
                            // Now result.RecordCount contains the number of policies created / updated
                            if (result.RecordCount > 0)
                            {
                                //Process Qlink QADD transactions 
                                var consolidatedFuneralSummary = await _policyRepository
                                  .SqlQueryAsync<ConsolidatedFuneralSummary>(
                                      DatabaseConstants.GetConsolidatedFuneralSummary,
                                      new SqlParameter { ParameterName = "@fileIdentifier", Value = fileIdentifier }
                                  );
                                var policyNumbers = consolidatedFuneralSummary.Select(x => x.PolicyNumber).ToList();
                                _ = await _leadTimeTrackerService.UpdateLeadTimeTrackerPolicyIdAsyn(policyNumbers.FirstOrDefault(), fileIdentifier.ToString());
                                _ = await _qlinkService.ProcessQlinkTransactionAsync(policyNumbers, QLinkTransactionTypeEnum.QADD, true);
                                // Send policy documents
                                await _policyCommunicationService.SendConsolidatedFuneralPolicyDocuments(consolidatedFuneralSummary);
                                // Send the policy created notification
                                await _notificationService.SendConsolidatedFuneralNewPolicyNotifications("Automatic Wizard Bypass", fileIdentifier);
                            }
                            returnCount = result.RecordCount;
                        }
                        else
                        {
                            // Email error messages to specified recipients
                            var errors = await _errorRepository
                                .Where(e => e.FileIdentifier == fileIdentifier)
                                .OrderBy(e => e.ErrorCategory)
                                .ThenBy(e => e.ErrorMessage)
                                .ToListAsync();
                            await SendImportErrors(policyRequest.MainMember, errors);
                        }
                    }
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    return returnCount;
                }
            }
            catch (Exception ex)
            {
                ex.LogException("Consolidated Funeral Lead Onboarding Error");
                var errors = new List<Load_ConsolidatedFuneralError>
                {
                    new Load_ConsolidatedFuneralError
                    {
                        Id = 0,
                        FileIdentifier = new Guid(),
                        ErrorCategory = "Import Exception",
                        ErrorMessage = ex.Message
                    }
                };
                await SendImportErrors(policyRequest.MainMember, errors);
                return 0;
            }
        }

        private WizardStatusEnum GetWizardStatus(List<Load_ConsolidatedFuneralError> errors)
        {
            // No errors - "Awaiting Approval"
            // Only VOPD errors - "In Progress"
            // Other errors - "Rejected"

            if (errors.Count == 0)
                return WizardStatusEnum.AwaitingApproval;

            var vopdErrors = errors.Where(e => e.ErrorCategory == "VOPD").ToList();
            if (vopdErrors.Count == errors.Count)
                return WizardStatusEnum.InProgress;

            return WizardStatusEnum.Rejected;
        }

        private async Task<List<Load_ConsolidatedFuneralError>> GetConsolidatedFuneralOnboardingErrors(Guid fileIdentifier)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var errors = await _errorRepository
                    .Where(r => r.FileIdentifier == fileIdentifier)
                    .ToListAsync();
                return errors;
            }
        }

        private async Task<int> RunMemberVopdCheck(Guid fileIdentifier, RolePlayerTypeEnum rolePlayerType, string mainMemberIdNumber, string firstName, string surname, string idNumber)
        {
            var count = 0;
            var response = await _rolePlayerService.PersonVopdRequest(idNumber);
            // 1. Log validation error if VOPD could not be done
            if (response == null)
            {
                await AddValidationError(
                    fileIdentifier,
                    mainMemberIdNumber,
                    $"{rolePlayerType} {firstName} {surname} with ID number {idNumber} could not be VOPD verified",
                    NotificationStatusEnum.Error
                );
                return 1;
            }
            // 2. Log validation error if VOPD check fails
            if (response.statusCode != "200" || response.VerificationResponse == null)
            {
                await AddValidationError(
                    fileIdentifier,
                    mainMemberIdNumber,
                    $"{rolePlayerType} {firstName} {surname} with ID number {idNumber} could not be VOPD verified",
                    NotificationStatusEnum.Error
                );
                return 1;
            }
            var verification = response.VerificationResponse.VerificationDetails.FirstOrDefault();
            // 3. If name and surname are blank, user could not be found
            if (string.IsNullOrEmpty(verification.Forename) && string.IsNullOrEmpty(verification.Surname))
            {
                await AddValidationError(
                    fileIdentifier,
                    mainMemberIdNumber,
                    $"{rolePlayerType} {firstName} {surname} with ID number {idNumber} did not pass VOPD check",
                    NotificationStatusEnum.Error
                );
                count++;
            }
            // 4. Log validation error if fist name or surname does not match
            if (!NamesMatch(firstName, surname, verification))
            {
                await AddValidationError(
                    fileIdentifier,
                    mainMemberIdNumber,
                    $"{rolePlayerType} name {firstName} {surname} with ID number {idNumber} does not match VOPD name {verification.Forename} {verification.Surname}",
                    NotificationStatusEnum.Error
                );
                count++;
            }
            var deceased = !string.IsNullOrEmpty(verification.DateOfDeath);
            if (deceased)
            {
                switch (rolePlayerType)
                {
                    // 5. Log validation error if main member or beneficiary is deceased.
                    case RolePlayerTypeEnum.MainMemberSelf:
                    case RolePlayerTypeEnum.Beneficiary:
                        await AddValidationError(
                            fileIdentifier,
                            mainMemberIdNumber,
                            $"{rolePlayerType} {firstName} {surname} with ID number {idNumber} is deceased",
                            NotificationStatusEnum.Error
                        );
                        count++;
                        break;
                    // 6. Remove other members from policy if they are deceased
                    case RolePlayerTypeEnum.Spouse:
                    case RolePlayerTypeEnum.Child:
                    case RolePlayerTypeEnum.Extended:
                        await AddValidationError(
                            fileIdentifier,
                            mainMemberIdNumber,
                            $"{rolePlayerType} {firstName} {surname} with ID number {idNumber} is deceased and was not added to the policy",
                            NotificationStatusEnum.Warning
                        );
                        await RemoveMemberFromPolicy(fileIdentifier, idNumber);
                        break;
                }
            }
            return count;
        }

        private bool NamesMatch(string firstName, string surname, VerificationDetail verification)
        {
            // Surnames must match exactly
            if (!surname.Equals(verification.Surname, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            // Get the list of names received from the tablet or read from the spreadsheet
            var names = firstName.Split(' ');
            var matches = 0;
            var errors = 0;
            // Compare them to the VOPD name
            foreach (var name in names)
            {
                if (verification.Forename.IndexOf(name, StringComparison.OrdinalIgnoreCase) >= 0)
                {
                    matches++;
                }
                else
                {
                    errors++;
                }
            }

            // 1. Names match in any order - PASS
            // 2. Only one name supplied, but it matches - PASS
            if (matches > 0 && errors == 0) return true;

            // 3. Any name does not match - FAIL
            // 4. No name matches - FAIL
            if (errors > 0) return false;

            // Only condition still left is no matches and no errors. 
            // Let's just cover all the bases...
            return false;
        }

        private async Task RemoveMemberFromPolicy(Guid fileIdentifier, string idNumber)
        {
            var members = await _funeralRepository
                .Where(m => m.FileIdentifier == fileIdentifier
                         && m.IdNumber == idNumber)
                .ToListAsync();
            _funeralRepository.Delete(members);
        }

        private async Task AddValidationError(Guid fileIdentifier, string mainMemberIdNumber, string errorMessage, NotificationStatusEnum notificationStatus)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                var mainMember = await _memberRepository
                    .FirstOrDefaultAsync(m => m.FileIdentifier == fileIdentifier
                                           && m.IdNumber == mainMemberIdNumber
                                           && m.RolePlayerTypeId == (int)RolePlayerTypeEnum.MainMemberSelf);
                var error = new Load_ConsolidatedFuneralError
                {
                    FileIdentifier = fileIdentifier,
                    MainMemberIdNumber = mainMemberIdNumber,
                    MainMemberName = mainMember?.MemberName ?? "Unknown",
                    ErrorCategory = "VOPD",
                    ErrorMessage = errorMessage,
                    NotificationStatus = notificationStatus
                };
                _errorRepository.Create(error);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task<bool> MemberIsAlreadyVerified(string idNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var vopd = await _userVopdRepository
                    .Where(m => m.IdNumber == idNumber)
                    .ToListAsync();
                return vopd.Count > 0;
            }
        }

        private async Task SendImportErrors(PolicyMember mainMember, List<Load_ConsolidatedFuneralError> errors)
        {
            var recipient = await _configurationService.GetModuleSetting(SystemSettings.CfpErrorRecipient);
            if (!string.IsNullOrEmpty(recipient))
            {
                // Build the message body
                var body = await _configurationService.GetModuleSetting(SystemSettings.CfpErrorMessageTemplate);
                if (!string.IsNullOrEmpty(body))
                {
                    body = body.Replace("{0}", $"{mainMember.FirstName} {mainMember.Surname}");
                    body = body.Replace("{1}", mainMember.IDNumber);
                    body = body.Replace("{2}", GetErrorTable(errors));
                }
                // Send the email
                await _policyCommunicationService.SendEmail(recipient, "Policy Onboarding Error", body);
            }
        }

        private string GetErrorTable(List<Load_ConsolidatedFuneralError> errors)
        {
            var table = "<table><head><tr><th>Category</th><th>Message</th></tr></head><body>";
            foreach (var error in errors)
            {
                table += $"<tr><td>{error.ErrorCategory}</td><td>{error.ErrorMessage}</td></tr>";
            }
            table += "</body></table>";
            return table;
        }

        private async Task StageConsolidatedFuneralPolicy(List<Load_ConsolidatedFuneral> funeralList)
        {
            string sql;
            const int importCount = 500;
            while (funeralList.Count > 0)
            {
                var count = funeralList.Count >= importCount ? importCount : funeralList.Count;
                var records = funeralList.GetRange(0, count);
                sql = GetFuneralInsertSql(records);
                await _funeralRepository.ExecuteSqlCommandAsync(sql);
                funeralList.RemoveRange(0, count);
            }
        }

        private List<Load_ConsolidatedFuneral> LoadConsolidatedFuneralMembers(PolicyRequest policyRequest)
        {
            var list = new List<Load_ConsolidatedFuneral>();
            // Add main member
            var mainMember = LoadMainMember(policyRequest);
            list.AddRange(mainMember);
            // Add spouse
            if (policyRequest.Spouse != null)
            {
                list.AddRange(LoadMember(policyRequest, mainMember[0].IdNumber, policyRequest.Spouse, "Spouse"));
            }
            // Add children
            foreach (var child in policyRequest?.Children)
            {
                list.AddRange(LoadMember(policyRequest, mainMember[0].IdNumber, child, "Child"));
            }
            // Add parents
            foreach (var parent in policyRequest?.Parents)
            {
                list.AddRange(LoadMember(policyRequest, mainMember[0].IdNumber, parent, "Extended Family"));
            }
            // Add extended family members
            foreach (var person in policyRequest?.Extended)
            {
                list.AddRange(LoadMember(policyRequest, mainMember[0].IdNumber, person, "Extended Family"));
            }
            // Add beneficiaries
            foreach (var beneficiary in policyRequest?.Beneficiaries)
            {
                list.AddRange(LoadMember(policyRequest, mainMember[0].IdNumber, beneficiary, "Beneficiary"));
            }
            return list;
        }

        private List<Load_ConsolidatedFuneral> LoadMember(PolicyRequest policyRequest, string mainMemberIdNumber, PolicyMember member, string memberType)
        {
            var list = new List<Load_ConsolidatedFuneral>();
            member = FixMemberNames(member);
            var record = new Load_ConsolidatedFuneral
            {
                ClientReference = "XXX000000001",
                ClientType = memberType,
                FirstName = member.FirstName,
                Surname = member.Surname,
                MainMemberId = mainMemberIdNumber,
                IdNumber = member.IDNumber,
                PassportNumber = member.PassportNumber,
                DateOfBirth = member.DateOfBirth.ToString("yyyy-MM-dd"),
                Gender = member.Gender,
                PolicyNumber = policyRequest.PolicyNumber,
                ProductOption = policyRequest.ProductOption
            };
            // Cover options
            if (member.PolicyCover != null)
            {
                record.BenefitName = member.PolicyCover.BenefitName;
                record.JoinDate = member.PolicyCover.CommencementDate.Value.ToString("yyyy-MM-dd");
                record.Premium = member.PolicyCover.Premium.ToString("0.00");
                record.CoverAmount = member.PolicyCover.CoverAmount.ToString("0.00");
            }
            // Contact details
            if (member.ContactDetails != null)
            {
                record.Telephone = policyRequest.MainMember.ContactDetails.Telephone;
                record.Mobile = policyRequest.MainMember.ContactDetails.Mobile;
                record.Email = policyRequest.MainMember.ContactDetails.Email;
                record.PreferredCommunication = policyRequest.MainMember.ContactDetails.PreferredMethodOfCommunication;
            }
            if (member.PreviousInsurers?.Count > 0)
            {
                // Add previous insurance details by adding a copy of the member for each record
                foreach (var insurer in policyRequest.MainMember.PreviousInsurers)
                {
                    var copy = CopyMember(record);
                    copy.PreviousInsurer = insurer.InsurerName;
                    copy.PreviousInsurerPolicyNumber = insurer.PolicyNumber;
                    copy.PreviousInsurerStartDate = insurer.JoinDate.ToString("yyyy-MM-dd");
                    copy.PreviousInsurerEndDate = insurer.CancellationDate.HasValue
                        ? insurer.CancellationDate.Value.ToString("yyyy-MM-dd")
                        : "";
                    copy.PreviousInsurerCoverAmount = insurer.CoverAmount.ToString("0.00");
                    list.Add(copy);
                }
            }
            else
            {
                list.Add(record);
            }
            return list;
        }

        private List<Load_ConsolidatedFuneral> LoadMainMember(PolicyRequest policyRequest)
        {
            Contract.Requires(policyRequest != null);
            var list = new List<Load_ConsolidatedFuneral>();
            policyRequest.MainMember = FixMemberNames(policyRequest.MainMember);
            var mainMember = new Load_ConsolidatedFuneral
            {
                ClientReference = "XXX000000001",
                ClientType = "Main Member",
                FirstName = policyRequest.MainMember.FirstName,
                Surname = policyRequest.MainMember.Surname,
                MainMemberId = policyRequest.MainMember.IDNumber,
                IdNumber = policyRequest.MainMember.IDNumber,
                PassportNumber = policyRequest.MainMember.PassportNumber,
                DateOfBirth = policyRequest.MainMember.DateOfBirth.ToString("yyyy-MM-dd"),
                Gender = policyRequest.MainMember.Gender,
                BenefitName = policyRequest.MainMember.PolicyCover.BenefitName,
                JoinDate = policyRequest.MainMember.PolicyCover.CommencementDate.Value.ToString("yyyy-MM-dd"),
                AffordibilityChecked = policyRequest.AffordabilityStatus,
                Premium = policyRequest.MainMember.PolicyCover.Premium.ToString("0.00"),
                CoverAmount = policyRequest.MainMember.PolicyCover.CoverAmount.ToString("0.00"),
                DebitOrderDay = policyRequest.DebitOrderDay.ToString(),
                RepIdNumber = policyRequest.RepresentativeID,
                PolicyNumber = policyRequest.PolicyNumber,
                ProductOption = policyRequest.ProductOption,
                AnnualIncreaseOption = policyRequest.AnnualIncreaseOption,
                IncreaseMonth = policyRequest.IncreaseMonth.ToString()
            };
            // Add physical address
            if (policyRequest.PhysicalAddress != null)
            {
                mainMember.Address1 = policyRequest.PhysicalAddress.AddressLine1;
                mainMember.Address2 = policyRequest.PhysicalAddress.AddressLine2;
                mainMember.City = policyRequest.PhysicalAddress.City;
                mainMember.Province = policyRequest.PhysicalAddress.Province;
                mainMember.Country = policyRequest.PhysicalAddress.Country;
                mainMember.PostalCode = policyRequest.PhysicalAddress.PostalCode;
            }
            // Add postal address
            if (policyRequest.PostalAddress != null)
            {
                mainMember.PostalAddress1 = policyRequest.PostalAddress.AddressLine1;
                mainMember.PostalAddress2 = policyRequest.PostalAddress.AddressLine2;
                mainMember.PostalCity = policyRequest.PostalAddress.City;
                mainMember.PostalProvince = policyRequest.PostalAddress.Province;
                mainMember.PostalCountry = policyRequest.PostalAddress.Country;
                mainMember.PostalPostCode = policyRequest.PostalAddress.PostalCode;
            }
            // Contact details
            if (policyRequest.MainMember.ContactDetails != null)
            {
                mainMember.Telephone = policyRequest.MainMember.ContactDetails.Telephone;
                mainMember.Mobile = policyRequest.MainMember.ContactDetails.Mobile;
                mainMember.Email = policyRequest.MainMember.ContactDetails.Email;
                mainMember.PreferredCommunication = policyRequest.MainMember.ContactDetails.PreferredMethodOfCommunication;
            }
            // Add employer details
            if (policyRequest.EmployerDetails != null)
            {
                mainMember.Employer = policyRequest.EmployerDetails.Employer;
                mainMember.Department = policyRequest.EmployerDetails.Department;
                mainMember.PersalNumber = policyRequest.EmployerDetails.EmployeeNumber;
                mainMember.PayrollCode = policyRequest.EmployerDetails.PayrollCode;

            }
            // Add banking details
            if (policyRequest.BankingDetails != null)
            {
                mainMember.Bank = policyRequest.BankingDetails.Bank;
                mainMember.BranchCode = policyRequest.BankingDetails.BranchCode;
                mainMember.AccountNo = policyRequest.BankingDetails.AccountNumber;
                mainMember.AccountType = policyRequest.BankingDetails.AccountType;
            }
            if (policyRequest.MainMember.PreviousInsurers?.Count > 0)
            {
                // Add previous insurance details by adding a copy of the member for each record
                foreach (var insurer in policyRequest.MainMember.PreviousInsurers)
                {
                    var copy = CopyMember(mainMember);
                    copy.PreviousInsurer = insurer.InsurerName;
                    copy.PreviousInsurerPolicyNumber = insurer.PolicyNumber;
                    copy.PreviousInsurerStartDate = insurer.JoinDate.ToString("yyyy-MM-dd");
                    copy.PreviousInsurerEndDate = insurer.CancellationDate.HasValue
                        ? insurer.CancellationDate.Value.ToString("yyyy-MM-dd")
                        : "";
                    copy.PreviousInsurerCoverAmount = insurer.CoverAmount.ToString("0.00");
                    list.Add(copy);
                }
            }
            else
            {
                list.Add(mainMember);
            }
            return list;
        }

        private PolicyMember FixMemberNames(PolicyMember member)
        {
            if (string.IsNullOrEmpty(member.Surname))
            {
                if (!string.IsNullOrEmpty(member.FirstName))
                {
                    var names = member.FirstName.Split(new char[] { ' ' });
                    if (names.Length > 1)
                    {
                        member.Surname = names[names.Length - 1];
                        member.FirstName = string.Join(" ", names.Take(names.Length - 1).ToArray());
                    }
                }
            }
            return member;
        }


        private Load_ConsolidatedFuneral CopyMember(Load_ConsolidatedFuneral source)
        {
            Load_ConsolidatedFuneral copy = null;
            if (source != null)
            {
                copy = new Load_ConsolidatedFuneral
                {
                    Id = source.Id,
                    FileIdentifier = source.FileIdentifier,
                    ClientReference = source.ClientReference,
                    ClientType = source.ClientType,
                    FirstName = source.FirstName,
                    Surname = source.Surname,
                    MainMemberId = source.MainMemberId,
                    IdNumber = source.IdNumber,
                    PassportNumber = source.PassportNumber,
                    DateOfBirth = source.DateOfBirth,
                    Gender = source.Gender,
                    BenefitName = source.BenefitName,
                    JoinDate = source.JoinDate,
                    AffordibilityChecked = source.AffordibilityChecked,
                    Premium = source.Premium,
                    CoverAmount = source.CoverAmount,
                    PreviousInsurer = source.PreviousInsurer,
                    PreviousInsurerPolicyNumber = source.PreviousInsurerPolicyNumber,
                    PreviousInsurerStartDate = source.PreviousInsurerStartDate,
                    PreviousInsurerEndDate = source.PreviousInsurerEndDate,
                    PreviousInsurerCoverAmount = source.PreviousInsurerCoverAmount,
                    Address1 = source.Address1,
                    Address2 = source.Address2,
                    City = source.City,
                    Province = source.Province,
                    Country = source.Country,
                    PostalCode = source.PostalCode,
                    PostalAddress1 = source.PostalAddress1,
                    PostalAddress2 = source.PostalAddress2,
                    PostalCity = source.PostalCity,
                    PostalProvince = source.PostalProvince,
                    PostalCountry = source.PostalCountry,
                    PostalPostCode = source.PostalPostCode,
                    Telephone = source.Telephone,
                    Mobile = source.Mobile,
                    Email = source.Email,
                    PreferredCommunication = source.PreferredCommunication,
                    ProductOption = source.ProductOption,
                    AnnualIncreaseOption = source.AnnualIncreaseOption,
                    IncreaseMonth = source.IncreaseMonth,
                    Employer = source.Employer,
                    PersalNumber = source.PersalNumber,
                    Department = source.Department,
                    Bank = source.Bank,
                    BranchCode = source.BranchCode,
                    AccountNo = source.AccountNo,
                    AccountType = source.AccountType,
                    DebitOrderDay = source.DebitOrderDay,
                    RepIdNumber = source.RepIdNumber,
                    PolicyNumber = source.PolicyNumber,
                    PayrollCode = source.PayrollCode
                };
            }
            return copy;
        }

        public async Task<List<MemberVopdStatus>> GetMemberVopdStatus(Guid fileIdentifier)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var list = await _policyRepository
                    .SqlQueryAsync<MemberVopdStatus>(
                        DatabaseConstants.GetConsolidatedFuneralVopdStatus,
                        new SqlParameter { ParameterName = "@fileIdentifier", Value = fileIdentifier }
                    );
                return list;
            }
        }

        public async Task<int> SendLeadReceivedNotification(Guid fileIdentifier)
        {
            var count = 0;
            var sendNotification = await _configurationService.IsFeatureFlagSettingEnabled("SendCfpApprovalConfirmation");
            if (sendNotification)
            {
                var recipient = await _configurationService.GetModuleSetting(SystemSettings.CfpPolicyApprovedRecipient);
                if (!string.IsNullOrEmpty(recipient))
                {
                    var template = await _configurationService.GetModuleSetting(SystemSettings.CfpPolicyApprovedTemplate);
                    if (!string.IsNullOrEmpty(template))
                    {
                        try
                        {
                            using (_dbContextScopeFactory.CreateReadOnly())
                            {
                                var wizardName = await GetWizardName(fileIdentifier);
                                var members = await _funeralRepository
                                    .Where(m => m.FileIdentifier == fileIdentifier
                                             && m.ClientType == "Main Member")
                                    .ToListAsync();
                                count = members.Count;
                                var body = template.Replace("{0}", GetLeadTable(members));
                                body = body.Replace("{1}", wizardName);
                                await _policyCommunicationService.SendEmail(recipient, "Tablet Lead Received", body);
                            }
                        }
                        catch (Exception ex)
                        {
                            ex.LogException("Tablet Lead Notification Error");
                            throw;
                        }
                    }
                }
            }
            return count;
        }

        private async Task<string> GetWizardName(Guid fileIdentifier)
        {
            var fileIdentifierParameter = new SqlParameter { ParameterName = "@fileIdentifier", Value = fileIdentifier };
            // Use a stored procedure, because the fileIdentifier is part of the wizard data, and the procedure
            // can get the relevant wizard much faster
            var wizardName = await _policyRepository.SqlQueryAsync<string>(
                    DatabaseConstants.GetConsolidatedFuneralWizardName,
                    fileIdentifierParameter
                );
            return wizardName.FirstOrDefault();
        }

        public async Task<int> SendPolicyCreationNotification(Guid fileIdentifier)
        {
            var count = 0;
            var recipient = await _configurationService.GetModuleSetting(SystemSettings.CfpPolicyApprovedRecipient);
            if (!string.IsNullOrEmpty(recipient))
            {
                var template = await _configurationService.GetModuleSetting(SystemSettings.CfpPolicyApprovedTemplate);
                if (!string.IsNullOrEmpty(template))
                {
                    using (_dbContextScopeFactory.CreateReadOnly())
                    {
                        var members = await _memberRepository
                            .Where(m => m.FileIdentifier == fileIdentifier
                                     && m.CoverMemberType == CoverMemberTypeEnum.MainMember)
                            .ToListAsync();
                        count = members.Count;
                        var body = template.Replace("{0}", GetPolicyTable(members));
                        await _policyCommunicationService.SendEmail(recipient, "Tablet Policy Successfully Created", body);
                    }
                }
            }
            return count;
        }

        private string GetLeadTable(List<Load_ConsolidatedFuneral> members)
        {
            var table = "<table><head><tr><th>Member Name</th><th>ID Number</th></tr></head><body>";
            foreach (var member in members)
            {
                table += $"<tr><td>{member.FirstName} {member.Surname}</td><td>{member.IdNumber}</td></tr>";
            }
            table += "</body></table>";
            return table;
        }

        private string GetPolicyTable(List<Load_ConsolidatedFuneralMember> members)
        {
            var table = "<table><head><tr><th>Policy Number</th><th>Member Name</th><th>ID Number</th></tr></head><body>";
            foreach (var member in members)
            {
                table += $"<tr><td>{member.PolicyNumber}</td><td>{member.MemberName}</td><td>{member.IdNumber}</td></tr>";
            }
            table += "</body></table>";
            return table;
        }

        public async Task<bool> ProcessPolicyRequestReferenceMessageAsync(PolicyRequestReferenceMessage policyRequestReferenceMessage)
        {

            Contract.Requires(policyRequestReferenceMessage != null);
            Contract.Requires(policyRequestReferenceMessage.PolicyRequestReference != null);
            Contract.Requires(policyRequestReferenceMessage.PolicyRequestReference.ClaimCheckReference != null);

            var enviroment = await _configurationService.GetModuleSetting(SystemSettings.IntegrationEnviroment);
            var createdDate = DateTimeHelper.SaNow;

            var messageType = new MessageType
            {
                MessageBody = policyRequestReferenceMessage.PolicyRequestReference.ClaimCheckReference,
                From = "Matla Tablet App",
                To = "CFP Listener",
                MessageTaskType = string.Empty,
                Environment = enviroment,
                EnqueuedTime = createdDate,
            };

            var messageId = await _serviceBusMessage.AddServiceBusMessage(messageType);

            var policyRequest = await _qlinkService.GetPolicyDetailRequestAsync(policyRequestReferenceMessage.PolicyRequestReference.ClaimCheckReference).ConfigureAwait(false);
            if (policyRequest != null)
            {
                _ = await _leadTimeTrackerService.CreateLeadTimeTrackerAsyn(messageId, policyRequest);
                _ = await StageImportedConsolidatedFuneral(policyRequest).ConfigureAwait(false);
            }

            return true;
        }

        public async Task<string> GetPolicyNumber(Guid fileIdentifier)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {

                var data = await _funeralRepository
                    .FirstOrDefaultAsync(s => s.FileIdentifier.Equals(fileIdentifier)
                                           && !string.IsNullOrEmpty(s.ClientReference));
                var clientReference = data.ClientReference;
                return clientReference.StartsWith("X", StringComparison.OrdinalIgnoreCase) ? null : clientReference;
            }
        }

        public async Task<List<ConsolidatedFuneralMember>> GetFuneralMembers(Guid fileIdentifier)
        {
            var membersModel = new List<ConsolidatedFuneralMember>();
            if (fileIdentifier != null)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var members = await _memberRepository
                       .Where(x => x.FileIdentifier.Equals(fileIdentifier))
                       .ToListAsync();



                    // TODO: use autoMapper. AutoMapper is currently throwing an error when mapping MemberCoverType
                    foreach (var member in members)
                    {
                        membersModel.Add(new ConsolidatedFuneralMember
                        {
                            BenefitName = member.BenefitName,
                            ClientReference = member.ClientReference,
                            BenefitId = member.BenefitId,
                            Affordability = member.Affordability,
                            Age = member.Age,
                            AnnualIncreaseMonth = member.AnnualIncreaseMonth,
                            AnnualIncreaseType = member.AnnualIncreaseType,
                            CellNo = member.CelNo,
                            City = member.City,
                            Country = member.Country,
                            DebitOrderDay = member.DebitOrderDay,
                            ExistingCover = member.ExistingCover,
                            FileIdentifier = member.FileIdentifier,
                            Gender = member.Gender,
                            IdNumber = member.IdNumber,
                            IdType = member.IdType,
                            JoinAge = member.JoinAge,
                            MainMemberRolePlayerId = member.MainMemberRolePlayerId,
                            MemberName = member.MemberName,
                            Multiplier = member.Multiplier,
                            PaymentMethod = member.PaymentMethod,
                            PolicyCover = member.PolicyCover,
                            PolicyExists = member.PolicyExists,
                            PolicyId = member.PolicyId,
                            PolicyNumber = member.PolicyNumber,
                            PolicyPremium = member.PolicyPremium,
                            BrokerageId = member.BrokerageId,
                            CoverMemberType = member.CoverMemberType.GetDescription(),
                            DateOfBirth = member.DateOfBirth,
                            JoinDate = member.JoinDate,
                            FirstName = member.FirstName,
                            Email = member.Email,
                            Id = member.Id,
                            MainMemberIdNumber = member.MainMemberIdNumber
                        });
                    }

                    return membersModel;
                }
            }
            return membersModel;
        }

        #endregion
    }
}
