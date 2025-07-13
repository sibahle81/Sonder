using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Exceptions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using INoteService = RMA.Service.ClaimCare.Contracts.Interfaces.Event.INoteService;

namespace RMA.Service.ClaimCare.Services.Event
{
    public class NoteFacade : RemotingStatelessService, INoteService
    {
        private const string ClaimsModulePermissions = "ClaimsModulePermissions";

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<claim_EventNote> _noteRepository;
        private readonly IConfigurationService _configurationService;

        public NoteFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<claim_EventNote> noteRepository,
            IConfigurationService configurationService
            ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _noteRepository = noteRepository;
            _configurationService = configurationService;
        }

        public async Task<EventNote> GetNote(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewNote);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var note = await _noteRepository
                    .ProjectTo<EventNote>()
                    .SingleAsync(s => s.Id == id, $"Could not find a note with the id {id}");

                return note;
            }
        }

        public async Task<int> AddNote(EventNote note)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddNote);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_EventNote>(note);
                _noteRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.EventNoteId;
            }
        }

        public async Task EditNote(EventNote noteModel)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditNote);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataNote = await _noteRepository.ProjectTo<EventNote>()
                    .SingleAsync(s => s.Id == noteModel.Id, $"Could not find a note with the id {noteModel.Id}");
                if (ModifiedByIsDifferent(noteModel, dataNote))
                    throw new BusinessException("A note cannot be edited except by the user that created it");

                var entity = Mapper.Map<claim_EventNote>(noteModel);
                _noteRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<List<EventNote>> GetNotes(int eventId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewNote);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var notes = await _noteRepository
                    .Where(note => note.EventId == eventId)
                    .ProjectTo<EventNote>()
                    .ToListAsync();

                notes.ForEach(
                    note => note.Text = note.Text.Length > 30 ? $"{note.Text.Substring(0, 30)}..." : note.Text);
                return notes;
            }
        }

        private static bool ModifiedByIsDifferent(EventNote note, EventNote dataNote)
        {
            return string.CompareOrdinal(note.ModifiedBy, dataNote.CreatedBy) > 0;
        }
    }
}