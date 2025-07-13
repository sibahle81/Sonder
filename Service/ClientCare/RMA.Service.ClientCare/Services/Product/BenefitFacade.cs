using AutoMapper;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Audit.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Database.Constants;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.ClientCare.Mappers;

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using TinyCsvParser;

using Formatting = Newtonsoft.Json.Formatting;

namespace RMA.Service.ClientCare.Services.Product
{
    public class BenefitFacade : Common.Service.ServiceFabric.RemotingStatelessService, IBenefitService
    {
        private readonly IRepository<product_Benefit> _benefitRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IAuditWriter _productAuditWriter;
        private readonly IAuditLogV1Service _auditLogService;
        private readonly IRepository<Load_Benefit> _loadBenefitRepository;
        private readonly IRepository<Load_BenefitsUploadErrorAudit> _loadBenefitUploadErrorAuditRepository;
        private readonly IRepository<product_Product> _productRepository;
        private readonly IRepository<product_BenefitRate> _productBenefitRateRepository;
        private readonly IRepository<product_ProductOption> _productOptionRepository;
        private readonly IProductOptionService _productOptionService;

        private readonly IConfigurationService _configurationService;
        private const string ClientModulePermissionsFFL = "ClientModulePermissions";
        private readonly IRepository<product_ProductBenefitFormula> _productBenefitFormulaRepository;

        public BenefitFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<product_Benefit> benefitRepository,
            IConfigurationService configurationService,
            IAuditWriter productAuditWriter,
            IAuditLogV1Service auditLogService,
            IRepository<Load_Benefit> loadBenefitRepository,
            IRepository<Load_BenefitsUploadErrorAudit> loadBenefitUploadErrorAuditRepository,
            IRepository<product_Product> productRepository,
            IRepository<product_BenefitRate> productBenefitRateRepository,
            IRepository<product_ProductOption> productOptionRepository,
            IProductOptionService productOptionService,
            IRepository<product_ProductBenefitFormula> productBenefitFormulaRepository
            ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _benefitRepository = benefitRepository;
            _productAuditWriter = productAuditWriter;
            _auditLogService = auditLogService;
            _configurationService = configurationService;
            _loadBenefitRepository = loadBenefitRepository;
            _loadBenefitUploadErrorAuditRepository = loadBenefitUploadErrorAuditRepository;
            _productRepository = productRepository;
            _productBenefitRateRepository = productBenefitRateRepository;
            _productOptionRepository = productOptionRepository;
            _productOptionService = productOptionService;
            _productBenefitFormulaRepository = productBenefitFormulaRepository;
        }

        public async Task<int> AddBenefit(Benefit benefit, int? wizardId)
        {
            Contract.Requires(benefit != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                    RmaIdentity.DemandPermission(Permissions.AddBenefit);
                var entity = Mapper.Map<product_Benefit>(benefit);
                entity.BenefitRules = benefit.RuleItems.Select(pr => new product_BenefitRule
                {
                    RuleId = pr.RuleId,
                    RuleConfiguration = pr.RuleConfiguration,
                }).ToList();

                var result = _benefitRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                await _productAuditWriter.AddLastViewed<product_Benefit>(entity.Id);
                AddAuditEntry(entity, true, wizardId, benefit.EarningTypeIds);
                return entity.Id;
            }
        }

        private string AddOldItem(product_Benefit productBenefit)
        {
            Contract.Requires(productBenefit!= null);
            using (_dbContextScopeFactory.Create())
            {
                var audits = _auditLogService.GetAuditLogs("product_Benefit", productBenefit.Id).GetAwaiter().GetResult();
                if (audits.Count == 0)
                {
                    return "{ }";
                }

                var audit = audits.OrderByDescending(a => a.Id).FirstOrDefault();
                return audit.NewItem;
            }
        }

