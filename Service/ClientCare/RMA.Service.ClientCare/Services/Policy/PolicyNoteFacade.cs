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
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Database.Entities;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class PolicyNoteFacade : RemotingStatelessService, IPolicyNoteService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IConfigurationService _configurationService;
        private readonly IRepository<policy_PolicyNote> _policyNoteRepository;

        private const string ClientModulePermissionsFFL = "ClientModulePermissions";

        public PolicyNoteFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IConfigurationService configurationService,
            IRepository<policy_PolicyNote> policyNoteRepository
            ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _configurationService = configurationService;
            _policyNoteRepository = policyNoteRepository;
        }

        public async Task<Note> GetNote(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var note = await _policyNoteRepository
                    .ProjectTo<Note>()
                    .SingleAsync(s => s.Id == id, $"Could not find a note with the id {id}");

                return note;
            }
        }

        public async Task<int> AddNote(Note noteModel)
        {
            Contract.Requires(noteModel != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddPolicy);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<policy_PolicyNote>(noteModel);
                _policyNoteRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.PolicyNoteId;
            }
        }

        public async Task EditNote(Note noteModel)
        {
            Contract.Requires(noteModel != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataNote = await _policyNoteRepository.ProjectTo<Note>()
                    .SingleAsync(s => s.Id == noteModel.Id, $"Could not find a note with the id {noteModel.Id}");
                if (ModifiedByIsDifferent(noteModel, dataNote))
                    throw new BusinessException("A note cannot be edited except by the user that created it");

                var entity = Mapper.Map<policy_PolicyNote>(noteModel);
                _policyNoteRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<List<Note>> GetNotes(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var notes = await _policyNoteRepository
                    .Where(note => note.PolicyId == policyId)
                    .ProjectTo<Note>()
                    .ToListAsync();

                return notes.ToList();
            }
        }

        private static bool ModifiedByIsDifferent(Note note, Note dataNote)
        {
            return string.CompareOrdinal(note?.ModifiedBy, dataNote?.CreatedBy) > 0;
        }

        public async Task<PagedRequestResult<PolicyNote>> GetPagedPolicyNotes(PagedRequest pagedRequest)
        {
            Contract.Requires(pagedRequest != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);
                var policyId = Convert.ToInt32(pagedRequest.SearchCriteria);
                var policyNotes = await (from policyNote in _policyNoteRepository
                                         where policyNote.PolicyId == policyId
                                         select new PolicyNote
                                         {
                                             PolicyNoteId = policyNote.PolicyNoteId,
                                             PolicyId = policyNote.PolicyId,
                                             Text = policyNote.Text,
                                             CreatedBy = policyNote.CreatedBy,
                                             CreatedDate = policyNote.CreatedDate,
                                             ModifiedBy = policyNote.ModifiedBy,
                                             ModifiedDate = policyNote.ModifiedDate
                                         }
                    ).ToPagedResult(pagedRequest);

                return new PagedRequestResult<PolicyNote>
                {
                    Data = policyNotes.Data,
                    RowCount = policyNotes.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(policyNotes.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task<int> AddPolicyNote(PolicyNote policyNote)
        {
            Contract.Requires(policyNote != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddPolicy);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<policy_PolicyNote>(policyNote);
                _policyNoteRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.PolicyNoteId;
            }
        }

        public async Task EditPolicyNote(PolicyNote policyNote)
        {
            Contract.Requires(policyNote != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<policy_PolicyNote>(policyNote);
                _policyNoteRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }
    }
}