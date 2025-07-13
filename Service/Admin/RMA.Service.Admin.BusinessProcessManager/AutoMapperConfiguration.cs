using Autofac;
using AutoMapper;

using RMA.Service.Admin.BusinessProcessManager.Mappers;

namespace RMA.Service.Admin.BusinessProcessManager
{
    public static class AutoMapperConfiguration
    {
        private static bool _isInit;

        public static void Configure(ContainerBuilder builder)
        {
            if (_isInit) return;

            var mapperConfiguration = new MapperConfiguration(cfg => cfg.AddProfile(new BusinessProcessManagerMappingProfile()));
            mapperConfiguration.AssertConfigurationIsValid();
            var mapper = mapperConfiguration.CreateMapper();
            builder.RegisterInstance<IMapper>(mapper);

            _isInit = true;
        }
    }
}