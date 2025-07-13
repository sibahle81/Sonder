namespace RMA.Common.Database.Contracts.Repository
{
    public interface ISoftDeleteEntity
    {
        bool IsDeleted { get; set; }
    }
}