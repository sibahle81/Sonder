namespace RMA.Common.Database.Contracts.Repository
{
    public interface IVersionedEntity
    {
        int RowVersion { get; set; }
    }
}