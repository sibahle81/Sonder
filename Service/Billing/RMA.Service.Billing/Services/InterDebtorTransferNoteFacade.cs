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
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Entities;

using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Services
{
    public class InterDebtorTransferNoteFacade : RemotingStatelessService, IInterDebtorTransferNoteService
    {
        private const string BillingModulePermissions = "BillingModulePermissions";

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<billing_InterDebtorTransferNote> _noteRepository;
        private readonly IConfigurationService _configurationService;

        public InterDebtorTransferNoteFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<billing_InterDebtorTransferNote> noteRepository,
            IConfigurationService configurationService
            ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _noteRepository = noteRepository;
            _configurationService = configurationService;
        }

        public async Task<Note> GetNote(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewBillingNote);

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
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddBillingNote);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<billing_InterDebtorTransferNote>(noteModel);
                _noteRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }

        public async Task EditNote(Note noteModel)
        {
            Contract.Requires(noteModel != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditBillingNote);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataNote = await _noteRepository.ProjectTo<Note>()
                    .SingleAsync(s => s.Id == noteModel.Id, $"Could not find a note with the id {noteModel.Id}");
                if (ModifiedByIsDifferent(noteModel, dataNote))
                    throw new BusinessException("A note cannot be edited except by the user that created it");

                var entity = Mapper.Map<billing_InterDebtorTransferNote>(noteModel);
                _noteRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<List<Note>> GetNotes(int interDebtorTransferId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewBillingNote);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var notes = await _noteRepository
                    .Where(note => note.InterDebtorTransferId == interDebtorTransferId)
                    .ProjectTo<Note>()
                    .ToListAsync();

                notes.ForEach(
                    note => note.Text = note.Text.Length > 30 ? $"{note.Text.Substring(0, 30)}..." : note.Text);
                return notes;
            }
        }

        private static bool ModifiedByIsDifferent(Note note, Note dataNote)
        {
            return string.CompareOrdinal(note.ModifiedBy, dataNote.CreatedBy) > 0;
        }
    }
}