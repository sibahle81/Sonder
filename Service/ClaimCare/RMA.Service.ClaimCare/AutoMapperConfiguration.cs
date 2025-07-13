using AutoMapper;

using RMA.Service.ClaimCare.Mappers;

namespace RMA.Service.ClaimCare
{
    public static class AutoMapperConfiguration
    {
        private static bool _isInit;

        public static void Configure()
        {
            if (_isInit) return;

            Mapper.Initialize(x => x.AddProfile<ClaimCareMappingProfile>());
            Mapper.Configuration.AssertConfigurationIsValid();

            _isInit = true;
        }
    }
}