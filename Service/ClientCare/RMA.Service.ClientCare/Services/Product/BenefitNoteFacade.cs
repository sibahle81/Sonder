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
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Database.Entities;

using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Product
{
    public class BenefitNoteFacade : RemotingStatelessService, IBenefitNoteService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<product_BenefitNote> _noteRepository;
        private readonly IConfigurationService _configurationService;
        private const string ClientModulePermissionsFFL = "ClientModulePermissions";
        public BenefitNoteFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<product_BenefitNote> noteRepository,
            IConfigurationService configurationService) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _noteRepository = noteRepository;
            _configurationService = configurationService;
        }

        public async Task<Note> GetNote(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewBenefit);

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
                RmaIdentity.DemandPermission(Permissions.AddBenefit);
            Contract.Requires(noteModel != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<product_BenefitNote>(noteModel);
                _noteRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }

        public async Task EditNote(Note noteModel)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditBenefit);
            Contract.Requires(noteModel != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataNote = await _noteRepository.ProjectTo<Note>()
                    .SingleAsync(s => s.Id == noteModel.Id, $"Could not find a note with the id {noteModel.Id}");
                if (ModifiedByIsDifferent(noteModel, dataNote))
                    throw new BusinessException("A note cannot be edited except by the user that created it");

                var entity = Mapper.Map<product_BenefitNote>(noteModel);
                _noteRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<List<Note>> GetNotes(string itemType, int itemId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewBenefit);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var notes = await _noteRepository
                    .Where(note => note.BenefitId == itemId)
                    .ProjectTo<Note>()
                    .ToListAsync();

                notes.ForEach(
                    note => note.Text = note.Text.Length > 30 ? $"{note.Text.Substring(0, 30)}..." : note.Text);
                return notes;
            }
        }

        private static bool ModifiedByIsDifferent(Note note, Note dataNote)
        {
            return string.CompareOrdinal(note?.ModifiedBy, dataNote?.CreatedBy) > 0;
        }
    }
}