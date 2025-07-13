using RMA.Common.Constants;
using RMA.Common.Web.ServiceFabric;

using System.Fabric;

namespace RMA.Service.Admin.BusinessProcessManager.Api
{
    /// <summary>
    ///     The FabricRuntime creates an instance of this class for each service type instance.
    /// </summary>
    ////Rebuild
    internal sealed class Api : HttpSysStatelessService<Startup>
    {
        public Api(StatelessServiceContext context)
            : base(context, AppPrefix.BusinessProcessManager)
        {
        }
    }
}