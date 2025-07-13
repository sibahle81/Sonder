using AutoMapper;

using FileHelpers;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Entities;

using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Services
{
    public class AgeAnalysisFacade : RemotingStatelessService, IAgeAnalysisService
    {
        private const string BillingModulePermissions = "BillingModulePermissions";

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<billing_AgeAnalysisNote> _ageAnalysisRepository;
        private readonly IRepository<billing_AgeAnalysisAgent> _agentRepository;
        private readonly ISerializerService _serializer;
        private readonly IWizardService _wizardService;
        private readonly IConfigurationService _configurationService;

        public AgeAnalysisFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IWizardService wizardService,
            ISerializerService serializer,
            IRepository<billing_AgeAnalysisNote> ageAnalysisRepository,
            IRepository<billing_AgeAnalysisAgent> agentRepository,
            IConfigurationService configurationService
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _ageAnalysisRepository = ageAnalysisRepository;
            _agentRepository = agentRepository;
            _wizardService = wizardService;
            _serializer = serializer;
            _configurationService = configurationService;
        }

        public async Task<List<AgeAnalysis>> GetAgeAnalysis(AgeAnalysisRequest ageAnalysisRequest)
        {
            Contract.Requires(ageAnalysisRequest != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewAgeAnalysis);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var idTypeIdParameter = new SqlParameter { ParameterName = "@clientTypeId", Value = ageAnalysisRequest.ClientTypeId };
                var ageTypeIdParameter = new SqlParameter { ParameterName = "@ageTypeId", Value = ageAnalysisRequest.AgeTypeId };
                var debtorStatusParameter = new SqlParameter { ParameterName = "@debtorStatus", Value = ageAnalysisRequest.DebtorStatusId };
                var assignedStatusParameter = new SqlParameter { ParameterName = "@assignedStatus", Value = ageAnalysisRequest.AssignedStatusId };
                var balanceTypeIdParameter = new SqlParameter { ParameterName = "@balanceTypeId", Value = ageAnalysisRequest.BalanceTypeId };
                var industryIdParameter = new SqlParameter { ParameterName = "@industryId", Value = ageAnalysisRequest.IndustryId };
                var endDateParameter = new SqlParameter { ParameterName = "@endDate", Value = ageAnalysisRequest.EndDate.ToSaDateTime() };
                var includeInterestParameter = new SqlParameter { ParameterName = "@includeInterest", Value = ageAnalysisRequest.IncludeInterest ? 1 : 0 };
                var includeNotesParameter = new SqlParameter { ParameterName = "@includeNotes", Value = ageAnalysisRequest.IncludeNotes ? 1 : 0 };
                var counterParameter = new SqlParameter { ParameterName = "@counter", Value = ageAnalysisRequest.Counter };
                var productParameter = new SqlParameter { ParameterName = "@productId", Value = ageAnalysisRequest.ProductId };

                var summary = await _ageAnalysisRepository.SqlQueryAsync<AgeAnalysis>(
                    "[billing].[GetAgeAnalysis] @clientTypeId, @ageTypeId, @debtorStatus, @assignedStatus, @balanceTypeId, @industryId, @endDate, @includeInterest, @includeNotes, @counter, @productId",
                        idTypeIdParameter,
                        ageTypeIdParameter,
                        debtorStatusParameter,
                        assignedStatusParameter,
                        balanceTypeIdParameter,
                        industryIdParameter,
                        endDateParameter,
                        includeInterestParameter,
                        includeNotesParameter,
                        counterParameter,
                        productParameter
                );
                return summary;
            }
        }

        public async Task<List<AgeAnalysis>> GetRecoveryAgeAnalysis(AgeAnalysisRequest ageAnalysisRequest)
        {
            Contract.Requires(ageAnalysisRequest != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewAgeAnalysis);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                try
                {
                    var idTypeIdParameter = new SqlParameter { ParameterName = "@clientTypeId", Value = ageAnalysisRequest.ClientTypeId };
                    var ageTypeIdParameter = new SqlParameter { ParameterName = "@ageTypeId", Value = ageAnalysisRequest.AgeTypeId };
                    var debtorStatusParameter = new SqlParameter { ParameterName = "@debtorStatus", Value = ageAnalysisRequest.DebtorStatusId };
                    var assignedStatusParameter = new SqlParameter { ParameterName = "@assignedStatus", Value = ageAnalysisRequest.AssignedStatusId };
                    var balanceTypeIdParameter = new SqlParameter { ParameterName = "@balanceTypeId", Value = ageAnalysisRequest.BalanceTypeId };
                    var endDateParameter = new SqlParameter { ParameterName = "@endDate", Value = ageAnalysisRequest.EndDate };
                    var includeInterestParameter = new SqlParameter { ParameterName = "@includeInterest", Value = ageAnalysisRequest.IncludeInterest ? 1 : 0 };
                    var includeNotesParameter = new SqlParameter { ParameterName = "@includeNotes", Value = ageAnalysisRequest.IncludeNotes ? 1 : 0 };
                    var counterParameter = new SqlParameter { ParameterName = "@counter", Value = ageAnalysisRequest.Counter };

                    var summary = await _ageAnalysisRepository.SqlQueryAsync<AgeAnalysis>(
                        "[billing].[GetRecoveryAgeAnalysis] @clientTypeId, @ageTypeId, @debtorStatus, @assignedStatus, @balanceTypeId, @endDate, @includeInterest, @includeNotes, @counter",
                        idTypeIdParameter,
                        ageTypeIdParameter,
                        debtorStatusParameter,
                        assignedStatusParameter,
                        balanceTypeIdParameter,
                        endDateParameter,
                        includeInterestParameter,
                        includeNotesParameter,
                        counterParameter
                    );
                    return summary;
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    throw;
                }

            }

        }

        public async Task<int> AssignCollectionAgent(CollectionAgent collectionAgent)
        {
            Contract.Requires(collectionAgent != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var count = 0;
                foreach (var accountId in collectionAgent.AccountIds)
                {
                    var entity = await _agentRepository.SingleOrDefaultAsync(a => a.RolePlayerId == accountId);
                    if (entity is null)
                    {
                        entity = new billing_AgeAnalysisAgent
                        {
                            RolePlayerId = accountId,
                            CollectionAgent = collectionAgent.Agent.Email,
                            IsDeleted = false
                        };
                        _agentRepository.Create(entity);
                        count++;
                    }
                    else
                    {
                        entity.CollectionAgent = collectionAgent.Agent.Email;
                        _agentRepository.Update(entity);
                        count++;
                    }
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);

                var data = _serializer.Serialize(collectionAgent);
                var wizard = new StartWizardRequest() { Data = data, Type = "collection-assignment", LinkedItemId = -1 };
                await _wizardService.StartWizard(wizard);

                return count;
            }

        }

        public async Task ClearCollectionAgents(CollectionAgent collectionAgent)
        {
            Contract.Requires(collectionAgent != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var data = await _agentRepository
                    .Where(r => collectionAgent.AccountIds.Contains(r.RolePlayerId)
                             && r.CollectionAgent == collectionAgent.Agent.Email)
                    .ToListAsync();
                data.ForEach(r => r.CollectionAgent = "");
                _agentRepository.Update(data);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<int> ImportCollectionAgents(string fileContent)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ImportCollectionAgents);

            var results = 0;
            var engine = new FileHelperEngine<CollectionAgentImportFileModel>();
            using (TextReader textReader = new StringReader(fileContent))
            {
                try
                {
                    var records = engine.ReadStream(textReader);
                    if (records.Length > 0)
                    {
                        results = records.Length;
                        var rolePlayerIds = records.Select(c => c.AccountId).ToList();
                        List<int> intList = rolePlayerIds.ConvertAll(int.Parse);

                        using (var scope = _dbContextScopeFactory.Create())
                        {
                            var data = await _agentRepository
                                .Where(c => intList.Contains(c.RolePlayerId))
                                .ToListAsync();
                            var existingIds = data.Select(c => c.RolePlayerId).ToList();
                            data.ForEach(c =>
                               {
                                   var details = records.Where(y => int.Parse(y.AccountId) == c.RolePlayerId).ToList();
                                   if (details.Count > 0)
                                   {
                                       c.CollectionAgent = details.FirstOrDefault()?.CollectionAgent;
                                       c.DebtorsClerk = details.FirstOrDefault()?.DebtorsClerk;
                                   }
                               });
                            _agentRepository.Update(data);

                            var newEntryIds = intList.Except(existingIds);
                            var newEntries = records.Where(c => newEntryIds.Contains(int.Parse(c.AccountId)));
                            var itemsToSave = new List<billing_AgeAnalysisAgent>();
                            newEntries.ForEach(c =>
                            {
                                itemsToSave.Add(new billing_AgeAnalysisAgent
                                {
                                    RolePlayerId = int.Parse(c.AccountId),
                                    CollectionAgent = c?.CollectionAgent,
                                    DebtorsClerk = c?.DebtorsClerk,
                                    IsDeleted = false
                                });
                            });
                            _agentRepository.Create(itemsToSave);
                            await scope.SaveChangesAsync().ConfigureAwait(false);
                        }
                    }
                    return results;
                }
                catch (Exception ex)
                {
                    ex.LogException();
                }
                return results;
            }
        }

        public async Task<AgeAnalysisNote> SaveNote(AgeAnalysisNote note)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddBillingNote);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var ageAnalysisNote = Mapper.Map<billing_AgeAnalysisNote>(note);
                _ageAnalysisRepository.Create(ageAnalysisNote);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return Mapper.Map<AgeAnalysisNote>(ageAnalysisNote);
            }
        }
    }
}
