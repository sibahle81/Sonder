using AutoMapper;

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
    public class UploadsFacade : RemotingStatelessService, IUploadsService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_Upload> _uploadsRepository;
        private readonly IMapper _mapper;

        public UploadsFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_Upload> uploadsRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _uploadsRepository = uploadsRepository;
            _mapper = mapper;
        }

        public async Task<List<Uploads>> GetUploads()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var uploads = await _uploadsRepository
                    .Select(c => new Uploads
                    {
                        Id = c.Id,
                        MimeType = c.MimeType,
                        Name = c.Name,
                        Size = c.Size,
                        Token = c.Token
                    })
                    .ToListAsync();

                return uploads;
            }
        }

        public async Task<Uploads> GetUploadByToken(Guid token)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var upload = await _uploadsRepository.FirstOrDefaultAsync(u => u.Token == token);
                if (upload == null) return null;
                return _mapper.Map<Uploads>(upload);
            }
        }

        public async Task<Uploads> GetUploadById(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var upload = await _uploadsRepository.FirstOrDefaultAsync(u => u.Id == id);
                if (upload == null) return null;
                return _mapper.Map<Uploads>(upload);
            }
        }

        public async Task<Uploads> SaveUpload(Uploads upload)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_Upload>(upload);
                _uploadsRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);

                return _mapper.Map<Uploads>(entity);
            }
        }

        public async Task DeleteUpload(int id)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                _uploadsRepository.Delete(d => d.Id == id);
                await scope.SaveChangesAsync();
            }
        }

    }
}