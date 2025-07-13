using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class RequiredDocumentFacade : RemotingStatelessService, IRequiredDocumentService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_RequiredDocument> _requiredDocumentRepository;
        private readonly IMapper _mapper;

        public RequiredDocumentFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_RequiredDocument> requiredDocumentRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _requiredDocumentRepository = requiredDocumentRepository;
            _mapper = mapper;
        }

        public async Task<List<RequiredDocument>> GetRequiredDocuments()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _requiredDocumentRepository.ToListAsync();
                return _mapper.Map<List<RequiredDocument>>(data);
            }
        }

        public async Task<RequiredDocument> GetRequiredDocument(int id)
        {

            //TODO: Check if we should remove this.
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var requiredDocument = await _requiredDocumentRepository
                    .ProjectTo<RequiredDocument>(_mapper.ConfigurationProvider)
                    .SingleAsync(s => s.ModuleId == id,
                        $"Could not find required document with id {id}");

                return requiredDocument;
            }
        }

        public async Task<int> AddRequiredDocument(RequiredDocument requiredDocument)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {

                var entity = _mapper.Map<common_RequiredDocument>(requiredDocument);
                _requiredDocumentRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);

                return entity.Id;

            }
        }

        public async Task EditRequiredDocument(RequiredDocument requiredDocument)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_RequiredDocument>(requiredDocument);
                _requiredDocumentRepository.Update(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }

        public async Task RemoveRequiredDocument(int id)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                _requiredDocumentRepository.Delete(d => d.Id == id);
                await scope.SaveChangesAsync();
            }
        }

        public async Task<List<RequiredDocument>> GetRequiredDocumentsByModuleCategory(int moduleId,
            DocumentCategoryEnum documentCategory)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var requiredDocuments = await _requiredDocumentRepository.Where(requiredDocument =>
                        requiredDocument.DocumentCategory == documentCategory &&
                        requiredDocument.ModuleId == moduleId)
                    .ProjectTo<RequiredDocument>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return requiredDocuments;
            }
        }
    }
}