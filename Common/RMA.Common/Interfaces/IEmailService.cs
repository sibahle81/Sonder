using System.Threading.Tasks;
using RMA.Common.Entities;

namespace RMA.Common.Interfaces
{
    public interface IEmailerService
    {
        Task<int> SendEmail(SendMailRequest request);
    }
}
