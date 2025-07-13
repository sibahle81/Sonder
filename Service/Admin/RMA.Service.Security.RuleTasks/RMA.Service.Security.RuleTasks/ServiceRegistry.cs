using Autofac;

using RMA.Common.Constants;
using RMA.Common.Service.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Security.RuleTasks.User.UserExistsInCompcare;

namespace RMA.Service.Security.RuleTasks
{
    public class ServiceRegistry : Module
    {

        protected override void Load(ContainerBuilder builder)
        {
            ConsumeTheirServices(builder);
            builder.RegisterType<UserExistsInCompcare>().Named<IRule>(UserExistsInCompcare.RuleName);
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            builder.UseStatelessService<IUserService>(AppNames.Admin, AppPrefix.SecurityManager);
            builder.UseStatelessService<IConfigurationService>(AppNames.Admin, AppPrefix.MasterDataManager);
        }
    }
}
