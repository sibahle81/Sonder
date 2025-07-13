using Autofac;
using AutoMapper;

using RMA.Service.Admin.RulesManager.Mappers;

namespace RMA.Service.Admin.RulesManager
{
    public static class AutoMapperConfiguration
    {
        private static bool _isInit;

        public static void Configure(ContainerBuilder builder)
        {
            if (_isInit) return;

            var mapperConfiguration = new MapperConfiguration(cfg => cfg.AddProfile(new RulesManagerMapperProfile()));
            mapperConfiguration.AssertConfigurationIsValid();
            var mapper = mapperConfiguration.CreateMapper();
            builder.RegisterInstance<IMapper>(mapper);

            _isInit = true;
        }
    }
}