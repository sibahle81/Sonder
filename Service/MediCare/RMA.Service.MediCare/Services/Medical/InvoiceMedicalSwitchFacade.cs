using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceBus.Producers;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Constants;
using RMA.Service.MediCare.Database.Entities;
using RMA.Service.MediCare.RuleTasks;

using System;
using System.Collections.Generic;
using System.Data.Entity.Core.Objects;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class InvoiceMedicalSwitchFacade : RemotingStatelessService, IInvoiceMedicalSwitchService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<medical_Invoice> _invoiceRepository;
        private readonly IRepository<medical_InvoiceLine> _invoiceLineRepository;
        private readonly IRepository<medical_TebaInvoice> _tebaInvoiceRepository;
        private readonly IRepository<medical_TebaInvoiceLine> _tebaInvoiceLineRepository;
        private readonly IRepository<medical_TebaTariff> _tebaTariffRepository;

        private readonly IRepository<medical_SwitchBatch> _medicalSwitchBatchRepository;
        private readonly IRepository<medical_SwitchBatchInvoice> _medicalSwitchBatchInvoiceRepository;
        private readonly IRepository<medical_SwitchBatchInvoiceLine> _medicalSwitchBatchInvoiceLineRepository;
        private readonly IRepository<medical_SwitchBatchInvoiceLineUnderAssessReason> _medicalSwitchBatchInvoiceLineUnderAssessReasonRepository;
        private readonly IRepository<medical_MiSwitchBatchDeleteReason> _medicalMiSwitchBatchDeleteReasonRepository;
        private readonly IRepository<medical_SwitchUnderAssessReasonSetting> _switchUnderAssessReasonSettingRepository;
        private readonly IRepository<medical_HealthCareProvider> _healthCareProviderRepository;
        private readonly IRepository<medical_MedicalItem> _medicalItemRepository;
        private readonly IRepository<medical_Tariff> _tariffRepository;
        private readonly IRepository<medical_TariffBaseUnitCost> _tariffBaseUnitCostRepository;

        private readonly IClaimService _claimService;
        private readonly IRuleEngineService _rulesEngine;
        private readonly IEventService _eventService;
        private readonly IConfigurationService _configurationService;
        private readonly IInvoiceCommonService _invoiceCommonService;
        private readonly ISwitchBatchInvoiceUnderAssessReasonService _switchBatchInvoiceUnderAssessReasonService;
        private readonly ISwitchBatchInvoiceLineUnderAssessReasonService _switchBatchInvoiceLineUnderAssessReasonService;
        private readonly ISwitchInvoiceHelperService _switchInvoiceHelperService;
        private readonly IUserService _userService;
        private readonly ISwitchBatchService _switchBatchService;
        private readonly IInvoiceHelperService _invoiceHelperService;
        private readonly IHealthCareProviderService _healthCareProviderService;
        private readonly ILookupService _lookupService;
        private readonly IVatService _vatService;

        public InvoiceMedicalSwitchFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<medical_Invoice> invoiceRepository
            , IRepository<medical_InvoiceLine> invoiceLineRepository
            , IRepository<medical_TebaInvoiceLine> tebaInvoiceLineRepository
            , IRepository<medical_TebaInvoice> tebaInvoiceRepository
            , IRepository<medical_SwitchBatch> medicalSwitchBatchRepository
            , IRepository<medical_SwitchBatchInvoice> medicalSwitchBatchInvoiceRepository
            , IRepository<medical_SwitchBatchInvoiceLine> medicalSwitchBatchInvoiceLineRepository
            , IRepository<medical_MiSwitchBatchDeleteReason> medicalMiSwitchBatchDeleteReasonRepository
            , IRepository<medical_SwitchUnderAssessReasonSetting> switchUnderAssessReasonSettingRepository
            , IRepository<medical_HealthCareProvider> healthCareProviderRepository
            , IRepository<medical_MedicalItem> medicalItemRepository
            , IRepository<medical_TebaTariff> tebaTariffRepository
            , IClaimService claimService
            , IRuleEngineService rulesEngine
            , IEventService eventService
            , IConfigurationService configurationService
            , IInvoiceCommonService invoiceCommonService
            , ISwitchBatchInvoiceUnderAssessReasonService switchBatchInvoiceUnderAssessReasonService
            , ISwitchBatchInvoiceLineUnderAssessReasonService switchBatchInvoiceLineUnderAssessReasonService
            , ISwitchInvoiceHelperService switchInvoiceHelperService
            , IRepository<medical_SwitchBatchInvoiceLineUnderAssessReason> medicalSwitchBatchInvoiceLineUnderAssessReasonRepository
            , IUserService userService
            , ISwitchBatchService switchBatchService
            , IInvoiceHelperService invoiceHelperService
            , IRepository<medical_Tariff> tariffRepository
            , IRepository<medical_TariffBaseUnitCost> tariffBaseUnitCostRepository
            , IHealthCareProviderService healthCareProviderService
            , ILookupService lookupService
            , IVatService vatService
            )
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _invoiceRepository = invoiceRepository;
            _invoiceLineRepository = invoiceLineRepository;
            _tebaInvoiceRepository = tebaInvoiceRepository;
            _tebaInvoiceLineRepository = tebaInvoiceLineRepository;

            _medicalSwitchBatchRepository = medicalSwitchBatchRepository;
            _medicalSwitchBatchInvoiceRepository = medicalSwitchBatchInvoiceRepository;
            _medicalSwitchBatchInvoiceLineRepository = medicalSwitchBatchInvoiceLineRepository;
            _medicalMiSwitchBatchDeleteReasonRepository = medicalMiSwitchBatchDeleteReasonRepository;
            _switchUnderAssessReasonSettingRepository = switchUnderAssessReasonSettingRepository;
            _tebaTariffRepository = tebaTariffRepository;
            _healthCareProviderRepository = healthCareProviderRepository;
            _medicalItemRepository = medicalItemRepository;
            _claimService = claimService;
            _rulesEngine = rulesEngine;
            _eventService = eventService;
            _configurationService = configurationService;
            _invoiceCommonService = invoiceCommonService;
            _switchBatchInvoiceUnderAssessReasonService = switchBatchInvoiceUnderAssessReasonService;
            _switchBatchInvoiceLineUnderAssessReasonService = switchBatchInvoiceLineUnderAssessReasonService;
            _switchInvoiceHelperService = switchInvoiceHelperService;
            _userService = userService;
            _medicalSwitchBatchInvoiceLineUnderAssessReasonRepository = medicalSwitchBatchInvoiceLineUnderAssessReasonRepository;
            _switchBatchService = switchBatchService;
            _invoiceHelperService = invoiceHelperService;
            _tariffRepository = tariffRepository;
            _tariffBaseUnitCostRepository = tariffBaseUnitCostRepository;
            _healthCareProviderService = healthCareProviderService;
            _lookupService = lookupService;
            _vatService = vatService;
        }

        public async Task<List<SwitchBatchInvoice>> GetMedicalSwitchBatchInvoices(int switchBatchId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewSwitchBatchMedicalInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var switchInvoiceEntities = await _medicalSwitchBatchInvoiceRepository.Where(i => i.SwitchBatchId == switchBatchId).OrderBy(i => i.InvoiceId == null)
                    .ThenByDescending(i => i.InvoiceId).ToListAsync();


                foreach (var invoice in switchInvoiceEntities)
                {
                    // Load related SwitchBatchInvoiceLines and SwitchBatchInvoiceUnderAssessReasons for each invoice
                    await _medicalSwitchBatchInvoiceRepository.LoadAsync(invoice, i => i.SwitchBatchInvoiceLines);
                    await _medicalSwitchBatchInvoiceRepository.LoadAsync(invoice, i => i.SwitchBatchInvoiceUnderAssessReasons);

                    // Load related SwitchBatchInvoiceLineUnderAssessReasons for each SwitchBatchInvoiceLine
                    foreach (var invoiceLine in invoice.SwitchBatchInvoiceLines)
                    {
                        await _medicalSwitchBatchInvoiceLineRepository.LoadAsync(invoiceLine, il => il.SwitchBatchInvoiceLineUnderAssessReasons);
                    }
                }


                var medicalSwitchBatchInvoices = Mapper.Map<List<SwitchBatchInvoice>>(switchInvoiceEntities);

                return medicalSwitchBatchInvoices;
            }
        }

        private async Task<List<SwitchBatchInvoice>> GetMedicalSwitchBatchInvoicesForValidation(int switchBatchId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewSwitchBatchMedicalInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var medicalSwitchBatchInvoices = await _medicalSwitchBatchInvoiceRepository.Where(i =>
                    (i.SwitchBatchId == switchBatchId || switchBatchId == 0)
                     && (i.SwitchInvoiceStatus == SwitchInvoiceStatusEnum.PendingValidation ||
                          i.SwitchInvoiceStatus == SwitchInvoiceStatusEnum.Reinstated || i.SwitchInvoiceStatus == null)
                   ).OrderByDescending(i => i.CreatedDate).ToListAsync();

                return Mapper.Map<List<SwitchBatchInvoice>>(medicalSwitchBatchInvoices);
            }
        }

        private async Task<List<SwitchBatchInvoice>> GetLinkedMedicalSwitchBatchInvoices()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var medicalInvoiceCreationCount = await _configurationService.GetModuleSetting(SystemSettings.MedicalInvoiceCreationCount);
                var entities = await _medicalSwitchBatchInvoiceRepository.Where(i => i.InvoiceId == null
                        && (i.SwitchInvoiceStatus == SwitchInvoiceStatusEnum.AutoLinked || i.SwitchInvoiceStatus == SwitchInvoiceStatusEnum.UserLinked)).Take(medicalInvoiceCreationCount.ToInt().Value).ToListAsync();
                foreach (var entity in entities)
                {
                    await _medicalSwitchBatchInvoiceRepository.LoadAsync(entity, i => i.SwitchBatchInvoiceLines);
                }

                return Mapper.Map<List<SwitchBatchInvoice>>(entities);
            }
        }

        public async Task<List<SwitchBatch>> GetMedicalSwitchBatchList(MedicalInvoiceSearchBatchCriteria searchBatchSearchCrateria)
        {
            Contract.Requires(searchBatchSearchCrateria != null);
            RmaIdentity.DemandPermission(Permissions.ViewSwitchBatchMedicalInvoice);

            var assignedUserId = searchBatchSearchCrateria.AssignedToUserId ?? 0;

            const string medicalInvoiceApproverRole = "Medical Invoice Approval: Processor";
            var users = await _userService.GetUsersByRoleName(medicalInvoiceApproverRole);

            var assignedUser = string.Empty;
            if (assignedUserId > 0)
            {
                var user = users.SingleOrDefault(u => u.Id == assignedUserId);
                if (user != null)
                {
                    assignedUser = user.DisplayName;
                }
            }

            List<SwitchBatchTypeEnum> allowedSwitchBatchTypes = new List<SwitchBatchTypeEnum>
                {
                    SwitchBatchTypeEnum.MedEDI,
                    SwitchBatchTypeEnum.Teba
                };

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var medicalSwitchBatchRepository = _medicalSwitchBatchRepository.Select(i => i);

                if (!string.IsNullOrEmpty(searchBatchSearchCrateria.SwitchTypes))
                    medicalSwitchBatchRepository = _medicalSwitchBatchRepository.Where(i => i.Description.Contains(searchBatchSearchCrateria.SwitchTypes));
                if (searchBatchSearchCrateria.SwitchBatchId > 1)
                    medicalSwitchBatchRepository = _medicalSwitchBatchRepository.Where(i => i.SwitchBatchId == searchBatchSearchCrateria.SwitchBatchId);
                if (!string.IsNullOrEmpty(searchBatchSearchCrateria.BatchNumber))
                    medicalSwitchBatchRepository = _medicalSwitchBatchRepository.Where(i => i.SwitchBatchNumber.Contains(searchBatchSearchCrateria.BatchNumber));
                if (searchBatchSearchCrateria.AssignedToUserId > 1)
                    medicalSwitchBatchRepository = _medicalSwitchBatchRepository.Where(i => i.AssignedUserId == searchBatchSearchCrateria.AssignedToUserId);
                if (searchBatchSearchCrateria.DateSubmitted != null)
                    medicalSwitchBatchRepository = _medicalSwitchBatchRepository.Where(i => i.DateSubmitted == searchBatchSearchCrateria.DateSubmitted);
                if (searchBatchSearchCrateria.DateSwitched != null)
                    medicalSwitchBatchRepository = _medicalSwitchBatchRepository.Where(i => i.DateSwitched == searchBatchSearchCrateria.DateSwitched);
                if (searchBatchSearchCrateria.DateRecieved != null)
                    medicalSwitchBatchRepository = _medicalSwitchBatchRepository.Where(i => i.DateReceived == searchBatchSearchCrateria.DateRecieved);
                if (searchBatchSearchCrateria.IsCompleteBatches == true)
                    medicalSwitchBatchRepository = _medicalSwitchBatchRepository.Where(i => i.IsProcessed == searchBatchSearchCrateria.IsCompleteBatches);
                if (allowedSwitchBatchTypes.Contains((SwitchBatchTypeEnum)searchBatchSearchCrateria.SwitchBatchType))
                    medicalSwitchBatchRepository = _medicalSwitchBatchRepository.Where(i => i.SwitchBatchType == searchBatchSearchCrateria.SwitchBatchType);

                var medicalSwitchBatchList = await (
                    from sb in medicalSwitchBatchRepository
                    select new SwitchBatch
                    {
                        SwitchBatchId = sb.SwitchBatchId,
                        SwitchId = sb.SwitchId,
                        Description = sb.Description,
                        SwitchBatchNumber = sb.SwitchBatchNumber,
                        SwitchFileName = sb.SwitchFileName,
                        DateSubmitted = sb.DateSubmitted,
                        DateSwitched = sb.DateSwitched,
                        DateReceived = sb.DateReceived,
                        DateCompleted = sb.DateCompleted,
                        InvoicesStated = sb.InvoicesStated,
                        InvoicesCounted = sb.InvoicesCounted,
                        AmountStatedInclusive = sb.AmountStatedInclusive,
                        AmountCountedInclusive = sb.AmountCountedInclusive,
                        AssignedUserId = sb.AssignedUserId,
                        DateCaptured = sb.DateCaptured,
                        LinesStated = sb.LinesStated,
                        LinesCounted = sb.LinesCounted,
                        AssignedToRoleId = sb.AssignedToRoleId,
                        IsProcessed = sb.IsProcessed,
                        IsActive = sb.IsActive,
                        IsDeleted = sb.IsDeleted,
                        CreatedBy = sb.CreatedBy,
                        CreatedDate = sb.CreatedDate,
                        ModifiedBy = sb.ModifiedBy,
                        ModifiedDate = sb.ModifiedDate,
                        AmountProcessed = sb.AmountProcessed,
                        InvoicesProcessed = sb.InvoicesProcessed,
                        SwitchBatchType = sb.SwitchBatchType

                    }).ToListAsync();

                foreach (var batch in medicalSwitchBatchList)
                {
                    if (assignedUserId > 0)
                    {
                        batch.AssignedUser = assignedUser;
                    }
                    else if (batch.AssignedUserId > 0)
                    {
                        var user = users.SingleOrDefault(u => batch.AssignedUserId != null && u.Id == batch.AssignedUserId.Value);
                        if (user != null)
                        {
                            batch.AssignedUser = user.DisplayName;
                        }
                    }
                }

                return medicalSwitchBatchList;
            }
        }

        public async Task<PagedRequestResult<SwitchBatch>> GetPagedMedicalSwitchBatchList(SwitchBatchPagedRequest request)
        {
            Contract.Requires(request != null);
            RmaIdentity.DemandPermission(Permissions.ViewSwitchBatchMedicalInvoice);

            var switchedBy = !string.IsNullOrEmpty(request.SwitchType) ? request.SwitchType : string.Empty;
            var switchBatchId = request.SwitchBatchId > 1 ? request.SwitchBatchId : 0;
            var batchNumber = !string.IsNullOrEmpty(request.BatchNumber) ? request.BatchNumber : string.Empty;
            var assignedUserId = request.AssignedToUserId ?? 0;
            var dateSubmitted = request.DateSubmitted ?? DateTime.MinValue;
            var dateSwitched = request.DateSwitched ?? DateTime.MinValue;
            var dateReceived = request.DateReceived ?? DateTime.MinValue;
            var isBatchCompleted = request.IncludeCompletedBatches ?? false;
            var switchBatchType = request.SwitchBatchType ?? null;
            List<SwitchBatchTypeEnum> allowedSwitchBatchTypes = new List<SwitchBatchTypeEnum>
                {
                    SwitchBatchTypeEnum.MedEDI,
                    SwitchBatchTypeEnum.Teba
                };

            const string medicalInvoiceApproverRole = "Medical Invoice Approval: Processor";
            var users = await _userService.GetUsersByRoleName(medicalInvoiceApproverRole);

            var assignedUser = string.Empty;
            if (assignedUserId > 0)
            {
                var user = users.SingleOrDefault(u => u.Id == assignedUserId);
                if (user != null)
                {
                    assignedUser = user.DisplayName;
                }
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (string.IsNullOrEmpty(request.OrderBy))
                {
                    request.OrderBy = "SwitchBatchId";
                }
                var batchEntities = await _medicalSwitchBatchRepository
                        .Where(sb => (switchedBy.Length <= 0 || sb.Description.Contains(switchedBy))
                        && (!(switchBatchId > 0) || sb.SwitchBatchId == switchBatchId)
                        && (batchNumber.Length <= 0 || sb.SwitchBatchNumber.Contains(batchNumber))
                        && (assignedUserId <= 0 || sb.AssignedUserId == assignedUserId)
                        && (allowedSwitchBatchTypes.Contains((SwitchBatchTypeEnum)switchBatchType) && sb.SwitchBatchType == switchBatchType)
                        && (dateSubmitted == DateTime.MinValue || EntityFunctions.TruncateTime(sb.DateSubmitted) == EntityFunctions.TruncateTime(dateSubmitted))
                        && (dateSwitched == DateTime.MinValue || EntityFunctions.TruncateTime(sb.DateSwitched) == EntityFunctions.TruncateTime(dateSwitched))
                        && (dateReceived == DateTime.MinValue || EntityFunctions.TruncateTime(sb.DateReceived) == EntityFunctions.TruncateTime(dateReceived))
                        && (!sb.IsProcessed.Value || sb.IsProcessed == null || sb.IsProcessed == isBatchCompleted)
                        ).ToPagedResult(request);

                var mappedBatches = Mapper.Map<List<SwitchBatch>>(batchEntities.Data);
                foreach (var batch in mappedBatches)
                {
                    if (assignedUserId > 0)
                    {
                        batch.AssignedUser = assignedUser;
                    }
                    else if (batch.AssignedUserId > 0)
                    {
                        var user = users.SingleOrDefault(u => u.Id == batch.AssignedUserId.Value);
                        if (user != null)
                        {
                            batch.AssignedUser = user.DisplayName;
                        }
                    }
                }

                return new PagedRequestResult<SwitchBatch>
                {
                    Data = mappedBatches,
                    RowCount = batchEntities.RowCount,
                    Page = batchEntities.Page,
                    PageSize = batchEntities.PageSize,
                    PageCount = batchEntities.PageCount
                };
            }
        }

        public async Task<List<SwitchBatchInvoice>> GetUnmappedMiSwitchRecords(MedicalSwitchBatchUnmappedParams medicalSwitchBatchUnmappedParams)
        {
            Contract.Requires(medicalSwitchBatchUnmappedParams != null);
            RmaIdentity.DemandPermission(Permissions.ViewSwitchBatchMedicalInvoice);

            int switchBatchInvoiceId = medicalSwitchBatchUnmappedParams.SwitchBatchInvoiceId;

            List<SwitchBatchInvoice> medicalSwitchBatchInvoices;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var switchInvoiceEntities = await _medicalSwitchBatchInvoiceRepository.Where(i => i.SwitchBatchInvoiceId == switchBatchInvoiceId).ToListAsync();
                medicalSwitchBatchInvoices = Mapper.Map<List<SwitchBatchInvoice>>(switchInvoiceEntities);

                foreach (var item in medicalSwitchBatchInvoices)
                {
                    var invoiceLineRepository = _medicalSwitchBatchInvoiceLineRepository.Select(i => i);
                    item.SwitchBatchInvoiceLines = await (
                            from sbil in _medicalSwitchBatchInvoiceLineRepository
                            where sbil.SwitchBatchInvoiceId == item.SwitchBatchInvoiceId
                            select new SwitchBatchInvoiceLine
                            {
                                SwitchBatchInvoiceLineId = sbil.SwitchBatchInvoiceLineId,
                                SwitchBatchInvoiceId = sbil.SwitchBatchInvoiceId,
                                BatchSequenceNumber = sbil.BatchSequenceNumber,
                                Quantity = sbil.Quantity,
                                TotalInvoiceLineCost = sbil.TotalInvoiceLineCost,
                                TotalInvoiceLineVat = sbil.TotalInvoiceLineVat,
                                TotalInvoiceLineCostInclusive = sbil.TotalInvoiceLineCostInclusive,
                                ServiceDate = sbil.ServiceDate,
                                CreditAmount = sbil.CreditAmount,
                                VatCode = sbil.VatCode,
                                TariffCode = sbil.TariffCode,
                                OtherCode = sbil.OtherCode,
                                Description = sbil.Description,
                                Icd10Code = sbil.Icd10Code,
                                SwitchTransactionNumber = sbil.SwitchTransactionNumber,
                                SwitchInternalNumber = sbil.SwitchInternalNumber,
                                FileSequenceNumber = sbil.FileSequenceNumber,
                                Modifier1 = sbil.Modifier1,
                                Modifier2 = sbil.Modifier2,
                                Modifier3 = sbil.Modifier3,
                                Modifier4 = sbil.Modifier4,
                                DosageDuration = sbil.DosageDuration,
                                ServiceProviderTransactionNumber = sbil.ServiceProviderTransactionNumber,
                                CptCode = sbil.CptCode,
                                TreatmentCodeId = sbil.TreatmentCodeId,
                                IsActive = sbil.IsActive,
                                IsDeleted = sbil.IsDeleted,
                                CreatedBy = sbil.CreatedBy,
                                CreatedDate = sbil.CreatedDate,
                                ModifiedBy = sbil.ModifiedBy,
                                ModifiedDate = sbil.ModifiedDate,
                                ServiceTimeStart = sbil.ServiceTimeStart,
                                ServiceTimeEnd = sbil.ServiceTimeEnd
                            }).ToListAsync();
                }

                return medicalSwitchBatchInvoices;
            }
        }

        public async Task<List<MISwitchBatchDeleteReason>> GetSwitchBatchesDeleteReasons()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _medicalMiSwitchBatchDeleteReasonRepository
                    .ProjectTo<MISwitchBatchDeleteReason>()
                    .ToListAsync();
            }
        }

        public async Task<List<SwitchUnderAssessReasonSetting>> GetManualSwitchBatchDeleteReasons()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var manualSwitchBatchDeleteReasons = await _switchUnderAssessReasonSettingRepository.Where(t => !(bool)t.IsAutoValidation).ToListAsync();
                return Mapper.Map<List<SwitchUnderAssessReasonSetting>>(manualSwitchBatchDeleteReasons);
            }
        }

        public async Task<int> SaveManualSwitchBatchDeleteReasonToDB(SwitchBatchDeleteReason switchBatchDeleteReason)
        {
            Contract.Requires(switchBatchDeleteReason != null);

            RmaIdentity.DemandPermission(Permissions.DeleteSwitchBatchMedicalInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var existingUnderAssessReasons = await _switchBatchInvoiceUnderAssessReasonService.GetSwitchBatchInvoiceUnderAssessReasonsBySwitchBatchInvoiceId(switchBatchDeleteReason.SwitchBatchInvoiceId);

                var entity = await _medicalSwitchBatchInvoiceRepository.FirstOrDefaultAsync(a => a.SwitchBatchInvoiceId == switchBatchDeleteReason.SwitchBatchInvoiceId);
                entity.IsActive = false;
                entity.SwitchInvoiceStatus = SwitchInvoiceStatusEnum.Deleted;
                entity.ModifiedBy = RmaIdentity.Email;
                entity.ModifiedDate = DateTimeHelper.SaNow;

                bool existingUnderAssesReasonUpdated = false;
                var switchBatchInvoiceUnderAssessReason =
                new SwitchBatchInvoiceUnderAssessReason
                {
                    SwitchBatchInvoiceId = switchBatchDeleteReason.SwitchBatchInvoiceId,
                    SwitchUnderAssessReason = (SwitchUnderAssessReasonEnum)switchBatchDeleteReason.SwitchBatchDeleteReasonId,
                    UnderAssessReason = Utility.GetEnumDisplayName((SwitchUnderAssessReasonEnum)switchBatchDeleteReason.SwitchBatchDeleteReasonId)
                };

                if (existingUnderAssessReasons.Any())
                {

                    foreach (var existingUnderAssessReason in existingUnderAssessReasons)
                    {
                        await _switchBatchInvoiceUnderAssessReasonService.DeleteSwitchBatchInvoiceUnderAssessReason(existingUnderAssessReason);
                    }

                    foreach (var existingUnderAssessReason in existingUnderAssessReasons)
                    {
                        if (switchBatchInvoiceUnderAssessReason.SwitchUnderAssessReason == existingUnderAssessReason.SwitchUnderAssessReason &&
                            existingUnderAssessReason.SwitchBatchInvoiceId == switchBatchDeleteReason.SwitchBatchInvoiceId && !existingUnderAssessReason.IsActive)
                        {
                            existingUnderAssesReasonUpdated = true;
                            await _switchBatchInvoiceUnderAssessReasonService.EnableSwitchBatchInvoiceUnderAssessReason(existingUnderAssessReason);
                        }
                    }

                    if (!existingUnderAssesReasonUpdated)
                    {
                        await _switchBatchInvoiceUnderAssessReasonService.AddSwitchBatchInvoiceUnderAssessReason(switchBatchInvoiceUnderAssessReason);
                    }
                }
                else
                {
                    await _switchBatchInvoiceUnderAssessReasonService.AddSwitchBatchInvoiceUnderAssessReason(switchBatchInvoiceUnderAssessReason);
                }

                entity.IsProcessed = true;
                _medicalSwitchBatchInvoiceRepository.Update(entity);

                await _switchInvoiceHelperService.UpdateSwitchBatchAfterInvoiceIsProcessed(entity.SwitchBatchInvoiceId, entity.SwitchBatchId);

                await scope.SaveChangesAsync();
                return entity.SwitchBatchInvoiceId;

            }
        }

        public async Task<int> EditSwitchBatchAssignToUser(SwitchBatch switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);
            RmaIdentity.DemandPermission(Permissions.EditMedicalInvoice);
            if (switchBatchInvoice?.AssignedUserId == 0 || switchBatchInvoice?.AssignedToRoleId == 0)
                return 0;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _medicalSwitchBatchRepository.FirstOrDefaultAsync(a => a.SwitchBatchId == switchBatchInvoice.SwitchBatchId);
                entity.AssignedToRoleId = switchBatchInvoice?.AssignedToRoleId;
                entity.AssignedUserId = switchBatchInvoice?.AssignedUserId;
                entity.ModifiedBy = RmaIdentity.Email;
                _medicalSwitchBatchRepository.Update(entity);
                await scope.SaveChangesAsync();
                return entity.SwitchBatchId;
            }
        }

        public async Task<int> SendSwitchBatchValidationRequests(int switchBatchId)
        {
            try
            {
                var switchBatchInvoices = await GetMedicalSwitchBatchInvoicesForValidation(switchBatchId);
                foreach (var switchBatchInvoice in switchBatchInvoices)
                {
                    var producer = new ServiceBusQueueProducer<SwitchBatchInvoiceMessage, SwitchBatchInvoiceQueueListener>(SwitchBatchInvoiceQueueListener.QueueName);
                    await producer.PublishMessageAsync(new SwitchBatchInvoiceMessage()
                    {
                        SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                        ImpersonateUser = SystemSettings.SystemUserAccount
                    });
                    await MarkSwitchBatchInvoiceAsQueued(switchBatchInvoice.SwitchBatchInvoiceId);
                }

                return switchBatchId;
            }
            catch (Exception ex)
            {
                ex.LogException();
                return 0;
            }
        }

        private async Task MarkSwitchBatchInvoiceAsQueued(int switchBatchInvoiceId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity =
                    await _medicalSwitchBatchInvoiceRepository
                        .FirstOrDefaultAsync(i => i.SwitchBatchInvoiceId == switchBatchInvoiceId);
                entity.SwitchInvoiceStatus = SwitchInvoiceStatusEnum.Queued;
                _medicalSwitchBatchInvoiceRepository.Update(entity);
                await scope.SaveChangesAsync();
            }
        }

        public async Task CreateMedicalInvoices()
        {
            try
            {
                var linkedSwitchBatchInvoices = await GetLinkedMedicalSwitchBatchInvoices();

                foreach (var invoice in linkedSwitchBatchInvoices)
                {
                    if (invoice.SwitchInvoiceStatus == SwitchInvoiceStatusEnum.AutoLinked
                        || invoice.SwitchInvoiceStatus == SwitchInvoiceStatusEnum.UserLinked)
                    {
                        try
                        {
                            if (invoice.SwitchBatchType == SwitchBatchTypeEnum.Teba)
                            {
                                var newTebaInvoiceToBeAdded = await PrepareForTebaInvoiceCreation(invoice);
                                if (newTebaInvoiceToBeAdded != null)
                                {
                                    await _invoiceHelperService.AddTebaInvoice(newTebaInvoiceToBeAdded);
                                }
                            }
                            else
                            {
                                var newMedicalInvoiceToBeAdded = await PrepareForMedicalInvoiceCreation(invoice);
                                if (newMedicalInvoiceToBeAdded != null)
                                {
                                    await _invoiceHelperService.AddInvoice(newMedicalInvoiceToBeAdded);
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            ex.LogException();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException();
            }
        }

        private async Task<SwitchBatchInvoice> ValidateSwitchBatchInvoice(SwitchBatchInvoice switchBatchInvoice)
        {
            if (switchBatchInvoice == null)
                return null;

            var switchInvoiceUnderAssessReasons = new List<SwitchBatchInvoiceUnderAssessReason>();

            var healthCareProvider = await _healthCareProviderService.SearchHealthCareProviderByPracticeNumber(switchBatchInvoice?.PracticeNumber);

            //HCP validations
            if (healthCareProvider == null)
            {
                switchInvoiceUnderAssessReasons.Add(new SwitchBatchInvoiceUnderAssessReason()
                {
                    SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                    SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.UnmatchedHCP,
                    UnderAssessReason = SwitchUnderAssessReasonEnum.UnmatchedHCP.GetEnumDisplayName(),
                    IsActive = true,
                    IsDeleted = false
                });
            }
            else
            {
                switchBatchInvoice.HealthCareProviderId = healthCareProvider.RolePlayerId;
            }

            if (healthCareProvider != null)
            {
                var practiceIsActive = await _switchInvoiceHelperService.ValidatePracticeIsActive(switchBatchInvoice, healthCareProvider);
                if (practiceIsActive != null && !practiceIsActive.RuleRequestResult.OverallSuccess)
                {
                    switchInvoiceUnderAssessReasons.AddRange(practiceIsActive.InvoiceUnderAssessReasons);
                }
            }

            //Claim Validations
            Claim claim = null;

            var validateClaimReferenceNumberResult = await _switchInvoiceHelperService.ValidateClaimReferenceNumber(switchBatchInvoice);
            if (validateClaimReferenceNumberResult != null && !validateClaimReferenceNumberResult.RuleRequestResult.OverallSuccess)
            {
                switchInvoiceUnderAssessReasons.AddRange(validateClaimReferenceNumberResult.InvoiceUnderAssessReasons);
            }
            else if (validateClaimReferenceNumberResult != null && validateClaimReferenceNumberResult.ValidatedObjectId > 0)
            {
                switchBatchInvoice.ClaimId = validateClaimReferenceNumberResult.ValidatedObjectId;
                claim = await _claimService.GetClaimDetailsById(
                    validateClaimReferenceNumberResult.ValidatedObjectId);

                switchBatchInvoice.ClaimReferenceNumberMatch = claim.ClaimReferenceNumber;
            }

            if (claim != null)
            {
                var claimLiabilityStatus = claim.ClaimLiabilityStatus.ToString();
                if (!string.IsNullOrEmpty(claimLiabilityStatus) && claimLiabilityStatus.Contains("Not Accepted"))
                {
                    var hasOutstandingRequirements =
                        await _switchInvoiceHelperService.ValidateOutstandingRequirementsRule(claimLiabilityStatus,
                            switchBatchInvoice.SwitchBatchInvoiceId);
                    if (hasOutstandingRequirements != null &&
                        !hasOutstandingRequirements.RuleRequestResult.OverallSuccess)
                    {
                        switchInvoiceUnderAssessReasons.AddRange(hasOutstandingRequirements.InvoiceUnderAssessReasons);
                    }
                }

                var personNameIsMatch =
                    await _switchInvoiceHelperService.ValidatePersonName(switchBatchInvoice, claim.PersonEventId);
                if (personNameIsMatch != null && !personNameIsMatch.RuleRequestResult.OverallSuccess)
                {
                    switchInvoiceUnderAssessReasons.AddRange(personNameIsMatch.InvoiceUnderAssessReasons);
                }


                //Invoice Validations
                var treatmentFromDateEventDateRuleResult =
                    await _switchInvoiceHelperService.ValidateTreatmentDateWithEventDate(switchBatchInvoice,
                        "TreatmentFromEventDate");
                if (treatmentFromDateEventDateRuleResult != null &&
                    !treatmentFromDateEventDateRuleResult.RuleRequestResult.OverallSuccess)
                {
                    switchInvoiceUnderAssessReasons.AddRange(treatmentFromDateEventDateRuleResult
                        .InvoiceUnderAssessReasons);
                }

                var treatmentToDateEventDateRuleResult =
                    await _switchInvoiceHelperService.ValidateTreatmentDateWithEventDate(switchBatchInvoice,
                        "TreatmentToEventDate");
                if (treatmentToDateEventDateRuleResult != null &&
                    !treatmentToDateEventDateRuleResult.RuleRequestResult.OverallSuccess)
                {
                    switchInvoiceUnderAssessReasons.AddRange(treatmentToDateEventDateRuleResult
                        .InvoiceUnderAssessReasons);
                }

                var treatmentFromDateDeathOfDateRuleResult =
                    await _switchInvoiceHelperService.ValidateTreatmentDateWithDateOfDeath(switchBatchInvoice,
                        "TreatmentFromDeathOfDate");
                if (treatmentFromDateDeathOfDateRuleResult != null &&
                    !treatmentFromDateDeathOfDateRuleResult.RuleRequestResult.OverallSuccess)
                {
                    switchInvoiceUnderAssessReasons.AddRange(treatmentFromDateDeathOfDateRuleResult
                        .InvoiceUnderAssessReasons);
                }

                var treatmentToDateDeathOfDateRuleResult =
                    await _switchInvoiceHelperService.ValidateTreatmentDateWithDateOfDeath(switchBatchInvoice,
                        "TreatmentToDeathOfDate");
                if (treatmentToDateDeathOfDateRuleResult != null &&
                    !treatmentToDateDeathOfDateRuleResult.RuleRequestResult.OverallSuccess)
                {
                    switchInvoiceUnderAssessReasons.AddRange(treatmentToDateDeathOfDateRuleResult
                        .InvoiceUnderAssessReasons);
                }


                var ruleResultStaleInvoice = await _switchInvoiceHelperService.ValidateStaleInvoice(switchBatchInvoice);
                if (ruleResultStaleInvoice != null && !ruleResultStaleInvoice.RuleRequestResult.OverallSuccess)
                {
                    switchInvoiceUnderAssessReasons.AddRange(ruleResultStaleInvoice.InvoiceUnderAssessReasons);
                }


                var twoYearRuleResult = await _switchInvoiceHelperService.ValidateTwoYearRule(switchBatchInvoice);
                if (twoYearRuleResult != null && !twoYearRuleResult.RuleRequestResult.OverallSuccess)
                {
                    switchInvoiceUnderAssessReasons.AddRange(twoYearRuleResult.InvoiceUnderAssessReasons);
                }
            }
            else
            {
                var switchBatchInvoiceUnderAssessReason = new SwitchBatchInvoiceUnderAssessReason
                {
                    SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                    SwitchUnderAssessReason = SwitchUnderAssessReasonEnum.ClaimPersonEventnotfound,
                    UnderAssessReason = Utility.GetEnumDisplayName(SwitchUnderAssessReasonEnum.ClaimPersonEventnotfound),
                    IsActive = true,
                    IsDeleted = false
                };

                switchInvoiceUnderAssessReasons.AddRange(new List<SwitchBatchInvoiceUnderAssessReason> { switchBatchInvoiceUnderAssessReason });
            }

            if (healthCareProvider != null)
            {
                var invoiceCountRuleResult =
                    await _switchInvoiceHelperService.ValidateInvoiceCount(switchBatchInvoice, healthCareProvider);
                if (invoiceCountRuleResult != null && !invoiceCountRuleResult.RuleRequestResult.OverallSuccess)
                {
                    switchInvoiceUnderAssessReasons.AddRange(invoiceCountRuleResult.InvoiceUnderAssessReasons);
                }
            }

            if (claim != null && switchBatchInvoice.SwitchBatchType == SwitchBatchTypeEnum.MedEDI)
            {
                var validateFranchiseAmountLimitRuleResult = await _switchInvoiceHelperService.ValidateFranchiseAmountLimit(switchBatchInvoice, claim.ClaimId);
                if (validateFranchiseAmountLimitRuleResult != null && !validateFranchiseAmountLimitRuleResult.RuleRequestResult.OverallSuccess)
                {
                    switchInvoiceUnderAssessReasons.AddRange(validateFranchiseAmountLimitRuleResult.InvoiceUnderAssessReasons);
                }
            }

            var validateIfNoInvoiceLinesSubmittedRuleResult = await _switchInvoiceHelperService.ValidateNoInvoiceLinesSubmitted(switchBatchInvoice);
            if (validateIfNoInvoiceLinesSubmittedRuleResult != null && !validateIfNoInvoiceLinesSubmittedRuleResult.RuleRequestResult.OverallSuccess)
            {
                switchInvoiceUnderAssessReasons.AddRange(validateIfNoInvoiceLinesSubmittedRuleResult.InvoiceUnderAssessReasons);
            }

            var validRequestedAmountEqualsToLineTotal = await _switchInvoiceHelperService.ValidateIfRequestedAmountEqualsToLineTotalSubmitted(switchBatchInvoice);
            if (validRequestedAmountEqualsToLineTotal != null && !validRequestedAmountEqualsToLineTotal.RuleRequestResult.OverallSuccess)
            {
                switchInvoiceUnderAssessReasons.AddRange(validRequestedAmountEqualsToLineTotal.InvoiceUnderAssessReasons);
            }

            var validateBatchInvoiceDatesRuleResult = await _switchInvoiceHelperService.ValidateBatchInvoiceDates(switchBatchInvoice);
            if (validateBatchInvoiceDatesRuleResult != null && !validateBatchInvoiceDatesRuleResult.RuleRequestResult.OverallSuccess)
            {
                switchInvoiceUnderAssessReasons.AddRange(validateBatchInvoiceDatesRuleResult.InvoiceUnderAssessReasons);
            }

            //Duplicate Invoice Check
            var isDuplicateInvoiceExists = false;
            // TODO: Invoice Duplicate Check VIA SP

            var validateDuplicateSwitchInvoiceRuleResult = await _switchInvoiceHelperService.ValidateDuplicateSwitchInvoice(switchBatchInvoice.SwitchBatchInvoiceId, isDuplicateInvoiceExists);
            if (validateDuplicateSwitchInvoiceRuleResult != null && !validateDuplicateSwitchInvoiceRuleResult.RuleRequestResult.OverallSuccess)
            {
                switchInvoiceUnderAssessReasons.AddRange(validateDuplicateSwitchInvoiceRuleResult.InvoiceUnderAssessReasons);
            }

            //Invoice Line Validations
            if (switchBatchInvoice.SwitchBatchInvoiceLines != null)
            {
                foreach (var invoiceLine in switchBatchInvoice.SwitchBatchInvoiceLines)
                {
                    var switchInvoiceLineUnderAssessReasons = new List<SwitchBatchInvoiceLineUnderAssessReason>();
                    var anyValidTariffCodeInInvoice = await _switchInvoiceHelperService.ValidateInvalidTariffCodeSubmitted(switchBatchInvoice);
                    if (anyValidTariffCodeInInvoice != null && !anyValidTariffCodeInInvoice.RuleRequestResult.OverallSuccess)
                    {
                        switchInvoiceLineUnderAssessReasons.AddRange(anyValidTariffCodeInInvoice.InvoiceLineUnderAssessReasons);
                    }

                    if (claim != null && healthCareProvider != null)
                    {
                        var ruleResultInvoiceLineTariffAmount = await _switchInvoiceHelperService.ValidateSwitchInvoiceLineTariffAmount(switchBatchInvoice);
                        if (ruleResultInvoiceLineTariffAmount != null && !ruleResultInvoiceLineTariffAmount.RuleRequestResult.OverallSuccess)
                        {
                            switchInvoiceLineUnderAssessReasons.AddRange(ruleResultInvoiceLineTariffAmount.InvoiceLineUnderAssessReasons);
                        }
                        if (switchBatchInvoice.SwitchBatchType == SwitchBatchTypeEnum.MedEDI)
                        {
                            var validateInvoiceICD10Codes = await _switchInvoiceHelperService.ValidateMedicalInvoiceICD10Codes(switchBatchInvoice);
                            if (validateInvoiceICD10Codes != null && !validateInvoiceICD10Codes.RuleRequestResult.OverallSuccess)
                            {
                                switchInvoiceLineUnderAssessReasons.AddRange(validateInvoiceICD10Codes.InvoiceLineUnderAssessReasons);
                            }
                        }
                    }

                    if (switchBatchInvoice.SwitchBatchType == SwitchBatchTypeEnum.MedEDI)
                    {
                        var validateExternalCauseCodesRule = await _switchInvoiceHelperService.ValidateExternalCauseCodesSupplied(invoiceLine.SwitchBatchInvoiceLineId, invoiceLine.Icd10Code);
                        if (validateExternalCauseCodesRule != null && !validateExternalCauseCodesRule.RuleRequestResult.OverallSuccess)
                        {
                            switchInvoiceLineUnderAssessReasons.AddRange(validateExternalCauseCodesRule.InvoiceLineUnderAssessReasons);
                        }
                    }

                    if (healthCareProvider != null)
                    {
                        var ruleResultCorrectCodeSubmitted = await _switchInvoiceHelperService.ValidateIfCorrectCodeSubmitted(switchBatchInvoice);
                        if (ruleResultCorrectCodeSubmitted != null && !ruleResultCorrectCodeSubmitted.RuleRequestResult.OverallSuccess)
                        {
                            switchInvoiceLineUnderAssessReasons.AddRange(ruleResultCorrectCodeSubmitted.InvoiceLineUnderAssessReasons);
                        }
                    }

                    var ruleResultAmountOrQuantitySubmitted = await _switchInvoiceHelperService.ValidateAmountOrQuantityRuleSubmitted(switchBatchInvoice);
                    if (ruleResultAmountOrQuantitySubmitted != null && !ruleResultAmountOrQuantitySubmitted.RuleRequestResult.OverallSuccess)
                    {
                        switchInvoiceLineUnderAssessReasons.AddRange(ruleResultAmountOrQuantitySubmitted.InvoiceLineUnderAssessReasons);
                    }

                    SwitchInvoiceValidationModel validateICD10CodeFormatRuleResult = new SwitchInvoiceValidationModel();
                    if (switchBatchInvoice.SwitchBatchType == SwitchBatchTypeEnum.MedEDI)
                    {
                        validateICD10CodeFormatRuleResult = await _switchInvoiceHelperService.ValidateICD10CodeFormatBatchInvoice(switchBatchInvoice);
                        if (validateICD10CodeFormatRuleResult != null && !validateICD10CodeFormatRuleResult.RuleRequestResult.OverallSuccess)
                        {
                            switchInvoiceLineUnderAssessReasons.AddRange(validateICD10CodeFormatRuleResult.InvoiceLineUnderAssessReasons);
                        }
                    }

                    var validateServiceDateFormatRuleResult = await _switchInvoiceHelperService.ValidateInvoiceLineServiceDateFormat(invoiceLine.SwitchBatchInvoiceLineId, invoiceLine.ServiceDate);
                    if (validateServiceDateFormatRuleResult != null && !validateServiceDateFormatRuleResult.RuleRequestResult.OverallSuccess)
                    {
                        switchInvoiceLineUnderAssessReasons.AddRange(validateServiceDateFormatRuleResult.InvoiceLineUnderAssessReasons);
                    }

                    var validateServiceDateInFutureRuleResult = await _switchInvoiceHelperService.ValidateServiceDateInFuture(invoiceLine.SwitchBatchInvoiceLineId, invoiceLine.ServiceDate);
                    if (validateServiceDateInFutureRuleResult != null && !validateServiceDateInFutureRuleResult.RuleRequestResult.OverallSuccess)
                    {
                        switchInvoiceLineUnderAssessReasons.AddRange(validateServiceDateInFutureRuleResult.InvoiceLineUnderAssessReasons);
                    }

                    if (healthCareProvider != null)
                    {
                        var validateServiceDateAndPracticeDateRuleResult = await _switchInvoiceHelperService.ValidateServiceDateAndPracticeDate(invoiceLine.SwitchBatchInvoiceLineId, healthCareProvider, invoiceLine.ServiceDate);
                        if (validateServiceDateAndPracticeDateRuleResult != null && !validateServiceDateAndPracticeDateRuleResult.RuleRequestResult.OverallSuccess)
                        {
                            switchInvoiceLineUnderAssessReasons.AddRange(validateServiceDateAndPracticeDateRuleResult.InvoiceLineUnderAssessReasons);
                        }
                    }

                    if (healthCareProvider != null && claim != null)
                    {
                        var validateDuplicateSwitchInvoiceLineRuleResult =
                            await _switchInvoiceHelperService.ValidateDuplicateSwitchInvoiceLine(
                                invoiceLine.SwitchBatchInvoiceLineId,
                                await CheckSwitchInvoiceLineIsDuplicate(invoiceLine, claim.ClaimId, claim.ClaimReferenceNumber, (SwitchBatchTypeEnum)switchBatchInvoice.SwitchBatchType));
                        if (validateDuplicateSwitchInvoiceLineRuleResult != null &&
                            !validateDuplicateSwitchInvoiceLineRuleResult.RuleRequestResult.OverallSuccess)
                        {
                            switchInvoiceLineUnderAssessReasons.AddRange(validateICD10CodeFormatRuleResult
                                .InvoiceLineUnderAssessReasons);
                        }
                    }
                    //accumulated InvoiceUnderAssessReasons from above validations
                    invoiceLine.SwitchBatchInvoiceLineUnderAssessReasons = switchInvoiceLineUnderAssessReasons;
                }
            }

            //Set invoice underassessreason to Deleted in the batch if all lines are rejected
            var isSwitchInvoiceAllLineActionReject = await CheckSwitchBatchInvoiceLineStatus(switchBatchInvoice);
            var validateSwitchInvoiceAllLineStatusRuleResult = await _switchInvoiceHelperService.ValidateSwitchInvoiceAllLineStatus(switchBatchInvoice.SwitchBatchInvoiceId, isSwitchInvoiceAllLineActionReject);
            if (validateSwitchInvoiceAllLineStatusRuleResult != null && !validateSwitchInvoiceAllLineStatusRuleResult.RuleRequestResult.OverallSuccess)
            {
                switchInvoiceUnderAssessReasons.AddRange(validateSwitchInvoiceAllLineStatusRuleResult.InvoiceUnderAssessReasons);
            }
            //accumulated InvoiceUnderAssessReasons from above validations
            switchBatchInvoice.SwitchBatchInvoiceUnderAssessReasons = switchInvoiceUnderAssessReasons;
            return switchBatchInvoice;
        }

        private async Task<SwitchInvoiceStatusEnum> GetStatusForSwitchBatchInvoice(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            if (switchBatchInvoice.SwitchBatchInvoiceUnderAssessReasons != null
                && switchBatchInvoice.SwitchBatchInvoiceUnderAssessReasons.Count == 0)
            {
                return SwitchInvoiceStatusEnum.AutoLinked;
            }

            var invoiceUnderAssessReasonList = new List<int>();
            if (switchBatchInvoice.SwitchBatchInvoiceUnderAssessReasons != null)
                foreach (var switchBatchInvoiceUnderAssessReason in switchBatchInvoice
                             .SwitchBatchInvoiceUnderAssessReasons)
                {
                    var switchUnderAssessReasonId = (int)switchBatchInvoiceUnderAssessReason.SwitchUnderAssessReason;
                    if (switchUnderAssessReasonId > 0
                        && !invoiceUnderAssessReasonList.Contains(switchUnderAssessReasonId))
                    {
                        invoiceUnderAssessReasonList.Add(switchUnderAssessReasonId);
                    }
                }

            if (invoiceUnderAssessReasonList.Count > 0)
            {
                return await _switchInvoiceHelperService.GetBatchInvoiceStatusForUnderAssessReasons(invoiceUnderAssessReasonList);
            }
            else
            {
                return SwitchInvoiceStatusEnum.AutoLinked;
            }
        }

        public async Task<int> DeleteSwitchBatchInvoice(int switchBatchInvoiceId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var switchBatchinvoice = await _medicalSwitchBatchInvoiceRepository.FirstOrDefaultAsync(b => b.SwitchBatchInvoiceId == switchBatchInvoiceId);

                switchBatchinvoice.IsActive = false;
                switchBatchinvoice.IsDeleted = true;

                _medicalSwitchBatchInvoiceRepository.Update(switchBatchinvoice);
                await scope.SaveChangesAsync();

                return switchBatchinvoice.SwitchBatchInvoiceId;
            }
        }

        public async Task<bool> ReinstateSwitchBatchInvoices(
            SwitchBatchInvoiceReinstateParams switchBatchInvoiceReinstateParams)
        {
            Contract.Requires(switchBatchInvoiceReinstateParams != null);
            RmaIdentity.DemandPermission(Permissions.ReinstateDeletedMedicalInvoice);

            if (switchBatchInvoiceReinstateParams.SwitchBatchInvoiceIds.Count > 0)
            {
                foreach (var switchBatchInvoiceId in switchBatchInvoiceReinstateParams.SwitchBatchInvoiceIds)
                {
                    await ReinstateSwitchBatchInvoice(switchBatchInvoiceId,
                        switchBatchInvoiceReinstateParams.ReinstateReason);
                }

                return true;
            }

            return false;
        }

        public async Task ReinstateSwitchBatchInvoice(int switchBatchInvoiceId, string reinstateReason)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var switchBatchInvoice =
                    await _medicalSwitchBatchInvoiceRepository.FirstOrDefaultAsync(i =>
                        i.SwitchBatchInvoiceId == switchBatchInvoiceId);

                if (switchBatchInvoice != null)
                {
                    switchBatchInvoice.SwitchInvoiceStatus = SwitchInvoiceStatusEnum.Reinstated;
                    switchBatchInvoice.ReinstateReason = reinstateReason;
                    switchBatchInvoice.IsActive = true;
                    switchBatchInvoice.IsDeleted = false;
                    switchBatchInvoice.ModifiedBy = RmaIdentity.Email;
                    switchBatchInvoice.IsProcessed = false;

                    var switchBatch = await _medicalSwitchBatchRepository.SingleAsync(b =>
                        b.SwitchBatchId == switchBatchInvoice.SwitchBatchId);
                    switchBatch.DateCompleted = null;
                    switchBatch.IsProcessed = false;

                    var switchBatchProcessedInvoices = await _medicalSwitchBatchInvoiceRepository
                        .Where(i => i.SwitchBatchId == switchBatch.SwitchBatchId && (i.InvoiceId != null ||
                            i.SwitchInvoiceStatus == SwitchInvoiceStatusEnum.Deleted)).ToListAsync();
                    switchBatch.InvoicesProcessed = switchBatchProcessedInvoices.Count - 1;

                    if (switchBatchInvoice.TotalInvoiceAmountInclusive.HasValue)
                        switchBatch.AmountProcessed =
                            switchBatchProcessedInvoices.Sum(i =>
                                Convert.ToDecimal(i.TotalInvoiceAmountInclusive)) -
                            switchBatchInvoice.TotalInvoiceAmountInclusive.Value;

                    _medicalSwitchBatchInvoiceRepository.Update(switchBatchInvoice);

                    _medicalSwitchBatchRepository.Update(switchBatch);

                    await scope.SaveChangesAsync();
                }
            }
        }

        private async Task UpdateClaimReferenceNumberForSwitchBatchInvoices(List<SwitchBatchInvoice> switchBatchInvoices)
        {
            if (switchBatchInvoices?.Count > 0)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var switchBatchInvoicesForClaimReferenceUpdate = switchBatchInvoices.Where(i =>
                        i.ClaimReferenceNumber != null &&
                        (i.ClaimReferenceNumber.StartsWith("H")
                        || i.ClaimReferenceNumber.StartsWith("A") || i.ClaimReferenceNumber.StartsWith("B") ||
                        i.ClaimReferenceNumber.StartsWith("9"))).ToList();

                    foreach (var invoice in switchBatchInvoicesForClaimReferenceUpdate)
                    {
                        invoice.ClaimReferenceNumber = invoice.ClaimReferenceNumber.Replace("/", "").Replace(@"\", "")
                            .Replace(" ", "").Replace("-", "")
                            .Replace("/ACC", "").Replace(" OPEN", "").Replace(" ACCEPTED", "");
                    }

                    _medicalSwitchBatchInvoiceRepository.Update(Mapper.Map<List<medical_SwitchBatchInvoice>>(switchBatchInvoicesForClaimReferenceUpdate));
                    await scope.SaveChangesAsync();
                }
            }
        }

        private async Task UpdatePossiblePersonEventAndEventForSwitchBatchInvoices(List<SwitchBatchInvoice> switchBatchInvoices)
        {
            if (switchBatchInvoices?.Count > 0)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var switchBatchInvoicesForPossibleEventUpdate = switchBatchInvoices.Where(i =>
                         (i.PossiblePersonEventId == null || i.PossiblePersonEventId <= 0) && i.IsActive &&
                         (i.IsProcessed == null || i.IsProcessed == false)).ToList();

                    switchBatchInvoicesForPossibleEventUpdate.ForEach(i => i.PossiblePersonEventId =
                        _medicalSwitchBatchInvoiceRepository.FirstOrDefault(i2 =>
                                i2.ClaimReferenceNumber == i.ClaimReferenceNumber
                                && i2.PossiblePersonEventId > 0 && i2.IsActive && i2.IsProcessed == false)
                            ?.PossiblePersonEventId);
                    switchBatchInvoicesForPossibleEventUpdate.ForEach(i => i.PossibleEventId =
                        _medicalSwitchBatchInvoiceRepository.FirstOrDefault(i2 =>
                            i2.ClaimReferenceNumber == i.ClaimReferenceNumber
                            && i2.PossibleEventId > 0 && i2.IsActive && i2.IsProcessed == false)?.PossibleEventId);

                    _medicalSwitchBatchInvoiceRepository.Update(Mapper.Map<List<medical_SwitchBatchInvoice>>(switchBatchInvoicesForPossibleEventUpdate));
                    await scope.SaveChangesAsync();
                }
            }
        }

        private async Task GetAndUpdateClaimDetailsForSwitchBatchInvoices(List<SwitchBatchInvoice> switchBatchInvoices)
        {
            if (switchBatchInvoices?.Count > 0)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    switchBatchInvoices = switchBatchInvoices.Where(i => (i.PossiblePersonEventId == null ||
                            i.PossiblePersonEventId <= 0
                            || i.PossibleEventId == null || i.PossibleEventId <= 0) && i.IsActive &&
                        (i.IsProcessed == null || i.IsProcessed == false)
                        && i.SwitchInvoiceStatus == SwitchInvoiceStatusEnum.Queued && i.ClaimReferenceNumber.Trim().Length >= 6
                        && !i.ClaimReferenceNumber.Contains("DOA") && !i.ClaimReferenceNumber.Contains("D.O.A") &&
                        !i.ClaimReferenceNumber.Contains("RAND")
                        && !i.ClaimReferenceNumber.Contains("IOD") && !i.ClaimReferenceNumber.Contains("DOI") &&
                        !i.ClaimReferenceNumber.Contains("COY")).ToList();

                    var switchBatchInvoicesForUpdate = new List<SwitchBatchInvoice>();

                    foreach (var invoice in switchBatchInvoices)
                    {
                        if (invoice.ClaimReferenceNumber?.Length > 0)
                        {
                            var tempClaimReferenceNumber = invoice.ClaimReferenceNumber.Replace("	", "")
                                .Replace(@"\", " / ").Replace(" ", "").Replace(" * ", "").Replace(" - ", "")
                                .Replace("_", "");
                            var claims = await _claimService.GetClaimsByClaimReferenceNumber(tempClaimReferenceNumber);

                            if (claims?.Count == 1)
                            {
                                var personEvent =
                                    await _eventService.GetPersonEventWithNoReferenceData(
                                        Convert.ToInt32(claims.FirstOrDefault()?.PersonEventId));
                                invoice.PossiblePersonEventId = personEvent.PersonEventId;
                                invoice.PossibleEventId = personEvent.EventId;
                            }
                            else if (claims == null || claims?.Count == 0)
                            {
                                var personEvents =
                                    await _eventService.GetPersonEventsByPersonEventReferenceNumber(
                                        tempClaimReferenceNumber);

                                if (personEvents.Count == 1)
                                {
                                    var personEvent =
                                        await _eventService.GetPersonEventWithNoReferenceData(
                                            Convert.ToInt32(personEvents.FirstOrDefault()?.PersonEventId));
                                    invoice.PossiblePersonEventId = personEvent.PersonEventId;
                                    invoice.PossibleEventId = personEvent.EventId;
                                }
                                else
                                {
                                    var preAuthorisation =
                                        await _switchInvoiceHelperService.GetPreAuthorisationForSwitchInvoice(
                                            tempClaimReferenceNumber);

                                    if (preAuthorisation != null)
                                    {
                                        var personEvent =
                                            await _eventService.GetPersonEventWithNoReferenceData(
                                                Convert.ToInt32(preAuthorisation.PersonEventId));

                                        invoice.PossiblePersonEventId = personEvent.PersonEventId;
                                        invoice.PossibleEventId = personEvent.EventId;

                                        var claim = await _claimService.GetClaimsByPersonEventId(personEvent
                                            .PersonEventId);
                                        invoice.ClaimReferenceNumber = claim.FirstOrDefault()?.ClaimReferenceNumber;
                                    }
                                }
                            }
                            else
                            {
                                var personEventid = claims.Find(c => c.ClaimReferenceNumber.Contains("EMP"))
                                    ?.PersonEventId;
                                if (personEventid != null)
                                {
                                    var personEvent =
                                        await _eventService.GetPersonEventWithNoReferenceData(Convert.ToInt32(personEventid));
                                    invoice.PossiblePersonEventId = personEvent.PersonEventId;
                                    invoice.PossibleEventId = personEvent.EventId;
                                }
                            }

                            if (invoice.PossiblePersonEventId > 0 || invoice.PossibleEventId > 0)
                            {
                                switchBatchInvoicesForUpdate.Add(invoice);
                            }
                        }
                    }

                    _medicalSwitchBatchInvoiceRepository.Update(Mapper.Map<List<medical_SwitchBatchInvoice>>(switchBatchInvoicesForUpdate));

                    await scope.SaveChangesAsync();
                }
            }
        }

        public async Task UpdateSwitchBatchInvoice(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);
            using (var scope = _dbContextScopeFactory.Create())
            {

                var switchInvoice = await _medicalSwitchBatchInvoiceRepository.Where(i => i.SwitchBatchInvoiceId == switchBatchInvoice.SwitchBatchInvoiceId).FirstOrDefaultAsync();

                switchInvoice.ClaimId = switchBatchInvoice.ClaimId;
                switchInvoice.ClaimReferenceNumberMatch = switchBatchInvoice.ClaimReferenceNumberMatch;
                switchInvoice.PossibleEventId = switchBatchInvoice.PossibleEventId;
                switchInvoice.PossiblePersonEventId = switchBatchInvoice.PossiblePersonEventId;
                switchInvoice.HealthCareProviderId = switchBatchInvoice.HealthCareProviderId;
                switchInvoice.PreAuthId = switchBatchInvoice.PreAuthId;
                switchInvoice.SwitchInvoiceStatus = switchBatchInvoice.SwitchInvoiceStatus;
                switchInvoice.SwitchBatchInvoiceUnderAssessReasons = Mapper.Map<List<medical_SwitchBatchInvoiceUnderAssessReason>>(switchBatchInvoice.SwitchBatchInvoiceUnderAssessReasons);

                if (switchBatchInvoice.SwitchBatchInvoiceLines != null && switchBatchInvoice.SwitchBatchInvoiceLines?.Count > 0)
                {
                    foreach (var switchInvoiceLine in switchBatchInvoice.SwitchBatchInvoiceLines)
                    {
                        var switchBatchInvoiceLineUnderAssessReasons = Mapper.Map<List<medical_SwitchBatchInvoiceLineUnderAssessReason>>(switchInvoiceLine.SwitchBatchInvoiceLineUnderAssessReasons);
                        _medicalSwitchBatchInvoiceLineUnderAssessReasonRepository.Create(switchBatchInvoiceLineUnderAssessReasons);
                    }
                }
                _medicalSwitchBatchInvoiceRepository.Update(switchInvoice);

                if (switchBatchInvoice.SwitchInvoiceStatus == SwitchInvoiceStatusEnum.Deleted)
                {
                    await _switchInvoiceHelperService.UpdateSwitchBatchAfterInvoiceIsProcessed(switchBatchInvoice.SwitchBatchInvoiceId, switchBatchInvoice.SwitchBatchId);
                }

                await scope.SaveChangesAsync();

            }
        }
        //check 1 --Check for duplicates against already processed invoices
        private async Task<SwitchBatchInvoicesDuplicatesOutput> CheckSwitchInvoiceWithInvoice(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var amountTolerance = await _configurationService.GetModuleAmountToleranceByKey(SystemSettings.MedicalInvoiceAmountTolerance).ConfigureAwait(true);
                int totalAmountTolerance = Convert.ToInt32(amountTolerance) > 0 ? Convert.ToInt32(amountTolerance) : 0;
                //exclude  "Invoice Rejected"  and "Invoice is Deleted" status
                var excludeInvoiceStatuses = new int[] { (int)InvoiceStatusEnum.Rejected, (int)InvoiceStatusEnum.Deleted };

                var switchBatch = await (
                         from msb1 in _medicalSwitchBatchInvoiceRepository
                         join msbli in _medicalSwitchBatchInvoiceLineRepository on msb1.SwitchBatchInvoiceId equals msbli.SwitchBatchInvoiceId
                         join msp in _healthCareProviderRepository on msb1.HealthCareProviderId equals msp.RolePlayerId
                         where msb1.SwitchBatchId == switchBatchInvoice.SwitchBatchId
                         && msb1.SwitchBatchInvoiceId == msbli.SwitchBatchInvoiceId
                         && msb1.PossibleEventId > 0
                         && msb1.IsProcessed == false
                         && msb1.IsActive
                         orderby msbli.TariffCode, msbli.ServiceDate, msbli.TotalInvoiceLineCostInclusive
                         select new
                         {
                             msb1.HealthCareProviderId,
                             msb1.InvoiceId,
                             msb1.SwitchBatchId,
                             msb1.SwitchBatchInvoiceId,
                             msb1.PossiblePersonEventId,
                             msb1.TotalInvoiceAmountInclusive,
                             msb1.SpInvoiceNumber,
                             msb1.SpAccountNumber,
                             Batch1LineItems = (msbli.TariffCode + "|" + msbli.ServiceDate),
                             Batch1LineItemsA = (msbli.TotalInvoiceLineCostInclusive.ToString() + "|" + msbli.ServiceDate),
                             Batch1LineItemsB = (msbli.TotalInvoiceLineCostInclusive.ToString() + "|" + msbli.TariffCode + "|" + msbli.ServiceDate)
                         }
                         ).ToListAsync();

                var medicalInvoice = await (
                        from captured in _invoiceRepository
                        join mli in _invoiceLineRepository on captured.InvoiceId equals mli.InvoiceId
                        where !excludeInvoiceStatuses.Contains((int)captured.InvoiceStatus)
                        orderby mli.HcpTariffCode, mli.ServiceDate, mli.TotalTariffAmountInclusive
                        select new
                        {
                            captured.HealthCareProviderId,
                            captured.InvoiceId,
                            captured.PersonEventId,
                            captured.InvoiceTotalInclusive,
                            captured.HcpInvoiceNumber,
                            captured.HcpAccountNumber,
                            Batch2LineItems = (mli.HcpTariffCode + "|" + mli.ServiceDate),
                            Batch2LineItemsA = (mli.TotalTariffAmountInclusive.ToString() + "|" + mli.ServiceDate),
                            Batch2LineItemsB = (mli.TotalTariffAmountInclusive.ToString() + "|" + mli.HcpTariffCode + "|" + mli.ServiceDate)
                        }
                        ).ToListAsync();

                var mergedSwitchBatchesMedicalInvoices = (
                        from swb in switchBatch
                        join minv in medicalInvoice
                        on new
                        {
                            HealthCareProviderId = swb.HealthCareProviderId == null ? 0 : swb.HealthCareProviderId,
                            PossiblePersonEventId = swb.PossiblePersonEventId == null ? 0 : swb.PossiblePersonEventId
                        }
                        equals new
                        {
                            HealthCareProviderId = minv?.HealthCareProviderId,
                            PossiblePersonEventId = minv.PersonEventId == null ? 0 : minv.PersonEventId
                        }

                        where minv.InvoiceTotalInclusive - swb.TotalInvoiceAmountInclusive <= totalAmountTolerance
                        && (swb.SpInvoiceNumber == minv.HcpInvoiceNumber || swb.SpAccountNumber == minv.HcpInvoiceNumber || swb.SpInvoiceNumber == minv.HcpAccountNumber
                        || (swb.SpInvoiceNumber.Length > minv.HcpInvoiceNumber.Length
                        && swb.SpInvoiceNumber.IndexOf(minv.HcpInvoiceNumber, StringComparison.OrdinalIgnoreCase) >= 0)
                        || (minv.HcpInvoiceNumber.Length > swb.SpInvoiceNumber.Length
                        && minv.HcpInvoiceNumber.IndexOf(swb.SpInvoiceNumber, StringComparison.OrdinalIgnoreCase) >= 0)
                        )
                        select new SwitchBatchInvoicesDuplicatesOutput
                        {
                            BatchTariffCodeServiceDate = swb.Batch1LineItems,
                            BatchTotalInvoiceLineCostInclServiceDate = swb.Batch1LineItemsA,
                            BatchTariffCodeTotalInvoiceLineCostInclServiceDate = swb.Batch1LineItemsB,

                            InvoiceTariffCodeServiceDate = minv.Batch2LineItems,
                            InvoiceTotalInvoiceLineCostInclServiceDate = minv.Batch2LineItemsA,
                            InvoiceTariffCodeTotalInvoiceLineCostInclServiceDate = minv.Batch2LineItemsB

                        }).FirstOrDefault();

                return mergedSwitchBatchesMedicalInvoices;
            }
        }

        //check4 --this check checks that the invoice matches another invocie exactly when same day service is not allowed but the invoice number is different
        private async Task<SwitchBatchInvoicesDuplicatesOutput> CheckSwitchInvoiceWithInvoiceNotSameDayTreatment(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var amountTolerance = await _configurationService.GetModuleAmountToleranceByKey(SystemSettings.MedicalInvoiceAmountTolerance).ConfigureAwait(true);
                int totalAmountTolerance = Convert.ToInt32(amountTolerance) > 0 ? Convert.ToInt32(amountTolerance) : 0;
                //exclude "Invoice Rejected"  and "Invoice is Deleted" status
                var excludeInvoiceStatuses = new int[] { (int)InvoiceStatusEnum.Rejected, (int)InvoiceStatusEnum.Deleted };

                var switchBatch = await (
                         from msb1 in _medicalSwitchBatchInvoiceRepository
                         join msbli in _medicalSwitchBatchInvoiceLineRepository on msb1.SwitchBatchInvoiceId equals msbli.SwitchBatchInvoiceId
                         join msp in _healthCareProviderRepository on msb1.HealthCareProviderId equals msp.RolePlayerId
                         where msb1.SwitchBatchId == switchBatchInvoice.SwitchBatchId
                         && msb1.SwitchBatchInvoiceId == msbli.SwitchBatchInvoiceId
                         && msb1.PossibleEventId > 0
                         && msb1.IsProcessed == false
                         && msb1.IsActive
                         && !msp.IsAllowSameDayTreatment
                         orderby msbli.TariffCode, msbli.ServiceDate, msbli.TotalInvoiceLineCostInclusive
                         select new
                         {
                             msb1.HealthCareProviderId,
                             msb1.InvoiceId,
                             msb1.SwitchBatchId,
                             msb1.SwitchBatchInvoiceId,
                             msb1.PossiblePersonEventId,
                             msb1.TotalInvoiceAmountInclusive,
                             msb1.SpInvoiceNumber,
                             msb1.SpAccountNumber,
                             Batch1LineItems = (msbli.TariffCode + "|" + msbli.ServiceDate),
                             Batch1LineItemsA = (msbli.TotalInvoiceLineCostInclusive.ToString() + "|" + msbli.ServiceDate),
                             Batch1LineItemsB = (msbli.TotalInvoiceLineCostInclusive.ToString() + "|" + msbli.TariffCode + "|" + msbli.ServiceDate)
                         }
                         ).ToListAsync();

                var medicalInvoice = await (
                        from captured in _invoiceRepository
                        join mli in _invoiceLineRepository on captured.InvoiceId equals mli.InvoiceId
                        where !excludeInvoiceStatuses.Contains((int)captured.InvoiceStatus)
                        orderby mli.HcpTariffCode, mli.ServiceDate, mli.TotalTariffAmountInclusive
                        select new
                        {
                            captured.HealthCareProviderId,
                            captured.InvoiceId,
                            captured.PersonEventId,
                            captured.InvoiceTotalInclusive,
                            captured.HcpInvoiceNumber,
                            captured.HcpAccountNumber,
                            Batch2LineItems = (mli.HcpTariffCode + "|" + mli.ServiceDate),
                            Batch2LineItemsA = (mli.TotalTariffAmountInclusive.ToString() + "|" + mli.ServiceDate),
                            Batch2LineItemsB = (mli.TotalTariffAmountInclusive.ToString() + "|" + mli.HcpTariffCode + "|" + mli.ServiceDate)
                        }
                        ).ToListAsync();

                var mergedSwitchBatchesMedicalInvoices = (
                        from swb in switchBatch
                        join minv in medicalInvoice
                        on new
                        {
                            HealthCareProviderId = swb.HealthCareProviderId == null ? 0 : swb.HealthCareProviderId,
                            PossiblePersonEventId = swb.PossiblePersonEventId == null ? 0 : swb.PossiblePersonEventId
                        }
                        equals new
                        {
                            HealthCareProviderId = minv?.HealthCareProviderId,
                            PossiblePersonEventId = minv.PersonEventId == null ? 0 : minv.PersonEventId
                        }

                        where minv.InvoiceTotalInclusive - swb.TotalInvoiceAmountInclusive <= totalAmountTolerance
                        && (swb.SpInvoiceNumber == minv.HcpInvoiceNumber || swb.SpAccountNumber == minv.HcpInvoiceNumber || swb.SpInvoiceNumber == minv.HcpAccountNumber
                        || (swb.SpInvoiceNumber.Length > minv.HcpInvoiceNumber.Length
                        && swb.SpInvoiceNumber.IndexOf(minv.HcpInvoiceNumber, StringComparison.OrdinalIgnoreCase) >= 0)
                        || (minv.HcpInvoiceNumber.Length > swb.SpInvoiceNumber.Length
                        && minv.HcpInvoiceNumber.IndexOf(swb.SpInvoiceNumber, StringComparison.OrdinalIgnoreCase) >= 0)
                        )
                        select new SwitchBatchInvoicesDuplicatesOutput
                        {
                            BatchTariffCodeServiceDate = swb.Batch1LineItems,
                            BatchTotalInvoiceLineCostInclServiceDate = swb.Batch1LineItemsA,
                            BatchTariffCodeTotalInvoiceLineCostInclServiceDate = swb.Batch1LineItemsB,

                            InvoiceTariffCodeServiceDate = minv.Batch2LineItems,
                            InvoiceTotalInvoiceLineCostInclServiceDate = minv.Batch2LineItemsA,
                            InvoiceTariffCodeTotalInvoiceLineCostInclServiceDate = minv.Batch2LineItemsB

                        }).FirstOrDefault();

                return mergedSwitchBatchesMedicalInvoices;
            }
        }

        //check 2 --check for possible duplicates in previous batches
        private async Task<SwitchBatchInvoicesDuplicatesOutput> CheckSwitchInvoiceWithOldProcessed(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var amountTolerance = await _configurationService.GetModuleAmountToleranceByKey(SystemSettings.MedicalInvoiceAmountTolerance).ConfigureAwait(true);
                int totalAmountTolerance = Convert.ToInt32(amountTolerance) > 0 ? Convert.ToInt32(amountTolerance) : 0;
                //exclude "Invoice Rejected"  and "Invoice is Deleted" status
                var excludeInvoiceStatuses = new int[] { (int)InvoiceStatusEnum.Rejected, (int)InvoiceStatusEnum.Deleted };

                var switchBatchFirstList = await (
                         from msb1 in _medicalSwitchBatchInvoiceRepository
                         join msbli in _medicalSwitchBatchInvoiceLineRepository on msb1.SwitchBatchInvoiceId equals msbli.SwitchBatchInvoiceId
                         join msp in _healthCareProviderRepository on msb1.HealthCareProviderId equals msp.RolePlayerId
                         where msb1.SwitchBatchId == switchBatchInvoice.SwitchBatchId
                         && msb1.PossibleEventId > 0
                         && msb1.IsProcessed == false
                         && msb1.IsActive
                         orderby msbli.TariffCode, msbli.ServiceDate, msbli.TotalInvoiceLineCostInclusive
                         select new
                         {
                             msb1.Surname,
                             msb1.FirstName,
                             msb1.HealthCareProviderId,
                             msb1.InvoiceId,
                             msb1.SwitchBatchId,
                             msb1.SwitchBatchInvoiceId,
                             msb1.PossiblePersonEventId,
                             msb1.TotalInvoiceAmountInclusive,
                             msb1.SpInvoiceNumber,
                             msb1.SpAccountNumber,
                             Batch1LineItems = (msbli.TariffCode + "|" + msbli.ServiceDate),
                             Batch1LineItemsA = (msbli.TotalInvoiceLineCostInclusive.ToString() + "|" + msbli.ServiceDate),
                             Batch1LineItemsB = (msbli.TotalInvoiceLineCostInclusive.ToString() + "|" + msbli.TariffCode + "|" + msbli.ServiceDate)
                         }
                         ).ToListAsync();

                var switchBatchSecondList = await (
                         from msb1 in _medicalSwitchBatchInvoiceRepository
                         join msbli in _medicalSwitchBatchInvoiceLineRepository on msb1.SwitchBatchInvoiceId equals msbli.SwitchBatchInvoiceId
                         join msp in _healthCareProviderRepository on msb1.HealthCareProviderId equals msp.RolePlayerId
                         where msb1.SwitchBatchId == switchBatchInvoice.SwitchBatchId
                         && msb1.PossibleEventId > 0
                         && msb1.IsProcessed == false
                         && msb1.IsActive
                         orderby msbli.TariffCode, msbli.ServiceDate, msbli.TotalInvoiceLineCostInclusive
                         select new
                         {
                             msb1.Surname,
                             msb1.FirstName,
                             msb1.HealthCareProviderId,
                             msb1.InvoiceId,
                             msb1.SwitchBatchId,
                             msb1.SwitchBatchInvoiceId,
                             msb1.PossiblePersonEventId,
                             msb1.TotalInvoiceAmountInclusive,
                             msb1.SpInvoiceNumber,
                             msb1.SpAccountNumber,
                             Batch2LineItems = (msbli.TariffCode + "|" + msbli.ServiceDate),
                             Batch2LineItemsA = (msbli.TotalInvoiceLineCostInclusive.ToString() + "|" + msbli.ServiceDate),
                             Batch2LineItemsB = (msbli.TotalInvoiceLineCostInclusive.ToString() + "|" + msbli.TariffCode + "|" + msbli.ServiceDate)
                         }
                         ).ToListAsync();

                var mergedSwitchBatchesMedicalInvoices = (
                        from msb1 in switchBatchFirstList
                        join msb2 in switchBatchSecondList
                        on new
                        {
                            HealthCareProviderId = msb1.HealthCareProviderId == null ? 0 : msb1.HealthCareProviderId,
                            PossiblePersonEventId = msb1.PossiblePersonEventId == null ? 0 : msb1.PossiblePersonEventId
                        }
                        equals new
                        {
                            HealthCareProviderId = msb2.HealthCareProviderId == null ? 0 : msb2.HealthCareProviderId,
                            PossiblePersonEventId = msb2.PossiblePersonEventId == null ? 0 : msb2.PossiblePersonEventId
                        }

                        where msb1.SwitchBatchId == switchBatchInvoice.SwitchBatchId //-- id of current batch
                        && msb1.SwitchBatchInvoiceId != msb2.SwitchBatchInvoiceId //-- batch numbers are not the same
                        && msb1.SwitchBatchId > msb2.SwitchBatchId //-- new batch is newer than old batch

                        && ((msb2.Surname == msb1.Surname && msb2.FirstName == msb1.FirstName)
                        || msb2.PossiblePersonEventId == msb1.PossiblePersonEventId
                        )

                        && msb2.TotalInvoiceAmountInclusive - msb1.TotalInvoiceAmountInclusive <= totalAmountTolerance
                        && (msb1.SpInvoiceNumber == msb2.SpInvoiceNumber || msb1.SpAccountNumber == msb2.SpAccountNumber || msb1.SpInvoiceNumber == msb2.SpAccountNumber
                        || (msb1.SpInvoiceNumber.Length > msb2.SpInvoiceNumber.Length
                        && msb1.SpInvoiceNumber.IndexOf(msb2.SpInvoiceNumber, StringComparison.OrdinalIgnoreCase) >= 0)
                        || (msb2.SpInvoiceNumber.Length > msb1.SpInvoiceNumber.Length
                        && msb2.SpInvoiceNumber.IndexOf(msb1.SpInvoiceNumber, StringComparison.OrdinalIgnoreCase) >= 0)
                        )
                        select new SwitchBatchInvoicesDuplicatesOutput
                        {
                            BatchTariffCodeServiceDate = msb1.Batch1LineItems,
                            BatchTotalInvoiceLineCostInclServiceDate = msb1.Batch1LineItemsA,
                            BatchTariffCodeTotalInvoiceLineCostInclServiceDate = msb1.Batch1LineItemsB,

                            InvoiceTariffCodeServiceDate = msb2.Batch2LineItems,
                            InvoiceTotalInvoiceLineCostInclServiceDate = msb2.Batch2LineItemsA,
                            InvoiceTariffCodeTotalInvoiceLineCostInclServiceDate = msb2.Batch2LineItemsB

                        }).FirstOrDefault();

                return mergedSwitchBatchesMedicalInvoices;
            }
        }

        //check 3 --Check for duplicates against already processed invoices
        private async Task<SwitchBatchInvoicesDuplicatesOutput> CheckSwitchInvoiceWithNotProcessed(SwitchBatchInvoice switchBatchInvoice)
        {
            Contract.Requires(switchBatchInvoice != null);

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var amountTolerance = await _configurationService.GetModuleAmountToleranceByKey(SystemSettings.MedicalInvoiceAmountTolerance).ConfigureAwait(true);
                int totalAmountTolerance = Convert.ToInt32(amountTolerance) > 0 ? Convert.ToInt32(amountTolerance) : 0;
                //exclude "Invoice Rejected"  and "Invoice is Deleted" status
                var excludeInvoiceStatuses = new int[] { (int)InvoiceStatusEnum.Rejected, (int)InvoiceStatusEnum.Deleted };

                var switchBatch = await (
                         from msb1 in _medicalSwitchBatchInvoiceRepository
                         join msbli in _medicalSwitchBatchInvoiceLineRepository on msb1.SwitchBatchInvoiceId equals msbli.SwitchBatchInvoiceId
                         join msp in _healthCareProviderRepository on msb1.HealthCareProviderId equals msp.RolePlayerId
                         where msb1.SwitchBatchId == switchBatchInvoice.SwitchBatchId
                         && msb1.SwitchBatchInvoiceId == msbli.SwitchBatchInvoiceId
                         && msb1.PossibleEventId > 0
                         && msb1.IsProcessed == false
                         && msb1.IsActive
                         orderby msbli.TariffCode, msbli.ServiceDate, msbli.TotalInvoiceLineCostInclusive
                         select new
                         {
                             msbli.ServiceDate,
                             msbli.TariffCode,
                             msb1.HealthCareProviderId,
                             msb1.InvoiceId,
                             msb1.SwitchBatchId,
                             msb1.SwitchBatchInvoiceId,
                             msb1.PossiblePersonEventId,
                             msb1.TotalInvoiceAmountInclusive,
                             msb1.SpInvoiceNumber,
                             msb1.SpAccountNumber,
                             Batch1LineItems = (msbli.TariffCode + "|" + msbli.ServiceDate),
                             Batch1LineItemsA = (msbli.TotalInvoiceLineCostInclusive.ToString() + "|" + msbli.ServiceDate),
                             Batch1LineItemsB = (msbli.TotalInvoiceLineCostInclusive.ToString() + "|" + msbli.TariffCode + "|" + msbli.ServiceDate)
                         }
                         ).ToListAsync();

                var medicalInvoice = await (
                        from captured in _invoiceRepository
                        join mli in _invoiceLineRepository on captured.InvoiceId equals mli.InvoiceId
                        where !excludeInvoiceStatuses.Contains((int)captured.InvoiceStatus)
                        orderby mli.HcpTariffCode, mli.ServiceDate, mli.TotalTariffAmountInclusive
                        select new
                        {
                            mli.ServiceDate,
                            mli.HcpTariffCode,
                            captured.HealthCareProviderId,
                            captured.InvoiceId,
                            captured.PersonEventId,
                            captured.InvoiceTotalInclusive,
                            captured.HcpInvoiceNumber,
                            captured.HcpAccountNumber,
                            Batch2LineItems = (mli.HcpTariffCode + "|" + mli.ServiceDate),
                            Batch2LineItemsA = (mli.TotalTariffAmountInclusive.ToString() + "|" + mli.ServiceDate),
                            Batch2LineItemsB = (mli.TotalTariffAmountInclusive.ToString() + "|" + mli.HcpTariffCode + "|" + mli.ServiceDate)
                        }
                        ).ToListAsync();

                var mergedSwitchBatchesMedicalInvoices = (
                        from swb in switchBatch
                        join minv in medicalInvoice
                        on new
                        {
                            HealthCareProviderId = swb.HealthCareProviderId == null ? 0 : swb.HealthCareProviderId,
                            sd = swb.ServiceDate == null ? null : swb.ServiceDate,
                            tr = swb.TariffCode,
                            invNo = swb.SpInvoiceNumber,

                            PossiblePersonEventId = swb.PossiblePersonEventId == null ? 0 : swb.PossiblePersonEventId
                        }
                        equals new
                        {
                            HealthCareProviderId = minv?.HealthCareProviderId,
                            sd = minv?.ServiceDate,
                            tr = minv.HcpTariffCode,
                            invNo = minv.HcpInvoiceNumber,

                            PossiblePersonEventId = minv.PersonEventId == null ? 0 : minv.PersonEventId
                        }

                        where minv.InvoiceTotalInclusive - swb.TotalInvoiceAmountInclusive <= totalAmountTolerance
                        && (swb.SpInvoiceNumber == minv.HcpInvoiceNumber || swb.SpAccountNumber == minv.HcpInvoiceNumber || swb.SpInvoiceNumber == minv.HcpAccountNumber
                        || (swb.SpInvoiceNumber.Length > minv.HcpInvoiceNumber.Length
                        && swb.SpInvoiceNumber.IndexOf(minv.HcpInvoiceNumber, StringComparison.OrdinalIgnoreCase) >= 0)
                        || (minv.HcpInvoiceNumber.Length > swb.SpInvoiceNumber.Length
                        && minv.HcpInvoiceNumber.IndexOf(swb.SpInvoiceNumber, StringComparison.OrdinalIgnoreCase) >= 0)
                        )
                        select new SwitchBatchInvoicesDuplicatesOutput
                        {
                            BatchTariffCodeServiceDate = swb.Batch1LineItems,
                            BatchTotalInvoiceLineCostInclServiceDate = swb.Batch1LineItemsA,
                            BatchTariffCodeTotalInvoiceLineCostInclServiceDate = swb.Batch1LineItemsB,

                            InvoiceTariffCodeServiceDate = minv.Batch2LineItems,
                            InvoiceTotalInvoiceLineCostInclServiceDate = minv.Batch2LineItemsA,
                            InvoiceTariffCodeTotalInvoiceLineCostInclServiceDate = minv.Batch2LineItemsB

                        }).FirstOrDefault();

                return mergedSwitchBatchesMedicalInvoices;
            }
        }

        private async Task<bool> CheckSwitchBatchInvoiceLineStatus(SwitchBatchInvoice switchBatchInvoice)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var underAssessReasonActions = await (
                    from switchInvoiceLine in _medicalSwitchBatchInvoiceLineRepository
                    join sbiluar in _medicalSwitchBatchInvoiceLineUnderAssessReasonRepository on switchInvoiceLine.SwitchBatchInvoiceLineId equals sbiluar.SwitchBatchInvoiceLineId
                    join underAssessReason in _switchUnderAssessReasonSettingRepository on (int)sbiluar.SwitchUnderAssessReason equals underAssessReason.Id
                    where switchInvoiceLine.SwitchBatchInvoiceId == switchBatchInvoice.SwitchBatchInvoiceId
                    select underAssessReason.Action).ToListAsync();

                return underAssessReasonActions.All(m => m == "Reject");
            }
        }

        private async Task<bool> CheckSwitchInvoiceLineIsDuplicate(SwitchBatchInvoiceLine switchBatchInvoiceLine, int claimId, string claimReference, SwitchBatchTypeEnum switchBatchType)
        {
            Contract.Requires(switchBatchInvoiceLine != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var amountTolerance = await _configurationService.GetModuleAmountToleranceByKey(SystemSettings.MedicalInvoiceAmountTolerance);
                int totalAmountTolerance = Convert.ToInt32(amountTolerance) > 0 ? Convert.ToInt32(amountTolerance) : 0;

                //exclude  "Invoice Rejected"  and "Invoice is Deleted" status
                var excludeInvoiceStatuses = new int[] { (int)InvoiceStatusEnum.Rejected, (int)InvoiceStatusEnum.Deleted };

                var capturedSameClaimInvoices = (switchBatchType == SwitchBatchTypeEnum.Teba) ?
                  await (
                    from captured in _tebaInvoiceRepository
                    where !excludeInvoiceStatuses.Contains((int)captured.InvoiceStatus)
                          && captured.ClaimId == claimId
                    select new
                    {
                        Id = captured.TebaInvoiceId
                    }).ToListAsync()
                  :
                  await (
                    from captured in _invoiceRepository
                    where !excludeInvoiceStatuses.Contains((int)captured.InvoiceStatus)
                          && captured.ClaimId == claimId
                    select new
                    {
                        Id = captured.InvoiceId
                    }).ToListAsync();

                var switchSameClaimInvoices = await (
                    from switchInvoice in _medicalSwitchBatchInvoiceRepository
                    where switchInvoice.ClaimReferenceNumber == claimReference
                    select new
                    {
                        switchInvoice.InvoiceId
                    }).ToListAsync();

                if (switchSameClaimInvoices.Count == 0 && capturedSameClaimInvoices.Count == 0)
                    return false;

                var duplicateNewSwitchInvoiceLines = (switchBatchType == SwitchBatchTypeEnum.Teba) ?
                    await (
                    from existingSwitchInvoiceLine in _medicalSwitchBatchInvoiceLineRepository
                    join switchInvoice in _medicalSwitchBatchInvoiceRepository on switchBatchInvoiceLine.SwitchBatchInvoiceId equals switchInvoice.SwitchBatchInvoiceId
                    join tebaTariff in _tebaTariffRepository on existingSwitchInvoiceLine.TariffCode equals tebaTariff.TariffCode
                    where switchInvoice.ClaimReferenceNumber == claimReference
                          && existingSwitchInvoiceLine.SwitchBatchInvoiceId == switchBatchInvoiceLine.SwitchBatchInvoiceId
                          && existingSwitchInvoiceLine.SwitchBatchInvoiceLineId != switchBatchInvoiceLine.SwitchBatchInvoiceLineId
                          && existingSwitchInvoiceLine.TariffCode == switchBatchInvoiceLine.TariffCode
                          && existingSwitchInvoiceLine.TotalInvoiceLineCostInclusive - switchBatchInvoiceLine.TotalInvoiceLineCostInclusive <= totalAmountTolerance
                          && (existingSwitchInvoiceLine.ServiceDate == switchBatchInvoiceLine.ServiceDate
                              || (existingSwitchInvoiceLine.ServiceDate.Value.Day == switchBatchInvoiceLine.ServiceDate.Value.Day
                                  && existingSwitchInvoiceLine.ServiceDate.Value.Month == switchBatchInvoiceLine.ServiceDate.Value.Month))
                    orderby existingSwitchInvoiceLine.TariffCode, existingSwitchInvoiceLine.ServiceDate, existingSwitchInvoiceLine.TotalInvoiceLineCostInclusive
                    select new
                    {
                        existingSwitchInvoiceLine.TariffCode,
                        existingSwitchInvoiceLine.TotalInvoiceLineCostInclusive,
                        existingSwitchInvoiceLine.ServiceDate,
                    }).ToListAsync()
                    :
                    await (
                    from existingSwitchInvoiceLine in _medicalSwitchBatchInvoiceLineRepository
                    join switchInvoice in _medicalSwitchBatchInvoiceRepository on switchBatchInvoiceLine.SwitchBatchInvoiceId equals switchInvoice.SwitchBatchInvoiceId
                    join medicalItem in _medicalItemRepository on existingSwitchInvoiceLine.TariffCode equals medicalItem.ItemCode
                    where switchInvoice.ClaimReferenceNumber == claimReference
                          && existingSwitchInvoiceLine.SwitchBatchInvoiceId == switchBatchInvoiceLine.SwitchBatchInvoiceId
                          && existingSwitchInvoiceLine.SwitchBatchInvoiceLineId != switchBatchInvoiceLine.SwitchBatchInvoiceLineId
                          && existingSwitchInvoiceLine.TariffCode == switchBatchInvoiceLine.TariffCode
                          && existingSwitchInvoiceLine.TotalInvoiceLineCostInclusive - switchBatchInvoiceLine.TotalInvoiceLineCostInclusive <= totalAmountTolerance
                          && (existingSwitchInvoiceLine.ServiceDate == switchBatchInvoiceLine.ServiceDate
                              || (existingSwitchInvoiceLine.ServiceDate.Value.Day == switchBatchInvoiceLine.ServiceDate.Value.Day
                                  && existingSwitchInvoiceLine.ServiceDate.Value.Month == switchBatchInvoiceLine.ServiceDate.Value.Month
                                  && !medicalItem.IsAllowSameDayTreatment))
                    orderby existingSwitchInvoiceLine.TariffCode, existingSwitchInvoiceLine.ServiceDate, existingSwitchInvoiceLine.TotalInvoiceLineCostInclusive
                    select new
                    {
                        existingSwitchInvoiceLine.TariffCode,
                        existingSwitchInvoiceLine.TotalInvoiceLineCostInclusive,
                        existingSwitchInvoiceLine.ServiceDate,
                    }).ToListAsync();
                    



                if (duplicateNewSwitchInvoiceLines.Count > 0)
                    return true;

                var duplicateCapturedInvoiceLines = await (
                    from mli in _invoiceLineRepository
                    join captured in _invoiceRepository on mli.InvoiceId equals captured.InvoiceId
                    join medicalItem in _medicalItemRepository on mli.HcpTariffCode equals medicalItem.ItemCode
                    where !excludeInvoiceStatuses.Contains((int)captured.InvoiceStatus)
                          && captured.ClaimId == claimId
                          && mli.HcpTariffCode == switchBatchInvoiceLine.TariffCode
                          && (mli.ServiceDate == switchBatchInvoiceLine.ServiceDate
                              || (mli.ServiceDate.Day == switchBatchInvoiceLine.ServiceDate.Value.Day
                              && mli.ServiceDate.Month == switchBatchInvoiceLine.ServiceDate.Value.Month
                              && !medicalItem.IsAllowSameDayTreatment))
                          && mli.TotalTariffAmountInclusive - switchBatchInvoiceLine.TotalInvoiceLineCostInclusive <= totalAmountTolerance
                    orderby mli.HcpTariffCode, mli.ServiceDate, mli.TotalTariffAmountInclusive
                    select new
                    {
                        mli.HcpTariffCode,
                        mli.TotalTariffAmountInclusive,
                        mli.ServiceDate,
                    }).ToListAsync();


                if (duplicateCapturedInvoiceLines.Count > 0)
                    return true;

                var duplicateExistingSwitchInvoiceLines = await (
                    from existingSwitchInvoiceLine in _medicalSwitchBatchInvoiceLineRepository
                    join switchInvoice in _medicalSwitchBatchInvoiceRepository on switchBatchInvoiceLine.SwitchBatchInvoiceId equals switchInvoice.SwitchBatchInvoiceId
                    join medicalItem in _medicalItemRepository on switchBatchInvoiceLine.TariffCode equals medicalItem.ItemCode
                    where switchInvoice.ClaimReferenceNumber == claimReference
                          && existingSwitchInvoiceLine.TariffCode == switchBatchInvoiceLine.TariffCode
                          && (existingSwitchInvoiceLine.ServiceDate == switchBatchInvoiceLine.ServiceDate
                              || (existingSwitchInvoiceLine.ServiceDate.Value.Day == switchBatchInvoiceLine.ServiceDate.Value.Day
                                  && existingSwitchInvoiceLine.ServiceDate.Value.Month == switchBatchInvoiceLine.ServiceDate.Value.Month
                                  && !medicalItem.IsAllowSameDayTreatment))
                          && existingSwitchInvoiceLine.TotalInvoiceLineCostInclusive - switchBatchInvoiceLine.TotalInvoiceLineCostInclusive <= totalAmountTolerance
                    orderby existingSwitchInvoiceLine.TariffCode, existingSwitchInvoiceLine.ServiceDate, existingSwitchInvoiceLine.TotalInvoiceLineCostInclusive
                    select new
                    {
                        existingSwitchInvoiceLine.TariffCode,
                        existingSwitchInvoiceLine.TotalInvoiceLineCostInclusive,
                        existingSwitchInvoiceLine.ServiceDate,
                    }).ToListAsync();


                if (duplicateExistingSwitchInvoiceLines.Count > 0)
                    return true;

                return false;
            }
        }

        private async Task<Invoice> PrepareForMedicalInvoiceCreation(SwitchBatchInvoice switchBatchInvoice)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var newMedicalInvoiceToBeAdded = new Invoice
                {
                    AuthorisedAmount = 0,
                    AuthorisedTotalInclusive = 0,
                    AuthorisedVat = 0,
                    ClaimId = switchBatchInvoice.ClaimId,
                    Comments = null,
                    CreatedBy = DatabaseConstants.AutoPaySystemUser,
                    CreatedDate = DateTimeHelper.SaNow,
                    ModifiedBy = DatabaseConstants.AutoPaySystemUser,
                    ModifiedDate = DateTimeHelper.SaNow,
                    DateAdmitted = switchBatchInvoice.DateAdmitted,
                    DateDischarged = switchBatchInvoice.DateDischarged,
                    DateReceived = switchBatchInvoice.DateReceived,
                    DateSubmitted = switchBatchInvoice.DateSubmitted,
                    HcpAccountNumber = switchBatchInvoice.SpAccountNumber,
                    HcpInvoiceNumber = switchBatchInvoice.SpInvoiceNumber,
                    HealthCareProviderId = switchBatchInvoice.HealthCareProviderId ?? 0,
                    InvoiceAmount = switchBatchInvoice.TotalInvoiceAmount ?? 0,
                    InvoiceDate = switchBatchInvoice.InvoiceDate ?? switchBatchInvoice.DateSubmitted ?? DateTimeHelper.SaNow,
                    InvoiceId = 0,
                    PersonEventId = switchBatchInvoice.PossiblePersonEventId ?? 0,
                    InvoiceStatus = InvoiceStatusEnum.Captured,
                    InvoiceTotalInclusive = switchBatchInvoice.TotalInvoiceAmountInclusive,
                    InvoiceVat = switchBatchInvoice.TotalInvoiceVat ?? 0,
                    PayeeId = switchBatchInvoice.HealthCareProviderId ?? 0,
                    PayeeTypeId = 0,
                    InvoiceLines = new List<InvoiceLine>()
                };

                var healthCareProvider =
                    await _healthCareProviderRepository.FirstOrDefaultAsync(h => h.RolePlayerId == switchBatchInvoice.HealthCareProviderId);
                if (healthCareProvider == null)
                    return null;

                var practitionerType = (PractitionerTypeEnum)healthCareProvider.ProviderTypeId;

                foreach (var switchBatchInvoiceLine in switchBatchInvoice.SwitchBatchInvoiceLines)
                {
                    var invoiceLine = new InvoiceLine
                    {
                        AuthorisedAmount = 0,
                        AuthorisedAmountInclusive = 0,
                        AuthorisedQuantity = 0,
                        AuthorisedVat = 0,
                        CreditAmount = switchBatchInvoiceLine.CreditAmount ?? 0,
                        InvoiceLineId = 0,
                        Icd10Code = switchBatchInvoiceLine.Icd10Code,
                        HcpTariffCode = switchBatchInvoiceLine.TariffCode,
                        CalculateOperands = string.Empty,
                        RequestedAmount = switchBatchInvoiceLine.TotalInvoiceLineCost ?? 0,
                        RequestedAmountInclusive = switchBatchInvoiceLine.TotalInvoiceLineCostInclusive,
                        RequestedQuantity = switchBatchInvoiceLine.Quantity.ToDecimal(),
                        RequestedVat = switchBatchInvoiceLine.TotalInvoiceLineVat ?? 0,
                        TariffAmount = switchBatchInvoiceLine.TotalInvoiceLineCostInclusive,
                        TotalTariffAmount = switchBatchInvoiceLine.TotalInvoiceLineCost ?? 0,
                        TotalTariffAmountInclusive = switchBatchInvoiceLine.TotalInvoiceLineCostInclusive,
                        TotalTariffVat = switchBatchInvoiceLine.TotalInvoiceLineVat ?? 0,
                        ServiceTimeStart = switchBatchInvoiceLine.ServiceTimeStart,
                        ServiceTimeEnd = switchBatchInvoiceLine.ServiceTimeEnd,
                        ServiceDate = switchBatchInvoiceLine.ServiceDate ?? switchBatchInvoice.DateSubmitted ?? DateTimeHelper.SaNow,
                        VatPercentage = 0,
                        CreatedBy = DatabaseConstants.AutoPaySystemUser,
                        CreatedDate = DateTimeHelper.SaNow,
                        ModifiedBy = DatabaseConstants.AutoPaySystemUser,
                        ModifiedDate = DateTimeHelper.SaNow
                    };

                    var medicalItem = await
                        _medicalItemRepository.FirstOrDefaultAsync(i => i.ItemCode == switchBatchInvoiceLine.TariffCode);
                    if (medicalItem != null)
                    {
                        invoiceLine.MedicalItemId = medicalItem.MedicalItemId;
                        invoiceLine.TreatmentCodeId = medicalItem.TreatmentCodeId;
                    }

                    var tariff = await
                        _tariffRepository.FirstOrDefaultAsync(t => t.ItemCode == switchBatchInvoiceLine.TariffCode && t.PractitionerType == practitionerType);
                    if (tariff != null)
                    {
                        var tariffBaseUnitCost =
                            await _tariffBaseUnitCostRepository.FirstOrDefaultAsync(t =>
                                t.TariffBaseUnitCostId == tariff.TariffBaseUnitCostId);
                        if (tariffBaseUnitCost != null)
                        {
                            invoiceLine.TariffBaseUnitCostTypeId = tariffBaseUnitCost.TariffBaseUnitCostTypeId;
                        }

                        invoiceLine.TariffId = tariff.TariffId;
                        invoiceLine.VatCode = tariff.VatCode;
                    }

                    newMedicalInvoiceToBeAdded.InvoiceLines.Add(invoiceLine);
                }

                if (switchBatchInvoice.ClaimId.HasValue)
                {
                    var claim = await _claimService.GetClaim(switchBatchInvoice.ClaimId.Value);
                    if (claim != null)
                    {
                        newMedicalInvoiceToBeAdded.PersonEventId = claim.PersonEventId;
                        newMedicalInvoiceToBeAdded.ClaimId = claim.ClaimId;
                        newMedicalInvoiceToBeAdded.InvoiceId = 0;
                        newMedicalInvoiceToBeAdded.InvoiceStatus = InvoiceStatusEnum.Captured;
                        newMedicalInvoiceToBeAdded.IsActive = true;
                        foreach (var invoiceLine in newMedicalInvoiceToBeAdded.InvoiceLines)
                        {
                            invoiceLine.IsActive = true;
                        }
                    }
                }

                newMedicalInvoiceToBeAdded.SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId;

                return newMedicalInvoiceToBeAdded;
            }
        }

        private async Task<TebaInvoice> PrepareForTebaInvoiceCreation(SwitchBatchInvoice switchBatchInvoice)
        {
            decimal kilometers = 0;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var newTebaInvoiceToBeAdded = new TebaInvoice
                {
                    TebaInvoiceId = 0,
                    ClaimId = switchBatchInvoice.ClaimId ?? 0,
                    PersonEventId = switchBatchInvoice.PossiblePersonEventId ?? 0,
                    InvoicerId = switchBatchInvoice.HealthCareProviderId ?? 0,
                    InvoicerTypeId = Constants.MediCareConstants.TebaPayeeType,
                    HcpInvoiceNumber = switchBatchInvoice.SpInvoiceNumber,
                    HcpAccountNumber = switchBatchInvoice.SpAccountNumber,
                    InvoiceDate = switchBatchInvoice.InvoiceDate ?? switchBatchInvoice.DateSubmitted ?? DateTimeHelper.SaNow,
                    DateSubmitted = switchBatchInvoice.DateSubmitted ?? DateTimeHelper.SaNow,
                    DateReceived = switchBatchInvoice.DateReceived,
                    DateTravelledFrom = switchBatchInvoice.DateAdmitted,
                    DateTravelledTo = switchBatchInvoice.DateDischarged,
                    PreAuthId = switchBatchInvoice.PreAuthId,
                    InvoiceStatus = InvoiceStatusEnum.Captured,
                    InvoiceAmount = switchBatchInvoice.TotalInvoiceAmount ?? 0,
                    InvoiceVat = switchBatchInvoice.TotalInvoiceVat ?? 0,
                    InvoiceTotalInclusive = switchBatchInvoice.TotalInvoiceAmountInclusive,
                    AuthorisedAmount = 0,
                    AuthorisedVat = 0,
                    AuthorisedTotalInclusive = 0,
                    PayeeId = switchBatchInvoice.HealthCareProviderId ?? 0,
                    PayeeTypeId = Constants.MediCareConstants.TebaPayeeType,
                    IsPreauthorised = switchBatchInvoice.PreAuthId > 0,
                    VatPercentage = 0,
                    SwitchBatchId = switchBatchInvoice.SwitchBatchId,
                    SwitchTransactionNo = switchBatchInvoice.SwitchTransactionNumber,
                    SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                    IsActive = true,
                    CreatedBy = DatabaseConstants.AutoPaySystemUser,
                    CreatedDate = DateTimeHelper.SaNow,
                    ModifiedBy = DatabaseConstants.AutoPaySystemUser,
                    ModifiedDate = DateTimeHelper.SaNow,
                    TebaInvoiceLines = new List<TebaInvoiceLine>()
                };

                var healthCareProvider =
                    await _healthCareProviderRepository.FirstOrDefaultAsync(h => h.RolePlayerId == switchBatchInvoice.HealthCareProviderId);

                if (healthCareProvider != null)
                    newTebaInvoiceToBeAdded.VatCode = healthCareProvider.IsVat ? VatCodeEnum.StandardVATRate : VatCodeEnum.VATExempt;

                foreach (var switchBatchInvoiceLine in switchBatchInvoice.SwitchBatchInvoiceLines)
                {
                    DateTime serviceDate = switchBatchInvoiceLine.ServiceDate ?? switchBatchInvoice.DateSubmitted ?? DateTimeHelper.SaNow;
                    decimal requestedQuantity = switchBatchInvoiceLine.Quantity.ToDecimal();

                    TebaTariffCodeTypeEnum tebaTariffCodeTypeEnum = (TebaTariffCodeTypeEnum)Convert.ToInt32(switchBatchInvoiceLine.TariffCode);
                    TebaTariff tariff = await _invoiceCommonService.GetTebaTariff(tebaTariffCodeTypeEnum, serviceDate);
                    decimal tariffAmount = Convert.ToDecimal(tariff?.CostValue);
                    decimal vatPercentage = await _vatService.GetVatAmount((int)newTebaInvoiceToBeAdded.VatCode, serviceDate);
                    decimal totalTariffAmount = requestedQuantity * tariffAmount;
                    decimal tariffVat = Convert.ToDecimal(totalTariffAmount * vatPercentage / 100);

                    var tebaInvoiceLine = new TebaInvoiceLine
                    {
                        TebaInvoiceLineId = 0,
                        ServiceDate = serviceDate,
                        RequestedQuantity = requestedQuantity,
                        AuthorisedQuantity = 0,
                        RequestedAmount = switchBatchInvoiceLine.TotalInvoiceLineCost ?? 0,
                        RequestedVat = switchBatchInvoiceLine.TotalInvoiceLineVat ?? 0,
                        RequestedAmountInclusive = switchBatchInvoiceLine.TotalInvoiceLineCostInclusive,
                        AuthorisedAmount = 0,
                        AuthorisedVat = 0,
                        AuthorisedAmountInclusive = 0,
                        TariffId = !String.IsNullOrWhiteSpace(switchBatchInvoiceLine.TariffCode) ? Convert.ToInt32(switchBatchInvoiceLine.TariffCode) : 0,
                        TotalTariffAmount = totalTariffAmount,
                        TotalTariffVat = tariffVat,
                        TotalTariffAmountInclusive = (requestedQuantity * tariffAmount) + tariffVat,
                        TariffAmount = tariffAmount,
                        CreditAmount = switchBatchInvoiceLine.CreditAmount ?? 0,
                        VatCode = newTebaInvoiceToBeAdded.VatCode,
                        VatPercentage = vatPercentage,
                        TreatmentCodeId = switchBatchInvoiceLine.TreatmentCodeId ?? 0,
                        MedicalItemId = 0,
                        HcpTariffCode = switchBatchInvoiceLine.TariffCode,
                        TariffBaseUnitCostTypeId = 0,
                        Description = switchBatchInvoiceLine.Description,
                        CalculateOperands = string.Empty,
                        IsActive = true,
                        CreatedBy = DatabaseConstants.AutoPaySystemUser,
                        CreatedDate = DateTimeHelper.SaNow,
                        ModifiedBy = DatabaseConstants.AutoPaySystemUser,
                        ModifiedDate = DateTimeHelper.SaNow
                    };

                    if (!String.IsNullOrWhiteSpace(switchBatchInvoiceLine.TariffCode))
                    {
                        newTebaInvoiceToBeAdded.TebaTariffCode = tebaTariffCodeTypeEnum.DisplayDescriptionAttributeValue();
                        newTebaInvoiceToBeAdded.KilometerRate = Convert.ToInt32(switchBatchInvoiceLine.TariffCode);
                    }

                    kilometers += switchBatchInvoiceLine.Quantity.ToDecimal();

                    newTebaInvoiceToBeAdded.TebaInvoiceLines.Add(tebaInvoiceLine);
                }

                if (switchBatchInvoice.ClaimId.HasValue)
                {
                    var claim = await _claimService.GetClaim(switchBatchInvoice.ClaimId.Value);
                    if (claim != null)
                    {
                        newTebaInvoiceToBeAdded.PersonEventId = claim.PersonEventId;
                        newTebaInvoiceToBeAdded.ClaimId = claim.ClaimId;
                    }
                }

                newTebaInvoiceToBeAdded.Kilometers = kilometers;

                return newTebaInvoiceToBeAdded;
            }
        }

        public async Task ValidateSwitchBatchInvoice(int switchBatchInvoiceId)
        {
            try
            {
                if (switchBatchInvoiceId <= 0)
                {
                    return;
                }

                SwitchBatchInvoice switchBatchInvoiceToUpdate = null;

                try
                {
                    var switchBatchInvoice = await _switchBatchService.GetSwitchBatchInvoice(switchBatchInvoiceId);
                    if (switchBatchInvoice == null)
                    {
                        return;
                    }

                    var switchBatchInvoices = new List<SwitchBatchInvoice> { switchBatchInvoice };
                    await UpdateClaimReferenceNumberForSwitchBatchInvoices(switchBatchInvoices);
                    await UpdatePossiblePersonEventAndEventForSwitchBatchInvoices(switchBatchInvoices);
                    await GetAndUpdateClaimDetailsForSwitchBatchInvoices(switchBatchInvoices);

                    switchBatchInvoiceToUpdate = await ValidateSwitchBatchInvoice(switchBatchInvoice);
                    if (switchBatchInvoiceToUpdate != null)
                    {
                        switchBatchInvoiceToUpdate.SwitchInvoiceStatus =
                            await GetStatusForSwitchBatchInvoice(switchBatchInvoiceToUpdate);
                        await UpdateSwitchBatchInvoice(switchBatchInvoiceToUpdate);
                    }

                    if (switchBatchInvoiceToUpdate?.SwitchInvoiceStatus == SwitchInvoiceStatusEnum.Queued)
                    {
                        switchBatchInvoiceToUpdate.SwitchInvoiceStatus = null;
                        await UpdateSwitchBatchInvoice(switchBatchInvoiceToUpdate);
                    }

                }
                catch (Exception ex)
                {
                    if (switchBatchInvoiceToUpdate != null)
                    {
                        ex.LogException();
                        switchBatchInvoiceToUpdate.SwitchInvoiceStatus = null;
                        await UpdateSwitchBatchInvoice(switchBatchInvoiceToUpdate);
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException();
            }
        }
    }
}
