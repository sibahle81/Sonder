using Autofac;

using CommonServiceLocator;

using Serilog;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Common.Service.ServiceLocation
{
    /// <summary>
    ///     Autofac implementation of the Microsoft CommonServiceLocator.
    /// </summary>
    public class AutofacServiceLocator : ServiceLocatorImplBase
    {
        /// <summary>
        ///     Initializes a new instance of the <see cref="AutofacServiceLocator" /> class.
        /// </summary>
        /// <param name="container">
        ///     The <see cref="Autofac.IComponentContext" /> from which services
        ///     should be located.
        /// </param>
        /// <exception cref="System.ArgumentNullException">
        ///     Thrown if <paramref name="container" /> is <see langword="null" />.
        /// </exception>
        public AutofacServiceLocator(IContainer container)
        {
            Container = container ?? throw new ArgumentNullException(nameof(container));
        }

        /// <summary>
        ///     The <see cref="Autofac.IComponentContext" /> from which services
        ///     should be located.
        /// </summary>
        public static IContainer Container { get; private set; }

        /// <summary>
        ///     Resolves the requested service instance.
        /// </summary>
        /// <param name="serviceType">Type of instance requested.</param>
        /// <param name="name">Name of registered service you want. May be <see langword="null" />.</param>
        /// <returns>The requested service instance.</returns>
        /// <exception cref="System.ArgumentNullException">
        ///     Thrown if <paramref name="serviceType" /> is <see langword="null" />.
        /// </exception>
        protected override object DoGetInstance(Type serviceType, string key)
        {
            if (serviceType == null) throw new ArgumentNullException(nameof(serviceType));

            //Changes not to throw exception if the type is not registered
            if (key != null)
            {
                if (Container.IsRegisteredWithName(key, serviceType))
                    return Container.ResolveNamed(key, serviceType);

                var logMsgKey = $"Service Type '{serviceType.FullName}' and key '{key}' is not registered in the container";
                Log.Logger.Debug(logMsgKey);
            }
            else
            {
                if (Container.IsRegistered(serviceType))
                    return Container.Resolve(serviceType);
                var logMsg = $"Service Type '{serviceType.FullName}' is not registered in the container";
                Log.Logger.Debug(logMsg);
            }
            return null;
        }

        /// <summary>
        ///     Resolves all requested service instances.
        /// </summary>
        /// <param name="serviceType">Type of instance requested.</param>
        /// <returns>Sequence of service instance objects.</returns>
        /// <exception cref="System.ArgumentNullException">
        ///     Thrown if <paramref name="serviceType" /> is <see langword="null" />.
        /// </exception>
        protected override IEnumerable<object> DoGetAllInstances(Type serviceType)
        {
            if (serviceType == null) throw new ArgumentNullException(nameof(serviceType));

            var enumerableType = typeof(IEnumerable<>).MakeGenericType(serviceType);

            var instance = Container.Resolve(enumerableType);
            return ((IEnumerable)instance).Cast<object>();
        }
    }
}