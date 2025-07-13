using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Filters;
using RMA.Common.Database.Contracts.Repository;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace RMA.Common.Database.Repository
{
    public class EfRepositorySoftDeleteEntities<TEntity, TContext> : EfRepository<TEntity, TContext>
        where TEntity : class, ISoftDeleteEntity
        where TContext : RmaDbContext, IFilteredDbContext
    {
        public EfRepositorySoftDeleteEntities(IAmbientDbContextLocator ambientDbContextLocator)
            : base(ambientDbContextLocator)
        {
        }

        public override TEntity FindById(params object[] keyValues)
        {
            return FindByIdAsync(keyValues).Result;
        }

        public override async Task<TEntity> FindByIdAsync(params object[] keyValues)
        {
            var entity = await Set.FindAsync(keyValues);
            if (entity == null || entity.IsDeleted) return null;
            return entity;
        }

        public override TEntity Create(TEntity entity, bool skipAuditing = false)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity), "entity is null");
            entity.IsDeleted = false;
            return base.Create(entity, skipAuditing);
        }

        public override void Delete(TEntity entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity), "entity is null");
            entity.IsDeleted = true;
            //entity.DeletionDate = DateTimeHelper.SaNow;//TODO
            Update(entity, u => u.IsDeleted); //, u => u.DeletionDate
        }

        public override void Delete(Expression<Func<TEntity, bool>> predicate)
        {
            var entities = Set.Where(predicate).ToList();
            entities.ForEach(e =>
            {
                e.IsDeleted = true;
                //e.DeletionDate = DateTimeHelper.SaNow; //TODO
            });
            Update(entities, u => u.IsDeleted); //, u => u.DeletionDate
        }

        public override void Delete(List<TEntity> entities)
        {
            if (entities == null) throw new ArgumentNullException(nameof(entities), "entity is null");
            entities.ForEach(e =>
            {
                e.IsDeleted = true;
                //e.DeletionDate = DateTimeHelper.SaNow;//TODO
            });
            Update(entities, u => u.IsDeleted); //, u => u.DeletionDate
        }
    }
}