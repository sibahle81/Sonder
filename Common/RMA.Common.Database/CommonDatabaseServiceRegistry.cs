using Autofac;

using RMA.Common.Database.ContextScope;
using RMA.Common.Database.Contracts.ContextScope;

namespace RMA.Common.Database
{
    public class CommonDatabaseServiceRegistry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            builder.RegisterInstance(new AmbientDbContextLocator()).As<IAmbientDbContextLocator>().SingleInstance();
            builder.RegisterInstance(new DbContextScopeFactory()).As<IDbContextScopeFactory>().SingleInstance();
        }
    }
}