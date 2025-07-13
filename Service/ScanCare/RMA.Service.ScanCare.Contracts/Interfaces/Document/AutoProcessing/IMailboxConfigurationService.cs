using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.ScanCare.Contracts.Entities.AutoProcessing;

namespace RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing
{
    public interface IMailboxConfigurationService : IService
    {
        Task<List<MailboxConfiguration>> GetMailboxConfigurations();
    }
}
