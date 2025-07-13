using System.Collections.Generic;
using System.Data.Entity;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.ScanCare.Contracts.Entities.AutoProcessing;
using RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing;
using RMA.Service.ScanCare.Database.Entities;

namespace RMA.Service.ScanCare.Services.Document.AutoProcessing
{
    /// <summary>
    /// Facade for exchange mailbox configuration management.
    /// </summary>
    public class MailboxConfigurationFacade : RemotingStatelessService, IMailboxConfigurationService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<documents_MailboxConfiguration> _mailboxConfigurationRepository;

        public MailboxConfigurationFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<documents_MailboxConfiguration> mailboxConfigurationRepository)
        : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _mailboxConfigurationRepository = mailboxConfigurationRepository;
        }

        public async Task<List<MailboxConfiguration>> GetMailboxConfigurations()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var configs = await _mailboxConfigurationRepository.Where(d => d.IsActive).ToListAsync();
                return Mapper.Map<List<MailboxConfiguration>>(configs);
            }
        }
    }
}
