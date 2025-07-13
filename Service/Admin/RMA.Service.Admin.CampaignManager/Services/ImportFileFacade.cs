using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Database.Entities;

using System;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Services
{
    public class ImportFileFacade : RemotingStatelessService, IImportFileService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<campaign_ImportFile> _importFilesRepository;
        private readonly IMapper _mapper;

        public ImportFileFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<campaign_ImportFile> importFilesRepository
            , IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _importFilesRepository = importFilesRepository;
            _mapper = mapper;
        }

        public async Task<ImportFile> GetImportFileById(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _importFilesRepository
                    .Where(s => s.Id == id)
                    .ProjectTo<ImportFile>(_mapper.ConfigurationProvider)
                    .SingleAsync($"ImportFile with id {id} could not be found.");

                return entity;
            }
        }

        public async Task<ImportFile> GetImportFile(Guid fileToken)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var importFile = await _importFilesRepository
                    .Where(file => file.FileToken.Equals(fileToken))
                    .ProjectTo<ImportFile>(_mapper.ConfigurationProvider)
                    .SingleOrDefaultAsync();
                return importFile;
            }
        }

        public async Task<int> AddImportFile(ImportFile importFile)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var entity = _mapper.Map<campaign_ImportFile>(importFile);
                _importFilesRepository.Create(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }

        public async Task EditImportFile(ImportFile importFile)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<campaign_ImportFile>(importFile);
                _importFilesRepository.Update(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }
    }
}