using AutoMapper;
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClaimCare.Database.Constants;
using RMA.Service.ClaimCare.Database.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.FinCare.Contracts.Interfaces.Payments;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Globalization;
using System.Linq;
using System.Linq.Dynamic;
using System.Threading.Tasks;

using Benefit = RMA.Service.ClientCare.Contracts.Entities.Product.Benefit;

namespace RMA.Service.ClaimCare.Services.Claim
{
    public class ClaimInvoiceFacade : RemotingStatelessService, IClaimInvoiceService
    {
        private const string SoftDeleteFilter = "SoftDeletes";

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<claim_ClaimInvoice> _claimInvoiceRepository;
        private readonly IRepository<claim_Claim> _claimRepository;
        private readonly IRepository<claim_ClaimBenefit> _claimBenefitRepository;
        private readonly IRepository<claim_SundryInvoice> _sundryInvoiceRepository;
        private readonly IRepository<claim_WidowLumpSumInvoice> _widowLumpSumInvoiceRepository;
        private readonly IRepository<claim_TravelInvoice> _travelInvoiceRepository;
        private readonly IRepository<claim_DaysOffInvoice> _daysOffInvoiceRepository;
        private readonly IRepository<claim_FatalPdLumpsumInvoice> _fatalPdLumpsumInvoiceRepository;
        private readonly IRepository<claim_FuneralExpenseInvoice> _funeralExpenseInvoiceRepository;
        private readonly IRepository<claim_ClaimDisabilityAssessment> _claimDisabilityAssessmentRepository;
        private readonly IRepository<claim_TravelAuthorisation> _travelAuthorisationRepository;
        private readonly IRepository<claim_TravelAuthorisedParty> _travelAuthorisedPartyRepository;
        private readonly IRepository<claim_TravelRateType> _travelRateTypeRepository;
        private readonly IRepository<claim_ClaimBenefitType> _claimBenefitTypeRepository;
        private readonly IRepository<claim_PersonEvent> _personEventRepository;
        private readonly IRepository<claim_ClaimEstimate> _claimEstimateRepository;
        private readonly IRepository<claim_EstimateType> _claimEstimateTypeRepository;
        private readonly IRepository<claim_ClaimBenefitFormula> _claimBenefitFormulaRepository;
        private readonly IRepository<claim_PdAward> _pdAwardRepository;
        private readonly IRepository<claim_Earning> _earningsRepository;
        private readonly ISLAService _slaService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IPolicyService _policyService;
        private readonly ICommonSystemNoteService _commonSystemNoteService;
        private readonly IClaimCommunicationService _claimCommunicationService;
        private readonly IConfigurationService _configurationService;
        private readonly IBenefitService _benefitService;
        private readonly IRepository<common_SlaStatusChangeAudit> _slaStatusChangeRepository;
        private readonly IRepository<claim_HearingAssessment> _claimHearingAssessmentRepository;
        private readonly IWizardService _wizardService;
        private readonly ISerializerService _serializerService;
        private readonly IEventService _eventService;
        private readonly IAccidentService _accidentService;
        private readonly IClaimEarningService _claimEarningService;
        private readonly IMedicalEstimatesService _medicalEstimatesService;
        private readonly IICD10CodeService _iCD10CodeService;
        private readonly IRepository<claim_FatalLumpSumInvoice> _fatalLumpsumInvoiceRepository;
        private readonly IUserService _userService;
        private readonly IPaymentCreatorService _paymentCreatorService;
        private readonly IAuthorityLimitService _authorityLimitService;

