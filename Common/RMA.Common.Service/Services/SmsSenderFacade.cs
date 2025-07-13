using RMA.Common.Entities;
using RMA.Common.Interfaces;

using System;
using System.Threading.Tasks;

namespace RMA.Common.Service.Services
{
    public class SmsSenderFacade : ISmsSenderService
    {
        public Task<int> SendSms(SendSmsRequest request)
        {
            throw new NotImplementedException("Should use SMS with service bus");
        }

        public Task<int> SendTemplateSms(TemplateSmsRequest request)
        {
            throw new NotImplementedException("Should use SMS with service bus");
        }
    }
}
