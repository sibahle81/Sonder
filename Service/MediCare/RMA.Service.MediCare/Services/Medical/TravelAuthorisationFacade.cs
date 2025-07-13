using AutoMapper;
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Entities;
using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class TravelAuthorisationFacade : RemotingStatelessService, ITravelAuthorisationService
    {
        private const string SoftDeleteFilter = "SoftDeletes";
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<medical_TravelAuthorisation> _travelAuthorisationRepository;
        private readonly IRepository<medical_Invoice> _invoiceRepository;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly ICommonSystemNoteService _commonSystemNoteService;
        private readonly IUserService _userService;
        private readonly IUserReminderService _userReminderService;

        public TravelAuthorisationFacade(StatelessServiceContext context
           , IDbContextScopeFactory dbContextScopeFactory
           , IDocumentGeneratorService documentGeneratorService
           , ICommonSystemNoteService commonSystemNoteService
           , IRepository<medical_TravelAuthorisation> travelAuthorisationRepository
           , IUserService userService
           , IUserReminderService userReminderService
           , IRepository<medical_Invoice> invoiceRepository)
           : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _travelAuthorisationRepository = travelAuthorisationRepository;
            _invoiceRepository = invoiceRepository;
            _documentGeneratorService = documentGeneratorService;
            _commonSystemNoteService = commonSystemNoteService;
            _userService = userService;
            _userReminderService = userReminderService;
         }

        public async Task<int> AddTravelAuthorisation(TravelAuthorisation travelAuthorisation)
        {
            Contract.Requires(travelAuthorisation != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                travelAuthorisation.TravelAuthNumber = await GenerateTravelAuthorisationNumber();
                var entity = Mapper.Map<medical_TravelAuthorisation>(travelAuthorisation);
                _travelAuthorisationRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.TravelAuthorisationId;
            }
        }

        public async Task EditTravelAuthorisation(TravelAuthorisation travelAuthorisation)
        {
            Contract.Requires(travelAuthorisation != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var datatravelAuthorisation = await _travelAuthorisationRepository.Where(x => x.TravelAuthorisationId == travelAuthorisation.TravelAuthorisationId).SingleAsync();

                datatravelAuthorisation.TravelAuthorisedParty = travelAuthorisation.TravelAuthorisedParty;
                datatravelAuthorisation.DateAuthorisedFrom = travelAuthorisation.DateAuthorisedFrom;
                datatravelAuthorisation.DateAuthorisedTo = travelAuthorisation.DateAuthorisedTo;
                datatravelAuthorisation.AuthorisedKm = travelAuthorisation.AuthorisedKm;
                datatravelAuthorisation.TravelRateTypeId = travelAuthorisation.TravelRateTypeId;
                datatravelAuthorisation.AuthorisedRate = travelAuthorisation.AuthorisedRate;
                datatravelAuthorisation.AuthorisedAmount = travelAuthorisation.AuthorisedAmount;
                datatravelAuthorisation.Description = travelAuthorisation.Description;
                datatravelAuthorisation.IsPreAuthorised = travelAuthorisation.IsPreAuthorised;
                _travelAuthorisationRepository.Update(datatravelAuthorisation);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }

        public async Task DeleteTravelAuthorisation(int travelAuthId)
        {
            var userReminders = new List<UserReminder>();
            using (var scope = _dbContextScopeFactory.Create())
            {
                var travelAuthEntity = await _travelAuthorisationRepository.SingleAsync(c => c.TravelAuthorisationId == travelAuthId);
                travelAuthEntity.IsDeleted = true;
                _travelAuthorisationRepository.Update(travelAuthEntity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                var recipients = await _userService.SearchUsersByPermission("Preauth manager view");

                foreach (var recipient in recipients)
                {
                    var userReminder = new UserReminder
                    {
                        AssignedToUserId = recipient.Id,
                        UserReminderItemType = UserReminderItemTypeEnum.MedicareAllMainNotifications,
                        UserReminderType = UserReminderTypeEnum.SystemNotification,
                        CreatedBy = RmaIdentity.UsernameOrBlank,
                        AlertDateTime = DateTimeHelper.SaNow,
                        Text = $"Deleted Travel Auth which has paid invoices {travelAuthEntity.TravelAuthNumber}"
                    };

                    userReminders.Add(userReminder);
                }
            }

            _ = Task.Run(() => _userReminderService.CreateUserReminders(userReminders));
        }

        public async Task AddTravelAuthorisationRejectionComment(int travelAuthId, string comment)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                _travelAuthorisationRepository.DisableFilter(SoftDeleteFilter);

                var travelAuthEntity = await _travelAuthorisationRepository.SingleAsync(c => c.TravelAuthorisationId == travelAuthId);

                _travelAuthorisationRepository.EnableFilter(SoftDeleteFilter);

                var noteId = await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
                {
                    ItemId = travelAuthEntity.PersonEventId,
                    NoteCategory = NoteCategoryEnum.PersonEvent,
                    NoteItemType = NoteItemTypeEnum.PersonEvent,
                    NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.MediCare } },
                    NoteType = NoteTypeEnum.SystemAdded,
                    Text = comment,
                    IsActive = true
                });
            }
        }

        public async Task<List<TravelAuthorisation>> GetTravelAuthorisations()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var TravelAuthorisations = await _travelAuthorisationRepository.ToListAsync();

                var TravelAuthorisationsResults = Mapper.Map<List<TravelAuthorisation>>(TravelAuthorisations);

                return TravelAuthorisationsResults;
            }
        }

        public async Task<TravelAuthorisation> GetTravelAuthorisation(int travelAuthorisationId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _travelAuthorisationRepository.FirstOrDefaultAsync(i => i.TravelAuthorisationId == travelAuthorisationId);

                var travelAuthorisation = Mapper.Map<TravelAuthorisation>(entity);

                return travelAuthorisation;
            }
        }

        public async Task<bool> IsTravelauthInvoiceProcessed(int travelAuthorisationId, int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var travelAuthInvoiceDetails = await (
                       from tap in _travelAuthorisationRepository
                       join inv in _invoiceRepository on tap.PersonEventId equals inv.PersonEventId
                       where tap.TravelAuthorisationId == travelAuthorisationId && inv.InvoiceStatus == InvoiceStatusEnum.Paid
                       select new { inv.InvoiceId }).ToListAsync();

                return travelAuthInvoiceDetails?.Count > 0 ? true : false;
            }
        }

        public async Task<PagedRequestResult<TravelAuthorisation>> GetPagedTravelAuthorisations(int personEventId, PagedRequest request)
        {
            Contract.Requires(request != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                _travelAuthorisationRepository.DisableFilter(SoftDeleteFilter);

                var query = _travelAuthorisationRepository.AsQueryable().Where(a => a.PersonEventId == personEventId);

                var travelAuthorisations = await query.ToPagedResult(request);

                _travelAuthorisationRepository.EnableFilter(SoftDeleteFilter);

                var data = Mapper.Map<List<TravelAuthorisation>>(travelAuthorisations.Data);


                return new PagedRequestResult<TravelAuthorisation>
                {
                    Page = request.Page,
                    PageCount = (int)Math.Ceiling(travelAuthorisations.RowCount / (double)request.PageSize),
                    RowCount = travelAuthorisations.RowCount,
                    PageSize = request.PageSize,
                    Data = data
                };
            }
        }

        public async Task<PagedRequestResult<TravelAuthorisation>> GetPagedTravelAuthorisationsByAuthorisedParty(int personEventId, int authorisationPartyId, PagedRequest request)
        {
            Contract.Requires(request != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                {
                    var query = _travelAuthorisationRepository.AsQueryable().Where(a => a.PersonEventId == personEventId && (int)a.TravelAuthorisedParty == authorisationPartyId);

                    var travelAuthorisations = await query.ToPagedResult(request);

                    var data = Mapper.Map<List<TravelAuthorisation>>(travelAuthorisations.Data);


                    return new PagedRequestResult<TravelAuthorisation>
                    {
                        Page = request.Page,
                        PageCount = (int)Math.Ceiling(travelAuthorisations.RowCount / (double)request.PageSize),
                        RowCount = travelAuthorisations.RowCount,
                        PageSize = request.PageSize,
                        Data = data
                    };
                }
            }
        }

        public async Task<List<TravelAuthorisation>> GetTebaInvoiceAuthorisations(DateTime treatmentFromDate, int rolePlayerID, int personEventId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);
            List<TravelAuthorisation> preAuthDetailsList = new List<TravelAuthorisation>();

            try
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var preauthList = await _travelAuthorisationRepository
                        .Where(p => p.PersonEventId == personEventId
                         && p.IsPreAuthorised && p.DateAuthorisedFrom <= treatmentFromDate && p.DateAuthorisedTo >= treatmentFromDate).ToListAsync();
                    return Mapper.Map<List<TravelAuthorisation>>(preauthList);
                }
            }
            catch (Exception ex)
            {
                ex.LogException();
                return preAuthDetailsList;
            }
        }

        private async Task<string> GenerateTravelAuthorisationNumber()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.TravelAuthorisation, "");
            }
        }


        public async Task<List<TravelAuthorisation>> CheckIfTravelPreAuthExists(MedicalPreAuthExistCheckParams travelPreAuthExistCheckParams)
        {
            RmaIdentity.DemandPermission(Permissions.ViewPreAuthorisation);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var travelAuthorisations = await _travelAuthorisationRepository
                    .Where(x => x.PersonEventId == travelPreAuthExistCheckParams.PersonEventId &&
                           (x.DateAuthorisedFrom <= travelPreAuthExistCheckParams.DateAdmitted && x.DateAuthorisedTo >= travelPreAuthExistCheckParams.DateAdmitted) ||
                           (x.DateAuthorisedFrom <= travelPreAuthExistCheckParams.DateDischarged && x.DateAuthorisedTo >= travelPreAuthExistCheckParams.DateDischarged)).ToListAsync();
                return Mapper.Map<List<TravelAuthorisation>>(travelAuthorisations);
            }
        }
    
    }
}
