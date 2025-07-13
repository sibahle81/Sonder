using Autofac;

namespace RMA.Service.FinCare.RuleTasks
{
    public class ServiceRegistry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            ConsumeTheirServices(builder);
           
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
         
        }
    }
}
