using RMA.Common.Entities;

using System.Threading.Tasks;

namespace RMA.Common.Interfaces
{
    public interface IEmailSenderService
    {
        Task<int> Send(MailRequest request);
    }
}