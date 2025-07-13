using AutoMapper;

using RMA.Service.Billing.Mappers;

namespace RMA.Service.Billing
{
    public static class AutoMapperConfiguration
    {
        private static bool _isInit = false;

        public static void Configure()
        {
                if (_isInit) return;

                Mapper.Initialize(x => x.AddProfile<BillingMappingProfile>());
                Mapper.Configuration.AssertConfigurationIsValid();

                _isInit = true;
        }
    }
}