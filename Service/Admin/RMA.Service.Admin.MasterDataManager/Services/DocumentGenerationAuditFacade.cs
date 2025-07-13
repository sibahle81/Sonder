using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class DocumentGenerationAuditFacade : RemotingStatelessService, IDocumentGenerationAuditService
    {

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_DocumentGeneratorAudit> _documentGeneratorRepository;
        private readonly IMapper _mapper;


        public DocumentGenerationAuditFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<common_DocumentGeneratorAudit> documentGeneratorRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _documentGeneratorRepository = documentGeneratorRepository;
            _mapper = mapper;
        }

        public async Task<int> AddAudit(DocumentGeneratorAudit audit)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_DocumentGeneratorAudit>(audit);
                _documentGeneratorRepository.Create(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }
    }
}
