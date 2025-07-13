using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class OwnerUploadFacade : RemotingStatelessService, IOwnerUploadService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_OwnerUpload> _ownerUploadRepository;
        private readonly IMapper _mapper;

        public OwnerUploadFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_OwnerUpload> ownerUploadRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _ownerUploadRepository = ownerUploadRepository;
            _mapper = mapper;
        }

        public async Task<List<OwnerUpload>> GetOwnerUploads()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var uploads = await _ownerUploadRepository
                    .Select(ownerUpload => new OwnerUpload
                    {
                        OwnerId = ownerUpload.OwnerId,
                        OwnerType = ownerUpload.OwnerType,
                        UploadId = ownerUpload.UploadId,
                        IsActive = ownerUpload.IsActive,
                        IsDeleted = ownerUpload.IsDeleted,
                        ModifiedBy = ownerUpload.ModifiedBy,
                        ModifiedDate = ownerUpload.ModifiedDate,
                        CreatedBy = ownerUpload.CreatedBy,
                        CreatedDate = ownerUpload.CreatedDate
                    }).ToListAsync();

                return uploads;
            }
        }

        public async Task<List<OwnerUpload>> GetOwnerUploadsByIdAndType(int ownerId, string ownerTypeName)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var list = await _ownerUploadRepository
                    .Where(ownerUpload => ownerUpload.OwnerId == ownerId && ownerUpload.OwnerType == ownerTypeName
                                          && ownerUpload.IsActive && !ownerUpload.IsDeleted)
                    .Select(ownerUpload => new OwnerUpload
                    {
                        Id = ownerUpload.Id,
                        OwnerId = ownerUpload.OwnerId,
                        OwnerType = ownerUpload.OwnerType,
                        UploadId = ownerUpload.UploadId,

                        Name = ownerUpload.Upload == null ? "" : ownerUpload.Upload.Name,
                        DocumentType = ownerUpload.Upload == null ? "" : ownerUpload.Upload.MimeType,
                        Token = ownerUpload.Upload == null ? Guid.Empty : ownerUpload.Upload.Token,

                        IsActive = ownerUpload.IsActive,
                        IsDeleted = ownerUpload.IsDeleted,
                        ModifiedBy = ownerUpload.ModifiedBy,
                        ModifiedDate = ownerUpload.ModifiedDate,
                        CreatedBy = ownerUpload.CreatedBy,
                        CreatedDate = ownerUpload.CreatedDate
                    })
                    .ToListAsync();
                return list;
            }
        }

        public async Task<OwnerUpload> GetOwnerUpload(int uploadId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _ownerUploadRepository
                    .Where(w => w.UploadId == uploadId)
                    .ProjectTo<OwnerUpload>(_mapper.ConfigurationProvider)
                    .SingleAsync($"Could not find owner upload with upload id {uploadId}");
                return result;
            }
        }

        public async Task<List<int>> AddOwnerUpload(List<OwnerUpload> ownerUpload)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<List<common_OwnerUpload>>(ownerUpload);
                entity.ForEach(upload => upload.IsActive = true);

                _ownerUploadRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);

                return _mapper.Map<List<int>>(entity.Select(owner => owner.Id).ToList());
            }
        }

        public async Task<OwnerUpload> SaveOwnerUpload(OwnerUpload ownerUpload)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_OwnerUpload>(ownerUpload);
                _ownerUploadRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return _mapper.Map<OwnerUpload>(entity);
            }
        }

        public async Task DeleteOwnerUploads(int uploadId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                _ownerUploadRepository.Delete(d => d.Id == uploadId);
                await scope.SaveChangesAsync();
            }
        }
    }
}