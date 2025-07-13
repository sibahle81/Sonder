using AutoMapper;

using Newtonsoft.Json;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Attributes;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.Contracts.Utils;
using RMA.Service.ClientCare.Database.Constants;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.ClientCare.Mappers;
using RMA.Service.Integrations.Contracts.Entities.Vopd;

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

using TinyCsvParser;
using TinyCsvParser.Mapping;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class GroupRiskFacade : RemotingStatelessService, IGroupRiskService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IRepository<client_Person> _personRepository;
        private readonly IRepository<Load_StageGroupRisk> _stageGroupRiskRepository;
        private readonly IRepository<client_PersonEmployment> _personEmployment;
        private readonly IConfigurationService _configurationService;
        private readonly ICountryService _countryService;
        private readonly IRepository<policy_Insurer> _insurerRepository;
        private readonly IRepository<policy_PolicyBroker> _policyBrokerRepository;
        private readonly IRepository<policy_PolicyInsuredLife> _insuredLifeRepository;
        private readonly IRepository<client_RolePlayer> _rolePlayerRepository;
        private readonly IRepository<client_RolePlayerAddress> _addressRepository;
        private readonly IRepository<client_RolePlayerRelation> _relationRepository;
        private readonly IRepository<product_Benefit> _benefitRepository;
        private readonly IRepository<Load_StageGroupRiskError> _stageGroupRiskErrorRepository;
        private readonly IRepository<client_UserVopdResponse> _userVopdRepository;
        private readonly IRepository<product_ProductOption> _productOptionRepository;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IProductOptionService _productOptionService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IBrokerageService _brokerageService;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IRepresentativeService _representativeService;
        private readonly IProductOptionRuleService _productOptionRuleService;
        private const int DefaultPreferredCommunicationType = 4;
        private const int TenantAndInsurerId = 1;
        private readonly IRepository<policy_BenefitPayroll> _benefitPayrollRepository;
        private readonly IInvoiceService _invoiceService;

        private const string GlaGroupRiskProductOptionCode = "GLA";
        private const string GpaGroupRiskProductOptionCode = "GPA";

        public GroupRiskFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<policy_Policy> policyRepository,
            IRepository<client_Person> personRepository,
            IRepository<Load_StageGroupRisk> stageGroupRiskRepository,
            IRolePlayerService rolePlayerService,
            IConfigurationService configurationService,
            ICountryService countryService,
            IRepository<policy_Insurer> insurerRepository,
            IRepository<policy_PolicyBroker> policyBrokerRepository,
            IRepository<policy_PolicyInsuredLife> insuredLifeRepository,
            IRepository<client_RolePlayer> rolePlayerRepository,
            IRepository<client_RolePlayerAddress> addressRepository,
            IRepository<client_RolePlayerRelation> relationRepository,
            IRepository<client_PersonEmployment> personEmployment,
            IRepository<product_Benefit> benefitRepository,
            IRepository<Load_StageGroupRiskError> stageGroupRiskErrorRepository,
            IRepository<client_UserVopdResponse> userVopdRepository,
            IRepository<product_ProductOption> productOptionRepository,
            IDocumentGeneratorService documentGeneratorService,
            IProductOptionService productOptionService,
            IBrokerageService brokerageService,
            IRolePlayerPolicyService rolePlayerPolicyService,
            IRepresentativeService representativeService,
            IProductOptionRuleService productOptionRuleService,
            IRepository<policy_BenefitPayroll> benefitPayrollRepository,
            IInvoiceService invoiceService
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _policyRepository = policyRepository;
            _personRepository = personRepository;
            _stageGroupRiskRepository = stageGroupRiskRepository;
            _rolePlayerService = rolePlayerService;
            _configurationService = configurationService;
            _countryService = countryService;
            _policyRepository = policyRepository;
            _insurerRepository = insurerRepository;
            _policyBrokerRepository = policyBrokerRepository;
            _insuredLifeRepository = insuredLifeRepository;
            _rolePlayerRepository = rolePlayerRepository;
            _addressRepository = addressRepository;
            _relationRepository = relationRepository;
            _personRepository = personRepository;
            _benefitRepository = benefitRepository;
            _stageGroupRiskErrorRepository = stageGroupRiskErrorRepository;
            _productOptionRepository = productOptionRepository;
            _documentGeneratorService = documentGeneratorService;
            _productOptionService = productOptionService;
            _personEmployment = personEmployment;
            _brokerageService = brokerageService;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _representativeService = representativeService;
            _userVopdRepository = userVopdRepository;
            _productOptionRuleService = productOptionRuleService;
            _benefitPayrollRepository = benefitPayrollRepository;
            _invoiceService = invoiceService;
        }


        private List<string> ValidateImportFileLine(GroupRiskMemberRecord groupRiskMemberRecord)
        {
            var errors = new List<string>();
            if (groupRiskMemberRecord != null)
            {
                var type = groupRiskMemberRecord.GetType();
                var properties = type.GetProperties();
                var propertyInfos = new List<PropertyInfo>();

                foreach (var property in properties)
                {
                    var customAttributes = property.GetCustomAttributes(true);

                    foreach (var attr in customAttributes)
                    {
                        var importFieldParameterAttribute = attr as ImportFieldParameterAttribute;

                        if (importFieldParameterAttribute != null && importFieldParameterAttribute.IsRequiredForStaging)
                        {
                            propertyInfos.Add(property);
                        }
                    }
                }

                foreach (var propertyInfo in propertyInfos)
                {
                    var propertyValue = propertyInfo.GetValue(groupRiskMemberRecord, null);
                    var propertyValueRaw = propertyValue == null ? "" : propertyValue.ToString().Trim();

                    switch (propertyInfo.Name)
                    {
                        case nameof(groupRiskMemberRecord.IdOrPassport):
                            var idValidationResults = ValidateIdNumberProperty(groupRiskMemberRecord);

                            if (!string.IsNullOrEmpty(idValidationResults))
                            {
                                errors.Add(idValidationResults);
                            }

                            break;

                        case nameof(groupRiskMemberRecord.Email):
                            var eamilValidationResults = ValidateEmailAddressProperty(groupRiskMemberRecord);

                            if (!string.IsNullOrEmpty(eamilValidationResults))
                            {
                                errors.Add(eamilValidationResults);
                            }

                            break;

                        default:
                            if (string.IsNullOrEmpty(propertyValueRaw))
                            {
                                errors.Add($"{propertyInfo.Name} cannot be blank");
                            }

                            break;
                    }

                }
            }
            return errors;
        }

        private string ValidateIdNumberProperty(GroupRiskMemberRecord groupRiskMemberRecord)
        {
            var errorMessage = "";
            long idNumber;
            if (groupRiskMemberRecord != null)
            {
                var memberIdType = (IdTypeEnum)Enum.Parse(typeof(IdTypeEnum), groupRiskMemberRecord.IdentityType);

                if (memberIdType == IdTypeEnum.SAIDDocument
                    && (groupRiskMemberRecord.IdOrPassport.Length != 13 || !long.TryParse(groupRiskMemberRecord.IdOrPassport, out idNumber)))
                {
                    errorMessage = $"{groupRiskMemberRecord.IdOrPassport} is not a valid SA ID number";
                }
            }
            return errorMessage;
        }

        private string ValidateEmailAddressProperty(GroupRiskMemberRecord groupRiskMemberRecord)
        {
            var errorMessage = "";
            if (groupRiskMemberRecord != null)
            {
                if ((CommunicationTypeEnum)Enum.Parse(typeof(CommunicationTypeEnum), groupRiskMemberRecord.MemberPreferredMethodOfCommunication) != CommunicationTypeEnum.Email)
                {
                    return errorMessage;
                }

                var isValidEmailAddress = RegexUtilities.IsValidEmail(groupRiskMemberRecord.Email);

                if (isValidEmailAddress)
                {
                    return errorMessage;
                }

                errorMessage = $"{groupRiskMemberRecord.Email} is not a valid email address";
            }
            return errorMessage;
        }

        private List<CsvMappingResult<TEntity>> ReadUploadedFile<T, TEntity>(FileContentImport content)
            where T : ICsvMapping<TEntity>
            where TEntity : class, new()
        {
            var csvMapper = (T)Activator.CreateInstance(typeof(T));

            Contract.Requires(content != null);
            if (string.IsNullOrEmpty(content.Data))
            {
                throw new NullReferenceException("File content cannot be null");
            }

            var decodedString = Convert.FromBase64String(content.Data);
            const int startingIndex = 0;
            var fileData = Encoding.UTF8.GetString(decodedString, startingIndex, decodedString.Length);
            var companyIndex = fileData.IndexOf("Employee Industry Number", StringComparison.Ordinal);

            if (companyIndex != -1)
            {
                fileData = fileData.Substring(companyIndex);
            }

            const char commaDelimiter = ',';
            const string newLine = "\n";

            var csvParserOptions = new CsvParserOptions(true, commaDelimiter);
            var csvParser = new CsvParser<TEntity>(csvParserOptions, csvMapper);

            var csvReaderOptions = new CsvReaderOptions(new[] { newLine });
            var records = csvParser.ReadFromString(csvReaderOptions, fileData).ToList();

            return records;
        }

        public async Task<List<string>> ImportGroupRisk(string fileName, int schemeRolePlayerPayeeId,
            string productOptionCode, FileContentImport content)
        {
            Contract.Requires(productOptionCode != null);

            var errors = new List<string>();

            var productOptionId = await GetProductOptionByProductOptionCode(productOptionCode);
            var records = new List<CsvMappingResult<GroupRiskMemberRecord>>();

            if (productOptionCode.StartsWith(GlaGroupRiskProductOptionCode + ":", StringComparison.OrdinalIgnoreCase))
            {
                records = ReadUploadedFile<GroupRiskGLAProductOptionNewMemberMapping, GroupRiskMemberRecord>(content);
            }
            else if (productOptionCode.StartsWith(GpaGroupRiskProductOptionCode + ":", StringComparison.OrdinalIgnoreCase))
            {
                records = ReadUploadedFile<GroupRiskGPAProductOptionNewMemberMapping, GroupRiskMemberRecord>(content);
            }
            else
            {
                records = ReadUploadedFile<GroupRiskOtherProductOptionNewMemberMapping, GroupRiskMemberRecord>(content);
            }

            var fileIdentifier = Guid.NewGuid();
            var groupRiskDataList = new List<GroupRiskMemberRecord>();
            var rowNumber = 2; // First line containing data in the spreadsheet.

            var schemeHasBeenOnBoarded =
                await ValidateIfSchemeHasBeenOboarded(schemeRolePlayerPayeeId, productOptionId);
            if (!schemeHasBeenOnBoarded)
            {
                errors.Add($"Please on-board the scheme before on-boarding the scheme members.");
            }

            foreach (var record in records)
            {
                if (!record.IsValid)
                {
                    errors.Add($"Error on line {rowNumber} column {record.Error.ColumnIndex}: {record.Error.Value}");
                    rowNumber++;
                    continue;
                }
                else
                {
                    if (record.Result == null)
                    {
                        errors.Add($"Mapping error on line {rowNumber}: Cannot parse row");
                        rowNumber++;
                        continue;
                    }
                    if (string.IsNullOrEmpty(record.Result.IdentityType) && string.IsNullOrEmpty(record.Result.IdOrPassport))
                    {
                        // Blank row, just continue
                        rowNumber++;
                        continue;
                    }
                }

                var importLineErrors = ValidateImportFileLine(record.Result);

                if (importLineErrors.Count > 0)
                {
                    errors.Add($"Error on line {rowNumber} : {string.Join(",", importLineErrors)}");
                }
                else
                {
                    var groupRiskData = record.Result;
                    groupRiskData.FileIdentifier = fileIdentifier;
                    groupRiskData.ExcelRowNumber = rowNumber;
                    groupRiskData.ProductOptionId = productOptionId;
                    groupRiskData.SchemeRolePlayerPayeeId = schemeRolePlayerPayeeId;
                    groupRiskDataList.Add(groupRiskData);
                }

                rowNumber++;
            }

            if (errors.Count == 0)
            {
                await StageGroupRiskRecords(groupRiskDataList);
            }

            return errors;
        }

        private async Task<int> GetProductOptionByProductOptionCode(string productOptionCode)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {

                var productOption = await _productOptionRepository.FirstOrDefaultAsync(x => x.Code == productOptionCode);

                if (productOption != null)
                {
                    return productOption.Id;
                }
                else
                {
                    throw new NullReferenceException(
                        $"Product Option with product option code {productOptionCode} not found.");
                }
            }
        }

        private async Task<bool> ValidateIfSchemeHasBeenOboarded(int schemeRolePlayerPayeeId, int schemeProductOptionId)
        {
            var companySchemePoliciesList =
                await _rolePlayerPolicyService.GetRolePlayerPolicyByRolePlayerId(schemeRolePlayerPayeeId);
            var companyScheme = companySchemePoliciesList.FirstOrDefault(x =>
                x.PolicyOwnerId == schemeRolePlayerPayeeId && x.PolicyPayeeId == schemeRolePlayerPayeeId &&
                x.ProductOptionId == schemeProductOptionId);

            return companyScheme != null;
        }

        private DateTime GetDateFromOADate(string excelDate)
        {
            var excelDateNumericForm = double.Parse(excelDate);
            var convertedDate = DateTime.FromOADate(excelDateNumericForm);
            return convertedDate;
        }

        private async Task<int> CreateWizardTask(string company, Guid fileIdentifier, WizardStatusEnum status)
        {
            var email = string.IsNullOrEmpty(RmaIdentity.Email) ? RmaIdentity.BackendServiceName : RmaIdentity.Email;
            var fileIdentifierParameter = new SqlParameter { ParameterName = "@fileIdentifier", Value = fileIdentifier };
            var companyParameter = new SqlParameter { ParameterName = "@company", Value = company };
            var userIdParameter = new SqlParameter { ParameterName = "@userId", Value = email };
            var wizardStatusParameter = new SqlParameter { ParameterName = "@wizardStatus", Value = (int)status };

            var results = await _stageGroupRiskRepository.SqlQueryAsync<int>(
                DatabaseConstants.GenerateGroupRiskTask, fileIdentifierParameter, companyParameter, userIdParameter,
                wizardStatusParameter
            );

            return results.FirstOrDefault();
        }


        private async Task<bool> SaveStageGroupRiskRecords(List<GroupRiskMemberRecord> groupRiskMemberRecords)
        {
            var groupRiskMember = groupRiskMemberRecords.FirstOrDefault();
            var companyRolePlayer = await _rolePlayerService.GetCompany(groupRiskMember.SchemeRolePlayerPayeeId);
            var productOption = await _productOptionService.GetProductOption(groupRiskMember.ProductOptionId);
            var companySchemePoliciesList =
                await _rolePlayerPolicyService.GetRolePlayerPolicyByRolePlayerId(
                    groupRiskMember.SchemeRolePlayerPayeeId);
            var companyScheme = companySchemePoliciesList.FirstOrDefault(x =>
                x.PolicyPayeeId == groupRiskMember.SchemeRolePlayerPayeeId &&
                x.ProductOptionId == groupRiskMember.ProductOptionId);
            var brokerage = await _brokerageService.GetBrokerage(companyScheme.BrokerageId);
            var representative =
                await _representativeService.GetRepresentativeReferenceData(companyScheme.RepresentativeId);

            var company = $"Group Risk -{productOption.Code}";

            using (var scope = _dbContextScopeFactory.Create())
            {
                var wizardId =
                    await CreateWizardTask(company, groupRiskMember.FileIdentifier, WizardStatusEnum.InProgress);

                foreach (var groupRiskMemberRecord in groupRiskMemberRecords)
                {
                    var benefitId = productOption?.Benefits.FirstOrDefault(x => string.Equals(x.Name,
                            groupRiskMemberRecord.ProductBenefitOption.Trim(),
                            StringComparison.CurrentCultureIgnoreCase))
                        ?.Id;

                    var entity = new Load_StageGroupRisk
                    {
                        WizardId = wizardId,
                        ExcelRowNumber = groupRiskMemberRecord.ExcelRowNumber,
                        FileIdentifier = groupRiskMemberRecord.FileIdentifier.ToString(),
                        SchemeNumber = companyRolePlayer.FinPayee?.FinPayeNumber,
                        BranchName = "",
                        FinPayeeRolePlayerId = companyRolePlayer.RolePlayerId,
                        EmployeeIndustryNumber = groupRiskMemberRecord.EmployeeIndustryNumber,
                        EmployeeNumber = groupRiskMemberRecord.EmployeeNumber,
                        IdOrPassport = groupRiskMemberRecord.IdOrPassport,
                        IdentityTypeId =
                            (int)(IdTypeEnum)Enum.Parse(typeof(IdTypeEnum), groupRiskMemberRecord.IdentityType),
                        DateOfBirth = string.IsNullOrWhiteSpace(groupRiskMemberRecord.DateOfBirth)
                            ? DateTime.MinValue
                            : GetDateFromOADate(groupRiskMemberRecord.DateOfBirth),
                        FirstName = groupRiskMemberRecord.FirstName,
                        Surname = groupRiskMemberRecord.Surname,
                        Gender = (GenderEnum)Enum.Parse(typeof(GenderEnum), groupRiskMemberRecord.Gender),
                        MobileNumber = groupRiskMemberRecord.Cell,
                        Email = groupRiskMemberRecord.Email,
                        RepresentativeIdNumber = representative.IdNumber,
                        BrokerageFspNumber = brokerage.FspNumber,
                        PreferredStakeholderCommunication = groupRiskMemberRecord.PreferredStakeholderCommunication,
                        MemberPreferredMethodOfCommunicationId = (int)(CommunicationTypeEnum)Enum.Parse(
                            typeof(CommunicationTypeEnum),
                            groupRiskMemberRecord.MemberPreferredMethodOfCommunication),
                        MonthlyRiskSalary = string.IsNullOrWhiteSpace(groupRiskMemberRecord.MonthlyRiskSalary)
                            ? 0
                            : Convert.ToDecimal(groupRiskMemberRecord.MonthlyRiskSalary) / 100.0M,
                        EmployeeStartDate = string.IsNullOrWhiteSpace(groupRiskMemberRecord.EmployeeStartDate)
                            ? DateTime.MinValue
                            : GetDateFromOADate(groupRiskMemberRecord.EmployeeStartDate),
                        PolicyStartDate = string.IsNullOrWhiteSpace(groupRiskMemberRecord.PolicyStartDate)
                            ? DateTime.MinValue
                            : GetDateFromOADate(groupRiskMemberRecord.PolicyStartDate),
                        PolicyNumber = groupRiskMemberRecord.PolicyNumber,
                        ProductOptionId = groupRiskMemberRecord.ProductOptionId,
                        BenefitId = benefitId != null ? benefitId.Value : 0,
                        GroupRiskPolicyActionType = string.IsNullOrWhiteSpace(groupRiskMemberRecord.PolicyAction)
                            ? GroupRiskPolicyActionTypeEnum.Add
                            : (GroupRiskPolicyActionTypeEnum)Enum.Parse(typeof(GroupRiskPolicyActionTypeEnum),
                                groupRiskMemberRecord.PolicyAction),
                        BenefitMultiplier = groupRiskMemberRecord.BenefitMultiplier,
                        GroupRiskStagingStatusType = GroupRiskStagingStatusTypeEnum.Pending,
                        IsDeleted = false,
                        CreatedDate = DateTimeHelper.SaNow,
                        CreatedBy = RmaIdentity.Email,
                        ModifiedDate = DateTimeHelper.SaNow,
                        ModifiedBy = RmaIdentity.Email,
                    };

                    _stageGroupRiskRepository.Create(entity);
                }

                return await scope.SaveChangesAsync().ConfigureAwait(false) > 0;
            }
        }

        //Called when  staging the records
        private async Task<bool> StageGroupRiskRecords(List<GroupRiskMemberRecord> groupRiskMemberRecords)
        {
            Contract.Requires(groupRiskMemberRecords != null);

            var stagedGroupRiskRecords = new List<Load_StageGroupRisk>();
            var stagedGroupRisKErrorList = new List<Load_StageGroupRiskError>();
            var results = await SaveStageGroupRiskRecords(groupRiskMemberRecords);

            if (results)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var groupRiskMember = groupRiskMemberRecords.FirstOrDefault();
                    var fileIdentifier = groupRiskMember.FileIdentifier.ToString();

                    stagedGroupRiskRecords = await _stageGroupRiskRepository
                        .Where(x => x.FileIdentifier == fileIdentifier).ToListAsync();
                    await SavePolicyMemberRolePlayers(stagedGroupRiskRecords);
                    var vopdErrors = await ProcessVopdCheck(stagedGroupRiskRecords);
                    var productOptionErrors = await ProcessProductOptionRulesCheck(stagedGroupRiskRecords);
                    var policyInceptionErrors = ProcessPolicyInceptionRuleCheck(stagedGroupRiskRecords);

                    if (vopdErrors.Count > 0 || productOptionErrors.Count > 0 || policyInceptionErrors.Count > 0)
                    {
                        stagedGroupRisKErrorList.AddRange(vopdErrors);
                        stagedGroupRisKErrorList.AddRange(productOptionErrors);
                        stagedGroupRisKErrorList.AddRange(policyInceptionErrors);

                        foreach (var stagedError in stagedGroupRisKErrorList)
                        {
                            stagedError.ModifiedDate = DateTimeHelper.SaNow;
                            stagedError.ModifiedBy = RmaIdentity.Email;
                            stagedError.CreatedDate = DateTimeHelper.SaNow;
                            stagedError.CreatedBy = RmaIdentity.Email;
                            _stageGroupRiskErrorRepository.Create(stagedError);
                        }
                    }

                    results = await scope.SaveChangesAsync().ConfigureAwait(false) > 0;
                }
            }

            return results;
        }


        private async Task SavePersonEmployment(List<Load_StageGroupRisk> stagedGroupRiskRecords)
        {
            if (stagedGroupRiskRecords != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var employeeRolePlayerIds = stagedGroupRiskRecords.Select(y => y.EmployeeRolePlayerId).ToList();
                    var employerRolePlayerIds = stagedGroupRiskRecords.Select(y => y.FinPayeeRolePlayerId).ToList();
                    var existingPersonEmployeeList = await _personEmployment.Where(x =>
                        employeeRolePlayerIds.Contains(x.EmployerRolePlayerId) &&
                        employerRolePlayerIds.Contains(x.EmployerRolePlayerId)).ToListAsync();

                    foreach (var stagedGroupRiskRecord in stagedGroupRiskRecords)
                    {
                        var existingPersonEmployee = existingPersonEmployeeList.FirstOrDefault(x =>
                            x.EmployeeRolePlayerId == stagedGroupRiskRecord.EmployeeRolePlayerId &&
                            x.EmployerRolePlayerId == stagedGroupRiskRecord.FinPayeeRolePlayerId);

                        if (existingPersonEmployee == null)
                        {
                            var personEmployment = new PersonEmployment
                            {
                                EmployeeRolePlayerId = stagedGroupRiskRecord.EmployeeRolePlayerId,
                                EmployerRolePlayerId = stagedGroupRiskRecord.FinPayeeRolePlayerId,
                                EmployeeIndustryNumber = stagedGroupRiskRecord.EmployeeIndustryNumber,
                                EmployeeNumber = stagedGroupRiskRecord.EmployeeNumber,
                                IsDeleted = false,
                                CreatedDate = DateTimeHelper.SaNow,
                                CreatedBy = RmaIdentity.Email,
                                ModifiedDate = DateTimeHelper.SaNow,
                                ModifiedBy = RmaIdentity.Email,
                            };

                            var results = await _rolePlayerService.CreatePersonEmployment(personEmployment);
                        }
                        else
                        {
                            existingPersonEmployee.EmployeeIndustryNumber = stagedGroupRiskRecord.EmployeeIndustryNumber;
                            existingPersonEmployee.ModifiedBy = RmaIdentity.Email;
                            existingPersonEmployee.ModifiedDate = DateTimeHelper.SaNow;
                            var personEmployment = Mapper.Map<PersonEmployment>(existingPersonEmployee);

                            await _rolePlayerService.EditPersonEmployment(personEmployment);
                        }
                    }

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        private async Task UpdatePolicyInsuredLives(List<Load_StageGroupRisk> policyMembers)
        {
            if (policyMembers != null && policyMembers.Count > 0)
            {
                using (_dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
                {
                    var policyIds = policyMembers.Select(x => x.PolicyId).ToList();

                    var insuredLives = await _insuredLifeRepository
                        .Where(r => policyIds.Contains(r.PolicyId))
                        .ToListAsync();


                    foreach (var member in policyMembers)
                    {
                        var entity = insuredLives
                            .SingleOrDefault(l => l.RolePlayerId == member.EmployeeRolePlayerId);

                        switch (member.GroupRiskPolicyActionType)
                        {
                            case GroupRiskPolicyActionTypeEnum.Add:
                            case GroupRiskPolicyActionTypeEnum.Update:
                                if (entity is null)
                                {
                                    var life = GetPolicyInsuredLife(member);
                                    _insuredLifeRepository.Create(life);
                                }
                                else
                                {
                                    entity.RolePlayerTypeId = (int)RolePlayerTypeEnum.MainMemberSelf;
                                    entity.InsuredLifeStatus = InsuredLifeStatusEnum.Active;
                                    entity.StatedBenefitId = member.BenefitId;
                                    entity.StartDate = member.PolicyStartDate;
                                    entity.EndDate = null;
                                    entity.Earnings = member.MonthlyRiskSalary;
                                    entity.CoverAmount = 0; //  to find out how we calculate the premiums 
                                    entity.Premium = 0;
                                    _insuredLifeRepository.Update(entity);
                                }

                                break;
                            case GroupRiskPolicyActionTypeEnum.Delete:
                                if (entity != null)
                                {
                                    entity.InsuredLifeStatus = InsuredLifeStatusEnum.Cancelled;
                                    entity.EndDate = DateTimeHelper.EndOfTheMonth(DateTime.Today);
                                    _insuredLifeRepository.Update(entity);
                                }

                                break;
                        }
                    }
                }
            }
        }

        private policy_PolicyInsuredLife GetPolicyInsuredLife(Load_StageGroupRisk member)
        {
            var life = new policy_PolicyInsuredLife
            {
                PolicyId = member.PolicyId.Value,
                RolePlayerId = member.EmployeeRolePlayerId,
                RolePlayerTypeId = (int)RolePlayerTypeEnum.MainMemberSelf,
                InsuredLifeStatus = InsuredLifeStatusEnum.Active,
                StatedBenefitId = member.BenefitId,
                StartDate = member.PolicyStartDate,
                EndDate = null,
                Earnings = member.MonthlyRiskSalary,
                CoverAmount = 0, // to find out how we calculate the premiums  
                Premium = 0
            };

            return life;
        }

        private async Task SavePolicyMemberRolePlayers(List<Load_StageGroupRisk> stagedGroupRiskRecords)
        {
            using (_dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                var idNumbers = stagedGroupRiskRecords.Select(m => m.IdOrPassport.ToLower()).ToList().Distinct();
                var persons = await _personRepository
                    .Where(p => idNumbers.Contains(p.IdNumber.ToLower()))
                    .ToListAsync();

                foreach (var person in persons)
                {
                    var member = stagedGroupRiskRecords.Single(p =>
                        string.Equals(p.IdOrPassport, person.IdNumber, StringComparison.OrdinalIgnoreCase));
                    member.EmployeeRolePlayerId = person.RolePlayerId;
                    await UpdateRolePlayerPerson(member);
                }

                foreach (var member in stagedGroupRiskRecords)
                {
                    if (member.EmployeeRolePlayerId == 0)
                    {
                        member.EmployeeRolePlayerId =
                            await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);
                        CreateRolePlayerPerson(member);
                    }
                }
            }
        }

        private void CreateRolePlayerPerson(Load_StageGroupRisk member)
        {
            if (member != null)
            {
                using (_dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
                {
                    var rolePlayer = new client_RolePlayer
                    {
                        RolePlayerId = member.EmployeeRolePlayerId,
                        DisplayName = $"{member.FirstName} {member.Surname}",
                        CellNumber = member.MobileNumber,
                        EmailAddress = member.Email,
                        PreferredCommunicationTypeId = member.MemberPreferredMethodOfCommunicationId > 0
                            ? member.MemberPreferredMethodOfCommunicationId
                            : 4,
                        RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person,
                        IsDeleted = false,
                    };

                    _rolePlayerRepository.Create(rolePlayer);

                    var person = new client_Person
                    {
                        RolePlayerId = member.EmployeeRolePlayerId,
                        FirstName = member.FirstName,
                        Surname = member.Surname,
                        IdType = (IdTypeEnum)member.IdentityTypeId,
                        IdNumber = member.IdOrPassport,
                        DateOfBirth = member.DateOfBirth.ToSaDateTime(),
                        IsAlive = true,
                        IsDeleted = false
                    };
                    _personRepository.Create(person);
                }
            }
        }

        private async Task SaveRolePlayerRelations(List<Load_StageGroupRisk> policyMembers)
        {
            if (policyMembers != null && policyMembers.Count > 0)
            {
                using (_dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
                {
                    var policyIds = policyMembers.Where(x => x.PolicyId.HasValue).Select(x => x.PolicyId).ToList();
                    var relations = await _relationRepository
                        .Where(r => policyIds.Contains(r.PolicyId))
                        .ToListAsync();

                    foreach (var member in policyMembers.Where(x => x.PolicyId.HasValue))
                    {
                        AddMemberRelation(relations, member.PolicyId.Value, member.EmployeeRolePlayerId,
                            member.EmployeeRolePlayerId, RolePlayerTypeEnum.MainMemberSelf);
                        AddMemberRelation(relations, member.PolicyId.Value, member.EmployeeRolePlayerId,
                            member.EmployeeRolePlayerId, RolePlayerTypeEnum.Beneficiary);
                    }
                }
            }
        }
        private void AddMemberRelation(List<client_RolePlayerRelation> relations, int policyId, int fromRolePlayerId,
            int toRolePlayerId, RolePlayerTypeEnum rolePlayerType)
        {
            using (_dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                var relation = relations
                    .SingleOrDefault(r => r.FromRolePlayerId == fromRolePlayerId
                                          && r.ToRolePlayerId == toRolePlayerId
                                          && r.RolePlayerTypeId == (int)rolePlayerType
                                          && r.PolicyId == policyId);
                if (relation is null)
                {
                    var rolePlayerRelation = new client_RolePlayerRelation
                    {
                        PolicyId = policyId,
                        FromRolePlayerId = fromRolePlayerId,
                        ToRolePlayerId = toRolePlayerId,
                        RolePlayerTypeId = (int)rolePlayerType
                    };
                    _relationRepository.Create(rolePlayerRelation);
                }
            }
        }

        private async Task UpdateRolePlayerPerson(Load_StageGroupRisk member)
        {
            if (member != null)
            {
                using (_dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
                {
                    var rolePlayer =
                        await _rolePlayerRepository.SingleAsync(r => r.RolePlayerId == member.EmployeeRolePlayerId);
                    rolePlayer.DisplayName = $"{member.FirstName} {member.Surname}";
                    rolePlayer.CellNumber = member.MobileNumber;
                    rolePlayer.EmailAddress = member.Email;
                    rolePlayer.PreferredCommunicationTypeId = member.MemberPreferredMethodOfCommunicationId > 0
                        ? member.MemberPreferredMethodOfCommunicationId
                        : DefaultPreferredCommunicationType;
                    rolePlayer.RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
                    rolePlayer.IsDeleted = false;
                    _rolePlayerRepository.Update(rolePlayer);

                    var person = await _personRepository.SingleAsync(p => p.RolePlayerId == member.EmployeeRolePlayerId);
                    person.FirstName = member.FirstName;
                    person.Surname = member.Surname;
                    person.IdType = (IdTypeEnum)member.IdentityTypeId;
                    person.IdNumber = member.IdOrPassport;
                    person.DateOfBirth = member.DateOfBirth.ToSaDateTime();
                    person.IsAlive = true;
                    person.IsDeleted = false;
                    _personRepository.Update(person);
                }
            }
        }

        //Gets called when opening  wizard step 2
        public async Task<List<StageGroupRiskMember>> GetStagedGroupRiskMembers(Guid fileIdentifier)
        {
            List<StageGroupRiskMember> stageGroupRiskMemberModels = null;
            if (fileIdentifier != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var fileId = fileIdentifier.ToString();
                    var stagedGroupRiskRecords =
                        await _stageGroupRiskRepository.Where(x => x.FileIdentifier == fileId).ToListAsync();
                    var stagedGroupRiskRecordIds = stagedGroupRiskRecords.Select(x => x.StageGroupRiskId).ToList();
                    var stagedGroupRiskErrors = await _stageGroupRiskErrorRepository
                        .Where(y => stagedGroupRiskRecordIds.Contains(y.StageGroupRiskId.Value)).ToListAsync();

                    stageGroupRiskMemberModels = Mapper.Map<List<StageGroupRiskMember>>(stagedGroupRiskRecords);

                    foreach (var stageGroupRiskMemberModel in stageGroupRiskMemberModels)
                    {
                        var errObject = stagedGroupRiskErrors.FirstOrDefault(err =>
                            stageGroupRiskMemberModel.StageGroupRiskId == err.StageGroupRiskId &&
                            err.ErrorMessage.Contains("VOPD"));
                        stageGroupRiskMemberModel.Note = errObject != null ? "Failed" : "Passed";
                    }

                }
            }
            return stageGroupRiskMemberModels;
        }

        //Gets called when the wizard is approved
        public async Task<bool> ImportGroupRiskPolicies(Guid fileIdentifier)
        {
            bool success = false;
            if (fileIdentifier != null)
            {
                success = await SaveGroupRiskPolicies(fileIdentifier);
                if (success)
                {
                    success = await SaveAdditionalBenefits(fileIdentifier);
                }
            }
            return success;
        }

        private async Task<bool> SaveAdditionalBenefits(Guid fileIdentifier)
        {
            if (fileIdentifier != null)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var email = string.IsNullOrEmpty(RmaIdentity.Email) ? RmaIdentity.BackendServiceName : RmaIdentity.Email;

                    var fileIdentifierParameter = new SqlParameter { ParameterName = "@fileIdentifier", Value = fileIdentifier };
                    var userIdParameter = new SqlParameter { ParameterName = "@userId", Value = email };

                    var count = await _policyRepository.SqlQueryAsync<int>(DatabaseConstants.SaveGroupRiskAdditionalBenefits,
                        fileIdentifierParameter,
                        userIdParameter
                    );

                    return count[0] > 0;
                }
            }
            return false;
        }

        public async Task<bool> SaveGroupRiskPolicies(Guid fileIdentifier)
        {
            var stagedGroupRiskRecords = new List<Load_StageGroupRisk>();
            var result = false;
            if (fileIdentifier != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var fileId = fileIdentifier.ToString();
                    stagedGroupRiskRecords =
                        await _stageGroupRiskRepository.Where(x => x.FileIdentifier == fileId).ToListAsync();

                    var createPolicies = stagedGroupRiskRecords;

                    var firstRecord =
                        stagedGroupRiskRecords.FirstOrDefault(y => y.FinPayeeRolePlayerId > 0 && y.ProductOptionId > 0);

                    var parentPolicy = await _policyRepository.FirstOrDefaultAsync(p =>
                        p.PolicyOwnerId == firstRecord.FinPayeeRolePlayerId &&
                        p.PolicyPayeeId == firstRecord.FinPayeeRolePlayerId &&
                        p.ProductOptionId == firstRecord.ProductOptionId);

                    if (parentPolicy == null)
                    {
                        var policyId = await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.PolicyNumber);
                        var policyNumber =
                            await _documentGeneratorService.GetDocumentNumber(DocumentNumberTypeEnum.PolicyNumber, policyId,
                                "01");
                        var brokerage =
                            await _brokerageService.GetBrokerageAndRepresentativesByFSPNumber(
                                firstRecord.BrokerageFspNumber);
                        var brokerRepresentative =
                            brokerage.Representatives.Find(x => x.IdNumber == firstRecord.RepresentativeIdNumber);
                        var firstPolicyStartDate = DateTime.Now.ToSaDateTime();

                        parentPolicy = new policy_Policy
                        {
                            PolicyId = policyId,
                            TenantId = TenantAndInsurerId,
                            InsurerId = TenantAndInsurerId,
                            ProductOptionId = firstRecord.ProductOptionId,
                            BrokerageId = brokerage.Id,
                            RepresentativeId = brokerRepresentative.Id,
                            PolicyOwnerId = firstRecord.FinPayeeRolePlayerId,
                            PolicyPayeeId = firstRecord.FinPayeeRolePlayerId,
                            PaymentFrequency = brokerage.PaymentFrequency,
                            PaymentMethod = brokerage.PaymentMethod,
                            PolicyNumber = policyNumber,
                            PolicyInceptionDate = firstPolicyStartDate,
                            FirstInstallmentDate = firstPolicyStartDate,
                            PolicyStatus = PolicyStatusEnum.Active,
                            CanLapse = true,
                            IsEuropAssist = false
                        };

                        _policyRepository.Create(parentPolicy);
                    }

                    await SavePolicyMemberRolePlayers(createPolicies);

                    var policyReturnData = Mapper.Map<Contracts.Entities.Policy.Policy>(parentPolicy);

                    //create child policies
                    foreach (var stageGroupRiskRecord in createPolicies)
                    {
                        var policyId = await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.PolicyNumber);
                        var policyNumber =
                            await _documentGeneratorService.GetDocumentNumber(DocumentNumberTypeEnum.PolicyNumber, policyId,
                                "01");
                        var benefits = await _benefitRepository.Where(b => stageGroupRiskRecord.BenefitId == b.Id)
                            .ToListAsync();

                        var policy = new policy_Policy
                        {
                            PolicyId = policyId,
                            TenantId = parentPolicy.TenantId,
                            InsurerId = 1,
                            ProductOptionId = parentPolicy.ProductOptionId,
                            BrokerageId = parentPolicy.BrokerageId,
                            RepresentativeId = parentPolicy.RepresentativeId,
                            JuristicRepresentativeId = parentPolicy.JuristicRepresentativeId,
                            PolicyOwnerId = stageGroupRiskRecord.EmployeeRolePlayerId,
                            PolicyPayeeId = parentPolicy.PolicyOwnerId,
                            PaymentFrequency = parentPolicy.PaymentFrequency,
                            PaymentMethod = parentPolicy.PaymentMethod,
                            PolicyNumber = policyNumber,
                            PolicyInceptionDate = stageGroupRiskRecord.PolicyStartDate.ToSaDateTime(),
                            FirstInstallmentDate = stageGroupRiskRecord.PolicyStartDate.ToSaDateTime(),
                            RegularInstallmentDayOfMonth = parentPolicy.RegularInstallmentDayOfMonth,
                            DecemberInstallmentDayOfMonth = parentPolicy.DecemberInstallmentDayOfMonth,
                            PolicyStatus = PolicyStatusEnum.New,
                            InstallmentPremium = 0,
                            AnnualPremium = 0,
                            AdminPercentage = parentPolicy.AdminPercentage,
                            CommissionPercentage = parentPolicy.CommissionPercentage,
                            BinderFeePercentage = parentPolicy.BinderFeePercentage,
                            PremiumAdjustmentPercentage = parentPolicy.PremiumAdjustmentPercentage,
                            ParentPolicyId = parentPolicy.PolicyId,
                            CanLapse = parentPolicy.CanLapse,
                            IsEuropAssist = parentPolicy.IsEuropAssist,
                            ClientReference = policyNumber
                        };

                        policy.Benefits = benefits;
                        _policyRepository.Create(policy);

                        var policyBroker = new policy_PolicyBroker
                        {
                            PolicyId = policyId,
                            BrokerageId = parentPolicy.BrokerageId,
                            RepId = parentPolicy.RepresentativeId,
                            JuristicRepId = parentPolicy.JuristicRepresentativeId,
                            EffectiveDate = DateTime.Today
                        };

                        _policyBrokerRepository.Create(policyBroker);

                        stageGroupRiskRecord.PolicyId = policyId;
                        stageGroupRiskRecord.PolicyNumber = policyNumber;
                        _stageGroupRiskRepository.Update(stageGroupRiskRecord);
                    }

                    await SaveRolePlayerRelations(createPolicies);
                    await SavePersonEmployment(createPolicies);
                    await UpdatePolicyInsuredLives(createPolicies);

                    result = await scope.SaveChangesAsync().ConfigureAwait(false) > 0;

                
                }
            }
            return result;
        }

        private async Task UpdatePolicy(PolicyData policyData)
        {
            using (_dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                var policy = await _policyRepository.SingleOrDefaultAsync(p => p.PolicyId == policyData.PolicyId);
                var insuredLives = await _insuredLifeRepository.Where(r => r.PolicyId == policyData.PolicyId)
                    .ToListAsync();

                if (policy == null)
                {
                    throw new Exception($"Policy {policyData.PolicyNumber} does not exist in the system.");
                }

                policyData.InstallmentPremium = policyData.PolicyMembers
                    .Where(x => x.MemberAction != (int)DatabaseActionEnum.Delete).Sum(x => x.Premium);
                policy.ClientReference = policyData.ClientReference;
                policy.InstallmentPremium = policyData.InstallmentPremium;
                policy.AnnualPremium = policyData.InstallmentPremium * 12.0M;
                policy.PolicyStatus =
                    insuredLives.TrueForAll(x => x.InsuredLifeStatus == InsuredLifeStatusEnum.Cancelled) &&
                    policyData.PolicyMembers.TrueForAll(y => y.MemberAction == (int)DatabaseActionEnum.Delete)
                        ? PolicyStatusEnum.Cancelled
                        : policy.PolicyStatus;

                _policyRepository.Update(policy);
            }
        }

        //Wizard step 1 
        public async Task<ImportInsuredLivesSummary> VerifyGroupRiskImport(Guid fileIdentifier)
        {
            ImportInsuredLivesSummary importedLivesSummary = new ImportInsuredLivesSummary();
            if (fileIdentifier != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var fileId = fileIdentifier.ToString();
                    var stagedGroupRiskRecords =
                        await _stageGroupRiskRepository.Where(x => x.FileIdentifier == fileId).ToListAsync();

                    var createPolicies = stagedGroupRiskRecords
                        .Where(x => x.GroupRiskPolicyActionType == GroupRiskPolicyActionTypeEnum.Add).ToList();
                    var updatePolicies = stagedGroupRiskRecords
                        .Where(x => x.GroupRiskPolicyActionType == GroupRiskPolicyActionTypeEnum.Update).ToList();
                    var deletePolicies = stagedGroupRiskRecords
                        .Where(x => x.GroupRiskPolicyActionType == GroupRiskPolicyActionTypeEnum.Delete).ToList();

                    importedLivesSummary = new ImportInsuredLivesSummary
                    {
                        NewUsers = createPolicies.Count,
                        DeletedUsers = deletePolicies.Count,
                        UpdatedUsers = updatePolicies.Count,
                        TotalNew = (double)createPolicies.Sum(x => x.MonthlyRiskSalary),
                        TotalDelete = (double)deletePolicies.Sum(x => x.MonthlyRiskSalary),
                        TotalUpdate = (double)updatePolicies.Sum(x => x.MonthlyRiskSalary),
                        Total = (double)stagedGroupRiskRecords.Sum(x => x.MonthlyRiskSalary),
                        RecordCount = stagedGroupRiskRecords.Count,
                        TotalUsers = stagedGroupRiskRecords.Count
                    };
                }
                
            }
            return importedLivesSummary;
        }

        //Get group risk product validations - this gets called before the actual policy creation from Admin Business process manager
        public async Task<RuleRequestResult> GetGroupRiskImportErrors(Guid fileIdentifier)
        {
            var validationResults = await GetStagedProductCheckResults(fileIdentifier);

            return new RuleRequestResult
            {
                OverallSuccess = validationResults.Count == 0,
                RuleResults = validationResults,
                RequestId = fileIdentifier,
            };
        }

        public async Task<bool> OverrideGroupRiskMemberVopd(VopdUpdateResponseModel vopdUpdateResponse)
        {
            Contract.Requires(vopdUpdateResponse != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var member = await _stageGroupRiskRepository
                    .Where(m => m.FileIdentifier == vopdUpdateResponse.FileIdentifier.ToString()
                                && m.IdOrPassport == vopdUpdateResponse.IdNumber)
                    .FirstOrDefaultAsync();

                if (member != null)
                {
                    await _rolePlayerService.OverrideRolePlayerVopd(vopdUpdateResponse);
                    var errors = await _stageGroupRiskErrorRepository.Where(x =>
                        x.StageGroupRiskId == member.StageGroupRiskId && x.ErrorMessage.Contains("VOPD")).ToListAsync();

                    foreach (var error in errors)
                    {
                        error.ModifiedDate = DateTimeHelper.SaNow;
                        error.ModifiedBy = RmaIdentity.Email;
                        error.ByPassError = true;
                        _stageGroupRiskErrorRepository.Update(error);
                    }
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

            return await Task.FromResult(true);
        }


        private async Task<List<RuleResult>> GetStagedProductCheckResults(Guid fileIdentifier)
        {
            var validationResults = new List<RuleResult>();
            var fileId = fileIdentifier.ToString();

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var stagedErrors =
                    await (from stagedRecord in _stageGroupRiskRepository.Where(y => y.FileIdentifier == fileId)
                           join stagedError in _stageGroupRiskErrorRepository.Where(x => !x.ByPassError) on stagedRecord
                               .StageGroupRiskId equals stagedError.StageGroupRiskId
                           select stagedError).ToListAsync();

                if (stagedErrors.Count <= 0)
                {
                    return validationResults;
                }

                foreach (var stagedError in stagedErrors)
                {
                    var validationResult = new RuleResult
                    {
                        Passed = false,
                        RuleName = stagedError.ErrorMessage.IndexOf("Vopd",
                                       StringComparison.InvariantCultureIgnoreCase) >= 0
                            ? "Vopd"
                            : "Product Rule",
                    };

                    validationResult.MessageList.Add(stagedError.ErrorMessage);
                    validationResults.Add(validationResult);
                }
            }

            return validationResults;
        }

        private List<Load_StageGroupRiskError> ProcessPolicyInceptionRuleCheck(
            List<Load_StageGroupRisk> stagedGroupRiskRecords)
        {
            var stagedGroupRisKErrorList = new List<Load_StageGroupRiskError>();
            if (stagedGroupRiskRecords != null && stagedGroupRiskRecords.Count > 0)
            {

                foreach (var stagedGroupRiskRecord in stagedGroupRiskRecords)
                {
                    if (stagedGroupRiskRecord.PolicyStartDate >= DateTimeHelper.SaNow)
                    {
                        continue;
                    }

                    var stageGroupRiskError = new Load_StageGroupRiskError
                    {
                        StageGroupRiskId = stagedGroupRiskRecord.StageGroupRiskId,
                        ErrorMessage =
                            $"Policy Inception Date-{stagedGroupRiskRecord.FirstName} {stagedGroupRiskRecord.Surname} with ID number {stagedGroupRiskRecord.IdOrPassport} has policy start date which is in the past {stagedGroupRiskRecord.PolicyStartDate.ToString("dd-MM-yyyy")}",
                    };

                    stagedGroupRisKErrorList.Add(stageGroupRiskError);
                }
            }
            return stagedGroupRisKErrorList;
        }

        private async Task<List<Load_StageGroupRiskError>> ProcessProductOptionRulesCheck(
            List<Load_StageGroupRisk> stagedGroupRiskRecords)
        {
            var stagedGroupRisKErrorList = new List<Load_StageGroupRiskError>();
            if (stagedGroupRiskRecords != null && stagedGroupRiskRecords.Count > 0)
            {
                using (_dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
                {
                    var firstRecord = stagedGroupRiskRecords.FirstOrDefault();
                    var productOptionRules =
                        await _productOptionRuleService.GetProductOptionRules(firstRecord.ProductOptionId);

                    foreach (var productOptionRule in productOptionRules)
                    {
                        if (string.IsNullOrEmpty(productOptionRule.RuleConfiguration))
                        {
                            continue;
                        }

                        try
                        {
                            var productOptionRuleConfigurations =
                                JsonConvert.DeserializeObject<List<ProductOptionRuleConfigurationModel>>(productOptionRule
                                    .RuleConfiguration);

                            foreach (var productOptionRuleConfiguration in productOptionRuleConfigurations)
                            {
                                if (productOptionRuleConfiguration.FieldName.Contains("Min entry age"))
                                {
                                    var minimumAgeErrors = ValidateMinimumEntryAge(productOptionRuleConfiguration,
                                        stagedGroupRiskRecords);
                                    if (minimumAgeErrors.Count > 0)
                                    {
                                        stagedGroupRisKErrorList.AddRange(minimumAgeErrors);
                                    }
                                }

                                if (!productOptionRuleConfiguration.FieldName.Contains("Max entry age"))
                                {
                                    continue;
                                }

                                var maximumAgeErrors =
                                    ValidateMaximumEntryAge(productOptionRuleConfiguration, stagedGroupRiskRecords);
                                if (maximumAgeErrors.Count > 0)
                                {
                                    stagedGroupRisKErrorList.AddRange(maximumAgeErrors);
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            throw new Exception(
                                $"GroupRisk Facade Error : Cannot deserialize {productOptionRule.RuleConfiguration} - {ex.Message}");
                        }
                    }
                }
            }
            return stagedGroupRisKErrorList;
        }


        private List<Load_StageGroupRiskError> ValidateMinimumEntryAge(
            ProductOptionRuleConfigurationModel productOptionRuleConfigurationModel,
            List<Load_StageGroupRisk> stagedGroupRiskRecords)
        {
            var stagedGroupRisKErrorList = new List<Load_StageGroupRiskError>();

            if (!int.TryParse(productOptionRuleConfigurationModel.FieldValue, out int productOptionRuleMinimumEntryAge))
            {
                return stagedGroupRisKErrorList;
            }

            foreach (var stagedGroupRiskRecord in stagedGroupRiskRecords)
            {
                var memberAge = AgeNextBirthDay(stagedGroupRiskRecord.DateOfBirth);
                if (memberAge >= productOptionRuleMinimumEntryAge)
                {
                    continue;
                }

                var stageGroupRiskError = new Load_StageGroupRiskError
                {
                    StageGroupRiskId = stagedGroupRiskRecord.StageGroupRiskId,
                    ErrorMessage =
                        $"Minimum entry Age-{stagedGroupRiskRecord.FirstName} {stagedGroupRiskRecord.Surname} with ID number {stagedGroupRiskRecord.IdOrPassport} is under minimum entry age {productOptionRuleMinimumEntryAge}",
                };

                stagedGroupRisKErrorList.Add(stageGroupRiskError);
            }

            return stagedGroupRisKErrorList;
        }

        private List<Load_StageGroupRiskError> ValidateMaximumEntryAge(
            ProductOptionRuleConfigurationModel productOptionRuleConfigurationModel,
            List<Load_StageGroupRisk> stagedGroupRiskRecords)
        {
            var stagedGroupRisKErrorList = new List<Load_StageGroupRiskError>();
            if (!int.TryParse(productOptionRuleConfigurationModel.FieldValue, out int productOptionRuleMaximumEntryAge))
            {
                return stagedGroupRisKErrorList;
            }

            foreach (var stagedGroupRiskRecord in stagedGroupRiskRecords)
            {
                var memberAge = AgeNextBirthDay(stagedGroupRiskRecord.DateOfBirth);
                if (memberAge <= productOptionRuleMaximumEntryAge)
                {
                    continue;
                }

                var stageGroupRiskError = new Load_StageGroupRiskError
                {
                    StageGroupRiskId = stagedGroupRiskRecord.StageGroupRiskId,
                    ErrorMessage =
                        $"Maximum entry Age-{stagedGroupRiskRecord.FirstName} {stagedGroupRiskRecord.Surname} with ID number {stagedGroupRiskRecord.IdOrPassport} is over entry age {productOptionRuleMaximumEntryAge}",
                };

                stagedGroupRisKErrorList.Add(stageGroupRiskError);
            }

            return stagedGroupRisKErrorList;
        }

        private async Task<List<Load_StageGroupRiskError>> ProcessVopdCheck(
            List<Load_StageGroupRisk> stagedGroupRiskRecords)
        {
            var stagedGroupRisKErrorList = new List<Load_StageGroupRiskError>();

            if (stagedGroupRiskRecords != null && stagedGroupRiskRecords.Count > 0)
            {
                var stagedGroupRecordsMemberIds = stagedGroupRiskRecords.Where(x => x.IdOrPassport.Length == 13 && x.IdentityTypeId == (int)IdTypeEnum.SAIDDocument)
                    .Select(y => y.IdOrPassport).ToList();
                var existingMemberVopdResults = await _userVopdRepository
                    .Where(y => stagedGroupRecordsMemberIds.Contains(y.IdNumber)).ToListAsync();
                var vopdStatusEnumList = new List<VopdStatusEnum>
                {VopdStatusEnum.Processed, VopdStatusEnum.ManualVerification};

                foreach (var stagedGroupRiskRecord in stagedGroupRiskRecords)
                {
                    var existingVopdResult =
                        existingMemberVopdResults.FirstOrDefault(x => x.IdNumber == stagedGroupRiskRecord.IdOrPassport);

                    if (existingVopdResult?.DateVerified != null &&
                        vopdStatusEnumList.Contains(existingVopdResult.VopdStatus))
                    {
                        continue;
                    }

                    var response = await _rolePlayerService.PersonVopdRequest(stagedGroupRiskRecord.IdOrPassport);
                    if (response == null)
                    {
                        var stageGroupRiskError = new Load_StageGroupRiskError
                        {
                            StageGroupRiskId = stagedGroupRiskRecord.StageGroupRiskId,
                            ErrorMessage =
                                $"VOPD-{stagedGroupRiskRecord.FirstName} {stagedGroupRiskRecord.Surname} with ID number {stagedGroupRiskRecord.IdOrPassport} could not be VOPD verified"
                        };

                        stagedGroupRisKErrorList.Add(stageGroupRiskError);
                        continue;
                    }

                    if (response.statusCode != "200" || response.VerificationResponse == null)
                    {
                        var stageGroupRiskError = new Load_StageGroupRiskError
                        {
                            StageGroupRiskId = stagedGroupRiskRecord.StageGroupRiskId,
                            ErrorMessage =
                                $"VOPD-{stagedGroupRiskRecord.FirstName} {stagedGroupRiskRecord.Surname} with ID number {stagedGroupRiskRecord.IdOrPassport} could not be VOPD verified"
                        };

                        stagedGroupRisKErrorList.Add(stageGroupRiskError);
                        continue;
                    }

                    var verification = response.VerificationResponse.VerificationDetails.FirstOrDefault();
                    // 3. If name and surname are blank, user could not be found
                    if (verification != null && (string.IsNullOrEmpty(verification.Forename) &&
                                                 string.IsNullOrEmpty(verification.Surname)))
                    {
                        var stageGroupRiskError = new Load_StageGroupRiskError
                        {
                            StageGroupRiskId = stagedGroupRiskRecord.StageGroupRiskId,
                            ErrorMessage =
                                $"VOPD-{stagedGroupRiskRecord.FirstName} {stagedGroupRiskRecord.Surname} with ID number {stagedGroupRiskRecord.IdOrPassport} did not pass VOPD check"
                        };

                        stagedGroupRisKErrorList.Add(stageGroupRiskError);
                        continue;
                    }

                    // 4. Log validation error if fist name or surname does not match
                    if (!NamesMatch(stagedGroupRiskRecord.FirstName, stagedGroupRiskRecord.Surname, verification))
                    {
                        if (verification != null)
                        {
                            var stageGroupRiskError = new Load_StageGroupRiskError
                            {
                                StageGroupRiskId = stagedGroupRiskRecord.StageGroupRiskId,
                                ErrorMessage =
                                    $"VOPD-{stagedGroupRiskRecord.FirstName} {stagedGroupRiskRecord.Surname} with ID number {stagedGroupRiskRecord.IdOrPassport} does not match VOPD name {verification.Forename} {verification.Surname}"
                            };
                            stagedGroupRisKErrorList.Add(stageGroupRiskError);
                        }

                        continue;
                    }

                    var deceased = !string.IsNullOrEmpty(verification.DateOfDeath);
                    if (deceased)
                    {
                        var stageGroupRiskError = new Load_StageGroupRiskError
                        {
                            StageGroupRiskId = stagedGroupRiskRecord.StageGroupRiskId,
                            ErrorMessage =
                                $"VOPD-{stagedGroupRiskRecord.FirstName} {stagedGroupRiskRecord.Surname} with ID number {stagedGroupRiskRecord.IdOrPassport} is deceased"
                        };

                        stagedGroupRisKErrorList.Add(stageGroupRiskError);
                    }
                }
            }
            return stagedGroupRisKErrorList;
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

        public async Task<List<MemberVopdStatus>> GetMemberVopdStatus(Guid fileIdentifier)
        {
            var memberVopdStatusList = new List<MemberVopdStatus>();
            if (fileIdentifier != null)
            {
                var fileId = fileIdentifier.ToString();

                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    var stagedVopdErrors =
                        await (from stagedRecord in _stageGroupRiskRepository.Where(y => y.FileIdentifier == fileId)
                               join stagedError in _stageGroupRiskErrorRepository.Where(err =>
                                   err.ErrorMessage.Contains("VOPD")) on stagedRecord.StageGroupRiskId equals stagedError
                                   .StageGroupRiskId into stagedError_
                               from error in stagedError_.DefaultIfEmpty()
                               join vopdResponse in _userVopdRepository on stagedRecord.IdOrPassport equals vopdResponse
                                   .IdNumber into vopdResponse_
                               from vopdResponse in vopdResponse_.DefaultIfEmpty()
                               select new { stagedError_, stagedRecord, vopdResponse }).ToListAsync();

                    if (stagedVopdErrors.Count <= 0)
                    {
                        return memberVopdStatusList;
                    }

                    foreach (var stagedVopdError in stagedVopdErrors)
                    {
                        var validationResult = new MemberVopdStatus
                        {
                            MemberType = "Main Member (self)",
                            MemberName = $"{stagedVopdError.stagedRecord.FirstName} {stagedVopdError.stagedRecord.Surname}",
                            IdNumber = stagedVopdError.stagedRecord.IdOrPassport,
                            DateOfBirth = stagedVopdError.stagedRecord.DateOfBirth,
                            Age = AgeNextBirthDay(stagedVopdError.stagedRecord.DateOfBirth),
                            JoinDate = stagedVopdError.stagedRecord.PolicyStartDate,
                            VopdProcessStatus = stagedVopdError.vopdResponse != null
                                ? stagedVopdError.vopdResponse.VopdStatus.ToString()
                                : "Error",
                            DateVerified = stagedVopdError.vopdResponse?.DateVerified,
                            VopdStatus = stagedVopdError.vopdResponse != null
                                ? stagedVopdError.vopdResponse.Reason
                                : "VOPD check failed",
                        };

                        memberVopdStatusList.Add(validationResult);
                    }
                }
            }
            return memberVopdStatusList;
        }

        public static int AgeNextBirthDay(DateTime birthDate)
        {
            var dateTimeNow = DateTimeHelper.SaNow;
            return dateTimeNow.Month == 1 && birthDate.Month == 12 ||
                   (dateTimeNow.Month != 12 || birthDate.Month != 1) &&
                   birthDate.Month > dateTimeNow.Month
                ? dateTimeNow.Year - birthDate.Year
                : dateTimeNow.Year - birthDate.Year + 1;
        }


    }
}