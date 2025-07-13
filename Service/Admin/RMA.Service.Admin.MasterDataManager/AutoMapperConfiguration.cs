using Autofac;
using AutoMapper;

using RMA.Service.Admin.MasterDataManager.Mappers;

namespace RMA.Service.Admin.MasterDataManager
{
    public static class AutoMapperConfiguration
    {
        //Force Recompile 2025/02/05 -- PLEASE DO NOT REMOVE THIS LINE, JUST CHANGE THE DATE TO FORCE
        //Force Recompile 2025/02/18 -- PLEASE DO NOT REMOVE THIS LINE, JUST CHANGE THE DATE TO FORCE
        //Force Recompile 2025/02/19 -- PLEASE DO NOT REMOVE THIS LINE, JUST CHANGE THE DATE TO FORCE
        //Force Recompile 2025/03/03 -- PLEASE DO NOT REMOVE THIS LINE, JUST CHANGE THE DATE TO FORCE
        //Force Recompile 2025/03/03 -- PLEASE DO NOT REMOVE THIS LINE, JUST CHANGE THE DATE TO FORCE
        //Force Recompile 2025/03/31 -- PLEASE DO NOT REMOVE THIS LINE, JUST CHANGE THE DATE TO FORCE
        //Force Recompile 2025/04/15 -- PLEASE DO NOT REMOVE THIS LINE, JUST CHANGE THE DATE TO FORCE
        //Force Recompile 2025/06/21 -- PLEASE DO NOT REMOVE THIS LINE, JUST CHANGE THE DATE TO FORCE
        private static bool _isInit;

        public static void Configure(ContainerBuilder builder)
        {
            if (_isInit) return;

            var mapperConfiguration = new MapperConfiguration(cfg => cfg.AddProfile(new MasterDataManagerMappingProfile()));
            mapperConfiguration.AssertConfigurationIsValid();
            var mapper = mapperConfiguration.CreateMapper();
            builder.RegisterInstance<IMapper>(mapper);

            _isInit = true;
        }
    }
}