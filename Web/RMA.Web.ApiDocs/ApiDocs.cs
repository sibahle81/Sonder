using RMA.Common.Constants;
using RMA.Common.Web.ServiceFabric;

using System.Fabric;

namespace RMA.Web.ApiDocs
{
    /// <summary>
    /// The FabricRuntime creates an instance of this class for each service type instance. 
    /// </summary>
    internal sealed class ApiDocs : HttpSysStatelessService<Startup>
    {
        public ApiDocs(StatelessServiceContext context)
            : base(context, AppPrefix.ApiDocs)
        { }
    }
}