        public ClaimInvoiceFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<claim_ClaimInvoice> claimInvoiceRepository,
            IRepository<claim_ClaimBenefit> claimBenefitRepository,
            IRepository<claim_SundryInvoice> sundryInvoiceRepository,
            IRepository<claim_WidowLumpSumInvoice> widowLumpSumInvoiceRepository,
            IRepository<claim_TravelInvoice> travelInvoiceRepository,
            IRepository<claim_DaysOffInvoice> daysOffInvoiceRepository,
            IRepository<claim_FatalPdLumpsumInvoice> fatalPdLumpsumInvoiceRepository,
            IRepository<claim_FuneralExpenseInvoice> funeralExpenseInvoiceRepository,
            IRepository<claim_ClaimDisabilityAssessment> claimDisabilityAssessmentRepository,
            IRepository<claim_TravelAuthorisation> travelAuthorisationRepository,
            IRepository<claim_TravelAuthorisedParty> travelAuthorisedPartyRepository,
            IRepository<claim_TravelRateType> travelRateTypeRepository,
            IRepository<claim_ClaimBenefitType> claimBenefitTypeRepository,
            IRepository<claim_Claim> claimRepository,
            IRepository<claim_PersonEvent> personEventRepository,
            IRepository<claim_ClaimEstimate> claimEstimateRepository,
            IRepository<claim_EstimateType> claimEstimateTypeRepository,
            IRepository<claim_ClaimBenefitFormula> claimBenefitFormulaRepository,
            IRepository<claim_PdAward> pdAwardRepository,
            IRepository<claim_Earning> earningsRepository,
            IRolePlayerService rolePlayerService,
            IPolicyService policyService,
            ICommonSystemNoteService commonSystemNoteService,
            IClaimCommunicationService claimCommunicationService,
            IConfigurationService configurationService,
            IBenefitService benefitService,
            ISLAService slaService,
            IRepository<common_SlaStatusChangeAudit> slaStatusChangeRepository,
            IRepository<claim_HearingAssessment> claimHearingAssessmentRepository,
            IWizardService wizardService,
            ISerializerService serializerService,
            IEventService eventService,
            IAccidentService accidentService,
            IClaimEarningService claimEarningService,
            IMedicalEstimatesService medicalEstimatesService,
            IICD10CodeService iCD10CodeService,
            IUserService userService,
            IRepository<claim_FatalLumpSumInvoice> fatalLumpsumInvoiceRepository,
            IPaymentCreatorService paymentCreatorService,
            IAuthorityLimitService authorityLimitService)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _claimInvoiceRepository = claimInvoiceRepository;
            _claimRepository = claimRepository;
            _claimBenefitRepository = claimBenefitRepository;
            _sundryInvoiceRepository = sundryInvoiceRepository;
            _widowLumpSumInvoiceRepository = widowLumpSumInvoiceRepository;
            _travelInvoiceRepository = travelInvoiceRepository;
            _daysOffInvoiceRepository = daysOffInvoiceRepository;
            _fatalPdLumpsumInvoiceRepository = fatalPdLumpsumInvoiceRepository;
            _funeralExpenseInvoiceRepository = funeralExpenseInvoiceRepository;
            _claimDisabilityAssessmentRepository = claimDisabilityAssessmentRepository;
            _travelAuthorisationRepository = travelAuthorisationRepository;
            _travelAuthorisedPartyRepository = travelAuthorisedPartyRepository;
            _travelRateTypeRepository = travelRateTypeRepository;
            _claimBenefitTypeRepository = claimBenefitTypeRepository;
            _pdAwardRepository = pdAwardRepository;
            _earningsRepository = earningsRepository;
            _slaService = slaService;
            _personEventRepository = personEventRepository;
            _claimEstimateRepository = claimEstimateRepository;
            _claimEstimateTypeRepository = claimEstimateTypeRepository;
            _claimBenefitFormulaRepository = claimBenefitFormulaRepository;
            _rolePlayerService = rolePlayerService;
            _policyService = policyService;
            _commonSystemNoteService = commonSystemNoteService;
            _claimCommunicationService = claimCommunicationService;
            _configurationService = configurationService;
            _benefitService = benefitService;
            _slaStatusChangeRepository = slaStatusChangeRepository;
            _claimHearingAssessmentRepository = claimHearingAssessmentRepository;
            _wizardService = wizardService;
            _serializerService = serializerService;
            _eventService = eventService;
            _accidentService = accidentService;
            _claimEarningService = claimEarningService;
            _medicalEstimatesService = medicalEstimatesService;
            _iCD10CodeService = iCD10CodeService;
            _fatalLumpsumInvoiceRepository = fatalLumpsumInvoiceRepository;
            _userService = userService;
            _paymentCreatorService = paymentCreatorService;
            _authorityLimitService = authorityLimitService;
        }

        #region Public Methods
        public async Task<ClaimInvoice> CreateClaimInvoice(ClaimInvoice claimInvoice)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                Contract.Requires(claimInvoice != null);

                var entity = Mapper.Map<claim_ClaimInvoice>(claimInvoice);

                if (claimInvoice.ClaimEstimateId.HasValue)
                {
                    var claimEstimateEntity = await _claimEstimateRepository.FirstOrDefaultAsync(s => s.ClaimEstimateId == claimInvoice.ClaimEstimateId.Value);
                    if (claimEstimateEntity != null)
                    {
                        claimEstimateEntity.AllocatedValue = (claimEstimateEntity.AllocatedValue ?? 0) + claimInvoice.InvoiceAmount;
                        _claimEstimateRepository.Update(claimEstimateEntity);
                    }
                }

                _claimInvoiceRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return Mapper.Map<ClaimInvoice>(entity);
            }
        }

        public async Task<List<ClaimInvoice>> CreateClaimInvoices(List<ClaimInvoice> claimInvoices)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {

                var entities = Mapper.Map<List<claim_ClaimInvoice>>(claimInvoices);

                foreach (var claimInvoice in claimInvoices)
                {
                    if (claimInvoice.ClaimEstimateId.HasValue)
                    {
                        var claimEstimateEntity = await _claimEstimateRepository.FirstOrDefaultAsync(s => s.ClaimEstimateId == claimInvoice.ClaimEstimateId.Value);
                        if (claimEstimateEntity != null)
                        {
                            claimEstimateEntity.AllocatedValue = (claimEstimateEntity.AllocatedValue ?? 0) + claimInvoice.InvoiceAmount;
                            _claimEstimateRepository.Update(claimEstimateEntity);
                        }
                    }
                }

                _claimInvoiceRepository.Create(entities);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return Mapper.Map<List<ClaimInvoice>>(entities);
            }
        }

        public async Task<ClaimInvoice> UpdateClaimInvoiceV2(ClaimInvoice claimInvoice)
        {
            Contract.Requires(claimInvoice != null);

            var originalEntity = await GetClaimInvoiceByClaimInvoiceId(claimInvoice.ClaimInvoiceId);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var statusChanged = originalEntity.ClaimInvoiceStatusId != claimInvoice.ClaimInvoiceStatusId;

                if (statusChanged && claimInvoice.ClaimEstimateId.HasValue)
                {
                    var claimEstimateEntity = await _claimEstimateRepository
                        .FirstOrDefaultAsync(e => e.ClaimEstimateId == claimInvoice.ClaimEstimateId.Value);

                    var invoiceAmount = originalEntity.InvoiceAmount; // assuming invoice amounts are immutable and cannot or should not change...

                    await HandleStatusChangeAsync(claimInvoice, claimEstimateEntity, invoiceAmount);
                }

                // Update the entity in DB
                var targetEntity = Mapper.Map<claim_ClaimInvoice>(claimInvoice);
                _claimInvoiceRepository.Update(targetEntity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return Mapper.Map<ClaimInvoice>(targetEntity);
            }
        }

        public async Task<PagedRequestResult<ClaimInvoice>> GetPagedClaimInvoices(PagedRequest request, int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claim = await _claimRepository.FirstOrDefaultAsync(c => c.PersonEventId == personEventId);
                var searchTerm = (ClaimInvoiceTypeEnum)System.Enum.Parse(typeof(ClaimInvoiceTypeEnum), request?.SearchCriteria);

                SqlParameter[] parameters = {
                    new SqlParameter("PageNumber", request.Page),
                    new SqlParameter("RowsOfPage", request.PageSize),
                    new SqlParameter("SortingCol", request.OrderBy),
                    new SqlParameter("SortType", request.IsAscending ? "ASC" : "DESC"),
                    new SqlParameter("SearchCreatia", request.SearchCriteria == null ? string.Empty : request.SearchCriteria),
                    new SqlParameter("ClaimInvoiceType", searchTerm),
                    new SqlParameter("ClaimId", claim.ClaimId),
                    new SqlParameter("RecordCount", SqlDbType.Int),
                };

                parameters[7].Direction = ParameterDirection.Output;
                var searchResult = await _claimInvoiceRepository.SqlQueryAsync<ClaimInvoice>(DatabaseConstants.ClaimInvoiceData, parameters);
                var recordCount = (int)parameters[7].Value;

                return new PagedRequestResult<ClaimInvoice>()
                {
                    Page = request.Page,
                    PageCount = searchResult.Count,
                    RowCount = recordCount,
                    PageSize = request.PageSize,
                    Data = searchResult
                };
            }
        }

        public async Task<PagedRequestResult<TravelAuthorisation>> GetPagedClaimTravelAuthorisation(PagedRequest request, int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claim = await _claimRepository.FirstOrDefaultAsync(c => c.PersonEventId == personEventId);
                PagedRequestResult<claim_TravelAuthorisation> travelAuthorisations;

                if (string.IsNullOrEmpty(request?.SearchCriteria))
                {
                    travelAuthorisations = await _travelAuthorisationRepository.Where(a => a.PersonEventId == personEventId).ToPagedResult(request);
                }
                else
                {
                    var searchTerm = request?.SearchCriteria;
                    travelAuthorisations = await _travelAuthorisationRepository.Where(a => a.PersonEventId == personEventId).ToPagedResult(request);
                }

                var data = Mapper.Map<List<TravelAuthorisation>>(travelAuthorisations.Data);

                return new PagedRequestResult<TravelAuthorisation>
                {
                    Data = data,
                    RowCount = travelAuthorisations.RowCount,
                    Page = request.Page,
                    PageSize = request.PageSize,
                    PageCount = (int)Math.Ceiling(travelAuthorisations.RowCount / (double)request.PageSize)
                };
            }
        }

        public async Task<PagedRequestResult<ClaimInvoice>> GetPagedClaimInvoiceAllocations(PagedRequest request, int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {

                var searchTerm = (InvoiceStatusEnum)Enum.Parse(typeof(InvoiceStatusEnum), request?.SearchCriteria);

                var claimInvoices = await _claimInvoiceRepository.SqlQueryAsync<ClaimInvoice>(
                DatabaseConstants.GetPagedClaimInvoiceAllocations,
                     new SqlParameter("PersonEventId", personEventId),
                     new SqlParameter("SearchTerm", (int)searchTerm),
                     new SqlParameter("PageNumber", request.Page),
                     new SqlParameter("RowsOfPage", request.PageSize)
                     );
                var data = Mapper.Map<List<ClaimInvoice>>(claimInvoices);

                return new PagedRequestResult<ClaimInvoice>
                {
                    Data = data,
                    RowCount = claimInvoices.Count,
                    Page = request.Page,
                    PageSize = request.PageSize,
                    PageCount = (int)Math.Ceiling(claimInvoices.Count / (double)request.PageSize)
                };
            }
        }

        public async Task<SundryInvoice> GetSundryInvoice(int claimInvoiceId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                _sundryInvoiceRepository.DisableFilter(SoftDeleteFilter);
                var invoice = await _sundryInvoiceRepository.FirstOrDefaultAsync(i => i.ClaimInvoiceId == claimInvoiceId);
                await _sundryInvoiceRepository.LoadAsync(invoice, i => i.ClaimInvoice);
                _sundryInvoiceRepository.EnableFilter(SoftDeleteFilter);

                return Mapper.Map<SundryInvoice>(invoice);
            }
        }

        public async Task<WidowLumpSumInvoice> GetWidowLumpSumInvoice(int claimInvoiceId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                _widowLumpSumInvoiceRepository.DisableFilter(SoftDeleteFilter);
                var invoice = await _widowLumpSumInvoiceRepository.FirstOrDefaultAsync(i => i.ClaimInvoiceId == claimInvoiceId);
                await _widowLumpSumInvoiceRepository.LoadAsyncIncludeDeleted(invoice, i => i.ClaimInvoice);
                _widowLumpSumInvoiceRepository.EnableFilter(SoftDeleteFilter);

                return Mapper.Map<WidowLumpSumInvoice>(invoice);
            }
        }

        public async Task<PdAward> GetPDAward(int claimInvoiceId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoice = await _pdAwardRepository.FirstOrDefaultAsync(i => i.ClaimInvoiceId == claimInvoiceId);
                await _pdAwardRepository.LoadAsync(invoice, i => i.ClaimInvoice);

                return Mapper.Map<PdAward>(invoice);
            }
        }

        public async Task<TravelInvoice> GetTravelInvoice(int claimInvoiceId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoice = await _travelInvoiceRepository.FirstOrDefaultAsync(i => i.ClaimInvoiceId == claimInvoiceId);
                await _travelInvoiceRepository.LoadAsync(invoice, i => i.ClaimInvoice);

                return Mapper.Map<TravelInvoice>(invoice);
            }
        }

        public async Task<FuneralExpenseInvoice> GetFuneralExpenseInvoice(int claimInvoiceId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoice = await _funeralExpenseInvoiceRepository.FirstOrDefaultAsync(i => i.ClaimInvoiceId == claimInvoiceId);

                if (invoice != null)
                {
                    await _funeralExpenseInvoiceRepository.LoadAsync(invoice, i => i.ClaimInvoice);
                    return Mapper.Map<FuneralExpenseInvoice>(invoice);
                }
                else
                {
                    SqlParameter[] parameters = {
                    new SqlParameter("ClaimInvoiceType", ClaimInvoiceTypeEnum.FuneralExpenses),
                    new SqlParameter("ClaimInvoiceId", claimInvoiceId)
                };

                    var claimInvoice = await _claimInvoiceRepository.SqlQueryAsync<ClaimInvoice>(DatabaseConstants.ClaimGetRejectedMainInvoice, parameters);

                    SqlParameter[] sqlParams = {
                    new SqlParameter("ClaimInvoiceType", ClaimInvoiceTypeEnum.FuneralExpenses),
                    new SqlParameter("ClaimInvoiceId", claimInvoiceId)
                };
                    var funeralExpenseInvoice = await _claimInvoiceRepository.SqlQueryAsync<FuneralExpenseInvoice>(DatabaseConstants.ClaimGetRejectedChildInvoice, sqlParams);
                    funeralExpenseInvoice[0].ClaimInvoice = claimInvoice[0];
                    return funeralExpenseInvoice[0];
                }
            }
        }

        public async Task<FatalPDLumpsumInvoice> GetPartialDependencyLumpSumInvoice(int claimInvoiceId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoice = await _fatalPdLumpsumInvoiceRepository.FirstOrDefaultAsync(i => i.ClaimInvoiceId == claimInvoiceId);
                await _fatalPdLumpsumInvoiceRepository.LoadAsync(invoice, i => i.ClaimInvoice);

                return Mapper.Map<FatalPDLumpsumInvoice>(invoice);
            }
        }

        public async Task<DaysOffInvoice> GetDaysOffInvoiceInvoice(int claimInvoiceId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoice = await _daysOffInvoiceRepository.FirstOrDefaultAsync(i => i.ClaimInvoiceId == claimInvoiceId);
                if (invoice != null)
                {
                    await _daysOffInvoiceRepository.LoadAsync(invoice, i => i.ClaimInvoice);
                    return Mapper.Map<DaysOffInvoice>(invoice);
                }
                else
                {
                    SqlParameter[] parameters = {
                    new SqlParameter("ClaimInvoiceType", ClaimInvoiceTypeEnum.DaysOffInvoice),
                    new SqlParameter("ClaimInvoiceId", claimInvoiceId)
                };

                    var claimInvoice = await _claimInvoiceRepository.SqlQueryAsync<ClaimInvoice>(DatabaseConstants.ClaimGetRejectedMainInvoice, parameters);

                    SqlParameter[] sqlParams = {
                    new SqlParameter("ClaimInvoiceType", ClaimInvoiceTypeEnum.DaysOffInvoice),
                    new SqlParameter("ClaimInvoiceId", claimInvoiceId)
                };
                    var daysOffInvoice = await _claimInvoiceRepository.SqlQueryAsync<DaysOffInvoice>(DatabaseConstants.ClaimGetRejectedChildInvoice, sqlParams);
                    daysOffInvoice[0].ClaimInvoice = claimInvoice[0];
                    return daysOffInvoice[0];
                }

            }
        }

        public async Task<bool> AddDaysOffInvoice(DaysOffInvoice daysOffInvoice)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_DaysOffInvoice>(daysOffInvoice);

                _daysOffInvoiceRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                await CreateSLA(SLAItemTypeEnum.TotalTemporaryDisability, entity.ClaimInvoiceId);

                if (daysOffInvoice?.ClaimInvoice.ClaimInvoiceRepayReason != null)
                {
                    string textMessage = daysOffInvoice.ClaimInvoice.ClaimInvoiceRepayReason.DisplayAttributeValue();
                    var claim = await _claimRepository.FirstOrDefaultAsync(x => x.ClaimId == daysOffInvoice.ClaimInvoice.ClaimId);
                    await AddingClaimNote(claim.PersonEventId, textMessage, ItemTypeEnum.PersonEvent);
                }

                return true;
            }
        }

        public async Task<bool> AddSundryInvoice(SundryInvoice sundryInvoice)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_SundryInvoice>(sundryInvoice);

                _sundryInvoiceRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                await CreateSLA(SLAItemTypeEnum.SundryInvoice, entity.ClaimInvoiceId);

                if (sundryInvoice?.ClaimInvoice.ClaimInvoiceRepayReason != null)
                {
                    string textMessage = sundryInvoice.ClaimInvoice.ClaimInvoiceRepayReason.DisplayAttributeValue();
                    var claim = await _claimRepository.FirstOrDefaultAsync(x => x.ClaimId == sundryInvoice.ClaimInvoice.ClaimId);
                    await AddingClaimNote(claim.PersonEventId, textMessage, ItemTypeEnum.PersonEvent);
                }

                return true;
            }
        }

        public async Task<bool> AddWidowLumpsumInvoice(WidowLumpSumInvoice widowLumpSumInvoice)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var entity = Mapper.Map<claim_WidowLumpSumInvoice>(widowLumpSumInvoice);

                _widowLumpSumInvoiceRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                await CreateSLA(SLAItemTypeEnum.WidowLumpSumInvoice, entity.ClaimInvoiceId);

                if (widowLumpSumInvoice?.ClaimInvoice.ClaimInvoiceRepayReason != null)
                {
                    string textMessage = widowLumpSumInvoice.ClaimInvoice.ClaimInvoiceRepayReason.DisplayAttributeValue();
                    var claim = await _claimRepository.FirstOrDefaultAsync(x => x.ClaimId == widowLumpSumInvoice.ClaimInvoice.ClaimId);
                    await AddingClaimNote(claim.PersonEventId, textMessage, ItemTypeEnum.PersonEvent);
                }

                return true;
            }
        }

        public async Task<bool> UpdateSundryInvoice(SundryInvoice sundryInvoice)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                Contract.Requires(sundryInvoice != null);

                var entity = await _claimInvoiceRepository.FindByIdAsync(sundryInvoice.ClaimInvoiceId);
                var invoice = await _sundryInvoiceRepository.FindByIdAsync(sundryInvoice.ClaimInvoiceId);

                invoice.Description = sundryInvoice.Description;
                invoice.PayeeTypeId = sundryInvoice.PayeeTypeId;
                invoice.PayeeRolePlayerId = sundryInvoice.PayeeRolePlayerId;

                entity.InvoiceDate = sundryInvoice.ClaimInvoice.InvoiceDate;
                entity.DateReceived = sundryInvoice.ClaimInvoice.DateReceived;
                entity.InvoiceAmount = sundryInvoice.ClaimInvoice.InvoiceAmount;

                _sundryInvoiceRepository.Update(invoice);
                _claimInvoiceRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task<bool> UpdateWidowLumpsumInvoice(WidowLumpSumInvoice widowLumpSumInvoice)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                Contract.Requires(widowLumpSumInvoice != null);

                var entity = await _claimInvoiceRepository.FindByIdAsync(widowLumpSumInvoice.ClaimInvoiceId);
                var wlInvoice = await _widowLumpSumInvoiceRepository.FindByIdAsync(widowLumpSumInvoice.ClaimInvoiceId);

                wlInvoice.Description = widowLumpSumInvoice.Description;
                wlInvoice.PayeeTypeId = widowLumpSumInvoice.PayeeTypeId;
                wlInvoice.PayeeRolePlayerId = widowLumpSumInvoice.PayeeRolePlayerId;

                entity.InvoiceDate = widowLumpSumInvoice.ClaimInvoice.InvoiceDate;
                entity.DateReceived = widowLumpSumInvoice.ClaimInvoice.DateReceived;
                entity.InvoiceAmount = widowLumpSumInvoice.ClaimInvoice.InvoiceAmount;

                _widowLumpSumInvoiceRepository.Update(wlInvoice);
                _claimInvoiceRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task<bool> UpdateDaysOffInvoice(DaysOffInvoice daysOffInvoice)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                Contract.Requires(daysOffInvoice != null);

                var entity = await _claimInvoiceRepository.FindByIdAsync(daysOffInvoice.ClaimInvoiceId);
                var daysOffEntity = await _daysOffInvoiceRepository.FindByIdAsync(daysOffInvoice.ClaimInvoiceId);

                daysOffEntity.Description = daysOffInvoice.Description;
                daysOffEntity.PayeeTypeId = daysOffInvoice.PayeeTypeId;
                daysOffEntity.OtherEmployer = daysOffInvoice.OtherEmployer;
                daysOffEntity.DaysOffFrom = daysOffInvoice.DaysOffFrom;
                daysOffEntity.DaysOffTo = daysOffInvoice.DaysOffTo;
                daysOffEntity.TotalDaysOff = daysOffInvoice.TotalDaysOff;
                daysOffEntity.InvoiceType = daysOffInvoice.InvoiceType;
                daysOffEntity.FinalInvoice = daysOffInvoice.FinalInvoice;

                entity.InvoiceDate = daysOffInvoice.ClaimInvoice.InvoiceDate;
                entity.DateReceived = daysOffInvoice.ClaimInvoice.DateReceived;
                entity.InvoiceAmount = daysOffInvoice.ClaimInvoice.InvoiceAmount;

                _daysOffInvoiceRepository.Update(daysOffEntity);
                _claimInvoiceRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task<bool> UpdateFuneralExpInvoice(FuneralExpenseInvoice funeralExpenseInvoice)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                Contract.Requires(funeralExpenseInvoice != null);

                var entity = await _claimInvoiceRepository.FindByIdAsync(funeralExpenseInvoice.ClaimInvoiceId);
                var funeralInvEntity = await _funeralExpenseInvoiceRepository.FindByIdAsync(funeralExpenseInvoice.ClaimInvoiceId);

                funeralInvEntity.Description = funeralExpenseInvoice.Description;
                funeralInvEntity.PayeeTypeId = funeralExpenseInvoice.PayeeTypeId;
                funeralInvEntity.PayeeRolePlayerId = funeralExpenseInvoice.PayeeRolePlayerId;

                entity.InvoiceDate = funeralExpenseInvoice.ClaimInvoice.InvoiceDate;
                entity.DateReceived = funeralExpenseInvoice.ClaimInvoice.DateReceived;
                entity.InvoiceAmount = funeralExpenseInvoice.ClaimInvoice.InvoiceAmount;

                _funeralExpenseInvoiceRepository.Update(funeralInvEntity);
                _claimInvoiceRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task<bool> UpdatePartialDependencyLumpsumInvoice(FatalPDLumpsumInvoice fatalPDLumpsumInvoice)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                Contract.Requires(fatalPDLumpsumInvoice != null);

                var entity = await _claimInvoiceRepository.FindByIdAsync(fatalPDLumpsumInvoice.ClaimInvoiceId);
                var fatalPDlumpsumEntity = await _fatalPdLumpsumInvoiceRepository.FindByIdAsync(fatalPDLumpsumInvoice.ClaimInvoiceId);

                fatalPDlumpsumEntity.Description = fatalPDLumpsumInvoice.Description;
                fatalPDlumpsumEntity.PayeeTypeId = fatalPDLumpsumInvoice.PayeeTypeId;
                fatalPDlumpsumEntity.Payee = fatalPDLumpsumInvoice.Payee;
                fatalPDlumpsumEntity.NoOfFamilyMembersBeforeDeath = fatalPDLumpsumInvoice.NoOfFamilyMembersBeforeDeath;
                fatalPDlumpsumEntity.NoOfFamilyMembersAfterDeath = fatalPDLumpsumInvoice.NoOfFamilyMembersAfterDeath;
                fatalPDlumpsumEntity.DeceasedContributionToIncome = fatalPDLumpsumInvoice.DeceasedContributionToIncome;
                fatalPDlumpsumEntity.TotalFamilyIncome = fatalPDLumpsumInvoice.TotalFamilyIncome;
                fatalPDlumpsumEntity.AvgIncomePerFamilyMember = fatalPDLumpsumInvoice.AvgIncomePerFamilyMember;

                entity.InvoiceDate = fatalPDLumpsumInvoice.ClaimInvoice.InvoiceDate;
                entity.DateReceived = fatalPDLumpsumInvoice.ClaimInvoice.DateReceived;
                entity.InvoiceAmount = fatalPDLumpsumInvoice.ClaimInvoice.InvoiceAmount;

                _fatalPdLumpsumInvoiceRepository.Update(fatalPDlumpsumEntity);
                _claimInvoiceRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task<bool> DeleteClaimInvoice(int claimInvoiceId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                Contract.Requires(claimInvoiceId != 0);

                var entity = await _claimInvoiceRepository.FindByIdAsync(claimInvoiceId);
                entity.IsDeleted = true;

                switch (entity.ClaimInvoiceType)
                {
                    case ClaimInvoiceTypeEnum.WLSAward:
                        var widowLumpsumInvoice = await _widowLumpSumInvoiceRepository.FindByIdAsync(claimInvoiceId);
                        widowLumpsumInvoice.IsDeleted = true;
                        _widowLumpSumInvoiceRepository.Update(widowLumpsumInvoice);
                        await UpdateSLA(SLAItemTypeEnum.WidowLumpSumInvoice, entity.ClaimInvoiceId, true);
                        break;
                    case ClaimInvoiceTypeEnum.DaysOffInvoice:
                        var ttdInvoice = await _daysOffInvoiceRepository.FindByIdAsync(claimInvoiceId);
                        await SendTTDRejectCommunication(ttdInvoice.PersonEventId, claimInvoiceId);
                        ttdInvoice.IsDeleted = true;
                        _daysOffInvoiceRepository.Update(ttdInvoice);
                        await UpdateSLA(SLAItemTypeEnum.TotalTemporaryDisability, entity.ClaimInvoiceId, true);
                        break;
                    case ClaimInvoiceTypeEnum.SundryInvoice:
                        var sundryInvoice = await _sundryInvoiceRepository.FindByIdAsync(claimInvoiceId);
                        sundryInvoice.IsDeleted = true;
                        _sundryInvoiceRepository.Update(sundryInvoice);
                        await UpdateSLA(SLAItemTypeEnum.SundryInvoice, entity.ClaimInvoiceId, true);
                        break;
                    case ClaimInvoiceTypeEnum.FuneralExpenses:
                        var funeralExpenses = await _funeralExpenseInvoiceRepository.FindByIdAsync(claimInvoiceId);
                        funeralExpenses.IsDeleted = true;
                        _funeralExpenseInvoiceRepository.Update(funeralExpenses);
                        await UpdateSLA(SLAItemTypeEnum.FuneralExpenseInvoice, entity.ClaimInvoiceId, true);
                        break;
                }

                _claimInvoiceRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task<bool> ReinstateClaimInvoice(int claimInvoiceId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                Contract.Requires(claimInvoiceId != 0);

                SqlParameter[] parameters = {
                    new SqlParameter("ClaimInvoiceId", claimInvoiceId)
                };

                await _claimInvoiceRepository.SqlQueryAsync<ClaimInvoice>(DatabaseConstants.ReinstateClaimInvoice, parameters);
                var entity = await _claimInvoiceRepository.FindByIdAsync(claimInvoiceId);

                switch (entity.ClaimInvoiceType)
                {
                    case ClaimInvoiceTypeEnum.WLSAward:
                        await UpdateSLA(SLAItemTypeEnum.WidowLumpSumInvoice, entity.ClaimInvoiceId, false);
                        break;
                    case ClaimInvoiceTypeEnum.DaysOffInvoice:
                        await UpdateSLA(SLAItemTypeEnum.TotalTemporaryDisability, entity.ClaimInvoiceId, false);
                        break;
                    case ClaimInvoiceTypeEnum.SundryInvoice:
                        await UpdateSLA(SLAItemTypeEnum.SundryInvoice, entity.ClaimInvoiceId, false);
                        break;
                    case ClaimInvoiceTypeEnum.FuneralExpenses:
                        await UpdateSLA(SLAItemTypeEnum.FuneralExpenseInvoice, entity.ClaimInvoiceId, false);
                        break;
                }
                return true;
            }
        }

        public async Task<bool> DaysOffInvoiceRejectCommunication(int personEventId, int claimInvoiceId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                Contract.Requires(personEventId != 0);

                await SendTTDRejectCommunication(personEventId, claimInvoiceId);
                return true;
            }
        }

        public async Task<bool> AddFatalPDLumpsumInvoice(FatalPDLumpsumInvoice fatalPDLumpsumInvoice)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_FatalPdLumpsumInvoice>(fatalPDLumpsumInvoice);

                _fatalPdLumpsumInvoiceRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                await CreateSLA(SLAItemTypeEnum.PartialDependencyLumpsum, entity.ClaimInvoiceId);

                if (fatalPDLumpsumInvoice?.ClaimInvoice.ClaimInvoiceRepayReason != null)
                {
                    string textMessage = fatalPDLumpsumInvoice.ClaimInvoice.ClaimInvoiceRepayReason.DisplayAttributeValue();
                    var claim = await _claimRepository.FirstOrDefaultAsync(x => x.ClaimId == fatalPDLumpsumInvoice.ClaimInvoice.ClaimId);
                    await AddingClaimNote(claim.PersonEventId, textMessage, ItemTypeEnum.PersonEvent);
                }

                return true;
            }
        }

        public async Task<bool> AddFuneralExpenseInvoice(FuneralExpenseInvoice funeralExpenseInvoice)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var entity = Mapper.Map<claim_FuneralExpenseInvoice>(funeralExpenseInvoice);

                _funeralExpenseInvoiceRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                await CreateSLA(SLAItemTypeEnum.FuneralExpenseInvoice, entity.ClaimInvoiceId);

                if (funeralExpenseInvoice.ClaimInvoice.ClaimInvoiceRepayReason != null)
                {
                    string textMessage = funeralExpenseInvoice.ClaimInvoice.ClaimInvoiceRepayReason.DisplayAttributeValue();
                    var claim = await _claimRepository.FirstOrDefaultAsync(x => x.ClaimId == funeralExpenseInvoice.ClaimInvoice.ClaimId);
                    await AddingClaimNote(claim.PersonEventId, textMessage, ItemTypeEnum.PersonEvent);
                }

                return true;
            }
        }

        public async Task<bool> AddTravelInvoice(TravelInvoice travelInvoice)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_TravelInvoice>(travelInvoice);

                _travelInvoiceRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                await CreateSLA(SLAItemTypeEnum.TravelExpenseInvoice, entity.ClaimInvoiceId);

                return true;
            }
        }

        public async Task<List<ClaimDisabilityAssessment>> GetClaimDisabilityAssessment(int PersonEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {

                var claimDisabilityAssessment = await _claimDisabilityAssessmentRepository.Where(d => d.PersonEventId == PersonEventId).ToListAsync();

                return Mapper.Map<List<ClaimDisabilityAssessment>>(claimDisabilityAssessment);

            }
        }

        public async Task<ClaimDisabilityAssessment> GetClaimDisabilityAssessmentById(int claimDisabilityAssessmentId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claimDisabilityAssessment = await _claimDisabilityAssessmentRepository.FirstOrDefaultAsync(d => d.ClaimDisabilityAssessmentId == claimDisabilityAssessmentId);
                return Mapper.Map<ClaimDisabilityAssessment>(claimDisabilityAssessment);
            }
        }

        public async Task<int> AddClaimDisabilityAssessment(ClaimDisabilityAssessment claimDisabilityAssessment)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {

                Contract.Requires(claimDisabilityAssessment != null);
                var entity = Mapper.Map<claim_ClaimDisabilityAssessment>(claimDisabilityAssessment);
                _claimDisabilityAssessmentRepository.Create(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.ClaimDisabilityAssessmentId;
            }
        }

        public async Task<bool> AddTravelAuthorisation(TravelAuthorisation travelAuthorisation)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_TravelAuthorisation>(travelAuthorisation);

                _travelAuthorisationRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task<List<TravelAuthorisedParty>> GetTravelAuthorisedParties()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _travelAuthorisedPartyRepository.ToListAsync();
                return Mapper.Map<List<TravelAuthorisedParty>>(entities);
            }
        }

        public async Task<List<TravelRateType>> GetTravelRateTypes()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _travelRateTypeRepository.ToListAsync();
                return Mapper.Map<List<TravelRateType>>(entities);
            }
        }

        public async Task<List<ClaimBenefitType>> GetClaimBenefitTypes()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _claimBenefitTypeRepository.ToListAsync();
                return Mapper.Map<List<ClaimBenefitType>>(entities);
            }
        }

        public async Task<ClaimEstimate> AddClaimEstimate(ClaimEstimate claimEstimate)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_ClaimEstimate>(claimEstimate);

                _claimEstimateRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return Mapper.Map<ClaimEstimate>(claimEstimate);
            }
        }

        public async Task<List<ClaimEstimate>> AddClaimEstimatesV2(List<ClaimEstimate> claimEstimates)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entities = Mapper.Map<List<claim_ClaimEstimate>>(claimEstimates);

                _claimEstimateRepository.Create(entities);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return Mapper.Map<List<ClaimEstimate>>(entities);
            }
        }

        public async Task<List<ClaimEstimate>> UpdateClaimEstimatesV2(List<ClaimEstimate> claimEstimates)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entities = Mapper.Map<List<claim_ClaimEstimate>>(claimEstimates);

                _claimEstimateRepository.Update(entities);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return Mapper.Map<List<ClaimEstimate>>(entities);
            }
        }

        public async Task<bool> AddClaimEstimates(List<Benefit> benefits, int personEventId)
        {
            Contract.Requires(benefits != null);

            var claimEstimates = new List<ClaimEstimate>();

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var personEvent = await _eventService.GetPersonEvent(personEventId);
                var personEventEarnings = await _claimEarningService.GetEarningsByPersonEventId(personEventId);

                var results = await _claimRepository.Where(c => c.PersonEventId == personEvent.PersonEventId).ToListAsync();
                await _claimRepository.LoadAsync(results, c => c.ClaimBenefits);
                var mappedClaims = Mapper.Map<List<Contracts.Entities.Claim>>(results);

                var actualAccidentEarnings = personEventEarnings?.LastOrDefault(x => x.EarningsType == EarningsTypeEnum.Accident && x.IsVerified);
                var estimatedAccidentEarnings = personEventEarnings.LastOrDefault(x => x.EarningsType == EarningsTypeEnum.Accident && x.IsEstimated);
                var earning = actualAccidentEarnings ?? estimatedAccidentEarnings;

                var topRankedEstimateAmount = (bool)personEvent.IsFatal
                                ? await GetTopRankedEstimatesFromPhysicalInjury(personEvent)
                                : await GetTopRankedEstimatesFromMedicalReport(personEvent);

                foreach (var benefit in benefits)
                {
                    var claimId = mappedClaims.SelectMany(claim => claim.ClaimBenefits)
                                    .Where(cb => cb.BenefitId == benefit.Id)
                                    .Select(cb => (int?)cb.ClaimId)
                                    .FirstOrDefault();

                    var claimEstimate = await CalculateClaimEstimateValue(benefit, earning, topRankedEstimateAmount);

                    var estimateType = (EstimateTypeEnum?)benefit.EstimateTypeId;

                    claimEstimate.PersonEventId = personEvent.PersonEventId;
                    claimEstimate.EstimateType = estimateType;
                    claimEstimate.BenefitId = benefit.Id;

                    claimEstimate.EstimatePd = (estimateType == EstimateTypeEnum.PDLumpSum || estimateType == EstimateTypeEnum.PDPension)
                                                ? Convert.ToInt32(topRankedEstimateAmount?.PDExtentEstimate)
                                                : 0;
                    claimEstimate.EstimatedDaysOff = (estimateType == EstimateTypeEnum.ShiftLoss
                                                || estimateType == EstimateTypeEnum.TPD
                                                || estimateType == EstimateTypeEnum.TTD)
                                                ? topRankedEstimateAmount?.DaysOffEstimate ?? 0
                                                : 0;
                    claimEstimate.Notes = $"Estimate for this person Event: {personEvent.PersonEventReferenceNumber}";
                    claimEstimate.EarningsId = earning.EarningId;
                    claimEstimate.ClaimId = claimId;

                    claimEstimates.Add(claimEstimate);
                }
            }

            if (claimEstimates?.Count > 0)
            {
                await AddClaimEstimatesV2(claimEstimates);
            }

            return true;
        }

        public async Task<List<ClaimEstimate>> ReCalculateAllClaimEstimates(PersonEvent personEvent, bool isMedicalReportOverride)
        {
            Contract.Requires(personEvent != null);

            var claimEstimates = new List<ClaimEstimate>();

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                claimEstimates = await GetClaimEstimateByPersonEventId(personEvent.PersonEventId);
                var personEventEarnings = await _claimEarningService.GetEarningsByPersonEventId(personEvent.PersonEventId);
                var _event = await _eventService.GetEvent(personEvent.EventId);

                var actualAccidentEarnings = personEventEarnings?.LastOrDefault(x => x.EarningsType == EarningsTypeEnum.Accident && x.IsVerified);
                var estimatedAccidentEarnings = personEventEarnings.LastOrDefault(x => x.EarningsType == EarningsTypeEnum.Accident && x.IsEstimated);

                var topRankedEstimateAmount = (bool)personEvent.IsFatal
                                ? await GetTopRankedEstimatesFromPhysicalInjury(personEvent)
                                : await GetTopRankedEstimatesFromMedicalReport(personEvent);

                var earning = actualAccidentEarnings ?? estimatedAccidentEarnings;

                foreach (var claimEstimate in claimEstimates)
                {
                    if (isMedicalReportOverride)
                    {
                        claimEstimate.EstimatePd = claimEstimate.EstimateType == EstimateTypeEnum.PDLumpSum || claimEstimate.EstimateType == EstimateTypeEnum.PDPension ? Convert.ToInt32(topRankedEstimateAmount.PDExtentEstimate) : claimEstimate.EstimatePd;
                        claimEstimate.EstimatedDaysOff = claimEstimate.EstimateType == EstimateTypeEnum.DaysOff || claimEstimate.EstimateType == EstimateTypeEnum.TTD || claimEstimate.EstimateType == EstimateTypeEnum.TPD ? topRankedEstimateAmount.DaysOffEstimate : claimEstimate.EstimatedDaysOff;
                    }

                    topRankedEstimateAmount.PDExtentEstimate = claimEstimate.EstimatePd > 0 ? claimEstimate.EstimatePd : topRankedEstimateAmount.PDExtentEstimate;
                    topRankedEstimateAmount.DaysOffEstimate = claimEstimate.EstimatedDaysOff > 0 ? claimEstimate.EstimatedDaysOff : topRankedEstimateAmount.DaysOffEstimate;

                    var benefit = await _benefitService.GetBenefitAtEffectiveDate(Convert.ToInt32(claimEstimate.BenefitId), _event.EventDate);

                    var result = await CalculateClaimEstimateValue(benefit, earning, topRankedEstimateAmount);

                    claimEstimate.EstimatedValue = result.EstimatedValue;
                    claimEstimate.CalcOperands = result.CalcOperands;
                }
            }

            return await UpdateClaimEstimatesV2(claimEstimates);
        }

        public async Task<List<ClaimEstimate>> ReCalculateTTDClaimEstimates(PersonEvent personEvent)
        {
            Contract.Requires(personEvent != null);

            var claimEstimates = new List<ClaimEstimate>();

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var _event = await _eventService.GetEvent(personEvent.EventId);
                claimEstimates = await GetClaimEstimateByPersonEventId(personEvent.PersonEventId);
                claimEstimates.RemoveAll(s => s.EstimateType != EstimateTypeEnum.TTD && s.EstimateType != EstimateTypeEnum.DaysOff && s.EstimateType != EstimateTypeEnum.TPD);

                var personEventEarnings = await _claimEarningService.GetEarningsByPersonEventId(personEvent.PersonEventId);

                var earning = personEventEarnings?.LastOrDefault(x => x.EarningsType == EarningsTypeEnum.Current && x.IsVerified);

                var topRankedEstimateAmount = (bool)personEvent.IsFatal
                                ? await GetTopRankedEstimatesFromPhysicalInjury(personEvent)
                                : await GetTopRankedEstimatesFromMedicalReport(personEvent);

                foreach (var claimEstimate in claimEstimates)
                {
                    topRankedEstimateAmount.DaysOffEstimate = claimEstimate.EstimatedDaysOff > 0 ? claimEstimate.EstimatedDaysOff : topRankedEstimateAmount.DaysOffEstimate;

                    var benefit = await _benefitService.GetBenefitAtEffectiveDate(Convert.ToInt32(claimEstimate.BenefitId), _event.EventDate);

                    var result = await CalculateClaimEstimateValue(benefit, earning, topRankedEstimateAmount);
                    claimEstimate.EstimatedValue = result.EstimatedValue;
                    claimEstimate.CalcOperands = result.CalcOperands;
                }
            }

            return await UpdateClaimEstimatesV2(claimEstimates);
        }

        public async Task<List<ClaimEstimate>> ReCalculatePDClaimEstimates(PersonEvent personEvent)
        {
            Contract.Requires(personEvent != null);

            var claimEstimates = new List<ClaimEstimate>();

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var _event = await _eventService.GetEvent(personEvent.EventId);

                claimEstimates = await GetClaimEstimateByPersonEventId(personEvent.PersonEventId);
                claimEstimates.RemoveAll(s => s.EstimateType != EstimateTypeEnum.PDPension && s.EstimateType != EstimateTypeEnum.PDLumpSum);

                var personEventEarnings = await _claimEarningService.GetEarningsByPersonEventId(personEvent.PersonEventId);

                var earning = personEventEarnings?.LastOrDefault(x => x.EarningsType == EarningsTypeEnum.FutureProbable && x.IsVerified);

                var topRankedEstimateAmount = await GetTopRankedEstimatesFromMedicalReport(personEvent);

                foreach (var claimEstimate in claimEstimates)
                {
                    topRankedEstimateAmount.PDExtentEstimate = claimEstimate.EstimatePd > 0 ? claimEstimate.EstimatePd : topRankedEstimateAmount.PDExtentEstimate;

                    var benefit = await _benefitService.GetBenefitAtEffectiveDate(Convert.ToInt32(claimEstimate.BenefitId), _event.EventDate);

                    var result = await CalculateClaimEstimateValue(benefit, earning, topRankedEstimateAmount);
                    claimEstimate.EstimatedValue = result.EstimatedValue;
                    claimEstimate.CalcOperands = result.CalcOperands;
                }
            }

            return await UpdateClaimEstimatesV2(claimEstimates);
        }

        public async Task<List<ClaimEstimate>> ReCalculateClaimEstimates(List<ClaimEstimate> claimEstimates)
        {
            Contract.Requires(claimEstimates != null);

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var personEventId = Convert.ToInt32(claimEstimates.FirstOrDefault()?.PersonEventId);

                var personEvent = await _eventService.GetPersonEvent(personEventId);
                var personEventEarnings = await _claimEarningService.GetEarningsByPersonEventId(personEventId);

                var actualAccidentEarnings = personEventEarnings?.LastOrDefault(x => x.EarningsType == EarningsTypeEnum.Accident && x.IsVerified);
                var estimatedAccidentEarnings = personEventEarnings.LastOrDefault(x => x.EarningsType == EarningsTypeEnum.Accident && x.IsEstimated);

                var topRankedEstimateAmount = await GetTopRankedEstimatesFromMedicalReport(personEvent);

                var earning = actualAccidentEarnings ?? estimatedAccidentEarnings;

                var requiresPDPensionConversion = claimEstimates.FirstOrDefault(s => s.EstimatePd > 30 && s.EstimateType == EstimateTypeEnum.PDLumpSum);
                var requiresPDLumpConversion = claimEstimates.FirstOrDefault(s => s.EstimatePd <= 30 && s.EstimateType == EstimateTypeEnum.PDPension);

                var _event = await _eventService.GetEvent(personEvent.EventId);

                if (requiresPDPensionConversion != null || requiresPDLumpConversion != null)
                {
                    var convertedEstimate = requiresPDPensionConversion != null ? requiresPDPensionConversion : requiresPDLumpConversion;

                    foreach (var claim in personEvent.Claims)
                    {
                        var policy = await _policyService.GetPolicy(Convert.ToInt32(claim.PolicyId));
                        var benefits = await _policyService.GetBenefitsForProductOptionAtEffectiveDate(policy.ProductOptionId, _event.EventDate);
                        var index = requiresPDPensionConversion != null ? benefits.FindIndex(s => s.EstimateTypeId == Convert.ToInt32(EstimateTypeEnum.PDPension)) : benefits.FindIndex(s => s.EstimateTypeId == Convert.ToInt32(EstimateTypeEnum.PDLumpSum));
                        if (index > -1)
                        {
                            convertedEstimate.EstimateType = requiresPDPensionConversion != null ? EstimateTypeEnum.PDPension : EstimateTypeEnum.PDLumpSum;
                            convertedEstimate.BenefitId = benefits[index].Id;
                        }
                    }
                }

                foreach (var claimEstimate in claimEstimates)
                {
                    topRankedEstimateAmount.PDExtentEstimate = claimEstimate.EstimatePd > 0 ? claimEstimate.EstimatePd : topRankedEstimateAmount.PDExtentEstimate;
                    topRankedEstimateAmount.DaysOffEstimate = claimEstimate.EstimatedDaysOff > 0 ? claimEstimate.EstimatedDaysOff : topRankedEstimateAmount.DaysOffEstimate;

                    var benefit = await _benefitService.GetBenefitAtEffectiveDate(Convert.ToInt32(claimEstimate.BenefitId), _event.EventDate);

                    var result = await CalculateClaimEstimateValue(benefit, earning, topRankedEstimateAmount);
                    claimEstimate.EstimatedValue = result.EstimatedValue;
                    claimEstimate.CalcOperands = result.CalcOperands;
                }
            }

            return await UpdateClaimEstimatesV2(claimEstimates);
        }

        public async Task<ClaimEstimate> CalculateClaimEstimateValue(Benefit benefit, Earning earning, TopRankedEstimateAmount topRankedEstimate)
        {
            Contract.Requires(benefit != null);
            Contract.Requires(topRankedEstimate != null);

            ClaimEstimate claimEstimate = new ClaimEstimate();

            decimal accidentEarnings = Convert.ToDecimal(earning?.Total);
            if (benefit?.EstimateTypeId == null)
            {
                claimEstimate.EstimatedValue = Convert.ToDecimal(benefit.MinCompensationAmount);
                return await Task.FromResult(claimEstimate);
            }

            BenefitCompensationAmount benefitCompensationAmount = null;
            BenefitEarningsRangeCalcs benefitEarningsAmount = null;

            decimal earningsAllocation = benefit.BenefitEarningsRangeCalcs.Find(x => x.BenefitId == benefit.Id)?.EarningsAllocation ?? 0.75M;
            decimal earningsMultiplier = benefit.BenefitEarningsRangeCalcs.Find(x => x.BenefitId == benefit.Id)?.EarningsMultiplier ?? 2;
            decimal estimateValue;

            benefitCompensationAmount = benefit.BenefitCompensationAmounts?.FirstOrDefault();
            var minCompensation = benefitCompensationAmount != null ? Convert.ToDecimal(benefitCompensationAmount.MinCompensationAmount) : Convert.ToDecimal(benefit.MinCompensationAmount);
            var maxCompensation = benefitCompensationAmount != null ? Convert.ToDecimal(benefitCompensationAmount.MaxCompensationAmount) : Convert.ToDecimal(benefit.MaxCompensationAmount);

            var minEarnings = 0.00m;
            var maxEarnings = 0.00m;

            benefitEarningsAmount = benefit.BenefitEarningsRangeCalcs?.FirstOrDefault(calc => calc.BenefitId == benefit.Id);
            if (benefitEarningsAmount != null)
            {
                minEarnings = Convert.ToDecimal(benefitEarningsAmount.MinEarnings);
                maxEarnings = Convert.ToDecimal(benefitEarningsAmount.MaxEarnings);
            }

            var commonCompensationInfo = $" | Compensation threshold: Min: {minCompensation}, Max: {maxCompensation}";
            var commonEarningsInfo = $" | Earnings threshold: Min: {minEarnings}, Max: {maxEarnings}";

            switch ((EstimateTypeEnum?)benefit.EstimateTypeId)
            {
                case EstimateTypeEnum.ShiftLoss:
                case EstimateTypeEnum.TPD:
                case EstimateTypeEnum.TTD:
                    // ensure accident earnings does not exceed max earnings.
                    accidentEarnings = Math.Max(minEarnings, Math.Min(accidentEarnings, maxEarnings));

                    #region calculate for TTDs: (0.75 * AccidentEarnings * DaysOff)/30.3333
                    estimateValue = earningsAllocation * accidentEarnings * Convert.ToDecimal(topRankedEstimate.DaysOffEstimate) / 30.33333M;
                    claimEstimate.CalcOperands = $"Benefit Formula: ({earningsAllocation} * {accidentEarnings} * {Convert.ToDecimal(topRankedEstimate.DaysOffEstimate)})/30.3333 = {Math.Round(estimateValue, 2)} " +
                                                 $"| Calculation: (AccidentEarnings * EarningsAllocation * (DaysOff)/30.3333)" +
                                                 commonCompensationInfo + commonEarningsInfo;
                    break;
                #endregion
                case EstimateTypeEnum.PDPension:
                    // ensure accident earnings does not exceed max earnings.
                    accidentEarnings = Math.Max(minEarnings, Math.Min(accidentEarnings, maxEarnings));

                    #region calculate for PD pension (31%-100%)
                    estimateValue = earningsAllocation * accidentEarnings * (Convert.ToDecimal(topRankedEstimate.PDExtentEstimate) / 100);
                    claimEstimate.CalcOperands = $"Benefit Formula: ({earningsAllocation} * {accidentEarnings} * ({Convert.ToDecimal(topRankedEstimate.PDExtentEstimate) / 100})) = {Math.Round(estimateValue, 2)} " +
                                                 $"| Calculation: (AccidentEarnings * EarningsAllocation * (PdPercentage)/100)" +
                                                 commonCompensationInfo + commonEarningsInfo;
                    break;
                #endregion
                case EstimateTypeEnum.WidowsLumpSum:
                    // ensure accident earnings does not exceed max earnings.
                    accidentEarnings = Math.Max(minEarnings, Math.Min(accidentEarnings, maxEarnings));

                    #region calculate Widows Lump Sum: (AccidentEarnings * 0.75 * 2)
                    estimateValue = accidentEarnings * earningsAllocation * earningsMultiplier;
                    claimEstimate.CalcOperands = $"Benefit Formula: ({accidentEarnings} * {earningsAllocation} * {earningsMultiplier}) = {Math.Round(estimateValue, 2)} " +
                                                 $"| Calculation: (AccidentEarnings * EarningsAllocation * Multiplier)" +
                                                 commonCompensationInfo + commonEarningsInfo;
                    break;
                #endregion
                case EstimateTypeEnum.PDLumpSum:
                    // ensure accident earnings does not exceed max earnings.
                    accidentEarnings = Math.Max(minEarnings, Math.Min(accidentEarnings, maxEarnings));

                    #region calculate PD lump sum: (AccidentEarnings [capped between min and max earnings] * 15 * (PdPercentage))/30
                    estimateValue = accidentEarnings * earningsMultiplier * Convert.ToDecimal(topRankedEstimate.PDExtentEstimate) / 30;
                    claimEstimate.CalcOperands = $"Benefit Formula: ({accidentEarnings} [capped between min and max earnings] * {earningsMultiplier} * {Convert.ToDecimal(topRankedEstimate.PDExtentEstimate)})/30 = {Math.Round(estimateValue, 2)} " +
                                                 $"| Calculation: (AccidentEarnings [capped between min and max earnings] * Multiplier * (PdPercentage))/30" +
                                                 commonCompensationInfo + commonEarningsInfo;
                    break;
                #endregion
                case EstimateTypeEnum.FtlPenPrimry:
                case EstimateTypeEnum.FamilyAllow3:
                    #region calculate funeral family: (AccidentEarnings * 0.75 * 2)
                    estimateValue = accidentEarnings * earningsAllocation * earningsMultiplier;
                    claimEstimate.CalcOperands = $"Benefit Formula: ({accidentEarnings} * {earningsAllocation} * {earningsMultiplier}) = {Math.Round(estimateValue, 2)} " +
                                                 $"| Calculation: (AccidentEarnings * EarningsAllocation * Multiplier)" +
                                                 commonCompensationInfo;
                    break;
                #endregion
                case EstimateTypeEnum.Medical:
                    #region calculate medical cost: (MedicalCostEstimate)
                    estimateValue = Convert.ToDecimal(topRankedEstimate.MedicalCostEstimate);
                    break;
                #endregion
                case EstimateTypeEnum.Sundry:
                    #region calculate sundry cost: (SundryCostEstimate)
                    estimateValue = maxCompensation;
                    claimEstimate.CalcOperands = commonCompensationInfo;
                    break;
                #endregion
                default:
                    estimateValue = minCompensation;
                    break;
            }

            // checks if the estimated value is below the minimum allowed compensation, then set minimum compensation
            // otherwise, check if the estimated value exceeds the maximum allowed compensation, then set maximum compensation
            estimateValue = Math.Max(minCompensation, Math.Min(estimateValue, maxCompensation));

            claimEstimate.EstimatedValue = Math.Round(estimateValue, 2);

            return await Task.FromResult(claimEstimate);
        }

        public async Task<ClaimEstimate> GetClaimEstimateByClaimEstimateId(int claimEstimateId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _claimEstimateRepository.FirstOrDefaultAsync(t => t.ClaimEstimateId == claimEstimateId);
                return Mapper.Map<ClaimEstimate>(entity);
            }
        }

        public async Task<bool> UpdateClaimEstimate(ClaimEstimate claimEstimate)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var entity = Mapper.Map<claim_ClaimEstimate>(claimEstimate);

                _claimEstimateRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task<bool> RejectTTD(DaysOffInvoice daysOffInvoice)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _daysOffInvoiceRepository.FirstOrDefaultAsync(i => i.ClaimInvoiceId == daysOffInvoice.ClaimInvoiceId);
                var personEventEntity = await _personEventRepository.FirstOrDefaultAsync(i => i.PersonEventId == daysOffInvoice.PersonEventId);

                var mappedPersonEvent = Mapper.Map<PersonEvent>(personEventEntity);
                var text = $"TTD rejected for personevent {daysOffInvoice.PersonEventId}";

                await SendCommunication(mappedPersonEvent, TemplateTypeEnum.TTDRejected, text, ClaimCommunicationTypeEnum.TTDRejected, SystemSettings.TTDRejected);

                entity.FinalInvoice = daysOffInvoice.FinalInvoice;
                _daysOffInvoiceRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task<bool> SendPdPaidCloseletter(int personEventId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {

                var personEventEntity = await _personEventRepository.FirstOrDefaultAsync(i => i.PersonEventId == personEventId);

                var mappedPersonEvent = Mapper.Map<PersonEvent>(personEventEntity);
                var text = $"PD is paid and closed for this personevent {personEventId}";

                await SendCommunication(mappedPersonEvent, TemplateTypeEnum.PdPaidCloseLetter, text, ClaimCommunicationTypeEnum.PdPaidCloseLetter, SystemSettings.PdPaidCloseLetterFileName);

                return true;
            }
        }

        public async Task<bool> SendPdApprovedLetter(int personEventId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var personEventEntity = await _personEventRepository.FirstOrDefaultAsync(i => i.PersonEventId == personEventId);

                var mappedPersonEvent = Mapper.Map<PersonEvent>(personEventEntity);
                var text = $"PD has been approved for this personevent {personEventId}";

                await SendCommunication(mappedPersonEvent, TemplateTypeEnum.PDApprovedLetter, text, ClaimCommunicationTypeEnum.PdApprovedLetter, SystemSettings.PdApprovedFileName);

                return true;
            }
        }

        public async Task<bool> SendCommunication(PersonEvent personEvent, TemplateTypeEnum templateTypeEnum, string textMessage, ClaimCommunicationTypeEnum claimCommunicationTypeEnum, string smsKey)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEvent.PersonEventId);
                string claimNumber = claimEntity.ClaimReferenceNumber;
                ClaimSMS claimSMS = new ClaimSMS();

                SqlParameter[] parameters = {
                    new SqlParameter("PersonEventId", personEvent.PersonEventId)
                    };

                var claimDetails = await _personEventRepository.SqlQueryAsync<AutoAjudicateClaim>(DatabaseConstants.GetClaimToAcknowledge, parameters);
                var claimEmail = await GenerateNotification(claimDetails[0], templateTypeEnum);

                var employee = await _rolePlayerService.GetPerson(personEvent.InsuredLifeId);
                var employeeContact = await _rolePlayerService.GetRolePlayerContactDetails(personEvent.InsuredLifeId);
                var employeeContactInformation = employeeContact.Count > 0 ? employeeContact.Where(r => r.CommunicationType == CommunicationTypeEnum.SMS).FirstOrDefault() : null;
                if (employeeContactInformation != null && !string.IsNullOrWhiteSpace(employeeContactInformation.ContactNumber))
                {
                    claimSMS = await GenerateSMS(claimDetails[0], employeeContactInformation.ContactNumber, templateTypeEnum);
                }
                var rolePlayerContacts = await _rolePlayerService.GetRolePlayerContactDetails((int)personEvent.CompanyRolePlayerId);
                var rolePlayerContactInformation = rolePlayerContacts.Count > 0 ? rolePlayerContacts.Where(r => r.RolePlayerContactInformations.Any(b => b.ContactInformationType == ContactInformationTypeEnum.Claims)).FirstOrDefault() : null;
                var contactInformation = employeeContact.Count > 0 ? employeeContact.Where(r => r.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact).FirstOrDefault() : null;

                if (rolePlayerContactInformation != null)
                {
                    claimEmail.EmailAddress = rolePlayerContactInformation.EmailAddress;
                }
                if (templateTypeEnum != TemplateTypeEnum.PdPaidCloseLetter)
                {
                    await AddingClaimNote(personEvent.PersonEventId, textMessage, ItemTypeEnum.PersonEvent);
                }

                await _claimCommunicationService.SendNotification(claimEmail, null, null, claimNumber, contactInformation, claimCommunicationTypeEnum);

                if (contactInformation != null)
                {
                    if (contactInformation.CommunicationType == CommunicationTypeEnum.Email)
                    {
                        await _claimCommunicationService.SendNotification(claimEmail, null, employee, claimNumber, null, claimCommunicationTypeEnum);
                    }
                    else if (contactInformation.CommunicationType == CommunicationTypeEnum.SMS)
                    {
                        var smsMessage = (await _configurationService.GetModuleSetting(smsKey));
                        smsMessage = smsMessage.Replace("{0}", claimEntity.ClaimReferenceNumber);
                        await _claimCommunicationService.SendNotificationSMS(claimSMS, smsMessage);
                    }
                }
                return true;
            }
        }

        public async Task<List<ClaimEstimate>> GetClaimEstimateByPersonEventId(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _claimEstimateRepository.Where(s => s.PersonEventId == personEventId).ToListAsync();
                return Mapper.Map<List<ClaimEstimate>>(entities);
            }

        }

        public async Task<ClaimInvoice> GetClaimInvoiceByClaimInvoiceId(int claimInvoiceId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _claimInvoiceRepository.FirstOrDefaultAsync(a => a.ClaimInvoiceId == claimInvoiceId);
                return Mapper.Map<ClaimInvoice>(entity);

            }
        }

        public async Task<List<ClaimInvoice>> GetClaimInvoicesByClaimId(int claimId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claimInvoices = await _claimInvoiceRepository.Where(a => a.ClaimId == claimId).ToListAsync();
                return Mapper.Map<List<ClaimInvoice>>(claimInvoices);

            }
        }

        public async Task<bool> CreateEstimates(Earning earningModel, int policyId)
        {
            Contract.Requires(earningModel != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var benefitDetails = await _policyService.GetProductByPolicyId(policyId);
                var claimEntity = await _claimRepository.FirstOrDefaultAsync(c => c.PersonEventId == earningModel.PersonEventId);
                var personEvent = await _personEventRepository.FirstOrDefaultAsync(c => c.PersonEventId == earningModel.PersonEventId);
                var firstMedicalReport = await _accidentService.GetFirstMedicalReportForm(earningModel.PersonEventId);
                var eventDetail = await _eventService.GetEvent(personEvent.EventId);
                var estimates = await _medicalEstimatesService.GetICD10Estimates(new ICD10EstimateFilter { EventType = eventDetail.EventType, Icd10Codes = firstMedicalReport?.MedicalReportForm.Icd10Codes, ReportDate = firstMedicalReport.MedicalReportForm.ReportDate });
                var eventInjury = await _eventService.GetPersonEventInjuryDetails(personEvent.PersonEventId);


                foreach (var benefit in benefitDetails.Benefits)
                {
                    var benefitFormula = await GetClaimBenefitFormulaByBenefitId(benefit.Id);

                    if (benefitFormula != null)
                    {
                        ClaimEstimate claimEstimate = new ClaimEstimate
                        {
                            PersonEventId = earningModel.PersonEventId,
                            EarningsId = earningModel.EarningId,
                            EstimateType = (EstimateTypeEnum)benefitFormula.ClaimEstimateTypeId.Value,
                            BenefitId = benefit.Id
                        };

                        if (((claimEstimate.EstimateType == EstimateTypeEnum.WidowsLumpSum || claimEstimate.EstimateType == EstimateTypeEnum.Funeral) && (bool)personEvent.IsFatal)
                            || (claimEstimate.EstimateType != EstimateTypeEnum.WidowsLumpSum && claimEstimate.EstimateType != EstimateTypeEnum.Funeral))
                        {
                            if (claimEntity.ClaimStatus != ClaimStatusEnum.Submitted && firstMedicalReport?.FirstMedicalReportFormId > 0)
                            {


                                if (claimEstimate.EstimateType == EstimateTypeEnum.DaysOff)
                                {
                                    claimEstimate.EstimatedDaysOff = benefitFormula.EstimatedDaysOff;
                                }

                                var formula = benefitFormula.Formula;
                                var Tokens = new Dictionary<string, string>
                                {
                                    ["AccidentEarnings"] = $"{earningModel.Total}",
                                    ["DaysOff"] = $"{claimEstimate.EstimatedDaysOff}",
                                    ["PdPercentage"] = $"{claimEntity.DisabilityPercentage}"
                                };

                                foreach (var token in Tokens)
                                {
                                    formula = formula.Replace($"{token.Key}", token.Value);
                                }

                                formula = formula.Replace(",", ".");

                                DataTable table = new DataTable();
                                DataColumn dataColumn = new DataColumn("expression", typeof(Double), formula);
                                table.Columns.Add(dataColumn);
                                DataRow dataRow = table.NewRow();
                                table.Rows.Add(dataRow);

                                double results = Convert.ToDouble(dataRow["expression"]);
                                claimEstimate.EstimatedExtent = (decimal)results;
                                claimEstimate.EstimatedValue = (decimal)results;

                                var entity = Mapper.Map<claim_ClaimEstimate>(claimEstimate);

                                var existingEstimate = await GetClaimEstimateByPersonEventId(personEvent.PersonEventId, benefit.Id);

                                if (existingEstimate != null)
                                {
                                    existingEstimate.EstimatedExtent = (decimal)results;
                                    existingEstimate.EstimatedValue = (decimal)results;
                                    var existingEntity = Mapper.Map<claim_ClaimEstimate>(existingEstimate);

                                    _claimEstimateRepository.Update(existingEntity);
                                }
                                else if ((bool)personEvent.IsFatal)
                                {
                                    if (claimEstimate.EstimateType == EstimateTypeEnum.Sundry || claimEstimate.EstimateType == EstimateTypeEnum.Funeral
                                        || claimEstimate.EstimateType == EstimateTypeEnum.DaysOff || claimEstimate.EstimateType == EstimateTypeEnum.Medical
                                        || claimEstimate.EstimateType == EstimateTypeEnum.FtlPenPrimry)
                                    {
                                        _claimEstimateRepository.Create(entity);
                                    }
                                }

                                else if (benefitFormula.EventType != EventTypeEnum.Death)
                                {
                                    var medicalCostEstimates = await GetICD10MedicalEstimates(estimates, (InjurySeverityTypeEnum)eventInjury.PhysicalDamages[0].Injuries[0].InjurySeverityType);
                                    var estimatedDays = await GetICD10DaysEstimates(estimates, (InjurySeverityTypeEnum)eventInjury.PhysicalDamages[0].Injuries[0].InjurySeverityType);
                                    var estimatedPd = await GetICD10PDPercentageEstimates(estimates, (InjurySeverityTypeEnum)eventInjury.PhysicalDamages[0].Injuries[0].InjurySeverityType);

                                    switch (claimEstimate.EstimateType)
                                    {
                                        case EstimateTypeEnum.DaysOff:
                                            entity.EstimatedDaysOff = estimatedDays;
                                            _claimEstimateRepository.Create(entity);
                                            break;
                                        case EstimateTypeEnum.Medical:
                                            _claimEstimateRepository.Create(entity);
                                            break;
                                        case EstimateTypeEnum.PDLumpSum:
                                            _claimEstimateRepository.Create(entity);
                                            break;
                                        case EstimateTypeEnum.PDPension:
                                            entity.EstimatePd = estimatedPd;
                                            _claimEstimateRepository.Create(entity);
                                            break;

                                        default:
                                            break;
                                    }

                                }

                            }
                        }

                    }
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);
                return true;
            }
        }

        public async Task<ClaimEstimate> GetClaimEstimateByPersonEventId(int personEventId, int benefitId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _claimEstimateRepository.FirstOrDefaultAsync(t => t.PersonEventId == personEventId && t.BenefitId == benefitId);
                return Mapper.Map<ClaimEstimate>(entity);
            }
        }

        public async Task<bool> UpdateEstimates(Earning input)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var estimateDetails = await _claimEstimateRepository.FirstOrDefaultAsync(t => t.EarningsId == input.EarningId);
                Contract.Requires(estimateDetails != null);

                var benefitFormula = await GetClaimBenefitFormulaByBenefitId(estimateDetails.BenefitId.Value);
                var claimEntity = await _claimRepository.FirstOrDefaultAsync(c => c.PersonEventId == input.PersonEventId);

                if (benefitFormula != null)
                {
                    var formula = benefitFormula.Formula;
                    var Tokens = new Dictionary<string, string>
                    {
                        ["AccidentEarnings"] = $"{input.Total}",
                        ["DaysOff"] = $"{estimateDetails.EstimatedDaysOff.ToString().Replace(",", ".")}",
                        ["PdPercentage"] = $"{claimEntity.DisabilityPercentage}"
                    };

                    foreach (var token in Tokens)
                    {
                        formula = formula.Replace($"{token.Key}", token.Value);
                    }
                    formula = formula.Replace(",", ".");

                    DataTable table = new DataTable();
                    DataColumn dataColumn = new DataColumn("expression", typeof(Double), formula);
                    table.Columns.Add(dataColumn);
                    DataRow dataRow = table.NewRow();
                    table.Rows.Add(dataRow);

                    decimal results = Convert.ToDecimal(dataRow["expression"]);

                    estimateDetails.EstimatedExtent = results;
                    estimateDetails.EstimatedValue = results;

                    _claimEstimateRepository.Update(estimateDetails);
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);
                return true;
            }
        }

        public async Task<ClaimBenefitFormula> GetClaimBenefit(int claimInvoiceType)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                ClaimBenefitFormula claimBenefitFormula = new ClaimBenefitFormula();
                switch (claimInvoiceType)
                {
                    case (int)ClaimInvoiceTypeEnum.FuneralExpenses:
                        var entity = await _benefitService.GetBenefitByName(SystemSettings.ClaimFuneralExp);
                        claimBenefitFormula = await GetClaimBenefitFormulaByBenefitId(entity.Id);
                        break;
                }
                return claimBenefitFormula;
            }
        }

        public async Task<ClaimBenefitFormula> GetClaimBenefitFormulaByBenefitId(int benefitId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _claimBenefitFormulaRepository.FirstOrDefaultAsync(t => t.BenefitId == benefitId);
                return Mapper.Map<ClaimBenefitFormula>(entity);
            }
        }

        public async Task<ClaimBenefitFormula> GetClaimBenefitFormulaByEstimateType(EstimateTypeEnum estimateTypeEnum)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _claimBenefitFormulaRepository.FirstOrDefaultAsync(t => t.ClaimEstimateTypeId == (int)estimateTypeEnum);
                return Mapper.Map<ClaimBenefitFormula>(entity);
            }
        }

        public async Task<bool> CreateInvoiceAllocation(ClaimInvoice claimInvoice)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var text = $"Sent for payment - {claimInvoice.ClaimInvoiceId}";
                await AddingClaimNote(claimInvoice.ClaimId, text, ItemTypeEnum.Claim);

                return true;
            }
        }

        public async Task<PagedRequestResult<ClaimDisabilityAssessment>> GetPagedClaimDisabilityAssessment(PagedRequest pagedRequest, int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);

                var claimDisabilities = await _claimDisabilityAssessmentRepository
                    .Where(s => s.PersonEventId == personEventId && !s.IsDeleted)
                    .ToPagedResult(pagedRequest);

                var result = Mapper.Map<List<ClaimDisabilityAssessment>>(claimDisabilities.Data);

                return new PagedRequestResult<ClaimDisabilityAssessment>
                {
                    Page = pagedRequest.Page,
                    PageCount = pagedRequest.PageSize,
                    RowCount = claimDisabilities.RowCount,
                    PageSize = pagedRequest.PageSize,
                    Data = result
                };
            }
        }

        public async Task<bool> ApproveClaimDisabilityAssessmentStatus(ClaimDisabilityAssessment claimDisabilityAssessment)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                Contract.Requires(claimDisabilityAssessment != null);

                var result = await _claimDisabilityAssessmentRepository
                                            .FirstOrDefaultAsync(x => x.ClaimDisabilityAssessmentId == claimDisabilityAssessment.ClaimDisabilityAssessmentId);

                if (result != null)
                {
                    result.DisabilityAssessmentStatus = DisabilityAssessmentStatusEnum.Approved;
                    result.IsAuthorised = true;
                    result.ModifiedDate = DateTime.Now;

                    _claimDisabilityAssessmentRepository.Update(result);
                    await scope.SaveChangesAsync().ConfigureAwait(false);

                    _ = Task.Run(() => SendPdApprovedLetter(claimDisabilityAssessment.PersonEventId));

                    return true;
                }
                return false;
            }
        }

        public async Task<bool> UpdateClaimDisabilityAssessment(ClaimDisabilityAssessment claimDisabilityAssessment)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                Contract.Requires(claimDisabilityAssessment != null);

                var result = await _claimDisabilityAssessmentRepository
                            .FirstOrDefaultAsync(x => x.ClaimDisabilityAssessmentId == claimDisabilityAssessment.ClaimDisabilityAssessmentId);

                if (result != null)
                {
                    result.DisabilityAssessmentStatus = claimDisabilityAssessment.DisabilityAssessmentStatus;
                    result.FinalDiagnosis = claimDisabilityAssessment.FinalDiagnosis;
                    result.NettAssessedPdPercentage = claimDisabilityAssessment.NettAssessedPdPercentage;
                    result.RawPdPercentage = claimDisabilityAssessment.RawPdPercentage;
                    result.AssessmentDate = claimDisabilityAssessment.AssessmentDate;
                    result.IsAuthorised = claimDisabilityAssessment.IsAuthorised;
                    result.ModifiedDate = DateTime.Now;
                    result.ModifiedBy = claimDisabilityAssessment.ModifiedBy;

                    _claimDisabilityAssessmentRepository.Update(result);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
                return true;
            }
        }

        public async Task<bool> DeleteClaimDisabilityAssessment(ClaimDisabilityAssessment claimDisabilityAssessment)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _claimDisabilityAssessmentRepository
                            .FirstOrDefaultAsync(x => x.PersonEventId == claimDisabilityAssessment.PersonEventId
                            && x.ClaimDisabilityAssessmentId == claimDisabilityAssessment.ClaimDisabilityAssessmentId);

                if (entity != null)
                {
                    Contract.Requires(claimDisabilityAssessment != null);

                    claimDisabilityAssessment.IsDeleted = true;
                    var result = Mapper.Map<claim_ClaimDisabilityAssessment>(claimDisabilityAssessment);

                    _claimDisabilityAssessmentRepository.Update(result);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
                return true;
            }
        }

        public async Task<PagedRequestResult<PdAward>> GetPagedPdLumpSumAwards(PagedRequest pagedRequest, int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);
                var claim = await _claimRepository.FirstOrDefaultAsync(c => c.PersonEventId == personEventId);

                var pdAwards = await _pdAwardRepository
                    .Where(s => s.ClaimId == claim.ClaimId)
                    .ToPagedResult(pagedRequest);

                await _pdAwardRepository.LoadAsync(pdAwards.Data, i => i.ClaimInvoice);

                var result = Mapper.Map<List<PdAward>>(pdAwards.Data);

                return new PagedRequestResult<PdAward>
                {
                    Page = pagedRequest.Page,
                    PageCount = pagedRequest.PageSize,
                    RowCount = pdAwards.RowCount,
                    PageSize = pagedRequest.PageSize,
                    Data = result
                };
            }
        }

        public async Task<bool> AddClaimPdLumpsumAward(PdAward pdAward)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_PdAward>(pdAward);

                _pdAwardRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                await CreateSLA(SLAItemTypeEnum.PDAward, entity.ClaimInvoiceId);

                return true;
            }
        }

        public async Task<bool> ApprovePDLumpsumAward(PdAward pdAward)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                Contract.Requires(pdAward != null);
                var result = await _pdAwardRepository
                                            .FirstOrDefaultAsync(x => x.PdAwardId == pdAward.PdAwardId);

                if (result != null)
                {
                    result.AwardStatusId = (int)InvoiceStatusEnum.PaymentRequested;
                    result.ModifiedDate = DateTime.Now;

                    var textMessage = $"PD Lumpsum Award payment requested (Percentage - {pdAward.AwardPercentage}% & Invoice Amount ZAR - {pdAward.AwardAmount}) {pdAward.ClaimId}";
                    await AddingClaimNote(pdAward.ClaimId, textMessage, ItemTypeEnum.Claim);

                    _pdAwardRepository.Update(result);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
                return true;
            }
        }

        public async Task<decimal> CalculateClaimBenefits(int benefitId, Dictionary<string, string> Tokens)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var formula = await GetClaimBenefitFormula(benefitId);

                if (formula != null)
                {

                    foreach (var token in Tokens)
                    {
                        formula = formula.Replace(token.Key, token.Value);
                    }
                    formula = formula.Replace(',', '.');

                    DataTable table = new DataTable();
                    DataColumn dataColumn = new DataColumn("expression", typeof(Double), formula);
                    table.Columns.Add(dataColumn);
                    DataRow dataRow = table.NewRow();
                    table.Rows.Add(dataRow);

                    return Convert.ToDecimal(dataRow["expression"]);
                }
                return 0;
            }

        }

        public async Task<bool> RejectTTDLiabilityDecisionNotMade(int claimId, ClaimStatusEnum claimStatus, ClaimLiabilityStatusEnum claimLiabilityStatus)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var invoices = await _claimInvoiceRepository.Where(a => a.ClaimId == claimId && a.ClaimInvoiceType == ClaimInvoiceTypeEnum.DaysOffInvoice).ToListAsync();
                if (invoices != null && invoices.Count > 0)
                {
                    var claimEntity = await _claimRepository.FirstOrDefaultAsync(c => c.ClaimId == claimId);
                    foreach (var invoice in invoices)
                    {
                        var result = await DeleteClaimInvoice(invoice.ClaimInvoiceId);
                    }
                }
            }
            return true;
        }

        public async Task<bool> UpdateClaimInvoice(ClaimInvoice claimInvoice)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                Contract.Requires(claimInvoice != null);

                var claimInvoiceEntity = await _claimInvoiceRepository.FirstOrDefaultAsync(x => x.ClaimInvoiceId == claimInvoice.ClaimInvoiceId);
                if (claimInvoiceEntity != null)
                {
                    claimInvoiceEntity.ClaimInvoiceStatusId = claimInvoice.ClaimInvoiceStatusId;
                    _claimInvoiceRepository.Update(claimInvoiceEntity);
                }


                var claimEntity = await _claimRepository.FirstOrDefaultAsync(x => x.ClaimId == claimInvoiceEntity.ClaimId);

                var claimEstimateEntity = await _claimEstimateRepository.FirstOrDefaultAsync(e => e.PersonEventId == claimEntity.PersonEventId && e.EstimatedValue == claimInvoiceEntity.InvoiceAmount);

                if (claimEstimateEntity != null && (claimInvoice.ClaimInvoiceStatusId == (int)ClaimInvoiceStatus.PaymentRejected || claimInvoice.ClaimInvoiceStatusId == (int)ClaimInvoiceStatus.PaymentReversed))
                {
                    claimEstimateEntity.AllocatedValue -= claimInvoice.InvoiceAmount;
                    claimEstimateEntity.AuthorisedValue -= claimInvoice.InvoiceAmount;

                    _claimEstimateRepository.Update(claimEstimateEntity);
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task<PagedRequestResult<ClaimEstimate>> GetPagedClaimEstimates(PagedRequest request, int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var searchTerm = (EstimateTypeEnum)System.Enum.Parse(typeof(EstimateTypeEnum), request?.SearchCriteria);
                var estimates = await _claimEstimateRepository.Where(a => a.PersonEventId == personEventId && a.EstimateType == searchTerm).ToListAsync();

                var data = Mapper.Map<List<ClaimEstimate>>(estimates);

                return new PagedRequestResult<ClaimEstimate>
                {
                    Data = data,
                    RowCount = estimates.Count,
                    Page = request.Page,
                    PageSize = request.PageSize,
                    PageCount = (int)Math.Ceiling(estimates.Count / (double)request.PageSize)
                };
            }
        }

        public async Task<List<ClaimInvoice>> GetDaysOffInvoiceByClaimId(int claimId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var invoices = await _claimInvoiceRepository.Where(a => a.ClaimId == claimId && a.ClaimInvoiceType == ClaimInvoiceTypeEnum.DaysOffInvoice).ToListAsync();
                return Mapper.Map<List<ClaimInvoice>>(invoices);
            }
        }

        public async Task<List<ClaimInvoice>> GetWidowLumpsumInvoiceByClaimId(int claimId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var invoices = await _claimInvoiceRepository.Where(i => i.ClaimId == claimId && i.ClaimInvoiceType == ClaimInvoiceTypeEnum.WLSAward).ToListAsync();
                return Mapper.Map<List<ClaimInvoice>>(invoices);
            }
        }

        public async Task<decimal> GetTTDBenefit(IndustryClassEnum industryClass, int daysOff, int personEventId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                decimal industryClassEarning = 0M;
                var benefit = await _claimBenefitFormulaRepository.FirstOrDefaultAsync(t => t.ClaimEstimateTypeId == (int)EstimateTypeEnum.DaysOff);

                var metalEarnings = await _configurationService.GetModuleSetting(SystemSettings.MetalEstimatedEarnings);
                var miningEarnings = await _configurationService.GetModuleSetting(SystemSettings.MiningEstimatedEarnings);

                if (industryClass == IndustryClassEnum.Mining)
                {
                    industryClassEarning = StringExtensions.ToDecimal(miningEarnings);
                }
                else if (industryClass == IndustryClassEnum.Metals)
                {
                    industryClassEarning = StringExtensions.ToDecimal(metalEarnings);
                }

                var earnings = await _claimEarningService.GetActualEarningsByPersonEventId(personEventId);
                if (earnings != null)
                {
                    industryClassEarning = earnings.Total.Value;
                }

                var tokens = new Dictionary<string, string>
                {
                    ["AccidentEarnings"] = $"{industryClassEarning}",
                    ["DaysOff"] = $"{daysOff}"
                };
                return await CalculateClaimBenefits(benefit.BenefitId, tokens);
            }
        }

        public async Task<List<ClaimHearingAssessment>> GetClaimHearingAssessment(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEvent = await _personEventRepository.FirstOrDefaultAsync(p => p.PersonEventId == personEventId);

                if (personEvent == null) return null;

                var claimHearingAssessment = await _claimHearingAssessmentRepository
                                                .Where(s => s.RolePlayerId == personEvent.InsuredLifeId && s.IsActive).ToListAsync();

                await _claimHearingAssessmentRepository.LoadAsync(claimHearingAssessment, c => c.AudioGramItems);

                return Mapper.Map<List<ClaimHearingAssessment>>(claimHearingAssessment);
            }
        }

        public async Task<List<ClaimEstimate>> GetClaimEstimateByPersonEventAndEstimateType(int personEventId, EstimateTypeEnum estimateTypeEnum)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {

                var estimates = await (from claimEstimate in _claimEstimateRepository
                                       join type in _claimEstimateTypeRepository on claimEstimate.EstimateType equals type.EstimateType
                                       where claimEstimate.PersonEventId == personEventId && claimEstimate.EstimateType == estimateTypeEnum
                                       select new ClaimEstimate
                                       {
                                           EstimateType = claimEstimate.EstimateType,
                                           ClaimEstimateId = claimEstimate.ClaimEstimateId,
                                           IsFinalised = claimEstimate.IsFinalised,
                                           AllocatedDaysOff = claimEstimate.AllocatedDaysOff,
                                           AllocatedExtent = claimEstimate.AllocatedExtent,
                                           EstimatedValue = claimEstimate.EstimatedValue,
                                           OutstandingValue = claimEstimate.OutstandingValue,
                                           AllocatedValue = claimEstimate.AllocatedValue,
                                           AuthorisedValue = claimEstimate.AuthorisedValue,
                                           AuthorisedDaysOff = claimEstimate.AuthorisedDaysOff,
                                           OutstandingDaysOff = claimEstimate.OutstandingDaysOff,
                                           EstimatedDaysOff = claimEstimate.EstimatedDaysOff,
                                           EstimatePd = claimEstimate.EstimatePd,
                                           PersonEventId = personEventId,
                                           BenefitId = claimEstimate.BenefitId,
                                           EstimateTypes = new EstimateType
                                           {
                                               Description = type.Description,
                                           }

                                       }).ToListAsync();

                return Mapper.Map<List<ClaimEstimate>>(estimates);
            }
        }

        public async Task<List<DaysOffInvoice>> GetTTDs18MonthsOld()
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var result = await _claimInvoiceRepository.SqlQueryAsync<DaysOffInvoice>(DatabaseConstants.GetTTDs18MonthsOldSP);
                foreach (var invoice in result)
                {
                    var personEvent = await _eventService.GetPersonEvent(invoice.PersonEventId);

                    var wizardObject = new StartWizardRequest()
                    {
                        Type = "ttd-nearing-18months",
                        LinkedItemId = invoice.PersonEventId,
                        Data = _serializerService.Serialize(personEvent),
                        AllowMultipleWizards = true
                    };

                    var wizard = await _wizardService.StartWizard(wizardObject);
                }
                return result;
            }
        }

        public async Task<List<DaysOffInvoice>> GetDaysOffInvoiceByPersonEventId(int personEventId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var result = await _daysOffInvoiceRepository.Where(i => i.PersonEventId == personEventId).ToListAsync();
                return Mapper.Map<List<DaysOffInvoice>>(result);
            }
        }

        public async Task<List<ClaimInvoice>> GetFuneralExpenseInvoiceByClaimId(int claimId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var invoices = await _claimInvoiceRepository.Where(i => i.ClaimId == claimId && i.ClaimInvoiceType == ClaimInvoiceTypeEnum.FuneralExpenses).ToListAsync();
                return Mapper.Map<List<ClaimInvoice>>(invoices);
            }
        }

        public async Task<List<ClaimInvoice>> GetSundryInvoiceByClaimId(int claimId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoices = await _claimInvoiceRepository
                        .Where(i => i.ClaimId == claimId && i.ClaimInvoiceType == ClaimInvoiceTypeEnum.SundryInvoice)
                        .ToListAsync();
                return Mapper.Map<List<ClaimInvoice>>(invoices);
            }
        }

        public async Task<bool> UpdateClaimInvoiceStatus(int claimInvoiceId, ClaimInvoiceStatus claimInvoiceStatus)
        {
            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var claimInvoiceEntity = await _claimInvoiceRepository.FirstOrDefaultAsync(x => x.ClaimInvoiceId == claimInvoiceId);
                    claimInvoiceEntity.ClaimInvoiceStatusId = (int)claimInvoiceStatus;
                    _claimInvoiceRepository.Update(claimInvoiceEntity);

                    var claimEntity = await _claimRepository.FirstOrDefaultAsync(x => x.ClaimId == claimInvoiceEntity.ClaimId);
                    var message = $"{claimInvoiceEntity.ClaimInvoiceType.DisplayDescriptionAttributeValue()} invoice is {claimInvoiceStatus.DisplayDescriptionAttributeValue()}";
                    await AddingClaimNote(claimEntity.PersonEventId, message, ItemTypeEnum.PersonEvent);

                    var estimateType = GetEstimateTypeByInvoice(claimInvoiceEntity.ClaimInvoiceType);

                    var claimEstimateEntity = await _claimEstimateRepository.Where(e => e.PersonEventId == claimEntity.PersonEventId && e.EstimateType == estimateType).FirstOrDefaultAsync();


                    if (claimEstimateEntity != null &&
                        (claimInvoiceStatus == ClaimInvoiceStatus.PaymentRejected || claimInvoiceStatus == ClaimInvoiceStatus.PaymentReversed))
                    {

                        claimEstimateEntity.AllocatedValue -= claimInvoiceEntity.InvoiceAmount;
                        claimEstimateEntity.AuthorisedValue -= claimInvoiceEntity.InvoiceAmount;

                        _claimEstimateRepository.Update(claimEstimateEntity);
                    }

                    await scope.SaveChangesAsync().ConfigureAwait(false);

                    return true;
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when updating claim invoice: {claimInvoiceId} - Error Message {ex.Message}");
                return false;
            }
        }

        public async Task<bool> UpdateEstimate(ClaimEstimate claimEstimate)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                Contract.Requires(claimEstimate != null);

                var result = await GetClaimEstimateByClaimEstimateId(claimEstimate.ClaimEstimateId);

                if (result != null)
                {
                    result.EstimatedDaysOff = claimEstimate.EstimatedDaysOff;
                    result.OutstandingValue = claimEstimate.OutstandingValue;
                    result.OutstandingExtent = claimEstimate.OutstandingExtent;
                    result.AllocatedExtent = claimEstimate.AllocatedValue;
                    result.AllocatedValue = claimEstimate.AllocatedValue;
                    result.AuthorisedExtent = claimEstimate.AuthorisedExtent;
                    result.AuthorisedValue = claimEstimate.AuthorisedValue;
                    result.AuthorisedDaysOff = claimEstimate.AuthorisedDaysOff;
                    result.EstimatedValue = claimEstimate.EstimatedValue;

                    var entity = Mapper.Map<claim_ClaimEstimate>(result);

                    _claimEstimateRepository.Update(entity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);

                    return true;
                }

                return false;
            }
        }

        public async Task<bool> CreateEstimate(ClaimEstimate claimEstimate)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var claimEntity = await _claimRepository.FirstOrDefaultAsync(c => c.PersonEventId == claimEstimate.PersonEventId);
                var personEvent = await _personEventRepository.FirstOrDefaultAsync(c => c.PersonEventId == claimEstimate.PersonEventId);
                var firstMedicalReport = await _accidentService.GetFirstMedicalReportForm(claimEstimate.PersonEventId);

                var benefitFormula = await GetClaimBenefitFormulaByBenefitId(claimEstimate.BenefitId.Value);
                var earnings = await _earningsRepository.FirstOrDefaultAsync(x => x.PersonEventId == claimEstimate.PersonEventId);

                if (benefitFormula != null)
                {
                    if ((claimEstimate.EstimateType == EstimateTypeEnum.WidowsLumpSum && (bool)personEvent.IsFatal) || (claimEstimate.EstimateType != EstimateTypeEnum.WidowsLumpSum))
                    {
                        if (((claimEntity.ClaimStatus == ClaimStatusEnum.ManuallyAcknowledged || claimEntity.ClaimStatus == ClaimStatusEnum.AutoAcknowledged) && firstMedicalReport != null && firstMedicalReport.FirstMedicalReportFormId > 0)
                           || (claimEstimate.EstimateType == EstimateTypeEnum.Sundry || claimEstimate.EstimateType == EstimateTypeEnum.Funeral))
                        {
                            if (claimEstimate.EstimateType == EstimateTypeEnum.DaysOff)
                            {
                                claimEstimate.EstimatedDaysOff = benefitFormula.EstimatedDaysOff;
                            }

                            var formula = benefitFormula.Formula;
                            var Tokens = new Dictionary<string, string>
                            {
                                ["AccidentEarnings"] = $"{earnings.Total}",
                                ["DaysOff"] = $"{claimEstimate.EstimatedDaysOff}",
                                ["PdPercentage"] = $"{claimEntity.DisabilityPercentage}"
                            };

                            foreach (var token in Tokens)
                            {
                                formula = formula.Replace($"{token.Key}", token.Value);
                            }

                            formula = formula.Replace(",", ".");

                            DataTable table = new DataTable();
                            DataColumn dataColumn = new DataColumn("expression", typeof(Double), formula);
                            table.Columns.Add(dataColumn);
                            DataRow dataRow = table.NewRow();
                            table.Rows.Add(dataRow);

                            double results = Convert.ToDouble(dataRow["expression"]);
                            if (claimEstimate.EstimateType != EstimateTypeEnum.Sundry)
                            {
                                claimEstimate.EstimatedExtent = (decimal)results;
                                claimEstimate.EstimatedValue = (decimal)results;
                            }
                            var entity = Mapper.Map<claim_ClaimEstimate>(claimEstimate);

                            var existingEstimate = await GetClaimEstimateByPersonEventId(personEvent.PersonEventId, claimEstimate.BenefitId.Value);
                            if (existingEstimate != null)
                            {
                                existingEstimate.EstimatedExtent = (decimal)results;
                                existingEstimate.EstimatedValue = (decimal)results;
                                var existingEntity = Mapper.Map<claim_ClaimEstimate>(existingEstimate);

                                _claimEstimateRepository.Update(existingEntity);
                            }
                            else
                            {
                                _claimEstimateRepository.Create(entity);
                            }
                        }
                    }
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
                return true;
            }
        }

        public async Task<List<ClaimBenefit>> GetClaimBenefitsClaimId(int claimId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entities = await _claimBenefitRepository.Where(claimBenefit => claimBenefit.ClaimId == claimId).ToListAsync();
                var results = Mapper.Map<List<ClaimBenefit>>(entities);

                return results;
            }
        }

        public async Task<int> AddClaimBenefit(ClaimBenefit claimBenefit)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_ClaimBenefit>(claimBenefit);
                _claimBenefitRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.ClaimBenefitId;
            }
        }

        public async Task<TopRankedEstimateAmount> GetTopRankedEstimatesFromMedicalReport(PersonEvent personEvent)
        {
            if (personEvent == null || personEvent.FirstMedicalReport == null || personEvent.FirstMedicalReport.MedicalReportForm == null) { return new TopRankedEstimateAmount(); }

            var topRankedEstimateAmount = new TopRankedEstimateAmount();

            var claimEstimates = await GetClaimEstimateByPersonEventId(personEvent.PersonEventId);
            if (claimEstimates.Any())
            {
                foreach (var claimEstimate in claimEstimates)
                {
                    topRankedEstimateAmount.MedicalCostEstimate = claimEstimate.EstimateType == EstimateTypeEnum.Medical ? claimEstimate.EstimatedValue : topRankedEstimateAmount.MedicalCostEstimate;
                    topRankedEstimateAmount.PDExtentEstimate = claimEstimate.EstimatePd > 0 ? claimEstimate.EstimatePd : topRankedEstimateAmount.PDExtentEstimate;
                    topRankedEstimateAmount.DaysOffEstimate = claimEstimate.EstimatedDaysOff > 0 ? claimEstimate.EstimatedDaysOff : topRankedEstimateAmount.DaysOffEstimate;
                }
            }
            else
            {
                var _event = await _eventService.GetEvent(personEvent.EventId);

                var estimates = await _medicalEstimatesService.GetICD10Estimates(new ICD10EstimateFilter
                {
                    EventType = _event.EventType,
                    Icd10Codes = personEvent.FirstMedicalReport.MedicalReportForm.Icd10Codes,
                    ReportDate = personEvent.FirstMedicalReport.MedicalReportForm.ReportDate
                });

                if (estimates.Count > 0)
                {
                    var ICD10CodeJson = _serializerService.Deserialize<ArrayList>(personEvent.FirstMedicalReport.MedicalReportForm.Icd10CodesJson);
                    var ICD10CodeString = ICD10CodeJson[0].ToString();
                    var ICD10CodeDetails = _serializerService.Deserialize<ICD10CodeJsonObject>(ICD10CodeString);

                    switch (ICD10CodeDetails.Severity)
                    {
                        case (int)InjurySeverityTypeEnum.Severe:
                            topRankedEstimateAmount.MedicalCostEstimate = Convert.ToDecimal(estimates.OrderByDescending(b => b.MedicalMaximumCost).FirstOrDefault()?.MedicalMaximumCost);
                            topRankedEstimateAmount.PDExtentEstimate = Convert.ToDecimal(estimates.OrderByDescending(b => b.PDExtentMaximum).FirstOrDefault()?.PDExtentMaximum);
                            topRankedEstimateAmount.DaysOffEstimate = Convert.ToDecimal(estimates.OrderByDescending(b => b.DaysOffMaximum).FirstOrDefault()?.DaysOffMaximum);
                            break;
                        case (int)InjurySeverityTypeEnum.Moderate:
                            topRankedEstimateAmount.MedicalCostEstimate = Convert.ToDecimal(estimates.OrderByDescending(b => b.MedicalAverageCost).FirstOrDefault()?.MedicalAverageCost);
                            topRankedEstimateAmount.PDExtentEstimate = Convert.ToDecimal(estimates.OrderByDescending(b => b.PDExtentAverage).FirstOrDefault()?.PDExtentAverage);
                            topRankedEstimateAmount.DaysOffEstimate = Convert.ToDecimal(estimates.OrderByDescending(b => b.DaysOffAverage).FirstOrDefault()?.DaysOffAverage);
                            break;
                        default:
                            topRankedEstimateAmount.MedicalCostEstimate = Convert.ToDecimal(estimates.OrderByDescending(b => b.MedicalMinimumCost).FirstOrDefault()?.MedicalMinimumCost);
                            topRankedEstimateAmount.PDExtentEstimate = Convert.ToDecimal(estimates.OrderByDescending(b => b.PDExtentMinimum).FirstOrDefault()?.PDExtentMinimum);
                            topRankedEstimateAmount.DaysOffEstimate = Convert.ToDecimal(estimates.OrderByDescending(b => b.DaysOffMinimum).FirstOrDefault()?.DaysOffMinimum);
                            break;
                    }
                }

                // check if the patient is eligible for days off captured on medical report
                var estimatedDaysOff = personEvent.FirstMedicalReport?.EstimatedDaysOff;
                if (estimatedDaysOff.HasValue)
                {
                    topRankedEstimateAmount.DaysOffEstimate = estimatedDaysOff.Value;
                }
            }

            return topRankedEstimateAmount;
        }

        public async Task<TopRankedEstimateAmount> GetTopRankedEstimatesFromPhysicalInjury(PersonEvent personEvent)
        {
            if (personEvent == null || personEvent.PhysicalDamages.Count == 0) { return new TopRankedEstimateAmount(); }

            var topRankedEstimateAmount = new TopRankedEstimateAmount();

            var claimEstimates = await GetClaimEstimateByPersonEventId(personEvent.PersonEventId);
            if (claimEstimates.Any())
            {
                foreach (var claimEstimate in claimEstimates)
                {
                    topRankedEstimateAmount.MedicalCostEstimate = claimEstimate.EstimateType == EstimateTypeEnum.Medical ? claimEstimate.EstimatedValue : topRankedEstimateAmount.MedicalCostEstimate;
                    topRankedEstimateAmount.PDExtentEstimate = claimEstimate.EstimatePd > 0 ? claimEstimate.EstimatePd : topRankedEstimateAmount.PDExtentEstimate;
                    topRankedEstimateAmount.DaysOffEstimate = claimEstimate.EstimatedDaysOff > 0 ? claimEstimate.EstimatedDaysOff : topRankedEstimateAmount.DaysOffEstimate;
                }
            }
            else
            {
                var _event = await _eventService.GetEvent(personEvent.EventId);

                var icd10Ids = personEvent.PhysicalDamages[0].Injuries.Select(i => i.Icd10CodeId).ToList();
                var icd10Codes = await _iCD10CodeService.GetICD10Codes(string.Join(", ", icd10Ids));
                var icd10CodeString = string.Join(", ", icd10Codes.Select(c => c.Icd10Code));

                var estimates = await _medicalEstimatesService.GetICD10Estimates(new ICD10EstimateFilter
                {
                    EventType = _event.EventType,
                    Icd10Codes = icd10CodeString,
                    ReportDate = DateTime.Now
                });

                if (estimates.Count > 0)
                {
                    var severity = personEvent.PhysicalDamages[0].Injuries.Select(i => i.InjurySeverityType).FirstOrDefault();
                    switch (severity)
                    {
                        case InjurySeverityTypeEnum.Severe:
                            topRankedEstimateAmount.MedicalCostEstimate = Convert.ToDecimal(estimates.OrderByDescending(b => b.MedicalMaximumCost).FirstOrDefault()?.MedicalMaximumCost);
                            topRankedEstimateAmount.PDExtentEstimate = Convert.ToDecimal(estimates.OrderByDescending(b => b.PDExtentMaximum).FirstOrDefault()?.PDExtentMaximum);
                            topRankedEstimateAmount.DaysOffEstimate = Convert.ToDecimal(estimates.OrderByDescending(b => b.DaysOffMaximum).FirstOrDefault()?.DaysOffMaximum);
                            break;
                        case InjurySeverityTypeEnum.Moderate:
                            topRankedEstimateAmount.MedicalCostEstimate = Convert.ToDecimal(estimates.OrderByDescending(b => b.MedicalAverageCost).FirstOrDefault()?.MedicalAverageCost);
                            topRankedEstimateAmount.PDExtentEstimate = Convert.ToDecimal(estimates.OrderByDescending(b => b.PDExtentAverage).FirstOrDefault()?.PDExtentAverage);
                            topRankedEstimateAmount.DaysOffEstimate = Convert.ToDecimal(estimates.OrderByDescending(b => b.DaysOffAverage).FirstOrDefault()?.DaysOffAverage);
                            break;
                        default:
                            topRankedEstimateAmount.MedicalCostEstimate = Convert.ToDecimal(estimates.OrderByDescending(b => b.MedicalMinimumCost).FirstOrDefault()?.MedicalMinimumCost);
                            topRankedEstimateAmount.PDExtentEstimate = Convert.ToDecimal(estimates.OrderByDescending(b => b.PDExtentMinimum).FirstOrDefault()?.PDExtentMinimum);
                            topRankedEstimateAmount.DaysOffEstimate = Convert.ToDecimal(estimates.OrderByDescending(b => b.DaysOffMinimum).FirstOrDefault()?.DaysOffMinimum);
                            break;
                    }
                }
            }

            return topRankedEstimateAmount;
        }

        public async Task<ClaimInvoice> GetClaimInvoiceByClaimId(int claimId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claimInvoice = await _claimInvoiceRepository.FirstOrDefaultAsync(a => a.ClaimId == claimId);
                return Mapper.Map<ClaimInvoice>(claimInvoice);

            }
        }

        public async Task<bool> AddFatalLumpsumInvoice(FatalLumpsumInvoice fatalLumpsumInvoice)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_FatalLumpSumInvoice>(fatalLumpsumInvoice);

                _fatalLumpsumInvoiceRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                await CreateSLA(SLAItemTypeEnum.FatalLumpSumAward, entity.ClaimInvoiceId);

                if (fatalLumpsumInvoice?.ClaimInvoice.ClaimInvoiceRepayReason != null)
                {
                    string textMessage = fatalLumpsumInvoice.ClaimInvoice.ClaimInvoiceRepayReason.DisplayAttributeValue();
                    var claim = await _claimRepository.FirstOrDefaultAsync(x => x.ClaimId == fatalLumpsumInvoice.ClaimInvoice.ClaimId);
                    await AddingClaimNote(claim.PersonEventId, textMessage, ItemTypeEnum.PersonEvent);
                }

                return true;
            }
        }

        public async Task<FatalLumpsumInvoice> GetFatalLumpSumInvoice(int claimInvoiceId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                _fatalLumpsumInvoiceRepository.DisableFilter(SoftDeleteFilter);
                var invoice = await _fatalLumpsumInvoiceRepository.FirstOrDefaultAsync(i => i.ClaimInvoiceId == claimInvoiceId);
                await _fatalLumpsumInvoiceRepository.LoadAsyncIncludeDeleted(invoice, i => i.ClaimInvoice);
                _fatalLumpsumInvoiceRepository.EnableFilter(SoftDeleteFilter);

                return Mapper.Map<FatalLumpsumInvoice>(invoice);
            }
        }

        public async Task<bool> UpdateFatalLumpsumInvoice(FatalLumpsumInvoice fatalLumpSumInvoice)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                Contract.Requires(fatalLumpSumInvoice != null);

                var entity = await _claimInvoiceRepository.FindByIdAsync(fatalLumpSumInvoice.ClaimInvoiceId);
                var fatalLumpInvoice = await _fatalLumpsumInvoiceRepository.FindByIdAsync(fatalLumpSumInvoice.ClaimInvoiceId);

                fatalLumpInvoice.Description = fatalLumpSumInvoice.Description;
                fatalLumpInvoice.PayeeTypeId = fatalLumpSumInvoice.PayeeTypeId;
                fatalLumpInvoice.PayeeId = fatalLumpSumInvoice.PayeeId;

                entity.InvoiceDate = fatalLumpSumInvoice.ClaimInvoice.InvoiceDate;
                entity.DateReceived = fatalLumpSumInvoice.ClaimInvoice.DateReceived;
                entity.InvoiceAmount = fatalLumpSumInvoice.ClaimInvoice.InvoiceAmount;

                _fatalLumpsumInvoiceRepository.Update(fatalLumpInvoice);
                _claimInvoiceRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task<bool> AutoGenerateInvoices(int personEventId)
        {
            Contract.Requires(personEventId > 0);
            bool result = false;
            var personEvent = await _eventService.GetPersonEvent(personEventId);
            if (personEvent == null)
            {
                return result;
            }

            var claimEstimates = await GetClaimEstimateByPersonEventId(personEventId);

            foreach (var claimEstimate in claimEstimates)
            {
                switch (claimEstimate.EstimateType)
                {
                    case EstimateTypeEnum.WidowsLumpSum:
                        var wlsInvoices = await AutoGenerateWLSInvoices(personEvent, claimEstimate);

                        foreach (var widowLumpSumInvoice in wlsInvoices)
                        {
                            await AddWidowLumpsumInvoice(widowLumpSumInvoice);

                            if (widowLumpSumInvoice.ClaimInvoice.ClaimInvoiceStatusId == (int)InvoiceStatusEnum.RequestedForApproval)
                            {
                                var invoices = await GetWidowLumpsumInvoiceByClaimId(personEvent.Claims[0].ClaimId);
                                await StartWizardAutoApprovalRequest(invoices, personEvent);
                                claimEstimate.AllocatedValue = (claimEstimate.AllocatedValue ?? 0m) + widowLumpSumInvoice.ClaimInvoice.InvoiceAmount;
                                await UpdateEstimate(claimEstimate);
                            }
                            result = true;
                        }

                        break;
                    case EstimateTypeEnum.Funeral:
                        var fxpInvoices = await AutoGenerateFXPInvoices(personEvent, claimEstimate);

                        foreach (var funeralExpenseInvoice in fxpInvoices)
                        {
                            await AddFuneralExpenseInvoice(funeralExpenseInvoice);

                            if (funeralExpenseInvoice.ClaimInvoice.ClaimInvoiceStatusId == (int)InvoiceStatusEnum.RequestedForApproval)
                            {
                                var invoices = await GetFuneralExpenseInvoiceByClaimId(personEvent.Claims[0].ClaimId);
                                await StartWizardAutoApprovalRequest(invoices, personEvent);
                                claimEstimate.AllocatedValue = (claimEstimate.AllocatedValue ?? 0m) + funeralExpenseInvoice.ClaimInvoice.InvoiceAmount;
                                await UpdateEstimate(claimEstimate);
                            }
                            result = true;
                        }

                        break;
                    default:
                        break;
                }
            }

            return result;
        }

        public async Task<bool> HasBankingDetails(int payeeRolePlayerId)
        {
            var bankingDetails = await _rolePlayerService.GetBankingDetailsByRolePlayerId(payeeRolePlayerId);
            return bankingDetails != null && bankingDetails.Any();
        }

        public async Task<bool> AddNonStatutaryAugKickInClaimEstimates(List<Benefit> benefits, int personEventId, List<int> claimIds)
        {
            Contract.Requires(benefits != null);

            var updatedClaimEstimates = new List<ClaimEstimate>();

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var personEvent = await _eventService.GetPersonEvent(personEventId);
                var personEventEarnings = await _claimEarningService.GetEarningsByPersonEventId(personEventId);

                var results = await _claimRepository.Where(c => c.PersonEventId == personEvent.PersonEventId).ToListAsync();
                await _claimRepository.LoadAsync(results, c => c.ClaimBenefits);
                var mappedClaims = Mapper.Map<List<Contracts.Entities.Claim>>(results);

                var actualAccidentEarnings = personEventEarnings?.LastOrDefault(x => x.EarningsType == EarningsTypeEnum.Accident && x.IsVerified);
                var estimatedAccidentEarnings = personEventEarnings.LastOrDefault(x => x.EarningsType == EarningsTypeEnum.Accident && x.IsEstimated);
                var earning = actualAccidentEarnings ?? estimatedAccidentEarnings;

                var topRankedEstimateAmount = (bool)personEvent.IsFatal
                                ? await GetTopRankedEstimatesFromPhysicalInjury(personEvent)
                                : await GetTopRankedEstimatesFromMedicalReport(personEvent);

                foreach (var benefit in benefits)
                {
                    var result = await CalculateClaimEstimateValue(benefit, earning, topRankedEstimateAmount);

                    var existingEstimates = await GetClaimEstimateByPersonEventId(personEventId);

                    var estimateType = (EstimateTypeEnum?)benefit.EstimateTypeId;
                    if (existingEstimates.Any(e => e.EstimateType == estimateType && claimIds.Contains((int)e.ClaimId)))
                    {
                        var claimEstimates = existingEstimates.Where(c => c.EstimateType == estimateType && claimIds.Contains((int)c.ClaimId)).ToList();
                        claimEstimates.ForEach(c =>
                        {
                            c.EstimatedValue += result.EstimatedValue;
                            c.CalcOperands = result.CalcOperands;
                            updatedClaimEstimates.Add(c);
                        });
                    }
                }
            }

            if (updatedClaimEstimates.Count > 0)
            {
                await UpdateClaimEstimatesV2(updatedClaimEstimates);
            }
            return true;
        }

        #endregion

        #region Private Methods
        private async Task HandleStatusChangeAsync(ClaimInvoice claimInvoice, claim_ClaimEstimate claimEstimateEntity, decimal invoiceAmount)
        {
            switch ((ClaimInvoiceStatus)claimInvoice.ClaimInvoiceStatusId)
            {
                case ClaimInvoiceStatus.Deleted:
                case ClaimInvoiceStatus.Rejected:
                case ClaimInvoiceStatus.PaymentRecalled:
                case ClaimInvoiceStatus.PaymentReversed:
                    await HandleNegativeStatusAsync(claimInvoice, claimEstimateEntity, invoiceAmount);
                    break;

                case ClaimInvoiceStatus.ReInstated:
                    HandleReinstatedStatus(claimInvoice, claimEstimateEntity, invoiceAmount);
                    break;

                case ClaimInvoiceStatus.PaymentRequested:
                    await HandlePaymentRequestedStatusAsync(claimInvoice);
                    break;
            }
        }

        private async Task HandleNegativeStatusAsync(ClaimInvoice claimInvoice, claim_ClaimEstimate claimEstimateEntity, decimal invoiceAmount)
        {
            if (claimEstimateEntity != null)
            {
                claimEstimateEntity.AllocatedValue = (claimEstimateEntity.AllocatedValue ?? 0) - invoiceAmount;
                _claimEstimateRepository.Update(claimEstimateEntity);
            }

            switch ((ClaimInvoiceStatus)claimInvoice.ClaimInvoiceStatusId)
            {
                case ClaimInvoiceStatus.PaymentRecalled:
                    // TODO: Call FinCare API for recall
                    break;

                case ClaimInvoiceStatus.PaymentReversed:
                    // TODO: Call FinCare API for reversal
                    break;
            }
        }

        private void HandleReinstatedStatus(ClaimInvoice claimInvoice, claim_ClaimEstimate claimEstimateEntity, decimal invoiceAmount)
        {
            if (claimEstimateEntity == null)
                return;

            var estimate = claimEstimateEntity.EstimatedValue ?? 0;
            var allocated = claimEstimateEntity.AllocatedValue ?? 0;
            var unallocated = estimate - allocated;

            if (unallocated >= invoiceAmount)
            {
                claimEstimateEntity.AllocatedValue = allocated + invoiceAmount;
                _claimEstimateRepository.Update(claimEstimateEntity);
            }
            else
            {
                throw new Exception($"Insufficient unallocated benefit award: Requested {invoiceAmount}, Available {unallocated}");
            }
        }

        private async Task HandlePaymentRequestedStatusAsync(ClaimInvoice claimInvoice)
        {
            var mappedAuthLimitItemType = await _authorityLimitService.GetMappedAuthorityLimitItemType(claimInvoice);
            if (mappedAuthLimitItemType == null)
            {
                await ReleasePayment(claimInvoice);
            }
            else
            {
                var request = new AuthorityLimitRequest
                {
                    AuthorityLimitItemType = mappedAuthLimitItemType.Value,
                    AuthorityLimitValueType = AuthorityLimitValueTypeEnum.MonetaryValue,
                    AuthorityLimitContextType = AuthorityLimitContextTypeEnum.Claim,
                    ContextId = claimInvoice.ClaimId,
                    Value = Convert.ToInt32(claimInvoice.InvoiceAmount)
                };

                var response = await _authorityLimitService.CheckUserHasAuthorityLimit(request);

                if (response.UserHasAuthorityLimit)
                {
                    await ReleasePayment(claimInvoice);
                    await _authorityLimitService.CreateUserAuthorityLimitConfigurationAudit(request);
                }
                else if (response.AuthorityLimitConfigurations?.Count > 0)
                {
                    claimInvoice.ClaimInvoiceStatusId = (int)ClaimInvoiceStatus.PendingAuthorization;

                    var permissionOverrides = response.AuthorityLimitConfigurations
                        .Select(s => new WizardPermissionOverride
                        {
                            WizardPermissionType = WizardPermissionTypeEnum.Continue,
                            PermissionName = s.PermissionName
                        })
                        .ToList();

                    var startWizardRequest = new StartWizardRequest
                    {
                        Type = "payment-authorisation-request",
                        LinkedItemId = claimInvoice.ClaimInvoiceId,
                        WizardPermissionOverrides = permissionOverrides,
                        Data = _serializerService.Serialize(Mapper.Map<ClaimInvoice>(claimInvoice)),
                        AllowMultipleWizards = false
                    };

                    await _wizardService.StartWizard(startWizardRequest);
                }
                else
                {
                    await ReleasePayment(claimInvoice);
                }
            }
        }

        private async Task ReleasePayment(ClaimInvoice claimInvoice)
        {
            Contract.Requires(claimInvoice != null && claimInvoice.PayeeRolePlayerBankAccountId.HasValue);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var claim = await _claimRepository.FindByIdAsync(claimInvoice.ClaimId);
                var personEvent = await _personEventRepository.FindByIdAsync(claim.PersonEventId);
                var policy = await _policyService.GetPolicy(claim.PolicyId.Value);

                var payee = await _rolePlayerService.GetRolePlayer(claimInvoice.PayeeRolePlayerId.Value);
                var payeeBankAccount = await _rolePlayerService.GetBankDetailByBankAccountId(claimInvoice.PayeeRolePlayerBankAccountId.Value);

                var payment = new FinCare.Contracts.Entities.Payments.Payment
                {
                    Product = policy.ProductOption.Code,
                    ClientType = payee.ClientType,
                    BankAccountType = payeeBankAccount.BankAccountType,
                    AccountNo = payeeBankAccount.AccountNumber,
                    Amount = claimInvoice.InvoiceAmount,
                    Bank = payeeBankAccount.BankName,
                    BankBranch = payeeBankAccount.BankBranchName,
                    ClaimReference = claim.ClaimReferenceNumber,
                    PaymentType = PaymentTypeEnum.Claim,
                    PolicyId = policy.PolicyId,
                    PolicyReference = policy.PolicyNumber,
                    PaymentStatus = PaymentStatusEnum.Pending,
                    Payee = payee.DisplayName,
                    PayeeId = payee.RolePlayerId,
                    ClaimId = claimInvoice.ClaimId,
                    ClaimType = personEvent.ClaimType ?? ClaimTypeEnum.Unknown,
                    IsDebtorCheck = false,
                    IsForex = false,
                    PaymentMethod = PaymentMethodEnum.EFT,
                    IsReversed = false,
                    ClaimInvoiceId = claimInvoice.ClaimInvoiceId
                };

                await _paymentCreatorService.CreatePaymentWithAllocations(payment);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task SendTTDRejectCommunication(int personEventId, int claimInvoiceId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var personEvent = await _personEventRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEventId);
                var mappedPersonEvent = Mapper.Map<Contracts.Entities.PersonEvent>(personEvent);
                mappedPersonEvent.ClaimInvoiceId = claimInvoiceId;
                var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEventId);
                string claimNumber = claimEntity.ClaimReferenceNumber;

                SqlParameter[] parameters = {
                    new SqlParameter("PersonEventId", personEvent.PersonEventId)
                    };

                var claimDetails = await _personEventRepository.SqlQueryAsync<AutoAjudicateClaim>(DatabaseConstants.GetClaimToAcknowledge, parameters);
                var claimEmail = await GenerateNotification(claimDetails[0], TemplateTypeEnum.TTDRejected);

                var employee = await _rolePlayerService.GetPerson(personEvent.InsuredLifeId);
                var employeeContact = await _rolePlayerService.GetRolePlayerContactDetails(personEvent.InsuredLifeId);
                var employeeContactInformation = employeeContact.Count > 0 ? employeeContact.Where(r => r.CommunicationType == CommunicationTypeEnum.SMS).FirstOrDefault() : null;
                ClaimSMS claimSMS = new ClaimSMS();

                if (employeeContactInformation != null)
                {
                    claimSMS = await GenerateSMS(claimDetails[0], employeeContactInformation.ContactNumber, TemplateTypeEnum.TTDRejected);
                }
                else
                {
                    claimSMS = await GenerateSMS(claimDetails[0], null, TemplateTypeEnum.TTDRejected);
                }

                var rolePlayerContacts = await _rolePlayerService.GetRolePlayerContactDetails((int)personEvent.CompanyRolePlayerId);
                var rolePlayerContactInformation = rolePlayerContacts.Count > 0 ? rolePlayerContacts.Where(r => r.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact).FirstOrDefault() : null;
                var contactInformation = employeeContact.Count > 0 ? employeeContact.Where(r => r.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact).FirstOrDefault() : null;

                if (rolePlayerContactInformation != null)
                {
                    claimEmail.EmailAddress = rolePlayerContactInformation.EmailAddress;
                }

                var claimCommunicationMessage = await _claimCommunicationService.GetContactDetailsForEmployeeAndEmployer(personEvent.PersonEventId, ClaimCommunicationTypeEnum.TTDRejected);

                claimCommunicationMessage.Employee = employee;
                claimCommunicationMessage.ClaimNumber = claimNumber;
                claimCommunicationMessage.PersonEvent = mappedPersonEvent;

                if (claimCommunicationMessage.ClaimEmployerEmail != null)
                {
                    claimCommunicationMessage.ClaimEmployerEmail.Tokens = claimEmail.Tokens;
                    claimCommunicationMessage.ClaimEmployerEmail.TemplateType = TemplateTypeEnum.TTDRejected;
                }
                if (claimCommunicationMessage.EmployeeClaimEmail != null)
                {
                    claimCommunicationMessage.EmployeeClaimEmail.Tokens = claimEmail.Tokens;
                    claimCommunicationMessage.EmployeeClaimEmail.TemplateType = TemplateTypeEnum.TTDRejected;
                }
                if (claimCommunicationMessage.ClaimEmployerSMS != null)
                {
                    claimCommunicationMessage.ClaimEmployerSMS.Tokens = claimSMS.Tokens;
                    claimCommunicationMessage.ClaimEmployerSMS.TemplateType = TemplateTypeEnum.TTDRejected;
                }

                if (claimCommunicationMessage.EmployeeClaimSMS != null)
                {
                    claimCommunicationMessage.EmployeeClaimSMS.Tokens = claimSMS.Tokens;
                    claimCommunicationMessage.EmployeeClaimSMS.TemplateType = TemplateTypeEnum.TTDRejected;
                }

                var textMessage = $"Reject TTD - {personEvent.PersonEventId}";
                await AddingClaimNote(personEvent.PersonEventId, textMessage, ItemTypeEnum.PersonEvent);
                await _claimCommunicationService.PublishCommunicationNotification(claimCommunicationMessage);
                //await _claimCommunicationService.SendNotification(claimEmail, null, null, claimNumber, contactInformation, ClaimCommunicationTypeEnum.PdPaidCloseLetter);

            }
        }

        private async Task CreateSLA(SLAItemTypeEnum slaItemType, int claimInvoiceId)
        {
            var slaStatusChangeAudit = new SlaStatusChangeAudit
            {
                SLAItemType = slaItemType,
                ItemId = claimInvoiceId,
                Status = "Invoice",
                EffectiveFrom = DateTimeHelper.SaNow,
                Reason = slaItemType.DisplayDescriptionAttributeValue() + " was created"
            };

            await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
        }

        private async Task UpdateSLA(SLAItemTypeEnum slaItemType, int claimInvoiceId, bool stopSla)
        {
            var latestSlaStatusChangeAudit = await _slaStatusChangeRepository.Where(a => a.SLAItemType == slaItemType && a.ItemId == claimInvoiceId)
            .OrderByDescending(a => a.CreatedDate)
            .FirstOrDefaultAsync();
            var today = DateTimeHelper.SaNow;


            var slaStatusChangeAudit = new SlaStatusChangeAudit
            {
                SlaStatusChangeAuditId = latestSlaStatusChangeAudit.SlaStatusChangeAuditId,
                SLAItemType = latestSlaStatusChangeAudit.SLAItemType,
                ItemId = latestSlaStatusChangeAudit.ItemId,
                Status = "Invoice",
                EffectiveFrom = today,
                EffictiveTo = null,
                Reason = slaItemType.DisplayDescriptionAttributeValue() + " was updated"
            };

            if (stopSla)
            {
                slaStatusChangeAudit.EffictiveTo = today;

            }

            await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
        }

        private async Task<int> AddingClaimNote(int personEventId, string message, ItemTypeEnum itemTypeEnum)
        {
            Contract.Requires(personEventId > 0);

            return await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
            {
                ItemId = personEventId,
                NoteCategory = NoteCategoryEnum.PersonEvent,
                NoteItemType = NoteItemTypeEnum.PersonEvent,
                NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                NoteType = NoteTypeEnum.SystemAdded,
                Text = message,
                IsActive = true
            });
        }

        private Task<ClaimEmail> GenerateNotification(AutoAjudicateClaim autoAjudicateClaim, TemplateTypeEnum templateTypeEnum)
        {
            var claimEmail = new ClaimEmail()
            {
                ClaimId = 0,
                EmailAddress = autoAjudicateClaim.EmployeeEmailAddress,
                PersonEventId = autoAjudicateClaim.PersonEventId,
                TemplateType = templateTypeEnum,
                Tokens = new Dictionary<string, string>
                {
                    ["{CompanyName}"] = $"{autoAjudicateClaim.CompanyName}",
                    ["{Address}"] = autoAjudicateClaim.CompanyAddressLine1,
                    ["{City/Town}"] = autoAjudicateClaim.CompanyCity,
                    ["{PostalCode}"] = autoAjudicateClaim.CompanyPostalCode,
                    ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy"),
                    ["{ClaimNumber}"] = autoAjudicateClaim.CompCarePEVRefNumber ?? autoAjudicateClaim.ClaimReferenceNumber,
                    ["{EmployeeName}"] = $"{autoAjudicateClaim.EmployeeFirstName} {autoAjudicateClaim.EmployeeSurname}",
                    ["{CompanyNumber}"] = autoAjudicateClaim.CompanyReferenceNumber,
                    ["{IndustryNumber}"] = autoAjudicateClaim.CompanyReferenceNumber,
                    ["{DateOfAccident}"] = autoAjudicateClaim.EventDate.ToString("dd MMM yyyy"),
                    ["{Title}"] = autoAjudicateClaim.Title.DisplayAttributeValue(),
                    ["{Surname}"] = autoAjudicateClaim.EmployeeSurname,
                }
            };

            return Task.FromResult<ClaimEmail>(claimEmail);
        }

        private Task<ClaimSMS> GenerateSMS(AutoAjudicateClaim autoAjudicateClaim, string cellNumber, TemplateTypeEnum templateTypeEnum)
        {
            var claimSMS = new ClaimSMS()
            {
                ClaimId = 0,
                MobileNumber = cellNumber,
                PersonEventId = autoAjudicateClaim.PersonEventId,
                TemplateType = templateTypeEnum,
                Tokens = new Dictionary<string, string>
                {
                    ["[personEventNumber]"] = autoAjudicateClaim.CompCarePEVRefNumber ?? autoAjudicateClaim.ClaimReferenceNumber,
                }
            };
            return Task.FromResult<ClaimSMS>(claimSMS);
        }

        private async Task<string> GetClaimBenefitFormula(int benefitId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var benefitFormula = await GetClaimBenefitFormulaByBenefitId(benefitId);
                return benefitFormula.Formula;
            }
        }

        private EstimateTypeEnum GetEstimateTypeByInvoice(ClaimInvoiceTypeEnum claimInvoiceTypeEnum)
        {
            switch (claimInvoiceTypeEnum)
            {
                case ClaimInvoiceTypeEnum.SundryInvoice:
                    return EstimateTypeEnum.Sundry;
                case ClaimInvoiceTypeEnum.MedicalInvoice:
                    return EstimateTypeEnum.Medical;
                case ClaimInvoiceTypeEnum.DaysOffInvoice:
                    return EstimateTypeEnum.TTD;
                case ClaimInvoiceTypeEnum.PDAward:
                    return EstimateTypeEnum.PDLumpSum;
                case ClaimInvoiceTypeEnum.TravelAward:
                    return EstimateTypeEnum.TravelExpenses;
                case ClaimInvoiceTypeEnum.WLSAward:
                    return EstimateTypeEnum.WidowsLumpSum;
                case ClaimInvoiceTypeEnum.FuneralExpenses:
                    return EstimateTypeEnum.Funeral;
                case ClaimInvoiceTypeEnum.SympathyAward:
                    return EstimateTypeEnum.SympathyAward;
                case ClaimInvoiceTypeEnum.FatalLumpSumAward:
                case ClaimInvoiceTypeEnum.FatalPartialDependantsLumpSum:
                    return EstimateTypeEnum.FtlLumpSum;
                default:
                    throw new ArgumentException($"No matching EstimateTypeEnum found for ClaimInvoiceTypeEnum: {claimInvoiceTypeEnum}");
            }
        }

        private async Task<int> GetICD10PDPercentageEstimates(List<Icd10CodeEstimateAmount> icd10EstimateFilters, InjurySeverityTypeEnum injurySeverityType)
        {
            var icd10CodePdPercentage = 0;

            var tempmIcd10CodePdPercentage = new List<int>();

            foreach (var icd10EstimateFilter in icd10EstimateFilters)
            {

                if (injurySeverityType == InjurySeverityTypeEnum.Mild)
                {
                    icd10CodePdPercentage = Convert.ToInt32(icd10EstimateFilters.OrderByDescending(b => b.PDExtentMinimum).Select(a => a.PDExtentMinimum).FirstOrDefault());
                }
                else if (injurySeverityType == InjurySeverityTypeEnum.Moderate)
                {
                    icd10CodePdPercentage = Convert.ToInt32(icd10EstimateFilters.OrderByDescending(b => b.PDExtentAverage).Select(a => a.PDExtentAverage).FirstOrDefault());
                }
                else
                {
                    icd10CodePdPercentage = Convert.ToInt32(icd10EstimateFilters.OrderByDescending(b => b.PDExtentMaximum).Select(a => a.PDExtentMaximum).FirstOrDefault());
                }

                tempmIcd10CodePdPercentage.Add(icd10CodePdPercentage);
            }
            return tempmIcd10CodePdPercentage.Max();
        }

        private async Task<int> GetICD10DaysEstimates(List<Icd10CodeEstimateAmount> icd10EstimateFilters, InjurySeverityTypeEnum injurySeverityType)
        {
            var icd10CodePdPercentage = 0;

            var tempmIcd10CodeDays = new List<int>();

            foreach (var icd10EstimateFilter in icd10EstimateFilters)
            {

                if (injurySeverityType == InjurySeverityTypeEnum.Mild)
                {
                    icd10CodePdPercentage = Convert.ToInt32(icd10EstimateFilters.OrderByDescending(b => b.DaysOffMinimum).Select(a => a.DaysOffMinimum).FirstOrDefault());
                }
                else if (injurySeverityType == InjurySeverityTypeEnum.Moderate)
                {
                    icd10CodePdPercentage = Convert.ToInt32(icd10EstimateFilters.OrderByDescending(b => b.DaysOffAverage).Select(a => a.DaysOffAverage).FirstOrDefault());
                }
                else
                {
                    icd10CodePdPercentage = Convert.ToInt32(icd10EstimateFilters.OrderByDescending(b => b.DaysOffMaximum).Select(a => a.DaysOffMaximum).FirstOrDefault());
                }

                tempmIcd10CodeDays.Add(icd10CodePdPercentage);
            }
            return tempmIcd10CodeDays.Max();
        }

        private async Task<int> GetICD10MedicalEstimates(List<Icd10CodeEstimateAmount> icd10EstimateFilters, InjurySeverityTypeEnum injurySeverityType)
        {
            var icd10CodePdPercentage = 0;

            var tempmIcd10MedicalCosts = new List<int>();

            foreach (var icd10EstimateFilter in icd10EstimateFilters)
            {

                if (injurySeverityType == InjurySeverityTypeEnum.Mild)
                {
                    icd10CodePdPercentage = Convert.ToInt32(icd10EstimateFilters.OrderByDescending(b => b.MedicalMinimumCost).Select(a => a.MedicalMinimumCost).FirstOrDefault());
                }
                else if (injurySeverityType == InjurySeverityTypeEnum.Moderate)
                {
                    icd10CodePdPercentage = Convert.ToInt32(icd10EstimateFilters.OrderByDescending(b => b.MedicalAverageCost).Select(a => a.MedicalAverageCost).FirstOrDefault());
                }
                else
                {
                    icd10CodePdPercentage = Convert.ToInt32(icd10EstimateFilters.OrderByDescending(b => b.MedicalMaximumCost).Select(a => a.MedicalMaximumCost).FirstOrDefault());
                }

                tempmIcd10MedicalCosts.Add(icd10CodePdPercentage);
            }
            return tempmIcd10MedicalCosts.Max();
        }

        private async Task<List<WidowLumpSumInvoice>> AutoGenerateWLSInvoices(PersonEvent personEvent, ClaimEstimate estimate)
        {
            List<WidowLumpSumInvoice> wlsInvoices = new List<WidowLumpSumInvoice>();

            if ((bool)!personEvent.IsFatal)
            {
                return wlsInvoices;
            }

            var spouseRolePlayers = await GetSpouseRolePlayerRelation(personEvent.InsuredLifeId);
            int spouseCount = spouseRolePlayers.Count();
            if (spouseCount == 0)
            {
                return wlsInvoices;
            }

            var claimBenefitIds = await GetClaimBenefitsClaimId(personEvent.Claims[0].ClaimId);
            var todaysDate = DateTime.Now;

            foreach (var claim in personEvent.Claims)
            {
                for (int i = 0; i < spouseCount; i++)
                {
                    ClaimInvoice claimInvoice = CreateClaimInvoiceObject(todaysDate, estimate.EstimatedValue / spouseCount, ClaimInvoiceTypeEnum.WLSAward, personEvent.Claims[0].ClaimReferenceNumber, (int)claim.PolicyId, personEvent.Claims[0].ClaimId, claimBenefitIds[0].ClaimBenefitId);
                    var payeeRolePlayerId = spouseRolePlayers.ElementAt(i).FromRolePlayerId;

                    bool hasBankingDetails = await HasBankingDetails(payeeRolePlayerId);
                    if (!hasBankingDetails)
                    {
                        claimInvoice.ClaimInvoiceStatusId = (int)ClaimInvoiceStatus.Rejected;
                    }
                    string description = hasBankingDetails ? "Invoice automatically added" : "Outstanding Banking Details";
                    var widowLumpSumInvoice = CreateWidowLumpSumInvoiceObject(claimInvoice, personEvent.Claims[0].ClaimId, payeeRolePlayerId);
                    widowLumpSumInvoice.Description = description;
                    wlsInvoices.Add(widowLumpSumInvoice);
                }
            }

            return wlsInvoices;
        }

        private async Task<List<FuneralExpenseInvoice>> AutoGenerateFXPInvoices(PersonEvent personEvent, ClaimEstimate estimate)
        {
            List<FuneralExpenseInvoice> fxpInvoices = new List<FuneralExpenseInvoice>();

            if ((bool)!personEvent.IsFatal)
            {
                return fxpInvoices;
            }

            var spouseRolePlayers = await GetSpouseRolePlayerRelation(personEvent.InsuredLifeId);
            int spouseCount = spouseRolePlayers.Count();
            if (spouseCount == 0)
            {
                return fxpInvoices;
            }

            var claimBenefitIds = await GetClaimBenefitsClaimId(personEvent.Claims[0].ClaimId);
            var todaysDate = DateTime.Now;

            foreach (var claim in personEvent.Claims)
            {
                for (int i = 0; i < spouseCount; i++)
                {
                    ClaimInvoice claimInvoice = CreateClaimInvoiceObject(todaysDate, estimate.EstimatedValue / spouseCount, ClaimInvoiceTypeEnum.FuneralExpenses, personEvent.Claims[0].ClaimReferenceNumber, (int)claim.PolicyId, personEvent.Claims[0].ClaimId, claimBenefitIds[0].ClaimBenefitId);
                    var payeeRolePlayerId = spouseRolePlayers.ElementAt(i).FromRolePlayerId;

                    bool hasBankingDetails = await HasBankingDetails(payeeRolePlayerId);
                    if (!hasBankingDetails)
                    {
                        claimInvoice.ClaimInvoiceStatusId = (int)ClaimInvoiceStatus.Rejected;
                    }
                    string description = hasBankingDetails ? "Invoice automatically added" : "Outstanding Banking Details";
                    var funeralExpenseInvoice = CreateFuneralExpenseInvoiceObject(claimInvoice, personEvent.Claims[0].ClaimId, payeeRolePlayerId);
                    funeralExpenseInvoice.Description = description;
                    fxpInvoices.Add(funeralExpenseInvoice);
                }
            }

            return fxpInvoices;
        }

        private async Task<IEnumerable<RolePlayerRelation>> GetSpouseRolePlayerRelation(int rolePlayerId)
        {
            var rolePlayer = await _rolePlayerService.GetRolePlayer(rolePlayerId);
            var spouseRolePlayers = rolePlayer.ToRolePlayers
                                              .Where(r => r.RolePlayerTypeId == (int)BeneficiaryTypeEnum.Spouse);
            return spouseRolePlayers;
        }

        private ClaimInvoice CreateClaimInvoiceObject(DateTime todaysDate, decimal? invoiceAmount, ClaimInvoiceTypeEnum claimInvoiceType, string claimReferenceNumber, int policyId, int claimId, int? claimBenefitId)
        {
            return new ClaimInvoice
            {
                InvoiceDate = todaysDate,
                DateReceived = todaysDate,
                InvoiceAmount = (decimal)invoiceAmount,
                ClaimAmount = invoiceAmount,
                ClaimInvoiceType = claimInvoiceType,
                IsAuthorised = 0,
                ExternalReferenceNumber = claimReferenceNumber,
                InternalReferenceNumber = claimReferenceNumber,
                ClaimReferenceNumber = claimReferenceNumber,
                PolicyId = policyId,
                Product = "EMP",
                ClaimInvoiceStatusId = (int)InvoiceStatusEnum.RequestedForApproval,
                CapturedDate = todaysDate,
                ClaimId = claimId,
                ClaimBenefitId = (int)claimBenefitId
            };
        }

        private WidowLumpSumInvoice CreateWidowLumpSumInvoiceObject(ClaimInvoice claimInvoice, int claimId, int payeeRolePlayerId)
        {
            return new WidowLumpSumInvoice
            {
                ClaimInvoice = claimInvoice,
                PayeeTypeId = 1,
                PayeeRolePlayerId = payeeRolePlayerId,
                ClaimId = claimId
            };
        }

        private FuneralExpenseInvoice CreateFuneralExpenseInvoiceObject(ClaimInvoice claimInvoice, int claimId, int payeeRolePlayerId)
        {
            return new FuneralExpenseInvoice
            {
                ClaimInvoice = claimInvoice,
                PayeeTypeId = 1,
                PayeeRolePlayerId = payeeRolePlayerId,
                ClaimId = claimId
            };
        }

        private async Task StartWizardAutoApprovalRequest(List<ClaimInvoice> claimInvoices, PersonEvent personEvent)
        {
            var lastClaimInvoice = claimInvoices.LastOrDefault();
            if (lastClaimInvoice != null)
            {
                personEvent.ClaimInvoiceId = lastClaimInvoice.ClaimInvoiceId;
                var startWizardRequest = CreateStartWizardAutoApprovalRequest(personEvent);
                await _wizardService.StartWizard(startWizardRequest);
            }
        }

        private StartWizardRequest CreateStartWizardAutoApprovalRequest(PersonEvent personEvent)
        {
            return new StartWizardRequest
            {
                LinkedItemId = personEvent.ClaimInvoiceId,
                Type = "invoice-payment-approval",
                Data = _serializerService.Serialize(personEvent)
            };
        }

        #endregion
    }
}