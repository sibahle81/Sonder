using RMA.Common.Entities;
using RMA.Common.Exceptions;
using RMA.Common.Interfaces;

using System.Threading.Tasks;

namespace RMA.Common.Service.Services
{
    public class EmailSenderFacade : IEmailSenderService
    {
        public Task<int> Send(MailRequest request)
        {
            throw new BusinessException("This should not be used as we use Campaign Manager Email Service: Use Campaign Manager Email Service");
        }
    }
}
