using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Exceptions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Broker
{
    public class RepresentativeNoteFacade : RemotingStatelessService, IRepresentativeNoteService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<broker_RepresentativeNote> _noteRepository;
        private readonly IConfigurationService _configurationService;
        private const string ClientModulePermissionsFFL = "ClientModulePermissions";
        public RepresentativeNoteFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<broker_RepresentativeNote> noteRepository,
            IConfigurationService configurationService
            ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _noteRepository = noteRepository;
            _configurationService = configurationService;
        }

        public async Task<Note> GetNote(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRepresentative);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var note = await _noteRepository
                    .ProjectTo<Note>()
                    .SingleAsync(s => s.Id == id, $"Could not find a note with the id {id}");

                return note;
            }
        }

        public async Task<int> AddNote(Note noteModel)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddRepresentative);
            if (noteModel != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var entity = Mapper.Map<broker_RepresentativeNote>(noteModel);
                    _noteRepository.Create(entity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);

                    return entity.Id;
                }
            }
            return noteModel.Id;
        }

        public async Task EditNote(Note noteModel)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditRepresentativeWizard);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataNote = await _noteRepository.ProjectTo<Note>()
                    .SingleAsync(s => s.Id == noteModel.Id, $"Could not find a note with the id {noteModel.Id}");
                if (ModifiedByIsDifferent(noteModel, dataNote))
                    throw new BusinessException("A note cannot be edited except by the user that created it");

                var entity = Mapper.Map<broker_RepresentativeNote>(noteModel);
                _noteRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<List<Note>> GetNotes(int representativeId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRepresentative);
            List<Note> notes=null;
            if (representativeId == 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                     notes = await _noteRepository
                        .Where(note => note.RepresentativeId == representativeId)
                        .ProjectTo<Note>()
                        .ToListAsync();

                    notes.ForEach(
                        note => note.Text = note.Text.Length > 30 ? $"{note.Text.Substring(0, 30)}..." : note.Text);
                }
            }
            return notes;
        }

        private static bool ModifiedByIsDifferent(Note note, Note dataNote)
        {
            return string.CompareOrdinal(note?.ModifiedBy, dataNote?.CreatedBy) > 0;
        }
    }
}