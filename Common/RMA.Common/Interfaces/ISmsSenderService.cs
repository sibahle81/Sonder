using RMA.Common.Entities;

using System.Threading.Tasks;

namespace RMA.Common.Interfaces
{
    public interface ISmsSenderService
    {
        Task<int> SendSms(SendSmsRequest request);
        Task<int> SendTemplateSms(TemplateSmsRequest request);
    }
}
