using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceBus.Producers;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Constants;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.ClientCare.Mappers;

using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Globalization;
using System.Linq;
using System.Linq.Dynamic;
using System.Text;
using System.Threading.Tasks;

using TinyCsvParser;

using DatabaseConstants = RMA.Service.ClientCare.Database.Constants.DatabaseConstants;

namespace RMA.Service.ClientCare.Services.Member
{
    public class DeclarationFacade : RemotingStatelessService, IDeclarationService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<client_Declaration> _declarationRepository;
        private readonly IMemberService _memberService;
        private readonly IProductOptionService _productOptionService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IRepository<Load_ClientClass4Rates> _loadClientClass4RatesRepository;
        private readonly IRepository<Load_IndustryRate> _loadIndustryRatesRepository;
        private readonly IRepository<client_Rate> _clientRateRepository;
        private readonly IRepository<Load_RatesUploadErrorAudit> _loadRateUploadErrorAuditRepository;
        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IRepository<client_IndustryClassDeclarationConfiguration> _industryClassDeclarationConfigurationRepository;
        private readonly IRepository<client_RolePlayerPolicyOnlineSubmission> _rolePlayerPolicyOnlineSubmissionRepository;
        private readonly IRepository<client_RolePlayerPolicyDeclaration> _rolePlayerPolicyDeclarationRepository;
        private readonly IRepository<client_RolePlayerPolicyTransaction> _rolePlayerPolicyTransactionRepository;
        private readonly IRepository<product_ProductOption> _productOptionRepository;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IInvoiceService _invoiceService;
        private readonly IPolicyService _policyService;
        private readonly IUserService _userService;
        private readonly IUserReminderService _userReminderService;
        private readonly IRepository<Load_Rate> _stagedClientRatesRepository;
        private readonly ILetterOfGoodStandingService _letterOfGoodStandingService;
        private readonly IWizardService _wizardService;

