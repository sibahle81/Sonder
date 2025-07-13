using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Exceptions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.Database.Entities;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.RolePlayer
{
    public class RolePlayerNoteFacade : RemotingStatelessService, IRolePlayerNoteService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<client_RolePlayerNote> _rolePlayerNoteRepository;
        private readonly IConfigurationService _configurationService;

        private const string ClientModulePermissionsFFL = "ClientModulePermissions";


        public RolePlayerNoteFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<client_RolePlayerNote> noteRepository,
            IConfigurationService configurationService
            ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _rolePlayerNoteRepository = noteRepository;
            _configurationService = configurationService;
        }

        public async Task<Note> GetNote(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var note = await _rolePlayerNoteRepository
                    .ProjectTo<Note>()
                    .SingleAsync(s => s.Id == id, $"Could not find a note with the id {id}");

                return note;
            }
        }

        public async Task<int> AddNote(Note noteModel)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddRolePlayer);
            Contract.Requires(noteModel != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<client_RolePlayerNote>(noteModel);
                _rolePlayerNoteRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.RolePlayerNoteId;
            }
        }

        public async Task EditNote(Note noteModel)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditRolePlayer);
            Contract.Requires(noteModel != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataNote = await _rolePlayerNoteRepository.ProjectTo<Note>()
                    .SingleAsync(s => s.Id == noteModel.Id, $"Could not find a note with the id {noteModel?.Id}");
                if (ModifiedByIsDifferent(noteModel, dataNote))
                    throw new BusinessException("A note cannot be edited except by the user that created it");

                var entity = Mapper.Map<client_RolePlayerNote>(noteModel);
                _rolePlayerNoteRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<List<Note>> GetNotes(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var notes = await _rolePlayerNoteRepository
                    .Where(note => note.RolePlayerId == rolePlayerId)
                    .ProjectTo<Note>()
                    .ToListAsync();

                notes.ForEach(
                    note => note.Text = note.Text.Length > 30 ? $"{note.Text.Substring(0, 30)}..." : note.Text);
                return notes.Skip(Math.Max(0, notes.Count() - 3)).ToList();
            }
        }

        private static bool ModifiedByIsDifferent(Note note, Note dataNote)
        {
            return string.CompareOrdinal(note.ModifiedBy, dataNote.CreatedBy) > 0;
        }

        public async Task<PagedRequestResult<RolePlayerNote>> GetPagedRolePlayerNotes(PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);
                var rolePlayerId = Convert.ToInt32(pagedRequest.SearchCriteria);
                var rolePlayerNotes = await (from rolePlayerNote in _rolePlayerNoteRepository
                                             where rolePlayerNote.RolePlayerId == rolePlayerId
                                             select new RolePlayerNote
                                             {
                                                 RolePlayerNoteId = rolePlayerNote.RolePlayerNoteId,
                                                 RolePlayerId = rolePlayerNote.RolePlayerId,
                                                 Text = rolePlayerNote.Text,
                                                 CreatedBy = rolePlayerNote.CreatedBy,
                                                 CreatedDate = rolePlayerNote.CreatedDate,
                                                 ModifiedBy = rolePlayerNote.ModifiedBy,
                                                 ModifiedDate = rolePlayerNote.ModifiedDate
                                             }
                    ).ToPagedResult(pagedRequest);

                return new PagedRequestResult<RolePlayerNote>
                {
                    Data = rolePlayerNotes.Data,
                    RowCount = rolePlayerNotes.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(rolePlayerNotes.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task<List<RolePlayerNote>> GetRolePlayerNotes(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var notes = await _rolePlayerNoteRepository
                    .Where(note => note.RolePlayerId == rolePlayerId)
                    .ProjectTo<RolePlayerNote>()
                    .ToListAsync();

                notes.ForEach(
                    note => note.Text = note.Text.Length > 30 ? $"{note.Text.Substring(0, 30)}..." : note.Text);

                return notes;
            }
        }

        public async Task<int> AddRolePlayerNote(RolePlayerNote rolePlayerNote)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<client_RolePlayerNote>(rolePlayerNote);
                _rolePlayerNoteRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.RolePlayerNoteId;
            }
        }

        public async Task EditRolePlayerNote(RolePlayerNote rolePlayerNote)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<client_RolePlayerNote>(rolePlayerNote);
                _rolePlayerNoteRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }
    }
}