using CommonServiceLocator;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;

namespace RMA.Common.Database.Extensions
{
    //BAD : This "Extension" static class utilizes the service locator pattern to do Db Calls each time mappings take place, through the mapping modules in the solution
    public static class MapperExtensions //These are not true reflections of extension methods
    {
        public static TEntity GetEntity<TEntity>(int? id) where TEntity : class, new()
        {
            if (!id.HasValue || id <= 0) return new TEntity();
            var factory = ServiceLocator.Current.GetInstance<IDbContextScopeFactory>(); //We should not be using the service locator for mappings of objects via automapper
            var repository = ServiceLocator.Current.GetInstance<IRepository<TEntity>>(); //We should not be using the service locator for mappings of objects via automapper
            using (factory.CreateReadOnly())
            {
                var entity = repository.FindById(id.Value); //There is a data access layer for this?
                if (entity != null)
                {
                    return entity;
                }
                else
                {
                    return new TEntity(); // This does't seem possible, ...but anything is possible when claims is involved :(
                    //This is indeed possible and should create a new instance of TEntity given TEntity has a public paramaterless constructor
                }
            }
        }

        public static TEntity GetEntity<TEntity>(long? id) where TEntity : class, new()
        {
            if (!id.HasValue || id <= 0) return new TEntity();
            var factory = ServiceLocator.Current.GetInstance<IDbContextScopeFactory>(); //We should not be using the service locator for mappings of objects via automapper
            var repository = ServiceLocator.Current.GetInstance<IRepository<TEntity>>(); //We should not be using the service locator for mappings of objects via automapper
            using (factory.CreateReadOnly())
            {
                var entity = repository.FindById(id.Value);
                return entity;
            }
        }

        public static TEntity GetEntityIncludeDeleted<TEntity>(int? id) where TEntity : class, new()
        {
            if (!id.HasValue || id <= 0) return new TEntity();
            var factory = ServiceLocator.Current.GetInstance<IDbContextScopeFactory>(); //We should not be using the service locator for mappings of objects via automapper
            var repository = ServiceLocator.Current.GetInstance<IRepository<TEntity>>(); //We should not be using the service locator for mappings of objects via automapper
            using (factory.CreateReadOnly())
            {
                var entity = repository.FindByIdIncludeDeleted(id.Value);
                return entity;
            }
        }

    }
}