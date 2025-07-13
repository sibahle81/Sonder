namespace RMA.Common.Database.Contracts.Filters
{
    public interface IFilteredDbContext
    {
        string ConnectionString { get; }
        void DisableFilters();
        void EnableFilters();
        void DisableFilter(string filterName);
        void EnableFilter(string filterName);
    }
}