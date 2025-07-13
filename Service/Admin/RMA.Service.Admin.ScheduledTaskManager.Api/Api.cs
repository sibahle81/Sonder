using RMA.Common.Constants;
using RMA.Common.Web.ServiceFabric;

using System.Fabric;

namespace RMA.Service.Admin.ScheduledTaskManager.Api
{
    /// <summary>
    /// The FabricRuntime creates an instance of this class for each service type instance. 
    /// </summary>
    public class Api : HttpSysStatelessService<Startup>
    {
        public Api(StatelessServiceContext context)
            : base(context, AppPrefix.ScheduledTaskManager)
        { }
    }
}
