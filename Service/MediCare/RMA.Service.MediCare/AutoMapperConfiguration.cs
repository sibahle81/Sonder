using AutoMapper;

using RMA.Service.MediCare.Mappers;

namespace RMA.Service.MediCare
{
    public static class AutoMapperConfiguration
    {
        private static bool _isInit;

        public static void Configure()
        {
            if (_isInit) return;

            Mapper.Initialize(profile => profile.AddProfile<MediCareMappingProfile>());
            Mapper.Configuration.AssertConfigurationIsValid();

            _isInit = true;
        }
    }
}
