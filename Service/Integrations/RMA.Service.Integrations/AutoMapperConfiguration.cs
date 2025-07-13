using AutoMapper;

using RMA.Service.Integrations.Mappers;

namespace RMA.Service.Integrations
{
    public static class AutoMapperConfiguration
    {
        private static bool _isInit;


        public static void Configure()
        {
            if (_isInit) return;

            Mapper.Initialize(profile =>
            {
                profile.AddProfile<IntegrationMapperProfile>();
            });
            Mapper.Configuration.AssertConfigurationIsValid();

            _isInit = true;
        }
    }
}