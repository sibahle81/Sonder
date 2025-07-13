using Autofac;
using AutoMapper;

using RMA.Service.Admin.ScheduledTaskManager.Mappers;

namespace RMA.Service.Admin.ScheduledTaskManager
{
    public static class AutoMapperConfiguration
    {
        private static bool _isInit = false;

        public static void Configure(ContainerBuilder builder)
        {
            if (_isInit) return;

            var mapperConfiguration = new MapperConfiguration(cfg => cfg.AddProfile(new ScheduledTaskMappingProfile()));
            mapperConfiguration.AssertConfigurationIsValid();
            var mapper = mapperConfiguration.CreateMapper();
            builder.RegisterInstance<IMapper>(mapper);

            _isInit = true;
        }
    }
}
