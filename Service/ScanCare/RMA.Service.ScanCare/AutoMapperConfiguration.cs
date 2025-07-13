using AutoMapper;

using RMA.Service.ScanCare.Mappers;

namespace RMA.Service.ScanCare
{
    public static class AutoMapperConfiguration
    {
        private static bool _isInit = false;

        public static void Configure()
        {
            if (_isInit) return;

            Mapper.Initialize(x => x.AddProfile<ScanCareMappingProfile>());
            Mapper.Configuration.AssertConfigurationIsValid();

            _isInit = true;
        }
    }
}