        private void AddAuditEntry(product_Benefit entity, bool isNewEntry, int? wizardId, List<int> earningTypeIds)
        {
            Contract.Requires(entity!= null);
            var rules = entity.BenefitRules;
            var notes = entity.BenefitNotes;
            var rates = entity.BenefitRates;
            var earningTypes = entity.BenefitEarningsTypes;

            entity.BenefitRules = new List<product_BenefitRule>();
            entity.BenefitNotes = new List<product_BenefitNote>();
            entity.BenefitRates = new List<product_BenefitRate>();
            entity.BenefitEarningsTypes = new List<product_BenefitEarningsType>();

            var newAudit = new AuditResult()
            {
                ItemId = entity.Id,
                ItemType = "product_Benefit",
                Action = isNewEntry ? "Added" : "Modified",

                NewItem = JsonConvert.SerializeObject(entity),
                Date = DateTimeHelper.SaNow,
                Username = RmaIdentity.Username,
                CorrolationToken = RmaIdentity.TraceId,
                WizardId = wizardId
            };

            entity.BenefitRules = rules;
            entity.BenefitRates = rates;
            entity.BenefitNotes = notes;
            entity.BenefitEarningsTypes = earningTypes;

            newAudit.OldItem = AddOldItem(entity);
            newAudit.NewItem = ParseBenefit(newAudit.NewItem, entity, earningTypeIds);

            _auditLogService.AddAudit(newAudit).GetAwaiter().GetResult();
        }