        public DeclarationFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<client_Declaration> declarationRepository,
            IMemberService memberService,
            IProductOptionService productOptionService,
            IRolePlayerService rolePlayerService,
            IRepository<Load_ClientClass4Rates> loadClientClass4RatesRepository,
            IRepository<Load_RatesUploadErrorAudit> loadRateUploadErrorAuditRepository,
            IRepository<client_Rate> clientRateRepository,
            IRepository<policy_Policy> policyRepository,
            IRepository<client_IndustryClassDeclarationConfiguration> industryClassDeclarationConfigurationRepository,
            IRepository<Load_IndustryRate> loadIndustryRatesRepository,
            IRepository<client_RolePlayerPolicyDeclaration> rolePlayerPolicyDeclarationRepository,
            IRepository<client_RolePlayerPolicyTransaction> rolePlayerPolicyTransactionRepository,
            IRepository<client_RolePlayerPolicyOnlineSubmission> rolePlayerPolicyOnlineSubmissionRepository,
            IRepository<product_ProductOption> productOptionRepository,
            IDocumentGeneratorService documentGeneratorService,
            IInvoiceService invoiceService,
            IPolicyService policyService,
            IUserReminderService userReminderService,
            IUserService userService,
            IRepository<Load_Rate> stagedClientRatesRepository,
            ILetterOfGoodStandingService letterOfGoodStandingService,
            IWizardService wizardService
            ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _declarationRepository = declarationRepository;
            _memberService = memberService;
            _productOptionService = productOptionService;
            _rolePlayerService = rolePlayerService;
            _loadClientClass4RatesRepository = loadClientClass4RatesRepository;
            _clientRateRepository = clientRateRepository;
            _loadRateUploadErrorAuditRepository = loadRateUploadErrorAuditRepository;
            _policyRepository = policyRepository;
            _industryClassDeclarationConfigurationRepository = industryClassDeclarationConfigurationRepository;
            _loadIndustryRatesRepository = loadIndustryRatesRepository;
            _rolePlayerPolicyDeclarationRepository = rolePlayerPolicyDeclarationRepository;
            _rolePlayerPolicyTransactionRepository = rolePlayerPolicyTransactionRepository;
            _productOptionRepository = productOptionRepository;
            _documentGeneratorService = documentGeneratorService;
            _invoiceService = invoiceService;
            _policyService = policyService;
            _userService = userService;
            _userReminderService = userReminderService;
            _stagedClientRatesRepository = stagedClientRatesRepository;
            _letterOfGoodStandingService = letterOfGoodStandingService;
            _wizardService = wizardService;
            _rolePlayerPolicyOnlineSubmissionRepository = rolePlayerPolicyOnlineSubmissionRepository;
        }

        public async Task<int> CreateDeclaration(Declaration declaration)
        {
            Contract.Requires(declaration != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<client_Declaration>(declaration);
                _declarationRepository.Create(entity);
                return await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task CreateDeclarations(List<Declaration> declarations)
        {
            Contract.Requires(declarations != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var sortedDeclarations = declarations.OrderBy(a => a.DeclarationYear);
                var entities = Mapper.Map<List<client_Declaration>>(sortedDeclarations);

                _declarationRepository.Create(entities);
                await scope.SaveChangesAsync().ConfigureAwait(false); ;
            }
        }

        public async Task ManageDeclarations(List<Declaration> declarations)
        {
            if (declarations == null)
            {
                throw new NullReferenceException("Declarations cannot be null");
            }

            foreach (var declaration in declarations)
            {
                if (declaration.DeclarationId == 0)
                {
                    await CreateDeclaration(declaration);
                }
                else
                {
                    await UpdateDeclaration(declaration);
                }
            }
        }

        public async Task UpdateDeclaration(Declaration declaration)
        {
            Contract.Requires(declaration != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<client_Declaration>(declaration);
                _declarationRepository.Update(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<Declaration> GetDeclaration(int id)
        {
            Declaration result = null;
            if (id > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var declaration = await _declarationRepository.FirstOrDefaultAsync(s => s.DeclarationId == id);
                    await _declarationRepository.LoadAsync(declaration, p => p.DeclarationAllowances);
                    await _declarationRepository.LoadAsync(declaration, p => p.DeclarationBillingIntegrations);
                    result= Mapper.Map<Declaration>(declaration);
                }
            }
            return result;
        }

        public async Task<List<Declaration>> GetDeclarations(int rolePlayerId)
        {
            List<Declaration> result = null;
            if (rolePlayerId > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var rolePlayer = await _rolePlayerService.GetRolePlayer(rolePlayerId);
                    var sortedDeclarations = new List<client_Declaration>();

                    if (rolePlayer?.Company != null)
                    {
                        var allDeclarations = await _declarationRepository.Where(a => a.RolePlayerId == rolePlayerId).OrderBy(a => a.DeclarationYear).ThenBy(a => a.CreatedDate).ToListAsync();

                        sortedDeclarations = allDeclarations
                            .GroupBy(d => d.ProductOptionId)
                            .SelectMany(e => e).ToList();
                    }

                    await _declarationRepository.LoadAsync(sortedDeclarations, p => p.DeclarationAllowances);
                    await _declarationRepository.LoadAsync(sortedDeclarations, p => p.DeclarationBillingIntegrations);

                    result= Mapper.Map<List<Declaration>>(sortedDeclarations);
                }
            }
            return result;
        }

        public async Task<bool> AddEstimatesForUndeclared()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                await _declarationRepository.ExecuteSqlCommandAsync(DatabaseConstants.RenewalEstimates);
                return true;
            }
        }

        public async Task<UploadRatesSummary> UploadMemberRates(FileContentImport content)
        {
            byte[] decodedString = null;
            if (content != null)
            {
                decodedString = Convert.FromBase64String(content.Data);
            }
            const int StartingIndex = 0;
            var fileData = Encoding.UTF8.GetString(decodedString, StartingIndex, decodedString.Length);
            return await ProcessMemberRates(fileData, content);
        }

        private async Task<UploadRatesSummary> ProcessMemberRates(string fileData, FileContentImport content)
        {
            var uploadResult = new UploadRatesSummary();
            if (!string.IsNullOrEmpty(fileData) && content != null)
            {
                var memberIndex = fileData.IndexOf("MemberNo", StringComparison.Ordinal);

                if (memberIndex != -1)
                {
                    fileData = fileData.Substring(memberIndex);
                }

                const char commaDelimiter = ',';
                const string newLine = "\n";
                int uploadSkipped = 0;

                var csvParserOptions = new CsvParserOptions(true, commaDelimiter);
                var csvMapper = new ClientClass4RatesMapping();
                var csvParser = new CsvParser<Load_ClientClass4Rates>(csvParserOptions, csvMapper); // TODO CHANGE THIS TABLE NAME TO Load_ClientRates
                var csvReaderOptions = new CsvReaderOptions(new[] { newLine });
                var records = csvParser.ReadFromString(csvReaderOptions, fileData).ToList();

                var fileIdentifier = Guid.NewGuid();
                var clientRates = new List<Load_ClientClass4Rates>(); // TODO CHANGE THIS TABLE NAME TO Load_ClientRates

                var rowNumber = 3; // First line containing data in the spreadsheet.


                foreach (var record in records)
                {
                    if (!record.IsValid)
                    {
                        var message = $"Error on line {rowNumber} column {record.Error.ColumnIndex}: {record.Error.Value}";
                        throw new Exception(message);
                    }

                    if (string.IsNullOrEmpty(record.Result.MemberNo))
                    {
                        uploadSkipped++;
                        continue;
                    }

                    var clientClass4RatesData = record.Result;
                    string memberNumber = clientClass4RatesData.MemberNo;
                    clientClass4RatesData.FileIdentifier = fileIdentifier;
                    clientClass4RatesData.MemberNo = memberNumber;
                    clientClass4RatesData.ExcelRowNumber = rowNumber.ToString();

                    clientRates.Add(clientClass4RatesData);
                    rowNumber++;
                }

                int returned = clientRates.Count;
                await ImportClientRatesRecords(fileIdentifier, clientRates);
                var validateResult = await ValidateUploadedClassIVRates(fileIdentifier, content.UserId, content.FileName);

                uploadResult.Total = rowNumber - 2;
                uploadResult.TotalSkipped = uploadSkipped;
                uploadResult.TotalUploaded = returned;
                uploadResult.ValidationCount = validateResult;
                uploadResult.FileIdentifier = fileIdentifier.ToString();
            }
            return uploadResult;
        }

        private async Task<int> ValidateUploadedClassIVRates(Guid fileIdentifier, int userId, string fileName)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                using (this._dbContextScopeFactory.CreateReadOnly())
                {
                    await _loadClientClass4RatesRepository.ExecuteSqlCommandAsync(DatabaseConstants.ClientClassIVRatesUpload,
                        new SqlParameter("@fileIdentifier", fileIdentifier),
                        new SqlParameter("@userId", userId),
                        new SqlParameter("@FileName", fileName));
                }

                var data = await _loadRateUploadErrorAuditRepository.Where(s => s.FileIdentifier.Equals(fileIdentifier.ToString())).ToListAsync();
                return data.Count;
            }
        }

        private async Task<int> ImportClientRatesRecords(Guid fileIdentifier, List<Load_ClientClass4Rates> rates)
        {
            if (rates != null)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    string sql;
                    const int importCount = 500;
                    while (rates.Count > 0)
                    {
                        var count = rates.Count >= importCount ? importCount : rates.Count;
                        var records = rates.GetRange(0, count);
                        sql = GetClientRatesSql(records);
                        await _loadClientClass4RatesRepository.ExecuteSqlCommandAsync(sql);
                        rates.RemoveRange(0, count);
                    }
                    var data = await _loadClientClass4RatesRepository
                        .FirstOrDefaultAsync(s => s.FileIdentifier.Equals(fileIdentifier));
                }
            }
            return 0;
        }

        private string GetClientRatesSql(List<Load_ClientClass4Rates> records)
        {
            var sql = "INSERT INTO [Load].[ClientClass4Rates] ([FileIdentifier],[Product],[MemberNo],[Category],[BenefitSet],[RateType],[Rate],[StartDate],[EndDate],[ExcelRowNumber]) values";
            foreach (var rec in records)
            {
                var rate = rec.Rate.GetValueOrDefault().ToString(CultureInfo.InvariantCulture);
                sql += string.Format("({0},{1},{2},{3},{4},{5},{6},{7},{8},{9}),",
                    rec.FileIdentifier.ToString().Quoted(),
                    SetLength(rec.Product, 32).Quoted(),
                    SetLength(rec.MemberNo, 32).Quoted(),
                    SetLength(rec.Category, 200).Quoted(),
                    SetLength(rec.BenefitSet, 200).Quoted(),
                    SetLength(rec.RateType, 32).Quoted(),
                    rate,
                    rec.StartDate.ToString().Quoted(),
                    rec.EndDate.ToString().Quoted(),
                    SetLength(rec.ExcelRowNumber, 50).Quoted()
                );
            }
            sql = sql.TrimEnd(new char[] { ',' });
            return sql;
        }

        public async Task<UploadRatesSummary> UploadIndustryRates(FileContentImport content)
        {
            Contract.Requires(content != null);
            var decodedString = Convert.FromBase64String(content.Data);
            const int StartingIndex = 0;
            var fileData = Encoding.UTF8.GetString(decodedString, StartingIndex, decodedString.Length);
            return await ProcessIndustryRates(fileData, content);
        }

        private async Task<UploadRatesSummary> ProcessIndustryRates(string fileData, FileContentImport content)
        {
            var uploadResult = new UploadRatesSummary();
            if (content != null && !string.IsNullOrEmpty(fileData))
            {
                var startIndex = fileData.IndexOf("Industry", StringComparison.Ordinal);

                if (startIndex != -1)
                {
                    fileData = fileData.Substring(startIndex);
                }

                var csvParserOptions = new CsvParserOptions(true, ',');
                var csvMapper = new IndustryRatesMapping();
                var csvParser = new CsvParser<Load_IndustryRate>(csvParserOptions, csvMapper);
                var csvReaderOptions = new CsvReaderOptions(new[] { "\n" });

                var records = csvParser.ReadFromString(csvReaderOptions, fileData).ToList();

                var fileIdentifier = Guid.NewGuid();
                var industryRates = new List<Load_IndustryRate>();

                int uploadSkipped = 0;
                var rowNumber = 2;
                foreach (var record in records)
                {
                    if (!record.IsValid)
                    {
                        var message = $"Error on line {rowNumber} column {record.Error.ColumnIndex}: {record.Error.Value}";
                        throw new Exception(message);
                    }
                    ;
                    if (string.IsNullOrEmpty(record.Result.Industry))
                    {
                        uploadSkipped++;
                        continue;
                    }

                    var industryRatesData = record.Result;
                    industryRatesData.FileIdentifier = fileIdentifier;
                    industryRatesData.ExcelRowNumber = rowNumber.ToString();

                    industryRates.Add(industryRatesData);
                    rowNumber++;
                }

                await ImportIndustryRatesRecords(fileIdentifier, industryRates);
                var validateResult = await ValidateUploadedIndustryRates(fileIdentifier, content.UserId, content.FileName);

                

                uploadResult.Total = rowNumber - 2;
                uploadResult.TotalSkipped = uploadSkipped;
                uploadResult.TotalUploaded = industryRates.Count;
                uploadResult.ValidationCount = validateResult;
                uploadResult.FileIdentifier = fileIdentifier.ToString();
            }
            return uploadResult;
        }

        private async Task<int> ValidateUploadedIndustryRates(Guid fileIdentifier, int userId, string fileName)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                using (this._dbContextScopeFactory.CreateReadOnly())
                {
                    await _loadIndustryRatesRepository.ExecuteSqlCommandAsync(DatabaseConstants.IndustryRatesUpload,
                        new SqlParameter("@fileIdentifier", fileIdentifier),
                        new SqlParameter("@userId", userId),
                        new SqlParameter("@FileName", fileName));
                }
                var data = await _loadRateUploadErrorAuditRepository.Where(s => s.FileIdentifier.Equals(fileIdentifier.ToString())).ToListAsync();
                return data.Count;
            }
        }

        private async Task<int> ImportIndustryRatesRecords(Guid fileIdentifier, List<Load_IndustryRate> rates)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                string sql;
                const int importCount = 500;
                while (rates.Count > 0)
                {
                    var count = rates.Count >= importCount ? importCount : rates.Count;
                    var records = rates.GetRange(0, count);
                    sql = GetIndustryRatesSql(records);
                    await _loadIndustryRatesRepository.ExecuteSqlCommandAsync(sql);
                    rates.RemoveRange(0, count);
                }
                var data = await _loadIndustryRatesRepository
                    .FirstOrDefaultAsync(s => s.FileIdentifier.Equals(fileIdentifier));

                return 0;
            }
        }

        private string GetIndustryRatesSql(List<Load_IndustryRate> records)
        {
            var sql = "INSERT INTO [Load].[IndustryRates] ([FileIdentifier],[Industry],[IndustryGroup],[EmployeeCategory],[IndustryRate],[RatingYear],[ExcelRowNumber]) values";
            foreach (var rec in records)
            {
                var rate = rec.IndustryRate.ToString(CultureInfo.InvariantCulture);
                sql += string.Format("({0},{1},{2},{3},{4},{5},{6}),",
                    rec.FileIdentifier.ToString().Quoted(),
                    SetLength(rec.Industry, 256).Quoted(),
                    SetLength(rec.IndustryGroup, 32).Quoted(),
                    SetLength(rec.EmployeeCategory, 32).Quoted(),
                    rate,
                    rec.RatingYear,
                    rec.ExcelRowNumber
                );
            }
            sql = sql.TrimEnd(new char[] { ',' });
            return sql;
        }

        private string SetLength(string value, int len)
        {
            value = value.Trim();
            return value.Length > len ? value.Substring(0, len) : value;
        }

        public async Task<List<ClientRate>> GetClientRates(int rolePlayerId)
        {
            List<ClientRate> mapped = null;
            if (rolePlayerId > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var memberNumber = (await _rolePlayerService.GetFinPayee(rolePlayerId)).FinPayeNumber;
                    var clientRates = await _clientRateRepository.Where(s => s.MemberNo == memberNumber).ToListAsync();
                    mapped = Mapper.Map<List<ClientRate>>(clientRates);
                    var policies = await _policyRepository.Where(s => s.PolicyOwnerId == rolePlayerId).ToListAsync();
                    foreach (var policy in policies)
                    {
                        await _policyRepository.LoadAsync(policy, p => p.ProductOption);
                    }

                    foreach (var clientRate in mapped)
                    {
                        clientRate.PolicyNumber = policies.LastOrDefault(p => p.ProductOption.Name == clientRate.Product)?.PolicyNumber;
                    }

                }
            }
            return mapped;
        }

        public async Task<ClientRate> GetClientRate(ClientRateRequest clientRateRequest)
        {
            ClientRate result= null;
            if (clientRateRequest != null)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var memberNumber = (await _rolePlayerService.GetFinPayee(clientRateRequest.RolePlayerId)).FinPayeNumber;
                    var productOptionName = (await _productOptionService.GetProductOption(clientRateRequest.ProductOptionId)).Name;

                    var clientRate = await _clientRateRepository.FirstOrDefaultAsync(s =>
                    s.MemberNo == memberNumber &&
                    s.Category == Convert.ToInt32(clientRateRequest.CategoryInsured) &&
                    s.RatingYear == clientRateRequest.RatingYear &&
                    s.Product == productOptionName);

                    result= Mapper.Map<ClientRate>(clientRate);
                }
            }
            return result;
        }

        public async Task UpdateClientRate(ClientRate clientRate)
        {
            Contract.Requires(clientRate != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _clientRateRepository.FirstOrDefaultAsync(s => s.RatesId == clientRate.RatesId);
                entity.Rate = clientRate.Rate;
                entity = Mapper.Map<client_Rate>(clientRate);
                _clientRateRepository.Update(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<List<RatesUploadErrorAudit>> GetRateUploadErrorAudit(string fileIdentifier)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _loadRateUploadErrorAuditRepository.Where(s => s.FileIdentifier.Equals(fileIdentifier)).ToListAsync();
                return Mapper.Map<List<RatesUploadErrorAudit>>(entity);
            }
        }

        public async Task<PagedRequestResult<RatesUploadErrorAudit>> GetPagedRatesUploadErrorAudit(PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);
                var fileIdentifier = Convert.ToString(pagedRequest.SearchCriteria);
                var ratesUploadErrorAudits = await (from s in _loadRateUploadErrorAuditRepository
                                                    where s.FileIdentifier.Equals(fileIdentifier)
                                                    select new RatesUploadErrorAudit
                                                    {
                                                        Id = s.Id,
                                                        FileName = s.FileName,
                                                        FileIdentifier = s.FileIdentifier,
                                                        ErrorCategory = s.ErrorCategory,
                                                        ErrorMessage = s.ErrorMessage,
                                                        ExcelRowNumber = s.ExcelRowNumber,
                                                        UploadDate = s.UploadDate
                                                    }
                    ).ToPagedResult(pagedRequest);

                return new PagedRequestResult<RatesUploadErrorAudit>
                {
                    Data = ratesUploadErrorAudits.Data,
                    RowCount = ratesUploadErrorAudits.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(ratesUploadErrorAudits.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task<List<IndustryClassDeclarationConfiguration>> GetIndustryClassDeclarationConfigurations()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _industryClassDeclarationConfigurationRepository.ToListAsync();
                await _industryClassDeclarationConfigurationRepository.LoadAsync(entity, s => s.MaxAverageEarnings);
                await _industryClassDeclarationConfigurationRepository.LoadAsync(entity, s => s.DeclarationPenaltyPercentages);
                await _industryClassDeclarationConfigurationRepository.LoadAsync(entity, s => s.LiveInAllowances);
                await _industryClassDeclarationConfigurationRepository.LoadAsync(entity, s => s.InflationPercentages);
                await _industryClassDeclarationConfigurationRepository.LoadAsync(entity, s => s.MinimumAllowablePremiums);
                return Mapper.Map<List<IndustryClassDeclarationConfiguration>>(entity);
            }
        }

        public async Task<IndustryClassDeclarationConfiguration> GetIndustryClassDeclarationConfiguration(IndustryClassEnum? industryClass)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _industryClassDeclarationConfigurationRepository.FirstOrDefaultAsync(s => s.IndustryClass == industryClass);
                if (entity == null) return null;
                await _industryClassDeclarationConfigurationRepository.LoadAsync(entity, s => s.MaxAverageEarnings);
                await _industryClassDeclarationConfigurationRepository.LoadAsync(entity, s => s.DeclarationPenaltyPercentages);
                await _industryClassDeclarationConfigurationRepository.LoadAsync(entity, s => s.LiveInAllowances);
                await _industryClassDeclarationConfigurationRepository.LoadAsync(entity, s => s.InflationPercentages);
                await _industryClassDeclarationConfigurationRepository.LoadAsync(entity, s => s.MinimumAllowablePremiums);
                return Mapper.Map<IndustryClassDeclarationConfiguration>(entity);
            }
        }

        public async Task CreateIndustryClassDeclarationConfigurations(IndustryClassDeclarationConfiguration industryClassDeclarationConfiguration)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entities = Mapper.Map<client_IndustryClassDeclarationConfiguration>(industryClassDeclarationConfiguration);
                _industryClassDeclarationConfigurationRepository.Create(entities);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task UpdateIndustryClassDeclarationConfigurations(IndustryClassDeclarationConfiguration industryClassDeclarationConfiguration)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<client_IndustryClassDeclarationConfiguration>(industryClassDeclarationConfiguration);
                _industryClassDeclarationConfigurationRepository.Update(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task ManageIndustryClassDeclarationConfigurations(List<IndustryClassDeclarationConfiguration> industryClassDeclarationConfigurations)
        {
            Contract.Requires(industryClassDeclarationConfigurations != null);

            foreach (var industryClassDeclarationConfiguration in industryClassDeclarationConfigurations)
            {
                if (industryClassDeclarationConfiguration.IndustryClassDeclarationConfigurationId == 0)
                {
                    await CreateIndustryClassDeclarationConfigurations(industryClassDeclarationConfiguration);
                }
                else
                {
                    await UpdateIndustryClassDeclarationConfigurations(industryClassDeclarationConfiguration);
                }
            }
        }

        public async Task<List<Contracts.Entities.RolePlayer.RolePlayer>> GenerateWhatsAppList(IndustryClassEnum industryClassEnum)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _memberService.GetMembersByIndustryClass(industryClassEnum);
            }
        }

        public async Task<RolePlayerPolicyDeclaration> GetRolePlayerPolicyDeclaration(int policyId, int declarationYear)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _rolePlayerPolicyDeclarationRepository.OrderByDescending(x => x.CreatedDate).FirstOrDefaultAsync(s => s.PolicyId == policyId && s.DeclarationYear == declarationYear);
                await _rolePlayerPolicyDeclarationRepository.LoadAsyncIncludeDeleted(entity, s => s.RolePlayerPolicyDeclarationDetails);
                return Mapper.Map<RolePlayerPolicyDeclaration>(entity);
            }
        }

        public async Task RaiseTransactions(Contracts.Entities.Policy.Policy policy)
        {
            if (policy != null) { 
            using (var scope = _dbContextScopeFactory.Create())
            {
                var paymentCyclesInFullYear = CommonConstants.AnnuallyMultiplier;
                var monthsInPaymentFrequency = 1;
                switch (policy.PaymentFrequency)
                {
                    case PaymentFrequencyEnum.Monthly:
                        paymentCyclesInFullYear = CommonConstants.MonthlyMultiplier;
                        break;
                    case PaymentFrequencyEnum.Quarterly:
                        paymentCyclesInFullYear = CommonConstants.QuarterlyMultiplier;
                        break;
                    case PaymentFrequencyEnum.BiAnnually:
                        paymentCyclesInFullYear = CommonConstants.BiAnnuallyMultiplier;
                        break;
                }

                monthsInPaymentFrequency = 12 / paymentCyclesInFullYear;
                var today = DateTimeHelper.SaNow;
                var currentPeriodStartDate = await GetDefaultRenewalPeriodStartDate(policy.PolicyOwner.Company.IndustryClass.Value, today);

                decimal accountBalance = 0;

                foreach (var rolePlayerPolicyDeclaration in policy.RolePlayerPolicyDeclarations)
                {
                    rolePlayerPolicyDeclaration.RolePlayerPolicyTransactions = new List<RolePlayerPolicyTransaction>();

                    if (rolePlayerPolicyDeclaration.AdjustmentAmount != 0 || rolePlayerPolicyDeclaration.RequiresTransactionModification)
                    {
                        // SOFT DELETE ALL FUTURE TRANSACTIONS
                        var rolePlayerPolicyTransactions = await GetRolePlayerPolicyTransactionsForCoverPeriod(policy.PolicyId, rolePlayerPolicyDeclaration.DeclarationYear);

                        var sentRolePlayerPolicyTransactions = new List<RolePlayerPolicyTransaction>();
                        if (rolePlayerPolicyTransactions?.Count > 0)
                        {
                            sentRolePlayerPolicyTransactions = rolePlayerPolicyTransactions.FindAll(s => s.RolePlayerPolicyTransactionStatus == RolePlayerPolicyTransactionStatusEnum.Authorised && !s.IsDeleted);
                            accountBalance = sentRolePlayerPolicyTransactions.Count > 0 ? sentRolePlayerPolicyTransactions.Sum(s => s.TotalAmount.Value) : 0;

                            rolePlayerPolicyTransactions.RemoveAll(s => s.RolePlayerPolicyTransactionStatus == RolePlayerPolicyTransactionStatusEnum.Authorised || s.IsDeleted);

                            if (rolePlayerPolicyTransactions?.Count > 0)
                            {
                                foreach (var rolePlayerPolicyTransaction in rolePlayerPolicyTransactions)
                                {
                                    rolePlayerPolicyTransaction.IsDeleted = true;
                                }

                                var rolePlayerPolicyTransactionEntities = Mapper.Map<List<client_RolePlayerPolicyTransaction>>(rolePlayerPolicyTransactions);
                                _rolePlayerPolicyTransactionRepository.Update(rolePlayerPolicyTransactionEntities);
                            }
                        }

                        // GENERATE TRANSACTIONS BASED OF PAYMENY FREQUENCY
                        var numberOfPaymentCycles = paymentCyclesInFullYear;

                        var defaultRenewalPeriodStartDate = new DateTime(rolePlayerPolicyDeclaration.DeclarationYear, currentPeriodStartDate.Month, currentPeriodStartDate.Day);
                        var collectionDate = await GetDefaultRenewalPeriodStartDate(policy.PolicyOwner.Company.IndustryClass.Value, defaultRenewalPeriodStartDate);

                        for (int i = 0; i < paymentCyclesInFullYear; i++)
                        {
                            if (today.Date >= collectionDate.Date && !(today < collectionDate.AddMonths(monthsInPaymentFrequency)) && numberOfPaymentCycles > 1)
                            {
                                numberOfPaymentCycles--;
                            }
                            else
                            {
                                var rolePlayerPolicyTransaction = new RolePlayerPolicyTransaction
                                {
                                    CoverPeriod = rolePlayerPolicyDeclaration.DeclarationYear,
                                    EffectiveDate = collectionDate,
                                    RolePlayerId = policy.PolicyOwnerId,
                                    RolePlayerPolicyTransactionStatus = today > collectionDate ? RolePlayerPolicyTransactionStatusEnum.Queued : RolePlayerPolicyTransactionStatusEnum.Unauthorised,
                                    PolicyId = policy.PolicyId,
                                    RolePlayerPolicyTransactionDetails = new List<RolePlayerPolicyTransactionDetail>()
                                };

                                if (policy.PolicyStatus == PolicyStatusEnum.PendingCancelled)
                                {
                                    if (rolePlayerPolicyDeclaration.RolePlayerPolicyTransactions.Count == 0)
                                    {
                                        rolePlayerPolicyDeclaration.RolePlayerPolicyTransactions.Add(rolePlayerPolicyTransaction);
                                    }
                                }
                                else
                                {
                                    rolePlayerPolicyDeclaration.RolePlayerPolicyTransactions.Add(rolePlayerPolicyTransaction);
                                }
                            }

                            collectionDate = collectionDate.AddMonths(monthsInPaymentFrequency);
                        }

                        foreach (var rolePlayerPolicyTransaction in rolePlayerPolicyDeclaration.RolePlayerPolicyTransactions)
                        {
                            if (rolePlayerPolicyDeclaration.RolePlayerPolicyTransactions.Count == 1 && currentPeriodStartDate.Year != rolePlayerPolicyDeclaration.DeclarationYear)
                            {
                                rolePlayerPolicyTransaction.EffectiveDate = defaultRenewalPeriodStartDate.Date;
                            }

                            var sentAmountForPaymentCycle = 0M;

                            if (policy.PolicyStatus == PolicyStatusEnum.PendingCancelled)
                            {
                                sentAmountForPaymentCycle = sentRolePlayerPolicyTransactions?.Count > 0 && policy.PolicyStatus != PolicyStatusEnum.PendingReinstatement ? sentRolePlayerPolicyTransactions.Sum(s => s.TotalAmount.Value) : 0;
                                numberOfPaymentCycles = 1;
                            }
                            else
                            {
                                var sentTransactionsForPaymentCycle = sentRolePlayerPolicyTransactions.Where(s => s.EffectiveDate.Date == rolePlayerPolicyTransaction.EffectiveDate.Date).ToList();
                                sentAmountForPaymentCycle = sentTransactionsForPaymentCycle?.Count > 0 && policy.PolicyStatus != PolicyStatusEnum.PendingReinstatement ? sentTransactionsForPaymentCycle.Sum(s => s.TotalAmount.Value) : 0;
                            }

                            rolePlayerPolicyTransaction.TotalAmount = ((Convert.ToDecimal(rolePlayerPolicyDeclaration.OriginalTotalPremium) + Convert.ToDecimal(rolePlayerPolicyDeclaration.AdjustmentAmount)) / numberOfPaymentCycles) - sentAmountForPaymentCycle;

                            if (Math.Round(rolePlayerPolicyTransaction.TotalAmount.Value, 2) != 0)
                            {
                                rolePlayerPolicyTransaction.DocumentNumber = rolePlayerPolicyTransaction.TotalAmount < 0 ? await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.CreditNote, "") : await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.Invoice, "");
                                rolePlayerPolicyTransaction.TransactionType = rolePlayerPolicyTransaction.TotalAmount < 0 ? TransactionTypeEnum.CreditNote : TransactionTypeEnum.Invoice;
                                rolePlayerPolicyTransaction.RolePlayerPolicyTransactionStatus = rolePlayerPolicyTransaction.TransactionType == TransactionTypeEnum.CreditNote ? RolePlayerPolicyTransactionStatusEnum.Queued : rolePlayerPolicyTransaction.RolePlayerPolicyTransactionStatus;
                            }
                            else
                            {
                                rolePlayerPolicyTransaction.IsDeleted = true;
                            }

                            switch (policy.PolicyStatus)
                            {
                                case PolicyStatusEnum.Active:
                                    rolePlayerPolicyTransaction.SourceProcess = SourceProcessEnum.Maintenance;
                                    break;
                                case PolicyStatusEnum.PendingCancelled:
                                    rolePlayerPolicyTransaction.SourceProcess = SourceProcessEnum.Cancellation;
                                    break;
                                case PolicyStatusEnum.PendingReinstatement:
                                    rolePlayerPolicyTransaction.SourceProcess = SourceProcessEnum.ReInstate;
                                    break;
                                case PolicyStatusEnum.New:
                                    rolePlayerPolicyTransaction.SourceProcess = SourceProcessEnum.Inception;
                                    break;
                                default:
                                    rolePlayerPolicyTransaction.SourceProcess = null;
                                    break;
                            }

                            foreach (var rolePlayerPolicyDeclarationDetail in rolePlayerPolicyDeclaration.RolePlayerPolicyDeclarationDetails)
                            {
                                rolePlayerPolicyDeclarationDetail.OriginalPremium = rolePlayerPolicyDeclarationDetail.OriginalPremium == null ? 0 : rolePlayerPolicyDeclarationDetail.OriginalPremium;
                                rolePlayerPolicyDeclarationDetail.LiveInAllowance = rolePlayerPolicyDeclarationDetail.LiveInAllowance == null ? 0 : rolePlayerPolicyDeclarationDetail.LiveInAllowance;

                                var rolePlayerPolicyTransactionDetail = new RolePlayerPolicyTransactionDetail
                                {
                                    CategoryInsured = rolePlayerPolicyDeclarationDetail.CategoryInsured,
                                    EffectiveFrom = rolePlayerPolicyDeclarationDetail.EffectiveFrom.Date < rolePlayerPolicyTransaction.EffectiveDate.Date ? rolePlayerPolicyTransaction.EffectiveDate : rolePlayerPolicyDeclarationDetail.EffectiveFrom,
                                    EffectiveTo = rolePlayerPolicyDeclarationDetail.EffectiveTo.Date < rolePlayerPolicyTransaction.EffectiveDate.AddMonths(monthsInPaymentFrequency).Date ? rolePlayerPolicyDeclarationDetail.EffectiveTo : rolePlayerPolicyTransaction.EffectiveDate.AddMonths(monthsInPaymentFrequency),
                                    IsDeleted = rolePlayerPolicyDeclarationDetail.IsDeleted,
                                    LiveInAllowance = Convert.ToInt32(rolePlayerPolicyDeclarationDetail.LiveInAllowance.Value),
                                    NumberOfEmployees = rolePlayerPolicyDeclarationDetail.AverageNumberOfEmployees,
                                    Premium = rolePlayerPolicyTransaction.RolePlayerPolicyTransactionStatus == RolePlayerPolicyTransactionStatusEnum.Unauthorised ? rolePlayerPolicyDeclarationDetail.Premium / rolePlayerPolicyDeclaration.RolePlayerPolicyTransactions.Count : (rolePlayerPolicyDeclarationDetail.Premium - rolePlayerPolicyDeclarationDetail.OriginalPremium.Value) / rolePlayerPolicyDeclaration.RolePlayerPolicyTransactions.Count,
                                    ProductOptionId = rolePlayerPolicyDeclarationDetail.ProductOptionId,
                                    Rate = rolePlayerPolicyDeclarationDetail.Rate,
                                    TotalEarnings = rolePlayerPolicyDeclarationDetail.AverageEmployeeEarnings
                                };

                                rolePlayerPolicyTransaction.RolePlayerPolicyTransactionDetails.Add(rolePlayerPolicyTransactionDetail);
                            }
                        }
                    }

                    rolePlayerPolicyDeclaration.RolePlayerPolicyTransactions.RemoveAll(s => s.IsDeleted);
                    if (rolePlayerPolicyDeclaration.RolePlayerPolicyTransactions.Count > 0)
                    {
                        // CREATE INVOICES IN BILLING
                        foreach (var rolePlayerPolicyTransaction in rolePlayerPolicyDeclaration.RolePlayerPolicyTransactions)
                        {
                            if (rolePlayerPolicyTransaction.RolePlayerPolicyTransactionStatus == RolePlayerPolicyTransactionStatusEnum.Queued)
                            {
                                try // failure to send to billing must not stop the process
                                {
                                    var sentDate = DateTimeHelper.SaNow;
                                    var documentDate = sentDate < rolePlayerPolicyTransaction.EffectiveDate ? rolePlayerPolicyTransaction.EffectiveDate : sentDate;
                                    var invoice = new Invoice
                                    {
                                        PolicyId = rolePlayerPolicyTransaction.PolicyId,
                                        InvoiceStatus = rolePlayerPolicyTransaction.TotalAmount.Value < 0 ? InvoiceStatusEnum.Queued : InvoiceStatusEnum.Queued,
                                        InvoiceDate = documentDate,
                                        InvoiceNumber = rolePlayerPolicyTransaction.DocumentNumber,
                                        TotalInvoiceAmount = Math.Round(rolePlayerPolicyTransaction.TotalAmount.Value, 2),
                                        SourceModule = SourceModuleEnum.ClientCare,
                                        SourceProcess = rolePlayerPolicyTransaction.SourceProcess,
                                        InvoiceLineItems = new List<InvoiceLineItem>()
                                    };

                                    foreach (var rolePlayerPolicyTransactionDetail in rolePlayerPolicyTransaction.RolePlayerPolicyTransactionDetails)
                                    {
                                        if (!rolePlayerPolicyTransactionDetail.IsDeleted)
                                        {
                                            var invoiceLineItem = new InvoiceLineItem
                                            {
                                                InsurableItem = rolePlayerPolicyTransactionDetail.CategoryInsured.ToString(),
                                                NoOfEmployees = rolePlayerPolicyTransactionDetail.NumberOfEmployees,
                                                Earnings = rolePlayerPolicyTransactionDetail.TotalEarnings,
                                                Rate = rolePlayerPolicyTransactionDetail.Rate,
                                                Amount = rolePlayerPolicyTransactionDetail.Premium,
                                                CoverStartDate = rolePlayerPolicyTransactionDetail.EffectiveFrom,
                                                CoverEndDate = rolePlayerPolicyTransactionDetail.EffectiveTo
                                            };

                                            invoice.InvoiceLineItems.Add(invoiceLineItem);
                                        }
                                    }

                                    await _invoiceService.AddInvoice(invoice);

                                    rolePlayerPolicyTransaction.SentDate = sentDate;
                                    rolePlayerPolicyTransaction.DocumentDate = documentDate;
                                    rolePlayerPolicyTransaction.RolePlayerPolicyTransactionStatus = RolePlayerPolicyTransactionStatusEnum.Authorised;

                                    // GENERATE 30 DAY LOGS
                                    if (rolePlayerPolicyTransaction.CoverPeriod >= currentPeriodStartDate.Year)
                                    {
                                        await Generate30DayLetterOfGoodStanding(policy, (DateTime)rolePlayerPolicyTransaction.DocumentDate);
                                    }
                                }
                                catch (Exception ex)
                                {
                                    ex.LogException();
                                }
                            }
                        }

                        // CREATE THE TRANSACTIONS IN CLIENT
                        _rolePlayerPolicyTransactionRepository.Create(Mapper.Map<List<client_RolePlayerPolicyTransaction>>(rolePlayerPolicyDeclaration.RolePlayerPolicyTransactions));
                    }
                }

                await scope.SaveChangesAsync();
            } }
        }

        public async Task<int> ReleaseBulkInvoices(IndustryClassEnum industryClass, DateTime effectiveToDate)
        {
            #region create start notification
            var processStartTime = DateTimeHelper.SaNow;
            var recipients = await _userService.SearchUsersByPermission("Receive Bulk Invoice Process Notifications");

            var userReminders = new List<UserReminder>();

            foreach (var recipient in recipients)
            {
                var userReminder = new UserReminder
                {
                    AssignedToUserId = recipient.Id,
                    UserReminderType = UserReminderTypeEnum.SystemNotification,
                    Text = $"Bulk release {industryClass} invoices process was started at {processStartTime} by {RmaIdentity.DisplayName} ({RmaIdentity.Email})",
                    AlertDateTime = DateTimeHelper.SaNow,
                    CreatedBy = "Bulk Invoice Release Process"
                };

                userReminders.Add(userReminder);
            }

            _ = Task.Run(() => _userReminderService.CreateUserReminders(userReminders));
            #endregion

            using (var scope = _dbContextScopeFactory.Create())
            {
                var policyIds = await _policyRepository.Where(s => s.PolicyOwner.Company.IndustryClass == industryClass).Select(t => t.PolicyId).ToListAsync();

                var rolePlayerPolicyTransactions = await _rolePlayerPolicyTransactionRepository.Where(s =>
                s.TransactionType == TransactionTypeEnum.Invoice
                && s.EffectiveDate <= effectiveToDate
                && !s.IsDeleted
                && (s.RolePlayerPolicyTransactionStatus == RolePlayerPolicyTransactionStatusEnum.Unauthorised
                || s.RolePlayerPolicyTransactionStatus == RolePlayerPolicyTransactionStatusEnum.Queued)
                && policyIds.Contains(s.PolicyId)).ToListAsync();

                await _rolePlayerPolicyTransactionRepository.LoadAsync(rolePlayerPolicyTransactions, t => t.RolePlayerPolicyTransactionDetails);

                var text = string.Empty;

                var sentDate = DateTimeHelper.SaNow;
                var invoices = Mapper.Map<List<Invoice>>(rolePlayerPolicyTransactions);

                try
                {
                    await _invoiceService.AddInvoices(invoices);

                    var producer = new ServiceBusQueueProducer<LetterOfGoodStandingServiceBusMessage>("mcc.clc.sendlogs");

                    for (int i = 0; i < rolePlayerPolicyTransactions.Count; i++)
                    {
                        rolePlayerPolicyTransactions[i].SentDate = sentDate;
                        rolePlayerPolicyTransactions[i].DocumentDate = sentDate < rolePlayerPolicyTransactions[i].EffectiveDate ? rolePlayerPolicyTransactions[i].EffectiveDate : sentDate;
                        rolePlayerPolicyTransactions[i].RolePlayerPolicyTransactionStatus = RolePlayerPolicyTransactionStatusEnum.Authorised;

                        try
                        {
                            // add to service bus(mcc.clc.sendlogs) queue for letter of good standing
                            await producer.PublishMessageAsync(new LetterOfGoodStandingServiceBusMessage()
                            {
                                RolePlayerId = rolePlayerPolicyTransactions[i].RolePlayerId,
                                PolicyId = rolePlayerPolicyTransactions[i].PolicyId,
                                IssueDate = (DateTime)rolePlayerPolicyTransactions[i].DocumentDate,
                                ExpiryDate = ((DateTime)rolePlayerPolicyTransactions[i].DocumentDate).AddDays(30),
                                ImpersonateUser = SystemSettings.SystemUserAccount
                            });
                        }
                        catch (Exception ex)
                        {
                            ex.LogException();
                        }
                    }
                }
                catch (Exception ex)
                {
                    text = "Bulk invoice process failed with exception: Billing threw an error when staging the invoices";
                    ex.LogException();
                }

                _rolePlayerPolicyTransactionRepository.Update(rolePlayerPolicyTransactions);

                var result = await scope.SaveChangesAsync().ConfigureAwait(false);

                #region create close notification
                var processEndTime = DateTimeHelper.SaNow;

                TimeSpan processDuration = (processEndTime - processStartTime);
                var duration = string.Format("{0:%d} days, {0:%h} hours, {0:%m} minutes, {0:%s} seconds", processDuration);

                userReminders = new List<UserReminder>();
                foreach (var recipient in recipients)
                {
                    var userReminder = new UserReminder
                    {
                        AssignedToUserId = recipient.Id,
                        UserReminderType = UserReminderTypeEnum.SystemNotification,
                        Text = string.IsNullOrEmpty(text) ? $"{industryClass} bulk invoice release completed, {Convert.ToInt32(result)} invoices were released. This process took: {duration} to execute" : text,
                        AlertDateTime = DateTimeHelper.SaNow,
                        CreatedBy = "Bulk Invoice Release Process"
                    };

                    userReminders.Add(userReminder);
                }

                _ = Task.Run(() => _userReminderService.CreateUserReminders(userReminders));
                #endregion

                return result;
            }
        }

        public async Task SendInvoices(List<RolePlayerPolicyTransaction> rolePlayerPolicyTransactions)
        {
            Contract.Requires(rolePlayerPolicyTransactions != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var policy = await _policyService.GetPolicyWithProductOptionByPolicyId(rolePlayerPolicyTransactions[0].PolicyId);
                var roleplayerPolicyDeclaration = await GetRolePlayerPolicyDeclaration(policy.PolicyId, rolePlayerPolicyTransactions[0].CoverPeriod);

                var today = DateTimeHelper.SaNow;
                var currentPeriodStartDate = await GetDefaultRenewalPeriodStartDate(policy.PolicyOwner.Company.IndustryClass.Value, today);

                var sentDate = DateTimeHelper.SaNow;
                var invoices = Mapper.Map<List<Invoice>>(rolePlayerPolicyTransactions);
                await _invoiceService.AddInvoices(invoices);

                for (int i = 0; i < rolePlayerPolicyTransactions.Count; i++)
                {
                    rolePlayerPolicyTransactions[i].SentDate = sentDate;
                    rolePlayerPolicyTransactions[i].DocumentDate = sentDate < rolePlayerPolicyTransactions[i].EffectiveDate ? rolePlayerPolicyTransactions[i].EffectiveDate : sentDate;
                    rolePlayerPolicyTransactions[i].RolePlayerPolicyTransactionStatus = RolePlayerPolicyTransactionStatusEnum.Authorised;


                    // GENERATE 30 DAY LOGS
                    if (rolePlayerPolicyTransactions[i].CoverPeriod >= currentPeriodStartDate.Year)
                    {
                        await Generate30DayLetterOfGoodStanding(policy, (DateTime)rolePlayerPolicyTransactions[i].DocumentDate);
                    }
                }

                _rolePlayerPolicyTransactionRepository.Update(Mapper.Map<List<client_RolePlayerPolicyTransaction>>(rolePlayerPolicyTransactions));

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<DateTime> GetDefaultRenewalPeriodStartDate(IndustryClassEnum industryClass, DateTime date)
        {
            var industryClassDeclarationConfiguration = await GetIndustryClassDeclarationConfiguration(industryClass);
            var year = date.Year;

            if (industryClassDeclarationConfiguration == null)
            {
                return new DateTime(year, 1, 1);
            }

            year = date.Month < industryClassDeclarationConfiguration.RenewalPeriodStartMonth || date.Month == industryClassDeclarationConfiguration.RenewalPeriodStartMonth && date.Day < industryClassDeclarationConfiguration.RenewalPeriodStartDayOfMonth ? date.Year - 1 : date.Year;
            return new DateTime(year, industryClassDeclarationConfiguration.RenewalPeriodStartMonth, industryClassDeclarationConfiguration.RenewalPeriodStartDayOfMonth);
        }

        public async Task<List<RolePlayerPolicyTransaction>> GetRolePlayerPolicyTransactionsForCoverPeriod(int policyId, int coverPeriod)
        {
            List<RolePlayerPolicyTransaction> result = null;
            if (policyId > 0 && coverPeriod > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var entities = await _rolePlayerPolicyTransactionRepository.Where(s => s.PolicyId == policyId && !s.IsDeleted && s.CoverPeriod == coverPeriod).ToListAsync();
                    await _rolePlayerPolicyTransactionRepository.LoadAsync(entities, t => t.RolePlayerPolicyTransactionDetails);
                    result= Mapper.Map<List<RolePlayerPolicyTransaction>>(entities);
                }
            }
            return result;
        }

        public async Task<List<RolePlayerPolicyTransaction>> GetRolePlayerPolicyTransactions(int policyId)
        {
            List < RolePlayerPolicyTransaction> result=null;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _rolePlayerPolicyTransactionRepository.Where(s => s.PolicyId == policyId && !s.IsDeleted).ToListAsync();
                await _rolePlayerPolicyTransactionRepository.LoadAsync(entities, t => t.RolePlayerPolicyTransactionDetails);
                result= Mapper.Map<List<RolePlayerPolicyTransaction>>(entities);
            }
            return result;
        }

        public async Task<List<RolePlayerPolicyTransaction>> GetRolePlayerTransactions(int rolePlayerId)
        {
            List<RolePlayerPolicyTransaction> result = null;
            if (rolePlayerId > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var entities = await _rolePlayerPolicyTransactionRepository.Where(s => s.RolePlayerId == rolePlayerId && !s.IsDeleted).ToListAsync();
                    await _rolePlayerPolicyTransactionRepository.LoadAsync(entities, t => t.RolePlayerPolicyTransactionDetails);
                    result = Mapper.Map<List<RolePlayerPolicyTransaction>>(entities);
                }
            }
            return result ;
        }

        public async Task<List<RolePlayerPolicyTransaction>> GetRolePlayerTransactionsForCoverPeriod(int rolePlayerId, int coverPeriod)
        {
            List <RolePlayerPolicyTransaction> result= null;
            if (rolePlayerId > 0 && coverPeriod>0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var entities = await _rolePlayerPolicyTransactionRepository.Where(s => s.RolePlayerId == rolePlayerId && !s.IsDeleted && s.CoverPeriod == coverPeriod).ToListAsync();
                    result=Mapper.Map<List<RolePlayerPolicyTransaction>>(entities);
                }
            }
            return result;
        }

        public async Task<List<RolePlayerPolicyTransaction>> GetRolePlayerPolicyTransactionsForRolePlayerPolicy(int rolePlayerId, int policyId)
        {
            List<RolePlayerPolicyTransaction> result = null;
            if (rolePlayerId > 0 && policyId > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var entities = await _rolePlayerPolicyTransactionRepository.Where(s => s.RolePlayerId == rolePlayerId && s.PolicyId == policyId && !s.IsDeleted).ToListAsync();
                    await _rolePlayerPolicyTransactionRepository.LoadAsync(entities, t => t.RolePlayerPolicyTransactionDetails);
                    result = Mapper.Map<List<RolePlayerPolicyTransaction>>(entities);
                }
            }
            return result;
        }

        public async Task<RolePlayerPolicyTransaction> GetNextRolePlayerPolicyTransaction(string documentNumber)
        {
            RolePlayerPolicyTransaction result = null;
            if (!string.IsNullOrEmpty(documentNumber))
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var rolePlayerPolicyTransaction = _rolePlayerPolicyTransactionRepository.First(s => s.DocumentNumber == documentNumber);

                    var rolePlayerPolicyTransactions = await GetRolePlayerPolicyTransactionsForRolePlayerPolicy(rolePlayerPolicyTransaction.RolePlayerId, rolePlayerPolicyTransaction.PolicyId);
                    rolePlayerPolicyTransactions.RemoveAll(s => s.TransactionType == TransactionTypeEnum.CreditNote);
                    var orderedRolePlayerPolicyTransactions = rolePlayerPolicyTransactions.OrderBy(s => s.EffectiveDate);

                    var index = rolePlayerPolicyTransactions.FindIndex(s => s.RolePlayerPolicyTransactionId == rolePlayerPolicyTransaction.RolePlayerPolicyTransactionId);
                    result= rolePlayerPolicyTransactions[(index + 1) < rolePlayerPolicyTransactions.Count ? index + 1 : index];
                }
            }
            return result;
        }

        public async Task<PagedRequestResult<RolePlayerPolicyTransaction>> GetPagedRolePlayerPolicyTransactions(int policyId, int coverPeriod, PagedRequest pagedRequest)
        {


            Contract.Requires(pagedRequest != null);
            using (_dbContextScopeFactory.CreateReadOnly())
                {
                    coverPeriod = coverPeriod > 0 ? coverPeriod : DateTimeHelper.SaNow.Year;
                    var filter = Convert.ToString(pagedRequest.SearchCriteria);

                    var rolePlayerPolicyTransactions = new PagedRequestResult<RolePlayerPolicyTransaction>();

                    if (!string.IsNullOrEmpty(filter))
                    {
                        rolePlayerPolicyTransactions = await (from rolePlayerPolicyTransaction in _rolePlayerPolicyTransactionRepository
                                                              where rolePlayerPolicyTransaction.CoverPeriod == coverPeriod
                                                              && rolePlayerPolicyTransaction.PolicyId == policyId
                                                              && !rolePlayerPolicyTransaction.IsDeleted
                                                              && rolePlayerPolicyTransaction.DocumentNumber.Contains(filter)
                                                              select new RolePlayerPolicyTransaction
                                                              {
                                                                  CoverPeriod = rolePlayerPolicyTransaction.CoverPeriod,
                                                                  DocumentNumber = rolePlayerPolicyTransaction.DocumentNumber,
                                                                  EffectiveDate = rolePlayerPolicyTransaction.EffectiveDate,
                                                                  PolicyId = rolePlayerPolicyTransaction.PolicyId,
                                                                  RolePlayerId = rolePlayerPolicyTransaction.RolePlayerId,
                                                                  RolePlayerPolicyTransactionId = rolePlayerPolicyTransaction.RolePlayerPolicyTransactionId,
                                                                  RolePlayerPolicyTransactionStatus = rolePlayerPolicyTransaction.RolePlayerPolicyTransactionStatus,
                                                                  SentDate = rolePlayerPolicyTransaction.SentDate,
                                                                  DocumentDate = rolePlayerPolicyTransaction.DocumentDate,
                                                                  TotalAmount = rolePlayerPolicyTransaction.TotalAmount,
                                                                  TransactionType = rolePlayerPolicyTransaction.TransactionType,
                                                                  CreatedBy = rolePlayerPolicyTransaction.CreatedBy,
                                                                  ModifiedBy = rolePlayerPolicyTransaction.ModifiedBy
                                                              }).ToPagedResult(pagedRequest);
                    }
                    else
                    {
                        rolePlayerPolicyTransactions = await (from rolePlayerPolicyTransaction in _rolePlayerPolicyTransactionRepository
                                                              where rolePlayerPolicyTransaction.CoverPeriod == coverPeriod
                                                              && rolePlayerPolicyTransaction.PolicyId == policyId
                                                              && !rolePlayerPolicyTransaction.IsDeleted
                                                              select new RolePlayerPolicyTransaction
                                                              {
                                                                  CoverPeriod = rolePlayerPolicyTransaction.CoverPeriod,
                                                                  DocumentNumber = rolePlayerPolicyTransaction.DocumentNumber,
                                                                  EffectiveDate = rolePlayerPolicyTransaction.EffectiveDate,
                                                                  PolicyId = rolePlayerPolicyTransaction.PolicyId,
                                                                  RolePlayerId = rolePlayerPolicyTransaction.RolePlayerId,
                                                                  RolePlayerPolicyTransactionId = rolePlayerPolicyTransaction.RolePlayerPolicyTransactionId,
                                                                  RolePlayerPolicyTransactionStatus = rolePlayerPolicyTransaction.RolePlayerPolicyTransactionStatus,
                                                                  SentDate = rolePlayerPolicyTransaction.SentDate,
                                                                  DocumentDate = rolePlayerPolicyTransaction.DocumentDate,
                                                                  TotalAmount = rolePlayerPolicyTransaction.TotalAmount,
                                                                  TransactionType = rolePlayerPolicyTransaction.TransactionType,
                                                                  CreatedBy = rolePlayerPolicyTransaction.CreatedBy,
                                                                  ModifiedBy = rolePlayerPolicyTransaction.ModifiedBy
                                                              }).ToPagedResult(pagedRequest);
                    }

                    var mappedRolePlayerPolicyTransactions = Mapper.Map<List<client_RolePlayerPolicyTransaction>>(rolePlayerPolicyTransactions.Data);
                    await _rolePlayerPolicyTransactionRepository.LoadAsync(mappedRolePlayerPolicyTransactions, t => t.RolePlayerPolicyTransactionDetails);
                    var data = Mapper.Map<List<RolePlayerPolicyTransaction>>(mappedRolePlayerPolicyTransactions);


                    return new PagedRequestResult<RolePlayerPolicyTransaction>
                    {
                        Data = data,
                        RowCount = rolePlayerPolicyTransactions.RowCount,
                        Page = pagedRequest.Page,
                        PageSize = pagedRequest.PageSize,
                        PageCount = (int)Math.Ceiling(rolePlayerPolicyTransactions.RowCount / (double)pagedRequest.PageSize)
                    };
                }
            
        }

        public async Task<PagedRequestResult<RolePlayerPolicyTransaction>> GetPagedRolePlayerTransactions(int rolePlayerId, int coverPeriod, PagedRequest pagedRequest)
        {
            Contract.Requires(pagedRequest != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
              
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    coverPeriod = coverPeriod > 0 ? coverPeriod : DateTimeHelper.SaNow.Year;
                    var filter = Convert.ToString(pagedRequest.SearchCriteria);

                    var rolePlayerPolicyTransactions = new PagedRequestResult<RolePlayerPolicyTransaction>();

                    if (!string.IsNullOrEmpty(filter))
                    {
                        rolePlayerPolicyTransactions = await (from rolePlayerPolicyTransaction in _rolePlayerPolicyTransactionRepository
                                                              where rolePlayerPolicyTransaction.CoverPeriod == coverPeriod
                                                              && rolePlayerPolicyTransaction.RolePlayerId == rolePlayerId
                                                              && !rolePlayerPolicyTransaction.IsDeleted
                                                              && rolePlayerPolicyTransaction.DocumentNumber.Contains(filter)
                                                              select new RolePlayerPolicyTransaction
                                                              {
                                                                  CoverPeriod = rolePlayerPolicyTransaction.CoverPeriod,
                                                                  DocumentNumber = rolePlayerPolicyTransaction.DocumentNumber,
                                                                  EffectiveDate = rolePlayerPolicyTransaction.EffectiveDate,
                                                                  PolicyId = rolePlayerPolicyTransaction.PolicyId,
                                                                  RolePlayerId = rolePlayerPolicyTransaction.RolePlayerId,
                                                                  RolePlayerPolicyTransactionId = rolePlayerPolicyTransaction.RolePlayerPolicyTransactionId,
                                                                  RolePlayerPolicyTransactionStatus = rolePlayerPolicyTransaction.RolePlayerPolicyTransactionStatus,
                                                                  SentDate = rolePlayerPolicyTransaction.SentDate,
                                                                  DocumentDate = rolePlayerPolicyTransaction.DocumentDate,
                                                                  TotalAmount = rolePlayerPolicyTransaction.TotalAmount,
                                                                  TransactionType = rolePlayerPolicyTransaction.TransactionType,
                                                                  CreatedBy = rolePlayerPolicyTransaction.CreatedBy,
                                                                  ModifiedBy = rolePlayerPolicyTransaction.ModifiedBy
                                                              }).ToPagedResult(pagedRequest);
                    }
                    else
                    {
                        rolePlayerPolicyTransactions = await (from rolePlayerPolicyTransaction in _rolePlayerPolicyTransactionRepository
                                                              where rolePlayerPolicyTransaction.CoverPeriod == coverPeriod
                                                              && rolePlayerPolicyTransaction.RolePlayerId == rolePlayerId
                                                              && !rolePlayerPolicyTransaction.IsDeleted
                                                              select new RolePlayerPolicyTransaction
                                                              {
                                                                  CoverPeriod = rolePlayerPolicyTransaction.CoverPeriod,
                                                                  DocumentNumber = rolePlayerPolicyTransaction.DocumentNumber,
                                                                  EffectiveDate = rolePlayerPolicyTransaction.EffectiveDate,
                                                                  PolicyId = rolePlayerPolicyTransaction.PolicyId,
                                                                  RolePlayerId = rolePlayerPolicyTransaction.RolePlayerId,
                                                                  RolePlayerPolicyTransactionId = rolePlayerPolicyTransaction.RolePlayerPolicyTransactionId,
                                                                  RolePlayerPolicyTransactionStatus = rolePlayerPolicyTransaction.RolePlayerPolicyTransactionStatus,
                                                                  SentDate = rolePlayerPolicyTransaction.SentDate,
                                                                  DocumentDate = rolePlayerPolicyTransaction.DocumentDate,
                                                                  TotalAmount = rolePlayerPolicyTransaction.TotalAmount,
                                                                  TransactionType = rolePlayerPolicyTransaction.TransactionType,
                                                                  CreatedBy = rolePlayerPolicyTransaction.CreatedBy,
                                                                  ModifiedBy = rolePlayerPolicyTransaction.ModifiedBy
                                                              }).ToPagedResult(pagedRequest);
                    }

                    var mappedRolePlayerPolicyTransactions = Mapper.Map<List<client_RolePlayerPolicyTransaction>>(rolePlayerPolicyTransactions.Data);
                    await _rolePlayerPolicyTransactionRepository.LoadAsync(mappedRolePlayerPolicyTransactions, t => t.RolePlayerPolicyTransactionDetails);
                    var data = Mapper.Map<List<RolePlayerPolicyTransaction>>(mappedRolePlayerPolicyTransactions);

                    return new PagedRequestResult<RolePlayerPolicyTransaction>
                    {
                        Data = data,
                        RowCount = rolePlayerPolicyTransactions.RowCount,
                        Page = pagedRequest.Page,
                        PageSize = pagedRequest.PageSize,
                        PageCount = (int)Math.Ceiling(rolePlayerPolicyTransactions.RowCount / (double)pagedRequest.PageSize)
                    };
                }
            }
        }

        public async Task<PagedRequestResult<RolePlayerPolicyDeclaration>> GetPagedRolePlayerPolicyDeclarations(int policyId, int coverPeriod, PagedRequest pagedRequest)
        {
            Contract.Requires(pagedRequest != null);
            using (_dbContextScopeFactory.CreateReadOnly())
                {
                    coverPeriod = coverPeriod > 0 ? coverPeriod : DateTimeHelper.SaNow.Year;

                    var rolePlayerPolicyDeclarations = await (from rolePlayerPolicyDeclaration in _rolePlayerPolicyDeclarationRepository
                                                              where rolePlayerPolicyDeclaration.DeclarationYear == coverPeriod
                                                              && rolePlayerPolicyDeclaration.PolicyId == policyId
                                                              && !rolePlayerPolicyDeclaration.IsDeleted
                                                              select new RolePlayerPolicyDeclaration
                                                              {
                                                                  CreatedBy = rolePlayerPolicyDeclaration.CreatedBy,
                                                                  CreatedDate = rolePlayerPolicyDeclaration.CreatedDate,
                                                                  DeclarationYear = rolePlayerPolicyDeclaration.DeclarationYear,
                                                                  PolicyId = rolePlayerPolicyDeclaration.PolicyId,
                                                                  RolePlayerId = rolePlayerPolicyDeclaration.RolePlayerId,
                                                                  ModifiedBy = rolePlayerPolicyDeclaration.ModifiedBy,
                                                                  ModifiedDate = rolePlayerPolicyDeclaration.ModifiedDate,
                                                                  PenaltyPercentage = rolePlayerPolicyDeclaration.PenaltyPercentage,
                                                                  ProductId = rolePlayerPolicyDeclaration.ProductId,
                                                                  RolePlayerPolicyDeclarationId = rolePlayerPolicyDeclaration.RolePlayerPolicyDeclarationId,
                                                                  RolePlayerPolicyDeclarationStatus = rolePlayerPolicyDeclaration.RolePlayerPolicyDeclarationStatus,
                                                                  RolePlayerPolicyDeclarationType = rolePlayerPolicyDeclaration.RolePlayerPolicyDeclarationType,
                                                                  TenantId = rolePlayerPolicyDeclaration.TenantId,
                                                                  TotalPremium = rolePlayerPolicyDeclaration.TotalPremium,
                                                                  VariancePercentage = rolePlayerPolicyDeclaration.VariancePercentage,
                                                                  VarianceReason = rolePlayerPolicyDeclaration.VarianceReason
                                                              }).ToPagedResult(pagedRequest);

                    var mappedRolePlayerPolicyDeclarations = Mapper.Map<List<client_RolePlayerPolicyDeclaration>>(rolePlayerPolicyDeclarations.Data);
                    await _rolePlayerPolicyDeclarationRepository.LoadAsyncIncludeDeleted(mappedRolePlayerPolicyDeclarations, t => t.RolePlayerPolicyDeclarationDetails);
                    var data = Mapper.Map<List<RolePlayerPolicyDeclaration>>(mappedRolePlayerPolicyDeclarations);

                    return new PagedRequestResult<RolePlayerPolicyDeclaration>
                    {
                        Data = data,
                        RowCount = rolePlayerPolicyDeclarations.RowCount,
                        Page = pagedRequest.Page,
                        PageSize = pagedRequest.PageSize,
                        PageCount = (int)Math.Ceiling(rolePlayerPolicyDeclarations.RowCount / (double)pagedRequest.PageSize)
                    };
                }
            
        }

        public async Task<List<RolePlayerPolicyDeclaration>> GetRolePlayerPolicyDeclarations(int policyId)
        {
            List<RolePlayerPolicyDeclaration> result = null;
            if (policyId > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var policy = await _policyService.GetPolicy(policyId);

                    var inceptionCoverPeriodStartDate = await GetDefaultRenewalPeriodStartDate(policy.PolicyOwner.Company.IndustryClass.Value, policy.PolicyInceptionDate.Value);

                    var entities = await _rolePlayerPolicyDeclarationRepository.Where(s => s.PolicyId == policyId && !s.IsDeleted && s.DeclarationYear >= inceptionCoverPeriodStartDate.Year).ToListAsync();
                    await _rolePlayerPolicyDeclarationRepository.LoadAsyncIncludeDeleted(entities, s => s.RolePlayerPolicyDeclarationDetails);
                    result= Mapper.Map<List<RolePlayerPolicyDeclaration>>(entities);
                }
            }
            return result;
        }

        public async Task<List<RolePlayerPolicyDeclaration>> GetRolePlayerDeclarations(int rolePlayerId)
        {
            List<RolePlayerPolicyDeclaration> result = null;
            if (rolePlayerId > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var entities = await _rolePlayerPolicyDeclarationRepository.Where(s => s.RolePlayerId == rolePlayerId && !s.IsDeleted).ToListAsync();
                    await _rolePlayerPolicyDeclarationRepository.LoadAsyncIncludeDeleted(entities, s => s.RolePlayerPolicyDeclarationDetails);
                    result = Mapper.Map<List<RolePlayerPolicyDeclaration>>(entities);
                }
            }
            return result;
        }

        public async Task<List<Contracts.Entities.Policy.Policy>> GetRequiredRenewalRolePlayerPolicyDeclarations(int rolePlayerId)
        {
            List<Contracts.Entities.Policy.Policy> result = null;
            if (rolePlayerId > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var policyOwner = await _rolePlayerService.GetRolePlayer(rolePlayerId);

                    var policyEntities = await _policyRepository.Where(s => s.PolicyOwnerId == rolePlayerId && s.PolicyStatus == PolicyStatusEnum.Active).ToListAsync();
                    await _policyRepository.LoadAsync(policyEntities, s => s.ProductOption);
                    foreach (var entity in policyEntities)
                    {
                        await _productOptionRepository.LoadAsync(entity.ProductOption, p => p.Product);
                    }

                    var policies = Mapper.Map<List<Contracts.Entities.Policy.Policy>>(policyEntities);

                    foreach (var policy in policies)
                    {
                        policy.PolicyOwner = policyOwner;
                        var requiredRolePlayerPolicyDeclarations = await GetRequiredDeclarations(policy);
                        await SetRequiredDeclarationProperties(policy, requiredRolePlayerPolicyDeclarations);

                        policy.RolePlayerPolicyDeclarations = await CreateNewRolePlayerPolicyDeclarations(policy, requiredRolePlayerPolicyDeclarations);
                        await CreateRenewalDeclaration(policy, requiredRolePlayerPolicyDeclarations);
                    }

                    policies.RemoveAll(s => s.RolePlayerPolicyDeclarations == null || s.RolePlayerPolicyDeclarations.Count <= 0);
                    return policies;
                }
            }
            return result;
        }

        public async Task<ComplianceResult> GetMemberComplianceStatus(int rolePlayerId)
        {
            ComplianceResult result = null;
            if (rolePlayerId > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var complianceResult = new ComplianceResult
                    {
                        IsBillingCompliant = true,
                        IsDeclarationCompliant = true,
                        Reasons = new List<string>(),
                        IsApplicable = false
                    };

                    var policies = await _policyService.GetPoliciesWithProductOptionByRolePlayer(rolePlayerId);

                    var debtor = await _rolePlayerService.GetFinPayee(rolePlayerId);
                    complianceResult.DebtorStatus = debtor.DebtorStatus;

                    var activeDeclarationReview = await _wizardService.GetActiveWizardsByConfigurationAndLinkedItemId(rolePlayerId, "declaration-variance");

                    foreach (var policy in policies)
                    {
                        complianceResult.IsApplicable = policy.ProductCategoryType == ProductCategoryTypeEnum.Coid || policy.ProductCategoryType == ProductCategoryTypeEnum.VapsAssistance || policy.ProductCategoryType == ProductCategoryTypeEnum.VapsNoneStatutory;

                        if (complianceResult.IsApplicable)
                        {
                            var nonCompliantDeclarations = await GetRequiredDeclarations(policy);
                            nonCompliantDeclarations.RemoveAll(s => s.RolePlayerPolicyDeclarationType == RolePlayerPolicyDeclarationTypeEnum.Budgeted && s.RolePlayerPolicyDeclarationStatus == RolePlayerPolicyDeclarationStatusEnum.Current);

                            if (activeDeclarationReview?.Count > 0)
                            {
                                nonCompliantDeclarations.RemoveAll(s => s.RolePlayerPolicyDeclarationType == RolePlayerPolicyDeclarationTypeEnum.Budgeted && s.RolePlayerPolicyDeclarationStatus == RolePlayerPolicyDeclarationStatusEnum.History);
                            }

                            if (nonCompliantDeclarations?.Count > 0)
                            {
                                complianceResult.IsDeclarationCompliant = false;
                                complianceResult.Reasons.Add($"Member has not submitted {nonCompliantDeclarations.Count} declarations for policy: {policy.PolicyNumber}");
                                foreach (var nonCompliantDeclaration in nonCompliantDeclarations)
                                {
                                    complianceResult.Reasons.Add($" - Cover Period: {nonCompliantDeclaration.DeclarationYear}");
                                }
                            }

                            var unpaidInvoices = await _invoiceService.GetPartiallyAndUnpaidInvoicesByPolicyId(policy.PolicyId);

                            if (unpaidInvoices?.Count > 0)
                            {
                                complianceResult.IsBillingCompliant = false;
                                complianceResult.Reasons.Add($"Member has {unpaidInvoices.Count} unpaid invoices for policy: {policy.PolicyNumber}");
                                foreach (var unpaidInvoice in unpaidInvoices)
                                {
                                    complianceResult.Reasons.Add($" - Invoice Number: {unpaidInvoice.InvoiceNumber}");
                                }
                            }
                        }
                    }

                    return complianceResult;
                }
            }
            return result;
        }

        public async Task<ComplianceResult> GetPolicyComplianceStatus(int policyId)
        {
            ComplianceResult result = null;
            if (policyId > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var complianceResult = new ComplianceResult
                    {
                        IsBillingCompliant = true,
                        IsDeclarationCompliant = true,
                        Reasons = new List<string>(),
                        IsApplicable = false
                    };

                    var policy = await _policyService.GetPolicyWithProductOptionByPolicyId(policyId);

                    var debtor = await _rolePlayerService.GetFinPayee(policy.PolicyOwnerId);
                    if (debtor == null)
                    {
                        return complianceResult;
                    }

                    complianceResult.DebtorStatus = debtor.DebtorStatus;

                    var activeDeclarationReview = await _wizardService.GetActiveWizardsByConfigurationAndLinkedItemId(policy.PolicyOwnerId, "declaration-variance");

                    complianceResult.IsApplicable = policy.ProductCategoryType != null && (policy.ProductCategoryType == ProductCategoryTypeEnum.Coid || policy.ProductCategoryType == ProductCategoryTypeEnum.VapsAssistance || policy.ProductCategoryType == ProductCategoryTypeEnum.VapsNoneStatutory);

                    if (complianceResult.IsApplicable)
                    {
                        var nonCompliantDeclarations = await GetRequiredDeclarations(policy);
                        nonCompliantDeclarations.RemoveAll(s => s.RolePlayerPolicyDeclarationType == RolePlayerPolicyDeclarationTypeEnum.Budgeted && s.RolePlayerPolicyDeclarationStatus == RolePlayerPolicyDeclarationStatusEnum.Current);

                        if (activeDeclarationReview?.Count > 0)
                        {
                            nonCompliantDeclarations.RemoveAll(s => s.RolePlayerPolicyDeclarationType == RolePlayerPolicyDeclarationTypeEnum.Budgeted && s.RolePlayerPolicyDeclarationStatus == RolePlayerPolicyDeclarationStatusEnum.History);
                        }

                        if (nonCompliantDeclarations?.Count > 0)
                        {
                            complianceResult.IsDeclarationCompliant = false;
                            complianceResult.Reasons.Add($"Member has not submitted {nonCompliantDeclarations.Count} declarations for policy: {policy.PolicyNumber}");
                            foreach (var nonCompliantDeclaration in nonCompliantDeclarations)
                            {
                                complianceResult.Reasons.Add($" - Cover Period: {nonCompliantDeclaration.DeclarationYear}");
                            }
                        }

                        var unpaidInvoices = await _invoiceService.GetPartiallyAndUnpaidInvoicesByPolicyId(policy.PolicyId);

                        if (unpaidInvoices?.Count > 0)
                        {
                            complianceResult.IsBillingCompliant = false;
                            complianceResult.Reasons.Add($"Member has {unpaidInvoices.Count} unpaid invoices for policy: {policy.PolicyNumber}");
                            foreach (var unpaidInvoice in unpaidInvoices)
                            {
                                complianceResult.Reasons.Add($" - Invoice Number: {unpaidInvoice.InvoiceNumber}");
                            }
                        }
                    }

                    return complianceResult;
                }
            }
            return result;
        }

        public async Task RenewPolicy(Contracts.Entities.Policy.Policy policy)
        {
            Contract.Requires(policy != null);

            // checks to see if its a renewal OR a compliance submission
            var isRenewal = policy.RolePlayerPolicyDeclarations.Any(s => s.RolePlayerPolicyDeclarationStatus == RolePlayerPolicyDeclarationStatusEnum.Current && s.DeclarationYear > policy.ExpiryDate.Value.Date.AddYears(-1).AddDays(1).Year);

            var notAdjusted = policy.RolePlayerPolicyDeclarations.Where(s => s.OriginalTotalPremium == s.InvoiceAmount && s.AdjustmentAmount == 0);
            policy.RolePlayerPolicyDeclarations.RemoveAll(s => s.OriginalTotalPremium == s.InvoiceAmount && s.AdjustmentAmount == 0);

            await RaiseTransactions(policy);

            var existingRolePlayerPolicyDeclarations = await GetRolePlayerPolicyDeclarations(policy.PolicyId);

            if (isRenewal)
            {
                existingRolePlayerPolicyDeclarations.ForEach(s => s.RolePlayerPolicyDeclarationStatus = RolePlayerPolicyDeclarationStatusEnum.History);
            }
            else
            {
                existingRolePlayerPolicyDeclarations.Where(t => t.RolePlayerPolicyDeclarationStatus == RolePlayerPolicyDeclarationStatusEnum.Current && t.RolePlayerPolicyDeclarationType == RolePlayerPolicyDeclarationTypeEnum.Estimates).ForEach(s => s.RolePlayerPolicyDeclarationStatus = RolePlayerPolicyDeclarationStatusEnum.History);
            }

            existingRolePlayerPolicyDeclarations.AddRange(policy.RolePlayerPolicyDeclarations);
            existingRolePlayerPolicyDeclarations.AddRange(notAdjusted);
            policy.RolePlayerPolicyDeclarations = existingRolePlayerPolicyDeclarations;

            policy.ExpiryDate = isRenewal ? policy.ExpiryDate.Value.Date.AddYears(1) : policy.ExpiryDate.Value.Date;

            await _policyService.EditPolicy(policy, false);
        }

        public async Task RenewPolicies(List<Contracts.Entities.Policy.Policy> policies)
        {
            Contract.Requires(policies != null);

            var userReminders = new List<UserReminder>();
            var recipients = await _userService.SearchUsersByPermission("Receive Renewal Process Notifications");

            foreach (var policy in policies)
            {
                try
                {
                    await RenewPolicy(policy);
                }
                catch (Exception ex)
                {
                    // checks to see if its a renewal OR a compliance submission
                    var isRenewal = policy.RolePlayerPolicyDeclarations.Any(s => s.RolePlayerPolicyDeclarationStatus == RolePlayerPolicyDeclarationStatusEnum.Current && s.DeclarationYear > policy.ExpiryDate.Value.Date.AddYears(-1).AddDays(1).Year);
                    var action = isRenewal ? "Renewal" : "Compliance";

                    foreach (var recipient in recipients)
                    {
                        var userReminder = new UserReminder
                        {
                            AssignedToUserId = recipient.Id,
                            UserReminderItemType = UserReminderItemTypeEnum.Member,
                            UserReminderType = UserReminderTypeEnum.SystemNotification,
                            Text = $"{action} failed for {policy.PolicyOwner.DisplayName} ({policy.PolicyOwner.FinPayee.FinPayeNumber}) {policy.ProductOption.Name} ({policy.ProductOption.Code}): {policy.PolicyNumber} failed with message: {ex.Message}",
                            AlertDateTime = DateTimeHelper.SaNow,
                            CreatedBy = $"{action} Process",
                            LinkUrl = $"/clientcare/member-manager/member-wholistic-view/{policy.PolicyOwnerId}"
                        };

                        userReminders.Add(userReminder);
                    }
                }
            }

            if (userReminders?.Count > 0)
            {
                _ = Task.Run(() => _userReminderService.CreateUserReminders(userReminders));
            }
        }

        public async Task CloseRenewalPeriod(IndustryClassEnum industryClass)
        {
            #region notifications
            var processStartTime = DateTimeHelper.SaNow;
            var recipients = await _userService.SearchUsersByPermission("Receive Renewal Process Notifications");

            var userReminders = new List<UserReminder>();

            foreach (var recipient in recipients)
            {
                var userReminder = new UserReminder
                {
                    AssignedToUserId = recipient.Id,
                    UserReminderType = UserReminderTypeEnum.SystemNotification,
                    Text = $"Closing {industryClass} renewal period process was started at {processStartTime} by {RmaIdentity.DisplayName} ({RmaIdentity.Email})",
                    AlertDateTime = DateTimeHelper.SaNow,
                    CreatedBy = "Close Renewal Period Process"
                };

                userReminders.Add(userReminder);
            }

            _ = Task.Run(() => _userReminderService.CreateUserReminders(userReminders));
            #endregion

            var closeRenewalPeriodServiceBusMessages = new List<CloseRenewalPeriodServiceBusMessage>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                closeRenewalPeriodServiceBusMessages = await _policyRepository.SqlQueryAsync<CloseRenewalPeriodServiceBusMessage>("[client].[QueueNonCompliantRenewals] @IndustryClassId", new SqlParameter { ParameterName = "@IndustryClassId", Value = industryClass });
            }

            var producer = new ServiceBusQueueProducer<CloseRenewalPeriodServiceBusMessage>("mcc.clc.close-renewal-period");
            var queueExceptionMessage = string.Empty;

            foreach (var closeRenewalPeriodServiceBusMessage in closeRenewalPeriodServiceBusMessages)
            {
                try
                {
                    // add to service bus(mcc.clc.close-renewal-period) queue
                    closeRenewalPeriodServiceBusMessage.ImpersonateUser = SystemSettings.SystemUserAccount;

                    await producer.PublishMessageAsync(closeRenewalPeriodServiceBusMessage);
                }
                catch (Exception ex)
                {
                    ex.LogException();
                    queueExceptionMessage = ex.Message;
                }
            }

            #region notifications
            var processEndTime = DateTimeHelper.SaNow;

            TimeSpan processDuration = (processEndTime - processStartTime);
            var duration = string.Format("{0:%d} days, {0:%h} hours, {0:%m} minutes, {0:%s} seconds", processDuration);

            userReminders = new List<UserReminder>();
            foreach (var recipient in recipients)
            {
                var userReminder = new UserReminder
                {
                    AssignedToUserId = recipient.Id,
                    UserReminderType = UserReminderTypeEnum.SystemNotification,
                    Text = string.IsNullOrEmpty(queueExceptionMessage) ? $"{industryClass} renewal period closed, {Convert.ToInt32(closeRenewalPeriodServiceBusMessages?.Count)} policies did not submit their actuals and were queued for processing. This process took: {duration} to execute" : $"{industryClass} renewal period failed to closed, with error message: {queueExceptionMessage}",
                    AlertDateTime = DateTimeHelper.SaNow,
                    CreatedBy = "Close Renewal Period Process"
                };

                userReminders.Add(userReminder);
            }

            _ = Task.Run(() => _userReminderService.CreateUserReminders(userReminders));
            #endregion
        }

        public async Task ProcessCloseRenewalPeriod(CloseRenewalPeriodServiceBusMessage closeRenewalPeriodServiceBusMessage)
        {
            Contract.Requires(closeRenewalPeriodServiceBusMessage != null);

            var nonCompliantPolicies = new List<Contracts.Entities.Policy.Policy>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyEntity = await _policyRepository.FirstOrDefaultAsync(s => s.PolicyId == closeRenewalPeriodServiceBusMessage.PolicyId);
                await _policyRepository.LoadAsync(policyEntity, s => s.RolePlayerPolicyDeclarations);
                await _rolePlayerPolicyDeclarationRepository.LoadAsyncIncludeDeleted(policyEntity.RolePlayerPolicyDeclarations, s => s.RolePlayerPolicyDeclarationDetails);

                var policy = Mapper.Map<Contracts.Entities.Policy.Policy>(policyEntity);

                policy.PolicyOwner = await _rolePlayerService.GetPolicyOwnerByPolicyId(policy.PolicyId);
                policy.ProductOption = await _productOptionService.GetProductOption(policy.ProductOptionId);

                var clientRates = await _clientRateRepository.Where(s => s.MemberNo == closeRenewalPeriodServiceBusMessage.FinPayeNumber && s.Product == closeRenewalPeriodServiceBusMessage.ProductOptionName).ToListAsync();
                var clientPolicyRates = Mapper.Map<List<ClientRate>>(clientRates);

                if (clientPolicyRates?.Count > 0)
                {
                    var industryClassDeclarationConfiguration = await GetIndustryClassDeclarationConfiguration(closeRenewalPeriodServiceBusMessage.IndustryClass);
                    var latestDeclaration = policy.RolePlayerPolicyDeclarations.Find(s => s.RolePlayerPolicyDeclarationStatus == RolePlayerPolicyDeclarationStatusEnum.Current);

                    await CreateEstimatesDeclaration(policy, latestDeclaration, clientPolicyRates, industryClassDeclarationConfiguration);
                    nonCompliantPolicies.Add(policy);
                }
            }

            if (nonCompliantPolicies.Count > 0)
            {
                await RenewPolicies(nonCompliantPolicies);
            }
        }

        public async Task<List<RolePlayerPolicyDeclaration>> GetRequiredDeclarations(Contracts.Entities.Policy.Policy policy)
        {
            Contract.Requires(policy != null);
            var rolePlayerPolicyDeclarationEntities = (await _rolePlayerPolicyDeclarationRepository.Where(s => s.PolicyId == policy.PolicyId).ToListAsync()).GroupBy(x => x.DeclarationYear, (key, g) => g.OrderByDescending(e => e.CreatedDate).First()).ToList();
            var requiredRolePlayerPolicyDeclarationEntities = rolePlayerPolicyDeclarationEntities.Where(s => s.RolePlayerPolicyDeclarationType == RolePlayerPolicyDeclarationTypeEnum.Estimates || s.RolePlayerPolicyDeclarationStatus == RolePlayerPolicyDeclarationStatusEnum.Current || (s.RolePlayerPolicyDeclarationType == RolePlayerPolicyDeclarationTypeEnum.Budgeted && s.RolePlayerPolicyDeclarationStatus == RolePlayerPolicyDeclarationStatusEnum.History)).ToList();
            await _rolePlayerPolicyDeclarationRepository.LoadAsyncIncludeDeleted(requiredRolePlayerPolicyDeclarationEntities, s => s.RolePlayerPolicyDeclarationDetails);

            return Mapper.Map<List<RolePlayerPolicyDeclaration>>(requiredRolePlayerPolicyDeclarationEntities);
        }

        #region Private Helpers
        private async Task SetRequiredDeclarationProperties(Contracts.Entities.Policy.Policy policy, List<RolePlayerPolicyDeclaration> rolePlayerPolicyDeclarations)
        {
            foreach (var rolePlayerPolicyDeclaration in rolePlayerPolicyDeclarations)
            {
                rolePlayerPolicyDeclaration.RolePlayerPolicyTransactions = await GetRolePlayerPolicyTransactionsForCoverPeriod(rolePlayerPolicyDeclaration.PolicyId, rolePlayerPolicyDeclaration.DeclarationYear);
                rolePlayerPolicyDeclaration.OriginalTotalPremium = rolePlayerPolicyDeclaration.RolePlayerPolicyTransactions.Sum(rolePlayerPolicyTransaction => rolePlayerPolicyTransaction.TotalAmount);

                var coverPeriodStartDate = await GetDefaultRenewalPeriodStartDate(policy.PolicyOwner.Company.IndustryClass.Value, policy.PolicyInceptionDate.Value);

                var startDate = new DateTime(rolePlayerPolicyDeclaration.DeclarationYear, coverPeriodStartDate.Date.Month, coverPeriodStartDate.Date.Day);
                var endDate = new DateTime(rolePlayerPolicyDeclaration.DeclarationYear + 1, coverPeriodStartDate.Date.Month, coverPeriodStartDate.Date.Day);

                rolePlayerPolicyDeclaration.FullYearDays = CalculateNumberOfDays(startDate, endDate);

                if (policy.PolicyInceptionDate.Value.Date > coverPeriodStartDate.Date && rolePlayerPolicyDeclaration.DeclarationYear == coverPeriodStartDate.Year)
                {
                    startDate = policy.PolicyInceptionDate.Value.Date;
                }

                rolePlayerPolicyDeclaration.ProrataDays = CalculateNumberOfDays(startDate, endDate);

                int totalAverageEmployees = 0;
                decimal totalAverageEarnings = 0;

                foreach (var rolePlayerPolicyDeclarationDetail in rolePlayerPolicyDeclaration.RolePlayerPolicyDeclarationDetails)
                {
                    rolePlayerPolicyDeclarationDetail.EffectiveFrom = rolePlayerPolicyDeclarationDetail.EffectiveFrom != null && rolePlayerPolicyDeclarationDetail.EffectiveFrom.Date > startDate.Date ? rolePlayerPolicyDeclarationDetail.EffectiveFrom : startDate;

                    if (!rolePlayerPolicyDeclarationDetail.IsDeleted)
                    {
                        totalAverageEmployees += rolePlayerPolicyDeclarationDetail.AverageNumberOfEmployees;
                        totalAverageEarnings += rolePlayerPolicyDeclarationDetail.AverageEmployeeEarnings;

                        rolePlayerPolicyDeclarationDetail.EffectiveTo = endDate;
                    }
                    else
                    {
                        rolePlayerPolicyDeclarationDetail.EffectiveTo = rolePlayerPolicyDeclarationDetail.EffectiveFrom;
                    }
                }

                rolePlayerPolicyDeclaration.OriginalEarningsPerEmployee = totalAverageEarnings / totalAverageEmployees;
            }
        }

        private async Task<List<RolePlayerPolicyDeclaration>> CreateNewRolePlayerPolicyDeclarations(Contracts.Entities.Policy.Policy policy, List<RolePlayerPolicyDeclaration> rolePlayerPolicyDeclarations)
        {
            var newRolePlayerPolicyDeclarations = new List<RolePlayerPolicyDeclaration>();

            var nonCompliantDeclarations = rolePlayerPolicyDeclarations.Where(s => s.RolePlayerPolicyDeclarationType == RolePlayerPolicyDeclarationTypeEnum.Estimates || (s.RolePlayerPolicyDeclarationType != RolePlayerPolicyDeclarationTypeEnum.Estimates && s.RolePlayerPolicyDeclarationStatus != RolePlayerPolicyDeclarationStatusEnum.Current)).ToList();

            foreach (var requiredRolePlayerPolicyDeclaration in nonCompliantDeclarations)
            {
                var dueDeclaration = new RolePlayerPolicyDeclaration
                {
                    DeclarationYear = requiredRolePlayerPolicyDeclaration.DeclarationYear,
                    PenaltyPercentage = requiredRolePlayerPolicyDeclaration.PenaltyPercentage,
                    PolicyId = policy.PolicyId,
                    ProductId = requiredRolePlayerPolicyDeclaration.ProductId,
                    RolePlayerId = policy.PolicyOwnerId,
                    RolePlayerPolicyDeclarationStatus = requiredRolePlayerPolicyDeclaration.RolePlayerPolicyDeclarationStatus,
                    FullYearDays = requiredRolePlayerPolicyDeclaration.FullYearDays,
                    ProrataDays = requiredRolePlayerPolicyDeclaration.ProrataDays,
                    OriginalTotalPremium = requiredRolePlayerPolicyDeclaration.OriginalTotalPremium,
                    OriginalEarningsPerEmployee = requiredRolePlayerPolicyDeclaration.OriginalEarningsPerEmployee,

                    RolePlayerPolicyDeclarationType = requiredRolePlayerPolicyDeclaration.RolePlayerPolicyDeclarationStatus == RolePlayerPolicyDeclarationStatusEnum.History
                   ? RolePlayerPolicyDeclarationTypeEnum.Actual
                   : RolePlayerPolicyDeclarationTypeEnum.Budgeted,

                    CreatedDate = requiredRolePlayerPolicyDeclaration.CreatedDate,
                    RolePlayerPolicyDeclarationDetails = new List<RolePlayerPolicyDeclarationDetail>()
                };

                foreach (var rolePlayerPolicyDeclarationDetail in requiredRolePlayerPolicyDeclaration.RolePlayerPolicyDeclarationDetails)
                {
                    var dueDeclarationDetail = new RolePlayerPolicyDeclarationDetail
                    {
                        CategoryInsured = rolePlayerPolicyDeclarationDetail.CategoryInsured,
                        ProductOptionId = rolePlayerPolicyDeclarationDetail.ProductOptionId,
                        Rate = rolePlayerPolicyDeclarationDetail.Rate,
                        IsDeleted = rolePlayerPolicyDeclarationDetail.IsDeleted,
                        EffectiveFrom = rolePlayerPolicyDeclarationDetail.EffectiveFrom,
                        EffectiveTo = rolePlayerPolicyDeclarationDetail.EffectiveTo
                    };

                    dueDeclaration.RolePlayerPolicyDeclarationDetails.Add(dueDeclarationDetail);
                }

                if (dueDeclaration.RolePlayerPolicyDeclarationStatus == RolePlayerPolicyDeclarationStatusEnum.Current && dueDeclaration.RolePlayerPolicyDeclarationType == RolePlayerPolicyDeclarationTypeEnum.Budgeted)
                {
                    var clientRates = await GetClientPolicyRates(policy);
                    var nextCoverPeriodRate = clientRates.Find(s => s.RatingYear == dueDeclaration.DeclarationYear + 1);

                    if (nextCoverPeriodRate == null)
                    {
                        newRolePlayerPolicyDeclarations.Add(dueDeclaration);
                    }
                }
                else
                {
                    newRolePlayerPolicyDeclarations.Add(dueDeclaration);
                }

            }

            return newRolePlayerPolicyDeclarations;
        }

        private async Task CreateRenewalDeclaration(Contracts.Entities.Policy.Policy policy, List<RolePlayerPolicyDeclaration> rolePlayerPolicyDeclarations)
        {
            var current = rolePlayerPolicyDeclarations.Find(s => s.RolePlayerPolicyDeclarationStatus == RolePlayerPolicyDeclarationStatusEnum.Current);
            var clientRates = await GetClientPolicyRates(policy);
            var nextCoverPeriodRate = clientRates.Find(s => s.RatingYear == current.DeclarationYear + 1);

            if (nextCoverPeriodRate != null)
            {
                var renewalActualDeclaration = new RolePlayerPolicyDeclaration
                {
                    DeclarationYear = current.DeclarationYear,
                    PenaltyPercentage = current.PenaltyPercentage,
                    OriginalTotalPremium = current.OriginalTotalPremium,
                    PolicyId = policy.PolicyId,
                    ProductId = current.ProductId,
                    RolePlayerId = policy.PolicyOwnerId,
                    RolePlayerPolicyDeclarationStatus = RolePlayerPolicyDeclarationStatusEnum.History,
                    FullYearDays = current.FullYearDays,
                    ProrataDays = current.ProrataDays,
                    InvoiceAmount = current.OriginalTotalPremium,
                    OriginalEarningsPerEmployee = current.OriginalEarningsPerEmployee,
                    RolePlayerPolicyDeclarationType = RolePlayerPolicyDeclarationTypeEnum.Actual,
                    RolePlayerPolicyDeclarationDetails = new List<RolePlayerPolicyDeclarationDetail>(),
                    CreatedDate = current.CreatedDate
                };

                foreach (var rolePlayerPolicyDeclarationDetail in current.RolePlayerPolicyDeclarationDetails)
                {
                    var declarationDetail = new RolePlayerPolicyDeclarationDetail
                    {
                        CategoryInsured = rolePlayerPolicyDeclarationDetail.CategoryInsured,
                        ProductOptionId = rolePlayerPolicyDeclarationDetail.ProductOptionId,
                        Rate = rolePlayerPolicyDeclarationDetail.Rate,
                        IsDeleted = rolePlayerPolicyDeclarationDetail.IsDeleted,
                        EffectiveFrom = rolePlayerPolicyDeclarationDetail.EffectiveFrom,
                        EffectiveTo = rolePlayerPolicyDeclarationDetail.EffectiveTo
                    };

                    renewalActualDeclaration.RolePlayerPolicyDeclarationDetails.Add(declarationDetail);
                }

                policy.RolePlayerPolicyDeclarations.Add(renewalActualDeclaration);

                var coverPeriodStartDate = await GetDefaultRenewalPeriodStartDate(policy.PolicyOwner.Company.IndustryClass.Value, policy.PolicyInceptionDate.Value);

                var startDate = new DateTime(current.DeclarationYear + 1, coverPeriodStartDate.Date.Month, coverPeriodStartDate.Date.Day);
                var endDate = new DateTime(current.DeclarationYear + 2, coverPeriodStartDate.Date.Month, coverPeriodStartDate.Date.Day);

                current.FullYearDays = CalculateNumberOfDays(startDate, endDate);
                current.ProrataDays = CalculateNumberOfDays(startDate, endDate);

                var onlineSubmissions = await GetOnlineSubmissions(policy.PolicyId, current.DeclarationYear + 1);
                var onlineSubmission = onlineSubmissions?.Find(s => s.PolicyId == policy.PolicyId);

                var renewalBudgetedDeclaration = new RolePlayerPolicyDeclaration
                {
                    DeclarationYear = current.DeclarationYear + 1,
                    PenaltyPercentage = current.PenaltyPercentage,
                    PolicyId = policy.PolicyId,
                    ProductId = current.ProductId,
                    RolePlayerId = policy.PolicyOwnerId,
                    RolePlayerPolicyDeclarationStatus = RolePlayerPolicyDeclarationStatusEnum.Current,
                    FullYearDays = current.FullYearDays,
                    ProrataDays = current.ProrataDays,
                    RolePlayerPolicyDeclarationType = RolePlayerPolicyDeclarationTypeEnum.Budgeted,
                    RolePlayerPolicyDeclarationDetails = new List<RolePlayerPolicyDeclarationDetail>(),
                };

                foreach (var rolePlayerPolicyDeclarationDetail in current.RolePlayerPolicyDeclarationDetails)
                {
                    var clientRate = clientRates.Find(s => s.RatingYear == current.DeclarationYear + 1 && s.Category == (int)rolePlayerPolicyDeclarationDetail.CategoryInsured);
                    var onlineSubmissionForCategory = onlineSubmission?.RolePlayerPolicyOnlineSubmissionDetails.Find(s => s.CategoryInsured == rolePlayerPolicyDeclarationDetail.CategoryInsured);

                    var dueDeclarationDetail = new RolePlayerPolicyDeclarationDetail
                    {
                        CategoryInsured = rolePlayerPolicyDeclarationDetail.CategoryInsured,
                        ProductOptionId = rolePlayerPolicyDeclarationDetail.ProductOptionId,
                        Rate = clientRate?.Rate > 0 ? clientRate.Rate.Value : 0,
                        AverageEmployeeEarnings = (onlineSubmissionForCategory?.AverageEmployeeEarnings) ?? 0,
                        AverageNumberOfEmployees = (onlineSubmissionForCategory?.AverageNumberOfEmployees) ?? 0,
                        LiveInAllowance = (onlineSubmissionForCategory?.LiveInAllowance) ?? 0,
                        EffectiveFrom = startDate,
                        EffectiveTo = endDate
                    };

                    renewalBudgetedDeclaration.RolePlayerPolicyDeclarationDetails.Add(dueDeclarationDetail);
                }

                policy.RolePlayerPolicyDeclarations.Add(renewalBudgetedDeclaration);
            }
        }

        private async Task CreateEstimatesDeclaration(Contracts.Entities.Policy.Policy policy, RolePlayerPolicyDeclaration latestRolePlayerPolicyDeclaration, List<ClientRate> clientRates, IndustryClassDeclarationConfiguration industryClassDeclarationConfiguration)
        {
            policy.RolePlayerPolicyDeclarations.Clear();

            var nextCoverPeriodRateExists = clientRates.Find(s => s.RatingYear == latestRolePlayerPolicyDeclaration.DeclarationYear + 1) != null;

            if (nextCoverPeriodRateExists)
            {
                var startDate = new DateTime(latestRolePlayerPolicyDeclaration.DeclarationYear + 1, industryClassDeclarationConfiguration.RenewalPeriodStartMonth, industryClassDeclarationConfiguration.RenewalPeriodStartDayOfMonth);
                var endDate = new DateTime(latestRolePlayerPolicyDeclaration.DeclarationYear + 2, industryClassDeclarationConfiguration.RenewalPeriodStartMonth, industryClassDeclarationConfiguration.RenewalPeriodStartDayOfMonth);

                latestRolePlayerPolicyDeclaration.FullYearDays = CalculateNumberOfDays(startDate, endDate);
                latestRolePlayerPolicyDeclaration.ProrataDays = CalculateNumberOfDays(startDate, endDate);

                var penalty = industryClassDeclarationConfiguration.DeclarationPenaltyPercentages.Find(s => s.EffectiveTo == null);
                var inflationPercentage = industryClassDeclarationConfiguration.InflationPercentages.Find(s => s.EffectiveTo == null);
                var liveInAllowance = industryClassDeclarationConfiguration.LiveInAllowances.Find(s => s.EffectiveTo == null);
                var minimumAllowablePremium = industryClassDeclarationConfiguration.MinimumAllowablePremiums.Find(s => s.EffectiveTo == null);

                var onlineSubmissions = await GetOnlineSubmissions(policy.PolicyId, latestRolePlayerPolicyDeclaration.DeclarationYear + 1);
                var onlineSubmission = onlineSubmissions?.Find(s => s.PolicyId == policy.PolicyId);

                var renewalEstimateDeclaration = new RolePlayerPolicyDeclaration
                {
                    TenantId = latestRolePlayerPolicyDeclaration.TenantId,
                    DeclarationYear = latestRolePlayerPolicyDeclaration.DeclarationYear + 1,
                    PenaltyPercentage = penalty != null ? penalty.PenaltyPercentage : 0,
                    PolicyId = policy.PolicyId,
                    ProductId = latestRolePlayerPolicyDeclaration.ProductId,
                    RolePlayerId = policy.PolicyOwnerId,
                    RolePlayerPolicyDeclarationStatus = RolePlayerPolicyDeclarationStatusEnum.Current,
                    FullYearDays = latestRolePlayerPolicyDeclaration.FullYearDays,
                    ProrataDays = latestRolePlayerPolicyDeclaration.ProrataDays,
                    RolePlayerPolicyDeclarationType = onlineSubmission != null ? RolePlayerPolicyDeclarationTypeEnum.Budgeted : RolePlayerPolicyDeclarationTypeEnum.Estimates,
                    TotalPremium = 0,
                    AdjustmentAmount = 0,
                    InvoiceAmount = 0,
                    RolePlayerPolicyDeclarationDetails = new List<RolePlayerPolicyDeclarationDetail>(),
                    CreatedDate = latestRolePlayerPolicyDeclaration.CreatedDate
                };

                foreach (var rolePlayerPolicyDeclarationDetail in latestRolePlayerPolicyDeclaration.RolePlayerPolicyDeclarationDetails)
                {
                    var onlineSubmissionForCategory = onlineSubmission?.RolePlayerPolicyOnlineSubmissionDetails.Find(s => s.CategoryInsured == rolePlayerPolicyDeclarationDetail.CategoryInsured);

                    var estimateDeclarationDetail = new RolePlayerPolicyDeclarationDetail
                    {
                        AverageNumberOfEmployees = (onlineSubmissionForCategory?.AverageNumberOfEmployees) ?? rolePlayerPolicyDeclarationDetail.AverageNumberOfEmployees,
                        LiveInAllowance = (onlineSubmissionForCategory?.LiveInAllowance) ?? rolePlayerPolicyDeclarationDetail.LiveInAllowance,
                        CategoryInsured = rolePlayerPolicyDeclarationDetail.CategoryInsured,
                        ProductOptionId = rolePlayerPolicyDeclarationDetail.ProductOptionId,
                        EffectiveFrom = startDate,
                        EffectiveTo = endDate
                    };

                    var clientRate = clientRates.Find(s => s.RatingYear == latestRolePlayerPolicyDeclaration.DeclarationYear + 1 && s.Category == (int)rolePlayerPolicyDeclarationDetail.CategoryInsured);
                    var rate = clientRate != null ? clientRate.Rate.Value : 0;

                    estimateDeclarationDetail.Rate = rate * (1 + (renewalEstimateDeclaration.PenaltyPercentage.Value / 100));

                    var allowance = liveInAllowance?.Allowance != null ? liveInAllowance.Allowance : 0;
                    var inflation = inflationPercentage?.Percentage != null ? inflationPercentage.Percentage : 0;

                    var totalLiveInAllowanceEarnings = estimateDeclarationDetail.LiveInAllowance.Value * allowance * 12;

                    if (onlineSubmissionForCategory != null)
                    {
                        estimateDeclarationDetail.AverageEmployeeEarnings = onlineSubmissionForCategory.AverageEmployeeEarnings + totalLiveInAllowanceEarnings;
                    }
                    else
                    {
                        estimateDeclarationDetail.AverageEmployeeEarnings = (rolePlayerPolicyDeclarationDetail.AverageEmployeeEarnings + totalLiveInAllowanceEarnings) * (1 + (inflation / 100));
                    }

                    estimateDeclarationDetail.Premium = estimateDeclarationDetail.AverageEmployeeEarnings * (estimateDeclarationDetail.Rate / 100);
                    renewalEstimateDeclaration.TotalPremium += estimateDeclarationDetail.Premium;

                    renewalEstimateDeclaration.RolePlayerPolicyDeclarationDetails.Add(estimateDeclarationDetail);
                }

                var minimumPremium = minimumAllowablePremium?.MinimumPremium != null ? minimumAllowablePremium.MinimumPremium : 0;

                renewalEstimateDeclaration.AdjustmentAmount = renewalEstimateDeclaration.TotalPremium < minimumPremium ? minimumPremium : renewalEstimateDeclaration.TotalPremium;
                renewalEstimateDeclaration.InvoiceAmount = renewalEstimateDeclaration.TotalPremium < minimumPremium ? minimumPremium : renewalEstimateDeclaration.TotalPremium;

                policy.RolePlayerPolicyDeclarations.Add(renewalEstimateDeclaration);
            }
        }

        private async Task<List<ClientRate>> GetClientPolicyRates(Contracts.Entities.Policy.Policy policy)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var memberNumber = policy.PolicyOwner?.FinPayee != null ? policy.PolicyOwner.FinPayee.FinPayeNumber : (await _rolePlayerService.GetFinPayee(policy.PolicyOwnerId))?.FinPayeNumber;
                if (!string.IsNullOrEmpty(memberNumber))
                {
                    var clientRates = await _clientRateRepository.Where(s => s.MemberNo == memberNumber && s.Product == policy.ProductOption.Name).ToListAsync();
                    return Mapper.Map<List<ClientRate>>(clientRates);
                }
                else
                {
                    return null;
                }
            }
        }

        private int CalculateNumberOfDays(DateTime fromDate, DateTime toDate)
        {
            return Convert.ToInt32(Math.Abs((toDate - fromDate).TotalDays));
        }

        private async Task Generate30DayLetterOfGoodStanding(Contracts.Entities.Policy.Policy policy, DateTime documentDate)
        {
            try
            {
                if (policy.ProductCategoryType == ProductCategoryTypeEnum.Coid)
                {
                    var complianceResult = await GetPolicyComplianceStatus(policy.PolicyId);
                    if (complianceResult.IsApplicable && complianceResult.IsBillingCompliant && complianceResult.IsDeclarationCompliant)
                    {
                        _ = Task.Run(() => _letterOfGoodStandingService.GenerateLetterOfGoodStanding(documentDate.AddDays(30), policy.PolicyOwner.RolePlayerId, policy.PolicyId));
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException();
            }
        }

        private async Task<List<RolePlayerPolicyOnlineSubmission>> GetOnlineSubmissions(int policyId, int submissionYear)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayerPolicyOnlineSubmissionEntities = await _rolePlayerPolicyOnlineSubmissionRepository.Where(s => s.PolicyId == policyId && s.DeclarationYear == submissionYear).ToListAsync();
                if (rolePlayerPolicyOnlineSubmissionEntities?.Count > 0)
                {
                    await _rolePlayerPolicyOnlineSubmissionRepository.LoadAsync(rolePlayerPolicyOnlineSubmissionEntities, s => s.RolePlayerPolicyOnlineSubmissionDetails);
                }

                return Mapper.Map<List<RolePlayerPolicyOnlineSubmission>>(rolePlayerPolicyOnlineSubmissionEntities);
            }
        }

        #endregion

        public async Task<PagedRequestResult<LoadRate>> GetPagedStagedClientRates(PagedRequest pagedRequest)
        {
            Contract.Requires(pagedRequest != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var filter = Convert.ToString(pagedRequest.SearchCriteria);
                    var stagedRates = new PagedRequestResult<LoadRate>();

                    if (!string.IsNullOrEmpty(filter))
                    {
                        stagedRates = Mapper.Map<PagedRequestResult<LoadRate>>(await _stagedClientRatesRepository.Where(s => s.MemberNo.Contains(filter)).ToPagedResult(pagedRequest));
                    }
                    else
                    {
                        stagedRates = Mapper.Map<PagedRequestResult<LoadRate>>(await _stagedClientRatesRepository.ToPagedResult(pagedRequest));
                    }

                    return new PagedRequestResult<LoadRate>
                    {
                        Data = stagedRates.Data,
                        RowCount = stagedRates.RowCount,
                        Page = pagedRequest.Page,
                        PageSize = pagedRequest.PageSize,
                        PageCount = (int)Math.Ceiling(stagedRates.RowCount / (double)pagedRequest.PageSize)
                    };
                }
            }
        }

        public async Task StartRenewalPeriod(IndustryClassEnum industryClass)
        {
            var processStartTime = DateTimeHelper.SaNow;
            var recipients = await _userService.SearchUsersByPermission("Receive Renewal Process Notifications");

            var userReminders = new List<UserReminder>();

            foreach (var recipient in recipients)
            {
                var userReminder = new UserReminder
                {
                    AssignedToUserId = recipient.Id,
                    UserReminderType = UserReminderTypeEnum.SystemNotification,
                    Text = $"Starting {industryClass} renewal period process was started at {processStartTime} by {RmaIdentity.DisplayName} ({RmaIdentity.Email})",
                    AlertDateTime = DateTimeHelper.SaNow,
                    CreatedBy = "Start Renewal Period Process"
                };

                userReminders.Add(userReminder);
            }

            _ = Task.Run(() => _userReminderService.CreateUserReminders(userReminders));

            using (_dbContextScopeFactory.Create())
            {
                await _declarationRepository.ExecuteSqlCommandAsync(
                    DatabaseConstants.ApproveStagedMemberRates,
                    new SqlParameter("IndustryClassId", (int)Enum.Parse(typeof(IndustryClassEnum), industryClass.ToString())));
            }

            var processEndTime = DateTimeHelper.SaNow;

            TimeSpan processDuration = (processEndTime - processStartTime);
            var duration = string.Format("{0:%d} days, {0:%h} hours, {0:%m} minutes, {0:%s} seconds", processDuration);

            userReminders = new List<UserReminder>();
            foreach (var recipient in recipients)
            {
                var userReminder = new UserReminder
                {
                    AssignedToUserId = recipient.Id,
                    UserReminderType = UserReminderTypeEnum.SystemNotification,
                    Text = $"{industryClass} renewal period started, This process took: {duration} to execute",
                    AlertDateTime = DateTimeHelper.SaNow,
                    CreatedBy = "Start Renewal Period Process"
                };

                userReminders.Add(userReminder);
            }

            _ = Task.Run(() => _userReminderService.CreateUserReminders(userReminders));
        }

        public async Task<Contracts.Entities.Policy.Policy> GetAllRolePlayerPolicyDeclarations(Contracts.Entities.Policy.Policy policy)
        {
            Contract.Requires(policy != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(policy != null);
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var rolePlayerPolicyDeclarationEntities = (await _rolePlayerPolicyDeclarationRepository.Where(s => s.PolicyId == policy.PolicyId).ToListAsync()).GroupBy(x => x.DeclarationYear, (key, g) => g.OrderByDescending(e => e.CreatedDate).First()).ToList();
                    await _rolePlayerPolicyDeclarationRepository.LoadAsyncIncludeDeleted(rolePlayerPolicyDeclarationEntities, s => s.RolePlayerPolicyDeclarationDetails);

                    policy.RolePlayerPolicyDeclarations = Mapper.Map<List<RolePlayerPolicyDeclaration>>(rolePlayerPolicyDeclarationEntities);
                    return policy;
                }
            }
        }

        public async Task<List<RolePlayerPolicyOnlineSubmission>> CreateRolePlayerPolicyOnlineSubmissions(List<RolePlayerPolicyOnlineSubmission> rolePlayerPolicyOnlineSubmissions)
        {
            Contract.Requires(rolePlayerPolicyOnlineSubmissions != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var rolePlayerPolicyOnlineSubmissionEntities = Mapper.Map<List<client_RolePlayerPolicyOnlineSubmission>>(rolePlayerPolicyOnlineSubmissions);
                var results = _rolePlayerPolicyOnlineSubmissionRepository.Create(rolePlayerPolicyOnlineSubmissionEntities);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return Mapper.Map<List<RolePlayerPolicyOnlineSubmission>>(results);
            }
        }

        public async Task UpdateRolePlayerPolicyOnlineSubmissions(List<RolePlayerPolicyOnlineSubmission> rolePlayerPolicyOnlineSubmissions)
        {
            Contract.Requires(rolePlayerPolicyOnlineSubmissions != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var rolePlayerPolicyOnlineSubmissionEntities = Mapper.Map<List<client_RolePlayerPolicyOnlineSubmission>>(rolePlayerPolicyOnlineSubmissions);
                _rolePlayerPolicyOnlineSubmissionRepository.Update(rolePlayerPolicyOnlineSubmissionEntities);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<List<Contracts.Entities.Policy.Policy>> GetRolePlayerPolicyOnlineSubmissions(int rolePlayerId, int submissionYear)
        {
            List<Contracts.Entities.Policy.Policy> result = null;
            if (rolePlayerId > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var policies = await _policyService.GetPoliciesWithProductOptionByRolePlayer(rolePlayerId);
                    policies.RemoveAll(s => s.PolicyStatus != PolicyStatusEnum.Active && s.PolicyStatus != PolicyStatusEnum.PendingCancelled);

                    foreach (var policy in policies)
                    {
                        var onlineSubmissions = await GetOnlineSubmissions(policy.PolicyId, submissionYear);

                        if (onlineSubmissions.Count <= 0)
                        {
                            var onlineSubmission = new RolePlayerPolicyOnlineSubmission
                            {
                                DeclarationYear = submissionYear,
                                PolicyId = policy.PolicyId,
                                ProductId = policy.ProductOption.ProductId,
                                RolePlayerId = rolePlayerId,
                                RolePlayerPolicyDeclarationType = RolePlayerPolicyDeclarationTypeEnum.Budgeted,
                                RolePlayerPolicyOnlineSubmissionDetails = new List<RolePlayerPolicyOnlineSubmissionDetail>()
                            };

                            var categories = Enum.GetValues(typeof(CategoryInsuredEnum)).Cast<CategoryInsuredEnum>().ToList();

                            foreach (var category in categories)
                            {
                                var onlineSubmissionDetail = new RolePlayerPolicyOnlineSubmissionDetail
                                {
                                    CategoryInsured = category,
                                    ProductOptionId = policy.ProductOptionId,
                                };

                                onlineSubmission.RolePlayerPolicyOnlineSubmissionDetails.Add(onlineSubmissionDetail);
                            }

                            onlineSubmissions.Add(onlineSubmission);
                        }

                        policy.RolePlayerPolicyOnlineSubmissions = onlineSubmissions;
                    }

                    return policies;
                }
            }
            return result;
        }
    }
}