        private string ParseBenefit(string newItemString, product_Benefit newBenefitEntity, List<int> earningTypeIds)
        {
            if (newItemString == null) return "{ }";
            var item = JObject.Parse(newItemString);
            Contract.Requires(newBenefitEntity != null);
            var rules = (JArray)item["BenefitRules"];
            rules.Clear();
            foreach (var rule in newBenefitEntity.BenefitRules)
            {
                if (rule.RuleConfiguration != null)
                {
                    var ruleConfiguration = JObject.Parse(rule.RuleConfiguration.Replace("[", "").Replace("]", "").Replace(@"\", ""));
                    var ruleConfig = !string.IsNullOrEmpty(ruleConfiguration["fieldValue"].ToString()) ? $"{ruleConfiguration["fieldName"]} = {ruleConfiguration["fieldValue"]}" : ruleConfiguration["fieldName"].ToString();
                    rules.Add(ruleConfig);
                }
            }

            var rates = (JArray)item["BenefitRates"];
            rates.Clear();
            foreach (var rate in newBenefitEntity.BenefitRates)
            {
                rates.Add("Benefit Amount: " + rate.BenefitAmount + " | Premium: " + rate.BaseRate + " | Effective: " + rate.EffectiveDate.ToShortDateString());
            }

            var earningTypes = (JArray)item["BenefitEarningsTypes"];
            earningTypes.Clear();
            if (earningTypeIds.Count > 0)
            {
                foreach (var earningTypeId in earningTypeIds)
                {
                    foreach (EarningsTypeEnum itemEnum in Enum.GetValues(typeof(EarningsTypeEnum)))
                    {
                        if (earningTypeId == (int)itemEnum)
                        {
                            earningTypes.Add(itemEnum.DisplayAttributeValue());
                        }
                    }
                }
            }

            return item.ToString(Formatting.None);
        }

        public async Task EditBenefit(Benefit productBenefit, int? wizardId)
        {
            Contract.Requires(productBenefit != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditBenefit);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<product_Benefit>(productBenefit);
                await _benefitRepository.LoadAsync(entity, r => r.BenefitRules);
                await _benefitRepository.LoadAsync(entity, r => r.BenefitEarningsTypes);
                await _benefitRepository.LoadAsync(entity, r => r.BenefitRates);

                entity.ModifiedDate = DateTimeHelper.SaNow;

                if (productBenefit.EarningTypeIds != null && productBenefit.EarningTypeIds.Count > 0)
                    entity.BenefitEarningsTypes = productBenefit.EarningTypeIds.Select(n => new product_BenefitEarningsType()
                    {
                        BenefitId = productBenefit.Id,
                        EarningsType = (EarningsTypeEnum)n
                    }).ToList();

                var toAdd = productBenefit.RuleItems.Where(r => r.Id == 0);
                foreach (var ruleItem in toAdd)
                {
                    entity.BenefitRules.Add(new product_BenefitRule
                    {
                        BenefitId = entity.Id,
                        RuleId = ruleItem.RuleId,
                        RuleConfiguration = ruleItem.RuleConfiguration
                    });
                }

                entity.BenefitRates.ForEach(benefit =>
                {
                    if (benefit.Id == 0)
                    {
                        benefit.Id = entity.Id;
                    }
                });

                //2. remove missing rules
                var toRemove = entity.BenefitRules.Where(e => e.Id > 0 && !productBenefit.RuleItems.Where(r => r.Id > 0).Select(r => r.Id).Contains(e.Id));
                foreach (var i in toRemove)
                {
                    i.IsDeleted = true;
                }

                //3. update others
                var toUpdate = productBenefit.RuleItems.Where(r => r.Id != 0 && entity.BenefitRules.Select(a => a.Id).Contains(r.Id));
                foreach (var entry in toUpdate)
                {
                    entity.BenefitRules.Single(i => i.Id == entry.Id).RuleConfiguration = entry.RuleConfiguration;
                }

                _benefitRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                await _productAuditWriter.AddLastViewed<product_Benefit>(entity.Id);
                entity.BenefitRules.Clear();
                entity.BenefitRules = Mapper.Map<List<product_BenefitRule>>(productBenefit.RuleItems);
                AddAuditEntry(entity, false, wizardId, productBenefit.EarningTypeIds);
            }
        }

        public async Task<Benefit> GetBenefit(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewBenefit);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _benefitRepository
                    .SingleAsync(s => s.Id == id, $"Could not find benefit with id {id}");

                await _benefitRepository.LoadAsync(result, d => d.BenefitMedicalReportTypes);
                await _benefitRepository.LoadAsync(result, d => d.BenefitEarningsTypes);
                await _benefitRepository.LoadAsync(result, d => d.BenefitRates);
                await _benefitRepository.LoadAsync(result, d => d.BenefitNotes);
                await _benefitRepository.LoadAsync(result, d => d.BenefitRules);
                await _benefitRepository.LoadAsync(result, d => d.BenefitEarningsRangeCalcs);
                await _benefitRepository.LoadAsync(result, d => d.BenefitCompensationAmounts);

                var benefit = Mapper.Map<Benefit>(result);

                benefit.RuleItems = result.BenefitRules.Select(productRule => new RuleItem()
                {
                    RuleConfiguration = productRule.RuleConfiguration?.Replace("\"", "\'"),
                    RuleId = productRule.RuleId,
                    Id = productRule.Id
                }).ToList();

                await _productAuditWriter.AddLastViewed<product_Benefit>(benefit.Id);
                return benefit;
            }
        }

        public async Task<Benefit> GetBenefitAtEffectiveDate(int id, DateTime effectiveDate)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewBenefit);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _benefitRepository.SingleAsync(s => s.Id == id, $"Could not find benefit with id {id}");

                await _benefitRepository.LoadAsync(result, e => e.BenefitAddBeneficiaries);
                await _benefitRepository.LoadAsync(result, e => e.BenefitCaptureEarnings);
                await _benefitRepository.LoadAsync(result, e => e.BenefitCompensationAmounts);
                await _benefitRepository.LoadAsync(result, e => e.BenefitCoverMemberTypes);
                await _benefitRepository.LoadAsync(result, e => e.BenefitMedicalReportRequireds);
                await _benefitRepository.LoadAsync(result, e => e.BenefitEarningsRangeCalcs);

                var benefit = Mapper.Map<Benefit>(result);

                benefit.BenefitAddBeneficiaries.RemoveAll(s => s.StartDate.Date > effectiveDate.Date || effectiveDate.Date >= Convert.ToDateTime(s.EndDate).Date);
                benefit.BenefitCaptureEarnings.RemoveAll(s => s.StartDate.Date > effectiveDate.Date || effectiveDate.Date >= Convert.ToDateTime(s.EndDate).Date);
                benefit.BenefitCompensationAmounts.RemoveAll(s => s.StartDate.Date > effectiveDate.Date || effectiveDate.Date >= Convert.ToDateTime(s.EndDate).Date);
                benefit.BenefitCoverMemberTypes.RemoveAll(s => s.StartDate.Date > effectiveDate.Date || effectiveDate.Date >= Convert.ToDateTime(s.EndDate).Date);
                benefit.BenefitMedicalReportRequireds.RemoveAll(s => s.StartDate.Date > effectiveDate.Date || effectiveDate.Date >= Convert.ToDateTime(s.EndDate).Date);
                benefit.BenefitEarningsRangeCalcs.RemoveAll(s => s.EffectiveFrom.Date > effectiveDate.Date || effectiveDate.Date >= Convert.ToDateTime(s.EffectiveTo).Date);

                return benefit;
            }
        }

        public async Task<Benefit> GetBenefitByName(string name)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewBenefit);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _benefitRepository
                    .SingleOrDefaultAsync(s => s.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
                if (data is null) return null;
                return Mapper.Map<Benefit>(data);
            }
        }

        public async Task<Benefit> GetMedicalBenefit(int benefitId, string code)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await (from br in _benefitRepository
                                  where br.Code.Equals(code, StringComparison.OrdinalIgnoreCase)
                                  && br.Id == benefitId
                                  select br).FirstOrDefaultAsync();

                if (data is null) return null;
                return Mapper.Map<Benefit>(data);
            }
        }

        public async Task<List<Benefit>> GetBenefits()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewBenefit);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var benefits = await _benefitRepository
                    .Select(benefit => new Benefit
                    {
                        Id = benefit.Id,
                        Code = benefit.Code,
                        Name = benefit.Name,
                        StartDate = benefit.StartDate,
                        EndDate = benefit.EndDate,
                        ProductId = benefit.ProductId,
                        BenefitType = benefit.BenefitType,
                        CoverMemberType = benefit.CoverMemberType,
                        CreatedBy = benefit.CreatedBy,
                        CreatedDate = benefit.CreatedDate,
                        IsDeleted = benefit.IsDeleted,
                        ModifiedBy = benefit.ModifiedBy,
                        ModifiedDate = benefit.ModifiedDate
                    })
                    .ToListAsync();
                //Mapper.Map<List<Benefit>>(
                return benefits;
            }
        }

        public async Task<List<Benefit>> GetBenefitsByBenefitIds(List<int> ids)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewBenefit);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var benefits = await _benefitRepository
                    .Select(benefit => new Benefit
                    {
                        Id = benefit.Id,
                        Code = benefit.Code,
                        Name = benefit.Name,
                        StartDate = benefit.StartDate,
                        EndDate = benefit.EndDate,
                        ProductId = benefit.ProductId,
                        BenefitType = benefit.BenefitType,
                        CoverMemberType = benefit.CoverMemberType,
                        CreatedBy = benefit.CreatedBy,
                        CreatedDate = benefit.CreatedDate,
                        IsDeleted = benefit.IsDeleted,
                        ModifiedBy = benefit.ModifiedBy,
                        ModifiedDate = benefit.ModifiedDate,
                        BenefitRateLatest = benefit.BenefitRates.OrderByDescending(r => r.EffectiveDate).Select(r => r.BenefitAmount).FirstOrDefault(),
                        BenefitBaseRateLatest = benefit.BenefitRates.OrderByDescending(r => r.EffectiveDate).Select(r => r.BaseRate).FirstOrDefault(),
                        BenefitGroup = benefit.BenefitGroup,
                    }).Where(t => ids.Contains(t.Id))
                    .ToListAsync();
                return benefits;
            }
        }

        public async Task<List<Benefit>> GetBenefitsByProductId(int productid)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewBenefit);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var benefits = await _benefitRepository
                    .Where(b => b.ProductId == productid && !b.IsDeleted && (!b.EndDate.HasValue || b.EndDate > DateTimeHelper.SaNow))
                    .Select(benefit => new Benefit
                    {
                        Id = benefit.Id,
                        Code = benefit.Code,
                        Name = benefit.Name,
                        StartDate = benefit.StartDate,
                        EndDate = benefit.EndDate,
                        ProductId = benefit.ProductId,
                        BenefitType = benefit.BenefitType,
                        CoverMemberType = benefit.CoverMemberType,
                        CreatedBy = benefit.CreatedBy,
                        CreatedDate = benefit.CreatedDate,
                        IsDeleted = benefit.IsDeleted,
                        ModifiedBy = benefit.ModifiedBy,
                        ModifiedDate = benefit.ModifiedDate,
                        BenefitRateLatest = benefit.BenefitRates.OrderByDescending(r => r.EffectiveDate).Select(r => r.BenefitAmount).FirstOrDefault(),
                        BenefitBaseRateLatest = benefit.BenefitRates.OrderByDescending(r => r.EffectiveDate).Select(r => r.BaseRate).FirstOrDefault(),

                    }).ToListAsync();

                return benefits;
            }
        }

        public async Task<ProductOption> GetProductBenefitRates(int productOptionId, int coverMemberTypeId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewBenefit);


            var filteredBenefits = await _productOptionService.GetBenefitsForProductOptionAndCoverType(productOptionId, coverMemberTypeId);
            var filteredBenefitIds = filteredBenefits.Select(x => x.BenefitId).ToList();


            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await (from product in _productRepository
                                     join productOption in _productOptionRepository.Where(x => x.Id == productOptionId) on product.Id equals productOption.ProductId
                                     join benefit in _benefitRepository.Where(x => filteredBenefitIds.Contains(x.Id))
                                     on product.Id equals benefit.ProductId
                                     join benefitRate in _productBenefitRateRepository on benefit.Id equals benefitRate.BenefitId

                                     select new { productOption, product, benefit, benefitRate }).ToListAsync();

                var productBenefitsList = results.Select(x => new ProductBenefitRate
                {
                    ProductOption = Mapper.Map<ProductOption>(x.productOption),
                    Benefit = Mapper.Map<Benefit>(x.benefit)

                }).ToList();

                foreach (var productBenefit in productBenefitsList)
                {
                    productBenefit.Benefit = await GetBenefit(productBenefit.Benefit.Id);
                }

                var productOptions = productBenefitsList.GroupBy(x => x.ProductOption).Select(x => x.Key).Distinct().ToList();

                foreach (var productBenefit in productBenefitsList)
                {
                    productOptions.FirstOrDefault(x => x.Id == productBenefit.ProductOption.Id)?.Benefits.Add(productBenefit.Benefit);
                }

                var filteredProductOption = productOptions.FirstOrDefault(x => x.Benefits != null && x.Benefits.Count > 0);

                return filteredProductOption;

            }
        }

        public async Task<PagedRequestResult<Benefit>> SearchBenefits(PagedRequest query)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewBenefit);

            Contract.Requires(query != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var benefits = await _benefitRepository
                    .Where(benefit => string.IsNullOrEmpty(query.SearchCriteria)
                                      || benefit.Name.Contains(query.SearchCriteria)
                                      || benefit.Code.Contains(query.SearchCriteria))
                    .ToPagedResult<product_Benefit, Benefit>(query);
                return benefits;
            }
        }

        public async Task<List<Common.Entities.Lookup>> GetBenefitTypes()
        {
            return await Task.Run(() => typeof(BenefitTypeEnum).ToLookupList());
        }

        public async Task<List<Common.Entities.Lookup>> GetCoverMemberTypes()
        {
            return await Task.Run(() => typeof(CoverMemberTypeEnum).ToLookupList());
        }

        public async Task<List<Common.Entities.Lookup>> GetEarningTypes()
        {
            return await Task.Run(() => typeof(EarningsTypeEnum).ToLookupList());
        }

        public async Task<List<Common.Entities.Lookup>> GetDisabilityBenefitTerms()
        {
            return await Task.Run(() => typeof(DisabilityBenefitTermEnum).ToLookupList());
        }

        public async Task<ImportBenefitsSummary> UploadBenefits(FileContentImport content)
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
            const int StartingIndex = 0;
            var fileData = Encoding.UTF8.GetString(decodedString, StartingIndex, decodedString.Length);
            var benefitIndex = fileData.IndexOf("Benefit Name", StringComparison.Ordinal);

            if (benefitIndex != -1)
            {
                fileData = fileData.Substring(benefitIndex);
            }

            const char commaDelimiter = ',';
            const string newLine = "\n";
            int returned = 0;
            int _returned = 0;
            int uploadSkipped = 0;

            var csvParserOptions = new CsvParserOptions(true, commaDelimiter);
            var csvMapper = new BenefitMapping();
            var csvParser = new CsvParser<Load_Benefit>(csvParserOptions, csvMapper);
            var csvReaderOptions = new CsvReaderOptions(new[] { newLine });
            var records = csvParser.ReadFromString(csvReaderOptions, fileData).ToList();

            var fileIdentifier = Guid.NewGuid();
            var benefitType = string.Empty;
            var benefits = new List<Load_Benefit>();

            var rowNumber = 3; // First line containing data in the spreadsheet.
            var uploadResult = new ImportBenefitsSummary();

            foreach (var record in records)
            {
                if (!record.IsValid)
                {
                    var message = $"Error on line {rowNumber} column {record.Error.ColumnIndex}: {record.Error.Value}";
                    throw new Exception(message);
                };
                if (String.IsNullOrEmpty(record.Result.BenefitType))
                {
                    uploadSkipped++;
                    continue;
                }

                var benefitsListingData = record.Result;
                if (string.IsNullOrEmpty(benefitType)) benefitType = benefitsListingData.BenefitType;
                benefitsListingData.FileIdentifier = fileIdentifier;
                benefitsListingData.BenefitType = benefitType;
                benefitsListingData.ExcelRowNumber = rowNumber.ToString();

                benefits.Add(benefitsListingData);
                rowNumber++;
            }

            returned = benefits.Count;
            _returned = returned;

            var benefitResult = await ImportBenefitRecords(fileIdentifier, benefits);
            var res = await ValidateUploadedBenefits(fileIdentifier, content.UserId, content.FileName);

            uploadResult.TotalBenefits = rowNumber - 2;
            uploadResult.TotalUploaded = _returned;
            uploadResult.TotalFailed = uploadSkipped;
            uploadResult.ErrorAuditCount = res;

            return uploadResult;
        }

        private async Task<int> ImportBenefitRecords(Guid fileIdentifier, List<Load_Benefit> benefit)
        {
            if(benefit.Count == 0) return 0;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                string sql;
                const int importCount = 500;
                while (benefit.Count > 0)
                {
                    var count = benefit.Count >= importCount ? importCount : benefit.Count;
                    var records = benefit.GetRange(0, count);
                    sql = GetBenefitSql(records);
                    await _loadBenefitRepository.ExecuteSqlCommandAsync(sql);
                    benefit.RemoveRange(0, count);
                }
                var data = await _loadBenefitRepository
                    .FirstOrDefaultAsync(s => s.FileIdentifier.Equals(fileIdentifier));

                return 0;
            }
        }

        private async Task<int> ValidateUploadedBenefits(Guid fileIdentifier, int UserId, string fileName)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _loadBenefitRepository.Where(s => s.FileIdentifier.Equals(fileIdentifier)).ToListAsync();

                foreach (var benefit in data)
                {
                    await RunValidations(benefit.FileIdentifier, benefit.BenefitName, benefit.ExcelRowNumber, UserId, fileName);
                }
                var errorAuditResult = await _loadBenefitUploadErrorAuditRepository.Where(s => s.FileIdentifier.Equals(fileIdentifier.ToString())).ToListAsync();

                return errorAuditResult.Count;
            }
        }

        private async Task RunValidations(Guid fileIdentifier, string benefitType, string rowNumber, int userId, string fileName)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                await _loadBenefitRepository.ExecuteSqlCommandAsync(DatabaseConstants.BenefitRecordsUpload,
                    new SqlParameter("@fileIdentifier", fileIdentifier),
                    new SqlParameter("@benefitName", benefitType),
                    new SqlParameter("@rowNumber", rowNumber),
                    new SqlParameter("@UserId", userId),
                    new SqlParameter("@FileName", fileName));
            }
        }

        private string GetBenefitSql(List<Load_Benefit> records)
        {
            var sql = "INSERT INTO [Load].[Benefit] ([FileIdentifier],[BenefitName],[BenefitType],[Product],[CoverMemberType],[StartDate],[EndDate],[MinCompensation],[MaxCompensation],[ExcessAmount],[ExcelRowNumber],[Notes]) values";
            foreach (var rec in records)
            {
                sql += string.Format("({0},{1},{2},{3},{4},{5},{6},{7},{8},{9},{10},{11}),",
                    rec.FileIdentifier.ToString().Quoted(),
                    SetLength(rec.BenefitName, 100).Quoted(),
                    SetLength(rec.BenefitType, 32).Quoted(),
                    SetLength(rec.Product, 32).Quoted(),
                    SetLength(rec.CoverMemberType, 32).Quoted(),
                    rec.StartDate.ToString().Quoted(),
                    rec.EndDate.ToString().Quoted(),
                    rec.MinCompensation,
                    rec.MaxCompensation,
                    rec.ExcessAmount,
                    SetLength(rec.ExcelRowNumber, 50).Quoted(),
                    "NULL"
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

        public async Task<PagedRequestResult<BenefitsUploadErrorAuditDetails>> GetPagedBenefitsErrorAudit(PagedRequest request)
        {
            Contract.Requires(request != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var benefitsUploadPaged = new PagedRequestResult<BenefitsUploadErrorAuditDetails>();
                var benefitsUpload = new PagedRequestResult<Load_BenefitsUploadErrorAudit>();

                if (string.IsNullOrEmpty(request.SearchCriteria))
                {
                    benefitsUpload = await _loadBenefitUploadErrorAuditRepository.ToPagedResult(request);
                }
                else
                {
                    benefitsUpload = await _loadBenefitUploadErrorAuditRepository.Where(a => a.BenefitName.Contains(request.SearchCriteria)
                                                                                        || a.ErrorCategory.Contains(request.SearchCriteria)).ToPagedResult(request);
                }

                if (benefitsUpload.Data.Count == 0)
                    return new PagedRequestResult<BenefitsUploadErrorAuditDetails>();

                var benefitsUploadMapped = Mapper.Map<List<BenefitsUploadErrorAuditDetails>>(benefitsUpload.Data);

                return new PagedRequestResult<BenefitsUploadErrorAuditDetails>()
                {
                    PageSize = benefitsUpload.PageSize,
                    Page = benefitsUpload.Page,
                    PageCount = benefitsUpload.PageCount,
                    RowCount = benefitsUpload.RowCount,
                    Data = benefitsUploadMapped
                };
            }
        }
    }
}